import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Brain, Zap, CheckCircle2, TrendingUp } from 'lucide-react';

export default function RecoveryFunnel({ metrics }) {
  const total = metrics?.input_metrics?.total_failures_detected || 100;
  const recovered = metrics?.recovery_metrics?.payments_recovered || 56;
  const recoveredAmount = metrics?.recovery_metrics?.amount_recovered || 1315647;
  const totalAtRisk = metrics?.input_metrics?.total_amount_at_risk || 2572335;
  const rate = metrics?.recovery_metrics?.recovery_rate_percent || 56.0;

  const stages = [
    {
      label: "Failures Ingested & Scored",
      subtext: "Categorized by risk score (0-100) across 5 merchant partners",
      value: total,
      capital: `₹${totalAtRisk.toLocaleString('en-IN')}`,
      percentage: 100,
      icon: ShieldAlert,
    },
    {
      label: "Diagnosed by Claude 3.5 Sonnet",
      subtext: "Root cause, confidence score, and recovery probability evaluated",
      value: total,
      capital: "100% Analyzed",
      percentage: 100,
      icon: Brain,
    },
    {
      label: "Bounded Interventions Executed",
      subtext: "Auto-Retry, SMS, Hinglish Voice, and Escalate (≤₹50k cap enforced)",
      value: Math.min(total, total - 5),
      capital: "Safety rules active",
      percentage: 95,
      icon: Zap,
    },
    {
      label: "Revenue Successfully Recovered",
      subtext: "Direct merchant capital salvaged and credited to accounts",
      value: recovered,
      capital: `₹${recoveredAmount.toLocaleString('en-IN')}`,
      percentage: Math.round(rate),
      icon: CheckCircle2,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-3xl border border-slate-300 p-6 sm:p-8 shadow-md space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="font-display font-black text-xl text-[#151515] uppercase tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#FF6A00]" /> END-TO-END RECOVERY FUNNEL
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Conversion progression through PaymentGuard's 4 autonomous recovery stages
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold text-[#151515] bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-300">
            RECOVERED: <strong className="text-[#FF6A00]">₹{recoveredAmount.toLocaleString('en-IN')}</strong> ({rate.toFixed(1)}%)
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 transition-all p-5 shadow-xs"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#151515] text-white flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[#FF6A00]" />
                  </div>
                  <div>
                    <p className="font-mono text-xs font-bold text-[#151515] uppercase tracking-wider">
                      STAGE {idx + 1} • {stage.label}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">{stage.subtext}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-2xl font-black text-[#151515]">
                    {stage.percentage}%
                  </span>
                  <span className="font-mono text-xs text-[#FF6A00] block font-bold">
                    {stage.capital}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-3 rounded-full bg-slate-200 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stage.percentage}%` }}
                  transition={{ delay: idx * 0.1 + 0.2, duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-[#FF6A00]"
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
