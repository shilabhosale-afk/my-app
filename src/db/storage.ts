import { ALL_DEFAULT_CATEGORIES } from '../constants';
import { Budget, Category, Transaction, User } from '../types';

const STORAGE_KEYS = {
  USERS: 'finly_users_v1',
  AUTH: 'finly_current_user_v1',
  TRANSACTIONS: 'finly_transactions_v1',
  BUDGETS: 'finly_budgets_v1',
  CATEGORIES: 'finly_categories_v1',
};

// Event emitter pattern for reactive updates
type StorageListener = () => void;
const listeners: Set<StorageListener> = new Set();

export function subscribeStorage(callback: StorageListener): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function notifyStorageChange() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Storage listener error:', e);
    }
  });
}

function safeGetItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return fallback;
  }
}

function safeSetItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
}

// Format current date helpers
export function getCurrentMonthString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getPreviousMonthString(currentMonthStr: string): string {
  const [year, month] = currentMonthStr.split('-').map(Number);
  const date = new Date(year, month - 2, 1);
  return getCurrentMonthString(date);
}

export function formatISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate rich realistic sample data for demonstration
function generateSampleData(userId: string) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  const curMonthStr = getCurrentMonthString(now);
  const prevDate = new Date(currentYear, currentMonth - 1, 1);
  const prevMonthStr = getCurrentMonthString(prevDate);

  const sampleTransactions: Transaction[] = [
    // Current Month Income
    {
      id: 'tx-cur-1',
      userId,
      type: 'income',
      amount: 75000,
      description: 'Monthly Tech Salary',
      categoryId: 'cat-salary',
      date: formatISODate(new Date(currentYear, currentMonth, 1)),
      paymentMethod: 'Net Banking',
      notes: 'Direct deposit from employer',
      createdAt: new Date(currentYear, currentMonth, 1).toISOString(),
      updatedAt: new Date(currentYear, currentMonth, 1).toISOString(),
    },
    {
      id: 'tx-cur-2',
      userId,
      type: 'income',
      amount: 15000,
      description: 'UI/UX Design Freelance project',
      categoryId: 'cat-freelance',
      date: formatISODate(new Date(currentYear, currentMonth, 10)),
      paymentMethod: 'UPI',
      notes: 'Final milestone delivery payment',
      createdAt: new Date(currentYear, currentMonth, 10).toISOString(),
      updatedAt: new Date(currentYear, currentMonth, 10).toISOString(),
    },
    {
      id: 'tx-cur-3',
      userId,
      type: 'income',
      amount: 4500,
      description: 'Mutual Fund Dividend',
      categoryId: 'cat-investments',
      date: formatISODate(new Date(currentYear, currentMonth, 14)),
      paymentMethod: 'Net Banking',
      notes: 'Quarterly mutual fund return payout',
      createdAt: new Date(currentYear, currentMonth, 14).toISOString(),
      updatedAt: new Date(currentYear, currentMonth, 14).toISOString(),
    },

    // Current Month Expenses
    {
      id: 'tx-cur-4',
      userId,
      type: 'expense',
      amount: 2450,
      description: 'Weekend Organic Grocery & Fresh Produce',
      categoryId: 'cat-food',
      date: formatISODate(new Date(currentYear, currentMonth, 4)),
      paymentMethod: 'UPI',
      notes: 'Nature Basket supermarket',
      createdAt: new Date(currentYear, currentMonth, 4).toISOString(),
      updatedAt: new Date(currentYear, currentMonth, 4).toISOString(),
    },
    {
      id: 'tx-cur-5',
      userId,
      type: 'expense',
      amount: 1200,
      description: 'Dinner with colleagues at Bistro',
      categoryId: 'cat-food',
      date: formatISODate(new Date(currentYear, currentMonth, 8)),
      paymentMethod: 'Credit Card',
      notes: 'Team celebration',
      createdAt: new Date(currentYear, currentMonth, 8).toISOString(),
      updatedAt: new Date(currentYear, currentMonth, 8).toISOString(),
    },
    {
      id: 'tx-cur-6',
      userId,
      type: 'expense',
      amount: 2200,
      description: 'Cab Rides & Metro Smart Card Recharge',
      categoryId: 'cat-transport',
      date: formatISODate(new Date(currentYear, currentMonth, 6)),
      paymentMethod: 'UPI',
      notes: 'Weekly office commute',
      createdAt: new Date(currentYear, currentMonth, 6).toISOString(),
      updatedAt: new Date(currentYear, currentMonth, 6).toISOString(),
    },
    {
      id: 'tx-cur-7',
      userId,
      type: 'expense',
      amount: 3499,
      description: 'Wireless Noise Cancelling Earbuds',
      categoryId: 'cat-shopping',
      date: formatISODate(new Date(currentYear, currentMonth, 9)),
      paymentMethod: 'Credit Card',
      notes: 'Amazon Great Sale discount',
      createdAt: new Date(currentYear, currentMonth, 9).toISOString(),
      updatedAt: new Date(currentYear, currentMonth, 9).toISOString(),
    },
    {
      id: 'tx-cur-8',
      userId,
      type: 'expense',
      amount: 1450,
      description: 'Electricity & High-speed Fiber Bill',
      categoryId: 'cat-bills',
      date: formatISODate(new Date(currentYear, currentMonth, 5)),
      paymentMethod: 'Net Banking',
      notes: 'Monthly utility bill paid online',
      createdAt: new Date(currentYear, currentMonth, 5).toISOString(),
      updatedAt: new Date(currentYear, currentMonth, 5).toISOString(),
    },
    {
      id: 'tx-cur-9',
      userId,
      type: 'expense',
      amount: 999,
      description: 'OTT Streaming Subscriptions (Netflix & Spotify)',
      categoryId: 'cat-entertainment',
      date: formatISODate(new Date(currentYear, currentMonth, 12)),
      paymentMethod: 'Credit Card',
      notes: 'Auto-recurring debit',
      createdAt: new Date(currentYear, currentMonth, 12).toISOString(),
      updatedAt: new Date(currentYear, currentMonth, 12).toISOString(),
    },
    {
      id: 'tx-cur-10',
      userId,
      type: 'expense',
      amount: 1650,
      description: 'Pharmacy Vitamins & Health Checkup',
      categoryId: 'cat-health',
      date: formatISODate(new Date(currentYear, currentMonth, 11)),
      paymentMethod: 'Debit Card',
      notes: 'Apollo Pharmacy & Multivitamins',
      createdAt: new Date(currentYear, currentMonth, 11).toISOString(),
      updatedAt: new Date(currentYear, currentMonth, 11).toISOString(),
    },
    {
      id: 'tx-cur-11',
      userId,
      type: 'expense',
      amount: 650,
      description: 'Espresso & Bakery Snack',
      categoryId: 'cat-food',
      date: formatISODate(new Date(currentYear, currentMonth, 15)),
      paymentMethod: 'UPI',
      notes: 'Blue Tokai Cafe work session',
      createdAt: new Date(currentYear, currentMonth, 15).toISOString(),
      updatedAt: new Date(currentYear, currentMonth, 15).toISOString(),
    },
    {
      id: 'tx-cur-12',
      userId,
      type: 'expense',
      amount: 1800,
      description: 'Apartment Maintenance & Water Service',
      categoryId: 'cat-bills',
      date: formatISODate(new Date(currentYear, currentMonth, 16)),
      paymentMethod: 'UPI',
      notes: 'Monthly society maintenance',
      createdAt: new Date(currentYear, currentMonth, 16).toISOString(),
      updatedAt: new Date(currentYear, currentMonth, 16).toISOString(),
    },

    // Previous Month (for accurate MoM comparisons & Insights)
    {
      id: 'tx-prev-1',
      userId,
      type: 'income',
      amount: 75000,
      description: 'Monthly Tech Salary',
      categoryId: 'cat-salary',
      date: formatISODate(new Date(currentYear, currentMonth - 1, 1)),
      paymentMethod: 'Net Banking',
      notes: 'Direct deposit',
      createdAt: new Date(currentYear, currentMonth - 1, 1).toISOString(),
      updatedAt: new Date(currentYear, currentMonth - 1, 1).toISOString(),
    },
    {
      id: 'tx-prev-2',
      userId,
      type: 'income',
      amount: 10000,
      description: 'Design Consultation',
      categoryId: 'cat-freelance',
      date: formatISODate(new Date(currentYear, currentMonth - 1, 12)),
      paymentMethod: 'UPI',
      notes: 'Client retainer',
      createdAt: new Date(currentYear, currentMonth - 1, 12).toISOString(),
      updatedAt: new Date(currentYear, currentMonth - 1, 12).toISOString(),
    },
    {
      id: 'tx-prev-3',
      userId,
      type: 'expense',
      amount: 3650, // Food last month was lower or comparable
      description: 'Monthly Groceries',
      categoryId: 'cat-food',
      date: formatISODate(new Date(currentYear, currentMonth - 1, 5)),
      paymentMethod: 'Debit Card',
      notes: 'Monthly staples',
      createdAt: new Date(currentYear, currentMonth - 1, 5).toISOString(),
      updatedAt: new Date(currentYear, currentMonth - 1, 5).toISOString(),
    },
    {
      id: 'tx-prev-4',
      userId,
      type: 'expense',
      amount: 2800,
      description: 'Fuel & Metro',
      categoryId: 'cat-transport',
      date: formatISODate(new Date(currentYear, currentMonth - 1, 10)),
      paymentMethod: 'Credit Card',
      notes: 'Monthly commute',
      createdAt: new Date(currentYear, currentMonth - 1, 10).toISOString(),
      updatedAt: new Date(currentYear, currentMonth - 1, 10).toISOString(),
    },
    {
      id: 'tx-prev-5',
      userId,
      type: 'expense',
      amount: 2900,
      description: 'Summer Clothing Sale',
      categoryId: 'cat-shopping',
      date: formatISODate(new Date(currentYear, currentMonth - 1, 18)),
      paymentMethod: 'UPI',
      notes: 'Zara online order',
      createdAt: new Date(currentYear, currentMonth - 1, 18).toISOString(),
      updatedAt: new Date(currentYear, currentMonth - 1, 18).toISOString(),
    },
    {
      id: 'tx-prev-6',
      userId,
      type: 'expense',
      amount: 2800,
      description: 'Internet & Mobile Postpaid',
      categoryId: 'cat-bills',
      date: formatISODate(new Date(currentYear, currentMonth - 1, 8)),
      paymentMethod: 'Net Banking',
      notes: 'Telecom bills',
      createdAt: new Date(currentYear, currentMonth - 1, 8).toISOString(),
      updatedAt: new Date(currentYear, currentMonth - 1, 10).toISOString(),
    },
  ];

  const sampleBudgets: Budget[] = [
    {
      id: `bg-food-${curMonthStr}`,
      userId,
      categoryId: 'cat-food',
      amount: 5000,
      month: curMonthStr,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `bg-transport-${curMonthStr}`,
      userId,
      categoryId: 'cat-transport',
      amount: 3000,
      month: curMonthStr,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `bg-shopping-${curMonthStr}`,
      userId,
      categoryId: 'cat-shopping',
      amount: 4000,
      month: curMonthStr,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `bg-bills-${curMonthStr}`,
      userId,
      categoryId: 'cat-bills',
      amount: 4000,
      month: curMonthStr,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `bg-entertainment-${curMonthStr}`,
      userId,
      categoryId: 'cat-entertainment',
      amount: 2500,
      month: curMonthStr,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `bg-health-${curMonthStr}`,
      userId,
      categoryId: 'cat-health',
      amount: 2500,
      month: curMonthStr,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return { sampleTransactions, sampleBudgets };
}

// Initial Database Seeder
export function initializeDatabase(): { currentUser: User | null } {
  // Ensure categories exist
  let categories = safeGetItem<Category[]>(STORAGE_KEYS.CATEGORIES, []);
  if (!categories || categories.length === 0) {
    categories = ALL_DEFAULT_CATEGORIES;
    safeSetItem(STORAGE_KEYS.CATEGORIES, categories);
  }

  // Ensure default demo user exists
  let users = safeGetItem<User[]>(STORAGE_KEYS.USERS, []);
  const demoUser: User = {
    id: 'user-demo-finly',
    email: 'demo@finly.app',
    name: 'Shila Bhosale',
    currency: 'INR',
    darkMode: false,
    notifications: {
      budgetAlerts: true,
      weeklySummary: true,
      unusualSpending: true,
    },
    createdAt: new Date(2026, 0, 1).toISOString(),
  };

  const existingDemo = users.find((u) => u.email === demoUser.email);
  if (!existingDemo) {
    users.push(demoUser);
    safeSetItem(STORAGE_KEYS.USERS, users);
  }

  // Ensure current logged in user
  let currentAuthUserId = safeGetItem<string | null>(STORAGE_KEYS.AUTH, null);
  if (!currentAuthUserId) {
    currentAuthUserId = demoUser.id;
    safeSetItem(STORAGE_KEYS.AUTH, currentAuthUserId);
  }

  const currentUser = users.find((u) => u.id === currentAuthUserId) || demoUser;

  // Ensure transactions exist for currentUser
  let transactions = safeGetItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
  const userTransactions = transactions.filter((t) => t.userId === currentUser.id);

  if (userTransactions.length === 0) {
    const { sampleTransactions, sampleBudgets } = generateSampleData(currentUser.id);
    transactions = [...transactions, ...sampleTransactions];
    safeSetItem(STORAGE_KEYS.TRANSACTIONS, transactions);

    let budgets = safeGetItem<Budget[]>(STORAGE_KEYS.BUDGETS, []);
    budgets = [...budgets, ...sampleBudgets];
    safeSetItem(STORAGE_KEYS.BUDGETS, budgets);
  }

  return { currentUser };
}

// User & Authentication Operations
export const db = {
  getCurrentUser(): User | null {
    const users = safeGetItem<User[]>(STORAGE_KEYS.USERS, []);
    const authUserId = safeGetItem<string | null>(STORAGE_KEYS.AUTH, null);
    if (!authUserId) return null;
    return users.find((u) => u.id === authUserId) || null;
  },

  login(email: string): { success: boolean; user?: User; error?: string } {
    const users = safeGetItem<User[]>(STORAGE_KEYS.USERS, []);
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return { success: false, error: 'No account found with this email address.' };
    }

    safeSetItem(STORAGE_KEYS.AUTH, user.id);
    notifyStorageChange();
    return { success: true, user };
  },

  signUp(name: string, email: string): { success: boolean; user?: User; error?: string } {
    const users = safeGetItem<User[]>(STORAGE_KEYS.USERS, []);
    const cleanEmail = email.trim().toLowerCase();

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email already exists. Please log in.' };
    }

    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      name: name.trim(),
      email: cleanEmail,
      currency: 'INR',
      darkMode: false,
      notifications: {
        budgetAlerts: true,
        weeklySummary: true,
        unusualSpending: true,
      },
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    safeSetItem(STORAGE_KEYS.USERS, users);
    safeSetItem(STORAGE_KEYS.AUTH, newUser.id);

    // Seed welcoming initial transactions for the new user
    const { sampleTransactions, sampleBudgets } = generateSampleData(newUser.id);
    const existingTxs = safeGetItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    safeSetItem(STORAGE_KEYS.TRANSACTIONS, [...existingTxs, ...sampleTransactions]);

    const existingBudgets = safeGetItem<Budget[]>(STORAGE_KEYS.BUDGETS, []);
    safeSetItem(STORAGE_KEYS.BUDGETS, [...existingBudgets, ...sampleBudgets]);

    notifyStorageChange();
    return { success: true, user: newUser };
  },

  logout(): void {
    safeSetItem(STORAGE_KEYS.AUTH, null);
    notifyStorageChange();
  },

  resetPassword(email: string): { success: boolean; message: string } {
    const users = safeGetItem<User[]>(STORAGE_KEYS.USERS, []);
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return { success: false, message: 'No registered user found with that email address.' };
    }

    return {
      success: true,
      message: `A password reset link has been dispatched to ${cleanEmail}. In demo mode, your credentials remain active.`,
    };
  },

  updateUser(updatedData: Partial<User>): User | null {
    const users = safeGetItem<User[]>(STORAGE_KEYS.USERS, []);
    const authUserId = safeGetItem<string | null>(STORAGE_KEYS.AUTH, null);
    if (!authUserId) return null;

    const index = users.findIndex((u) => u.id === authUserId);
    if (index === -1) return null;

    users[index] = { ...users[index], ...updatedData };
    safeSetItem(STORAGE_KEYS.USERS, users);
    notifyStorageChange();
    return users[index];
  },

  deleteAccount(userId: string): boolean {
    let users = safeGetItem<User[]>(STORAGE_KEYS.USERS, []);
    users = users.filter((u) => u.id !== userId);
    safeSetItem(STORAGE_KEYS.USERS, users);

    // Delete user transactions and budgets
    let txs = safeGetItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    txs = txs.filter((t) => t.userId !== userId);
    safeSetItem(STORAGE_KEYS.TRANSACTIONS, txs);

    let budgets = safeGetItem<Budget[]>(STORAGE_KEYS.BUDGETS, []);
    budgets = budgets.filter((b) => b.userId !== userId);
    safeSetItem(STORAGE_KEYS.BUDGETS, budgets);

    safeSetItem(STORAGE_KEYS.AUTH, null);
    notifyStorageChange();
    return true;
  },

  // Category Operations
  getCategories(): Category[] {
    return safeGetItem<Category[]>(STORAGE_KEYS.CATEGORIES, ALL_DEFAULT_CATEGORIES);
  },

  getCategoryById(id: string): Category {
    const cats = this.getCategories();
    return cats.find((c) => c.id === id) || {
      id,
      name: 'Other',
      type: 'expense',
      icon: 'MoreHorizontal',
      color: '#64748b',
    };
  },

  // Transaction Operations
  getTransactions(userId: string, filters?: {
    month?: string; // YYYY-MM
    type?: 'all' | 'income' | 'expense';
    categoryId?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Transaction[] {
    const allTxs = safeGetItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    let userTxs = allTxs.filter((t) => t.userId === userId);

    if (filters) {
      if (filters.month) {
        userTxs = userTxs.filter((t) => t.date.startsWith(filters.month!));
      }
      if (filters.type && filters.type !== 'all') {
        userTxs = userTxs.filter((t) => t.type === filters.type);
      }
      if (filters.categoryId && filters.categoryId !== 'all') {
        userTxs = userTxs.filter((t) => t.categoryId === filters.categoryId);
      }
      if (filters.search) {
        const query = filters.search.toLowerCase().trim();
        userTxs = userTxs.filter(
          (t) =>
            t.description.toLowerCase().includes(query) ||
            (t.notes && t.notes.toLowerCase().includes(query)) ||
            t.paymentMethod.toLowerCase().includes(query)
        );
      }
      if (filters.dateFrom) {
        userTxs = userTxs.filter((t) => t.date >= filters.dateFrom!);
      }
      if (filters.dateTo) {
        userTxs = userTxs.filter((t) => t.date <= filters.dateTo!);
      }
    }

    // Sort descending by date by default
    return userTxs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  addTransaction(txData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Transaction {
    const allTxs = safeGetItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    allTxs.unshift(newTx);
    safeSetItem(STORAGE_KEYS.TRANSACTIONS, allTxs);
    notifyStorageChange();
    return newTx;
  },

  updateTransaction(tx: Transaction): Transaction {
    const allTxs = safeGetItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    const index = allTxs.findIndex((t) => t.id === tx.id && t.userId === tx.userId);

    if (index !== -1) {
      allTxs[index] = {
        ...tx,
        updatedAt: new Date().toISOString(),
      };
      safeSetItem(STORAGE_KEYS.TRANSACTIONS, allTxs);
      notifyStorageChange();
    }
    return tx;
  },

  deleteTransaction(id: string, userId: string): boolean {
    let allTxs = safeGetItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    const prevCount = allTxs.length;
    allTxs = allTxs.filter((t) => !(t.id === id && t.userId === userId));

    if (allTxs.length !== prevCount) {
      safeSetItem(STORAGE_KEYS.TRANSACTIONS, allTxs);
      notifyStorageChange();
      return true;
    }
    return false;
  },

  // Budget Operations
  getBudgets(userId: string, month?: string): Budget[] {
    const allBudgets = safeGetItem<Budget[]>(STORAGE_KEYS.BUDGETS, []);
    let userBudgets = allBudgets.filter((b) => b.userId === userId);
    if (month) {
      userBudgets = userBudgets.filter((b) => b.month === month);
    }
    return userBudgets;
  },

  saveBudget(budgetData: {
    id?: string;
    userId: string;
    categoryId: string;
    amount: number;
    month: string;
  }): Budget {
    const allBudgets = safeGetItem<Budget[]>(STORAGE_KEYS.BUDGETS, []);
    const existingIndex = allBudgets.findIndex(
      (b) =>
        b.userId === budgetData.userId &&
        b.categoryId === budgetData.categoryId &&
        b.month === budgetData.month
    );

    let savedBudget: Budget;
    if (existingIndex !== -1) {
      savedBudget = {
        ...allBudgets[existingIndex],
        amount: budgetData.amount,
        updatedAt: new Date().toISOString(),
      };
      allBudgets[existingIndex] = savedBudget;
    } else {
      savedBudget = {
        id: budgetData.id || `bg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        userId: budgetData.userId,
        categoryId: budgetData.categoryId,
        amount: budgetData.amount,
        month: budgetData.month,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      allBudgets.push(savedBudget);
    }

    safeSetItem(STORAGE_KEYS.BUDGETS, allBudgets);
    notifyStorageChange();
    return savedBudget;
  },

  deleteBudget(id: string, userId: string): boolean {
    let allBudgets = safeGetItem<Budget[]>(STORAGE_KEYS.BUDGETS, []);
    const initialLen = allBudgets.length;
    allBudgets = allBudgets.filter((b) => !(b.id === id && b.userId === userId));

    if (allBudgets.length !== initialLen) {
      safeSetItem(STORAGE_KEYS.BUDGETS, allBudgets);
      notifyStorageChange();
      return true;
    }
    return false;
  },

  // Data Export & Reset
  exportAllData(userId: string) {
    const transactions = this.getTransactions(userId);
    const budgets = this.getBudgets(userId);
    const user = this.getCurrentUser();

    return {
      appName: 'Finly',
      exportedAt: new Date().toISOString(),
      user: {
        name: user?.name,
        email: user?.email,
        currency: user?.currency,
      },
      transactions,
      budgets,
    };
  },

  resetDemoData(userId: string) {
    // Purge user's transactions and budgets and re-seed
    let allTxs = safeGetItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    allTxs = allTxs.filter((t) => t.userId !== userId);

    let allBudgets = safeGetItem<Budget[]>(STORAGE_KEYS.BUDGETS, []);
    allBudgets = allBudgets.filter((b) => b.userId !== userId);

    const { sampleTransactions, sampleBudgets } = generateSampleData(userId);
    safeSetItem(STORAGE_KEYS.TRANSACTIONS, [...allTxs, ...sampleTransactions]);
    safeSetItem(STORAGE_KEYS.BUDGETS, [...allBudgets, ...sampleBudgets]);

    notifyStorageChange();
  },
};
