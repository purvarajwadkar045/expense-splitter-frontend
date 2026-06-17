import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { CATEGORIES } from '../../utils/constants';
import SplitSelector from './SplitSelector';
import Button from '../ui/Button';
import Input from '../ui/Input';
import useToast from '../../hooks/useToast';

const schema = yup.object().shape({
  groupId: yup.string().required('Please select a group'),
  title: yup.string().required('Expense title is required').min(2, 'Title is too short'),
  amount: yup
    .number()
    .transform((value, originalValue) => originalValue === '' ? undefined : value)
    .required('Amount is required')
    .positive('Amount must be greater than 0')
    .typeError('Please enter a valid amount'),
  paidBy: yup.string().required('Please select who paid'),
  category: yup.string().required('Please select a category'),
  date: yup.string().required('Date is required'),
  notes: yup.string().optional(),
  splitType: yup.string().oneOf(['equal', 'custom']).required(),
});

const ExpenseForm = ({ groups = [], initialData = null, defaultGroupId = '', onSave, onCancel }) => {
  const toast = useToast();
  const [shares, setShares] = useState({});

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      groupId: initialData?.groupId || defaultGroupId || (groups[0]?.id || ''),
      title: initialData?.title || '',
      amount: initialData?.amount || '',
      paidBy: initialData?.paidBy || 'You',
      category: initialData?.category || 'Others',
      notes: initialData?.notes || '',
      date: initialData?.date || new Date().toISOString().split('T')[0],
      splitType: initialData?.splitType || 'equal',
    },
  });

  const watchGroupId = watch('groupId');
  const watchAmount = watch('amount');
  const watchSplitType = watch('splitType');
  const watchCategory = watch('category');
  const watchPaidBy = watch('paidBy');

  const selectedGroup = groups.find((g) => g.id === watchGroupId);
  const members = selectedGroup ? selectedGroup.members : ['You'];

  // Initialize shares if editing
  useEffect(() => {
    if (initialData) {
      setShares(initialData.shares || {});
    }
  }, [initialData]);

  // Adjust default paidBy when group changes
  useEffect(() => {
    if (selectedGroup && !initialData) {
      const m = selectedGroup.members || [];
      if (m.includes('You')) {
        setValue('paidBy', 'You');
      } else if (m.length > 0) {
        setValue('paidBy', m[0]);
      }
    }
    // Only reset shares if the group changes and we are not in initial edit load
    if (!initialData) {
      setShares({});
    }
  }, [watchGroupId, setValue, groups]);

  const handleSharesChange = (newShares) => {
    setShares(newShares);
  };

  const handleFormSubmit = (data) => {
    const totalAmount = Number(data.amount);

    if (data.splitType === 'custom') {
      const sumShares = Object.values(shares).reduce((sum, v) => sum + (Number(v) || 0), 0);
      const isBalanced = Math.abs(sumShares - totalAmount) < 0.1;

      if (!isBalanced) {
        toast.error(`The split amounts (₹${sumShares}) do not match the total expense amount (₹${totalAmount}).`);
        return;
      }
    }

    onSave({
      ...data,
      amount: totalAmount,
      shares
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="auth-form">
      
      {!defaultGroupId && !initialData && (
        <div className="form-group">
          <label htmlFor="expense-group" className="input-label">Group</label>
          <select
            id="expense-group"
            {...register('groupId')}
            className={`form-select ${errors.groupId ? 'error' : ''}`}
            required
          >
            <option value="" disabled>Select a group</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
          {errors.groupId && <span className="error-text">{errors.groupId.message}</span>}
        </div>
      )}

      <Input
        label="Expense Title"
        name="title"
        type="text"
        placeholder="e.g. Broadband, Dinner, Groceries"
        register={register}
        errors={errors}
        required
      />

      <div className="form-grid-2">
        <Input
          label="Total Amount (₹)"
          name="amount"
          type="number"
          step="any"
          placeholder="0.00"
          register={register}
          errors={errors}
          required
        />
        
        <div className="form-group">
          <label htmlFor="expense-paidby" className="input-label">Paid By</label>
          <select
            id="expense-paidby"
            {...register('paidBy')}
            className={`form-select ${errors.paidBy ? 'error' : ''}`}
            required
          >
            {members.map(member => (
              <option key={member} value={member}>{member}</option>
            ))}
          </select>
          {errors.paidBy && <span className="error-text">{errors.paidBy.message}</span>}
        </div>
      </div>

      <div className="form-group">
        <label className="input-label">Category</label>
        <div className="category-select-grid">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = watchCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                className={`category-select-item ${isActive ? 'active' : ''}`}
                onClick={() => setValue('category', cat.id)}
                style={isActive ? { borderColor: cat.color, boxShadow: `0 0 0 1px ${cat.color}` } : {}}
              >
                <Icon size={20} style={{ color: isActive ? cat.color : 'inherit' }} />
                <span style={{ fontSize: '0.75rem' }}>{cat.label}</span>
              </button>
            );
          })}
        </div>
        {errors.category && <span className="error-text">{errors.category.message}</span>}
      </div>

      <Input
        label="Date"
        name="date"
        type="date"
        register={register}
        errors={errors}
        required
      />

      <Input
        label="Notes (Optional)"
        name="notes"
        type="text"
        placeholder="Add details, link, etc."
        register={register}
        errors={errors}
      />

      <div className="form-group">
        <label className="input-label">Split Type</label>
        <div className="split-type-tabs">
          <button
            type="button"
            className={`split-type-tab ${watchSplitType === 'equal' ? 'active' : ''}`}
            onClick={() => setValue('splitType', 'equal')}
          >
            Split Equally
          </button>
          <button
            type="button"
            className={`split-type-tab ${watchSplitType === 'custom' ? 'active' : ''}`}
            onClick={() => setValue('splitType', 'custom')}
          >
            Split Manually
          </button>
        </div>
      </div>

      <SplitSelector
        members={members}
        amount={watchAmount || 0}
        splitType={watchSplitType}
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
