import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Zap, RefreshCw, Play, Video, ArrowRight, 
  Sparkles, CheckCircle2, AlertTriangle, Layers, Activity, Database,
  Volume2, VolumeX, Radio, Clock, ShieldAlert, Cpu
} from 'lucide-react';
import { api } from '../services/api';
import { soundService } from '../services/audio';
import MetricsCard from './MetricsCard';
import FailuresList from './FailuresList';
import RecoveryChart from './RecoveryChart';
import DiagnosisModal from './DiagnosisModal';
import InterventionModal from './InterventionModal';
import AuditTrail from './AuditTrail';
import WorkflowStepper from './WorkflowStepper';
import VideoGuideModal from './VideoGuideModal';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [failures, setFailures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('transactions'); // transactions, analytics, workflow
  const [isMuted, setIsMuted] = useState(false);

  // Modals state
  const [selectedFailure, setSelectedFailure] = useState(null);
  const [diagnosisData, setDiagnosisData] = useState(null);
  const [interventionData, setInterventionData] = useState(null);
  const [auditData, setAuditData] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'diagnosis', 'intervention', 'audit', 'video_guide'
  const [modalLoading, setModalLoading] = useState(false);

  // Batch pipeline state
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    if (type === 'success') {
      soundService.playSuccessChime();
    }
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundService.setMuted(next);
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
        showToast(`Intervention executed. Status: ${res.status} (Logged in audit trail)`, 'info');
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
    setBatchProgress(10);
    showToast('Executing AI Revenue Recovery Pipeline across 100 transactions...', 'info');
    
    // Smooth progress ticker
    const timer = setInterval(() => {
      setBatchProgress(prev => (prev < 90 ? prev + 15 : prev));
    }, 400);

    try {
      const res = await api.runBatchPipeline({ limit: 100 });
      clearInterval(timer);
      setBatchProgress(100);
      showToast(`Pipeline Finished! Recovered ₹${res.recovered_amount.toLocaleString('en-IN')} (${res.recovery_rate_percent}% recovery rate)`, 'success');
      await loadData();
    } catch (err) {
      clearInterval(timer);
      showToast(`Batch execution failed: ${err.message}`, 'error');
    } finally {
      setTimeout(() => {
        setBatchRunning(false);
        setBatchProgress(0);
      }, 1000);
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
    <div className="min-h-screen bg-[#040914] bg-ambient-mesh text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-in slide-in-from-top-3 duration-300">
          <div className={`px-4 py-3 rounded-2xl border shadow-2xl text-xs font-bold flex items-center gap-2.5 backdrop-blur-xl ${
            toastMessage.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-500/50'
              : toastMessage.type === 'info'
              ? 'bg-brand-950/90 text-brand-200 border-brand-500/50'
              : 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50'
          }`}>
            <span className="w-2.5 h-2.5 rounded-full bg-current animate-ping" />
            {toastMessage.msg}
          </div>
        </div>
      )}

      {/* Top Telemetry Gateway Status Strip */}
      <div className="bg-slate-950 border-b border-slate-800/80 px-4 py-1.5 text-[11px] text-slate-400 font-mono hidden md:flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> NPCI UPI Switch: 99.98%
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-brand-400" /> Claude 3.5 AI Engine: Active
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Safety Boundary: ≤₹50,000 Cap
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-500">Track 03 Submission Mode</span>
          <span className="px-2 py-0.5 rounded bg-brand-950 text-brand-400 border border-brand-800/50 text-[10px] font-bold">
            v1.0.0
          </span>
        </div>
      </div>

      {/* Main Navbar Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3.5">
            <img 
              src="/logo.png" 
              alt="PaymentGuard Logo" 
              className="w-11 h-11 rounded-xl object-contain shadow-lg shadow-brand-500/20 border border-brand-500/30 hover:scale-105 transition-transform"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-white font-sans">PaymentGuard</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/30 font-bold">
                  AI Revenue Recovery Agent
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block -mt-0.5 font-medium">
                Razorpay AI Buildathon • Track 03
              </span>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center space-x-2.5">
            {/* Audio chime mute toggle */}
            <button
              onClick={handleToggleMute}
              title={isMuted ? "Unmute recovery chimes" : "Mute recovery chimes"}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-brand-400" />}
            </button>

            {/* 5-Min Video Pitch Guide button */}
            <button
              onClick={() => setActiveModal('video_guide')}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold border border-amber-500/30 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Video className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">5-Min Video Guide</span>
            </button>

            {/* Reset Demo button */}
            <button
              onClick={handleReset}
              title="Reset transactions to initial state"
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            {/* Run AI Recovery Pipeline button */}
            <button
              onClick={handleBatchRun}
              disabled={batchRunning}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 via-sky-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white text-xs font-extrabold shadow-lg shadow-brand-600/30 transition-all hover:scale-[1.02] flex items-center gap-2 disabled:opacity-60"
            >
              {batchRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing Batch...
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 fill-current text-yellow-300" /> Run AI Recovery Pipeline
                </>
              )}
            </button>
          </div>

        </div>

        {/* Batch Progress Bar Indicator */}
        {batchRunning && (
          <div className="w-full bg-slate-900 h-1 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-brand-500 via-cyan-400 to-emerald-400 h-full transition-all duration-300"
              style={{ width: `${batchProgress}%` }}
            />
          </div>
        )}
      </header>

      {/* Main Page Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1 w-full">
        
        {/* Interactive 4-Step Pipeline Flow Stepper */}
        <WorkflowStepper
          onStepClick={(step) => {
            if (step === 1) setActiveTab('transactions');
            if (step === 2) handleDiagnose('tx_1001');
            if (step === 3) handleIntervene('tx_1001');
            if (step === 4) handleViewAudit('tx_1001');
          }}
        />

        {/* Step 1 KPI Metrics Cards */}
        <MetricsCard metrics={metrics} loading={loading} />

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 space-x-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'transactions'
                ? 'border-brand-500 text-white font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4 text-brand-400" />
            Transactions Queue ({failures.length})
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'analytics'
                ? 'border-brand-500 text-white font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            Analytics & Recovery Funnel
          </button>

          <button
            onClick={() => setActiveTab('workflow')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'workflow'
                ? 'border-brand-500 text-white font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            Bounded Rules & Architecture Spec
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
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="glass-panel p-5 rounded-2xl border border-sky-500/20 space-y-2.5">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 uppercase font-bold">Step 1</span>
                <h4 className="text-sm font-bold text-white">DETECT</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Fetches failed payment streams. Dynamic scoring algorithm accounts for transaction exposure, customer attempt frequency, and merchant chargeback rates.
                </p>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-purple-500/20 space-y-2.5">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 uppercase font-bold">Step 2</span>
                <h4 className="text-sm font-bold text-white">DIAGNOSE</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Claude 3.5 Sonnet evaluates raw gateway error telemetry, historical customer success rate, and merchant metrics. Confidence &lt;60% triggers automatic escalation.
                </p>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 space-y-2.5">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 uppercase font-bold">Step 3</span>
                <h4 className="text-sm font-bold text-white">INTERVENE</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Deterministic bounded workflow: Auto-Retry (≤3 attempts), Customer SMS (24h token), Conversational Hinglish Voice Concierge, or Manual Escalation.
                </p>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 space-y-2.5">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase font-bold">Step 4</span>
                <h4 className="text-sm font-bold text-white">EXECUTE & AUDIT</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Executes interventions with exponential backoff. Logs immutable audit entries with millisecond latency, gateway response times, and recovered capital.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Zero Hallucination Guarantee: Financial operations are constrained strictly within bounded business rules.
              </span>
              <span className="font-mono text-slate-500">PostgreSQL / SQLite Dual Engine</span>
            </div>
          </div>
        )}

      </main>

      {/* Modern Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-5 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PaymentGuard • Razorpay AI Buildathon Track 03 (AI Revenue Recovery)</span>
          <span className="font-mono text-slate-500">Built with FastAPI, React 18, Claude 3.5 Sonnet & PostgreSQL</span>
        </div>
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

      {activeModal === 'video_guide' && (
        <VideoGuideModal
          onClose={() => setActiveModal(null)}
          onDemoGraceful={() => handleDiagnose('tx_1001')}
        />
      )}

    </div>
  );
}
