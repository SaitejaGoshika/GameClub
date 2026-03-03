import { useEffect, useRef, useState } from 'react';

const W = 480, H = 320;
const GRAVITY = 0.55, JUMP_FORCE = -12, MOVE_SPEED = 4.5;

interface Platform { x: number; y: number; w: number; h: number; }
interface Coin { x: number; y: number; collected: boolean; }

function makeLevel(lvl: number) {
  const platforms: Platform[] = [{ x: -100, y: H - 24, w: W + 1200, h: 24 }]; // ground
  const coins: Coin[] = [];
  let x = 260;
  const count = 10 + lvl * 3;
  for (let i = 0; i < count; i++) {
    const pw = 55 + Math.random() * 70;
    const py = 90 + Math.random() * (H - 160);
    platforms.push({ x, y: py, w: pw, h: 14 });
    const nc = Math.floor(pw / 32);
    for (let c = 0; c < nc; c++) coins.push({ x: x + 16 + c * 32, y: py - 22, collected: false });
    x += pw + 55 + Math.random() * 90;
  }
  const goalX = x + 40;
  return { platforms, coins, goalX, goalY: H - 80 };
}

export default function PlatformRunner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [uiState, setUiState] = useState({ score: 0, lives: 3, level: 1, phase: 'idle' as 'idle' | 'playing' | 'over' | 'win' });

  const stateRef = useRef({
    player: { x: 60, y: H - 80, vx: 0, vy: 0, w: 26, h: 32, onGround: false, facing: 1, frame: 0 },
    camX: 0,
    keys: {} as Record<string, boolean>,
    score: 0, lives: 3, level: 1,
    running: false,
    frame: 0,
    jumpLock: false,
    ...makeLevel(1),
  });

  const initLevel = (lv: number, score = 0, lives = 3) => {
    const s = stateRef.current;
    const ld = makeLevel(lv);
    s.platforms = ld.platforms;
    s.coins = ld.coins;
    s.goalX = ld.goalX;
    s.goalY = ld.goalY;
    s.player = { x: 60, y: H - 80, vx: 0, vy: 0, w: 26, h: 32, onGround: false, facing: 1, frame: 0 };
    s.camX = 0;
    s.score = score; s.lives = lives; s.level = lv;
    s.running = true; s.frame = 0; s.jumpLock = false;
    setUiState({ score, lives, level: lv, phase: 'playing' });
  };

  const startGame = () => initLevel(1, 0, 3);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const s = stateRef.current;

    const onKey = (e: KeyboardEvent) => {
      s.keys[e.key] = e.type === 'keydown';
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);

    let raf: number;
    const loop = () => {
      s.frame++;
      const p = s.player;

      // Draw background always
      ctx.fillStyle = '#1a1a3e';
      ctx.fillRect(0, 0, W, H);
      // Sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#0f0c29'); sky.addColorStop(1, '#302b63');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
      // Background stars
      for (let i = 0; i < 30; i++) {
        const sx = ((i * 137 + 50) % W);
        const sy = ((i * 97 + 30) % (H * 0.6));
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      if (!s.running) {
        raf = requestAnimationFrame(loop);
        return;
      }

      // Input
      const left = s.keys['ArrowLeft'] || s.keys['a'] || s.keys['A'];
      const right = s.keys['ArrowRight'] || s.keys['d'] || s.keys['D'];
      const jump = s.keys['ArrowUp'] || s.keys['w'] || s.keys['W'] || s.keys[' '];

      if (left) { p.vx = -MOVE_SPEED; p.facing = -1; }
      else if (right) { p.vx = MOVE_SPEED; p.facing = 1; }
      else p.vx *= 0.75;

      if (jump && p.onGround && !s.jumpLock) {
        p.vy = JUMP_FORCE;
        p.onGround = false;
        s.jumpLock = true;
      }
      if (!jump) s.jumpLock = false;

      p.vy = Math.min(p.vy + GRAVITY, 14);
      p.x += p.vx;
      p.y += p.vy;

      // Collisions
      p.onGround = false;
      for (const pl of s.platforms) {
        if (p.x + p.w > pl.x && p.x < pl.x + pl.w) {
          // Top collision
          if (p.vy >= 0 && p.y + p.h > pl.y && p.y + p.h < pl.y + pl.h + 12) {
            p.y = pl.y - p.h;
            p.vy = 0;
            p.onGround = true;
          }
        }
      }

      // Fell off
      if (p.y > H + 60) {
        s.lives--;
        if (s.lives <= 0) { s.running = false; setUiState(u => ({ ...u, lives: 0, phase: 'over' })); raf = requestAnimationFrame(loop); return; }
        p.x = 60; p.y = H - 80; p.vx = 0; p.vy = 0; s.camX = 0;
        setUiState(u => ({ ...u, lives: s.lives }));
      }

      // Collect coins
      let coinDirty = false;
      s.coins = s.coins.map(c => {
        if (!c.collected && Math.abs(p.x + p.w / 2 - c.x) < 18 && Math.abs(p.y + p.h / 2 - c.y) < 18) {
          s.score += 10; coinDirty = true;
          return { ...c, collected: true };
        }
        return c;
      });
      if (coinDirty) setUiState(u => ({ ...u, score: s.score }));

      // Goal
      if (p.x + p.w > s.goalX && p.x < s.goalX + 36 && p.y + p.h > s.goalY && p.y < s.goalY + 60) {
        if (s.level >= 4) {
          s.running = false;
          setUiState(u => ({ ...u, phase: 'win', score: s.score }));
        } else {
          initLevel(s.level + 1, s.score, s.lives);
        }
        raf = requestAnimationFrame(loop);
        return;
      }

      // Camera
      const targetCam = p.x - W * 0.3;
      s.camX += (targetCam - s.camX) * 0.12;
      if (s.camX < 0) s.camX = 0;

      // Animate
      if (Math.abs(p.vx) > 0.5 && p.onGround) p.frame = Math.floor(s.frame / 8) % 2;
      else p.frame = 0;

      // Draw world
      ctx.save();
      ctx.translate(-Math.floor(s.camX), 0);

      // Platforms
      for (const pl of s.platforms) {
        if (pl.x + pl.w < s.camX - 20 || pl.x > s.camX + W + 20) continue;
        // Grass top
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(pl.x, pl.y, pl.w, 6);
        // Dirt
        ctx.fillStyle = '#854d0e';
        ctx.fillRect(pl.x, pl.y + 6, pl.w, pl.h - 6);
        // Inner highlight
        ctx.fillStyle = '#a16207';
        ctx.fillRect(pl.x + 2, pl.y + 8, pl.w - 4, 3);
      }

      // Coins
      s.coins.forEach(c => {
        if (c.collected) return;
        const bob = Math.sin(s.frame * 0.12 + c.x * 0.1) * 3;
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.arc(c.x, c.y + bob, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath(); ctx.arc(c.x - 2, c.y + bob - 2, 3, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#d97706'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(c.x, c.y + bob, 8, 0, Math.PI * 2); ctx.stroke();
      });

      // Goal flag
      ctx.fillStyle = '#6b7280';
      ctx.fillRect(s.goalX + 14, s.goalY - 4, 4, 60);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(s.goalX + 18, s.goalY - 4);
      ctx.lineTo(s.goalX + 40, s.goalY + 12);
      ctx.lineTo(s.goalX + 18, s.goalY + 28);
      ctx.fill();
      // Flag pole base
      ctx.fillStyle = '#374151';
      ctx.fillRect(s.goalX + 8, s.goalY + 56, 20, 6);

      // Player
      ctx.save();
      if (p.facing === -1) { ctx.translate(p.x + p.w / 2, 0); ctx.scale(-1, 1); ctx.translate(-(p.x + p.w / 2), 0); }
      // Body (shirt)
      ctx.fillStyle = '#dc2626';
      ctx.beginPath(); ctx.roundRect(p.x + 3, p.y + 12, p.w - 6, p.h - 14, 3); ctx.fill();
      // Head
      ctx.fillStyle = '#fde68a';
      ctx.beginPath(); ctx.roundRect(p.x + 5, p.y, p.w - 10, 14, 4); ctx.fill();
      // Eye
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(p.x + 14, p.y + 4, 4, 4);
      ctx.fillStyle = '#fff';
      ctx.fillRect(p.x + 15, p.y + 5, 2, 2);
      // Legs
      const legAnim = p.frame === 1 ? 4 : 0;
      ctx.fillStyle = '#1e40af';
      ctx.fillRect(p.x + 3, p.y + p.h - 10, 9, 10 + legAnim);
      ctx.fillRect(p.x + p.w - 12, p.y + p.h - 10, 9, 10 - legAnim);
      // Shoes
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(p.x + 2, p.y + p.h + legAnim, 11, 4);
      ctx.fillRect(p.x + p.w - 13, p.y + p.h - legAnim, 11, 4);
      ctx.restore();

      ctx.restore();

      // HUD
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, W, 32);
      ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'left';
      ctx.fillText(`💰 ${s.score}`, 10, 22);
      ctx.textAlign = 'center'; ctx.fillStyle = '#a78bfa';
      ctx.fillText(`Level ${s.level}/4`, W / 2, 22);
      ctx.textAlign = 'right'; ctx.fillStyle = '#f87171';
      for (let i = 0; i < s.lives; i++) ctx.fillText('❤️', W - 8 - i * 24, 24);

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 p-2">
      <h2 className="text-2xl font-black text-green-400">🏃 Platform Runner</h2>
      <div className="flex gap-5 text-sm font-bold">
        <span className="text-yellow-400">💰 {uiState.score}</span>
        <span className="text-red-400">❤️ {uiState.lives}</span>
        <span className="text-purple-400">Lv.{uiState.level}/4</span>
      </div>
      <div className="relative">
        <canvas ref={canvasRef} width={W} height={H}
          className="rounded-xl border-2 border-green-500/40 shadow-2xl"
          style={{ maxWidth: '100%', touchAction: 'none', display: 'block' }} />
        {(uiState.phase === 'idle' || uiState.phase === 'over' || uiState.phase === 'win') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 rounded-xl gap-4">
            {uiState.phase === 'win' && <div className="text-4xl font-black text-yellow-400">🏆 You Win!</div>}
            {uiState.phase === 'over' && <div className="text-4xl font-black text-red-400">💀 Game Over!</div>}
            {uiState.phase === 'idle' && <div className="text-5xl mb-1">🏃</div>}
            {uiState.phase === 'idle' && <div className="text-2xl font-black text-white">Platform Runner</div>}
            {uiState.phase !== 'idle' && <div className="text-xl text-yellow-400 font-bold">Score: {uiState.score}</div>}
            {uiState.phase === 'idle' && <div className="text-sm text-slate-400 text-center px-6">Collect coins & reach the flag!<br />Arrow keys / WASD + Space to jump</div>}
            <button onClick={startGame}
              className="px-10 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-black rounded-2xl hover:from-green-500 hover:to-emerald-500 transition text-lg shadow-lg">
              {uiState.phase === 'idle' ? '▶ Start Game' : '🔄 Play Again'}
            </button>
          </div>
        )}
      </div>
      {/* Mobile D-Pad */}
      <div className="grid grid-cols-3 gap-2 mt-1">
        <div />
        <button
          onTouchStart={e => { e.preventDefault(); stateRef.current.keys['ArrowUp'] = true; }}
          onTouchEnd={e => { e.preventDefault(); stateRef.current.keys['ArrowUp'] = false; }}
          className="h-12 w-12 bg-slate-700/80 rounded-xl text-xl font-black active:bg-slate-600 select-none flex items-center justify-center">↑</button>
        <div />
        <button
          onTouchStart={e => { e.preventDefault(); stateRef.current.keys['ArrowLeft'] = true; }}
          onTouchEnd={e => { e.preventDefault(); stateRef.current.keys['ArrowLeft'] = false; }}
          className="h-12 w-12 bg-slate-700/80 rounded-xl text-xl font-black active:bg-slate-600 select-none flex items-center justify-center">←</button>
        <button
          onTouchStart={e => { e.preventDefault(); stateRef.current.keys['ArrowDown'] = true; }}
          onTouchEnd={e => { e.preventDefault(); stateRef.current.keys['ArrowDown'] = false; }}
          className="h-12 w-12 bg-slate-700/80 rounded-xl text-xl font-black active:bg-slate-600 select-none flex items-center justify-center">↓</button>
        <button
          onTouchStart={e => { e.preventDefault(); stateRef.current.keys['ArrowRight'] = true; }}
          onTouchEnd={e => { e.preventDefault(); stateRef.current.keys['ArrowRight'] = false; }}
          className="h-12 w-12 bg-slate-700/80 rounded-xl text-xl font-black active:bg-slate-600 select-none flex items-center justify-center">→</button>
      </div>
      <p className="text-xs text-slate-500">Arrow keys / WASD to move • Up/W/Space to jump</p>
    </div>
  );
}
