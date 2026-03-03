import { useEffect, useRef, useState, useCallback } from 'react';

const CELL = 22, COLS = 20, ROWS = 20;
const W = COLS * CELL, H = ROWS * CELL;

type Point = { x: number; y: number };

function rndFood(snake: Point[]): Point {
  let pos: Point;
  do { pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }; }
  while (snake.some(s => s.x === pos.x && s.y === pos.y));
  return pos;
}

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'playing' | 'over'>('idle');
  const [hiscore, setHiscore] = useState(0);

  const gRef = useRef({
    snake: [{ x: 10, y: 10 }] as Point[],
    food: { x: 5, y: 5 } as Point,
    dir: { x: 1, y: 0 } as Point,
    nextDir: { x: 1, y: 0 } as Point,
    score: 0,
    running: false,
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number }[],
    frame: 0,
  });

  const hiRef = useRef(0);

  const startGame = useCallback(() => {
    const g = gRef.current;
    const snake = [{ x: 10, y: 10 }];
    const food = rndFood(snake);
    g.snake = snake;
    g.food = food;
    g.dir = { x: 1, y: 0 };
    g.nextDir = { x: 1, y: 0 };
    g.score = 0;
    g.running = true;
    g.particles = [];
    g.frame = 0;
    setScore(0); setPhase('playing');
  }, []);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const g = gRef.current;
      const { dir } = g;
      if ((e.key === 'ArrowUp' || e.key === 'w') && dir.y !== 1) g.nextDir = { x: 0, y: -1 };
      if ((e.key === 'ArrowDown' || e.key === 's') && dir.y !== -1) g.nextDir = { x: 0, y: 1 };
      if ((e.key === 'ArrowLeft' || e.key === 'a') && dir.x !== 1) g.nextDir = { x: -1, y: 0 };
      if ((e.key === 'ArrowRight' || e.key === 'd') && dir.x !== -1) g.nextDir = { x: 1, y: 0 };
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Game loop (canvas draw + game tick)
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const g = gRef.current;

    let raf: number;
    let lastTick = 0;
    const TICK = 120; // ms per move

    const draw = () => {
      // Background
      ctx.fillStyle = '#0a0f1e';
      ctx.fillRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = 'rgba(30,58,138,0.25)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= COLS; i++) {
        ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, H); ctx.stroke();
      }
      for (let j = 0; j <= ROWS; j++) {
        ctx.beginPath(); ctx.moveTo(0, j * CELL); ctx.lineTo(W, j * CELL); ctx.stroke();
      }

      // Particles
      g.particles = g.particles.filter(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life -= 0.05;
        ctx.globalAlpha = p.life;
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
        return p.life > 0;
      });
      ctx.globalAlpha = 1;

      // Food
      const fx = g.food.x * CELL + CELL / 2;
      const fy = g.food.y * CELL + CELL / 2;
      const pulse = 1 + Math.sin(g.frame * 0.12) * 0.15;
      ctx.shadowColor = '#f43f5e'; ctx.shadowBlur = 14;
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath(); ctx.arc(fx, fy, (CELL / 2 - 3) * pulse, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fda4af';
      ctx.beginPath(); ctx.arc(fx - 2, fy - 2, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;

      // Snake
      g.snake.forEach((seg, i) => {
        const x = seg.x * CELL, y = seg.y * CELL;
        const t = 1 - i / g.snake.length;
        if (i === 0) {
          // Head
          ctx.shadowColor = '#4ade80'; ctx.shadowBlur = 10;
          ctx.fillStyle = '#22c55e';
          ctx.beginPath(); ctx.roundRect(x + 1, y + 1, CELL - 2, CELL - 2, 6); ctx.fill();
          ctx.fillStyle = '#4ade80';
          ctx.beginPath(); ctx.roundRect(x + 3, y + 3, CELL - 6, CELL - 6, 4); ctx.fill();
          ctx.shadowBlur = 0;
          // Eyes
          const d = g.dir;
          const eyeOffset = CELL * 0.25;
          let e1x = CELL / 2, e1y = CELL * 0.25, e2x = CELL / 2, e2y = CELL * 0.25;
          if (d.x === 1) { e1x = CELL * 0.75; e1y = CELL * 0.3; e2x = CELL * 0.75; e2y = CELL * 0.65; }
          else if (d.x === -1) { e1x = CELL * 0.25; e1y = CELL * 0.3; e2x = CELL * 0.25; e2y = CELL * 0.65; }
          else if (d.y === -1) { e1x = CELL * 0.3; e1y = CELL * 0.25; e2x = CELL * 0.65; e2y = CELL * 0.25; }
          else { e1x = CELL * 0.3; e1y = CELL * 0.75; e2x = CELL * 0.65; e2y = CELL * 0.75; }
          void eyeOffset;
          ctx.fillStyle = '#fff';
          ctx.beginPath(); ctx.arc(x + e1x, y + e1y, 3, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(x + e2x, y + e2y, 3, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#1e293b';
          ctx.beginPath(); ctx.arc(x + e1x + 0.5, y + e1y + 0.5, 1.5, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(x + e2x + 0.5, y + e2y + 0.5, 1.5, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.fillStyle = `rgb(${Math.floor(34 + t * 50)},${Math.floor(197 - t * 100)},${Math.floor(94 - t * 30)})`;
          ctx.beginPath(); ctx.roundRect(x + 2, y + 2, CELL - 4, CELL - 4, 4); ctx.fill();
        }
      });
    };

    const tick = () => {
      if (!g.running) return;
      g.dir = { ...g.nextDir };
      const head = { x: g.snake[0].x + g.dir.x, y: g.snake[0].y + g.dir.y };

      // Wall collision
      if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS ||
        g.snake.some(s => s.x === head.x && s.y === head.y)) {
        g.running = false;
        if (g.score > hiRef.current) { hiRef.current = g.score; setHiscore(g.score); }
        setPhase('over');
        return;
      }

      let newSnake = [head, ...g.snake];
      if (head.x === g.food.x && head.y === g.food.y) {
        g.score += 10;
        setScore(g.score);
        g.food = rndFood(newSnake);
        // Food particles
        for (let i = 0; i < 8; i++)
          g.particles.push({ x: head.x * CELL + CELL / 2, y: head.y * CELL + CELL / 2, vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5 - 1, life: 1 });
      } else {
        newSnake = newSnake.slice(0, -1);
      }
      g.snake = newSnake;
    };

    const loop = (ts: number) => {
      g.frame++;
      if (g.running && ts - lastTick > TICK) {
        tick();
        lastTick = ts;
      }
      draw();
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const changeDir = (dx: number, dy: number) => {
    const g = gRef.current;
    if (dx === 1 && g.dir.x !== -1) g.nextDir = { x: 1, y: 0 };
    if (dx === -1 && g.dir.x !== 1) g.nextDir = { x: -1, y: 0 };
    if (dy === -1 && g.dir.y !== 1) g.nextDir = { x: 0, y: -1 };
    if (dy === 1 && g.dir.y !== -1) g.nextDir = { x: 0, y: 1 };
  };

  return (
    <div className="flex flex-col items-center gap-3 p-2">
      <h2 className="text-2xl font-black text-green-400">🐍 Snake</h2>
      <div className="flex gap-5 text-sm font-bold">
        <span className="text-green-400">Score: {score}</span>
        <span className="text-yellow-400">Best: {hiscore}</span>
      </div>
      <div className="relative">
        <canvas ref={canvasRef} width={W} height={H}
          className="rounded-xl border-2 border-green-500/30 shadow-2xl"
          style={{ maxWidth: '100%', maxHeight: '65vh', display: 'block' }} />
        {phase !== 'playing' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 rounded-xl gap-4">
            {phase === 'over' && <div className="text-4xl font-black text-red-400">💀 Game Over!</div>}
            {phase === 'over' && <div className="text-xl text-yellow-400 font-bold">Score: {score}</div>}
            {phase === 'idle' && <div className="text-5xl mb-1">🐍</div>}
            {phase === 'idle' && <div className="text-2xl font-black text-white">Snake</div>}
            {phase === 'idle' && <div className="text-sm text-slate-400 text-center px-4">Eat food to grow longer<br />Don't hit the walls!</div>}
            <button onClick={startGame}
              className="px-10 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-black rounded-2xl hover:from-green-500 hover:to-emerald-500 transition text-lg shadow-lg">
              {phase === 'over' ? '🔄 Play Again' : '▶ Start Game'}
            </button>
          </div>
        )}
      </div>
      {/* D-Pad */}
      <div className="grid grid-cols-3 gap-2">
        <div />
        <button onPointerDown={() => changeDir(0, -1)}
          className="w-12 h-12 bg-slate-700/80 rounded-xl text-xl font-black hover:bg-slate-600 active:bg-slate-500 select-none flex items-center justify-center">▲</button>
        <div />
        <button onPointerDown={() => changeDir(-1, 0)}
          className="w-12 h-12 bg-slate-700/80 rounded-xl text-xl font-black hover:bg-slate-600 active:bg-slate-500 select-none flex items-center justify-center">◀</button>
        <button onPointerDown={() => changeDir(0, 1)}
          className="w-12 h-12 bg-slate-700/80 rounded-xl text-xl font-black hover:bg-slate-600 active:bg-slate-500 select-none flex items-center justify-center">▼</button>
        <button onPointerDown={() => changeDir(1, 0)}
          className="w-12 h-12 bg-slate-700/80 rounded-xl text-xl font-black hover:bg-slate-600 active:bg-slate-500 select-none flex items-center justify-center">▶</button>
      </div>
      <p className="text-xs text-slate-500">Arrow keys / WASD or the D-pad above</p>
    </div>
  );
}
