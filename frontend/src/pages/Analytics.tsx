import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { Panel, PanelHeader, Skel } from '../components/common';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';

const ISSUE_LABELS: Record<string, string> = {
  pothole: 'Pothole', damaged_sign: 'Damaged Sign', broken_traffic_light: 'Traffic Light',
  flooded_road: 'Flooded Road', cracked_road: 'Cracked Road', road_blockage: 'Blockage', other: 'Other',
};
const COLORS = ['#28384A', '#3C7A5C', '#A8762E', '#963B3B', '#5C4A78', '#3C5E78', '#807C73'];

/**
 * Analytics is a drill-down workspace, not another card grid.
 * One large hero chart anchors the page; clicking a region in
 * the bar chart filters the secondary panel below it. The two
 * supporting charts are intentionally different sizes — neither
 * is "the same card as the other one with different data."
 */
export default function Analytics() {
  const [focusRegion, setFocusRegion] = useState<string | null>(null);

  const { data: monthly, isLoading: ml } = useQuery({ queryKey: ['monthly-trend'], queryFn: async () => (await api.get('/analytics/monthly-trend')).data.data });
  const { data: regions, isLoading: rl } = useQuery({ queryKey: ['by-region'], queryFn: async () => (await api.get('/analytics/by-region')).data.data });
  const { data: issueTypes } = useQuery({ queryKey: ['by-issue-type'], queryFn: async () => (await api.get('/analytics/by-issue-type')).data.data });
  const { data: severity } = useQuery({ queryKey: ['by-severity'], queryFn: async () => (await api.get('/analytics/by-severity')).data.data });

  const focused = focusRegion ? (regions || []).find((r: any) => r.region === focusRegion) : null;

  return (
    <div>
      <h1 className="text-h1" style={{ margin: '0 0 3px' }}>Analytics</h1>
      <p className="text-meta" style={{ margin: '0 0 20px' }}>Network performance and reporting trends</p>

      {/* HERO — the dominant element on the page, full width, tall */}
      <Panel variant="elevated" style={{ marginBottom: 18 }}>
        <PanelHeader title="Reports Over Time" subtitle="Reported vs. completed vs. critical, last 12 months" />
        <div style={{ padding: '20px 18px 14px' }}>
          {ml ? <Skel rows={1} height={300} /> : (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={monthly || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--n-100)" />
                <XAxis dataKey="label" tick={{ fill: 'var(--text-3)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: 'var(--text-3)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="reported" name="Reported" stroke="#28384A" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="completed" name="Completed" stroke="#3C7A5C" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="critical" name="Critical" stroke="#963B3B" strokeWidth={1.5} strokeDasharray="5 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Panel>

      {/* Drill-down row — clicking a region bar narrows the right panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }} className="analytics-split">
        <Panel variant="bordered">
          <PanelHeader title="By Region" subtitle="Click a bar to drill in" />
          <div style={{ padding: '16px 12px 8px' }}>
            {rl ? <Skel rows={1} height={240} /> : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={regions || []} barSize={13} onClick={(s: any) => setFocusRegion(s?.activeLabel || null)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--n-100)" />
                  <XAxis dataKey="region" tick={{ fill: 'var(--text-3)', fontSize: 9.5 }} angle={-30} textAnchor="end" height={50} />
                  <YAxis tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="total" name="Total" fill="#28384A" radius={[2, 2, 0, 0]} cursor="pointer" />
                  <Bar dataKey="critical" name="Critical" fill="#963B3B" radius={[2, 2, 0, 0]} cursor="pointer" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Panel>

        <Panel variant="bordered">
          {focused ? (
            <>
              <PanelHeader title={focused.region} subtitle="Region detail">
                <button onClick={() => setFocusRegion(null)} className="btn-link">Clear</button>
              </PanelHeader>
              <div className="panel-body">
                {[['Total reports', focused.total], ['Completed', focused.completed], ['Pending', focused.pending], ['Critical, open', focused.critical]].map(([label, val]) => (
                  <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--n-50)', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-2)' }}>{label}</span><span style={{ fontWeight: 700 }}>{val as any}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <PanelHeader title="Severity Mix" subtitle="All regions" />
              <div style={{ padding: '6px 0 16px' }}>
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie data={severity || []} dataKey="count" nameKey="severity" cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={2}>
                      {(severity || []).map((_: any, i: number) => <Cell key={i} fill={['#3C5E78', '#A8762E', '#8A4A1E', '#963B3B'][i % 4]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </Panel>
      </div>

      {/* Smaller supporting strip — deliberately not chart #3 at the
          same size as the two above it */}
      <Panel variant="bordered" style={{ marginTop: 18 }}>
        <PanelHeader title="By Issue Type" />
        <div style={{ padding: '14px 12px' }}>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={(issueTypes || []).map((d: any) => ({ ...d, name: ISSUE_LABELS[d.issue_type] || d.issue_type }))} layout="vertical" barSize={11}>
              <XAxis type="number" tick={{ fill: 'var(--text-3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-1)', fontSize: 10.5 }} width={92} />
              <Tooltip />
              <Bar dataKey="count" radius={[0, 2, 2, 0]}>
                {(issueTypes || []).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <style>{`@media (max-width: 880px) { .analytics-split { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
