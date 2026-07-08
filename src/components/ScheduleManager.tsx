import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit2, 
  Calendar, 
  Clock, 
  Check, 
  AlertCircle,
  Repeat,
  Tag
} from 'lucide-react';

export const ScheduleManager: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, settings } = useApp();
  const t = translations[settings.language];

  // Active view: day, week, month, agenda
  const [activeView, setActiveView] = useState<'day' | 'week' | 'month' | 'agenda'>('agenda');
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Modal / Form States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Personal');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [status, setStatus] = useState<'todo' | 'in_progress' | 'completed'>('todo');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [reminderTime, setReminderTime] = useState('');
  const [repeat, setRepeat] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingTask(null);
    setTitle('');
    setCategory('Personal');
    setPriority('medium');
    setStatus('todo');
    setDueDate(new Date().toISOString().split('T')[0]);
    setReminderTime('');
    setRepeat('none');
    setNotes('');
    setModalOpen(true);
  };

  const openEditModal = (task: any) => {
    setEditingTask(task);
    setTitle(task.title);
    setCategory(task.category);
    setPriority(task.priority);
    setStatus(task.status);
    setDueDate(task.dueDate);
    setReminderTime(task.reminderTime || '');
    setRepeat(task.repeat);
    setNotes(task.notes || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      title,
      category,
      priority,
      status,
      dueDate,
      reminderTime: reminderTime || undefined,
      repeat,
      notes: notes || undefined
    };

    if (editingTask) {
      await updateTask(editingTask.id, payload);
    } else {
      await addTask(payload);
    }
    setModalOpen(false);
  };

  const toggleTaskStatus = async (task: any) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    await updateTask(task.id, { status: newStatus });
  };

  // Filter calculations
  const todayStr = new Date().toISOString().split('T')[0];
  
  const getEndOfWeekDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  };

  const getEndOfMonthDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  };

  const endOfWeek = getEndOfWeekDate();
  const endOfMonth = getEndOfMonthDate();

  const filteredTasks = tasks.filter(task => {
    // Search query match
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (task.notes && task.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    // Category match
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory;

    // Priority match
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;

    // View constraint match
    let matchesView = true;
    if (activeView === 'day') {
      matchesView = task.dueDate === todayStr;
    } else if (activeView === 'week') {
      matchesView = task.dueDate >= todayStr && task.dueDate <= endOfWeek;
    } else if (activeView === 'month') {
      matchesView = task.dueDate >= todayStr && task.dueDate <= endOfMonth;
    }

    return matchesSearch && matchesCategory && matchesPriority && matchesView;
  });

  // Unique categories for filtering
  const categoriesList = ['all', ...Array.from(new Set(tasks.map(t => t.category)))];

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{t.scheduleManager}</h2>
          <p className="text-xs text-slate-400">Plan and coordinate your tasks and agendas</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-[#6366f1] hover:bg-[#6366f1]/90 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#6366f1]/10"
        >
          <Plus size={16} />
          <span>{t.addTask}</span>
        </button>
      </div>

      {/* Tabs and Searching Panels */}
      <div className="glass-card p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* View Toggles */}
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
            {(['day', 'week', 'month', 'agenda'] as const).map(viewOption => (
              <button
                key={viewOption}
                onClick={() => setActiveView(viewOption)}
                className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all duration-150 ${
                  activeView === viewOption
                    ? 'bg-[#6366f1] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {viewOption}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-white/10 bg-[#161920] text-slate-200 outline-none focus:border-[#6366f1]"
            />
          </div>
        </div>

        {/* Filters Panel */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-white/5">
          <span className="text-xs text-slate-400 flex items-center gap-1.5 font-semibold">
            <Filter size={14} />
            {t.filter}:
          </span>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-white/10 bg-[#161920] text-slate-300 outline-none"
          >
            {categoriesList.map(cat => (
              <option key={cat} value={cat}>{cat === 'all' ? t.all : cat}</option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-white/10 bg-[#161920] text-slate-300 outline-none"
          >
            <option value="all">{t.all} Priorities</option>
            <option value="high">{t.high}</option>
            <option value="medium">{t.medium}</option>
            <option value="low">{t.low}</option>
          </select>
        </div>
      </div>

      {/* Kanban / Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* TO DO Column */}
        <div className="glass-card p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
            <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse" />
              {t.todo}
            </h4>
            <span className="text-xs font-bold px-2 py-0.5 bg-white/5 text-slate-400 rounded-md">
              {filteredTasks.filter(t => t.status === 'todo').length}
            </span>
          </div>

          <div className="space-y-4">
            {filteredTasks.filter(t => t.status === 'todo').map(task => (
              <TaskCard key={task.id} task={task} onEdit={openEditModal} onDelete={deleteTask} onToggle={toggleTaskStatus} onMove={updateTask} t={t} />
            ))}
          </div>
        </div>

        {/* IN PROGRESS Column */}
        <div className="glass-card p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
            <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
              {t.inProgress}
            </h4>
            <span className="text-xs font-bold px-2 py-0.5 bg-white/5 text-slate-400 rounded-md">
              {filteredTasks.filter(t => t.status === 'in_progress').length}
            </span>
          </div>

          <div className="space-y-4">
            {filteredTasks.filter(t => t.status === 'in_progress').map(task => (
              <TaskCard key={task.id} task={task} onEdit={openEditModal} onDelete={deleteTask} onToggle={toggleTaskStatus} onMove={updateTask} t={t} />
            ))}
          </div>
        </div>

        {/* COMPLETED Column */}
        <div className="glass-card p-4 flex flex-col md:col-span-2 lg:col-span-1">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
            <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
              {t.completed}
            </h4>
            <span className="text-xs font-bold px-2 py-0.5 bg-white/5 text-slate-400 rounded-md">
              {filteredTasks.filter(t => t.status === 'completed').length}
            </span>
          </div>

          <div className="space-y-4">
            {filteredTasks.filter(t => t.status === 'completed').map(task => (
              <TaskCard key={task.id} task={task} onEdit={openEditModal} onDelete={deleteTask} onToggle={toggleTaskStatus} onMove={updateTask} t={t} />
            ))}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="glass-card w-full max-w-lg overflow-hidden animate-zoom-in bg-[#161920]/95 border border-white/10">
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/3">
              <h3 className="font-bold text-white text-base">
                {editingTask ? t.edit : t.addTask}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
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

              {/* Grid 1 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">{t.category}</label>
                  <input
                    type="text"
                    maxLength={30}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">{t.priority}</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none"
                  >
                    <option value="low">{t.low}</option>
                    <option value="medium">{t.medium}</option>
                    <option value="high">{t.high}</option>
                  </select>
                </div>
              </div>

              {/* Grid 2 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">{t.status}</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none"
                  >
                    <option value="todo">{t.todo}</option>
                    <option value="in_progress">{t.inProgress}</option>
                    <option value="completed">{t.completed}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">{t.dueDate}</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none"
                  />
                </div>
              </div>

              {/* Grid 3 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">{t.time}</label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">{t.repeat}</label>
                  <select
                    value={repeat}
                    onChange={(e) => setRepeat(e.target.value as any)}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none"
                  >
                    <option value="none">{t.none}</option>
                    <option value="daily">{t.daily}</option>
                    <option value="weekly">{t.weekly}</option>
                    <option value="monthly">{t.monthly}</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">{t.notesLabel}</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none resize-none"
                />
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

/* Helper Component: TaskCard */
interface TaskCardProps {
  task: any;
  onEdit: (task: any) => void;
  onDelete: (id: string) => void;
  onToggle: (task: any) => void;
  onMove: (id: string, updates: any) => void;
  t: any;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onToggle, onMove, t }) => {
  return (
    <div className="bg-white/3 border border-white/5 p-4 rounded-2xl hover:bg-white/5 hover:border-white/10 transition-all duration-200 flex flex-col justify-between gap-3">
      <div>
        {/* Priority Indicator and Cat */}
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
            task.priority === 'high' 
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
              : task.priority === 'medium'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'bg-[#6366f1]/10 text-indigo-300 border border-[#6366f1]/20'
          }`}>
            {task.priority}
          </span>
          <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
            <Tag size={10} />
            {task.category}
          </span>
        </div>

        {/* Title */}
        <div className="flex items-start gap-2 mt-3">
          <button 
            onClick={() => onToggle(task)}
            className={`w-5 h-5 rounded-md border flex-shrink-0 flex items-center justify-center transition-colors duration-150 ${
              task.status === 'completed' 
                ? 'bg-emerald-500 border-emerald-500 text-white' 
                : 'border-white/10 hover:bg-white/5'
            }`}
          >
            {task.status === 'completed' && <Check size={12} />}
          </button>
          <h5 className={`text-xs font-bold text-slate-200 leading-tight ${
            task.status === 'completed' ? 'line-through text-slate-500' : ''
          }`}>
            {task.title}
          </h5>
        </div>

        {/* Notes */}
        {task.notes && (
          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed line-clamp-2">
            {task.notes}
          </p>
        )}
      </div>

      {/* Card Footer: Metadata and Actions */}
      <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-2.5 text-slate-400 font-semibold">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {task.dueDate}
          </span>
          {task.repeat !== 'none' && (
            <span className="flex items-center gap-1 text-[#6366f1]">
              <Repeat size={12} />
              {task.repeat}
            </span>
          )}
        </div>

        {/* Interactive Move / State triggers & CRUD buttons */}
        <div className="flex items-center gap-1.5">
          {/* Quick status cycle for Kanban feel */}
          {task.status !== 'todo' && (
            <button 
              onClick={() => onMove(task.id, { status: task.status === 'completed' ? 'in_progress' : 'todo' })}
              className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 font-bold"
              title="Move back"
            >
              &larr;
            </button>
          )}
          {task.status !== 'completed' && (
            <button 
              onClick={() => onMove(task.id, { status: task.status === 'todo' ? 'in_progress' : 'completed' })}
              className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 font-bold"
              title="Move forward"
            >
              &rarr;
            </button>
          )}

          <button 
            onClick={() => onEdit(task)}
            className="p-1 text-slate-400 hover:text-white"
          >
            <Edit2 size={12} />
          </button>
          <button 
            onClick={() => onDelete(task.id)}
            className="p-1 text-slate-400 hover:text-rose-400"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};
