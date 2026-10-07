import API from './api';
import groupService from './groupService';

const resolveUserId = (key, memberMap, currentUser) => {
  if (typeof key === 'number') return key;
  if (typeof key === 'string') {
    if (/^\d+$/.test(key)) return Number(key);
    if (key.toLowerCase() === 'you' && currentUser) return currentUser.id;
    return memberMap[key.toLowerCase()];
  }
  return null;
};

const buildMemberMap = (members, currentUser) => {
  const memberMap = {};
  members.forEach((member) => {
    memberMap[String(member.user_id)] = member.user_id;
    memberMap[member.username.toLowerCase()] = member.user_id;
  });
  if (currentUser) {
    memberMap[String(currentUser.id)] = currentUser.id;
    memberMap.you = currentUser.id;
    memberMap[currentUser.name.toLowerCase()] = currentUser.id;
  }
  return memberMap;
};

const buildExpenseSplits = (shares, memberMap, currentUser) => {
  const splits = Object.entries(shares)
    .filter(([, amount]) => Number(amount) !== 0)
    .map(([key, amount]) => {
      const userId = resolveUserId(key, memberMap, currentUser);
      if (userId == null) {
        throw new Error(`Could not resolve expense split participant: ${key}`);
      }
      return { user_id: userId, amount: Number(amount) };
    });
  if (splits.length === 0) {
    throw new Error('At least one expense split participant is required.');
  }
  return splits;
};

const mapBackendExpenseToFrontend = (exp, groupId, currentUserName, groupName = '') => {
  return {
    id: exp.id,
    groupId: String(groupId || exp.group_id),
    groupName: groupName,
    title: exp.title,
    amount: Number(exp.amount),
    paidBy: exp.paid_by === currentUserName ? 'You' : exp.paid_by,
    splitType: exp.split_type || 'equal',
    category: exp.category || 'Other',
    date: exp.created_at ? new Date(exp.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    notes: exp.description || '',
    shares: {}
  };
};

const expenseService = {
  getExpenses: async (groupId = '') => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const currentUserName = currentUser ? currentUser.name : '';

    if (groupId) {
      let groupName = '';
      try {
        const g = await groupService.getGroupById(groupId);
        groupName = g ? g.name : '';
      } catch (err) {
        console.warn(`Failed to fetch group details for group ${groupId}:`, err);
      }
      const response = await API.get(`/groups/${groupId}/expenses`);
      return response.data.map(exp => mapBackendExpenseToFrontend(exp, groupId, currentUserName, groupName));
    }

    const groups = await groupService.getGroups();
    if (!Array.isArray(groups) || groups.length === 0) return [];

    const expensesByGroup = await Promise.all(groups.map(async (group) => {
      const response = await API.get(`/groups/${group.id}/expenses`);
      return response.data.map(exp => mapBackendExpenseToFrontend(
        exp,
        group.id,
        currentUserName,
        group.name,
      ));
    }));
    return expensesByGroup.flat().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  getExpensesByGroupId: async (groupId, filters = {}) => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const currentUserName = currentUser ? currentUser.name : '';
    let groupName = '';
    try {
      const g = await groupService.getGroupById(groupId);
      groupName = g ? g.name : '';
    } catch (err) {
      console.warn(`Failed to fetch group details for group ${groupId}:`, err);
    }
    const params = {};
    if (filters.search?.trim()) params.search = filters.search.trim();
    if (filters.dateRange && filters.dateRange !== 'all') params.date_range = filters.dateRange;
    if (filters.category && filters.category !== 'all') params.category = filters.category;
    if (filters.memberId) params.member_id = filters.memberId;
    if (filters.minAmount !== '' && filters.minAmount != null) params.min_amount = filters.minAmount;
    if (filters.maxAmount !== '' && filters.maxAmount != null) params.max_amount = filters.maxAmount;
    const response = await API.get(`/groups/${groupId}/expenses`, { params });
    return response.data.map(exp => mapBackendExpenseToFrontend(exp, groupId, currentUserName, groupName));
  },

  createExpense: async (expenseData) => {
    const groupId = expenseData.groupId;
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const balanceResponse = await API.get(`/groups/${groupId}/balances`);
    const memberMap = buildMemberMap(balanceResponse.data, currentUser);
    const postPayload = {
      title: expenseData.title,
      amount: Number(expenseData.amount),
      description: expenseData.notes || '',
      category: expenseData.category || 'Other'
    };
    if (expenseData.paidBy !== undefined && expenseData.paidBy !== null) {
      postPayload.paid_by = Number(expenseData.paidBy);
    }
    if (Object.keys(expenseData.shares || {}).length > 0) {
      postPayload.splits = buildExpenseSplits(expenseData.shares, memberMap, currentUser);
    }

    const response = await API.post(`/groups/${groupId}/expenses`, postPayload);
    const currentUserName = currentUser ? currentUser.name : '';
    return mapBackendExpenseToFrontend(response.data, groupId, currentUserName);
  },

  updateExpense: async (id, expenseData) => {
    const groupId = expenseData.groupId;
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const balanceResponse = await API.get(`/groups/${groupId}/balances`);
    const memberMap = buildMemberMap(balanceResponse.data, currentUser);

    const payload = {
      title: expenseData.title,
      amount: Number(expenseData.amount),
      description: expenseData.notes || '',
      category: expenseData.category || 'Other'
    };
    if (Object.keys(expenseData.shares || {}).length > 0) {
      payload.splits = buildExpenseSplits(expenseData.shares, memberMap, currentUser);
    } else {
      payload.participants = balanceResponse.data.map((member) => member.user_id);
    }

    const response = await API.put(`/expenses/${id}`, payload);
    const currentUserName = currentUser ? currentUser.name : '';
    return mapBackendExpenseToFrontend(response.data, groupId, currentUserName);
  },

  deleteExpense: async (id) => {
    const response = await API.delete(`/expenses/${id}`);
    return response.data;
  }
};

export default expenseService;
