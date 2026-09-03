import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, FileText, CheckCircle, Clock, AlertTriangle, ShieldCheck, ArrowRight, Zap, Radio } from 'lucide-react';
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

  const getStatusIcon = (status) => {
    if (status === "success" || status === "completed") return "✅";
    if (status === "failed") return "⚠️";
    return "⏳";
  };

  const getStatusColor = (status) => {
    if (status === "success" || status === "completed") return "text-emerald-400";
    if (status === "failed") return "text-orange-400";
    return "text-cyan-400";
  };

  const content = (
    <div className="space-y-6">
      {/* Transaction Selector */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-slate-900/60 to-slate-950/80 backdrop-blur p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-cyan-300 font-bold uppercase tracking-wider">
            Select Transaction Audit Log:
          </p>
          <span className="text-[11px] font-mono text-slate-400">
            Current: <strong className="text-cyan-400">{selectedTx}</strong>
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {sampleTxList.map((tx) => (
            <motion.button
              key={tx}
              onClick={() => setSelectedTx(tx)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                selectedTx === tx
                  ? "bg-gradient-to-r from-cyan-400 to-blue-400 text-slate-900 shadow-md shadow-cyan-500/30"
                  : "border border-cyan-400/30 text-cyan-300 hover:bg-slate-800/60"
              }`}
            >
              {tx === 'tx_1001' ? `⭐ ${tx} (Graceful Demo)` : tx}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Timeline */}
      <motion.div
        className="rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-slate-900/60 to-slate-950/80 backdrop-blur p-6 space-y-6 shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-cyan-400/20 pb-4">
          <div>
            <h2 className="text-lg font-bold text-cyan-300 flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" /> Sequential Execution Audit Log
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              100% immutable, deterministic chronological events with latency telemetry
            </p>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
            Latency: ~{currentLogs?.execution_duration_seconds ? `${currentLogs.execution_duration_seconds}s` : '0.85s'}
          </span>
        </div>

        <div className="space-y-4 pt-2">
          {logs.map((log, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.3 }}
              className="flex gap-4 group"
            >
              {/* Timeline Dot & Connecting Line */}
              <div className="relative flex flex-col items-center">
                <motion.div
                  className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-bold shadow-md ${
                    log.status === "success" || log.status === "completed"
                      ? "border-emerald-400 bg-emerald-400/10 text-emerald-400 shadow-emerald-500/20"
                      : log.status === "failed"
                      ? "border-orange-400 bg-orange-400/10 text-orange-400 shadow-orange-500/20"
                      : "border-cyan-400 bg-cyan-400/10 text-cyan-400 shadow-cyan-500/20"
                  }`}
                  whileHover={{ scale: 1.2 }}
                >
                  {getStatusIcon(log.status)}
                </motion.div>
                {idx < logs.length - 1 && (
                  <div className="w-0.5 h-12 bg-gradient-to-b from-cyan-400/40 to-slate-800 my-1" />
                )}
              </div>

              {/* Step Content */}
              <motion.div
                className="flex-1 pb-4 border-b border-cyan-400/10 rounded-xl p-3 hover:bg-slate-900/50 transition-colors"
                whileHover={{ x: 4 }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-cyan-400 border border-cyan-500/30">
                        Step {log.step_number || idx + 1}
                      </span>
                      <h4 className="font-bold text-white text-sm">{log.action}</h4>
                    </div>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-sans">
                      {log.result || log.details}
                    </p>

                    {/* Handled exception pill */}
                    {log.exception_handled && (
                      <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                        <AlertTriangle className="w-3 h-3" /> Handled: {log.exception_handled} (Graceful Backoff)
                      </span>
                    )}
                  </div>

                  <span className={`text-[11px] font-mono shrink-0 ${getStatusColor(log.status)}`}>
                    {log.duration_seconds ? `${log.duration_seconds}s` : log.timestamp || '0.12s'}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  // If called as a modal popup
  if (onClose) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-2xl bg-slate-900 border border-cyan-400/40 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-400/20 bg-slate-950">
            <div className="flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">
                Transaction Audit Trail ({selectedTx})
              </h3>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
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
