import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import AuditTrail from '../components/AuditTrail';
import { ArrowLeft, Brain, Zap, ShieldCheck } from 'lucide-react';

export default function Details({ txId, onBack }) {
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (txId) {
      api.fetchAuditTrail(txId)
        .then(data => setAudit(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [txId]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-xl font-bold text-white">Transaction Telemetry Dossier</h2>
        <p className="text-xs text-slate-400">Verifiable trace for transaction {txId}</p>
        <AuditTrail auditData={audit} failureId={txId} loading={loading} onClose={onBack} />
      </div>
    </div>
  );
}
