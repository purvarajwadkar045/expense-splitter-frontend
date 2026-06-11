import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdTrendingUp, MdPeople, MdSecurity, MdPayment } from 'react-icons/md';
import '../styles/landing.css';

const Landing = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', color: 'var(--text-main)' }}>
      {/* Navbar Header */}
      <header style={{
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        borderBottom: '1px solid var(--glass-border)',
        background: 'rgba(2, 6, 23, 0.4)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontFamily: 'var(--font-main)',
            fontSize: '1.5rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Splitwise
          </span>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to="/login" style={{
            padding: '10px 20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--glass-border)',
            fontWeight: 600,
            fontSize: '0.9rem',
            color: 'var(--text-pure)'
          }}>
            Sign In
          </Link>
          <Link to="/register" style={{
            padding: '10px 20px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--primary)',
            fontWeight: 600,
            fontSize: '0.9rem',
            color: 'var(--text-pure)',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
          }}>
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-grid">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="hero-tagline">⚡ Modern Fintech Expense Splitter</span>

            <h1 className="hero-title">
              Split Expenses,<br />
              <span>Not Friendships.</span>
            </h1>

            <p className="hero-subtitle">
              Track shared expenses, settle balances, and manage group spending effortlessly.
              No spreadsheets, no awkward reminders. Just simple, transparent splits.
            </p>

            <div className="hero-buttons">
              <Link to="/register">
                <button className="primary-btn">Get Started</button>
              </Link>
              <Link to="/login">
                <button className="secondary-btn">Create Account</button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="preview-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-pure)' }}>Recent Group Split</span>
                <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '4px 8px', borderRadius: '4px', fontWeight: 600 }}>Active</span>
              </div>
              
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-pure)', marginBottom: '4px', fontFamily: 'var(--font-main)' }}>₹24,500.00</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '24px' }}>Goa Vacation Split</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Priya paid</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-pure)' }}>₹12,000</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Aman owes Priya</span>
                  <span style={{ fontWeight: 600, color: 'var(--error)' }}>₹4,000</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>You owe Priya</span>
                  <span style={{ fontWeight: 600, color: 'var(--error)' }}>₹4,000</span>
                </div>
              </div>
              
              <div style={{ borderTop: '1px solid var(--glass-border)', marginTop: '20px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Simplified Debts Enabled</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 700 }}>✓ Auto-Balanced</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">100k+</div>
            <div className="stat-label">Happy Users</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">₹50M+</div>
            <div className="stat-label">Expenses Tracked</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">0%</div>
            <div className="stat-label">Awkward Debt Talks</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-header">
          <h2>Packed with features you'll love</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>Simplify shared spending with premium split calculations and secure digital ledgers.</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <MdTrendingUp />
            </div>
            <h3>Track Expenses</h3>
            <p>Keep a real-time record of all shared bills, receipts, and subscriptions in one clean interface.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <MdPeople />
            </div>
            <h3>Group Splits</h3>
            <p>Manage shared rent, trips, and dinners by setting up custom split ratios per member.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <MdPayment />
            </div>
            <h3>Simplified Settlements</h3>
            <p>Minimize transaction chains using our automated debt-simplifier. Pay once to clear all debts.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '40px',
        borderTop: '1px solid var(--glass-border)',
        textAlign: 'center',
        background: 'rgba(2, 6, 23, 0.6)',
        color: 'var(--text-dim)',
        fontSize: '0.85rem'
      }}>
        <p>© 2026 Splitwise Expense Inc. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;