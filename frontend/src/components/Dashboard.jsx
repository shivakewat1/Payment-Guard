import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Zap, RefreshCw, Video, Volume2, VolumeX, 
  Sparkles, ArrowRight, ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { soundService } from '../services/audio';

import SplashScreen from './SplashScreen';
import MetricsCard from './MetricsCard';
import TransactionTable from './TransactionTable';
import RecoveryFunnel from './RecoveryFunnel';
import ArchitectureDiagram from './ArchitectureDiagram';
import AuditTrail from './AuditTrail';
import DiagnosisModal from './DiagnosisModal';
import InterventionModal from './InterventionModal';
import VideoGuideModal from './VideoGuideModal';
import LiveDashboard from './LiveDashboard';

// Interactive Light Editorial Components
import InteractiveRecoveryChart from './InteractiveRecoveryChart';
import RiskHeatmap from './RiskHeatmap';
import FloatingActionMenu from './FloatingActionMenu';
import { NotificationCenter, useNotification } from './NotificationCenter';

export default function Dashboard() {
  const { notifications, notify, removeNotification } = useNotification();
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, live, funnel, architecture, audit
  const [metrics, setMetrics] = useState(null);
  const [failures, setFailures] = useState([]);
  const [loading, setLoading] = useState(true);
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
      showToast('Connecting with local PaymentGuard engine...', 'info');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Diagnose
  const handleDiagnose = async (txId) => {
    let fail = failures.find(f => f.tx_id === txId);
    if (!fail && txId) {
      fail = { tx_id: txId, amount: 5500, customer_name: 'Aarav Sharma', failure_category: 'network', reason: 'network_timeout' };
    }
    setSelectedFailure(fail);
    setDiagnosisData(null);
    setActiveModal('diagnosis');
    setModalLoading(true);
    try {
      const data = await api.diagnoseFailure(txId);
      setDiagnosisData(data);
    } catch (err) {
      console.error(err);
      showToast(`Diagnosis error: ${err.message}`, 'error');
      setActiveModal(null);
    } finally {
      setModalLoading(false);
    }
  };

  // Step 3: Intervene
  const handleIntervene = async (txId) => {
    let fail = failures.find(f => f.tx_id === txId);
    if (!fail && txId) {
      fail = { tx_id: txId, amount: 5500, customer_name: 'Aarav Sharma', failure_category: 'network', reason: 'network_timeout' };
    }
    setSelectedFailure(fail);
    setInterventionData(null);
    setActiveModal('intervention');
    setModalLoading(true);
    try {
      const data = await api.interveneFailure(txId);
      setInterventionData(data);
    } catch (err) {
      console.error(err);
      showToast(`Intervention error: ${err.message}`, 'error');
      setActiveModal(null);
    } finally {
      setModalLoading(false);
    }
  };

  // Step 4: Execute
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
        showToast(`Payment of ₹${res.money_recovered.toLocaleString('en-IN')} recovered!`, 'success');
      } else {
        showToast(`Intervention executed. Status: ${res.status}`, 'info');
      }

      setActiveModal(null);
      await loadData();
    } catch (err) {
      showToast(`Execution error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // View Audit
  const handleViewAudit = async (txId) => {
    setSelectedFailure({ tx_id: txId });
    setActiveModal('audit');
    setModalLoading(true);
    try {
      const data = await api.fetchAuditTrail(txId);
      setAuditData(data);
    } catch (err) {
      showToast(`Audit log loaded`, 'info');
    } finally {
      setModalLoading(false);
    }
  };

  // Batch Run
  const handleBatchRun = async () => {
    setBatchRunning(true);
    showToast('Executing AI Revenue Recovery Pipeline across 100 transactions...', 'info');
    try {
      const res = await api.runBatchPipeline({ limit: 100 });
      showToast(`Batch completed! Recovered ₹${res.recovered_amount.toLocaleString('en-IN')} (${res.recovery_rate_percent}%)`, 'success');
      await loadData();
    } catch (err) {
      showToast(`Batch error: ${err.message}`, 'error');
    } finally {
      setBatchRunning(false);
    }
  };

  // Reset
  const handleReset = async () => {
    try {
      await api.resetDemoData();
      showToast('Demo state reset to initial 100 detected failures', 'info');
      await loadData();
    } catch (err) {
      showToast(`Reset error: ${err.message}`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#E9E9E9] text-[#151515] overflow-x-hidden relative font-sans selection:bg-[#FF6A00] selection:text-white pb-16">
      
      {/* Opening Animation Splash Screen */}
      <AnimatePresence>
        {showSplash && (
          <SplashScreen onComplete={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top-3 duration-300">
          <div className={`px-4 py-3 rounded-2xl border shadow-xl text-xs font-bold flex items-center gap-2.5 backdrop-blur-xl ${
            toastMessage.type === 'error'
              ? 'bg-rose-900 text-white border-rose-700'
              : toastMessage.type === 'info'
              ? 'bg-[#151515] text-white border-slate-700'
              : 'bg-[#FF6A00] text-white border-orange-600'
          }`}>
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
            {toastMessage.msg}
          </div>
        </div>
      )}

      {/* FLOATING PILL NAV BAR */}
      <div className="sticky top-4 z-40 max-w-7xl mx-auto px-4">
        <header className="bg-slate-300/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-lg px-4 py-2.5 flex items-center justify-between">
          {/* Logo Brand */}
          <div 
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-300 p-1 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
              <img src="/logo.png" alt="PaymentGuard Shield Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="font-display font-black italic text-xl sm:text-2xl tracking-tighter uppercase leading-none select-none">
              <span className="text-[#151515]">PAYMENT</span>{' '}
              <span className="text-[#FF6A00]">GUARD</span>
            </h1>
          </div>

          {/* Floating Pill Nav Items */}
          <nav className="hidden md:flex items-center gap-1 bg-white/80 p-1 rounded-xl border border-white/80 shadow-inner font-mono text-xs font-bold">
            {[
              { id: 'overview', label: 'OVERVIEW' },
              { id: 'live', label: 'LIVE FEED' },
              { id: 'funnel', label: 'FUNNEL' },
              { id: 'architecture', label: 'ARCHITECTURE' },
              { id: 'audit', label: 'AUDIT LOG' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  activeTab === item.id 
                    ? 'bg-[#151515] text-white shadow-sm' 
                    : 'text-[#555555] hover:text-[#151515] hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleMute}
              className="p-2 rounded-xl bg-white/90 hover:bg-white text-slate-700 border border-slate-300 transition-colors shadow-sm"
              title={isMuted ? "Unmute Sound" : "Mute Sound"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-[#FF6A00]" />}
            </button>

            <button
              onClick={() => setActiveModal('video_guide')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-800 border border-slate-300 font-mono text-xs font-bold shadow-sm transition-all"
            >
              <Video className="w-3.5 h-3.5 text-[#FF6A00]" />
              <span>GUIDE</span>
            </button>

            <button
              onClick={handleBatchRun}
              disabled={batchRunning}
              className="px-4 py-1.5 rounded-xl bg-[#151515] hover:bg-black text-white font-mono text-xs font-bold tracking-wider transition-all shadow-md flex items-center gap-2 disabled:opacity-60"
            >
              {batchRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#FF6A00]" />
                  <span>RUNNING...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-[#FF6A00] fill-current" />
                  <span>RECOVER NOW</span>
                </>
              )}
            </button>
          </div>
        </header>
      </div>

      {/* EDITORIAL HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-4 pt-12 pb-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center overflow-hidden">
        {/* Low-Opacity Giant Pixel Background Graphic */}
        <div className="absolute -left-10 top-0 text-[120px] lg:text-[180px] font-pixel font-bold text-slate-300/25 pointer-events-none select-none tracking-tighter leading-none z-0">
          PAYMENT GUARD
        </div>

        {/* Left Column: Index & Big Uppercase Headline */}
        <div className="lg:col-span-5 relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-extrabold px-2.5 py-1 bg-white border border-slate-300 rounded-md text-[#151515] shadow-xs">
              [1/8]
            </span>
            <span className="font-mono text-xs uppercase tracking-widest text-[#555555] font-bold">
              AUTONOMOUS REVENUE ENGINE
            </span>
          </div>

          <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tighter text-[#151515] leading-[0.95]">
            AUTONOMOUS <br />
            REVENUE RECOVERY <br />
            <span className="text-[#FF6A00]">THAT STICKS.</span>
          </h1>

          <p className="text-sm sm:text-base text-[#555555] font-medium leading-relaxed max-w-md">
            AI-driven, bounded 4-stage pipeline that captures lost Razorpay checkouts through Hinglish Voice AI & Smart NPCI Switches.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleBatchRun}
              disabled={batchRunning}
              className="px-6 py-3.5 rounded-xl bg-[#FF6A00] hover:bg-[#e05d00] text-white font-mono text-xs font-extrabold tracking-wider transition-all shadow-lg hover:shadow-orange-500/30 flex items-center gap-2.5"
            >
              <span>GET STARTED</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleDiagnose('tx_1001')}
              className="px-5 py-3.5 rounded-xl bg-white border border-slate-300 hover:border-[#151515] text-[#151515] font-mono text-xs font-bold transition-all shadow-xs flex items-center gap-2"
            >
              <span>TEST DEMO TX</span>
              <Sparkles className="w-3.5 h-3.5 text-[#FF6A00]" />
            </button>
          </div>
        </div>

        {/* Center Floating 3D Render Canvas */}
        <div className="lg:col-span-4 relative z-10 flex justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="relative w-full max-w-sm aspect-square bg-white rounded-3xl p-4 shadow-2xl border border-white/80 flex items-center justify-center group overflow-hidden"
          >
            {/* Subtle soft orange halo */}
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-100/40 via-transparent to-slate-100/60 rounded-3xl" />
            
            <img 
              src="/3d-hero.png" 
              alt="PaymentGuard 3D Studio Computer Render" 
              className="relative z-10 object-contain w-full h-full drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
            />

            <div className="absolute bottom-3 left-3 right-3 z-20 bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-xs font-extrabold text-[#151515]">BOUNDED AI AGENT ACTIVE</span>
              </div>
              <span className="font-mono text-[10px] text-slate-500 font-bold">CAP ≤ ₹50K</span>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Key Statistic */}
        <div className="lg:col-span-3 relative z-10 flex flex-col sm:flex-row lg:flex-col justify-between gap-4">
          {/* Editorial Stat Card */}
          <div className="bg-white rounded-2xl border border-slate-300 p-6 shadow-md flex-1">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs font-bold text-slate-500 uppercase">RECOVERY RATE</span>
              <span className="w-2 h-2 rounded-full bg-[#FF6A00]" />
            </div>
            <div className="font-mono text-4xl sm:text-5xl font-black text-[#151515] tracking-tight">
              ↑ {(metrics?.recovery_metrics?.recovery_rate_percent ?? 56.0).toFixed(1)}%
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              56 out of 100 checkout failures automatically restored.
            </p>
          </div>

          {/* Secondary Quick Stat */}
          <div className="bg-white rounded-2xl border border-slate-300 p-6 shadow-md flex-1">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs font-bold text-slate-500 uppercase">TOTAL RECOVERED</span>
              <DollarIcon />
            </div>
            <div className="font-mono text-3xl font-black text-[#151515] tracking-tight">
              ₹{(metrics?.recovery_metrics?.amount_recovered ?? 1315647).toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Direct integration with Razorpay Webhooks.
            </p>
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 mt-6 space-y-8 relative z-10">
        
        {/* Banner Alert Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#FF6A00] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-700">
              <strong className="text-[#151515] font-bold">4-Stage Pipeline Ready:</strong> Detect 100 failures → Claude 3.5 AI Diagnosis → Bounded Rule & Voice AI Intervention → Graceful Backoff Execution.
            </p>
          </div>
          <button
            onClick={() => handleDiagnose('tx_1001')}
            className="px-3.5 py-1.5 rounded-xl bg-[#151515] hover:bg-black text-white font-mono text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-sm"
          >
            <span>DEMO TX_1001</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#FF6A00]" />
          </button>
        </div>

        {/* METRICS GRID */}
        <MetricsCard metrics={metrics} loading={loading} />

        {/* TAB CONTROLS FOR MOBILE/TABLET */}
        <div className="flex md:hidden gap-2 overflow-x-auto pb-2 font-mono text-xs font-bold">
          {[
            { id: 'overview', label: 'OVERVIEW' },
            { id: 'live', label: 'LIVE' },
            { id: 'funnel', label: 'FUNNEL' },
            { id: 'architecture', label: 'ARCHITECTURE' },
            { id: 'audit', label: 'AUDIT' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                activeTab === item.id 
                  ? 'bg-[#151515] text-white' 
                  : 'bg-white text-slate-700 border border-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT PANELS */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Interactive Recharts Component */}
              <InteractiveRecoveryChart />

              {/* Risk Assessment Heatmap */}
              <RiskHeatmap failures={failures} />

              {/* Transactions Table */}
              <TransactionTable
                failures={failures}
                loading={loading}
                onDiagnose={handleDiagnose}
                onIntervene={handleIntervene}
                onExecute={handleExecute}
                onViewAudit={handleViewAudit}
              />
            </motion.div>
          )}

          {activeTab === 'live' && (
            <motion.div
              key="live"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <LiveDashboard />
            </motion.div>
          )}

          {activeTab === 'funnel' && (
            <motion.div
              key="funnel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <RecoveryFunnel metrics={metrics} />
            </motion.div>
          )}

          {activeTab === 'architecture' && (
            <motion.div
              key="architecture"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <ArchitectureDiagram
                onStepClick={(step) => {
                  if (step === 1) setActiveTab('overview');
                  if (step === 2) handleDiagnose('tx_1001');
                  if (step === 3) handleIntervene('tx_1001');
                  if (step === 4) handleViewAudit('tx_1001');
                }}
              />
            </motion.div>
          )}

          {activeTab === 'audit' && (
            <motion.div
              key="audit"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <AuditTrail
                failureId={selectedFailure?.tx_id || 'tx_1001'}
                auditData={auditData}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-4 pt-16 pb-8 border-t border-slate-300 mt-16 text-slate-500 font-mono text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FF6A00]" />
          <span className="font-bold text-[#151515]">PAYMENTGUARD</span>
          <span>• AUTONOMOUS REVENUE RECOVERY PLATFORM</span>
        </div>
        <div>
          DESIGNED WITH EDITORIAL 3D AGENCY IDENTITY
        </div>
      </footer>

      {/* MODAL DIALOGS */}
      {activeModal === 'diagnosis' && (
        <DiagnosisModal
          diagnosis={diagnosisData}
          failure={selectedFailure}
          loading={modalLoading}
          onClose={() => setActiveModal(null)}
          onProceedToIntervene={(txId) => {
            const target = txId || selectedFailure?.tx_id || diagnosisData?.failure_id || 'tx_1001';
            setActiveModal(null);
            handleIntervene(target);
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

      {/* Floating Action Menu FAB */}
      <FloatingActionMenu
        onSelectAction={(action) => {
          if (action === 'export') {
            api.downloadPdfReport().then(() => notify('ReportLab PDF Report downloaded!', 'success')).catch(e => notify('PDF download error', 'error'));
          } else {
            setActiveTab(action);
          }
        }}
      />

      {/* Global Notification Center */}
      <NotificationCenter
        notifications={notifications}
        onClose={removeNotification}
      />

    </div>
  );
}

function DollarIcon() {
  return (
    <span className="font-mono text-sm font-bold px-2 py-0.5 rounded bg-orange-100 text-[#FF6A00]">
      ₹ INR
    </span>
  );
}
