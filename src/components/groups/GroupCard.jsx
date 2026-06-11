import React from 'react';
import { motion } from 'framer-motion';
import { MdPeople, MdDelete, MdEdit } from 'react-icons/md';

const GroupCard = ({ group, userBalance = 0, onClick, onEdit, onDelete }) => {
  const getBalanceClass = () => {
    if (userBalance > 0.5) return 'owed';
    if (userBalance < -0.5) return 'owe';
    return 'settled';
  };

  const getBalanceText = () => {
    if (userBalance > 0.5) {
      return (
        <>
          You are owed <span>₹{userBalance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
        </>
      );
    }
    if (userBalance < -0.5) {
      return (
        <>
          You owe <span>₹{Math.abs(userBalance).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
        </>
      );
    }
    return <span>All settled up</span>;
  };

  return (
    <motion.div
      className="glass-card group-card"
      whileHover={{ y: -4 }}
      onClick={onClick}
    >
      <div className="group-card-header">
        <h3 className="group-card-title">{group.name}</h3>
        <span className="group-member-count">
          <MdPeople size={14} />
          {group.members ? group.members.length : 0} members
        </span>
      </div>

      <p className="group-card-desc">{group.description || 'No description provided.'}</p>

      <div className="group-card-footer">
        <div className="group-footer-col">
          <span className="group-footer-label">Group Balance</span>
          <p className={`group-card-balance ${getBalanceClass()}`}>{getBalanceText()}</p>
        </div>
        <div className="group-footer-col right">
          <span className="group-footer-label">Total Spent</span>
          <p className="group-total-spent-amount">
            ₹{group.totalExpenses ? group.totalExpenses.toLocaleString('en-IN') : 0}
          </p>
        </div>
      </div>

      {/* Floating management triggers */}
      <div className="group-card-actions">
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(group);
            }}
            className="group-action-icon-btn"
            title="Edit Group"
          >
            <MdEdit size={16} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(group.id);
            }}
            className="group-action-icon-btn delete"
            title="Delete Group"
          >
            <MdDelete size={16} />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default GroupCard;
