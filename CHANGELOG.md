# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New features in development

### Changed
- Ongoing improvements

### Deprecated
- Features to be removed soon

### Removed
- Discontinued features

### Fixed
- Bug fixes in development

### Security
- Security improvements in development

---

## [0.1.0] - 2026-06-06

### Added

#### Authentication System
- JWT-based authentication with access tokens (15 min) and refresh tokens (7 days)
- HttpOnly, Secure, and SameSite=Lax cookies for XSS/CSRF protection
- Custom FastAPI dependency for cookie-based auth (replaced OAuth2PasswordBearer)
- First-user-admin bootstrap: first registered user becomes admin automatically
- Later user registration deferred to admin-controlled UI
- Rate limiting: 5/hour on register, 10/15min on login

#### Backend
- FastAPI application structure with async/await throughout
- SQLAlchemy ORM with async sessions
- Pydantic validation for all inputs/outputs
- User model with fields: id, email, name, hashed_password, is_admin, is_staff, is_active, created_at, updated_at
- AuthService with register, login, refresh_access_token methods
- UserRepository for data access layer
- Auth endpoints: POST /register, /login, /refresh, /logout, GET /me
- Automatic user deactivation prevents token reuse
- 78 integration and unit tests covering all auth scenarios

#### Frontend
- React 18 with TypeScript and Vite
- RegisterPage with email, name, and password fields
- LoginPage with credential validation
- AuthContext for global auth state management
- Custom useAuth hook for accessing auth methods
- ProtectedRoute component for guarding routes
- Automatic 401 refresh interceptor in axios
- Zod validation for all API responses
- Tailwind CSS styling with full responsiveness
- i18n support with English and Spanish translations

#### Database
- Alembic for schema versioning and migrations
- Async SQLAlchemy configuration for Alembic
- Initial migration: users table with all fields
- Automatic migrations on application startup
- migrate.sh helper script for manual migration control

#### Development
- Docker Compose setup for local development
- Makefile with `make dev` for starting both services
- Comprehensive test suites: 78 backend + 32 frontend tests
- Type checking with mypy and TypeScript
- Linting with ruff and ESLint
- Code formatting with black and Prettier

### Changed
- Improved .gitignore patterns for Python cache and node_modules

### Security
- Password strength validation: minimum 8 characters, 1 uppercase, 1 digit
- Inactive user security gate in get_current_user dependency
- Rate limiting on sensitive endpoints
- CORS middleware with credential support
- Environment-based cookie security settings (secure=True in prod)

---

## Deployment Notes

### Environment Variables
```bash
# Backend
DATABASE_URL=sqlite+aiosqlite:///./ai_studio.db  # or PostgreSQL in prod
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
COOKIE_SECURE=false  # true in production
ALLOWED_ORIGINS=["http://localhost:5173"]

# Frontend
VITE_API_URL=http://localhost:8000/api/v1
```

### Database
- Development: SQLite (ai_studio.db, created automatically by migrations)
- Production: Recommended PostgreSQL or MySQL
- Migrations run automatically on app startup

### First Run
1. Start app: `make dev`
2. Navigate to http://localhost:5173
3. Register first user (becomes admin)
4. Login and verify session persistence
5. Logout to confirm token clearing

---

## Contributors

- Michel López Pérez

## Support

For issues, questions, or feature requests, please create a GitHub issue.
