import React, { useState, useEffect } from 'react';
import { MdPayment } from 'react-icons/md';
import Button from '../ui/Button';
import Input from '../ui/Input';
import useToast from '../../hooks/useToast';
import {
  getMemberDisplayName,
  getMemberKey
} from '../../utils/helpers';

const SettlementForm = ({
  members = [],
  suggestedSettlements = [],
  onSave,
  onCancel
}) => {
  const toast = useToast();

  // Store member IDs as strings because HTML select values are strings.
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('UPI');

  // Set default values when members or suggestions change.
  useEffect(() => {
    if (suggestedSettlements.length > 0) {
      handleSelectSuggestion(suggestedSettlements[0]);
      return;
    }

    if (members.length === 0) {
      setFrom('');
      setTo('');
      return;
    }

    const firstMember = members[0];

    const secondMember = members.find(
      (member) =>
        String(getMemberKey(member)) !==
        String(getMemberKey(firstMember))
    );

    setFrom(String(getMemberKey(firstMember)));

    if (secondMember) {
      setTo(String(getMemberKey(secondMember)));
    } else {
      setTo('');
    }
  }, [members, suggestedSettlements]);

  const handleSelectSuggestion = (suggestion) => {
    /*
      Suggested settlements may contain names or IDs depending
      on the backend response. Keep their values as strings
      because select values are strings.
    */
    const resolveMemberKey = (value) => {
      const member = members.find((candidate) => (
        String(getMemberKey(candidate)).toLowerCase() === String(value).toLowerCase()
        || String(getMemberDisplayName(candidate)).toLowerCase() === String(value).toLowerCase()
      ));
      return String(member ? getMemberKey(member) : value);
    };

    setFrom(resolveMemberKey(suggestion.from));
    setTo(resolveMemberKey(suggestion.to));
    setAmount(String(suggestion.amount));

    toast.info(
      `Pre-filled settlement: ${suggestion.from} ➔ ${suggestion.to} (₹${suggestion.amount})`
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!from) {
      toast.error('Please select who is paying.');
      return;
    }

    if (!to) {
      toast.error('Please select who is receiving.');
      return;
    }

    if (String(from) === String(to)) {
      toast.error(
        'Payer and recipient must be different members.'
      );
      return;
    }

    if (!amount || Number(amount) <= 0) {
      toast.error(
        'Please enter a valid amount greater than 0.'
      );
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
    <form
      onSubmit={handleSubmit}
      className="auth-form"
    >
      {suggestedSettlements.length > 0 && (
        <div className="form-group">
          <label className="input-label">
            Suggested Quick Settlements
          </label>

          <div className="debts-suggestions-list">
            {suggestedSettlements.map(
              (suggestion, index) => (
                <div
                  key={`suggestion-${index}`}
                  onClick={() =>
                    handleSelectSuggestion(suggestion)
                  }
                  className="debt-suggestion-row"
                  role="button"
                  tabIndex={0}
                >
                  <div className="debt-suggestion-flow">
                    <strong>
                      {suggestion.from}
                    </strong>

                    <span
                      style={{
                        color: 'var(--text-dim)',
                        margin: '0 6px'
                      }}
                    >
                      ➔
                    </span>

                    <strong>
                      {suggestion.to}
                    </strong>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <span className="debt-suggestion-amount">
                      ₹{suggestion.amount}
                    </span>

                    <span className="badge-select">
                      Select
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      <div className="form-grid-2">
        {/* Payer */}
        <div className="form-group">
          <label
            htmlFor="settle-from"
            className="input-label"
          >
            Who Paid? (Debtor)
          </label>

          <select
            id="settle-from"
            value={from}
            onChange={(event) =>
              setFrom(event.target.value)
            }
            className="form-select"
            required
          >
            <option value="" disabled>
              Select payer
            </option>

            {members.map((member) => {
              const memberKey = getMemberKey(member);

              return (
                <option
                  key={String(memberKey)}
                  value={String(memberKey)}
                >
                  {getMemberDisplayName(member)}
                </option>
              );
            })}
          </select>
        </div>

        {/* Recipient */}
        <div className="form-group">
          <label
            htmlFor="settle-to"
            className="input-label"
          >
            Who Received? (Creditor)
          </label>

          <select
            id="settle-to"
            value={to}
            onChange={(event) =>
              setTo(event.target.value)
            }
            className="form-select"
            required
          >
            <option value="" disabled>
              Select recipient
            </option>

            {members.map((member) => {
              const memberKey = getMemberKey(member);

              return (
                <option
                  key={String(memberKey)}
                  value={String(memberKey)}
                >
                  {getMemberDisplayName(member)}
                </option>
              );
            })}
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
          onChange={(event) =>
            setAmount(event.target.value)
          }
          required
        />

        <div className="form-group">
          <label
            htmlFor="settle-method"
            className="input-label"
          >
            Payment Method
          </label>

          <select
            id="settle-method"
            value={method}
            onChange={(event) =>
              setMethod(event.target.value)
            }
            className="form-select"
            required
          >
            <option value="UPI">
              UPI (GPay/PhonePe)
            </option>

            <option value="Cash">
              Cash
            </option>

            <option value="NetBanking">
              Bank Transfer
            </option>

            <option value="Other">
              Other
            </option>
          </select>
        </div>
      </div>

      <div className="form-actions">
        {onCancel && (
          <Button
            variant="secondary"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </Button>
        )}

        <Button
          variant="primary"
          type="submit"
        >
          <MdPayment size={18} />
          Record Payment
        </Button>
      </div>
    </form>
  );
};

export default SettlementForm;