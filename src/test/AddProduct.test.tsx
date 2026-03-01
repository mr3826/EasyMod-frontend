import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import AddProduct from '@/app/components/AddProduct'
import { apiClient, Product } from '@/app/lib/api'

// Mock the API client
vi.mock('@/app/lib/api', () => ({
  apiClient: {
    createProduct: vi.fn().mockResolvedValue({ id: '1', name: 'New Product' }),
    updateProduct: vi.fn().mockResolvedValue({ id: '1', name: 'Updated Product' }),
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

const mockProduct: Product = {
  id: '123',
  name: 'Test Product',
  description: 'Test Description',
  price: 25.99,
  sku: 'TST-001',
  category: 'Electronics',
  status: 'active',
  stock: true,
  variants: ['Small', 'Large'],
  tags: ['tag1', 'tag2'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

describe('AddProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Full Page Mode', () => {
    it('renders add product form in full page mode', () => {
      renderWithRouter(<AddProduct />)

      expect(screen.getByLabelText(/product name/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/describe your product/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/selling price/i)).toBeInTheDocument()
    })

    it('shows "Add New Product" header in full page mode', () => {
      renderWithRouter(<AddProduct />)

      expect(screen.getByText(/Add New Product/i)).toBeInTheDocument()
      expect(screen.getByText(/add a new product to your store/i)).toBeInTheDocument()
    })

    it('creates product on form submission', async () => {
      renderWithRouter(<AddProduct />)

      const nameInput = screen.getByLabelText(/product name/i)
      const descriptionInput = screen.getByPlaceholderText(/describe your product/i)
      const priceInput = screen.getByLabelText(/selling price/i)

      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'Test Product' } })
        fireEvent.change(descriptionInput, { target: { value: 'Test Description' } })
        fireEvent.change(priceInput, { target: { value: '25.99' } })
      });

      const publishButton = screen.getAllByRole('button').find(btn => 
        btn.textContent?.includes('Publish')
      )
      await act(async () => {
        fireEvent.click(publishButton!)
      });

      await waitFor(() => {
        expect(apiClient.createProduct).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test Product',
            description: 'Test Description',
            price: 25.99
          })
        )
        expect(mockNavigate).toHaveBeenCalledWith('/products')
      })
    })

    it('requires product name and price', async () => {
      renderWithRouter(<AddProduct />)

      const priceInput = screen.getByLabelText(/selling price/i)
      await act(async () => {
        fireEvent.change(priceInput, { target: { value: '25.99' } })
      });

      const publishButton = screen.getAllByRole('button').find(btn => 
        btn.textContent?.includes('Publish')
      )
      await act(async () => {
        fireEvent.click(publishButton!)
      });

      await waitFor(() => {
        expect(screen.getByText(/product name is required/i)).toBeInTheDocument()
      })
    })
  })

  describe('Modal Mode - Create', () => {
    it('renders AddProduct as modal when isModal=true', () => {
      const mockOnClose = vi.fn()
      renderWithRouter(
        <AddProduct
          isModal={true}
          onClose={mockOnClose}
        />
      )

      // Modal should have close button
      expect(screen.getByRole('button', { name: '' })).toBeInTheDocument()
      expect(screen.getByText(/Add New Product/i)).toBeInTheDocument()
    })

    it('closes modal on cancel button click', () => {
      const mockOnClose = vi.fn()
      renderWithRouter(
        <AddProduct
          isModal={true}
          onClose={mockOnClose}
        />
      )

      const cancelButton = screen.getByRole('button', { name: /Cancel/i })
      fireEvent.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('creates product and calls onClose callback in modal mode', async () => {
      const mockOnClose = vi.fn()
      const mockOnSave = vi.fn()

      renderWithRouter(
        <AddProduct
          isModal={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      )

      const nameInput = screen.getByLabelText(/product name/i)
      const priceInput = screen.getByLabelText(/selling price/i)

      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'Modal Product' } })
        fireEvent.change(priceInput, { target: { value: '19.99' } })
      });

      const publishButton = screen.getAllByRole('button').find(btn => 
        btn.textContent?.includes('Publish')
      )
      await act(async () => {
        fireEvent.click(publishButton!)
      });

      await waitFor(() => {
        expect(apiClient.createProduct).toHaveBeenCalled()
        expect(mockOnClose).toHaveBeenCalled()
      })
    })
  })

  describe('Modal Mode - Edit', () => {
    it('renders modal with edit mode when editMode=true', () => {
      const mockOnClose = vi.fn()
      renderWithRouter(
        <AddProduct
          isModal={true}
          editMode={true}
          editProduct={mockProduct}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText(/Edit Product/i)).toBeInTheDocument()
      expect(screen.getByText(/Update product details/i)).toBeInTheDocument()
    })

    it('pre-populates form with existing product data', () => {
      const mockOnClose = vi.fn()
      renderWithRouter(
        <AddProduct
          isModal={true}
          editMode={true}
          editProduct={mockProduct}
          onClose={mockOnClose}
        />
      )

      const nameInput = screen.getByDisplayValue(mockProduct.name)
      expect(nameInput).toBeInTheDocument()
    })

    it('updates product and calls onSave callback', async () => {
      const mockOnClose = vi.fn()
      const mockOnSave = vi.fn()

      renderWithRouter(
        <AddProduct
          isModal={true}
          editMode={true}
          editProduct={mockProduct}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      )

      const nameInput = screen.getByDisplayValue(mockProduct.name) as HTMLInputElement
      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'Updated Product' } })
      });

      const updateButton = screen.getAllByRole('button').find(btn => 
        btn.textContent?.includes('Update Product')
      )
      await act(async () => {
        fireEvent.click(updateButton!)
      });

      await waitFor(() => {
        expect(apiClient.updateProduct).toHaveBeenCalledWith(
          mockProduct.id,
          expect.objectContaining({
            name: 'Updated Product'
          })
        )
        expect(mockOnSave).toHaveBeenCalled()
        expect(mockOnClose).toHaveBeenCalled()
      })
    })

    it('shows "Update Product" button in edit mode', () => {
      const mockOnClose = vi.fn()
      renderWithRouter(
        <AddProduct
          isModal={true}
          editMode={true}
          editProduct={mockProduct}
          onClose={mockOnClose}
        />
      )

      const updateButton = screen.getByRole('button', { name: /Update Product/i })
      expect(updateButton).toBeInTheDocument()
      expect(updateButton).toHaveClass('bg-blue-600')
    })
  })

  describe('Form Validation', () => {
    it('shows error when price is invalid', async () => {
      renderWithRouter(<AddProduct />)

      const nameInput = screen.getByLabelText(/product name/i)
      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'Test Product' } })
      });

      const publishButton = screen.getAllByRole('button').find(btn => 
        btn.textContent?.includes('Publish')
      )
      await act(async () => {
        fireEvent.click(publishButton!)
      });

      await waitFor(() => {
        expect(screen.getByText(/valid selling price is required/i)).toBeInTheDocument()
      })
    })
  })

  describe('Data Handling', () => {
    it('includes optional fields when provided', async () => {
      renderWithRouter(<AddProduct />)

      const nameInput = screen.getByLabelText(/product name/i)
      const descriptionInput = screen.getByPlaceholderText(/describe your product/i)
      const priceInput = screen.getByLabelText(/selling price/i)

      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'Product with Options' } })
        fireEvent.change(descriptionInput, { target: { value: 'Product description' } })
        fireEvent.change(priceInput, { target: { value: '29.99' } })
      });

      const publishButton = screen.getAllByRole('button').find(btn => 
        btn.textContent?.includes('Publish')
      )
      await act(async () => {
        fireEvent.click(publishButton!)
      });

      await waitFor(() => {
        expect(apiClient.createProduct).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Product with Options',
            price: 29.99,
            description: 'Product description'
          })
        )
      })
    })
  })
})