import React from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { severityConfig, statusConfig, taskStatusConfig, priorityConfig } from '../../utils/helpers';
import { Severity, ReportStatus, TaskStatus, TaskPriority } from '../../types';

/* ════════════════════════════════════════════════════════════
   These are intentionally NOT one universal "Card" reused for
   everything. Panel takes an explicit variant because a settings
   group, a data table, and a dashboard's lead metric should not
   look like the same component wearing different content.
   ════════════════════════════════════════════════════════════ */

type PanelVariant = 'flat' | 'bordered' | 'elevated';

export const Panel = ({ variant = 'bordered', className = '', children, style }: {
  variant?: PanelVariant; className?: string; children: React.ReactNode; style?: React.CSSProperties;
}) => (
  <div className={`panel-${variant} ${className}`} style={style}>{children}</div>
);

export const PanelHeader = ({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) => (
  <div className="panel-header">
    <div>
      <div className="panel-header-title">{title}</div>
      {subtitle && <div className="panel-header-subtitle">{subtitle}</div>}
    </div>
    {children}
  </div>
);

/* ── Badges ─────────────────────────────────────────────────── */
export const SeverityTag = ({ severity }: { severity: Severity }) => {
  const c = severityConfig[severity];
  return <span className={`tag ${c.tag}`}><span className="dot" style={{ background: c.dotColor }} />{c.label}</span>;
};
export const StatusTag = ({ status }: { status: ReportStatus }) => {
  const c = statusConfig[status];
  return <span className={`tag ${c.tag}`}>{c.label}</span>;
};
export const TaskStatusTag = ({ status }: { status: TaskStatus }) => {
  const c = taskStatusConfig[status];
  return <span className={`tag ${c.tag}`}>{c.label}</span>;
};
export const PriorityTag = ({ priority }: { priority: TaskPriority }) => {
  const c = priorityConfig[priority];
  return <span className={`tag ${c.tag}`}>{c.label}</span>;
};

/* ── Progress meter (no animation spring — instant, like a
   real status readout, not a decorative flourish) ─────────── */
export const Meter = ({ value, tone = 'good', showLabel = true }: { value: number; tone?: 'good' | 'warn' | 'bad'; showLabel?: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
    <div className="meter-track" style={{ flex: 1 }}>
      <div className={`meter-fill ${tone === 'warn' ? 'warn' : tone === 'bad' ? 'bad' : ''}`} style={{ width: `${value}%` }} />
    </div>
    {showLabel && <span className="text-mono" style={{ color: 'var(--text-3)', minWidth: 32, textAlign: 'right' }}>{value}%</span>}
  </div>
);

/* ── KPI tile — for executive-summary contexts only. Distinct
   from a list-row stat; bigger number, no icon-in-a-box motif. ── */
export const KpiTile = ({ label, value, delta, unit }: {
  label: string; value: string | number; delta?: { dir: 'up' | 'down' | 'flat'; text: string }; unit?: string;
}) => (
  <div style={{ padding: '2px 0' }}>
    <div className="text-label" style={{ marginBottom: 6 }}>{label}</div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
      <span className="text-display">{value}</span>
      {unit && <span style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>{unit}</span>}
    </div>
    {delta && (
      <div style={{ fontSize: '0.76rem', marginTop: 4, color: delta.dir === 'up' ? 'var(--secondary-700)' : delta.dir === 'down' ? 'var(--error)' : 'var(--text-3)' }}>
        {delta.dir === 'up' ? '▲' : delta.dir === 'down' ? '▼' : '—'} {delta.text}
      </div>
    )}
  </div>
);

/* ── Compact list-row stat — used in working queues, not exec
   dashboards. Smaller, denser, no baseline-aligned numerals. ── */
export const StatRow = ({ label, value }: { label: string; value: string | number }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '7px 0', borderBottom: '1px solid var(--n-50)', fontSize: '0.83rem' }}>
    <span style={{ color: 'var(--text-2)' }}>{label}</span>
    <span style={{ fontWeight: 700, color: 'var(--text-1)' }}>{value}</span>
  </div>
);

/* ── Skeleton / empty / loading ───────────────────────────── */
export const Skel = ({ rows = 3, height = 44 }: { rows?: number; height?: number }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    {Array.from({ length: rows }).map((_, i) => <div key={i} className="skel" style={{ height, borderRadius: 4 }} />)}
  </div>
);

export const Empty = ({ icon: Icon, title, description, action }: {
  icon: React.ElementType; title: string; description: string; action?: { label: string; onClick: () => void };
}) => (
  <div className="empty">
    <div className="empty-icon"><Icon size={22} /></div>
    <div style={{ fontWeight: 600, color: 'var(--text-1)', fontSize: '0.88rem', marginBottom: 4 }}>{title}</div>
    <p style={{ fontSize: '0.82rem', maxWidth: 280, margin: 0 }}>{description}</p>
    {action && <button onClick={action.onClick} className="btn btn-cta" style={{ marginTop: 16 }}>{action.label}</button>}
  </div>
);

/* ── Page heading — NOT a giant centered hero on every screen.
   Sits left-aligned, modest size, the way enterprise app chrome
   actually behaves (see SAP Fiori, Oracle Fusion shell headers). ── */
export const PageHead = ({ title, subtitle, children, dense = false }: {
  title: string; subtitle?: string; children?: React.ReactNode; dense?: boolean;
}) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: dense ? 14 : 22 }}>
    <div>
      <h1 className={dense ? 'text-h1' : 'text-display'} style={{ margin: 0 }}>{title}</h1>
      {subtitle && <p className="text-meta" style={{ margin: '3px 0 0' }}>{subtitle}</p>}
    </div>
    {children && <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>{children}</div>}
  </div>
);

/* ── Alert ──────────────────────────────────────────────────── */
export const Notice = ({ type, message, onClose }: { type: 'info' | 'success' | 'warning' | 'error'; message: string; onClose?: () => void }) => {
  const map = { info: { cls: 'notice-info', Icon: Info }, success: { cls: 'notice-success', Icon: CheckCircle }, warning: { cls: 'notice-warning', Icon: AlertTriangle }, error: { cls: 'notice-error', Icon: AlertTriangle } }[type];
  return (
    <div className={`notice ${map.cls}`}>
      <map.Icon size={15} style={{ flexShrink: 0, marginTop: 1 }} />
      <p style={{ flex: 1, margin: 0 }}>{message}</p>
      {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', opacity: 0.6 }}><X size={14} /></button>}
    </div>
  );
};

/* ── Table primitives (thin wrapper, dense by default) ───────── */
export const DataTable = ({ headers, compact = false, children }: { headers: string[]; compact?: boolean; children: React.ReactNode }) => (
  <div style={{ overflowX: 'auto' }}>
    <table className={`dtable ${compact ? 'dtable-compact' : ''}`}>
      <thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

/* ── Modal ──────────────────────────────────────────────────── */
export const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex' }}><X size={17} /></button>
        </div>
        <div className="panel-body">{children}</div>
      </div>
    </div>
  );
};

/* ── Pagination — compact numeric, not oversized circular chips ── */
export const Pager = ({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) => {
  if (pages <= 1) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4, marginTop: 14 }}>
      <span className="text-meta" style={{ marginRight: 8 }}>Page {page} of {pages}</span>
      <button disabled={page === 1} onClick={() => onPage(page - 1)} className="btn-icon">‹</button>
      <button disabled={page === pages} onClick={() => onPage(page + 1)} className="btn-icon">›</button>
    </div>
  );
};

/* ── Sidebar filter rail — for table-centric pages (Users,
   Reports). A real left-rail filter panel, not an inline
   filter bar repeated on every list page. ──────────────────── */
export const FilterRail = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ width: 208, flexShrink: 0 }}>
    <div className="text-label" style={{ marginBottom: 12 }}>{title}</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>{children}</div>
  </div>
);

export const FilterGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: 7 }}>{label}</div>
    {children}
  </div>
);
