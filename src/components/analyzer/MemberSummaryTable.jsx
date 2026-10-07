import React from 'react';

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const MemberSummaryTable = ({ memberDetails, memberHighlights, loading }) => {
  if (loading) {
    return (
      <div style={{ marginTop: 20 }}>
        {[1,2,3,4].map((n) => (
          <div key={n} className="shimmer-card" style={{ height: 52, borderRadius: 8, marginBottom: 10 }} />
        ))}
      </div>
    );
  }

  if (!memberDetails || memberDetails.length === 0) return null;

  // Computed helpers
  const topPayer = memberHighlights?.highestPayer || [...memberDetails].sort((a, b) => b.paid - a.paid)[0];
  const topDebtor = memberHighlights?.highestDebtor || [...memberDetails].sort((a, b) => b.owes - a.owes)[0];
  const mostActive = memberHighlights?.mostActive || topPayer;

  return (
    <div style={{ marginTop: 20 }}>
      {/* Highlight bar */}
      <div className="member-highlights-row">
        <div className="member-highlight-chip">
          <span className="member-highlight-label">Most Active</span>
          <span className="member-highlight-value">{mostActive.name}</span>
        </div>
        <div className="member-highlight-chip">
          <span className="member-highlight-label">Highest Payer</span>
          <span className="member-highlight-value" style={{ color: 'var(--success)' }}>{topPayer?.name}</span>
        </div>
        <div className="member-highlight-chip">
          <span className="member-highlight-label">Highest Debtor</span>
          <span className="member-highlight-value" style={{ color: 'var(--error)' }}>{topDebtor?.name}</span>
        </div>
      </div>

      {/* Member rows */}
      <div className="member-summary-list">
          {memberDetails.map((member) => {
          const net = member.net;
          const isPositive = net >= 0;
          return (
            <div key={member.userId || member.name} className="member-summary-row">
              <div className="member-summary-avatar" style={{ background: member.color }}>
                {member.avatar}
              </div>
              <div className="member-summary-info">
                <span className="member-summary-name">{member.name}</span>
                <div className="member-summary-stats">
                  <span>Paid <strong style={{ color: 'var(--text-pure)' }}>{fmt(member.paid)}</strong></span>
                  <span style={{ color: 'var(--text-dim)' }}>·</span>
                  <span>Owes <strong style={{ color: 'var(--error)' }}>{fmt(member.owes)}</strong></span>
                </div>
              </div>
              <div className="member-summary-net" style={{ color: isPositive ? 'var(--success)' : 'var(--error)' }}>
                <span className="member-net-label">Net</span>
                <span className="member-net-value">
                  {isPositive ? '+' : ''}{fmt(Math.abs(net))}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MemberSummaryTable;
