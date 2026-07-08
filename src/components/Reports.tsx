import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { 
  FilePieChart, 
  Download, 
  Printer, 
  Calendar, 
  CheckSquare, 
  DollarSign, 
  FileSpreadsheet
} from 'lucide-react';

export const Reports: React.FC = () => {
  const { tasks, goals, expenses, settings } = useApp();
  const t = translations[settings.language];

  const [reportPeriod, setReportPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  // Filter lists based on time window
  const getPeriodDates = () => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const start = new Date(today);
    
    if (reportPeriod === 'daily') {
      // today only
    } else if (reportPeriod === 'weekly') {
      start.setDate(today.getDate() - 7);
    } else if (reportPeriod === 'monthly') {
      start.setDate(today.getDate() - 30);
    }
    return start;
  };

  const periodStart = getPeriodDates();
  const todayStr = new Date().toISOString().split('T')[0];

  const periodTasks = tasks.filter(x => {
    if (reportPeriod === 'daily') return x.dueDate === todayStr;
    const taskDate = new Date(x.dueDate);
    return taskDate >= periodStart;
  });

  const periodExpenses = expenses.filter(x => {
    if (reportPeriod === 'daily') return x.date === todayStr;
    const expDate = new Date(x.date);
    return expDate >= periodStart;
  });

  // Calculate metrics
  const completedTasksCount = periodTasks.filter(x => x.status === 'completed').length;
  const totalTasksCount = periodTasks.length;
  const completionRatio = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  const totalIncome = periodExpenses.filter(x => x.type === 'income').reduce((sum, x) => sum + x.amount, 0);
  const totalExpense = periodExpenses.filter(x => x.type === 'expense').reduce((sum, x) => sum + x.amount, 0);
  const netSavings = totalIncome - totalExpense;

  // EXPORT EXCEL (CSV Format)
  const exportToExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `Report Period,${reportPeriod.toUpperCase()}\n\n`;

    // Tasks Block
    csvContent += "TASKS SUMMARY\n";
    csvContent += "Task Title,Category,Priority,Status,Due Date\n";
    periodTasks.forEach(task => {
      csvContent += `"${task.title}","${task.category}","${task.priority}","${task.status}","${task.dueDate}"\n`;
    });

    csvContent += "\nFINANCIAL LEDGER\n";
    csvContent += "Description,Category,Type,Amount,Date\n";
    periodExpenses.forEach(exp => {
      csvContent += `"${exp.title}","${exp.category}","${exp.type}",LKR ${exp.amount},"${exp.date}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `LifeManager_Report_${reportPeriod}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // EXPORT PDF (Simulated beautiful printing window triggers)
  const exportToPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t.reports}</h2>
          <p className="text-xs text-slate-500">Aggregate metrics, track completion cycles, and compile reports</p>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={exportToExcel}
            className="flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 transition-all"
          >
            <FileSpreadsheet size={16} />
            <span>Excel (CSV)</span>
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10"
          >
            <Printer size={16} />
            <span>{t.exportPDF}</span>
          </button>
        </div>
      </div>

      {/* Period Selection */}
      <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl w-max">
        {(['daily', 'weekly', 'monthly'] as const).map(pOption => (
          <button
            key={pOption}
            onClick={() => setReportPeriod(pOption)}
            className={`px-5 py-2 rounded-lg text-xs font-bold capitalize transition-all duration-150 ${
              reportPeriod === pOption
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {pOption === 'daily' ? t.dailyReport : pOption === 'weekly' ? t.weeklyReport : t.monthlyReport}
          </button>
        ))}
      </div>

      {/* Grid: Overview Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Productivity Score */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <span className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-2xl">
              <CheckSquare size={20} />
            </span>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Productivity Ratio</h4>
          </div>
          <h3 className="text-3xl font-black text-emerald-500">{completionRatio}%</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            You completed <strong className="font-semibold text-slate-700 dark:text-slate-300">{completedTasksCount} out of {totalTasksCount}</strong> tasks assigned for this period.
          </p>
        </div>

        {/* Financial Expense overview */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <span className="p-2.5 bg-rose-500/10 text-rose-600 rounded-2xl">
              <DollarSign size={20} />
            </span>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Expenses Incurred</h4>
          </div>
          <h3 className="text-3xl font-black text-rose-500">LKR {totalExpense.toLocaleString()}</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Logged total outgoing costs of <strong className="font-semibold text-rose-600">LKR {totalExpense.toLocaleString()}</strong> in various categories.
          </p>
        </div>

        {/* Net Savings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <span className="p-2.5 bg-indigo-500/10 text-indigo-600 rounded-2xl">
              <FilePieChart size={20} />
            </span>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Net Period Savings</h4>
          </div>
          <h3 className={`text-3xl font-black ${netSavings >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-500'}`}>
            LKR {netSavings.toLocaleString()}
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Accumulated income of LKR {totalIncome.toLocaleString()} vs expenditures of LKR {totalExpense.toLocaleString()}.
          </p>
        </div>
      </div>

      {/* printable printable layout ledger */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xs space-y-4 print:border-none print:shadow-none">
        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm border-b pb-3">Period Ledger Details</h4>
        
        <div className="space-y-6">
          {/* Section 1: Tasks */}
          <div>
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Tasks Agenda</h5>
            {periodTasks.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No tasks logged during this timeframe.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                    <tr>
                      <th className="p-3">Title</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Priority</th>
                      <th className="p-3">Due Date</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {periodTasks.map(task => (
                      <tr key={task.id}>
                        <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{task.title}</td>
                        <td className="p-3 text-slate-500">{task.category}</td>
                        <td className="p-3 capitalize">{task.priority}</td>
                        <td className="p-3 text-slate-400">{task.dueDate}</td>
                        <td className="p-3 uppercase font-bold text-[9px]">{task.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 2: Finances */}
          <div>
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Finances ledger</h5>
            {periodExpenses.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No transactions recorded during this timeframe.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                    <tr>
                      <th className="p-3">Title</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {periodExpenses.map(exp => (
                      <tr key={exp.id}>
                        <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{exp.title}</td>
                        <td className="p-3 text-slate-500">{exp.category}</td>
                        <td className="p-3 capitalize">{exp.type}</td>
                        <td className="p-3 text-slate-400">{exp.date}</td>
                        <td className={`p-3 font-bold ${exp.type === 'income' ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-300'}`}>
                          LKR {exp.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
