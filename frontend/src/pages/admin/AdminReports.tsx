import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, Download, FileText } from 'lucide-react';
import api from '../../utils/api';
import { Report } from '../../types';
import { useRegions } from '../../hooks/useRegions';
import { Panel, FilterRail, FilterGroup, StatusTag, SeverityTag, Empty, Skel, Pager } from '../../components/common';
import { timeAgo, issueTypeConfig, statusConfig, truncate } from '../../utils/helpers';
import toast from 'react-hot-toast';

/**
 * The operations log — this is the "document register" view: a
 * filter rail + a dense register table with an export action.
 * Distinct from MyReports (a citizen's personal timeline) even
 * though both ultimately list `reports`, because the JOB here is
 * different: an admin audits a register, a citizen checks on
 * their own submissions.
 */
export default function AdminReports() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [severity, setSeverity] = useState('');
  const [region, setRegion] = useState('');
  const [editingStatus, setEditingStatus] = useState<number | null>(null);

  const { data: regions } = useRegions();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports', page, search, status, severity, region],
    queryFn: async () => {
      const p = new URLSearchParams({ page: String(page), limit: '16', ...(search && { search }), ...(status && { status }), ...(severity && { severity }), ...(region && { region_id: region }) });
      return (await api.get(`/reports?${p}`)).data;
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => { await api.patch(`/reports/${id}/status`, { status }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-reports'] }); toast.success('Status updated'); setEditingStatus(null); },
  });

  const reports: Report[] = data?.data || [];
  const pagination = data?.pagination;

  const exportCsv = () => {
    const rows = reports.map(r => [r.report_number, r.title, r.issue_type, r.severity, r.status, r.region_name, r.created_at].join(','));
    const blob = new Blob([['Report,Title,Type,Severity,Status,Region,Date', ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'reports-export.csv'; a.click();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 className="text-h1" style={{ margin: 0 }}>Report Register</h1>
          <p className="text-meta" style={{ margin: '3px 0 0' }}>{pagination?.total ?? 0} records</p>
        </div>
        <button onClick={exportCsv} className="btn btn-std"><Download size={14} /> Export visible page (CSV)</button>
      </div>

      <div style={{ display: 'flex', gap: 24 }} className="reports-layout">
        <FilterRail title="Filter register">
          <FilterGroup label="Search">
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="input input-sm" style={{ paddingLeft: 28 }} placeholder="Title or report #" />
            </div>
          </FilterGroup>
          <FilterGroup label="Status">
            <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="input input-sm">
              <option value="">All statuses</option>
              {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </FilterGroup>
          <FilterGroup label="Severity">
            <select value={severity} onChange={e => { setSeverity(e.target.value); setPage(1); }} className="input input-sm">
              <option value="">All severities</option>
              {['low', 'medium', 'high', 'critical'].map(s => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
            </select>
          </FilterGroup>
          <FilterGroup label="Region">
            <select value={region} onChange={e => { setRegion(e.target.value); setPage(1); }} className="input input-sm">
              <option value="">All regions</option>
              {(regions || []).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </FilterGroup>
        </FilterRail>

        <Panel variant="bordered" style={{ flex: 1, minWidth: 0 }}>
          {isLoading ? <div style={{ padding: 18 }}><Skel rows={9} height={38} /></div> : !reports.length ? (
            <Empty icon={FileText} title="No matching records" description="Adjust the filters in the left rail." />
          ) : (
            <table className="dtable">
              <thead><tr><th>Report #</th><th>Title</th><th>Type</th><th>Severity</th><th>Region</th><th>Filed</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r.id}>
                    <td className="text-mono" style={{ color: 'var(--text-2)' }}>{r.report_number}</td>
                    <td style={{ fontWeight: 600, maxWidth: 220 }}>{truncate(r.title, 38)}</td>
                    <td style={{ color: 'var(--text-2)' }}>{issueTypeConfig[r.issue_type]?.label}</td>
                    <td><SeverityTag severity={r.severity} /></td>
                    <td style={{ color: 'var(--text-2)' }}>{r.region_name || '—'}</td>
                    <td style={{ color: 'var(--text-3)' }}>{timeAgo(r.created_at)}</td>
                    <td>
                      {editingStatus === r.id ? (
                        <select autoFocus defaultValue={r.status} onBlur={() => setEditingStatus(null)}
                          onChange={e => statusMutation.mutate({ id: r.id, status: e.target.value })}
                          className="input input-sm" style={{ width: 140 }}>
                          {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                      ) : (
                        <button onClick={() => setEditingStatus(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                          <StatusTag status={r.status} />
                        </button>
                      )}
                    </td>
                    <td><Link to={`/dashboard/reports/${r.id}`} className="btn-link">Open</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="panel-body" style={{ paddingTop: 0 }}>
            <Pager page={page} pages={pagination?.pages || 1} onPage={setPage} />
          </div>
        </Panel>
      </div>

      <style>{`@media (max-width: 820px) { .reports-layout { flex-direction: column; } }`}</style>
    </div>
  );
}
