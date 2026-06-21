import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const demos = [
  { label: 'Admin',     email: 'admin@roadfund.na',    color: '#28384A' },
  { label: 'Inspector', email: 'inspector@roadfund.na', color: '#3C7A5C' },
  { label: 'Officer',   email: 'officer@roadfund.na',   color: '#3182ce' },
  { label: 'Citizen',   email: 'citizen@roadfund.na',   color: '#64738a' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(form.email, form.password); toast.success('Welcome back!'); navigate('/dashboard'); }
    catch (err: any) { setError(err.response?.data?.message || 'Invalid email or password.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'var(--n-25)' }}>

      {/* Left panel — brand */}
      <div style={{
        width:'45%', background:'var(--primary)',
        display:'flex', flexDirection:'column',
        padding:'48px', position:'relative', overflow:'hidden',
      }} className="login-brand-panel">
        {/* Pattern overlay */}
        <div style={{
          position:'absolute', inset:0, opacity:0.05,
          backgroundImage:`repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)`,
          backgroundSize:'20px 20px',
        }}/>
        {/* Soft ambient color for the glass stats strip below to refract */}
        <div className="glass-blob" style={{ width: 280, height: 280, background: 'var(--secondary)', opacity: 0.18, top: -80, right: -60 }} />
        <div className="glass-blob" style={{ width: 220, height: 220, background: 'var(--accent)', opacity: 0.12, bottom: 60, left: -60 }} />

        <div style={{ position:'relative' }}>
          {/* Logo */}
          <Link to="/" style={{ display:'flex', alignItems:'center', gap:12, marginBottom:64 }}>
            <span className="brand-glow" style={{ display: 'inline-flex', borderRadius: 10 }}>
              <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
                <rect width="42" height="42" rx="10" fill="#3C7A5C"/>
                <rect x="19.5" y="6"  width="3" height="6"  rx="1.5" fill="white"/>
                <rect x="19.5" y="17" width="3" height="8"  rx="1.5" fill="white"/>
                <rect x="19.5" y="30" width="3" height="6"  rx="1.5" fill="white"/>
                <rect x="9"    y="6"  width="2" height="30" rx="1"   fill="rgba(255,255,255,0.3)"/>
                <rect x="31"   y="6"  width="2" height="30" rx="1"   fill="rgba(255,255,255,0.3)"/>
              </svg>
            </span>
            <div>
              <div style={{ color:'white', fontWeight:700, fontSize:'1rem', lineHeight:1.3 }}>RoadSafe Namibia</div>
              <div style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.75rem' }}>An official RFA platform</div>
            </div>
          </Link>

          <h1 style={{ color:'white', fontSize:'2rem', fontWeight:800, lineHeight:1.25, marginBottom:16, marginTop:0 }}>
            Namibia's Road<br />Maintenance Portal
          </h1>
          <p style={{ color:'rgba(255,255,255,0.6)', lineHeight:1.7, fontSize:'0.9rem', marginBottom:48, marginTop:0 }}>
            Report road defects, track repair progress, and help build a safer road network across all 14 regions of Namibia.
          </p>

          {/* Stats strip */}
          <div className="glass-dark" style={{ display:'flex', gap:32, flexWrap:'wrap', padding: '16px 20px', borderRadius: 12 }}>
            {[['12,847', 'Reports Processed'], ['3,291', 'Roads Repaired'], ['14', 'Regions']].map(([v, l]) => (
              <div key={l}>
                <div style={{ color:'var(--secondary)', fontWeight:800, fontSize:'1.5rem', lineHeight:1 }}>{v}</div>
                <div style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.75rem', marginTop:4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stamp */}
        <div style={{ position:'relative', marginTop:'auto', paddingTop:32 }}>
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.12)', paddingTop:20 }}>
            <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.75rem', margin:0 }}>
              © 2025 RoadSafe Namibia · Operated by the Road Fund Administration<br />21 Sir Seretse Khama St, Windhoek
            </p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 32px' }}>
        <div style={{ width:'100%', maxWidth:420 }}>

          <h2 style={{ fontSize:'1.625rem', fontWeight:800, color:'var(--primary)', margin:'0 0 4px' }}>Sign In</h2>
          <p style={{ color:'var(--text-2)', fontSize:'0.875rem', margin:'0 0 28px' }}>
            Enter your credentials to access your account
          </p>

          {/* Demo tiles */}
          <div style={{ marginBottom:24 }}>
            <p style={{ fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-3)', marginBottom:10, marginTop:0 }}>
              Quick Demo Access
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {demos.map(({ label, email, color }) => (
                <button key={label} type="button"
                  onClick={() => setForm({ email, password:'Password123!' })}
                  style={{
                    padding:'8px 12px', borderRadius:8, border:`1.5px solid ${color}25`,
                    background:`${color}08`, color, fontWeight:600, fontSize:'0.8rem',
                    cursor:'pointer', textAlign:'left', transition:'all 0.15s',
                  }}
                  onMouseOver={e => (e.currentTarget.style.background = `${color}15`)}
                  onMouseOut={e  => (e.currentTarget.style.background = `${color}08`)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ height:1, background:'var(--line)', margin:'0 0 24px' }}/>

          {error && (
            <div className="notice notice-error" style={{ marginBottom:18 }}>
              <AlertCircle size={15} style={{ flexShrink:0 }}/> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label className="field-label">Email Address</label>
              <div style={{ position:'relative' }}>
                <Mail size={15} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--n-400)', pointerEvents:'none' }}/>
                <input type="email" value={form.email}
                  onChange={e => setForm({...form, email:e.target.value})}
                  className="input" style={{ paddingLeft:40 }}
                  placeholder="you@example.com" required />
              </div>
            </div>

            <div className="field">
              <label className="field-label">Password</label>
              <div style={{ position:'relative' }}>
                <Lock size={15} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--n-400)', pointerEvents:'none' }}/>
                <input type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm({...form, password:e.target.value})}
                  className="input" style={{ paddingLeft:40, paddingRight:40 }}
                  placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--n-400)', padding:0, display:'flex' }}>
                  {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-cta btn-block btn-lg brand-glow" style={{ marginTop:8 }}>
              {loading
                ? <><span className="animate-spin" style={{ display:'inline-block', width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%' }}/> Signing in…</>
                : 'Sign In to RoadSafe Namibia'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:20, fontSize:'0.875rem', color:'var(--text-2)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color:'var(--secondary)', fontWeight:600 }}>Register here</Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .login-brand-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
}
