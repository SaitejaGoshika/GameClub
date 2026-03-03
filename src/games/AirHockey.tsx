import { useEffect, useRef, useState } from 'react';

const W = 420, H = 620;
const PADDLE_R = 32, PUCK_R = 16, GOAL_W = 140;

export default function AirHockey() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [mode, setMode] = useState<'ai' | '2p'>('ai');
  const [winner, setWinner] = useState('');
  const [phase, setPhase] = useState<'idle' | 'playing'>('idle');

  const gRef = useRef({
    puck: { x: W / 2, y: H / 2, vx: 3, vy: 4 },
    p1: { x: W / 2, y: H - 90 },
    p2: { x: W / 2, y: 90 },
    score: { p1: 0, p2: 0 },
    mouse: { x: W / 2, y: H - 90 },
    keys: {} as Record<string, boolean>,
    running: false,
    mode: 'ai' as 'ai' | '2p',
  });

  const resetPuck = (scorer?: 'p1' | 'p2') => {
    const g = gRef.current;
    const angle = scorer === 'p1' ? -Math.PI / 2 + (Math.random() - 0.5) : Math.PI / 2 + (Math.random() - 0.5);
    const spd = 5;
    g.puck = { x: W / 2, y: H / 2, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd };
    g.p1 = { x: W / 2, y: H - 90 };
    g.p2 = { x: W / 2, y: 90 };
  };

  const startGame = (m: 'ai' | '2p') => {
    const g = gRef.current;
    g.mode = m;
    g.score = { p1: 0, p2: 0 };
    g.running = true;
    setScores({ p1: 0, p2: 0 });
    setWinner('');
    setMode(m);
    setPhase('playing');
    resetPuck();
  };

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const g = gRef.current;

    const onMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      g.mouse.x = (e.clientX - rect.left) * (W / rect.width);
      g.mouse.y = (e.clientY - rect.top) * (H / rect.height);
    };
    const onTouch = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      g.mouse.x = (e.touches[0].clientX - rect.left) * (W / rect.width);
      g.mouse.y = (e.touches[0].clientY - rect.top) * (H / rect.height);
    };
    const onKey = (e: KeyboardEvent) => { g.keys[e.key] = e.type === 'keydown'; };

    canvas.addEventListener('mousemove', onMouse);
    canvas.addEventListener('touchmove', onTouch, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);

    const MAX_SPEED = 15;
    const goalL = (W - GOAL_W) / 2;
    const goalR = goalL + GOAL_W;

    let raf: number;
    const loop = () => {
      // Background
      ctx.fillStyle = '#0a1628';
      ctx.fillRect(0, 0, W, H);

      // Rink
      ctx.strokeStyle = 'rgba(59,130,246,0.4)';
      ctx.lineWidth = 3;
      ctx.strokeRect(3, 3, W - 6, H - 6);

      // Center line
      ctx.strokeStyle = 'rgba(99,102,241,0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 8]);
      ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();
      ctx.setLineDash([]);

      // Center circle
      ctx.strokeStyle = 'rgba(99,102,241,0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(W / 2, H / 2, 70, 0, Math.PI * 2); ctx.stroke();

      // Goals
      // Top goal (p2)
      ctx.fillStyle = 'rgba(239,68,68,0.6)';
      ctx.fillRect(goalL, 0, GOAL_W, 8);
      ctx.fillStyle = 'rgba(239,68,68,0.15)';
      ctx.fillRect(goalL, 0, GOAL_W, 30);
      // Bottom goal (p1)
      ctx.fillStyle = 'rgba(59,130,246,0.6)';
      ctx.fillRect(goalL, H - 8, GOAL_W, 8);
      ctx.fillStyle = 'rgba(59,130,246,0.15)';
      ctx.fillRect(goalL, H - 30, GOAL_W, 30);

      // Scores
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#f87171';
      ctx.fillText(`${g.score.p2}`, 12, H / 2 - 14);
      ctx.fillStyle = '#60a5fa';
      ctx.fillText(`${g.score.p1}`, 12, H / 2 + 36);

      if (!g.running) {
        raf = requestAnimationFrame(loop);
        return;
      }

      const { puck, p1, p2, mouse } = g;

      // P1 follows mouse (bottom)
      p1.x += (mouse.x - p1.x) * 0.22;
      p1.y += (Math.max(H / 2 + PADDLE_R, Math.min(H - PADDLE_R, mouse.y)) - p1.y) * 0.22;
      p1.x = Math.max(PADDLE_R, Math.min(W - PADDLE_R, p1.x));
      p1.y = Math.max(H / 2 + PADDLE_R, Math.min(H - PADDLE_R, p1.y));

      // P2: WASD (2p) or AI
      if (g.mode === '2p') {
        if (g.keys['w'] || g.keys['W']) p2.y = Math.max(PADDLE_R, p2.y - 5);
        if (g.keys['s'] || g.keys['S']) p2.y = Math.min(H / 2 - PADDLE_R, p2.y + 5);
        if (g.keys['a'] || g.keys['A']) p2.x = Math.max(PADDLE_R, p2.x - 5);
        if (g.keys['d'] || g.keys['D']) p2.x = Math.min(W - PADDLE_R, p2.x + 5);
      } else {
        // AI with slight imperfection
        const aiSpeed = 3.8;
        const targetX = puck.vy < 0 ? puck.x : W / 2;
        const targetY = puck.vy < 0 ? Math.max(PADDLE_R, puck.y - 50) : 90;
        const dxAI = targetX - p2.x, dyAI = targetY - p2.y;
        const distAI = Math.sqrt(dxAI * dxAI + dyAI * dyAI);
        if (distAI > 2) {
          p2.x += (dxAI / distAI) * Math.min(aiSpeed, distAI);
          p2.y += (dyAI / distAI) * Math.min(aiSpeed, distAI);
        }
        p2.x = Math.max(PADDLE_R, Math.min(W - PADDLE_R, p2.x));
        p2.y = Math.max(PADDLE_R, Math.min(H / 2 - PADDLE_R, p2.y));
      }

      // Puck physics
      puck.x += puck.vx;
      puck.y += puck.vy;

      // Wall bounces
      if (puck.x - PUCK_R < 0) { puck.x = PUCK_R; puck.vx = Math.abs(puck.vx); }
      if (puck.x + PUCK_R > W) { puck.x = W - PUCK_R; puck.vx = -Math.abs(puck.vx); }

      // Goals
      if (puck.y - PUCK_R < 0) {
        if (puck.x > goalL && puck.x < goalR) {
          g.score.p1++;
          setScores({ ...g.score });
          if (g.score.p1 >= 7) { g.running = false; setWinner('🎉 Player 1 Wins!'); setPhase('idle'); }
          else resetPuck('p1');
        } else { puck.y = PUCK_R; puck.vy = Math.abs(puck.vy); }
      }
      if (puck.y + PUCK_R > H) {
        if (puck.x > goalL && puck.x < goalR) {
          g.score.p2++;
          setScores({ ...g.score });
          if (g.score.p2 >= 7) { g.running = false; setWinner(g.mode === 'ai' ? '🤖 AI Wins!' : '🎉 Player 2 Wins!'); setPhase('idle'); }
          else resetPuck('p2');
        } else { puck.y = H - PUCK_R; puck.vy = -Math.abs(puck.vy); }
      }

      // Paddle-puck collisions
      for (const pad of [p1, p2]) {
        const dx = puck.x - pad.x, dy = puck.y - pad.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < PADDLE_R + PUCK_R) {
          const nx = dx / dist, ny = dy / dist;
          puck.x = pad.x + nx * (PADDLE_R + PUCK_R + 1);
          puck.y = pad.y + ny * (PADDLE_R + PUCK_R + 1);
          const rel = puck.vx * nx + puck.vy * ny;
          puck.vx -= 2 * rel * nx;
          puck.vy -= 2 * rel * ny;
          const spd = Math.sqrt(puck.vx * puck.vx + puck.vy * puck.vy);
          const newSpd = Math.min(MAX_SPEED, Math.max(5, spd * 1.08));
          puck.vx = puck.vx / spd * newSpd;
          puck.vy = puck.vy / spd * newSpd;
        }
      }

      // Draw paddles
      const drawPaddle = (x: number, y: number, col1: string, col2: string) => {
        const grad = ctx.createRadialGradient(x - 8, y - 8, 2, x, y, PADDLE_R);
        grad.addColorStop(0, col1); grad.addColorStop(1, col2);
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(x, y, PADDLE_R, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = col1; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, y, PADDLE_R, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.beginPath(); ctx.arc(x - 8, y - 8, 12, 0, Math.PI); ctx.fill();
      };

      drawPaddle(p1.x, p1.y, '#93c5fd', '#1d4ed8');
      drawPaddle(p2.x, p2.y, '#fca5a5', '#b91c1c');

      // Puck shadow
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath(); ctx.ellipse(puck.x + 4, puck.y + 4, PUCK_R, PUCK_R * 0.6, 0, 0, Math.PI * 2); ctx.fill();
      // Puck
      const puckGrad = ctx.createRadialGradient(puck.x - 5, puck.y - 5, 2, puck.x, puck.y, PUCK_R);
      puckGrad.addColorStop(0, '#e2e8f0'); puckGrad.addColorStop(1, '#334155');
      ctx.fillStyle = puckGrad;
      ctx.beginPath(); ctx.arc(puck.x, puck.y, PUCK_R, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(puck.x, puck.y, PUCK_R, 0, Math.PI * 2); ctx.stroke();

      // Labels
      ctx.textAlign = 'right'; ctx.font = 'bold 12px Arial';
      ctx.fillStyle = '#f87171';
      ctx.fillText(g.mode === 'ai' ? '🤖 AI' : '🔴 P2', W - 10, H / 2 - 14);
      ctx.fillStyle = '#60a5fa';
      ctx.fillText('🔵 P1', W - 10, H / 2 + 36);

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('mousemove', onMouse);
      canvas.removeEventListener('touchmove', onTouch);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 p-2">
      <h2 className="text-2xl font-black text-cyan-400">🏒 Air Hockey</h2>
      <div className="flex gap-3 flex-wrap justify-center">
        {(['ai', '2p'] as const).map(m => (
          <button key={m} onClick={() => startGame(m)}
            className={`px-5 py-2 rounded-xl font-black text-sm transition ${m === mode && phase === 'playing' ? 'bg-cyan-500 text-black' : 'bg-slate-700 text-white hover:bg-slate-600'}`}>
            {m === 'ai' ? '🤖 vs AI' : '👥 2 Player'}
          </button>
        ))}
      </div>
      <div className="flex gap-6 text-sm font-bold">
        <span className="text-blue-400">🔵 P1: {scores.p1}</span>
        <span className="text-red-400">🔴 {mode === 'ai' ? 'AI' : 'P2'}: {scores.p2}</span>
        <span className="text-slate-400 text-xs">First to 7!</span>
      </div>
      {winner && <div className="text-xl font-black text-yellow-400 animate-bounce">{winner}</div>}
      <canvas ref={canvasRef} width={W} height={H}
        className="rounded-xl border-2 border-cyan-500/30 shadow-2xl cursor-none"
        style={{ maxWidth: '100%', maxHeight: '65vh', touchAction: 'none', display: 'block' }} />
      <p className="text-xs text-slate-500 text-center">
        {mode === '2p' ? '🖱️ Mouse = P1 (bottom) • WASD = P2 (top)' : '🖱️ Move mouse / drag to control your paddle'}
      </p>
    </div>
  );
}
