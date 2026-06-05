# MindUI- Claude Code Configuration

OpenWebUI-like app with FastAPI backend and React frontend.

## Stack

**Backend:** FastAPI, SQLAlchemy (async), Pydantic validation, JWT auth, pytest  
**Frontend:** React 18, TypeScript, Vite, TanStack Query, Zod validation, Tailwind CSS, Vitest, i18next  
**Database:** SQLite (dev) / PostgreSQL (prod)  
**Package Managers:** uv (Python), bun (JavaScript)

## Code Conventions

### Backend (Python)

**Style:** PEP 8, line length 100, type hints everywhere, async/await, no unnecessary comments  
**Naming:** `snake_case` functions/vars, `PascalCase` classes, `UPPER_CASE` constants  
**Structure:**
- Models: `src/models/` (SQLAlchemy async)
- Schemas: `src/schemas/` (Pydantic validation)
- Services: `src/services/` (business logic, always async)
- Repositories: `src/repositories/` (data access, always async)
- Endpoints: `src/api/v1/endpoints/` (FastAPI routes)

**Validation:** Use Pydantic for all input/output validation  
**Database:** SQLAlchemy ORM only, no raw SQL, always async sessions  
**Testing:** pytest + pytest-asyncio, test both paths and errors

### Frontend (TypeScript/React)

**Style:** Follow ESLint, line length 100, functional components only, no `any` types  
**Naming:** `PascalCase` components, `camelCase` functions/vars, `.tsx` for components  
**Structure:**
- Components: `src/components/` (small, focused, typed props)
- Pages: `src/pages/` (page-level components)
- Hooks: `src/hooks/` (custom hooks, prefix with `use`)
- API: `src/api/` (queries and mutations with TanStack Query)
- Utils: `src/utils/` (helpers)

**Styling:** Tailwind CSS only, no inline styles, use utility classes  
**Responsive Design:** All components must be fully responsive using Tailwind breakpoints (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`); components must adapt gracefully to mobile, tablet, and desktop screens  
**Validation:** Use Zod for runtime type checking, validate API responses  
**Data Fetching:** TanStack Query for all async operations (useQuery, useMutation)  
**State:** useState for local state, TanStack Query for server state, Context for global UI state  
**Async:** All API calls async, use await in event handlers and effects  
**Testing:** Vitest for unit and component tests, test hooks and utilities, mock API responses  
**i18n:** i18next for internationalization, use `useTranslation()` hook, store translations in `public/locales/`  
**Design Guide:** Follow [DESIGN.md](./DESIGN.md) for all component styling and visual design decisions

## Commands

```bash
# Backend
cd backend && uv sync              # Install deps
cd backend && uv run uvicorn src.main:app --reload  # Dev server
cd backend && uv run pytest        # Run tests
cd backend && uv run black src && uv run ruff check src  # Format & lint

# Frontend
cd frontend && bun install         # Install deps
cd frontend && bun run dev         # Dev server
cd frontend && bun run build       # Build
cd frontend && bun run test        # Run tests (Vitest)
cd frontend && bun run test:watch  # Watch tests
cd frontend && bun run lint && bun run type-check  # Quality

# i18n
cd frontend && bun run i18n:extract  # Extract translatable strings

# Both
make dev     # Start both services
make test    # Run tests
make lint    # Format and lint
```

## Versioning & Changelog

**Semantic Versioning:** Follow [semver.org](https://semver.org/) — `MAJOR.MINOR.PATCH` (e.g., `1.2.3`)
- `MAJOR`: Breaking changes
- `MINOR`: New features (backward compatible)
- `PATCH`: Bug fixes

**Git Tags:** Always tag releases after merging to `main`:
```bash
git tag -a v1.2.3 -m "Release version 1.2.3"
git push origin v1.2.3
```

**CHANGELOG.md:** Maintain a `CHANGELOG.md` file at project root. Update it with EVERY version:
- Format: Use [Keep a Changelog](https://keepachangelog.com/) standard
- Sections per release: `[Unreleased]`, `[1.2.3] - 2026-06-05`
- Under each: `Added`, `Changed`, `Fixed`, `Removed`, `Deprecated`, `Security`
- Update `[Unreleased]` during development, move to version section when tagging

**Example CHANGELOG.md:**
```markdown
# Changelog

## [Unreleased]
### Added
- New authentication system with JWT

## [1.0.0] - 2026-06-05
### Added
- Initial release with FastAPI backend and React frontend

### Fixed
- Fixed bcrypt compatibility issue with passlib
```

**Workflow:**
1. Develop features/fixes on branches
2. Merge to `main` with PR
3. Update `CHANGELOG.md` with changes
4. Create git tag: `git tag -a vX.Y.Z -m "Release version X.Y.Z"`
5. Push tag: `git push origin vX.Y.Z`

## Installing Dependencies

**ALWAYS check latest version before installing:**

```bash
# Backend - Check latest version
uv index versions package-name

# Then install
cd backend && uv pip install package-name@latest

# Frontend - Check latest version
bun npm view package-name

# Then install
cd frontend && bun add package-name@latest
```

**Never install without checking versions first.**

## Verification Checklist

Before finishing:

**Backend:**
- [ ] Runs: `uvicorn src.main:app --reload`
- [ ] Tests pass: `pytest`
- [ ] Pydantic validates all inputs
- [ ] All code is async
- [ ] Type hints complete
- [ ] No console warnings

**Frontend:**
- [ ] Dev server runs: `bun run dev`
- [ ] Tests pass: `bun run test`
- [ ] No console errors
- [ ] All UI async (TanStack Query)
- [ ] Zod validates responses
- [ ] Tailwind styles applied
- [ ] Types checked: `bun run type-check`
- [ ] Features work in browser

## Key Patterns

**Backend - Async Service:**
```python
class UserService:
    async def create_user(self, db: AsyncSession, user_in: UserCreate) -> User:
        # Pydantic validates user_in
        await self.validate_unique_email(db, user_in.email)
        user = await self.repository.create(db, user_in)
        return user

@router.post("/users/", response_model=User)
async def create_user(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    return await user_service.create_user(db, user_in)
```

**Frontend - TanStack Query + Zod:**
```typescript
import { useMutation, useQuery } from '@tanstack/react-query'
import { z } from 'zod'

const UserSchema = z.object({ id: z.number(), email: z.string().email() })

export function useCreateUser() {
  return useMutation({
    mutationFn: async (user: CreateUserInput) => {
      const res = await apiClient.post('/users', user)
      return UserSchema.parse(res.data)
    }
  })
}

export function UserForm() {
  const { mutateAsync, isPending } = useCreateUser()
  
  const onSubmit = async (formData: CreateUserInput) => {
    await mutateAsync(formData)
  }
  
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(...) }}>
      <button disabled={isPending} className="bg-blue-500 px-4 py-2 rounded">
        {isPending ? 'Creating...' : 'Create'}
      </button>
    </form>
  )
}
```

**Frontend - i18n with useTranslation:**
```typescript
import { useTranslation } from 'react-i18next'

export function Header() {
  const { t, i18n } = useTranslation()
  
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang)
  }
  
  return (
    <header>
      <h1>{t('header.title')}</h1>
      <button onClick={() => changeLanguage('es')}>Español</button>
      <button onClick={() => changeLanguage('en')}>English</button>
    </header>
  )
}
```

## Environment

```env
# Backend
DATABASE_URL=sqlite+aiosqlite:///./ai_studio.db
SECRET_KEY=change-in-production
ALGORITHM=HS256

# Frontend
VITE_API_URL=http://localhost:8000/api/v1
```

## Must-Follow Rules

**Dependencies:**
- ❌ NEVER install a package without checking latest version first
  - Backend: `uv index versions package-name`
  - Frontend: `bun npm view package-name`

**Backend:**
- ❌ No sync code (everything async)
- ❌ No business logic in endpoints (use services)
- ❌ No raw SQL (use SQLAlchemy ORM)
- ❌ No missing Pydantic validation

**Frontend:**
- ❌ No inline styles (use Tailwind)
- ❌ No useState for API data (use TanStack Query)
- ❌ No `any` types (type everything)
- ❌ No missing Zod validation
- ❌ No test failures (run `bun run test` after each change)
- ❌ No hardcoded strings (use i18n with `t('key')`)
- ❌ Components must be fully responsive (use Tailwind breakpoints for mobile, tablet, desktop)
- ❌ Do not skip [DESIGN.md](./DESIGN.md) — follow all color, typography, elevation, and component patterns

**Both:**
- ❌ No `console.log` in final code
- ❌ No uncommitted changes
- ❌ No ignored test failures
- ❌ Always tag releases with semantic version: `git tag -a vX.Y.Z`
- ❌ Always update `CHANGELOG.md` before tagging a release
