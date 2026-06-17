import API from './api';

const expenseService = {
  getExpenses: async (groupId = '') => {
    const params = groupId ? { groupId } : {};
    const response = await API.get('/expenses', { params });
    return response.data; // expects array of Expense
  },

  getExpensesByGroupId: async (groupId) => {
    const response = await API.get(`/groups/${groupId}/expenses`);
    return response.data; // expects array of Expense in the group
  },

  createExpense: async (expenseData) => {
    const response = await API.post('/expenses', expenseData);
    return response.data; // expects new Expense object
  },

  updateExpense: async (id, expenseData) => {
    const response = await API.put(`/expenses/${id}`, expenseData);
    return response.data; // expects updated Expense object
  },

  deleteExpense: async (id) => {
    const response = await API.delete(`/expenses/${id}`);
    return response.data;
  }
};

export default expenseService;
