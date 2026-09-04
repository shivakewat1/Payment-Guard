import React, { useState } from 'react';
import { X, Video, Clock, CheckCircle2, Copy } from 'lucide-react';

export default function VideoGuideModal({ onClose, onDemoGraceful }) {
  const [copied, setCopied] = useState(false);

  const sections = [
    {
      time: "0:00 - 0:30",
      title: "Problem Statement",
      desc: "Merchants lose crores daily to payment failures (transient timeouts, card limits, OTP timeouts). 30-40% are never recovered. Manual recovery is slow, expensive, and error-prone.",
      hindi: "₹ हर दिन merchants lose करते हैं payment failures से। Manual recovery slow, expensive, aur error-prone है। 30-40% unrecovered payments directly revenue leak karti hain."
    },
    {
      time: "0:30 - 1:00",
      title: "PaymentGuard Solution Overview",
      desc: "Autonomous, bounded, explainable AI agent running 4 steps: Detect (Risk 0-100), Diagnose (Claude 3.5 AI), Intervene (Bounded rules), and Execute with immutable audit trails.",
      hindi: "PaymentGuard ek AI agent hai jo: Failures detect karta hai, Claude AI se root cause nikalta hai, safe auto-recovery karta hai, aur complete audit trail maintain karta hai."
    },
    {
      time: "1:00 - 3:00",
      title: "Live Interactive Demo",
      desc: "1. Show 100 failed transactions (₹25.7L at risk)\n2. Click 'Run AI Recovery Pipeline'\n3. Demonstrate Graceful Failure handling on tx_1001 (Retry 1 fail -> Retry 2 fail -> Retry 3 success)\n4. Open Hinglish Voice Script and SMS recovery templates.",
      actionBtn: true
    },
    {
      time: "3:00 - 3:30",
      title: "Honest Measured Metrics",
      desc: "56 payments recovered out of 100 (56.0% recovery rate). ₹13,15,647 direct capital recovered. 100% of actions tracked in immutable audit logs. Zero unbounded retries.",
      hindi: "56 payments recovered out of 100 (56% recovery rate). ₹13.15 lakh recovered. All actions audit-logged."
    },
    {
      time: "3:30 - 4:30",
      title: "Why it Matters for Razorpay",
      desc: "In the agentic commerce era, built-in revenue recovery is a must-have differentiator. Merchants are saved from churn, increasing lifetime GMV on Razorpay.",
      hindi: "Razorpay ke liye: Agent-to-agent commerce ke liye built-in revenue recovery must-have hai. Merchants ko loss se bachao, they stay with the platform."
    },
    {
      time: "4:30 - 5:00",
      title: "Architecture & Safety Bounding",
      desc: "Built with FastAPI, React 18, Claude 3.5 Sonnet, PostgreSQL. Strict safety boundaries: max 3 retries, no auto-retry > ₹50k without manual approval, circuit breaker active."
    }
  ];

  const handleCopySummary = () => {
    const text = `Project: PaymentGuard - AI Revenue Recovery Agent
Platform: PaymentGuard Revenue Recovery Engine
Architecture: Detect -> Diagnose (Claude AI) -> Intervene (Bounded Engine) -> Execute & Audit

Results on 100 Failed Transactions:
- Total at Risk: ₹25,72,335
- Payments Recovered: 56 (56.0% Recovery Rate)
- Revenue Recovered: ₹13,15,647
- Audit Logs: 100% Verifiable & Compliant`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white border border-slate-300 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#151515] text-white rounded-xl">
              <Video className="w-5 h-5 text-[#FF6A00]" />
            </div>
            <div>
              <h3 className="font-display font-black text-base text-[#151515] uppercase tracking-tight">
                5-MINUTE SUBMISSION VIDEO GUIDE
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Autonomous Revenue Recovery Engine • Video Guide Script
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-[#151515] p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {sections.map((sec, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#151515] flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#FF6A00]" /> {sec.time}: {sec.title}
                </span>
                {sec.actionBtn && (
                  <button
                    onClick={() => {
                      onClose();
                      if (onDemoGraceful) onDemoGraceful();
                    }}
                    className="px-3 py-1 rounded-lg bg-[#FF6A00] text-white font-mono text-[11px] font-bold shadow-xs"
                  >
                    ⭐ DEMO TX_1001
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-600 font-medium whitespace-pre-line leading-relaxed">
                {sec.desc}
              </p>

              {sec.hindi && (
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-700 italic font-medium">
                  💡 <strong>Suggested Pitch (Hinglish):</strong> "{sec.hindi}"
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleCopySummary}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            {copied ? 'SUMMARY COPIED!' : 'COPY SUBMISSION SUMMARY'}
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#151515] hover:bg-black text-white rounded-xl font-mono text-xs font-bold transition-colors shadow-md"
          >
            GOT IT, LET'S RECORD!
          </button>
        </div>

      </div>
    </div>
  );
}
