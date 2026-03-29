const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const { io: ioClient } = require('socket.io-client');
const cors = require('cors');

const app = express();
const BOT_SOCKET_URL = process.env.BOT_SOCKET_URL || 'http://localhost:8000';
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

const server = http.createServer(app);
const io = socketIO(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  pingTimeout: 20000,
  pingInterval: 10000,
});

// ── React client connections ──────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('[REACT] Client connected:', socket.id);
  socket.emit('status', { message: 'Dashboard connected' });
  socket.on('disconnect', () => console.log('[REACT] Client disconnected:', socket.id));
});

// ── Bridge: connect to Python bot Socket.IO and forward all events ────────
const BRIDGE_EVENTS = [
  'job_started',
  'job_completed',
  'avenger_update',
  'task_update',
  'status',
];

function connectBotBridge() {
  console.log(`[BRIDGE] Connecting to bot at ${BOT_SOCKET_URL} …`);

  const botSocket = ioClient(BOT_SOCKET_URL, {
    reconnection: true,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 10000,
    reconnectionAttempts: Infinity,
    transports: ['websocket', 'polling'],
  });

  botSocket.on('connect', () => {
    console.log('[BRIDGE] ✅ Connected to Python bot Socket.IO');
    io.emit('connect_bridge', { message: 'Bridge connected to bot' });
  });

  botSocket.on('disconnect', (reason) => {
    console.warn('[BRIDGE] ❌ Bot disconnected:', reason);
    io.emit('disconnect_bridge', { message: 'Bot disconnected', reason });
  });

  botSocket.on('connect_error', (err) => {
    console.warn('[BRIDGE] Connection error:', err.message);
  });

  // Forward every relevant event from bot → React clients
  BRIDGE_EVENTS.forEach((event) => {
    botSocket.on(event, (data) => {
      console.log(`[BRIDGE] → Forwarding "${event}":`, JSON.stringify(data).substring(0, 80));
      io.emit(event, data);
    });
  });

  return botSocket;
}

// Health endpoints
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), bridge: 'active' });
});

app.get('/api/status', (_req, res) => {
  res.json({ clients: io.engine.clientsCount, bridge: BOT_SOCKET_URL });
});

// React fallback
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`🎮 Avengers Dashboard running on port ${PORT}`);
  console.log(`📡 Bridging bot events from ${BOT_SOCKET_URL}`);
  connectBotBridge();
});

module.exports = { server, io };
