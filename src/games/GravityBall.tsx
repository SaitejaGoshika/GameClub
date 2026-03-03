import { useEffect, useRef, useState, useCallback } from "react";

interface Ball { x: number; y: number; vx: number; vy: number; r: number; color: string; }
interface Platform { x: number; y: number; w: number; h: number; moving?: boolean; dir?: number; speed?: number; }
interface Coin { x: number; y: number; r: number; collected: boolean; }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string; }

const COLORS = ["#f472b6","#60a5fa","#34d399","#fbbf24","#a78bfa","#fb923c"];

export default function GravityBall() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const W = 360, H = 560;
  const stateRef = useRef({
    ball: { x: 180, y: 100, vx: 0, vy: 0, r: 12, color: "#a78bfa" } as Ball,
    platforms: [] as Platform[],
    coins: [] as Coin[],
    particles: [] as Particle[],
    score: 0, lives: 3, level: 1,
    gravDir: 1, // 1 = down, -1 = up
    alive: true, started: false,
    keys: new Set<string>(),
    frame: 0,
  });
  const [display, setDisplay] = useState({ score: 0, lives: 3, level: 1, started: false, alive: true });
  const animRef = useRef<number>(0);

  const makePlatforms = useCallback((level: number): Platform[] => {
    const plats: Platform[] = [
      { x: 0, y: H - 20, w: W, h: 20 },
      { x: 0, y: 0, w: W, h: 20 },
    ];
    const count = 6 + level * 2;
    for (let i = 0; i < count; i++) {
      const w = 60 + Math.random() * 60;
      const moving = level > 2 && Math.random() > 0.5;
      plats.push({
        x: Math.random() * (W - w - 20) + 10,
        y: 60 + (i / count) * (H - 140),
        w, h: 12,
        moving, dir: 1, speed: 1 + Math.random() * level,
      });
    }
    return plats;
  }, []);

  const makeCoins = useCallback((platforms: Platform[]): Coin[] => {
    return platforms.slice(2).map(p => ({
      x: p.x + p.w / 2,
      y: p.y - 20,
      r: 7,
      collected: false,
    }));
  }, []);

  const startGame = useCallback(() => {
    const s = stateRef.current;
    s.score = 0; s.lives = 3; s.level = 1; s.gravDir = 1; s.alive = true; s.started = true;
    s.ball = { x: 180, y: 80, vx: 0, vy: 0, r: 12, color: COLORS[0] };
    s.platforms = makePlatforms(1);
    s.coins = makeCoins(s.platforms);
    s.particles = []; s.frame = 0;
    setDisplay({ score: 0, lives: 3, level: 1, started: true, alive: true });
  }, [makePlatforms, makeCoins]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      stateRef.current.keys.add(e.code);
      if (["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.code)) e.preventDefault();
      if (e.code === "Space" || e.code === "ArrowUp") stateRef.current.gravDir *= -1;
    };
    const onKeyUp = (e: KeyboardEvent) => stateRef.current.keys.delete(e.code);
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKeyUp);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("keyup", onKeyUp); };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const loop = () => {
      const s = stateRef.current;
      ctx.clearRect(0, 0, W, H);
      // Background gradient
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#0f0523"); bg.addColorStop(1, "#0a0a1a");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      if (!s.started) {
        ctx.fillStyle = "#a78bfa"; ctx.font = "bold 28px sans-serif"; ctx.textAlign = "center";
        ctx.fillText("🌍 Gravity Ball", W / 2, H / 2 - 80);
        ctx.fillStyle = "#7c3aed"; ctx.beginPath(); ctx.arc(W/2, H/2-10, 20, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#a78bfa"; ctx.font = "14px sans-serif";
        ctx.fillText("← → to move | SPACE to flip gravity!", W / 2, H / 2 + 40);
        ctx.fillText("Collect coins, don't fall off!", W / 2, H / 2 + 65);
        ctx.fillStyle = "#8b5cf6"; ctx.beginPath();
        ctx.roundRect(W/2-60, H/2+90, 120, 44, 12); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.font = "bold 16px sans-serif";
        ctx.fillText("▶  Play", W/2, H/2+118);
        animRef.current = requestAnimationFrame(loop); return;
      }

      if (!s.alive) {
        ctx.fillStyle = "rgba(0,0,0,0.75)"; ctx.fillRect(0,0,W,H);
        ctx.fillStyle = "#f87171"; ctx.font = "bold 34px sans-serif"; ctx.textAlign = "center";
        ctx.fillText("💀 Game Over!", W/2, H/2-50);
        ctx.fillStyle = "#fbbf24"; ctx.font = "bold 22px sans-serif";
        ctx.fillText(`Score: ${s.score}`, W/2, H/2-10);
        ctx.fillStyle = "#a78bfa"; ctx.font = "16px sans-serif";
        ctx.fillText(`Level ${s.level} reached`, W/2, H/2+20);
        ctx.fillStyle = "#8b5cf6"; ctx.beginPath();
        ctx.roundRect(W/2-60, H/2+50, 120, 44, 12); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.font = "bold 16px sans-serif";
        ctx.fillText("▶  Retry", W/2, H/2+78);
        animRef.current = requestAnimationFrame(loop); return;
      }

      s.frame++;
      const b = s.ball;
      const GRAVITY = 0.45 * s.gravDir;

      if (s.keys.has("ArrowLeft")) b.vx -= 0.8;
      if (s.keys.has("ArrowRight")) b.vx += 0.8;
      b.vx *= 0.88;
      b.vy += GRAVITY;
      b.vy = Math.max(-10, Math.min(10, b.vy));
      b.x += b.vx; b.y += b.vy;

      // Platform collisions
      for (const p of s.platforms) {
        if (p.moving && p.dir !== undefined && p.speed !== undefined) {
          p.x += p.speed * p.dir;
          if (p.x < 0 || p.x + p.w > W) p.dir *= -1;
        }
        if (b.x + b.r > p.x && b.x - b.r < p.x + p.w) {
          if (s.gravDir === 1 && b.y + b.r > p.y && b.y + b.r < p.y + p.h + 8 && b.vy > 0) {
            b.y = p.y - b.r; b.vy = 0;
          }
          if (s.gravDir === -1 && b.y - b.r < p.y + p.h && b.y - b.r > p.y - 8 && b.vy < 0) {
            b.y = p.y + p.h + b.r; b.vy = 0;
          }
        }
      }

      // Wall bounce
      if (b.x - b.r < 0) { b.x = b.r; b.vx = Math.abs(b.vx) * 0.7; }
      if (b.x + b.r > W) { b.x = W - b.r; b.vx = -Math.abs(b.vx) * 0.7; }

      // Death
      if (b.y > H + 30 || b.y < -30) {
        s.lives--;
        if (s.lives <= 0) { s.alive = false; }
        else {
          b.x = W/2; b.y = H/2; b.vx = 0; b.vy = 0; s.gravDir = 1;
          for (let i=0;i<12;i++) { const a=Math.random()*Math.PI*2; s.particles.push({x:b.x,y:b.y,vx:Math.cos(a)*4,vy:Math.sin(a)*4,life:1,color:"#ef4444"}); }
        }
        setDisplay(d => ({ ...d, lives: s.lives, alive: s.alive }));
      }

      // Coins
      s.coins.forEach(c => {
        if (!c.collected) {
          const dx = b.x - c.x, dy = b.y - c.y;
          if (Math.sqrt(dx*dx+dy*dy) < b.r + c.r) {
            c.collected = true;
            s.score += 10;
            for (let i=0;i<8;i++) { const a=Math.random()*Math.PI*2; s.particles.push({x:c.x,y:c.y,vx:Math.cos(a)*3,vy:Math.sin(a)*3,life:1,color:"#fbbf24"}); }
            setDisplay(d => ({ ...d, score: s.score }));
          }
        }
      });

      // Level up when all coins collected
      if (s.coins.every(c => c.collected)) {
        s.level++;
        s.score += 50;
        s.platforms = makePlatforms(s.level);
        s.coins = makeCoins(s.platforms);
        b.x = W/2; b.y = H/2; b.vx = 0; b.vy = 0;
        b.color = COLORS[s.level % COLORS.length];
        setDisplay(d => ({ ...d, level: s.level, score: s.score }));
      }

      // Draw platforms
      s.platforms.forEach((p, i) => {
        const pg = ctx.createLinearGradient(0, p.y, 0, p.y + p.h);
        if (i < 2) { pg.addColorStop(0,"#1e3a5f"); pg.addColorStop(1,"#0f1f33"); }
        else if (p.moving) { pg.addColorStop(0,"#7c2d12"); pg.addColorStop(1,"#431407"); }
        else { pg.addColorStop(0,"#1d4ed8"); pg.addColorStop(1,"#1e3a8a"); }
        ctx.fillStyle = pg;
        ctx.beginPath(); ctx.roundRect(p.x, p.y, p.w, p.h, 4); ctx.fill();
        ctx.strokeStyle = p.moving ? "#f97316" : "#3b82f6";
        ctx.lineWidth = 1; ctx.stroke();
      });

      // Draw coins
      s.coins.forEach(c => {
        if (!c.collected) {
          ctx.beginPath(); ctx.arc(c.x, c.y + Math.sin(s.frame * 0.08) * 3, c.r, 0, Math.PI*2);
          const cg = ctx.createRadialGradient(c.x-2, c.y-2, 0, c.x, c.y, c.r);
          cg.addColorStop(0,"#fef08a"); cg.addColorStop(1,"#d97706");
          ctx.fillStyle = cg; ctx.fill();
          ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 1; ctx.stroke();
        }
      });

      // Gravity indicator
      ctx.fillStyle = s.gravDir === 1 ? "#34d399" : "#f472b6";
      ctx.font = "bold 20px sans-serif"; ctx.textAlign = "center";
      ctx.fillText(s.gravDir === 1 ? "↓" : "↑", W - 20, 28);

      // Draw ball
      ctx.save();
      ctx.shadowColor = b.color; ctx.shadowBlur = 16;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
      const ballG = ctx.createRadialGradient(b.x-4, b.y-4, 0, b.x, b.y, b.r);
      ballG.addColorStop(0, "#fff"); ballG.addColorStop(0.3, b.color); ballG.addColorStop(1, "#1e1b4b");
      ctx.fillStyle = ballG; ctx.fill();
      ctx.shadowBlur = 0; ctx.restore();

      // Particles
      s.particles = s.particles.filter(p => p.life > 0);
      s.particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.life -= 0.03; p.vx *= 0.9; p.vy *= 0.9;
        ctx.beginPath(); ctx.arc(p.x, p.y, 4*p.life, 0, Math.PI*2);
        ctx.globalAlpha = p.life; ctx.fillStyle = p.color; ctx.fill(); ctx.globalAlpha = 1;
      });

      // HUD
      ctx.fillStyle = "rgba(2,6,23,0.8)"; ctx.fillRect(0, 0, W, 36);
      ctx.fillStyle = "#fbbf24"; ctx.font = "bold 13px monospace"; ctx.textAlign = "left";
      ctx.fillText(`⭐ ${s.score}`, 8, 22);
      ctx.textAlign = "center"; ctx.fillStyle = "#a78bfa";
      ctx.fillText(`LVL ${s.level}`, W/2, 22);
      ctx.textAlign = "right"; ctx.fillStyle = "#ef4444";
      for (let i=0;i<s.lives;i++) ctx.fillText("♥", W-8-i*16, 22);

      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [makePlatforms, makeCoins]);

  const handleClick = useCallback(() => {
    const s = stateRef.current;
    if (!s.started || !s.alive) startGame();
  }, [startGame]);

  const flipGravity = useCallback(() => {
    stateRef.current.gravDir *= -1;
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <canvas ref={canvasRef} width={W} height={H} onClick={handleClick}
        className="rounded-2xl border border-slate-700 touch-none shadow-2xl"
        style={{ width: "min(360px, 100%)", height: "auto" }} />
      {display.started && display.alive && (
        <div className="flex gap-2 w-full max-w-xs">
          <button onPointerDown={() => { stateRef.current.keys.add("ArrowLeft"); }} onPointerUp={() => stateRef.current.keys.delete("ArrowLeft")}
            className="flex-1 py-3 bg-slate-700 rounded-xl text-white font-black text-lg active:bg-slate-600 select-none">◀</button>
          <button onPointerDown={flipGravity}
            className="flex-1 py-3 bg-violet-700 rounded-xl text-white font-black text-sm active:bg-violet-600 select-none">FLIP ↕</button>
          <button onPointerDown={() => { stateRef.current.keys.add("ArrowRight"); }} onPointerUp={() => stateRef.current.keys.delete("ArrowRight")}
            className="flex-1 py-3 bg-slate-700 rounded-xl text-white font-black text-lg active:bg-slate-600 select-none">▶</button>
        </div>
      )}
    </div>
  );
}
