"""Tests for AuthService — RED phase first (mock UserRepository), then GREEN."""

from datetime import timedelta
from unittest.mock import AsyncMock

import pytest
from fastapi import HTTPException

from src.core.security import create_refresh_token, get_password_hash
from src.models import User
from src.schemas import UserCreate
from src.services import AuthService


def make_user(
    user_id: int = 1,
    email: str = "test@example.com",
    password: str = "Pass1word",
    is_active: bool = True,
    is_admin: bool = False,
) -> User:
    """Build a User ORM instance with a real hashed password."""
    user = User()
    user.id = user_id
    user.email = email
    user.hashed_password = get_password_hash(password)
    user.is_active = is_active
    user.is_admin = is_admin
    return user


@pytest.fixture
def mock_repo() -> AsyncMock:
    repo = AsyncMock()
    return repo


@pytest.fixture
def auth_service(mock_repo: AsyncMock) -> AuthService:
    return AuthService(repository=mock_repo)


@pytest.fixture
def mock_db() -> AsyncMock:
    return AsyncMock()


class TestValidatePasswordStrength:
    async def test_valid_password_passes(self, auth_service: AuthService):
        await auth_service.validate_password_strength("SecurePass1")

    async def test_too_short_raises(self, auth_service: AuthService):
        with pytest.raises(ValueError, match="8 characters"):
            await auth_service.validate_password_strength("Ab1")

    async def test_no_uppercase_raises(self, auth_service: AuthService):
        with pytest.raises(ValueError, match="uppercase"):
            await auth_service.validate_password_strength("password1")

    async def test_no_digit_raises(self, auth_service: AuthService):
        with pytest.raises(ValueError, match="digit"):
            await auth_service.validate_password_strength("Password")

    async def test_exactly_8_valid_passes(self, auth_service: AuthService):
        await auth_service.validate_password_strength("Password1")


class TestAuthServiceRegister:
    async def test_register_first_user_is_admin(
        self, auth_service: AuthService, mock_repo: AsyncMock, mock_db: AsyncMock
    ):
        mock_repo.count.return_value = 0
        new_user = make_user(is_admin=True)
        mock_repo.create.return_value = new_user

        result = await auth_service.register(mock_db, "new@example.com", "Pass1word")

        assert result.is_admin is True
        mock_repo.count.assert_awaited_once_with(mock_db)

    async def test_register_second_user_raises_403(
        self, auth_service: AuthService, mock_repo: AsyncMock, mock_db: AsyncMock
    ):
        mock_repo.count.return_value = 1

        with pytest.raises(HTTPException) as exc_info:
            await auth_service.register(mock_db, "second@example.com", "Pass1word")

        assert exc_info.value.status_code == 403
        mock_repo.create.assert_not_awaited()

    async def test_register_passes_correct_email(
        self, auth_service: AuthService, mock_repo: AsyncMock, mock_db: AsyncMock
    ):
        mock_repo.count.return_value = 0
        new_user = make_user(email="correct@example.com")
        mock_repo.create.return_value = new_user

        await auth_service.register(mock_db, "correct@example.com", "Pass1word")

        call_args = mock_repo.create.call_args
        user_create: UserCreate = call_args[0][1]
        assert user_create.email == "correct@example.com"


class TestAuthServiceLogin:
    async def test_login_success_returns_user_and_tokens(
        self, auth_service: AuthService, mock_repo: AsyncMock, mock_db: AsyncMock
    ):
        user = make_user(password="Pass1word")
        mock_repo.get_by_email.return_value = user

        result_user, access_token, refresh_token = await auth_service.login(
            mock_db, "test@example.com", "Pass1word"
        )

        assert result_user.id == user.id
        assert isinstance(access_token, str)
        assert isinstance(refresh_token, str)
        assert len(access_token) > 0
        assert len(refresh_token) > 0

    async def test_login_wrong_password_raises_401(
        self, auth_service: AuthService, mock_repo: AsyncMock, mock_db: AsyncMock
    ):
        user = make_user(password="Pass1word")
        mock_repo.get_by_email.return_value = user

        with pytest.raises(HTTPException) as exc_info:
            await auth_service.login(mock_db, "test@example.com", "WrongPass1")

        assert exc_info.value.status_code == 401

    async def test_login_nonexistent_user_raises_401(
        self, auth_service: AuthService, mock_repo: AsyncMock, mock_db: AsyncMock
    ):
        mock_repo.get_by_email.return_value = None

        with pytest.raises(HTTPException) as exc_info:
            await auth_service.login(mock_db, "ghost@example.com", "Pass1word")

        assert exc_info.value.status_code == 401

    async def test_login_inactive_user_raises_401(
        self, auth_service: AuthService, mock_repo: AsyncMock, mock_db: AsyncMock
    ):
        user = make_user(password="Pass1word", is_active=False)
        mock_repo.get_by_email.return_value = user

        with pytest.raises(HTTPException) as exc_info:
            await auth_service.login(mock_db, "test@example.com", "Pass1word")

        assert exc_info.value.status_code == 401

    async def test_login_does_not_reveal_email_existence(
        self, auth_service: AuthService, mock_repo: AsyncMock, mock_db: AsyncMock
    ):
        mock_repo.get_by_email.return_value = None

        with pytest.raises(HTTPException) as exc_info:
            await auth_service.login(mock_db, "ghost@example.com", "Pass1word")

        assert "email" not in exc_info.value.detail.lower()


class TestAuthServiceRefreshAccessToken:
    async def test_refresh_valid_token_returns_new_access_token(
        self, auth_service: AuthService, mock_repo: AsyncMock, mock_db: AsyncMock
    ):
        user = make_user(user_id=5)
        mock_repo.get_by_id.return_value = user
        refresh_token = create_refresh_token({"sub": "5"})

        new_access_token = await auth_service.refresh_access_token(mock_db, refresh_token)

        assert isinstance(new_access_token, str)
        assert len(new_access_token) > 0

    async def test_refresh_expired_token_raises_401(
        self, auth_service: AuthService, mock_repo: AsyncMock, mock_db: AsyncMock
    ):
        expired_token = create_refresh_token({"sub": "1"}, expires_delta=timedelta(seconds=-1))

        with pytest.raises(HTTPException) as exc_info:
            await auth_service.refresh_access_token(mock_db, expired_token)

        assert exc_info.value.status_code == 401

    async def test_refresh_invalid_signature_raises_401(
        self, auth_service: AuthService, mock_repo: AsyncMock, mock_db: AsyncMock
    ):
        with pytest.raises(HTTPException) as exc_info:
            await auth_service.refresh_access_token(mock_db, "invalid.token.here")

        assert exc_info.value.status_code == 401

    async def test_refresh_access_token_not_accepted(
        self, auth_service: AuthService, mock_repo: AsyncMock, mock_db: AsyncMock
    ):
        """Access tokens (no type=refresh claim) should be rejected."""
        from src.core.security import create_access_token

        access_token = create_access_token({"sub": "1"})

        with pytest.raises(HTTPException) as exc_info:
            await auth_service.refresh_access_token(mock_db, access_token)

        assert exc_info.value.status_code == 401

    async def test_refresh_user_not_found_raises_401(
        self, auth_service: AuthService, mock_repo: AsyncMock, mock_db: AsyncMock
    ):
        mock_repo.get_by_id.return_value = None
        refresh_token = create_refresh_token({"sub": "999"})

        with pytest.raises(HTTPException) as exc_info:
            await auth_service.refresh_access_token(mock_db, refresh_token)

        assert exc_info.value.status_code == 401
