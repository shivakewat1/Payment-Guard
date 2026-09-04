import React from 'react';
import { motion } from 'framer-motion';
import { Search, Brain, Zap, Play, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ArchitectureDiagram({ onStepClick }) {
  const stages = [
    {
      num: "01",
      title: "DETECT",
      description: "Ingest telemetry & compute risk score (0-100)",
      icon: Search,
      badge: "FastAPI + DB",
      textColor: "text-[#151515]"
    },
    {
      num: "02",
      title: "DIAGNOSE",
      description: "Claude 3.5 AI root cause & confidence scoring",
      icon: Brain,
      badge: "Claude 3.5 Sonnet",
      textColor: "text-purple-600"
    },
    {
      num: "03",
      title: "INTERVENE",
      description: "Bounded decision matrix & Hinglish voice scripts",
      icon: Zap,
      badge: "Bounded Logic",
      textColor: "text-[#FF6A00]"
    },
    {
      num: "04",
      title: "EXECUTE",
      description: "Exponential backoff & immutable audit trails",
      icon: Play,
      badge: "Multi-Channel",
      textColor: "text-emerald-600"
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-3xl border border-slate-300 p-6 sm:p-8 shadow-md space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="font-display font-black text-xl text-[#151515] uppercase tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#FF6A00]" /> 4-STAGE RECOVERY PIPELINE ARCHITECTURE
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Deterministic, bounded AI workflow engineered for Razorpay payment infrastructure
          </p>
        </div>
        <span className="font-mono text-xs font-bold text-[#151515] px-3 py-1 rounded-md bg-slate-100 border border-slate-300">
          ZERO HALLUCINATION BOUNDED ENGINE
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              whileHover={{ y: -4 }}
              onClick={() => onStepClick && onStepClick(idx + 1)}
              className="relative group cursor-pointer"
            >
              {/* Card */}
              <div className="rounded-2xl border border-slate-300 bg-white p-6 text-center hover:border-[#151515] transition-all shadow-xs relative overflow-hidden">
                <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-4 shadow-inner group-hover:scale-105 transition-transform">
                  <Icon className={`w-6 h-6 ${stage.textColor}`} />
                </div>

                <p className="font-mono text-xs font-bold text-slate-500 mb-1">
                  STAGE {stage.num}
                </p>
                <h3 className="font-display font-extrabold text-base text-[#151515] mb-2 uppercase tracking-tight">
                  {stage.title}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-4 font-medium">
                  {stage.description}
                </p>

                <span className="font-mono text-[10px] font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-800 border border-slate-300 inline-block">
                  {stage.badge}
                </span>
              </div>

              {/* Connection arrow for desktop */}
              {idx < 3 && (
                <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-slate-400">
                  <ArrowRight className="w-5 h-5 text-[#FF6A00]" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Compliance Footer */}
      <div className="p-5 rounded-2xl border border-emerald-300 bg-emerald-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <p className="text-emerald-900 text-xs sm:text-sm font-medium">
            <strong className="font-bold">Production Safety Verified:</strong> All actions are audit-logged with millisecond latency, ≤₹50,000 threshold strictly enforced, ≤3 retry caps, and circuit breakers active.
          </p>
        </div>
        <span className="font-mono text-xs font-extrabold text-emerald-800 px-3 py-1 rounded bg-emerald-100 border border-emerald-300 shrink-0">
          100% COMPLIANT
        </span>
      </div>
    </motion.div>
  );
}
