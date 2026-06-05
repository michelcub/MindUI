"""Business logic services."""

import re
from datetime import timedelta
from typing import Optional

from fastapi import HTTPException, status
from jose import JWTError  # type: ignore[import-untyped]
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import get_settings
from src.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_password,
)
from src.models import User
from src.repositories import UserRepository
from src.schemas import UserCreate

settings = get_settings()

_INVALID_CREDENTIALS = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Invalid credentials",
)

_INVALID_TOKEN = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate token",
)


class AuthService:
    """Authentication business logic."""

    def __init__(self, repository: Optional[UserRepository] = None) -> None:
        self.repository = repository or UserRepository()

    async def validate_password_strength(self, password: str) -> None:
        """Validate password meets strength requirements. Raises ValueError on failure."""
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", password):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"\d", password):
            raise ValueError("Password must contain at least one digit")

    async def register(self, db: AsyncSession, email: str, password: str) -> User:
        """Register a new user. Only allowed when no users exist (first-user admin)."""
        count = await self.repository.count(db)
        if count > 0:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Registration is closed. Only one admin user is allowed.",
            )

        # First user becomes admin — count was 0 before this registration
        is_first_user = count == 0

        user_in = UserCreate(email=email, password=password)
        user = await self.repository.create(db, user_in, is_admin=is_first_user)

        return user

    async def login(self, db: AsyncSession, email: str, password: str) -> tuple[User, str, str]:
        """Authenticate user and return (user, access_token, refresh_token)."""
        user = await self.repository.get_by_email(db, email)

        if user is None or not verify_password(password, user.hashed_password):
            raise _INVALID_CREDENTIALS

        if not user.is_active:
            raise _INVALID_CREDENTIALS

        access_token = create_access_token(
            {"sub": str(user.id)},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        )
        refresh_token = create_refresh_token(
            {"sub": str(user.id)},
            expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        )
        return user, access_token, refresh_token

    async def refresh_access_token(self, db: AsyncSession, refresh_token: str) -> str:
        """Issue a new access token from a valid refresh token."""
        try:
            payload = decode_token(refresh_token)
        except JWTError:
            raise _INVALID_TOKEN

        if payload.get("type") != "refresh":
            raise _INVALID_TOKEN

        user_id_str: Optional[str] = payload.get("sub")
        if user_id_str is None:
            raise _INVALID_TOKEN

        try:
            user_id = int(user_id_str)
        except (ValueError, TypeError):
            raise _INVALID_TOKEN

        user = await self.repository.get_by_id(db, user_id)
        if user is None:
            raise _INVALID_TOKEN

        return create_access_token(
            {"sub": str(user.id)},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        )
