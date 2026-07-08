import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ScheduleManager } from './components/ScheduleManager';
import { Goals } from './components/Goals';
import { Notes } from './components/Notes';
import { ExpenseTracker } from './components/ExpenseTracker';
import { Birthdays } from './components/Birthdays';
import { Medicines } from './components/Medicines';
import { ShoppingList } from './components/ShoppingList';
import { Reports } from './components/Reports';
import { AdminPanel } from './components/AdminPanel';
import { SettingsTab } from './components/SettingsTab';
import { Auth } from './components/Auth';
import { Menu, Sparkles } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, loading } = useApp();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  // Centered loader while initializing Firestore connection
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider animate-pulse">Initializing Life Manager...</p>
      </div>
    );
  }

  // Unauthenticated screen
  if (!user) {
    return <Auth />;
  }

  // Active View Swapper
  const renderActiveTab = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard setCurrentTab={setCurrentTab} />;
      case 'tasks':
        return <ScheduleManager />;
      case 'goals':
        return <Goals />;
      case 'notes':
        return <Notes />;
      case 'expenses':
        return <ExpenseTracker />;
      case 'birthdays':
        return <Birthdays />;
      case 'medicines':
        return <Medicines />;
      case 'shopping':
        return <ShoppingList />;
      case 'reports':
        return <Reports />;
      case 'admin':
        return <AdminPanel />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <Dashboard setCurrentTab={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-slate-200 font-sans flex transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        mobileOpen={mobileOpen} 
        setMobileOpen={setMobileOpen} 
      />

      {/* Main Panel Content container */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-[#161920]/80 border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-30 shadow-xs backdrop-blur-md">
          <button 
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg bg-white/5 text-slate-200 hover:bg-white/10"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-1.5 font-bold">
            <Sparkles size={16} className="text-[#6366f1] animate-pulse" />
            <span className="text-sm bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Life Manager
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6366f1] to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
            {(user.displayName?.[0] || user.email?.[0] || 'U').toUpperCase()}
          </div>
        </header>

        {/* Dynamic component viewport content */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
