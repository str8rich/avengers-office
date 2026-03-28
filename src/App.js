import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || window.location.origin;

const AVENGERS = [
  { id: 'iron_man',    name: 'Iron Man',     emoji: '🦾', color: '#c0392b', role: 'Campaign Manager'  },
  { id: 'black_widow', name: 'Black Widow',  emoji: '🕷️', color: '#8e44ad', role: 'Creative Director' },
  { id: 'thor',        name: 'Thor',         emoji: '⚡', color: '#2980b9', role: 'Video Producer'    },
  { id: 'hawkeye',     name: 'Hawkeye',      emoji: '🎯', color: '#27ae60', role: 'Analytics Lead'    },
  { id: 'cap',         name: 'Captain America', emoji: '🛡️', color: '#1abc9c', role: 'Commander'     },
];

const STATUS_COLORS = {
  idle:    '#555',
  working: '#c0392b',
  gym:     '#e67e22',
  sleep:   '#2c3e50',
};

const STATUS_LABELS = {
  idle:    '💤 Idle',
  working: '🔴 Working',
  gym:     '💪 Gym',
  sleep:   '😴 Sleep',
};

function AvengerCard({ avenger, status, task }) {
  return (
    <div className="avenger-card" style={{ borderColor: avenger.color }}>
      <div className="avenger-emoji">{avenger.emoji}</div>
      <div className="avenger-name" style={{ color: avenger.color }}>{avenger.name}</div>
      <div className="avenger-role">{avenger.role}</div>
      <div className="avenger-status" style={{ background: STATUS_COLORS[status] || STATUS_COLORS.idle }}>
        {STATUS_LABELS[status] || STATUS_LABELS.idle}
      </div>
      {task && <div className="avenger-task">📋 {task}</div>}
    </div>
  );
}

function LogEntry({ entry }) {
  return (
    <div className="log-entry">
      <span className="log-time">{entry.time}</span>
      <span className="log-avenger" style={{ color: entry.color }}>[{entry.avenger}]</span>
      <span className="log-msg"> {entry.message}</span>
    </div>
  );
}

export default function App() {
  const [connected, setConnected] = useState(false);
  const [avengerStates, setAvengerStates] = useState(() =>
    Object.fromEntries(AVENGERS.map(a => [a.id, { status: 'idle', task: null }]))
  );
  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString(), avenger: 'SYSTEM', color: '#3498db', message: 'Avengers Office Dashboard initialized' },
  ]);
  const socketRef = useRef(null);

  const addLog = (avenger, message, color = '#e0e0e0') => {
    setLogs(prev => [
      { time: new Date().toLocaleTimeString(), avenger, color, message },
      ...prev.slice(0, 99),
    ]);
  };

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      addLog('SYSTEM', 'Connected to bot via Socket.IO', '#2ecc71');
    });

    socket.on('disconnect', () => {
      setConnected(false);
      addLog('SYSTEM', 'Disconnected from bot', '#e74c3c');
    });

    socket.on('avenger_update', (data) => {
      const { id, status, task } = data;
      setAvengerStates(prev => ({ ...prev, [id]: { status, task } }));
      const av = AVENGERS.find(a => a.id === id);
      if (av) addLog(av.name, `→ ${STATUS_LABELS[status]}${task ? ': ' + task : ''}`, av.color);
    });

    socket.on('task_update', (data) => {
      addLog(data.avenger || 'BOT', data.message, '#f39c12');
    });

    return () => socket.disconnect();
  }, []);

  const stats = {
    working: Object.values(avengerStates).filter(s => s.status === 'working').length,
    gym:     Object.values(avengerStates).filter(s => s.status === 'gym').length,
    idle:    Object.values(avengerStates).filter(s => s.status === 'idle').length,
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🎮 Avengers Pokemon Office</h1>
        <div className={`connection-badge ${connected ? 'online' : 'offline'}`}>
          {connected ? '🟢 Bot Connected' : '🔴 Bot Offline'}
        </div>
      </header>

      <div className="stats-bar">
        <div className="stat"><span className="stat-num" style={{color:'#c0392b'}}>{stats.working}</span> Working</div>
        <div className="stat"><span className="stat-num" style={{color:'#e67e22'}}>{stats.gym}</span> At Gym</div>
        <div className="stat"><span className="stat-num" style={{color:'#3498db'}}>{stats.idle}</span> Idle</div>
      </div>

      <div className="office-grid">
        {AVENGERS.map(av => (
          <AvengerCard
            key={av.id}
            avenger={av}
            status={avengerStates[av.id]?.status}
            task={avengerStates[av.id]?.task}
          />
        ))}
      </div>

      <div className="api-status">
        <h3>🔌 API Integrations</h3>
        <div className="api-grid">
          {[
            { name: 'OpenAI GPT-4',   icon: '🧠', color: '#10a37f' },
            { name: 'ElevenLabs',     icon: '🎙️', color: '#8e44ad' },
            { name: 'Facebook Ads',   icon: '📱', color: '#1877f2' },
            { name: 'Gemini Imagen',  icon: '🖼️', color: '#4285f4' },
            { name: 'Runway Gen-3',   icon: '🎬', color: '#e74c3c' },
            { name: 'Luma Dream',     icon: '✨', color: '#9b59b6' },
            { name: 'Telegram Bot',   icon: '🤖', color: '#0088cc' },
            { name: 'Socket.IO',      icon: '📡', color: connected ? '#2ecc71' : '#e74c3c' },
          ].map(api => (
            <div key={api.name} className="api-badge" style={{ borderColor: api.color }}>
              {api.icon} <span style={{ color: api.color }}>{api.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="log-panel">
        <h3>📜 Activity Log</h3>
        <div className="log-list">
          {logs.map((entry, i) => <LogEntry key={i} entry={entry} />)}
        </div>
      </div>

      <footer className="footer">
        🤖 @CaptainAmerica215Bot · 📡 Real-time via Socket.IO · 🎮 Pokemon Gen 3 Style
      </footer>
    </div>
  );
}
