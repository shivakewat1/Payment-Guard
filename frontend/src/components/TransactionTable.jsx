import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Brain, Zap, Play, FileText, CheckCircle2, 
  XCircle, AlertTriangle, ShieldCheck, RefreshCw, Download, 
  CheckSquare, Square, ChevronRight, Sparkles 
} from 'lucide-react';

export default function TransactionTable({
  failures = [],
  loading = false,
  onDiagnose,
  onIntervene,
  onExecute,
  onViewAudit
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTxIds, setSelectedTxIds] = useState(new Set());
  const [hoveredRow, setHoveredRow] = useState(null);
  const [bulkExecuting, setBulkExecuting] = useState(false);

  const filtered = failures.filter(f => {
    const matchesSearch = 
      f.tx_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.merchant_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.reason?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = categoryFilter === 'all' || f.failure_category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;

    return matchesSearch && matchesCat && matchesStatus;
  });

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

  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Amount (INR)', 'Reason', 'Category', 'Customer Name', 'Risk Score', 'Status'];
    const rows = filtered.map(f => [
      f.tx_id,
      f.amount,
      `"${f.reason}"`,
      f.failure_category,
      `"${f.customer_name || 'Customer'}"`,
      f.risk_score,
      f.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PaymentGuard_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRiskColor = (risk) => {
    if (risk >= 80) return "bg-red-500/20 text-red-400 border-red-400/50";
    if (risk >= 60) return "bg-orange-500/20 text-orange-400 border-orange-400/50";
    return "bg-cyan-500/20 text-cyan-300 border-cyan-400/50";
  };

  const getStatusColor = (status) => {
    if (status === 'recovered') return 'text-emerald-400';
    if (status === 'failed') return 'text-rose-400';
    if (status === 'processing') return 'text-cyan-400 animate-pulse';
    return 'text-slate-400';
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -15 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.25 } },
    hover: { backgroundColor: "rgba(34, 211, 238, 0.08)" },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-slate-900/70 to-slate-950/80 backdrop-blur shadow-2xl overflow-hidden"
    >
      {/* Table Header Controls */}
      <div className="p-5 border-b border-cyan-400/20 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/50">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-cyan-300 flex items-center gap-2">
              Failed Transactions Queue
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 font-mono font-bold">
              {filtered.length} Ingested
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Prioritized by autonomous capital risk scoring (0-100)
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900/90 border border-cyan-500/30 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-900/90 border border-cyan-500/30 rounded-xl text-xs text-cyan-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="network">Network Disruption</option>
            <option value="issuer">Issuer Bank Decline</option>
            <option value="merchant">Merchant Config Error</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-900/90 border border-cyan-500/30 rounded-xl text-xs text-cyan-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="detected">Detected</option>
            <option value="recovered">Recovered</option>
            <option value="failed">Failed</option>
          </select>

          <button
            onClick={handleExportCSV}
            title="Download CSV report"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-cyan-400/15 bg-slate-950/80 text-[11px] font-bold text-cyan-300 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md">
              <th className="py-3.5 px-4 w-10">
                <button
                  onClick={handleSelectAll}
                  className="text-slate-400 hover:text-cyan-300 transition-colors"
                >
                  {selectedTxIds.size > 0 && selectedTxIds.size === filtered.length ? (
                    <CheckSquare className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="px-5 py-3.5">TRANSACTION / CUSTOMER</th>
              <th className="px-5 py-3.5">AMOUNT</th>
              <th className="px-5 py-3.5">FAILURE REASON</th>
              <th className="px-5 py-3.5">CATEGORY</th>
              <th className="px-5 py-3.5">RISK SCORE</th>
              <th className="px-5 py-3.5">STATUS</th>
              <th className="px-5 py-3.5 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyan-400/10 text-xs">
            {loading ? (
              <tr>
                <td colSpan="8" className="py-16 text-center text-slate-400 space-y-3">
                  <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="font-medium text-cyan-300">Synchronizing transaction queue...</p>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-16 text-center text-slate-400">
                  <p className="text-sm font-semibold text-slate-300">No matching failed payments found</p>
                </td>
              </tr>
            ) : (
              filtered.map((tx, idx) => {
                const isSelected = selectedTxIds.has(tx.tx_id);
                const isSpecial = tx.is_test_special;
                return (
                  <motion.tr
                    key={tx.tx_id}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    transition={{ delay: idx * 0.02 }}
                    onMouseEnter={() => setHoveredRow(tx.tx_id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    className={`transition-colors group ${
                      isSelected
                        ? 'bg-cyan-950/40 border-l-4 border-l-cyan-400'
                        : isSpecial
                        ? 'bg-amber-950/20 border-l-4 border-l-amber-500'
                        : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleSelect(tx.tx_id)}
                        className="text-slate-500 group-hover:text-cyan-400 transition-colors"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-cyan-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Transaction / Customer */}
                    <td className="px-5 py-3.5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-cyan-400 font-bold">{tx.tx_id}</span>
                          {isSpecial && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                              ⭐ Demo
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-xs truncate max-w-[160px]">
                          {tx.customer_name || 'Guest Customer'}
                        </p>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-3.5 font-bold text-white font-mono text-sm">
                      ₹{tx.amount?.toLocaleString('en-IN')}
                    </td>

                    {/* Failure Reason */}
                    <td className="px-5 py-3.5 max-w-[200px]">
                      <span className="text-orange-400 text-xs font-mono block truncate">
                        {tx.reason?.replace(/_/g, " ")}
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate">
                        {tx.reason_description || 'Bank gateway dropped'}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-slate-800 text-cyan-300 border border-cyan-500/30">
                        {tx.failure_category}
                      </span>
                    </td>

                    {/* Risk Score */}
                    <td className="px-5 py-3.5">
                      <motion.div
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center font-mono font-bold text-xs ${getRiskColor(tx.risk_score)}`}
                        whileHover={{ scale: 1.15 }}
                      >
                        {tx.risk_score}
                      </motion.div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <span className={`flex items-center gap-2 text-xs font-bold capitalize ${getStatusColor(tx.status)}`}>
                        <span
                          className="w-2 h-2 rounded-full animate-pulse"
                          style={{
                            backgroundColor: tx.status === "recovered" ? "#10b981" : tx.status === "failed" ? "#ef4444" : "#22d3ee",
                          }}
                        />
                        {tx.status}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Diagnose */}
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onDiagnose && onDiagnose(tx.tx_id)}
                          title="Step 2: Claude AI Diagnosis"
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-purple-950 text-purple-400 border border-purple-500/30"
                        >
                          <Brain className="w-3.5 h-3.5" />
                        </motion.button>

                        {/* Intervene */}
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onIntervene && onIntervene(tx.tx_id)}
                          title="Step 3: Bounded Decision Engine"
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-amber-950 text-amber-400 border border-amber-500/30"
                        >
                          <Zap className="w-3.5 h-3.5" />
                        </motion.button>

                        {/* Recover */}
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onExecute && onExecute(tx.tx_id)}
                          title="Step 4: Execute Recovery"
                          className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-[11px] shadow-sm flex items-center gap-1"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Save</span>
                        </motion.button>

                        {/* Audit */}
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onViewAudit && onViewAudit(tx.tx_id)}
                          title="View Audit Trail"
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Floating Bulk Execution Toolbar */}
      {selectedTxIds.size > 0 && (
        <div className="p-3.5 bg-slate-900/95 border-t border-cyan-400/40 flex items-center justify-between px-6 backdrop-blur-md">
          <div className="text-xs font-bold text-cyan-300">
            {selectedTxIds.size} transactions selected
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedTxIds(new Set())}
              className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs"
            >
              Clear
            </button>
            <button
              onClick={handleBulkExecute}
              disabled={bulkExecuting}
              className="px-4 py-1.5 bg-gradient-to-r from-cyan-400 to-blue-400 text-slate-900 rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5"
            >
              {bulkExecuting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 fill-current" />}
              Recover Selected ({selectedTxIds.size})
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
