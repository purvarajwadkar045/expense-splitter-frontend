import React, { useState, useEffect } from 'react';
import { MdSearch, MdCloudDownload, MdReceipt, MdPayment, MdFilterList, MdDateRange, MdFileDownload } from 'react-icons/md';

import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';

import groupService from '../services/groupService';
import expenseService from '../services/expenseService';
import settlementService from '../services/settlementService';
import { formatDate, exportToCSV } from '../utils/helpers';
import { CATEGORIES } from '../utils/constants';
import useToast from '../hooks/useToast';

import '../styles/dashboard.css';
import '../styles/expenses.css';

const History = () => {
  const toast = useToast();

  const [groups, setGroups] = useState([]);
  const [unifiedHistory, setUnifiedHistory] = useState([]);
  
  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedType, setSelectedType] = useState('all'); // 'all' | 'expense' | 'settlement'
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'

  // Load data
  const loadHistoryData = () => {
    const fetchedGroups = groupService.getGroups();
    const fetchedExpenses = expenseService.getExpenses();
    const fetchedSettlements = settlementService.getSettlements();

    setGroups(fetchedGroups);

    // Merge expenses and settlements
    const historyList = [];

    fetchedExpenses.forEach((e) => {
      const g = fetchedGroups.find((grp) => grp.id === e.groupId);
      historyList.push({
        id: `e-${e.id}`,
        type: 'expense',
        title: e.title,
        amount: e.amount,
        paidBy: e.paidBy,
        date: e.date,
        category: e.category,
        groupName: g ? g.name : 'Unknown Group',
        groupId: e.groupId,
        details: e.notes || 'No description'
      });
    });

    fetchedSettlements.forEach((s) => {
      const g = fetchedGroups.find((grp) => grp.id === s.groupId);
      historyList.push({
        id: `s-${s.id}`,
        type: 'settlement',
        title: `${s.from} settled with ${s.to}`,
        amount: s.amount,
        paidBy: s.from,
        date: s.date,
        category: 'Settlement',
        groupName: g ? g.name : 'Unknown Group',
        groupId: s.groupId,
        details: `Payment method: ${s.method}`
      });
    });

    setUnifiedHistory(historyList);
  };

  useEffect(() => {
    loadHistoryData();
  }, []);

  // Filter and Sort logic
  const filteredHistory = unifiedHistory
    .filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.paidBy.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesGroup = selectedGroup ? item.groupId === selectedGroup : true;
      const matchesType = selectedType === 'all' ? true : item.type === selectedType;

      return matchesSearch && matchesGroup && matchesType;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  // Export CSV handler
  const handleExportCSV = () => {
    if (filteredHistory.length === 0) {
      toast.error('No transaction records to export.');
      return;
    }

    const headers = ['Date', 'Type', 'Description', 'Group', 'Amount', 'Paid By', 'Details'];
    const rows = filteredHistory.map((item) => [
      item.date,
      item.type.toUpperCase(),
      item.title,
      item.groupName,
      item.amount,
      item.paidBy,
      item.details
    ]);

    exportToCSV('expense_splitter_transactions', headers, rows);
    toast.success('Successfully exported transactions as CSV!');
  };

  const getCategoryColor = (catId) => {
    const cat = CATEGORIES.find(c => c.id === catId);
    return cat ? cat.color : '#10b981';
  };

  return (
    <div className="page-container history-page-wrapper">
      <header className="dashboard-header flex-header">
        <div className="header-info">
          <h1 className="header-title">Repayment & Split History</h1>
          <p className="header-subtitle">Unified ledger displaying all your past group expenses and settlements.</p>
        </div>
        <Button onClick={handleExportCSV} variant="secondary" icon={MdFileDownload}>
          Export CSV
        </Button>
      </header>

      {/* Unified Filter Dashboard */}
      <section className="glass-card filters-panel details-card-padding">
        {/* Search */}
        <div className="search-input-wrapper">
          <MdSearch size={22} className="search-icon-inside" />
          <input
            type="text"
            placeholder="Search by description, payer name..."
            className="filter-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Group Filter */}
        <div className="filter-select-wrapper">
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="form-select"
            style={{ marginTop: 0 }}
          >
            <option value="">All Groups</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div className="filter-select-wrapper">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="form-select"
            style={{ marginTop: 0 }}
          >
            <option value="all">All Types</option>
            <option value="expense">Expenses Only</option>
            <option value="settlement">Settlements Only</option>
          </select>
        </div>

        {/* Sorting */}
        <div className="filter-select-wrapper">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="form-select"
            style={{ marginTop: 0 }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </section>

      {/* History Ledger Table */}
      {filteredHistory.length === 0 ? (
        <EmptyState 
          title="No Logs Recorded"
          description="We couldn't find any transaction matches. Try clearing filters or recording new expenses."
          actionText={(searchQuery || selectedGroup || selectedType !== 'all') ? "Reset Filters" : null}
          onAction={() => { setSearchQuery(''); setSelectedGroup(''); setSelectedType('all'); }}
        />
      ) : (
        <div className="glass-card details-card-padding">
          <div className="fintech-table-container">
            <table className="fintech-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Group</th>
                  <th>Amount</th>
                  <th>Paid By</th>
                  <th>Type</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="expense-name-cell">
                        <div 
                          className="expense-category-icon"
                          style={{
                            borderColor: `${item.type === 'expense' ? getCategoryColor(item.category) : 'var(--success)'}33`,
                            color: item.type === 'expense' ? getCategoryColor(item.category) : 'var(--success)',
                            background: item.type === 'expense' ? 'rgba(255,255,255,0.02)' : 'rgba(16, 185, 129, 0.1)'
                          }}
                        >
                          {item.type === 'expense' ? <MdReceipt size={18} /> : <MdPayment size={18} />}
                        </div>
                        <div>
                          <h4 className="expense-title">{item.title}</h4>
                          <span className="expense-notes">{item.details}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.groupName}</span>
                    </td>

                    <td>
                      <span 
                        className="expense-amount" 
                        style={item.type === 'settlement' ? { color: 'var(--success)' } : {}}
                      >
                        ₹{item.amount.toLocaleString()}
                      </span>
                    </td>

                    <td>
                      <span className="chip info" style={{ textTransform: 'none', fontWeight: 600 }}>{item.paidBy}</span>
                    </td>

                    <td>
                      <span className={`chip ${item.type === 'expense' ? 'warning' : 'success'}`} style={{ fontSize: '0.7rem' }}>
                        {item.type}
                      </span>
                    </td>

                    <td>
                      <div className="history-date-wrapper">
                        <MdDateRange size={14} />
                        <span>{formatDate(item.date)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
