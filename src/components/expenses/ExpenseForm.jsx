import React, { useState, useEffect } from 'react';
import { CATEGORIES } from '../../utils/constants';
import SplitSelector from './SplitSelector';
import Button from '../ui/Button';
import Input from '../ui/Input';
import useToast from '../../hooks/useToast';

const ExpenseForm = ({ groups = [], initialData = null, defaultGroupId = '', onSave, onCancel }) => {
  const toast = useToast();
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupId, setGroupId] = useState('');
  
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('You');
  const [category, setCategory] = useState('Others');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [splitType, setSplitType] = useState('equal');
  const [shares, setShares] = useState({});

  // Initialize form if editing initialData
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setAmount(initialData.amount || '');
      setGroupId(initialData.groupId || '');
      setPaidBy(initialData.paidBy || 'You');
      setCategory(initialData.category || 'Others');
      setNotes(initialData.notes || '');
      setDate(initialData.date || new Date().toISOString().split('T')[0]);
      setSplitType(initialData.splitType || 'equal');
      setShares(initialData.shares || {});
    } else if (defaultGroupId) {
      setGroupId(defaultGroupId);
    } else if (groups.length > 0) {
      setGroupId(groups[0].id);
    }
  }, [initialData, defaultGroupId, groups]);

  // Update selected group details whenever groupId changes
  useEffect(() => {
    const group = groups.find(g => g.id === groupId);
    setSelectedGroup(group || null);
    if (group && !initialData) {
      // Default paidBy to 'You' or first member if 'You' is not in group (unlikely)
      const members = group.members || [];
      if (members.includes('You')) {
        setPaidBy('You');
      } else if (members.length > 0) {
        setPaidBy(members[0]);
      }
    }
  }, [groupId, groups, initialData]);

  const handleGroupChange = (e) => {
    setGroupId(e.target.value);
    setShares({}); // Reset shares when group changes
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleSharesChange = (newShares) => {
    setShares(newShares);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!groupId) {
      toast.error('Please select a group.');
      return;
    }
    if (!title.trim()) {
      toast.error('Please enter an expense title.');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error('Please enter a valid amount greater than 0.');
      return;
    }

    const members = selectedGroup ? selectedGroup.members : ['You'];
    const totalAmount = Number(amount);

    // Validate splits
    const sumShares = Object.values(shares).reduce((sum, v) => sum + (Number(v) || 0), 0);
    const isBalanced = Math.abs(sumShares - totalAmount) < 0.1;

    if (!isBalanced) {
      toast.error('The split amounts do not match the total expense amount.');
      return;
    }

    const expenseData = {
      groupId,
      title: title.trim(),
      amount: totalAmount,
      paidBy,
      category,
      notes: notes.trim(),
      date,
      splitType,
      shares
    };

    onSave(expenseData);
  };

  const members = selectedGroup ? selectedGroup.members : ['You'];

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      
      {!defaultGroupId && !initialData && (
        <div className="form-group">
          <label htmlFor="expense-group" className="input-label">Group</label>
          <select
            id="expense-group"
            value={groupId}
            onChange={handleGroupChange}
            className="form-select"
            required
          >
            <option value="" disabled>Select a group</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
      )}

      <Input
        label="Expense Title"
        type="text"
        placeholder="e.g. Broadband, Dinner, Groceries"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <div className="form-grid-2">
        <Input
          label="Total Amount (₹)"
          type="number"
          step="any"
          placeholder="0.00"
          value={amount}
          onChange={handleAmountChange}
          required
        />
        
        <div className="form-group">
          <label htmlFor="expense-paidby" className="input-label">Paid By</label>
          <select
            id="expense-paidby"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            className="form-select"
            required
          >
            {members.map(member => (
              <option key={member} value={member}>{member}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="input-label">Category</label>
        <div className="category-select-grid">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                className={`category-select-item ${isActive ? 'active' : ''}`}
                onClick={() => setCategory(cat.id)}
                style={isActive ? { borderColor: cat.color, boxShadow: `0 0 0 1px ${cat.color}` } : {}}
              >
                <Icon size={20} style={{ color: isActive ? cat.color : 'inherit' }} />
                <span style={{ fontSize: '0.75rem' }}>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Input
        label="Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />

      <Input
        label="Notes (Optional)"
        type="text"
        placeholder="Add details, link, etc."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <div className="form-group">
        <label className="input-label">Split Type</label>
        <div className="split-type-tabs">
          <button
            type="button"
            className={`split-type-tab ${splitType === 'equal' ? 'active' : ''}`}
            onClick={() => setSplitType('equal')}
          >
            Split Equally
          </button>
          <button
            type="button"
            className={`split-type-tab ${splitType === 'custom' ? 'active' : ''}`}
            onClick={() => setSplitType('custom')}
          >
            Split Manually
          </button>
        </div>
      </div>

      <SplitSelector
        members={members}
        amount={amount}
        splitType={splitType}
        shares={shares}
        onChange={handleSharesChange}
      />

      <div className="form-actions">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} type="button">
            Cancel
          </Button>
        )}
        <Button variant="primary" type="submit">
          {initialData ? 'Save Changes' : 'Add Expense'}
        </Button>
      </div>
    </form>
  );
};

export default ExpenseForm;
