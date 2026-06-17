import React, { useState, useEffect } from 'react';
import { MdPayment, MdReceipt, MdRefresh } from 'react-icons/md';

import SettlementHistory from '../components/settlements/SettlementHistory';
import SettlementForm from '../components/settlements/SettlementForm';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import StatCard from '../components/ui/StatCard';
import Loader from '../components/ui/Loader';

import groupService from '../services/groupService';
import expenseService from '../services/expenseService';
import settlementService from '../services/settlementService';
import { calculateSimplifiedDebts } from '../utils/helpers';
import useToast from '../hooks/useToast';

import '../styles/dashboard.css';

const Settlements = () => {
  const toast = useToast();

  const [groups, setGroups] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [globalSuggestions, setGlobalSuggestions] = useState([]);
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState({ totalSettled: 0, count: 0 });

  // Loading & Error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load details
  const loadSettlementsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedGroups, fetchedSettlements, fetchedExpenses] = await Promise.all([
        groupService.getGroups(),
        settlementService.getSettlements(),
        expenseService.getExpenses()
      ]);

      setGroups(fetchedGroups || []);
      setSettlements(fetchedSettlements || []);

      // Sum settled payments
      const totalVal = fetchedSettlements.reduce((sum, s) => sum + s.amount, 0);
      setStats({
        totalSettled: totalVal,
        count: fetchedSettlements.length
      });

      // Extract all group members
      const members = [...new Set(fetchedGroups.flatMap((g) => g.members || []))];
      setAllMembers(members);

      // Accumulate simplified debts across all groups to form global quick settlements suggestions
      const suggestions = [];
      fetchedGroups.forEach((g) => {
        const groupExpenses = fetchedExpenses.filter((e) => e.groupId === g.id);
        const groupSettlements = fetchedSettlements.filter((s) => s.groupId === g.id);
        
        const { simplifiedPayments } = calculateSimplifiedDebts(
          g.members || [],
          groupExpenses,
          groupSettlements
        );

        // Map group ID onto suggestions
        simplifiedPayments.forEach((payment) => {
          suggestions.push({
            ...payment,
            groupId: g.id
          });
        });
      });

      setGlobalSuggestions(suggestions);
    } catch (err) {
      console.error('Failed to load settlements:', err);
      setError('Unable to load settlements history. Please try again.');
      toast.error('Failed to load settlements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettlementsData();
  }, []);

  const handleRecordSettlement = async (settleData) => {
    try {
      // If suggested payment has a groupId, use it. Otherwise, look up a group they share or default to the first group
      let groupId = settleData.groupId;
      
      if (!groupId) {
        // Find a group both parties share
        const sharedGroup = groups.find((g) => 
          g.members.includes(settleData.from) && g.members.includes(settleData.to)
        );
        groupId = sharedGroup ? sharedGroup.id : (groups[0]?.id || 'g1');
      }

      await settlementService.createSettlement({
        groupId,
        ...settleData
      });

      toast.success('Repayment settlement successfully recorded!');
      setIsModalOpen(false);
      await loadSettlementsData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to record settlement');
    }
  };

  if (loading) {
    return (
      <div className="page-container settlements-page-wrapper">
        <header className="dashboard-header flex-header">
          <div className="header-info">
            <h1 className="header-title">Settlements</h1>
            <p className="header-subtitle">Loading repayment logs...</p>
          </div>
        </header>
        <Loader type="skeleton" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container settlements-page-wrapper">
        <header className="dashboard-header">
          <h1 className="header-title">Settlements</h1>
        </header>
        <div className="empty-state-container glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-pure)' }}>Failed to load Settlements</h3>
          <p style={{ color: 'var(--text-dim)', marginBottom: '20px' }}>{error}</p>
          <Button onClick={loadSettlementsData} variant="primary" icon={MdRefresh}>
            Retry Load
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container settlements-page-wrapper">
      <header className="dashboard-header flex-header">
        <div className="header-info">
          <h1 className="header-title">Settlements</h1>
          <p className="header-subtitle">Track, record, and view all repayment transactions clearing group balances.</p>
        </div>
        {groups.length > 0 && (
          <Button onClick={() => setIsModalOpen(true)} variant="primary" icon={MdPayment}>
            Record Payment
          </Button>
        )}
      </header>

      {/* Stats Section */}
      <section className="stats-grid">
        <StatCard 
          title="Total Settled Payments" 
          amount={stats.totalSettled} 
          type="owed" 
          icon={MdPayment}
          description="Consolidated repayment volume"
        />
        <StatCard 
          title="Total Settlements Logs" 
          amount={stats.count} 
          type="neutral" 
          icon={MdReceipt}
          description="Clearances recorded"
        />
      </section>

      {/* Settlements Table Card */}
      {settlements.length === 0 ? (
        <EmptyState 
          title="No Settlements Recorded"
          description="Once members repay debts, record settlements here to update balances."
          actionText={groups.length > 0 ? "Record Payment" : "Create Group First"}
          onAction={groups.length > 0 ? () => setIsModalOpen(true) : () => navigate('/groups')}
          actionIcon={MdPayment}
        />
      ) : (
        <div className="glass-card details-card-padding">
          <h3 className="section-title">Global Repayments Feed</h3>
          <SettlementHistory 
            settlements={settlements}
            groups={groups}
            showGroupColumn={true}
          />
        </div>
      )}

      {/* Modal for Recording Settlement */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record a Settlement Repayment">
        <SettlementForm 
          members={allMembers}
          suggestedSettlements={globalSuggestions}
          onSave={handleRecordSettlement}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Settlements;
