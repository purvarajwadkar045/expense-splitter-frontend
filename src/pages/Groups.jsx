import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdGroupAdd } from 'react-icons/md';

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
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  // Load all groups and calculate dynamic balances
  const loadGroupsData = async () => {
    setLoading(true);
    try {
      const fetchedGroups = groupService.getGroups();
      const allExpenses = await expenseService.getExpenses();
      const allSettlements = await settlementService.getSettlements();

      const groupsWithBalances = fetchedGroups.map((g) => {
        const groupExpenses = allExpenses.filter((e) => String(e.groupId) === String(g.id));
        const groupSettlements = allSettlements.filter((s) => String(s.groupId) === String(g.id));
        
        const { netBalances } = calculateSimplifiedDebts(
          g.members,
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
      toast.error('Failed to load groups data.');
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
    setLoading(true);
    try {
      if (editingGroup) {
        await groupService.updateGroup(editingGroup.id, data);
        toast.success('Group updated successfully');
      } else {
        await groupService.createGroup(data.name, data.description, data.members);
        toast.success('Group created successfully');
      }
      setIsModalOpen(false);
      loadGroupsData();
    } catch (err) {
      console.error('Group action failed:', err);
      toast.error(err.response?.data?.detail || 'An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (id) => {
    if (window.confirm('Are you sure you want to delete this group? All associated expenses will be lost.')) {
      setLoading(true);
      try {
        await groupService.deleteGroup(id);
        
        // Clean up group expenses and settlements locally
        const allExpenses = await expenseService.getExpenses();
        const allSettlements = await settlementService.getSettlements();
        
        const filteredExpenses = allExpenses.filter(e => String(e.groupId) !== String(id));
        const filteredSettlements = allSettlements.filter(s => String(s.groupId) !== String(id));
        
        localStorage.setItem('expenses', JSON.stringify(filteredExpenses));
        localStorage.setItem('settlements', JSON.stringify(filteredSettlements));

        toast.success('Group deleted successfully');
        loadGroupsData();
      } catch (err) {
        console.error('Delete failed:', err);
        toast.error('Failed to delete group.');
      } finally {
        setLoading(false);
      }
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