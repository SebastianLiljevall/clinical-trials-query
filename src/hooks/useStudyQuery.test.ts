import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useStudyQuery } from './useStudyQuery'

describe('useStudyQuery', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  it('initializes with idle state', () => {
    const { result } = renderHook(() => useStudyQuery())

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.results).toEqual([])
  })

  it('fetches studies on query', async () => {
    const mockResponse = {
      studies: [
        {
          protocolSection: {
            identificationModule: { nctId: 'NCT12345678' },
            statusModule: { overallStatus: 'COMPLETED' },
            sponsorCollaboratorsModule: {
              leadSponsor: { name: 'Test', class: 'OTHER' },
            },
          },
          hasResults: false,
        },
      ],
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    })

    const { result } = renderHook(() => useStudyQuery())

    await act(async () => {
      await result.current.executeQuery({ resultLimit: 100 })
    })

    expect(result.current.results).toHaveLength(1)
    expect(result.current.filteredResults).toHaveLength(1)
    expect(result.current.error).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('handles errors', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(global.fetch as any).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useStudyQuery())

    await act(async () => {
      await result.current.executeQuery({ resultLimit: 100 })
    })

    expect(result.current.error).toContain('Network error')
    expect(result.current.results).toEqual([])
    expect(result.current.isLoading).toBe(false)
  })

  it('can cancel query', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(global.fetch as any).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    )

    const { result } = renderHook(() => useStudyQuery())

    act(() => {
      result.current.executeQuery({ resultLimit: 100 })
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true)
    })

    act(() => {
      result.current.cancelQuery()
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
  })
})
