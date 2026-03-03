import { useEffect, useRef, useState, useCallback } from "react";

interface Asteroid { x: number; y: number; r: number; vx: number; vy: number; rot: number; rotSpeed: number; }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string; }
interface StarObj { x: number; y: number; size: number; speed: number; }

export default function AsteroidDodge() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    ship: { x: 200, y: 400, r: 12 },
    asteroids: [] as Asteroid[],
    particles: [] as Particle[],
    stars: [] as StarObj[],
    score: 0, level: 1, lives: 3, alive: true, started: false,
    mouse: { x: 200, y: 400 },
    invincible: 0, frame: 0, spawnTimer: 0,
  });
  const [display, setDisplay] = useState<{ score: number; alive: boolean; started: boolean }>({ score: 0, alive: true, started: false });
  const animRef = useRef<number>(0);
  const W = 400, H = 560;

  const spawnAsteroid = useCallback((state: typeof stateRef.current) => {
    const side = Math.floor(Math.random() * 4);
    let x = 0, y = 0;
    if (side === 0) { x = Math.random() * W; y = -30; }
    else if (side === 1) { x = W + 30; y = Math.random() * H; }
    else if (side === 2) { x = Math.random() * W; y = H + 30; }
    else { x = -30; y = Math.random() * H; }
    const angle = Math.atan2(H / 2 - y, W / 2 - x) + (Math.random() - 0.5) * 1.2;
    const speed = 1.5 + state.level * 0.4 + Math.random() * 1.5;
    const r = 14 + Math.random() * 22;
    state.asteroids.push({ x, y, r, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, rot: 0, rotSpeed: (Math.random() - 0.5) * 0.08 });
  }, []);

  const initStars = useCallback((state: typeof stateRef.current) => {
    state.stars = Array.from({ length: 80 }, () => ({ x: Math.random() * W, y: Math.random() * H, size: Math.random() * 1.5 + 0.3, speed: 0.3 + Math.random() * 0.7 }));
  }, []);

  const explode = useCallback((state: typeof stateRef.current, x: number, y: number, color = "#f97316") => {
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2 + Math.random() * 0.5;
      const speed = 1 + Math.random() * 4;
      state.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, color });
    }
  }, []);

  const startGame = useCallback(() => {
    const s = stateRef.current;
    s.ship = { x: W / 2, y: H / 2, r: 12 };
    s.asteroids = []; s.particles = []; s.score = 0; s.level = 1;
    s.lives = 3; s.alive = true; s.started = true; s.invincible = 0;
    s.frame = 0; s.spawnTimer = 0; s.mouse = { x: W / 2, y: H / 2 };
    initStars(s);
    for (let i = 0; i < 5; i++) spawnAsteroid(s);
    setDisplay({ score: 0, alive: true, started: true });
  }, [initStars, spawnAsteroid]);

  useEffect(() => {
    const s = stateRef.current;
    initStars(s);
    const canvas = canvasRef.current!;
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      s.mouse.x = (e.clientX - rect.left) * (W / rect.width);
      s.mouse.y = (e.clientY - rect.top) * (H / rect.height);
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      s.mouse.x = (e.touches[0].clientX - rect.left) * (W / rect.width);
      s.mouse.y = (e.touches[0].clientY - rect.top) * (H / rect.height);
    };
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchstart", onTouchMove, { passive: false });
    return () => { canvas.removeEventListener("mousemove", onMouseMove); canvas.removeEventListener("touchmove", onTouchMove); };
  }, [initStars]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const loop = () => {
      const s = stateRef.current;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#020617"; ctx.fillRect(0, 0, W, H);
      s.stars.forEach(star => {
        star.y += star.speed;
        if (star.y > H) { star.y = 0; star.x = Math.random() * W; }
        ctx.beginPath(); ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.3 + star.size * 0.4})`; ctx.fill();
      });
      if (!s.started) {
        ctx.fillStyle = "rgba(139,92,246,0.15)"; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#fff"; ctx.font = "bold 28px sans-serif"; ctx.textAlign = "center";
        ctx.fillText("☄️ Asteroid Dodge", W / 2, H / 2 - 60);
        ctx.font = "15px sans-serif"; ctx.fillStyle = "#a78bfa";
        ctx.fillText("Move mouse / touch to dodge!", W / 2, H / 2 - 20);
        ctx.fillText("Survive as long as possible", W / 2, H / 2 + 10);
        ctx.fillStyle = "#8b5cf6"; ctx.beginPath();
        ctx.roundRect(W / 2 - 70, H / 2 + 40, 140, 44, 12); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.font = "bold 18px sans-serif";
        ctx.fillText("▶  Play", W / 2, H / 2 + 68);
        animRef.current = requestAnimationFrame(loop); return;
      }
      if (!s.alive) {
        ctx.fillStyle = "rgba(0,0,0,0.7)"; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#f87171"; ctx.font = "bold 36px sans-serif"; ctx.textAlign = "center";
        ctx.fillText("💥 Game Over!", W / 2, H / 2 - 60);
        ctx.fillStyle = "#fbbf24"; ctx.font = "bold 22px sans-serif";
        ctx.fillText(`Score: ${s.score}`, W / 2, H / 2 - 20);
        ctx.fillStyle = "#a78bfa"; ctx.font = "16px sans-serif";
        ctx.fillText(`Level ${s.level} reached`, W / 2, H / 2 + 10);
        ctx.fillStyle = "#8b5cf6"; ctx.beginPath();
        ctx.roundRect(W / 2 - 70, H / 2 + 40, 140, 44, 12); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.font = "bold 16px sans-serif";
        ctx.fillText("▶  Play Again", W / 2, H / 2 + 68);
        s.particles.forEach(p => {
          p.x += p.vx; p.y += p.vy; p.life -= 0.02; p.vx *= 0.95; p.vy *= 0.95;
          ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.globalAlpha = p.life; ctx.fillStyle = p.color; ctx.fill(); ctx.globalAlpha = 1;
        });
        animRef.current = requestAnimationFrame(loop); return;
      }
      s.frame++; s.score++; s.invincible = Math.max(0, s.invincible - 1);
      s.level = 1 + Math.floor(s.score / 400);
      s.ship.x += (s.mouse.x - s.ship.x) * 0.12;
      s.ship.y += (s.mouse.y - s.ship.y) * 0.12;
      s.ship.x = Math.max(15, Math.min(W - 15, s.ship.x));
      s.ship.y = Math.max(15, Math.min(H - 15, s.ship.y));
      s.spawnTimer++;
      if (s.spawnTimer >= Math.max(20, 60 - s.level * 5)) { spawnAsteroid(s); s.spawnTimer = 0; }
      s.asteroids = s.asteroids.filter(a => {
        a.x += a.vx; a.y += a.vy; a.rot += a.rotSpeed;
        return a.x > -60 && a.x < W + 60 && a.y > -60 && a.y < H + 60;
      });
      if (s.invincible === 0) {
        for (const a of s.asteroids) {
          const adx = s.ship.x - a.x, ady = s.ship.y - a.y;
          if (Math.sqrt(adx * adx + ady * ady) < s.ship.r + a.r - 4) {
            s.lives--; s.invincible = 120;
            explode(s, s.ship.x, s.ship.y, "#f97316");
            if (s.lives <= 0) { s.alive = false; explode(s, s.ship.x, s.ship.y, "#ef4444"); }
            setDisplay(d => ({ ...d, alive: s.alive }));
            break;
          }
        }
      }
      s.asteroids.forEach(a => {
        ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(a.rot); ctx.beginPath();
        for (let i = 0; i < 7; i++) {
          const ang = (i / 7) * Math.PI * 2, jitter = 0.75 + 0.25 * Math.sin(i * 3.3);
          i === 0 ? ctx.moveTo(Math.cos(ang)*a.r*jitter, Math.sin(ang)*a.r*jitter) : ctx.lineTo(Math.cos(ang)*a.r*jitter, Math.sin(ang)*a.r*jitter);
        }
        ctx.closePath();
        const grd = ctx.createRadialGradient(0,0,0,0,0,a.r);
        grd.addColorStop(0,"#64748b"); grd.addColorStop(1,"#1e293b");
        ctx.fillStyle = grd; ctx.fill();
        ctx.strokeStyle = "#475569"; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
      });
      if (s.invincible === 0 || Math.floor(s.invincible / 6) % 2 === 0) {
        const { x, y } = s.ship;
        const ang = Math.atan2(s.mouse.y - y, s.mouse.x - x) + Math.PI / 2;
        ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
        ctx.shadowColor = "#6366f1"; ctx.shadowBlur = 16;
        ctx.beginPath(); ctx.moveTo(0,-14); ctx.lineTo(10,10); ctx.lineTo(0,6); ctx.lineTo(-10,10); ctx.closePath();
        const sg = ctx.createLinearGradient(0,-14,0,10);
        sg.addColorStop(0,"#a78bfa"); sg.addColorStop(1,"#4f46e5");
        ctx.fillStyle = sg; ctx.fill(); ctx.strokeStyle = "#c4b5fd"; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.beginPath(); ctx.arc(0,-4,4,0,Math.PI*2); ctx.fillStyle = "#bfdbfe"; ctx.fill();
        ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.moveTo(-5,8); ctx.lineTo(0,18+Math.random()*5); ctx.lineTo(5,8);
        ctx.fillStyle = `rgba(251,146,60,${0.6+Math.random()*0.4})`; ctx.fill(); ctx.restore();
      }
      s.particles = s.particles.filter(p => p.life > 0);
      s.particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.life -= 0.025; p.vx *= 0.93; p.vy *= 0.93;
        ctx.beginPath(); ctx.arc(p.x,p.y,3*p.life+1,0,Math.PI*2);
        ctx.globalAlpha = p.life; ctx.fillStyle = p.color; ctx.fill(); ctx.globalAlpha = 1;
      });
      ctx.fillStyle = "rgba(15,23,42,0.7)"; ctx.fillRect(0,0,W,36);
      ctx.fillStyle = "#fbbf24"; ctx.font = "bold 14px monospace"; ctx.textAlign = "left";
      ctx.fillText(`⭐ ${s.score}`, 10, 22);
      ctx.fillStyle = "#f472b6"; ctx.textAlign = "center"; ctx.fillText(`LVL ${s.level}`, W/2, 22);
      ctx.textAlign = "right";
      for (let i = 0; i < s.lives; i++) { ctx.fillStyle = "#ef4444"; ctx.fillText("♥", W-8-i*18, 22); }
      setDisplay(d => ({ ...d, score: s.score }));
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current!);
  }, [spawnAsteroid, explode]);

  const handleClick = useCallback(() => {
    const s = stateRef.current;
    if (!s.started || !s.alive) startGame();
  }, [startGame]);

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <canvas ref={canvasRef} width={W} height={H} onClick={handleClick}
        className="rounded-2xl border border-slate-700 cursor-none touch-none shadow-2xl"
        style={{ width: "min(400px, 100%)", height: "auto" }} />
      {display.started && display.alive && (
        <p className="text-slate-500 text-xs">Move your mouse / finger to dodge asteroids!</p>
      )}
    </div>
  );
}
