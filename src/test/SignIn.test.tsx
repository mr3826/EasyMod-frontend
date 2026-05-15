import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import SignIn from '@/app/components/SignIn'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      if (options?.returnObjects) return []
      const map: Record<string, string> = {
        'auth.signin.emailLabel': 'Email',
        'auth.signin.emailPlaceholder': 'Enter your email',
        'auth.signin.passwordLabel': 'Password',
        'auth.signin.passwordPlaceholder': 'Enter your password',
        'auth.signin.signInButton': 'Sign In',
        'auth.signin.signingIn': 'Signing in...',
        'auth.signin.forgotPassword': 'Forgot password?',
        'auth.signin.rememberMe': 'Remember me',
        'auth.signin.noAccount': "Don't have an account?",
        'auth.signin.tagline': 'EasyModerator',
        'auth.signin.heading': 'AI-Powered Commerce',
        'auth.signin.subheading': 'Automate your business',
        'auth.signin.welcomeBack': 'Welcome back',
        'auth.signin.loginPrompt': 'Sign in to your account',
        'auth.signin.testimonialQuote': 'Great product',
        'auth.signin.testimonialName': 'John',
        'auth.signin.testimonialShop': 'Test Shop',
        'auth.signin.errors.invalidCredentials': 'Invalid credentials',
      }
      return map[key] ?? key
    },
  }),
}))

const mockSignin = vi.fn().mockResolvedValue({})

// SignIn relies on AuthProvider context via useAuth().
vi.mock('@/features/auth/AuthProvider', () => ({
  useAuth: () => ({
    signin: mockSignin,
  }),
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('SignIn', () => {
  it('renders signin form', () => {
    renderWithRouter(<SignIn />)

    expect(screen.getByLabelText(/email|mobile/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('handles form submission', async () => {
    renderWithRouter(<SignIn />)

    const emailInput = screen.getByLabelText(/email|mobile/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSignin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })
})