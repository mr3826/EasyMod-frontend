import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import Dashboard from '@/app/components/Dashboard'

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
    useParams: () => ({}),
  }
})

// Mock the API client
vi.mock('@/app/lib/api', () => ({
  apiClient: {
    getDashboardMetrics: vi.fn().mockResolvedValue({
      metrics: {
        totalMessages: 100,
        activeProducts: 50,
        ordersToday: 10,
        conversionRate: 5.0,
        weeklyChange: 2.5
      },
      channels: {
        active: 3,
        total: 5
      },
      chartData: []
    })
  }
}))

describe('Dashboard', () => {
  it('renders dashboard with metrics', async () => {
    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Channel Status')).toBeInTheDocument()
    })

    // Check if metrics are displayed
    expect(screen.getByText('100')).toBeInTheDocument() // totalMessages
    expect(screen.getByText('50')).toBeInTheDocument() // activeProducts
  })
})