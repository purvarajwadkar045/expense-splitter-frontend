import React from 'react';
import { motion } from 'framer-motion';
import {
  MdShowChart,
  MdArrowUpward,
  MdArrowDownward,
  MdPayment,
  MdAccountBalance,
} from 'react-icons/md';

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const SECONDARY_CARDS = [
  {
    key: 'averageExpense',
    label: 'Avg. Expense',
    icon: MdShowChart,
    color: 'var(--accent)',
    format: fmt,
  },
  {
    key: 'highestExpense',
    label: 'Highest',
    subKey: 'highestExpenseName',
    icon: MdArrowUpward,
    color: 'var(--error)',
    format: fmt,
  },
  {
    key: 'lowestExpense',
    label: 'Lowest',
    subKey: 'lowestExpenseName',
    icon: MdArrowDownward,
    color: 'var(--success)',
    format: fmt,
  },
  {
    key: 'totalSettlements',
    label: 'Settled',
    icon: MdPayment,
    color: 'var(--primary)',
    format: fmt,
  },
  {
    key: 'pendingBalance',
    label: 'Pending',
    icon: MdAccountBalance,
    color: 'var(--warning)',
    format: fmt,
  },
];

const SecondaryStats = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="secondary-stats-grid">
        {SECONDARY_CARDS.map((c) => (
          <div key={c.key} className="secondary-stat-card">
            <div className="shimmer-card" style={{ height: 10, width: '60%', borderRadius: 4, marginBottom: 8 }} />
            <div className="shimmer-card" style={{ height: 18, width: '50%', borderRadius: 4 }} />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return <p className="analyzer-card-subtitle">No spending data available.</p>;
  }

  return (
    <div className="secondary-stats-grid">
      {SECONDARY_CARDS.map((card, i) => {
        const Icon = card.icon;
        const value = stats[card.key] ?? 0;
        const sub = card.subKey ? stats[card.subKey] : null;
        return (
          <motion.div
            key={card.key}
            className="secondary-stat-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
            whileHover={{ y: -2 }}
          >
            <div className="secondary-stat-header">
              <span className="secondary-stat-label">{card.label}</span>
              <div className="secondary-stat-icon" style={{ color: card.color }}>
                <Icon size={14} />
              </div>
            </div>
            <p className="secondary-stat-value" style={{ color: card.color }}>
              {card.format(value)}
            </p>
            {sub && <p className="secondary-stat-sub">{sub}</p>}
          </motion.div>
        );
      })}
    </div>
  );
};

export default SecondaryStats;
