import React from 'react';
import { X, FileText, CheckCircle2, Clock, ShieldAlert, AlertTriangle, ArrowDown, Activity, IndianRupee } from 'lucide-react';

export default function AuditTrail({ auditData, failureId, onClose, loading }) {
  if (!auditData && !loading) return null;

  const logs = auditData?.audit_logs || [];
  const activeLog = logs[0]; // Most recent execution log

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/70 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-brand-500/20 text-brand-400 rounded-xl border border-brand-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Step 4: Audit Trail & Telemetry
                {activeLog?.status === 'success' ? (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                    Recovered
                  </span>
                ) : (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                    {activeLog?.status || 'Pending'}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Tx ID: <span className="font-mono text-slate-300">{failureId}</span>
                {activeLog?.execution_id && ` • Execution ID: ${activeLog.execution_id}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-slate-300">Retrieving verifiable audit records & gateway logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Activity className="w-10 h-10 mx-auto mb-2 text-slate-600" />
              <p className="text-sm">No execution recorded yet for this transaction.</p>
              <p className="text-xs text-slate-500 mt-1">Execute an intervention from the transactions table to generate audit trails.</p>
            </div>
          ) : (
            <>
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[11px] text-slate-500 block uppercase font-medium">Action</span>
                  <span className="text-xs font-mono font-bold text-brand-400">{activeLog.action}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block uppercase font-medium">Execution Status</span>
                  <span className={`text-xs font-bold uppercase ${activeLog.status === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {activeLog.status}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block uppercase font-medium">Money Recovered</span>
                  <span className="text-sm font-extrabold text-emerald-400">
                    ₹{activeLog.money_recovered?.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block uppercase font-medium">Duration</span>
                  <span className="text-xs font-medium text-slate-300">{activeLog.duration_seconds}s</span>
                </div>
              </div>

              {/* Handled Exception Alert (if any) */}
              {activeLog.exceptions && (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-amber-300 block">
                      Gracefully Handled Exception: {activeLog.exceptions.exception_type}
                    </span>
                    <p className="text-slate-300">
                      <strong>Mitigation:</strong> {activeLog.exceptions.handled_by}
                    </p>
                    <p className="text-slate-400">
                      <strong>Next Step:</strong> {activeLog.exceptions.recovery_action}
                    </p>
                  </div>
                </div>
              )}

              {/* Step-by-Step Chronological Timeline */}
              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Sequential Execution Steps ({activeLog.steps?.length || 0})
                </span>

                <div className="space-y-3 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  {activeLog.steps?.map((step, idx) => (
                    <div key={idx} className="relative pl-10">
                      {/* Step Indicator Dot */}
                      <div className="absolute left-2 top-2.5 -translate-x-1/2 w-5 h-5 rounded-full bg-slate-900 border-2 border-brand-500 flex items-center justify-center text-[10px] font-bold text-brand-400">
                        {step.step || idx + 1}
                      </div>

                      <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-200">{step.action}</span>
                          {step.api_response_time && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-950 text-brand-400 border border-brand-800/40">
                              ⏱ {step.api_response_time}
                            </span>
                          )}
                        </div>

                        {step.result && (
                          <p className="text-xs text-slate-400 font-mono pt-0.5">
                            ↳ {step.result}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
                          <span className="capitalize text-emerald-400">Status: {step.status}</span>
                          <span>{new Date(step.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
          <span>Logged by PaymentGuard Agent • Immutable Ledger</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors"
          >
            Close Audit Log
          </button>
        </div>
      </div>
    </div>
  );
}
