import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import AddProduct from '@/app/components/AddProduct'
import { apiClient } from '@/app/lib/api'

// Mock the API client
vi.mock('@/app/lib/api', () => ({
  apiClient: {
    createProduct: vi.fn().mockResolvedValue({ id: '1', name: 'New Product' }),
    getCategories: vi.fn().mockResolvedValue([])
  }
}))

// Mock auth service
vi.mock('@/app/lib/auth', () => ({
  authService: {
    getCurrentShopId: vi.fn().mockReturnValue('shop1')
  }
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('AddProduct', () => {
  it('renders add product form', () => {
    renderWithRouter(<AddProduct />)

    expect(screen.getByLabelText(/product name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add product/i })).toBeInTheDocument()
  })

  it('handles form submission', async () => {
    renderWithRouter(<AddProduct />)

    const nameInput = screen.getByLabelText(/product name/i)
    const priceInput = screen.getByLabelText(/price/i)
    const submitButton = screen.getByRole('button', { name: /add product/i })

    fireEvent.change(nameInput, { target: { value: 'Test Product' } })
    fireEvent.change(priceInput, { target: { value: '25' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(apiClient.createProduct).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('/products')
    })
  })
})