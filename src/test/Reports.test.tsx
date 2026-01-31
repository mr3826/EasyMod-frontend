import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Reports from '@/app/components/Reports'

// Mock recharts
vi.mock('recharts', () => ({
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  Legend: () => <div data-testid="legend" />
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  Users: () => <div data-testid="users-icon" />,
  DollarSign: () => <div data-testid="dollar-sign-icon" />,
  ShoppingCart: () => <div data-testid="shopping-cart-icon" />,
  Bot: () => <div data-testid="bot-icon" />,
  Brain: () => <div data-testid="brain-icon" />,
  AlertCircle: () => <div data-testid="alert-circle-icon" />
}))

// Mock data imports
vi.mock('@/app/lib/mockData', () => ({
  mockInsights: []
}))

vi.mock('@/app/lib/knowledgeTypes', () => ({
  mockFAQs: [
    { category: 'General', usageCount: 10, confidence: 0.8 },
    { category: 'Products', usageCount: 5, confidence: 0.9 }
  ],
  mockKnowledgeGaps: []
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('Reports', () => {
  it('renders reports page with charts and metrics', () => {
    renderWithRouter(<Reports />)

    expect(screen.getByText('Reports & Analytics')).toBeInTheDocument()
    expect(screen.getByText('AI-powered insights and business intelligence')).toBeInTheDocument()
    expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    expect(screen.getByText('$4,725.90')).toBeInTheDocument()
    expect(screen.getAllByTestId('bar-chart')).toHaveLength(1) // Assuming 1 bar chart
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
  })
})