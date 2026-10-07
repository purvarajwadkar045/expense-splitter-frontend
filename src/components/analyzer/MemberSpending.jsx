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
import MemberSummaryTable from './MemberSummaryTable';

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

const MEMBER_COLORS = ['#6366f1', '#a855f7', '#06b6d4', '#10b981'];

const MemberSpending = ({ data, memberDetails, memberHighlights, loading }) => {
  if (loading) return <div className="glass-card"><SkeletonBars /></div>;

  return (
    <div className="glass-card analyzer-chart-card">
      <div className="analyzer-chart-header">
        <div>
          <h3 className="analyzer-card-title">Who Paid the Most?</h3>
          <p className="analyzer-card-subtitle">Member-wise expense contributions</p>
        </div>
      </div>

      {(!data || data.length === 0) ? (
        <div className="analyzer-empty-chart">
          <p>No member payment data available.</p>
        </div>
      ) : (
        <>
          <div className="analyzer-chart-body">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 5, right: 24, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  width={50}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="amount" radius={[0, 6, 6, 0]} barSize={20}>
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={MEMBER_COLORS[index % MEMBER_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Member Summary Table below chart */}
          <MemberSummaryTable
            memberDetails={memberDetails}
            memberHighlights={memberHighlights}
            loading={loading}
          />
        </>
      )}
    </div>
  );
};

export default MemberSpending;
