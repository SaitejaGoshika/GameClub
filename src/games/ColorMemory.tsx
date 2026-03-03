import { useState, useCallback } from "react";

const COLORS = ["#ef4444","#3b82f6","#22c55e","#eab308","#a855f7","#f97316","#06b6d4","#ec4899"];
const NAMES  = ["Red","Blue","Green","Yellow","Purple","Orange","Cyan","Pink"];

export default function ColorMemory() {
  const [level, setLevel] = useState(1);
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSeq, setPlayerSeq] = useState<number[]>([]);
  const [showing, setShowing] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [phase, setPhase] = useState<"idle"|"showing"|"input"|"win"|"lose">("idle");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);

  const showSequence = useCallback((seq: number[]) => {
    setPhase("showing");
    setShowing(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i < seq.length) {
        setActiveIdx(seq[i]);
        setTimeout(() => setActiveIdx(null), 500);
        i++;
      } else {
        clearInterval(interval);
        setShowing(false);
        setPhase("input");
      }
    }, 900);
  }, []);

  const startGame = () => {
    const first = Math.floor(Math.random() * 8);
    setSequence([first]);
    setPlayerSeq([]);
    setLevel(1);
    setScore(0);
    showSequence([first]);
  };

  const handleClick = (idx: number) => {
    if (phase !== "input") return;
    const newPlayer = [...playerSeq, idx];
    setPlayerSeq(newPlayer);
    setActiveIdx(idx);
    setTimeout(() => setActiveIdx(null), 200);

    const pos = newPlayer.length - 1;
    if (newPlayer[pos] !== sequence[pos]) {
      setPhase("lose");
      setBest(b => Math.max(b, score));
      return;
    }
    if (newPlayer.length === sequence.length) {
      const newScore = score + sequence.length * 10;
      setScore(newScore);
      const next = [...sequence, Math.floor(Math.random() * 8)];
      setSequence(next);
      setPlayerSeq([]);
      setLevel(l => l + 1);
      setTimeout(() => showSequence(next), 800);
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-md mx-auto p-4">
      <h2 className="text-2xl font-black text-white">🌈 Color Memory</h2>

      <div className="flex gap-4">
        <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 text-center min-w-[70px]">
          <p className="text-2xl font-black text-purple-400">{level}</p>
          <p className="text-slate-400 text-xs">Level</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 text-center min-w-[70px]">
          <p className="text-2xl font-black text-yellow-400">{score}</p>
          <p className="text-slate-400 text-xs">Score</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 text-center min-w-[70px]">
          <p className="text-2xl font-black text-cyan-400">{best}</p>
          <p className="text-slate-400 text-xs">Best</p>
        </div>
      </div>

      <div className="w-full bg-slate-800 rounded-2xl p-2 border border-slate-700 text-center text-sm text-slate-400 min-h-[40px] flex items-center justify-center">
        {phase === "idle" && "Press Start to begin!"}
        {phase === "showing" && <span className="text-purple-300 font-bold animate-pulse">👁️ Watch the sequence... ({sequence.length} colors)</span>}
        {phase === "input" && <span className="text-green-300 font-bold">🎯 Your turn! Repeat the sequence ({playerSeq.length}/{sequence.length})</span>}
        {phase === "win" && <span className="text-yellow-300 font-bold">🎉 Level complete!</span>}
        {phase === "lose" && <span className="text-red-300 font-bold">💀 Wrong! Game over at level {level}</span>}
      </div>

      <div className="grid grid-cols-4 gap-3 w-full">
        {COLORS.map((color, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            disabled={phase !== "input"}
            className="aspect-square rounded-2xl border-2 border-white/10 transition-all duration-150 font-bold text-xs text-white flex items-center justify-center"
            style={{
              backgroundColor: color,
              transform: activeIdx === i ? "scale(1.15)" : "scale(1)",
              filter: activeIdx === i ? "brightness(1.8)" : showing ? "brightness(0.4)" : "brightness(0.8)",
              boxShadow: activeIdx === i ? `0 0 30px ${color}` : "none",
            }}
          >
            {NAMES[i]}
          </button>
        ))}
      </div>

      {(phase === "idle" || phase === "lose") && (
        <button onClick={startGame} className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black rounded-2xl hover:brightness-110 transition text-lg">
          {phase === "lose" ? "🔄 Try Again" : "▶ Start Game"}
        </button>
      )}
    </div>
  );
}
