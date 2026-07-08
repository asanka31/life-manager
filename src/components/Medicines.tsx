import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Activity, 
  Clock, 
  Check, 
  Bell, 
  BellOff,
  Pill,
  Heart
} from 'lucide-react';

export const Medicines: React.FC = () => {
  const { medicines, addMedicine, updateMedicine, deleteMedicine, settings } = useApp();
  const t = translations[settings.language];

  // Modal / Form States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<any | null>(null);

  const [name, setName] = useState('');
  const [dose, setDose] = useState('1 Pill');
  const [time, setTime] = useState('08:00');
  const [repeat, setRepeat] = useState<'daily' | 'weekly' | 'monthly' | 'as_needed'>('daily');
  const [notification, setNotification] = useState(true);

  const openAddModal = () => {
    setEditingMedicine(null);
    setName('');
    setDose('1 Pill');
    setTime('08:00');
    setRepeat('daily');
    setNotification(true);
    setModalOpen(true);
  };

  const openEditModal = (med: any) => {
    setEditingMedicine(med);
    setName(med.name);
    setDose(med.dose);
    setTime(med.time);
    setRepeat(med.repeat);
    setNotification(med.notification);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dose || !time) return;

    const payload = {
      name,
      dose,
      time,
      repeat,
      notification
    };

    if (editingMedicine) {
      await updateMedicine(editingMedicine.id, payload);
    } else {
      await addMedicine(payload);
    }
    setModalOpen(false);
  };

  const toggleNotification = async (med: any) => {
    await updateMedicine(med.id, { notification: !med.notification });
  };

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t.medicineReminder}</h2>
          <p className="text-xs text-slate-500">Log and coordinate prescription times and dosages</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20"
        >
          <Plus size={16} />
          <span>{t.addMedicine}</span>
        </button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {medicines.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center rounded-3xl text-slate-400 flex flex-col items-center justify-center">
            <Heart size={40} className="text-slate-300 mb-2 animate-pulse text-rose-500" />
            <p className="text-sm font-medium">{t.noMedicines}</p>
          </div>
        ) : (
          medicines.map(med => (
            <div 
              key={med.id} 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-xs hover:shadow-md transition-all duration-200 flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <span className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl flex-shrink-0">
                  <Activity size={22} className="animate-pulse" />
                </span>
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 truncate">{med.name}</h4>
                  <p className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                    <span>Dosage:</span>
                    <strong className="text-slate-700 dark:text-slate-300">{med.dose}</strong>
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {med.time}
                    </span>
                    <span className="capitalize px-1.5 py-0.5 bg-slate-100 dark:bg-slate-950 rounded">
                      {med.repeat}
                    </span>
                  </div>
                </div>
              </div>

              {/* Control Panel */}
              <div className="flex flex-col gap-1.5 items-end">
                <button
                  onClick={() => toggleNotification(med)}
                  className={`p-2 rounded-xl border transition-all ${
                    med.notification 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                      : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400'
                  }`}
                  title={med.notification ? "Mute alert" : "Enable alert"}
                >
                  {med.notification ? <Bell size={14} /> : <BellOff size={14} />}
                </button>

                <div className="flex gap-1.5 mt-2">
                  <button 
                    onClick={() => openEditModal(med)}
                    className="p-1 text-slate-400 hover:text-indigo-600"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button 
                    onClick={() => deleteMedicine(med.id)}
                    className="p-1 text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl shadow-xl overflow-hidden animate-zoom-in">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                {editingMedicine ? t.edit : t.addMedicine}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Medicine Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Medicine Name *</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  placeholder="e.g. Paracetamol"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none"
                />
              </div>

              {/* Dosage */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">{t.dose} *</label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  placeholder="e.g. 1 Tablet or 5ml"
                  value={dose}
                  onChange={(e) => setDose(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">{t.time} *</label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none"
                />
              </div>

              {/* Repeat frequency */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">{t.repeat}</label>
                <select
                  value={repeat}
                  onChange={(e) => setRepeat(e.target.value as any)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none"
                >
                  <option value="daily">{t.daily}</option>
                  <option value="weekly">{t.weekly}</option>
                  <option value="monthly">{t.monthly}</option>
                  <option value="as_needed">{t.asNeeded}</option>
                </select>
              </div>

              {/* Notification active toggle */}
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                <input
                  type="checkbox"
                  id="notif-check"
                  checked={notification}
                  onChange={(e) => setNotification(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded"
                />
                <label htmlFor="notif-check" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Enable active push notification alarms
                </label>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/60 font-semibold">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
