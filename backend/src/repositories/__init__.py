"""Data access repositories."""

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.security import get_password_hash
from src.models import User
from src.schemas import UserCreate


class UserRepository:
    """Repository for User data access operations."""

    async def create(self, db: AsyncSession, user_in: UserCreate, is_admin: bool = False) -> User:
        """Create a new user with hashed password."""
        hashed = get_password_hash(user_in.password)
        user = User(
            email=user_in.email,
            hashed_password=hashed,
            is_admin=is_admin,
        )
        db.add(user)
        await db.flush()
        await db.refresh(user)
        return user

    async def get_by_email(self, db: AsyncSession, email: str) -> User | None:
        """Retrieve a user by email address."""
        result = await db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_by_id(self, db: AsyncSession, user_id: int) -> User | None:
        """Retrieve a user by primary key."""
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def count(self, db: AsyncSession) -> int:
        """Return total number of users."""
        result = await db.execute(select(func.count()).select_from(User))
        return result.scalar_one()
