import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownLeft, Wallet, Users } from 'lucide-react';
import { MdReceipt, MdPayment } from 'react-icons/md';

import StatCard from '../components/ui/StatCard';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import Loader from '../components/ui/Loader';
import Button from '../components/ui/Button';

// Dashboard Subcomponents
import BalanceSummary from '../components/dashboard/BalanceSummary';
import RecentActivity from '../components/dashboard/RecentActivity';
import QuickActions from '../components/dashboard/QuickActions';

// Forms
import GroupForm from '../components/groups/GroupForm';
import ExpenseForm from '../components/expenses/ExpenseForm';
import SettlementForm from '../components/settlements/SettlementForm';

// Services & Helpers
import dashboardService from '../services/dashboardService';
import groupService from '../services/groupService';
import expenseService from '../services/expenseService';
import settlementService from '../services/settlementService';
import useToast from '../hooks/useToast';

import '../styles/dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();

  // State triggers for Quick Actions modals
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [isSettleOpen, setIsSettleOpen] = useState(false);

  // API states
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Load dashboard data from FastAPI backend
  const loadDashboardData = async () => {
    setLoadingData(true);
    setErrorMsg('');
    try {
      const data = await dashboardService.getDashboardData();
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
      setErrorMsg(err.response?.data?.detail || 'Failed to fetch dashboard data from server.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Modal Submit Handlers (refreshes dashboard metrics after actions)
  const handleCreateGroup = async (groupData) => {
    setLoadingData(true);
    try {
      await groupService.createGroup(groupData.name, groupData.description, groupData.members);
      toast.success('Group created successfully!');
      setIsGroupOpen(false);
      await loadDashboardData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to create group.');
    } finally {
      setLoadingData(false);
    }
  };

  const handleAddExpense = async (expenseData) => {
    setLoadingData(true);
    try {
      await expenseService.createExpense(expenseData);
      toast.success('Expense added successfully!');
      setIsExpenseOpen(false);
      await loadDashboardData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to add expense.');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSettleUp = async (settleData) => {
    setLoadingData(true);
    try {
      await settlementService.createSettlement(settleData);
      toast.success('Payment recorded successfully!');
      setIsSettleOpen(false);
      await loadDashboardData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to record payment.');
    } finally {
      setLoadingData(false);
    }
  };

  // Safe references to mock services fallback for empty states/lists if needed
  // (Preserves original components layouts without hardcoding values)
  const emptyList = [];

  if (loadingData) {
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

  if (errorMsg) {
    return (
      <div 
        className="page-container" 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '80vh', 
          gap: '16px' 
        }}
      >
        <h2 className="text-danger" style={{ fontFamily: 'var(--font-display)' }}>Error Loading Dashboard</h2>
        <p style={{ color: 'var(--text-dim)' }}>{errorMsg}</p>
        <Button onClick={loadDashboardData} variant="primary">Retry Loading</Button>
      </div>
    );
  }

  if (!dashboardData || dashboardData.total_groups === 0) {
    return (
      <div className="page-container dashboard-wrapper">
        <header className="dashboard-header">
          <div className="header-info">
            <h1 className="header-title">Dashboard</h1>
            <p className="header-subtitle">Welcome back! Here's the balance overview of your shared expense accounts.</p>
          </div>
        </header>

        <EmptyState 
          title="No Active Groups Found"
          description="Create your first sharing group to start splitting rent, dining, or vacation bills!"
          actionText="Create Group"
          onAction={() => setIsGroupOpen(true)}
          actionIcon={Users}
        />

        {/* Modal for Create Group inside Empty State */}
        <Modal isOpen={isGroupOpen} onClose={() => setIsGroupOpen(false)} title="Create Expense Sharing Group">
          <GroupForm onSubmit={handleCreateGroup} />
        </Modal>
      </div>
    );
  }

  return (
    <div className="page-container dashboard-wrapper">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-info">
          <h1 className="header-title">Dashboard</h1>
          <p className="header-subtitle">Welcome back! Here's the balance overview of your shared expense accounts.</p>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <StatCard 
          title="Total Groups" 
          amount={dashboardData.total_groups} 
          type="neutral" 
          icon={Users} 
          description="Groups you belong to"
        />
        <StatCard 
          title="Total Paid" 
          amount={dashboardData.total_expenses_paid} 
          type="neutral" 
          icon={MdReceipt} 
          description="Total expenses paid by you"
        />
        <StatCard 
          title="Total Owed to You" 
          amount={dashboardData.total_owed_to_you} 
          type="owed" 
          icon={ArrowUpRight} 
          description={dashboardData.total_owed_to_you > 0 ? "Collect from group members" : "No active receivables"}
        />
        <StatCard 
          title="Total You Owe" 
          amount={dashboardData.total_you_owe} 
          type="owe" 
          icon={ArrowDownLeft} 
          description={dashboardData.total_you_owe > 0 ? "Repayments pending" : "All debts clear"}
        />
        <StatCard 
          title="Net Balance" 
          amount={dashboardData.net_balance} 
          type={dashboardData.net_balance >= 0 ? "owed" : "owe"} 
          icon={Wallet} 
          description="Consolidated active splits"
        />
      </section>

      {/* Main Grid Section */}
      <main className="dashboard-grid">
        {/* Left Column: Spending Chart & Activities Guidance */}
        <div className="dashboard-col-left">
          {/* Spending Analysis Chart Panel */}
          <div className="chart-container glass-card">
            <h3 className="section-title">Weekly Spendings Analysis</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '240px', color: 'var(--text-dim)', textAlign: 'center', padding: '20px' }}>
              Spending charts are computed per group.<br />Visit a group details page to view its expense analysis.
            </div>
          </div>

          {/* Recent Activity Feed Guidance */}
          <div className="recent-activity-box glass-card">
            <h3 className="section-title">Recent Activity Feed</h3>
            <RecentActivity activities={emptyList} />
          </div>
        </div>

        {/* Right Column: Quick Services & Balances */}
        <div className="dashboard-col-right">
          {/* Quick Actions Panel */}
          <div className="quick-actions-box glass-card">
            <h3 className="section-title">Quick Services</h3>
            <QuickActions 
              onAddExpense={() => setIsExpenseOpen(true)}
              onCreateGroup={() => setIsGroupOpen(true)}
              onSettleUp={() => setIsSettleOpen(true)}
              onViewHistory={() => navigate('/history')}
            />
          </div>

          {/* Balance Summaries Panel */}
          <div className="summary-section-box glass-card">
            <h3 className="section-title">Balances Summary</h3>
            <BalanceSummary debts={emptyList} />
          </div>
        </div>
      </main>

      {/* QUICK ACTIONS MODALS */}
      
      {/* Modal 1: Add Expense */}
      <Modal isOpen={isExpenseOpen} onClose={() => setIsExpenseOpen(false)} title="Add New Expense">
        <EmptyState 
          title="Add Expense Inside a Group" 
          description="To split an expense, please open the specific group details page first and select Add Expense."
          actionText="Go to Groups"
          onAction={() => { setIsExpenseOpen(false); navigate('/groups'); }}
          actionIcon={Users}
        />
      </Modal>

      {/* Modal 2: Create Group */}
      <Modal isOpen={isGroupOpen} onClose={() => setIsGroupOpen(false)} title="Create Expense Sharing Group">
        <GroupForm onSubmit={handleCreateGroup} />
      </Modal>

      {/* Modal 3: Settle Up */}
      <Modal isOpen={isSettleOpen} onClose={() => setIsSettleOpen(false)} title="Record a Settlement Repayment">
        <EmptyState 
          title="Settle Balances Inside a Group" 
          description="To settle repayment balances, please open the specific group details page first and select Settle Up."
          actionText="Go to Groups"
          onAction={() => { setIsSettleOpen(false); navigate('/groups'); }}
          actionIcon={Users}
        />
      </Modal>
    </div>
  );
};

export default Dashboard;