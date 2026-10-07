import React, { useState } from 'react';
import { MdFileDownload, MdClose, MdPictureAsPdf, MdTableChart } from 'react-icons/md';
import analyticsService from '../../services/analyticsService';
import useToast from '../../hooks/useToast';

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

// ─── CSV Export ───────────────────────────────────────────────────────────────

// ─── Report Preview Modal ─────────────────────────────────────────────────────

const ReportPreviewModal = ({ onClose, onExport, expenses, summary, categories }) => {
  const topCat = categories?.[0];
  const date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 620 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h4 className="modal-title">Expense Report Preview</h4>
          <button className="modal-close-btn" onClick={onClose}><MdClose size={18} /></button>
        </div>
        <div className="modal-body">
          {/* Report header */}
          <div className="report-preview-header">
            <div>
              <p className="report-preview-title">Expense Splitter — Expense Report</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Generated on {date}</p>
            </div>
            <div className="report-preview-badge">Preview</div>
          </div>

          {/* Summary grid */}
          <div className="report-preview-grid">
            {[
              { label: 'Total Expenses', value: fmt(summary?.totalExpenses ?? 0) },
              { label: 'My Spending',    value: fmt(summary?.mySpending ?? 0) },
              { label: 'I Owe',          value: fmt(summary?.iOwe ?? 0) },
              { label: 'I Am Owed',      value: fmt(summary?.iAmOwed ?? 0) },
              { label: 'Transactions',   value: summary?.totalTransactions ?? 0 },
              { label: 'Top Category',   value: topCat?.name ?? '—' },
            ].map((item) => (
              <div key={item.label} className="report-preview-stat">
                <span className="report-preview-stat-label">{item.label}</span>
                <span className="report-preview-stat-value">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Top 5 expenses mini-table */}
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '16px 0 8px' }}>
            Top Expenses
          </p>
          <div className="report-preview-table">
            {expenses?.slice(0, 5).map((e, i) => (
              <div key={e.id} className="report-preview-row">
                <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem', minWidth: 18 }}>{i + 1}.</span>
                <span style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-pure)', fontWeight: 500 }}>{e.expense}</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{e.group}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>{fmt(e.amount)}</span>
              </div>
            ))}
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 16, fontStyle: 'italic' }}>
            💡 Full PDF export requires a PDF library integration (e.g. jsPDF). Use CSV export for complete data.
          </p>

          <div className="form-actions">
            <button className="btn-secondary" onClick={onClose}>Close</button>
            <button
              className="btn-primary"
              onClick={() => { onExport(); onClose(); }}
              id="report-modal-csv-btn"
            >
              <MdFileDownload size={16} />
              Export CSV Instead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const REPORT_CARDS = [
  { id: 'summary',  label: 'Expense Summary',    icon: MdTableChart,     desc: 'All transactions with totals' },
  { id: 'category', label: 'Category Report',    icon: MdTableChart,     desc: 'Breakdown by spending category' },
  { id: 'monthly',  label: 'Monthly Spending',   icon: MdTableChart,     desc: 'Month-by-month analysis' },
  { id: 'member',   label: 'Member Report',      icon: MdTableChart,     desc: 'Who paid and who owes' },
];

const ReportsExport = ({ expenses, summary, categories, filters, loading }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState('summary');
  const [exported, setExported] = useState(false);
  const [exporting, setExporting] = useState(false);
  const toast = useToast();

  const handleCSV = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const response = await analyticsService.exportReport(filters, selectedReport);
      const blob = response.data;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedReport}_report.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setExported(true);
      toast.success('Report exported successfully.');
      setTimeout(() => setExported(false), 3000);
    } catch (error) {
      toast.error('Unable to export report.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card analyzer-chart-card">
        <div className="shimmer-card" style={{ height: 20, width: '40%', borderRadius: 6, marginBottom: 20 }} />
        <div className="shimmer-card" style={{ height: 80, borderRadius: 10 }} />
      </div>
    );
  }

  return (
    <>
      <div className="glass-card analyzer-chart-card">
        <div className="analyzer-chart-header">
          <div>
            <h3 className="analyzer-card-title">Reports & Export</h3>
            <p className="analyzer-card-subtitle">Download your expense analysis for the selected period</p>
          </div>
        </div>

        {/* Report type cards */}
        <div className="reports-cards-grid">
          {REPORT_CARDS.map((r) => (
            <button
              key={r.id}
              className={`report-type-card ${selectedReport === r.id ? 'selected' : ''}`}
              onClick={() => setSelectedReport(r.id)}
              id={`report-type-${r.id}`}
            >
              <r.icon size={20} />
              <span className="report-type-label">{r.label}</span>
              <span className="report-type-desc">{r.desc}</span>
            </button>
          ))}
        </div>

        {/* Export Actions */}
        <div className="reports-actions">
          <button
            className={`btn-primary ${exported ? 'btn-success-state' : ''}`}
            onClick={handleCSV}
            disabled={exporting}
            id="export-csv-btn"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <MdFileDownload size={18} />
            {exporting ? 'Exporting...' : exported ? 'Downloaded!' : 'Export CSV'}
          </button>
          <button
            className="btn-secondary"
            onClick={() => setPreviewOpen(true)}
            id="export-pdf-btn"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <MdPictureAsPdf size={18} />
            PDF Preview
          </button>
        </div>
      </div>

      {previewOpen && (
        <ReportPreviewModal
          onClose={() => setPreviewOpen(false)}
          expenses={expenses}
          summary={summary}
          categories={categories}
          onExport={handleCSV}
        />
      )}
    </>
  );
};

export default ReportsExport;
