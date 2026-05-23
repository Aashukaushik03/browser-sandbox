import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useStore } from '../store/useStore';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useStore();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post(`/auth/${mode}`, { email, password });
      setAuth(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0e0e10', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Left panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2.5rem' }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #6366f1, #a855f7)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>◈</div>
            <span style={{ fontSize: 18, fontWeight: 600, color: '#e4e4e7' }}>Browser Sandbox</span>
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#f4f4f5', marginBottom: 6 }}>
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p style={{ color: '#71717a', fontSize: 14, marginBottom: '1.75rem' }}>
            {mode === 'login' ? 'Sign in to your account to continue' : 'Start coding in your browser today'}
          </p>

          {error && (
            <div style={{ background: '#450a0a', border: '1px solid #7f1d1d', borderRadius: 8, padding: '10px 14px', marginBottom: '1rem', color: '#fca5a5', fontSize: 13 }}>
              {error}
            </div>
          )}

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, color: '#a1a1aa', display: 'block', marginBottom: 6 }}>Email</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required
                style={{ width: '100%', background: '#18181b', border: '1px solid #27272a', borderRadius: 8, padding: '10px 14px', color: '#f4f4f5', fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = '#27272a'} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#a1a1aa', display: 'block', marginBottom: 6 }}>Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required
                style={{ width: '100%', background: '#18181b', border: '1px solid #27272a', borderRadius: 8, padding: '10px 14px', color: '#f4f4f5', fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = '#27272a'} />
            </div>
            <button type="submit" disabled={loading}
              style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', border: 'none', borderRadius: 8, padding: '11px', fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 500, marginTop: 4, opacity: loading ? 0.7 : 1, transition: 'opacity 0.15s' }}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign in →' : 'Create account →'}
            </button>
          </form>

          <p style={{ color: '#52525b', fontSize: 13, marginTop: '1.5rem', textAlign: 'center' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have one? '}
            <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              style={{ color: '#818cf8', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>

      {/* Right panel — decorative */}
      <div style={{ flex: 1, background: 'linear-gradient(135deg, #0f0f23 0%, #1a0533 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, #6366f130, transparent)', top: '20%', left: '10%' }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, #a855f720, transparent)', bottom: '10%', right: '5%' }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '2rem' }}>
          {/* Code preview card */}
          <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 12, padding: '1.5rem', textAlign: 'left', fontFamily: 'Consolas, monospace', fontSize: 13, maxWidth: 320 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: '1rem' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
            </div>
            <div style={{ lineHeight: 1.8, color: '#71717a' }}>
              <span style={{ color: '#818cf8' }}>const</span> <span style={{ color: '#60a5fa' }}>sandbox</span> = <span style={{ color: '#818cf8' }}>new</span> <span style={{ color: '#34d399' }}>BrowserIDE</span>({'{'}<br />
              &nbsp;&nbsp;<span style={{ color: '#60a5fa' }}>editor</span>: <span style={{ color: '#f59e0b' }}>'Monaco'</span>,<br />
              &nbsp;&nbsp;<span style={{ color: '#60a5fa' }}>preview</span>: <span style={{ color: '#f59e0b' }}>'live'</span>,<br />
              &nbsp;&nbsp;<span style={{ color: '#60a5fa' }}>stack</span>: <span style={{ color: '#f59e0b' }}>'MERN'</span>,<br />
              {'}'});<br /><br />
              <span style={{ color: '#818cf8' }}>await</span> sandbox.<span style={{ color: '#34d399' }}>run</span>();
              <span style={{ color: '#22c55e' }}> ✓</span>
            </div>
          </div>
          <p style={{ color: '#52525b', fontSize: 13, marginTop: '1.5rem' }}>Code. Preview. Ship. All in the browser.</p>
        </div>
      </div>
    </div>
  );
}
