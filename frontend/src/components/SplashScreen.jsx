import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function SplashScreen({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div 
      className="fixed inset-0 bg-[#E9E9E9] flex flex-col items-center justify-center z-50 overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
    >
      {/* Soft ambient orange radial halo */}
      <div className="absolute w-[450px] h-[450px] bg-[#FF6A00]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Animated Logo Rings & Shield Card */}
      <motion.div
        className="relative w-36 h-36 flex items-center justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Outer Ring - Rotating Orange */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#FF6A00] border-r-[#FF6A00] shadow-[0_0_20px_rgba(255,106,0,0.25)]"
          animate={{ rotate: 360 }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Middle Ring - Counter Rotating Dark */}
        <motion.div
          className="absolute inset-3 rounded-full border-2 border-transparent border-b-[#151515] border-l-[#151515]"
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Shield / Logo Center */}
        <motion.div
          className="relative z-10 flex items-center justify-center"
          animate={{ 
            scale: [1, 1.06, 1],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-20 h-20 rounded-2xl border border-slate-300 bg-white shadow-2xl p-2.5 flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="PaymentGuard Logo" className="w-full h-full object-contain" />
          </div>
        </motion.div>
      </motion.div>

      {/* Brand Title & Subtitle */}
      <motion.div
        className="text-center mt-8 space-y-2 z-10"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
      >
        <h1 className="text-3xl sm:text-4xl font-display font-black italic tracking-tighter uppercase leading-none select-none">
          <span className="text-[#151515]">PAYMENT</span>{' '}
          <span className="text-[#FF6A00]">GUARD</span>
        </h1>
        <p className="text-[#555555] text-xs sm:text-sm font-mono font-bold tracking-wider uppercase">
          Autonomous AI Revenue Recovery Engine
        </p>
      </motion.div>

      {/* Orange Loading Dots */}
      <motion.div 
        className="flex gap-2.5 mt-8 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2.5 h-2.5 bg-[#FF6A00] rounded-full shadow-[0_0_8px_rgba(255,106,0,0.5)]"
            animate={{ 
              y: [0, -8, 0],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{ 
              duration: 1, 
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
