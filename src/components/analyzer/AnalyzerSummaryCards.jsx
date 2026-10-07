import React from 'react';
import { motion } from 'framer-motion';
import {
  MdAccountBalanceWallet,
  MdPerson,
  MdArrowUpward,
  MdArrowDownward,
  MdReceipt,
} from 'react-icons/md';

const fmt = (n) =>
  `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const CARDS = [
  {
    key: 'totalExpenses',
    title: 'Total Expenses',
    icon: MdAccountBalanceWallet,
    description: 'Across all groups',
    type: 'neutral',
    format: fmt,
  },
  {
    key: 'mySpending',
    title: 'My Spending',
    icon: MdPerson,
    description: 'Expenses paid by you',
    type: 'neutral',
    format: fmt,
  },
  {
    key: 'iOwe',
    title: 'I Owe',
    icon: MdArrowUpward,
    description: 'Pending repayments',
    type: 'owe',
    format: fmt,
  },
  {
    key: 'iAmOwed',
    title: 'I Am Owed',
    icon: MdArrowDownward,
    description: 'Pending collections',
    type: 'owed',
    format: fmt,
  },
  {
    key: 'totalTransactions',
    title: 'Transactions',
    icon: MdReceipt,
    description: 'Total expense entries',
    type: 'neutral',
    format: (n) => n,
  },
];

const glowMap = {
  owed: 'rgba(16, 185, 129, 0.14)',
  owe: 'rgba(239, 68, 68, 0.14)',
  neutral: 'rgba(99, 102, 241, 0.14)',
};

const iconBgMap = {
  owed: 'rgba(16, 185, 129, 0.1)',
  owe: 'rgba(239, 68, 68, 0.1)',
  neutral: 'rgba(99, 102, 241, 0.1)',
};

const iconColorMap = {
  owed: 'var(--success)',
  owe: 'var(--error)',
  neutral: 'var(--primary)',
};

const SkeletonCard = () => (
  <div className="stat-card neutral" style={{ minHeight: 130 }}>
    <div className="shimmer-card" style={{ height: 14, width: '60%', borderRadius: 6, marginBottom: 12 }} />
    <div className="shimmer-card" style={{ height: 28, width: '40%', borderRadius: 6, marginBottom: 8 }} />
    <div className="shimmer-card" style={{ height: 10, width: '55%', borderRadius: 6 }} />
  </div>
);

const AnalyzerSummaryCards = ({ summary, loading }) => {
  if (loading) {
    return (
      <div className="analyzer-kpi-grid">
        {CARDS.map((c) => <SkeletonCard key={c.key} />)}
      </div>
    );
  }

  return (
    <div className="analyzer-kpi-grid">
      {CARDS.map((card, i) => {
        const Icon = card.icon;
        const rawVal = summary?.[card.key] ?? 0;
        const displayVal = card.format(rawVal);

        return (
          <motion.div
            key={card.key}
            className={`stat-card ${card.type}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            whileHover={{ y: -3 }}
          >
            <div className="stat-header">
              <span className="stat-card-title">{card.title}</span>
              <div
                className="stat-icon-box"
                style={{
                  background: iconBgMap[card.type],
                  color: iconColorMap[card.type],
                }}
              >
                <Icon size={20} />
              </div>
            </div>
            <h3 className="stat-card-amount">{displayVal}</h3>
            <span className="stat-card-footer">{card.description}</span>

            {/* Decorative glow */}
            <div
              style={{
                position: 'absolute',
                bottom: -30,
                right: -30,
                width: 110,
                height: 110,
                background: `radial-gradient(circle, ${glowMap[card.type]} 0%, transparent 70%)`,
                borderRadius: '50%',
                pointerEvents: 'none',
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

export default AnalyzerSummaryCards;
