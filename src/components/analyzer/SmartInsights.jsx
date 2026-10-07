import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MdTrendingUp,
  MdTrendingDown,
  MdPieChart,
  MdPerson,
  MdBarChart,
} from 'react-icons/md';

const ICON_MAP = {
  'trending-up':   MdTrendingUp,
  'trending-down': MdTrendingDown,
  'pie-chart':     MdPieChart,
  'user-check':    MdPerson,
  'bar-chart-2':   MdBarChart,
};

const SkeletonInsight = () => (
  <div className="analyzer-insight-card">
    <div className="shimmer-card" style={{ height: 36, width: 36, borderRadius: 8, marginBottom: 14 }} />
    <div className="shimmer-card" style={{ height: 11, width: '55%', borderRadius: 6, marginBottom: 8 }} />
    <div className="shimmer-card" style={{ height: 18, width: '75%', borderRadius: 6, marginBottom: 6 }} />
    <div className="shimmer-card" style={{ height: 11, width: '60%', borderRadius: 6 }} />
  </div>
);

const SmartInsights = ({ insights, loading }) => {
  const [showAll, setShowAll] = useState(false);

  if (loading) {
    return (
      <div className="analyzer-insights-grid">
        {[1, 2, 3, 4].map((n) => <SkeletonInsight key={n} />)}
      </div>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
        No insights available for the selected filters.
      </p>
    );
  }

  const displayed = showAll ? insights : insights.slice(0, 4);

  return (
    <>
      <div className="analyzer-insights-grid">
        {displayed.map((insight, i) => {
          const Icon = ICON_MAP[insight.icon] || MdBarChart;
          return (
            <motion.div
              key={insight.id}
              className="analyzer-insight-card"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              whileHover={{ y: -3 }}
            >
              <div
                className="analyzer-insight-icon"
                style={{ background: insight.glow, color: insight.color }}
              >
                <Icon size={20} />
              </div>
              <p className="analyzer-insight-label">{insight.label}</p>
              <p className="analyzer-insight-title">{insight.title}</p>
              <p className="analyzer-insight-value" style={{ color: insight.color }}>
                {insight.value}
              </p>
              <p className="analyzer-insight-sub">{insight.sub}</p>
            </motion.div>
          );
        })}
      </div>
      {insights.length > 4 && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button
            className="btn-ghost btn-sm"
            onClick={() => setShowAll(!showAll)}
            id="insights-toggle-btn"
            style={{ fontSize: '0.82rem', color: 'var(--primary)' }}
          >
            {showAll ? 'Show less' : `Show ${insights.length - 4} more insights`}
          </button>
        </div>
      )}
    </>
  );
};

export default SmartInsights;
