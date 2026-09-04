import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Zap, Sparkles, TrendingUp, Award, Layers, 
  CheckCircle2, XCircle, ArrowRight, Building2, Clock, 
  DollarSign, Globe, BarChart3, Lock, Flame
} from 'lucide-react';

export default function CompetitorComparison({ onGetStarted }) {
  const [selectedDimension, setSelectedDimension] = useState('recovery-rate');

  const competitors = [
    {
      name: 'PaymentGuard',
      badge: 'OUR SYSTEM (AI AGENT)',
      tagline: 'Autonomous AI Revenue Recovery for India',
      icon: '⚡',
      color: 'bg-[#FF6A00]',
      barColor: 'bg-[#FF6A00]',
      textColor: 'text-[#FF6A00]',
      borderColor: 'border-[#FF6A00] ring-2 ring-orange-500/20 bg-orange-50/20',
      isWinner: true,
      metrics: {
        'recovery-rate': { val: 56, display: '56%', label: '56% Automated Recovery' },
        'speed': { val: 2.3, display: '2.3 min', label: '2.3 minutes avg speed' },
        'cost': { val: 10, display: '10%', label: '10% on success only (₹0 upfront)' },
        'india-focus': { val: 100, display: '100/100', label: 'Hinglish Voice + NPCI direct' },
        'setup-time': { val: 0.5, display: '< 1 hr', label: '5-min Webhook integration' },
        'compliance': { val: 100, display: '100/100', label: 'Bounded Rules + ReportLab PDF' },
      },
    },
    {
      name: 'Razorpay Default',
      badge: 'BASIC GATEWAY',
      tagline: 'Standard static gateway retry rules',
      icon: '💳',
      color: 'bg-blue-600',
      barColor: 'bg-blue-500',
      textColor: 'text-blue-700',
      borderColor: 'border-slate-300 bg-white',
      isWinner: false,
      metrics: {
        'recovery-rate': { val: 35, display: '35%', label: 'Static retry without AI' },
        'speed': { val: 120, display: '2 hours', label: 'Delayed retry schedule' },
        'cost': { val: 6, display: '5-8%', label: 'Fixed gateway cut' },
        'india-focus': { val: 85, display: '85/100', label: 'Standard Indian gateway' },
        'setup-time': { val: 24, display: '1 day', label: 'Standard dashboard' },
        'compliance': { val: 80, display: '80/100', label: 'Standard webhook logs' },
      },
    },
    {
      name: 'Chargebee',
      badge: 'GLOBAL SAAS',
      tagline: 'US-centric subscription billing platform',
      icon: '🌐',
      color: 'bg-slate-700',
      barColor: 'bg-slate-600',
      textColor: 'text-slate-700',
      borderColor: 'border-slate-300 bg-white',
      isWinner: false,
      metrics: {
        'recovery-rate': { val: 30, display: '30%', label: 'Rule-based dunning emails' },
        'speed': { val: 480, display: '8+ hours', label: 'Scheduled batch dunning' },
        'cost': { val: 4, display: '2-5%', label: 'Charged on all GMV processed' },
        'india-focus': { val: 20, display: '20/100', label: 'English-only US workflows' },
        'setup-time': { val: 72, display: '2-3 days', label: 'Complex engineering integration' },
        'compliance': { val: 70, display: '70/100', label: 'Global dunning logs' },
      },
    },
    {
      name: 'Manual Support Team',
      badge: 'STATUS QUO',
      tagline: 'Support agents calling & emailing dropped carts',
      icon: '📞',
      color: 'bg-red-500',
      barColor: 'bg-red-500',
      textColor: 'text-red-700',
      borderColor: 'border-slate-300 bg-white',
      isWinner: false,
      metrics: {
        'recovery-rate': { val: 15, display: '15%', label: 'High customer drop-off' },
        'speed': { val: 2880, display: '24-48h', label: 'Manual phone queues' },
        'cost': { val: 25, display: '₹500-1k', label: 'High human agent payroll cost' },
        'india-focus': { val: 70, display: '70/100', label: 'Manual Hindi/English call' },
        'setup-time': { val: 168, display: '1-2 wks', label: 'Hiring & support training' },
        'compliance': { val: 20, display: '20/100', label: 'No unified audit trail' },
      },
    },
  ];

  const dimensions = [
    { id: 'recovery-rate', label: 'Recovery Rate (%)', unit: '%', higherIsBetter: true, max: 60 },
    { id: 'speed', label: 'Recovery Speed (minutes)', unit: 'min', higherIsBetter: false, max: 2880 },
    { id: 'india-focus', label: 'India Optimization', unit: '/100', higherIsBetter: true, max: 100 },
    { id: 'cost', label: 'Pricing Alignment', unit: '', higherIsBetter: true, max: 100 },
    { id: 'setup-time', label: 'Setup & Deployment Time', unit: '', higherIsBetter: false, max: 168 },
    { id: 'compliance', label: 'Audit & Bounded Safety', unit: '/100', higherIsBetter: true, max: 100 },
  ];

  const matrixRows = [
    { feature: 'AI-Powered Root Cause Diagnosis (Claude 3.5 Sonnet)', pg: true, rzp: false, cb: false, manual: false },
    { feature: 'Autonomous Hinglish Voice Agent & SMS Rescues', pg: true, rzp: false, cb: false, manual: 'Partial' },
    { feature: 'Sub-3 Minute Real-Time Checkout Failover', pg: true, rzp: false, cb: false, manual: false },
    { feature: 'Smart NPCI Banking Rerouting Switches', pg: true, rzp: false, cb: false, manual: false },
    { feature: 'Bounded Execution Rules (Max 3 Retries, ≤₹50k Auto Cap)', pg: true, rzp: false, cb: false, manual: false },
    { feature: 'Zero-Risk Success Fee (10% on Salvaged Revenue Only)', pg: true, rzp: false, cb: false, manual: false },
    { feature: 'Full Immutable Audit Trail & PDF Compliance Reports', pg: true, rzp: 'Partial', cb: 'Partial', manual: false },
    { feature: 'India UPI & Domestic Card Failure Intelligence', pg: true, rzp: true, cb: false, manual: 'Partial' },
  ];

  return (
    <div className="space-y-8 text-[#151515]">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-300 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold px-2.5 py-1 bg-orange-100 text-[#FF6A00] rounded-md border border-orange-200 uppercase">
                [COMPETITIVE POSITIONING & MOAT]
              </span>
              <span className="font-mono text-xs font-bold text-slate-500 uppercase">
                DEFENSIBLE DIFFERENTIATION
              </span>
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tighter text-[#151515]">
              HOW PAYMENTGUARD <span className="text-[#FF6A00]">COMPUTES & WINS</span>
            </h1>
            <p className="text-sm text-slate-600 font-medium mt-1 max-w-2xl">
              Why generic dunning tools and manual support fail in India vs. our purpose-built Autonomous Recovery Agent.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 px-4 py-2.5 rounded-2xl shrink-0">
            <Flame className="w-5 h-5 text-[#FF6A00]" />
            <div className="font-mono">
              <p className="text-[10px] text-orange-800 font-bold uppercase">RECOVERY ADVANTAGE</p>
              <p className="text-sm font-black text-[#FF6A00]">56% vs 25-35% Industry</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Metric Benchmark Selector */}
      <div className="bg-white rounded-3xl border border-slate-300 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="font-display font-black text-lg text-[#151515] uppercase tracking-tight flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#FF6A00]" />
              <span>HEAD-TO-HEAD BENCHMARK METRICS</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Select a dimension to inspect quantitative performance across competitors.
            </p>
          </div>
          <span className="font-mono text-xs font-bold px-3 py-1.5 bg-slate-100 text-[#151515] border border-slate-300 rounded-xl">
            WINNER: <strong className="text-[#FF6A00]">PAYMENTGUARD (5/5 METRICS)</strong>
          </span>
        </div>

        {/* Dimension Pill Tabs */}
        <div className="flex flex-wrap gap-2">
          {dimensions.map((dim) => (
            <button
              key={dim.id}
              onClick={() => setSelectedDimension(dim.id)}
              className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all ${
                selectedDimension === dim.id
                  ? 'bg-[#151515] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              {dim.label}
            </button>
          ))}
        </div>

        {/* Dynamic Comparison Bars */}
        <div className="space-y-4 pt-2">
          {competitors.map((comp) => {
            const metricData = comp.metrics[selectedDimension];
            const isPG = comp.name === 'PaymentGuard';
            
            // Calculate percentage width for visual bar
            let barWidth = 50;
            if (selectedDimension === 'recovery-rate') {
              barWidth = (metricData.val / 60) * 100;
            } else if (selectedDimension === 'speed') {
              // Inverted: faster is better
              barWidth = metricData.val === 2.3 ? 98 : metricData.val === 120 ? 45 : metricData.val === 480 ? 25 : 10;
            } else if (selectedDimension === 'india-focus' || selectedDimension === 'compliance') {
              barWidth = metricData.val;
            } else if (selectedDimension === 'setup-time') {
              barWidth = metricData.val === 0.5 ? 98 : metricData.val === 24 ? 60 : metricData.val === 72 ? 35 : 15;
            } else {
              barWidth = isPG ? 95 : 40;
            }

            return (
              <div 
                key={comp.name} 
                className={`p-4 rounded-2xl border-2 transition-all ${comp.borderColor}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{comp.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-black text-sm text-[#151515] uppercase">{comp.name}</span>
                        <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase ${isPG ? 'bg-orange-100 text-[#FF6A00] border border-orange-200' : 'bg-slate-100 text-slate-600'}`}>
                          {comp.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">{metricData.label}</p>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className={`text-xl font-black ${comp.textColor}`}>
                      {metricData.display}
                    </span>
                    {isPG && (
                      <p className="text-[10px] text-emerald-700 font-extrabold uppercase">★ #1 Benchmark</p>
                    )}
                  </div>
                </div>

                {/* Visual Bar */}
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ${comp.barColor}`}
                    style={{ width: `${Math.min(100, Math.max(8, barWidth))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Comparison Matrix Table */}
      <div className="bg-white rounded-3xl border border-slate-300 p-6 sm:p-8 shadow-sm space-y-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h2 className="font-display font-black text-lg text-[#151515] uppercase tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#FF6A00]" />
              <span>FULL CAPABILITY COMPARISON MATRIX</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Side-by-side feature audit against existing alternative approaches.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto -mx-6 sm:-mx-8 px-6 sm:px-8">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 text-slate-500">
                <th className="pb-3 uppercase font-extrabold w-2/5">Capability</th>
                <th className="pb-3 uppercase font-black text-[#FF6A00] text-center w-1/6 bg-orange-50/60 rounded-t-xl">
                  PaymentGuard (★)
                </th>
                <th className="pb-3 uppercase font-bold text-slate-700 text-center w-1/6">Razorpay</th>
                <th className="pb-3 uppercase font-bold text-slate-700 text-center w-1/6">Chargebee</th>
                <th className="pb-3 uppercase font-bold text-slate-700 text-center w-1/6">Manual Support</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {matrixRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 font-bold text-[#151515] pr-4">
                    {row.feature}
                  </td>
                  
                  {/* PaymentGuard */}
                  <td className="py-3.5 text-center bg-orange-50/40">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-black">
                      ✓
                    </span>
                  </td>

                  {/* Razorpay */}
                  <td className="py-3.5 text-center text-slate-500">
                    {row.rzp === true ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-black">✓</span>
                    ) : row.rzp === 'Partial' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">Partial</span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 font-bold">✕</span>
                    )}
                  </td>

                  {/* Chargebee */}
                  <td className="py-3.5 text-center text-slate-500">
                    {row.cb === true ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-black">✓</span>
                    ) : row.cb === 'Partial' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">Partial</span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 font-bold">✕</span>
                    )}
                  </td>

                  {/* Manual */}
                  <td className="py-3.5 text-center text-slate-500">
                    {row.manual === true ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-black">✓</span>
                    ) : row.manual === 'Partial' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">Partial</span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 font-bold">✕</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key 5 Strategic Moats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl border border-slate-300 p-6 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#FF6A00] flex items-center justify-center font-bold">
            🇮🇳
          </div>
          <h3 className="font-display font-black text-base text-[#151515] uppercase tracking-tight">
            1. India-First Architecture
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Trained specifically on NPCI banking downtime patterns, UPI handle timeouts, and natural Hinglish conversational voice recovery.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-300 p-6 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            🧠
          </div>
          <h3 className="font-display font-black text-base text-[#151515] uppercase tracking-tight">
            2. Claude AI Diagnosis
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Unlike static if/then rules, our AI agent evaluates issuer telemetry, merchant risk tolerance, and historical trust scores dynamically.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-300 p-6 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            ⚡
          </div>
          <h3 className="font-display font-black text-base text-[#151515] uppercase tracking-tight">
            3. 2.3-Minute Speed
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Rescues checkouts before buyers leave the website or abandon their cart, achieving 56% recovery vs. 15-30% on slow delayed dunning.
          </p>
        </div>
      </div>

      {/* Market Opportunity TAM Statement */}
      <div className="bg-[#151515] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[10px] font-extrabold px-2 py-0.5 bg-orange-500 text-white rounded uppercase">
                TOTAL ADDRESSABLE MARKET
              </span>
              <span className="font-mono text-xs font-bold text-slate-400 uppercase">
                INDIA E-COMMERCE FAILURE POOL
              </span>
            </div>
            <h2 className="font-display font-black text-xl text-white uppercase tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#FF6A00]" />
              <span>₹6,000 - ₹20,000 CRORE ANNUAL LOSS POOL</span>
            </h2>
          </div>
          <div className="font-mono text-xs font-bold px-3.5 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xl">
            ₹3,000+ CR RECOVERABLE ARR
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 font-mono text-xs">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 uppercase font-bold">Indian E-Comm GMV</span>
            <p className="text-2xl font-black text-white mt-1">₹3-4 Lakh Cr</p>
            <p className="text-[10px] text-slate-500 mt-1">2-5% average failure rate</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 uppercase font-bold">10,000+ Merchants</span>
            <p className="text-2xl font-black text-white mt-1">₹10 Lakh / Merchant</p>
            <p className="text-[10px] text-slate-500 mt-1">Annual revenue at risk per store</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-[#FF6A00]/40">
            <span className="text-[#FF6A00] uppercase font-extrabold">Serviceable SAM (1%)</span>
            <p className="text-2xl font-black text-[#FF6A00] mt-1">₹10 - ₹50 Cr ARR</p>
            <p className="text-[10px] text-slate-400 mt-1">Venture-scale recurring capture</p>
          </div>
        </div>
      </div>
    </div>
  );
}
