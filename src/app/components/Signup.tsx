import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { useAuth } from "../../features/auth/AuthProvider";
import { apiClient } from "../lib/api";
import { subscriptionPlans, getPlanPrice } from "../lib/subscriptionPlans";

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [billingAnnual, setBillingAnnual] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState("growth");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const selectedPlan = useMemo(
    () => subscriptionPlans.find((plan) => plan.id === selectedPlanId) ?? subscriptionPlans[0],
    [selectedPlanId]
  );

  const formatPrice = (value: number) => `৳${value.toLocaleString()}`;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!selectedPlan) {
      setError("Please select a subscription plan.");
      return;
    }

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter a valid email.");
      return;
    }

    if (!password) {
      setError("Please create a password.");
      return;
    }

    if (!acceptedTerms) {
      setError("Please accept the terms to continue.");
      return;
    }

    setIsLoading(true);

    try {
      await signup({
        email,
        password,
        full_name: fullName,
        phone: phone.trim() || undefined,
      });

      const billingCycle = billingAnnual ? "yearly" : "monthly";
      const planPrice = getPlanPrice(selectedPlan, billingCycle);

      await apiClient.updateSubscriptionPlan({
        plan_name: selectedPlan.name,
        plan_price: planPrice,
        billing_cycle: billingCycle,
        conversations_limit: selectedPlan.limits.conversations,
        orders_limit: selectedPlan.limits.orders,
        products_limit: selectedPlan.limits.products,
        features: selectedPlan.features,
      });

      localStorage.setItem(
        "easymod_selected_plan",
        JSON.stringify({
          planId: selectedPlan.id,
          billing: billingAnnual ? "annual" : "monthly",
        })
      );

      navigate("/app");
    } catch (signupError: any) {
      setError(
        signupError.response?.data?.error?.message ||
        signupError.response?.data?.message ||
        "Unable to create account."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAF8' }}>
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, #008040 0%, #00A651 100%)' }}>
              <span className="text-white font-black text-sm">E</span>
            </div>
            <span className="text-gray-900 text-lg font-bold tracking-tight">Easy Moderator</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>ইতিমধ্যে অ্যাকাউন্ট আছে?</span>
            <Link to="/signin" className="font-semibold transition-colors" style={{ color: '#00A651' }}>
              লগইন করুন
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Page heading */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 text-sm text-emerald-700 font-medium mb-4">
            🇧🇩 ১০,০০০+ বাংলাদেশী ব্যবসায়ী ব্যবহার করছেন
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900">শুরু করুন আজই</h1>
          <p className="mt-2 text-gray-500 text-base max-w-md mx-auto">
            আপনার বাংলাদেশী ব্যবসাকে AI দিয়ে এগিয়ে নিন — মাত্র ৫ মিনিটে সেটআপ করুন।
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left — plan selection */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">আপনার প্ল্যান বেছে নিন</h2>
                  <p className="text-sm text-gray-500 mt-0.5">বার্ষিক বিলিংয়ে ২ মাস বিনামূল্যে পান</p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className={`font-medium ${!billingAnnual ? 'text-gray-900' : 'text-gray-400'}`}>মাসিক</span>
                  <Switch
                    checked={billingAnnual}
                    onCheckedChange={(value: boolean) => setBillingAnnual(value)}
                    aria-label="Toggle annual billing"
                    className="data-[state=checked]:bg-emerald-600"
                  />
                  <span className={`font-medium ${billingAnnual ? 'text-gray-900' : 'text-gray-400'}`}>বার্ষিক</span>
                  {billingAnnual && (
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                      ২ মাস ফ্রি
                    </span>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {subscriptionPlans.map((plan) => {
                  const isSelected = plan.id === selectedPlanId;
                  const price = getPlanPrice(plan, billingAnnual ? "yearly" : "monthly");
                  const isFree = plan.id === 'free';
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`flex flex-col rounded-2xl border-2 p-5 text-left transition-all duration-200 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50 shadow-md ring-1 ring-emerald-500/20'
                          : 'border-gray-150 bg-white hover:border-emerald-300 hover:shadow-sm'
                      }`}
                      style={{ borderColor: isSelected ? '#00A651' : undefined }}
                    >
                      <div className="flex items-start justify-between gap-1 mb-3">
                        <p className="text-base font-bold text-gray-900">{plan.name}</p>
                        {plan.popular && (
                          <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                            জনপ্রিয়
                          </span>
                        )}
                        {isFree && (
                          <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            বিনামূল্যে
                          </span>
                        )}
                      </div>

                      <div className="flex items-end gap-1 mb-1">
                        <span className="text-2xl font-extrabold text-gray-900">{formatPrice(price)}</span>
                        <span className="text-xs text-gray-400 pb-1">/মাস</span>
                      </div>
                      <p className="text-xs text-gray-400 mb-4">
                        {billingAnnual ? 'বার্ষিক বিল' : 'মাসিক বিল'}
                      </p>

                      <ul className="space-y-1.5 text-xs text-gray-600 flex-1">
                        {plan.highlights.map((feature) => (
                          <li key={feature} className="flex items-start gap-2">
                            <span className="mt-0.5 text-emerald-500 font-bold">✓</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {isSelected && (
                        <div className="mt-4 pt-3 border-t border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-1">
                          <span>✓</span> নির্বাচিত প্ল্যান
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BD features strip */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { icon: '🛡️', title: 'RTO Shield', desc: 'ভুয়া অর্ডার ব্লক' },
                { icon: '🚚', title: 'Pathao & Steadfast', desc: 'সরাসরি ডেলিভারি' },
                { icon: '💬', title: 'AI চ্যাটবট', desc: '২৪/৭ অটো রিপ্লাই' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="bg-white rounded-xl border border-gray-100 p-3 flex items-start gap-2.5">
                  <span className="text-xl">{icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{title}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — account form */}
          <div className="w-full lg:w-[400px] shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1">অ্যাকাউন্ট তৈরি করুন</h2>
              <p className="text-sm text-gray-500 mb-5">
                <span className="font-medium" style={{ color: '#00A651' }}>{selectedPlan.name}</span> প্ল্যান সক্রিয় করতে নিচে পূরণ করুন।
              </p>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                  <span>⚠️</span><span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700" htmlFor="fullName">
                    পূর্ণ নাম
                  </label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setFullName(event.target.value)}
                    placeholder="আপনার নাম লিখুন"
                    autoComplete="name"
                    disabled={isLoading}
                    className="h-11 rounded-xl border-gray-200 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700" htmlFor="email">
                    ইমেইল ঠিকানা
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={isLoading}
                    className="h-11 rounded-xl border-gray-200 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700" htmlFor="phone">
                    মোবাইল নম্বর
                    <span className="ml-1 text-xs text-gray-400 font-normal">(ঐচ্ছিক)</span>
                  </label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPhone(event.target.value)}
                    placeholder="+8801XXXXXXXXX"
                    autoComplete="tel"
                    disabled={isLoading}
                    className="h-11 rounded-xl border-gray-200 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700" htmlFor="password">
                    পাসওয়ার্ড
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
                    placeholder="শক্তিশালী পাসওয়ার্ড দিন"
                    autoComplete="new-password"
                    disabled={isLoading}
                    className="h-11 rounded-xl border-gray-200 focus:border-emerald-500"
                  />
                </div>

                {/* BD Payment section */}
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-semibold text-gray-700 mb-2">পেমেন্ট পদ্ধতি</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {[
                      { label: 'bKash', color: 'bg-pink-100 text-pink-700 border-pink-200' },
                      { label: 'Nagad', color: 'bg-orange-100 text-orange-700 border-orange-200' },
                      { label: 'SSL Commerz', color: 'bg-blue-100 text-blue-700 border-blue-200' },
                      { label: 'Rocket', color: 'bg-purple-100 text-purple-700 border-purple-200' },
                    ].map(({ label, color }) => (
                      <span key={label} className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${color}`}>
                        {label}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    🔜 বাংলাদেশী পেমেন্ট পদ্ধতি শীঘ্রই আসছে।{' '}
                    <span className="text-gray-500">Dev mode-এ কোনো চার্জ প্রযোজ্য নয়।</span>
                  </p>
                </div>

                {/* Terms */}
                <div className="flex items-start gap-2.5">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(value: boolean | "indeterminate") => setAcceptedTerms(value === true)}
                    disabled={isLoading}
                    className="mt-0.5 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                  />
                  <label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed">
                    আমি{' '}
                    <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="font-medium underline" style={{ color: '#00A651' }}>
                      গোপনীয়তা নীতি
                    </a>{' '}
                    ও শর্তাবলী পড়েছি এবং সম্মতি দিচ্ছি।
                  </label>
                </div>

                {/* Order summary */}
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>প্ল্যান</span>
                    <span className="font-semibold text-gray-900">{selectedPlan.name}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>বিলিং</span>
                    <span className="font-semibold text-gray-900">{billingAnnual ? 'বার্ষিক' : 'মাসিক'}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between">
                    <span className="text-gray-700 font-medium">আজ পেমেন্ট</span>
                    <span className="font-bold text-emerald-600">৳০ (Dev Mode)</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl text-white font-bold text-base shadow-md transition-all hover:shadow-lg hover:opacity-90 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #008040 0%, #00A651 100%)' }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      অ্যাকাউন্ট তৈরি হচ্ছে...
                    </span>
                  ) : (
                    'অ্যাকাউন্ট তৈরি করুন →'
                  )}
                </Button>
              </form>

              <div className="mt-4 text-center text-xs text-gray-400">
                🔒 আপনার তথ্য সম্পূর্ণ সুরক্ষিত
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
