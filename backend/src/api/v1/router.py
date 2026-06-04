"""API v1 router configuration."""

from fastapi import APIRouter

from src.api.v1.endpoints.auth import router as auth_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["auth"])


@api_router.get("/")
async def root() -> dict:
    """Root API endpoint."""
    return {"message": "AI Studio API v1"}
