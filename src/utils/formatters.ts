import { CURRENCIES } from '../constants';
import { Budget, Category, SpendingInsight, Transaction } from '../types';

export function getCurrencySymbol(currencyCode: string = 'INR'): string {
  const curr = CURRENCIES.find((c) => c.code === currencyCode);
  return curr ? curr.symbol : '₹';
}

export function formatCurrency(
  amount: number,
  currencyCode: string = 'INR',
  options?: { compact?: boolean; sign?: boolean }
): string {
  const symbol = getCurrencySymbol(currencyCode);
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  let formattedNumber: string;

  if (options?.compact && absAmount >= 100000) {
    if (currencyCode === 'INR') {
      if (absAmount >= 10000000) {
        formattedNumber = (absAmount / 10000000).toFixed(2) + ' Cr';
      } else {
        formattedNumber = (absAmount / 100000).toFixed(1) + ' L';
      }
    } else {
      if (absAmount >= 1000000) {
        formattedNumber = (absAmount / 1000000).toFixed(1) + 'M';
      } else {
        formattedNumber = (absAmount / 1000).toFixed(1) + 'k';
      }
    }
  } else {
    // Standard locale formatting
    formattedNumber = absAmount.toLocaleString(currencyCode === 'INR' ? 'en-IN' : 'en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }

  const signStr = options?.sign ? (isNegative ? '- ' : '+ ') : isNegative ? '-' : '';
  return `${signStr}${symbol}${formattedNumber}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  if (checkDate.getTime() === today.getTime()) {
    return 'Today';
  }
  if (checkDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
}

export function formatMonthName(monthStr: string): string {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export interface FinancialSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  monthlyBudgetTotal: number;
  budgetSpent: number;
  budgetRemaining: number;
  budgetUsedPercent: number;
  savingsRate: number;
  incomeChangePercent: number;
  expenseChangePercent: number;
}

export function calculateMonthlySummary(
  transactions: Transaction[],
  budgets: Budget[],
  selectedMonth: string,
  prevMonth: string
): FinancialSummary {
  // Current month transactions
  const curMonthTxs = transactions.filter((t) => t.date.startsWith(selectedMonth));
  const prevMonthTxs = transactions.filter((t) => t.date.startsWith(prevMonth));

  const totalIncome = curMonthTxs
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = curMonthTxs
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // All-time balance up to selected month
  const allTimeIncome = transactions
    .filter((t) => t.type === 'income' && t.date <= `${selectedMonth}-31`)
    .reduce((sum, t) => sum + t.amount, 0);

  const allTimeExpenses = transactions
    .filter((t) => t.type === 'expense' && t.date <= `${selectedMonth}-31`)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = allTimeIncome - allTimeExpenses;

  // Previous month numbers for trend comparison
  const prevIncome = prevMonthTxs
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const prevExpenses = prevMonthTxs
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const incomeChangePercent =
    prevIncome > 0 ? Math.round(((totalIncome - prevIncome) / prevIncome) * 100) : 0;
  const expenseChangePercent =
    prevExpenses > 0 ? Math.round(((totalExpenses - prevExpenses) / prevExpenses) * 100) : 0;

  // Budgets for current month
  const curBudgets = budgets.filter((b) => b.month === selectedMonth);
  const monthlyBudgetTotal = curBudgets.reduce((sum, b) => sum + b.amount, 0);

  // Budget spent on categories that have a budget
  const budgetedCategoryIds = new Set(curBudgets.map((b) => b.categoryId));
  const budgetSpent = curMonthTxs
    .filter((t) => t.type === 'expense' && budgetedCategoryIds.has(t.categoryId))
    .reduce((sum, t) => sum + t.amount, 0);

  const budgetRemaining = Math.max(0, monthlyBudgetTotal - budgetSpent);
  const budgetUsedPercent =
    monthlyBudgetTotal > 0 ? Math.round((budgetSpent / monthlyBudgetTotal) * 100) : 0;

  const savingsRate =
    totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)) : 0;

  return {
    totalBalance,
    totalIncome,
    totalExpenses,
    monthlyBudgetTotal,
    budgetSpent,
    budgetRemaining,
    budgetUsedPercent,
    savingsRate,
    incomeChangePercent,
    expenseChangePercent,
  };
}

export function generateCategoryBreakdown(
  transactions: Transaction[],
  categories: Category[],
  selectedMonth: string
): {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
  count: number;
}[] {
  const curExpenses = transactions.filter(
    (t) => t.type === 'expense' && t.date.startsWith(selectedMonth)
  );
  const totalExpense = curExpenses.reduce((sum, t) => sum + t.amount, 0);

  const map = new Map<string, { amount: number; count: number }>();
  curExpenses.forEach((t) => {
    const current = map.get(t.categoryId) || { amount: 0, count: 0 };
    map.set(t.categoryId, {
      amount: current.amount + t.amount,
      count: current.count + 1,
    });
  });

  const breakdown = Array.from(map.entries()).map(([catId, data]) => {
    const cat = categories.find((c) => c.id === catId) || {
      id: catId,
      name: 'Other',
      color: '#64748b',
      icon: 'MoreHorizontal',
    };
    return {
      id: catId,
      name: cat.name,
      amount: data.amount,
      percentage: totalExpense > 0 ? Math.round((data.amount / totalExpense) * 100) : 0,
      color: cat.color || '#6366f1',
      icon: cat.icon || 'Tag',
      count: data.count,
    };
  });

  return breakdown.sort((a, b) => b.amount - a.amount);
}

export function generateSpendingInsights(
  transactions: Transaction[],
  categories: Category[],
  selectedMonth: string,
  prevMonth: string,
  currencyCode: string
): SpendingInsight[] {
  const insights: SpendingInsight[] = [];
  const curExpenses = transactions.filter(
    (t) => t.type === 'expense' && t.date.startsWith(selectedMonth)
  );
  const prevExpenses = transactions.filter(
    (t) => t.type === 'expense' && t.date.startsWith(prevMonth)
  );

  const curIncome = transactions
    .filter((t) => t.type === 'income' && t.date.startsWith(selectedMonth))
    .reduce((sum, t) => sum + t.amount, 0);
  const curTotalExpense = curExpenses.reduce((sum, t) => sum + t.amount, 0);

  // 1. Food comparison (Requested specifically in user prompt!)
  const foodCat = categories.find((c) => c.name.toLowerCase() === 'food');
  if (foodCat) {
    const foodCur = curExpenses
      .filter((t) => t.categoryId === foodCat.id)
      .reduce((sum, t) => sum + t.amount, 0);
    const foodPrev = prevExpenses
      .filter((t) => t.categoryId === foodCat.id)
      .reduce((sum, t) => sum + t.amount, 0);

    if (foodCur > 0 && foodPrev > 0) {
      const diff = foodCur - foodPrev;
      const pct = Math.round(Math.abs(diff / foodPrev) * 100);
      if (diff > 0) {
        insights.push({
          id: 'insight-food',
          title: 'Food & Dining Trend',
          message: `You spent ${formatCurrency(foodCur, currencyCode)} on Food this month, ${pct}% more than last month.`,
          type: 'alert',
          category: 'Food',
          percentage: pct,
          diffAmount: diff,
        });
      } else {
        insights.push({
          id: 'insight-food',
          title: 'Food Savings',
          message: `You spent ${formatCurrency(foodCur, currencyCode)} on Food this month, saving ${pct}% compared to last month!`,
          type: 'positive',
          category: 'Food',
          percentage: pct,
          diffAmount: Math.abs(diff),
        });
      }
    } else if (foodCur > 0) {
      insights.push({
        id: 'insight-food',
        title: 'Food & Dining',
        message: `You spent ${formatCurrency(foodCur, currencyCode)} on Food this month across ${curExpenses.filter((t) => t.categoryId === foodCat.id).length} transactions.`,
        type: 'alert',
        category: 'Food',
      });
    }
  }

  // 2. Savings rate insight
  if (curIncome > 0) {
    const netSavings = curIncome - curTotalExpense;
    const rate = Math.round((netSavings / curIncome) * 100);
    if (rate >= 20) {
      insights.push({
        id: 'insight-savings',
        title: 'Healthy Savings Rate',
        message: `You have saved ${rate}% (${formatCurrency(netSavings, currencyCode)}) of your total income this month. Excellent financial discipline!`,
        type: 'saving',
        percentage: rate,
      });
    } else if (rate > 0) {
      insights.push({
        id: 'insight-savings',
        title: 'Moderate Savings',
        message: `You have retained ${rate}% of your income (${formatCurrency(netSavings, currencyCode)}). Consider capping non-essential shopping.`,
        type: 'alert',
        percentage: rate,
      });
    } else {
      insights.push({
        id: 'insight-deficit',
        title: 'Expenditure Exceeded Income',
        message: `Your expenses exceeded income by ${formatCurrency(Math.abs(netSavings), currencyCode)} this month. Review your active budget caps.`,
        type: 'alert',
      });
    }
  }

  // 3. Category with highest change
  const catChanges: { name: string; cur: number; prev: number; diff: number; pct: number }[] = [];
  categories
    .filter((c) => c.type === 'expense' && c.name.toLowerCase() !== 'food')
    .forEach((cat) => {
      const cCur = curExpenses
        .filter((t) => t.categoryId === cat.id)
        .reduce((sum, t) => sum + t.amount, 0);
      const cPrev = prevExpenses
        .filter((t) => t.categoryId === cat.id)
        .reduce((sum, t) => sum + t.amount, 0);

      if (cCur > 0 && cPrev > 0) {
        const diff = cCur - cPrev;
        const pct = Math.round(Math.abs(diff / cPrev) * 100);
        catChanges.push({ name: cat.name, cur: cCur, prev: cPrev, diff, pct });
      }
    });

  if (catChanges.length > 0) {
    catChanges.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
    const topChange = catChanges[0];
    if (topChange.diff > 0) {
      insights.push({
        id: 'insight-top-change',
        title: `${topChange.name} Expenses Rose`,
        message: `${topChange.name} spend increased by ${topChange.pct}% (${formatCurrency(topChange.diff, currencyCode)}) relative to last month.`,
        type: 'increase',
        category: topChange.name,
        percentage: topChange.pct,
      });
    } else {
      insights.push({
        id: 'insight-top-change',
        title: `${topChange.name} Spending Reduced`,
        message: `You cut down ${topChange.name} spending by ${topChange.pct}% (${formatCurrency(Math.abs(topChange.diff), currencyCode)}) this month.`,
        type: 'decrease',
        category: topChange.name,
        percentage: topChange.pct,
      });
    }
  }

  return insights;
}
