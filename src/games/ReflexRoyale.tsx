import { useState, useEffect, useRef, useCallback } from "react";

type Target = { id: number; x: number; y: number; size: number; color: string; points: number; createdAt: number; duration: number };

const COLORS = [
  { bg: "#ef4444", pts: 10 }, { bg: "#f59e0b", pts: 20 },
  { bg: "#22c55e", pts: 15 }, { bg: "#3b82f6", pts: 10 },
  { bg: "#a855f7", pts: 25 }, { bg: "#ec4899", pts: 30 },
];

export default function ReflexRoyale() {
  const [targets, setTargets] = useState<Target[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [misses, setMisses] = useState(0);
  const [pops, setPops] = useState<{id:number,x:number,y:number,pts:number}[]>([]);
  const idRef = useRef(0);
  const areaRef = useRef<HTMLDivElement>(null);

  const spawnTarget = useCallback(() => {
    const size = Math.random() > 0.7 ? 40 : Math.random() > 0.4 ? 55 : 70;
    const colorObj = COLORS[Math.floor(Math.random() * COLORS.length)];
    const duration = size < 50 ? 1200 : size < 60 ? 1800 : 2500;
    const target: Target = {
      id: idRef.current++,
      x: Math.random() * 85,
      y: Math.random() * 80,
      size, color: colorObj.bg, points: colorObj.pts,
      createdAt: Date.now(), duration
    };
    setTargets(prev => [...prev, target]);
    // auto remove
    setTimeout(() => {
      setTargets(prev => {
        const existed = prev.find(t => t.id === target.id);
        if (existed) { setMisses(m => m + 1); setCombo(0); }
        return prev.filter(t => t.id !== target.id);
      });
    }, duration);
  }, []);

  // spawn loop
  useEffect(() => {
    if (!running) return;
    const baseInterval = Math.max(400, 900 - (30 - timeLeft) * 15);
    const t = setInterval(spawnTarget, baseInterval);
    return () => clearInterval(t);
  }, [running, timeLeft, spawnTarget]);

  // countdown
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { setRunning(false); setGameOver(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  // pop cleanup
  useEffect(() => {
    if (pops.length === 0) return;
    const t = setTimeout(() => setPops([]), 600);
    return () => clearTimeout(t);
  }, [pops]);

  const clickTarget = (t: Target, e: React.MouseEvent) => {
    e.stopPropagation();
    const newCombo = combo + 1;
    const bonus = Math.floor(newCombo / 3);
    const pts = t.points + bonus * 5;
    setScore(s => s + pts);
    setCombo(newCombo);
    setMaxCombo(m => Math.max(m, newCombo));
    setTargets(prev => prev.filter(tt => tt.id !== t.id));
    setPops(prev => [...prev, { id: t.id, x: t.x, y: t.y, pts }]);
  };

  const start = () => {
    setScore(0); setCombo(0); setMaxCombo(0);
    setTimeLeft(30); setRunning(true); setGameOver(false);
    setTargets([]); setMisses(0); setPops([]);
  };

  const timerPct = (timeLeft / 30) * 100;

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-sm mx-auto p-2">
      <div className="text-center">
        <h2 className="text-xl font-black text-red-300">⚡ Reflex Royale</h2>
        <p className="text-slate-400 text-xs">Tap targets as fast as you can! 30 seconds!</p>
      </div>

      <div className="grid grid-cols-4 gap-2 w-full text-center">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-2">
          <p className="text-lg font-black text-yellow-400">{score}</p>
          <p className="text-xs text-slate-500">Score</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-2">
          <p className="text-lg font-black text-orange-400">{combo}x</p>
          <p className="text-xs text-slate-500">Combo</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-2">
          <p className="text-lg font-black text-red-400">{misses}</p>
          <p className="text-xs text-slate-500">Missed</p>
        </div>
        <div className={`border rounded-xl p-2 ${timeLeft <= 10 ? "bg-red-900/40 border-red-500/40" : "bg-slate-800 border-slate-700"}`}>
          <p className={`text-lg font-black ${timeLeft <= 10 ? "text-red-300" : "text-green-400"}`}>{timeLeft}s</p>
          <p className="text-xs text-slate-500">Time</p>
        </div>
      </div>

      {running && (
        <div className="w-full bg-slate-800 rounded-full h-2">
          <div className="h-2 rounded-full transition-all duration-1000" style={{width:`${timerPct}%`, backgroundColor: timeLeft <= 10 ? "#ef4444" : "#22c55e"}}/>
        </div>
      )}

      <div ref={areaRef} className="relative w-full bg-slate-900 border-2 border-slate-700 rounded-2xl overflow-hidden cursor-crosshair"
        style={{height: 280}} onClick={() => { if(running) { setCombo(0); } }}>
        {!running && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button onClick={(e) => { e.stopPropagation(); start(); }}
              className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-red-900/50 hover:brightness-110 transition">
              START! ⚡
            </button>
          </div>
        )}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900/95">
            <p className="text-3xl font-black text-yellow-300">Game Over!</p>
            <p className="text-xl font-black text-white">Score: {score}</p>
            <p className="text-sm text-slate-400">Max Combo: {maxCombo}x | Missed: {misses}</p>
            <button onClick={(e) => { e.stopPropagation(); start(); }}
              className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition">Play Again</button>
          </div>
        )}
        {targets.map(t => {
          const age = Date.now() - t.createdAt;
          const opacity = Math.max(0.3, 1 - age / t.duration);
          return (
            <button key={t.id} onClick={(e) => clickTarget(t, e)}
              style={{position:"absolute", left:`${t.x}%`, top:`${t.y}%`, width:t.size, height:t.size, backgroundColor:t.color, opacity, borderRadius:"50%", transform:"translate(-50%,-50%)", boxShadow:`0 0 ${t.size/3}px ${t.color}88`}}
              className="transition-opacity hover:brightness-125 active:scale-90 border-2 border-white/20 flex items-center justify-center text-white font-black text-xs">
              +{t.points}
            </button>
          );
        })}
        {pops.map(p => (
          <div key={p.id} style={{position:"absolute", left:`${p.x}%`, top:`${p.y}%`, transform:"translate(-50%,-120%)", pointerEvents:"none"}}
            className="text-yellow-300 font-black text-sm animate-bounce">+{p.pts}</div>
        ))}
      </div>

      {combo >= 3 && running && (
        <div className="w-full bg-orange-900/30 border border-orange-500/40 rounded-xl p-2 text-center">
          <p className="text-orange-300 font-black">🔥 COMBO x{combo}! +{Math.floor(combo/3)*5} bonus pts!</p>
        </div>
      )}
    </div>
  );
}
