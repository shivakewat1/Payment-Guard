import React from 'react';
import { X, Sparkles, Brain, AlertTriangle, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

export default function DiagnosisModal({ diagnosis, failure, onClose, onProceedToIntervene, loading }) {
  if (!diagnosis && !loading) return null;

  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'medium':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  const getCategoryColor = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'network': return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
      case 'issuer': return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'merchant': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/70 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-brand-500/20 text-brand-400 rounded-xl border border-brand-500/30">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Step 2: Root Cause Diagnosis
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 flex items-center gap-1 font-normal">
                  <Sparkles className="w-3 h-3" /> Claude 3.5 AI Engine
                </span>
              </h3>
              <p className="text-xs text-slate-400">Transaction ID: <span className="font-mono text-slate-300">{failure?.tx_id}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-slate-300">Claude AI is analyzing transaction telemetry & customer patterns...</p>
            </div>
          ) : (
            <>
              {/* Context Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[11px] text-slate-500 block uppercase font-medium">Failed Amount</span>
                  <span className="text-sm font-bold text-slate-200">₹{failure?.amount?.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block uppercase font-medium">Customer</span>
                  <span className="text-xs font-semibold text-slate-300 truncate block">{failure?.customer_name || 'Guest'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block uppercase font-medium">Raw Reason</span>
                  <span className="text-xs font-mono text-amber-400 truncate block">{failure?.reason}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block uppercase font-medium">Channel</span>
                  <span className="text-xs text-slate-300 block capitalize">{failure?.failure_category}</span>
                </div>
              </div>

              {/* Core Diagnosis Result */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-700/60 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">Cause Category:</span>
                    <span className={`text-xs px-2.5 py-1 rounded-lg border font-semibold uppercase tracking-wide ${getCategoryColor(diagnosis.cause_category)}`}>
                      {diagnosis.cause_category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">Severity:</span>
                    <span className={`text-xs px-2.5 py-1 rounded-lg border font-semibold uppercase tracking-wide ${getSeverityBadge(diagnosis.severity)}`}>
                      {diagnosis.severity}
                    </span>
                  </div>
                </div>

                {/* Metrics meters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-400">Recovery Probability</span>
                      <span className="text-emerald-400 font-bold">{diagnosis.recovery_probability}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${diagnosis.recovery_probability}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-400">AI Model Confidence</span>
                      <span className="text-brand-400 font-bold">{diagnosis.confidence}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-brand-500 to-cyan-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${diagnosis.confidence}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Claude explanation */}
                <div className="pt-2">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                    AI Diagnosis & Root Cause Explanation:
                  </span>
                  <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-xs leading-relaxed text-slate-300">
                    {diagnosis.explanation}
                  </div>
                </div>
              </div>

              {/* Recommendation Callout */}
              <div className="p-3.5 rounded-xl bg-brand-950/40 border border-brand-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs text-brand-300 font-medium block">Recommended Recovery Action</span>
                  <span className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    {diagnosis.recommended_action}
                  </span>
                </div>
                <button
                  onClick={() => onProceedToIntervene(failure.tx_id)}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-brand-600/30 transition-all hover:translate-x-0.5"
                >
                  Configure Intervention <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
