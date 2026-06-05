"""Pydantic schemas for request/response validation."""

import re
from datetime import datetime

from pydantic import BaseModel, EmailStr, field_validator


class UserCreate(BaseModel):
    """Schema for user registration."""

    email: EmailStr
    name: str
    password: str

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", value):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"\d", value):
            raise ValueError("Password must contain at least one digit")
        return value


class UserLogin(BaseModel):
    """Schema for user login."""

    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Schema for token response."""

    access_token: str
    token_type: str = "bearer"


class UserPublic(BaseModel):
    """Public user representation."""

    id: int
    email: str
    name: str
    is_admin: bool
    is_staff: bool
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
