import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { Panel, PanelHeader, StatRow, SeverityTag, StatusTag, Skel, Empty } from '../../components/common';
import { Eye, CheckCircle, ClipboardCheck } from 'lucide-react';
import { timeAgo, issueTypeConfig, truncate } from '../../utils/helpers';

/**
 * Inspector's job is triage, not overview. The layout is a WORKLIST
 * first — a dense queue table takes most of the page — with a
 * narrow sidebar of running counts and a checklist, rather than a
 * row of KPI cards up top. This is the inverse emphasis of the
 * Admin dashboard on purpose: an admin watches the system, an
 * inspector works through it.
 */
export default function InspectorDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['inspector-stats'],
    queryFn: async () => (await api.get('/analytics/inspector-stats')).data.data,
  });

  const { data: pending, isLoading: pendingLoading } = useQuery({
    queryKey: ['pending-review'],
    queryFn: async () => (await api.get('/reports?status=reported&limit=12')).data.data,
  });

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <h1 className="text-h1" style={{ margin: 0 }}>Inspection Queue</h1>
        <p className="text-meta" style={{ margin: '3px 0 0' }}>Reports waiting for your review, oldest first</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 18 }} className="inspector-split">

        {/* Worklist — the page's actual job, gets the most space */}
        <Panel variant="bordered">
          <PanelHeader title={`Pending Review (${pending?.length ?? 0})`}>
            <Link to="/dashboard/admin/reports" className="btn-link">Full report log →</Link>
          </PanelHeader>

          {pendingLoading ? <div style={{ padding: 16 }}><Skel rows={6} height={42} /></div> : !pending?.length ? (
            <Empty icon={CheckCircle} title="Queue is clear" description="Nothing is waiting for inspection right now." />
          ) : (
            <table className="dtable dtable-compact">
              <thead><tr><th></th><th>Report</th><th>Region</th><th>Severity</th><th style={{ textAlign: 'right' }}>Waiting</th></tr></thead>
              <tbody>
                {pending.map((r: any) => (
                  <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/dashboard/reports/${r.id}`}>
                    <td style={{ width: 22 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: r.severity === 'critical' ? 'var(--error)' : 'var(--n-300)', display: 'inline-block' }} /></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{truncate(r.title, 42)}</div>
                      <div className="text-mono" style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>{r.report_number} · {issueTypeConfig[r.issue_type]?.label}</div>
                    </td>
                    <td style={{ color: 'var(--text-2)' }}>{r.region_name || '—'}</td>
                    <td><SeverityTag severity={r.severity} /></td>
                    <td style={{ textAlign: 'right', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{timeAgo(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>

        {/* Narrow rail — counts + checklist, not another stats grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Panel variant="bordered">
            <PanelHeader title="Today" />
            <div style={{ padding: '4px 16px 12px' }}>
              <StatRow label="Pending review" value={stats?.pending ?? 0} />
              <StatRow label="Under review" value={stats?.under_review ?? 0} />
              <StatRow label="Verified today" value={stats?.verified_today ?? 0} />
              <StatRow label="Critical, unresolved" value={stats?.critical_open ?? 0} />
            </div>
          </Panel>

          <Panel variant="flat" style={{ background: 'var(--primary)', borderRadius: 'var(--r-panel)', padding: 18, color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12, fontWeight: 700, fontSize: '0.83rem' }}>
              <ClipboardCheck size={15} /> Inspection checklist
            </div>
            <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Confirm GPS pin location', 'Verify issue type matches photos', 'Assess severity', 'Add inspection notes', 'Route to a maintenance team'].map((s, i) => (
                <li key={s} style={{ display: 'flex', gap: 9, fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--mono)' }}>{String(i + 1).padStart(2, '0')}</span>
                  {s}
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      </div>

      <style>{`@media (max-width: 880px) { .inspector-split { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
