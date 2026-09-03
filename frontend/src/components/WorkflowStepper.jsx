import React from 'react';
import { Search, Brain, Zap, Play, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function WorkflowStepper({ currentStep = 1, onStepClick }) {
  const steps = [
    {
      step: 1,
      name: 'DETECT',
      subtitle: 'Risk Scoring 0-100',
      icon: Search,
      color: 'from-sky-500 to-blue-600',
      textColor: 'text-sky-400',
      borderColor: 'border-sky-500/30',
      bgGlow: 'rgba(56, 189, 248, 0.12)',
      tag: '100 Txns Ingested'
    },
    {
      step: 2,
      name: 'DIAGNOSE',
      subtitle: 'Claude 3.5 Sonnet',
      icon: Brain,
      color: 'from-purple-500 to-indigo-600',
      textColor: 'text-purple-400',
      borderColor: 'border-purple-500/30',
      bgGlow: 'rgba(168, 85, 247, 0.12)',
      tag: 'Root Cause & Prob'
    },
    {
      step: 3,
      name: 'INTERVENE',
      subtitle: 'Bounded Decision Tree',
      icon: Zap,
      color: 'from-amber-500 to-orange-600',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/30',
      bgGlow: 'rgba(245, 158, 11, 0.12)',
      tag: '≤₹50k Safety Cap'
    },
    {
      step: 4,
      name: 'EXECUTE & AUDIT',
      subtitle: 'Multi-Channel Recovery',
      icon: Play,
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      bgGlow: 'rgba(16, 185, 129, 0.12)',
      tag: '100% Verifiable Logs'
    }
  ];

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Autonomous 4-Step Revenue Recovery Pipeline
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
          Closed-Loop Autonomous Architecture
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={s.step}
              onClick={() => onStepClick && onStepClick(s.step)}
              className={`p-3.5 rounded-xl border ${s.borderColor} bg-slate-950/70 hover:bg-slate-900/90 transition-all cursor-pointer relative overflow-hidden group shadow-md hover:scale-[1.02]`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${s.color} p-0.5 shadow-md flex items-center justify-center`}>
                    <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                      <Icon className={`w-4 h-4 ${s.textColor}`} />
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 block">
                      STEP {s.step}
                    </span>
                    <h4 className="text-xs font-bold text-white tracking-wide">{s.name}</h4>
                  </div>
                </div>

                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 font-mono">
                  {s.tag}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 font-medium">
                {s.subtitle}
              </p>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute right-1 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
