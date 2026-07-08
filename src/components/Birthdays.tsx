import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Cake, 
  Phone, 
  Calendar, 
  Clock,
  User,
  ExternalLink
} from 'lucide-react';

export const Birthdays: React.FC = () => {
  const { birthdays, addBirthday, updateBirthday, deleteBirthday, settings } = useApp();
  const t = translations[settings.language];

  // Modal / Form States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBirthday, setEditingBirthday] = useState<any | null>(null);

  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [phone, setPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [reminderTime, setReminderTime] = useState('');

  const openAddModal = () => {
    setEditingBirthday(null);
    setName('');
    setDate(new Date().toISOString().split('T')[0]);
    setPhone('');
    setPhotoUrl('');
    setReminderTime('');
    setModalOpen(true);
  };

  const openEditModal = (bday: any) => {
    setEditingBirthday(bday);
    setName(bday.name);
    setDate(bday.date);
    setPhone(bday.phone || '');
    setPhotoUrl(bday.photoUrl || '');
    setReminderTime(bday.reminderTime || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !date) return;

    const payload = {
      name,
      date,
      phone: phone || undefined,
      photoUrl: photoUrl || undefined,
      reminderTime: reminderTime || undefined
    };

    if (editingBirthday) {
      await updateBirthday(editingBirthday.id, payload);
    } else {
      await addBirthday(payload);
    }
    setModalOpen(false);
  };

  // Helper: Calculate days remaining until next birthday
  const getDaysUntilBirthday = (bdayDateStr: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const bdayObj = new Date(bdayDateStr);
    
    const nextBday = new Date(today.getFullYear(), bdayObj.getMonth(), bdayObj.getDate());
    if (nextBday < today) {
      nextBday.setFullYear(today.getFullYear() + 1);
    }

    const diffTime = nextBday.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 365 || diffDays === 0 ? 'Today!' : `${diffDays} days left`;
  };

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t.birthdayReminder}</h2>
          <p className="text-xs text-slate-500">Log and manage birthdays and greetings countdowns</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20"
        >
          <Plus size={16} />
          <span>{t.addBirthday}</span>
        </button>
      </div>

      {/* Grid: Birthdays list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {birthdays.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center rounded-3xl text-slate-400 flex flex-col items-center justify-center">
            <Cake size={40} className="text-slate-300 mb-2" />
            <p className="text-sm font-medium">{t.noBirthdays}</p>
          </div>
        ) : (
          birthdays.map(bday => {
            const daysLeftText = getDaysUntilBirthday(bday.date);
            const isTodayBday = daysLeftText === 'Today!';
            
            return (
              <div 
                key={bday.id} 
                className={`bg-white dark:bg-slate-900 border p-5 rounded-3xl shadow-xs hover:shadow-md transition-all duration-200 flex items-start gap-4 relative overflow-hidden ${
                  isTodayBday 
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20' 
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {isTodayBday && (
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl tracking-wider uppercase animate-bounce">
                    Today!
                  </div>
                )}

                {/* Avatar */}
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-100 to-indigo-50 dark:from-slate-800 dark:to-slate-950 flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-200/50">
                  {bday.photoUrl ? (
                    <img 
                      src={bday.photoUrl} 
                      alt={bday.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = ''; // fall back to Icon
                      }}
                    />
                  ) : (
                    <User size={24} className="text-indigo-400" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div>
                    <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 truncate">{bday.name}</h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                      <Calendar size={12} />
                      {bday.date}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center text-[11px] font-bold">
                    <span className={`px-2.5 py-0.5 rounded-full ${
                      isTodayBday 
                        ? 'bg-rose-500/15 text-rose-500' 
                        : 'bg-slate-100 dark:bg-slate-950 text-slate-500'
                    }`}>
                      {daysLeftText}
                    </span>

                    {bday.phone && (
                      <a 
                        href={`tel:${bday.phone}`}
                        className="p-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg flex items-center gap-1"
                        title={`Call ${bday.name}`}
                      >
                        <Phone size={11} />
                        Call
                      </a>
                    )}
                  </div>

                  {bday.reminderTime && (
                    <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <Clock size={10} />
                      Reminder at {bday.reminderTime}
                    </p>
                  )}
                </div>

                {/* Edit / Delete Row */}
                <div className="flex flex-col gap-1.5 self-center">
                  <button 
                    onClick={() => openEditModal(bday)}
                    className="p-1 text-slate-400 hover:text-indigo-600"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button 
                    onClick={() => deleteBirthday(bday.id)}
                    className="p-1 text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl shadow-xl overflow-hidden animate-zoom-in">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                {editingBirthday ? t.edit : t.addBirthday}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">{t.name} *</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  placeholder="Friend's name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none"
                />
              </div>

              {/* Birthdate */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">{t.date} *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">{t.phone}</label>
                <input
                  type="tel"
                  placeholder="+94 77..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none"
                />
              </div>

              {/* Photo URL */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">{t.photo}</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none"
                />
              </div>

              {/* Reminder time */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">{t.reminder} Time</label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none"
                />
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
