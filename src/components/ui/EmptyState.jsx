import React from 'react';
import Button from './Button';

const EmptyState = ({
  title = 'No data available',
  description = 'There is nothing to show here yet.',
  icon: Icon,
  actionText,
  onAction,
  actionIcon
}) => {
  return (
    <div className="empty-state-container glass-card">
      <div className="empty-state-icon">
        {Icon ? <Icon size={36} /> : <span style={{ fontSize: '2rem' }}>📊</span>}
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} icon={actionIcon} variant="primary">
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
