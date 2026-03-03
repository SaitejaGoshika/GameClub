import { useEffect, useRef, useState } from "react";

export default function EndlessRunner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    y: 220, vy: 0, jumping: false, score: 0, speed: 4,
    obstacles: [] as {x:number;w:number;h:number;type:number}[],
    coins: [] as {x:number;y:number;collected:boolean}[],
    running: false, dead: false, frame: 0, groundY: 280,
    clouds: [{x:300,y:40,s:0.5},{x:550,y:70,s:0.3},{x:100,y:30,s:0.4}],
    particles: [] as {x:number;y:number;vx:number;vy:number;life:number}[],
  });
  const animRef = useRef<number>(0);
  const [display, setDisplay] = useState({ score: 0, best: 0, dead: false, running: false });
  const bestRef = useRef(0);

  const CW = 600, CH = 320;
  const PX = 80, PW = 28, PH = 40;

  const jump = () => {
    const s = stateRef.current;
    if (!s.running || s.dead) return;
    if (!s.jumping) { s.vy = -12; s.jumping = true; }
  };

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const draw = () => {
      const s = stateRef.current;
      s.frame++;

      // Sky gradient
      const sky = ctx.createLinearGradient(0,0,0,CH);
      sky.addColorStop(0, "#1e1b4b"); sky.addColorStop(1, "#312e81");
      ctx.fillStyle = sky; ctx.fillRect(0,0,CW,CH);

      // Stars
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      [10,50,80,120,200,280,350,420,500,560].forEach((x,i) => {
        const sy = [20,45,15,60,30,50,25,55,35,10][i];
        ctx.beginPath(); ctx.arc(x, sy, 1.5, 0, Math.PI*2); ctx.fill();
      });

      // Ground
      ctx.fillStyle = "#3b1f14";
      ctx.fillRect(0, s.groundY + PH, CW, CH);
      ctx.fillStyle = "#16a34a";
      ctx.fillRect(0, s.groundY + PH, CW, 8);

      // Clouds
      s.clouds.forEach(c => {
        if (s.running) c.x -= 1;
        if (c.x < -100) c.x = CW + 50;
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.beginPath(); ctx.ellipse(c.x, c.y, 40*c.s+30, 15*c.s+10, 0, 0, Math.PI*2); ctx.fill();
      });

      // Coins
      s.coins.forEach(coin => {
        if (!coin.collected) {
          if (s.running) coin.x -= s.speed;
          const cy = coin.y + Math.sin(s.frame * 0.05) * 5;
          ctx.fillStyle = "#eab308";
          ctx.shadowBlur = 10; ctx.shadowColor = "#eab308";
          ctx.beginPath(); ctx.arc(coin.x, cy, 8, 0, Math.PI*2); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = "#fef08a"; ctx.font = "bold 10px sans-serif"; ctx.textAlign = "center";
          ctx.fillText("$", coin.x, cy + 4);
        }
      });

      // Obstacles
      s.obstacles.forEach(obs => {
        if (s.running) obs.x -= s.speed;
        const colors = ["#dc2626","#7c3aed","#0891b2"];
        ctx.fillStyle = colors[obs.type];
        ctx.shadowBlur = 8; ctx.shadowColor = colors[obs.type];
        if (obs.type === 0) { // Cactus
          ctx.fillRect(obs.x, s.groundY + PH - obs.h, obs.w, obs.h);
          ctx.fillRect(obs.x - 10, s.groundY + PH - obs.h * 0.6, obs.w/2, obs.h*0.3);
          ctx.fillRect(obs.x + obs.w, s.groundY + PH - obs.h * 0.7, obs.w/2, obs.h*0.3);
        } else if (obs.type === 1) { // Low flying bird
          const by = s.groundY + PH - obs.h - 20;
          ctx.beginPath(); ctx.ellipse(obs.x + obs.w/2, by, obs.w/2, 12, 0, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.moveTo(obs.x - 10, by - 5); ctx.lineTo(obs.x + obs.w/2, by); ctx.lineTo(obs.x - 10, by + 5); ctx.fill();
          ctx.beginPath(); ctx.moveTo(obs.x + obs.w + 10, by - 5); ctx.lineTo(obs.x + obs.w/2, by); ctx.lineTo(obs.x + obs.w + 10, by + 5); ctx.fill();
        } else { // Rock
          ctx.beginPath(); ctx.ellipse(obs.x + obs.w/2, s.groundY + PH - obs.h/2, obs.w/2, obs.h/2, 0, 0, Math.PI*2); ctx.fill();
        }
        ctx.shadowBlur = 0;
      });

      // Particles
      s.particles = s.particles.filter(p => p.life > 0);
      s.particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.3; p.life -= 4;
        ctx.globalAlpha = p.life / 100;
        ctx.fillStyle = "#eab308";
        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI*2); ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Player
      const py = s.y;
      ctx.fillStyle = s.dead ? "#ef4444" : "#a855f7";
      ctx.shadowBlur = 15; ctx.shadowColor = s.dead ? "#ef4444" : "#a855f7";
      ctx.fillRect(PX, py, PW, PH);
      // Head
      ctx.fillStyle = "#f5f5f5";
      ctx.beginPath(); ctx.arc(PX + PW/2, py - 8, 12, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "#1e293b";
      ctx.beginPath(); ctx.arc(PX + PW/2 + 4, py - 10, 3, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;

      // Score
      ctx.fillStyle = "#e2e8f0"; ctx.font = "bold 16px monospace"; ctx.textAlign = "left";
      ctx.fillText(`Score: ${Math.floor(s.score)}`, 10, 25);
      ctx.fillText(`Best: ${bestRef.current}`, 10, 45);

      if (!s.running) return;

      // Physics
      s.vy += 0.6; s.y += s.vy;
      if (s.y >= s.groundY + PH - PH) { s.y = s.groundY + PH - PH; s.vy = 0; s.jumping = false; }

      s.score += 0.1;
      s.speed = 4 + Math.floor(s.score / 50) * 0.5;

      // Spawn obstacles
      if (s.frame % Math.max(60, 120 - Math.floor(s.score/20)) === 0) {
        const type = Math.random() < 0.6 ? 0 : Math.random() < 0.5 ? 1 : 2;
        const h = type === 1 ? 30 : 30 + Math.random() * 30;
        s.obstacles.push({ x: CW + 20, w: 28, h, type });
      }
      if (s.frame % 80 === 0) {
        s.coins.push({ x: CW + 20, y: s.groundY + PH - PH - 40 - Math.random() * 60, collected: false });
      }

      s.obstacles = s.obstacles.filter(o => o.x > -60);
      s.coins = s.coins.filter(c => c.x > -20);

      // Coin collision
      s.coins.forEach(coin => {
        if (!coin.collected && Math.abs(coin.x - (PX + PW/2)) < 20 && Math.abs(coin.y - (s.y + PH/2)) < 25) {
          coin.collected = true;
          s.score += 10;
          for (let i = 0; i < 6; i++) s.particles.push({ x: coin.x, y: coin.y, vx: (Math.random()-0.5)*4, vy: -Math.random()*4, life: 100 });
        }
      });

      // Obstacle collision
      for (const obs of s.obstacles) {
        const playerRight = PX + PW - 4, playerBottom = s.y + PH;
        const obsTop = obs.type === 1 ? s.groundY + PH - obs.h - 20 - 12 : s.groundY + PH - obs.h;
        if (playerRight > obs.x + 4 && PX + 4 < obs.x + obs.w - 4 && playerBottom > obsTop + 4 && s.y < s.groundY + PH) {
          s.dead = true; s.running = false;
          const b = Math.max(bestRef.current, Math.floor(s.score));
          bestRef.current = b;
          setDisplay({ score: Math.floor(s.score), best: b, dead: true, running: false });
          return;
        }
      }
      setDisplay(d => ({ ...d, score: Math.floor(s.score) }));
    };

    const loop = () => { draw(); animRef.current = requestAnimationFrame(loop); };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === "ArrowUp") { e.preventDefault(); jump(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const startGame = () => {
    const s = stateRef.current;
    s.y = 240; s.vy = 0; s.jumping = false; s.score = 0; s.speed = 4;
    s.obstacles = []; s.coins = []; s.running = true; s.dead = false; s.frame = 0; s.particles = [];
    setDisplay({ score: 0, best: bestRef.current, dead: false, running: true });
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-black text-white">🏃 Endless Runner</h2>
      <p className="text-slate-400 text-sm">Press <kbd className="bg-slate-700 px-2 py-0.5 rounded text-white text-xs">Space</kbd> / <kbd className="bg-slate-700 px-2 py-0.5 rounded text-white text-xs">↑</kbd> or tap to jump. Avoid obstacles, collect coins!</p>

      <div className="relative w-full" style={{maxWidth: CW}}>
        <canvas ref={canvasRef} width={CW} height={CH}
          className="rounded-2xl border border-slate-700 w-full touch-none cursor-pointer"
          onClick={jump}
          onTouchStart={(e) => { e.preventDefault(); jump(); }}
        />
        {!display.running && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-2xl gap-4">
            {display.dead && <p className="text-3xl font-black text-red-400">💀 You Crashed!</p>}
            {display.dead && <p className="text-white font-bold">Score: {display.score} | Best: {display.best}</p>}
            {!display.dead && <p className="text-4xl font-black text-purple-300">🏃 Endless Runner</p>}
            <button onClick={startGame} className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black rounded-2xl text-lg hover:brightness-110 transition">
              {display.dead ? "🔄 Try Again" : "▶ Start Running"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
