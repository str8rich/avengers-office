import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = {};
  }

  connect(url) {
    if (this.socket && this.socket.connected) return;

    console.log(`[SOCKET] Connecting to: ${url}`);

    this.socket = io(url, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 20,
      transports: ['websocket', 'polling'],
      upgrade: true,
    });

    this.socket.on('connect', () => {
      console.log('✅ [SOCKET] Connected:', this.socket.id);
    });
    this.socket.on('disconnect', (reason) => {
      console.log('❌ [SOCKET] Disconnected:', reason);
    });
    this.socket.on('connect_error', (err) => {
      console.warn('⚠️ [SOCKET] Connect error:', err.message);
    });
  }

  on(event, cb) {
    if (!this.socket) return;
    this.socket.on(event, cb);
  }

  off(event, cb) {
    if (!this.socket) return;
    this.socket.off(event, cb);
  }

  emit(event, data) {
    if (!this.socket) return;
    this.socket.emit(event, data);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected() {
    return !!(this.socket && this.socket.connected);
  }

  getSocketId() {
    return this.socket?.id || null;
  }
}

export const socketService = new SocketService();
