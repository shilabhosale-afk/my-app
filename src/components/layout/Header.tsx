import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Plus,
  Wallet,
  Calendar,
} from 'lucide-react';
import { ActiveTab, User } from '../../types';
import { getCurrentMonthString } from '../../db/storage';
import { formatMonthName, getCurrencySymbol } from '../../utils/formatters';

interface HeaderProps {
  activeTab: ActiveTab;
  currentUser: User;
  selectedMonth: string;
  onChangeMonth: (month: string) => void;
  onOpenAddTransaction: () => void;
  onToggleTheme: () => void;
  isDark: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  currentUser,
  selectedMonth,
  onChangeMonth,
  onOpenAddTransaction,
  onToggleTheme,
  isDark,
}) => {
  const titles: Record<ActiveTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Financial Overview',
      subtitle: 'Monitor cashflow, category breakdown, and spending limits',
    },
    transactions: {
      title: 'Transactions',
      subtitle: 'Inspect, filter, edit, and export all recorded transactions',
    },
    budgets: {
      title: 'Monthly Budgets',
      subtitle: 'Set and track spending boundaries across categories',
    },
    analytics: {
      title: 'Analytics & Insights',
      subtitle: 'In-depth income vs expense trends and savings rates',
    },
    settings: {
      title: 'Settings & Preferences',
      subtitle: 'Manage profile, currency, dark mode, and data exports',
    },
  };

  const pageInfo = titles[activeTab];

  // Month navigation helpers
  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const date = new Date(y, m - 2, 1);
    const prevY = date.getFullYear();
    const prevM = String(date.getMonth() + 1).padStart(2, '0');
    onChangeMonth(`${prevY}-${prevM}`);
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const date = new Date(y, m, 1);
    const nextY = date.getFullYear();
    const nextM = String(date.getMonth() + 1).padStart(2, '0');
    onChangeMonth(`${nextY}-${nextM}`);
  };

  const handleResetToCurrentMonth = () => {
    onChangeMonth(getCurrentMonthString());
  };

  const isCurrentMonth = selectedMonth === getCurrentMonthString();
  const currencySymbol = getCurrencySymbol(currentUser.currency);

  return (
    <header
      id="finly-main-header"
      className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 transition-colors"
    >
      <div className="px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Mobile logo or Page Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Logo */}
            <div className="md:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-xs">
                <Wallet className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-slate-900 dark:text-white">Finly</span>
            </div>

            {/* Desktop page titles */}
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {pageInfo.title}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{pageInfo.subtitle}</p>
            </div>
          </div>

          {/* Quick controls on mobile */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onToggleTheme}
              className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Right: Month Selector & Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5">
          {/* Month Navigator (visible on tabs that depend on monthly stats) */}
          {activeTab !== 'settings' && (
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-xl p-1 border border-slate-200/80 dark:border-slate-700/60 shadow-2xs">
              <button
                type="button"
                onClick={handlePrevMonth}
                title="Previous Month"
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                aria-label="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="px-2.5 flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span>{formatMonthName(selectedMonth)}</span>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                title="Next Month"
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                aria-label="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {!isCurrentMonth && (
                <button
                  type="button"
                  onClick={handleResetToCurrentMonth}
                  className="ml-1 px-2 py-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors"
                >
                  Current
                </button>
              )}
            </div>
          )}

          {/* Currency Indicator */}
          <div
            title={`Active Currency: ${currentUser.currency}`}
            className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">{currencySymbol}</span>
            <span>{currentUser.currency}</span>
          </div>

          {/* Theme Toggle Button (Desktop) */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="hidden md:flex items-center justify-center p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/60 transition-colors cursor-pointer"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Quick Add Button in Header */}
          <button
            type="button"
            onClick={onOpenAddTransaction}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New</span>
          </button>
        </div>
      </div>
    </header>
  );
};
