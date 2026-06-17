import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { MdPayment } from 'react-icons/md';
import Button from '../ui/Button';
import Input from '../ui/Input';
import useToast from '../../hooks/useToast';

const schema = yup.object().shape({
  from: yup.string().required('Debtor payer is required'),
  to: yup
    .string()
    .required('Recipient creditor is required')
    .notOneOf([yup.ref('from')], 'Payer and recipient must be different members'),
  amount: yup
    .number()
    .transform((value, originalValue) => originalValue === '' ? undefined : value)
    .required('Repayment amount is required')
    .positive('Amount must be positive')
    .typeError('Please enter a valid amount'),
  method: yup.string().required('Payment method is required'),
});

const SettlementForm = ({ 
  members = [], 
  suggestedSettlements = [], 
  onSave, 
  onCancel 
}) => {
  const toast = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      from: '',
      to: '',
      amount: '',
      method: 'UPI',
    },
  });

  const handleSelectSuggestion = (sugg) => {
    setValue('from', sugg.from);
    setValue('to', sugg.to);
    setValue('amount', sugg.amount.toString());
    toast.info(`Pre-filled settlement: ${sugg.from} ➔ ${sugg.to} (₹${sugg.amount})`);
  };

  // Set default values from suggestion or member list
  useEffect(() => {
    if (suggestedSettlements.length > 0) {
      handleSelectSuggestion(suggestedSettlements[0]);
    } else {
      let defaultFrom = '';
      if (members.includes('You')) {
        defaultFrom = 'You';
      } else if (members.length > 0) {
        defaultFrom = members[0];
      }
      setValue('from', defaultFrom);

      const potentialCreditors = members.filter(m => m !== defaultFrom && m !== 'You');
      const fallbackTo = members.filter(m => m !== defaultFrom);
      
      let defaultTo = '';
      if (potentialCreditors.length > 0) {
        defaultTo = potentialCreditors[0];
      } else if (fallbackTo.length > 0) {
        defaultTo = fallbackTo[0];
      }
      setValue('to', defaultTo);
    }
  }, [suggestedSettlements, members, setValue]);

  const handleFormSubmit = (data) => {
    onSave({
      ...data,
      amount: Number(data.amount)
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="auth-form">
      
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
            {...register('from')}
            className={`form-select ${errors.from ? 'error' : ''}`}
            required
          >
            <option value="" disabled>Select payer</option>
            {members.map(member => (
              <option key={member} value={member}>{member}</option>
            ))}
          </select>
          {errors.from && <span className="error-text">{errors.from.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="settle-to" className="input-label">Who Received? (Creditor)</label>
          <select
            id="settle-to"
            {...register('to')}
            className={`form-select ${errors.to ? 'error' : ''}`}
            required
          >
            <option value="" disabled>Select recipient</option>
            {members.map(member => (
              <option key={member} value={member}>{member}</option>
            ))}
          </select>
          {errors.to && <span className="error-text">{errors.to.message}</span>}
        </div>
      </div>

      <div className="form-grid-2">
        <Input
          label="Repayment Amount (₹)"
          name="amount"
          type="number"
          step="any"
          placeholder="0.00"
          register={register}
          errors={errors}
          required
        />

        <div className="form-group">
          <label htmlFor="settle-method" className="input-label">Payment Method</label>
          <select
            id="settle-method"
            {...register('method')}
            className={`form-select ${errors.method ? 'error' : ''}`}
            required
          >
            <option value="UPI">UPI (GPay/PhonePe)</option>
            <option value="Cash">Cash</option>
            <option value="NetBanking">Bank Transfer</option>
            <option value="Other">Other</option>
          </select>
          {errors.method && <span className="error-text">{errors.method.message}</span>}
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
