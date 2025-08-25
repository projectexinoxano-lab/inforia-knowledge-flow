import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { useDebounce } from '@/hooks/useDebounce'

// Mock timers
vi.useFakeTimers()

describe('useDebounce Hook', () => {
  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.useFakeTimers()
  })

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500))
    expect(result.current).toBe('initial')
  })

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 }
      }
    )

    expect(result.current).toBe('initial')

    // Change the value
    rerender({ value: 'updated', delay: 500 })
    
    // Value should still be initial before delay
    expect(result.current).toBe('initial')

    // Fast forward time by 250ms (less than delay)
    act(() => {
      vi.advanceTimersByTime(250)
    })
    expect(result.current).toBe('initial')

    // Fast forward to complete the delay
    act(() => {
      vi.advanceTimersByTime(250)
    })
    expect(result.current).toBe('updated')
  })

  it('should reset timer on rapid value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 }
      }
    )

    rerender({ value: 'first', delay: 500 })
    
    act(() => {
      vi.advanceTimersByTime(250)
    })
    
    rerender({ value: 'second', delay: 500 })
    
    // Should still be initial as timer was reset
    expect(result.current).toBe('initial')
    
    act(() => {
      vi.advanceTimersByTime(500)
    })
    
    expect(result.current).toBe('second')
  })

  it('should handle different data types', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 123, delay: 300 }
      }
    )

    expect(result.current).toBe(123)

    rerender({ value: 456, delay: 300 })
    
    act(() => {
      vi.advanceTimersByTime(300)
    })
    
    expect(result.current).toBe(456)
  })
})