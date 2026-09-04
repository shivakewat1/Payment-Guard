import React from 'react';
import { X, ShieldCheck, Zap, MessageSquare, CheckCircle } from 'lucide-react';
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
        };
      case 'CUSTOMER_SMS':
        return {
          title: "Dynamic Customer SMS Recovery Link",
          desc: "Sends instant SMS with tokenized 24-hour retry link for customer to complete with alternate payment method.",
        };
      case 'VOICE_CALL':
        return {
          title: "AI Voice Concierge Call (Hinglish)",
          desc: "Outbound personalized voice call for VIP customers with WhatsApp instant checkout link delivery.",
        };
      case 'MANUAL_ESCALATION':
      default:
        return {
          title: "Manual Ops Desk Escalation",
          desc: "Routes to risk and customer support team to prevent customer dissatisfaction and fraud risk.",
        };
    }
  };

  const theme = getActionTheme(action);
  const interventionId = intervention?.intervention_id || targetTxId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-300 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#151515] text-white rounded-xl">
              <Zap className="w-5 h-5 text-[#FF6A00]" />
            </div>
            <div>
              <h3 className="font-display font-black text-base text-[#151515] uppercase tracking-tight flex items-center gap-2">
                STEP 3: INTERVENTION ACTION PLAN
                <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-slate-200 text-slate-900 font-bold border border-slate-300">
                  {action}
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">TARGET TX: <span className="font-mono text-[#151515] font-bold">{targetTxId}</span> (₹{(failure?.amount || 5500).toLocaleString('en-IN')})</p>
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
                <p className="font-mono text-sm font-bold text-[#151515]">EVALUATING BOUNDED RULES MATRIX...</p>
                <p className="text-xs text-slate-500 font-medium">Enforcing stopping rules: ≤₹50,000 threshold, ≤3 retries & circuit breakers</p>
              </div>
            </div>
          ) : (
            <>
              {/* Selected Action Card */}
              <div className="p-5 rounded-2xl border border-slate-300 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">AUTONOMOUS DECISION OUTCOME</span>
                  <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#151515] text-white font-bold">
                    {action}
                  </span>
                </div>
                <h4 className="font-display font-black text-base text-[#151515] uppercase tracking-tight">{theme.title}</h4>
                <p className="text-xs text-slate-600 font-medium">{theme.desc}</p>
                {intervention?.reasoning && (
                  <p className="text-xs text-slate-500 italic pt-2 border-t border-slate-200 font-sans">
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
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-300 space-y-3">
                  <div className="flex items-center justify-between font-mono text-xs font-bold text-[#151515]">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-[#FF6A00]" /> CUSTOMER SMS TEMPLATE
                    </span>
                    <span className="text-slate-500 text-[10px]">VALID 24 HOURS</span>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 font-mono leading-relaxed">
                    {params.sms_template || `Payment incomplete for Rs. ${failure?.amount || 2500}. Retry securely within 24h at: https://rzp.io/r/pay_recover_${targetTxId}`}
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-1">
                    <span>Phone: <strong className="text-[#151515]">{params.recipient_phone || '+919876543210'}</strong></span>
                    <span>Channels: <strong className="text-[#151515]">UPI, Card, NetBanking</strong></span>
                  </div>
                </div>
              )}

              {action === 'AUTO_RETRY' && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-300 space-y-3">
                  <div className="flex items-center justify-between font-mono text-xs font-bold text-[#151515]">
                    <span>EXPONENTIAL BACKOFF CONFIGURATION</span>
                    <span className="text-slate-500 text-[10px]">DIRECT RAZORPAY SWITCH</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="font-mono text-[10px] text-slate-500 block">RETRY 1</span>
                      <span className="font-mono text-sm font-bold text-[#151515]">{params.retry_delay?.[0] || 5} min</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="font-mono text-[10px] text-slate-500 block">RETRY 2</span>
                      <span className="font-mono text-sm font-bold text-[#151515]">{params.retry_delay?.[1] || 15} min</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="font-mono text-[10px] text-slate-500 block">RETRY 3</span>
                      <span className="font-mono text-sm font-bold text-[#151515]">{params.retry_delay?.[2] || 60} min</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bounded Rules Verification Card */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-2.5">
                <span className="font-mono text-xs text-emerald-900 font-bold uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" /> BOUNDED WORKFLOW CONSTRAINTS ENFORCED:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-white border border-emerald-200 flex items-center gap-1.5 text-emerald-900 font-medium">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Max Retries: ≤ {rules.max_retries || 3}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-emerald-200 flex items-center gap-1.5 text-emerald-900 font-medium">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Amount Limit: ≤ ₹50,000</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-emerald-200 flex items-center gap-1.5 text-emerald-900 font-medium">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Circuit Breaker: Active</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-mono text-xs font-bold transition-colors"
          >
            CANCEL
          </button>
          <button
            onClick={() => onExecute(interventionId)}
            disabled={loading}
            className="px-6 py-2.5 bg-[#FF6A00] hover:bg-[#e05d00] text-white rounded-xl font-mono text-xs font-bold flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
          >
            <Zap className="w-4 h-4 fill-current text-white" />
            <span>EXECUTE RECOVERY ACTION</span>
          </button>
        </div>
      </div>
    </div>
  );
}
