import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../../db/storage';
import { Budget, Category, User } from '../../types';
import { getCurrencySymbol } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { useToast } from '../common/ToastContext';

interface BudgetModalProps {
  isOpen: boolean;
  currentUser: User;
  selectedMonth: string;
  initialData?: Budget | null;
  onClose: () => void;
  onSaved?: (budget: Budget) => void;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  currentUser,
  selectedMonth,
  initialData,
  onClose,
  onSaved,
}) => {
  const toast = useToast();
  const categories = db.getCategories().filter((c) => c.type === 'expense');
  const currencySymbol = getCurrencySymbol(currentUser.currency);

  const [categoryId, setCategoryId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      if (initialData) {
        setCategoryId(initialData.categoryId);
        setAmount(String(initialData.amount));
      } else {
        setCategoryId(categories[0]?.id || 'cat-food');
        setAmount('5000');
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num <= 0) {
      setError('Please provide a valid positive budget amount');
      return;
    }

    try {
      const saved = db.saveBudget({
        id: initialData?.id,
        userId: currentUser.id,
        categoryId,
        amount: Math.round(num),
        month: selectedMonth,
      });

      const cat = db.getCategoryById(categoryId);
      toast.success(`Budget for ${cat.name} set to ${currencySymbol}${Math.round(num).toLocaleString()}`);
      onSaved?.(saved);
      onClose();
    } catch (err) {
      toast.error('Failed to set budget. Please try again.');
      console.error(err);
    }
  };

  const quickBudgets = [2000, 3000, 5000, 10000, 15000];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10"
            role="dialog"
            aria-modal="true"
            aria-labelledby="budget-modal-title"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3
                  id="budget-modal-title"
                  className="text-lg font-bold text-slate-900 dark:text-slate-100"
                >
                  {initialData ? 'Edit Budget' : 'Set Category Budget'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Plan monthly expense boundaries to protect your savings
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={Boolean(initialData)}
                  className="block w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="budget-amount"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
                >
                  Monthly Budget Limit
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 font-bold text-lg">
                    {currencySymbol}
                  </div>
                  <input
                    id="budget-amount"
                    type="number"
                    min="1"
                    step="100"
                    placeholder="5000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="block w-full pl-9 pr-4 py-3 text-lg font-bold rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                {error && <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>}

                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-xs text-slate-400 mr-1">Presets:</span>
                  {quickBudgets.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setAmount(String(b))}
                      className="px-2 py-0.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md transition-colors"
                    >
                      {currencySymbol}{b.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Save Budget
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
