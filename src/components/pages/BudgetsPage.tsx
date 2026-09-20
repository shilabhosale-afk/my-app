import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Target,
  Sparkles,
  PieChart,
} from 'lucide-react';
import { db } from '../../db/storage';
import { Budget, Category, Transaction, User } from '../../types';
import { formatCurrency, formatMonthName } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { ConfirmModal } from '../common/ConfirmModal';
import { BudgetModal } from '../budgets/BudgetModal';
import { useToast } from '../common/ToastContext';

interface BudgetsPageProps {
  currentUser: User;
  selectedMonth: string;
  transactions: Transaction[];
  onOpenAddTransaction: () => void;
}

export const BudgetsPage: React.FC<BudgetsPageProps> = ({
  currentUser,
  selectedMonth,
  transactions,
  onOpenAddTransaction,
}) => {
  const toast = useToast();
  const categories = db.getCategories().filter((c) => c.type === 'expense');
  const budgets = db.getBudgets(currentUser.id, selectedMonth);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null);

  // Filter current month transactions
  const curMonthExpenses = transactions.filter(
    (t) => t.type === 'expense' && t.date.startsWith(selectedMonth)
  );

  // Map expenses by category for current month
  const categorySpentMap = new Map<string, number>();
  curMonthExpenses.forEach((t) => {
    const prev = categorySpentMap.get(t.categoryId) || 0;
    categorySpentMap.set(t.categoryId, prev + t.amount);
  });

  // Calculate overall budget summary
  const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
  const budgetedCatIds = new Set(budgets.map((b) => b.categoryId));
  const totalSpentInBudgets = curMonthExpenses
    .filter((t) => budgetedCatIds.has(t.categoryId))
    .reduce((sum, t) => sum + t.amount, 0);
  const totalRemaining = Math.max(0, totalBudgeted - totalSpentInBudgets);
  const overallUsedPct = totalBudgeted > 0 ? Math.round((totalSpentInBudgets / totalBudgeted) * 100) : 0;

  // Unbudgeted categories that had spending
  const unbudgetedWithSpending = categories.filter((cat) => {
    return !budgetedCatIds.has(cat.id) && (categorySpentMap.get(cat.id) || 0) > 0;
  });

  const handleEdit = (b: Budget) => {
    setEditingBudget(b);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  // Quick auto-populate default budget set
  const handleAutoPopulateDefaults = () => {
    const defaults = [
      { catName: 'Food', amount: 5000 },
      { catName: 'Transport', amount: 3000 },
      { catName: 'Shopping', amount: 4000 },
      { catName: 'Bills', amount: 4000 },
      { catName: 'Entertainment', amount: 2500 },
      { catName: 'Health', amount: 2500 },
    ];

    defaults.forEach(({ catName, amount }) => {
      const cat = categories.find((c) => c.name.toLowerCase() === catName.toLowerCase());
      if (cat) {
        db.saveBudget({
          userId: currentUser.id,
          categoryId: cat.id,
          amount,
          month: selectedMonth,
        });
      }
    });

    toast.success(`Generated smart recommended budget categories for ${formatMonthName(selectedMonth)}`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Overview & Progress Card */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Target className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Budget Summary for {formatMonthName(selectedMonth)}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Active spending limits across {budgets.length} configured expense categories
            </p>
          </div>

          <div className="flex items-center gap-2">
            {budgets.length === 0 && (
              <button
                type="button"
                onClick={handleAutoPopulateDefaults}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 rounded-xl transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-generate Budgets</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleCreate}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Budget</span>
            </button>
          </div>
        </div>

        {totalBudgeted > 0 ? (
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Total Budgeted
              </p>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
                {formatCurrency(totalBudgeted, currentUser.currency)}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Total Spent
              </p>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
                {formatCurrency(totalSpentInBudgets, currentUser.currency)}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Remaining Pool
              </p>
              <p
                className={`text-2xl font-black mt-1 ${
                  totalRemaining > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                }`}
              >
                {formatCurrency(totalRemaining, currentUser.currency)}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-500">Utilization</span>
                <span
                  className={
                    overallUsedPct >= 100
                      ? 'text-rose-500'
                      : overallUsedPct >= 75
                      ? 'text-amber-500'
                      : 'text-indigo-600 dark:text-indigo-400'
                  }
                >
                  {overallUsedPct}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    overallUsedPct >= 100
                      ? 'bg-rose-500'
                      : overallUsedPct >= 75
                      ? 'bg-amber-500'
                      : 'bg-indigo-600'
                  }`}
                  style={{ width: `${Math.min(100, overallUsedPct)}%` }}
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* 2. Category Budgets Grid */}
      {budgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((b) => {
            const cat = db.getCategoryById(b.categoryId);
            const spent = categorySpentMap.get(b.categoryId) || 0;
            const remaining = b.amount - spent;
            const pct = Math.round((spent / b.amount) * 100);

            // Three explicit visual states requested: Normal (<75%), Near limit (75-99%), Over budget (>=100%)
            let state: 'normal' | 'near-limit' | 'over-budget' = 'normal';
            if (pct >= 100) {
              state = 'over-budget';
            } else if (pct >= 75) {
              state = 'near-limit';
            }

            return (
              <div
                key={b.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all duration-200 shadow-xs flex flex-col justify-between ${
                  state === 'over-budget'
                    ? 'border-rose-300 dark:border-rose-900/60 ring-1 ring-rose-500/20'
                    : state === 'near-limit'
                    ? 'border-amber-300 dark:border-amber-900/60 ring-1 ring-amber-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Category Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${cat.color}18`,
                          color: cat.color,
                        }}
                      >
                        <CategoryIcon name={cat.icon} className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                          {cat.name}
                        </h3>
                        <p className="text-xs text-slate-400">
                          Limit: {formatCurrency(b.amount, currentUser.currency)}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {state === 'over-budget' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                          <AlertCircle className="w-3 h-3" />
                          Over Budget
                        </span>
                      )}
                      {state === 'near-limit' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                          <AlertTriangle className="w-3 h-3" />
                          Near Limit
                        </span>
                      )}
                      {state === 'normal' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          On Track
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Financial Metrics */}
                  <div className="grid grid-cols-2 gap-2 mt-5 py-3 px-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Spent
                      </span>
                      <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                        {formatCurrency(spent, currentUser.currency)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {remaining >= 0 ? 'Remaining' : 'Exceeded by'}
                      </span>
                      <p
                        className={`text-sm font-extrabold ${
                          remaining >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {formatCurrency(Math.abs(remaining), currentUser.currency)}
                      </p>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-500">{pct}% consumed</span>
                      <span className="text-slate-400">
                        {pct > 100 ? `+${pct - 100}% over` : `${100 - pct}% remaining`}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          state === 'over-budget'
                            ? 'bg-rose-500'
                            : state === 'near-limit'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => handleEdit(b)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors text-xs font-medium flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingBudget(b)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors text-xs font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-4">
            <PieChart className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            No budgets for {formatMonthName(selectedMonth)}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Setting category budgets helps you curb overspending and track your remaining allowances in real-time.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleAutoPopulateDefaults}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-xl transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Auto-generate Smart Defaults
            </button>
            <button
              type="button"
              onClick={handleCreate}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Create Custom Budget
            </button>
          </div>
        </div>
      )}

      {/* 3. Spending in Unbudgeted Categories Reminder */}
      {unbudgetedWithSpending.length > 0 && (
        <div className="bg-slate-50/80 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Unbudgeted spending detected:
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                You incurred expenses in categories without active limits.
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {unbudgetedWithSpending.map((cat) => {
              const spent = categorySpentMap.get(cat.id) || 0;
              return (
                <div
                  key={cat.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <CategoryIcon name={cat.icon} className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">{cat.name}:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(spent, currentUser.currency)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBudget(null);
                      setIsModalOpen(true);
                    }}
                    className="ml-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    + Add Limit
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Budget Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        currentUser={currentUser}
        selectedMonth={selectedMonth}
        initialData={editingBudget}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
        }}
        onSaved={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
        }}
      />

      {/* Delete Budget Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingBudget)}
        title="Delete Budget"
        message={
          deletingBudget
            ? `Are you sure you want to remove the ${
                db.getCategoryById(deletingBudget.categoryId).name
              } budget for ${formatMonthName(selectedMonth)}?`
            : ''
        }
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={() => {
          if (deletingBudget) {
            db.deleteBudget(deletingBudget.id, currentUser.id);
            toast.success('Budget removed');
            setDeletingBudget(null);
          }
        }}
        onCancel={() => setDeletingBudget(null)}
      />
    </div>
  );
};
