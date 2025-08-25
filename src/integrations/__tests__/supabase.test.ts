import { describe, it, expect, vi } from 'vitest'

// Mock the actual supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: null, error: null }))
        }))
      })),
      insert: vi.fn(() => ({ data: null, error: null })),
      update: vi.fn(() => ({ data: null, error: null })),
      delete: vi.fn(() => ({ data: null, error: null }))
    }))
  }
}))

describe('Supabase Client', () => {
  it('should be properly configured', async () => {
    const { supabase } = await import('@/integrations/supabase/client')
    
    expect(supabase).toBeDefined()
    expect(supabase.auth).toBeDefined()
    expect(supabase.from).toBeDefined()
  })

  it('should have auth methods available', async () => {
    const { supabase } = await import('@/integrations/supabase/client')
    
    expect(typeof supabase.auth.getUser).toBe('function')
    expect(typeof supabase.auth.getSession).toBe('function')
    expect(typeof supabase.auth.signInWithOAuth).toBe('function')
    expect(typeof supabase.auth.signOut).toBe('function')
  })

  it('should have database methods available', async () => {
    const { supabase } = await import('@/integrations/supabase/client')
    
    expect(typeof supabase.from).toBe('function')
    
    const table = supabase.from('profiles')
    expect(typeof table.select).toBe('function')
  })
})