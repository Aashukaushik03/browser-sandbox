import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { getSocket } from '../lib/socket';
import api from '../lib/api';
import FileTree from '../components/FileTree/FileTree';
import Editor from '../components/Editor/Editor';
import Preview from '../components/Preview/Preview';
import Terminal from '../components/Terminal/Terminal';

const LAYOUTS = [
  { id: 'editor', label: '≡ Editor', icon: '▤' },
  { id: 'split', label: 'Split', icon: '⊞' },
  { id: 'preview', label: 'Preview', icon: '▷' },
];

export default function IDEPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setProject, updateFileContent, project } = useStore();
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState('split');
  const [termOpen, setTermOpen] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/projects/${id}`)
      .then(({ data }) => { setProject(data); setLoading(false); })
      .catch(() => navigate('/'));
  }, [id]);

  useEffect(() => {
    if (!project) return;
    const socket = getSocket();
    socket.emit('join-project', id);
    socket.on('file-updated', ({ fileId, content }) => updateFileContent(fileId, content));
    return () => socket.off('file-updated');
  }, [id, !!project]);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0e0e10', gap: 16 }}>
      <div style={{ width: 36, height: 36, border: '3px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ color: '#555', fontSize: 14 }}>Loading project...</span>
    </div>
  );

  const showEditor = layout === 'editor' || layout === 'split';
  const showPreview = layout === 'preview' || layout === 'split';

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0e0e10', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* ── Topbar ── */}
      <div style={{ height: 44, background: '#18181b', borderBottom: '1px solid #27272a', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8, flexShrink: 0, zIndex: 10 }}>

        {/* Logo + back */}
        <button onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 8, color: '#a1a1aa' }}
          onMouseEnter={e => e.currentTarget.style.background = '#27272a'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}>
          <span style={{ fontSize: 18 }}>◈</span>
          <span style={{ fontSize: 13, color: '#71717a' }}>←</span>
        </button>

        <div style={{ width: 1, height: 20, background: '#27272a' }} />

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, color: '#71717a' }}>Projects</span>
          <span style={{ color: '#3f3f46', fontSize: 13 }}>/</span>
          <span style={{ fontSize: 13, color: '#e4e4e7', fontWeight: 500 }}>{project?.name}</span>
        </div>

        {saving && <span style={{ fontSize: 11, color: '#6366f1', marginLeft: 8, opacity: 0.8 }}>Saving…</span>}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Layout switcher */}
          <div style={{ display: 'flex', background: '#09090b', border: '1px solid #27272a', borderRadius: 8, overflow: 'hidden', padding: 2, gap: 2 }}>
            {LAYOUTS.map(l => (
              <button key={l.id} onClick={() => setLayout(l.id)}
                style={{ background: layout === l.id ? '#6366f1' : 'none', border: 'none', borderRadius: 6, padding: '4px 12px', color: layout === l.id ? '#fff' : '#71717a', cursor: 'pointer', fontSize: 12, fontWeight: layout === l.id ? 500 : 400, transition: 'all 0.15s' }}>
                {l.label}
              </button>
            ))}
          </div>

          <div style={{ width: 1, height: 20, background: '#27272a' }} />

          {/* Terminal toggle */}
          <button onClick={() => setTermOpen(o => !o)}
            style={{ background: termOpen ? '#27272a' : 'none', border: '1px solid #27272a', borderRadius: 8, padding: '4px 12px', color: termOpen ? '#e4e4e7' : '#71717a', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 14 }}>⌨</span> Terminal
          </button>
        </div>
      </div>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Sidebar */}
        <div style={{ width: 240, flexShrink: 0, borderRight: '1px solid #27272a' }}>
          <FileTree projectId={id} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

          {/* Editor / Preview panes */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
            {showEditor && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, borderRight: showPreview ? '1px solid #27272a' : 'none' }}>
                <Editor projectId={id} onSaving={setSaving} />
              </div>
            )}
            {showPreview && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
                <Preview projectId={id} />
              </div>
            )}
          </div>

          {/* Terminal */}
          {termOpen && (
            <div style={{ height: 220, borderTop: '1px solid #27272a', flexShrink: 0 }}>
              <Terminal projectId={id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
