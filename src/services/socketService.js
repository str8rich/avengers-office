import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(url) {
    if (this.socket && this.socket.connected) return;

    const target = url || process.env.REACT_APP_SOCKET_URL || window.location.origin;
    console.log(`[SOCKET] 🔌 Connecting to: ${target}`);

    this.socket = io(target, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 20,
      transports: ['websocket', 'polling'],
      upgrade: true,
    });

    this.socket.on('connect',       () => console.log('✅ [SOCKET] Connected:', this.socket.id));
    this.socket.on('disconnect',    (r) => console.log('❌ [SOCKET] Disconnected:', r));
    this.socket.on('connect_error', (e) => console.warn('⚠️ [SOCKET] Error:', e.message));
  }

  on(event, cb) {
    if (this.socket) this.socket.on(event, cb);
  }

  off(event, cb) {
    if (this.socket) this.socket.off(event, cb);
  }

  emit(event, data) {
    if (this.socket) this.socket.emit(event, data);
  }

  disconnect() {
    if (this.socket) { this.socket.disconnect(); this.socket = null; }
  }

  isConnected() {
    return !!(this.socket && this.socket.connected);
  }
}

export const socketService = new SocketService();
