import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ShieldAlert, CheckCircle2, Zap, RefreshCw } from 'lucide-react';

export default function MetricsCard({ metrics, loading }) {
  const atRisk = metrics?.input_metrics?.total_amount_at_risk || 2572335;
  const recovered = metrics?.recovery_metrics?.amount_recovered || 1315647;
  const recoveryRate = metrics?.recovery_metrics?.recovery_rate_percent || 56.0;
  const totalFailures = metrics?.input_metrics?.total_failures_detected || 100;
  const paymentsRecovered = metrics?.recovery_metrics?.payments_recovered || 56;
  const avgTime = metrics?.quality_metrics?.avg_recovery_time_minutes || 2.3;

  const cards = [
    {
      icon: <ShieldAlert className="w-5 h-5 text-[#FF6A00]" />,
      label: "TOTAL REVENUE AT RISK",
      value: `₹${atRisk.toLocaleString('en-IN')}`,
      subtext: `${totalFailures} failed payments detected`,
      trend: null,
      delay: 0,
      highlight: false,
    },
    {
      icon: <CheckCircle2 className="w-5 h-5 text-[#FF6A00]" />,
      label: "REVENUE RECOVERED",
      value: `₹${recovered.toLocaleString('en-IN')}`,
      subtext: `${paymentsRecovered} payments saved`,
      trend: { value: `+${paymentsRecovered} saved`, color: "orange" },
      delay: 0.1,
      highlight: true,
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-[#FF6A00]" />,
      label: "RECOVERY SUCCESS RATE",
      value: `${recoveryRate.toFixed(1)}%`,
      subtext: "Target benchmark: >45%",
      trend: { value: "+26% vs industry", color: "orange" },
      delay: 0.2,
      highlight: false,
    },
    {
      icon: <Zap className="w-5 h-5 text-[#FF6A00]" />,
      label: "AVG RECOVERY SPEED",
      value: `${avgTime} min`,
      subtext: "Bounded real-time latency",
      trend: { value: "Real-time", color: "dark" },
      delay: 0.3,
      highlight: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((c, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: c.delay, duration: 0.4 }}
          whileHover={{ 
            y: -3,
            boxShadow: "0 20px 35px rgba(0, 0, 0, 0.07)",
          }}
          className={`relative overflow-hidden rounded-2xl p-6 border transition-all duration-300 ${
            c.highlight
              ? 'bg-gradient-to-br from-white via-orange-50/40 to-white border-[#FF6A00]/40 shadow-md'
              : 'bg-white border-black/10 shadow-sm'
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#E9E9E9] border border-black/10 flex items-center justify-center shrink-0">
              {c.icon}
            </div>
            {c.trend && (
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                c.trend.color === 'orange'
                  ? 'bg-[#FF6A00]/15 text-[#FF6A00] border border-[#FF6A00]/30'
                  : 'bg-slate-200 text-[#151515]'
              }`}>
                {c.trend.value}
              </span>
            )}
          </div>

          <p className="text-[11px] text-[#555555] uppercase tracking-wider font-bold mb-1.5 font-sans">
            {c.label}
          </p>

          <motion.h3
            className="text-2xl sm:text-3xl font-bold text-[#151515] mb-1.5 font-mono tracking-tight"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: c.delay + 0.1, duration: 0.3 }}
          >
            {loading ? (
              <RefreshCw className="w-6 h-6 animate-spin text-[#FF6A00]" />
            ) : (
              c.value
            )}
          </motion.h3>

          <p className="text-xs text-[#555555] font-medium">{c.subtext}</p>
        </motion.div>
      ))}
    </div>
  );
}
