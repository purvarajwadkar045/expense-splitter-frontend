import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, amount, type = 'neutral', icon: Icon, description }) => {
  // type can be 'owed' (green), 'owe' (red), 'neutral' (indigo/cyan)
  
  const formattedAmount = typeof amount === 'number' 
    ? `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
    : amount;

  return (
    <motion.div
      className={`stat-card ${type}`}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div className="stat-header">
        <span className="stat-card-title">{title}</span>
        {Icon && (
          <div className="stat-icon-box">
            <Icon size={20} />
          </div>
        )}
      </div>
      <h3 className="stat-card-amount">{formattedAmount}</h3>
      {description && <span className="stat-card-footer">{description}</span>}
      
      {/* Decorative gradient glow */}
      <div 
        style={{
          position: 'absolute',
          bottom: '-30px',
          right: '-30px',
          width: '120px',
          height: '120px',
          background: type === 'owed' 
            ? 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)'
            : type === 'owe'
            ? 'radial-gradient(circle, rgba(244, 63, 94, 0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
          borderRadius: '50%'
        }}
      />
    </motion.div>
  );
};

export default StatCard;