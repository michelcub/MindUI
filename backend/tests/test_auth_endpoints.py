"""Integration tests for auth endpoints — RED phase first, then GREEN."""

from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from src.models import User


class TestRegisterEndpoint:
    """Tests for POST /api/v1/auth/register."""

    async def test_first_registration_returns_201(self, client: AsyncClient, limiter_bypass: None):
        response = await client.post(
            "/api/v1/auth/register",
            json={"email": "first@example.com", "password": "SecurePass1"},
        )
        assert response.status_code == 201

    async def test_first_registration_creates_admin(
        self, client: AsyncClient, limiter_bypass: None
    ):
        response = await client.post(
            "/api/v1/auth/register",
            json={"email": "first@example.com", "password": "SecurePass1"},
        )
        data = response.json()
        assert data["is_admin"] is True
        assert data["is_active"] is True

    async def test_second_registration_returns_403(
        self, client: AsyncClient, test_user: User, limiter_bypass: None
    ):
        response = await client.post(
            "/api/v1/auth/register",
            json={"email": "second@example.com", "password": "SecurePass1"},
        )
        assert response.status_code == 403

    async def test_invalid_email_returns_422(self, client: AsyncClient, limiter_bypass: None):
        response = await client.post(
            "/api/v1/auth/register",
            json={"email": "notanemail", "password": "SecurePass1"},
        )
        assert response.status_code == 422

    async def test_weak_password_too_short_returns_422(
        self, client: AsyncClient, limiter_bypass: None
    ):
        response = await client.post(
            "/api/v1/auth/register",
            json={"email": "valid@example.com", "password": "Ab1"},
        )
        assert response.status_code == 422

    async def test_weak_password_no_uppercase_returns_422(
        self, client: AsyncClient, limiter_bypass: None
    ):
        response = await client.post(
            "/api/v1/auth/register",
            json={"email": "valid@example.com", "password": "password1"},
        )
        assert response.status_code == 422

    async def test_weak_password_no_digit_returns_422(
        self, client: AsyncClient, limiter_bypass: None
    ):
        response = await client.post(
            "/api/v1/auth/register",
            json={"email": "valid@example.com", "password": "Password"},
        )
        assert response.status_code == 422

    async def test_registration_response_has_expected_fields(
        self, client: AsyncClient, limiter_bypass: None
    ):
        response = await client.post(
            "/api/v1/auth/register",
            json={"email": "fields@example.com", "password": "SecurePass1"},
        )
        data = response.json()
        assert "id" in data
        assert "email" in data
        assert "is_admin" in data
        assert "is_active" in data
        assert "created_at" in data
        assert "password" not in data
        assert "hashed_password" not in data


class TestLoginEndpoint:
    """Tests for POST /api/v1/auth/login."""

    async def test_correct_credentials_return_200(
        self,
        client: AsyncClient,
        test_user: User,
        limiter_bypass: None,
    ):
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "user@test.com", "password": "Pass1word"},
        )
        assert response.status_code == 200

    async def test_login_sets_access_token_cookie(
        self,
        client: AsyncClient,
        test_user: User,
        limiter_bypass: None,
    ):
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "user@test.com", "password": "Pass1word"},
        )
        assert "access_token" in response.cookies

    async def test_login_sets_refresh_token_cookie(
        self,
        client: AsyncClient,
        test_user: User,
        limiter_bypass: None,
    ):
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "user@test.com", "password": "Pass1word"},
        )
        assert "refresh_token" in response.cookies

    async def test_login_cookies_are_httponly(
        self,
        client: AsyncClient,
        test_user: User,
        limiter_bypass: None,
    ):
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "user@test.com", "password": "Pass1word"},
        )
        set_cookie_headers = response.headers.get_list("set-cookie")
        access_cookies = [h for h in set_cookie_headers if "access_token=" in h]
        refresh_cookies = [h for h in set_cookie_headers if "refresh_token=" in h]
        assert len(access_cookies) > 0
        assert len(refresh_cookies) > 0
        assert all("httponly" in c.lower() for c in access_cookies)
        assert all("httponly" in c.lower() for c in refresh_cookies)

    async def test_login_cookies_have_samesite_lax(
        self,
        client: AsyncClient,
        test_user: User,
        limiter_bypass: None,
    ):
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "user@test.com", "password": "Pass1word"},
        )
        set_cookie_headers = response.headers.get_list("set-cookie")
        for header in set_cookie_headers:
            if "access_token=" in header or "refresh_token=" in header:
                assert "samesite=lax" in header.lower()

    async def test_wrong_password_returns_401(
        self,
        client: AsyncClient,
        test_user: User,
        limiter_bypass: None,
    ):
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "user@test.com", "password": "WrongPass1"},
        )
        assert response.status_code == 401

    async def test_nonexistent_email_returns_401(
        self,
        client: AsyncClient,
        limiter_bypass: None,
    ):
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "ghost@test.com", "password": "Pass1word"},
        )
        assert response.status_code == 401

    async def test_inactive_user_returns_401(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        limiter_bypass: None,
    ):
        from src.core.security import get_password_hash
        from src.models import User as UserModel

        inactive = UserModel(
            email="inactive@test.com",
            hashed_password=get_password_hash("Pass1word"),
            is_active=False,
        )
        db_session.add(inactive)
        await db_session.flush()

        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "inactive@test.com", "password": "Pass1word"},
        )
        assert response.status_code == 401


class TestRefreshEndpoint:
    """Tests for POST /api/v1/auth/refresh."""

    async def test_valid_refresh_token_returns_200(
        self, client: AsyncClient, test_user: User, limiter_bypass: None
    ):
        from src.core.security import create_refresh_token

        refresh_token = create_refresh_token({"sub": str(test_user.id)})
        client.cookies.set("refresh_token", refresh_token)
        response = await client.post("/api/v1/auth/refresh")
        assert response.status_code == 200

    async def test_valid_refresh_sets_new_access_cookie(
        self, client: AsyncClient, test_user: User, limiter_bypass: None
    ):
        from src.core.security import create_refresh_token

        refresh_token = create_refresh_token({"sub": str(test_user.id)})
        client.cookies.set("refresh_token", refresh_token)
        response = await client.post("/api/v1/auth/refresh")
        assert "access_token" in response.cookies

    async def test_no_refresh_cookie_returns_401(self, client: AsyncClient, limiter_bypass: None):
        response = await client.post("/api/v1/auth/refresh")
        assert response.status_code == 401

    async def test_expired_refresh_token_returns_401(
        self, client: AsyncClient, test_user: User, limiter_bypass: None
    ):
        from datetime import timedelta

        from src.core.security import create_refresh_token

        expired = create_refresh_token(
            {"sub": str(test_user.id)}, expires_delta=timedelta(seconds=-1)
        )
        client.cookies.set("refresh_token", expired)
        response = await client.post("/api/v1/auth/refresh")
        assert response.status_code == 401

    async def test_invalid_signature_returns_401(self, client: AsyncClient, limiter_bypass: None):
        client.cookies.set("refresh_token", "invalid.token.value")
        response = await client.post("/api/v1/auth/refresh")
        assert response.status_code == 401


class TestLogoutEndpoint:
    """Tests for POST /api/v1/auth/logout."""

    async def test_logout_returns_200(self, client: AsyncClient, limiter_bypass: None):
        response = await client.post("/api/v1/auth/logout")
        assert response.status_code == 200

    async def test_logout_clears_access_token_cookie(
        self, auth_client: AsyncClient, limiter_bypass: None
    ):
        response = await auth_client.post("/api/v1/auth/logout")
        set_cookie_headers = response.headers.get_list("set-cookie")
        access_cookies = [h for h in set_cookie_headers if "access_token=" in h]
        assert len(access_cookies) > 0
        assert any("max-age=0" in c.lower() or "expires=" in c.lower() for c in access_cookies)

    async def test_logout_clears_refresh_token_cookie(
        self, auth_client: AsyncClient, limiter_bypass: None
    ):
        response = await auth_client.post("/api/v1/auth/logout")
        set_cookie_headers = response.headers.get_list("set-cookie")
        refresh_cookies = [h for h in set_cookie_headers if "refresh_token=" in h]
        assert len(refresh_cookies) > 0
        assert any("max-age=0" in c.lower() or "expires=" in c.lower() for c in refresh_cookies)

    async def test_logout_without_auth_still_returns_200(
        self, client: AsyncClient, limiter_bypass: None
    ):
        response = await client.post("/api/v1/auth/logout")
        assert response.status_code == 200


class TestMeEndpoint:
    """Tests for GET /api/v1/auth/me."""

    async def test_valid_access_token_returns_200(
        self, auth_client: AsyncClient, test_user: User, limiter_bypass: None
    ):
        response = await auth_client.get("/api/v1/auth/me")
        assert response.status_code == 200

    async def test_me_returns_user_fields(
        self, auth_client: AsyncClient, test_user: User, limiter_bypass: None
    ):
        response = await auth_client.get("/api/v1/auth/me")
        data = response.json()
        assert data["id"] == test_user.id
        assert data["email"] == test_user.email
        assert "is_admin" in data
        assert "is_active" in data
        assert "created_at" in data

    async def test_no_access_token_returns_401(self, client: AsyncClient, limiter_bypass: None):
        response = await client.get("/api/v1/auth/me")
        assert response.status_code == 401

    async def test_expired_access_token_returns_401(
        self, client: AsyncClient, test_user: User, limiter_bypass: None
    ):
        from datetime import timedelta

        from src.core.security import create_access_token

        expired_token = create_access_token(
            {"sub": str(test_user.id)}, expires_delta=timedelta(seconds=-1)
        )
        client.cookies.set("access_token", expired_token)
        response = await client.get("/api/v1/auth/me")
        assert response.status_code == 401
