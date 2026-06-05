# Quick Start Guide

## 1. Install Dependencies

```bash
make install
```

Or manually:

```bash
# Backend
cd backend && uv sync

# Frontend (if bun is not installed)
# curl -fsSL https://bun.sh/install | bash
cd frontend && bun install
```

## 2. Configure Environment

Copy environment files:

```bash
cd backend && cp .env.example .env
cd ../frontend && cp .env.example .env
```

## 3. Start Development Servers

### Option A: Run Both Services (Requires two terminals)

Terminal 1 - Backend:
```bash
make backend
# or
cd backend && uv run uvicorn src.main:app --reload
```

Terminal 2 - Frontend:
```bash
make frontend
# or (if bun is in PATH)
cd frontend && bun run dev
```

### Option B: Run Both at Once

```bash
make dev
```

## 4. Verify Everything Works

- Backend API: http://localhost:8000
- Frontend: http://localhost:5173
- API Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 5. Common Commands

### Backend
```bash
# Run development server
cd backend && uv run uvicorn src.main:app --reload

# Run tests
cd backend && uv run pytest

# Format code
cd backend && uv run black src tests

# Lint
cd backend && uv run ruff check src

# Type check
cd backend && uv run mypy src
```

### Frontend
```bash
# Run dev server
cd frontend && bun run dev

# Build for production
cd frontend && bun run build

# Lint code
cd frontend && bun run lint

# Type check
cd frontend && bun run type-check
```

## Project Structure

```
.
├── backend/                  # FastAPI backend
│   ├── src/
│   │   ├── api/             # API routes (v1)
│   │   ├── core/            # Config, DB, Security
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic
│   │   ├── repositories/    # Data access
│   │   └── main.py
│   ├── tests/
│   ├── pyproject.toml       # Dependencies (uv)
│   └── README.md
│
├── frontend/                 # React + Vite
│   ├── src/
│   │   ├── api/             # API client (axios)
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── utils/           # Utilities
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json         # Dependencies (bun)
│   └── README.md
│
├── docker-compose.yml        # Docker setup
├── Makefile                  # Development commands
└── README.md                 # Main documentation
```

## Next Steps

1. **Add Database Models**: Create SQLAlchemy models in `backend/src/models/`
2. **Create API Endpoints**: Add endpoints in `backend/src/api/v1/endpoints/`
3. **Build UI Components**: Create React components in `frontend/src/components/`
4. **Connect to Backend**: Use the API client in `frontend/src/api/client.ts`

## Troubleshooting

### Bun not found
```bash
# Install bun
curl -fsSL https://bun.sh/install | bash
export PATH="$HOME/Library/Application Support/reflex/bun/bin:$PATH"
```

### Port already in use
- Backend (8000): `lsof -i :8000` and kill the process
- Frontend (5173): `lsof -i :5173` and kill the process

### Database issues
```bash
# Remove old database
rm backend/ai_studio.db

# Restart backend to recreate it
```

## Documentation

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [Main README](./README.md)

## Getting Help

Refer to the individual README files in the `backend/` and `frontend/` directories for more detailed information.
