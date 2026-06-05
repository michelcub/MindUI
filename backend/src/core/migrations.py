"""Database migration utilities."""

import subprocess
import sys
from pathlib import Path


async def run_migrations() -> None:
    """Run pending Alembic migrations."""
    try:
        # Get the path to the backend directory
        backend_dir = Path(__file__).parent.parent.parent

        # Run alembic upgrade head
        result = subprocess.run(
            [sys.executable, "-m", "alembic", "upgrade", "head"],
            cwd=backend_dir,
            capture_output=True,
            text=True,
            check=False,
        )

        if result.returncode == 0:
            print("✅ Database migrations applied successfully")
        else:
            print(f"⚠️  Migration warning: {result.stderr}")

    except Exception as e:
        print(f"❌ Failed to run migrations: {e}")
        raise
