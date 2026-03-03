import { useEffect, useRef, useState } from 'react';

const W = 560, H = 380;
const PAD_W = 12, PAD_H = 75, BALL_R = 8;

export default function Pong() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<'idle' | 'playing' | 'over'>('idle');
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [winner, setWinner] = useState('');
  const [gameMode, setGameMode] = useState<'ai' | '2p'>('ai');

  const gRef = useRef({
    p1: H / 2 - PAD_H / 2,
    p2: H / 2 - PAD_H / 2,
    bx: W / 2, by: H / 2,
    vx: 4.5, vy: 3,
    s1: 0, s2: 0,
    running: false,
    mode: 'ai' as 'ai' | '2p',
    keys: new Set<string>(),
  });

  const startGame = (m: 'ai' | '2p') => {
    const g = gRef.current;
    g.p1 = H / 2 - PAD_H / 2;
    g.p2 = H / 2 - PAD_H / 2;
    g.bx = W / 2; g.by = H / 2;
    g.vx = (Math.random() > 0.5 ? 1 : -1) * 4.5;
    g.vy = (Math.random() > 0.5 ? 1 : -1) * 3;
    g.s1 = 0; g.s2 = 0;
    g.running = true;
    g.mode = m;
    setGameMode(m);
    setScores({ p1: 0, p2: 0 });
    setWinner('');
    setPhase('playing');
  };

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const g = gRef.current;

    const onKey = (e: KeyboardEvent) => {
      if (e.type === 'keydown') g.keys.add(e.key);
      else g.keys.delete(e.key);
      if (['ArrowUp', 'ArrowDown', 'w', 's', ' '].includes(e.key)) e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);

    let raf: number;
    const PAD_SPEED = 5.5;
    const MAX_SCORE = 7;

    const loop = () => {
      // Background
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, W, H);

      // Court lines
      ctx.setLineDash([12, 10]);
      ctx.strokeStyle = 'rgba(99,102,241,0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
      ctx.setLineDash([]);

      // Center circle
      ctx.strokeStyle = 'rgba(99,102,241,0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(W / 2, H / 2, 50, 0, Math.PI * 2); ctx.stroke();

      // Scores
      ctx.font = 'bold 52px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(96,165,250,0.2)';
      ctx.fillText(String(g.s1), W / 2 - 90, 70);
      ctx.fillStyle = 'rgba(248,113,113,0.2)';
      ctx.fillText(String(g.s2), W / 2 + 90, 70);
      ctx.font = 'bold 42px Arial';
      ctx.fillStyle = '#60a5fa';
      ctx.fillText(String(g.s1), W / 2 - 90, 65);
      ctx.fillStyle = '#f87171';
      ctx.fillText(String(g.s2), W / 2 + 90, 65);

      if (!g.running) {
        raf = requestAnimationFrame(loop);
        return;
      }

      // Move P1 (left, W/S)
      if (g.keys.has('w') || g.keys.has('W')) g.p1 = Math.max(0, g.p1 - PAD_SPEED);
      if (g.keys.has('s') || g.keys.has('S')) g.p1 = Math.min(H - PAD_H, g.p1 + PAD_SPEED);

      // Move P2 / AI
      if (g.mode === '2p') {
        if (g.keys.has('ArrowUp')) g.p2 = Math.max(0, g.p2 - PAD_SPEED);
        if (g.keys.has('ArrowDown')) g.p2 = Math.min(H - PAD_H, g.p2 + PAD_SPEED);
      } else {
        // AI: track ball with reaction speed
        const center = g.p2 + PAD_H / 2;
        const aiSpd = 4.2 + Math.min(g.s2 * 0.15, 1.5);
        if (center < g.by - 6) g.p2 = Math.min(H - PAD_H, g.p2 + aiSpd);
        else if (center > g.by + 6) g.p2 = Math.max(0, g.p2 - aiSpd);
      }

      // Ball movement
      g.bx += g.vx; g.by += g.vy;

      // Top / bottom bounce
      if (g.by - BALL_R < 0) { g.by = BALL_R; g.vy = Math.abs(g.vy); }
      if (g.by + BALL_R > H) { g.by = H - BALL_R; g.vy = -Math.abs(g.vy); }

      // Left paddle (P1)
      const p1x = 18;
      if (g.vx < 0 && g.bx - BALL_R <= p1x + PAD_W && g.bx - BALL_R >= p1x &&
        g.by >= g.p1 - 5 && g.by <= g.p1 + PAD_H + 5) {
        g.bx = p1x + PAD_W + BALL_R;
        const relY = (g.by - g.p1) / PAD_H - 0.5; // -0.5 to 0.5
        const spd = Math.sqrt(g.vx * g.vx + g.vy * g.vy);
        g.vx = Math.abs(spd * 0.9);
        g.vy = relY * 10;
        g.vx = Math.min(12, g.vx * 1.04);
      }

      // Right paddle (P2)
      const p2x = W - 18 - PAD_W;
      if (g.vx > 0 && g.bx + BALL_R >= p2x && g.bx + BALL_R <= p2x + PAD_W &&
        g.by >= g.p2 - 5 && g.by <= g.p2 + PAD_H + 5) {
        g.bx = p2x - BALL_R;
        const relY = (g.by - g.p2) / PAD_H - 0.5;
        const spd = Math.sqrt(g.vx * g.vx + g.vy * g.vy);
        g.vx = -Math.abs(spd * 0.9);
        g.vy = relY * 10;
        g.vx = Math.max(-12, g.vx * 1.04);
      }

      // Score
      if (g.bx < -20) {
        g.s2++;
        setScores({ p1: g.s1, p2: g.s2 });
        if (g.s2 >= MAX_SCORE) {
          g.running = false;
          setWinner(g.mode === 'ai' ? '🤖 AI Wins!' : '🎉 Player 2 Wins!');
          setPhase('over');
        } else {
          g.bx = W / 2; g.by = H / 2;
          g.vx = -4.5; g.vy = (Math.random() > 0.5 ? 1 : -1) * 3;
        }
      }
      if (g.bx > W + 20) {
        g.s1++;
        setScores({ p1: g.s1, p2: g.s2 });
        if (g.s1 >= MAX_SCORE) {
          g.running = false;
          setWinner('🎉 Player 1 Wins!');
          setPhase('over');
        } else {
          g.bx = W / 2; g.by = H / 2;
          g.vx = 4.5; g.vy = (Math.random() > 0.5 ? 1 : -1) * 3;
        }
      }

      // Draw paddles
      const drawPad = (x: number, y: number, color: string, glow: string) => {
        ctx.shadowColor = glow; ctx.shadowBlur = 15;
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.roundRect(x, y, PAD_W, PAD_H, 5); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath(); ctx.roundRect(x + 2, y + 4, PAD_W - 4, 12, 3); ctx.fill();
      };

      drawPad(18, g.p1, '#3b82f6', '#60a5fa');
      drawPad(W - 18 - PAD_W, g.p2, '#ef4444', '#f87171');

      // Ball trail (simple)
      ctx.shadowColor = '#fff'; ctx.shadowBlur = 20;
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(g.bx, g.by, BALL_R, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;

      // Labels at bottom
      ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(96,165,250,0.5)';
      ctx.fillText('P1 — W/S', W / 4, H - 8);
      ctx.fillStyle = 'rgba(248,113,113,0.5)';
      ctx.fillText(g.mode === '2p' ? 'P2 — ↑/↓' : 'AI', (W / 4) * 3, H - 8);

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
    };
  }, []);

  // Mobile touch for P1 paddle
  const handleP1Touch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const y = (e.touches[0].clientY - rect.top) * (H / rect.height);
    gRef.current.p1 = Math.max(0, Math.min(H - PAD_H, y - PAD_H / 2));
  };

  return (
    <div className="flex flex-col items-center gap-3 p-2">
      <h2 className="text-2xl font-black text-sky-400">🏓 Pong</h2>
      <div className="flex gap-3 flex-wrap justify-center">
        {(['ai', '2p'] as const).map(m => (
          <button key={m} onClick={() => startGame(m)}
            className={`px-5 py-2 rounded-xl font-black text-sm transition ${phase === 'playing' && gameMode === m ? 'bg-sky-500 text-black' : 'bg-slate-700 text-white hover:bg-slate-600'}`}>
            {m === 'ai' ? '🤖 vs AI' : '👥 2 Players'}
          </button>
        ))}
      </div>
      <div className="flex gap-6 text-sm font-bold">
        <span className="text-blue-400">🔵 P1: {scores.p1}</span>
        <span className="text-red-400">🔴 {gameMode === 'ai' ? 'AI' : 'P2'}: {scores.p2}</span>
      </div>
      {winner && <div className="text-xl font-black text-yellow-400 animate-bounce">{winner}</div>}
      <div className="relative">
        <canvas ref={canvasRef} width={W} height={H}
          className="rounded-xl border-2 border-sky-500/30 shadow-2xl"
          style={{ maxWidth: '100%', maxHeight: '55vh', touchAction: 'none', display: 'block' }}
          onTouchMove={handleP1Touch} />
        {phase === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 rounded-xl gap-4">
            <div className="text-5xl">🏓</div>
            <div className="text-2xl font-black text-white">Pong</div>
            <div className="text-sm text-slate-400 text-center px-4">First to 7 wins!<br />P1: W/S keys • P2: ↑/↓ keys</div>
            <div className="flex gap-3">
              <button onClick={() => startGame('ai')}
                className="px-6 py-3 bg-gradient-to-r from-sky-600 to-blue-600 text-white font-black rounded-xl hover:from-sky-500 hover:to-blue-500 transition">🤖 vs AI</button>
              <button onClick={() => startGame('2p')}
                className="px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-black rounded-xl hover:from-pink-500 hover:to-rose-500 transition">👥 2P</button>
            </div>
          </div>
        )}
        {phase === 'over' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 rounded-xl gap-4">
            <div className="text-3xl font-black text-yellow-400">{winner}</div>
            <div className="text-lg text-white font-bold">{scores.p1} — {scores.p2}</div>
            <button onClick={() => startGame(gameMode)}
              className="px-8 py-3 bg-gradient-to-r from-sky-600 to-blue-600 text-white font-black rounded-xl hover:from-sky-500 hover:to-blue-500 transition text-lg">🔄 Play Again</button>
          </div>
        )}
      </div>
      {/* Mobile D-pad for P1 */}
      <div className="flex gap-3 md:hidden">
        <button
          onTouchStart={e => { e.preventDefault(); gRef.current.keys.add('w'); }}
          onTouchEnd={e => { e.preventDefault(); gRef.current.keys.delete('w'); }}
          className="w-14 h-14 bg-blue-700/80 rounded-xl text-2xl font-black active:bg-blue-600 select-none flex items-center justify-center">↑</button>
        <button
          onTouchStart={e => { e.preventDefault(); gRef.current.keys.add('s'); }}
          onTouchEnd={e => { e.preventDefault(); gRef.current.keys.delete('s'); }}
          className="w-14 h-14 bg-blue-700/80 rounded-xl text-2xl font-black active:bg-blue-600 select-none flex items-center justify-center">↓</button>
        {gameMode === '2p' && <>
          <button
            onTouchStart={e => { e.preventDefault(); gRef.current.keys.add('ArrowUp'); }}
            onTouchEnd={e => { e.preventDefault(); gRef.current.keys.delete('ArrowUp'); }}
            className="w-14 h-14 bg-red-700/80 rounded-xl text-2xl font-black active:bg-red-600 select-none flex items-center justify-center">↑</button>
          <button
            onTouchStart={e => { e.preventDefault(); gRef.current.keys.add('ArrowDown'); }}
            onTouchEnd={e => { e.preventDefault(); gRef.current.keys.delete('ArrowDown'); }}
            className="w-14 h-14 bg-red-700/80 rounded-xl text-2xl font-black active:bg-red-600 select-none flex items-center justify-center">↓</button>
        </>}
      </div>
      <p className="text-xs text-slate-500">P1: W/S keys • P2: ↑↓ keys • First to 7 wins!</p>
    </div>
  );
}
