import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import Index from '@/pages/Index'

// Mock the AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isLoading: false,
    signOut: vi.fn()
  })
}))

// Mock react-query
vi.mock('@tanstack/react-query', () => ({
  QueryClient: vi.fn(),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
  useQuery: () => ({
    data: null,
    isLoading: false,
    error: null
  })
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Index Page', () => {
  it('renders main heading with INFORIA branding', () => {
    renderWithRouter(<Index />)
    expect(screen.getByText(/inforia/i)).toBeInTheDocument()
  })

  it('contains navigation elements', () => {
    renderWithRouter(<Index />)
    const navigation = screen.getByRole('banner') // header element
    expect(navigation).toBeInTheDocument()
  })

  it('renders call-to-action elements', () => {
    renderWithRouter(<Index />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('displays professional psychology messaging', () => {
    renderWithRouter(<Index />)
    // Check for psychology-related content
    const psychologyContent = screen.getByText(/psicólog/i) || 
                             screen.getByText(/clínic/i) || 
                             screen.getByText(/informe/i)
    expect(psychologyContent).toBeInTheDocument()
  })

  it('has accessible structure', () => {
    renderWithRouter(<Index />)
    // Check for main content area
    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()
  })
})