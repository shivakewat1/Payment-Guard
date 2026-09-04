import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

const defaultTxns = [
  { id: 'tx_1001', risk: 87, amount: 5500, recovery: 'success', category: 'network' },
  { id: 'tx_1002', risk: 45, amount: 31000, recovery: 'success', category: 'network' },
  { id: 'tx_1003', risk: 92, amount: 38500, recovery: 'success', category: 'network' },
  { id: 'tx_1004', risk: 23, amount: 45000, recovery: 'success', category: 'network' },
  { id: 'tx_1005', risk: 78, amount: 5500, recovery: 'success', category: 'network' },
  { id: 'tx_1006', risk: 89, amount: 65000, recovery: 'escalated', category: 'customer' },
  { id: 'tx_1007', risk: 34, amount: 12000, recovery: 'success', category: 'merchant' },
  { id: 'tx_1008', risk: 95, amount: 92000, recovery: 'escalated', category: 'customer' },
  { id: 'tx_1009', risk: 62, amount: 28000, recovery: 'success', category: 'issuer' }
];

export default function RiskHeatmap({ failures = [] }) {
  const [hoveredTx, setHoveredTx] = useState(null);

  const displayTxns = failures.length > 0 
    ? failures.slice(0, 12).map((f, i) => ({
        id: f.tx_id,
        risk: f.risk_score || Math.floor(Math.random() * 60) + 30,
        amount: f.amount,
        recovery: f.status === 'executed' || f.status === 'recovered' ? 'success' : f.amount > 50000 ? 'escalated' : 'failed',
        category: f.failure_category || 'network'
      }))
    : defaultTxns;

  const getRiskCardStyle = (risk) => {
    if (risk > 80) return 'bg-rose-50 border-rose-200 text-rose-900';
    if (risk > 60) return 'bg-orange-50 border-[#FF6A00]/40 text-[#151515]';
    if (risk > 40) return 'bg-amber-50 border-amber-200 text-amber-900';
    return 'bg-emerald-50 border-emerald-200 text-emerald-900';
  };

  const getRiskLabel = (risk) => {
    if (risk > 80) return 'CRITICAL';
    if (risk > 60) return 'HIGH';
    if (risk > 40) return 'MEDIUM';
    return 'LOW';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/10 pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#151515] flex items-center gap-2 font-display">
            <Flame className="w-5 h-5 text-[#FF6A00]" />
            RISK ASSESSMENT & TELEMETRY HEATMAP
          </h2>
          <p className="text-[#555555] text-xs mt-0.5 font-medium">
            Real-time transaction risk scoring & autonomous escalation boundaries
          </p>
        </div>

        {/* Risk Level Badges */}
        <div className="flex items-center gap-2 text-[11px] font-semibold">
          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">Low (&le;40)</span>
          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">Medium</span>
          <span className="px-2 py-0.5 rounded bg-orange-100 text-[#FF6A00] border border-[#FF6A00]/30 font-bold">High</span>
          <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">Critical (&gt;80)</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-1">
        {displayTxns.map((tx, idx) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.03 }}
            onMouseEnter={() => setHoveredTx(tx.id)}
            onMouseLeave={() => setHoveredTx(null)}
            whileHover={{ scale: 1.03, y: -2 }}
            className={`rounded-xl p-4 border transition-all shadow-sm ${getRiskCardStyle(tx.risk)}`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-mono text-sm font-bold text-[#151515]">{tx.id}</p>
                <p className="text-xs text-[#555555] font-semibold mt-0.5">
                  ₹{tx.amount.toLocaleString()}
                </p>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-black font-mono text-[#151515]">
                  {tx.risk}
                </div>
                <p className="text-[10px] font-bold tracking-wider text-[#FF6A00]">
                  {getRiskLabel(tx.risk)}
                </p>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="mt-3 pt-2 border-t border-black/10 flex items-center justify-between text-[11px]">
              <span className="capitalize text-[#555555] font-semibold">{tx.category}</span>
              <span className="font-bold flex items-center gap-1">
                {tx.recovery === 'success' && <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Recovered</>}
                {tx.recovery === 'failed' && <><XCircle className="w-3.5 h-3.5 text-rose-600" /> Retrying</>}
                {tx.recovery === 'escalated' && <><AlertTriangle className="w-3.5 h-3.5 text-[#FF6A00]" /> Escalated</>}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
