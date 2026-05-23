import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import api from '../../lib/api';

const HELP = `Available commands:
  npm install <package>   Install an npm package
  npm list                List installed packages
  clear                   Clear terminal
  help                    Show this message`;

export default function Terminal({ projectId }) {
  const { project } = useStore();
  const [input, setInput] = useState('');
  const [lines, setLines] = useState([
    { text: '  Browser Sandbox Terminal  ', type: 'banner' },
    { text: 'Type "help" to see available commands.', type: 'info' },
  ]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [lines]);

  const push = (text, type = 'output') => setLines(l => [...l, { text, type }]);

  const run = async (cmd) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    push(`$ ${trimmed}`, 'input');
    setHistory(h => [trimmed, ...h.slice(0, 49)]);
    setHistIdx(-1);

    const parts = trimmed.split(/\s+/);

    if (parts[0] === 'help') { push(HELP, 'info'); return; }
    if (parts[0] === 'clear') { setLines([]); return; }
    if (parts[0] === 'npm' && parts[1] === 'list') {
      const pkgs = project?.packages || [];
      push(pkgs.length ? pkgs.map(p => `  ├─ ${p.name}@${p.version}`).join('\n') : '  (no packages installed)', 'output');
      return;
    }
    if (parts[0] === 'npm' && parts[1] === 'install') {
      if (!parts[2]) { push('Usage: npm install <package-name>', 'error'); return; }
      setLoading(true);
      push(`  ⧗ Installing ${parts[2]}...`, 'info');
      try {
        const { data } = await api.post(`/packages/${projectId}/install`, { packageName: parts[2] });
        push(`  ✓ Installed ${data.name}@${data.version}`, 'success');
      } catch (err) {
        push(`  ✗ ${err.response?.data?.message || 'Install failed'}`, 'error');
      } finally { setLoading(false); }
      return;
    }
    push(`  command not found: ${parts[0]}  (type "help" for commands)`, 'error');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      const idx = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(idx);
      setInput(history[idx] || '');
    } else if (e.key === 'ArrowDown') {
      const idx = Math.max(histIdx - 1, -1);
      setHistIdx(idx);
      setInput(idx === -1 ? '' : history[idx]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    run(input);
    setInput('');
  };

  const colors = {
    banner:  { color: '#a5b4fc', background: '#1e1e40', fontWeight: 600, textAlign: 'center', padding: '2px 0' },
    input:   { color: '#818cf8' },
    output:  { color: '#d4d4d8' },
    info:    { color: '#60a5fa' },
    success: { color: '#34d399' },
    error:   { color: '#f87171' },
  };

  return (
    <div style={{ height: '100%', background: '#09090b', display: 'flex', flexDirection: 'column', fontFamily: '"Fira Code", Consolas, monospace' }}
      onClick={() => inputRef.current?.focus()}>

      {/* Terminal header */}
      <div style={{ height: 32, background: '#111113', borderBottom: '1px solid #27272a', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8, flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
        </div>
        <span style={{ color: '#52525b', fontSize: 11, marginLeft: 4 }}>bash</span>
        {loading && (
          <span style={{ marginLeft: 'auto', color: '#60a5fa', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ animation: 'pulse 1s infinite' }}>⧗</span> Running...
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
          </span>
        )}
      </div>

      {/* Output */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {lines.map((line, i) => (
          <pre key={i} style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-all', lineHeight: 1.7, ...(colors[line.type] || {}) }}>
            {line.text}
          </pre>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit}
        style={{ padding: '6px 12px', borderTop: '1px solid #27272a', display: 'flex', alignItems: 'center', gap: 8, background: '#0e0e10' }}>
        <span style={{ color: '#6366f1', fontSize: 13, flexShrink: 0 }}>❯</span>
        <input ref={inputRef} value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          placeholder="npm install lodash"
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#e4e4e7', fontSize: 12, fontFamily: 'inherit' }} />
      </form>
    </div>
  );
}
