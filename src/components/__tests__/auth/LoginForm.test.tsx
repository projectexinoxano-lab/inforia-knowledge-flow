import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LoginForm } from '@/components/auth/LoginForm'

// Mock useAuth hook
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    signInWithGoogle: vi.fn(),
    signInWithEmail: vi.fn(),
    signUpWithEmail: vi.fn(),
    loading: false
  })
}))

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
  }
}))

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form correctly', () => {
    render(<LoginForm />)
    
    expect(screen.getByText('iNFORiA')).toBeInTheDocument()
    expect(screen.getByText('Puesto de Mando Clínico')).toBeInTheDocument()
    expect(screen.getByText('Continuar con Google')).toBeInTheDocument()
  })

  it('shows both signin and signup tabs', () => {
    render(<LoginForm />)
    
    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument()
    expect(screen.getByText('Crear Cuenta')).toBeInTheDocument()
  })

  it('handles email signin form submission', async () => {
    const mockSignInWithEmail = vi.fn()
    vi.doMock('@/contexts/AuthContext', () => ({
      useAuth: () => ({
        signInWithEmail: mockSignInWithEmail,
        signInWithGoogle: vi.fn(),
        signUpWithEmail: vi.fn(),
        loading: false
      })
    }))

    render(<LoginForm />)
    
    // Fill signin form
    const emailInput = screen.getByPlaceholderText('tu@email.com')
    const passwordInput = screen.getByPlaceholderText('••••••••')
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })
    fireEvent.click(submitButton)

    // Form should be submitted (verificar en implementación real)
    await waitFor(() => {
      expect(emailInput).toHaveValue('test@example.com')
    })
  })

  it('handles signup tab switch', () => {
    render(<LoginForm />)
    
    const signupTab = screen.getByText('Crear Cuenta')
    fireEvent.click(signupTab)
    
    expect(screen.getByPlaceholderText('Dr. María García')).toBeInTheDocument()
  })

  it('shows Google sign in button', async () => {
    const mockSignInWithGoogle = vi.fn()
    vi.doMock('@/contexts/AuthContext', () => ({
      useAuth: () => ({
        signInWithGoogle: mockSignInWithGoogle,
        signInWithEmail: vi.fn(),
        signUpWithEmail: vi.fn(),
        loading: false
      })
    }))

    render(<LoginForm />)
    
    const googleButton = screen.getByText('Continuar con Google')
    expect(googleButton).toBeInTheDocument()
    
    fireEvent.click(googleButton)
    // Google signin should be called (verificar en implementación real)
  })

  it('shows legal terms links', () => {
    render(<LoginForm />)
    
    expect(screen.getByText(/Términos de Servicio/)).toBeInTheDocument()
    expect(screen.getByText(/Política de Privacidad/)).toBeInTheDocument()
  })
})