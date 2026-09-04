import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export function useNotification() {
  const [notifications, setNotifications] = useState([]);

  const notify = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return { notifications, notify, removeNotification };
}

export function NotificationCenter({ notifications = [], onClose }) {
  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'error': return <XCircle className="w-4 h-4 text-rose-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-[#FF6A00]" />;
      default: return <Info className="w-4 h-4 text-[#151515]" />;
    }
  };

  const getStyle = (type) => {
    switch (type) {
      case 'success': return 'bg-emerald-50 border-emerald-300 text-emerald-900';
      case 'error': return 'bg-rose-50 border-rose-300 text-rose-900';
      case 'warning': return 'bg-orange-50 border-orange-300 text-orange-900';
      default: return 'bg-white border-slate-300 text-[#151515]';
    }
  };

  return (
    <div className="fixed top-6 right-6 z-50 space-y-2.5 max-w-sm pointer-events-none">
      <AnimatePresence>
        {notifications.map(notif => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 50, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 250, damping: 20 }}
            className={`rounded-2xl border ${getStyle(notif.type)} p-3.5 flex items-center gap-3 shadow-xl pointer-events-auto font-mono text-xs font-bold`}
          >
            <span className="shrink-0">{getIcon(notif.type)}</span>
            <p className="leading-snug flex-1">{notif.message}</p>
            {onClose && (
              <button
                onClick={() => onClose(notif.id)}
                className="opacity-60 hover:opacity-100 shrink-0 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
