import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, UserCheck, UserX, Users } from 'lucide-react';
import api from '../../utils/api';
import { User } from '../../types';
import { useRegions } from '../../hooks/useRegions';
import { Panel, PanelHeader, FilterRail, FilterGroup, Empty, Skel, Pager, Modal } from '../../components/common';
import { formatDate, roleConfig } from '../../utils/helpers';
import toast from 'react-hot-toast';

const ROLES = ['citizen', 'inspector', 'maintenance_officer', 'admin'];

export default function AdminUsers() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [newUser, setNewUser] = useState({ full_name: '', email: '', password: '', role: 'citizen', phone: '', region_id: '' });

  const { data: regions } = useRegions();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, roleFilter, statusFilter, regionFilter],
    queryFn: async () => {
      const p = new URLSearchParams({
        page: String(page), limit: '14',
        ...(search && { search }), ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { is_active: statusFilter }), ...(regionFilter && { region_id: regionFilter }),
      });
      return (await api.get(`/users?${p}`)).data;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: number) => { await api.patch(`/users/${id}/toggle-status`); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('User status updated'); },
  });
  const createMutation = useMutation({
    mutationFn: async () => { await api.post('/users', newUser); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); setCreateOpen(false); setNewUser({ full_name: '', email: '', password: '', role: 'citizen', phone: '', region_id: '' }); toast.success('User created'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to create user'),
  });

  const users: User[] = data?.data || [];
  const pagination = data?.pagination;
  const set = (k: string) => (e: any) => setNewUser(f => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 className="text-h1" style={{ margin: 0 }}>User Directory</h1>
          <p className="text-meta" style={{ margin: '3px 0 0' }}>{pagination?.total ?? 0} registered accounts</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn btn-cta"><Plus size={15} /> Create User</button>
      </div>

      {/* Table-centric layout: left filter rail, not a horizontal filter bar */}
      <div style={{ display: 'flex', gap: 24 }} className="users-layout">
        <FilterRail title="Filter">
          <FilterGroup label="Search">
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="input input-sm" style={{ paddingLeft: 28 }} placeholder="Name or email" />
            </div>
          </FilterGroup>

          <FilterGroup label="Role">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {[['', 'All roles'], ...ROLES.map(r => [r, roleConfig[r]?.label])].map(([v, l]) => (
                <button key={v} onClick={() => { setRoleFilter(v); setPage(1); }}
                  className="btn-quiet" style={{ justifyContent: 'flex-start', width: '100%', background: roleFilter === v ? 'var(--secondary-100)' : 'transparent', color: roleFilter === v ? 'var(--secondary-700)' : 'var(--text-2)', fontWeight: roleFilter === v ? 600 : 400 }}>
                  {l}
                </button>
              ))}
            </div>
          </FilterGroup>

          <FilterGroup label="Status">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {[['', 'Any'], ['1', 'Active'], ['0', 'Inactive']].map(([v, l]) => (
                <button key={v} onClick={() => { setStatusFilter(v); setPage(1); }}
                  className="btn-quiet" style={{ justifyContent: 'flex-start', width: '100%', background: statusFilter === v ? 'var(--secondary-100)' : 'transparent', color: statusFilter === v ? 'var(--secondary-700)' : 'var(--text-2)', fontWeight: statusFilter === v ? 600 : 400 }}>
                  {l}
                </button>
              ))}
            </div>
          </FilterGroup>

          <FilterGroup label="Region">
            <select value={regionFilter} onChange={e => { setRegionFilter(e.target.value); setPage(1); }} className="input input-sm">
              <option value="">All regions</option>
              {(regions || []).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </FilterGroup>
        </FilterRail>

        {/* Dense table */}
        <Panel variant="bordered" style={{ flex: 1, minWidth: 0 }}>
          {isLoading ? <div style={{ padding: 18 }}><Skel rows={8} height={38} /></div> : !users.length ? (
            <Empty icon={Users} title="No matching users" description="Try a different search or clear your filters." />
          ) : (
            <table className="dtable">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Region</th><th>Reports</th><th>Joined</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.full_name}</td>
                    <td style={{ color: 'var(--text-2)' }}>{u.email}</td>
                    <td><span className={`tag ${roleConfig[u.role]?.tag}`}>{roleConfig[u.role]?.label}</span></td>
                    <td style={{ color: 'var(--text-2)' }}>{u.region_name || '—'}</td>
                    <td style={{ color: 'var(--text-2)' }}>{u.report_count || 0}</td>
                    <td style={{ color: 'var(--text-3)' }}>{formatDate(u.created_at)}</td>
                    <td><span className={`tag ${u.is_active ? 'tag-success' : 'tag-error'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <button onClick={() => toggleMutation.mutate(u.id)} className="btn-icon" title={u.is_active ? 'Deactivate' : 'Activate'}>
                        {u.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                      </button>
                    </td>
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

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create New User">
        {[
          { k: 'full_name', label: 'Full Name', type: 'text' },
          { k: 'email', label: 'Email', type: 'email' },
          { k: 'password', label: 'Password', type: 'password' },
          { k: 'phone', label: 'Phone (optional)', type: 'tel' },
        ].map(({ k, label, type }) => (
          <div key={k} className="field">
            <label className="field-label">{label}</label>
            <input type={type} value={(newUser as any)[k]} onChange={set(k)} className="input" />
          </div>
        ))}
        <div className="field">
          <label className="field-label">Role</label>
          <select value={newUser.role} onChange={set('role')} className="input">
            {ROLES.map(r => <option key={r} value={r}>{roleConfig[r]?.label}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="field-label">Region</label>
          <select value={newUser.region_id} onChange={set('region_id')} className="input">
            <option value="">Select region…</option>
            {(regions || []).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div className="modal-foot" style={{ margin: '0 -24px -24px', padding: '14px 24px' }}>
          <button onClick={() => setCreateOpen(false)} className="btn-std">Cancel</button>
          <button onClick={() => createMutation.mutate()} disabled={createMutation.isPending} className="btn btn-cta">
            {createMutation.isPending ? 'Creating…' : 'Create User'}
          </button>
        </div>
      </Modal>

      <style>{`@media (max-width: 820px) { .users-layout { flex-direction: column; } }`}</style>
    </div>
  );
}
