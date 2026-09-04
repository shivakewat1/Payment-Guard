import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, Sparkles, Zap, ShieldCheck, ArrowRight, 
  Building2, TrendingUp, Layers, Award, Calculator
} from 'lucide-react';

export default function PricingPage({ onSelectPlan }) {
  const [selectedBilling, setSelectedBilling] = useState('monthly'); // 'monthly' or 'annual'
  const [merchantMonthlyGMV, setMerchantMonthlyGMV] = useState(5000000); // Default ₹50 Lakhs

  const plans = [
    {
      id: 'performance',
      name: 'Pay-For-Performance',
      tagline: 'Zero Upfront Risk — Win-Win Model',
      badge: 'RISK FREE',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      price: '10%',
      priceSubtext: 'of recovered revenue only',
      description: 'Ideal for growing merchants. We only get paid when our AI successfully salvages your failed checkouts.',
      features: [
        '10% commission on recovered GMV only',
        'Minimum ₹100 per successful recovery',
        'Zero setup fee & zero fixed monthly retainer',
        'Automated Razorpay webhook ingestion',
        'Hinglish AI Voice & Smart NPCI switch enabled',
        'Standard email & dashboard support',
        'Pay-as-you-recover weekly billing'
      ],
      cta: 'Start Zero-Risk Recovery',
      popular: false,
      tierColor: 'border-slate-300 hover:border-emerald-400'
    },
    {
      id: 'professional',
      name: 'Professional Subscription',
      tagline: 'Predictable Flat Fee with 40% SLA',
      badge: 'MOST POPULAR',
      badgeColor: 'bg-orange-100 text-[#FF6A00] border-orange-200',
      price: selectedBilling === 'annual' ? '₹2,00,000' : '₹2,50,000',
      priceSubtext: selectedBilling === 'annual' ? '/month (billed annually)' : '/month — unlimited recoveries',
      description: 'For mid-market & scale-ups processing >₹50 Lakhs monthly. Unlimited recoveries with guaranteed recovery SLA.',
      features: [
        'Unlimited transactions & zero commission fees',
        '40% Minimum Recovery SLA Guarantee',
        'Priority queue for NPCI banking reroutes',
        'Real-time webhooks & customized Hinglish Voice scripts',
        'Executive Analytics & PDF Audit compliance exports',
        'Dedicated Slack channel & priority account manager',
        'Multi-mid Razorpay merchant support'
      ],
      cta: 'Start 14-Day Free Trial',
      popular: true,
      tierColor: 'border-[#FF6A00] shadow-md ring-2 ring-[#FF6A00]/20'
    },
    {
      id: 'enterprise',
      name: 'Enterprise Custom',
      tagline: 'High-Volume Tailored Infrastructure',
      badge: 'ENTERPRISE SLA',
      badgeColor: 'bg-slate-900 text-white border-slate-700',
      price: 'Custom',
      priceSubtext: 'Volume discount (6-8% or hybrid tier)',
      description: 'Custom SLA, dedicated infrastructure, white-label Hinglish AI voice, and custom multi-gateway failover routing.',
      features: [
        '50%+ Recovery SLA contractually backed',
        'Volume commission drops: 8% (>₹50L), 6% (>₹1Cr)',
        'Custom fine-tuned Claude 3.5 Sonnet diagnostic prompts',
        'White-labeled IVR caller ID and WhatsApp templates',
        '24/7 dedicated telephone & technical engineering support',
        'Custom NPCI & bank switch direct API integrations',
        'SOC2 & PCI-DSS Tier 1 compliance reports'
      ],
      cta: 'Talk to Founders',
      popular: false,
      tierColor: 'border-slate-300 hover:border-[#151515]'
    }
  ];

  // Estimator logic
  const currentGMV = Number(merchantMonthlyGMV) || 5000000;
  const estimatedFailuresValue = currentGMV * 0.03; // ~3% failure rate
  const estimatedRecoveredValue = estimatedFailuresValue * 0.56; // 56% recovery
  const commissionCost = Math.max(1000, estimatedRecoveredValue * 0.10);
  const proSubscriptionCost = selectedBilling === 'annual' ? 200000 : 250000;
  const recommendedTier = commissionCost > proSubscriptionCost ? 'Professional Subscription' : 'Pay-For-Performance';

  return (
    <div className="space-y-8 text-[#151515]">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-300 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold px-2.5 py-1 bg-orange-100 text-[#FF6A00] rounded-md border border-orange-200 uppercase">
                [BUSINESS MODEL & PRICING STRATEGY]
              </span>
              <span className="font-mono text-xs font-bold text-slate-500 uppercase">
                WIN-WIN MONETIZATION
              </span>
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tighter text-[#151515]">
              TRANSPARENT, <span className="text-[#FF6A00]">PERFORMANCE-BASED</span> PRICING
            </h1>
            <p className="text-sm text-slate-600 font-medium mt-1 max-w-2xl">
              Merchants only pay when we recover lost revenue. Zero upfront capital, predictable scale-up tiers, and guaranteed recovery SLAs.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-300 shrink-0 font-mono text-xs font-bold">
            <button
              onClick={() => setSelectedBilling('monthly')}
              className={`px-4 py-2 rounded-xl transition-all ${
                selectedBilling === 'monthly'
                  ? 'bg-[#151515] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#151515]'
              }`}
            >
              MONTHLY
            </button>
            <button
              onClick={() => setSelectedBilling('annual')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                selectedBilling === 'annual'
                  ? 'bg-[#FF6A00] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#151515]'
              }`}
            >
              <span>ANNUAL</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-white/20 rounded font-black">20% OFF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-3xl border-2 ${plan.tierColor} p-6 sm:p-8 flex flex-col justify-between relative shadow-sm transition-all`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#FF6A00] text-white font-mono text-[11px] font-extrabold uppercase rounded-full shadow-md">
                RECOMMENDED FOR SCALE
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`font-mono text-[11px] font-bold px-2.5 py-1 rounded-md border uppercase ${plan.badgeColor}`}>
                  {plan.badge}
                </span>
              </div>

              <h3 className="font-display font-black text-xl text-[#151515] uppercase tracking-tight">
                {plan.name}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5 mb-4">
                {plan.tagline}
              </p>

              <div className="border-y border-slate-200 py-4 my-4 font-mono">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-black text-[#151515] tracking-tight">{plan.price}</span>
                </div>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  {plan.priceSubtext}
                </p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                {plan.description}
              </p>

              <div className="space-y-2.5 mb-6 font-mono text-xs">
                {plan.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-slate-700 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                if (onSelectPlan) onSelectPlan(plan.id);
              }}
              className={`w-full py-3.5 rounded-xl font-mono text-xs font-extrabold uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                plan.popular
                  ? 'bg-[#FF6A00] hover:bg-[#e05d00] text-white shadow-orange-500/20'
                  : 'bg-[#151515] hover:bg-black text-white'
              }`}
            >
              <span>{plan.cta}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Interactive Tier Recommender Simulator */}
      <div className="bg-white rounded-3xl border border-slate-300 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="font-display font-black text-lg text-[#151515] uppercase tracking-tight flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#FF6A00]" />
              <span>WHICH PRICING TIER IS BEST FOR YOUR GMV?</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Slide your monthly transaction volume to see automated tier optimization and estimated net profit.
            </p>
          </div>
          <span className="font-mono text-xs font-bold px-3 py-1.5 bg-slate-100 text-[#151515] border border-slate-300 rounded-xl">
            OPTIMAL: <strong className="text-[#FF6A00]">{recommendedTier}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between font-mono">
              <span className="text-xs font-bold uppercase text-slate-700">Monthly Processed GMV:</span>
              <span className="text-2xl font-black text-[#151515] bg-slate-100 px-3 py-1 rounded-xl border border-slate-300">
                ₹{(currentGMV / 100000).toFixed(1)} Lakhs <span className="text-xs text-slate-500">/mo</span>
              </span>
            </div>

            <input
              type="range"
              min="500000"
              max="50000000"
              step="500000"
              value={merchantMonthlyGMV}
              onChange={(e) => setMerchantMonthlyGMV(parseInt(e.target.value, 10))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#FF6A00] focus:outline-none"
            />

            <div className="flex justify-between font-mono text-[11px] text-slate-400 font-bold">
              <span>₹5 Lakh (Startup)</span>
              <span>₹50 Lakh (Mid-Market)</span>
              <span>₹5 Crore (Enterprise)</span>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4 font-mono">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="text-[11px] text-slate-500 font-bold uppercase">Estimated Monthly Recovery</p>
              <p className="text-2xl font-black text-emerald-700 mt-1">
                ₹{Math.round(estimatedRecoveredValue).toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">56% of failed checkouts</p>
            </div>

            <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-200">
              <p className="text-[11px] text-orange-800 font-bold uppercase">PaymentGuard Fee</p>
              <p className="text-2xl font-black text-[#FF6A00] mt-1">
                ₹{Math.round(recommendedTier === 'Professional Subscription' ? proSubscriptionCost : commissionCost).toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {recommendedTier === 'Professional Subscription' ? 'Flat monthly plan' : '10% success fee only'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Comparison Matrix */}
      <div className="bg-white rounded-3xl border border-slate-300 p-6 sm:p-8 shadow-sm space-y-6 overflow-hidden">
        <h2 className="font-display font-black text-lg text-[#151515] uppercase tracking-tight flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#FF6A00]" />
          <span>DETAILED TIER COMPARISON MATRIX</span>
        </h2>

        <div className="overflow-x-auto -mx-6 sm:-mx-8 px-6 sm:px-8">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 text-slate-500">
                <th className="pb-3 uppercase font-extrabold w-1/3">Feature & Capability</th>
                <th className="pb-3 uppercase font-extrabold text-[#151515] w-1/5">Per-Recovery</th>
                <th className="pb-3 uppercase font-extrabold text-[#FF6A00] w-1/5">Professional (★)</th>
                <th className="pb-3 uppercase font-extrabold text-[#151515] w-1/5">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="py-3.5 font-bold text-[#151515]">Cost Model</td>
                <td className="py-3.5 text-slate-700">10% Success Fee</td>
                <td className="py-3.5 font-bold text-[#FF6A00]">Flat ₹2.5L / month</td>
                <td className="py-3.5 text-slate-700">Custom / 6-8% Volume</td>
              </tr>
              <tr>
                <td className="py-3.5 font-bold text-[#151515]">Recovery SLA Guarantee</td>
                <td className="py-3.5 text-slate-500">Best Effort</td>
                <td className="py-3.5 font-bold text-emerald-700">40% Guaranteed</td>
                <td className="py-3.5 font-bold text-emerald-700">50%+ Contractual SLA</td>
              </tr>
              <tr>
                <td className="py-3.5 font-bold text-[#151515]">Autonomous AI Voice (Hinglish)</td>
                <td className="py-3.5 text-slate-700">Standard Voice</td>
                <td className="py-3.5 font-bold text-[#151515]">Custom Scripts & Accents</td>
                <td className="py-3.5 font-bold text-[#151515]">White-labeled Caller ID</td>
              </tr>
              <tr>
                <td className="py-3.5 font-bold text-[#151515]">NPCI Switch & Multi-MID Routing</td>
                <td className="py-3.5 text-slate-700">Standard Routing</td>
                <td className="py-3.5 font-bold text-[#151515]">Priority Fast-Track Switch</td>
                <td className="py-3.5 font-bold text-[#151515]">Dedicated Direct Pipes</td>
              </tr>
              <tr>
                <td className="py-3.5 font-bold text-[#151515]">Support & SLA</td>
                <td className="py-3.5 text-slate-700">Email (24-48h)</td>
                <td className="py-3.5 font-bold text-[#151515]">Slack & Priority Account Mgr</td>
                <td className="py-3.5 font-bold text-[#151515]">24/7 Phone & Dedicated Eng</td>
              </tr>
              <tr>
                <td className="py-3.5 font-bold text-[#151515]">Compliance & Audit Trail</td>
                <td className="py-3.5 text-slate-700">Standard Dashboard</td>
                <td className="py-3.5 font-bold text-[#151515]">PDF ReportLab & Webhooks</td>
                <td className="py-3.5 font-bold text-[#151515]">SOC2 & Direct SIEM Stream</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Pitch to Judges Card: Startup Unit Economics */}
      <div className="bg-[#151515] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[10px] font-extrabold px-2 py-0.5 bg-orange-500 text-white rounded uppercase">
                VENTURE ECONOMICS
              </span>
              <span className="font-mono text-xs font-bold text-slate-400 uppercase">
                WHY THIS IS A PROFITABLE STARTUP
              </span>
            </div>
            <h2 className="font-display font-black text-xl text-white uppercase tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#FF6A00]" />
              <span>100-MERCHANT ARR PROJECTION (₹21.6 CR / YEAR)</span>
            </h2>
          </div>
          <div className="font-mono text-xs font-bold px-3.5 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xl">
            ~70% GROSS PROFIT MARGIN
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
            <span className="text-[11px] text-slate-400 font-bold uppercase">1. Win-Win Alignment</span>
            <p className="text-sm font-bold text-white">10% commission on salvaged funds</p>
            <p className="text-[11px] text-slate-400">Merchants gladly pay from found money they had already lost.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
            <span className="text-[11px] text-slate-400 font-bold uppercase">2. Subscription Lock-In</span>
            <p className="text-sm font-bold text-white">₹2.5 Lakh/month Flat Recurring</p>
            <p className="text-[11px] text-slate-400">20 high-volume enterprise merchants provide ₹50L/mo predictable MRR.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
            <span className="text-[11px] text-slate-400 font-bold uppercase">3. Low COGS / High Margin</span>
            <p className="text-sm font-bold text-white">₹15 Cr Net Profit (at 100 base)</p>
            <p className="text-[11px] text-slate-400">Low inference cost (Claude 3.5 Sonnet + Sarvam TTS) = 70%+ net margin.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
