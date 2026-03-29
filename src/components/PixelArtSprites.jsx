import React from 'react';

export const SPRITE_DATA = {
  captain_america: {
    name: 'Captain America',
    color: '#0066FF',
    shield: '#FF0000',
    idle: [
      '.....##...',
      '...####...',
      '..######..',
      '..######..',
      '...####...',
      '...####...',
      '....##....',
      '...####...',
      '....##....',
    ],
    working: [
      '.....##...',
      '...####...',
      '..######..',
      '..#####...',
      '...###....',
      '...####...',
      '....##....',
      '...####...',
      '...#.#....',
    ],
    sleeping: [
      '...........',
      '...........',
      '...........',
      '...........',
      '.....###...',
      '...########',
      '...........',
      'zzz.zzz.zzz',
      '...........',
    ],
  },
  iron_man: {
    name: 'Iron Man',
    color: '#FF3300',
    accent: '#FFD700',
    idle: [
      '...##.##..',
      '..######..',
      '.########.',
      '.########.',
      '..######..',
      '...####...',
      '...####...',
      '..######..',
      '....##....',
    ],
    working: [
      '...##.##..',
      '..######..',
      '.########.',
      '.#####.#..',
      '..####.#..',
      '...####...',
      '...####...',
      '..######..',
      '...#.#....',
    ],
    sleeping: [
      '...........',
      '...........',
      '...........',
      '...........',
      '.....###...',
      '...########',
      '...........',
      'zzz.zzz.zzz',
      '...........',
    ],
  },
  black_widow: {
    name: 'Black Widow',
    color: '#222222',
    accent: '#FF0000',
    idle: [
      '...###....',
      '..#####...',
      '.#######..',
      '..#####...',
      '....#.....',
      '...###....',
      '..#####...',
      '.#######..',
      '....#.....',
    ],
    working: [
      '...###....',
      '..#####...',
      '.#######..',
      '..#####...',
      '....#.....',
      '...###....',
      '..#.##....',
      '.#######..',
      '...#.#....',
    ],
    sleeping: [
      '...........',
      '...........',
      '...........',
      '...........',
      '.....###...',
      '...########',
      '...........',
      'zzz.zzz.zzz',
      '...........',
    ],
  },
  thor: {
    name: 'Thor',
    color: '#FFAA00',
    accent: '#888888',
    idle: [
      '...####...',
      '..######..',
      '..######..',
      '...####...',
      '..######..',
      '...####...',
      '....##....',
      '...####...',
      '....##....',
    ],
    working: [
      '...####...',
      '..######..',
      '..####....',
      '...####...',
      '..#####...',
      '...###....',
      '....##....',
      '...####...',
      '...#.#....',
    ],
    sleeping: [
      '...........',
      '...........',
      '...........',
      '...........',
      '.....###...',
      '...########',
      '...........',
      'zzz.zzz.zzz',
      '...........',
    ],
  },
  hawkeye: {
    name: 'Hawkeye',
    color: '#8B4513',
    accent: '#9B59B6',
    idle: [
      '..#######.',
      '.#########',
      '.#########',
      '.#.#.#.#..',
      '.#.#.#.#..',
      '.....#....',
      '...###....',
      '..#####...',
      '....#.....',
    ],
    working: [
      '..#######.',
      '.#########',
      '.#########',
      '.#.#.#.#..',
      '.#.#.#.#..',
      '.....#....',
      '...###....',
      '..#.##....',
      '...#.#....',
    ],
    sleeping: [
      '...........',
      '...........',
      '...........',
      '...........',
      '.....###...',
      '...########',
      '...........',
      'zzz.zzz.zzz',
      '...........',
    ],
  },
};

export function renderPixelArt(ctx, spriteData, status = 'idle') {
  const pixelSize = 5;
  const cols = 10;
  const rows = 9;
  ctx.clearRect(0, 0, cols * pixelSize, rows * pixelSize);

  let pattern = spriteData.idle;
  if (status === 'working') pattern = spriteData.working;
  if (status === 'sleeping' || status === 'sleep') pattern = spriteData.sleeping;

  pattern.forEach((line, y) => {
    line.split('').forEach((char, x) => {
      if (char === '#') {
        ctx.fillStyle = spriteData.color;
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      } else if (char === 'z') {
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    });
  });
}

export function AvengerSprite({ avengerId, status }) {
  const spriteData = SPRITE_DATA[avengerId];
  if (!spriteData) return null;
  const W = 50, H = 45;

  return (
    <canvas
      width={W}
      height={H}
      style={{ imageRendering: 'pixelated', display: 'block' }}
      ref={canvas => {
        if (canvas && spriteData) {
          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = false;
          renderPixelArt(ctx, spriteData, status);
        }
      }}
    />
  );
}
