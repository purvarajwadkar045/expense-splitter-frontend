import API from './api';

const buildFilterParams = (filters = {}) => {
  const params = {};
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.dateRange && filters.dateRange !== 'all') params.date_range = filters.dateRange;
  if (filters.month) params.month = filters.month;
  if (filters.groupId) params.group_id = filters.groupId;
  if (filters.category && filters.category !== 'all') params.category = filters.category;
  if (filters.memberId) params.member_id = filters.memberId;
  if (filters.minAmount !== '' && filters.minAmount != null) params.min_amount = filters.minAmount;
  if (filters.maxAmount !== '' && filters.maxAmount != null) params.max_amount = filters.maxAmount;
  return params;
};

const analyticsService = {
  getSummary: async (filters) => {
    const response = await API.get('/analytics/summary', { params: buildFilterParams(filters) });
    return response.data;
  },
  getCategories: async (filters) => {
    const response = await API.get('/analytics/categories', { params: buildFilterParams(filters) });
    return response.data;
  },
  getMonthly: async (filters) => {
    const response = await API.get('/analytics/monthly', { params: buildFilterParams(filters) });
    return response.data;
  },
  getMembers: async (filters) => {
    const response = await API.get('/analytics/members', { params: buildFilterParams(filters) });
    return response.data;
  },
  getGroups: async (filters) => {
    const response = await API.get('/analytics/groups', { params: buildFilterParams(filters) });
    return response.data;
  },
  getBudget: async (month) => {
    const response = await API.get('/analytics/budget', {
      params: month ? { month } : {},
    });
    return response.data;
  },
  setBudget: async (month, amount) => {
    const response = await API.put('/analytics/budget', { month, amount });
    return response.data;
  },
  getInsights: async (filters) => {
    const response = await API.get('/analytics/insights', { params: buildFilterParams(filters) });
    return response.data;
  },
  getHeatmap: async (filters) => {
    const response = await API.get('/analytics/heatmap', { params: buildFilterParams(filters) });
    return response.data;
  },
  getTopExpenses: async (filters, limit = 10) => {
    const params = { ...buildFilterParams(filters), limit };
    const response = await API.get('/analytics/top-expenses', { params });
    return response.data;
  },
  exportReport: async (filters, report) => {
    const response = await API.get('/analytics/export', {
      params: { ...buildFilterParams(filters), report, format: 'csv' },
      responseType: 'blob',
    });
    return response;
  },
};

export default analyticsService;