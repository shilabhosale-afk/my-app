import React, { useState, useEffect } from 'react';
import { X, Check, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../../db/storage';
import { PAYMENT_METHODS } from '../../constants';
import { Category, PaymentMethod, Transaction, TransactionType, User } from '../../types';
import { getCurrencySymbol } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { useToast } from '../common/ToastContext';
import confetti from 'canvas-confetti';

interface TransactionModalProps {
  isOpen: boolean;
  currentUser: User;
  initialData?: Transaction | null;
  onClose: () => void;
  onSaved?: (tx: Transaction) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  currentUser,
  initialData,
  onClose,
  onSaved,
}) => {
  const toast = useToast();
  const isEditing = Boolean(initialData);
  const categories = db.getCategories();
  const currencySymbol = getCurrencySymbol(currentUser.currency);

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [notes, setNotes] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Filter categories by type
  const availableCategories = categories.filter((c) => c.type === type);

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      if (initialData) {
        setType(initialData.type);
        setAmount(String(initialData.amount));
        setDescription(initialData.description);
        setCategoryId(initialData.categoryId);
        setDate(initialData.date);
        setPaymentMethod(initialData.paymentMethod);
        setNotes(initialData.notes || '');
      } else {
        setType('expense');
        setAmount('');
        setDescription('');
        // Set default category for expense
        const defaultCat = categories.find((c) => c.type === 'expense');
        setCategoryId(defaultCat?.id || 'cat-food');
        // Default date to today in YYYY-MM-DD
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const d = String(today.getDate()).padStart(2, '0');
        setDate(`${y}-${m}-${d}`);
        setPaymentMethod('UPI');
        setNotes('');
      }
    }
  }, [isOpen, initialData]);

  // When type changes, ensure valid category selection
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const validCats = categories.filter((c) => c.type === newType);
    if (!validCats.some((c) => c.id === categoryId)) {
      setCategoryId(validCats[0]?.id || '');
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Please enter a valid positive amount';
    } else if (numAmount > 100000000) {
      newErrors.amount = 'Amount exceeds maximum allowable limit';
    }

    if (!description.trim()) {
      newErrors.description = 'Transaction description is required';
    } else if (description.trim().length < 2) {
      newErrors.description = 'Description must be at least 2 characters';
    }

    if (!categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    if (!date) {
      newErrors.date = 'Please specify a transaction date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const numAmount = Math.round(parseFloat(amount) * 100) / 100;

      if (isEditing && initialData) {
        const updated = db.updateTransaction({
          ...initialData,
          type,
          amount: numAmount,
          description: description.trim(),
          categoryId,
          date,
          paymentMethod,
          notes: notes.trim() || undefined,
        });
        toast.success(`Transaction "${updated.description}" updated successfully`);
        onSaved?.(updated);
      } else {
        const created = db.addTransaction({
          userId: currentUser.id,
          type,
          amount: numAmount,
          description: description.trim(),
          categoryId,
          date,
          paymentMethod,
          notes: notes.trim() || undefined,
        });

        // Trigger light confetti if saving an income
        if (type === 'income') {
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#10b981', '#6366f1', '#3b82f6'],
          });
        }

        toast.success(`Added ${type === 'income' ? 'income' : 'expense'} of ${currencySymbol}${numAmount.toLocaleString()}`);
        onSaved?.(created);
      }
      onClose();
    } catch (err) {
      toast.error('Failed to save transaction. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickAmounts = type === 'expense' ? [100, 250, 500, 1000, 2500] : [5000, 10000, 25000, 50000];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden z-10"
            role="dialog"
            aria-modal="true"
            aria-labelledby="transaction-modal-title"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2
                  id="transaction-modal-title"
                  className="text-lg font-bold text-slate-900 dark:text-slate-100"
                >
                  {isEditing ? 'Edit Transaction' : 'Add New Transaction'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isEditing ? 'Modify your recorded entry' : 'Track and categorize your income or spending'}
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

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Type Switcher */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Transaction Type
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('expense')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                      type === 'expense'
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4" />
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('income')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                      type === 'income'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    Income
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label
                  htmlFor="tx-amount"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
                >
                  Amount <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 font-bold text-lg">
                    {currencySymbol}
                  </div>
                  <input
                    id="tx-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`block w-full pl-9 pr-4 py-3 text-xl font-bold rounded-xl bg-slate-50 dark:bg-slate-800/50 border text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
                      errors.amount
                        ? 'border-rose-400 focus:ring-rose-500/20'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {errors.amount && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">{errors.amount}</p>
                )}

                {/* Quick amount chips */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-xs text-slate-400 mr-1">Quick:</span>
                  {quickAmounts.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setAmount(String(q))}
                      className="px-2 py-0.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md transition-colors"
                    >
                      +{currencySymbol}{q.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="tx-description"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
                >
                  Description <span className="text-rose-500">*</span>
                </label>
                <input
                  id="tx-description"
                  type="text"
                  placeholder="e.g. Grocery store run, Salary, Netflix subscription"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`block w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/50 border text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
                    errors.description
                      ? 'border-rose-400 focus:ring-rose-500/20'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500'
                  }`}
                />
                {errors.description && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">{errors.description}</p>
                )}
              </div>

              {/* Category Picker */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Category <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availableCategories.map((cat) => {
                    const isSelected = categoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategoryId(cat.id)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 shadow-xs ring-1 ring-indigo-600'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center mb-1.5"
                          style={{
                            backgroundColor: `${cat.color}20`,
                            color: cat.color,
                          }}
                        >
                          <CategoryIcon name={cat.icon} className="w-4 h-4" />
                        </div>
                        <span className="truncate max-w-full">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.categoryId && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">{errors.categoryId}</p>
                )}
              </div>

              {/* Date & Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="tx-date"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
                  >
                    Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="tx-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="block w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  {errors.date && (
                    <p className="text-xs text-rose-500 mt-1 font-medium">{errors.date}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="tx-payment"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
                  >
                    Payment Method
                  </label>
                  <select
                    id="tx-payment"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="block w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    {PAYMENT_METHODS.map((pm) => (
                      <option key={pm} value={pm}>
                        {pm}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label
                  htmlFor="tx-notes"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
                >
                  Notes <span className="text-slate-400 text-xs font-normal">(Optional)</span>
                </label>
                <textarea
                  id="tx-notes"
                  rows={2}
                  placeholder="Additional context, receipt info, tax deduction notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="block w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-600/20 focus:ring-2 focus:ring-indigo-500/30 transition-all disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {isEditing ? 'Save Changes' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
