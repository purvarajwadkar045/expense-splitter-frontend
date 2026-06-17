import React, { useState, useEffect } from 'react';
import { MdNotifications, MdCheck, MdDelete, MdReceipt, MdPayment, MdGroupAdd, MdRefresh } from 'react-icons/md';

import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Loader from '../components/ui/Loader';
import notificationService from '../services/notificationService';
import useToast from '../hooks/useToast';

import '../styles/notifications.css';

const Notifications = () => {
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load from API
  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError('Could not retrieve notifications. Please check your network connection.');
      toast.error('Failed to fetch notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    
    // Add event listener to sync notifications changes from Navbar
    const handleSync = () => {
      loadNotifications();
    };
    window.addEventListener('notifications-updated', handleSync);
    return () => window.removeEventListener('notifications-updated', handleSync);
  }, []);

  const triggerGlobalSync = () => {
    window.dispatchEvent(new Event('notifications-updated'));
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      toast.success('All notifications marked as read.');
      loadNotifications();
      triggerGlobalSync();
    } catch (err) {
      toast.error('Failed to mark all as read.');
    }
  };

  const clearAllNotifications = async () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      try {
        // Sequentially or via parallel calls delete all notifications
        // Note: Real API might have a delete-all route.
        // For contract readiness, we can loop over deleting them, or call bulk DELETE if available.
        // Let's call delete on each one or call clear endpoint
        for (const notif of notifications) {
          await notificationService.deleteNotification(notif.id);
        }
        toast.success('Notifications cleared.');
        loadNotifications();
        triggerGlobalSync();
      } catch (err) {
        toast.error('Failed to clear notifications.');
      }
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      loadNotifications();
      triggerGlobalSync();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const deleteNotification = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      toast.success('Notification removed.');
      loadNotifications();
      triggerGlobalSync();
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

  if (loading) {
    return (
      <div className="page-container notifications-wrapper">
        <Loader type="skeleton" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container notifications-wrapper">
        <div className="empty-state-container glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-pure)' }}>Something went wrong</h3>
          <p style={{ color: 'var(--text-dim)', marginBottom: '20px' }}>{error}</p>
          <Button onClick={loadNotifications} variant="primary" icon={MdRefresh}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

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
              onClick={() => notif.unread && markAsRead(notif.id)}
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
