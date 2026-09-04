import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Download, CheckSquare, Square, Zap, Brain, Play, FileText, 
  RefreshCw, ChevronRight, ShieldAlert, Sparkles, Filter
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

  const getRiskBadge = (risk) => {
    if (risk >= 80) return "bg-rose-100 text-rose-700 border-rose-300";
    if (risk >= 60) return "bg-orange-100 text-[#FF6A00] border-orange-300";
    return "bg-slate-100 text-slate-700 border-slate-300";
  };

  const getStatusBadge = (status) => {
    if (status === 'recovered') return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (status === 'failed') return 'bg-rose-100 text-rose-800 border-rose-300';
    return 'bg-amber-100 text-amber-800 border-amber-300';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-3xl border border-slate-300 shadow-md overflow-hidden"
    >
      {/* Table Header Controls */}
      <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-display font-black text-xl text-[#151515] uppercase tracking-tight">
              FAILED TRANSACTIONS QUEUE
            </h2>
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-[#151515] text-white">
              {filtered.length} INGESTED
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Prioritized by autonomous capital risk scoring (0-100) & NPCI fail rates
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search TX ID, customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-[#151515] placeholder-slate-400 focus:outline-none focus:border-[#FF6A00] transition-all shadow-xs"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-[#151515] focus:outline-none focus:border-[#FF6A00] cursor-pointer shadow-xs"
          >
            <option value="all">ALL CATEGORIES</option>
            <option value="network">NETWORK DISRUPTION</option>
            <option value="issuer">ISSUER BANK DECLINE</option>
            <option value="merchant">MERCHANT CONFIG</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-[#151515] focus:outline-none focus:border-[#FF6A00] cursor-pointer shadow-xs"
          >
            <option value="all">ALL STATUSES</option>
            <option value="detected">DETECTED</option>
            <option value="recovered">RECOVERED</option>
            <option value="failed">FAILED</option>
          </select>

          <button
            onClick={handleExportCSV}
            title="Download CSV report"
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-[#151515] border border-slate-300 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/70 font-mono text-[11px] font-extrabold text-slate-600 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-sm">
              <th className="py-3.5 px-4 w-10">
                <button
                  onClick={handleSelectAll}
                  className="text-slate-500 hover:text-[#151515] transition-colors"
                >
                  {selectedTxIds.size > 0 && selectedTxIds.size === filtered.length ? (
                    <CheckSquare className="w-4 h-4 text-[#FF6A00]" />
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
          <tbody className="divide-y divide-slate-200 text-xs">
            {loading ? (
              <tr>
                <td colSpan="8" className="py-16 text-center text-slate-500 space-y-3">
                  <RefreshCw className="w-7 h-7 text-[#FF6A00] animate-spin mx-auto" />
                  <p className="font-mono text-xs font-bold text-[#151515]">SYNCHRONIZING QUEUE...</p>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-16 text-center text-slate-500">
                  <p className="font-mono text-xs font-bold text-slate-600">NO MATCHING FAILED PAYMENTS FOUND</p>
                </td>
              </tr>
            ) : (
              filtered.map((tx, idx) => {
                const isSelected = selectedTxIds.has(tx.tx_id);
                const isSpecial = tx.is_test_special;
                return (
                  <tr
                    key={tx.tx_id}
                    className={`transition-colors hover:bg-slate-50 ${
                      isSelected
                        ? 'bg-orange-50/70 border-l-4 border-l-[#FF6A00]'
                        : isSpecial
                        ? 'bg-amber-50/60 border-l-4 border-l-amber-500'
                        : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleSelect(tx.tx_id)}
                        className="text-slate-400 hover:text-[#FF6A00] transition-colors"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#FF6A00]" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Transaction / Customer */}
                    <td className="px-5 py-3.5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#151515]">{tx.tx_id}</span>
                          {isSpecial && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold border border-amber-300">
                              ⭐ DEMO
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500 text-xs truncate max-w-[160px] font-medium">
                          {tx.customer_name || 'Guest Customer'}
                        </p>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-3.5 font-mono font-black text-sm text-[#151515]">
                      ₹{tx.amount?.toLocaleString('en-IN')}
                    </td>

                    {/* Failure Reason */}
                    <td className="px-5 py-3.5 max-w-[200px]">
                      <span className="text-[#FF6A00] font-mono text-xs font-bold uppercase block truncate">
                        {tx.reason?.replace(/_/g, " ")}
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate font-medium">
                        {tx.reason_description || 'Bank gateway dropped connection'}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-extrabold uppercase bg-slate-100 text-slate-800 border border-slate-300">
                        {tx.failure_category}
                      </span>
                    </td>

                    {/* Risk Score */}
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-md font-mono font-bold text-xs border ${getRiskBadge(tx.risk_score)}`}>
                        {tx.risk_score}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold uppercase border ${getStatusBadge(tx.status)}`}>
                        {tx.status}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Diagnose */}
                        <button
                          onClick={() => onDiagnose && onDiagnose(tx.tx_id)}
                          title="Step 2: Claude AI Diagnosis"
                          className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-all"
                        >
                          <Brain className="w-3.5 h-3.5" />
                        </button>

                        {/* Intervene */}
                        <button
                          onClick={() => onIntervene && onIntervene(tx.tx_id)}
                          title="Step 3: Bounded Decision Engine"
                          className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-all"
                        >
                          <Zap className="w-3.5 h-3.5" />
                        </button>

                        {/* Recover */}
                        <button
                          onClick={() => onExecute && onExecute(tx.tx_id)}
                          title="Step 4: Execute Recovery"
                          className="px-3 py-1.5 rounded-xl bg-[#151515] hover:bg-black text-white font-mono font-extrabold text-xs shadow-sm flex items-center gap-1 transition-all"
                        >
                          <Play className="w-3 h-3 text-[#FF6A00] fill-current" />
                          <span>SAVE</span>
                        </button>

                        {/* Audit */}
                        <button
                          onClick={() => onViewAudit && onViewAudit(tx.tx_id)}
                          title="View Audit Trail"
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-all"
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

      {/* Floating Bulk Execution Toolbar */}
      {selectedTxIds.size > 0 && (
        <div className="p-4 bg-[#151515] text-white border-t border-slate-700 flex items-center justify-between px-6">
          <div className="font-mono text-xs font-bold">
            {selectedTxIds.size} TRANSACTIONS SELECTED
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedTxIds(new Set())}
              className="px-3 py-1.5 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl font-mono text-xs"
            >
              CLEAR
            </button>
            <button
              onClick={handleBulkExecute}
              disabled={bulkExecuting}
              className="px-4 py-1.5 bg-[#FF6A00] hover:bg-[#e05d00] text-white font-mono text-xs font-bold rounded-xl shadow-md flex items-center gap-2"
            >
              {bulkExecuting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 fill-current" />}
              <span>RECOVER ({selectedTxIds.size})</span>
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
