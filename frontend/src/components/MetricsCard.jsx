import React from 'react';
import { TrendingUp, ShieldAlert, CheckCircle2, Clock, IndianRupee, RefreshCw, Zap, ShieldCheck } from 'lucide-react';

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
      subtitle: `${totalFailures} failed payments detected`,
      icon: ShieldAlert,
      color: "text-rose-400",
      accentBg: "bg-rose-500/10",
      borderColor: "border-rose-500/30",
      glowColor: "rgba(244, 63, 94, 0.15)",
      badge: "Ingestion Queue"
    },
    {
      title: "Revenue Recovered",
      value: `₹${recovered.toLocaleString('en-IN')}`,
      subtitle: `${paymentsRecovered} payments successfully saved`,
      icon: IndianRupee,
      color: "text-emerald-400",
      accentBg: "bg-emerald-500/10",
      borderColor: "border-emerald-500/40",
      glowColor: "rgba(16, 185, 129, 0.22)",
      highlight: true,
      badge: "Direct GMV Saved"
    },
    {
      title: "Recovery Success Rate",
      value: `${recoveryRate.toFixed(1)}%`,
      subtitle: `Target benchmark: 30-40%`,
      icon: TrendingUp,
      color: "text-brand-400",
      accentBg: "bg-brand-500/10",
      borderColor: "border-brand-500/30",
      glowColor: "rgba(14, 165, 233, 0.18)",
      badge: "Autonomous Efficiency"
    },
    {
      title: "Avg Recovery Speed",
      value: `${avgTime} min`,
      subtitle: "Full latency per transaction",
      icon: Clock,
      color: "text-amber-400",
      accentBg: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      glowColor: "rgba(245, 158, 11, 0.15)",
      badge: "Real-time SLA"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((c, i) => {
        const IconComponent = c.icon;
        return (
          <div
            key={i}
            className={`glass-panel-card rounded-2xl p-5 border ${c.borderColor} relative overflow-hidden transition-all duration-300 shadow-xl group`}
            style={{
              boxShadow: `0 10px 30px -5px ${c.glowColor}`
            }}
          >
            {/* Top ambient radial glow */}
            <div 
              className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity"
              style={{ background: c.glowColor }}
            />

            <div className="flex items-center justify-between mb-3 relative z-10">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{c.title}</span>
              <div className={`p-2.5 rounded-xl border border-slate-700/50 ${c.accentBg} ${c.color} shadow-sm group-hover:scale-110 transition-transform`}>
                <IconComponent className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline space-x-2 relative z-10">
              <span className={`text-2xl lg:text-3xl font-black tracking-tight font-sans ${c.color}`}>
                {loading ? <RefreshCw className="w-6 h-6 animate-spin text-slate-500" /> : c.value}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80 relative z-10">
              <span className="flex items-center gap-1.5 font-medium text-[11px]">
                <span className={`w-1.5 h-1.5 rounded-full ${c.color} bg-current`} />
                {c.subtitle}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                {c.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
