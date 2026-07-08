import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { 
  Sun, 
  CloudRain, 
  Cloud, 
  Clock, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  Plus, 
  Zap, 
  HeartHandshake,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';

interface DashboardProps {
  setCurrentTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setCurrentTab }) => {
  const { profile, tasks, goals, expenses, birthdays, settings } = useApp();
  const t = translations[settings.language];

  // Live Clock & Date State
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Weather Widget State
  const [selectedCity, setSelectedCity] = useState<'Colombo' | 'Kandy' | 'Galle' | 'New York'>('Colombo');
  const [weather, setWeather] = useState({ temp: 31, cond: 'Sunny', humidity: 72 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update simulated weather when city changes
  useEffect(() => {
    const weatherData = {
      Colombo: { temp: 31, cond: 'Sunny', humidity: 72 },
      Kandy: { temp: 26, cond: 'Cloudy', humidity: 80 },
      Galle: { temp: 29, cond: 'Rainy', humidity: 88 },
      'New York': { temp: 22, cond: 'Cloudy', humidity: 55 }
    };
    setWeather(weatherData[selectedCity]);
  }, [selectedCity]);

  // Compute stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(x => x.status === 'completed').length;
  const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Next upcoming tasks
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(x => x.dueDate === todayStr);
  const upcomingTasks = tasks.filter(x => x.dueDate > todayStr).slice(0, 3);

  // Financial summary
  const totalIncome = expenses.filter(x => x.type === 'income').reduce((sum, x) => sum + x.amount, 0);
  const totalExpense = expenses.filter(x => x.type === 'expense').reduce((sum, x) => sum + x.amount, 0);
  const balance = totalIncome - totalExpense;

  // Generate simple week expenses for Recharts
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const expenseChartData = daysOfWeek.map((day, idx) => {
    // Mock-simulate some spread based on actual data
    const dayExpense = expenses
      .filter(x => {
        const d = new Date(x.date);
        return d.getDay() === idx && x.type === 'expense';
      })
      .reduce((sum, x) => sum + x.amount, 0);
    return { name: day, amount: dayExpense };
  });

  // Calendar setup: Custom beautiful light grid calendar
  const [calendarDate, setCalendarDate] = useState(new Date());
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalMonthDays = new Date(year, month + 1, 0).getDate();
  const calendarDays = Array.from({ length: totalMonthDays }, (_, i) => i + 1);

  const prevMonthDays = Array.from({ length: firstDayIndex }, (_, i) => i);

  const isToday = (day: number) => {
    const d = new Date();
    return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
  };

  const hasTasksOnDay = (day: number) => {
    const formattedDay = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.some(x => x.dueDate === formattedDay);
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    setCalendarDate(new Date(year, month + (direction === 'next' ? 1 : -1), 1));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-white/5">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white tracking-tight">{t.welcome}, {profile?.name || 'User'}!</h1>
          <p className="text-sm text-slate-400">
            Good day. You have <span className="text-[#6366f1] font-semibold">{todayTasks.length} tasks</span> for today.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <div className="text-left">
            <div className="text-2xl font-mono font-semibold text-white leading-none">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-[#6366f1] font-bold mt-1">
              {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
          <div className="p-3 glass-card flex items-center space-x-3 text-xs">
            <div className="text-lg">
              {weather.cond === 'Sunny' ? '☀️' : weather.cond === 'Cloudy' ? '☁️' : '🌧️'}
            </div>
            <div>
              <div className="font-bold text-white">{weather.temp}°C</div>
              <div className="text-[10px] text-slate-400 font-medium">{weather.cond}, {selectedCity}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Bento Grid Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Weather Widget */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-[#6366f1]/10 text-[#6366f1] rounded-2xl">
                <Sun size={20} />
              </span>
              <div>
                <h4 className="text-sm font-bold text-slate-200">{t.weatherWidget}</h4>
                <p className="text-xs text-slate-500">{selectedCity}</p>
              </div>
            </div>
            
            {/* City Selector */}
            <select 
              value={selectedCity} 
              onChange={(e) => setSelectedCity(e.target.value as any)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-white/10 bg-[#161920] text-slate-300 outline-none"
            >
              <option value="Colombo">Colombo</option>
              <option value="Kandy">Kandy</option>
              <option value="Galle">Galle</option>
              <option value="New York">New York</option>
            </select>
          </div>

          <div className="flex items-center justify-between my-4">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white">{weather.temp}</span>
              <span className="text-xl text-slate-400 font-semibold">°C</span>
            </div>
            <div className="flex flex-col items-end">
              {weather.cond === 'Sunny' && <Sun className="text-amber-500" size={36} />}
              {weather.cond === 'Cloudy' && <Cloud className="text-slate-400" size={36} />}
              {weather.cond === 'Rainy' && <CloudRain className="text-blue-500" size={36} />}
              <span className="text-xs font-semibold text-slate-400 mt-1">{weather.cond}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex justify-between text-xs text-slate-500">
            <span>Humidity: <strong className="text-slate-300">{weather.humidity}%</strong></span>
            <span>Wind: <strong className="text-slate-300">12 km/h</strong></span>
          </div>
        </div>

        {/* Productivity Score */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl">
                <Zap size={20} />
              </span>
              <div>
                <h4 className="text-sm font-bold text-slate-200">{t.productivityScore}</h4>
                <p className="text-xs text-slate-500">Based on task completion</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-white/5 text-slate-400 rounded-lg">
              {completedTasks}/{totalTasks} Tasks
            </span>
          </div>

          <div className="flex items-center gap-6 my-4">
            <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
              {/* Outer circular background */}
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="32" className="stroke-white/5" strokeWidth="8" fill="transparent" />
                <circle cx="40" cy="40" r="32" className="stroke-emerald-500" strokeWidth="8" fill="transparent" 
                  strokeDasharray={200}
                  strokeDashoffset={200 - (200 * productivityScore) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-base font-bold text-white">{productivityScore}%</span>
            </div>
            <div>
              <h5 className="text-sm font-bold text-slate-300">
                {productivityScore > 80 ? 'Excellent Day!' : productivityScore > 50 ? 'Steady Progress' : 'Keep Pushing!'}
              </h5>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {t.productivityTip}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 text-xs text-slate-500 flex items-center gap-1.5">
            <TrendingUp size={14} className="text-emerald-500" />
            <span>Progressing 12% faster than yesterday</span>
          </div>
        </div>

        {/* Expense Quick Balance */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-[#6366f1]/10 text-[#6366f1] rounded-2xl">
                <DollarSign size={20} />
              </span>
              <div>
                <h4 className="text-sm font-bold text-slate-200">{t.budget}</h4>
                <p className="text-xs text-slate-500">Current Balance</p>
              </div>
            </div>
            <button 
              onClick={() => setCurrentTab('expenses')}
              className="text-[10px] font-bold text-[#6366f1] uppercase tracking-wider hover:underline"
            >
              View ledger
            </button>
          </div>

          <div className="my-4">
            <h3 className={`text-3xl font-black ${balance >= 0 ? 'text-white' : 'text-rose-500'}`}>
              LKR {balance.toLocaleString()}
            </h3>
            <div className="flex justify-between items-center gap-2 mt-2">
              <span className="text-xs text-slate-500 truncate">Inc: <strong className="text-emerald-400">LKR {totalIncome.toLocaleString()}</strong></span>
              <span className="text-xs text-slate-500 truncate">Exp: <strong className="text-rose-400">LKR {totalExpense.toLocaleString()}</strong></span>
            </div>
          </div>

          {/* Simple Area Mini-Chart */}
          <div className="h-12 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={expenseChartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-[10px] p-1.5 rounded text-white border border-white/10 shadow-lg">
                        LKR {payload[0].value}
                      </div>
                    );
                  }
                  return null;
                }} />
                <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid Row 2: Today Tasks & Beautiful Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Agenda list */}
        <div className="glass-card p-6 lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <h4 className="font-bold text-slate-200 text-base">{t.todayTasks}</h4>
              <span className="text-xs font-semibold px-2.5 py-0.5 bg-[#6366f1]/20 text-[#6366f1] rounded-full">
                {todayTasks.length} {t.all}
              </span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-72">
              {todayTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                  <CheckCircle2 size={32} className="text-slate-600 mb-2" />
                  <p className="text-xs font-medium">{t.noTasks}</p>
                </div>
              ) : (
                todayTasks.map(task => (
                  <div 
                    key={task.id} 
                    className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3"
                  >
                    <div className={`w-1.5 h-10 rounded-full ${
                      task.priority === 'high' ? 'bg-rose-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-[#6366f1]'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-slate-200 truncate">{task.title}</h5>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] px-1.5 py-0.5 bg-white/5 text-slate-400 rounded-md font-semibold uppercase">
                          {task.category}
                        </span>
                        {task.reminderTime && (
                          <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                            <Clock size={10} />
                            {task.reminderTime}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button 
            onClick={() => setCurrentTab('tasks')}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-[#6366f1] hover:bg-[#6366f1]/90 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#6366f1]/10"
          >
            <Plus size={16} />
            <span>{t.addTask}</span>
          </button>
        </div>

        {/* Customizable Month Calendar */}
        <div className="glass-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
            <h4 className="font-bold text-slate-200 text-base">{t.calendar}</h4>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => changeMonth('prev')}
                className="p-1 rounded-lg hover:bg-white/5 text-slate-400"
              >
                &larr;
              </button>
              <span className="text-xs font-bold text-slate-200">
                {monthNames[month]} {year}
              </span>
              <button 
                onClick={() => changeMonth('next')}
                className="p-1 rounded-lg hover:bg-white/5 text-slate-400"
              >
                &rarr;
              </button>
            </div>
          </div>

          {/* Weekday labels */}
          <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {prevMonthDays.map((_, i) => (
              <div key={`prev-${i}`} className="h-10 text-slate-800 flex items-center justify-center text-xs pointer-events-none" />
            ))}
            {calendarDays.map((day) => {
              const currentDayToday = isToday(day);
              const dayTasksExist = hasTasksOnDay(day);
              return (
                <div 
                  key={`day-${day}`}
                  className={`h-10 rounded-xl relative flex flex-col items-center justify-center text-xs font-semibold cursor-pointer transition-all duration-150 ${
                    currentDayToday 
                      ? 'bg-[#6366f1] text-white shadow-lg shadow-[#6366f1]/20' 
                      : 'hover:bg-white/5 text-slate-300'
                  }`}
                  onClick={() => {
                    setCurrentTab('tasks');
                  }}
                >
                  <span>{day}</span>
                  {dayTasksExist && (
                    <span className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full ${
                      currentDayToday ? 'bg-white' : 'bg-[#6366f1]'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="glass-card p-6">
        <h4 className="font-bold text-slate-200 text-base mb-4">{t.quickActions}</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { id: 'tasks', label: t.addTask },
            { id: 'goals', label: t.addGoal },
            { id: 'expenses', label: t.addExpense },
            { id: 'notes', label: t.addNote },
            { id: 'medicines', label: t.addMedicine },
            { id: 'shopping', label: t.addShoppingItem }
          ].map(act => (
            <button
              key={act.id}
              onClick={() => setCurrentTab(act.id)}
              className="flex flex-col items-center justify-center p-4 glass-card text-slate-300 rounded-2xl text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/5 border border-white/5 hover:border-white/10"
            >
              <Plus size={18} className="mb-2 text-[#6366f1]" />
              <span className="text-center">{act.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
