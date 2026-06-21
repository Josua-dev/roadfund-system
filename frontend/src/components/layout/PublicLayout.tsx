import { Outlet } from 'react-router-dom';

export default function PublicLayout() {
  // LandingPage, LoginPage and RegisterPage each render their own
  // full-bleed header/brand-panel — this layout stays unopinionated
  // so no duplicate navbar gets stacked on top of them.
  return (
    <div style={{ minHeight: '100vh', background: 'var(--white)' }}>
      <Outlet/>
    </div>
  );
}
