import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ShieldCheck, Zap, Brain, Play } from 'lucide-react';

export default function ExpandableTransaction({ transaction, onDiagnose, onIntervene }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!transaction) return null;

  return (
    <div className="rounded-2xl border border-slate-300 bg-white overflow-hidden shadow-xs hover:border-[#151515] transition-all">
      {/* Header - Always visible */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 cursor-pointer select-none flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#151515] text-white flex items-center justify-center font-mono font-bold text-sm shrink-0">
            {transaction.failure_category ? transaction.failure_category[0].toUpperCase() : 'T'}
          </div>
          <div>
            <p className="font-mono font-bold text-[#151515] text-sm">{transaction.tx_id || transaction.id}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {transaction.customer_name || 'Customer'} • ₹{(transaction.amount || 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase border ${
            transaction.status === 'executed' || transaction.status === 'recovered'
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : transaction.amount > 50000
              ? 'bg-amber-100 text-amber-800 border-amber-300'
              : 'bg-slate-100 text-slate-800 border-slate-300'
          }`}>
            {transaction.status || 'detected'}
          </span>

          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-slate-500 p-1"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </div>
      </div>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="border-t border-slate-200 bg-slate-50/70"
          >
            <div className="p-4 space-y-3">
              <DetailRow label="Failure Reason" value={transaction.reason || 'network_timeout'} />
              <DetailRow label="Category" value={transaction.failure_category || 'network'} />
              <DetailRow label="Risk Score" value={`${transaction.risk_score || 45}/100`} />
              <DetailRow label="Recovery Cap Rule" value={transaction.amount > 50000 ? "Manual Escalation (Cap >₹50k)" : "Auto-Retry Allowed (Cap ≤₹50k)"} />
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                {onDiagnose && (
                  <button
                    onClick={() => onDiagnose(transaction.tx_id)}
                    className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-mono font-bold transition flex items-center gap-1.5"
                  >
                    <Brain className="w-3.5 h-3.5" />
                    <span>DIAGNOSE</span>
                  </button>
                )}
                {onIntervene && (
                  <button
                    onClick={() => onIntervene(transaction.tx_id)}
                    className="px-3 py-1.5 rounded-xl bg-[#FF6A00] hover:bg-[#e05d00] text-white text-xs font-mono font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>INTERVENE</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-slate-500 font-medium">{label}:</span>
      <span className="text-[#151515] font-mono font-bold">{value}</span>
    </div>
  );
}
