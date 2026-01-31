import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import Orders from '@/app/components/Orders'

// Mock the API client
vi.mock('@/app/lib/api', () => ({
  apiClient: {
    getOrders: vi.fn().mockResolvedValue([]),
    getProducts: vi.fn().mockResolvedValue([])
  }
}))

describe('Orders', () => {
  it('renders orders page', async () => {
    render(<Orders />)

    await waitFor(() => {
      expect(screen.getByText('Orders')).toBeInTheDocument()
    })
  })
})