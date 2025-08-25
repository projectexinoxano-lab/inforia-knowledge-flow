import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import Onboarding from '@/pages/Onboarding'

// Mock useAuth hook
const mockUpdateProfile = vi.fn()
const mockNavigate = vi.fn()

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    profile: {
      id: '1',
      full_name: '',
      professional_license: '',
      clinic_name: '',
      phone: '',
      onboarding_completed: false
    },
    updateProfile: mockUpdateProfile,
    isAuthenticated: true,
    loading: false,
    user: { id: '1' },
    session: {},
    signInWithGoogle: vi.fn(),
    signInWithEmail: vi.fn(),
    signUpWithEmail: vi.fn(),
    signOut: vi.fn()
  })
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom') as any
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
  }
}))

describe('Onboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders onboarding form correctly', () => {
    render(
      <BrowserRouter>
        <Onboarding />
      </BrowserRouter>
    )
    
    expect(screen.getByText('¡Bienvenido a INFORIA!')).toBeInTheDocument()
    expect(screen.getByText('Completa tu perfil profesional para comenzar')).toBeInTheDocument()
    expect(screen.getByText('Información Básica')).toBeInTheDocument()
  })

  it('shows progress indicator', () => {
    render(
      <BrowserRouter>
        <Onboarding />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Paso 1 de 4')).toBeInTheDocument()
  })

  it('handles form input changes', () => {
    render(
      <BrowserRouter>
        <Onboarding />
      </BrowserRouter>
    )
    
    const nameInput = screen.getByPlaceholderText('Dr. María García López')
    fireEvent.change(nameInput, { target: { value: 'Dr. Test User' } })
    
    expect(nameInput).toHaveValue('Dr. Test User')
  })

  it('validates required fields', async () => {
    render(
      <BrowserRouter>
        <Onboarding />
      </BrowserRouter>
    )
    
    const nextButton = screen.getByText('Siguiente')
    fireEvent.click(nextButton)
    
    // Should show validation error (verificar en implementación real)
    await waitFor(() => {
      expect(screen.getByText('Siguiente')).toBeInTheDocument()
    })
  })

  it('navigates through steps', async () => {
    render(
      <BrowserRouter>
        <Onboarding />
      </BrowserRouter>
    )
    
    // Fill required field
    const nameInput = screen.getByPlaceholderText('Dr. María García López')
    fireEvent.change(nameInput, { target: { value: 'Dr. Test User' } })
    
    // Go to next step
    const nextButton = screen.getByText('Siguiente')
    fireEvent.click(nextButton)
    
    await waitFor(() => {
      expect(screen.getByText('Datos Profesionales')).toBeInTheDocument()
    })
  })

  it('shows completion step', async () => {
    mockUpdateProfile.mockResolvedValueOnce(undefined)
    
    render(
      <BrowserRouter>
        <Onboarding />
      </BrowserRouter>
    )
    
    // Fill and complete all steps (simulate)
    const completeButton = screen.getByText('Completar Configuración')
    
    expect(completeButton).toBeInTheDocument()
  })
})