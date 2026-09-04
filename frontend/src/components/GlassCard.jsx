import { motion } from 'framer-motion';

export default function GlassCard({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -2 }}
      className={`relative rounded-3xl border border-slate-300 bg-white p-6 shadow-md transition-all ${className}`}
    >
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
