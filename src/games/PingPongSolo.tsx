import { useEffect, useRef, useState } from "react";

export default function PingPongSolo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    paddleX: 160, ballX: 200, ballY: 250,
    vx: 3, vy: -4, score: 0, lives: 3, running: false,
    bricks: [] as {x:number;y:number;hp:number}[],
    particles: [] as {x:number;y:number;vx:number;vy:number;life:number;color:string}[],
  });
  const [display, setDisplay] = useState({ score: 0, lives: 3, running: false, win: false });
  const animRef = useRef<number>(0);
  const touchRef = useRef<number | null>(null);

  const CW = 400, CH = 480;
  const PW = 80, PH = 10, PY = CH - 30;
  const BR = 7, BC = 8, BW = 44, BH = 16;

  const makeBricks = () => {
    const bricks = [];
    for (let r = 0; r < BR; r++)
      for (let c = 0; c < BC; c++)
        bricks.push({ x: c * (BW + 3) + 4, y: r * (BH + 4) + 40, hp: r < 2 ? 2 : 1 });
    return bricks;
  };

  const reset = () => {
    const s = stateRef.current;
    s.paddleX = 160; s.ballX = 200; s.ballY = 250;
    s.vx = 3 * (Math.random() > 0.5 ? 1 : -1); s.vy = -4;
    s.score = 0; s.lives = 3; s.running = true;
    s.bricks = makeBricks(); s.particles = [];
    setDisplay({ score: 0, lives: 3, running: true, win: false });
  };

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    stateRef.current.bricks = makeBricks();

    const colors = ["#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#8b5cf6","#ec4899"];
    const brickColor = (r: number, c: number) => colors[(r * BC + c) % colors.length];

    const draw = () => {
      const s = stateRef.current;
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, CW, CH);

      // Bricks
      s.bricks.forEach((b, i) => {
        if (b.hp <= 0) return;
        const r = Math.floor(i / BC), c = i % BC;
        const col = brickColor(r, c);
        ctx.fillStyle = b.hp === 2 ? "#fff" : col;
        ctx.strokeStyle = col;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(b.x, b.y, BW, BH, 4); ctx.fill(); ctx.stroke();
        if (b.hp === 2) {
          ctx.fillStyle = col; ctx.font = "bold 9px sans-serif"; ctx.textAlign = "center";
          ctx.fillText("★", b.x + BW/2, b.y + BH/2 + 3);
        }
      });

      // Particles
      s.particles = s.particles.filter(p => p.life > 0);
      s.particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.life -= 3;
        ctx.globalAlpha = p.life / 100;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI*2); ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Paddle
      const grad = ctx.createLinearGradient(s.paddleX, 0, s.paddleX + PW, 0);
      grad.addColorStop(0, "#6366f1"); grad.addColorStop(1, "#8b5cf6");
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.roundRect(s.paddleX, PY, PW, PH, 5); ctx.fill();

      // Ball
      ctx.shadowBlur = 15; ctx.shadowColor = "#a78bfa";
      ctx.fillStyle = "#a78bfa";
      ctx.beginPath(); ctx.arc(s.ballX, s.ballY, 8, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;

      // Lives
      for (let i = 0; i < s.lives; i++) {
        ctx.fillStyle = "#ef4444"; ctx.font = "16px sans-serif";
        ctx.fillText("❤️", 8 + i * 22, 24);
      }
      ctx.fillStyle = "#94a3b8"; ctx.font = "bold 14px sans-serif"; ctx.textAlign = "right";
      ctx.fillText(`Score: ${s.score}`, CW - 8, 22); ctx.textAlign = "left";

      if (s.running) {
        s.ballX += s.vx; s.ballY += s.vy;
        if (s.ballX < 8 || s.ballX > CW - 8) s.vx *= -1;
        if (s.ballY < 8) s.vy *= -1;
        if (s.ballY + 8 >= PY && s.ballX > s.paddleX - 8 && s.ballX < s.paddleX + PW + 8) {
          s.vy = -Math.abs(s.vy);
          s.vx += ((s.ballX - (s.paddleX + PW / 2)) / (PW / 2)) * 2;
          s.vx = Math.max(-6, Math.min(6, s.vx));
        }
        if (s.ballY > CH + 20) {
          s.lives--;
          if (s.lives <= 0) { s.running = false; setDisplay({ score: s.score, lives: 0, running: false, win: false }); return; }
          s.ballX = 200; s.ballY = 250; s.vx = 3 * (Math.random() > 0.5 ? 1 : -1); s.vy = -4;
          setDisplay(d => ({ ...d, lives: s.lives }));
        }
        s.bricks.forEach((b, i) => {
          if (b.hp <= 0) return;
          if (s.ballX + 8 > b.x && s.ballX - 8 < b.x + BW && s.ballY + 8 > b.y && s.ballY - 8 < b.y + BH) {
            b.hp--;
            s.score += b.hp === 0 ? 10 : 5;
            s.vy *= -1;
            const r = Math.floor(i / BC), c2 = i % BC;
            for (let p = 0; p < 8; p++) {
              s.particles.push({ x: b.x + BW/2, y: b.y + BH/2, vx: (Math.random()-0.5)*5, vy: (Math.random()-0.5)*5, life: 100, color: brickColor(r, c2) });
            }
            setDisplay(d => ({ ...d, score: s.score }));
          }
        });
        const alive = s.bricks.filter(b => b.hp > 0).length;
        if (alive === 0) { s.running = false; setDisplay({ score: s.score, lives: s.lives, running: false, win: true }); }
      }
    };

    const loop = () => { draw(); animRef.current = requestAnimationFrame(loop); };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (!s.running) return;
      if (e.key === "ArrowLeft") s.paddleX = Math.max(0, s.paddleX - 20);
      if (e.key === "ArrowRight") s.paddleX = Math.min(CW - PW, s.paddleX + 20);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleTouch = (e: React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.touches[0].clientX - rect.left) / rect.width) * CW;
    stateRef.current.paddleX = Math.max(0, Math.min(CW - PW, x - PW / 2));
    touchRef.current = x;
  };

  const handleMouse = (e: React.MouseEvent) => {
    if (!stateRef.current.running) return;
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * CW;
    stateRef.current.paddleX = Math.max(0, Math.min(CW - PW, x - PW / 2));
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto p-4">
      <h2 className="text-2xl font-black text-white">🏓 Breakout Plus</h2>
      <div className="flex gap-3 text-center">
        <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 min-w-[70px]">
          <p className="text-2xl font-black text-purple-400">{display.score}</p>
          <p className="text-slate-400 text-xs">Score</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 min-w-[70px]">
          <p className="text-2xl font-black text-red-400">{"❤️".repeat(display.lives)}</p>
          <p className="text-slate-400 text-xs">Lives</p>
        </div>
      </div>

      <div className="relative">
        <canvas ref={canvasRef} width={CW} height={CH}
          className="rounded-2xl border border-slate-700 cursor-none touch-none"
          style={{maxWidth: "100%"}}
          onMouseMove={handleMouse}
          onTouchMove={handleTouch} />
        {(!display.running) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-2xl gap-4">
            {display.win && <p className="text-4xl font-black text-yellow-400">🏆 You Win!</p>}
            {!display.win && display.lives === 0 && <p className="text-4xl font-black text-red-400">💀 Game Over</p>}
            {display.score > 0 && <p className="text-white font-bold">Score: {display.score}</p>}
            <button onClick={reset} className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black rounded-2xl text-lg hover:brightness-110 transition">
              {display.score > 0 ? "🔄 Play Again" : "▶ Start"}
            </button>
          </div>
        )}
      </div>
      <p className="text-slate-500 text-xs text-center">Move mouse / touch to control paddle. ★ bricks need 2 hits!</p>
    </div>
  );
}
