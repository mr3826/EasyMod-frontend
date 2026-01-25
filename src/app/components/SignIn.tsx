import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Eye, EyeOff } from 'lucide-react';
import { authService } from '@/app/lib/auth';

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      await authService.signin({ email, password });
      navigate('/');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl"></div>
            <span className="text-3xl font-bold text-gray-900">CommerceAI</span>
          </div>
          <p className="text-gray-600">
            Sign in to your AI Commerce Platform
          </p>
        </div>

        {/* Sign In Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Sign In</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
                autoFocus
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-gray-700 rounded-md transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={isLoading}
              />
              <label
                htmlFor="rememberMe"
                className="text-sm text-gray-700 cursor-pointer select-none"
              >
                Remember me
              </label>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Additional Links */}
          <div className="mt-6 text-center">
            <a
              href="#"
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              Forgot password?
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 hover:text-blue-700 transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
