import React from 'react';
import { MdReceipt, MdPayment, MdGroupAdd } from 'react-icons/md';

const RecentActivity = ({ activities = [] }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'expense':
        return <MdReceipt size={16} />;
      case 'settlement':
        return <MdPayment size={16} />;
      default:
        return <MdGroupAdd size={16} />;
    }
  };

  return (
    <div className="activity-timeline">
      {activities.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>No recent activity.</p>
      ) : (
        activities.map((act) => (
          <div key={act.id} className={`activity-item ${act.type}`}>
            <div className="activity-dot" />
            <div 
              className="activity-item-content"
              dangerouslySetInnerHTML={{ __html: act.message }}
            />
            <span className="activity-time">{act.time}</span>
          </div>
        ))
      )}
    </div>
  );
};

export default RecentActivity;
