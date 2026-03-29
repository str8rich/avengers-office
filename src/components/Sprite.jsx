import React, { useState, useEffect, useRef } from 'react';
import { renderPixelArt, SPRITE_DATA } from './PixelArtSprites';

export function Sprite({ avenger, name, status, task, position, statusBadge }) {
  const [frame, setFrame] = useState(0);
  const canvasRef = useRef(null);
  const spriteData = SPRITE_DATA[avenger];

  // Animation ticker
  useEffect(() => {
    const t = setInterval(() => setFrame(f => (f + 1) % 4), 500);
    return () => clearInterval(t);
  }, []);

  // Re-render pixel art on canvas each frame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !spriteData) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    renderPixelArt(ctx, spriteData, status);
  }, [frame, status, spriteData]);

  const animStyle = () => {
    if (status === 'working') return { transform: `scale(${1 + frame * 0.015})` };
    if (status === 'gym')     return { transform: `translateY(${-frame * 2}px)` };
    if (status === 'sleep')   return { opacity: 0.65 + frame * 0.1 };
    return {};
  };

  const borderColor = {
    working: '#e74c3c',
    gym:     '#e67e22',
    sleep:   '#2c3e50',
    idle:    '#2ecc71',
  }[status] || '#2ecc71';

  return (
    <div
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: 80,
        transition: 'left 0.6s ease, top 0.6s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 10,
        ...animStyle(),
      }}
    >
      {/* Status badge */}
      <div style={{
        position: 'absolute', top: -10, right: -8,
        background: '#111', border: `2px solid ${borderColor}`,
        borderRadius: '50%', width: 24, height: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, zIndex: 11,
      }}>{statusBadge}</div>

      {/* Sprite canvas */}
      <div style={{
        border: `3px solid ${borderColor}`,
        borderRadius: 6,
        background: '#1c2128',
        padding: 2,
        boxShadow: `0 0 8px ${borderColor}55`,
        transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
      }}>
        <canvas
          ref={canvasRef}
          width={50}
          height={45}
          style={{ display: 'block', imageRendering: 'pixelated' }}
        />
      </div>

      {/* Name */}
      <div style={{
        marginTop: 4, fontSize: 9, fontWeight: 'bold',
        color: borderColor, textAlign: 'center',
        textShadow: '0 1px 2px #000', letterSpacing: 0.5,
        transition: 'color 0.4s ease',
      }}>{name.split(' ')[0].toUpperCase()}</div>

      {/* Task label */}
      {task && (
        <div style={{
          marginTop: 2, fontSize: 8, background: 'rgba(0,0,0,.85)',
          color: '#f39c12', padding: '2px 5px', borderRadius: 4,
          maxWidth: 80, textAlign: 'center', wordBreak: 'break-word',
          border: '1px solid #f39c1244',
        }}>{task.substring(0, 14)}…</div>
      )}
    </div>
  );
}
