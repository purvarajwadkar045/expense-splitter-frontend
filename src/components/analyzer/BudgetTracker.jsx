import React, { useState, useEffect } from 'react';
import { MdEdit, MdCheckCircle, MdWarning, MdError, MdClose } from 'react-icons/md';
import analyticsService from '../../services/analyticsService';

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const getCurrentMonth = () => new Date().toISOString().slice(0, 7);

const BudgetTracker = ({ budgetData, loading, onBudgetSaved }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    setInputVal(budgetData?.budget != null ? String(budgetData.budget) : '');
  }, [budgetData]);

  const handleSave = async () => {
    const val = Number(inputVal);
    if (Number.isNaN(val) || val <= 0) {
      setSaveError('Enter a budget greater than zero.');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      const updatedBudget = await analyticsService.setBudget(
        budgetData?.month || getCurrentMonth(),
        val,
      );
      onBudgetSaved(updatedBudget);
      setModalOpen(false);
    } catch (error) {
      setSaveError(error.response?.data?.detail || 'Unable to save budget. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const hasBudget = budgetData?.status !== 'not_set' && budgetData?.budget != null;
  const spent = budgetData?.spent || 0;
  const remaining = budgetData?.remaining || 0;
  const percent = budgetData?.percentage_used || 0;
  const status = budgetData?.status || 'not_set';

  const statusConfig = {
    within_budget: {
      color: 'var(--success)',
      fillColor: 'var(--success)',
      icon: MdCheckCircle,
      message: "You're within your monthly budget.",
      bg: 'rgba(16, 185, 129, 0.08)',
      border: 'rgba(16, 185, 129, 0.2)',
    },
    near_limit: {
      color: 'var(--warning)',
      fillColor: 'var(--warning)',
      icon: MdWarning,
      message: "You're close to your monthly budget.",
      bg: 'rgba(245, 158, 11, 0.08)',
      border: 'rgba(245, 158, 11, 0.2)',
    },
    exceeded: {
      color: 'var(--error)',
      fillColor: 'var(--error)',
      icon: MdError,
      message: `You've exceeded your budget by ${fmt(Math.abs(remaining))}.`,
      bg: 'rgba(239, 68, 68, 0.08)',
      border: 'rgba(239, 68, 68, 0.2)',
    },
  };

  if (loading) {
    return (
      <div className="glass-card analyzer-chart-card">
        <div className="shimmer-card" style={{ height: 20, width: '45%', borderRadius: 6, marginBottom: 8 }} />
        <div className="shimmer-card" style={{ height: 12, width: '60%', borderRadius: 6, marginBottom: 28 }} />
        <div className="shimmer-card" style={{ height: 100, borderRadius: 10 }} />
      </div>
    );
  }

  const cfg = statusConfig[status];
  const StatusIcon = cfg?.icon;

  return (
    <>
      <div className="glass-card analyzer-chart-card">
        <div className="analyzer-chart-header">
          <div>
            <h3 className="analyzer-card-title">Budget Tracker</h3>
            <p className="analyzer-card-subtitle">Monthly spending limit</p>
          </div>
          <button
            className="btn-secondary btn-sm"
            onClick={() => setModalOpen(true)}
            id="budget-set-btn"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <MdEdit size={14} />
            Set Budget
          </button>
        </div>

        {!hasBudget ? (
          <div className="analyzer-empty-chart" style={{ margin: '20px 0 0' }}>
            <p>No budget set for this month.</p>
          </div>
        ) : (
          <>
        {/* Budget Summary Row */}
        <div className="budget-summary-row">
          <div className="budget-stat-item">
            <span className="budget-stat-label">Monthly Budget</span>
            <span className="budget-stat-value">{fmt(budgetData.budget)}</span>
          </div>
          <div className="budget-stat-item">
            <span className="budget-stat-label">Spent</span>
            <span className="budget-stat-value" style={{ color: cfg.color }}>{fmt(spent)}</span>
          </div>
          <div className="budget-stat-item">
            <span className="budget-stat-label">Remaining</span>
            <span className="budget-stat-value" style={{ color: remaining >= 0 ? 'var(--success)' : 'var(--error)' }}>
              {remaining >= 0 ? fmt(remaining) : `-${fmt(Math.abs(remaining))}`}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="budget-progress-section">
          <div className="budget-progress-header">
            <span className="budget-progress-label">Budget Used</span>
            <span className="budget-progress-pct" style={{ color: cfg.color }}>{percent}%</span>
          </div>
          <div className="budget-progress-track">
            <div
              className="budget-progress-fill"
              style={{
                width: `${Math.min(percent, 100)}%`,
                background: cfg.fillColor,
              }}
            />
          </div>
        </div>

        {/* Status Message */}
        <div className="budget-status-msg" style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.color }}>
          <StatusIcon size={16} />
          <span>{cfg.message}</span>
        </div>
          </>
        )}
      </div>

      {/* Set Budget Modal */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: 380 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h4 className="modal-title">Set Monthly Budget</h4>
              <button className="modal-close-btn" onClick={() => setModalOpen(false)}>
                <MdClose size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', marginBottom: 20 }}>
                Set your monthly spending limit to track how much you've spent.
              </p>
              <div className="form-group">
                <label className="form-label" htmlFor="budget-input">Monthly Limit</label>
                <div className="input-wrapper">
                  <span className="input-icon-left" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 700 }}>₹</span>
                  <input
                    id="budget-input"
                    type="number"
                    className="auth-input with-icon"
                    placeholder="e.g. 15000"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    autoFocus
                    min="1"
                  />
                </div>
              </div>
              {saveError && (
                <p style={{ color: 'var(--error)', fontSize: '0.8rem', marginTop: 10 }}>{saveError}</p>
              )}
              <div className="form-actions">
                <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleSave} id="budget-save-btn" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Budget'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BudgetTracker;
