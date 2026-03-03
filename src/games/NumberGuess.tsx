import { useState } from "react";

export default function NumberGuess() {
  const [target] = useState(() => Math.floor(Math.random() * 100) + 1);
  const [guess, setGuess] = useState("");
  const [history, setHistory] = useState<{ val: number; hint: string }[]>([]);
  const [won, setWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const MAX = 7;

  const submit = () => {
    const n = parseInt(guess);
    if (isNaN(n) || n < 1 || n > 100) return;
    let hint = "";
    if (n === target) { hint = "🎯 Correct!"; setWon(true); }
    else if (n < target) hint = n < target - 20 ? "🔥 Much too low!" : "⬆️ Too low!";
    else hint = n > target + 20 ? "🧊 Much too high!" : "⬇️ Too high!";
    const newHistory = [{ val: n, hint }, ...history];
    setHistory(newHistory);
    setGuess("");
    if (n !== target && newHistory.length >= MAX) setGameOver(true);
  };

  const reset = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto p-4">
      <h2 className="text-2xl font-black text-white">🔢 Number Guess</h2>
      <p className="text-slate-400 text-sm text-center">Guess the number between <span className="text-yellow-400 font-bold">1–100</span> in {MAX} tries!</p>

      <div className="w-full bg-slate-800 rounded-2xl p-4 border border-slate-700">
        <div className="flex justify-between text-xs text-slate-400 mb-3">
          <span>Attempts: <span className="text-white font-bold">{history.length}/{MAX}</span></span>
          <div className="flex gap-1">
            {Array.from({ length: MAX }).map((_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i < history.length ? (won && i === history.length - 1 ? "bg-green-400" : "bg-red-400") : "bg-slate-600"}`} />
            ))}
          </div>
        </div>

        {!won && !gameOver ? (
          <div className="flex gap-2">
            <input
              type="number" min={1} max={100} value={guess}
              onChange={e => setGuess(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submit()}
              className="flex-1 bg-slate-700 border border-slate-600 text-white rounded-xl px-3 py-2 text-lg font-bold text-center focus:outline-none focus:border-yellow-400"
              placeholder="1-100"
            />
            <button onClick={submit} className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-black rounded-xl hover:brightness-110 transition">Go!</button>
          </div>
        ) : (
          <div className={`text-center py-4 rounded-xl ${won ? "bg-green-900/40" : "bg-red-900/40"}`}>
            <p className="text-3xl mb-1">{won ? "🎉" : "💀"}</p>
            <p className="font-black text-white text-lg">{won ? "You got it!" : "Game Over!"}</p>
            <p className="text-slate-400 text-sm">The number was <span className="text-yellow-400 font-black">{target}</span></p>
            <button onClick={reset} className="mt-3 px-4 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl text-sm">Play Again</button>
          </div>
        )}
      </div>

      <div className="w-full space-y-2 max-h-60 overflow-y-auto">
        {history.map((h, i) => (
          <div key={i} className="flex items-center justify-between bg-slate-800 rounded-xl px-4 py-2 border border-slate-700">
            <span className="text-white font-black text-lg">{h.val}</span>
            <span className="text-sm">{h.hint}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
