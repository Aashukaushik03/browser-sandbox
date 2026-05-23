import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '../../store/useStore';

const getExt = (name) => name.split('.').pop();

export default function Preview({ projectId }) {
  const { project } = useStore();
  const iframeRef = useRef(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [status, setStatus] = useState('ready');

  const buildHTML = useCallback(() => {
    if (!project?.files) return '';
    const htmlFile = project.files.find(f => f.name === 'index.html');
    const cssFiles = project.files.filter(f => getExt(f.name) === 'css');
    const jsFiles = project.files.filter(f => ['js', 'jsx'].includes(getExt(f.name)));

    let html = htmlFile?.content || '<html><body><p style="font-family:sans-serif;color:#666;padding:2rem">No index.html found</p></body></html>';
    const styles = cssFiles.map(f => `<style>${f.content}</style>`).join('\n');
    const scripts = jsFiles.map(f => `<script>\n${f.content}\n</script>`).join('\n');

    html = html.includes('</head>') ? html.replace('</head>', `${styles}\n</head>`) : styles + html;
    html = html.includes('</body>') ? html.replace('</body>', `${scripts}\n</body>`) : html + scripts;
    return html;
  }, [project?.files]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    setStatus('loading');
    const content = buildHTML();
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    iframe.onload = () => setStatus('ready');
    iframe.src = url;
    return () => URL.revokeObjectURL(url);
  }, [buildHTML, refreshKey]);

  const statusColor = { loading: '#f59e0b', ready: '#22c55e', error: '#ef4444' };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0e0e10' }}>
      {/* Preview toolbar */}
      <div style={{ height: 36, background: '#18181b', borderBottom: '1px solid #27272a', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 10, flexShrink: 0 }}>
        {/* Traffic lights */}
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
        </div>

        {/* Fake URL bar */}
        <div style={{ flex: 1, background: '#09090b', border: '1px solid #27272a', borderRadius: 6, padding: '3px 10px', fontSize: 11, color: '#52525b', display: 'flex', alignItems: 'center', gap: 6, maxWidth: 300 }}>
          <span style={{ color: statusColor[status], fontSize: 8 }}>●</span>
          <span>sandbox://preview</span>
        </div>

        <button onClick={() => setRefreshKey(k => k + 1)}
          style={{ marginLeft: 'auto', background: '#27272a', border: '1px solid #3f3f46', borderRadius: 6, padding: '4px 10px', color: '#a1a1aa', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
          onMouseEnter={e => e.currentTarget.style.background = '#3f3f46'}
          onMouseLeave={e => e.currentTarget.style.background = '#27272a'}>
          ↻ Refresh
        </button>
      </div>

      {/* iframe */}
      <div style={{ flex: 1, background: '#fff', position: 'relative' }}>
        {status === 'loading' && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #6366f1, #a855f7)', animation: 'progress 1s ease-in-out infinite', zIndex: 1 }} />
        )}
        <style>{`@keyframes progress { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }`}</style>
        <iframe ref={iframeRef} sandbox="allow-scripts allow-same-origin"
          style={{ width: '100%', height: '100%', border: 'none' }} title="Preview" />
      </div>
    </div>
  );
}
