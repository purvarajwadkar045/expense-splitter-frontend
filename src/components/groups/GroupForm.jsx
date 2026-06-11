import React, { useState } from 'react';
import { MdClose, MdAdd } from 'react-icons/md';
import Input from '../ui/Input';
import Button from '../ui/Button';
import showToast from '../ui/Toast';

const GroupForm = ({ onSubmit, initialData = null }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [members, setMembers] = useState(
    initialData?.members?.filter(m => m !== 'You') || []
  );
  const [newMember, setNewMember] = useState('');

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast.error('Group name is required');
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      members: members // 'You' is added in service level
    });
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <Input
        label="Group Name"
        name="name"
        placeholder="e.g. Goa Vacation, Room 204"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <Input
        label="Description (Optional)"
        name="description"
        placeholder="e.g. Rent, food, and petrol logs..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
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
          Press Enter or click Add to add names.
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
