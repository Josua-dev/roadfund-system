import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import { Panel, Meter, TaskStatusTag, Skel, Empty } from '../../components/common';
import { Wrench, AlertTriangle } from 'lucide-react';
import { formatDate, truncate } from '../../utils/helpers';

/**
 * Maintenance officers work tasks, not records — so this is a
 * BOARD, not a table or a stat grid. Three columns by priority,
 * each card sized by how much progress info it needs to show.
 * Deliberately the least "dashboard-shaped" of the four roles.
 */
export default function MaintenanceDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['maintenance-stats'],
    queryFn: async () => (await api.get('/maintenance/my-stats')).data.data,
  });
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: async () => (await api.get('/maintenance/my-tasks?limit=20')).data.data,
  });

  const urgent = (tasks || []).filter((t: any) => t.priority === 'urgent');
  const inProgress = (tasks || []).filter((t: any) => t.status === 'in_progress' && t.priority !== 'urgent');
  const queued = (tasks || []).filter((t: any) => t.status === 'pending' && t.priority !== 'urgent');

  const TaskCard = ({ t }: { t: any }) => {
    const tone = t.progress_percent >= 70 ? 'good' : t.progress_percent >= 30 ? 'warn' : 'bad';
    return (
      <a href={`/dashboard/maintenance/${t.id}`} className="panel-bordered" style={{ display: 'block', padding: 13, marginBottom: 9, textDecoration: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 7 }}>
          <span style={{ fontWeight: 600, fontSize: '0.83rem', color: 'var(--text-1)' }}>{truncate(t.title || t.report_title, 34)}</span>
          <TaskStatusTag status={t.status} />
        </div>
        {t.progress_percent != null && <Meter value={t.progress_percent} tone={tone} showLabel={false} />}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.72rem', color: 'var(--text-3)' }}>
          <span>{t.region_name || 'Field'}</span>
          <span>{t.due_date ? `Due ${formatDate(t.due_date)}` : 'No deadline set'}</span>
        </div>
      </a>
    );
  };

  const Column = ({ title, count, tone, items }: { title: string; count: number; tone: string; items: any[] }) => (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 8, borderBottom: `2px solid ${tone}` }}>
        <span className="text-h3" style={{ color: tone }}>{title}</span>
        <span className="text-mono" style={{ color: 'var(--text-3)' }}>{count}</span>
      </div>
      {!items.length ? (
        <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: '0.78rem' }}>Nothing here</div>
      ) : items.map(t => <TaskCard key={t.id} t={t} />)}
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 className="text-h1" style={{ margin: 0 }}>My Task Board</h1>
          <p className="text-meta" style={{ margin: '3px 0 0' }}>{stats?.active ?? 0} active · {stats?.completed ?? 0} completed today</p>
        </div>
        {urgent.length > 0 && (
          <div className="notice notice-error" style={{ padding: '7px 12px' }}>
            <AlertTriangle size={14} /> {urgent.length} urgent task{urgent.length > 1 ? 's' : ''} need attention
          </div>
        )}
      </div>

      {tasksLoading ? <Skel rows={4} height={70} /> : !tasks?.length ? (
        <Panel variant="bordered"><Empty icon={Wrench} title="No tasks assigned" description="You'll see field work here once it's assigned to you." /></Panel>
      ) : (
        <div style={{ display: 'flex', gap: 24 }} className="maint-board">
          <Column title="Urgent" count={urgent.length} tone="var(--error)" items={urgent} />
          <Column title="In Progress" count={inProgress.length} tone="var(--warning)" items={inProgress} />
          <Column title="Queued" count={queued.length} tone="var(--text-3)" items={queued} />
        </div>
      )}

      <style>{`@media (max-width: 760px) { .maint-board { flex-direction: column; } }`}</style>
    </div>
  );
}
