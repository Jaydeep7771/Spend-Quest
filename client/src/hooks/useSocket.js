import { io } from 'socket.io-client';

let socket;

export function connectSocket(userId) {
  if (socket) return socket;
  socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', { withCredentials: true });
  socket.emit('join_user_room', userId);
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
