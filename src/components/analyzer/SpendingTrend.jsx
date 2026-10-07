import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { MdTrendingUp, MdTrendingDown } from 'react-icons/md';

const fmt = (n) =>
  `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="analyzer-tooltip">
        <p className="analyzer-tooltip-label">{label}</p>
        <p className="analyzer-tooltip-value">{fmt(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

const SkeletonChart = () => (
  <div style={{ padding: '28px' }}>
    <div className="shimmer-card" style={{ height: 20, width: '45%', borderRadius: 6, marginBottom: 8 }} />
    <div className="shimmer-card" style={{ height: 12, width: '60%', borderRadius: 6, marginBottom: 28 }} />
    <div className="shimmer-card" style={{ height: 240, borderRadius: 10 }} />
  </div>
);

const SpendingTrend = ({ data, monthlyStats, loading }) => {
  if (loading) return <div className="glass-card"><SkeletonChart /></div>;

  const { peak, lowest, average, monthlyChange } = monthlyStats || {};

  return (
    <div className="glass-card analyzer-chart-card">
      <div className="analyzer-chart-header">
        <div>
          <h3 className="analyzer-card-title">Monthly Spending Trends</h3>
          <p className="analyzer-card-subtitle">Your spending over time by month</p>
        </div>
        {monthlyChange !== undefined && monthlyChange !== null && (
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: '0.8rem', fontWeight: 700,
              color: monthlyChange >= 0 ? 'var(--error)' : 'var(--success)',
              background: monthlyChange >= 0 ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
              border: `1px solid ${monthlyChange >= 0 ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
              borderRadius: 'var(--radius-sm)',
              padding: '4px 10px',
            }}
          >
            {monthlyChange >= 0 ? <MdTrendingUp size={14} /> : <MdTrendingDown size={14} />}
            {monthlyChange >= 0 ? '+' : ''}{monthlyChange}% vs last month
          </div>
        )}
      </div>

      {(!data || data.length === 0) ? (
        <div className="analyzer-empty-chart">
          <p>No spending data available for the selected period.</p>
        </div>
      ) : (
        <>
          <div className="analyzer-chart-body">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  width={44}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(99,102,241,0.3)', strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill="url(#spendGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Stats below chart */}
          {monthlyStats && (
            <div className="monthly-trend-stats">
              <div className="monthly-stat-item">
                <span className="monthly-stat-label">Peak Month</span>
                <span className="monthly-stat-value" style={{ color: 'var(--error)' }}>
                  {peak?.month} — {fmt(peak?.amount)}
                </span>
              </div>
              <div className="monthly-stat-divider" />
              <div className="monthly-stat-item">
                <span className="monthly-stat-label">Lowest Month</span>
                <span className="monthly-stat-value" style={{ color: 'var(--success)' }}>
                  {lowest?.month} — {fmt(lowest?.amount)}
                </span>
              </div>
              <div className="monthly-stat-divider" />
              <div className="monthly-stat-item">
                <span className="monthly-stat-label">Monthly Average</span>
                <span className="monthly-stat-value">{fmt(average)}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SpendingTrend;
