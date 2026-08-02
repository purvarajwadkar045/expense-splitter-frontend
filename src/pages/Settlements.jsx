import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdPayment, MdReceipt } from 'react-icons/md';

import SettlementHistory from '../components/settlements/SettlementHistory';
import SettlementForm from '../components/settlements/SettlementForm';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import StatCard from '../components/ui/StatCard';
import Loader from '../components/ui/Loader';

import groupService from '../services/groupService';
import settlementService from '../services/settlementService';
import useToast from '../hooks/useToast';
import API from '../services/api';

import '../styles/dashboard.css';

const Settlements = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [groups, setGroups] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [globalSuggestions, setGlobalSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState({ totalSettled: 0, count: 0 });

  // Load details
  const loadSettlementsData = async () => {
    setLoading(true);
    try {
      const fetchedGroups = await groupService.getGroups();
      const fetchedSettlements = await settlementService.getSettlements();

      setGroups(fetchedGroups);
      setSettlements(fetchedSettlements);

      // Sum settled payments
      const totalVal = fetchedSettlements.reduce((sum, s) => sum + s.amount, 0);
      setStats({
        totalSettled: totalVal,
        count: fetchedSettlements.length
      });

      // Extract all group members
      const members = [...new Set(fetchedGroups.flatMap((g) => g.members || []))];
      setAllMembers(members);

      // Fetch simplified suggestions directly from the backend simplify API
      const suggestions = [];
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const currentUserName = currentUser ? currentUser.name : '';

      const promises = fetchedGroups.map(async (g) => {
        try {
          const simplifyRes = await API.get(`/groups/${g.id}/simplify`);
          simplifyRes.data.forEach((s) => {
            const from = s.from_username === currentUserName ? 'You' : s.from_username;
            const to = s.to_username === currentUserName ? 'You' : s.to_username;
            suggestions.push({
              from,
              to,
              amount: s.amount,
              groupId: g.id
            });
          });
        } catch (err) {
          console.warn(`Failed to fetch simplified debts for group ${g.id}:`, err);
        }
      });
      await Promise.all(promises);
      setGlobalSuggestions(suggestions);
    } catch (err) {
      console.error('Failed to load settlements:', err);
      toast.error('Failed to load settlements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettlementsData();
  }, []);

  const handleRecordSettlement = async (settleData) => {
    setLoading(true);
    try {
      let groupId = settleData.groupId;
      if (!groupId) {
        const sharedGroup = groups.find((g) => 
          g.members.includes(settleData.from) && g.members.includes(settleData.to)
        );
        groupId = sharedGroup ? sharedGroup.id : (groups[0] ? groups[0].id : 'g1');
      }

      await settlementService.createSettlement({
        groupId,
        ...settleData
      });

      toast.success('Repayment settlement successfully recorded!');
      setIsModalOpen(false);
      await loadSettlementsData();
    } catch (err) {
      console.error('Failed to record settlement:', err);
      toast.error(err.response?.data?.detail || 'An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

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
