import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function AnimatedCounter({ 
  end = 0, 
  duration = 1500, 
  label, 
  icon,
  prefix = '',
  suffix = '',
  decimals = 0
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    const targetEnd = typeof end === 'number' ? end : parseFloat(end) || 0;
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (easeOutExpo)
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentVal = easeProgress * targetEnd;
      
      setCount(decimals > 0 ? parseFloat(currentVal.toFixed(decimals)) : Math.floor(currentVal));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [end, duration, decimals]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.04, y: -2 }}
      className="relative rounded-2xl border border-cyan-400/30 bg-slate-900/60 backdrop-blur-md p-6 cursor-pointer group shadow-xl hover:border-cyan-400/60 transition overflow-hidden"
    >
      {/* Subtle ambient light glow on card hover */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      />

      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-xs text-cyan-300/80 uppercase font-semibold tracking-wider flex items-center gap-1.5">
            <span className="text-cyan-400 shrink-0">{icon}</span>
            <span>{label}</span>
          </p>
          <motion.p
            className="text-3xl font-black text-white mt-2 font-mono"
            key={count}
          >
            {prefix}{count.toLocaleString()}{suffix}
          </motion.p>
        </div>
        
        {/* Animated circle background on hover */}
        <motion.div
          whileHover={{
            scale: [1, 1.15, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ duration: 0.5 }}
          className="w-14 h-14 rounded-2xl bg-gradient-to-r from-cyan-400/20 to-blue-500/20 border border-cyan-400/30 flex items-center justify-center shadow-inner shrink-0 text-cyan-300"
        >
          <div className="w-6 h-6 flex items-center justify-center">{icon}</div>
        </motion.div>
      </div>
    </motion.div>
  );
}
