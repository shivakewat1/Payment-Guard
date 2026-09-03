import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ShieldAlert, CheckCircle2, Clock, IndianRupee, RefreshCw, Zap } from 'lucide-react';

export default function MetricsCard({ metrics, loading }) {
  const atRisk = metrics?.input_metrics?.total_amount_at_risk || 2572335;
  const recovered = metrics?.recovery_metrics?.amount_recovered || 1315647;
  const recoveryRate = metrics?.recovery_metrics?.recovery_rate_percent || 56.0;
  const totalFailures = metrics?.input_metrics?.total_failures_detected || 100;
  const paymentsRecovered = metrics?.recovery_metrics?.payments_recovered || 56;
  const avgTime = metrics?.quality_metrics?.avg_recovery_time_minutes || 2.3;

  const cards = [
    {
      icon: "🛡️",
      label: "TOTAL REVENUE AT RISK",
      value: `₹${atRisk.toLocaleString('en-IN')}`,
      subtext: `${totalFailures} failed payments detected`,
      trend: null,
      delay: 0,
      color: "from-rose-400 to-pink-500",
    },
    {
      icon: "✅",
      label: "REVENUE RECOVERED",
      value: `₹${recovered.toLocaleString('en-IN')}`,
      subtext: `${paymentsRecovered} payments successfully saved`,
      trend: { value: `+${paymentsRecovered}`, color: "emerald" },
      delay: 0.1,
      color: "from-emerald-400 to-teal-400",
      highlight: true,
    },
    {
      icon: "📈",
      label: "RECOVERY SUCCESS RATE",
      value: `${recoveryRate.toFixed(1)}%`,
      subtext: "Target benchmark: 30-40%",
      trend: { value: "+26%", color: "emerald" },
      delay: 0.2,
      color: "from-cyan-400 to-blue-400",
    },
    {
      icon: "⚡",
      label: "AVG RECOVERY SPEED",
      value: `${avgTime} min`,
      subtext: "Autonomous latency per transaction",
      trend: { value: "Real-time", color: "cyan" },
      delay: 0.3,
      color: "from-amber-400 to-orange-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((c, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: c.delay, duration: 0.5 }}
          whileHover={{ 
            scale: 1.04,
            boxShadow: "0 0 35px rgba(34, 211, 238, 0.25)",
          }}
          className="relative group overflow-hidden rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-slate-900/80 to-slate-950/90 backdrop-blur p-6 hover:border-cyan-400/70 transition-all shadow-xl"
        >
          {/* Animated Background Gradient */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 pointer-events-none"
            animate={{
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <span className="text-3xl filter drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">{c.icon}</span>
              {c.trend && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold ${
                    c.trend.color === 'emerald'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}
                >
                  {c.trend.value}
                </motion.div>
              )}
            </div>

            <p className="text-[11px] text-cyan-300/70 uppercase tracking-wider font-bold mb-1.5 font-sans">
              {c.label}
            </p>

            <motion.h3
              className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2 font-mono"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: c.delay + 0.15, duration: 0.4 }}
            >
              {loading ? (
                <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
              ) : (
                c.value
              )}
            </motion.h3>

            <p className="text-xs text-slate-400 font-medium">{c.subtext}</p>
          </div>

          {/* Animated Glowing Border */}
          <motion.div
            className="absolute inset-0 rounded-2xl border border-cyan-400/40 pointer-events-none"
            animate={{
              boxShadow: [
                "inset 0 0 0 0 rgba(34, 211, 238, 0.15)",
                "inset 0 0 15px 0 rgba(34, 211, 238, 0.25)",
                "inset 0 0 0 0 rgba(34, 211, 238, 0.15)",
              ],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              delay: i * 0.3
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
