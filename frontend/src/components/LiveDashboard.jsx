import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Play, RefreshCw, CheckCircle2, Coins, BarChart3, Activity, Settings } from "lucide-react";
import { api } from "../services/api";

export default function LiveDashboard() {
  const [ws, setWs] = useState(null);
  const [progress, setProgress] = useState(0);
  const [metrics, setMetrics] = useState({
    completed: 0,
    total: 0,
    recovered: 0,
    amount: "₹0",
    rate: 0
  });
  const [isRunning, setIsRunning] = useState(false);
  const [currentTx, setCurrentTx] = useState(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" 
      ? "localhost:8000" 
      : window.location.host;
    
    const wsUrl = `${protocol}//${host}/ws/recovery`;
    const websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {
      setWsConnected(true);
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "started") {
          setIsRunning(true);
          setMetrics(prev => ({ ...prev, total: data.total, completed: 0 }));
        }
        
        if (data.type === "progress") {
          setProgress(data.percentage);
          setMetrics({
            completed: data.completed,
            total: data.total,
            recovered: data.recovered,
            amount: data.amount,
            rate: data.rate
          });
          setCurrentTx(data.current_tx);
        }
        
        if (data.type === "complete") {
          setIsRunning(false);
          setProgress(100);
          setMetrics(prev => ({
            ...prev,
            completed: data.completed,
            total: data.total,
            recovered: data.recovered,
            amount: data.amount,
            rate: data.rate
          }));
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };
    
    websocket.onerror = (err) => {
      console.warn("WebSocket error:", err);
      setWsConnected(false);
    };

    websocket.onclose = () => {
      setWsConnected(false);
    };

    setWs(websocket);
    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, []);

  const startRecovery = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      setIsRunning(true);
      ws.send(JSON.stringify({ action: "start_recovery" }));
    } else {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = "localhost:8000";
      const newWs = new WebSocket(`${protocol}//${host}/ws/recovery`);
      newWs.onopen = () => {
        setWsConnected(true);
        newWs.send(JSON.stringify({ action: "start_recovery" }));
      };
      setWs(newWs);
    }
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      await api.downloadPdfReport();
    } catch (err) {
      console.error("Failed to download PDF report:", err);
      alert("Error downloading PDF report. Please verify backend service is active.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 max-w-7xl mx-auto"
    >
      {/* Header Bar */}
      <div className="bg-white rounded-3xl border border-slate-300 p-6 sm:p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6A00] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF6A00]"></span>
            </span>
            <h2 className="font-display font-black text-2xl text-[#151515] uppercase tracking-tight">
              LIVE RECOVERY PIPELINE
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time FastAPI WebSocket streaming • 100% Free • ReportLab PDF Export
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* PDF Download Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-[#151515] font-mono text-xs font-bold rounded-xl flex items-center gap-2 transition shadow-xs disabled:opacity-50"
          >
            {isDownloadingPdf ? (
              <RefreshCw className="w-4 h-4 animate-spin text-[#FF6A00]" />
            ) : (
              <Download className="w-4 h-4 text-[#FF6A00]" />
            )}
            <span>DOWNLOAD PDF REPORT</span>
          </button>

          {/* Start Recovery Button */}
          <button
            onClick={startRecovery}
            disabled={isRunning}
            className="px-6 py-2.5 bg-[#FF6A00] hover:bg-[#e05d00] text-white font-mono text-xs font-extrabold rounded-xl shadow-md disabled:opacity-50 flex items-center gap-2 transition-all"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>RUNNING...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-white" />
                <span>START RECOVERY</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="bg-white rounded-3xl border border-slate-300 p-6 shadow-md space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="font-display font-extrabold text-base text-[#151515] uppercase tracking-tight">EXECUTION PROGRESS</span>
            <span className={`font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${wsConnected ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300'}`}>
              {wsConnected ? "WEBSOCKET CONNECTED" : "CONNECTING WS..."}
            </span>
          </div>
          <span className="font-mono text-3xl font-black text-[#151515]">
            {progress.toFixed(1)}%
          </span>
        </div>

        {/* Outer track */}
        <div className="relative h-4 rounded-full bg-slate-200 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full bg-[#FF6A00]"
          />
        </div>

        <div className="flex justify-between text-xs text-slate-500 font-mono font-medium">
          <span>{metrics.completed} OF {metrics.total || 100} TRANSACTIONS PROCESSED</span>
          <span>{isRunning ? "PROCESSING..." : progress === 100 ? "BATCH COMPLETED ✓" : "READY"}</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />} label="RECOVERED TXNS" value={metrics.recovered} />
        <MetricCard icon={<Coins className="w-5 h-5 text-[#FF6A00]" />} label="AMOUNT SAVED" value={metrics.amount} />
        <MetricCard icon={<BarChart3 className="w-5 h-5 text-purple-600" />} label="SUCCESS RATE" value={`${typeof metrics.rate === 'number' ? metrics.rate.toFixed(1) : metrics.rate}%`} />
        <MetricCard icon={<Activity className="w-5 h-5 text-blue-600" />} label="PIPELINE STATUS" value={isRunning ? "Processing" : "Ready"} />
      </div>

      {/* Currently Processing Transaction Card */}
      {currentTx && (
        <div className="bg-white rounded-3xl border border-slate-300 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#FF6A00] uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6A00] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF6A00]"></span>
              </span>
              CURRENTLY PROCESSING TRANSACTION
            </div>
            <p className="font-mono text-[#151515] text-xl font-bold mt-1 tracking-wide">{currentTx}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-500 text-xs font-medium">Executing bounded AI recovery...</span>
            <Settings className="w-6 h-6 text-[#FF6A00] animate-spin" />
          </div>
        </div>
      )}
    </motion.div>
  );
}

function MetricCard({ icon, label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-300 p-5 text-center shadow-xs flex flex-col items-center">
      <div className="mb-2 flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 border border-slate-200">{icon}</div>
      <p className="font-mono text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{label}</p>
      <p className="font-mono text-2xl font-black text-[#151515]">{value}</p>
    </div>
  );
}
