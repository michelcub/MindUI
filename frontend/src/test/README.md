# Testing Guide

This project uses **Vitest** for unit and component testing with React Testing Library.

## Running Tests

```bash
# Run tests once
bun run test

# Run tests in watch mode (re-run on file changes)
bun run test:watch

# Run tests with UI dashboard
bun run test:ui

# Generate coverage report
bun run test:coverage
```

## Writing Tests

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest'

describe('Addition', () => {
  it('should add two numbers', () => {
    expect(1 + 1).toBe(2)
  })
})
```

### Component Tests

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from './utils'

describe('Button', () => {
  it('should render and handle clicks', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    screen.getByRole('button').click()
    expect(handleClick).toHaveBeenCalledOnce()
  })
})
```

### Hook Tests

```typescript
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'

describe('useCounter', () => {
  it('should increment counter', () => {
    const { result } = renderHook(() => useCounter())
    
    act(() => {
      result.current.increment()
    })
    
    expect(result.current.count).toBe(1)
  })
})
```

## Best Practices

- ✅ Test behavior, not implementation details
- ✅ Use semantic queries: `getByRole`, `getByLabelText`, `getByPlaceholderText`
- ✅ Mock external APIs and dependencies
- ✅ Keep tests focused and isolated
- ✅ Use `vi.fn()` to mock functions
- ✅ Clean up after each test (automatic via `afterEach`)

## File Organization

```
src/
├── components/
│   ├── Button.tsx
│   └── Button.test.tsx
├── hooks/
│   ├── useCounter.ts
│   └── useCounter.test.ts
└── test/
    ├── setup.ts          # Test configuration
    ├── utils.tsx         # Custom render function
    └── example.test.ts   # Example tests
```

## Mocking

### Mock a function

```typescript
const mockFn = vi.fn(() => 'mocked value')
```

### Mock an API call

```typescript
import { vi } from 'vitest'

vi.mock('axios', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: { id: 1 } }))
  }
}))
```

### Mock React Router

```typescript
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ id: '123' })
}))
```

## Debugging

### Debug output

```typescript
import { render, screen } from './utils'

render(<MyComponent />)
screen.debug() // Print DOM
```

### Use watch mode

```bash
bun run test:watch
```

Press `p` to filter by filename, `t` to filter by test name.

## Resources

- [Vitest Documentation](https://vitest.dev)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
