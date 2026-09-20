import React from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Target,
  Sparkles,
  ArrowRight,
  Receipt,
  Plus,
  Clock,
} from 'lucide-react';
import { ActiveTab, Category, Transaction, User } from '../../types';
import { db } from '../../db/storage';
import {
  calculateMonthlySummary,
  formatCurrency,
  formatDate,
  generateCategoryBreakdown,
  generateSpendingInsights,
  getCurrencySymbol,
} from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { IncomeExpenseChart } from '../charts/IncomeExpenseChart';
import { CategoryDonutChart } from '../charts/CategoryDonutChart';

interface DashboardPageProps {
  currentUser: User;
  selectedMonth: string;
  transactions: Transaction[];
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenAddTransaction: () => void;
  onSelectEditTransaction: (tx: Transaction) => void;
  isDark?: boolean;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  currentUser,
  selectedMonth,
  transactions,
  onNavigateTab,
  onOpenAddTransaction,
  onSelectEditTransaction,
  isDark = false,
}) => {
  const categories = db.getCategories();
  const budgets = db.getBudgets(currentUser.id, selectedMonth);

  // Compute previous month
  const [year, month] = selectedMonth.split('-').map(Number);
  const prevDate = new Date(year, month - 2, 1);
  const prevYear = prevDate.getFullYear();
  const prevMonth = String(prevDate.getMonth() + 1).padStart(2, '0');
  const prevMonthStr = `${prevYear}-${prevMonth}`;

  const summary = calculateMonthlySummary(transactions, budgets, selectedMonth, prevMonthStr);
  const categoryData = generateCategoryBreakdown(transactions, categories, selectedMonth);
  const insights = generateSpendingInsights(
    transactions,
    categories,
    selectedMonth,
    prevMonthStr,
    currentUser.currency
  );

  // Filter recent transactions (up to 5 for current month, or all-time if current month is empty)
  const currentMonthTxs = transactions.filter((t) => t.date.startsWith(selectedMonth));
  const recentTransactions = (currentMonthTxs.length > 0 ? currentMonthTxs : transactions).slice(0, 5);

  // Generate multi-month series for the Income vs Expense chart (last 5 months up to selected)
  const multiMonthChartData = React.useMemo(() => {
    const dataPoints: { month: string; income: number; expenses: number; net: number }[] = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date(year, month - 1 - i, 1);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const mName = d.toLocaleDateString('en-US', { month: 'short' });

      const txs = transactions.filter((t) => t.date.startsWith(mStr));
      const inc = txs.filter((t) => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
      const exp = txs.filter((t) => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

      dataPoints.push({
        month: mName,
        income: inc,
        expenses: exp,
        net: inc - exp,
      });
    }
    return dataPoints;
  }, [transactions, year, month]);

  const currencySymbol = getCurrencySymbol(currentUser.currency);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Top Key Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Balance */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Balance
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {formatCurrency(summary.totalBalance, currentUser.currency)}
            </h3>
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              <span className="text-slate-500 dark:text-slate-400">Monthly Savings Rate:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {summary.savingsRate}%
              </span>
            </div>
          </div>
        </div>

        {/* Total Income */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Income
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
              {formatCurrency(summary.totalIncome, currentUser.currency)}
            </h3>
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              {summary.incomeChangePercent >= 0 ? (
                <>
                  <span className="flex items-center font-bold text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                    +{summary.incomeChangePercent}%
                  </span>
                  <span className="text-slate-400">vs last month</span>
                </>
              ) : (
                <>
                  <span className="flex items-center font-bold text-rose-500">
                    <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                    {summary.incomeChangePercent}%
                  </span>
                  <span className="text-slate-400">vs last month</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Expenses
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              {formatCurrency(summary.totalExpenses, currentUser.currency)}
            </h3>
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              {summary.expenseChangePercent > 0 ? (
                <>
                  <span className="flex items-center font-bold text-rose-500">
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                    +{summary.expenseChangePercent}%
                  </span>
                  <span className="text-slate-400">higher spend</span>
                </>
              ) : summary.expenseChangePercent < 0 ? (
                <>
                  <span className="flex items-center font-bold text-emerald-600 dark:text-emerald-400">
                    <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                    {summary.expenseChangePercent}%
                  </span>
                  <span className="text-slate-400">lower spend</span>
                </>
              ) : (
                <span className="text-slate-400">Same as last month</span>
              )}
            </div>
          </div>
        </div>

        {/* Monthly Budget Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Monthly Budget
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            {summary.monthlyBudgetTotal > 0 ? (
              <>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    {formatCurrency(summary.budgetSpent, currentUser.currency)}
                  </h3>
                  <span className="text-xs font-medium text-slate-400">
                    of {formatCurrency(summary.monthlyBudgetTotal, currentUser.currency)}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="mt-2.5">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        summary.budgetUsedPercent >= 100
                          ? 'bg-rose-500'
                          : summary.budgetUsedPercent >= 80
                          ? 'bg-amber-500'
                          : 'bg-indigo-600'
                      }`}
                      style={{ width: `${Math.min(100, summary.budgetUsedPercent)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-[11px] font-medium">
                    <span
                      className={
                        summary.budgetUsedPercent >= 100
                          ? 'text-rose-500 font-bold'
                          : summary.budgetUsedPercent >= 80
                          ? 'text-amber-500 font-bold'
                          : 'text-slate-500'
                      }
                    >
                      {summary.budgetUsedPercent}% used
                    </span>
                    <span className="text-slate-400">
                      {formatCurrency(summary.budgetRemaining, currentUser.currency)} left
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-1">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No budget configured
                </p>
                <button
                  type="button"
                  onClick={() => onNavigateTab('budgets')}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Create monthly budget <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Spending Insights Card Banner (Explicitly requested!) */}
      {insights.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-white dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Smart Spending Insights
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="bg-white dark:bg-slate-900/80 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {insight.title}
                    </span>
                    {insight.percentage !== undefined && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                          insight.type === 'positive' || insight.type === 'saving' || insight.type === 'decrease'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {insight.percentage}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    "{insight.message}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Charts Row: Monthly Spending (Income vs Expenses) & Spending by Category Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Spending Chart (Income vs Expenses) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Monthly Spending Trend
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Comparative analysis of income earned against expenses spent
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
            >
              Analytics <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <IncomeExpenseChart
            data={multiMonthChartData}
            currencyCode={currentUser.currency}
            isDark={isDark}
          />
        </div>

        {/* Spending by Category Donut Chart */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Spending by Category
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Food, Transport, Shopping, Bills, Entertainment, Health & Other
              </p>
            </div>
          </div>

          <CategoryDonutChart
            data={categoryData}
            currencyCode={currentUser.currency}
            isDark={isDark}
          />
        </div>
      </div>

      {/* 4. Recent Transactions Section */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Recent Transactions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Latest financial activity recorded on your account
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('transactions')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
          >
            View All ({transactions.length}) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentTransactions.map((tx) => {
              const cat = db.getCategoryById(tx.categoryId);
              return (
                <div
                  key={tx.id}
                  onClick={() => onSelectEditTransaction(tx)}
                  className="py-3 sm:py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                      style={{
                        backgroundColor: `${cat.color}15`,
                        color: cat.color,
                      }}
                    >
                      <CategoryIcon name={cat.icon} className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {tx.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                        <span className="font-medium text-slate-600 dark:text-slate-300">
                          {cat.name}
                        </span>
                        <span>•</span>
                        <span>{formatDate(tx.date)}</span>
                        <span>•</span>
                        <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded text-[10px]">
                          {tx.paymentMethod}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={`text-sm font-extrabold ${
                        tx.type === 'income'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}{' '}
                      {formatCurrency(tx.amount, currentUser.currency)}
                    </p>
                    <span
                      className={`text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded-sm ${
                        tx.type === 'income'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {tx.type}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <Receipt className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No transactions found
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Start tracking by adding your first income or expense transaction.
            </p>
            <button
              type="button"
              onClick={onOpenAddTransaction}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add First Transaction
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
