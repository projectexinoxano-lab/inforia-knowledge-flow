import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { AuthGuard } from '@/components/auth/AuthGuard'

// Mock useAuth hook
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom') as any
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/dashboard' })
  }
})

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn()
}))

const TestComponent = () => <div data-testid="protected-content">Protected Content</div>

describe('AuthGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state when loading', async () => {
    const { useAuth } = await import('@/contexts/AuthContext')
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      loading: true,
      profile: null,
      user: null,
      session: null,
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
      updateProfile: vi.fn()
    })

    render(
      <BrowserRouter>
        <AuthGuard>
          <TestComponent />
        </AuthGuard>
      </BrowserRouter>
    )

    expect(screen.getByText('Verificando autenticación...')).toBeInTheDocument()
  })

  it('renders children when authenticated and onboarding completed', async () => {
    const { useAuth } = await import('@/contexts/AuthContext')
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      loading: false,
      profile: { onboarding_completed: true } as any,
      user: { id: '1' } as any,
      session: {} as any,
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
      updateProfile: vi.fn()
    })

    render(
      <BrowserRouter>
        <AuthGuard>
          <TestComponent />
        </AuthGuard>
      </BrowserRouter>
    )

    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  })

  it('redirects to auth when not authenticated', async () => {
    const { useAuth } = await import('@/contexts/AuthContext')
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      loading: false,
      profile: null,
      user: null,
      session: null,
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
      updateProfile: vi.fn()
    })

    render(
      <BrowserRouter>
        <AuthGuard>
          <TestComponent />
        </AuthGuard>
      </BrowserRouter>
    )

    expect(mockNavigate).toHaveBeenCalledWith('/auth', expect.any(Object))
  })

  it('allows access when requireAuth is false', async () => {
    const { useAuth } = await import('@/contexts/AuthContext')
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      loading: false,
      profile: null,
      user: null,
      session: null,
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
      updateProfile: vi.fn()
    })

    render(
      <BrowserRouter>
        <AuthGuard requireAuth={false}>
          <TestComponent />
        </AuthGuard>
      </BrowserRouter>
    )

    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  })
})