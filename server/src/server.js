import 'dotenv/config';
import http from 'node:http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { setSocket } from './services/notificationService.js';

const app = createApp();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, credentials: true }
});

io.on('connection', (socket) => {
  socket.on('join_user_room', (userId) => {
    if (userId) socket.join(`user:${userId}`);
  });
});

setSocket(io);

const port = Number(process.env.PORT || 5000);
server.listen(port, () => {
  console.log(`SpendQuest API running on http://localhost:${port}`);
});
