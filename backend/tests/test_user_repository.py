"""Tests for UserRepository — RED phase first, then GREEN after implementation."""

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from src.core.database import Base
from src.repositories import UserRepository
from src.schemas import UserCreate

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture
async def db_session():
    """Create isolated in-memory test database session."""
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
def repository() -> UserRepository:
    return UserRepository()


@pytest.fixture
def user_create_data() -> UserCreate:
    return UserCreate(email="test@example.com", name="Test User", password="SecurePass1")


class TestUserRepositoryCreate:
    async def test_create_returns_user(self, db_session: AsyncSession, repository: UserRepository):
        user_in = UserCreate(email="user@example.com", name="User", password="Pass1word")
        user = await repository.create(db_session, user_in)
        assert user.id is not None
        assert user.email == "user@example.com"

    async def test_create_hashes_password(
        self, db_session: AsyncSession, repository: UserRepository
    ):
        user_in = UserCreate(email="user@example.com", name="User", password="Pass1word")
        user = await repository.create(db_session, user_in)
        assert user.hashed_password != "Pass1word"
        assert len(user.hashed_password) > 0

    async def test_create_sets_defaults(self, db_session: AsyncSession, repository: UserRepository):
        user_in = UserCreate(email="user@example.com", name="User", password="Pass1word")
        user = await repository.create(db_session, user_in)
        assert user.is_active is True
        assert user.is_admin is False

    async def test_create_sets_timestamps(
        self, db_session: AsyncSession, repository: UserRepository
    ):
        user_in = UserCreate(email="user@example.com", name="User", password="Pass1word")
        user = await repository.create(db_session, user_in)
        assert user.created_at is not None
        assert user.updated_at is not None


class TestUserRepositoryGetByEmail:
    async def test_get_by_email_found(self, db_session: AsyncSession, repository: UserRepository):
        user_in = UserCreate(email="find@example.com", name="Find User", password="Pass1word")
        await repository.create(db_session, user_in)
        found = await repository.get_by_email(db_session, "find@example.com")
        assert found is not None
        assert found.email == "find@example.com"

    async def test_get_by_email_not_found(
        self, db_session: AsyncSession, repository: UserRepository
    ):
        result = await repository.get_by_email(db_session, "missing@example.com")
        assert result is None

    async def test_get_by_email_case_sensitive(
        self, db_session: AsyncSession, repository: UserRepository
    ):
        user_in = UserCreate(email="lower@example.com", name="Lower User", password="Pass1word")
        await repository.create(db_session, user_in)
        result = await repository.get_by_email(db_session, "LOWER@EXAMPLE.COM")
        assert result is None


class TestUserRepositoryGetById:
    async def test_get_by_id_found(self, db_session: AsyncSession, repository: UserRepository):
        user_in = UserCreate(email="byid@example.com", name="ByID User", password="Pass1word")
        created = await repository.create(db_session, user_in)
        found = await repository.get_by_id(db_session, created.id)
        assert found is not None
        assert found.id == created.id

    async def test_get_by_id_not_found(self, db_session: AsyncSession, repository: UserRepository):
        result = await repository.get_by_id(db_session, 99999)
        assert result is None


class TestUserRepositoryCount:
    async def test_count_empty_table(self, db_session: AsyncSession, repository: UserRepository):
        count = await repository.count(db_session)
        assert count == 0

    async def test_count_after_create(self, db_session: AsyncSession, repository: UserRepository):
        user_in = UserCreate(email="count@example.com", name="Count User", password="Pass1word")
        await repository.create(db_session, user_in)
        count = await repository.count(db_session)
        assert count == 1

    async def test_count_multiple_users(self, db_session: AsyncSession, repository: UserRepository):
        for i in range(3):
            user_in = UserCreate(email=f"user{i}@example.com", name=f"User {i}", password="Pass1word")
            await repository.create(db_session, user_in)
        count = await repository.count(db_session)
        assert count == 3
