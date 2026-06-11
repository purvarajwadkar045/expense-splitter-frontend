import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdArrowBack, MdAdd, MdPayment, MdSettings, MdDelete, MdInfoOutline, MdPeople } from 'react-icons/md';

import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import StatCard from '../components/ui/StatCard';

// Subcomponents
import ExpenseTable from '../components/expenses/ExpenseTable';
import ExpenseForm from '../components/expenses/ExpenseForm';
import GroupForm from '../components/groups/GroupForm';
import SettlementForm from '../components/settlements/SettlementForm';
import SettlementHistory from '../components/settlements/SettlementHistory';

// Services & Helpers
import groupService from '../services/groupService';
import expenseService from '../services/expenseService';
import settlementService from '../services/settlementService';
import { calculateSimplifiedDebts } from '../utils/helpers';
import useToast from '../hooks/useToast';

import '../styles/groups.css';
import '../styles/dashboard.css';

const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [debts, setDebts] = useState({ netBalances: {}, simplifiedPayments: [] });

  // Tab state: 'expenses' | 'settlements' | 'members'
  const [activeTab, setActiveTab] = useState('expenses');

  // Modals state
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isSettleOpen, setIsSettleOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // Load all details
  const loadGroupDetails = () => {
    const g = groupService.getGroupById(id);
    if (!g) {
      toast.error('Group not found');
      navigate('/groups');
      return;
    }
    setGroup(g);

    const groupExpenses = expenseService.getExpensesByGroupId(id);
    const groupSettlements = settlementService.getSettlementsByGroupId(id);

    setExpenses(groupExpenses);
    setSettlements(groupSettlements);

    const calculatedDebts = calculateSimplifiedDebts(g.members, groupExpenses, groupSettlements);
    setDebts(calculatedDebts);
  };

  useEffect(() => {
    loadGroupDetails();
  }, [id]);

  if (!group) return null;

  // Actions
  const handleEditGroupSettings = (groupData) => {
    groupService.updateGroup(id, groupData);
    toast.success('Group settings updated');
    setIsSettingsOpen(false);
    loadGroupDetails();
  };

  const handleDeleteGroup = () => {
    if (window.confirm('Are you sure you want to delete this group? All expenses and settlements log will be purged.')) {
      groupService.deleteGroup(id);
      
      // Purge matching expenses/settlements
      const allExpenses = expenseService.getExpenses();
      const allSettlements = settlementService.getSettlements();
      localStorage.setItem('expenses', JSON.stringify(allExpenses.filter(e => e.groupId !== id)));
      localStorage.setItem('settlements', JSON.stringify(allSettlements.filter(s => s.groupId !== id)));
      
      toast.success('Group deleted successfully');
      navigate('/groups');
    }
  };

  const handleAddExpense = (expenseData) => {
    if (editingExpense) {
      expenseService.updateExpense(editingExpense.id, expenseData);
      toast.success('Expense updated');
    } else {
      expenseService.createExpense(expenseData);
      toast.success('Expense added');
    }
    setIsExpenseOpen(false);
    setEditingExpense(null);
    loadGroupDetails();
  };

  const handleDeleteExpense = (expId) => {
    if (window.confirm('Delete this expense entry?')) {
      expenseService.deleteExpense(expId);
      toast.success('Expense deleted');
      loadGroupDetails();
    }
  };

  const handleRecordSettlement = (settleData) => {
    settlementService.createSettlement({
      groupId: id,
      ...settleData
    });
    toast.success('Repayment settled!');
    setIsSettleOpen(false);
    loadGroupDetails();
  };

  const myBalance = debts.netBalances['You'] || 0;
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="page-container group-details-wrapper">
      {/* Back & Actions Header */}
      <div className="details-actions-bar">
        <button onClick={() => navigate('/groups')} className="btn-secondary">
          <MdArrowBack size={18} />
          <span>Back to Groups</span>
        </button>

        <div className="details-right-actions">
          <button onClick={() => setIsSettingsOpen(true)} className="btn-secondary" title="Group Settings">
            <MdSettings size={18} />
          </button>
          <button onClick={handleDeleteGroup} className="btn-secondary text-danger" title="Delete Group">
            <MdDelete size={18} />
          </button>
        </div>
      </div>

      {/* Group Header Card */}
      <section className="glass-card group-detail-card">
        <div className="group-detail-card-content">
          <div className="group-detail-info">
            <h1>{group.name}</h1>
            <p>{group.description || 'No description provided.'}</p>
          </div>
          <div className="group-detail-buttons">
            <Button onClick={() => { setEditingExpense(null); setIsExpenseOpen(true); }} variant="primary" icon={MdAdd}>
              Add Expense
            </Button>
            <Button onClick={() => setIsSettleOpen(true)} variant="accent" icon={MdPayment}>
              Settle Up
            </Button>
          </div>
        </div>
      </section>

      {/* Group Stats Grid */}
      <section className="stats-grid">
        <StatCard 
          title="Group Total Spending" 
          amount={totalSpent} 
          type="neutral" 
          icon={MdPeople}
          description="Total spent across members"
        />
        <StatCard 
          title="Your Individual Balance" 
          amount={Math.abs(myBalance)} 
          type={myBalance > 0.5 ? 'owed' : myBalance < -0.5 ? 'owe' : 'neutral'} 
          icon={MdPayment}
          description={
            myBalance > 0.5 
              ? 'You are owed in this group' 
              : myBalance < -0.5 
              ? 'You owe money in this group' 
              : 'All settled up here!'
          }
        />
      </section>

      {/* Split Details Section */}
      <div className="group-details-main">
        {/* Left Hand Tabs Content */}
        <div className="glass-card details-card-padding">
          {/* Tabs header */}
          <div className="tabs-header">
            <button 
              onClick={() => setActiveTab('expenses')}
              className={`tab-btn ${activeTab === 'expenses' ? 'active' : ''}`}
            >
              Expenses ({expenses.length})
            </button>
            <button 
              onClick={() => setActiveTab('settlements')}
              className={`tab-btn ${activeTab === 'settlements' ? 'active' : ''}`}
            >
              Settlements ({settlements.length})
            </button>
          </div>

          {/* Tab contents */}
          {activeTab === 'expenses' ? (
            expenses.length === 0 ? (
              <EmptyState 
                title="No Group Expenses"
                description="Split bills for dinners, cabs, trips, or accommodation here."
                actionText="Add Expense"
                onAction={() => { setEditingExpense(null); setIsExpenseOpen(true); }}
                actionIcon={MdAdd}
              />
            ) : (
              <ExpenseTable 
                expenses={expenses}
                groups={[group]}
                onEdit={openEditModal}
                onDelete={handleDeleteExpense}
                showGroupColumn={false}
              />
            )
          ) : (
            settlements.length === 0 ? (
              <EmptyState 
                title="No Settlements Recorded"
                description="Record repayment settlements when people transfer money to clear group debts."
                actionText="Settle Up"
                onAction={() => setIsSettleOpen(true)}
                actionIcon={MdPayment}
              />
            ) : (
              <SettlementHistory 
                settlements={settlements}
                groups={[group]}
                showGroupColumn={false}
              />
            )
          )}
        </div>

        {/* Right Hand Sidebar (Balances & Debt Simplification) */}
        <div className="group-details-sidebar">
          {/* Member Balance Standings */}
          <div className="glass-card details-card-padding">
            <h3 className="sidebar-section-title">Balances Standing</h3>
            <div className="standings-list">
              {group.members.map((member) => {
                const bal = debts.netBalances[member] || 0;
                return (
                  <div key={member} className="standing-row-item">
                    <div className="standing-user-details">
                      <div className="standing-avatar">
                        {member.charAt(0).toUpperCase()}
                      </div>
                      <span className="standing-username">{member}</span>
                    </div>
                    <span 
                      className={`standing-amount-label ${bal > 0.5 ? 'owed' : bal < -0.5 ? 'owe' : 'settled'}`}
                    >
                      {bal > 0.5 
                        ? `+₹${bal.toFixed(1)}` 
                        : bal < -0.5 
                        ? `-₹${Math.abs(bal).toFixed(1)}` 
                        : 'Settled'
                      }
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Debt Simplification Panel */}
          <div className="glass-card details-card-padding">
            <h3 className="sidebar-section-title" style={{ marginBottom: '12px' }}>
              Simplified Debts
            </h3>
            <p className="debt-help-text">
              We simplified the transaction tree. Clicking a card auto-fills Settle Up!
            </p>

            {debts.simplifiedPayments.length === 0 ? (
              <div className="settled-success-msg">
                ✓ Everyone is fully settled!
              </div>
            ) : (
              <div className="debts-suggestions-list">
                {debts.simplifiedPayments.map((payment, idx) => (
                  <div 
                    key={`simp-${idx}`}
                    onClick={() => {
                      setIsSettleOpen(true);
                      toast.info(`Filling payment: ${payment.from} ➔ ${payment.to}`);
                    }}
                    className="debt-suggestion-row"
                  >
                    <div className="debt-suggestion-flow">
                      <strong>{payment.from}</strong>
                      <span className="suggestion-arrow">➔</span>
                      <strong>{payment.to}</strong>
                    </div>
                    <span className="debt-suggestion-amount">
                      ₹{payment.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODALS */}

      {/* Modal 1: Add/Edit Expense */}
      <Modal isOpen={isExpenseOpen} onClose={() => setIsExpenseOpen(false)} title={editingExpense ? "Edit Expense Details" : "Record Group Expense"}>
        <ExpenseForm 
          groups={[group]}
          defaultGroupId={id}
          initialData={editingExpense}
          onSave={handleAddExpense}
          onCancel={() => setIsExpenseOpen(false)}
        />
      </Modal>

      {/* Modal 2: Settle Up */}
      <Modal isOpen={isSettleOpen} onClose={() => setIsSettleOpen(false)} title="Record a Settlement Repayment">
        <SettlementForm 
          members={group.members}
          suggestedSettlements={debts.simplifiedPayments}
          onSave={handleRecordSettlement}
          onCancel={() => setIsSettleOpen(false)}
        />
      </Modal>

      {/* Modal 3: Settings Form */}
      <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Group Settings">
        <GroupForm 
          onSubmit={handleEditGroupSettings}
          initialData={group}
        />
      </Modal>
    </div>
  );
};

export default GroupDetails;
