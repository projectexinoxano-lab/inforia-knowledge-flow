import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'

describe('Card Components', () => {
  it('renders Card component correctly', () => {
    render(
      <Card data-testid="card">
        <CardContent>Card content</CardContent>
      </Card>
    )
    
    const card = screen.getByTestId('card')
    expect(card).toBeInTheDocument()
    expect(card).toHaveClass('rounded-lg', 'border', 'bg-card')
  })

  it('renders CardHeader with title and description', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
      </Card>
    )
    
    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card Description')).toBeInTheDocument()
  })

  it('renders CardContent with children', () => {
    render(
      <Card>
        <CardContent>
          <p>This is card content</p>
        </CardContent>
      </Card>
    )
    
    expect(screen.getByText('This is card content')).toBeInTheDocument()
  })

  it('renders CardFooter with children', () => {
    render(
      <Card>
        <CardFooter>
          <button>Footer Button</button>
        </CardFooter>
      </Card>
    )
    
    expect(screen.getByRole('button', { name: 'Footer Button' })).toBeInTheDocument()
  })

  it('applies custom className correctly', () => {
    render(
      <Card className="custom-class" data-testid="custom-card">
        <CardContent>Content</CardContent>
      </Card>
    )
    
    const card = screen.getByTestId('custom-card')
    expect(card).toHaveClass('custom-class')
  })

  it('renders complete card structure', () => {
    render(
      <Card data-testid="complete-card">
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Main content goes here</p>
        </CardContent>
        <CardFooter>
          <button>Action Button</button>
        </CardFooter>
      </Card>
    )
    
    const card = screen.getByTestId('complete-card')
    expect(card).toBeInTheDocument()
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getByText('Main content goes here')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument()
  })
})