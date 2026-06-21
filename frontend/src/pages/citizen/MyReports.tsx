import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, FileText } from 'lucide-react';
import api from '../../utils/api';
import { Report } from '../../types';
import { Panel, StatusTag, SeverityTag, Meter, Empty, Skel, Pager } from '../../components/common';
import { timeAgo, truncate } from '../../utils/helpers';

/**
 * A citizen's own report history reads as a TIMELINE of personal
 * activity, not a register to audit. Vertical, chronological,
 * one column — the opposite shape of AdminReports even though
 * both pages ultimately render the same underlying entity.
 */
export default function MyReports() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['my-reports', page, search],
    queryFn: async () => {
      const p = new URLSearchParams({ page: String(page), limit: '10', ...(search && { search }) });
      return (await api.get(`/reports?${p}`)).data;
    },
  });

  const reports: Report[] = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, gap: 10, flexWrap: 'wrap' }}>
        <div>
          <h1 className="text-h1" style={{ margin: 0 }}>My Reports</h1>
          <p className="text-meta" style={{ margin: '3px 0 0' }}>{pagination?.total ?? 0} submitted</p>
        </div>
        <Link to="/dashboard/submit-report" className="btn btn-cta"><Plus size={14} /> New Report</Link>
      </div>

      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="input" style={{ paddingLeft: 32 }} placeholder="Search your reports…" />
      </div>

      {isLoading ? <Skel rows={5} height={84} /> : !reports.length ? (
        <Panel variant="bordered"><Empty icon={FileText} title="No reports found" description="Try a different search, or submit a new one." action={{ label: 'Report an Issue', onClick: () => navigate('/dashboard/submit-report') }} /></Panel>
      ) : (
        <div className="timeline">
          {reports.map(r => (
            <div key={r.id} className="timeline-item">
              <span className={`timeline-dot ${r.status === 'completed' || r.status === 'rejected' ? '' : 'is-muted'}`} />
              <Link to={`/dashboard/reports/${r.id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                <div className="panel-bordered" style={{ padding: 15 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{truncate(r.title, 50)}</span>
                    <StatusTag status={r.status} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: r.progress_percent > 0 ? 10 : 0, flexWrap: 'wrap' }}>
                    <span className="text-mono" style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>{r.report_number}</span>
                    <SeverityTag severity={r.severity} />
                    <span className="text-meta">{r.region_name}</span>
                    <span className="text-meta">· {timeAgo(r.created_at)}</span>
                  </div>
                  {r.progress_percent > 0 && <Meter value={r.progress_percent} />}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      <Pager page={page} pages={pagination?.pages || 1} onPage={setPage} />
    </div>
  );
}
