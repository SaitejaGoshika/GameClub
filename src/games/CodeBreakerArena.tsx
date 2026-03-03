import { useState, useCallback } from "react";

const COLORS = ["🔴","🟠","🟡","🟢","🔵","🟣"];
const CODE_LEN = 4;
const MAX_TRIES = 8;

function genCode(): string[] {
  return Array.from({length: CODE_LEN}, () => COLORS[Math.floor(Math.random()*COLORS.length)]);
}

function checkGuess(guess: string[], code: string[]): {black: number, white: number} {
  let black = 0, white = 0;
  const codeLeft: string[] = [];
  const guessLeft: string[] = [];
  for (let i = 0; i < CODE_LEN; i++) {
    if (guess[i] === code[i]) black++;
    else { codeLeft.push(code[i]); guessLeft.push(guess[i]); }
  }
  for (const g of guessLeft) {
    const idx = codeLeft.indexOf(g);
    if (idx !== -1) { white++; codeLeft.splice(idx, 1); }
  }
  return { black, white };
}

type Row = { guess: string[]; black: number; white: number };

export default function CodeBreakerArena() {
  const [code, setCode] = useState<string[]>(genCode());
  const [current, setCurrent] = useState<string[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);

  const addColor = (c: string) => {
    if (current.length < CODE_LEN && !won && !lost) setCurrent([...current, c]);
  };
  const removeLast = () => setCurrent(current.slice(0, -1));

  const submit = () => {
    if (current.length !== CODE_LEN) return;
    const result = checkGuess(current, code);
    const newRows = [...rows, { guess: current, ...result }];
    setRows(newRows);
    setCurrent([]);
    if (result.black === CODE_LEN) { setWon(true); return; }
    if (newRows.length >= MAX_TRIES) setLost(true);
  };

  const restart = useCallback(() => {
    setCode(genCode());
    setCurrent([]);
    setRows([]);
    setWon(false);
    setLost(false);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto p-2">
      <div className="text-center">
        <h2 className="text-xl font-black text-orange-300">🔐 CodeBreaker Arena</h2>
        <p className="text-slate-400 text-xs">Crack the 4-color code in {MAX_TRIES} tries!</p>
        <p className="text-slate-500 text-xs mt-1">⚫ = right color+pos | ⚪ = right color wrong pos</p>
      </div>

      {/* Guess Board */}
      <div className="w-full flex flex-col gap-1.5">
        {Array.from({length: MAX_TRIES}).map((_, rowIdx) => {
          const row = rows[rowIdx];
          const isCurrent = rowIdx === rows.length && !won && !lost;
          return (
            <div key={rowIdx} className={`flex items-center gap-2 p-2 rounded-xl border ${isCurrent ? "border-orange-500/60 bg-orange-900/10" : "border-slate-800 bg-slate-900/50"}`}>
              <div className="flex gap-1.5 flex-1">
                {Array.from({length: CODE_LEN}).map((_, ci) => (
                  <div key={ci} className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl border ${row ? "border-slate-600 bg-slate-800" : isCurrent ? current[ci] ? "border-orange-400 bg-slate-800" : "border-slate-700 bg-slate-800/50" : "border-slate-800 bg-slate-900"}`}>
                    {row ? row.guess[ci] : isCurrent ? (current[ci] || "") : ""}
                  </div>
                ))}
              </div>
              <div className="flex gap-1 flex-wrap w-16 justify-center">
                {row ? (
                  <>
                    {Array.from({length: row.black}).map((_, i) => <div key={`b${i}`} className="w-3 h-3 rounded-full bg-slate-900 border-2 border-slate-400"/>)}
                    {Array.from({length: row.white}).map((_, i) => <div key={`w${i}`} className="w-3 h-3 rounded-full bg-white/80"/>)}
                    {Array.from({length: CODE_LEN - row.black - row.white}).map((_, i) => <div key={`e${i}`} className="w-3 h-3 rounded-full bg-slate-700"/>)}
                  </>
                ) : <div className="w-3 h-3 rounded-full bg-slate-800"/>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Color Picker */}
      {!won && !lost && (
        <div className="w-full">
          <div className="grid grid-cols-6 gap-2 mb-3">
            {COLORS.map(c => (
              <button key={c} onClick={() => addColor(c)}
                className="text-2xl h-10 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 transition active:scale-95">
                {c}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={removeLast} className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-sm transition">
              ← Delete
            </button>
            <button onClick={submit} disabled={current.length !== CODE_LEN}
              className="flex-1 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition">
              Submit ✓
            </button>
          </div>
        </div>
      )}

      {(won || lost) && (
        <div className={`w-full rounded-2xl p-4 text-center border ${won ? "bg-green-900/30 border-green-500/40" : "bg-red-900/30 border-red-500/40"}`}>
          {won ? <p className="text-green-300 text-xl font-black">🎉 Code Cracked! ({rows.length}/{MAX_TRIES} tries)</p>
                : <p className="text-red-300 text-xl font-black">💥 Failed! Code was: {code.join("")}</p>}
          <button onClick={restart} className="mt-3 px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition">
            New Code
          </button>
        </div>
      )}
    </div>
  );
}
