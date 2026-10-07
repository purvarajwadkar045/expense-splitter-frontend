import React from 'react';

const fmt = (n) =>
  `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const SpendingComparison = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="glass-card analyzer-chart-card">
        <div style={{ padding: '28px' }}>
          <div className="shimmer-card" style={{ height: 20, width: '55%', borderRadius: 6, marginBottom: 8 }} />
          <div className="shimmer-card" style={{ height: 12, width: '70%', borderRadius: 6, marginBottom: 28 }} />
          <div className="shimmer-card" style={{ height: 80, borderRadius: 10 }} />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="glass-card analyzer-chart-card">
        <div className="analyzer-chart-header">
          <div>
            <h3 className="analyzer-card-title">Your Spending vs Group Average</h3>
            <p className="analyzer-card-subtitle">No spending comparison available.</p>
          </div>
        </div>
      </div>
    );
  }

  const { mySpending, groupAverage, percentageDiff } = data;
  const isAbove = percentageDiff > 0;
  const maxVal = Math.max(mySpending, groupAverage);
  const myPct = (mySpending / maxVal) * 100;
  const avgPct = (groupAverage / maxVal) * 100;

  return (
    <div className="glass-card analyzer-chart-card">
      <div className="analyzer-chart-header">
        <div>
          <h3 className="analyzer-card-title">Your Spending vs Group Average</h3>
          <p className="analyzer-card-subtitle">Average amount paid per member in your groups</p>
        </div>
      </div>

      <div className="analyzer-comparison-body">
        {/* My Spending row */}
        <div className="analyzer-compare-row">
          <div className="analyzer-compare-label">
            <span className="analyzer-compare-name">My Spending</span>
            <span className="analyzer-compare-amount" style={{ color: isAbove ? 'var(--error)' : 'var(--success)' }}>
              {fmt(mySpending)}
            </span>
          </div>
          <div className="analyzer-progress-track">
            <div
              className="analyzer-progress-fill"
              style={{
                width: `${myPct}%`,
                background: isAbove ? 'var(--error)' : 'var(--primary)',
              }}
            />
          </div>
        </div>

        {/* Group Average row */}
        <div className="analyzer-compare-row">
          <div className="analyzer-compare-label">
            <span className="analyzer-compare-name">Group Average</span>
            <span className="analyzer-compare-amount" style={{ color: 'var(--text-muted)' }}>
              {fmt(groupAverage)}
            </span>
          </div>
          <div className="analyzer-progress-track">
            <div
              className="analyzer-progress-fill"
              style={{
                width: `${avgPct}%`,
                background: 'rgba(100, 116, 139, 0.5)',
              }}
            />
          </div>
        </div>

        {/* Summary sentence */}
        <div
          className="analyzer-compare-summary"
          style={{
            background: isAbove ? 'rgba(239, 68, 68, 0.06)' : 'rgba(16, 185, 129, 0.06)',
            borderColor: isAbove ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            color: isAbove ? 'var(--error)' : 'var(--success)',
          }}
        >
          {isAbove
            ? `⚠ You are spending ${Math.abs(percentageDiff)}% more than the group average.`
            : `✓ You are spending ${Math.abs(percentageDiff)}% less than the group average.`}
        </div>
      </div>
    </div>
  );
};

export default SpendingComparison;
