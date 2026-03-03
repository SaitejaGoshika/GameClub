import { useState, useEffect, useRef, useCallback } from "react";

const COLORS = [
  { id: 0, name: "green", bg: "bg-green-500", active: "bg-green-300", border: "border-green-400" },
  { id: 1, name: "red", bg: "bg-red-500", active: "bg-red-300", border: "border-red-400" },
  { id: 2, name: "yellow", bg: "bg-yellow-400", active: "bg-yellow-200", border: "border-yellow-300" },
  { id: 3, name: "blue", bg: "bg-blue-500", active: "bg-blue-300", border: "border-blue-400" },
];

export default function SimonSays() {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSeq, setPlayerSeq] = useState<number[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [phase, setPhase] = useState<"idle" | "showing" | "input" | "fail" | "win">("idle");
  const [level, setLevel] = useState(0);
  const [best, setBest] = useState(0);
  const [speed, setSpeed] = useState(600);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimeouts = () => { timeoutsRef.current.forEach(clearTimeout); timeoutsRef.current = []; };

  const flash = useCallback((colorId: number, duration = 400) => {
    setActive(colorId);
    return new Promise<void>(res => {
      const t = setTimeout(() => { setActive(null); res(); }, duration);
      timeoutsRef.current.push(t);
    });
  }, []);

  const showSequence = useCallback(async (seq: number[], spd: number) => {
    setPhase("showing");
    await new Promise<void>(res => { const t = setTimeout(res, 500); timeoutsRef.current.push(t); });
    for (const c of seq) {
      await flash(c, spd * 0.7);
      await new Promise<void>(res => { const t = setTimeout(res, spd * 0.3); timeoutsRef.current.push(t); });
    }
    setPhase("input");
  }, [flash]);

  const startGame = useCallback(() => {
    clearTimeouts();
    const first = Math.floor(Math.random() * 4);
    const seq = [first];
    setSequence(seq);
    setPlayerSeq([]);
    setLevel(1);
    setSpeed(600);
    showSequence(seq, 600);
  }, [showSequence]);

  const handlePress = (colorId: number) => {
    if (phase !== "input") return;
    setActive(colorId);
    setTimeout(() => setActive(null), 200);

    const newPlayerSeq = [...playerSeq, colorId];
    setPlayerSeq(newPlayerSeq);

    const idx = newPlayerSeq.length - 1;
    if (newPlayerSeq[idx] !== sequence[idx]) {
      setPhase("fail");
      setBest(b => Math.max(b, level - 1));
      clearTimeouts();
      return;
    }

    if (newPlayerSeq.length === sequence.length) {
      const nextLevel = level + 1;
      const nextSpeed = Math.max(250, speed - 30);
      const nextSeq = [...sequence, Math.floor(Math.random() * 4)];
      setLevel(nextLevel);
      setSpeed(nextSpeed);
      setSequence(nextSeq);
      setPlayerSeq([]);
      setTimeout(() => showSequence(nextSeq, nextSpeed), 700);
    }
  };

  useEffect(() => () => clearTimeouts(), []);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="text-center">
        <h2 className="text-2xl font-black text-white">Simon Says</h2>
        <p className="text-slate-400 text-sm">Repeat the pattern!</p>
      </div>

      {/* Info bar */}
      <div className="flex gap-6">
        <div className="text-center">
          <p className="text-xs text-slate-500">Level</p>
          <p className="text-2xl font-black text-purple-400">{level || "-"}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500">Best</p>
          <p className="text-2xl font-black text-yellow-400">{best}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500">Status</p>
          <p className="text-sm font-bold mt-1 text-slate-300">
            {phase === "idle" ? "Ready" : phase === "showing" ? "👀 Watch!" : phase === "input" ? "👆 Your turn" : phase === "fail" ? "❌ Wrong!" : "🎉 Win!"}
          </p>
        </div>
      </div>

      {/* Game board */}
      <div className="relative w-64 h-64">
        {/* Center circle */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <button
            onClick={phase === "idle" || phase === "fail" ? startGame : undefined}
            className="w-20 h-20 rounded-full bg-slate-900 border-4 border-slate-700 flex items-center justify-center text-white font-black text-sm hover:bg-slate-800 transition shadow-xl cursor-pointer"
          >
            {phase === "idle" || phase === "fail" ? "START" : `${playerSeq.length}/${sequence.length}`}
          </button>
        </div>

        {/* Quadrant buttons */}
        <div className="grid grid-cols-2 gap-2 w-full h-full">
          {COLORS.map((color, i) => (
            <button
              key={color.id}
              onClick={() => handlePress(color.id)}
              disabled={phase !== "input"}
              className={`rounded-${i === 0 ? "tl" : i === 1 ? "tr" : i === 2 ? "bl" : "br"}-[60px] transition-all border-4 
                ${active === color.id ? color.active : color.bg}
                ${color.border}
                ${phase === "input" ? "hover:brightness-125 cursor-pointer" : "cursor-default"}
                ${active === color.id ? "brightness-150 scale-95" : ""}
                disabled:opacity-60
              `}
              style={{
                borderRadius: i === 0 ? "60px 8px 8px 8px" : i === 1 ? "8px 60px 8px 8px" : i === 2 ? "8px 8px 8px 60px" : "8px 8px 60px 8px"
              }}
            />
          ))}
        </div>
      </div>

      {phase === "fail" && (
        <div className="text-center">
          <p className="text-red-400 font-black text-xl">❌ Wrong! You reached level {level}</p>
          <button onClick={startGame} className="mt-2 px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl transition">
            Try Again
          </button>
        </div>
      )}

      {phase === "idle" && (
        <button onClick={startGame} className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl transition text-lg">
          ▶ Start Game
        </button>
      )}
    </div>
  );
}
