import React, { useState, useEffect } from 'react';
import { MdAdd, MdSearch, MdReceipt } from 'react-icons/md';

import ExpenseTable from '../components/expenses/ExpenseTable';
import ExpenseForm from '../components/expenses/ExpenseForm';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

import expenseService from '../services/expenseService';
import groupService from '../services/groupService';
import useToast from '../hooks/useToast';

import '../styles/expenses.css';
import '../styles/dashboard.css';

const Expenses = () => {
  const toast = useToast();

  const [expenses, setExpenses] = useState([]);
  const [groups, setGroups] = useState([]);
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('');

  // Fetch all expenses and groups
  const loadExpensesData = () => {
    const fetchedExpenses = expenseService.getExpenses();
    const fetchedGroups = groupService.getGroups();
    
    setExpenses(fetchedExpenses);
    setGroups(fetchedGroups);
  };

  useEffect(() => {
    loadExpensesData();
  }, []);

  const openAddModal = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const openEditModal = (expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleSaveExpense = (expenseData) => {
    if (editingExpense) {
      expenseService.updateExpense(editingExpense.id, expenseData);
      toast.success('Expense updated successfully');
    } else {
      expenseService.createExpense(expenseData);
      toast.success('Expense added successfully');
    }
    setIsModalOpen(false);
    loadExpensesData();
  };

  const handleDeleteExpense = (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      expenseService.deleteExpense(id);
      toast.success('Expense deleted successfully');
      loadExpensesData();
    }
  };

  // Filter & Search logic
  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (exp.notes && exp.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesGroup = selectedGroupFilter ? exp.groupId === selectedGroupFilter : true;
    
    return matchesSearch && matchesGroup;
  });

  return (
    <div className="page-container expenses-page-wrapper">
      <header className="dashboard-header flex-header">
        <div className="header-info">
          <h1 className="header-title">Expenses Log</h1>
          <p className="header-subtitle">Track, filter, and manage all your shared expenses across your groups.</p>
        </div>
        <Button onClick={openAddModal} variant="primary" icon={MdAdd}>
          Add Expense
        </Button>
      </header>

      {/* Filter and Search Bar Panel */}
      <section className="glass-card filters-panel">
        <div className="search-input-wrapper">
          <MdSearch size={22} className="search-icon-inside" />
          <input
            type="text"
            placeholder="Search by expense title or notes..."
            className="filter-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-select-wrapper">
          <select
            value={selectedGroupFilter}
            onChange={(e) => setSelectedGroupFilter(e.target.value)}
            className="form-select"
            style={{ marginTop: 0 }}
          >
            <option value="">All Groups</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Main Expenses Table Card */}
      {filteredExpenses.length === 0 ? (
        <EmptyState
          title={searchQuery || selectedGroupFilter ? "No Results Match Filters" : "No Expenses Recorded"}
          description={searchQuery || selectedGroupFilter ? "Try adjusting your search query or group filter selection." : "Record food bills, travel tickets, or apartment rent splits to begin."}
          actionText={searchQuery || selectedGroupFilter ? "Clear Filters" : "Add Expense"}
          onAction={searchQuery || selectedGroupFilter ? () => { setSearchQuery(''); setSelectedGroupFilter(''); } : openAddModal}
          actionIcon={searchQuery || selectedGroupFilter ? null : MdAdd}
        />
      ) : (
        <div className="glass-card details-card-padding">
          <ExpenseTable
            expenses={filteredExpenses}
            groups={groups}
            onEdit={openEditModal}
            onDelete={handleDeleteExpense}
            showGroupColumn={true}
          />
        </div>
      )}

      {/* Modal for Expense Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExpense ? 'Edit Expense Details' : 'Record New Expense'}
      >
        <ExpenseForm
          groups={groups}
          initialData={editingExpense}
          onSave={handleSaveExpense}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Expenses;