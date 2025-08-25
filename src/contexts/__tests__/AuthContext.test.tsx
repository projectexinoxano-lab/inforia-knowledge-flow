import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => ({
        data: { session: null },
        error: null
      })),
      getUser: vi.fn(() => ({
        data: { user: null },
        error: null
      })),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
      signOut: vi.fn(() => ({
        error: null
      }))
    }
  }
}))

// Test component to use the context
const TestComponent = () => {
  const { user, loading, signOut } = useAuth()
  
  return (
    <div>
      <div data-testid="user">{user ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <button onClick={signOut} data-testid="signout">Sign Out</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('provides authentication state', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('not-authenticated')
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
    })
  })

  it('provides signOut functionality', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    const signOutButton = screen.getByTestId('signout')
    expect(signOutButton).toBeInTheDocument()
  })

  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      render(<TestComponent />)
    }).toThrow()
    
    consoleSpy.mockRestore()
  })
})