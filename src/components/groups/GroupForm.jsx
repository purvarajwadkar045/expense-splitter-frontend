import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { MdClose } from 'react-icons/md';
import Input from '../ui/Input';
import Button from '../ui/Button';
import showToast from '../ui/Toast';

const schema = yup.object().shape({
  name: yup
    .string()
    .required('Group name is required')
    .min(3, 'Group name must be at least 3 characters'),
  description: yup.string().optional(),
});

const GroupForm = ({ onSubmit, initialData = null }) => {
  const [members, setMembers] = useState(
    initialData?.members?.filter(m => m !== 'You') || []
  );
  const [newMember, setNewMember] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
    },
  });

  const handleAddMember = (e) => {
    e.preventDefault();
    const clean = newMember.trim();
    if (!clean) return;

    if (clean.toLowerCase() === 'you') {
      showToast.info('You are already included by default');
      setNewMember('');
      return;
    }

    if (members.includes(clean)) {
      showToast.info('Member already added');
      return;
    }

    setMembers([...members, clean]);
    setNewMember('');
  };

  const handleRemoveMember = (nameToRemove) => {
    setMembers(members.filter(m => m !== nameToRemove));
  };

  const handleFormSubmit = (data) => {
    onSubmit({
      name: data.name.trim(),
      description: data.description?.trim() || '',
      members: members
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="auth-form">
      <Input
        label="Group Name"
        name="name"
        placeholder="e.g. Goa Vacation, Room 204"
        register={register}
        errors={errors}
        required
      />

      <Input
        label="Description (Optional)"
        name="description"
        placeholder="e.g. Rent, food, and petrol logs..."
        register={register}
        errors={errors}
      />

      <div className="form-group mb-4">
        <label className="form-label">Add Group Members</label>
        
        {/* Chip grid wrapper */}
        <div className="members-chips-input mb-2">
          <div className="member-chip" style={{ background: 'var(--primary-glow)', borderColor: 'var(--primary)' }}>
            <span>You</span>
          </div>
          {members.map((m) => (
            <div key={m} className="member-chip">
              <span>{m}</span>
              <button
                type="button"
                onClick={() => handleRemoveMember(m)}
                className="member-chip-close"
              >
                <MdClose size={14} />
              </button>
            </div>
          ))}
          <input
            type="text"
            placeholder="Type name and press Enter..."
            className="member-chip-input"
            value={newMember}
            onChange={(e) => setNewMember(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddMember(e);
              }
            }}
          />
        </div>
        <span className="form-help-text">
          Press Enter to add names to the group list.
        </span>
      </div>

      <div className="form-actions">
        <Button type="submit" variant="primary">
          {initialData ? 'Save Changes' : 'Create Group'}
        </Button>
      </div>
    </form>
  );
};

export default GroupForm;
