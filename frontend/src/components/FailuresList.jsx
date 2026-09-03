import React, { useState } from 'react';
import { Search, Filter, Brain, Zap, Play, FileText, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';

export default function FailuresList({
  failures,
  loading,
  onDiagnose,
  onIntervene,
  onExecute,
  onViewAudit
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filtering
  const filtered = failures.filter(f => {
    const matchesSearch = 
      f.tx_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.merchant_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.reason?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = categoryFilter === 'all' || f.failure_category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;

    return matchesSearch && matchesCat && matchesStatus;
  });

  const getRiskBadge = (score) => {
    if (score >= 70) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          {score}
        </span>
      );
    } else if (score >= 45) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          {score}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {score}
        </span>
      );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'recovered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Recovered
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <XCircle className="w-3 h-3 text-rose-400" /> Failed
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin text-brand-400" /> Processing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
            Detected
          </span>
        );
    }
  };

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'network': return 'text-sky-300 bg-sky-500/10 border-sky-500/20';
      case 'issuer': return 'text-purple-300 bg-purple-500/10 border-purple-500/20';
      case 'merchant': return 'text-amber-300 bg-amber-500/10 border-amber-500/20';
      default: return 'text-slate-300 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      
      {/* Table Controls Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            Failed Transactions Queue
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              {filtered.length} of {failures.length}
            </span>
          </h3>
          <p className="text-xs text-slate-400">Autonomous recovery pipeline prioritized by capital risk score</p>
        </div>

        {/* Filter & Search Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ID, customer, reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950/80 border border-slate-700/70 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950/80 border border-slate-700/70 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-brand-500"
          >
            <option value="all">All Categories</option>
            <option value="network">Network</option>
            <option value="issuer">Issuer</option>
            <option value="merchant">Merchant</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950/80 border border-slate-700/70 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-brand-500"
          >
            <option value="all">All Statuses</option>
            <option value="detected">Detected</option>
            <option value="processing">Processing</option>
            <option value="recovered">Recovered</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md">
              <th className="py-3 px-4">Transaction / Customer</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Failure Reason</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Risk Score</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Recovery Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {loading ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-slate-400">
                  <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Loading transactions from Razorpay switch...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-slate-400">
                  No matching failed transactions found.
                </td>
              </tr>
            ) : (
              filtered.map((f) => {
                const isSpecial = f.is_test_special;
                return (
                  <tr
                    key={f.tx_id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isSpecial ? 'bg-brand-950/30 border-l-4 border-l-brand-500' : ''
                    }`}
                  >
                    {/* Tx & Customer */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-mono font-bold text-slate-200 flex items-center gap-1.5">
                            {f.tx_id}
                            {isSpecial && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-sans">
                                ⭐ Demo Tx
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                            {f.customer_name || 'Anonymous Customer'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-bold text-slate-100">
                      ₹{f.amount?.toLocaleString('en-IN')}
                    </td>

                    {/* Reason */}
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <span className="font-mono text-[11px] text-amber-300 block truncate" title={f.reason_description || f.reason}>
                        {f.reason}
                      </span>
                      <span className="text-[10px] text-slate-500 truncate block">
                        {f.reason_description || 'Switch timeout'}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold uppercase tracking-wider ${getCategoryBadge(f.failure_category)}`}>
                        {f.failure_category}
                      </span>
                    </td>

                    {/* Risk Score */}
                    <td className="py-3.5 px-4">
                      {getRiskBadge(f.risk_score)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(f.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Step 2: Diagnose */}
                        <button
                          onClick={() => onDiagnose(f.tx_id)}
                          title="Run Step 2: Claude AI Diagnosis"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-brand-600/30 text-slate-300 hover:text-brand-300 border border-slate-700 hover:border-brand-500/40 transition-all"
                        >
                          <Brain className="w-3.5 h-3.5" />
                        </button>

                        {/* Step 3: Intervene */}
                        <button
                          onClick={() => onIntervene(f.tx_id)}
                          title="Run Step 3: Decision Engine Intervention"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-purple-600/30 text-slate-300 hover:text-purple-300 border border-slate-700 hover:border-purple-500/40 transition-all"
                        >
                          <Zap className="w-3.5 h-3.5" />
                        </button>

                        {/* Step 4: Execute */}
                        <button
                          onClick={() => onExecute(f.tx_id)}
                          title="Run Step 4: Execute Recovery & Log Audit"
                          className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-700/50 transition-all"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>

                        {/* View Audit Trail */}
                        <button
                          onClick={() => onViewAudit(f.tx_id)}
                          title="View Verifiable Audit Trail"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-all"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
