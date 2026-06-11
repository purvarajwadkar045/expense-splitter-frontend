import { INITIAL_EXPENSES } from '../utils/constants';
import groupService from './groupService';

const getStoredExpenses = () => {
  const stored = localStorage.getItem('expenses');
  if (!stored) {
    localStorage.setItem('expenses', JSON.stringify(INITIAL_EXPENSES));
    return INITIAL_EXPENSES;
  }
  return JSON.parse(stored);
};

const saveExpenses = (expenses) => {
  localStorage.setItem('expenses', JSON.stringify(expenses));
  
  // Recalculate group totals whenever expenses change
  const groups = groupService.getGroups();
  const updatedGroups = groups.map(g => {
    const groupExpenses = expenses.filter(e => e.groupId === g.id);
    const total = groupExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    return { ...g, totalExpenses: total };
  });
  localStorage.setItem('groups', JSON.stringify(updatedGroups));
};

const expenseService = {
  getExpenses: () => {
    return getStoredExpenses();
  },

  getExpensesByGroupId: (groupId) => {
    const expenses = getStoredExpenses();
    return expenses.filter(e => e.groupId === groupId);
  },

  createExpense: (expenseData) => {
    // expenseData expects { groupId, title, amount, paidBy, category, notes, splitType, shares }
    const expenses = getStoredExpenses();
    const newExpense = {
      id: `e_${Date.now()}`,
      ...expenseData,
      amount: Number(expenseData.amount),
      date: expenseData.date || new Date().toISOString().split('T')[0]
    };
    
    const updated = [newExpense, ...expenses];
    saveExpenses(updated);
    return newExpense;
  },

  updateExpense: (id, expenseData) => {
    const expenses = getStoredExpenses();
    let updatedExpense = null;

    const updated = expenses.map(e => {
      if (e.id === id) {
        updatedExpense = { 
          ...e, 
          ...expenseData, 
          amount: Number(expenseData.amount)
        };
        return updatedExpense;
      }
      return e;
    });

    saveExpenses(updated);
    return updatedExpense;
  },

  deleteExpense: (id) => {
    const expenses = getStoredExpenses();
    const filtered = expenses.filter(e => e.id !== id);
    saveExpenses(filtered);
    return true;
  }
};

export default expenseService;
