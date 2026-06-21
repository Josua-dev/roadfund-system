import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { Panel, PanelHeader, StatusTag, Skel, Empty } from '../../components/common';
import { FileText, Plus, MapPin, Phone } from 'lucide-react';
import { timeAgo, truncate } from '../../utils/helpers';

/**
 * The citizen isn't running operations — they filed a few reports
 * and want to know what happened to them. This reads like a
 * personal account page (closer to "your orders" on a consumer
 * site than an ops dashboard): one CTA, a simple activity feed,
 * a contact card. No KPI grid — there's nothing for a citizen to
 * monitor at a glance the way an admin would.
 */
export default function CitizenDashboard() {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['citizen-stats'],
    queryFn: async () => (await api.get('/reports/my-stats')).data.data,
  });

  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['my-reports-recent'],
    queryFn: async () => (await api.get('/reports/my-reports?limit=6')).data,
  });
  const reports = reportsData?.data || [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 22 }}>
        <div>
          <h1 className="text-display" style={{ margin: 0 }}>Hello, {user?.full_name?.split(' ')[0]}</h1>
          <p className="text-meta" style={{ margin: '5px 0 0' }}>
            {stats?.total ? `You've submitted ${stats.total} report${stats.total !== 1 ? 's' : ''}, ${stats.completed || 0} resolved.` : 'You have not submitted any reports yet.'}
          </p>
        </div>
        <Link to="/dashboard/submit-report" className="btn btn-cta">
          <Plus size={15} /> Report a Road Issue
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 18 }} className="citizen-split">

        {/* Activity feed — vertical list, not a card grid */}
        <Panel variant="bordered">
          <PanelHeader title="Recent Activity" />
          {isLoading ? <div style={{ padding: 16 }}><Skel rows={4} height={56} /></div> : !reports.length ? (
            <Empty icon={FileText} title="Nothing submitted yet" description="When you report a road defect, its progress will show up here."
              action={{ label: 'Submit your first report', onClick: () => window.location.href = '/dashboard/submit-report' }} />
          ) : (
            <div>
              {reports.map((r: any, i: number) => (
                <Link key={r.id} to={`/dashboard/reports/${r.id}`} style={{
                  display: 'flex', gap: 13, padding: '13px 18px',
                  borderBottom: i < reports.length - 1 ? '1px solid var(--n-50)' : 'none',
                  textDecoration: 'none', color: 'inherit',
                }}>
                  <div style={{ width: 3, borderRadius: 2, background: r.status === 'completed' ? 'var(--secondary)' : r.status === 'rejected' ? 'var(--error)' : 'var(--n-200)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{truncate(r.title, 40)}</span>
                      <StatusTag status={r.status} />
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-3)', display: 'flex', gap: 10 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={10} />{r.address ? truncate(r.address, 26) : r.region_name}</span>
                      <span>{timeAgo(r.created_at)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {reports.length > 0 && (
            <div className="panel-foot"><Link to="/dashboard/my-reports" className="btn-link">View all my reports →</Link></div>
          )}
        </Panel>

        {/* Side rail — contact card, no stats grid needed here */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Panel variant="flat" style={{ background: 'var(--primary)', borderRadius: 'var(--r-panel)', padding: 20, color: 'white' }}>
            <div className="text-label" style={{ color: 'var(--accent)', marginBottom: 8 }}>Need urgent help?</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.3rem', fontWeight: 700, marginBottom: 6 }}>
              <Phone size={16} style={{ color: 'rgba(255,255,255,0.5)' }} /> 0800 433 300
            </div>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.6 }}>
              Toll-free RFA hotline for hazardous road conditions that can't wait for the standard review process.
            </p>
          </Panel>

          <Panel variant="bordered">
            <div className="panel-body">
              <div className="text-h3" style={{ marginBottom: 10 }}>Reporting tips</div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
                {['Use GPS capture for an exact pin', 'A clear photo speeds up inspection', 'Mark severity honestly — it affects priority'].map(tip => (
                  <li key={tip} style={{ fontSize: '0.78rem', color: 'var(--text-2)', paddingLeft: 14, position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, color: 'var(--secondary)' }}>—</span>{tip}
                  </li>
                ))}
              </ul>
            </div>
          </Panel>
        </div>
      </div>

      <style>{`@media (max-width: 820px) { .citizen-split { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
