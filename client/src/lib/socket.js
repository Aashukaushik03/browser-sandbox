import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    const token = localStorage.getItem('token');
    const url = import.meta.env.VITE_API_URL || '';
    socket = io(url, { auth: { token }, transports: ['websocket'] });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) { socket.disconnect(); socket = null; }
};