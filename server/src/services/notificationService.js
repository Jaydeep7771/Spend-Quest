let ioInstance = null;

/**
 * Set the Socket.io instance.
 * @param {import('socket.io').Server} io
 */
export function setSocket(io) {
  ioInstance = io;
}

/**
 * Emit an event to a user's room.
 * @param {string} userId
 * @param {string} event
 * @param {Record<string, any>} payload
 */
export function emitToUser(userId, event, payload) {
  if (!ioInstance || !userId) return;
  ioInstance.to(`user:${userId}`).emit(event, payload);
}
