"""Pytest configuration and fixtures."""

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from src.core.database import Base, get_db
from src.core.security import create_access_token, get_password_hash
from src.main import app
from src.models import User

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture
async def db_session():
    """Create test database session with isolated in-memory DB."""
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    AsyncSessionLocal = sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async with AsyncSessionLocal() as session:
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest.fixture
async def client(db_session: AsyncSession):
    """Create test client with DB dependency override."""

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
async def test_user(db_session: AsyncSession) -> User:
    """Create an active non-admin test user."""
    user = User(
        email="user@test.com",
        hashed_password=get_password_hash("Pass1word"),
        is_active=True,
        is_admin=False,
    )
    db_session.add(user)
    await db_session.flush()
    await db_session.refresh(user)
    return user


@pytest.fixture
async def test_admin(db_session: AsyncSession) -> User:
    """Create an active admin test user."""
    user = User(
        email="admin@test.com",
        hashed_password=get_password_hash("Admin1pass"),
        is_active=True,
        is_admin=True,
    )
    db_session.add(user)
    await db_session.flush()
    await db_session.refresh(user)
    return user


@pytest.fixture
async def auth_client(db_session: AsyncSession, test_user: User):
    """Create test client pre-authenticated as test_user via access_token cookie."""

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    access_token = create_access_token({"sub": str(test_user.id)})

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
        cookies={"access_token": access_token},
    ) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture(autouse=False)
def limiter_bypass():
    """Disable slowapi rate limiting for tests that don't test rate limits."""
    from src.api.v1.endpoints.auth import limiter

    limiter._enabled = False
    yield
    limiter._enabled = True
