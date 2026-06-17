import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownLeft, Wallet, Plus, Users, RefreshCw } from 'lucide-react';
import { MdReceipt, MdPayment, MdGroupAdd } from 'react-icons/md';

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
import groupService from '../services/groupService';
import expenseService from '../services/expenseService';
import settlementService from '../services/settlementService';
import { calculateSimplifiedDebts, formatDate } from '../utils/helpers';
import useToast from '../hooks/useToast';

import '../styles/dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();

  // State triggers for Quick Actions modals
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [isSettleOpen, setIsSettleOpen] = useState(false);

  // Loading & Error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dynamic values
  const [groups, setGroups] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [stats, setStats] = useState({ owed: 0, owe: 0, net: 0 });
  const [debtsList, setDebtsList] = useState([]);
  const [activitiesList, setActivitiesList] = useState([]);
  const [chartData, setChartData] = useState([]);

  // Load all dashboard state from services
  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedGroups, fetchedExpenses, fetchedSettlements] = await Promise.all([
        groupService.getGroups(),
        expenseService.getExpenses(),
        settlementService.getSettlements()
      ]);

      setGroups(fetchedGroups || []);
      setExpenses(fetchedExpenses || []);
      setSettlements(fetchedSettlements || []);

      // Calculate balances per group and accumulate
      let totalOwedToYou = 0;
      let totalYouOwe = 0;
      const accumulatedDebts = [];

      fetchedGroups.forEach((g) => {
        const groupExpenses = fetchedExpenses.filter((e) => e.groupId === g.id);
        const groupSettlements = fetchedSettlements.filter((s) => s.groupId === g.id);
        
        const { simplifiedPayments } = calculateSimplifiedDebts(
          g.members || [],
          groupExpenses,
          groupSettlements
        );

        simplifiedPayments.forEach((payment) => {
          if (payment.from === 'You') {
            totalYouOwe += payment.amount;
            accumulatedDebts.push({ from: 'You', to: payment.to, amount: payment.amount });
          } else if (payment.to === 'You') {
            totalOwedToYou += payment.amount;
            accumulatedDebts.push({ from: payment.from, to: 'You', amount: payment.amount });
          }
        });
      });

      setStats({
        owed: totalOwedToYou,
        owe: totalYouOwe,
        net: totalOwedToYou - totalYouOwe,
      });
      setDebtsList(accumulatedDebts);

      // Generate recent activities list
      const combinedActivities = [];
      fetchedExpenses.forEach((e) => {
        const group = fetchedGroups.find((g) => g.id === e.groupId);
        combinedActivities.push({
          id: `act-e-${e.id}`,
          type: 'expense',
          message: `<strong>${e.paidBy}</strong> added expense <strong>"${e.title}"</strong> in <strong>${group ? group.name : 'a group'}</strong>`,
          time: formatDate(e.date),
          timestamp: new Date(e.date).getTime(),
        });
      });

      fetchedSettlements.forEach((s) => {
        const group = fetchedGroups.find((g) => g.id === s.groupId);
        combinedActivities.push({
          id: `act-s-${s.id}`,
          type: 'settlement',
          message: `<strong>${s.from}</strong> settled <strong>₹${s.amount.toLocaleString()}</strong> to <strong>${s.to}</strong> in <strong>${group ? group.name : 'a group'}</strong>`,
          time: formatDate(s.date),
          timestamp: new Date(s.date).getTime(),
        });
      });

      // Sort activities by timestamp descending (newest first)
      combinedActivities.sort((a, b) => b.timestamp - a.timestamp);
      setActivitiesList(combinedActivities.slice(0, 5));

      // Construct spending chart data for past 7 days
      const chartVals = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateString = d.toISOString().split('T')[0];
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        const totalSpend = fetchedExpenses
          .filter((e) => e.date === dateString)
          .reduce((sum, e) => sum + e.amount, 0);

        chartVals.push({ name: dayName, spend: totalSpend });
      }
      setChartData(chartVals);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Unable to retrieve dashboard information. Please try again.');
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Modal Submit Handlers
  const handleCreateGroup = async (groupData) => {
    try {
      await groupService.createGroup(groupData.name, groupData.description, groupData.members);
      toast.success('Group created successfully!');
      setIsGroupOpen(false);
      await loadDashboardData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to create group');
    }
  };

  const handleAddExpense = async (expenseData) => {
    try {
      await expenseService.createExpense(expenseData);
      toast.success('Expense added successfully!');
      setIsExpenseOpen(false);
      await loadDashboardData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to add expense');
    }
  };

  const handleSettleUp = async (settleData) => {
    try {
      // Find a group both parties share if groupId is not specified
      let groupId = settleData.groupId;
      if (!groupId) {
        const sharedGroup = groups.find((g) => 
          g.members.includes(settleData.from) && g.members.includes(settleData.to)
        );
        groupId = sharedGroup ? sharedGroup.id : (groups[0]?.id || 'g1');
      }

      await settlementService.createSettlement({
        groupId,
        ...settleData
      });
      toast.success('Payment recorded successfully!');
      setIsSettleOpen(false);
      await loadDashboardData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to record settlement');
    }
  };

  // Collect all members from all groups for Settle Up dropdown selection
  const allMembersList = [...new Set(groups.flatMap((g) => g.members || []))];

  if (loading) {
    return (
      <div className="page-container dashboard-wrapper">
        <header className="dashboard-header">
          <div className="header-info">
            <h1 className="header-title">Dashboard</h1>
            <p className="header-subtitle">Syncing overview balances...</p>
          </div>
        </header>
        <Loader type="skeleton" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container dashboard-wrapper">
        <header className="dashboard-header">
          <h1 className="header-title">Dashboard</h1>
        </header>
        <div className="empty-state-container glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-pure)' }}>Data Load Failed</h3>
          <p style={{ color: 'var(--text-dim)', marginBottom: '20px' }}>{error}</p>
          <Button onClick={loadDashboardData} variant="primary" icon={RefreshCw}>
            Retry Load
          </Button>
        </div>
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
      <section className="stats-grid">
        <StatCard 
          title="Total Owed to You" 
          amount={stats.owed} 
          type="owed" 
          icon={ArrowUpRight} 
          description={stats.owed > 0 ? "Collect from group members" : "No active receivables"}
        />
        <StatCard 
          title="Total You Owe" 
          amount={stats.owe} 
          type="owe" 
          icon={ArrowDownLeft} 
          description={stats.owe > 0 ? "Repayments pending" : "All debts clear"}
        />
        <StatCard 
          title="Net Balance" 
          amount={stats.net} 
          type={stats.net >= 0 ? "owed" : "owe"} 
          icon={Wallet} 
          description="Consolidated active splits"
        />
      </section>

      {/* Main Grid Section */}
      <main className="dashboard-grid">
        {/* Left Column: Spending Chart & Activities */}
        <div className="dashboard-col-left">
          {/* Spending Analysis Chart */}
          <div className="chart-container glass-card">
            <h3 className="section-title">Weekly Spendings Analysis</h3>
            {expenses.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '240px', color: 'var(--text-dim)' }}>
                No expenses recorded this week.
              </div>
            ) : (
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 11}} dy={10} />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(11, 15, 25, 0.95)', 
                        borderRadius: 'var(--radius-md)', 
                        border: '1px solid var(--glass-border)',
                        boxShadow: 'var(--glass-shadow)',
                        color: 'var(--text-pure)'
                      }}
                      formatter={(value) => [`₹${value.toLocaleString()}`, 'Spent']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="spend" 
                      stroke="var(--primary)" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorSpend)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Recent Activity Feed */}
          <div className="recent-activity-box glass-card">
            <h3 className="section-title">Recent Activity Feed</h3>
            <RecentActivity activities={activitiesList} />
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

          {/* Balance Summaries */}
          <div className="summary-section-box glass-card">
            <h3 className="section-title">Balances Summary</h3>
            <BalanceSummary debts={debtsList} />
          </div>
        </div>
      </main>

      {/* QUICK ACTIONS MODALS */}
      
      {/* Modal 1: Add Expense */}
      <Modal isOpen={isExpenseOpen} onClose={() => setIsExpenseOpen(false)} title="Add New Expense">
        {groups.length === 0 ? (
          <EmptyState 
            title="Create a Group First" 
            description="You need to have at least one active group before recording expenses."
            actionText="Create Group"
            onAction={() => { setIsExpenseOpen(false); setIsGroupOpen(true); }}
            actionIcon={Users}
          />
        ) : (
          <ExpenseForm 
            groups={groups}
            onSave={handleAddExpense}
            onCancel={() => setIsExpenseOpen(false)}
          />
        )}
      </Modal>

      {/* Modal 2: Create Group */}
      <Modal isOpen={isGroupOpen} onClose={() => setIsGroupOpen(false)} title="Create Expense Sharing Group">
        <GroupForm onSubmit={handleCreateGroup} />
      </Modal>

      {/* Modal 3: Settle Up */}
      <Modal isOpen={isSettleOpen} onClose={() => setIsSettleOpen(false)} title="Record a Settlement Repayment">
        {groups.length === 0 ? (
          <EmptyState 
            title="Create a Group First" 
            description="You need to have at least one active group to record settlements."
            actionText="Create Group"
            onAction={() => { setIsSettleOpen(false); setIsGroupOpen(true); }}
            actionIcon={Users}
          />
        ) : (
          <SettlementForm 
            members={allMembersList}
            onSave={handleSettleUp}
            onCancel={() => setIsSettleOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;