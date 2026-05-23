import { create } from 'zustand';

export const useStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  project: null,
  activeFileId: null,

  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, project: null, activeFileId: null });
  },

  setProject: (project) => set({ project, activeFileId: project?.activeFileId || null }),

  setActiveFile: (id) => set({ activeFileId: id }),

  getActiveFile: () => {
    const { project, activeFileId } = get();
    return project?.files?.find(f => f.id === activeFileId) || null;
  },

  updateFileContent: (fileId, content) => set((state) => {
    if (!state.project) return {};
    return {
      project: {
        ...state.project,
        files: state.project.files.map(f => f.id === fileId ? { ...f, content } : f)
      }
    };
  }),

  addFile: (file) => set((state) => ({
    project: { ...state.project, files: [...state.project.files, file] },
    activeFileId: file.type === 'file' ? file.id : state.activeFileId
  })),

  removeFile: (fileId) => set((state) => ({
    project: {
      ...state.project,
      files: state.project.files.filter(f => f.id !== fileId && f.parentId !== fileId)
    },
    activeFileId: state.activeFileId === fileId ? null : state.activeFileId
  })),
}));
