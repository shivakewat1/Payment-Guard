import React from 'react';
import { X, ShieldCheck, Zap, PhoneCall, MessageSquare, AlertCircle, RefreshCw, CheckCircle, ArrowRight } from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';

export default function InterventionModal({ intervention, failure, onClose, onExecute, loading }) {
  if (!intervention && !loading) return null;

  const action = intervention?.action || 'AUTO_RETRY';
  const params = intervention?.parameters || {};
  const rules = intervention?.stopping_rules || {};
  const targetTxId = failure?.tx_id || intervention?.failure_id || 'tx_1001';

  const getActionTheme = (act) => {
    switch (act) {
      case 'AUTO_RETRY':
        return {
          title: "Autonomous Exponential Backoff",
          desc: "System will re-attempt transaction through optimized banking switch without customer interruption.",
          color: "text-brand-400",
          border: "border-brand-500/40",
          bg: "bg-brand-500/10"
        };
      case 'CUSTOMER_SMS':
        return {
          title: "Dynamic Customer SMS Recovery Link",
          desc: "Sends instant SMS with tokenized 24-hour retry link for customer to complete with alternate payment method.",
          color: "text-purple-400",
          border: "border-purple-500/40",
          bg: "bg-purple-500/10"
        };
      case 'VOICE_CALL':
        return {
          title: "AI Voice Concierge Call (Hinglish)",
          desc: "Outbound personalized voice call for VIP customers with WhatsApp instant checkout link delivery.",
          color: "text-emerald-400",
          border: "border-emerald-500/40",
          bg: "bg-emerald-500/10"
        };
      case 'MANUAL_ESCALATION':
      default:
        return {
          title: "Manual Ops Desk Escalation",
          desc: "Routes to risk and customer support team to prevent customer dissatisfaction and fraud risk.",
          color: "text-amber-400",
          border: "border-amber-500/40",
          bg: "bg-amber-500/10"
        };
    }
  };

  const theme = getActionTheme(action);
  const interventionId = intervention?.intervention_id || targetTxId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Step 3: Intervention Action Plan
                <span className="text-xs px-2.5 py-0.5 rounded-lg bg-slate-800 text-brand-300 font-mono font-bold border border-slate-700">
                  {action}
                </span>
              </h3>
              <p className="text-xs text-slate-400">Target Tx: <span className="font-mono text-slate-300 font-bold">{targetTxId}</span> (₹{(failure?.amount || 5500).toLocaleString('en-IN')})</p>
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
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {loading ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-200">Evaluating Bounded Rules Matrix...</p>
                <p className="text-xs text-slate-400">Enforcing stopping rules: ≤₹50,000 threshold, ≤3 retries & circuit breakers</p>
              </div>
            </div>
          ) : (
            <>
              {/* Selected Action Card */}
              <div className={`p-4 rounded-xl border ${theme.border} ${theme.bg} space-y-2`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Autonomous Decision Outcome</span>
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-900/90 font-mono font-bold text-white border border-slate-700">
                    {action}
                  </span>
                </div>
                <h4 className={`text-base font-bold ${theme.color}`}>{theme.title}</h4>
                <p className="text-xs text-slate-300">{theme.desc}</p>
                {intervention?.reasoning && (
                  <p className="text-xs text-slate-400 italic pt-1 border-t border-slate-700/40 font-sans">
                    Reasoning: {intervention.reasoning}
                  </p>
                )}
              </div>

              {/* Action-Specific Parameter Previews */}
              {action === 'VOICE_CALL' && (
                <AudioVisualizer
                  script={params.voice_script || `Namaste ${failure?.customer_name || 'ji'}! Main PaymentGuard AI assistant bol raha hoon on behalf of your merchant. Aapka transaction complete karne ke liye humne aapko 1-click retry link dispatch kar diya hai.`}
                  customerName={failure?.customer_name}
                  amount={failure?.amount || 25000}
                  merchantName={failure?.merchant_id}
                  phone={params.recipient_phone}
                />
              )}

              {action === 'CUSTOMER_SMS' && (
                <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/30 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-purple-400">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4" /> Customer SMS Template
                    </span>
                    <span className="text-slate-400 text-[11px] font-mono">Valid 24 Hours</span>
                  </div>
                  <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-xs text-slate-200 leading-relaxed font-mono">
                    {params.sms_template || `Payment incomplete for Rs. ${failure?.amount || 2500}. Retry securely within 24h at: https://rzp.io/r/pay_recover_${targetTxId}`}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                    <span>Phone: <strong className="text-slate-200 font-mono">{params.recipient_phone || '+919876543210'}</strong></span>
                    <span>Supported Channels: <strong className="text-slate-200">UPI, Card, NetBanking</strong></span>
                  </div>
                </div>
              )}

              {action === 'AUTO_RETRY' && (
                <div className="p-4 rounded-xl bg-slate-950 border border-brand-500/30 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-brand-400">
                    <span>Exponential Backoff Configuration</span>
                    <span className="text-slate-400 text-[11px]">Direct Razorpay Switch</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Retry 1 Delay</span>
                      <span className="text-sm font-bold text-slate-200">{params.retry_delay?.[0] || 5} min</span>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Retry 2 Delay</span>
                      <span className="text-sm font-bold text-slate-200">{params.retry_delay?.[1] || 15} min</span>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Retry 3 Delay</span>
                      <span className="text-sm font-bold text-slate-200">{params.retry_delay?.[2] || 60} min</span>
                    </div>
                  </div>
                </div>
              )}

              {action === 'MANUAL_ESCALATION' && (
                <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-amber-400">
                    <span>Merchant Operations Escalation Desk</span>
                    <span className="text-slate-400 text-[11px] uppercase font-bold">Priority: {params.priority || 'HIGH'}</span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs text-slate-300">
                    Routing to: <strong className="text-white">{params.assigned_to || 'Senior Support Team'}</strong> (Reason: {params.reason || 'Safety threshold bounds'})
                  </div>
                </div>
              )}

              {/* Bounded Rules Verification Card */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Bounded Workflow Constraints Enforced:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex items-center gap-1.5 text-slate-300">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Max Retries: ≤ {rules.max_retries || 3}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex items-center gap-1.5 text-slate-300">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Amount Limit: ≤ ₹50,000</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex items-center gap-1.5 text-slate-300">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Circuit Breaker: Active</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onExecute(interventionId)}
            disabled={loading}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/40 transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            <Zap className="w-4 h-4 fill-current" /> Execute Recovery Action
          </button>
        </div>
      </div>
    </div>
  );
}
