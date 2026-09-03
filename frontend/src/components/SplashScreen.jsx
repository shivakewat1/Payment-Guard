import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function SplashScreen({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex flex-col items-center justify-center z-50 overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8 }}
    >
      {/* Ambient glowing radial backdrop */}
      <div className="absolute w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Animated Logo Container */}
      <motion.div
        className="relative w-36 h-36 flex items-center justify-center"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Outer Ring - Rotating */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 border-r-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.4)]"
          animate={{ rotate: 360 }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Middle Ring - Counter Rotating */}
        <motion.div
          className="absolute inset-3 rounded-full border-2 border-transparent border-b-blue-400 border-l-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Shield / Logo Center */}
        <motion.div
          className="relative z-10 flex items-center justify-center"
          animate={{ 
            scale: [1, 1.08, 1],
            filter: [
              "drop-shadow(0 0 15px rgba(34, 211, 238, 0.5))",
              "drop-shadow(0 0 30px rgba(34, 211, 238, 0.8))",
              "drop-shadow(0 0 15px rgba(34, 211, 238, 0.5))"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <img 
            src="/logo.png" 
            alt="PaymentGuard Shield Logo" 
            className="w-18 h-18 w-20 h-20 rounded-2xl object-contain border border-cyan-400/40 p-1 bg-slate-900/80 shadow-2xl"
          />
        </motion.div>
      </motion.div>

      {/* Brand Title & Subtitle */}
      <motion.div
        className="text-center mt-8 space-y-2 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent font-sans tracking-tight">
          PaymentGuard
        </h1>
        <p className="text-cyan-300/80 text-xs sm:text-sm font-medium tracking-wide">
          Autonomous AI Revenue Recovery Agent • Razorpay Track 03
        </p>
      </motion.div>

      {/* Loading Dots */}
      <motion.div 
        className="flex gap-2.5 mt-8 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2.5 h-2.5 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.7)]"
            animate={{ 
              y: [0, -8, 0],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{ 
              duration: 1.1, 
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </motion.div>

      {/* Skip button for quick testing */}
      <motion.button
        onClick={onComplete}
        className="absolute bottom-8 px-3 py-1 rounded-full text-[11px] font-mono text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30 border border-transparent transition-all"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Press to skip →
      </motion.button>
    </motion.div>
  );
}
