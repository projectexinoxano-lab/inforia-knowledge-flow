import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { Header } from '@/components/Header'

// Mock the AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com', user_metadata: { full_name: 'Test User' } },
    isLoading: false,
    signOut: vi.fn()
  })
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Header Component', () => {
  it('renders INFORIA logo', () => {
    renderWithRouter(<Header />)
    expect(screen.getByText('iNFORiA')).toBeInTheDocument()
  })

  it('displays user navigation when authenticated', () => {
    renderWithRouter(<Header />)
    // Look for user menu trigger
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('has proper navigation structure', () => {
    renderWithRouter(<Header />)
    const header = screen.getByRole('banner')
    expect(header).toBeInTheDocument()
  })

  it('applies INFORIA brand colors', () => {
    renderWithRouter(<Header />)
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('bg-primary') // INFORIA green
  })
})