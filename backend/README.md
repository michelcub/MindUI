# AI Studio Backend

FastAPI-based backend for AI Studio (OpenWebUI-like application).

## Setup

### Requirements

- Python 3.11+
- uv (Python package manager)

### Installation

1. Install dependencies using uv:

```bash
uv sync
```

2. Create `.env` file from template:

```bash
cp .env.example .env
```

3. Update `.env` with your configuration.

## Running

### Development

```bash
uv run src/main.py
```

Or with uvicorn directly:

```bash
uv run uvicorn src.main:app --reload
```

The API will be available at `http://localhost:8000`

### Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Testing

```bash
uv run pytest
```

With coverage:

```bash
uv run pytest --cov=src
```

## Project Structure

```
src/
├── api/              # API routes and endpoints
│   ├── v1/
│   │   ├── endpoints/
│   │   └── router.py
│   └── dependencies.py
├── core/             # Configuration and core utilities
│   ├── config.py
│   ├── database.py
│   └── security.py
├── models/           # SQLAlchemy database models
├── schemas/          # Pydantic request/response schemas
├── services/         # Business logic
├── repositories/     # Data access layer
└── main.py           # FastAPI app entry point
```

## Development

### Code Style

- Format: `uv run black .`
- Lint: `uv run ruff check .`
- Type check: `uv run mypy src`

### Add New Dependencies

```bash
uv pip install package-name
```

## License

MIT
