import React, { useState, useEffect } from 'react';
import { MdNotifications, MdCheck, MdDelete, MdReceipt, MdPayment, MdGroupAdd } from 'react-icons/md';

import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

import { INITIAL_NOTIFICATIONS } from '../utils/constants';
import useToast from '../hooks/useToast';

import '../styles/notifications.css';

const Notifications = () => {
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);

  // Load from localStorage
  const loadNotifications = () => {
    const stored = localStorage.getItem('notifications');
    if (!stored) {
      localStorage.setItem('notifications', JSON.stringify(INITIAL_NOTIFICATIONS));
      setNotifications(INITIAL_NOTIFICATIONS);
    } else {
      setNotifications(JSON.parse(stored));
    }
  };

  useEffect(() => {
    loadNotifications();
    
    // Add event listener to sync notifications changes from Navbar or other pages
    const handleStorageChange = () => {
      loadNotifications();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const saveNotifications = (updatedList) => {
    localStorage.setItem('notifications', JSON.stringify(updatedList));
    setNotifications(updatedList);
    // Dispatch custom event to notify Navbar dropdown to re-sync
    window.dispatchEvent(new Event('storage'));
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, unread: false }));
    saveNotifications(updated);
    toast.success('All notifications marked as read.');
  };

  const clearAllNotifications = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      saveNotifications([]);
      toast.success('Notifications cleared.');
    }
  };

  const markAsRead = (id) => {
    const updated = notifications.map((n) => 
      n.id === id ? { ...n, unread: false } : n
    );
    saveNotifications(updated);
  };

  const deleteNotification = (id, e) => {
    e.stopPropagation();
    const updated = notifications.filter((n) => n.id !== id);
    saveNotifications(updated);
    toast.success('Notification removed.');
  };

  const getIcon = (type) => {
    switch (type) {
      case 'expense':
        return <MdReceipt size={20} />;
      case 'settlement':
        return <MdPayment size={20} />;
      case 'group':
      default:
        return <MdGroupAdd size={20} />;
    }
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="page-container notifications-wrapper">
      <header className="notifications-header">
        <div className="notif-header-info">
          <h1>Notification Center</h1>
          <p>
            Stay updated on newly recorded expenses, groups, and settled balances.
          </p>
        </div>
        
        {notifications.length > 0 && (
          <div className="notif-header-actions">
            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} variant="secondary" icon={MdCheck}>
                Mark all read
              </Button>
            )}
            <Button onClick={clearAllNotifications} variant="secondary" className="text-danger" icon={MdDelete}>
              Clear all
            </Button>
          </div>
        )}
      </header>

      {notifications.length === 0 ? (
        <EmptyState 
          title="No Notifications"
          description="You are completely up-to-date! When members add bills or settle, you'll see alerts here."
          icon={MdNotifications}
        />
      ) : (
        <div className="notifications-list">
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              onClick={() => markAsRead(notif.id)}
              className={`notification-card ${notif.unread ? 'unread' : ''} ${notif.type}`}
              style={{ cursor: notif.unread ? 'pointer' : 'default' }}
            >
              <div className="notification-icon-box">
                {getIcon(notif.type)}
              </div>
              
              <div className="notification-content">
                <p 
                  className="notification-message"
                  dangerouslySetInnerHTML={{ __html: notif.message }}
                />
                <div className="notification-meta">
                  <span className="notification-time">{notif.time}</span>
                  {notif.unread && (
                    <span className="badge-new">
                      New
                    </span>
                  )}
                </div>
              </div>

              <button 
                onClick={(e) => deleteNotification(notif.id, e)}
                className="notif-delete-btn"
                title="Remove notification"
              >
                <MdDelete size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
