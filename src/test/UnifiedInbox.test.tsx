import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import UnifiedInbox from '@/app/components/UnifiedInbox'
import { apiClient } from '@/app/lib/api'
import { toast } from 'sonner'

vi.mock('@/app/lib/api', () => ({
  apiClient: {
    getConversations: vi.fn(),
    getMessages: vi.fn(),
    getResponseTemplates: vi.fn(),
    getSubscription: vi.fn(),
    createMessage: vi.fn(),
    updateConversation: vi.fn(),
    createAuditLog: vi.fn(),
  }
}))

vi.mock('@/app/lib/useSubscriptionFeatures', () => ({
  useSubscriptionFeatures: () => ({
    features: {
      image_understanding: true,
      advanced_ai: true,
      priority_support: true,
      custom_branding: false,
    },
    planName: 'PRO',
    plan: null,
    loading: false,
  })
}))

vi.mock('@/app/lib/useInboxSSE', () => ({
  useInboxSSE: vi.fn()
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
  }
}))

const baseConversation = {
  id: 'conv-1',
  customer_id: 'cust-1',
  customer: { id: 'cust-1', name: 'Alice' },
  channel: 'facebook' as const,
  status: 'active' as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

describe('UnifiedInbox 24h window behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(apiClient.getResponseTemplates as any).mockResolvedValue([])
    ;(apiClient.getMessages as any).mockResolvedValue({
      messages: [],
      pagination: { page: 1, totalPages: 1 }
    })
    ;(apiClient.createMessage as any).mockResolvedValue({
      id: 'msg-1',
      conversation_id: 'conv-1',
      content: 'hello',
      sender: 'agent',
      message_type: 'text',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  })

  it('shows 24h warning banner for Facebook conversation around 23h', async () => {
    const warningConversation = {
      ...baseConversation,
      updated_at: new Date(Date.now() - 23.5 * 60 * 60 * 1000).toISOString(),
      channel: 'facebook' as const,
    }

    ;(apiClient.getConversations as any).mockResolvedValue({
      conversations: [warningConversation],
      pagination: { page: 1, totalPages: 1 }
    })

    render(<MemoryRouter><UnifiedInbox /></MemoryRouter>)

    await waitFor(() => {
      expect(screen.getByText(/24-hour messaging window closing soon/i)).toBeInTheDocument()
    })
  })

  it('disables send for expired Facebook window until message tag is selected', async () => {
    const expiredConversation = {
      ...baseConversation,
      updated_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
      channel: 'facebook' as const,
    }

    ;(apiClient.getConversations as any).mockResolvedValue({
      conversations: [expiredConversation],
      pagination: { page: 1, totalPages: 1 }
    })

    render(<MemoryRouter><UnifiedInbox /></MemoryRouter>)

    await waitFor(() => {
      expect(screen.getByText(/Messaging window expired/i)).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText(/Select a Message Tag above to continue/i)
    expect(input).toBeDisabled()

    const sendButton = screen.getByRole('button', { name: /^Send$/i })
    expect(sendButton).toBeDisabled()

    const tagSelect = screen.getByRole('combobox')
    fireEvent.change(tagSelect, { target: { value: 'HUMAN_AGENT' } })

    expect(screen.getByPlaceholderText(/Type a message/i)).toBeInTheDocument()
  })

  it('does not apply 24h expiry lock to WhatsApp conversation', async () => {
    const oldWhatsappConversation = {
      ...baseConversation,
      id: 'conv-2',
      channel: 'whatsapp' as const,
      updated_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    }

    ;(apiClient.getConversations as any).mockResolvedValue({
      conversations: [oldWhatsappConversation],
      pagination: { page: 1, totalPages: 1 }
    })

    render(<MemoryRouter><UnifiedInbox /></MemoryRouter>)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Unified Inbox/i })).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText(/Type a message/i)
    fireEvent.change(input, { target: { value: 'hello from whatsapp' } })

    const sendButton = screen.getByRole('button', { name: /^Send$/i })
    expect(sendButton).toBeEnabled()
  })

  it('sends message with message_tag after selecting tag in expired Meta window', async () => {
    const expiredConversation = {
      ...baseConversation,
      updated_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
      channel: 'facebook' as const,
    }

    ;(apiClient.getConversations as any).mockResolvedValue({
      conversations: [expiredConversation],
      pagination: { page: 1, totalPages: 1 }
    })

    render(<MemoryRouter><UnifiedInbox /></MemoryRouter>)

    await waitFor(() => {
      expect(screen.getByText(/Messaging window expired/i)).toBeInTheDocument()
    })

    const tagSelect = screen.getByRole('combobox')
    fireEvent.change(tagSelect, { target: { value: 'ACCOUNT_UPDATE' } })

    const input = screen.getByPlaceholderText(/Type a message/i)
    fireEvent.change(input, { target: { value: 'Order update from agent' } })

    fireEvent.click(screen.getByRole('button', { name: /^Send$/i }))

    await waitFor(() => {
      expect(apiClient.createMessage).toHaveBeenCalledWith(
        'conv-1',
        expect.objectContaining({
          content: 'Order update from agent',
          sender: 'agent',
          message_type: 'text',
          message_tag: 'ACCOUNT_UPDATE',
        })
      )
    })
  })

  it('blocks AI suggestion send when expired window has no selected message tag', async () => {
    const expiredConversation = {
      ...baseConversation,
      updated_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
      channel: 'facebook' as const,
    }

    ;(apiClient.getConversations as any).mockResolvedValue({
      conversations: [expiredConversation],
      pagination: { page: 1, totalPages: 1 }
    })
    ;(apiClient.getMessages as any).mockResolvedValue({
      messages: [
        {
          id: 'msg-customer-1',
          conversation_id: 'conv-1',
          content: 'Please help',
          sender: 'customer',
          message_type: 'text',
          created_at: new Date(Date.now() - 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 60 * 1000).toISOString(),
        },
        {
          id: 'msg-ai-1',
          conversation_id: 'conv-1',
          content: 'AI draft reply',
          ai_suggestion: 'AI draft reply',
          ai_confidence: 0.9,
          sender: 'ai',
          message_type: 'text',
          created_at: new Date(Date.now() - 30 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 30 * 1000).toISOString(),
        },
      ],
      pagination: { page: 1, totalPages: 1 }
    })

    render(<MemoryRouter><UnifiedInbox /></MemoryRouter>)

    await waitFor(() => {
      expect(screen.getByText(/AI Suggestion/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Use This/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Select a Message Tag to send an out-of-window message.')
    })
    expect(apiClient.createMessage).not.toHaveBeenCalled()
  })
})
