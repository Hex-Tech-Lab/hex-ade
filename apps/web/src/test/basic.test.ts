import { describe, it, expect } from 'vitest'

describe('Basic Test Suite', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should have proper test setup', () => {
    expect(typeof global).toBe('object')
  })
})