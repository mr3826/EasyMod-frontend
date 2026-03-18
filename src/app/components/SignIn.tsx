import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthProvider';

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('rememberMe') === 'true';
    }
    return false;
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    localStorage.setItem('rememberMe', rememberMe ? 'true' : 'false');
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
      await signin({ email, password });
      navigate('/app');
    } catch (error: any) {
      setError(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          'Invalid email or password'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F9FAF8' }}>
      {/* Left panel — brand + trust */}
      <div
        className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #005f30 0%, #00A651 60%, #00c45e 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-10" style={{ background: '#fff' }} />
        <div className="absolute bottom-10 right-[-60px] w-96 h-96 rounded-full opacity-10" style={{ background: '#fff' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full opacity-5" style={{ background: '#fff' }} />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-lg">E</span>
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">Easy Moderator</span>
          </div>
        </div>

        {/* Headline */}
        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-white/70 text-sm font-medium uppercase tracking-widest mb-3">বাংলাদেশের #১ AI চ্যাটবট</p>
            <h2 className="text-white text-4xl font-extrabold leading-tight">
              আপনার ব্যবসাকে<br />
              <span className="text-white/80">স্মার্ট করুন।</span>
            </h2>
            <p className="mt-4 text-white/70 text-base leading-relaxed">
              Facebook, Instagram ও WhatsApp — সব চ্যানেল একসাথে পরিচালনা করুন।
            </p>
          </div>

          {/* Trust signals */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { stat: '১০,০০০+', label: 'সক্রিয় ব্যবসায়ী' },
              { stat: '৯৮%', label: 'সন্তুষ্ট গ্রাহক' },
              { stat: '৫ মিনিট', label: 'সেটআপ সময়' },
              { stat: '২৪/৭', label: 'AI সাপোর্ট' },
            ].map(({ stat, label }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <p className="text-white text-xl font-bold">{stat}</p>
                <p className="text-white/70 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
            <p className="text-white/90 text-sm leading-relaxed italic">
              "Easy Moderator ব্যবহার করে আমার অর্ডার রেসপন্স টাইম ৩ ঘণ্টা থেকে ৫ মিনিটে নামিয়ে এনেছি।"
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/30 flex items-center justify-center text-white text-xs font-bold">র</div>
              <div>
                <p className="text-white text-xs font-semibold">রাহেলা বেগম</p>
                <p className="text-white/60 text-xs">ফ্যাশন শপ, ঢাকা</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <p className="text-white/40 text-xs">© 2025 Easy Moderator · Made in Bangladesh 🇧🇩</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#00A651' }}>
              <span className="text-white font-black text-sm">E</span>
            </div>
            <span className="text-gray-900 text-xl font-bold">Easy Moderator</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">আবার স্বাগতম! 👋</h1>
            <p className="mt-2 text-gray-500 text-sm">
              আপনার Easy Moderator অ্যাকাউন্টে লগইন করুন
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                  <span className="mt-0.5">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Email / Phone */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                  ইমেইল বা মোবাইল নম্বর
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="আপনার ইমেইল লিখুন"
                  autoComplete="email"
                  autoFocus
                  disabled={isLoading}
                  className="h-11 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    পাসওয়ার্ড
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium transition-colors"
                    style={{ color: '#00A651' }}
                  >
                    পাসওয়ার্ড ভুলে গেছেন?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="আপনার পাসওয়ার্ড লিখুন"
                    autoComplete="current-password"
                    disabled={isLoading}
                    className="h-11 rounded-xl border-gray-200 pr-11 focus:border-emerald-500 focus:ring-emerald-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2.5">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  disabled={isLoading}
                  className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                />
                <label htmlFor="rememberMe" className="text-sm text-gray-600 cursor-pointer select-none">
                  আমাকে মনে রাখুন
                </label>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-white font-semibold text-base shadow-md transition-all hover:shadow-lg hover:opacity-90 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #008040 0%, #00A651 100%)' }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    লগইন হচ্ছে...
                  </span>
                ) : (
                  'লগইন করুন →'
                )}
              </Button>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              অ্যাকাউন্ট নেই?{' '}
              <Link
                to="/signup"
                className="font-semibold transition-colors"
                style={{ color: '#00A651' }}
              >
                নতুন অ্যাকাউন্ট তৈরি করুন
              </Link>
            </p>
          </div>

          {/* BD Trust badge */}
          <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-gray-400">
            <span>🇧🇩</span>
            <span>১০,০০০+ বাংলাদেশী ব্যবসায়ী ব্যবহার করছেন</span>
          </div>
        </div>
      </div>
    </div>
  );
}
