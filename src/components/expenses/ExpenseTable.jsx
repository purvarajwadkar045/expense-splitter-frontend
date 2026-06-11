import React from 'react';
import { MdEdit, MdDelete, MdInfoOutline, MdLock } from 'react-icons/md';
import { CATEGORIES } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';
import Button from '../ui/Button';

const ExpenseTable = ({ 
  expenses = [], 
  groups = [], 
  onEdit, 
  onDelete, 
  showGroupColumn = true 
}) => {
  const getCategoryInfo = (catId) => {
    return CATEGORIES.find(c => c.id === catId) || CATEGORIES[CATEGORIES.length - 1];
  };

  const getGroupName = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    return group ? group.name : 'Unknown Group';
  };

  if (expenses.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-dim)' }}>
        No expenses recorded yet.
      </div>
    );
  }

  return (
    <div className="fintech-table-container">
      <table className="fintech-table">
        <thead>
          <tr>
            <th>Expense</th>
            {showGroupColumn && <th>Group</th>}
            <th>Amount</th>
            <th>Paid By</th>
            <th>Split Type</th>
            <th>Date</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => {
            const cat = getCategoryInfo(expense.category);
            const CatIcon = cat.icon;
            const isPayerYou = expense.paidBy === 'You';

            return (
              <tr key={expense.id}>
                <td>
                  <div className="expense-name-cell">
                    <div 
                      className="expense-category-icon"
                      style={{ 
                        borderColor: `${cat.color}33`,
                        color: cat.color
                      }}
                    >
                      <CatIcon size={18} />
                    </div>
                    <div>
                      <h4 className="expense-title">{expense.title}</h4>
                      {expense.notes && (
                        <p className="expense-notes">
                          {expense.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                
                {showGroupColumn && (
                  <td>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {getGroupName(expense.groupId)}
                    </span>
                  </td>
                )}

                <td>
                  <span className="expense-amount">
                    ₹{Number(expense.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </td>

                <td>
                  <span 
                    className={`chip ${isPayerYou ? 'info' : 'success'}`} 
                    style={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    {expense.paidBy}
                  </span>
                </td>

                <td>
                  <span className="chip warning" style={{ fontSize: '0.7rem' }}>
                    {expense.splitType === 'equal' ? 'Equal' : 'Custom'}
                  </span>
                </td>

                <td>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {formatDate(expense.date)}
                  </span>
                </td>

                <td>
                  <div className="table-actions">
                    {isPayerYou ? (
                      <>
                        <button
                          onClick={() => onEdit(expense)}
                          className="table-action-btn edit"
                          title="Edit Expense"
                        >
                          <MdEdit size={18} />
                        </button>
                        <button
                          onClick={() => onDelete(expense.id)}
                          className="table-action-btn delete"
                          title="Delete Expense"
                        >
                          <MdDelete size={18} />
                        </button>
                      </>
                    ) : (
                      <div 
                        className="expense-locked-indicator"
                        title="Only the payer can edit or delete this expense"
                      >
                        <MdLock size={14} />
                        <span>Locked</span>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseTable;
