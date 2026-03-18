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
        "commerceai_selected_plan",
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
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <div className="flex-1">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600" />
                <span className="text-3xl font-bold text-gray-900">Easy Moderator</span>
              </div>
              <p className="mt-4 text-lg text-gray-600">
                Choose a subscription plan and create your account to launch Easy Moderator.
              </p>
              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                Dev mode active: payments are simulated. This flow mirrors production checkout, but no
                actual charges are processed.
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Select your plan</h2>
                  <p className="text-sm text-gray-500">Switch billing to see the best value.</p>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className={!billingAnnual ? "font-semibold text-gray-900" : ""}>Monthly</span>
                  <Switch
                    checked={billingAnnual}
                    onCheckedChange={(value: boolean) => setBillingAnnual(value)}
                    aria-label="Toggle annual billing"
                  />
                  <span className={billingAnnual ? "font-semibold text-gray-900" : ""}>Annual</span>
                  <Badge className="bg-emerald-100 text-emerald-700">2 months free</Badge>
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {subscriptionPlans.map((plan) => {
                  const isSelected = plan.id === selectedPlanId;
                  const price = getPlanPrice(plan, billingAnnual ? "yearly" : "monthly");
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`flex h-full flex-col rounded-xl border p-5 text-left transition ${isSelected
                        ? "border-blue-600 bg-blue-50 shadow-sm"
                        : "border-gray-200 bg-white hover:border-blue-300"
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-lg font-semibold text-gray-900">{plan.name}</p>
                          <p className="text-sm text-gray-500">{plan.description}</p>
                        </div>
                        {plan.popular && (
                          <Badge className="bg-purple-100 text-purple-700">Popular</Badge>
                        )}
                      </div>
                      <div className="mt-4 flex items-end gap-2">
                        <span className="text-3xl font-bold text-gray-900">{formatPrice(price)}</span>
                        <span className="text-sm text-gray-500">/mo</span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {billingAnnual ? "Billed annually" : "Billed monthly"}
                      </p>
                      <ul className="mt-4 space-y-2 text-sm text-gray-600">
                        {plan.highlights.map((feature) => (
                          <li key={feature} className="flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-600" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      {isSelected && (
                        <div className="mt-auto pt-4 text-sm font-medium text-blue-700">
                          Selected plan
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="w-full max-w-lg">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Create your account</h2>
                <p className="text-sm text-gray-500">
                  Finish signup to activate the {selectedPlan.name} plan.
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="fullName">
                    Full name
                  </label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setFullName(event.target.value)
                    }
                    placeholder="Jane Smith"
                    autoComplete="name"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="email">
                    Work email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@company.com"
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="phone">
                    Phone (optional)
                  </label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setPhone(event.target.value)
                    }
                    placeholder="+1 555 000 0000"
                    autoComplete="tel"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="password">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Create a secure password"
                    autoComplete="new-password"
                    disabled={isLoading}
                  />
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                  <p className="font-medium text-gray-800">Payment method (simulated)</p>
                  <p className="mt-1">
                    In production, billing details would be captured here. In dev mode, payments are
                    skipped and no charge is applied.
                  </p>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <Input placeholder="Card number" disabled />
                    <Input placeholder="MM / YY" disabled />
                    <Input placeholder="CVC" disabled />
                    <Input placeholder="Postal code" disabled />
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(value: boolean | "indeterminate") =>
                      setAcceptedTerms(value === true)
                    }
                    disabled={isLoading}
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    I agree to the Terms of Service and{" "}
                    <a
                      href="/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Privacy Policy
                    </a>
                    .
                  </label>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Plan</span>
                    <span className="font-medium text-gray-900">{selectedPlan.name}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span>Billing</span>
                    <span className="font-medium text-gray-900">
                      {billingAnnual ? "Annual" : "Monthly"}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span>Amount due today</span>
                    <span className="font-medium text-emerald-600">৳0 (dev mode)</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Start with selected plan"}
                </Button>
              </form>

              <div className="mt-5 text-center text-sm text-gray-500">
                Already have an account?{" "}
                <Link to="/signin" className="font-medium text-blue-600 hover:text-blue-700">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
