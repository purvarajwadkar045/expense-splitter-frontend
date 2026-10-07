import React from 'react';

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const HeatmapSkeleton = () => (
  <div style={{ padding: '28px 0' }}>
    <div className="shimmer-card" style={{ height: 20, width: '42%', borderRadius: 6, marginBottom: 8 }} />
    <div className="shimmer-card" style={{ height: 12, width: '62%', borderRadius: 6, marginBottom: 24 }} />
    <div className="shimmer-card" style={{ height: 190, borderRadius: 10 }} />
  </div>
);

const ExpenseHeatmap = ({ data, loading }) => {
  if (loading) return <div className="glass-card analyzer-chart-card"><HeatmapSkeleton /></div>;

  const cells = data?.data || [];
  const maxAmount = Math.max(...cells.map((cell) => cell.amount), 0);
  const cellMap = new Map(cells.map((cell) => [`${cell.day}-${cell.period}`, cell]));
  const hasActivity = cells.some((cell) => cell.amount > 0);

  return (
    <div className="glass-card analyzer-chart-card expense-heatmap-card">
      <div className="analyzer-chart-header">
        <div>
          <h3 className="analyzer-card-title">Spending Activity Heatmap</h3>
          <p className="analyzer-card-subtitle">Spending intensity by day and time of day</p>
        </div>
      </div>

      {!hasActivity ? (
        <div className="analyzer-empty-chart">
          <p>No spending activity available for the selected period.</p>
        </div>
      ) : (
        <>
          <div className="expense-heatmap-scroll">
            <div className="expense-heatmap-grid">
              <div className="expense-heatmap-corner" />
              {data.days.map((day) => <div className="expense-heatmap-day" key={day}>{day.slice(0, 3)}</div>)}
              {data.periods.map((period) => (
                <React.Fragment key={period}>
                  <div className="expense-heatmap-period">{period}</div>
                  {data.days.map((day) => {
                    const cell = cellMap.get(`${day}-${period}`) || { amount: 0, count: 0 };
                    const intensity = maxAmount ? cell.amount / maxAmount : 0;
                    return (
                      <div
                        className="expense-heatmap-cell"
                        key={`${day}-${period}`}
                        title={`${day}, ${period}: ${fmt(cell.amount)} · ${cell.count} expense${cell.count === 1 ? '' : 's'}`}
                        style={{ '--heat-intensity': intensity }}
                      >
                        <span>{cell.amount > 0 ? fmt(cell.amount) : '—'}</span>
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="expense-heatmap-legend">
            <span>Low spending</span>
            <div className="expense-heatmap-gradient" />
            <span>High spending</span>
          </div>

          <div className="expense-heatmap-summary">
            <div><span>Highest Spending Day</span><strong>{data.highest_day?.day || '—'}</strong></div>
            <div><span>Highest Spending Period</span><strong>{data.highest_time_period?.period || '—'}</strong></div>
            <div><span>Highest Spending Slot</span><strong>{data.highest_period ? `${data.highest_period.day} ${data.highest_period.period} · ${fmt(data.highest_period.amount)}` : '—'}</strong></div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExpenseHeatmap;