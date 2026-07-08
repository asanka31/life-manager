import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { 
  Plus, 
  Trash2, 
  ShoppingBag, 
  Check, 
  Square, 
  CheckSquare,
  ChevronUp,
  ChevronDown,
  Percent,
  TrendingDown
} from 'lucide-react';

export const ShoppingList: React.FC = () => {
  const { shopping, addShoppingItem, updateShoppingItem, deleteShoppingItem, settings } = useApp();
  const t = translations[settings.language];

  // Filters
  const [filterCategory, setFilterCategory] = useState('all');

  // Modal / Form States
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Groceries');
  const [quantity, setQuantity] = useState<number>(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await addShoppingItem({
      name,
      category,
      quantity: Number(quantity),
      purchased: false
    });

    setName('');
    setQuantity(1);
  };

  const togglePurchased = async (item: any) => {
    await updateShoppingItem(item.id, { purchased: !item.purchased });
  };

  const changeQuantity = async (item: any, delta: number) => {
    const nextVal = Math.max(1, item.quantity + delta);
    await updateShoppingItem(item.id, { quantity: nextVal });
  };

  const filteredShopping = shopping.filter(item => filterCategory === 'all' || item.category === filterCategory);

  // Calculations
  const uniqueCategories = ['all', ...Array.from(new Set(shopping.map(x => x.category)))];
  const totalCount = shopping.length;
  const purchasedCount = shopping.filter(x => x.purchased).length;
  const percentBought = totalCount > 0 ? Math.round((purchasedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t.shoppingList}</h2>
          <p className="text-xs text-slate-500">Plan inventories, grocery trips, and household shopping</p>
        </div>
      </div>

      {/* Grid structure: Add Item Card & Shopping Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Add Form & Stats */}
        <div className="space-y-6 lg:col-span-1">
          {/* Stats Circle */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xs">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-4">Cart Progression</h4>
            
            <div className="flex items-center gap-6">
              <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="26" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="6" fill="transparent" />
                  <circle cx="32" cy="32" r="26" className="stroke-indigo-600" strokeWidth="6" fill="transparent" 
                    strokeDasharray={163}
                    strokeDashoffset={163 - (163 * percentBought) / 100}
                  />
                </svg>
                <span className="absolute text-xs font-black text-slate-800 dark:text-slate-100">{percentBought}%</span>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold">{purchasedCount} of {totalCount} items bought</p>
                <p className="text-[11px] text-slate-400 mt-1">Cross off items to clean up your shopping trip lists.</p>
              </div>
            </div>
          </div>

          {/* Quick Add Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-xs">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-4">Quick Add Item</h4>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  placeholder="e.g. Fresh Apples"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">{t.category}</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none"
                  >
                    <option value="Groceries">Groceries</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Household">Household</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">{t.quantity}</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10"
              >
                {t.addShoppingItem}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: List Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xs lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Shopping Ledger</h4>

            {/* Category selection */}
            {uniqueCategories.length > 0 && (
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none"
              >
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
                ))}
              </select>
            )}
          </div>

          {/* List items mapping */}
          <div className="space-y-2.5 overflow-y-auto max-h-96 custom-scrollbar pr-1">
            {filteredShopping.length === 0 ? (
              <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center">
                <ShoppingBag size={36} className="text-slate-300 mb-2" />
                <p className="text-xs font-semibold">{t.noShopping}</p>
              </div>
            ) : (
              filteredShopping.map(item => (
                <div 
                  key={item.id} 
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                    item.purchased 
                      ? 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-100 dark:border-slate-800/40' 
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button 
                      onClick={() => togglePurchased(item)}
                      className={`w-5 h-5 rounded-md border flex-shrink-0 flex items-center justify-center transition-colors duration-150 ${
                        item.purchased 
                          ? 'bg-indigo-600 border-indigo-600 text-white' 
                          : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {item.purchased && <Check size={12} />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <h5 className={`text-xs font-bold text-slate-800 dark:text-slate-200 truncate ${
                        item.purchased ? 'line-through text-slate-400' : ''
                      }`}>
                        {item.name}
                      </h5>
                      <span className="text-[10px] uppercase font-bold text-indigo-400 mt-0.5 block">{item.category}</span>
                    </div>
                  </div>

                  {/* Quantity manager */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-slate-100 dark:bg-slate-950 rounded-lg px-2 py-1">
                      <button 
                        onClick={() => changeQuantity(item, -1)}
                        className="p-1 text-slate-500 hover:text-slate-800"
                        disabled={item.purchased}
                      >
                        <ChevronDown size={12} />
                      </button>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-1">{item.quantity}</span>
                      <button 
                        onClick={() => changeQuantity(item, 1)}
                        className="p-1 text-slate-500 hover:text-slate-800"
                        disabled={item.purchased}
                      >
                        <ChevronUp size={12} />
                      </button>
                    </div>

                    <button 
                      onClick={() => deleteShoppingItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
