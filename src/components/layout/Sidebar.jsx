import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MdDashboard, MdGroup, MdAttachMoney, MdAccountCircle, MdNotifications, MdHistory, MdPayment, MdLogout } from 'react-icons/md';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { logout } = useAuth();

  const navLinks = [
    { name: 'Dashboard', icon: MdDashboard, path: '/dashboard' },
    { name: 'Groups', icon: MdGroup, path: '/groups' },
    { name: 'Expenses', icon: MdAttachMoney, path: '/expenses' },
    { name: 'Settlements', icon: MdPayment, path: '/settlements' },
    { name: 'Repayment History', icon: MdHistory, path: '/history' },
    { name: 'Notifications', icon: MdNotifications, path: '/notifications' },
    { name: 'My Profile', icon: MdAccountCircle, path: '/profile' }
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <ul className="sidebar-menu">
          {navLinks.map((link) => (
            <li key={link.name} className="sidebar-item">
              <NavLink
                to={link.path}
                onClick={() => {
                  // Only toggle sidebar close on mobile view when clicked
                  if (window.innerWidth <= 1024) {
                    toggleSidebar();
                  }
                }}
                className={({ isActive }) =>
                  isActive ? 'nav-item active' : 'nav-item'
                }
              >
                <link.icon size={22} />
                <span>{link.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <div>
          <button className="logout-btn" onClick={logout}>
            <MdLogout size={22} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
