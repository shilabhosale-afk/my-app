import React, { useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  BarChart2,
  Calendar,
  Zap,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { db } from '../../db/storage';
import { Category, Transaction, User } from '../../types';
import {
  formatCurrency,
  formatMonthName,
  generateCategoryBreakdown,
  getCurrencySymbol,
} from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { IncomeExpenseChart } from '../charts/IncomeExpenseChart';
import { CategoryDonutChart } from '../charts/CategoryDonutChart';
import { SpendingTrendChart } from '../charts/SpendingTrendChart';

interface AnalyticsPageProps {
  currentUser: User;
  selectedMonth: string;
  transactions: Transaction[];
  isDark?: boolean;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  currentUser,
  selectedMonth,
  transactions,
  isDark = false,
}) => {
  const categories = db.getCategories();
  const [year, month] = selectedMonth.split('-').map(Number);

  // Previous month string
  const prevDate = new Date(year, month - 2, 1);
  const prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

  // Transactions for current & previous month
  const curTxs = useMemo(
    () => transactions.filter((t) => t.date.startsWith(selectedMonth)),
    [transactions, selectedMonth]
  );
  const prevTxs = useMemo(
    () => transactions.filter((t) => t.date.startsWith(prevMonthStr)),
    [transactions, prevMonthStr]
  );

  // Financial aggregates
  const curIncome = curTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const curExpenses = curTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const curNet = curIncome - curExpenses;

  const prevIncome = prevTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const prevExpenses = prevTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const prevNet = prevIncome - prevExpenses;

  const incomeChangePct =
    prevIncome > 0 ? Math.round(((curIncome - prevIncome) / prevIncome) * 100) : 0;
  const expenseChangePct =
    prevExpenses > 0 ? Math.round(((curExpenses - prevExpenses) / prevExpenses) * 100) : 0;
  const savingsChangeDiff = curNet - prevNet;

  const categoryBreakdown = useMemo(
    () => generateCategoryBreakdown(transactions, categories, selectedMonth),
    [transactions, categories, selectedMonth]
  );

  // Multi-month comparison (last 6 months)
  const sixMonthChartData = useMemo(() => {
    const list: { month: string; income: number; expenses: number; net: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(year, month - 1 - i, 1);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const mLabel = d.toLocaleDateString('en-US', { month: 'short' });

      const txs = transactions.filter((t) => t.date.startsWith(mStr));
      const inc = txs.filter((t) => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
      const exp = txs.filter((t) => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

      list.push({
        month: mLabel,
        income: inc,
        expenses: exp,
        net: inc - exp,
      });
    }
    return list;
  }, [transactions, year, month]);

  // Daily Spending Trend Data (cumulative and daily curve)
  const dailySpendingData = useMemo(() => {
    // Days in current month
    const daysInMonth = new Date(year, month, 0).getDate();
    const data: { day: string; date: string; amount: number; cumulative: number }[] = [];

    let cum = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = String(day).padStart(2, '0');
      const dateKey = `${selectedMonth}-${dayStr}`;

      const daySpend = curTxs
        .filter((t) => t.type === 'expense' && t.date === dateKey)
        .reduce((sum, t) => sum + t.amount, 0);

      cum += daySpend;
      data.push({
        day: `${day}`,
        date: `${day} ${new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'short' })}`,
        amount: daySpend,
        cumulative: cum,
      });
    }
    return data;
  }, [curTxs, selectedMonth, year, month]);

  // Financial Health Score (0 - 100)
  const healthScore = useMemo(() => {
    if (curIncome === 0 && curExpenses === 0) return 70;
    let score = 50;

    // Savings ratio component
    const savingsRatio = curIncome > 0 ? (curIncome - curExpenses) / curIncome : 0;
    if (savingsRatio >= 0.3) score += 30;
    else if (savingsRatio >= 0.15) score += 20;
    else if (savingsRatio > 0) score += 10;
    else score -= 15;

    // Expense trajectory component
    if (expenseChangePct < 0) score += 15;
    else if (expenseChangePct > 20) score -= 10;

    return Math.max(10, Math.min(98, score));
  }, [curIncome, curExpenses, expenseChangePct]);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Month-over-Month Comparison Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {/* Income Comparison */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Income vs Last Month
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {formatCurrency(curIncome, currentUser.currency)}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Last month: {formatCurrency(prevIncome, currentUser.currency)}
            </p>
            <div className="flex items-center gap-1.5 mt-2.5 text-xs font-bold">
              {incomeChangePct >= 0 ? (
                <span className="flex items-center text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" />+{incomeChangePct}% growth
                </span>
              ) : (
                <span className="flex items-center text-rose-500">
                  <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                  {incomeChangePct}% reduction
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Expense Comparison */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Expenses vs Last Month
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {formatCurrency(curExpenses, currentUser.currency)}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Last month: {formatCurrency(prevExpenses, currentUser.currency)}
            </p>
            <div className="flex items-center gap-1.5 mt-2.5 text-xs font-bold">
              {expenseChangePct > 0 ? (
                <span className="flex items-center text-rose-500">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" />+{expenseChangePct}% spending surge
                </span>
              ) : expenseChangePct < 0 ? (
                <span className="flex items-center text-emerald-600 dark:text-emerald-400">
                  <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                  {expenseChangePct}% expense cut
                </span>
              ) : (
                <span className="text-slate-400">No change</span>
              )}
            </div>
          </div>
        </div>

        {/* Net Savings & Health Score */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Financial Health Score
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {healthScore}
                <span className="text-xs font-semibold text-slate-400"> / 100</span>
              </h3>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                {healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : 'Needs Review'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Net Savings:{' '}
              <strong className={curNet >= 0 ? 'text-emerald-600' : 'text-rose-500'}>
                {formatCurrency(curNet, currentUser.currency, { sign: true })}
              </strong>
            </p>
          </div>
        </div>
      </div>

      {/* 2. Charts Row: 6-Month Income vs Expense & Spending Trends (Daily) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Income vs Expenses Multi-Month */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              6-Month Income vs Expenses
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Historical cashflow trajectory over the past six months
            </p>
          </div>
          <IncomeExpenseChart
            data={sixMonthChartData}
            currencyCode={currentUser.currency}
            isDark={isDark}
          />
        </div>

        {/* Daily Spending Trend (Cumulative) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Cumulative Spending Flow ({formatMonthName(selectedMonth)})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Daily cumulative spend velocity across day 1 to end of month
            </p>
          </div>
          <SpendingTrendChart
            data={dailySpendingData}
            currencyCode={currentUser.currency}
            isDark={isDark}
          />
        </div>
      </div>

      {/* 3. Category Distribution & Top Spending Ranking Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Donut */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Category Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Relative expense allocation for {formatMonthName(selectedMonth)}
            </p>
          </div>
          <CategoryDonutChart
            data={categoryBreakdown}
            currencyCode={currentUser.currency}
            isDark={isDark}
          />
        </div>

        {/* Top Spending Categories Detailed Table */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Top Spending Categories
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Highest expense volume categories ranked with transaction counts
              </p>
            </div>

            {categoryBreakdown.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-center">Entries</th>
                      <th className="py-2.5 px-3 text-right">Avg / Tx</th>
                      <th className="py-2.5 px-3 text-right">Total Amount</th>
                      <th className="py-2.5 px-3 text-right">Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {categoryBreakdown.map((cat, idx) => {
                      const avg = cat.count > 0 ? Math.round(cat.amount / cat.count) : 0;
                      return (
                        <tr
                          key={cat.id}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-400 text-[11px] w-4">
                                #{idx + 1}
                              </span>
                              <div
                                className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                                style={{
                                  backgroundColor: `${cat.color}20`,
                                  color: cat.color,
                                }}
                              >
                                <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-semibold text-slate-900 dark:text-slate-100">
                                {cat.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center text-slate-500">
                            {cat.count}
                          </td>
                          <td className="py-3 px-3 text-right font-medium text-slate-600 dark:text-slate-400">
                            {formatCurrency(avg, currentUser.currency)}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                            {formatCurrency(cat.amount, currentUser.currency)}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className="font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px]">
                              {cat.percentage}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-8 text-center">
                No expense categories recorded for this month.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
