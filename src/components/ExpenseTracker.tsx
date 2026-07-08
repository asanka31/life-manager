import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { 
  Plus, 
  Trash2, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle,
  Coins,
  Settings,
  DollarSign
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';

export const ExpenseTracker: React.FC = () => {
  const { expenses, addExpense, deleteExpense, settings } = useApp();
  const t = translations[settings.language];

  // Budget state (saved client-side or defaults to 50,000 LKR)
  const [budgetLimit, setBudgetLimit] = useState<number>(() => {
    const saved = localStorage.getItem('user_budget_limit');
    return saved ? Number(saved) : 50000;
  });
  const [editingBudget, setEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(budgetLimit);

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Modal / Form States
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const saveBudgetLimit = () => {
    setBudgetLimit(tempBudget);
    localStorage.setItem('user_budget_limit', String(tempBudget));
    setEditingBudget(false);
  };

  const handleOpenAdd = () => {
    setTitle('');
    setAmount(0);
    setType('expense');
    setCategory('Food');
    setDate(new Date().toISOString().split('T')[0]);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) return;

    await addExpense({
      title,
      amount: Number(amount),
      type,
      category,
      date
    });

    setModalOpen(false);
  };

  // Calculations
  const totalIncome = expenses.filter(x => x.type === 'income').reduce((sum, x) => sum + x.amount, 0);
  const totalExpense = expenses.filter(x => x.type === 'expense').reduce((sum, x) => sum + x.amount, 0);
  const balance = totalIncome - totalExpense;
  const budgetAlertTriggered = totalExpense > budgetLimit;

  const filteredExpenses = expenses.filter(x => {
    const matchesSearch = x.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          x.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || x.type === filterType;
    const matchesCat = filterCategory === 'all' || x.category === filterCategory;

    return matchesSearch && matchesType && matchesCat;
  });

  // Compile Category distribution for Recharts
  const categoriesList = ['Food', 'Utilities', 'Salary', 'Investment', 'Rent', 'Entertainment', 'Transportation', 'Health', 'Leisure', 'Shopping', 'Other'];
  const chartData = categoriesList.map(cat => {
    const catSum = expenses
      .filter(x => x.category === cat && x.type === 'expense')
      .reduce((sum, x) => sum + x.amount, 0);
    return { name: cat, amount: catSum };
  }).filter(item => item.amount > 0);

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t.expenseTracker}</h2>
          <p className="text-xs text-slate-500">Track and plan income, expenses, and monthly budget limits</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20"
        >
          <Plus size={16} />
          <span>{t.addExpense}</span>
        </button>
      </div>

      {/* Bento Grid: Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Income */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.income}</p>
            <h3 className="text-xl font-black text-emerald-500 mt-1">LKR {totalIncome.toLocaleString()}</h3>
          </div>
          <span className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl">
            <ArrowUpRight size={22} />
          </span>
        </div>

        {/* Total Expense */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.expense}</p>
            <h3 className="text-xl font-black text-rose-500 mt-1">LKR {totalExpense.toLocaleString()}</h3>
          </div>
          <span className="p-3 bg-rose-500/10 text-rose-600 rounded-2xl">
            <ArrowDownRight size={22} />
          </span>
        </div>

        {/* Total Balance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Remaining Balance</p>
            <h3 className={`text-xl font-black mt-1 ${balance >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-500'}`}>
              LKR {balance.toLocaleString()}
            </h3>
          </div>
          <span className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <Coins size={22} />
          </span>
        </div>

        {/* Custom Budget Limit Setting Widget */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl flex items-center justify-between shadow-xs relative overflow-hidden">
          {budgetAlertTriggered && (
            <div className="absolute top-0 inset-x-0 h-1 bg-rose-500" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.budget} Limit</p>
              <button onClick={() => setEditingBudget(!editingBudget)} className="text-slate-400 hover:text-indigo-500">
                <Settings size={12} />
              </button>
            </div>
            {editingBudget ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  value={tempBudget}
                  onChange={(e) => setTempBudget(Number(e.target.value))}
                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none"
                />
                <button onClick={saveBudgetLimit} className="text-xs text-indigo-600 font-bold">
                  Save
                </button>
              </div>
            ) : (
              <h3 className={`text-xl font-black mt-1 ${budgetAlertTriggered ? 'text-rose-500' : 'text-slate-800 dark:text-slate-100'}`}>
                LKR {budgetLimit.toLocaleString()}
              </h3>
            )}
          </div>
          <span className={`p-3 rounded-2xl ${budgetAlertTriggered ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
            <AlertTriangle size={22} />
          </span>
        </div>
      </div>

      {/* Budget Warning Alert */}
      {budgetAlertTriggered && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="text-rose-500 mt-0.5 flex-shrink-0" size={18} />
          <div>
            <h5 className="text-xs font-bold text-rose-600">Monthly Budget Threshold Exceeded!</h5>
            <p className="text-[11px] text-rose-500/90 leading-relaxed mt-0.5">
              Your overall monthly expenses (<strong className="font-bold">LKR {totalExpense.toLocaleString()}</strong>) are higher than your declared budget cap of <strong className="font-bold">LKR {budgetLimit.toLocaleString()}</strong>. Consider cutting back on non-essential categories.
            </p>
          </div>
        </div>
      )}

      {/* Grid: Charts & Search List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expenses distribution Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xs lg:col-span-1">
          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-4">Expense Distribution</h4>
          {chartData.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-slate-400 text-center text-xs">
              <Coins size={32} className="text-slate-300 mb-2" />
              <span>No expense data logged to build distribution map.</span>
            </div>
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 9 }} tickLine={false} />
                  <Tooltip formatter={(value) => [`LKR ${value}`, 'Amount']} />
                  <Bar dataKey="amount" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Ledger Table list */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xs lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Ledger Records</h4>
            
            {/* Search Input */}
            <div className="relative w-full sm:w-48">
              <Search className="absolute left-3 top-2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none"
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 text-xs">
            <button 
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterType === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-950 text-slate-500'
              }`}
            >
              All
            </button>
            <button 
              onClick={() => setFilterType('income')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterType === 'income' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 dark:bg-slate-950 text-slate-500'
              }`}
            >
              {t.income}
            </button>
            <button 
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterType === 'expense' ? 'bg-rose-500/10 text-rose-600' : 'bg-slate-100 dark:bg-slate-950 text-slate-500'
              }`}
            >
              {t.expense}
            </button>
          </div>

          {/* Records List Grid */}
          <div className="overflow-x-auto max-h-64 custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase tracking-wider text-[9px] font-bold">
                <tr>
                  <th className="p-3 rounded-l-xl">{t.title}</th>
                  <th className="p-3">{t.category}</th>
                  <th className="p-3">{t.date}</th>
                  <th className="p-3">{t.amount}</th>
                  <th className="p-3 rounded-r-xl w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400">
                      {t.noExpenses}
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map(record => (
                    <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                        {record.title}
                      </td>
                      <td className="p-3 text-slate-500 font-medium">
                        {record.category}
                      </td>
                      <td className="p-3 text-slate-400">
                        {record.date}
                      </td>
                      <td className={`p-3 font-bold ${record.type === 'income' ? 'text-emerald-500' : 'text-slate-800 dark:text-slate-100'}`}>
                        {record.type === 'income' ? '+' : '-'} LKR {record.amount.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <button 
                          onClick={() => deleteExpense(record.id)}
                          className="p-1 text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Ledger Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl shadow-xl overflow-hidden animate-zoom-in">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                Log Ledger Action
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Type toggle */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    type === 'expense' 
                      ? 'bg-white dark:bg-slate-900 text-rose-500 shadow-xs' 
                      : 'text-slate-500'
                  }`}
                >
                  {t.expense}
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    type === 'income' 
                      ? 'bg-white dark:bg-slate-900 text-emerald-500 shadow-xs' 
                      : 'text-slate-500'
                  }`}
                >
                  {t.income}
                </button>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">{t.title} *</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  placeholder="Record description"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">{t.amount} (LKR) *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">{t.category}</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none"
                >
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">{t.date}</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
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
