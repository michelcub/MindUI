import { describe, it, expect, vi } from 'vitest'
import { render, screen } from './utils'

// Example component test
function Button({ onClick, children }: { onClick: () => void; children: string }) {
  return <button onClick={onClick}>{children}</button>
}

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button onClick={() => {}}>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    screen.getByRole('button').click()
    expect(handleClick).toHaveBeenCalledOnce()
  })
})
