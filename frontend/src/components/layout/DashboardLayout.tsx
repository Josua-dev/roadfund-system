import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import { useState } from 'react';
import {
  LayoutDashboard, FileText, Map, BarChart3, Bell, User, LogOut,
  Plus, Users, Wrench, ClipboardCheck, Menu, X,
} from 'lucide-react';

/* Nav is grouped into sections per role — not one flat list.
   Grouping reflects how each role actually thinks about their
   work (Citizen: "my stuff" vs "the system"; Admin: "operate"
   vs "manage"), rather than mirroring the route table 1:1. */
const NAV_GROUPS: Record<string, { label: string; items: { to: string; icon: any; label: string }[] }[]> = {
  citizen: [
    { label: 'My Activity', items: [
      { to: '/dashboard/citizen', icon: LayoutDashboard, label: 'Overview' },
      { to: '/dashboard/submit-report', icon: Plus, label: 'Report an Issue' },
      { to: '/dashboard/my-reports', icon: FileText, label: 'My Reports' },
    ]},
    { label: 'System', items: [
      { to: '/dashboard/map', icon: Map, label: 'Live Map' },
      { to: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
      { to: '/dashboard/profile', icon: User, label: 'My Profile' },
    ]},
  ],
  inspector: [
    { label: 'Inspection Queue', items: [
      { to: '/dashboard/inspector', icon: LayoutDashboard, label: 'Overview' },
      { to: '/dashboard/admin/reports', icon: ClipboardCheck, label: 'All Reports' },
    ]},
    { label: 'Insights', items: [
      { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
      { to: '/dashboard/map', icon: Map, label: 'Live Map' },
    ]},
    { label: 'Account', items: [
      { to: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
      { to: '/dashboard/profile', icon: User, label: 'My Profile' },
    ]},
  ],
  maintenance_officer: [
    { label: 'Field Work', items: [
      { to: '/dashboard/maintenance', icon: LayoutDashboard, label: 'My Tasks' },
      { to: '/dashboard/map', icon: Map, label: 'Live Map' },
    ]},
    { label: 'Account', items: [
      { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
      { to: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
      { to: '/dashboard/profile', icon: User, label: 'My Profile' },
    ]},
  ],
  admin: [
    { label: 'Operate', items: [
      { to: '/dashboard/admin', icon: LayoutDashboard, label: 'Overview' },
      { to: '/dashboard/admin/reports', icon: FileText, label: 'All Reports' },
      { to: '/dashboard/maintenance', icon: Wrench, label: 'Maintenance' },
    ]},
    { label: 'Manage', items: [
      { to: '/dashboard/admin/users', icon: Users, label: 'Users' },
      { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
    ]},
    { label: 'Account', items: [
      { to: '/dashboard/map', icon: Map, label: 'Live Map' },
      { to: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
      { to: '/dashboard/profile', icon: User, label: 'My Profile' },
    ]},
  ],
};

const ROUTE_TITLES: Record<string, string> = {
  citizen: 'Overview', inspector: 'Overview', maintenance: 'My Tasks', admin: 'Overview',
  'submit-report': 'Report an Issue', 'my-reports': 'My Reports', map: 'Live Map',
  notifications: 'Notifications', profile: 'My Profile', analytics: 'Analytics', reports: 'All Reports', users: 'Users',
};

function Mark({ size = 32 }: { size?: number }) {
  return (
    <span className="brand-glow" style={{ display: 'inline-flex', borderRadius: 5 }}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="5" fill="#3C7A5C" />
        <rect x="14.5" y="4" width="3" height="5" fill="white" />
        <rect x="14.5" y="13" width="3" height="6" fill="white" />
        <rect x="14.5" y="23" width="3" height="5" fill="white" />
      </svg>
    </span>
  );
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const groups = NAV_GROUPS[user?.role || 'citizen'];

  const { data: unread } = useQuery({
    queryKey: ['notif-count'],
    queryFn: async () => (await api.get('/notifications')).data.unread_count as number,
    refetchInterval: 30000,
  });

  const initial = user?.full_name?.charAt(0).toUpperCase() || '?';
  const segments = location.pathname.split('/').filter(Boolean);
  const crumbTitle = ROUTE_TITLES[segments[segments.length - 1]] || ROUTE_TITLES[segments[1]] || 'Dashboard';

  const Sidebar = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--primary)' }}>
      <div style={{ padding: '16px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9 }} onClick={() => setMobileOpen(false)}>
          <Mark />
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '0.82rem', lineHeight: 1.25 }}>RoadSafe</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.66rem' }}>Namibia</div>
          </div>
        </Link>
      </div>

      <nav style={{ flex: 1, padding: '6px 10px', overflowY: 'auto' }}>
        {groups.map(group => (
          <div key={group.label}>
            <div className="nav-group-label">{group.label}</div>
            {group.items.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} end onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}>
                <Icon size={15} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{label}</span>
                {label === 'Notifications' && !!unread && unread > 0 && <span className="nav-count">{unread > 9 ? '9+' : unread}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', marginBottom: 4 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.74rem', flexShrink: 0 }}>{initial}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: 'white', fontSize: '0.77rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.full_name}</div>
          </div>
        </div>
        <button onClick={logout} className="nav-item" style={{ cursor: 'pointer' }}>
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-app)' }}>
      <aside style={{ width: 'var(--sidebar-w)', flexShrink: 0 }} className="desktop-sidebar">
        <Sidebar />
      </aside>

      {mobileOpen && (
        <>
          <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(19,27,36,0.5)', zIndex: 40 }} />
          <aside style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 'var(--sidebar-w)', zIndex: 50 }}><Sidebar /></aside>
        </>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{
          height: 'var(--topbar-h)', background: 'var(--bg-panel)', borderBottom: '1px solid var(--line)',
          display: 'flex', alignItems: 'center', padding: '0 20px', gap: 14, flexShrink: 0,
        }}>
          <button onClick={() => setMobileOpen(true)} className="btn-icon mobile-menu-btn" style={{ display: 'none' }}><Menu size={17} /></button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--text-3)' }}>RFA Portal</span>
            <span style={{ color: 'var(--n-200)' }}>/</span>
            <span style={{ color: 'var(--text-1)', fontWeight: 600 }}>{crumbTitle}</span>
          </div>

          <div style={{ flex: 1 }} />

          <NavLink to="/dashboard/notifications" className="btn-icon" style={{ position: 'relative' }}>
            <Bell size={16} />
            {!!unread && unread > 0 && <span style={{ position: 'absolute', top: 5, right: 5, width: 6, height: 6, borderRadius: '50%', background: 'var(--error)' }} />}
          </NavLink>
          <NavLink to="/dashboard/profile" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px 5px 6px', borderRadius: 'var(--r-base)', border: '1px solid var(--line)' }}>
            <div style={{ width: 24, height: 24, borderRadius: 7, background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>{initial}</div>
            <span style={{ fontSize: '0.8rem', fontWeight: 500, maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.full_name?.split(' ')[0]}</span>
          </NavLink>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: '22px 26px' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto' }}><Outlet /></div>
        </main>
      </div>

      <style>{`
        @media (min-width: 768px) { .desktop-sidebar { display: block !important; } .mobile-menu-btn { display: none !important; } }
        @media (max-width: 767px) { .desktop-sidebar { display: none !important; } .mobile-menu-btn { display: flex !important; } }
      `}</style>
    </div>
  );
}
