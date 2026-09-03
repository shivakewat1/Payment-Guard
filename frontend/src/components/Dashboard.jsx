import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Zap, RefreshCw, Play, Video, ArrowRight, 
  Sparkles, CheckCircle2, AlertTriangle, Layers, Activity, Database
} from 'lucide-react';
import { api } from '../services/api';
import MetricsCard from './MetricsCard';
import FailuresList from './FailuresList';
import RecoveryChart from './RecoveryChart';
import DiagnosisModal from './DiagnosisModal';
import InterventionModal from './InterventionModal';
import AuditTrail from './AuditTrail';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [failures, setFailures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('transactions'); // transactions, analytics, workflow

  // Modals state
  const [selectedFailure, setSelectedFailure] = useState(null);
  const [diagnosisData, setDiagnosisData] = useState(null);
  const [interventionData, setInterventionData] = useState(null);
  const [auditData, setAuditData] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'diagnosis', 'intervention', 'audit'
  const [modalLoading, setModalLoading] = useState(false);

  // Batch pipeline state
  const [batchRunning, setBatchRunning] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [metRes, failRes] = await Promise.all([
        api.fetchMetrics(),
        api.fetchFailures({ limit: 100 })
      ]);
      setMetrics(metRes);
      setFailures(failRes.failures || []);
    } catch (err) {
      console.error('Error loading data:', err);
      showToast('Failed to connect with PaymentGuard backend API', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Run Diagnosis
  const handleDiagnose = async (txId) => {
    const fail = failures.find(f => f.tx_id === txId);
    setSelectedFailure(fail);
    setActiveModal('diagnosis');
    setModalLoading(true);
    try {
      const data = await api.diagnoseFailure(txId);
      setDiagnosisData(data);
    } catch (err) {
      showToast(`Diagnosis failed: ${err.message}`, 'error');
      setActiveModal(null);
    } finally {
      setModalLoading(false);
    }
  };

  // Step 3: Run Intervention
  const handleIntervene = async (txId) => {
    const fail = failures.find(f => f.tx_id === txId);
    setSelectedFailure(fail);
    setActiveModal('intervention');
    setModalLoading(true);
    try {
      const data = await api.interveneFailure(txId);
      setInterventionData(data);
    } catch (err) {
      showToast(`Intervention calculation failed: ${err.message}`, 'error');
      setActiveModal(null);
    } finally {
      setModalLoading(false);
    }
  };

  // Step 4: Execute Recovery
  const handleExecute = async (identifier) => {
    // If passed a tx_id directly, get intervention first
    setLoading(true);
    try {
      let interventionId = identifier;
      if (identifier.startsWith('tx_')) {
        const interv = await api.interveneFailure(identifier);
        interventionId = interv.intervention_id;
      }

      const res = await api.executeIntervention(interventionId);
      if (res.status === 'success') {
        showToast(`Payment of ₹${res.money_recovered.toLocaleString('en-IN')} recovered successfully!`, 'success');
      } else {
        showToast(`Intervention executed. Status: ${res.status} (Audit log generated)`, 'info');
      }

      setActiveModal(null);
      await loadData();
    } catch (err) {
      showToast(`Execution failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // View Audit Trail
  const handleViewAudit = async (txId) => {
    setSelectedFailure({ tx_id: txId });
    setActiveModal('audit');
    setModalLoading(true);
    try {
      const data = await api.fetchAuditTrail(txId);
      setAuditData(data);
    } catch (err) {
      showToast(`Failed to load audit trail: ${err.message}`, 'error');
      setActiveModal(null);
    } finally {
      setModalLoading(false);
    }
  };

  // 1-Click Batch Run
  const handleBatchRun = async () => {
    setBatchRunning(true);
    showToast('Executing AI Revenue Recovery Pipeline across 100 transactions...', 'info');
    try {
      const res = await api.runBatchPipeline({ limit: 100 });
      showToast(`Pipeline Finished! Recovered ₹${res.recovered_amount.toLocaleString('en-IN')} (${res.recovery_rate_percent}% recovery rate)`, 'success');
      await loadData();
    } catch (err) {
      showToast(`Batch execution failed: ${err.message}`, 'error');
    } finally {
      setBatchRunning(false);
    }
  };

  // Reset demo state
  const handleReset = async () => {
    try {
      await api.resetDemoData();
      showToast('Demo state reset to fresh 100 detected failures', 'info');
      await loadData();
    } catch (err) {
      showToast(`Reset failed: ${err.message}`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#060e1d] text-slate-100 flex flex-col">
      
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-in slide-in-from-top duration-300">
          <div className={`px-4 py-3 rounded-xl border shadow-2xl text-xs font-semibold flex items-center gap-2.5 backdrop-blur-md ${
            toastMessage.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-500/50'
              : toastMessage.type === 'info'
              ? 'bg-brand-950/90 text-brand-200 border-brand-500/50'
              : 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50'
          }`}>
            <span className="w-2 h-2 rounded-full bg-current animate-ping" />
            {toastMessage.msg}
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 p-0.5 shadow-lg shadow-brand-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-brand-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white font-sans">PaymentGuard</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  AI Revenue Recovery Agent
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block -mt-0.5">
                Razorpay AI Buildathon • Track 03
              </span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleReset}
              title="Reset transactions to initial state"
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700/60 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" /> Reset Demo
            </button>

            <button
              onClick={handleBatchRun}
              disabled={batchRunning}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all hover:scale-[1.02] flex items-center gap-2 disabled:opacity-60"
            >
              {batchRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing 100 Txns...
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 fill-current text-yellow-300" /> Run AI Recovery Pipeline
                </>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1 w-full">
        
        {/* 5-Min Video Walkthrough Guide Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-950/70 via-slate-900/80 to-slate-950 border border-brand-500/30 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-400">
                <Video className="w-4 h-4" /> 5-Minute Evaluation Walkthrough Guide
              </div>
              <p className="text-xs text-slate-300 max-w-2xl">
                Demonstrates autonomous 4-stage pipeline: <strong>Detect</strong> 100 failures (₹25.7L) → <strong>Diagnose</strong> with Claude 3.5 AI → <strong>Intervene</strong> with Bounded Rules & Hinglish Voice → <strong>Execute</strong> with Graceful Backoff recovery.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleDiagnose('tx_1001')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                ⭐ Demo Graceful Failure (tx_1001)
              </button>
            </div>
          </div>
        </div>

        {/* Step 1 KPI Metrics Cards */}
        <MetricsCard metrics={metrics} loading={loading} />

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 space-x-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'transactions'
                ? 'border-brand-500 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" /> Transactions Queue ({failures.length})
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'analytics'
                ? 'border-brand-500 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" /> Recovery Funnel & Distribution
          </button>

          <button
            onClick={() => setActiveTab('workflow')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'workflow'
                ? 'border-brand-500 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Bounded Workflow & Architecture
          </button>
        </div>

        {/* Tab 1: Transactions Table */}
        {activeTab === 'transactions' && (
          <FailuresList
            failures={failures}
            loading={loading}
            onDiagnose={handleDiagnose}
            onIntervene={handleIntervene}
            onExecute={handleExecute}
            onViewAudit={handleViewAudit}
          />
        )}

        {/* Tab 2: Analytics & Funnel */}
        {activeTab === 'analytics' && (
          <RecoveryChart metrics={metrics} />
        )}

        {/* Tab 3: Workflow & Architecture */}
        {activeTab === 'workflow' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 uppercase font-bold">Step 1</span>
              <h4 className="text-sm font-bold text-white">DETECT</h4>
              <p className="text-xs text-slate-400">
                Polls failed payments across 7 days. Computes dynamic risk score (0-100) based on capital exposure, attempt frequency, and merchant health.
              </p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 uppercase font-bold">Step 2</span>
              <h4 className="text-sm font-bold text-white">DIAGNOSE</h4>
              <p className="text-xs text-slate-400">
                Claude 3.5 AI analyzes telemetry, customer success rate, and merchant metrics. Outputs root cause category, severity, recovery probability, and confidence.
              </p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 uppercase font-bold">Step 3</span>
              <h4 className="text-sm font-bold text-white">INTERVENE</h4>
              <p className="text-xs text-slate-400">
                Bounded decision tree maps diagnosis to safe actions: Auto-Retry (≤3x), Customer SMS (24h), Hinglish Voice Call, or Manual Escalation (&gt;₹50k or circuit breaker).
              </p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase font-bold">Step 4</span>
              <h4 className="text-sm font-bold text-white">EXECUTE & TRACK</h4>
              <p className="text-xs text-slate-400">
                Executes chosen intervention with exponential backoff. Logs immutable audit records with millisecond latency and graceful exception handling.
              </p>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500">
        PaymentGuard • Built for Razorpay AI Buildathon (Track 03 - AI Revenue Recovery) • Powered by FastAPI & React
      </footer>

      {/* Modals */}
      {activeModal === 'diagnosis' && (
        <DiagnosisModal
          diagnosis={diagnosisData}
          failure={selectedFailure}
          loading={modalLoading}
          onClose={() => setActiveModal(null)}
          onProceedToIntervene={(txId) => {
            setActiveModal(null);
            handleIntervene(txId);
          }}
        />
      )}

      {activeModal === 'intervention' && (
        <InterventionModal
          intervention={interventionData}
          failure={selectedFailure}
          loading={modalLoading}
          onClose={() => setActiveModal(null)}
          onExecute={(intervId) => handleExecute(intervId)}
        />
      )}

      {activeModal === 'audit' && (
        <AuditTrail
          auditData={auditData}
          failureId={selectedFailure?.tx_id}
          loading={modalLoading}
          onClose={() => setActiveModal(null)}
        />
      )}

    </div>
  );
}
