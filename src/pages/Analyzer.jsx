import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MdRefresh, MdQueryStats } from 'react-icons/md';

import { getAnalyzerData } from '../data/analyzerData';

// Existing components (preserved)
import AnalyzerFilters from '../components/analyzer/AnalyzerFilters';
import AnalyzerSummaryCards from '../components/analyzer/AnalyzerSummaryCards';
import SpendingTrend from '../components/analyzer/SpendingTrend';
import CategoryBreakdown from '../components/analyzer/CategoryBreakdown';
import GroupSpending from '../components/analyzer/GroupSpending';
import MemberSpending from '../components/analyzer/MemberSpending';
import SmartInsights from '../components/analyzer/SmartInsights';
import RecentExpenses from '../components/analyzer/RecentExpenses';
import SpendingComparison from '../components/analyzer/SpendingComparison';

// New components
import SecondaryStats from '../components/analyzer/SecondaryStats';
import BudgetTracker from '../components/analyzer/BudgetTracker';
import TopExpenses from '../components/analyzer/TopExpenses';
import ReportsExport from '../components/analyzer/ReportsExport';
import ExpenseHeatmap from '../components/analyzer/ExpenseHeatmap';

import '../styles/analyzer.css';

const DEFAULT_FILTERS = {
  dateRange: 'this-month',
  group: 'all',
  category: 'all',
  member: 'all',
  search: '',
  minAmount: '',
  maxAmount: '',
};

const SectionHeading = ({ title, subtitle }) => (
  <div className="analyzer-section-label">
    <h2 className="analyzer-section-title">{title}</h2>
    {subtitle && <p className="analyzer-section-subtitle">{subtitle}</p>}
  </div>
);

const Analyzer = () => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterError, setFilterError] = useState('');

  const fetchData = useCallback(async (activeFilters) => {
    setLoading(true);
    setError('');
    try {
      const result = await getAnalyzerData(activeFilters);
      setData(result);
    } catch (err) {
      console.error('Analyzer fetch error:', err);
      setError('Unable to load analyzer data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (filterError) return undefined;
    const timer = setTimeout(() => fetchData(filters), filters.search ? 350 : 0);
    return () => clearTimeout(timer);
  }, [filters, fetchData]);

  const handleFilterChange = (key, value) => {
    if ((key === 'minAmount' || key === 'maxAmount') && value !== '' && Number(value) < 0) {
      setFilterError('Amounts cannot be negative.');
      return;
    }
    const nextFilters = { ...filters, [key]: value };
    if (nextFilters.minAmount !== '' && nextFilters.maxAmount !== '' && Number(nextFilters.minAmount) > Number(nextFilters.maxAmount)) {
      setFilterError('Minimum amount cannot exceed maximum amount.');
    } else {
      setFilterError('');
    }
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilterError('');
    setFilters(DEFAULT_FILTERS);
  };

  const handleRetry = () => fetchData(filters);

  const handleBudgetSaved = (budget) => {
    setData((previous) => (previous ? { ...previous, budget } : previous));
  };

  return (
    <div className="page-container analyzer-wrapper">

      {/* ── 1. Header + Filters ────────────────────────────── */}
      <motion.header
        className="analyzer-page-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="analyzer-header-left">
          <div className="analyzer-header-icon-wrap">
            <MdQueryStats size={22} />
          </div>
          <div>
            <h1 className="header-title" style={{ fontSize: '1.7rem', marginBottom: 3 }}>
              Expense Analyzer
            </h1>
            <p className="header-subtitle">
              Track your spending, understand your expenses, and manage your money better.
            </p>
          </div>
        </div>

        <div className="analyzer-header-right">
          <AnalyzerFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            groupOptions={data?.filterOptions?.groups}
            memberOptions={data?.filterOptions?.members}
            error={filterError}
          />
          <button
            className="analyzer-refresh-btn"
            onClick={handleRetry}
            title="Refresh data"
            id="analyzer-refresh-btn"
          >
            <MdRefresh size={18} />
          </button>
        </div>
      </motion.header>

      {/* ── Error State ────────────────────────────────────── */}
      {error && !loading && (
        <div className="analyzer-error-banner">
          <span>{error}</span>
          <button className="btn-secondary btn-sm" onClick={handleRetry} id="analyzer-retry-btn">
            Retry
          </button>
        </div>
      )}

      {/* ── 2. Primary KPI Cards ───────────────────────────── */}
      <section className="analyzer-section">
        <AnalyzerSummaryCards summary={data?.summary} loading={loading} />
      </section>

      {/* ── 3. Secondary Statistics ────────────────────────── */}
      <section className="analyzer-section">
        <SecondaryStats stats={data?.secondaryStats} loading={loading} />
      </section>

      {/* ── 4. Spending Trend + Category Breakdown ──────────── */}
      <section className="analyzer-charts-row-1 analyzer-section">
        <SpendingTrend
          data={data?.spendingTrend}
          monthlyStats={data?.monthlyStats}
          loading={loading}
        />
        <CategoryBreakdown data={data?.categoryBreakdown} loading={loading} />
      </section>

      <section className="analyzer-section">
        <ExpenseHeatmap data={data?.heatmap} loading={loading} />
      </section>

      {/* ── 5. Group + Member Analysis ─────────────────────── */}
      <section className="analyzer-charts-row-2 analyzer-section">
        <GroupSpending
          data={data?.groupSpending}
          groupDetails={data?.groupDetails}
          selectedGroup={filters.group}
          loading={loading}
        />
        <MemberSpending
          data={data?.memberSpending}
          memberDetails={data?.memberDetails}
          memberHighlights={data?.memberHighlights}
          loading={loading}
        />
      </section>

      {/* ── 6. Budget Tracker + Spending Comparison ─────────── */}
      <section className="analyzer-charts-row-2 analyzer-section">
        <BudgetTracker
          budgetData={data?.budget}
          loading={loading}
          onBudgetSaved={handleBudgetSaved}
        />
        <SpendingComparison data={data?.spendingComparison} loading={loading} />
      </section>

      {/* ── 7. Top Expenses ─────────────────────────────────── */}
      <section className="analyzer-section">
        <TopExpenses data={data?.topExpenses} loading={loading} />
      </section>

      {/* ── 8. Smart Insights ───────────────────────────────── */}
      <section className="analyzer-section">
        <SectionHeading
          title="Smart Insights"
          subtitle="Key observations calculated from your expense data"
        />
        <SmartInsights insights={data?.insights} loading={loading} />
      </section>

      {/* ── 9. Recent Expenses ──────────────────────────────── */}
      <section className="analyzer-section">
        <RecentExpenses
          data={data?.recentExpenses}
          groupOptions={data?.filterOptions?.groups}
          categoryOptions={data?.categoryBreakdown?.map((category) => ({
            value: category.name.toLowerCase(),
            label: category.name,
          }))}
          loading={loading}
        />
      </section>

      {/* ── 10. Reports & Export ────────────────────────────── */}
      <section className="analyzer-section" style={{ paddingBottom: 40 }}>
        <ReportsExport
          expenses={data?.topExpenses}
          summary={data?.summary}
          categories={data?.categoryBreakdown}
          filters={filters}
          loading={loading}
        />
      </section>

    </div>
  );
};

export default Analyzer;
