import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar, Line, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { BarChart3, Search, CheckCircle2, TrendingUp, Zap, Activity } from 'lucide-react';

const defaultData = [
  { time: '00:00', detected: 10, recovered: 5, rate: 50.0 },
  { time: '02:30', detected: 25, recovered: 13, rate: 52.0 },
  { time: '05:00', detected: 40, recovered: 22, rate: 55.0 },
  { time: '07:30', detected: 60, recovered: 33, rate: 55.0 },
  { time: '10:00', detected: 80, recovered: 44, rate: 55.0 },
  { time: '12:30', detected: 100, recovered: 56, rate: 56.0 },
];

export default function InteractiveRecoveryChart({ chartData, metrics }) {
  const [selectedMetric, setSelectedMetric] = useState('all');
  const activeData = chartData && chartData.length > 0 ? chartData : defaultData;

  const recoveredTx = metrics?.recovery_metrics?.payments_recovered ?? 56;
  const ratePercent = (metrics?.recovery_metrics?.recovery_rate_percent ?? 56.0).toFixed(1);
  const avgSpeed = metrics?.quality_metrics?.avg_recovery_time_minutes ?? 2.3;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#151515] border border-slate-700 rounded-2xl p-4 shadow-2xl text-white space-y-2 min-w-[160px]"
        >
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <span className="font-mono text-xs font-bold text-[#FF6A00]">TIME: {label}</span>
            <span className="w-2 h-2 rounded-full bg-[#FF6A00] animate-ping" />
          </div>
          {payload.map((entry, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 font-medium">{entry.name}:</span>
              <span className="font-bold ml-3" style={{ color: entry.color || '#FF6A00' }}>
                {typeof entry.value === 'number' ? (entry.name.includes('Rate') ? `${entry.value.toFixed(1)}%` : entry.value) : entry.value}
              </span>
            </div>
          ))}
        </motion.div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-slate-300 bg-white p-6 shadow-md space-y-6"
    >
      {/* Header with interactive controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="font-display font-black text-xl text-[#151515] uppercase tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#FF6A00]" />
            RECOVERY TELEMETRY & CURVE
          </h2>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Interactive real-time telemetry • Select metric channels to analyze bounded performance
          </p>
        </div>
        
        <div className="flex gap-2 flex-wrap font-mono text-xs font-bold">
          {[
            { id: 'all', label: 'ALL METRICS', icon: <BarChart3 className="w-3.5 h-3.5" /> },
            { id: 'detected', label: 'DETECTED', icon: <Search className="w-3.5 h-3.5" /> },
            { id: 'recovered', label: 'RECOVERED', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
            { id: 'rate', label: 'RATE %', icon: <TrendingUp className="w-3.5 h-3.5" /> },
          ].map(metric => (
            <button
              key={metric.id}
              onClick={() => setSelectedMetric(metric.id)}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                selectedMetric === metric.id
                  ? 'bg-[#FF6A00] text-white shadow-md'
                  : 'bg-slate-100 text-[#151515] hover:bg-slate-200 border border-slate-300'
              }`}
            >
              {metric.icon}
              <span>{metric.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Chart */}
      <div className="h-80 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={activeData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRecoveredOrange" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6A00" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#FF6A00" stopOpacity={0.02}/>
              </linearGradient>
              <linearGradient id="colorDetectedBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2A2A2A"/>
                <stop offset="100%" stopColor="#151515"/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" vertical={false} />
            <XAxis dataKey="time" stroke="#777777" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono', fontWeight: 600 }} />
            <YAxis stroke="#777777" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono', fontWeight: 600 }} />
            <Tooltip content={<CustomTooltip />} />
            
            {selectedMetric === 'all' && (
              <>
                <Bar 
                  name="Detected Failures"
                  dataKey="detected" 
                  fill="url(#colorDetectedBar)" 
                  radius={[8, 8, 0, 0]}
                  barSize={28}
                />
                <Area 
                  type="monotone" 
                  name="Recovered Capital"
                  dataKey="recovered" 
                  stroke="#FF6A00" 
                  fill="url(#colorRecoveredOrange)"
                  strokeWidth={3}
                  dot={{ fill: '#FF6A00', r: 4, strokeWidth: 2, stroke: '#FFFFFF' }}
                />
              </>
            )}
            
            {selectedMetric === 'detected' && (
              <Bar 
                name="Detected Failures"
                dataKey="detected" 
                fill="#FF6A00" 
                radius={[8, 8, 0, 0]}
                barSize={36}
              />
            )}
            
            {selectedMetric === 'recovered' && (
              <Area 
                type="monotone" 
                name="Recovered Capital"
                dataKey="recovered" 
                stroke="#FF6A00" 
                fill="url(#colorRecoveredOrange)"
                strokeWidth={3}
                dot={{ fill: '#FF6A00', r: 5, strokeWidth: 2, stroke: '#FFFFFF' }}
              />
            )}
            
            {selectedMetric === 'rate' && (
              <Line 
                type="monotone" 
                name="Success Rate %"
                dataKey="rate" 
                stroke="#FF6A00" 
                strokeWidth={3}
                dot={{ fill: '#FF6A00', r: 6, strokeWidth: 2, stroke: '#FFFFFF' }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200">
        <InfoCard label="Peak Recovery" value={recoveredTx} unit="transactions saved" icon={<Activity className="w-4 h-4 text-[#FF6A00]" />} />
        <InfoCard label="Average Recovery Rate" value={`${ratePercent}%`} unit="target benchmark >45%" icon={<TrendingUp className="w-4 h-4 text-[#FF6A00]" />} />
        <InfoCard label="Avg Resolution Speed" value={`${avgSpeed} min`} unit="sub-3min bounded speed" icon={<Zap className="w-4 h-4 text-[#FF6A00]" />} />
      </div>
    </motion.div>
  );
}

function InfoCard({ label, value, unit, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
      <div className="flex items-center justify-center gap-1.5 font-mono text-xs text-slate-500 font-bold mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <p className="font-mono text-2xl font-black text-[#151515]">{value}</p>
      <p className="text-[11px] text-slate-500 font-medium mt-0.5">{unit}</p>
    </div>
  );
}
