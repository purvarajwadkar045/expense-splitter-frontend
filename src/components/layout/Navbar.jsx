import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MdMenu, MdNotifications, MdAccountCircle, MdLogout, MdSearch, MdDarkMode, MdLightMode } from 'react-icons/md';
import { useAuth } from '../../hooks/useAuth';
import notificationService from '../../services/notificationService';

const Navbar = ({ toggleSidebar, onSearch }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [searchVal, setSearchVal] = useState('');

  // Notifications dynamically synced
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to load notifications in Navbar:', err);
    }
  };

  useEffect(() => {
    loadNotifications();
    window.addEventListener('notifications-updated', loadNotifications);
    return () => window.removeEventListener('notifications-updated', loadNotifications);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchVal(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      loadNotifications();
      window.dispatchEvent(new Event('notifications-updated'));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button onClick={toggleSidebar} className="sidebar-toggle">
          <MdMenu size={24} />
        </button>
        <Link to="/dashboard" className="nav-logo">
          <span className="nav-logo-text">Splitwise</span>
        </Link>
      </div>

      <div className="navbar-search">
        <MdSearch className="search-icon" size={20} />
        <input
          type="text"
          placeholder="Search groups, members, or expenses..."
          className="search-input"
          value={searchVal}
          onChange={handleSearchChange}
        />
      </div>

      <div className="navbar-right">
        {/* Theme Toggle */}
        <button onClick={toggleTheme} className="nav-action-btn" title="Toggle Theme">
          {theme === 'light' ? <MdDarkMode size={20} /> : <MdLightMode size={20} />}
        </button>

        {/* Notifications Icon and Popout */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false); }} 
            className="nav-action-btn"
            title="Notifications"
          >
            <MdNotifications size={20} />
            {unreadCount > 0 && <span className="badge-unread" />}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '55px',
                  width: '320px',
                  background: 'rgba(11, 15, 25, 0.95)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--glass-shadow)',
                  padding: '20px',
                  zIndex: 120
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h4 style={{ margin: 0, color: 'var(--text-pure)', fontFamily: 'var(--font-display)' }}>Notifications</h4>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllRead} 
                      style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      style={{ 
                        display: 'flex', 
                        gap: '10px', 
                        padding: '10px', 
                        borderRadius: 'var(--radius-sm)', 
                        background: notif.unread ? 'rgba(99,102,241,0.05)' : 'transparent',
                        border: '1px solid',
                        borderColor: notif.unread ? 'rgba(99,102,241,0.1)' : 'transparent'
                      }}
                    >
                      <div style={{ flex: 1, fontSize: '0.8rem', color: 'var(--text-main)' }}>
                        <p style={{ margin: 0 }} dangerouslySetInnerHTML={{ __html: notif.message }} />
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{notif.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid var(--glass-border)', marginTop: '14px', paddingTop: '10px', textAlign: 'center' }}>
                  <Link 
                    to="/notifications" 
                    onClick={() => setNotifOpen(false)} 
                    style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700 }}
                  >
                    View all notifications
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); }} 
            className="profile-dropdown-trigger"
          >
            <div className="user-avatar-placeholder">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="user-name-label">{user?.name || 'User'}</span>
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="profile-dropdown"
              >
                <div className="profile-dropdown-header">
                  <p className="name">{user?.name || 'Guest'}</p>
                  <p className="email">{user?.email || 'guest@example.com'}</p>
                </div>
                <Link to="/profile" onClick={() => setDropdownOpen(false)} className="profile-dropdown-item">
                  <MdAccountCircle size={18} />
                  Profile Details
                </Link>
                <button onClick={handleLogout} className="profile-dropdown-item logout">
                  <MdLogout size={18} />
                  Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
