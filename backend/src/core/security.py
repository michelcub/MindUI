"""Security utilities for authentication."""

from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import jwt  # type: ignore[import-untyped]
from passlib.context import CryptContext  # type: ignore[import-untyped]

from src.core.config import get_settings

settings = get_settings()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode.update({"exp": expire})
    encoded_jwt: str = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )
    return encoded_jwt


def create_refresh_token(
    data: dict,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create JWT refresh token with type claim."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt: str = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )
    return encoded_jwt


def decode_token(token: str) -> dict:  # type: ignore[type-arg]
    """Decode and verify JWT token. Raises JWTError on bad signature or expiry."""
    payload: dict = jwt.decode(  # type: ignore[type-arg]
        token,
        settings.SECRET_KEY,
        algorithms=[settings.ALGORITHM],
    )
    return payload


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash."""
    result: bool = pwd_context.verify(plain_password, hashed_password)
    return result


def get_password_hash(password: str) -> str:
    """Hash password using bcrypt."""
    hashed: str = pwd_context.hash(password)
    return hashed
