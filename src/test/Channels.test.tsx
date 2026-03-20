import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Channels from '@/app/components/Channels'

// Mock the API client
vi.mock('@/app/lib/api', () => ({
  apiClient: {
    getChannels: vi.fn().mockResolvedValue([])
  }
}))

describe('Channels', () => {
  it('renders channels page', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <Channels />
        </BrowserRouter>
      )
    });
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Channels' })).toBeInTheDocument()
    })
  })
})