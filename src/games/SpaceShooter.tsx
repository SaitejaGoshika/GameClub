import { useEffect, useRef, useState } from 'react';

export default function SpaceShooter() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'over'>('idle');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);

  const W = 400, H = 600;

  const gameRef = useRef({
    running: false,
    player: { x: 200, y: 530, w: 36, h: 36 },
    bullets: [] as { x: number; y: number }[],
    enemies: [] as { x: number; y: number; w: number; h: number; hp: number; type: number; vy: number }[],
    eBullets: [] as { x: number; y: number }[],
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string }[],
    stars: [] as { x: number; y: number; s: number; sp: number }[],
    score: 0, lives: 3, level: 1,
    shootTimer: 0, spawnTimer: 0,
    keys: {} as Record<string, boolean>,
    touchX: -1,
  });

  const startGame = () => {
    const g = gameRef.current;
    g.player = { x: 200, y: 530, w: 36, h: 36 };
    g.bullets = []; g.enemies = []; g.eBullets = []; g.particles = [];
    g.stars = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      s: Math.random() * 1.5 + 0.5, sp: Math.random() * 1.5 + 0.5
    }));
    g.score = 0; g.lives = 3; g.level = 1;
    g.shootTimer = 0; g.spawnTimer = 0;
    g.running = true;
    setScore(0); setLives(3); setLevel(1); setGameState('playing');
  };

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const g = gameRef.current;

    // Init stars
    g.stars = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      s: Math.random() * 1.5 + 0.5, sp: Math.random() * 1.5 + 0.5
    }));

    const onKey = (e: KeyboardEvent) => {
      g.keys[e.key] = e.type === 'keydown';
      if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
    };
    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      g.touchX = (e.touches[0].clientX - rect.left) * (W / rect.width);
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      g.touchX = (e.touches[0].clientX - rect.left) * (W / rect.width);
    };
    const onTouchEnd = () => { g.touchX = -1; };

    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);

    const hit = (ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number) =>
      ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;

    const burst = (x: number, y: number, color: string, n = 8) => {
      for (let i = 0; i < n; i++)
        g.particles.push({ x, y, vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5, life: 1, color });
    };

    let raf: number;
    const loop = () => {
      // Background
      ctx.fillStyle = '#050a1f';
      ctx.fillRect(0, 0, W, H);

      // Stars
      g.stars.forEach(st => {
        st.y += st.sp;
        if (st.y > H) { st.y = 0; st.x = Math.random() * W; }
        ctx.fillStyle = `rgba(255,255,255,${st.s / 2})`;
        ctx.beginPath(); ctx.arc(st.x, st.y, st.s * 0.6, 0, Math.PI * 2); ctx.fill();
      });

      if (!g.running) {
        raf = requestAnimationFrame(loop);
        return;
      }

      const { player } = g;

      // Move player
      if (g.touchX >= 0) {
        player.x += (g.touchX - player.w / 2 - player.x) * 0.18;
      } else {
        if (g.keys['ArrowLeft'] || g.keys['a']) player.x -= 5;
        if (g.keys['ArrowRight'] || g.keys['d']) player.x += 5;
      }
      player.x = Math.max(0, Math.min(W - player.w, player.x));

      // Auto shoot
      g.shootTimer--;
      if (g.shootTimer <= 0) {
        g.bullets.push({ x: player.x + player.w / 2 - 3, y: player.y });
        g.shootTimer = Math.max(6, 16 - g.level * 1.5);
      }

      // Spawn enemies
      g.spawnTimer--;
      if (g.spawnTimer <= 0) {
        const type = Math.floor(Math.random() * 3);
        const w = [28, 38, 46][type];
        g.enemies.push({
          x: Math.random() * (W - w), y: -50, w, h: w,
          hp: type + 1, type, vy: 1 + g.level * 0.35 + Math.random() * 0.5
        });
        g.spawnTimer = Math.max(28, 75 - g.level * 5);
      }

      // Move bullets
      g.bullets = g.bullets.filter(b => { b.y -= 11; return b.y > -20; });
      g.eBullets = g.eBullets.filter(b => { b.y += 3.5 + g.level * 0.2; return b.y < H + 20; });

      // Move enemies
      g.enemies = g.enemies.filter(e => {
        e.y += e.vy;
        if (Math.random() < 0.004 * g.level)
          g.eBullets.push({ x: e.x + e.w / 2 - 3, y: e.y + e.h });
        if (e.y > H + 60) {
          g.lives--;
          setLives(g.lives);
          if (g.lives <= 0) { g.running = false; setGameState('over'); }
          return false;
        }
        return true;
      });

      // Bullet-enemy collision
      g.bullets = g.bullets.filter(b => {
        let hit2 = false;
        g.enemies = g.enemies.map(e => {
          if (!hit2 && hit(b.x, b.y, 6, 14, e.x, e.y, e.w, e.h)) {
            hit2 = true; e.hp--;
            burst(b.x, b.y, '#fbbf24', 5);
          }
          return e;
        }).filter(e => {
          if (e.hp <= 0) {
            burst(e.x + e.w / 2, e.y + e.h / 2, ['#ef4444', '#a855f7', '#f97316'][e.type], 14);
            g.score += 10 * (e.type + 1);
            g.level = Math.floor(g.score / 150) + 1;
            setScore(g.score); setLevel(g.level);
            return false;
          }
          return true;
        });
        return !hit2;
      });

      // Enemy bullets hit player
      g.eBullets = g.eBullets.filter(b => {
        if (hit(b.x, b.y, 6, 12, player.x + 4, player.y + 4, player.w - 8, player.h - 8)) {
          g.lives--;
          setLives(g.lives);
          burst(player.x + player.w / 2, player.y + player.h / 2, '#60a5fa', 18);
          if (g.lives <= 0) { g.running = false; setGameState('over'); }
          return false;
        }
        return true;
      });

      // Particles
      g.particles = g.particles.filter(p => {
        p.x += p.vx; p.y += p.vy; p.life -= 0.05;
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
        return p.life > 0;
      });

      // Draw enemies
      g.enemies.forEach(e => {
        if (e.type === 0) {
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.moveTo(e.x + e.w / 2, e.y + e.h);
          ctx.lineTo(e.x, e.y + 4);
          ctx.lineTo(e.x + e.w, e.y + 4);
          ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#fca5a5';
          ctx.beginPath();
          ctx.moveTo(e.x + e.w / 2, e.y + e.h - 6);
          ctx.lineTo(e.x + 6, e.y + 8);
          ctx.lineTo(e.x + e.w - 6, e.y + 8);
          ctx.closePath(); ctx.fill();
        } else if (e.type === 1) {
          ctx.fillStyle = '#a855f7';
          ctx.beginPath(); ctx.ellipse(e.x + e.w / 2, e.y + e.h / 2, e.w / 2, e.h / 3, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#d8b4fe';
          ctx.beginPath(); ctx.ellipse(e.x + e.w / 2, e.y + e.h / 2, e.w / 4, e.h / 5, 0, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.fillStyle = '#f97316';
          ctx.fillRect(e.x + e.w * 0.35, e.y, e.w * 0.3, e.h);
          ctx.fillRect(e.x, e.y + e.h * 0.35, e.w, e.h * 0.3);
          ctx.fillStyle = '#fed7aa';
          ctx.beginPath(); ctx.arc(e.x + e.w / 2, e.y + e.h / 2, e.w * 0.18, 0, Math.PI * 2); ctx.fill();
        }
        // HP bar
        ctx.fillStyle = '#1f2937'; ctx.fillRect(e.x, e.y - 7, e.w, 4);
        ctx.fillStyle = '#22c55e'; ctx.fillRect(e.x, e.y - 7, e.w * (e.hp / (e.type + 1)), 4);
      });

      // Draw enemy bullets
      g.eBullets.forEach(b => {
        ctx.fillStyle = '#fb923c';
        ctx.beginPath(); ctx.arc(b.x + 3, b.y + 6, 4, 0, Math.PI * 2); ctx.fill();
      });

      // Draw player bullets
      g.bullets.forEach(b => {
        const grad = ctx.createLinearGradient(b.x, b.y + 14, b.x, b.y);
        grad.addColorStop(0, '#22d3ee'); grad.addColorStop(1, '#ffffff');
        ctx.fillStyle = grad;
        ctx.fillRect(b.x, b.y, 6, 14);
      });

      // Draw player ship
      const px = player.x, py = player.y;
      // Main body
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.moveTo(px + 18, py); ctx.lineTo(px + 36, py + 36); ctx.lineTo(px, py + 36);
      ctx.closePath(); ctx.fill();
      // Inner highlight
      ctx.fillStyle = '#93c5fd';
      ctx.beginPath();
      ctx.moveTo(px + 18, py + 5); ctx.lineTo(px + 30, py + 34); ctx.lineTo(px + 6, py + 34);
      ctx.closePath(); ctx.fill();
      // Cockpit
      ctx.fillStyle = '#1d4ed8';
      ctx.beginPath(); ctx.ellipse(px + 18, py + 20, 5, 7, 0, 0, Math.PI * 2); ctx.fill();
      // Engine glow
      ctx.fillStyle = 'rgba(251,191,36,0.9)';
      ctx.beginPath(); ctx.ellipse(px + 18, py + 38, 7, 5, 0, 0, Math.PI * 2); ctx.fill();

      // HUD
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(0, 0, W, 34);
      ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'left';
      ctx.fillText(`⭐ ${g.score}`, 8, 22);
      ctx.fillStyle = '#a78bfa'; ctx.textAlign = 'center';
      ctx.fillText(`Lv.${g.level}`, W / 2, 22);
      ctx.textAlign = 'right';
      for (let i = 0; i < g.lives; i++) {
        ctx.fillStyle = '#60a5fa';
        ctx.fillText('💙', W - 8 - i * 24, 24);
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 p-2">
      <h2 className="text-2xl font-black text-blue-400">🚀 Space Shooter</h2>
      <div className="flex gap-5 text-sm font-bold">
        <span className="text-yellow-400">⭐ {score}</span>
        <span className="text-blue-400">💙 {lives}</span>
        <span className="text-purple-400">Lv.{level}</span>
      </div>
      <div className="relative">
        <canvas ref={canvasRef} width={W} height={H}
          className="rounded-xl border-2 border-blue-500/40 shadow-2xl shadow-blue-900/50"
          style={{ maxWidth: '100%', maxHeight: '65vh', touchAction: 'none', display: 'block' }} />
        {(gameState === 'idle' || gameState === 'over') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 rounded-xl gap-4">
            {gameState === 'over' && <div className="text-4xl font-black text-red-400">💥 Game Over!</div>}
            {gameState === 'over' && <div className="text-xl text-yellow-400 font-bold">Score: {score}</div>}
            {gameState === 'idle' && <div className="text-5xl mb-1">🚀</div>}
            {gameState === 'idle' && <div className="text-2xl font-black text-white">Space Shooter</div>}
            {gameState === 'idle' && <div className="text-sm text-slate-400 text-center px-6">Destroy enemy ships!<br />Auto-fires • Arrow keys / touch to move</div>}
            <button onClick={startGame}
              className="mt-2 px-10 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-black rounded-2xl hover:from-blue-500 hover:to-cyan-500 transition text-lg shadow-lg">
              {gameState === 'over' ? '🔄 Play Again' : '▶ Start Game'}
            </button>
          </div>
        )}
      </div>
      {/* Mobile controls */}
      <div className="flex gap-4 md:hidden mt-1">
        <button
          onTouchStart={e => { e.preventDefault(); gameRef.current.keys['ArrowLeft'] = true; }}
          onTouchEnd={e => { e.preventDefault(); gameRef.current.keys['ArrowLeft'] = false; }}
          className="w-14 h-14 bg-slate-700/80 rounded-xl text-2xl font-black active:bg-slate-600 select-none">◀</button>
        <button
          onTouchStart={e => { e.preventDefault(); gameRef.current.keys['ArrowRight'] = true; }}
          onTouchEnd={e => { e.preventDefault(); gameRef.current.keys['ArrowRight'] = false; }}
          className="w-14 h-14 bg-slate-700/80 rounded-xl text-2xl font-black active:bg-slate-600 select-none">▶</button>
      </div>
      <p className="text-xs text-slate-500">← → Arrow keys or drag on canvas • Auto-fires!</p>
    </div>
  );
}
