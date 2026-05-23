import { useState } from 'react';
import { useStore } from '../../store/useStore';
import api from '../../lib/api';

const EXT_COLORS = { js: '#f7df1e', jsx: '#61dafb', ts: '#3178c6', tsx: '#3178c6', html: '#e34c26', css: '#264de4', json: '#5ba4cf', md: '#083fa1' };
const EXT_ICONS  = { js: 'JS', jsx: '⚛', ts: 'TS', tsx: '⚛', html: '<>', css: '{}', json: '{}', md: '¶' };

function FileIcon({ name, type }) {
  if (type === 'folder') return <span style={{ fontSize: 14 }}>📁</span>;
  const ext = name.split('.').pop();
  const color = EXT_COLORS[ext] || '#71717a';
  const label = EXT_ICONS[ext] || '•';
  return (
    <span style={{ fontSize: 9, fontWeight: 700, color, background: color + '22', borderRadius: 3, padding: '1px 3px', minWidth: 18, textAlign: 'center', display: 'inline-block' }}>
      {label}
    </span>
  );
}

function FileItem({ file, projectId, depth = 0, allFiles }) {
  const { activeFileId, setActiveFile, removeFile } = useStore();
  const children = allFiles.filter(f => f.parentId === file.id);
  const [open, setOpen] = useState(true);
  const [hovered, setHovered] = useState(false);
  const isActive = activeFileId === file.id;

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm(`Delete "${file.name}"?`)) return;
    await api.delete(`/files/${projectId}/${file.id}`);
    removeFile(file.id);
  };

  return (
    <div>
      <div
        onClick={() => file.type === 'file' ? setActiveFile(file.id) : setOpen(!open)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: `5px 10px 5px ${10 + depth * 14}px`,
          background: isActive ? '#1e1e40' : hovered ? '#1c1c1e' : 'transparent',
          borderLeft: isActive ? '2px solid #6366f1' : '2px solid transparent',
          cursor: 'pointer', userSelect: 'none', transition: 'all 0.1s',
        }}>
        {file.type === 'folder' && (
          <span style={{ fontSize: 10, color: '#52525b', width: 10 }}>{open ? '▾' : '▸'}</span>
        )}
        <FileIcon name={file.name} type={file.type} />
        <span style={{ flex: 1, fontSize: 13, color: isActive ? '#a5b4fc' : '#d4d4d8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {file.name}
        </span>
        {hovered && (
          <button onClick={handleDelete}
            style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: 12, padding: '0 2px', lineHeight: 1, borderRadius: 3 }}
            onMouseEnter={e => { e.stopPropagation(); e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={e => { e.stopPropagation(); e.currentTarget.style.color = '#71717a'; }}>
            ✕
          </button>
        )}
      </div>
      {file.type === 'folder' && open && children.map(c => (
        <FileItem key={c.id} file={c} projectId={projectId} depth={depth + 1} allFiles={allFiles} />
      ))}
    </div>
  );
}

export default function FileTree({ projectId }) {
  const { project, addFile } = useStore();
  const [creating, setCreating] = useState(null);
  const [newName, setNewName] = useState('');
  const [hoveredHeader, setHoveredHeader] = useState(false);

  const rootFiles = project?.files?.filter(f => !f.parentId) || [];

  const create = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return setCreating(null);
    const ext = newName.split('.').pop();
    const langMap = { js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript', html: 'html', css: 'css', json: 'json', md: 'markdown' };
    const { data } = await api.post(`/files/${projectId}`, {
      name: newName.trim(), type: creating, parentId: null, language: langMap[ext] || 'plaintext'
    });
    addFile(data);
    setNewName(''); setCreating(null);
  };

  return (
    <div style={{ height: '100%', background: '#111113', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div
        onMouseEnter={() => setHoveredHeader(true)}
        onMouseLeave={() => setHoveredHeader(false)}
        style={{ padding: '10px 10px 8px', borderBottom: '1px solid #27272a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: '#52525b', letterSpacing: '0.08em' }}>EXPLORER</span>
        <div style={{ display: 'flex', gap: 4, opacity: hoveredHeader ? 1 : 0, transition: 'opacity 0.15s' }}>
          {[['file', '📄', 'New file'], ['folder', '📁', 'New folder']].map(([type, icon, title]) => (
            <button key={type} onClick={() => { setCreating(type); setNewName(''); }} title={title}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: '2px 4px', borderRadius: 4, color: '#71717a' }}
              onMouseEnter={e => e.currentTarget.style.background = '#27272a'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* New file input */}
      {creating && (
        <form onSubmit={create} style={{ padding: '6px 10px', borderBottom: '1px solid #27272a' }}>
          <input autoFocus placeholder={creating === 'file' ? 'filename.js' : 'folder-name'}
            value={newName} onChange={e => setNewName(e.target.value)}
            onBlur={() => { setCreating(null); setNewName(''); }}
            style={{ width: '100%', background: '#1c1c1e', border: '1px solid #6366f1', borderRadius: 6, padding: '6px 10px', color: '#e4e4e7', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </form>
      )}

      {/* File list */}
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 4 }}>
        {rootFiles.length === 0 && !creating && (
          <p style={{ color: '#3f3f46', fontSize: 12, textAlign: 'center', marginTop: '2rem', padding: '0 1rem' }}>
            No files yet.<br />Click + to create one.
          </p>
        )}
        {rootFiles.map(f => (
          <FileItem key={f.id} file={f} projectId={projectId} allFiles={project?.files || []} />
        ))}
      </div>

      {/* Footer: package count */}
      {project?.packages?.length > 0 && (
        <div style={{ padding: '8px 12px', borderTop: '1px solid #27272a', fontSize: 11, color: '#52525b' }}>
          📦 {project.packages.length} package{project.packages.length > 1 ? 's' : ''} installed
        </div>
      )}
    </div>
  );
}
