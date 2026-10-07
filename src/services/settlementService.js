import API from './api';
import groupService from './groupService';

const mapBackendSettlementToFrontend = (settlement, groupId, membersList, currentUserName, groupName = '') => {
  const memberMap = {};
  membersList.forEach(m => {
    memberMap[m.user_id] = m.username;
  });
  
  const fromUser = memberMap[settlement.payer_id] || 'Unknown';
  const toUser = memberMap[settlement.receiver_id] || 'Unknown';

  return {
    id: settlement.id,
    groupId: String(groupId || settlement.group_id),
    groupName: groupName,
    from: fromUser === currentUserName ? 'You' : fromUser,
    to: toUser === currentUserName ? 'You' : toUser,
    amount: Number(settlement.amount),
    date: settlement.settled_at ? new Date(settlement.settled_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    method: 'Transfer'
  };
};

const settlementService = {
  getSettlements: async () => {
    const groups = await groupService.getGroups();
    if (!Array.isArray(groups) || groups.length === 0) return [];

    const currentUser = JSON.parse(localStorage.getItem('user'));
    const currentUserName = currentUser ? currentUser.name : '';
    const settlementsByGroup = await Promise.all(groups.map(async (group) => {
      const balanceResponse = await API.get(`/groups/${group.id}/balances`);
      const response = await API.get(`/groups/${group.id}/settlements`);
      return response.data.map(settlement => mapBackendSettlementToFrontend(
        settlement,
        group.id,
        balanceResponse.data,
        currentUserName,
        group.name,
      ));
    }));
    return settlementsByGroup.flat().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  getSettlementsByGroupId: async (groupId) => {
    const balanceRes = await API.get(`/groups/${groupId}/balances`);
    const response = await API.get(`/groups/${groupId}/settlements`);
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const currentUserName = currentUser ? currentUser.name : '';
    let groupName = '';
    try {
      const g = await groupService.getGroupById(groupId);
      groupName = g ? g.name : '';
    } catch (err) {
      console.warn(`Failed to fetch group details for group ${groupId}:`, err);
    }

    return response.data.map(s => 
      mapBackendSettlementToFrontend(s, groupId, balanceRes.data, currentUserName, groupName)
    );
  },

  createSettlement: async (settleData) => {
    const { groupId, from, to, amount } = settleData;

    // 1. Fetch balances to map from/to names to database user IDs
    const balanceRes = await API.get(`/groups/${groupId}/balances`);
    const members = balanceRes.data;
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const currentUserName = currentUser ? currentUser.name : '';

    const memberMap = {};
    members.forEach(m => {
      memberMap[String(m.user_id)] = m.user_id;
      memberMap[m.username.toLowerCase()] = m.user_id;
    });
    if (currentUser) {
      memberMap[String(currentUser.id)] = currentUser.id;
      memberMap['you'] = currentUser.id;
      memberMap[currentUser.name.toLowerCase()] = currentUser.id;
    }

    const payerId = from === 'You' ? currentUser.id : memberMap[from.toLowerCase()];
    const receiverId = to === 'You' ? currentUser.id : memberMap[to.toLowerCase()];

    if (!payerId || !receiverId) {
      throw new Error(`Failed to map payer (${from}) or receiver (${to}) to database user IDs.`);
    }

    // 2. Post settlement to backend
    const response = await API.post(`/groups/${groupId}/settlements`, {
      payer_id: payerId,
      receiver_id: receiverId,
      amount: Number(amount)
    });

    return mapBackendSettlementToFrontend(response.data, groupId, members, currentUserName);
  }
};

export default settlementService;
