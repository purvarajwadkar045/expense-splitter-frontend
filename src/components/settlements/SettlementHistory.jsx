import React from 'react';
import { MdCheckCircle, MdDateRange, MdPayment } from 'react-icons/md';
import { formatDate } from '../../utils/helpers';

const SettlementHistory = ({ 
  settlements = [], 
  groups = [], 
  showGroupColumn = true 
}) => {
  const getGroupName = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    return group ? group.name : 'Unknown Group';
  };

  if (settlements.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
        No repayment records found.
      </div>
    );
  }

  return (
    <div className="fintech-table-container">
      <table className="fintech-table">
        <thead>
          <tr>
            <th>Transaction</th>
            {showGroupColumn && <th>Group</th>}
            <th>Amount</th>
            <th>Method</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {settlements.map((settle) => (
            <tr key={settle.id}>
              <td>
                <div className="settle-flow-cell">
                  <div className="settle-icon-bubble">
                    <MdPayment size={18} />
                  </div>
                  <div>
                    <div className="settle-flow-text">
                      <span className="name">{settle.from}</span>
                      <span className="action">settled with</span>
                      <span className="name">{settle.to}</span>
                    </div>
                  </div>
                </div>
              </td>
              
              {showGroupColumn && (
                <td>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {getGroupName(settle.groupId)}
                  </span>
                </td>
              )}

              <td>
                <span style={{ fontWeight: 700, color: 'var(--success)' }}>
                  ₹{Number(settle.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </td>

              <td>
                <span className="chip info" style={{ fontSize: '0.7rem' }}>
                  {settle.method}
                </span>
              </td>

              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <MdDateRange size={14} />
                  <span>{formatDate(settle.date)}</span>
                </div>
              </td>

              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontSize: '0.85rem', fontWeight: 600 }}>
                  <MdCheckCircle size={16} />
                  <span>Settled</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SettlementHistory;
