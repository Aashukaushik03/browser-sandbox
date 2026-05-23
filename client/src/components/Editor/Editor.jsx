import { useEffect, useRef, useCallback } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useStore } from '../../store/useStore';
import { getSocket } from '../../lib/socket';
import api from '../../lib/api';

const SAVE_DELAY = 600;

const LANG_COLORS = { javascript: '#f7df1e', html: '#e34c26', css: '#264de4', json: '#5ba4cf', markdown: '#083fa1', typescript: '#3178c6' };

export default function Editor({ projectId, onSaving }) {
  const { activeFileId, updateFileContent, project } = useStore();
  const activeFile = project?.files?.find(f => f.id === activeFileId) || null;
  const saveTimer = useRef(null);

  const save = useCallback(async (fileId, content) => {
    onSaving?.(true);
    try {
      await api.patch(`/files/${projectId}/${fileId}`, { content });
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      onSaving?.(false);
    }
  }, [projectId, onSaving]);

  const handleChange = (content) => {
    if (!activeFileId || content === undefined) return;
    updateFileContent(activeFileId, content);
    getSocket().emit('file-change', { projectId, fileId: activeFileId, content });
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => save(activeFileId, content), SAVE_DELAY);
  };

  useEffect(() => () => clearTimeout(saveTimer.current), []);

  if (!activeFile) return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0e0e10', gap: 12 }}>
      <div style={{ fontSize: 48, opacity: 0.15 }}>◈</div>
      <p style={{ color: '#3f3f46', fontSize: 14 }}>Select a file to start editing</p>
    </div>
  );

  const langColor = LANG_COLORS[activeFile.language] || '#71717a';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0e0e10' }}>
      {/* Tab bar */}
      <div style={{ height: 36, background: '#18181b', borderBottom: '1px solid #27272a', display: 'flex', alignItems: 'stretch', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', borderBottom: '2px solid #6366f1', background: '#0e0e10' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: langColor, flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: '#e4e4e7', fontWeight: 400 }}>{activeFile.name}</span>
        </div>
      </div>

      {/* Monaco */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <MonacoEditor
          key={activeFile.id}
          height="100%"
          language={activeFile.language || 'javascript'}
          value={activeFile.content || ''}
          onChange={handleChange}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
            fontLigatures: true,
            minimap: { enabled: false },
            lineNumbers: 'on',
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            padding: { top: 16, bottom: 16 },
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            renderLineHighlight: 'gutter',
            bracketPairColorization: { enabled: true },
          }}
        />
      </div>
    </div>
  );
}
