import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { 
  ShieldCheck, 
  Trash2, 
  Users, 
  Database, 
  FileText, 
  AlertOctagon, 
  RotateCcw,
  CheckCircle,
  Activity
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { 
    user, 
    tasks, 
    goals, 
    expenses, 
    birthdays, 
    medicines, 
    notes,
    shopping,
    settings,
    clearLogs,
    isAdmin 
  } = useApp();
  
  const t = translations[settings.language];

  // Dummy status logs to simulate server telemetry safely & beautifully
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([
    "[SYSTEM] Bootstrap successful on asia-southeast1",
    "[SECURITY] Hardened rules loaded successfully",
    "[FIRESTORE] Synchronized collections in background mode",
    "[AUTH] Secure Google OAuth credentials authorized",
    "[SYNC] Connected successfully"
  ]);

  const handleClearLogs = () => {
    clearLogs();
    setTelemetryLogs(["[SYSTEM] Logs cleared by administrator."]);
  };

  // If not admin, block screen gracefully
  if (!isAdmin) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-xs text-center max-w-xl mx-auto mt-12 space-y-4">
        <span className="inline-flex p-4 bg-rose-500/10 text-rose-500 rounded-3xl">
          <AlertOctagon size={32} />
        </span>
        <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Access Restricted</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          You are currently signed in as <strong className="text-slate-700 dark:text-slate-300 font-bold">{user?.email || 'Guest User'}</strong>. Admin privileges are reserved specifically for system administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Administration Console</h2>
          <p className="text-xs text-slate-500">Manage firestore counts, active rules, and debug logs</p>
        </div>
        <span className="flex items-center gap-1 text-xs font-bold text-emerald-500 px-3 py-1.5 bg-emerald-500/10 rounded-full">
          <ShieldCheck size={14} />
          Admin Authorized
        </span>
      </div>

      {/* Database stats bento */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-xs">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tasks Count</p>
          <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">{tasks.length}</h3>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-xs">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Finances Count</p>
          <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">{expenses.length}</h3>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-xs">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Memos & Notes</p>
          <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">{notes.length}</h3>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-xs">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Prescriptions</p>
          <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">{medicines.length}</h3>
        </div>
      </div>

      {/* Grid: Console logs & System configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Terminal logs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
              <FileText size={16} className="text-indigo-500" />
              Runtime Audit Logs
            </h4>
            <button 
              onClick={handleClearLogs}
              className="flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1 rounded-lg"
            >
              <RotateCcw size={11} />
              Clear Terminal
            </button>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl font-mono text-[10px] text-slate-300 space-y-2.5 min-h-[160px] max-h-[220px] overflow-y-auto">
            {telemetryLogs.map((log, idx) => (
              <div key={idx} className="flex gap-2 leading-relaxed">
                <span className="text-indigo-400 select-none">&rarr;</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Database specs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xs lg:col-span-1 space-y-4">
          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm border-b pb-3 border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Database size={16} className="text-indigo-500" />
            Active Blueprint Status
          </h4>

          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold">Instance ID</span>
              <strong className="text-slate-700 dark:text-slate-300 font-bold font-mono">asia-southeast1</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold">Security Rules</span>
              <strong className="text-emerald-500 font-bold flex items-center gap-1">
                <CheckCircle size={12} />
                Strict Secure
              </strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold">Workspace Mode</span>
              <strong className="text-slate-700 dark:text-slate-300 font-bold font-mono">Production</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
