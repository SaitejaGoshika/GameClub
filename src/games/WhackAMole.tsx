import { useState, useEffect, useRef, useCallback } from "react";

const GRID = 9;
const MOLE_DURATION = [900, 750, 600, 500, 400];
const GAME_TIME = 30;

export default function WhackAMole() {
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [active, setActive] = useState<number | null>(null);
  const [hit, setHit] = useState<number | null>(null);
  const [miss, setMiss] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState(false);
  const [combo, setCombo] = useState(0);
  const moleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);

  const getDuration = useCallback((s: number) => {
    const idx = Math.min(Math.floor(s / 5), MOLE_DURATION.length - 1);
    return MOLE_DURATION[idx];
  }, []);

  const spawnMole = useCallback(() => {
    const hole = Math.floor(Math.random() * GRID);
    setActive(hole);
    const dur = getDuration(scoreRef.current);
    moleTimerRef.current = setTimeout(() => {
      setActive(null);
      comboRef.current = 0;
      setCombo(0);
      if (running) spawnMole();
    }, dur);
  }, [getDuration, running]);

  const startGame = () => {
    scoreRef.current = 0;
    comboRef.current = 0;
    setScore(0);
    setCombo(0);
    setTimeLeft(GAME_TIME);
    setOver(false);
    setActive(null);
    setRunning(true);
  };

  useEffect(() => {
    if (!running) return;
    spawnMole();
    gameTimerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(gameTimerRef.current!);
          if (moleTimerRef.current) clearTimeout(moleTimerRef.current);
          setRunning(false);
          setActive(null);
          setOver(true);
          setBest(b => Math.max(b, scoreRef.current));
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (moleTimerRef.current) clearTimeout(moleTimerRef.current);
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    };
  }, [running]);

  const whack = (idx: number) => {
    if (!running || active !== idx) {
      setMiss(idx);
      setTimeout(() => setMiss(null), 300);
      return;
    }
    if (moleTimerRef.current) clearTimeout(moleTimerRef.current);
    comboRef.current++;
    setCombo(comboRef.current);
    const points = comboRef.current >= 3 ? 3 : comboRef.current >= 2 ? 2 : 1;
    scoreRef.current += points;
    setScore(scoreRef.current);
    setHit(idx);
    setActive(null);
    setTimeout(() => { setHit(null); if (running) spawnMole(); }, 150);
  };

  const timePercent = (timeLeft / GAME_TIME) * 100;

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto select-none">
      <h2 className="text-2xl font-black text-white">🔨 Whack-a-Mole!</h2>

      {/* Stats */}
      <div className="flex gap-4 w-full">
        <div className="flex-1 bg-amber-900/30 border border-amber-500/30 rounded-xl p-3 text-center">
          <p className="text-xs text-slate-400">Score</p>
          <p className="text-2xl font-black text-amber-400">{score}</p>
        </div>
        <div className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-3 text-center">
          <p className="text-xs text-slate-400">Time</p>
          <p className={`text-2xl font-black ${timeLeft <= 10 ? "text-red-400" : "text-sky-400"}`}>{timeLeft}s</p>
        </div>
        <div className="flex-1 bg-purple-900/30 border border-purple-500/30 rounded-xl p-3 text-center">
          <p className="text-xs text-slate-400">Best</p>
          <p className="text-2xl font-black text-purple-400">{best}</p>
        </div>
      </div>

      {/* Timer bar */}
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${timeLeft <= 10 ? "bg-red-500" : "bg-sky-500"}`}
          style={{ width: `${timePercent}%` }}
        />
      </div>

      {/* Combo */}
      {combo >= 2 && (
        <div className="text-yellow-400 font-black text-lg animate-bounce">
          🔥 x{combo} Combo!{combo >= 5 ? " INSANE!" : combo >= 3 ? " HOT!" : ""}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-3 gap-3 w-full">
        {Array.from({ length: GRID }, (_, i) => (
          <button
            key={i}
            onClick={() => whack(i)}
            className={`relative aspect-square rounded-2xl border-4 transition-all overflow-hidden
              ${active === i
                ? "border-yellow-400 bg-green-700 scale-105 shadow-lg shadow-yellow-400/30"
                : hit === i
                ? "border-red-400 bg-red-800 scale-90"
                : miss === i
                ? "border-slate-600 bg-slate-700"
                : "border-amber-800 bg-amber-950 hover:bg-amber-900"
              }`}
          >
            {/* Hole */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-1/3 bg-amber-950 rounded-t-full opacity-80" />
            {/* Mole */}
            <div className={`absolute inset-0 flex items-center justify-center transition-transform duration-150 ${active === i ? "translate-y-0" : "translate-y-full"}`}>
              <span className="text-4xl">{hit === i ? "💫" : "🐹"}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Start / Over */}
      {!running && !over && (
        <button onClick={startGame} className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl transition text-lg">
          ▶ Start Game
        </button>
      )}

      {over && (
        <div className="text-center">
          <p className="text-2xl font-black text-amber-400">🎉 Time's Up!</p>
          <p className="text-slate-300">Final Score: <span className="text-white font-black">{score}</span></p>
          {score >= best && score > 0 && <p className="text-yellow-400 font-bold">🏆 New Best!</p>}
          <button onClick={startGame} className="mt-3 px-8 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl transition">
            Play Again
          </button>
        </div>
      )}

      <p className="text-slate-500 text-xs">Click the moles! Combos = bonus points!</p>
    </div>
  );
}
