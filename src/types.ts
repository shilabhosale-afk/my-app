export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 
  | 'UPI'
  | 'Credit Card'
  | 'Debit Card'
  | 'Net Banking'
  | 'Cash'
  | 'Other';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  categoryId: string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  month: string; // YYYY-MM
  createdAt: string;
  updatedAt: string;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  position: 'prefix' | 'suffix';
}

export interface User {
  id: string;
  email: string;
  name: string;
  currency: string; // currency code e.g. 'INR'
  darkMode: boolean;
  notifications: {
    budgetAlerts: boolean;
    weeklySummary: boolean;
    unusualSpending: boolean;
  };
  createdAt: string;
}

export interface SpendingInsight {
  id: string;
  title: string;
  message: string;
  type: 'increase' | 'decrease' | 'saving' | 'alert' | 'positive';
  category?: string;
  percentage?: number;
  diffAmount?: number;
}

export type ActiveTab = 'dashboard' | 'transactions' | 'budgets' | 'analytics' | 'settings';
