import { describe, it, expect } from 'vitest'

describe('Example Test Suite', () => {
  it('should add two numbers', () => {
    expect(1 + 1).toBe(2)
  })

  it('should concatenate strings', () => {
    expect('hello' + ' ' + 'world').toBe('hello world')
  })

  it('should handle arrays', () => {
    const arr = [1, 2, 3]
    expect(arr).toHaveLength(3)
    expect(arr).toContain(2)
  })
})
