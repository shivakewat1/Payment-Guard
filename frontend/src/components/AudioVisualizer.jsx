import React, { useState, useEffect } from 'react';
import { Play, Square, Volume2, PhoneCall, CheckCircle2, Sparkles, UserCheck } from 'lucide-react';
import { soundService } from '../services/audio';

export default function AudioVisualizer({ script, customerName, amount, merchantName, phone }) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      soundService.stopSpeaking();
    };
  }, []);

  const handleTogglePlay = () => {
    if (isPlaying) {
      soundService.stopSpeaking();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      soundService.speakHinglish(script, () => {
        setIsPlaying(false);
      });
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-emerald-500/30 space-y-4 shadow-xl relative overflow-hidden">
      
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <PhoneCall className="w-5 h-5" />
            </div>
            {isPlaying && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-950 animate-ping" />
            )}
          </div>
          <div>
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              Outbound Conversational Voice Call
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                HINGLISH
              </span>
            </span>
            <p className="text-[11px] text-slate-400">
              Agent Persona: <strong className="text-slate-200">Priya (Razorpay Concierge)</strong> • To: <span className="font-mono text-slate-300">{phone || '+919876543210'}</span>
            </p>
          </div>
        </div>

        {/* Audio play/stop button */}
        <button
          onClick={handleTogglePlay}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg ${
            isPlaying
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-900/40 hover:scale-[1.02]'
          }`}
        >
          {isPlaying ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" /> Stop Call
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5" /> Listen to AI Voice
            </>
          )}
        </button>
      </div>

      {/* Animated Soundwave bar (when playing or active) */}
      <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 h-8 px-2">
          {[18, 28, 14, 32, 24, 10, 30, 20, 16, 26, 32, 18, 22, 14, 28, 20].map((height, idx) => (
            <div
              key={idx}
              className={`w-1 rounded-full transition-all duration-200 ${
                isPlaying ? 'bg-gradient-to-t from-emerald-500 to-teal-300 soundwave-bar' : 'bg-slate-700 h-2'
              }`}
              style={{
                height: isPlaying ? `${Math.max(6, (height + (idx % 3) * 6))}px` : '6px',
                animationDelay: `${(idx * 0.08)}s`
              }}
            />
          ))}
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono text-slate-400 block">Session Status</span>
          <span className={`text-xs font-bold flex items-center justify-end gap-1.5 ${isPlaying ? 'text-emerald-400' : 'text-slate-400'}`}>
            <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
            {isPlaying ? 'Call in progress...' : 'Ready for playback'}
          </span>
        </div>
      </div>

      {/* Spoken Dialogue script */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
          Conversational Script Dialogue:
        </span>
        <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans italic border-l-4 border-l-emerald-500">
          "{script}"
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
        <span className="flex items-center gap-1.5">
          <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> High-Value VIP Target: ₹{amount?.toLocaleString('en-IN')}
        </span>
        <span className="text-emerald-400 font-medium">WhatsApp 1-Click Link Dispatched</span>
      </div>
    </div>
  );
}
