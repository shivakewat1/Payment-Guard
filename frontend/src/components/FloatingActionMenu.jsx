import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, FileText, LayoutDashboard, Filter, Plus, ChevronRight, TrendingUp, DollarSign, ShieldCheck } from 'lucide-react';

export default function FloatingActionMenu({ onSelectAction }) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: <TrendingUp className="w-4 h-4 text-[#FF6A00]" />, label: 'ROI Calculator', action: 'revenue' },
    { icon: <DollarSign className="w-4 h-4 text-[#FF6A00]" />, label: 'Pricing Plans', action: 'pricing' },
    { icon: <ShieldCheck className="w-4 h-4 text-[#FF6A00]" />, label: 'Vs Competitors', action: 'compare' },
    { icon: <Radio className="w-4 h-4 text-[#FF6A00] animate-pulse" />, label: 'Live Pipeline', action: 'live' },
    { icon: <FileText className="w-4 h-4 text-[#FF6A00]" />, label: 'Export PDF', action: 'export' },
    { icon: <LayoutDashboard className="w-4 h-4 text-white" />, label: 'Overview', action: 'overview' },
    { icon: <Filter className="w-4 h-4 text-white" />, label: 'Funnel', action: 'funnel' },
  ];

  const handleItemClick = (action) => {
    setIsOpen(false);
    if (onSelectAction) onSelectAction(action);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-16 right-0 space-y-2.5 mb-2 shrink-0 min-w-[180px]"
          >
            {menuItems.map((item, idx) => (
              <motion.button
                key={item.action}
                initial={{ opacity: 0, scale: 0.5, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 15 }}
                transition={{
                  delay: idx * 0.05,
                  type: 'spring',
                  stiffness: 250,
                  damping: 20
                }}
                whileHover={{ scale: 1.05, x: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleItemClick(item.action)}
                className="flex items-center justify-between gap-3 w-full px-4 py-3 rounded-2xl bg-[#151515] border border-slate-700 text-white font-mono font-bold text-xs shadow-2xl hover:border-[#FF6A00] transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <span className="shrink-0">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ duration: 0.25 }}
        className="w-14 h-14 rounded-2xl bg-[#FF6A00] text-white font-black text-2xl shadow-2xl flex items-center justify-center border border-orange-400 cursor-pointer hover:bg-[#e05d00] transition-colors"
      >
        <Plus className="w-7 h-7 stroke-[3] text-white" />
      </motion.button>
    </div>
  );
}
