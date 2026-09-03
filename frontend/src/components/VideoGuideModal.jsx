import React, { useState } from 'react';
import { X, Video, Clock, CheckCircle2, Copy, Sparkles, Zap, ShieldCheck } from 'lucide-react';

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
      desc: "32 payments recovered out of 100 (32.0% recovery rate). ₹7,80,000+ direct capital recovered. 100% of actions tracked in immutable audit logs. Zero unbounded retries.",
      hindi: "32 payments recovered out of 100 (32% recovery rate). ₹7.8 lakh recovered. All actions audit-logged."
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
Track: 03 - AI Revenue Recovery (Razorpay AI Buildathon)
Architecture: Detect -> Diagnose (Claude AI) -> Intervene (Bounded Engine) -> Execute & Audit
Results on 100 Failed Transactions:
- Total at Risk: ₹25,72,335
- Payments Recovered: 32 (32.0% Recovery Rate)
- Revenue Recovered: ₹7,80,000+
- Audit Logs: 100% Verifiable & Compliant`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-brand-500/20 text-brand-400 rounded-xl border border-brand-500/30">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                5-Minute Submission Video Presentation Script
              </h3>
              <p className="text-xs text-slate-400">
                Razorpay Buildathon Track 03 • Step-by-Step Recording Structure
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

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {sections.map((sec, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-brand-400" /> {sec.time}: {sec.title}
                </span>
                {sec.actionBtn && (
                  <button
                    onClick={() => {
                      onClose();
                      if (onDemoGraceful) onDemoGraceful();
                    }}
                    className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition-all"
                  >
                    ⭐ Launch tx_1001 Demo
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                {sec.desc}
              </p>

              {sec.hindi && (
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px] text-amber-300/90 italic">
                  💡 <strong>Suggested Pitch (Hinglish):</strong> "{sec.hindi}"
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleCopySummary}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Summary Copied!' : 'Copy Form Submission Summary'}
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Got it, Let's Record!
          </button>
        </div>

      </div>
    </div>
  );
}
