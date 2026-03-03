import { useState, useEffect, useCallback } from "react";

const COLORS = ["#ef4444","#3b82f6","#22c55e","#f59e0b","#a855f7","#ec4899"];
const COLOR_NAMES = ["Red","Blue","Green","Yellow","Purple","Pink"];
const PATTERN_LEN = [3,4,5,6,7];

export default function PatternClash() {
  const [level, setLevel] = useState(1);
  const [pattern, setPattern] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [phase, setPhase] = useState<"watch"|"input"|"result">("watch");
  const [showIdx, setShowIdx] = useState(-1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [result, setResult] = useState<"win"|"lose"|null>(null);
  const [flash, setFlash] = useState<number|null>(null);

  const genPattern = useCallback((lvl: number) => {
    const len = PATTERN_LEN[Math.min(lvl-1, PATTERN_LEN.length-1)];
    return Array.from({length: len}, () => Math.floor(Math.random() * COLORS.length));
  }, []);

  const startLevel = useCallback((lvl: number) => {
    const p = genPattern(lvl);
    setPattern(p);
    setPlayerInput([]);
    setPhase("watch");
    setShowIdx(-1);
    setResult(null);
  }, [genPattern]);

  useEffect(() => { startLevel(level); }, [level, startLevel]);

  useEffect(() => {
    if (phase !== "watch") return;
    let i = 0;
    const interval = setInterval(() => {
      if (i >= pattern.length) {
        clearInterval(interval);
        setShowIdx(-1);
        setTimeout(() => setPhase("input"), 400);
        return;
      }
      setShowIdx(pattern[i]);
      i++;
    }, 700);
    return () => clearInterval(interval);
  }, [phase, pattern]);

  const handleInput = (colorIdx: number) => {
    if (phase !== "input") return;
    setFlash(colorIdx);
    setTimeout(() => setFlash(null), 200);
    const newInput = [...playerInput, colorIdx];
    setPlayerInput(newInput);
    if (newInput[newInput.length-1] !== pattern[newInput.length-1]) {
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) { setPhase("result"); setResult("lose"); }
      else { setPhase("result"); setResult("lose"); setTimeout(() => startLevel(level), 1500); }
      return;
    }
    if (newInput.length === pattern.length) {
      const pts = pattern.length * 10 * level;
      setScore(s => s + pts);
      setPhase("result");
      setResult("win");
      setTimeout(() => { setLevel(l => l + 1); }, 1500);
    }
  };

  const restart = () => { setLevel(1); setScore(0); setLives(3); };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto p-2">
      <div className="text-center">
        <h2 className="text-xl font-black text-fuchsia-300">🎨 Pattern Clash</h2>
        <p className="text-slate-400 text-xs">Watch the color pattern, then repeat it!</p>
      </div>
      <div className="flex justify-between w-full">
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-center">
          <p className="text-lg font-black text-fuchsia-400">{score}</p>
          <p className="text-xs text-slate-500">Score</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-center">
          <p className="text-lg font-black text-yellow-400">Lv {level}</p>
          <p className="text-xs text-slate-500">Level</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-center">
          <p className="text-lg font-black text-red-400">{"❤️".repeat(lives)}</p>
          <p className="text-xs text-slate-500">Lives</p>
        </div>
      </div>

      {/* Pattern display */}
      <div className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 flex flex-col items-center gap-3">
        <div className="flex gap-1.5 flex-wrap justify-center">
          {pattern.map((ci, i) => (
            <div key={i} style={{backgroundColor: showIdx === ci && phase==="watch" ? COLORS[ci] : "transparent", border: `2px solid ${COLORS[ci]}`, opacity: phase==="watch" && showIdx === ci ? 1 : phase==="input" && i < playerInput.length ? 0.9 : 0.3}}
              className="w-8 h-8 rounded-lg transition-all">
              {phase === "input" && i < playerInput.length && (
                <div className="w-full h-full rounded-md" style={{backgroundColor: COLORS[playerInput[i]]}}/>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500">
          {phase==="watch" ? "👁️ Watch carefully..." : phase==="input" ? `🎯 Your turn! (${playerInput.length}/${pattern.length})` : result==="win" ? "✅ Correct!" : "❌ Wrong!"}
        </p>
      </div>

      {/* Color buttons */}
      <div className="grid grid-cols-3 gap-2 w-full">
        {COLORS.map((color, i) => (
          <button key={i} onClick={() => handleInput(i)} disabled={phase !== "input"}
            style={{backgroundColor: flash===i ? color : `${color}33`, borderColor: color, boxShadow: flash===i ? `0 0 16px ${color}` : "none"}}
            className="py-3 rounded-xl border-2 font-bold text-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white">
            {COLOR_NAMES[i]}
          </button>
        ))}
      </div>

      {lives <= 0 && (
        <div className="w-full bg-red-900/30 border border-red-500/40 rounded-2xl p-4 text-center">
          <p className="text-red-300 text-xl font-black">Game Over! Score: {score}</p>
          <button onClick={restart} className="mt-2 px-6 py-2 bg-fuchsia-700 hover:bg-fuchsia-600 text-white font-bold rounded-xl transition">Try Again</button>
        </div>
      )}
    </div>
  );
}
