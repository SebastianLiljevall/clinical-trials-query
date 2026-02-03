import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { buildQueryUrl, fetchStudies } from './api'

describe('buildQueryUrl', () => {
  it('builds query with condition only', () => {
    const url = buildQueryUrl({
      condition: 'MSA',
      resultLimit: 100,
    })

    expect(url).toContain('query.cond=MSA')
    expect(url).toContain('pageSize=100')
    expect(url).toContain('format=json')
  })

  it('builds query with status filter', () => {
    const url = buildQueryUrl({
      condition: 'MSA',
      status: 'COMPLETED',
      resultLimit: 100,
    })

    expect(url).toContain('filter.overallStatus=COMPLETED')
  })

  it('encodes special characters in condition', () => {
    const url = buildQueryUrl({
      condition: 'Multiple System Atrophy',
      resultLimit: 100,
    })

    // URL encoding can use either %20 or + for spaces
    expect(url).toMatch(/Multiple(%20|\+)System(%20|\+)Atrophy/)
  })
})

describe('fetchStudies', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches studies from API', async () => {
    const mockResponse = {
      studies: [],
      totalCount: 0,
    }

    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    })

    const result = await fetchStudies({ resultLimit: 100 })

    expect(result).toEqual(mockResponse)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('pageSize=100'),
      expect.any(Object)
    )
  })

  it('throws error on failed request', async () => {
    ;(global.fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    })

    await expect(fetchStudies({ resultLimit: 100 })).rejects.toThrow(
      'API request failed: 500 Internal Server Error'
    )
  })

  it('passes abort signal to fetch', async () => {
    const controller = new AbortController()

    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ studies: [] }),
    })

    await fetchStudies({ resultLimit: 100 }, controller.signal)

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ signal: controller.signal })
    )
  })
})
