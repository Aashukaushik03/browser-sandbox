import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useStore } from '../store/useStore';

function timeAgo(date) {
  const diff = Date.now() - new Date(date);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const { logout, user } = useStore();
  const navigate = useNavigate();

  const load = async () => {
    const { data } = await api.get('/projects');
    setProjects(data); setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    setCreating(true);
    const { data } = await api.post('/projects', { name: name.trim() || 'Untitled Project' });
    setName(''); setCreating(false);
    navigate(`/project/${data._id}`);
  };

  const deleteProject = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this project?')) return;
    await api.delete(`/projects/${id}`);
    setProjects(p => p.filter(x => x._id !== id));
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0e0e10', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Navbar */}
      <nav style={{ height: 56, background: '#18181b', borderBottom: '1px solid #27272a', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #6366f1, #a855f7)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>◈</div>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#e4e4e7' }}>Browser Sandbox</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: '#52525b' }}>{user?.email}</span>
          <button onClick={logout}
            style={{ background: 'none', border: '1px solid #27272a', borderRadius: 8, padding: '6px 14px', color: '#71717a', cursor: 'pointer', fontSize: 13 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#3f3f46'; e.currentTarget.style.color = '#a1a1aa'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#27272a'; e.currentTarget.style.color = '#71717a'; }}>
            Sign out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '3rem 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 26, fontWeight: 600, color: '#f4f4f5', marginBottom: 6 }}>Projects</h1>
          <p style={{ color: '#71717a', fontSize: 14 }}>Create and manage your browser-based coding projects.</p>
        </div>

        {/* Create form */}
        <form onSubmit={create} style={{ display: 'flex', gap: 10, marginBottom: '2.5rem' }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Project name..."
            style={{ flex: 1, background: '#18181b', border: '1px solid #27272a', borderRadius: 10, padding: '11px 16px', color: '#f4f4f5', fontSize: 14, outline: 'none', transition: 'border-color 0.15s' }}
            onFocus={e => e.target.style.borderColor = '#6366f1'}
            onBlur={e => e.target.style.borderColor = '#27272a'} />
          <button type="submit" disabled={creating}
            style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 22px', cursor: 'pointer', fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', opacity: creating ? 0.7 : 1 }}>
            {creating ? '...' : '+ New Project'}
          </button>
        </form>

        {/* Project grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ height: 130, background: '#18181b', borderRadius: 12, border: '1px solid #27272a', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
          </div>
        ) : projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <div style={{ fontSize: 48, marginBottom: '1rem', opacity: 0.2 }}>◈</div>
            <p style={{ color: '#52525b', fontSize: 15 }}>No projects yet.</p>
            <p style={{ color: '#3f3f46', fontSize: 13, marginTop: 6 }}>Create your first project above to get started.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {projects.map(p => (
              <div key={p._id}
                onClick={() => navigate(`/project/${p._id}`)}
                onMouseEnter={() => setHoveredId(p._id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{ background: '#18181b', border: `1px solid ${hoveredId === p._id ? '#6366f1' : '#27272a'}`, borderRadius: 12, padding: '1.25rem', cursor: 'pointer', transition: 'all 0.15s', transform: hoveredId === p._id ? 'translateY(-2px)' : 'none', boxShadow: hoveredId === p._id ? '0 8px 24px #6366f115' : 'none' }}>
                {/* Project icon */}
                <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #1e1e40, #2d1b54)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: '0.875rem', border: '1px solid #27272a' }}>
                  {'◈'}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 500, color: '#e4e4e7', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</h3>
                <p style={{ color: '#52525b', fontSize: 12, marginBottom: '1rem' }}>
                  {p.files?.length || 0} file{p.files?.length !== 1 ? 's' : ''} · updated {timeAgo(p.updatedAt)}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {['html', 'js', 'css'].map(ext => (
                      <span key={ext} style={{ fontSize: 10, padding: '2px 6px', background: '#09090b', border: '1px solid #27272a', borderRadius: 4, color: '#52525b' }}>{ext}</span>
                    ))}
                  </div>
                  <button onClick={e => deleteProject(e, p._id)}
                    style={{ background: 'none', border: 'none', color: '#3f3f46', cursor: 'pointer', fontSize: 13, padding: '4px', borderRadius: 6 }}
                    onMouseEnter={e => { e.stopPropagation(); e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#450a0a'; }}
                    onMouseLeave={e => { e.stopPropagation(); e.currentTarget.style.color = '#3f3f46'; e.currentTarget.style.background = 'none'; }}>
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
