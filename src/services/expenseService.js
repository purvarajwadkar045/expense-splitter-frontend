import API from './api';
import groupService from './groupService';

const mapBackendExpenseToFrontend = (exp, groupId, currentUserName, groupName = '') => {
  return {
    id: exp.id,
    groupId: String(groupId || exp.group_id),
    groupName: groupName,
    title: exp.title,
    amount: Number(exp.amount),
    paidBy: exp.paid_by === currentUserName ? 'You' : exp.paid_by,
    splitType: 'equal',
    category: 'Others', // category is frontend UI helper state
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
    } else {
      try {
        const groups = await groupService.getGroups();
        if (!Array.isArray(groups) || groups.length === 0) {
          return [];
        }
        const allExpenses = [];
        const promises = groups.map(async (g) => {
          try {
            const response = await API.get(`/groups/${g.id}/expenses`);
            const mapped = response.data.map(exp => mapBackendExpenseToFrontend(exp, g.id, currentUserName, g.name));
            allExpenses.push(...mapped);
          } catch (err) {
            console.warn(`Failed to fetch expenses for group ${g.id}:`, err);
          }
        });
        await Promise.all(promises);
        return allExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      } catch (error) {
        console.error('Failed to fetch groups for expenses:', error);
        return [];
      }
    }
  },

  getExpensesByGroupId: async (groupId) => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const currentUserName = currentUser ? currentUser.name : '';
    let groupName = '';
    try {
      const g = await groupService.getGroupById(groupId);
      groupName = g ? g.name : '';
    } catch (err) {
      console.warn(`Failed to fetch group details for group ${groupId}:`, err);
    }
    const response = await API.get(`/groups/${groupId}/expenses`);
    return response.data.map(exp => mapBackendExpenseToFrontend(exp, groupId, currentUserName, groupName));
  },

  createExpense: async (expenseData) => {
    const groupId = expenseData.groupId;
    
    // 1. Post expense details to backend
    const response = await API.post(`/groups/${groupId}/expenses`, {
      title: expenseData.title,
      amount: Number(expenseData.amount),
      description: expenseData.notes || ''
    });
    const createdExpense = response.data; // ExpenseResponse
    const expenseId = createdExpense.id;

    // 2. Fetch group balances to map member usernames to user IDs
    try {
      const balanceRes = await API.get(`/groups/${groupId}/balances`);
      const members = balanceRes.data;
      const currentUser = JSON.parse(localStorage.getItem('user'));
      
      const memberMap = {};
      members.forEach(m => {
        memberMap[m.username.toLowerCase()] = m.user_id;
      });
      if (currentUser) {
        memberMap['you'] = currentUser.id;
        memberMap[currentUser.name.toLowerCase()] = currentUser.id;
      }

      // If no custom splits, use all group members
      const groupData = await groupService.getGroupById(groupId);
      const participantNames = Object.keys(expenseData.shares || {}).length > 0 
        ? Object.keys(expenseData.shares) 
        : (groupData?.members || []);

      const participants = [];
      participantNames.forEach(name => {
        if (name === 'You' && currentUser) {
          participants.push(currentUser.id);
        } else {
          const uid = memberMap[name.toLowerCase()];
          if (uid) {
            participants.push(uid);
          }
        }
      });

      if (participants.length > 0) {
        // Update split participants using PUT
        await API.put(`/expenses/${expenseId}`, {
          participants
        });
      }
    } catch (err) {
      console.warn('Failed to assign splits on backend creation:', err);
    }

    const currentUser = JSON.parse(localStorage.getItem('user'));
    const currentUserName = currentUser ? currentUser.name : '';
    return mapBackendExpenseToFrontend(createdExpense, groupId, currentUserName);
  },

  updateExpense: async (id, expenseData) => {
    const groupId = expenseData.groupId;
    let participants = null;

    try {
      const balanceRes = await API.get(`/groups/${groupId}/balances`);
      const members = balanceRes.data;
      const currentUser = JSON.parse(localStorage.getItem('user'));
      
      const memberMap = {};
      members.forEach(m => {
        memberMap[m.username.toLowerCase()] = m.user_id;
      });
      if (currentUser) {
        memberMap['you'] = currentUser.id;
        memberMap[currentUser.name.toLowerCase()] = currentUser.id;
      }

      const groupData = await groupService.getGroupById(groupId);
      const participantNames = Object.keys(expenseData.shares || {}).length > 0 
        ? Object.keys(expenseData.shares) 
        : (groupData?.members || []);

      participants = [];
      participantNames.forEach(name => {
        if (name === 'You' && currentUser) {
          participants.push(currentUser.id);
        } else {
          const uid = memberMap[name.toLowerCase()];
          if (uid) {
            participants.push(uid);
          }
        }
      });
    } catch (err) {
      console.warn('Failed to map user IDs during update:', err);
    }

    const payload = {
      title: expenseData.title,
      amount: Number(expenseData.amount),
      description: expenseData.notes || ''
    };
    if (participants && participants.length > 0) {
      payload.participants = participants;
    }

    const response = await API.put(`/expenses/${id}`, payload);
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const currentUserName = currentUser ? currentUser.name : '';
    return mapBackendExpenseToFrontend(response.data, groupId, currentUserName);
  },

  deleteExpense: async (id) => {
    const response = await API.delete(`/expenses/${id}`);
    return response.data;
  }
};

export default expenseService;
