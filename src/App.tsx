import React, { useState, useEffect, useCallback } from 'react';
import { db, getCurrentMonthString, initializeDatabase, subscribeStorage } from './db/storage';
import { ActiveTab, Transaction, User } from './types';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { DashboardPage } from './components/pages/DashboardPage';
import { TransactionsPage } from './components/pages/TransactionsPage';
import { BudgetsPage } from './components/pages/BudgetsPage';
import { AnalyticsPage } from './components/pages/AnalyticsPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { AuthPage } from './components/auth/AuthPage';
import { TransactionModal } from './components/transactions/TransactionModal';
import { ToastProvider, useToast } from './components/common/ToastContext';

function FinlyApp() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthString());
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('finly_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Apply dark mode class to root document element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      try {
        localStorage.setItem('finly_theme', 'dark');
      } catch {}
    } else {
      document.documentElement.classList.remove('dark');
      try {
        localStorage.setItem('finly_theme', 'light');
      } catch {}
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  // Initialize Database on mount
  useEffect(() => {
    const { currentUser: user } = initializeDatabase();
    if (user) {
      setCurrentUser(user);
      if (user.darkMode !== undefined) {
        setIsDark(user.darkMode);
      }
    }
  }, []);

  // Reload data whenever storage changes (pub-sub)
  const [dataVersion, setDataVersion] = useState<number>(0);
  useEffect(() => {
    const unsubscribe = subscribeStorage(() => {
      setDataVersion((v) => v + 1);
      const user = db.getCurrentUser();
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  // Load user transactions
  const userTransactions = currentUser ? db.getTransactions(currentUser.id) : [];
  const userBudgets = currentUser ? db.getBudgets(currentUser.id, selectedMonth) : [];

  const handleOpenAddTransaction = useCallback(() => {
    setEditingTransaction(null);
    setIsAddModalOpen(true);
  }, []);

  const handleSelectEditTransaction = useCallback((tx: Transaction) => {
    setEditingTransaction(tx);
    setIsAddModalOpen(true);
  }, []);

  const handleDeleteTransaction = useCallback(
    (id: string) => {
      if (currentUser) {
        db.deleteTransaction(id, currentUser.id);
      }
    },
    [currentUser]
  );

  const handleLogout = useCallback(() => {
    db.logout();
    setCurrentUser(null);
    setActiveTab('dashboard');
  }, []);

  // If user is not authenticated, show professional Auth Screen
  if (!currentUser) {
    return <AuthPage onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Desktop Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAddTransaction={handleOpenAddTransaction}
        onLogout={handleLogout}
        transactionCount={userTransactions.length}
        budgetCount={userBudgets.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          currentUser={currentUser}
          selectedMonth={selectedMonth}
          onChangeMonth={setSelectedMonth}
          onOpenAddTransaction={handleOpenAddTransaction}
          onToggleTheme={toggleTheme}
          isDark={isDark}
        />

        {/* View Router */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-6 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardPage
              currentUser={currentUser}
              selectedMonth={selectedMonth}
              transactions={userTransactions}
              onNavigateTab={setActiveTab}
              onOpenAddTransaction={handleOpenAddTransaction}
              onSelectEditTransaction={handleSelectEditTransaction}
              isDark={isDark}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsPage
              currentUser={currentUser}
              transactions={userTransactions}
              onOpenAddTransaction={handleOpenAddTransaction}
              onEditTransaction={handleSelectEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {activeTab === 'budgets' && (
            <BudgetsPage
              currentUser={currentUser}
              selectedMonth={selectedMonth}
              transactions={userTransactions}
              onOpenAddTransaction={handleOpenAddTransaction}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsPage
              currentUser={currentUser}
              selectedMonth={selectedMonth}
              transactions={userTransactions}
              isDark={isDark}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              currentUser={currentUser}
              onUserUpdated={(u) => setCurrentUser(u)}
              onLogout={handleLogout}
              onToggleTheme={toggleTheme}
              isDark={isDark}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddTransaction={handleOpenAddTransaction}
      />

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isAddModalOpen}
        currentUser={currentUser}
        initialData={editingTransaction}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <FinlyApp />
    </ToastProvider>
  );
}
