import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

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

const SkeletonBars = () => (
  <div style={{ padding: '28px' }}>
    <div className="shimmer-card" style={{ height: 20, width: '50%', borderRadius: 6, marginBottom: 8 }} />
    <div className="shimmer-card" style={{ height: 12, width: '65%', borderRadius: 6, marginBottom: 28 }} />
    <div className="shimmer-card" style={{ height: 200, borderRadius: 10 }} />
  </div>
);

const BAR_COLORS = ['#6366f1', '#a855f7', '#06b6d4', '#10b981'];

const GroupSpending = ({ data, groupDetails, selectedGroup, loading }) => {
  if (loading) return <div className="glass-card"><SkeletonBars /></div>;

  // When a specific group is selected, show group analytics summary instead of chart
  const showGroupDetail = selectedGroup && selectedGroup !== 'all';
  const groupName = showGroupDetail
    ? Object.keys(groupDetails || {}).find((name) => (
      name.toLowerCase().replace(/\s/g, '-') === selectedGroup
    ))
    : null;
  const groupInfo = groupName ? groupDetails?.[groupName] : null;
  const hasGroupSpending = groupInfo?.expenseCount > 0;

  return (
    <div className="glass-card analyzer-chart-card">
      <div className="analyzer-chart-header">
        <div>
          <h3 className="analyzer-card-title">Spending by Group</h3>
          <p className="analyzer-card-subtitle">
            {showGroupDetail && groupName ? `${groupName} — detailed view` : 'Total expenses per group'}
          </p>
        </div>
      </div>

      {/* Group detail view */}
      {showGroupDetail && hasGroupSpending ? (
        <div className="group-detail-grid">
          <div className="group-detail-stat">
            <span className="group-detail-label">Total Expenses</span>
            <span className="group-detail-value">{fmt(groupInfo.totalExpenses)}</span>
          </div>
          <div className="group-detail-stat">
            <span className="group-detail-label">Members</span>
            <span className="group-detail-value">{groupInfo.members}</span>
          </div>
          <div className="group-detail-stat">
            <span className="group-detail-label">Avg. Expense</span>
            <span className="group-detail-value">{fmt(groupInfo.averageExpense)}</span>
          </div>
          <div className="group-detail-stat" style={{ gridColumn: '1 / -1' }}>
            <span className="group-detail-label">Highest Expense</span>
            <span className="group-detail-value" style={{ color: 'var(--error)' }}>
              {groupInfo.highestExpense} — {fmt(groupInfo.highestAmount)}
            </span>
          </div>
        </div>
      ) : null}

      {/* Always show bar chart */}
      {(!data || data.length === 0) ? (
        <div className="analyzer-empty-chart"><p>No group spending data available.</p></div>
      ) : (
        <div className="analyzer-chart-body" style={{ marginTop: showGroupDetail && hasGroupSpending ? 16 : 0 }}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="group"
                tick={{ fill: '#64748b', fontSize: 10 }}
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
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default GroupSpending;
