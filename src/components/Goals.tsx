import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Target, 
  Award, 
  CheckCircle,
  TrendingUp,
  Minus
} from 'lucide-react';

export const Goals: React.FC = () => {
  const { goals, addGoal, updateGoal, deleteGoal, settings } = useApp();
  const t = translations[settings.language];

  // Active filter: daily, weekly, monthly, yearly
  const [activeTab, setActiveTab] = useState<'all' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('all');

  // Modal / Form States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any | null>(null);

  const [title, setTitle] = useState('');
  const [type, setType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [current, setCurrent] = useState<number>(0);
  const [target, setTarget] = useState<number>(10);

  const openAddModal = () => {
    setEditingGoal(null);
    setTitle('');
    setType('daily');
    setCurrent(0);
    setTarget(10);
    setModalOpen(true);
  };

  const openEditModal = (goal: any) => {
    setEditingGoal(goal);
    setTitle(goal.title);
    setType(goal.type);
    setCurrent(goal.current);
    setTarget(goal.target);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || target <= 0) return;

    const payload = {
      title,
      type,
      current: Number(current),
      target: Number(target)
    };

    if (editingGoal) {
      await updateGoal(editingGoal.id, payload);
    } else {
      await addGoal(payload);
    }
    setModalOpen(false);
  };

  const incrementProgress = async (goal: any, step: number) => {
    const nextVal = Math.max(0, Math.min(goal.target, goal.current + step));
    await updateGoal(goal.id, { current: nextVal });
  };

  const filteredGoals = goals.filter(g => activeTab === 'all' || g.type === activeTab);

  // Stats
  const completedCount = goals.filter(g => g.current >= g.target).length;
  const totalCount = goals.length;
  const successRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t.goals}</h2>
          <p className="text-xs text-slate-500">Establish, measure, and accomplish your milestones</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20"
        >
          <Plus size={16} />
          <span>{t.addGoal}</span>
        </button>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xs">
        <div className="flex items-center gap-4">
          <span className="p-3 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <Target size={24} />
          </span>
          <div>
            <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Total Targets</p>
            <h4 className="text-2xl font-black text-slate-800 dark:text-slate-100">{totalCount}</h4>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="p-3 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <CheckCircle size={24} />
          </span>
          <div>
            <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Completed</p>
            <h4 className="text-2xl font-black text-slate-800 dark:text-slate-100">{completedCount}</h4>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="p-3 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl">
            <Award size={24} />
          </span>
          <div>
            <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Success Rate</p>
            <h4 className="text-2xl font-black text-slate-800 dark:text-slate-100">{successRate}%</h4>
          </div>
        </div>
      </div>

      {/* Type Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl w-max">
        {(['all', 'daily', 'weekly', 'monthly', 'yearly'] as const).map(tabOpt => (
          <button
            key={tabOpt}
            onClick={() => setActiveTab(tabOpt)}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-bold capitalize transition-all duration-150 ${
              activeTab === tabOpt
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tabOpt}
          </button>
        ))}
      </div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredGoals.length === 0 ? (
          <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center rounded-3xl text-slate-400 flex flex-col items-center justify-center">
            <Target size={40} className="text-slate-300 mb-2" />
            <p className="text-sm font-medium">{t.noGoals}</p>
          </div>
        ) : (
          filteredGoals.map(goal => {
            const percent = Math.min(100, Math.round((goal.current / goal.target) * 100));
            const isCompleted = goal.current >= goal.target;
            return (
              <div 
                key={goal.id} 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-indigo-500/10 text-indigo-600 rounded-md uppercase tracking-wider">
                      {goal.type}
                    </span>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => openEditModal(goal)}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button 
                        onClick={() => deleteGoal(goal.id)}
                        className="p-1 text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Goal Target */}
                  <h4 className={`text-sm font-bold text-slate-800 dark:text-slate-100 mt-2 ${
                    isCompleted ? 'text-slate-500 line-through' : ''
                  }`}>
                    {goal.title}
                  </h4>
                </div>

                {/* Progress Visualizer */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-400">
                      {goal.current} / {goal.target}
                    </span>
                    <span className={isCompleted ? 'text-emerald-500' : 'text-indigo-600 dark:text-indigo-400'}>
                      {percent}%
                    </span>
                  </div>

                  {/* Progress Bar Container */}
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200/40 dark:border-slate-800/40">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted 
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                          : 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Increments / Interactive Logs */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    {isCompleted ? (
                      <span className="text-emerald-500 flex items-center gap-1 font-semibold">
                        <CheckCircle size={12} /> Completed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <TrendingUp size={12} /> Work in progress
                      </span>
                    )}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => incrementProgress(goal, -1)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-lg transition-colors"
                      title="Decrease progress"
                    >
                      <Minus size={12} />
                    </button>
                    <button
                      onClick={() => incrementProgress(goal, 1)}
                      className="px-2.5 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-[10px] font-bold transition-all"
                      title="Log Progress"
                    >
                      +1 Log
                    </button>
                  </div>
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
                {editingGoal ? t.edit : t.addGoal}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">{t.title} *</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none"
                />
              </div>

              {/* Goal Type */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Time Period</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none"
                >
                  <option value="daily">{t.daily}</option>
                  <option value="weekly">{t.weekly}</option>
                  <option value="monthly">{t.monthly}</option>
                  <option value="yearly">{t.yearly}</option>
                </select>
              </div>

              {/* Range: Current / Target */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">{t.current} Progress</label>
                  <input
                    type="number"
                    min={0}
                    value={current}
                    onChange={(e) => setCurrent(Number(e.target.value))}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">{t.target} Milestone *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={target}
                    onChange={(e) => setTarget(Number(e.target.value))}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md"
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
