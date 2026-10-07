import React, { useState, useMemo } from 'react';
import { MdSearch } from 'react-icons/md';

const fmt = (n) =>
  `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const CATEGORY_BADGE_COLORS = {
  Food:          { bg: 'rgba(99,102,241,0.12)',  color: '#818cf8' },
  Travel:        { bg: 'rgba(168,85,247,0.12)',  color: '#c084fc' },
  Shopping:      { bg: 'rgba(6,182,212,0.12)',   color: '#22d3ee' },
  Bills:         { bg: 'rgba(16,185,129,0.12)',  color: '#34d399' },
  Entertainment: { bg: 'rgba(245,158,11,0.12)',  color: '#fbbf24' },
  Other:         { bg: 'rgba(100,116,139,0.12)', color: '#94a3b8' },
};

const PAGE_SIZE = 5;

const CategoryBadge = ({ category }) => {
  const style = CATEGORY_BADGE_COLORS[category] || CATEGORY_BADGE_COLORS.Other;
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: '999px',
        fontSize: '0.72rem',
        fontWeight: 700,
        letterSpacing: '0.02em',
        background: style.bg,
        color: style.color,
      }}
    >
      {category}
    </span>
  );
};

const SkeletonRows = () => (
  <>
    {[1, 2, 3, 4, 5].map((n) => (
      <tr key={n}>
        {[1, 2, 3, 4, 5, 6].map((c) => (
          <td key={c} style={{ padding: '14px 20px' }}>
            <div
              className="shimmer-card"
              style={{ height: 13, borderRadius: 6, width: c === 1 ? '80%' : c === 5 ? '50%' : '65%' }}
            />
          </td>
        ))}
      </tr>
    ))}
  </>
);

const RecentExpenses = ({ data, groupOptions = [], categoryOptions = [], loading }) => {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterGroup, setFilterGroup] = useState('all');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((row) => {
      const matchSearch =
        !search ||
        row.expense.toLowerCase().includes(search.toLowerCase()) ||
        row.paidBy.toLowerCase().includes(search.toLowerCase()) ||
        row.group.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCategory === 'all' || row.category.toLowerCase() === filterCategory;
      const matchGroup =
        filterGroup === 'all' ||
        row.group.toLowerCase().replace(/\s/g, '-') === filterGroup;
      return matchSearch && matchCat && matchGroup;
    });
  }, [data, search, filterCategory, filterGroup]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="glass-card analyzer-chart-card">
      <div className="analyzer-chart-header" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 className="analyzer-card-title">Recent Expenses</h3>
          <p className="analyzer-card-subtitle">Last {data?.length || 0} transactions</p>
        </div>
        <div className="analyzer-table-controls">
          {/* Search */}
          <div className="analyzer-search-wrap">
            <MdSearch size={16} className="analyzer-search-icon" />
            <input
              type="text"
              placeholder="Search expenses…"
              value={search}
              onChange={handleSearchChange}
              className="analyzer-search-input"
              id="recent-expense-search"
            />
          </div>

          {/* Category filter */}
          <select
            className="analyzer-filter-select"
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
            id="table-filter-category"
          >
            <option value="all">All Categories</option>
            {categoryOptions.map((category) => (
              <option key={category.value} value={category.value}>{category.label}</option>
            ))}
          </select>

          {/* Group filter */}
          <select
            className="analyzer-filter-select"
            value={filterGroup}
            onChange={(e) => { setFilterGroup(e.target.value); setPage(1); }}
            id="table-filter-group"
          >
            <option value="all">All Groups</option>
            {groupOptions.map((group) => (
              <option key={group.value} value={group.value}>{group.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="fintech-table-container" style={{ marginTop: 0 }}>
        <table className="fintech-table">
          <thead>
            <tr>
              <th>Expense</th>
              <th>Group</th>
              <th>Paid By</th>
              <th>Category</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonRows />
            ) : pageData.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-dim)' }}>
                  No expense data available for the selected filters.
                </td>
              </tr>
            ) : (
              pageData.map((row) => (
                <tr key={row.id}>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--text-pure)' }}>{row.expense}</span>
                  </td>
                  <td>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{row.group}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                          color: '#fff',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {row.paidBy.charAt(0)}
                      </div>
                      <span style={{ fontSize: '0.875rem' }}>{row.paidBy}</span>
                    </div>
                  </td>
                  <td>
                    <CategoryBadge category={row.category} />
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-pure)' }}>
                    {fmt(row.amount)}
                  </td>
                  <td style={{ color: 'var(--text-dim)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                    {row.date}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="analyzer-pagination">
          <button
            className="btn-secondary btn-sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            id="pagination-prev"
          >
            Previous
          </button>
          <span className="analyzer-pagination-info">
            Page {page} of {totalPages}
          </span>
          <button
            className="btn-secondary btn-sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            id="pagination-next"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentExpenses;
