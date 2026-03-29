import React, { useState, useEffect, useCallback } from 'react';
import { AvengerSprite, SPRITE_DATA } from './components/PixelArtSprites';
import { socketService } from './services/socketService';
import './App.css';

const BOT_URL = process.env.REACT_APP_SOCKET_URL || window.location.origin;

const AVENGERS = [
  { id: 'iron_man',        name: 'Iron Man',         role: 'Campaign Manager',  color: '#FF3300' },
  { id: 'black_widow',     name: 'Black Widow',      role: 'Creative Director', color: '#222222' },
  { id: 'thor',            name: 'Thor',              role: 'Video Producer',    color: '#FFAA00' },
  { id: 'hawkeye',         name: 'Hawkeye',           role: 'Analytics Lead',    color: '#8B4513' },
  { id: 'captain_america', name: 'Captain America',   role: 'Commander',         color: '#0066FF' },
];

const STATUS_ICONS = { idle: '🟢', working: '🔴', gym: '💪', sleep: '😴' };
const STATUS_LABELS = { idle: 'Idle', working: 'Working', gym: 'At Gym', sleep: 'Sleeping' };

const INITIAL_STATES = Object.fromEntries(
  AVENGERS.map(a => [a.id, { status: 'idle', task: null }])
);

function AvengerCard({ avenger, status, task }) {
  const spriteStatus = status === 'gym' ? 'idle' : status;

  return (
    <div className="avenger-card" style={{ '--border-color': avenger.color }}>
      <div className="sprite-wrap">
        <AvengerSprite avengerId={avenger.id} status={spriteStatus} />
        <span className="status-icon">{STATUS_ICONS[status] || '🟢'}</span>
      </div>
      <div className="avenger-name" style={{ color: avenger.color }}>{avenger.name}</div>
      <div className="avenger-role">{avenger.role}</div>
      <div className={`status-badge status-${status}`}>
        {STATUS_LABELS[status] || 'Idle'}
      </div>
      {task && <div className="task-label">📋 {task}</div>}
    </div>
  );
}

export default function App() {
  const [connected, setConnected] = useState(false);
  const [states, setStates] = useState(INITIAL_STATES);
  const [logs, setLogs] = useState([
    { t: now(), who: 'SYSTEM', color: '#3498db', msg: 'Dashboard initialized — connecting to bot...' },
  ]);

  function now() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  const log = useCallback((who, msg, color = '#bdc3c7') => {
    setLogs(prev => [{ t: now(), who, color, msg }, ...prev.slice(0, 149)]);
  }, []);

  useEffect(() => {
    socketService.connect(BOT_URL);

    const checkConn = setInterval(() => {
      setConnected(socketService.isConnected());
    }, 1000);

    socketService.on('connect', () => {
      setConnected(true);
      log('SYSTEM', `Socket connected (${BOT_URL})`, '#2ecc71');
    });

    socketService.on('disconnect', () => {
      setConnected(false);
      log('SYSTEM', 'Socket disconnected — retrying...', '#e74c3c');
    });

    // Bot events
    socketService.on('job_started', ({ avenger, task }) => {
      const av = AVENGERS.find(a => a.id === avenger);
      setStates(prev => ({ ...prev, [avenger]: { status: 'working', task } }));
      log(av?.name || avenger, `Started: ${task}`, av?.color || '#f39c12');
    });

    socketService.on('job_completed', ({ avenger, result }) => {
      const av = AVENGERS.find(a => a.id === avenger);
      setStates(prev => ({ ...prev, [avenger]: { status: 'gym', task: null } }));
      log(av?.name || avenger, `✅ Done → heading to gym`, av?.color || '#2ecc71');

      // Sleep after 1 hour
      setTimeout(() => {
        setStates(prev => ({ ...prev, [avenger]: { status: 'sleep', task: null } }));
        log(av?.name || avenger, '😴 Going to sleep', '#7f8c8d');
      }, 3_600_000);
    });

    // Legacy event names from existing bot
    socketService.on('avenger_update', ({ id, status, task }) => {
      const av = AVENGERS.find(a => a.id === id);
      setStates(prev => ({ ...prev, [id]: { status, task: task || null } }));
      log(av?.name || id, `→ ${STATUS_LABELS[status] || status}${task ? ': ' + task : ''}`, av?.color);
    });

    socketService.on('task_update', ({ avenger, message }) => {
      log(avenger || 'BOT', message, '#f39c12');
    });

    socketService.on('status', ({ message }) => {
      log('BOT', message, '#9b59b6');
    });

    return () => {
      clearInterval(checkConn);
      socketService.disconnect();
    };
  }, [log]);

  const counts = {
    working: Object.values(states).filter(s => s.status === 'working').length,
    gym:     Object.values(states).filter(s => s.status === 'gym').length,
    sleep:   Object.values(states).filter(s => s.status === 'sleep').length,
    idle:    Object.values(states).filter(s => s.status === 'idle').length,
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <h1>🎮 Avengers Pokemon Office</h1>
          <span className="subtitle">Gen 3 Style Dashboard</span>
        </div>
        <div className={`conn-badge ${connected ? 'online' : 'offline'}`}>
          {connected ? '🟢 Bot Online' : '🔴 Bot Offline'}
        </div>
      </header>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-item"><span style={{color:'#e74c3c'}}>{counts.working}</span> Working</div>
        <div className="stat-item"><span style={{color:'#e67e22'}}>{counts.gym}</span> At Gym</div>
        <div className="stat-item"><span style={{color:'#3498db'}}>{counts.sleep}</span> Sleeping</div>
        <div className="stat-item"><span style={{color:'#2ecc71'}}>{counts.idle}</span> Idle</div>
        <div className="stat-item conn-url">📡 {BOT_URL.replace('https://', '').replace('http://', '')}</div>
      </div>

      {/* Office Grid */}
      <section className="office-section">
        <h2 className="section-title">🏢 Office Floor</h2>
        <div className="office-grid">
          {AVENGERS.map(av => (
            <AvengerCard
              key={av.id}
              avenger={av}
              status={states[av.id]?.status || 'idle'}
              task={states[av.id]?.task}
            />
          ))}
        </div>
      </section>

      {/* API Status */}
      <section className="api-section">
        <h2 className="section-title">🔌 Integrations</h2>
        <div className="api-grid">
          {[
            { name: 'OpenAI GPT-4',  icon: '🧠', color: '#10a37f', active: true },
            { name: 'ElevenLabs',    icon: '🎙️', color: '#8e44ad', active: true },
            { name: 'Facebook Ads',  icon: '📘', color: '#1877f2', active: true },
            { name: 'Gemini Imagen', icon: '🖼️', color: '#4285f4', active: true },
            { name: 'Runway Gen-3',  icon: '🎬', color: '#e74c3c', active: true },
            { name: 'Luma Dream',    icon: '✨', color: '#9b59b6', active: true },
            { name: 'Telegram Bot',  icon: '🤖', color: '#0088cc', active: true },
            { name: 'Socket.IO',     icon: '📡', color: connected ? '#2ecc71' : '#e74c3c', active: connected },
          ].map(api => (
            <div key={api.name} className="api-chip" style={{ borderColor: api.color, opacity: api.active ? 1 : 0.5 }}>
              {api.icon} <span style={{ color: api.color }}>{api.name}</span>
              <span className="api-dot" style={{ background: api.active ? api.color : '#555' }} />
            </div>
          ))}
        </div>
      </section>

      {/* Log */}
      <section className="log-section">
        <h2 className="section-title">📜 Activity Log <span className="log-count">{logs.length} entries</span></h2>
        <div className="log-scroll">
          {logs.map((e, i) => (
            <div key={i} className="log-row">
              <span className="log-t">{e.t}</span>
              <span className="log-who" style={{ color: e.color }}>[{e.who}]</span>
              <span className="log-msg"> {e.msg}</span>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer">
        🤖 @CaptainAmerica215Bot · 🎮 Pokemon Gen 3 · 📡 Real-time Socket.IO · 🦾 5 Avengers
      </footer>
    </div>
  );
}
