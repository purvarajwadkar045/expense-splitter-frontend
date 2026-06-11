import React, { useState, useEffect } from 'react';
import { MdCheckCircle, MdPayment } from 'react-icons/md';
import Button from '../ui/Button';
import Input from '../ui/Input';
import useToast from '../../hooks/useToast';

const SettlementForm = ({ 
  members = [], 
  suggestedSettlements = [], 
  onSave, 
  onCancel 
}) => {
  const toast = useToast();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('UPI');

  // Set default values from the first suggested settlement if available
  useEffect(() => {
    if (suggestedSettlements.length > 0) {
      handleSelectSuggestion(suggestedSettlements[0]);
    } else {
      if (members.includes('You')) {
        setFrom('You');
      } else if (members.length > 0) {
        setFrom(members[0]);
      }
      
      const potentialCreditors = members.filter(m => m !== 'You');
      if (potentialCreditors.length > 0) {
        setTo(potentialCreditors[0]);
      }
    }
  }, [suggestedSettlements, members]);

  const handleSelectSuggestion = (sugg) => {
    setFrom(sugg.from);
    setTo(sugg.to);
    setAmount(sugg.amount.toString());
    toast.info(`Pre-filled settlement: ${sugg.from} ➔ ${sugg.to} (₹${sugg.amount})`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!from) {
      toast.error('Please select who is paying.');
      return;
    }
    if (!to) {
      toast.error('Please select who is receiving.');
      return;
    }
    if (from === to) {
      toast.error('Payer and recipient must be different members.');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error('Please enter a valid amount greater than 0.');
      return;
    }

    const settlementData = {
      from,
      to,
      amount: Number(amount),
      method
    };

    onSave(settlementData);
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      
      {suggestedSettlements.length > 0 && (
        <div className="form-group">
          <label className="input-label">
            Suggested Quick Settlements
          </label>
          <div className="debts-suggestions-list">
            {suggestedSettlements.map((sugg, idx) => (
              <div 
                key={`sugg-${idx}`}
                onClick={() => handleSelectSuggestion(sugg)}
                className="debt-suggestion-row"
              >
                <div className="debt-suggestion-flow">
                  <strong>{sugg.from}</strong>
                  <span style={{ color: 'var(--text-dim)', margin: '0 6px' }}>➔</span>
                  <strong>{sugg.to}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="debt-suggestion-amount">₹{sugg.amount}</span>
                  <span className="badge-select">
                    Select
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="form-grid-2">
        <div className="form-group">
          <label htmlFor="settle-from" className="input-label">Who Paid? (Debtor)</label>
          <select
            id="settle-from"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="form-select"
            required
          >
            <option value="" disabled>Select payer</option>
            {members.map(member => (
              <option key={member} value={member}>{member}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="settle-to" className="input-label">Who Received? (Creditor)</label>
          <select
            id="settle-to"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="form-select"
            required
          >
            <option value="" disabled>Select recipient</option>
            {members.map(member => (
              <option key={member} value={member}>{member}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-grid-2">
        <Input
          label="Repayment Amount (₹)"
          type="number"
          step="any"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <div className="form-group">
          <label htmlFor="settle-method" className="input-label">Payment Method</label>
          <select
            id="settle-method"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="form-select"
            required
          >
            <option value="UPI">UPI (GPay/PhonePe)</option>
            <option value="Cash">Cash</option>
            <option value="NetBanking">Bank Transfer</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="form-actions">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} type="button">
            Cancel
          </Button>
        )}
        <Button variant="primary" type="submit">
          <MdPayment size={18} />
          Record Payment
        </Button>
      </div>
    </form>
  );
};

export default SettlementForm;
