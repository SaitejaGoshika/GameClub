import { useEffect, useRef, useState, useCallback } from 'react';

const W = 340, H = 500;
const PIPE_W = 52, GAP = 140, BIRD_R = 15;
const GRAVITY = 0.45, JUMP = -8.5;

export default function FlappyBird() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<'idle' | 'playing' | 'dead'>('idle');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const bestRef = useRef(0);

  const gRef = useRef({
    bird: { y: H / 2, vy: 0, angle: 0 },
    pipes: [] as { x: number; top: number; scored: boolean }[],
    score: 0,
    frame: 0,
    speed: 2.2,
    state: 'idle' as 'idle' | 'playing' | 'dead',
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number }[],
  });

  const flap = useCallback(() => {
    const g = gRef.current;
    if (g.state === 'dead') return;
    if (g.state === 'idle') {
      g.state = 'playing';
      setPhase('playing');
    }
    g.bird.vy = JUMP;
    // Flap particles
    for (let i = 0; i < 4; i++)
      g.particles.push({ x: 80 - 10, y: g.bird.y + 5, vx: -1 - Math.random() * 2, vy: (Math.random() - 0.5) * 3, life: 1 });
  }, []);

  const restart = useCallback(() => {
    const g = gRef.current;
    g.bird = { y: H / 2, vy: 0, angle: 0 };
    g.pipes = [];
    g.score = 0;
    g.frame = 0;
    g.speed = 2.2;
    g.state = 'idle';
    g.particles = [];
    setScore(0);
    setPhase('idle');
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const g = gRef.current;

    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') { e.preventDefault(); flap(); }
    };
    window.addEventListener('keydown', onKey);

    let raf: number;
    let groundOffset = 0;
    // Cloud positions
    const clouds = [
      { x: 60, y: 70, w: 50 }, { x: 180, y: 45, w: 40 }, { x: 280, y: 90, w: 45 }
    ];

    const loop = () => {
      const { bird } = g;

      // Sky background
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#1e3a5f');
      sky.addColorStop(0.7, '#3b82f6');
      sky.addColorStop(1, '#60a5fa');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      if (g.state === 'playing') {
        g.frame++;
        groundOffset = (groundOffset + g.speed) % 40;

        // Physics
        bird.vy += GRAVITY;
        bird.y += bird.vy;
        bird.angle = Math.min(Math.PI / 3, Math.max(-Math.PI / 4, bird.vy * 0.06));

        // Pipe spawn
        if (g.frame % Math.floor(80 / (g.speed / 2.2)) === 0) {
          const top = 60 + Math.random() * (H - GAP - 120);
          g.pipes.push({ x: W + 10, top, scored: false });
        }

        // Move pipes
        g.pipes.forEach(p => p.x -= g.speed);
        g.pipes = g.pipes.filter(p => p.x > -PIPE_W - 10);

        // Score
        g.pipes.forEach(p => {
          if (!p.scored && p.x + PIPE_W < 80) {
            p.scored = true;
            g.score++;
            g.speed = Math.min(4.5, 2.2 + g.score * 0.08);
            setScore(g.score);
          }
        });

        // Collisions
        const bx = 80, by = bird.y;
        if (by + BIRD_R > H - 50 || by - BIRD_R < 0) {
          g.state = 'dead';
          if (g.score > bestRef.current) { bestRef.current = g.score; setBest(g.score); }
          setPhase('dead');
        }
        for (const p of g.pipes) {
          if (bx + BIRD_R - 5 > p.x && bx - BIRD_R + 5 < p.x + PIPE_W) {
            if (by - BIRD_R < p.top || by + BIRD_R > p.top + GAP) {
              g.state = 'dead';
              if (g.score > bestRef.current) { bestRef.current = g.score; setBest(g.score); }
              setPhase('dead');
            }
          }
        }

        // Update particles
        g.particles = g.particles.filter(p => {
          p.x += p.vx; p.y += p.vy; p.life -= 0.06;
          return p.life > 0;
        });
      }

      // Clouds
      if (g.state === 'playing') clouds.forEach(c => c.x -= g.speed * 0.2);
      clouds.forEach(c => {
        if (c.x < -c.w - 30) c.x = W + 30;
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.beginPath(); ctx.arc(c.x, c.y, c.w * 0.45, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(c.x + c.w * 0.35, c.y + 5, c.w * 0.35, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(c.x - c.w * 0.32, c.y + 7, c.w * 0.32, 0, Math.PI * 2); ctx.fill();
      });

      // Pipes
      g.pipes.forEach(p => {
        // Top pipe
        ctx.fillStyle = '#15803d';
        ctx.fillRect(p.x, 0, PIPE_W, p.top);
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(p.x - 4, p.top - 22, PIPE_W + 8, 22);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(p.x, 0, 8, p.top - 22);
        // Bottom pipe
        const bot = p.top + GAP;
        ctx.fillStyle = '#15803d';
        ctx.fillRect(p.x, bot, PIPE_W, H - bot);
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(p.x - 4, bot, PIPE_W + 8, 22);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(p.x, bot + 22, 8, H - bot - 22);
      });

      // Ground
      ctx.fillStyle = '#78350f';
      ctx.fillRect(0, H - 50, W, 50);
      ctx.fillStyle = '#84cc16';
      ctx.fillRect(0, H - 50, W, 12);
      // Ground texture
      ctx.fillStyle = '#65a30d';
      for (let gx = -groundOffset; gx < W; gx += 40)
        ctx.fillRect(gx, H - 50, 20, 4);

      // Particles
      g.particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = '#fef9c3';
        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Bird
      ctx.save();
      ctx.translate(80, bird.y);
      ctx.rotate(bird.angle);
      // Body
      ctx.fillStyle = '#facc15';
      ctx.beginPath(); ctx.ellipse(0, 0, BIRD_R, BIRD_R - 2, 0, 0, Math.PI * 2); ctx.fill();
      // Wing
      ctx.fillStyle = '#eab308';
      const wingBob = g.state === 'playing' ? Math.sin(g.frame * 0.3) * 4 : 0;
      ctx.beginPath(); ctx.ellipse(-4, 3 + wingBob, 9, 5, -0.3, 0, Math.PI * 2); ctx.fill();
      // Breast
      ctx.fillStyle = '#fb923c';
      ctx.beginPath(); ctx.ellipse(4, 3, 7, 6, 0.2, 0, Math.PI * 2); ctx.fill();
      // Eye
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(7, -4, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1e293b';
      ctx.beginPath(); ctx.arc(8, -4, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(8.5, -5, 1, 0, Math.PI * 2); ctx.fill();
      // Beak
      ctx.fillStyle = '#f97316';
      ctx.beginPath(); ctx.moveTo(13, -2); ctx.lineTo(20, 1); ctx.lineTo(13, 4); ctx.closePath(); ctx.fill();
      ctx.restore();

      // Score display
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000'; ctx.shadowBlur = 6;
      ctx.fillText(String(g.score), W / 2, 55);
      ctx.shadowBlur = 0;

      // Overlays
      if (g.state === 'idle') {
        ctx.fillStyle = 'rgba(0,0,10,0.45)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🐦 Flappy Bird', W / 2, H / 2 - 30);
        ctx.font = '16px Arial';
        ctx.fillStyle = '#bfdbfe';
        ctx.fillText('Tap • Click • Space', W / 2, H / 2 + 10);
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`Best: ${bestRef.current}`, W / 2, H / 2 + 40);
      }

      if (g.state === 'dead') {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, W, H);
        // Score panel
        ctx.fillStyle = '#1e3a5f';
        ctx.beginPath(); ctx.roundRect(W / 2 - 90, H / 2 - 60, 180, 130, 16); ctx.fill();
        ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(W / 2 - 90, H / 2 - 60, 180, 130, 16); ctx.stroke();
        ctx.fillStyle = '#f87171';
        ctx.font = 'bold 26px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('💀 Game Over', W / 2, H / 2 - 24);
        ctx.fillStyle = '#fff';
        ctx.font = '18px Arial';
        ctx.fillText(`Score: ${g.score}`, W / 2, H / 2 + 10);
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`Best: ${bestRef.current}`, W / 2, H / 2 + 38);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px Arial';
        ctx.fillText('Tap to restart', W / 2, H / 2 + 68);
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
    };
  }, [flap]);

  const handleTap = () => {
    if (phase === 'dead') { restart(); return; }
    flap();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <h2 className="text-2xl font-black text-yellow-400">🐦 Flappy Bird</h2>
      <div className="flex gap-5 text-sm font-bold">
        <span className="text-white">Score: {score}</span>
        <span className="text-yellow-400">Best: {best}</span>
      </div>
      <canvas
        ref={canvasRef} width={W} height={H}
        className="rounded-xl border-2 border-sky-500/40 shadow-2xl cursor-pointer"
        style={{ maxWidth: '100%', maxHeight: '65vh', touchAction: 'none', display: 'block' }}
        onClick={handleTap}
        onTouchStart={e => { e.preventDefault(); handleTap(); }}
      />
      {phase === 'dead' && (
        <button onClick={restart}
          className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black rounded-2xl hover:from-yellow-400 hover:to-orange-400 transition text-lg shadow-lg">
          🔄 Try Again
        </button>
      )}
      {phase === 'idle' && (
        <button onClick={flap}
          className="px-8 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black rounded-2xl hover:from-sky-400 hover:to-blue-500 transition text-lg shadow-lg">
          ▶ Start
        </button>
      )}
      <p className="text-xs text-slate-500">Click • Tap • Spacebar to flap</p>
    </div>
  );
}
