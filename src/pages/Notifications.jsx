import React, { useState, useEffect } from 'react';
import { MdNotifications, MdCheck, MdDelete, MdReceipt, MdPayment, MdGroupAdd } from 'react-icons/md';

import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

import notificationService from '../services/notificationService';
import useToast from '../hooks/useToast';

import '../styles/notifications.css';

const Notifications = () => {
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);

  // Load from backend
  const loadNotifications = async () => {
    try {
      const list = await notificationService.getNotifications();
      setNotifications(list);
    } catch (err) {
      console.warn("Failed to load notifications:", err);
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

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      await loadNotifications();
      window.dispatchEvent(new Event('storage'));
      toast.success('All notifications marked as read.');
    } catch (err) {
      toast.error('Failed to mark notifications as read.');
    }
  };

  const clearAllNotifications = async () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      try {
        const promises = notifications.map(n => notificationService.deleteNotification(n.id));
        await Promise.all(promises);
        await loadNotifications();
        window.dispatchEvent(new Event('storage'));
        toast.success('Notifications cleared.');
      } catch (err) {
        toast.error('Failed to clear notifications.');
      }
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      await loadNotifications();
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.warn("Failed to mark notification as read:", err);
    }
  };

  const deleteNotification = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      await loadNotifications();
      window.dispatchEvent(new Event('storage'));
      toast.success('Notification removed.');
    } catch (err) {
      toast.error('Failed to remove notification.');
    }
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
