import React, { useState } from 'react';
import { 
  Search, Filter, Brain, Zap, Play, FileText, CheckCircle2, 
  XCircle, AlertTriangle, ShieldCheck, Sparkles, RefreshCw, Download, 
  CheckSquare, Square, ArrowUpDown, ChevronRight, UserCheck, Building2
} from 'lucide-react';

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
  const [highRiskOnly, setHighRiskOnly] = useState(false);
  const [selectedTxIds, setSelectedTxIds] = useState(new Set());
  const [bulkExecuting, setBulkExecuting] = useState(false);

  // Filtering logic
  const filtered = failures.filter(f => {
    const matchesSearch = 
      f.tx_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.merchant_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.reason?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = categoryFilter === 'all' || f.failure_category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    const matchesRisk = !highRiskOnly || f.risk_score >= 70;

    return matchesSearch && matchesCat && matchesStatus && matchesRisk;
  });

  // Selection handlers
  const handleToggleSelect = (txId) => {
    const next = new Set(selectedTxIds);
    if (next.has(txId)) next.delete(txId);
    else next.add(txId);
    setSelectedTxIds(next);
  };

  const handleSelectAll = () => {
    if (selectedTxIds.size === filtered.length) {
      setSelectedTxIds(new Set());
    } else {
      setSelectedTxIds(new Set(filtered.map(f => f.tx_id)));
    }
  };

  // Bulk execution of selected
  const handleBulkExecute = async () => {
    if (selectedTxIds.size === 0) return;
    setBulkExecuting(true);
    for (const id of selectedTxIds) {
      try {
        await onExecute(id);
      } catch (err) {
        console.error(err);
      }
    }
    setSelectedTxIds(new Set());
    setBulkExecuting(false);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Amount (INR)', 'Reason', 'Category', 'Customer Name', 'Risk Score', 'Status'];
    const rows = filtered.map(f => [
      f.tx_id,
      f.amount,
      `"${f.reason}"`,
      f.failure_category,
      `"${f.customer_name || 'Guest'}"`,
      f.risk_score,
      f.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PaymentGuard_Failures_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRiskBadge = (score) => {
    if (score >= 70) {
      return (
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            {score}
          </span>
          <span className="text-[10px] text-rose-400 font-medium uppercase tracking-wider hidden xl:inline">High Risk</span>
        </div>
      );
    } else if (score >= 45) {
      return (
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {score}
          </span>
          <span className="text-[10px] text-amber-400 font-medium uppercase tracking-wider hidden xl:inline">Medium</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {score}
          </span>
          <span className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider hidden xl:inline">Low</span>
        </div>
      );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'recovered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 badge-glow-emerald">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Recovered
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <XCircle className="w-3.5 h-3.5 text-rose-400" /> Failed
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-brand-500/20 text-brand-300 border border-brand-500/40 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-400" /> Processing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900 text-slate-300 border border-slate-700/80">
            Detected
          </span>
        );
    }
  };

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'network': return 'text-sky-300 bg-sky-500/15 border-sky-500/30';
      case 'issuer': return 'text-purple-300 bg-purple-500/15 border-purple-500/30';
      case 'merchant': return 'text-amber-300 bg-amber-500/15 border-amber-500/30';
      default: return 'text-slate-300 bg-slate-500/15 border-slate-500/30';
    }
  };

  const selectedAmount = failures
    .filter(f => selectedTxIds.has(f.tx_id))
    .reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 shadow-2xl overflow-hidden relative">
      
      {/* Table Controls Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/60">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              Failed Transactions Queue
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono font-semibold">
              {filtered.length} shown
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Ingested from Razorpay switch telemetry • Prioritized by autonomous risk scoring
          </p>
        </div>

        {/* Filter & Search Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, name, reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all shadow-inner"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-brand-500 cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="network">Network Disruption</option>
            <option value="issuer">Issuer Bank Decline</option>
            <option value="merchant">Merchant Config Error</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-brand-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="detected">Detected</option>
            <option value="processing">Processing</option>
            <option value="recovered">Recovered</option>
            <option value="failed">Failed</option>
          </select>

          {/* High Risk Toggle */}
          <button
            onClick={() => setHighRiskOnly(!highRiskOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              highRiskOnly
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-700/80 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" /> High Risk Only
          </button>

          {/* CSV Export Button */}
          <button
            onClick={handleExportCSV}
            title="Download CSV report of transactions"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto max-h-[620px] overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md">
              <th className="py-3.5 px-4 w-10">
                <button
                  onClick={handleSelectAll}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {selectedTxIds.size > 0 && selectedTxIds.size === filtered.length ? (
                    <CheckSquare className="w-4 h-4 text-brand-400" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="py-3.5 px-4">Transaction / Customer</th>
              <th className="py-3.5 px-4">Amount</th>
              <th className="py-3.5 px-4">Telemetry Code</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Risk Exposure</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Autonomous Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {loading ? (
              <tr>
                <td colSpan="8" className="py-16 text-center text-slate-400 space-y-3">
                  <div className="w-9 h-9 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="font-medium">Connecting with Razorpay Payment switch...</p>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-16 text-center text-slate-400 space-y-2">
                  <p className="text-sm font-semibold text-slate-300">No matching failed transactions found</p>
                  <p className="text-xs text-slate-500">Try adjusting your filters or search keywords.</p>
                </td>
              </tr>
            ) : (
              filtered.map((f) => {
                const isSpecial = f.is_test_special;
                const isSelected = selectedTxIds.has(f.tx_id);
                return (
                  <tr
                    key={f.tx_id}
                    className={`transition-colors group ${
                      isSelected
                        ? 'bg-brand-950/40 border-l-4 border-l-brand-400'
                        : isSpecial
                        ? 'bg-amber-950/20 hover:bg-amber-950/30 border-l-4 border-l-amber-500'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleSelect(f.tx_id)}
                        className="text-slate-500 group-hover:text-slate-300 transition-colors"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-brand-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Tx & Customer Info */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-200">{f.tx_id}</span>
                          {isSpecial && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-sans font-bold flex items-center gap-1 shadow-sm">
                              ⭐ Demo Tx
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2">
                          <span className="truncate max-w-[150px] font-medium text-slate-300">
                            {f.customer_name || 'Anonymous Customer'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">• {f.merchant_id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-mono font-extrabold text-white text-sm">
                      ₹{f.amount?.toLocaleString('en-IN')}
                    </td>

                    {/* Telemetry Code */}
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <span className="font-mono text-[11px] text-amber-300 font-medium block truncate" title={f.reason_description || f.reason}>
                        {f.reason}
                      </span>
                      <span className="text-[10px] text-slate-500 truncate block">
                        {f.reason_description || 'Bank gateway dropped'}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${getCategoryBadge(f.failure_category)}`}>
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
                          title="Run Step 2: Claude AI Root Cause Diagnosis"
                          className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-brand-600/30 text-slate-300 hover:text-brand-300 border border-slate-700/80 hover:border-brand-500/40 transition-all flex items-center gap-1 text-[11px] font-semibold"
                        >
                          <Brain className="w-3.5 h-3.5 text-purple-400" />
                          <span className="hidden xl:inline">Diagnose</span>
                        </button>

                        {/* Step 3: Intervene */}
                        <button
                          onClick={() => onIntervene(f.tx_id)}
                          title="Run Step 3: Bounded Decision Engine"
                          className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-amber-600/30 text-slate-300 hover:text-amber-300 border border-slate-700/80 hover:border-amber-500/40 transition-all flex items-center gap-1 text-[11px] font-semibold"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          <span className="hidden xl:inline">Plan</span>
                        </button>

                        {/* Step 4: Execute */}
                        <button
                          onClick={() => onExecute(f.tx_id)}
                          title="Run Step 4: Multi-Channel Execution"
                          className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-900/30 transition-all flex items-center gap-1 text-[11px] font-bold"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Recover</span>
                        </button>

                        {/* Audit Trail */}
                        <button
                          onClick={() => onViewAudit(f.tx_id)}
                          title="View Immutable Audit Trail"
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/80 transition-colors"
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

      {/* Floating Bulk Execution Toolbar (When 1 or more rows selected) */}
      {selectedTxIds.size > 0 && (
        <div className="p-3 bg-slate-900/95 border-t border-brand-500/40 flex items-center justify-between px-6 backdrop-blur-md animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-3 text-xs">
            <span className="font-bold text-white">
              {selectedTxIds.size} transactions selected
            </span>
            <span className="text-slate-400">
              (₹{selectedAmount.toLocaleString('en-IN')} capital at risk)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedTxIds(new Set())}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors"
            >
              Deselect All
            </button>
            <button
              onClick={handleBulkExecute}
              disabled={bulkExecuting}
              className="px-4 py-1.5 bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-900/40 flex items-center gap-2 transition-all"
            >
              {bulkExecuting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Recovering Selected...
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 fill-current" /> Recover Selected ({selectedTxIds.size})
                </>
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
