import React from 'react';
import { MdArrowUpward } from 'react-icons/md';

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const CATEGORY_BADGE = {
  Food:          { bg: 'rgba(99,102,241,0.12)',  color: '#818cf8' },
  Travel:        { bg: 'rgba(168,85,247,0.12)',  color: '#c084fc' },
  Shopping:      { bg: 'rgba(6,182,212,0.12)',   color: '#22d3ee' },
  Bills:         { bg: 'rgba(16,185,129,0.12)',  color: '#34d399' },
  Entertainment: { bg: 'rgba(245,158,11,0.12)',  color: '#fbbf24' },
  Other:         { bg: 'rgba(100,116,139,0.12)', color: '#94a3b8' },
};

const TopExpenses = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="glass-card analyzer-chart-card">
        <div style={{ padding: '4px 0' }}>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: 12 }}>Loading top expenses...</p>
          <div className="shimmer-card" style={{ height: 20, width: '40%', borderRadius: 6, marginBottom: 20 }} />
          {[1,2,3,4,5].map((n) => (
            <div key={n} className="shimmer-card" style={{ height: 44, borderRadius: 8, marginBottom: 10 }} />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="glass-card analyzer-chart-card">
        <div className="analyzer-empty-chart"><p>No expenses found for the selected period.</p></div>
      </div>
    );
  }

  return (
    <div className="glass-card analyzer-chart-card">
      <div className="analyzer-chart-header">
        <div>
          <h3 className="analyzer-card-title">Top Expenses</h3>
          <p className="analyzer-card-subtitle">Highest individual transactions</p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem',
          color: 'var(--text-dim)', background: 'rgba(239,68,68,0.06)',
          border: '1px solid rgba(239,68,68,0.12)', borderRadius: 'var(--radius-sm)',
          padding: '4px 10px'
        }}>
          <MdArrowUpward size={12} style={{ color: 'var(--error)' }} />
          By Amount
        </div>
      </div>

      <div className="top-expenses-list">
        {data.map((expense, idx) => {
          const badge = CATEGORY_BADGE[expense.category] || CATEGORY_BADGE.Other;
          return (
            <div key={expense.id} className="top-expense-row">
              <div className="top-expense-rank">{idx + 1}</div>
              <div className="top-expense-info">
                <span className="top-expense-name">{expense.expense}</span>
                <span className="top-expense-meta">
                  {expense.group} · {expense.paidBy} ·{' '}
                  <span style={{ background: badge.bg, color: badge.color, padding: '1px 6px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700 }}>
                    {expense.category}
                  </span>
                </span>
              </div>
              <div className="top-expense-right">
                <span className="top-expense-amount">{fmt(expense.amount)}</span>
                <span className="top-expense-date">{expense.date}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopExpenses;
