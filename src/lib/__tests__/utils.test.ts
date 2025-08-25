import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('Utils Functions', () => {
  describe('cn (className utility)', () => {
    it('merges className strings correctly', () => {
      const result = cn('base-class', 'additional-class')
      expect(result).toBe('base-class additional-class')
    })

    it('handles conditional classes', () => {
      const isActive = true
      const result = cn('base', isActive && 'active', !isActive && 'inactive')
      expect(result).toBe('base active')
    })

    it('removes duplicate classes', () => {
      const result = cn('p-4 text-sm p-4 text-lg')
      expect(result).toContain('text-lg')
      expect(result).toContain('p-4')
    })

    it('handles undefined and null values', () => {
      const result = cn('base', undefined, null, 'valid')
      expect(result).toBe('base valid')
    })

    it('handles empty strings and false values', () => {
      const result = cn('base', '', false, 'valid')
      expect(result).toBe('base valid')
    })

    it('merges Tailwind classes correctly with twMerge', () => {
      // Test that conflicting Tailwind classes are properly merged
      const result = cn('px-2 py-1', 'px-4')
      expect(result).toBe('py-1 px-4')
    })
  })
})