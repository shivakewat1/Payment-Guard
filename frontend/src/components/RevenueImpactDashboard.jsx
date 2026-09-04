import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, DollarSign, ShieldAlert, ShieldCheck, Zap, 
  Sparkles, Calculator, Building2, Clock, Award, ArrowRight, 
  CheckCircle2, AlertTriangle, RefreshCw, Layers
} from 'lucide-react';
import { api } from '../services/api';

export default function RevenueImpactDashboard({ onGetStarted }) {
  const [failures, setFailures] = useState(100);
  const [avgTicket, setAvgTicket] = useState(10000);
  const [metrics, setMetrics] = useState(null);
  const [timeframe, setTimeframe] = useState('yearly'); // 'daily', 'monthly', 'yearly'
  const [loading, setLoading] = useState(false);
  
  // Custom Merchant Calculator State
  const [merchantName, setMerchantName] = useState('Myntra Direct');
  const [merchantFailures, setMerchantFailures] = useState(80);
  const [merchantAvgTicket, setMerchantAvgTicket] = useState(12000);
  const [merchantCurrentRate, setMerchantCurrentRate] = useState(25);
  const [merchantResult, setMerchantResult] = useState(null);
  const [activeTab, setActiveTab] = useState('calculator'); // 'calculator', 'custom_merchant'

  useEffect(() => {
    fetchImpactData(failures);
  }, [failures, avgTicket]);

  const fetchImpactData = async (failureCount) => {
    setLoading(true);
    try {
      const data = await api.fetchRevenueImpact(failureCount);
      const industryRecovered = Math.floor(failureCount * 0.25);
      const pgRecovered = Math.floor(failureCount * 0.56);
      const dailySaved = (pgRecovered - industryRecovered) * avgTicket;

      const fullData = {
        ...data,
        daily: {
          industry: (failureCount - industryRecovered) * avgTicket,
          paymentguard: (failureCount - pgRecovered) * avgTicket,
          uplift: dailySaved,
          recovered: pgRecovered,
          recoveredAmount: pgRecovered * avgTicket
        },
        monthly: {
          uplift: dailySaved * 30,
          recovered: pgRecovered * 30,
          recoveredAmount: pgRecovered * avgTicket * 30,
          industryLoss: (failureCount - industryRecovered) * avgTicket * 30
        },
        yearly: {
          uplift: dailySaved * 365,
          recovered: pgRecovered * 365,
          recoveredAmount: pgRecovered * avgTicket * 365,
          industryLoss: (failureCount - industryRecovered) * avgTicket * 365,
          roi: (((dailySaved * 365) - 1000000) / 1000000 * 100)
        }
      };
      setMetrics(fullData);
    } catch (err) {
      setMetrics(generateSampleMetrics(failureCount, avgTicket));
    } finally {
      setLoading(false);
    }
  };

  const generateSampleMetrics = (failureCount, ticket) => {
    const industryRecovered = Math.floor(failureCount * 0.25);
    const pgRecovered = Math.floor(failureCount * 0.56);
    const dailySaved = (pgRecovered - industryRecovered) * ticket;
    
    return {
      failures_detected: failureCount,
      industry_benchmark: {
        recovery_count: industryRecovered,
        recovery_rate: "25%",
        loss_amount: (failureCount - industryRecovered) * ticket,
        loss_formatted: `₹${((failureCount - industryRecovered) * ticket).toLocaleString('en-IN')}`
      },
      paymentguard: {
        recovery_count: pgRecovered,
        recovery_rate: "56%",
        loss_amount: (failureCount - pgRecovered) * ticket,
        loss_formatted: `₹${((failureCount - pgRecovered) * ticket).toLocaleString('en-IN')}`
      },
      daily: {
        industry: (failureCount - industryRecovered) * ticket,
        paymentguard: (failureCount - pgRecovered) * ticket,
        uplift: dailySaved,
        recovered: pgRecovered,
        recoveredAmount: pgRecovered * ticket
      },
      monthly: {
        uplift: dailySaved * 30,
        recovered: pgRecovered * 30,
        recoveredAmount: pgRecovered * ticket * 30,
        industryLoss: (failureCount - industryRecovered) * ticket * 30
      },
      yearly: {
        uplift: dailySaved * 365,
        recovered: pgRecovered * 365,
        recoveredAmount: pgRecovered * ticket * 365,
        industryLoss: (failureCount - industryRecovered) * ticket * 365,
        roi: (((dailySaved * 365) - 1000000) / 1000000 * 100)
      }
    };
  };

  const handleCalculateMerchant = async (e) => {
    if (e) e.preventDefault();
    const payload = {
      name: merchantName,
      daily_failures: parseInt(merchantFailures, 10),
      avg_transaction: parseInt(merchantAvgTicket, 10),
      current_recovery_rate: parseFloat(merchantCurrentRate) / 100
    };

    try {
      const res = await api.fetchMerchantImpact(payload);
      setMerchantResult(res);
    } catch (err) {
      const f = payload.daily_failures;
      const t = payload.avg_transaction;
      const r = payload.current_recovery_rate;
      const curRec = Math.floor(f * r);
      const pgRec = Math.floor(f * 0.56);
      const addRec = pgRec - curRec;
      const dailyUp = addRec * t;
      const yearlyUp = dailyUp * 365;

      setMerchantResult({
        merchant: payload.name,
        daily_failures: f,
        average_transaction: t,
        current_state: {
          recovery_rate: `${(r * 100).toFixed(1)}%`,
          recovered_daily: curRec,
          loss_daily: (f - curRec) * t,
          loss_formatted: `₹${((f - curRec) * t).toLocaleString('en-IN')}`
        },
        with_paymentguard: {
          recovery_rate: "56%",
          recovered_daily: pgRec,
          loss_daily: (f - pgRec) * t,
          loss_formatted: `₹${((f - pgRec) * t).toLocaleString('en-IN')}`
        },
        impact: {
          additional_recoveries_daily: addRec,
          revenue_uplift_daily: dailyUp,
          revenue_uplift_daily_formatted: `₹${dailyUp.toLocaleString('en-IN')}`,
          revenue_uplift_yearly: yearlyUp,
          revenue_uplift_yearly_formatted: `₹${yearlyUp.toLocaleString('en-IN')}`,
          improvement_percent: `${(((0.56 - r) / r) * 100).toFixed(1)}%`
        }
      });
    }
  };

  const formatCurrencyInLakhsCrores = (amount) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} Lakh`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  if (!metrics) {
    return (
      <div className="flex items-center justify-center p-12 bg-white rounded-3xl border border-slate-300 text-slate-700">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-[#FF6A00]" />
        <span className="font-mono text-xs font-bold uppercase">Calculating Real-Time ROI Engine...</span>
      </div>
    );
  }

  const dailyUplift = metrics.daily.uplift;
  const monthlyUplift = metrics.monthly.uplift;
  const yearlyUplift = metrics.yearly.uplift;
  const yearlyRecoveredTotal = metrics.yearly.recoveredAmount;
  const yearlyLossWithout = metrics.yearly.industryLoss;
  const roiValue = Math.max(0, Math.round(((yearlyUplift - 1000000) / 1000000) * 100));
  const paybackDays = dailyUplift > 0 ? (1000000 / dailyUplift).toFixed(1) : 0;

  // Chart data for daily comparison
  const comparisonChartData = [
    {
      name: 'Without PaymentGuard',
      Loss: Math.round(metrics.daily.industry / 1000),
      Recovery: Math.round((failures * 0.25 * avgTicket) / 1000),
    },
    {
      name: 'With PaymentGuard',
      Loss: Math.round(metrics.daily.paymentguard / 1000),
      Recovery: Math.round((failures * 0.56 * avgTicket) / 1000),
    }
  ];

  // Projected 12-month Cumulative Growth Data
  const monthlyProjectionData = Array.from({ length: 12 }, (_, i) => {
    const month = `M${i + 1}`;
    const cumulativeWithoutGuard = (metrics.monthly.industryLoss * (i + 1)) / 100000;
    const cumulativeRecovered = (monthlyUplift * (i + 1)) / 100000;
    return {
      month,
      "Cumulative Loss (₹L)": Math.round(cumulativeWithoutGuard),
      "Cumulative Recovered (₹L)": Math.round(cumulativeRecovered)
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 text-[#151515]"
    >
      {/* Editorial Header Card */}
      <div className="bg-white rounded-3xl border border-slate-300 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold px-2.5 py-1 bg-orange-100 text-[#FF6A00] rounded-md border border-orange-200 uppercase">
                [FINANCIAL IMPACT & ROI ENGINE]
              </span>
              <span className="font-mono text-xs font-bold text-slate-500 uppercase">
                TRACK 03 REVENUE MODEL
              </span>
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tighter text-[#151515]">
              REVENUE IMPACT <span className="text-[#FF6A00]">CALCULATOR</span>
            </h1>
            <p className="text-sm text-slate-600 font-medium mt-1 max-w-2xl">
              Compare status quo checkout abandonments against PaymentGuard's 56% autonomous recovery rate.
            </p>
          </div>

          {/* Sub-Tabs Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-300 shrink-0 font-mono text-xs font-bold">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'calculator'
                  ? 'bg-[#151515] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#151515] hover:bg-slate-200'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>CALCULATOR</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('custom_merchant');
                if (!merchantResult) handleCalculateMerchant();
              }}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'custom_merchant'
                  ? 'bg-[#151515] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#151515] hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>CUSTOM MERCHANT</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'calculator' && (
        <>
          {/* Dual Interactive Sliders */}
          <div className="bg-white rounded-3xl border border-slate-300 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <h2 className="font-display font-black text-lg text-[#151515] uppercase tracking-tight flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#FF6A00]" />
                <span>ADJUST BUSINESS PARAMETERS</span>
              </h2>

              {/* Timeframe selector pills */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-300 font-mono text-xs font-bold">
                {['daily', 'monthly', 'yearly'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3.5 py-1.5 rounded-lg uppercase transition-all ${
                      timeframe === tf
                        ? 'bg-[#FF6A00] text-white shadow-xs'
                        : 'text-slate-600 hover:text-[#151515]'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Slider 1: Failures */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-xs font-extrabold uppercase text-[#151515] flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-[#FF6A00]" />
                    DAILY FAILED TRANSACTIONS
                  </label>
                  <span className="font-mono text-xl font-black text-[#151515] px-3 py-1 bg-slate-100 border border-slate-300 rounded-xl">
                    {failures} <span className="text-xs text-slate-500 font-bold">tx/day</span>
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="5"
                  value={failures}
                  onChange={(e) => setFailures(parseInt(e.target.value, 10))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#FF6A00] focus:outline-none"
                />
                <div className="flex justify-between font-mono text-[11px] text-slate-400 font-bold">
                  <span>10 (Startup)</span>
                  <span>100 (Scale-up)</span>
                  <span>500 (Enterprise)</span>
                </div>
              </div>

              {/* Slider 2: Average Ticket Size */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-xs font-extrabold uppercase text-[#151515] flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-[#FF6A00]" />
                    AVERAGE TICKET SIZE (AOV)
                  </label>
                  <span className="font-mono text-xl font-black text-[#151515] px-3 py-1 bg-slate-100 border border-slate-300 rounded-xl">
                    ₹{avgTicket.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="50000"
                  step="1000"
                  value={avgTicket}
                  onChange={(e) => setAvgTicket(parseInt(e.target.value, 10))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#FF6A00] focus:outline-none"
                />
                <div className="flex justify-between font-mono text-[11px] text-slate-400 font-bold">
                  <span>₹1,000 (D2C)</span>
                  <span>₹10,000 (Mid-Market)</span>
                  <span>₹50,000 (B2B SaaS)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Before vs After Editorial Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* WITHOUT PAYMENTGUARD */}
            <div className="bg-white rounded-3xl border-2 border-red-200 p-6 sm:p-8 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">
                      ✕
                    </span>
                    <h3 className="font-display font-black text-lg text-red-700 uppercase tracking-tight">
                      WITHOUT PAYMENTGUARD
                    </h3>
                  </div>
                  <span className="font-mono text-[10px] font-bold px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded-md">
                    INDUSTRY DEFAULT
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-medium leading-relaxed mb-6">
                  60% of customers abandon completely. 40% manually struggle through slow merchant support tickets with 25% industry baseline recovery.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6 font-mono">
                  <div className="p-4 rounded-2xl bg-red-50/50 border border-red-200">
                    <p className="text-xs text-red-800 font-bold uppercase">Recovery Rate</p>
                    <p className="text-3xl font-black text-red-600 mt-1">25%</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">75% abandoned</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-red-50/50 border border-red-200">
                    <p className="text-xs text-red-800 font-bold uppercase">Daily Recovered</p>
                    <p className="text-3xl font-black text-red-600 mt-1">
                      {Math.floor(failures * 0.25)} <span className="text-xs font-normal text-slate-500">tx</span>
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">High support overhead</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-red-200 pt-4 bg-red-50/30 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-6 sm:p-8 rounded-b-3xl">
                <p className="font-mono text-xs uppercase font-extrabold text-red-800">
                  {timeframe} Revenue Lost Forever
                </p>
                <div className="font-mono text-4xl font-black text-red-600 tracking-tight mt-1">
                  {timeframe === 'daily' && formatCurrencyInLakhsCrores(metrics.daily.industry)}
                  {timeframe === 'monthly' && formatCurrencyInLakhsCrores(metrics.monthly.industryLoss)}
                  {timeframe === 'yearly' && formatCurrencyInLakhsCrores(yearlyLossWithout)}
                </div>
                <p className="font-mono text-[11px] text-red-700/80 font-semibold mt-1">
                  Daily: ₹{(metrics.daily.industry).toLocaleString('en-IN')} • Yearly: {formatCurrencyInLakhsCrores(yearlyLossWithout)}
                </p>
              </div>
            </div>

            {/* WITH PAYMENTGUARD */}
            <div className="bg-white rounded-3xl border-2 border-emerald-300 p-6 sm:p-8 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      ✓
                    </span>
                    <h3 className="font-display font-black text-lg text-emerald-800 uppercase tracking-tight">
                      WITH PAYMENTGUARD
                    </h3>
                  </div>
                  <span className="font-mono text-[10px] font-bold px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-md flex items-center gap-1">
                    <Zap className="w-3 h-3 text-emerald-600 fill-current" />
                    AUTONOMOUS AI
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-medium leading-relaxed mb-6">
                  Autonomous Hinglish Voice AI + Instant NPCI routing switches rescue checkouts in <strong>2.3 minutes average</strong> speed.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6 font-mono">
                  <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200">
                    <p className="text-xs text-emerald-800 font-bold uppercase">Recovery Rate</p>
                    <p className="text-3xl font-black text-emerald-700 mt-1">56%</p>
                    <p className="text-[10px] text-emerald-700 font-bold mt-0.5">+124% vs Industry</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200">
                    <p className="text-xs text-emerald-800 font-bold uppercase">Daily Recovered</p>
                    <p className="text-3xl font-black text-emerald-700 mt-1">
                      {Math.floor(failures * 0.56)} <span className="text-xs font-normal text-slate-500">tx</span>
                    </p>
                    <p className="text-[10px] text-emerald-700 font-bold mt-0.5">2.3 min recovery</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-emerald-200 pt-4 bg-emerald-50/40 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-6 sm:p-8 rounded-b-3xl">
                <p className="font-mono text-xs uppercase font-extrabold text-emerald-800">
                  {timeframe} Recovered Revenue
                </p>
                <div className="font-mono text-4xl font-black text-emerald-700 tracking-tight mt-1">
                  {timeframe === 'daily' && formatCurrencyInLakhsCrores(metrics.daily.recoveredAmount)}
                  {timeframe === 'monthly' && formatCurrencyInLakhsCrores(metrics.monthly.recoveredAmount)}
                  {timeframe === 'yearly' && formatCurrencyInLakhsCrores(yearlyRecoveredTotal)}
                </div>
                <p className="font-mono text-[11px] text-emerald-800 font-bold mt-1">
                  Net Incremental Uplift: {formatCurrencyInLakhsCrores(timeframe === 'daily' ? dailyUplift : timeframe === 'monthly' ? monthlyUplift : yearlyUplift)}
                </p>
              </div>
            </div>
          </div>

          {/* 3 Metric Editorial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl border border-slate-300 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-slate-500 uppercase">DAILY UPLIFT</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF6A00]" />
              </div>
              <div className="font-mono text-3xl font-black text-[#151515]">
                {formatCurrencyInLakhsCrores(dailyUplift)}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-2">
                +₹{(dailyUplift).toLocaleString('en-IN')}/day in incremental recovered capital
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-300 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-slate-500 uppercase">MONTHLY UPLIFT</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <div className="font-mono text-3xl font-black text-emerald-700">
                {formatCurrencyInLakhsCrores(monthlyUplift)}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-2">
                Adds ₹{(monthlyUplift).toLocaleString('en-IN')} straight to merchant bottom-line monthly
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-300 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-slate-500 uppercase">YEARLY ARR UPLIFT</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#151515]" />
              </div>
              <div className="font-mono text-3xl font-black text-[#FF6A00]">
                {formatCurrencyInLakhsCrores(yearlyUplift)}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-2">
                Compounded annual benefit of ₹{(yearlyUplift).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* ROI & Payback Dark Statement Card */}
          <div className="bg-[#151515] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="font-display font-black text-xl text-white uppercase tracking-tight flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#FF6A00]" />
                  <span>EXECUTIVE ROI & BREAKEVEN AUDIT</span>
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  Why PaymentGuard pays for itself virtually instantly with 2000%+ ROI
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>BREAKS EVEN IN ~{paybackDays} DAYS</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <p className="text-slate-400 text-xs uppercase font-bold">Annual System Cost</p>
                <p className="text-2xl font-black text-white mt-1">₹10,00,000</p>
                <p className="text-[10px] text-slate-500 mt-1">₹10 Lakh platform fee</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <p className="text-slate-400 text-xs uppercase font-bold">Annual Uplift</p>
                <p className="text-2xl font-black text-emerald-400 mt-1">
                  {formatCurrencyInLakhsCrores(yearlyUplift)}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">Gross salvaged GMV</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <p className="text-slate-400 text-xs uppercase font-bold">Net Year 1 Benefit</p>
                <p className="text-2xl font-black text-white mt-1">
                  {formatCurrencyInLakhsCrores(Math.max(0, yearlyUplift - 1000000))}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">Net profit after fee</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-[#FF6A00]/40">
                <p className="text-[#FF6A00] text-xs uppercase font-extrabold">Calculated ROI</p>
                <p className="text-3xl font-black text-[#FF6A00] mt-1">
                  {roiValue.toLocaleString()}%
                </p>
                <p className="text-[10px] text-slate-400 mt-1">Multiple: {(roiValue / 100).toFixed(1)}x return</p>
              </div>
            </div>
          </div>

          {/* Visual Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Daily Comparison Bar Chart */}
            <div className="bg-white rounded-3xl border border-slate-300 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-sm text-[#151515] uppercase tracking-tight">
                  DAILY LOSS VS RECOVERY (₹ IN THOUSANDS)
                </h3>
                <span className="font-mono text-xs text-slate-500 font-bold">DAILY</span>
              </div>

              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonChartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                    <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#151515', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontFamily: 'JetBrains Mono' }}
                      formatter={(val) => [`₹${val.toLocaleString()}K`, '']}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                    <Bar dataKey="Loss" fill="#ef4444" name="Unrecovered Loss (₹K)" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Recovery" fill="#10b981" name="Recovered Capital (₹K)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: 12-Month Cumulative Projection Area Chart */}
            <div className="bg-white rounded-3xl border border-slate-300 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-sm text-[#151515] uppercase tracking-tight">
                  12-MONTH CUMULATIVE REVENUE PROJECTION (₹ LAKHS)
                </h3>
                <span className="font-mono text-xs text-emerald-600 font-bold">ARR GROWTH</span>
              </div>

              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyProjectionData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorRecLight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.7}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                      </linearGradient>
                      <linearGradient id="colorLossLight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                    <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#151515', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontFamily: 'JetBrains Mono' }}
                      formatter={(val) => [`₹${val.toLocaleString()} Lakhs`, '']}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                    <Area type="monotone" dataKey="Cumulative Recovered (₹L)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRecLight)" />
                    <Area type="monotone" dataKey="Cumulative Loss (₹L)" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorLossLight)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Custom Merchant Simulator View */}
      {activeTab === 'custom_merchant' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Form */}
            <form onSubmit={handleCalculateMerchant} className="lg:col-span-5 bg-white rounded-3xl border border-slate-300 p-6 sm:p-7 space-y-4 shadow-sm">
              <h3 className="font-display font-black text-lg text-[#151515] uppercase tracking-tight flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#FF6A00]" />
                <span>MERCHANT PARAMETERS</span>
              </h3>
              
              <div>
                <label className="font-mono text-xs font-bold text-slate-700 block mb-1 uppercase">Merchant / Enterprise Name</label>
                <input
                  type="text"
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-[#151515] font-semibold text-sm focus:border-[#FF6A00] focus:bg-white focus:outline-none"
                  placeholder="e.g. Myntra Store, SaaS Pro"
                />
              </div>

              <div>
                <label className="font-mono text-xs font-bold text-slate-700 block mb-1 uppercase">
                  Daily Failed Checkouts: <span className="text-[#FF6A00] font-black">{merchantFailures}</span>
                </label>
                <input
                  type="number"
                  min="5"
                  max="2000"
                  value={merchantFailures}
                  onChange={(e) => setMerchantFailures(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-[#151515] font-mono text-sm focus:border-[#FF6A00] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-mono text-xs font-bold text-slate-700 block mb-1 uppercase">
                  Average Order Value (₹): <span className="text-[#FF6A00] font-black">₹{parseInt(merchantAvgTicket || 0, 10).toLocaleString('en-IN')}</span>
                </label>
                <input
                  type="number"
                  min="500"
                  max="500000"
                  step="500"
                  value={merchantAvgTicket}
                  onChange={(e) => setMerchantAvgTicket(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-[#151515] font-mono text-sm focus:border-[#FF6A00] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-mono text-xs font-bold text-slate-700 block mb-1 uppercase">
                  Current Manual Recovery Rate (%): <span className="text-red-600 font-black">{merchantCurrentRate}%</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={merchantCurrentRate}
                  onChange={(e) => setMerchantCurrentRate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-[#151515] font-mono text-sm focus:border-[#FF6A00] focus:bg-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#FF6A00] hover:bg-[#e05d00] text-white font-mono font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>CALCULATE MERCHANT ROI</span>
              </button>
            </form>

            {/* Merchant Output Card */}
            <div className="lg:col-span-7">
              {merchantResult ? (
                <div className="bg-white rounded-3xl border border-slate-300 p-6 sm:p-7 space-y-6 shadow-sm">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-[#FF6A00] uppercase bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                        CUSTOM AUDIT REPORT
                      </span>
                      <h4 className="font-display font-black text-2xl text-[#151515] mt-1">{merchantResult.merchant}</h4>
                    </div>
                    <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono text-xs font-bold">
                      +{merchantResult.impact?.improvement_percent} UPLIFT
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 font-mono">
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
                      <p className="text-xs text-red-800 font-bold uppercase">Current Daily Loss</p>
                      <p className="text-2xl font-black text-red-600 mt-1">
                        {merchantResult.current_state?.loss_formatted}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">Rate: {merchantResult.current_state?.recovery_rate}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                      <p className="text-xs text-emerald-800 font-bold uppercase">With PaymentGuard (56%)</p>
                      <p className="text-2xl font-black text-emerald-700 mt-1">
                        {merchantResult.with_paymentguard?.loss_formatted}
                      </p>
                      <p className="text-[10px] text-emerald-700 font-bold mt-1">Recovers {merchantResult.with_paymentguard?.recovered_daily} tx/day</p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-100 border border-slate-300 space-y-3 font-mono">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>DAILY REVENUE UPLIFT:</span>
                      <span className="text-lg font-black text-emerald-700">
                        {merchantResult.impact?.revenue_uplift_daily_formatted}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-300 pt-3">
                      <span className="text-xs font-extrabold text-[#151515]">YEARLY ADDITIONAL ARR:</span>
                      <span className="text-2xl font-black text-[#FF6A00]">
                        {merchantResult.impact?.revenue_uplift_yearly_formatted}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[300px] flex items-center justify-center rounded-3xl border border-dashed border-slate-300 p-8 text-slate-400 font-mono text-xs font-bold uppercase">
                  Click 'Calculate Merchant ROI' to generate report
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Footer Call to Action */}
      <div className="bg-[#151515] text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-slate-800">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-white flex items-center justify-center md:justify-start gap-2">
            <span>START RECOVERING LOST REVENUE TODAY</span>
            <Sparkles className="w-5 h-5 text-[#FF6A00]" />
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Connect Razorpay webhooks in 5 minutes. Autonomous, bounded AI with strict merchant safety caps.
          </p>
        </div>

        <button
          onClick={() => {
            if (onGetStarted) {
              onGetStarted();
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="px-8 py-3.5 bg-[#FF6A00] hover:bg-[#e05d00] text-white font-mono font-extrabold text-xs tracking-wider uppercase rounded-2xl shadow-lg hover:shadow-orange-500/30 transition-all shrink-0 flex items-center gap-2 cursor-pointer"
        >
          <span>EXECUTE RECOVERY PIPELINE</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
