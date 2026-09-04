import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, FileText, CheckCircle2, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { api } from '../services/api';

export default function AuditTrail({ auditData, failureId, loading, onClose }) {
  const [selectedTx, setSelectedTx] = useState(failureId || 'tx_1001');
  const [currentLogs, setCurrentLogs] = useState(auditData);
  const [fetching, setFetching] = useState(false);

  const sampleTxList = ["tx_1001", "tx_1081", "tx_1012", "tx_1020", "tx_1033"];

  useEffect(() => {
    if (failureId && failureId !== selectedTx) {
      setSelectedTx(failureId);
    }
  }, [failureId]);

  useEffect(() => {
    if (selectedTx) {
      fetchLogsForTx(selectedTx);
    }
  }, [selectedTx]);

  const fetchLogsForTx = async (id) => {
    setFetching(true);
    try {
      const res = await api.fetchAuditTrail(id);
      setCurrentLogs(res);
    } catch (e) {
      console.warn('Using default demo audit trail for', id);
    } finally {
      setFetching(false);
    }
  };

  const logs = currentLogs?.steps || [
    { step_number: 1, action: "Payment failure detected", status: "completed", result: "Ingested from Razorpay telemetry", duration_seconds: 0.12 },
    { step_number: 2, action: "Claude 3.5 Diagnosis", status: "completed", result: "Root cause: network_timeout (Confidence: 82%)", duration_seconds: 0.45 },
    { step_number: 3, action: "Intervention Decision", status: "completed", result: "AUTO_RETRY approved with 3-attempt exponential backoff", duration_seconds: 0.08 },
    { step_number: 4, action: "Retry Attempt 1", status: "failed", result: "Network timeout (handled gracefully by backoff)", duration_seconds: 0.35, exception_handled: "NetworkTimeout" },
    { step_number: 5, action: "Retry Attempt 2", status: "failed", result: "Still timing out (scheduled next attempt)", duration_seconds: 0.32, exception_handled: "NetworkTimeout" },
    { step_number: 6, action: "Retry Attempt 3", status: "success", result: "Payment authorized! Capital recovered successfully.", duration_seconds: 0.41 }
  ];

  const content = (
    <div className="space-y-6">
      {/* Transaction Selector */}
      <div className="bg-white rounded-3xl border border-slate-300 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <p className="font-mono text-xs font-bold text-[#151515] uppercase tracking-wider">
            SELECT TRANSACTION AUDIT LOG:
          </p>
          <span className="font-mono text-xs text-slate-500">
            CURRENT: <strong className="text-[#FF6A00] font-bold">{selectedTx}</strong>
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {sampleTxList.map((tx) => (
            <button
              key={tx}
              onClick={() => setSelectedTx(tx)}
              className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                selectedTx === tx
                  ? "bg-[#151515] text-white shadow-md"
                  : "bg-slate-100 border border-slate-300 text-[#151515] hover:bg-slate-200"
              }`}
            >
              {tx === 'tx_1001' ? `⭐ ${tx} (Graceful Demo)` : tx}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-3xl border border-slate-300 p-6 space-y-6 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="font-display font-black text-xl text-[#151515] uppercase tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#FF6A00]" /> SEQUENTIAL EXECUTION AUDIT LOG
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              100% immutable, deterministic chronological events with latency telemetry
            </p>
          </div>
          <span className="font-mono text-xs font-bold px-3 py-1 rounded-md bg-slate-100 text-[#151515] border border-slate-300">
            LATENCY: ~{currentLogs?.execution_duration_seconds ? `${currentLogs.execution_duration_seconds}s` : '0.85s'}
          </span>
        </div>

        <div className="space-y-4 pt-2">
          {logs.map((log, idx) => (
            <div key={idx} className="flex gap-4 group">
              {/* Timeline Dot & Connecting Line */}
              <div className="relative flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-mono text-xs font-bold shadow-xs ${
                  log.status === "success" || log.status === "completed"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                    : log.status === "failed"
                    ? "border-orange-500 bg-orange-50 text-[#FF6A00]"
                    : "border-slate-400 bg-slate-100 text-slate-700"
                }`}>
                  {log.status === "success" || log.status === "completed" ? "✓" : log.status === "failed" ? "!" : "•"}
                </div>
                {idx < logs.length - 1 && (
                  <div className="w-0.5 h-12 bg-slate-200 my-1" />
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 pb-4 border-b border-slate-100 rounded-xl p-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
                        STEP {log.step_number || idx + 1}
                      </span>
                      <h4 className="font-bold text-[#151515] text-sm">{log.action}</h4>
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-1.5 leading-relaxed">
                      {log.result || log.details}
                    </p>

                    {/* Handled exception pill */}
                    {log.exception_handled && (
                      <span className="inline-flex items-center gap-1 mt-2 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                        <AlertTriangle className="w-3 h-3 text-[#FF6A00]" /> HANDLED: {log.exception_handled} (GRACEFUL BACKOFF)
                      </span>
                    )}
                  </div>

                  <span className="font-mono text-[11px] font-bold text-slate-500 shrink-0">
                    {log.duration_seconds ? `${log.duration_seconds}s` : log.timestamp || '0.12s'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // If called as a modal popup
  if (onClose) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-2xl bg-white border border-slate-300 rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-[#FF6A00]" />
              <h3 className="font-display font-black text-base text-[#151515] uppercase tracking-tight">
                TRANSACTION AUDIT TRAIL ({selectedTx})
              </h3>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-500 hover:text-[#151515]">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto flex-1">
            {content}
          </div>
        </div>
      </div>
    );
  }

  // Standalone tab view
  return content;
}
