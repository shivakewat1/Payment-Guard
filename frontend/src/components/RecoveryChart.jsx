import React from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieIcon, ShieldCheck } from 'lucide-react';

export default function RecoveryChart({ metrics }) {
  const chartData = [
    { time: "00:00", detected: 15, recovered: 6, rate: 40 },
    { time: "03:00", detected: 32, recovered: 16, rate: 50 },
    { time: "06:00", detected: 55, recovered: 28, rate: 51 },
    { time: "09:00", detected: 78, recovered: 42, rate: 54 },
    { time: "12:00", detected: 100, recovered: 56, rate: 56 },
  ];

  const actionDistribution = [
    { name: 'Auto-Retry (Switch)', count: 45, color: '#38bdf8' },
    { name: 'Customer SMS (24h)', count: 35, color: '#c084fc' },
    { name: 'Hinglish Voice (VIP)', count: 10, color: '#34d399' },
    { name: 'Manual Escalation', count: 10, color: '#fbbf24' },
  ];

  const recoveredAmount = metrics?.recovery_metrics?.amount_recovered || 1315647;
  const recoveryRate = metrics?.recovery_metrics?.recovery_rate_percent || 56.0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* Area Chart: Recovery Timeline */}
      <div className="lg:col-span-2 rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-slate-900/70 to-slate-950/80 backdrop-blur p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-cyan-400/15 pb-4">
          <div>
            <h3 className="text-base font-bold text-cyan-300 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" /> Real-time Autonomous Recovery Curve
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Cumulative recovered transactions over dynamic execution timeline
            </p>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
            {recoveryRate.toFixed(1)}% Recovery Rate
          </span>
        </div>

        <div className="h-[280px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDetected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#0f172a", 
                  borderColor: "#0891b2", 
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                  fontSize: "12px"
                }}
                labelStyle={{ color: "#22d3ee", fontWeight: "bold" }}
              />
              <Area 
                type="monotone" 
                dataKey="detected" 
                name="Failures Ingested"
                stroke="#3b82f6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorDetected)" 
              />
              <Area 
                type="monotone" 
                dataKey="recovered" 
                name="Recovered Successfully"
                stroke="#22d3ee" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRecovered)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Action Distribution Breakdown */}
      <div className="rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-slate-900/70 to-slate-950/80 backdrop-blur p-6 shadow-xl space-y-4">
        <div className="border-b border-cyan-400/15 pb-4">
          <h3 className="text-base font-bold text-cyan-300 flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-cyan-400" /> Bounded Recovery Channels
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Target distribution across failure domains
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {actionDistribution.map((item, idx) => (
            <div 
              key={idx} 
              className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between hover:border-cyan-400/40 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span 
                  className="w-3 h-3 rounded-full shadow-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs font-semibold text-slate-200">
                  {item.name}
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-400">
                {item.count} txns
              </span>
            </div>
          ))}
        </div>

        <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-xs text-slate-300 flex items-center justify-between">
          <span className="font-medium text-cyan-300">Total Capital Saved:</span>
          <span className="font-mono font-extrabold text-emerald-400 text-sm">
            ₹{recoveredAmount.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
