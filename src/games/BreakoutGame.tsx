import { useEffect, useRef, useState, useCallback } from 'react';

const W = 420, H = 520;
const PADDLE_W = 80, PADDLE_H = 12, BALL_R = 9;
const BRICK_ROWS = 6, BRICK_COLS = 8;
const BRICK_W = 46, BRICK_H = 20, BRICK_PAD = 4;

const ROW_COLORS = ['#f43f5e', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'];

interface Brick { x: number; y: number; alive: boolean; color: string; hp: number; }

function makeBricks(): Brick[] {
  const bricks: Brick[] = [];
  const offX = (W - (BRICK_COLS * (BRICK_W + BRICK_PAD) - BRICK_PAD)) / 2;
  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      bricks.push({
        x: offX + c * (BRICK_W + BRICK_PAD),
        y: 55 + r * (BRICK_H + BRICK_PAD),
        alive: true,
        color: ROW_COLORS[r % ROW_COLORS.length],
        hp: r < 2 ? 2 : 1,
      });
    }
  }
  return bricks;
}

export default function BreakoutGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<'idle' | 'playing' | 'paused' | 'over' | 'win'>('idle');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);

  const gRef = useRef({
    px: W / 2 - PADDLE_W / 2,
    bx: W / 2, by: H - 100,
    vx: 3.5, vy: -4.5,
    bricks: makeBricks(),
    score: 0, lives: 3,
    running: false,
    keys: { left: false, right: false },
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string }[],
  });

  const startGame = useCallback(() => {
    const g = gRef.current;
    g.px = W / 2 - PADDLE_W / 2;
    g.bx = W / 2; g.by = H - 100;
    g.vx = 3.5; g.vy = -4.5;
    g.bricks = makeBricks();
    g.score = 0; g.lives = 3;
    g.running = true; g.particles = [];
    setScore(0); setLives(3); setPhase('playing');
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const g = gRef.current;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') { g.keys.left = e.type === 'keydown'; e.preventDefault(); }
      if (e.key === 'ArrowRight' || e.key === 'd') { g.keys.right = e.type === 'keydown'; e.preventDefault(); }
    };
    const onMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      g.px = (e.clientX - rect.left) * (W / rect.width) - PADDLE_W / 2;
      g.px = Math.max(0, Math.min(W - PADDLE_W, g.px));
    };
    const onTouch = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      g.px = (e.touches[0].clientX - rect.left) * (W / rect.width) - PADDLE_W / 2;
      g.px = Math.max(0, Math.min(W - PADDLE_W, g.px));
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    canvas.addEventListener('mousemove', onMouse);
    canvas.addEventListener('touchmove', onTouch, { passive: false });

    const burst = (x: number, y: number, color: string) => {
      for (let i = 0; i < 8; i++)
        g.particles.push({ x, y, vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5, life: 1, color });
    };

    let raf: number;
    const loop = () => {
      // Background
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, W, H);
      // Grid pattern
      ctx.strokeStyle = 'rgba(99,102,241,0.07)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      if (g.running) {
        // Paddle input
        if (g.keys.left) g.px = Math.max(0, g.px - 6);
        if (g.keys.right) g.px = Math.min(W - PADDLE_W, g.px + 6);

        // Move ball
        g.bx += g.vx; g.by += g.vy;

        // Wall bounces
        if (g.bx - BALL_R < 0) { g.bx = BALL_R; g.vx = Math.abs(g.vx); }
        if (g.bx + BALL_R > W) { g.bx = W - BALL_R; g.vx = -Math.abs(g.vx); }
        if (g.by - BALL_R < 0) { g.by = BALL_R; g.vy = Math.abs(g.vy); }

        // Paddle collision
        if (g.vy > 0 && g.by + BALL_R >= H - 40 && g.by + BALL_R <= H - 30 &&
          g.bx >= g.px - 4 && g.bx <= g.px + PADDLE_W + 4) {
          g.by = H - 40 - BALL_R;
          const hit = (g.bx - g.px) / PADDLE_W; // 0 to 1
          g.vx = (hit - 0.5) * 9;
          g.vy = -Math.abs(g.vy);
          // Speed up slightly
          const spd = Math.sqrt(g.vx * g.vx + g.vy * g.vy);
          if (spd < 8) { g.vx *= 1.04; g.vy *= 1.04; }
        }

        // Ball lost
        if (g.by > H + 20) {
          g.lives--;
          setLives(g.lives);
          if (g.lives <= 0) { g.running = false; setPhase('over'); }
          else {
            g.bx = W / 2; g.by = H - 100;
            g.vx = (Math.random() > 0.5 ? 1 : -1) * 3.5;
            g.vy = -4.5;
            g.running = false; setPhase('paused');
          }
        }

        // Brick collisions
        for (const b of g.bricks) {
          if (!b.alive) continue;
          if (g.bx + BALL_R > b.x && g.bx - BALL_R < b.x + BRICK_W &&
            g.by + BALL_R > b.y && g.by - BALL_R < b.y + BRICK_H) {
            b.hp--;
            if (b.hp <= 0) {
              b.alive = false;
              g.score += 10;
              setScore(g.score);
              burst(b.x + BRICK_W / 2, b.y + BRICK_H / 2, b.color);
            }
            // Determine bounce direction
            const overlapLeft = g.bx - (b.x - BALL_R);
            const overlapRight = (b.x + BRICK_W + BALL_R) - g.bx;
            const overlapTop = g.by - (b.y - BALL_R);
            const overlapBot = (b.y + BRICK_H + BALL_R) - g.by;
            const minX = Math.min(overlapLeft, overlapRight);
            const minY = Math.min(overlapTop, overlapBot);
            if (minX < minY) g.vx *= -1;
            else g.vy *= -1;
            break;
          }
        }

        // Win check
        if (g.bricks.every(b => !b.alive)) { g.running = false; setPhase('win'); }
      }

      // Draw bricks
      g.bricks.forEach(b => {
        if (!b.alive) return;
        const alpha = b.hp > 1 ? 1 : 0.85;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = b.color;
        ctx.beginPath(); ctx.roundRect(b.x, b.y, BRICK_W, BRICK_H, 4); ctx.fill();
        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.beginPath(); ctx.roundRect(b.x + 2, b.y + 2, BRICK_W - 4, 5, 2); ctx.fill();
        if (b.hp > 1) {
          ctx.strokeStyle = 'rgba(255,255,255,0.4)';
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.roundRect(b.x, b.y, BRICK_W, BRICK_H, 4); ctx.stroke();
        }
        ctx.globalAlpha = 1;
      });

      // Particles
      g.particles = g.particles.filter(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life -= 0.055;
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2); ctx.fill();
        return p.life > 0;
      });
      ctx.globalAlpha = 1;

      // Paddle
      const padGrad = ctx.createLinearGradient(g.px, H - 40, g.px + PADDLE_W, H - 28);
      padGrad.addColorStop(0, '#818cf8');
      padGrad.addColorStop(0.5, '#a78bfa');
      padGrad.addColorStop(1, '#818cf8');
      ctx.fillStyle = padGrad;
      ctx.beginPath(); ctx.roundRect(g.px, H - 40, PADDLE_W, PADDLE_H, 6); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath(); ctx.roundRect(g.px + 4, H - 40 + 2, PADDLE_W - 8, 4, 2); ctx.fill();

      // Ball
      const ballGrad = ctx.createRadialGradient(g.bx - 3, g.by - 3, 1, g.bx, g.by, BALL_R);
      ballGrad.addColorStop(0, '#fef9c3');
      ballGrad.addColorStop(0.5, '#fbbf24');
      ballGrad.addColorStop(1, '#d97706');
      ctx.fillStyle = ballGrad;
      ctx.beginPath(); ctx.arc(g.bx, g.by, BALL_R, 0, Math.PI * 2); ctx.fill();
      // Ball glow
      ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(g.bx, g.by, BALL_R, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;

      // HUD
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(0, 0, W, 42);
      ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 15px Arial'; ctx.textAlign = 'left';
      ctx.fillText(`⭐ ${g.score}`, 12, 27);
      ctx.textAlign = 'center'; ctx.fillStyle = '#a78bfa';
      ctx.fillText(`Breakout`, W / 2, 27);
      ctx.textAlign = 'right'; ctx.fillStyle = '#f87171';
      for (let i = 0; i < g.lives; i++) ctx.fillText('❤️', W - 8 - i * 26, 29);

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
      canvas.removeEventListener('mousemove', onMouse);
      canvas.removeEventListener('touchmove', onTouch);
    };
  }, []);

  const resumeGame = () => {
    gRef.current.running = true;
    setPhase('playing');
  };

  return (
    <div className="flex flex-col items-center gap-3 p-2">
      <h2 className="text-2xl font-black text-orange-400">🧱 Breakout</h2>
      <div className="flex gap-5 text-sm font-bold">
        <span className="text-yellow-400">⭐ {score}</span>
        <span className="text-red-400">{'❤️'.repeat(lives)}</span>
      </div>
      <div className="relative">
        <canvas ref={canvasRef} width={W} height={H}
          className="rounded-xl border-2 border-orange-500/30 shadow-2xl cursor-none"
          style={{ maxWidth: '100%', maxHeight: '65vh', touchAction: 'none', display: 'block' }} />
        {(phase !== 'playing') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 rounded-xl gap-4">
            {phase === 'win' && <div className="text-4xl font-black text-yellow-400">🏆 You Win!</div>}
            {phase === 'over' && <div className="text-4xl font-black text-red-400">💀 Game Over!</div>}
            {phase === 'idle' && <div className="text-5xl mb-1">🧱</div>}
            {phase === 'idle' && <div className="text-2xl font-black text-white">Breakout</div>}
            {phase !== 'idle' && phase !== 'paused' && <div className="text-xl text-yellow-400 font-bold">Score: {score}</div>}
            {phase === 'paused' && <div className="text-xl font-black text-white">Ball Lost! {lives} lives left</div>}
            {phase === 'idle' && <div className="text-sm text-slate-400 text-center px-4">Move paddle with mouse or arrow keys<br />Break all the bricks!</div>}
            <button
              onClick={phase === 'paused' ? resumeGame : startGame}
              className="px-10 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-black font-black rounded-2xl hover:from-orange-400 hover:to-amber-400 transition text-lg shadow-lg">
              {phase === 'paused' ? '▶ Continue' : phase === 'idle' ? '▶ Start Game' : '🔄 Play Again'}
            </button>
          </div>
        )}
      </div>
      {/* Mobile paddle buttons */}
      <div className="flex gap-4 md:hidden">
        <button
          onTouchStart={e => { e.preventDefault(); gRef.current.keys.left = true; }}
          onTouchEnd={e => { e.preventDefault(); gRef.current.keys.left = false; }}
          className="w-16 h-14 bg-slate-700/80 rounded-xl text-2xl font-black active:bg-slate-600 select-none flex items-center justify-center">◀</button>
        <button
          onTouchStart={e => { e.preventDefault(); gRef.current.keys.right = true; }}
          onTouchEnd={e => { e.preventDefault(); gRef.current.keys.right = false; }}
          className="w-16 h-14 bg-slate-700/80 rounded-xl text-2xl font-black active:bg-slate-600 select-none flex items-center justify-center">▶</button>
      </div>
      <p className="text-xs text-slate-500">Mouse / touch to move paddle • Arrow keys also work</p>
    </div>
  );
}
