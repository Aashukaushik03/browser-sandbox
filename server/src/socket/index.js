import Project from '../models/Project.js';
import jwt from 'jsonwebtoken';

export const setupSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Unauthorized'));
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join-project', (projectId) => {
      socket.join(projectId);
    });

    socket.on('file-change', async ({ projectId, fileId, content }) => {
      try {
        const project = await Project.findOne({ _id: projectId, owner: socket.user.id });
        if (!project) return;
        const file = project.files.find(f => f.id === fileId);
        if (file) {
          file.content = content;
          await project.save();
          socket.to(projectId).emit('file-updated', { fileId, content });
        }
      } catch (err) {
        console.error('file-change error:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
