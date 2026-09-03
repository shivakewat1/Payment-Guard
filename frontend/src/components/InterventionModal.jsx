import React from 'react';
import { X, ShieldCheck, Zap, PhoneCall, MessageSquare, AlertCircle, RefreshCw, CheckCircle, ArrowRight } from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';

export default function InterventionModal({ intervention, failure, onClose, onExecute, loading }) {
  if (!intervention && !loading) return null;

  const action = intervention?.action;
  const params = intervention?.parameters || {};
  const rules = intervention?.stopping_rules || {};

  const getActionTheme = () => {
    switch (action) {
      case 'AUTO_RETRY':
        return {
          icon: RefreshCw,
          color: 'text-brand-400',
          bg: 'bg-brand-500/10',
          border: 'border-brand-500/30',
          title: 'Autonomous Gateway Retry',
          desc: 'Direct switch re-authorization with exponential backoff delays.'
        };
      case 'CUSTOMER_SMS':
        return {
          icon: MessageSquare,
          color: 'text-purple-400',
          bg: 'bg-purple-500/10',
          border: 'border-purple-500/30',
          title: 'Targeted Customer SMS Link',
          desc: 'Dispatches 1-click alternative payment link via SMS (Valid 24h).'
        };
      case 'VOICE_CALL':
        return {
          icon: PhoneCall,
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          title: 'Conversational Hinglish AI Voice',
          desc: 'Outbound voice recovery call for high-ticket VIP merchant customers.'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-amber-400',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          title: 'Manual Escalation to Ops',
          desc: 'High risk or configuration anomaly routed directly to Support Desk.'
        };
    }
  };

  const theme = getActionTheme();
  const IconComponent = theme.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/70 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl border ${theme.bg} ${theme.color} ${theme.border}`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Step 3: Intervention Plan
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {intervention?.intervention_id}
                </span>
              </h3>
              <p className="text-xs text-slate-400">Target Tx: <span className="font-mono text-slate-300">{failure?.tx_id}</span> (₹{failure?.amount?.toLocaleString('en-IN')})</p>
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
              <p className="text-sm text-slate-300">Decision engine is evaluating bounded workflow boundaries...</p>
            </div>
          ) : (
            <>
              {/* Selected Action Card */}
              <div className={`p-4 rounded-xl border ${theme.border} ${theme.bg} space-y-2`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Decision Outcome</span>
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-900/80 font-mono font-bold text-white border border-slate-700">
                    {action}
                  </span>
                </div>
                <h4 className={`text-base font-bold ${theme.color}`}>{theme.title}</h4>
                <p className="text-xs text-slate-300">{theme.desc}</p>
                {intervention?.reasoning && (
                  <p className="text-xs text-slate-400 italic pt-1 border-t border-slate-700/40">
                    Reasoning: {intervention.reasoning}
                  </p>
                )}
              </div>

              {/* Action-Specific Parameter Previews */}
              {action === 'VOICE_CALL' && (
                <AudioVisualizer
                  script={params.voice_script}
                  customerName={failure?.customer_name}
                  amount={failure?.amount}
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
                    <span className="text-slate-400 text-[11px]">Valid 24 Hours</span>
                  </div>
                  <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-xs text-slate-200 leading-relaxed font-mono">
                    {params.sms_template}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                    <span>Phone: <strong className="text-slate-200">{params.recipient_phone}</strong></span>
                    <span>Channels: <strong className="text-slate-200">UPI, Card, NetBanking</strong></span>
                  </div>
                </div>
              )}

              {action === 'AUTO_RETRY' && (
                <div className="p-4 rounded-xl bg-slate-950 border border-brand-500/30 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-brand-400">
                    <span>Exponential Backoff Configuration</span>
                    <span className="text-slate-400 text-[11px]">Direct Switch</span>
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
                    <span>Merchant Operations Escalation</span>
                    <span className="text-slate-400 text-[11px]">Priority: {params.priority?.toUpperCase()}</span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs text-slate-300">
                    Ticket dispatched to: <strong className="text-white">{params.assigned_to}</strong>
                  </div>
                </div>
              )}

              {/* Bounded Rules Verification Card */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
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
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onExecute(intervention.intervention_id)}
            disabled={loading}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            <Zap className="w-4 h-4 fill-current" /> Execute Recovery Action
          </button>
        </div>
      </div>
    </div>
  );
}
