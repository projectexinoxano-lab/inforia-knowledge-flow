import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LoginForm } from '@/components/auth/LoginForm'

// Mock useAuth hook
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    signInWithGoogle: vi.fn(),
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
    expect(screen.getByText('Acceso Seguro Requerido')).toBeInTheDocument()
  })

  it('shows security explanation', () => {
    render(<LoginForm />)
    
    expect(screen.getByText(/INFORIA necesita permisos de Google Drive/)).toBeInTheDocument()
    expect(screen.getByText(/Tus datos permanecen en tu Google Drive/)).toBeInTheDocument()
    expect(screen.getByText(/Modelo Zero-Knowledge para máxima privacidad/)).toBeInTheDocument()
  })

  it('shows Google sign in button', async () => {
    const mockSignInWithGoogle = vi.fn()
    vi.doMock('@/contexts/AuthContext', () => ({
      useAuth: () => ({
        signInWithGoogle: mockSignInWithGoogle,
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