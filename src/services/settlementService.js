import API from './api';

const settlementService = {
  getSettlements: async () => {
    const response = await API.get('/settlements');
    return response.data; // expects array of Settlement
  },

  getSettlementsByGroupId: async (groupId) => {
    const response = await API.get(`/groups/${groupId}/settlements`);
    return response.data; // expects array of Settlement in the group
  },

  createSettlement: async (settleData) => {
    const response = await API.post('/settlements', settleData);
    return response.data; // expects new Settlement object
  }
};

export default settlementService;
