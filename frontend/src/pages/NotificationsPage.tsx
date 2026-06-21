import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Bell, Check, CheckCheck, Info, AlertTriangle, CheckCircle, UserPlus } from 'lucide-react';
import api from '../utils/api';
import { Notification } from '../types';
import { Panel, Skel, Empty } from '../components/common';
import { timeAgo } from '../utils/helpers';

const typeConfig: Record<string, { Icon: any; color: string }> = {
  status_update: { Icon: CheckCircle, color: 'var(--secondary)' },
  assignment:    { Icon: UserPlus, color: 'var(--info)' },
  alert:         { Icon: AlertTriangle, color: 'var(--error)' },
  info:          { Icon: Info, color: 'var(--info)' },
  success:       { Icon: CheckCircle, color: 'var(--secondary)' },
};

export default function NotificationsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/notifications');
      return { notifications: data.data as Notification[], unread: data.unread_count };
    },
  });
  const markReadMutation = useMutation({
    mutationFn: async (ids: number[] | 'all') => { await api.patch('/notifications/mark-read', { ids }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); qc.invalidateQueries({ queryKey: ['notif-count'] }); },
  });

  const notifications = data?.notifications || [];
  const unread = data?.unread || 0;

  return (
    <div style={{ maxWidth: 620 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h1 className="text-h1" style={{ margin: 0 }}>Notifications</h1>
          <p className="text-meta" style={{ margin: '3px 0 0' }}>{unread > 0 ? `${unread} unread` : 'All caught up'}</p>
        </div>
        {unread > 0 && (
          <button onClick={() => markReadMutation.mutate('all')} className="btn btn-std"><CheckCheck size={13} /> Mark all read</button>
        )}
      </div>

      <Panel variant="bordered">
        {isLoading ? <div style={{ padding: 16 }}><Skel rows={6} height={50} /></div> : !notifications.length ? (
          <Empty icon={Bell} title="No notifications" description="Updates about your reports will appear here." />
        ) : notifications.map((n, i) => {
          const cfg = typeConfig[n.type] || typeConfig.info;
          const Icon = cfg.Icon;
          return (
            <div key={n.id} style={{
              display: 'flex', gap: 12, padding: '13px 18px',
              borderBottom: i < notifications.length - 1 ? '1px solid var(--n-50)' : 'none',
              background: !n.is_read ? 'var(--secondary-100)' : 'transparent',
            }}>
              <Icon size={15} style={{ color: cfg.color, marginTop: 2, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: !n.is_read ? 600 : 500 }}>{n.title}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <span className="text-meta" style={{ whiteSpace: 'nowrap' }}>{timeAgo(n.created_at)}</span>
                    {!n.is_read && <button onClick={() => markReadMutation.mutate([n.id])} className="btn-icon" style={{ width: 22, height: 22 }}><Check size={11} /></button>}
                  </div>
                </div>
                <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: 'var(--text-2)' }}>{n.message}</p>
                {n.report_id && n.report_number && (
                  <Link to={`/dashboard/reports/${n.report_id}`} className="btn-link" style={{ display: 'inline-block', marginTop: 5, fontSize: '0.76rem' }}>
                    View {n.report_number} →
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </Panel>
    </div>
  );
}
