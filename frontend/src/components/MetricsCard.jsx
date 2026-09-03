import React from 'react';
import { TrendingUp, ShieldAlert, CheckCircle2, Clock, IndianRupee, RefreshCw } from 'lucide-react';

export default function MetricsCard({ metrics, loading }) {
  const atRisk = metrics?.input_metrics?.total_amount_at_risk || 0;
  const recovered = metrics?.recovery_metrics?.amount_recovered || 0;
  const recoveryRate = metrics?.recovery_metrics?.recovery_rate_percent || 0;
  const totalFailures = metrics?.input_metrics?.total_failures_detected || 0;
  const paymentsRecovered = metrics?.recovery_metrics?.payments_recovered || 0;
  const avgTime = metrics?.quality_metrics?.avg_recovery_time_minutes || 2.3;

  const cards = [
    {
      title: "Total Revenue at Risk",
      value: `₹${atRisk.toLocaleString('en-IN')}`,
      subtitle: `${totalFailures} failed transactions detected`,
      icon: ShieldAlert,
      color: "text-rose-400",
      bgGlow: "rgba(244, 63, 94, 0.15)",
      borderColor: "border-rose-500/30"
    },
    {
      title: "Revenue Recovered",
      value: `₹${recovered.toLocaleString('en-IN')}`,
      subtitle: `${paymentsRecovered} payments successfully saved`,
      icon: IndianRupee,
      color: "text-emerald-400",
      bgGlow: "rgba(16, 185, 129, 0.15)",
      borderColor: "border-emerald-500/30",
      highlight: true
    },
    {
      title: "Recovery Rate",
      value: `${recoveryRate.toFixed(1)}%`,
      subtitle: `Target: 30-40% benchmark`,
      icon: TrendingUp,
      color: "text-brand-400",
      bgGlow: "rgba(14, 165, 233, 0.15)",
      borderColor: "border-brand-500/30"
    },
    {
      title: "Avg Recovery Time",
      value: `${avgTime} min`,
      subtitle: "Autonomous latency per txn",
      icon: Clock,
      color: "text-amber-400",
      bgGlow: "rgba(245, 158, 11, 0.15)",
      borderColor: "border-amber-500/30"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((c, i) => {
        const IconComponent = c.icon;
        return (
          <div
            key={i}
            className={`glass-panel rounded-2xl p-5 border ${c.borderColor} relative overflow-hidden transition-all duration-300 hover:scale-[1.02] shadow-lg`}
            style={{
              boxShadow: `0 8px 32px 0 ${c.bgGlow}`
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{c.title}</span>
              <div className={`p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 ${c.color}`}>
                <IconComponent className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className={`text-2xl lg:text-3xl font-extrabold tracking-tight ${c.color}`}>
                {loading ? <RefreshCw className="w-6 h-6 animate-spin text-slate-500" /> : c.value}
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-500" />
              {c.subtitle}
            </p>

            {c.highlight && (
              <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3 w-16 h-16 bg-emerald-500/20 rounded-full blur-xl pointer-events-none" />
            )}
          </div>
        );
      })}
    </div>
  );
}
