import { Link } from "react-router-dom";

const features = [
  { icon: "🤖", title: "AI চ্যাট", desc: "কাস্টমারের প্রশ্নের স্বয়ংক্রিয় উত্তর", colorClass: "bg-blue-500/15 text-blue-400" },
  { icon: "📦", title: "অর্ডার ম্যানেজমেন্ট", desc: "চ্যাট থেকে সরাসরি অর্ডার তৈরি করুন", colorClass: "bg-emerald-500/15 text-emerald-400" },
  { icon: "🛡️", title: "RTO Shield", desc: "ভুয়া অর্ডার ফিল্টার করুন, ক্ষতি কমান", colorClass: "bg-orange-500/15 text-orange-400" },
  { icon: "🚚", title: "Pathao ইন্টিগ্রেশন", desc: "এক ক্লিকে ডেলিভারি বুক করুন", colorClass: "bg-purple-500/15 text-purple-400" },
  { icon: "📊", title: "Analytics", desc: "বিক্রয় ও কথোপকথনের বিস্তারিত রিপোর্ট", colorClass: "bg-cyan-500/15 text-cyan-400" },
  { icon: "📱", title: "সব চ্যানেল", desc: "Facebook, Instagram, WhatsApp একসাথে", colorClass: "bg-pink-500/15 text-pink-400" },
];

const plans = [
  {
    id: "free",
    name: "Free",
    price: "৳০",
    keyFeature: "বেসিক AI চ্যাট",
    popular: false,
    features: ["১০০ AI কথোপকথন/মাস", "৫০ অর্ডার/মাস", "বেসিক AI চ্যাট", "১টি চ্যানেল"],
  },
  {
    id: "growth",
    name: "Growth",
    price: "৳৯৯৯",
    keyFeature: "RTO Shield + Pathao",
    popular: true,
    features: ["১,০০০ AI কথোপকথন/মাস", "৫০০ অর্ডার/মাস", "RTO Shield সুরক্ষা", "Pathao ইন্টিগ্রেশন", "ইমেজ আন্ডারস্ট্যান্ডিং"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "৳২,৪৯৯",
    keyFeature: "সব চ্যানেল + Analytics",
    popular: false,
    features: ["৫,০০০ AI কথোপকথন/মাস", "২,০০০ অর্ডার/মাস", "সব চ্যানেল (FB, IG, WA)", "অ্যাডভান্সড Analytics", "প্রায়রিটি সাপোর্ট"],
  },
  {
    id: "business",
    name: "Business",
    price: "৳৫,৯৯৯",
    keyFeature: "White-label + API",
    popular: false,
    features: ["আনলিমিটেড কথোপকথন", "আনলিমিটেড অর্ডার", "White-label ব্র্যান্ডিং", "API অ্যাক্সেস", "ডেডিকেটেড সাপোর্ট ম্যানেজার"],
  },
];

const testimonials = [
  {
    quote: "EasyModerator ব্যবহার করার পর থেকে আমার শপের অর্ডার ৪০% বেড়েছে। কাস্টমাররা রাতেও উত্তর পায়!",
    name: "রাহেলা বেগম",
    location: "ঢাকা",
    shop: "Rahela Fashion House",
    avatar: "র",
    avatarColor: "bg-pink-500",
  },
  {
    quote: "RTO Shield আমার ব্যবসার সবচেয়ে বড় সমস্যা সমাধান করেছে। নকল অর্ডার এখন আর নেই বললেই চলে।",
    name: "করিম ভাই",
    location: "চট্টগ্রাম",
    shop: "Karim Electronics BD",
    avatar: "ক",
    avatarColor: "bg-blue-500",
  },
  {
    quote: "Pathao ইন্টিগ্রেশন দিয়ে ডেলিভারি বুকিং এখন অনেক সহজ। আগে ১ ঘন্টা লাগত, এখন ৫ মিনিট।",
    name: "সুমাইয়া আক্তার",
    location: "সিলেট",
    shop: "Sumaiya Lifestyle",
    avatar: "স",
    avatarColor: "bg-emerald-500",
  },
];

const gradientText: React.CSSProperties = {
  background: "linear-gradient(135deg, #60A5FA 0%, #34D399 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

export default function LandingPage() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Hind Siliguri', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');

        @keyframes orb-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 0.7; transform: scale(1.08); }
        }
        @keyframes badge-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        .orb { animation: orb-pulse 5s ease-in-out infinite; }
        .orb-delay { animation-delay: 2.5s; }
        .badge-dot { animation: badge-blink 2s ease-in-out infinite; }

        .hero-grid {
          background-image: radial-gradient(circle, rgba(37,99,235,0.18) 1px, transparent 1px);
          background-size: 30px 30px;
        }

        .feature-card { transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s; }
        .feature-card:hover { transform: translateY(-3px); border-color: #2563EB; box-shadow: 0 4px 20px rgba(37,99,235,0.10); }

        .plan-card { transition: transform 0.2s, box-shadow 0.2s; }
        .plan-card:hover { transform: translateY(-4px); }

        .testimonial-card { transition: box-shadow 0.2s; }
        .testimonial-card:hover { box-shadow: 0 8px 32px rgba(37,99,235,0.10); }
      `}</style>

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 select-none">
            <span className="text-2xl">🤖</span>
            <span className="text-xl font-bold text-gray-900">EasyModerator</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            {[
              { label: "Features", id: "features" },
              { label: "Pricing",  id: "pricing"  },
              { label: "Contact",  id: "contact"  },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
          <Link
            to="/signup"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            ফ্রি শুরু করুন
          </Link>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0F172A] hero-grid px-6 py-28 md:py-40">
        {/* Glowing orbs */}
        <div
          className="orb pointer-events-none absolute -left-40 -top-20 h-[500px] w-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(37,99,235,0.32) 0%, transparent 70%)" }}
        />
        <div
          className="orb orb-delay pointer-events-none absolute -bottom-20 -right-40 h-[500px] w-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(22,163,74,0.28) 0%, transparent 70%)" }}
        />

        <div className="relative mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-300">
            <span className="badge-dot h-2 w-2 rounded-full bg-blue-400" />
            আপনার ফেসবুক শপের AI সহকারী
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
            আপনার শপের{" "}
            <span style={gradientText}>২৪/৭ AI</span>
            <br />
            সহকারী
          </h1>

          {/* Sub-headline */}
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-300 md:text-xl">
            ফেসবুক, ইনস্টাগ্রাম ও WhatsApp-এ কাস্টমারদের সাথে AI দিয়ে কথা বলুন,
            অর্ডার নিন, ডেলিভারি ট্র্যাক করুন — সব এক জায়গায়।
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/signup"
              className="rounded-xl bg-blue-600 px-9 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 hover:shadow-blue-500/40 transition-all"
            >
              ফ্রি শুরু করুন →
            </Link>
            <Link
              to="/signin"
              className="rounded-xl border border-white/20 bg-white/5 px-9 py-4 text-base font-semibold text-white hover:bg-white/10 transition-all"
            >
              ডেমো দেখুন
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-12 border-t border-white/10 pt-10">
            {[
              { value: "৫০০+", label: "শপ ব্যবহার করছে" },
              { value: "৯৮%",  label: "গ্রাহক সন্তুষ্টি" },
              { value: "২৪/৭", label: "সাপোর্ট উপলব্ধ" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-white">{stat.value}</div>
                <div className="mt-1 text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section id="features" className="bg-white px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-600">Features</p>
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">কেন EasyModerator?</h2>
            <p className="mt-3 text-gray-500">বাংলাদেশের শপ অওনারদের জন্য বিশেষভাবে তৈরি</p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="feature-card rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${f.colorClass}`}>
                  {f.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{f.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────── */}
      <section id="pricing" className="bg-slate-50 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-600">Pricing</p>
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">সহজ মূল্য পরিকল্পনা</h2>
            <p className="mt-3 text-gray-500">আপনার ব্যবসার আকার অনুযায়ী প্ল্যান বেছে নিন</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`plan-card relative flex flex-col rounded-2xl p-6 ${
                  plan.popular
                    ? "border-2 border-blue-600 bg-white shadow-2xl shadow-blue-600/15"
                    : "border border-gray-200 bg-white shadow-sm"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <span className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md">
                      সবচেয়ে জনপ্রিয়
                    </span>
                  </div>
                )}

                <div className="mb-5 pt-1">
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-2 flex items-end gap-1">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="mb-1 text-sm text-gray-400">/মাস</span>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-blue-600">{plan.keyFeature}</p>
                </div>

                <ul className="mb-6 flex-1 space-y-2.5">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="mt-0.5 shrink-0 text-green-500">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/signup"
                  className={`block rounded-xl py-3 text-center text-sm font-semibold transition-all ${
                    plan.popular
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700"
                      : "border border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600"
                  }`}
                >
                  শুরু করুন
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────── */}
      <section className="bg-white px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-600">Testimonials</p>
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">শপ অওনাররা কী বলেন</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="testimonial-card rounded-2xl border border-gray-100 bg-white p-7 shadow-sm"
              >
                <p className="mb-1 text-5xl font-bold leading-none text-blue-100">"</p>
                <p className="mb-6 text-gray-700 leading-relaxed">{t.quote}</p>
                <div className="flex items-center gap-3">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${t.avatarColor}`}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.shop} · {t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0F172A] px-6 py-28">
        <div
          className="orb pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(37,99,235,0.25) 0%, transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            আজই শুরু করুন —{" "}
            <span style={gradientText}>ফ্রিতে</span>
          </h2>
          <p className="mb-10 text-xl text-slate-300">
            কোনো ক্রেডিট কার্ড লাগবে না। ৫ মিনিটে সেটআপ করুন।
          </p>
          <Link
            to="/signup"
            className="inline-block rounded-xl bg-blue-600 px-12 py-4 text-lg font-semibold text-white shadow-xl shadow-blue-600/30 hover:bg-blue-500 transition-all hover:shadow-blue-500/40"
          >
            ফ্রি অ্যাকাউন্ট খুলুন →
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer id="contact" className="border-t border-slate-800 bg-[#0F172A] px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🤖</span>
                <span className="text-lg font-bold text-white">EasyModerator</span>
              </div>
              <p className="mt-1 text-sm text-slate-400">আপনার ফেসবুক শপের AI সহকারী</p>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link to="/privacy-policy" className="text-slate-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/signin" className="text-slate-400 hover:text-white transition-colors">
                Sign In
              </Link>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-800 pt-6 text-center text-sm text-slate-500">
            © 2025 EasyModerator. সর্বস্বত্ব সংরক্ষিত।
          </div>
        </div>
      </footer>
    </div>
  );
}
