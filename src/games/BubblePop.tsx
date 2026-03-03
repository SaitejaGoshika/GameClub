import { useState, useEffect, useCallback } from "react";

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  points: number;
  speed: number;
  wobble: number;
}

const COLORS = [
  { bg: "bg-red-500", shadow: "rgba(239,68,68,0.7)", pts: 1 },
  { bg: "bg-blue-500", shadow: "rgba(59,130,246,0.7)", pts: 2 },
  { bg: "bg-green-500", shadow: "rgba(34,197,94,0.7)", pts: 3 },
  { bg: "bg-yellow-400", shadow: "rgba(234,179,8,0.7)", pts: 5 },
  { bg: "bg-purple-500", shadow: "rgba(168,85,247,0.7)", pts: 10 },
];

let nextId = 1;

export default function BubblePop() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [running, setRunning] = useState(false);
  const [best, setBest] = useState(0);
  const [popped, setPopped] = useState<{id:number;x:number;y:number;pts:number}[]>([]);

  const spawnBubble = useCallback(() => {
    const colorIdx = Math.random() < 0.1 ? 4 : Math.random() < 0.2 ? 3 : Math.floor(Math.random() * 3);
    const c = COLORS[colorIdx];
    const size = colorIdx === 4 ? 50 : colorIdx === 3 ? 60 : 40 + Math.random() * 40;
    setBubbles(b => [...b, {
      id: nextId++,
      x: 5 + Math.random() * 85,
      y: 100 + Math.random() * 10,
      size,
      color: c.bg,
      points: c.pts,
      speed: 0.3 + Math.random() * 0.5,
      wobble: Math.random() * 2 - 1,
    }]);
  }, []);

  useEffect(() => {
    if (!running) return;
    const spawn = setInterval(spawnBubble, 800);
    const move = setInterval(() => {
      setBubbles(b => b.map(bb => ({ ...bb, y: bb.y - bb.speed })).filter(bb => bb.y + bb.size / 8 > 0));
    }, 50);
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { setRunning(false); clearInterval(spawn); clearInterval(move); clearInterval(timer); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { clearInterval(spawn); clearInterval(move); clearInterval(timer); };
  }, [running, spawnBubble]);

  useEffect(() => {
    const t = setTimeout(() => setPopped(p => p.slice(1)), 600);
    return () => clearTimeout(t);
  }, [popped.length]);

  const pop = (bubble: Bubble) => {
    if (!running) return;
    setBubbles(b => b.filter(bb => bb.id !== bubble.id));
    setScore(s => s + bubble.points);
    setPopped(p => [...p, { id: bubble.id, x: bubble.x, y: bubble.y, pts: bubble.points }]);
  };

  const start = () => {
    setBubbles([]); setScore(0); setTimeLeft(30); setRunning(true);
    setBest(b => Math.max(b, score));
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto p-4">
      <h2 className="text-2xl font-black text-white">🫧 Bubble Pop</h2>

      <div className="flex gap-3">
        <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 text-center min-w-[70px]">
          <p className="text-2xl font-black text-cyan-400">{score}</p>
          <p className="text-slate-400 text-xs">Score</p>
        </div>
        <div className={`bg-slate-800 rounded-xl p-3 border text-center min-w-[70px] ${timeLeft<=5&&running?"border-red-500 animate-pulse":"border-slate-700"}`}>
          <p className={`text-2xl font-black ${timeLeft<=5?"text-red-400":"text-yellow-400"}`}>{timeLeft}s</p>
          <p className="text-slate-400 text-xs">Time</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 text-center min-w-[70px]">
          <p className="text-2xl font-black text-green-400">{best}</p>
          <p className="text-slate-400 text-xs">Best</p>
        </div>
      </div>

      <div className="w-full relative bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl border border-slate-700 overflow-hidden select-none" style={{height: 360}}>
        {!running && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            {timeLeft === 0 && <p className="text-white font-black text-2xl">Time's Up! Score: {score}</p>}
            <button onClick={start} className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black rounded-2xl text-lg hover:brightness-110 transition">
              {timeLeft === 0 ? "🔄 Play Again" : "▶ Start"}
            </button>
            <div className="text-xs text-slate-400 text-center px-4">
              <p>🔴 Red=1pt 🔵 Blue=2pts 🟢 Green=3pts 🟡 Yellow=5pts 🟣 Purple=10pts</p>
            </div>
          </div>
        )}
        {bubbles.map(b => (
          <button key={b.id} onClick={() => pop(b)}
            className={`absolute rounded-full ${b.color} transition-transform active:scale-150 flex items-center justify-center font-black text-white`}
            style={{
              left: `${b.x}%`, bottom: `${b.y}%`,
              width: b.size, height: b.size,
              transform: `translateX(-50%) translateX(${b.wobble}px)`,
              boxShadow: `0 0 15px ${COLORS.find(c=>c.bg===b.color)?.shadow}`,
              fontSize: b.size * 0.3,
            }}>
            {b.points > 3 ? b.points : ""}
          </button>
        ))}
        {popped.map(p => (
          <div key={p.id} className="absolute pointer-events-none text-white font-black text-lg animate-ping"
            style={{left: `${p.x}%`, bottom: `${p.y}%`, transform: "translate(-50%,-50%)"}}>
            +{p.pts}
          </div>
        ))}
      </div>

      <div className="text-xs text-slate-500 text-center">Pop bubbles before they float away! Rare purple bubbles = 10 pts!</div>
    </div>
  );
}
