import React, { useState } from 'react';
import {
  User as UserIcon,
  Coins,
  Sun,
  Moon,
  Bell,
  Download,
  Trash2,
  RefreshCw,
  Upload,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { CURRENCIES } from '../../constants';
import { db } from '../../db/storage';
import { User } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';
import { useToast } from '../common/ToastContext';

interface SettingsPageProps {
  currentUser: User;
  onUserUpdated: (user: User) => void;
  onLogout: () => void;
  onToggleTheme: () => void;
  isDark: boolean;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  currentUser,
  onUserUpdated,
  onLogout,
  onToggleTheme,
  isDark,
}) => {
  const toast = useToast();

  // Profile form state
  const [name, setName] = useState<string>(currentUser.name);
  const [email, setEmail] = useState<string>(currentUser.email);
  const [currency, setCurrency] = useState<string>(currentUser.currency);

  // Notification toggles
  const [budgetAlerts, setBudgetAlerts] = useState<boolean>(currentUser.notifications.budgetAlerts);
  const [weeklySummary, setWeeklySummary] = useState<boolean>(currentUser.notifications.weeklySummary);
  const [unusualSpending, setUnusualSpending] = useState<boolean>(currentUser.notifications.unusualSpending);

  // Modals state
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState<boolean>(false);
  const [showResetDataModal, setShowResetDataModal] = useState<boolean>(false);

  // Save profile changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    const updated = db.updateUser({
      name: name.trim(),
      currency,
      notifications: {
        budgetAlerts,
        weeklySummary,
        unusualSpending,
      },
    });

    if (updated) {
      onUserUpdated(updated);
      toast.success('Profile settings updated successfully');
    }
  };

  // Export all user data as JSON
  const handleExportData = () => {
    try {
      const data = db.exportAllData(currentUser.id);
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Finly_Backup_${currentUser.email}_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('All transactions, budgets, and profile data exported');
    } catch (e) {
      toast.error('Failed to export data');
    }
  };

  // Reset demo sample data
  const handleResetDemo = () => {
    try {
      db.resetDemoData(currentUser.id);
      toast.success('Reset account data with realistic demo records');
      setShowResetDataModal(false);
    } catch (e) {
      toast.error('Failed to reset data');
    }
  };

  // Delete account
  const handleDeleteAccount = () => {
    try {
      db.deleteAccount(currentUser.id);
      toast.info('Account deleted. Logging out...');
      setShowDeleteAccountModal(false);
      onLogout();
    } catch (e) {
      toast.error('Failed to delete account');
    }
  };

  return (
    <div className="max-w-4xl space-y-6 pb-16">
      {/* Profile & Currency Settings Form */}
      <form onSubmit={handleSaveProfile} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <UserIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Personal Profile
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Update your basic display information and primary currency
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-3.5 py-2.5 text-sm bg-slate-100 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Currency Selection (Default: Indian Rupee ₹) */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Base Currency <span className="text-slate-400 font-normal">(Default: Indian Rupee ₹)</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {CURRENCIES.map((curr) => {
              const isSelected = currency === curr.code;
              return (
                <button
                  key={curr.code}
                  type="button"
                  onClick={() => setCurrency(curr.code)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-1 ring-indigo-600'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="w-7 h-7 rounded-lg bg-indigo-100/60 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-sm shrink-0">
                    {curr.symbol}
                  </span>
                  <div className="truncate">
                    <p className="text-xs font-bold leading-tight">{curr.code}</p>
                    <p className="text-[10px] text-slate-400 truncate">{curr.name}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Notification Preferences
            </span>
          </div>

          <div className="space-y-3 pt-1">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Budget Threshold Alerts
                </p>
                <p className="text-xs text-slate-400">
                  Receive alerts when spending exceeds 75% or 100% of a category limit
                </p>
              </div>
              <input
                type="checkbox"
                checked={budgetAlerts}
                onChange={(e) => setBudgetAlerts(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Weekly Cashflow Digest
                </p>
                <p className="text-xs text-slate-400">
                  Get a concise summary of weekly income vs expenses
                </p>
              </div>
              <input
                type="checkbox"
                checked={weeklySummary}
                onChange={(e) => setWeeklySummary(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Unusual Spending Warnings
                </p>
                <p className="text-xs text-slate-400">
                  Flag transactions that are abnormally higher than average
                </p>
              </div>
              <input
                type="checkbox"
                checked={unusualSpending}
                onChange={(e) => setUnusualSpending(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Save Profile & Preferences
          </button>
        </div>
      </form>

      {/* Appearance & Theme Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Display & Appearance
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Toggle between refined light mode and high-contrast dark mode
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Switch to Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-600" />
                <span>Switch to Dark Mode</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Data Management & Backup */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Download className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Data Management & Backup
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Export your records or reset demo transactions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex flex-col justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Export Full Backup
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Save a complete JSON copy of all transactions, budgets, and account settings.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportData}
              className="mt-4 flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download JSON Backup
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex flex-col justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Reset Sample Demo Data
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Re-populate current and previous months with realistic test expenses and budgets.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowResetDataModal(true)}
              className="mt-4 flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-100 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Demo Records
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone: Delete Account */}
      <div className="bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-900/40 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-4 h-4" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Danger Zone</h3>
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
              Delete Account & Clear All Records
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Permanently erase your Finly profile, transactions, budgets, and custom category data.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowDeleteAccountModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      {/* Delete Account Modal */}
      <ConfirmModal
        isOpen={showDeleteAccountModal}
        title="Delete Finly Account"
        message={`Are you absolutely sure you want to delete ${currentUser.email}? All transactions and budgets will be permanently destroyed. This action is irreversible.`}
        confirmLabel="Permanently Delete"
        isDestructive={true}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteAccountModal(false)}
      />

      {/* Reset Data Modal */}
      <ConfirmModal
        isOpen={showResetDataModal}
        title="Reset Demo Sample Data"
        message="This will overwrite your existing transactions and budgets with freshly seeded demo transactions for testing."
        confirmLabel="Reset Data"
        isDestructive={false}
        onConfirm={handleResetDemo}
        onCancel={() => setShowResetDataModal(false)}
      />
    </div>
  );
};
