import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Subscription from '@/app/components/Subscription'

// Mock the API client
vi.mock('@/app/lib/api', () => ({
  apiClient: {
    getSubscription: vi.fn().mockResolvedValue({
      success: true,
      data: {
        subscription: {
          plan_name: 'Pro',
          plan_price: '29.99',
          billing_cycle: 'monthly',
          next_billing_date: '2024-02-01',
          status: 'active',
          features: { image_understanding: true }
        },
        usage: {
          conversations: { used: 10, limit: 100, status: 'safe' },
          orders: { used: 5, limit: 50, status: 'safe' },
          products: { used: 20, limit: 100, status: 'safe' }
        },
        extra_usage: { conversations: 0, charge: 0 }
      }
    }),
    getSubscriptionInvoices: vi.fn().mockResolvedValue({
      success: true,
      data: [
        {
          invoice_number: '1',
          billing_period: 'Jan 2024',
          amount: '29.99',
          status: 'paid',
          invoice_type: 'subscription',
          created_at: '2024-01-01'
        }
      ]
    }),
    purchaseConversationPack: vi.fn().mockResolvedValue({ success: true })
  }
}))

// Mock auth service
vi.mock('@/app/lib/auth', () => ({
  authService: {
    getCurrentShopId: vi.fn().mockReturnValue('shop1')
  }
}))

// Mock UI components
vi.mock('@/app/components/ui/progress', () => ({
  Progress: ({ value }: any) => <div data-testid="progress" data-value={value} />
}))

vi.mock('@/app/components/ui/badge', () => ({
  Badge: ({ children }: any) => <div data-testid="badge">{children}</div>
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Receipt: () => <div data-testid="receipt-icon" />,
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
  CheckCircle2: () => <div data-testid="check-circle-icon" />,
  Download: () => <div data-testid="download-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  Package: () => <div data-testid="package-icon" />,
  ShoppingCart: () => <div data-testid="shopping-cart-icon" />,
  MessageSquare: () => <div data-testid="message-square-icon" />
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('Subscription', () => {
  it('renders subscription page with plan details and usage', async () => {
    renderWithRouter(<Subscription />)

    await waitFor(() => {
      expect(screen.getByText('Pro Plan')).toBeInTheDocument()
    })

    expect(screen.getByText('Plan & Billing')).toBeInTheDocument()
    expect(screen.getByText('৳29.99')).toBeInTheDocument()
    expect(screen.getAllByTestId('progress')).toHaveLength(3) // conversations, orders, products
  })

  it('displays invoices', async () => {
    renderWithRouter(<Subscription />)

    await waitFor(() => {
      expect(screen.getByText('Jan 2024')).toBeInTheDocument()
    })

    expect(screen.getByText('৳29.99')).toBeInTheDocument()
    expect(screen.getByText('Paid')).toBeInTheDocument()
  })
})