import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const fmt = (n) =>
  `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="analyzer-tooltip">
        <p className="analyzer-tooltip-label">{d.name}</p>
        <p className="analyzer-tooltip-value">{fmt(d.amount)}</p>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: 2 }}>{d.percent}%</p>
      </div>
    );
  }
  return null;
};

const SkeletonBreakdown = () => (
  <div style={{ padding: '28px' }}>
    <div className="shimmer-card" style={{ height: 20, width: '55%', borderRadius: 6, marginBottom: 8 }} />
    <div className="shimmer-card" style={{ height: 12, width: '70%', borderRadius: 6, marginBottom: 24 }} />
    <div className="shimmer-card" style={{ height: 180, width: 180, borderRadius: '50%', margin: '0 auto 20px' }} />
    {[1, 2, 3, 4].map((n) => (
      <div key={n} className="shimmer-card" style={{ height: 14, borderRadius: 6, marginBottom: 10 }} />
    ))}
  </div>
);

const CategoryBreakdown = ({ data, loading }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  if (loading) return <div className="glass-card"><SkeletonBreakdown /></div>;

  const topCategory = data?.[0];
  const totalCategories = data?.length || 0;

  return (
    <div className="glass-card analyzer-chart-card">
      <div className="analyzer-chart-header">
        <div>
          <h3 className="analyzer-card-title">Spending by Category</h3>
          <p className="analyzer-card-subtitle">{totalCategories} categories · Distribution of expenses</p>
        </div>
      </div>

      {(!data || data.length === 0) ? (
        <div className="analyzer-empty-chart">
          <p>No category data available.</p>
        </div>
      ) : (
        <>
          {/* Top category highlight */}
          {topCategory && (
            <div className="category-top-highlight">
              <div className="category-top-left">
                <span className="category-top-label">Top Category</span>
                <span className="category-top-name" style={{ color: topCategory.color }}>{topCategory.name}</span>
              </div>
              <div className="category-top-right">
                <span className="category-top-amount">{fmt(topCategory.amount)}</span>
                <span className="category-top-pct">{topCategory.percent}% of spending</span>
              </div>
            </div>
          )}

          <div className="analyzer-chart-body" style={{ display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="amount"
                  onMouseEnter={(_, idx) => setActiveIndex(idx)}
                  onMouseLeave={() => setActiveIndex(null)}
                  strokeWidth={0}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
                      style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="analyzer-category-legend">
            {data.map((item, idx) => (
              <div
                key={item.name}
                className="analyzer-legend-row"
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(null)}
                style={{ opacity: activeIndex === null || activeIndex === idx ? 1 : 0.5 }}
              >
                <div className="analyzer-legend-left">
                  <span className="analyzer-legend-dot" style={{ background: item.color }} />
                  <span className="analyzer-legend-name">{item.name}</span>
                </div>
                <div className="analyzer-legend-right">
                  <span className="analyzer-legend-amount">{fmt(item.amount)}</span>
                  <span className="analyzer-legend-pct">{item.percent}%</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CategoryBreakdown;
