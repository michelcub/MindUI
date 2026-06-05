.PHONY: help install dev backend frontend test lint clean

help:
	@echo "AI Studio - Development Commands"
	@echo "=================================="
	@echo "make install    - Install all dependencies"
	@echo "make dev        - Start both backend and frontend"
	@echo "make backend    - Start backend only"
	@echo "make frontend   - Start frontend only"
	@echo "make test       - Run backend tests"
	@echo "make lint       - Run linting on backend"
	@echo "make clean      - Clean up build artifacts"

install:
	@echo "Installing backend dependencies..."
	cd backend && uv sync
	@echo "Installing frontend dependencies..."
	cd frontend && bun install

dev:
	@echo "Starting both services..."
	@echo "Backend will run on http://localhost:8000"
	@echo "Frontend will run on http://localhost:5173"
	@make -j 2 backend frontend

backend:
	cd backend && uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

frontend:
	export PATH="$$HOME/Library/Application Support/reflex/bun/bin:$$PATH" && cd frontend && bun run dev

test:
	cd backend && uv run pytest

lint:
	cd backend && uv run black src tests && uv run ruff check src

type-check:
	cd backend && uv run mypy src

clean:
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	cd frontend && rm -rf dist node_modules .next
	cd backend && rm -rf dist build *.egg-info
