import { describe, it, expect, vi, beforeEach } from 'vitest'
import { creditsService } from '@/services/credits'

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() => ({
        data: { user: { id: 'test-user-id' } }
      }))
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { 
              id: 'test-user-id',
              credits_used: 5, 
              credits_limit: 100,
              plan_type: 'professional',
              subscription_status: 'active'
            },
            error: null
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: [{ credits_used: 6 }],
          error: null
        }))
      }))
    }))
  }
}))

describe('Credits Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should get user profile correctly', async () => {
    const result = await creditsService.getUserProfile()
    
    expect(result).toEqual({
      id: 'test-user-id',
      credits_used: 5,
      credits_limit: 100,
      plan_type: 'professional',
      subscription_status: 'active'
    })
  })

  it('should check if user can generate report', async () => {
    const result = await creditsService.checkCanGenerateReport()
    
    expect(result.canGenerate).toBe(true)
  })

  it('should consume credits correctly', async () => {
    const result = await creditsService.consumeCredit()
    
    expect(result).toBe(true)
  })

  it('should calculate status correctly', () => {
    expect(creditsService.calculateStatus(5, 100)).toBe('active')
    expect(creditsService.calculateStatus(90, 100)).toBe('warning') 
    expect(creditsService.calculateStatus(100, 100)).toBe('over_quota')
  })

  it('should prevent report generation when over quota', async () => {
    // Mock a user who has exceeded credits
    const mockOverQuotaUser = {
      id: 'test-user',
      credits_used: 100,
      credits_limit: 100,
      plan_type: 'professional',
      subscription_status: 'over_quota'
    }

    vi.mocked(creditsService.getUserProfile).mockResolvedValueOnce(mockOverQuotaUser)
    
    const result = await creditsService.checkCanGenerateReport()
    
    expect(result.canGenerate).toBe(false)
    expect(result.message).toContain('límite de informes')
  })
})