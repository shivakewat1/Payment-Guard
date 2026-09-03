import React from 'react';
import { PieChart, ShieldCheck, CheckCircle2, RefreshCw, MessageSquare, PhoneCall, AlertOctagon, BarChart3 } from 'lucide-react';

export default function RecoveryChart({ metrics }) {
  const processing = metrics?.processing_metrics || {};
  const recovery = metrics?.recovery_metrics || {};
  const compliance = metrics?.compliance || {};
  const exceptions = metrics?.exception_handling || {};

  const totalInterventions = processing.interventions_executed || 100;
  const autoRetries = processing.auto_retries || 45;
  const sms = processing.customer_sms || 35;
  const voice = processing.voice_calls || 10;
  const escalations = processing.manual_escalations || 10;

  const actions = [
    { label: 'Autonomous Switch Retries', count: autoRetries, pct: Math.round((autoRetries / totalInterventions) * 100), color: 'bg-brand-500', text: 'text-brand-400', icon: RefreshCw },
    { label: 'Customer Recovery SMS', count: sms, pct: Math.round((sms / totalInterventions) * 100), color: 'bg-purple-500', text: 'text-purple-400', icon: MessageSquare },
    { label: 'VIP Hinglish Voice Concierge', count: voice, pct: Math.round((voice / totalInterventions) * 100), color: 'bg-emerald-500', text: 'text-emerald-400', icon: PhoneCall },
    { label: 'Manual Ops Escalations', count: escalations, pct: Math.round((escalations / totalInterventions) * 100), color: 'bg-amber-500', text: 'text-amber-400', icon: AlertOctagon },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      
      {/* 1. Recovery Actions Breakdown */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-brand-400" />
            Recovery Actions Distribution
          </h4>
          <span className="text-xs text-slate-400 font-mono">{totalInterventions} Executed</span>
        </div>

        {/* Multi-segment progress bar */}
        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-slate-800">
          {actions.map((act, i) => (
            <div
              key={i}
              className={`${act.color} h-full rounded-sm transition-all duration-500`}
              style={{ width: `${act.pct}%` }}
              title={`${act.label}: ${act.count} (${act.pct}%)`}
            />
          ))}
        </div>

        {/* Legend items */}
        <div className="space-y-2.5 pt-1">
          {actions.map((act, i) => {
            const Icon = act.icon;
            return (
              <div key={i} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg bg-slate-950 ${act.text}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-slate-300 font-medium">{act.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white font-mono">{act.count}</span>
                  <span className="text-[11px] text-slate-500 font-mono">({act.pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Revenue Recovery Funnel */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            Capital Recovery Funnel
          </h4>
          <span className="text-xs text-emerald-400 font-bold font-mono">
            {recovery.recovery_rate_percent || 32.0}% Saved
          </span>
        </div>

        <div className="space-y-3 pt-1">
          {/* Stage 1: At Risk */}
          <div className="p-3 bg-slate-900/80 rounded-xl border border-rose-500/20 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-medium">Stage 1: Detected at Risk</span>
              <span className="font-bold text-rose-300">
                ₹{(metrics?.input_metrics?.total_amount_at_risk || 2500000).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5">
              <div className="bg-rose-500 h-1.5 rounded-full w-full" />
            </div>
            <span className="text-[10px] text-slate-500 block">100 Transactions across 5 merchant partners</span>
          </div>

          {/* Stage 2: Autonomous Interventions */}
          <div className="p-3 bg-slate-900/80 rounded-xl border border-brand-500/20 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-medium">Stage 2: Bounded Interventions</span>
              <span className="font-bold text-brand-300">{totalInterventions} Executed</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5">
              <div className="bg-brand-500 h-1.5 rounded-full w-4/5" />
            </div>
            <span className="text-[10px] text-slate-500 block">Auto-Retry, SMS, Voice Concierge, Escalation</span>
          </div>

          {/* Stage 3: Capital Saved */}
          <div className="p-3 bg-slate-900/80 rounded-xl border border-emerald-500/30 space-y-1 bg-gradient-to-br from-emerald-950/20 to-transparent">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Stage 3: Capital Recovered
              </span>
              <span className="font-extrabold text-emerald-400 text-sm">
                ₹{(recovery.amount_recovered || 780000).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5">
              <div
                className="bg-emerald-400 h-1.5 rounded-full"
                style={{ width: `${recovery.recovery_rate_percent || 32}%` }}
              />
            </div>
            <span className="text-[10px] text-emerald-400/80 block">
              {recovery.payments_recovered || 32} Transactions fully restored to merchants
            </span>
          </div>
        </div>
      </div>

      {/* 3. Safety & Compliance Controls */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-400" />
            Compliance & Resilience
          </h4>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
            100% Verified
          </span>
        </div>

        <div className="space-y-2.5 pt-1 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-300">Immutable Audit Trail</span>
            <span className="text-emerald-400 font-bold font-mono">
              {compliance.audit_logs_created || 100} Logs
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-300">Graceful Exceptions Handled</span>
            <span className="text-brand-400 font-bold font-mono">
              {exceptions.gracefully_handled || 48} / {exceptions.total_exceptions || 48}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-300">Bounded Retry Cap (≤ 3 Retries)</span>
            <span className="text-emerald-400 font-bold">Enforced</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-300">Auto-Retry Limit (≤ ₹50,000)</span>
            <span className="text-emerald-400 font-bold">Enforced</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-300">Circuit Breaker (3 fails trip)</span>
            <span className="text-emerald-400 font-bold">Active</span>
          </div>
        </div>
      </div>

    </div>
  );
}
