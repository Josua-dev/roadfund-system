import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { Panel, PanelHeader, KpiTile, StatusTag, SeverityTag, Skel } from '../../components/common';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowRight, FileText } from 'lucide-react';
import { timeAgo, issueTypeConfig, truncate } from '../../utils/helpers';

const PIE_COLORS = ['#28384A', '#3C7A5C', '#A8762E', '#3C5E78', '#963B3B', '#5C4A78', '#807C73'];

/**
 * Admin gets an EXECUTIVE SUMMARY layout, not the same stats-grid
 * the other three roles use. KPIs run wide along the top edge as
 * a single readout strip (the way a finance/ops dashboard usually
 * opens), then the page splits 2:1 into a dominant trend chart and
 * a narrower breakdown — not two equal-width chart cards.
 */
export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => (await api.get('/analytics/overview')).data.data,
  });

  const { data: recentReports, isLoading: reportsLoading } = useQuery({
    queryKey: ['recent-reports-admin'],
    queryFn: async () => (await api.get('/reports?limit=7&sort_by=created_at&sort_order=DESC')).data.data,
  });

  const { data: chartData } = useQuery({
    queryKey: ['chart-data'],
    queryFn: async () => (await api.get('/analytics/charts')).data.data,
  });

  const pieData = (stats?.by_issue_type || []).map((item: any) => ({
    name: issueTypeConfig[item.issue_type as keyof typeof issueTypeConfig]?.label || item.issue_type,
    value: item.count,
  }));

  return (
    <div>
      <div style={{ marginBottom: 6 }}>
        <h1 className="text-display" style={{ margin: 0 }}>Operations Overview</h1>
        <p className="text-meta" style={{ margin: '3px 0 0' }}>Network-wide status as of today</p>
      </div>

      {/* KPI strip — single wide readout, not a 4-card grid */}
      <Panel variant="elevated" style={{ margin: '18px 0 22px' }}>
        {statsLoading ? <div style={{ padding: 20 }}><Skel rows={1} height={48} /></div> : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr 1fr', gap: 0 }}>
            <div style={{ padding: '18px 22px', borderRight: '1px solid var(--line)' }}>
              <KpiTile label="Total Reports — All Time" value={stats?.total_reports ?? 0} delta={{ dir: 'up', text: 'trending with new regional onboarding' }} />
            </div>
            <div style={{ padding: '18px 22px', borderRight: '1px solid var(--line)' }}>
              <KpiTile label="Active Users" value={stats?.total_users ?? 0} unit="accounts" />
            </div>
            <div style={{ padding: '18px 22px', borderRight: '1px solid var(--line)' }}>
              <KpiTile label="Completed" value={stats?.completed ?? 0} unit="resolved" />
            </div>
            <div style={{ padding: '18px 22px' }}>
              <KpiTile label="Critical — Open" value={stats?.critical_open ?? 0} delta={stats?.critical_open > 0 ? { dir: 'down', text: 'needs inspector attention' } : undefined} />
            </div>
          </div>
        )}
      </Panel>

      {/* Asymmetric 2:1 split — trend dominates, breakdown is secondary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 18, marginBottom: 18 }} className="admin-split">
        <Panel variant="bordered">
          <PanelHeader title="Reports This Year" subtitle="Monthly submission volume" />
          <div style={{ padding: '18px 14px 10px' }}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData?.monthly || []} barSize={22}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--n-100)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--secondary)" radius={[2, 2, 0, 0]} name="Reports" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel variant="bordered">
          <PanelHeader title="By Issue Type" />
          <div style={{ padding: '10px 6px 14px' }}>
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={72} paddingAngle={2} dataKey="value">
                  {pieData.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, padding: '0 14px' }}>
              {pieData.slice(0, 4).map((d: any, i: number) => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.76rem', color: 'var(--text-2)' }}>
                  <span className="dot" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span style={{ flex: 1 }}>{d.name}</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-1)' }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      {/* Recent activity — dense table, full width */}
      <Panel variant="bordered">
        <PanelHeader title="Recent Activity" subtitle="Latest submissions across all regions">
          <Link to="/dashboard/admin/reports" className="btn-link">View all reports →</Link>
        </PanelHeader>
        {reportsLoading ? <div style={{ padding: 18 }}><Skel rows={5} height={36} /></div> : !recentReports?.length ? (
          <div className="empty"><div className="empty-icon"><FileText size={20} /></div>No recent reports.</div>
        ) : (
          <table className="dtable dtable-compact">
            <thead><tr><th>Report</th><th>Type</th><th>Severity</th><th>Status</th><th>Region</th><th style={{ textAlign: 'right' }}>Submitted</th></tr></thead>
            <tbody>
              {recentReports.map((r: any) => (
                <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/dashboard/reports/${r.id}`}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{truncate(r.title, 38)}</div>
                    <div className="text-mono" style={{ color: 'var(--text-3)', fontSize: '0.7rem' }}>{r.report_number}</div>
                  </td>
                  <td style={{ color: 'var(--text-2)' }}>{issueTypeConfig[r.issue_type]?.label}</td>
                  <td><SeverityTag severity={r.severity} /></td>
                  <td><StatusTag status={r.status} /></td>
                  <td style={{ color: 'var(--text-2)' }}>{r.region_name || '—'}</td>
                  <td style={{ textAlign: 'right', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{timeAgo(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <style>{`@media (max-width: 900px) { .admin-split { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
