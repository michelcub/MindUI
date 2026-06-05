"""Authentication endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies import get_current_user
from src.core.config import get_settings
from src.core.database import get_db
from src.models import User
from src.schemas import UserCreate as UserCreateSchema
from src.schemas import UserLogin, UserPublic
from src.services import AuthService

settings = get_settings()

limiter = Limiter(key_func=get_remote_address)

router = APIRouter()

_auth_service = AuthService()

from src.repositories import UserRepository

_user_repo = UserRepository()


def _set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    """Set HttpOnly access and refresh token cookies on the response."""
    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
    )


@router.get("/registration-open")
async def registration_open(db: AsyncSession = Depends(get_db)) -> dict:
    """Check if registration is open (no users exist yet)."""
    count = await _user_repo.count(db)
    return {"open": count == 0}


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/hour")
async def register(
    request: Request,
    user_in: UserCreateSchema,
    db: AsyncSession = Depends(get_db),
) -> User:
    """Register the first user (admin bootstrap). Closed after first registration."""
    user = await _auth_service.register(db, user_in.email, user_in.name, user_in.password)
    return user


@router.post("/login", response_model=UserPublic)
@limiter.limit("10/15minutes")
async def login(
    request: Request,
    response: Response,
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db),
) -> User:
    """Authenticate with email/password. Sets HttpOnly access and refresh cookies."""
    user, access_token, refresh_token = await _auth_service.login(
        db, credentials.email, credentials.password
    )
    _set_auth_cookies(response, access_token, refresh_token)
    return user


@router.post("/refresh")
async def refresh(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Issue a new access_token from a valid refresh_token cookie."""
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No refresh token cookie",
        )

    new_access_token = await _auth_service.refresh_access_token(db, refresh_token)

    response.set_cookie(
        key="access_token",
        value=new_access_token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
    )
    return {"message": "Token refreshed"}


@router.post("/logout")
async def logout(response: Response) -> dict:
    """Clear access and refresh token cookies. No auth required."""
    response.delete_cookie(key="access_token", samesite=settings.COOKIE_SAMESITE)
    response.delete_cookie(key="refresh_token", samesite=settings.COOKIE_SAMESITE)
    return {"message": "Logged out"}


@router.get("/me", response_model=UserPublic)
async def me(
    current_user: User = Depends(get_current_user),
) -> User:
    """Return the current authenticated user's public profile."""
    return current_user
