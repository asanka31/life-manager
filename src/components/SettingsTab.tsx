import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { 
  Settings, 
  Globe, 
  Palette, 
  User, 
  Info, 
  CheckCircle,
  HelpCircle,
  ShieldAlert
} from 'lucide-react';

export const SettingsTab: React.FC = () => {
  const { user, settings, updateSettings, editProfileDisplayName } = useApp();
  const t = translations[settings.language];

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    
    await editProfileDisplayName(displayName.trim());
    setSaveStatus("Profile updated successfully!");
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const changeLanguage = async (lang: 'en' | 'si') => {
    await updateSettings({ language: lang });
    setSaveStatus("Language changed!");
    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header Row */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t.settings}</h2>
        <p className="text-xs text-slate-500">Configure personal parameters and preferred localization</p>
      </div>

      {/* Save Toast */}
      {saveStatus && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle size={16} />
          {saveStatus}
        </div>
      )}

      {/* Section 1: User Profile Customizer */}
      {user && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xs space-y-4">
          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm border-b pb-3 border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <User size={16} className="text-indigo-500" />
            Profile Settings
          </h4>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">{t.email}</label>
                <input
                  type="email"
                  disabled
                  value={user.email || ''}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-400 outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  placeholder="Display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              Update Profile Name
            </button>
          </form>
        </div>
      )}

      {/* Section 2: Localization */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xs space-y-4">
        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm border-b pb-3 border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <Globe size={16} className="text-indigo-500" />
          Language Selection
        </h4>

        <div className="flex gap-3">
          <button
            onClick={() => changeLanguage('en')}
            className={`px-5 py-3 rounded-xl border text-xs font-bold transition-all ${
              settings.language === 'en'
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/15'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'
            }`}
          >
            English (US)
          </button>
          <button
            onClick={() => changeLanguage('si')}
            className={`px-5 py-3 rounded-xl border text-xs font-bold transition-all ${
              settings.language === 'si'
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/15'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'
            }`}
          >
            සිංහල (Sinhala)
          </button>
        </div>
      </div>

      {/* Section 3: App info */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xs space-y-3">
        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm border-b pb-3 border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <Info size={16} className="text-indigo-500" />
          Application Details
        </h4>
        <div className="text-xs text-slate-500 leading-relaxed space-y-1.5">
          <p>Product: <strong className="font-semibold text-slate-700 dark:text-slate-300">Life Manager Production-Ready Version</strong></p>
          <p>Database Engine: <strong className="font-semibold text-slate-700 dark:text-slate-300">Google Cloud Firestore</strong></p>
          <p>Security Standard: <strong className="font-semibold text-slate-700 dark:text-slate-300">Strict Zero-Trust Model</strong></p>
        </div>
      </div>
    </div>
  );
};
