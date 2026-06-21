import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Save, Lock } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useRegions } from '../hooks/useRegions';
import { Notice } from '../components/common';
import { formatDateTime, roleConfig } from '../utils/helpers';
import toast from 'react-hot-toast';

/**
 * Settings as a left-nav-of-sections form, the way Settings pages
 * actually work in mature software (Slack, GitHub, most admin
 * consoles) — not a single centered card with tabs floating
 * inside it. Sections are separated by a fieldset rule, not by
 * being wrapped in their own card each.
 */
const SECTIONS = ['profile', 'security', 'account'] as const;
type Section = typeof SECTIONS[number];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [section, setSection] = useState<Section>('profile');
  const { data: regions } = useRegions();

  const [profileForm, setProfileForm] = useState({ full_name: user?.full_name || '', phone: user?.phone || '', region_id: user?.region_id ? String(user.region_id) : '' });
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [pwError, setPwError] = useState('');

  const profileMutation = useMutation({
    mutationFn: async () => (await api.put('/auth/profile', profileForm)).data.user,
    onSuccess: (u) => { updateUser(u); toast.success('Profile saved'); },
  });
  const pwMutation = useMutation({
    mutationFn: async () => { await api.put('/auth/change-password', { current_password: pwForm.current_password, new_password: pwForm.new_password }); },
    onSuccess: () => { toast.success('Password changed'); setPwForm({ current_password: '', new_password: '', confirm_password: '' }); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Password change failed'),
  });
  const submitPw = () => {
    setPwError('');
    if (pwForm.new_password.length < 6) return setPwError('New password must be at least 6 characters');
    if (pwForm.new_password !== pwForm.confirm_password) return setPwError('Passwords do not match');
    pwMutation.mutate();
  };

  return (
    <div>
      <h1 className="text-h1" style={{ margin: '0 0 18px' }}>Settings</h1>

      <div style={{ display: 'flex', gap: 36 }} className="settings-layout">
        {/* Left nav of section groups — not tabs inside a card */}
        <div style={{ width: 168, flexShrink: 0 }}>
          {SECTIONS.map(s => (
            <button key={s} onClick={() => setSection(s)} className="nav-item"
              style={{ color: section === s ? 'var(--text-1)' : 'var(--text-2)', background: section === s ? 'var(--n-50)' : 'transparent', borderLeft: section === s ? '2px solid var(--secondary)' : '2px solid transparent', paddingLeft: 10, textTransform: 'capitalize' }}>
              {s}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, maxWidth: 460 }}>
          {section === 'profile' && (
            <fieldset className="fieldset">
              <div className="fieldset-legend">Profile information</div>
              <div className="field">
                <label className="field-label">Full name</label>
                <input className="input" value={profileForm.full_name} onChange={e => setProfileForm(f => ({ ...f, full_name: e.target.value }))} />
              </div>
              <div className="field">
                <label className="field-label">Email</label>
                <input className="input" value={user?.email} disabled />
                <div className="field-hint">Contact an administrator to change your email address.</div>
              </div>
              <div className="field">
                <label className="field-label">Phone number</label>
                <input className="input" value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} placeholder="+264 81 000 0000" />
              </div>
              <div className="field">
                <label className="field-label">Region</label>
                <select className="input" value={profileForm.region_id} onChange={e => setProfileForm(f => ({ ...f, region_id: e.target.value }))}>
                  <option value="">Select region…</option>
                  {(regions || []).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <button onClick={() => profileMutation.mutate()} disabled={profileMutation.isPending} className="btn btn-cta">
                <Save size={14} /> {profileMutation.isPending ? 'Saving…' : 'Save changes'}
              </button>
            </fieldset>
          )}

          {section === 'security' && (
            <fieldset className="fieldset">
              <div className="fieldset-legend">Change password</div>
              {pwError && <div style={{ marginBottom: 14 }}><Notice type="error" message={pwError} onClose={() => setPwError('')} /></div>}
              {[['current_password', 'Current password'], ['new_password', 'New password'], ['confirm_password', 'Confirm new password']].map(([k, label]) => (
                <div key={k} className="field">
                  <label className="field-label">{label}</label>
                  <input type="password" className="input" value={(pwForm as any)[k]} onChange={e => setPwForm(f => ({ ...f, [k]: e.target.value }))} />
                </div>
              ))}
              <button onClick={submitPw} disabled={pwMutation.isPending} className="btn btn-std">
                <Lock size={14} /> {pwMutation.isPending ? 'Updating…' : 'Update password'}
              </button>
            </fieldset>
          )}

          {section === 'account' && (
            <fieldset className="fieldset">
              <div className="fieldset-legend">Account details</div>
              {[
                ['Role', roleConfig[user?.role || '']?.label],
                ['Status', user?.is_active ? 'Active' : 'Inactive'],
                ['Last login', user?.last_login ? formatDateTime(user.last_login) : 'N/A'],
                ['Member since', user?.created_at ? formatDateTime(user.created_at) : 'N/A'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--n-50)', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-2)' }}>{label}</span><span style={{ fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </fieldset>
          )}
        </div>
      </div>

      <style>{`@media (max-width: 700px) { .settings-layout { flex-direction: column; gap: 14px; } }`}</style>
    </div>
  );
}
