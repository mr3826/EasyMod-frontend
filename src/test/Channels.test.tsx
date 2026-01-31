import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import Channels from '@/app/components/Channels'

// Mock the API client
vi.mock('@/app/lib/api', () => ({
  apiClient: {
    getChannels: vi.fn().mockResolvedValue([])
  }
}))

describe('Channels', () => {
  it('renders channels page', async () => {
    render(<Channels />)

    await waitFor(() => {
      expect(screen.getByText('Channels')).toBeInTheDocument()
    })
  })
})