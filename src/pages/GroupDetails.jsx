import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdArrowBack, MdAdd, MdPayment, MdSettings, MdDelete, MdPeople } from 'react-icons/md';

import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import StatCard from '../components/ui/StatCard';
import Loader from '../components/ui/Loader';

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
import API from '../services/api';

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
  const [loading, setLoading] = useState(true);

  // Tab state: 'expenses' | 'settlements'
  const [activeTab, setActiveTab] = useState('expenses');

  // Modals state
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isSettleOpen, setIsSettleOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // Load all details
  const loadGroupDetails = async () => {
    setLoading(true);
    try {
      const g = groupService.getGroupById(id);
      if (!g) {
        toast.error('Group not found');
        navigate('/groups');
        return;
      }
      setGroup(g);

      const groupExpenses = await expenseService.getExpensesByGroupId(id);
      const groupSettlements = settlementService.getSettlementsByGroupId(id);

      setExpenses(groupExpenses);
      setSettlements(groupSettlements);

      // Fetch balances and simplify from backend to render real computed values
      const balanceRes = await API.get(`/groups/${id}/balances`);
      const simplifyRes = await API.get(`/groups/${id}/simplify`);
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const currentUserName = currentUser ? currentUser.name : '';

      // Map balances
      const netBalances = {};
      balanceRes.data.forEach(b => {
        const key = b.username === currentUserName ? 'You' : b.username;
        netBalances[key] = b.balance;
      });

      // Map simplified payments
      const simplifiedPayments = simplifyRes.data.map(s => {
        const from = s.from_username === currentUserName ? 'You' : s.from_username;
        const to = s.to_username === currentUserName ? 'You' : s.to_username;
        return {
          from,
          to,
          amount: s.amount
        };
      });

      setDebts({ netBalances, simplifiedPayments });
    } catch (err) {
      console.error('Failed to load details:', err);
      toast.error('Failed to load group details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroupDetails();
  }, [id]);

  if (loading) {
    return (
      <div 
        style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: 'var(--bg-deep)'
        }}
      >
        <Loader />
      </div>
    );
  }

  if (!group) return null;

  // Actions
  const handleEditGroupSettings = async (groupData) => {
    setLoading(true);
    try {
      await groupService.updateGroup(id, groupData);
      toast.success('Group settings updated');
      setIsSettingsOpen(false);
      loadGroupDetails();
    } catch (err) {
      console.error('Update settings failed:', err);
      toast.error(err.response?.data?.detail || 'Failed to update settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (window.confirm('Are you sure you want to delete this group? All expenses and settlements log will be purged.')) {
      setLoading(true);
      try {
        await groupService.deleteGroup(id);
        
        // Purge matching expenses/settlements locally
        const allExpenses = expenseService.getExpenses();
        const allSettlements = settlementService.getSettlements();
        localStorage.setItem('expenses', JSON.stringify(allExpenses.filter(e => String(e.groupId) !== String(id))));
        localStorage.setItem('settlements', JSON.stringify(allSettlements.filter(s => String(s.groupId) !== String(id))));
        
        toast.success('Group deleted successfully');
        navigate('/groups');
      } catch (err) {
        console.error('Delete failed:', err);
        toast.error('Failed to delete group.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddExpense = async (expenseData) => {
    setLoading(true);
    try {
      if (editingExpense) {
        await expenseService.updateExpense(editingExpense.id, expenseData);
        toast.success('Expense updated');
      } else {
        await expenseService.createExpense(expenseData);
        toast.success('Expense added');
      }
      setIsExpenseOpen(false);
      setEditingExpense(null);
      await loadGroupDetails();
    } catch (err) {
      console.error('Failed to add/update expense:', err);
      toast.error(err.response?.data?.detail || 'Failed to submit expense.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (expId) => {
    if (window.confirm('Delete this expense entry?')) {
      setLoading(true);
      try {
        await expenseService.deleteExpense(expId);
        toast.success('Expense deleted');
        await loadGroupDetails();
      } catch (err) {
        console.error('Failed to delete expense:', err);
        toast.error(err.response?.data?.detail || 'Failed to delete expense.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRecordSettlement = async (settleData) => {
    setLoading(true);
    try {
      await settlementService.createSettlement({
        groupId: id,
        ...settleData
      });
      toast.success('Repayment settled!');
      setIsSettleOpen(false);
      await loadGroupDetails();
    } catch (err) {
      console.error('Failed to record settlement:', err);
      toast.error(err.response?.data?.detail || 'Failed to submit settlement.');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (expense) => {
    setEditingExpense(expense);
    setIsExpenseOpen(true);
  };

  const myBalance = debts.netBalances['You'] || 0;
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="page-container group-details-wrapper">
      {/* Back & Actions Header */}
      <div className="details-actions-bar">
        <Button onClick={() => navigate('/groups')} variant="secondary" icon={MdArrowBack}>
          Back to Groups
        </Button>

        <div className="details-right-actions">
          <Button onClick={() => setIsSettingsOpen(true)} variant="secondary" title="Group Settings" icon={MdSettings} />
          <Button onClick={handleDeleteGroup} variant="secondary" className="text-danger" title="Delete Group" icon={MdDelete} />
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
