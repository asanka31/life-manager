import React from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { 
  LayoutDashboard, 
  CalendarRange, 
  Target, 
  NotebookPen, 
  Wallet, 
  Cake, 
  Activity, 
  ShoppingBag, 
  FilePieChart, 
  ShieldAlert, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  setCurrentTab, 
  mobileOpen, 
  setMobileOpen 
}) => {
  const { profile, logout, settings, isAdmin } = useApp();
  const t = translations[settings.language];

  const menuItems = [
    { id: 'dashboard', name: t.dashboard, icon: LayoutDashboard },
    { id: 'tasks', name: t.scheduleManager, icon: CalendarRange },
    { id: 'goals', name: t.goals, icon: Target },
    { id: 'notes', name: t.notes, icon: NotebookPen },
    { id: 'expenses', name: t.expenseTracker, icon: Wallet },
    { id: 'birthdays', name: t.birthdayReminder, icon: Cake },
    { id: 'medicines', name: t.medicineReminder, icon: Activity },
    { id: 'shopping', name: t.shoppingList, icon: ShoppingBag },
    { id: 'reports', name: t.reports, icon: FilePieChart },
    ...(isAdmin ? [{ id: 'admin', name: t.adminPanel, icon: ShieldAlert }] : []),
    { id: 'settings', name: t.settings, icon: Settings },
  ];

  const handleNav = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#161920] text-slate-200 border-r border-white/5">
      {/* Brand */}
      <div className="p-6 border-b border-white/5 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#6366f1] rounded-lg flex items-center justify-center font-bold text-xl text-white">
          L
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-white leading-tight">
            LifeManager
          </h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Core Assistant</p>
        </div>
      </div>

      {/* User Info */}
      {profile && (
        <div className="px-6 py-4 border-b border-white/5 bg-white/3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#6366f1]/30 border border-white/10 flex items-center justify-center text-white font-bold text-lg">
            {profile.name[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-medium text-slate-200 truncate">{profile.name}</h4>
            <p className="text-xs text-slate-500 truncate">{profile.email}</p>
          </div>
          {profile.role === 'admin' && (
            <span className="text-[10px] px-1.5 py-0.5 bg-[#6366f1]/20 text-indigo-300 font-bold uppercase rounded border border-[#6366f1]/30">
              Admin
            </span>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-3 px-4">Core Modules</div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 group ${
                isActive 
                  ? 'bg-[#6366f1]/15 text-[#e2e8f0] border-l-3 border-[#6366f1] rounded-l-none' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <Icon 
                size={18} 
                className={`transition-colors duration-200 ${
                  isActive ? 'text-[#6366f1]' : 'text-slate-400 group-hover:text-slate-200'
                }`} 
              />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors duration-200"
        >
          <LogOut size={16} />
          <span>{t.logout}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" 
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-xs flex flex-col animate-slide-in">
            <button 
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 lg:hidden"
            >
              <X size={18} />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
