import { INITIAL_SETTLEMENTS } from '../utils/constants';

const getStoredSettlements = () => {
  const stored = localStorage.getItem('settlements');
  if (!stored) {
    localStorage.setItem('settlements', JSON.stringify(INITIAL_SETTLEMENTS));
    return INITIAL_SETTLEMENTS;
  }
  return JSON.parse(stored);
};

const saveSettlements = (settlements) => {
  localStorage.setItem('settlements', JSON.stringify(settlements));
};

const settlementService = {
  getSettlements: () => {
    return getStoredSettlements();
  },

  getSettlementsByGroupId: (groupId) => {
    const settlements = getStoredSettlements();
    return settlements.filter(s => s.groupId === groupId);
  },

  createSettlement: (settleData) => {
    // settleData expects { groupId, from, to, amount, method }
    const settlements = getStoredSettlements();
    const newSettlement = {
      id: `s_${Date.now()}`,
      ...settleData,
      amount: Number(settleData.amount),
      date: new Date().toISOString().split('T')[0]
    };

    const updated = [newSettlement, ...settlements];
    saveSettlements(updated);
    return newSettlement;
  }
};

export default settlementService;
