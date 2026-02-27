import { ExpenseRecord, ExpenseCategory } from '../types';

export const calculateTotalExpense = (expenses: ExpenseRecord[]): number => {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
};

export const calculateTotalBudget = (expenses: ExpenseRecord[]): number => {
  return expenses.reduce((total, expense) => total + expense.budget, 0);
};

export const calculateVariance = (actual: number, budget: number): number => {
  if (budget === 0) return 0;
  return ((actual - budget) / budget) * 100;
};

export const getTopExpenseCategories = (
  categories: ExpenseCategory[],
  limit: number = 5
): ExpenseCategory[] => {
  return [...categories]
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
};

export const getHighVarianceCategories = (
  categories: ExpenseCategory[],
  threshold: number = 10
): ExpenseCategory[] => {
  return categories.filter(category => Math.abs(category.variance) > threshold);
};

export const groupByCategory = (expenses: ExpenseRecord[]): Record<string, number> => {
  return expenses.reduce((groups, expense) => {
    const category = expense.category;
    groups[category] = (groups[category] || 0) + expense.amount;
    return groups;
  }, {} as Record<string, number>);
};