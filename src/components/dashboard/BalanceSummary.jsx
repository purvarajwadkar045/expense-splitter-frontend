import React from 'react';
import { MdTrendingUp, MdTrendingDown, MdCheckCircle } from 'react-icons/md';

const BalanceSummary = ({ debts = [] }) => {
  // debts is array of { from, to, amount } where 'You' is involved
  const youOwe = debts.filter(d => d.from === 'You');
  const owesYou = debts.filter(d => d.to === 'You');

  const isEmpty = youOwe.length === 0 && owesYou.length === 0;

  return (
    <div className="balance-summary-container">
      {isEmpty ? (
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-dim)' }}>
          <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: 0, fontWeight: 600 }}>
            <MdCheckCircle size={20} color="var(--success)" />
            All settled up!
          </p>
        </div>
      ) : (
        <div className="balance-summary-list">
          {/* Receivables (Owes You) */}
          {owesYou.map((d, i) => (
            <div key={`rec-${i}`} className="balance-item">
              <div className="balance-user-info">
                <div className="balance-avatar">
                  {d.from.charAt(0).toUpperCase()}
                </div>
                <div className="balance-user-details">
                  <h4>{d.from}</h4>
                  <p>owes you money</p>
                </div>
              </div>
              <div className="balance-amount owed">
                +₹{d.amount.toLocaleString()}
              </div>
            </div>
          ))}

          {/* Payables (You Owe) */}
          {youOwe.map((d, i) => (
            <div key={`pay-${i}`} className="balance-item">
              <div className="balance-user-info">
                <div className="balance-avatar">
                  {d.to.charAt(0).toUpperCase()}
                </div>
                <div className="balance-user-details">
                  <h4>{d.to}</h4>
                  <p>you owe them money</p>
                </div>
              </div>
              <div className="balance-amount owe">
                -₹{d.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BalanceSummary;
