import { Category, Currency } from './types';

export const CURRENCIES: Currency[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', position: 'prefix' },
  { code: 'USD', symbol: '$', name: 'US Dollar', position: 'prefix' },
  { code: 'EUR', symbol: '€', name: 'Euro', position: 'prefix' },
  { code: 'GBP', symbol: '£', name: 'British Pound', position: 'prefix' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', position: 'prefix' },
  { code: 'AED', symbol: 'AED ', name: 'UAE Dirham', position: 'prefix' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', position: 'prefix' },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar', position: 'prefix' },
];

export const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
  { id: 'cat-food', name: 'Food', type: 'expense', icon: 'Utensils', color: '#f97316' }, // orange
  { id: 'cat-transport', name: 'Transport', type: 'expense', icon: 'Car', color: '#3b82f6' }, // blue
  { id: 'cat-shopping', name: 'Shopping', type: 'expense', icon: 'ShoppingBag', color: '#ec4899' }, // pink
  { id: 'cat-bills', name: 'Bills', type: 'expense', icon: 'Receipt', color: '#eab308' }, // yellow
  { id: 'cat-entertainment', name: 'Entertainment', type: 'expense', icon: 'Film', color: '#8b5cf6' }, // purple
  { id: 'cat-health', name: 'Health', type: 'expense', icon: 'HeartPulse', color: '#10b981' }, // emerald
  { id: 'cat-other-exp', name: 'Other', type: 'expense', icon: 'MoreHorizontal', color: '#64748b' }, // slate
];

export const DEFAULT_INCOME_CATEGORIES: Category[] = [
  { id: 'cat-salary', name: 'Salary', type: 'income', icon: 'Briefcase', color: '#10b981' },
  { id: 'cat-freelance', name: 'Freelance', type: 'income', icon: 'Laptop', color: '#6366f1' },
  { id: 'cat-investments', name: 'Investments', type: 'income', icon: 'TrendingUp', color: '#06b6d4' },
  { id: 'cat-other-inc', name: 'Other Income', type: 'income', icon: 'PiggyBank', color: '#14b8a6' },
];

export const ALL_DEFAULT_CATEGORIES: Category[] = [
  ...DEFAULT_EXPENSE_CATEGORIES,
  ...DEFAULT_INCOME_CATEGORIES,
];

export const PAYMENT_METHODS = [
  'UPI',
  'Credit Card',
  'Debit Card',
  'Net Banking',
  'Cash',
  'Other',
] as const;
