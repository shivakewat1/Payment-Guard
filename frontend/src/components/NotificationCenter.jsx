import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X, Bell, Trash2 } from 'lucide-react';

export function useNotification() {
  const [notifications, setNotifications] = useState([]);
  const [history, setHistory] = useState([
    { id: 1, message: 'PaymentGuard Engine initialized', type: 'info', timestamp: '10:00 AM' },
    { id: 2, message: 'Telemetric risk scoring active (0-100)', type: 'success', timestamp: '10:01 AM' },
    { id: 3, message: 'Claude 3.5 AI Diagnostic connected', type: 'success', timestamp: '10:02 AM' }
  ]);

  const notify = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const item = { id, message, type, timestamp };

    setNotifications(prev => [...prev, item]);
    setHistory(prev => [item, ...prev].slice(0, 20)); // keep last 20

    // Auto-remove floating toast after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return { notifications, history, notify, removeNotification, clearHistory };
}

export function NotificationCenter({ notifications = [], onClose }) {
  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'error': return <XCircle className="w-4 h-4 text-rose-600 shrink-0" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-[#FF6A00] shrink-0" />;
      default: return <Info className="w-4 h-4 text-[#151515] shrink-0" />;
    }
  };

  const getStyle = (type) => {
    switch (type) {
      case 'success': return 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-emerald-500/10';
      case 'error': return 'bg-rose-50 border-rose-300 text-rose-950 shadow-rose-500/10';
      case 'warning': return 'bg-orange-50 border-orange-300 text-orange-950 shadow-orange-500/10';
      default: return 'bg-white border-slate-300 text-[#151515] shadow-black/10';
    }
  };

  return (
    <div className="fixed top-20 right-6 z-50 space-y-2.5 max-w-md w-full pointer-events-none">
      <AnimatePresence>
        {notifications.map(notif => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 50, scale: 0.85 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`rounded-2xl border ${getStyle(notif.type)} p-4 flex items-center gap-3 shadow-2xl pointer-events-auto backdrop-blur-md font-mono text-xs font-bold`}
          >
            <span className="p-1.5 rounded-xl bg-white/80 border border-slate-200 shadow-xs">{getIcon(notif.type)}</span>
            <p className="leading-snug flex-1 font-sans text-xs font-semibold text-[#151515]">{notif.message}</p>
            {onClose && (
              <button
                onClick={() => onClose(notif.id)}
                className="opacity-60 hover:opacity-100 text-slate-500 hover:text-[#151515] shrink-0 p-1"
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

export function NotificationDrawer({ isOpen, onClose, history = [], onClear }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 300, opacity: 0 }}
        className="w-full max-w-sm bg-white border border-slate-300 rounded-3xl shadow-2xl flex flex-col overflow-hidden h-full max-h-[90vh] my-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#151515] text-white rounded-xl">
              <Bell className="w-4 h-4 text-[#FF6A00]" />
            </div>
            <div>
              <h3 className="font-display font-black text-sm text-[#151515] uppercase">NOTIFICATION CENTER</h3>
              <p className="text-[10px] text-slate-500 font-mono">ACTIVITY LOG ({history.length})</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onClear && (
              <button onClick={onClear} title="Clear Log History" className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-[#151515]">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {history.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-mono text-xs font-bold">
              NO RECENT NOTIFICATIONS
            </div>
          ) : (
            history.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-[#FF6A00] uppercase">{item.type}</span>
                  <span className="font-mono text-[10px] text-slate-400">{item.timestamp || 'Just now'}</span>
                </div>
                <p className="text-xs font-semibold text-[#151515] leading-relaxed">{item.message}</p>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
