import React from 'react';
import { MdAdd, MdGroupAdd, MdPayment, MdHistory } from 'react-icons/md';

const QuickActions = ({ onAddExpense, onCreateGroup, onSettleUp, onViewHistory }) => {
  return (
    <div className="quick-actions-panel">
      <button onClick={onAddExpense} className="quick-action-btn">
        <MdAdd size={24} />
        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Add Expense</span>
      </button>
      
      <button onClick={onCreateGroup} className="quick-action-btn">
        <MdGroupAdd size={24} />
        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Create Group</span>
      </button>
      
      <button onClick={onSettleUp} className="quick-action-btn">
        <MdPayment size={24} />
        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Settle Up</span>
      </button>
      
      <button onClick={onViewHistory} className="quick-action-btn">
        <MdHistory size={24} />
        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>View History</span>
      </button>
    </div>
  );
};

export default QuickActions;
