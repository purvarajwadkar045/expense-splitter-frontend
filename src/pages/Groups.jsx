import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdGroupAdd, MdGroup } from 'react-icons/md';

import GroupCard from '../components/groups/GroupCard';
import GroupForm from '../components/groups/GroupForm';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

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

  // Load all groups and dynamic balances
  const loadGroupsData = () => {
    const fetchedGroups = groupService.getGroups();
    const allExpenses = expenseService.getExpenses();
    const allSettlements = settlementService.getSettlements();

    const groupsWithBalances = fetchedGroups.map((g) => {
      const groupExpenses = allExpenses.filter((e) => e.groupId === g.id);
      const groupSettlements = allSettlements.filter((s) => s.groupId === g.id);
      
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

  const handleFormSubmit = (data) => {
    if (editingGroup) {
      groupService.updateGroup(editingGroup.id, data);
      toast.success('Group updated successfully');
    } else {
      groupService.createGroup(data.name, data.description, data.members);
      toast.success('Group created successfully');
    }
    setIsModalOpen(false);
    loadGroupsData();
  };

  const handleDeleteGroup = (id) => {
    if (window.confirm('Are you sure you want to delete this group? All associated expenses will be lost.')) {
      groupService.deleteGroup(id);
      // Clean up group expenses and settlements
      const allExpenses = expenseService.getExpenses();
      const allSettlements = settlementService.getSettlements();
      
      const filteredExpenses = allExpenses.filter(e => e.groupId !== id);
      const filteredSettlements = allSettlements.filter(s => s.groupId !== id);
      
      localStorage.setItem('expenses', JSON.stringify(filteredExpenses));
      localStorage.setItem('settlements', JSON.stringify(filteredSettlements));

      toast.success('Group deleted successfully');
      loadGroupsData();
    }
  };

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