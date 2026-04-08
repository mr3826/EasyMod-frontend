import { Check, Zap, ArrowRight, MessageSquare, ShoppingCart, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { subscriptionPlans, type SubscriptionPlanDefinition } from "@/app/lib/subscriptionPlans";

const FEATURE_ROWS: { label: string; key: keyof SubscriptionPlanDefinition["features"] }[] = [
  { label: "Image Understanding", key: "image_understanding" },
  { label: "Advanced AI", key: "advanced_ai" },
  { label: "Priority Support", key: "priority_support" },
  { label: "Custom Branding (White-label)", key: "custom_branding" },
];

function PlanCard({
  plan,
  onSelect,
}: {
  plan: SubscriptionPlanDefinition;
  onSelect: () => void;
}) {
  const isFree = plan.monthlyPrice === 0;
  const isStarter = plan.id === "starter";
  const isPopular = plan.popular && !isStarter;

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 ${
        isStarter
          ? "border-green-500 bg-green-600 text-white shadow-xl shadow-green-200"
          : isPopular
          ? "border-blue-600 bg-blue-600 text-white shadow-xl shadow-blue-200"
          : "border-gray-200 bg-white"
      }`}
    >
      {isStarter && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
            নতুন সেলারদের জন্য
          </span>
        </div>
      )}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-4">
        <p className={`text-lg font-bold ${isStarter || isPopular ? "text-white" : "text-gray-900"}`}>
          {plan.name}
        </p>
        <p className={`text-sm mt-0.5 ${isStarter ? "text-green-100" : isPopular ? "text-blue-100" : "text-gray-500"}`}>
          {plan.description}
        </p>
      </div>

      <div className="mb-5">
        {isFree ? (
          <span className={`text-4xl font-extrabold ${isStarter || isPopular ? "text-white" : "text-gray-900"}`}>
            Free
          </span>
        ) : (
          <div className="flex items-end gap-1">
            <span className={`text-4xl font-extrabold ${isStarter || isPopular ? "text-white" : "text-gray-900"}`}>
              ৳{plan.monthlyPrice.toLocaleString()}
            </span>
            <span className={`text-sm mb-1 ${isStarter ? "text-green-100" : isPopular ? "text-blue-100" : "text-gray-500"}`}>/mo</span>
          </div>
        )}
        {!isFree && (
          <p className={`text-xs mt-1 ${isStarter ? "text-green-100" : isPopular ? "text-blue-100" : "text-gray-400"}`}>
            or ৳{plan.yearlyPrice.toLocaleString()}/yr · save 2 months free
          </p>
        )}
      </div>

      {/* Limits */}
      <div className={`rounded-xl p-3 mb-5 space-y-1.5 ${isStarter ? "bg-green-500" : isPopular ? "bg-blue-500" : "bg-gray-50"}`}>
        {[
          { icon: MessageSquare, label: plan.limits.conversations === -1 ? "Unlimited conversations" : `${plan.limits.conversations.toLocaleString()} conversations/mo` },
          { icon: ShoppingCart, label: plan.limits.orders === -1 ? "Unlimited orders" : `${plan.limits.orders.toLocaleString()} orders/mo` },
          { icon: Package, label: plan.limits.products === -1 ? "Unlimited products" : `${plan.limits.products.toLocaleString()} products` },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className={`flex items-center gap-2 text-sm ${isStarter || isPopular ? "text-white/90" : "text-gray-600"}`}>
            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
            {label}
          </div>
        ))}
      </div>

      {/* Features */}
      <ul className="space-y-2 flex-1 mb-6">
        {plan.highlights.map((h) => (
          <li key={h} className={`flex items-start gap-2 text-sm ${isStarter || isPopular ? "text-white/90" : "text-gray-600"}`}>
            <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isStarter || isPopular ? "text-white" : "text-green-600"}`} />
            {h}
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
          isStarter
            ? "bg-white text-green-700 hover:bg-green-50"
            : isPopular
            ? "bg-white text-blue-600 hover:bg-blue-50"
            : isFree
            ? "border border-gray-300 text-gray-700 hover:bg-gray-50"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {isFree ? "Get started free" : `Start ${plan.name}`}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Nav bar */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span
            className="text-xl font-bold text-blue-600 cursor-pointer"
            onClick={() => navigate("/")}
          >
            Easy Moderator
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/signin")}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Sign in
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="flex items-center gap-1.5 text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 font-medium"
            >
              <Zap className="w-3.5 h-3.5" />
              Get started
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            মসৃণ ও সৎ মূল্য নির্ধারণ
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            আপনার ব্যবসার আকার অনুযায়ী পরিকল্পনা বেছে নিন। কোনো লুকানো ফি নেই। Growth প্লানে অতিরিক্ত চ্যানেল ৳200/মাস। Partner প্লানে শুধুমাত্র ডেলিভারি অর্ডারে চার্জ।
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {subscriptionPlans.filter(p => p.id !== 'free').map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onSelect={() => navigate("/signup")}
            />
          ))}
        </div>

        {/* Feature comparison table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-16">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Full feature comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left p-4 text-sm font-semibold text-gray-600 w-48">Feature</th>
                  {subscriptionPlans.filter(p => p.id !== 'free').map((p) => (
                    <th key={p.id} className="text-center p-4 text-sm font-semibold text-gray-900">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURE_ROWS.map(({ label, key }) => (
                  <tr key={key} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm text-gray-700">{label}</td>
                    {subscriptionPlans.filter(p => p.id !== 'free').map((p) => (
                      <td key={p.id} className="p-4 text-center">
                        {p.features[key] ? (
                          <Check className="w-5 h-5 text-green-600 mx-auto" />
                        ) : (
                          <span className="text-gray-300 text-lg">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4 text-sm font-semibold text-gray-900">Growth এ অতিরিক্ত চ্যানেল</td>
                  <td className="p-4 text-center text-sm text-gray-500">—</td>
                  <td className="p-4 text-center text-sm text-gray-500">—</td>
                  <td className="p-4 text-center text-sm text-gray-500">৳200/মাস</td>
                  <td className="p-4 text-center text-sm text-gray-500">অন্তর্ভুক্ত</td>
                  <td className="p-4 text-center text-sm text-gray-500">অন্তর্ভুক্ত</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently asked questions</h2>
          {[
            { q: "কি যেকোনো সময় আপগ্রেড বা ডাউনগ্রেড করতে পারি?", a: "হাঁ। আপগ্রেড অবিলম্বে কার্যকর হয় আপনার বিলিং চক্রের বাকি অংশের জন্য proportinated চার্জ সহ। ডাউনগ্রেড পরবর্তী বিলিং তারিখে প্রযোজ্য।" },
            { q: "Growth প্লানে অতিরিক্ত চ্যানেল সংযোজন করতে কি খরচ হয়?", a: "হাঁ। প্রতিটি অতিরিক্ত চ্যানেল (4+ পর্যন্ত) মাসে ৳200 খরচ হয়। Scale প্লানে সব চ্যানেল অন্তর্ভুক্ত।" },
            { q: "Partner প্লানে কীভাবে চার্জ করা হয়?", a: "শুধুমাত্র ডেলিভার অর্ডারে চার্জ করা হয় প্রতিটিতে ৳22। বাতিল, RTO বা অপেক্ষমাণ অর্ডারে কোনো চার্জ নেই। সাপ্তাহিক চালান এবং 14 দিনের পেমেন্ট উইন্ডো।" },
            { q: "আমি কোন্ পেমেন্ট গেটওয়ে ব্যবহার করতে পারি?", a: "বকেইশ, নগদ, রকেট বা ক্যাশ অন ডেলিভারি। প্রিমিয়াম প্রবাহের জন্য আমাদের বিক্রয় দলের সাথে যোগাযোগ করুন।" },
            { q: "কি বিনামূল্যে ট্রায়াল আছে?", a: "নতুন শপ Starter প্ল্যানে শুরু করতে পারে অথবা Partner প্লান শূন্য মাসিক ফি সহ।" },
          ].map(({ q, a }) => (
            <div key={q} className="border-b border-gray-100 py-5">
              <p className="font-semibold text-gray-900 mb-1">{q}</p>
              <p className="text-gray-500 text-sm">{a}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 bg-blue-600 rounded-2xl p-10 text-center text-white">
          <h2 className="text-3xl font-extrabold mb-3">Ready to automate your shop?</h2>
          <p className="text-blue-100 mb-6">Start free. No credit card required.</p>
          <button
            onClick={() => navigate("/signup")}
            className="inline-flex items-center gap-2 bg-white text-blue-600 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors"
          >
            <Zap className="w-4 h-4" />
            Create your free account
          </button>
        </div>
      </main>

      <footer className="border-t border-gray-100 mt-16 py-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Easy Moderator &bull;{" "}
        <span className="cursor-pointer hover:text-gray-600" onClick={() => navigate("/privacy-policy")}>
          Privacy Policy
        </span>
      </footer>
    </div>
  );
}
