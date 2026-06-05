#!/bin/bash
# Database migration helper script

set -e

cd "$(dirname "$0")"

case "${1:-upgrade}" in
  upgrade)
    echo "Applying pending migrations..."
    alembic upgrade head
    echo "✅ Migrations applied successfully"
    ;;
  downgrade)
    if [ -z "$2" ]; then
      echo "Usage: ./migrate.sh downgrade <revision>"
      echo "Example: ./migrate.sh downgrade -1"
      exit 1
    fi
    echo "Downgrading to revision: $2"
    alembic downgrade "$2"
    echo "✅ Downgrade completed"
    ;;
  current)
    echo "Current migration revision:"
    alembic current
    ;;
  history)
    echo "Migration history:"
    alembic history --oneline
    ;;
  revision)
    if [ -z "$2" ]; then
      echo "Usage: ./migrate.sh revision <message>"
      example: ./migrate.sh revision \"Add user roles table\""
      exit 1
    fi
    echo "Creating new migration: $2"
    alembic revision --autogenerate -m "$2"
    ;;
  *)
    echo "Database migration helper"
    echo ""
    echo "Usage: ./migrate.sh [command] [args]"
    echo ""
    echo "Commands:"
    echo "  upgrade              Apply pending migrations (default)"
    echo "  downgrade <rev>      Downgrade to specific revision (use -1 for one back)"
    echo "  current              Show current migration revision"
    echo "  history              Show all migrations"
    echo "  revision <message>   Create new migration with autogenerate"
    echo ""
    echo "Examples:"
    echo "  ./migrate.sh upgrade"
    echo "  ./migrate.sh downgrade -1"
    echo "  ./migrate.sh revision \"Add user roles table\""
    exit 1
    ;;
esac
