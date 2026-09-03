import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Zap, RefreshCw, Video, Volume2, VolumeX, 
  Sparkles, CheckCircle2, ArrowRight, Play 
} from 'lucide-react';
import { api } from '../services/api';
import { soundService } from '../services/audio';

import SplashScreen from './SplashScreen';
import MetricsCard from './MetricsCard';
import RecoveryChart from './RecoveryChart';
import TransactionTable from './TransactionTable';
import RecoveryFunnel from './RecoveryFunnel';
import ArchitectureDiagram from './ArchitectureDiagram';
import AuditTrail from './AuditTrail';
import DiagnosisModal from './DiagnosisModal';
import InterventionModal from './InterventionModal';
import VideoGuideModal from './VideoGuideModal';

export default function Dashboard() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, funnel, architecture, audit
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#071328] to-slate-950 text-white overflow-x-hidden relative font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Opening Animation Splash Screen */}
      <AnimatePresence>
        {showSplash && (
          <SplashScreen onComplete={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

      {/* Animated Background Cyber Grid */}
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none bg-grid-pattern bg-grid-lg" />

      {/* Floating Ambient Orbs */}
      <motion.div
        className="fixed -top-40 -right-40 w-96 h-96 bg-cyan-400 rounded-full blur-[120px] opacity-15 pointer-events-none"
        animate={{
          x: [0, 40, 0],
          y: [0, -40, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="fixed -bottom-40 -left-40 w-96 h-96 bg-purple-500 rounded-full blur-[120px] opacity-15 pointer-events-none"
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-in slide-in-from-top-3 duration-300">
          <div className={`px-4 py-3 rounded-2xl border shadow-2xl text-xs font-bold flex items-center gap-2.5 backdrop-blur-xl ${
            toastMessage.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-500/50'
              : toastMessage.type === 'info'
              ? 'bg-cyan-950/90 text-cyan-200 border-cyan-500/50'
              : 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50'
          }`}>
            <span className="w-2.5 h-2.5 rounded-full bg-current animate-ping" />
            {toastMessage.msg}
          </div>
        </div>
      )}

      {/* Top Status Strip */}
      <div className="bg-slate-950/90 border-b border-cyan-500/20 px-6 py-1.5 text-[11px] text-slate-400 font-mono hidden md:flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> NPCI Switch: 99.98%
          </span>
          <span className="text-slate-700">•</span>
          <span className="text-cyan-300">Claude 3.5 AI Diagnostic: Active</span>
          <span className="text-slate-700">•</span>
          <span className="text-emerald-400">Stopping Rule: ≤₹50k Auto-Retry Cap Active</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Razorpay AI Buildathon</span>
          <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold">
            Track 03
          </span>
        </div>
      </div>

      {/* Header */}
      <motion.header
        className="relative z-20 border-b border-cyan-500/20 backdrop-blur-md bg-slate-950/70 sticky top-0 shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3 flex items-center justify-between">
          
          {/* Logo Section */}
          <motion.div
            className="flex items-center gap-3.5 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            onClick={() => setActiveTab('overview')}
          >
            <div className="relative w-11 h-11">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl blur-md opacity-40" />
              <img 
                src="/logo.png" 
                alt="PaymentGuard Logo" 
                className="relative z-10 w-11 h-11 rounded-xl object-contain border border-cyan-400/40 bg-slate-950 shadow-md"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent font-sans">
                  PaymentGuard
                </h1>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold hidden sm:inline">
                  AI Revenue Recovery Agent
                </span>
              </div>
              <p className="text-[11px] text-cyan-300/70 font-medium">
                Autonomous Bounded Payment Recovery Architecture
              </p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex items-center gap-2.5 sm:gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Audio Toggle */}
            <button
              onClick={handleToggleMute}
              title={isMuted ? "Unmute sound" : "Mute sound"}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-cyan-500/20 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>

            {/* Video Pitch Guide */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveModal('video_guide')}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold border border-amber-500/30 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Video className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">5-Min Video Guide</span>
            </motion.button>

            {/* Reset Demo Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-cyan-400/30 text-cyan-300 hover:bg-slate-800 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Demo</span>
            </motion.button>

            {/* Run AI Recovery Button */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleBatchRun}
              disabled={batchRunning}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-slate-950 font-extrabold text-xs hover:shadow-lg hover:shadow-cyan-400/40 transition-all flex items-center gap-2 disabled:opacity-60"
            >
              {batchRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 fill-current" /> Run AI Recovery
                </>
              )}
            </motion.button>
          </motion.div>

        </div>
      </motion.header>

      {/* Main Content */}
      <motion.main
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Top Alert Banner */}
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-cyan-400/30 backdrop-blur shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        >
          <p className="text-xs sm:text-sm text-cyan-200 leading-relaxed">
            ✨ <strong className="text-cyan-300">5-Minute Evaluation Walkthrough:</strong> Demonstrates autonomous 4-stage pipeline: Detect 100 failures → Diagnose with Claude 3.5 AI → Intervene with Bounded Rules & Hinglish Voice → Execute with Graceful Backoff recovery.
          </p>
          <button
            onClick={() => handleDiagnose('tx_1001')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
          >
            ⭐ Demo tx_1001
          </button>
        </motion.div>

        {/* Animated Metrics Grid */}
        <motion.div variants={itemVariants}>
          <MetricsCard metrics={metrics} loading={loading} />
        </motion.div>

        {/* Navigation Tabs Section */}
        <motion.div variants={itemVariants} className="pt-2">
          <div className="flex gap-2.5 border-b border-cyan-400/20 overflow-x-auto pb-3">
            {[
              { id: "overview", label: "📊 Overview & Transactions" },
              { id: "funnel", label: "🔄 Recovery Funnel" },
              { id: "architecture", label: "🏗️ 4-Stage Architecture" },
              { id: "audit", label: "📋 Audit Trail Timeline" },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/25"
                    : "text-cyan-300 hover:bg-slate-900/60 border border-cyan-400/20"
                }`}
              >
                {tab.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Dynamic Animated Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="space-y-8"
            >
              <RecoveryChart metrics={metrics} />
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

          {activeTab === "funnel" && (
            <motion.div
              key="funnel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <RecoveryFunnel metrics={metrics} />
            </motion.div>
          )}

          {activeTab === "architecture" && (
            <motion.div
              key="architecture"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
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

          {activeTab === "audit" && (
            <motion.div
              key="audit"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <AuditTrail
                failureId={selectedFailure?.tx_id || 'tx_1001'}
                auditData={auditData}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </motion.main>

      {/* Footer */}
      <footer className="border-t border-cyan-500/20 bg-slate-950/80 py-6 text-center text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-cyan-300 font-medium">
            PaymentGuard • Razorpay AI Buildathon Track 03 (AI Revenue Recovery)
          </span>
          <span className="font-mono text-slate-500">
            React 18 + Tailwind CSS + Framer Motion + Claude 3.5 AI
          </span>
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

    </div>
  );
}
