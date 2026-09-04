import React from 'react';
import { X, Sparkles, Brain, ArrowRight } from 'lucide-react';

export default function DiagnosisModal({ diagnosis, failure, onClose, onProceedToIntervene, loading }) {
  if (!diagnosis && !loading) return null;

  const targetTxId = failure?.tx_id || diagnosis?.failure_id || 'tx_1001';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-300 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#151515] text-white rounded-xl">
              <Brain className="w-5 h-5 text-[#FF6A00]" />
            </div>
            <div>
              <h3 className="font-display font-black text-base text-[#151515] uppercase tracking-tight flex items-center gap-2">
                STEP 2: ROOT CAUSE DIAGNOSIS
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold border border-slate-300">
                  CLAUDE 3.5 AI
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">TRANSACTION ID: <span className="font-mono text-[#151515] font-bold">{targetTxId}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-[#151515] p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {loading ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-10 h-10 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="space-y-1">
                <p className="font-mono text-sm font-bold text-[#151515]">CLAUDE 3.5 SONNET REASONING...</p>
                <p className="text-xs text-slate-500 font-medium">Analyzing transaction telemetry, switch latency & customer reliability patterns</p>
              </div>
            </div>
          ) : (
            <>
              {/* Context Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="font-mono text-[10px] text-slate-500 block uppercase font-bold">FAILED AMOUNT</span>
                  <span className="font-mono text-sm font-black text-[#151515]">
                    ₹{(failure?.amount || 5500).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="font-mono text-[10px] text-slate-500 block uppercase font-bold">CUSTOMER</span>
                  <span className="text-xs font-bold text-[#151515] truncate block">
                    {failure?.customer_name || 'Customer Partner'}
                  </span>
                </div>
                <div>
                  <span className="font-mono text-[10px] text-slate-500 block uppercase font-bold">RAW REASON</span>
                  <span className="font-mono text-xs text-[#FF6A00] font-bold truncate block">
                    {failure?.reason || diagnosis?.root_cause || 'gateway_timeout'}
                  </span>
                </div>
                <div>
                  <span className="font-mono text-[10px] text-slate-500 block uppercase font-bold">DOMAIN</span>
                  <span className="text-xs font-bold text-slate-700 block uppercase">
                    {failure?.failure_category || diagnosis?.cause_category || 'network'}
                  </span>
                </div>
              </div>

              {/* Core Diagnosis Result Card */}
              <div className="p-5 rounded-2xl bg-white border border-slate-300 space-y-4 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">Root Cause Category:</span>
                    <span className="font-mono text-xs px-2.5 py-1 rounded-md font-bold uppercase bg-slate-100 text-slate-900 border border-slate-300">
                      {diagnosis?.cause_category || 'NETWORK'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">Failure Severity:</span>
                    <span className="font-mono text-xs px-2.5 py-1 rounded-md font-bold uppercase bg-orange-100 text-[#FF6A00] border border-orange-300">
                      {diagnosis?.severity || 'MEDIUM'}
                    </span>
                  </div>
                </div>

                {/* Metrics meters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-600 font-bold">Recovery Probability</span>
                      <span className="font-mono text-[#FF6A00] font-bold">{diagnosis?.recovery_probability || 82}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#FF6A00] h-2 rounded-full"
                        style={{ width: `${diagnosis?.recovery_probability || 82}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-600 font-bold">AI Model Confidence</span>
                      <span className="font-mono text-[#151515] font-bold">{diagnosis?.confidence || 85}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#151515] h-2 rounded-full"
                        style={{ width: `${diagnosis?.confidence || 85}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Claude explanation */}
                <div className="pt-2">
                  <span className="font-mono text-xs text-slate-500 font-bold uppercase block mb-1.5">
                    Claude AI Root Cause Explanation:
                  </span>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs leading-relaxed text-slate-700 font-medium border-l-4 border-l-[#FF6A00]">
                    {diagnosis?.explanation || 'Transient gateway timeout between payment switch and acquiring bank. High customer trust score indicates low fraud risk. Safe for bounded retry.'}
                  </div>
                </div>
              </div>

              {/* Recommendation Callout */}
              <div className="p-5 rounded-2xl bg-[#151515] text-white flex items-center justify-between shadow-lg">
                <div>
                  <span className="font-mono text-[10px] text-slate-400 font-bold block">RECOMMENDED RECOVERY ACTION</span>
                  <span className="font-mono text-sm font-black text-[#FF6A00] uppercase">
                    {diagnosis?.recommended_action || 'AUTO_RETRY'}
                  </span>
                </div>
                <button
                  onClick={() => onProceedToIntervene(targetTxId)}
                  className="px-5 py-2.5 bg-[#FF6A00] hover:bg-[#e05d00] text-white rounded-xl text-xs font-mono font-bold flex items-center gap-2 shadow-md transition-all"
                >
                  <span>CONFIGURE INTERVENTION</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-mono font-bold transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
