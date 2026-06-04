# AI Studio

OpenWebUI-like application with modern stack using FastAPI (backend) and React (frontend).

## Project Structure

```
ai-studio/
├── backend/                 # FastAPI backend
│   ├── src/
│   │   ├── api/            # API routes
│   │   ├── core/           # Configuration
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   └── main.py
│   ├── tests/
│   ├── pyproject.toml      # Python dependencies (uv)
│   └── README.md
├── frontend/                # React + Vite frontend
│   ├── src/
│   │   ├── api/            # API client
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   └── App.tsx
│   ├── package.json        # Node dependencies (bun)
│   └── README.md
├── docker-compose.yml
└── README.md
```

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+ or Bun
- uv (Python package manager)
- bun (JavaScript package manager)

### Backend Setup

```bash
cd backend
uv sync
uv run uvicorn src.main:app --reload
```

The backend will be available at `http://localhost:8000`
- API: `http://localhost:8000/api/v1`
- Docs: `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend
bun install
bun run dev
```

The frontend will be available at `http://localhost:5173`

## Development

### Backend

```bash
cd backend

# Run development server
uv run uvicorn src.main:app --reload

# Run tests
uv run pytest

# Code quality
uv run black src
uv run ruff check src
uv run mypy src
```

### Frontend

```bash
cd frontend

# Run development server
bun run dev

# Build for production
bun run build

# Run preview
bun run preview

# Linting
bun run lint

# Type checking
bun run type-check
```

## Docker Compose

To run both services with Docker:

```bash
docker-compose up
```

Backend: `http://localhost:8000`
Frontend: `http://localhost:5173`

## API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation.

## Environment Configuration

### Backend (.env)

```env
DATABASE_URL=sqlite+aiosqlite:///./ai_studio.db
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000/api/v1
```

## Features

### Backend
- FastAPI with async/await
- SQLAlchemy ORM with async support
- Pydantic models for validation
- JWT authentication
- CORS support
- Testing with pytest

### Frontend
- React 18 with TypeScript
- Vite for fast development
- Axios for HTTP requests
- ESLint for code quality
- Vite proxy for API calls

## Tech Stack

### Backend
- **Framework**: FastAPI 0.115.4
- **Database**: SQLAlchemy 2.0.36 with aiosqlite
- **Auth**: python-jose, passlib
- **Server**: Uvicorn 0.32.1
- **Package Manager**: uv

### Frontend
- **Framework**: React 18.3.1
- **Build Tool**: Vite 5.4.21
- **Language**: TypeScript 5.9.3
- **HTTP Client**: Axios 1.17.0
- **Package Manager**: Bun

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

MIT
# MindUI
