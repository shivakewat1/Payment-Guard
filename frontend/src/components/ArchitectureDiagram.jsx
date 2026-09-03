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
      color: "from-sky-400 to-blue-500",
      textColor: "text-sky-400"
    },
    {
      num: "02",
      title: "DIAGNOSE",
      description: "Claude 3.5 AI root cause & confidence scoring",
      icon: Brain,
      badge: "Claude 3.5 Sonnet",
      color: "from-purple-400 to-indigo-500",
      textColor: "text-purple-400"
    },
    {
      num: "03",
      title: "INTERVENE",
      description: "Bounded decision matrix & Hinglish voice scripts",
      icon: Zap,
      badge: "Bounded Logic",
      color: "from-amber-400 to-orange-500",
      textColor: "text-amber-400"
    },
    {
      num: "04",
      title: "EXECUTE",
      description: "Exponential backoff & immutable audit trails",
      icon: Play,
      badge: "Multi-Channel",
      color: "from-emerald-400 to-teal-500",
      textColor: "text-emerald-400"
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-slate-900/60 to-slate-950/80 backdrop-blur p-6 sm:p-8 shadow-2xl space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-400/20 pb-4">
        <div>
          <h2 className="text-xl font-bold text-cyan-300 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" /> 4-Stage Recovery Pipeline Architecture
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Deterministic, bounded AI workflow engineered for Razorpay payment infrastructure
          </p>
        </div>
        <span className="text-xs font-mono text-cyan-400 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30">
          Zero Hallucination Bounded Engine
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.15, duration: 0.5 }}
              whileHover={{ scale: 1.04, y: -4 }}
              onClick={() => onStepClick && onStepClick(idx + 1)}
              className="relative group cursor-pointer"
            >
              {/* Card */}
              <div className="rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-slate-900/80 to-slate-950/90 p-6 text-center hover:border-cyan-400/70 transition-all shadow-xl relative overflow-hidden group-hover:shadow-[0_0_30px_rgba(34,211,238,0.25)]">
                
                {/* Floating ambient glow inside card */}
                <div className="absolute -top-8 -right-8 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl pointer-events-none group-hover:opacity-100 transition-opacity" />

                <motion.div
                  className="w-14 h-14 mx-auto rounded-2xl bg-slate-900 border border-cyan-500/30 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform"
                >
                  <Icon className={`w-7 h-7 ${stage.textColor}`} />
                </motion.div>

                <p className="text-cyan-400 text-xs font-mono font-bold mb-1 tracking-wider">
                  STAGE {stage.num}
                </p>
                <h3 className="text-base font-extrabold text-white mb-2 tracking-wide font-sans">
                  {stage.title}
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">
                  {stage.description}
                </p>

                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-900 text-cyan-300 border border-cyan-500/30 inline-block">
                  {stage.badge}
                </span>

                {/* Animated Inner Border Glow */}
                <motion.div
                  className="absolute inset-0 rounded-2xl border border-cyan-400/40 pointer-events-none"
                  animate={{
                    boxShadow: [
                      "inset 0 0 0 0 rgba(34, 211, 238, 0.1)",
                      "inset 0 0 15px 0 rgba(34, 211, 238, 0.25)",
                      "inset 0 0 0 0 rgba(34, 211, 238, 0.1)",
                    ],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: idx * 0.4 }}
                />
              </div>

              {/* Connection arrow for desktop */}
              {idx < 3 && (
                <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-cyan-400">
                  <ArrowRight className="w-5 h-5 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Compliance and Safety Boundaries Footer */}
      <motion.div
        className="p-5 rounded-2xl border border-emerald-400/30 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-slate-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-emerald-300 text-xs sm:text-sm font-medium">
            <strong>Production Safety Verified:</strong> All actions are audit-logged with millisecond latency, ≤₹50,000 threshold strictly enforced, ≤3 retry caps, and circuit breakers active.
          </p>
        </div>
        <span className="text-[11px] font-mono text-emerald-400 font-bold px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-500/30 shrink-0">
          100% Compliant
        </span>
      </motion.div>
    </motion.div>
  );
}
