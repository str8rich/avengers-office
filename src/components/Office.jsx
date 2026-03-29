import React, { useState, useEffect, useCallback } from 'react';
import { Sprite } from './Sprite';
import { socketService } from '../services/socketService';

// ─── Layout constants ──────────────────────────────────────────────────────
const W = 1100;
const H = 580;

const COMPUTERS = {
  iron_man:        { x: 60,  y: 140 },
  black_widow:     { x: 220, y: 140 },
  thor:            { x: 380, y: 140 },
  hawkeye:         { x: 540, y: 140 },
  captain_america: { x: 700, y: 80  },
};

const GYM_SPOTS = [
  { x: 855, y: 115 },
  { x: 930, y: 115 },
  { x: 1005, y: 115 },
];

const BEDS = {
  iron_man:        { x: 30,  y: 430 },
  black_widow:     { x: 160, y: 430 },
  thor:            { x: 290, y: 430 },
  hawkeye:         { x: 420, y: 430 },
  captain_america: { x: 550, y: 430 },
};

const AVENGER_META = {
  iron_man:        { name: 'Iron Man',        color: '#e74c3c' },
  black_widow:     { name: 'Black Widow',     color: '#9b59b6' },
  thor:            { name: 'Thor',            color: '#f39c12' },
  hawkeye:         { name: 'Hawkeye',         color: '#27ae60' },
  captain_america: { name: 'Captain America', color: '#3498db' },
};

const STATUS_BADGE  = { idle: '🟢', working: '🔴', gym: '💪', sleep: '😴' };
const STATUS_LABEL  = { idle: 'Idle', working: 'Working', gym: 'Gym', sleep: 'Sleep' };

const INIT = Object.fromEntries(
  Object.keys(AVENGER_META).map(id => [
    id, { status: 'idle', task: null, position: BEDS[id] }
  ])
);

function ts() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ─── SVG office background ─────────────────────────────────────────────────
function OfficeBg() {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%" height="100%"
      style={{ position: 'absolute', top: 0, left: 0 }}
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Wall */}
      <rect width={W} height={200} fill="#5c4a32" />
      <rect y={180} width={W} height={20} fill="#4a3828" />
      {/* Floor */}
      <rect y={200} width={W} height={H - 200} fill="#c8a86e" />

      {/* Floor tiles */}
      {Array.from({ length: Math.ceil(W / 48) }).map((_, c) =>
        Array.from({ length: Math.ceil((H - 200) / 48) }).map((_, r) => (
          <rect
            key={`${c}-${r}`}
            x={c * 48} y={200 + r * 48}
            width={48} height={48}
            fill={(c + r) % 2 === 0 ? '#c8a86e' : '#b89858'}
            stroke="#a07840" strokeWidth={0.5}
          />
        ))
      )}

      {/* Wall panels */}
      {Array.from({ length: Math.ceil(W / 80) }).map((_, i) => (
        <rect key={i} x={i * 80 + 4} y={8} width={72} height={168}
          fill="#6b5540" stroke="#4a3828" strokeWidth={2} rx={2} />
      ))}

      {/* ── WORKSTATION AREA ── */}
      <rect x={10} y={90} width={750} height={20} fill="#3a2f20" rx={3} />
      <text x={20} y={85} fill="#f39c12" fontSize={10} fontFamily="monospace" fontWeight="bold">💻 WORKSTATIONS</text>

      {/* Desks + monitors */}
      {[60, 220, 380, 540].map((x, i) => (
        <g key={i}>
          <rect x={x - 5} y={110} width={75} height={30} fill="#8B5E3C" stroke="#5a3a1a" strokeWidth={2} rx={3} />
          <rect x={x + 5} y={92} width={55} height={38} fill="#1a1a2e" stroke="#333" strokeWidth={2} rx={2} />
          <rect x={x + 8} y={95} width={49} height={32} fill="#0d1117" rx={1} />
          <rect x={x + 9} y={96} width={47} height={30} fill="#003366" opacity={0.6} rx={1} />
          <text x={x + 33} y={115} fill="#00ff88" fontSize={8} textAnchor="middle" fontFamily="monospace">{'>'}_</text>
          <rect x={x + 27} y={128} width={7} height={8} fill="#555" />
          <rect x={x + 20} y={135} width={21} height={4} fill="#444" />
        </g>
      ))}

      {/* Captain America command center */}
      <rect x={695} y={50} width={90} height={40} fill="#1a3a6e" stroke="#2980b9" strokeWidth={3} rx={4} />
      <rect x={698} y={53} width={84} height={34} fill="#0d1f3e" rx={2} />
      <text x={740} y={73} fill="#3498db" fontSize={7} textAnchor="middle" fontFamily="monospace" fontWeight="bold">⚡ CMD</text>
      <text x={700} y={46} fill="#3498db" fontSize={8} fontFamily="monospace">👑 COMMAND</text>

      {/* ── GYM AREA ── */}
      <rect x={820} y={58} width={260} height={170} fill="#1a0a0a" stroke="#c0392b" strokeWidth={3} rx={6} />
      <text x={835} y={75} fill="#e74c3c" fontSize={10} fontFamily="monospace" fontWeight="bold">🏋️ GYM</text>

      {/* Treadmills */}
      {[840, 920, 1000].map((x, i) => (
        <g key={i}>
          <rect x={x} y={80} width={65} height={35} fill="#2c0a0a" stroke="#c0392b" strokeWidth={2} rx={4} />
          <rect x={x + 5} y={85} width={55} height={20} fill="#1a0505" rx={2} />
          <text x={x + 32} y={99} fill="#ff6666" fontSize={8} textAnchor="middle" fontFamily="monospace">🏃</text>
          <rect x={x + 10} y={108} width={45} height={4} fill="#c0392b" rx={2} />
        </g>
      ))}

      {/* Weight rack */}
      <rect x={835} y={140} width={240} height={80} fill="#1f0000" stroke="#922b21" strokeWidth={2} rx={4} />
      <text x={955} y={158} fill="#e74c3c" fontSize={8} textAnchor="middle" fontFamily="monospace">WEIGHT RACK</text>
      {[855, 895, 935, 975, 1015, 1055].map((x, i) => (
        <g key={i}>
          <circle cx={x} cy={183} r={14} fill="#333" stroke="#c0392b" strokeWidth={2} />
          <circle cx={x} cy={183} r={8} fill="#222" />
          <text x={x} y={187} fill="#999" fontSize={8} textAnchor="middle">{(i + 1) * 10}</text>
        </g>
      ))}

      {/* ── BEDROOM AREA ── */}
      <rect x={10} y={390} width={700} height={170} fill="#0d1b2a" stroke="#2c3e50" strokeWidth={3} rx={6} />
      <text x={25} y={408} fill="#3498db" fontSize={10} fontFamily="monospace" fontWeight="bold">🛏️ BEDROOM</text>

      {[30, 160, 290, 420, 550].map((x, i) => (
        <g key={i}>
          <rect x={x} y={415} width={110} height={70} fill="#1a2a3a" stroke="#34495e" strokeWidth={2} rx={4} />
          <rect x={x + 5} y={420} width={30} height={20} fill="#ecf0f1" stroke="#bdc3c7" strokeWidth={1} rx={3} />
          <rect x={x + 5} y={443} width={100} height={38} fill="#2e86de" stroke="#1a6ab5" strokeWidth={1} rx={2} />
          <rect x={x + 5} y={443} width={100} height={8} fill="#1a6ab5" rx={2} />
          <rect x={x} y={410} width={110} height={10} fill="#2c3e50" stroke="#34495e" strokeWidth={1} rx={2} />
        </g>
      ))}

      {/* ── DECORATIONS ── */}
      {/* Window */}
      <rect x={W - 140} y={20} width={120} height={100} fill="#87ceeb" stroke="#5c4a32" strokeWidth={4} rx={3} />
      <line x1={W - 80} y1={20} x2={W - 80} y2={120} stroke="#5c4a32" strokeWidth={2} />
      <line x1={W - 140} y1={70} x2={W - 20} y2={70} stroke="#5c4a32" strokeWidth={2} />
      <rect x={W - 135} y={25} width={50} height={42} fill="#b0d9f0" opacity={0.6} />
      <rect x={W - 75} y={25} width={50} height={42} fill="#b0d9f0" opacity={0.6} />

      {/* Plants */}
      <rect x={W - 55} y={170} width={20} height={30} fill="#8B4513" />
      <ellipse cx={W - 45} cy={165} rx={22} ry={18} fill="#27ae60" />
      <ellipse cx={W - 55} cy={158} rx={15} ry={12} fill="#2ecc71" />
      <rect x={790} y={230} width={16} height={24} fill="#8B4513" />
      <ellipse cx={798} cy={226} rx={18} ry={15} fill="#27ae60" />

      {/* Trophy cabinet */}
      <rect x={W - 180} y={210} width={60} height={80} fill="#4a3010" stroke="#8B5E3C" strokeWidth={2} rx={3} />
      <text x={W - 150} y={260} fill="#f39c12" fontSize={16} textAnchor="middle">🏆</text>
      <text x={W - 150} y={280} fill="#f39c12" fontSize={10} textAnchor="middle">🥇</text>

      {/* Rug */}
      <ellipse cx={450} cy={340} rx={200} ry={60} fill="#8B4513" opacity={0.3} stroke="#6B3410" strokeWidth={2} />
      <ellipse cx={450} cy={340} rx={170} ry={48} fill="none" stroke="#a0522d" strokeWidth={2} opacity={0.4} />
    </svg>
  );
}

// ─── Main Office component ─────────────────────────────────────────────────
export function Office() {
  const [avengers, setAvengers] = useState(INIT);
  const [botOnline, setBotOnline] = useState(false);
  const [log, setLog] = useState([
    { t: ts(), msg: '(SYSTEM) Dashboard initialized — connecting to bot…', color: '#3498db' },
  ]);

  const addLog = useCallback((msg, color = '#e0e0e0') => {
    setLog(prev => [{ t: ts(), msg, color }, ...prev.slice(0, 99)]);
  }, []);

  useEffect(() => {
    const botUrl = process.env.REACT_APP_SOCKET_URL || window.location.origin;
    addLog(`(SYSTEM) Connecting to ${botUrl}…`, '#3498db');
    socketService.connect(botUrl);

    // Poll connection state every second
    const poll = setInterval(() => setBotOnline(socketService.isConnected()), 1000);

    socketService.on('connect', () => {
      setBotOnline(true);
      addLog('(SYSTEM) ✅ Connected to bot server', '#2ecc71');
    });
    socketService.on('disconnect', () => {
      setBotOnline(false);
      addLog('(SYSTEM) ❌ Bot disconnected — retrying…', '#e74c3c');
    });

    // job_started → move to computer, show task
    socketService.on('job_started', ({ avenger, task }) => {
      const meta = AVENGER_META[avenger];
      setAvengers(prev => ({
        ...prev,
        [avenger]: { status: 'working', task, position: COMPUTERS[avenger] || prev[avenger].position },
      }));
      addLog(`[${meta?.name || avenger}] 🔴 Started: ${task?.substring(0, 45)}`, meta?.color);
    });

    // job_completed → gym → (1h later) sleep
    socketService.on('job_completed', ({ avenger }) => {
      const meta = AVENGER_META[avenger];
      const spot = GYM_SPOTS[Math.floor(Math.random() * GYM_SPOTS.length)];
      setAvengers(prev => ({ ...prev, [avenger]: { status: 'gym', task: null, position: spot } }));
      addLog(`[${meta?.name || avenger}] ✅ Done → Gym 💪`, meta?.color);

      setTimeout(() => {
        setAvengers(prev => ({ ...prev, [avenger]: { status: 'sleep', task: null, position: BEDS[avenger] } }));
        addLog(`[${meta?.name || avenger}] 😴 Going to sleep`, '#7f8c8d');
      }, 3_600_000);
    });

    // Legacy / extra events
    socketService.on('avenger_update', ({ id, status, task }) => {
      const posMap = { working: COMPUTERS[id], gym: GYM_SPOTS[0], sleep: BEDS[id], idle: BEDS[id] };
      setAvengers(prev => ({
        ...prev,
        [id]: { status, task: task || null, position: posMap[status] || prev[id]?.position },
      }));
    });
    socketService.on('task_update', ({ avenger, message }) => {
      addLog(`[${avenger || 'BOT'}] ${message}`, '#f39c12');
    });
    socketService.on('status', ({ message }) => {
      addLog(`(BOT) ${message}`, '#9b59b6');
    });
    socketService.on('connect_bridge', ({ message }) => {
      addLog(`(BRIDGE) ✅ ${message}`, '#2ecc71');
    });
    socketService.on('disconnect_bridge', ({ message }) => {
      addLog(`(BRIDGE) ⚠️ ${message}`, '#e67e22');
    });

    return () => {
      clearInterval(poll);
      socketService.disconnect();
    };
  }, [addLog]);

  const counts = {
    working: Object.values(avengers).filter(a => a.status === 'working').length,
    gym:     Object.values(avengers).filter(a => a.status === 'gym').length,
    sleep:   Object.values(avengers).filter(a => a.status === 'sleep').length,
    idle:    Object.values(avengers).filter(a => a.status === 'idle').length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0d1117', color: '#e0e0e0', fontFamily: "'Courier New', monospace" }}>

      {/* ── Header ── */}
      <div style={{ background: '#000', borderBottom: '3px solid #f39c12', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 'bold', color: '#f39c12', textShadow: '0 0 10px #f39c1255' }}>
            🛡️ Avengers Pokemon Office
          </div>
          <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>Gen 3 Style · Real-time Dashboard</div>
        </div>
        <div style={{
          padding: '6px 18px', borderRadius: 20,
          border: `2px solid ${botOnline ? '#2ecc71' : '#e74c3c'}`,
          background: botOnline ? 'rgba(46,204,113,.15)' : 'rgba(231,76,60,.15)',
          color: botOnline ? '#2ecc71' : '#e74c3c',
          fontWeight: 'bold', fontSize: 13,
          transition: 'all 0.5s ease',
        }}>
          {botOnline ? '🟢 Bot Online' : '🔴 Bot Offline'}
        </div>
      </div>

      {/* ── Status bar ── */}
      <div style={{ background: 'rgba(0,0,0,.6)', borderBottom: '1px solid #21262d', padding: '6px 20px', display: 'flex', gap: 24, fontSize: 12, flexShrink: 0 }}>
        {[
          { label: 'Working', n: counts.working, color: '#e74c3c' },
          { label: 'At Gym',  n: counts.gym,     color: '#e67e22' },
          { label: 'Sleep',   n: counts.sleep,   color: '#3498db' },
          { label: 'Idle',    n: counts.idle,    color: '#2ecc71' },
        ].map(({ label, n, color }) => (
          <span key={label} style={{ color: '#888' }}>
            <span style={{ color, fontSize: 18, fontWeight: 'bold', marginRight: 3 }}>{n}</span>{label}
          </span>
        ))}
        <span style={{ marginLeft: 'auto', color: '#444', fontSize: 10 }}>
          📡 {(process.env.REACT_APP_SOCKET_URL || window.location.hostname)}
        </span>
      </div>

      {/* ── Office canvas ── */}
      <div style={{ position: 'relative', flexShrink: 0, height: 580, overflow: 'hidden', borderBottom: '2px solid #21262d' }}>
        <OfficeBg />

        {Object.entries(avengers).map(([id, state]) => (
          <Sprite
            key={id}
            avenger={id}
            name={AVENGER_META[id].name}
            status={state.status}
            task={state.task}
            position={state.position}
            statusBadge={STATUS_BADGE[state.status] || '🟢'}
            statusLabel={STATUS_LABEL[state.status] || 'Idle'}
          />
        ))}
      </div>

      {/* ── API chips ── */}
      <div style={{ padding: '8px 16px', display: 'flex', flexWrap: 'wrap', gap: 8, borderBottom: '1px solid #21262d', flexShrink: 0 }}>
        {[
          { name: 'GPT-4o',     icon: '🧠', color: '#10a37f' },
          { name: 'ElevenLabs', icon: '🎙️', color: '#8e44ad' },
          { name: 'Facebook',   icon: '📘', color: '#1877f2' },
          { name: 'Gemini',     icon: '🖼️', color: '#4285f4' },
          { name: 'Runway',     icon: '🎬', color: '#e74c3c' },
          { name: 'Luma',       icon: '✨', color: '#9b59b6' },
          { name: 'Telegram',   icon: '🤖', color: '#0088cc' },
          { name: 'Socket.IO',  icon: '📡', color: botOnline ? '#2ecc71' : '#e74c3c' },
        ].map(api => (
          <div key={api.name} style={{
            padding: '3px 10px', border: `1px solid ${api.color}`, borderRadius: 14,
            fontSize: 10, color: api.color, background: `${api.color}11`,
          }}>
            {api.icon} {api.name}
          </div>
        ))}
      </div>

      {/* ── Activity log ── */}
      <div style={{ flex: 1, overflow: 'hidden', padding: '8px 16px', minHeight: 0 }}>
        <div style={{ fontSize: 10, color: '#f39c12', marginBottom: 6, fontWeight: 'bold' }}>📜 ACTIVITY LOG</div>
        <div style={{ height: 'calc(100% - 20px)', overflowY: 'auto', fontSize: 11, lineHeight: 1.7 }}>
          {log.map((e, i) => (
            <div key={i} style={{ borderBottom: '1px solid #161b22', padding: '1px 0' }}>
              <span style={{ color: '#444', marginRight: 6 }}>{e.t}</span>
              <span style={{ color: e.color }}>{e.msg}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ borderTop: '1px solid #21262d', padding: '6px 16px', fontSize: 10, color: '#444', display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
        <span>🤖 @CaptainAmerica215Bot</span>
        <span>🎮 Pokemon Gen 3 Office</span>
        <span>📡 Real-time Socket.IO Bridge</span>
        <span>🦾 5 Avengers</span>
      </div>
    </div>
  );
}
