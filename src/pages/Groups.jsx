import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdGroupAdd, MdRefresh } from 'react-icons/md';

import GroupCard from '../components/groups/GroupCard';
import GroupForm from '../components/groups/GroupForm';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Loader from '../components/ui/Loader';

import groupService from '../services/groupService';
import expenseService from '../services/expenseService';
import settlementService from '../services/settlementService';
import { calculateSimplifiedDebts } from '../utils/helpers';
import useToast from '../hooks/useToast';

import '../styles/groups.css';
import '../styles/dashboard.css';

const Groups = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [groups, setGroups] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  // loading & error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load all groups and dynamic balances
  const loadGroupsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedGroups, allExpenses, allSettlements] = await Promise.all([
        groupService.getGroups(),
        expenseService.getExpenses(),
        settlementService.getSettlements()
      ]);

      const groupsWithBalances = (fetchedGroups || []).map((g) => {
        const groupExpenses = allExpenses.filter((e) => e.groupId === g.id);
        const groupSettlements = allSettlements.filter((s) => s.groupId === g.id);
        
        const { netBalances } = calculateSimplifiedDebts(
          g.members || [],
          groupExpenses,
          groupSettlements
        );

        const userBalance = netBalances['You'] || 0;
        
        // Calculate total expenses for this group
        const totalSpent = groupExpenses.reduce((sum, e) => sum + e.amount, 0);

        return {
          ...g,
          userBalance,
          totalExpenses: totalSpent
        };
      });

      setGroups(groupsWithBalances);
    } catch (err) {
      console.error('Failed to load groups data:', err);
      setError('Unable to load your sharing groups. Please verify your connection and try again.');
      toast.error('Failed to fetch groups.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroupsData();
  }, []);

  const openCreateModal = () => {
    setEditingGroup(null);
    setIsModalOpen(true);
  };

  const openEditModal = (group) => {
    setEditingGroup(group);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data) => {
    try {
      if (editingGroup) {
        await groupService.updateGroup(editingGroup.id, data);
        toast.success('Group updated successfully');
      } else {
        await groupService.createGroup(data.name, data.description, data.members);
        toast.success('Group created successfully');
      }
      setIsModalOpen(false);
      await loadGroupsData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to submit group form');
    }
  };

  const handleDeleteGroup = async (id) => {
    if (window.confirm('Are you sure you want to delete this group? All associated expenses will be lost.')) {
      try {
        await groupService.deleteGroup(id);
        
        // Note: For backend integrity, the database cascade delete or backend logic will purge expenses.
        // We do not modify localStorage now since everything goes to the backend.
        
        toast.success('Group deleted successfully');
        await loadGroupsData();
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.detail || 'Failed to delete group');
      }
    }
  };

  if (loading) {
    return (
      <div className="page-container groups-page-wrapper">
        <header className="dashboard-header flex-header">
          <div className="header-info">
            <h1 className="header-title">Groups</h1>
            <p className="header-subtitle">Retrieving shared accounts...</p>
          </div>
        </header>
        <Loader type="skeleton" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container groups-page-wrapper">
        <header className="dashboard-header">
          <h1 className="header-title">Groups</h1>
        </header>
        <div className="empty-state-container glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-pure)' }}>Failed to load Groups</h3>
          <p style={{ color: 'var(--text-dim)', marginBottom: '20px' }}>{error}</p>
          <Button onClick={loadGroupsData} variant="primary" icon={MdRefresh}>
            Retry Load
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container groups-page-wrapper">
      <header className="dashboard-header flex-header">
        <div className="header-info">
          <h1 className="header-title">Groups</h1>
          <p className="header-subtitle">Manage your roommates, trips, office splits, and family expenses.</p>
        </div>
        <Button onClick={openCreateModal} variant="primary" icon={MdGroupAdd}>
          Create Group
        </Button>
      </header>

      {groups.length === 0 ? (
        <EmptyState 
          title="No Groups Found"
          description="Create your first sharing group to start splitting rent, dining, or vacation bills!"
          actionText="Create Group"
          onAction={openCreateModal}
          actionIcon={MdGroupAdd}
        />
      ) : (
        <div className="groups-card-grid">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              userBalance={group.userBalance}
              onClick={() => navigate(`/groups/${group.id}`)}
              onEdit={openEditModal}
              onDelete={handleDeleteGroup}
            />
          ))}
        </div>
      )}

      {/* Modal for Group Form */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingGroup ? 'Edit Group Settings' : 'Create Sharing Group'}
      >
        <GroupForm 
          onSubmit={handleFormSubmit} 
          initialData={editingGroup}
        />
      </Modal>
    </div>
  );
};

export default Groups;