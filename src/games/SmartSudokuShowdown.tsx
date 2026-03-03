import { useState, useEffect, useCallback } from "react";

// 4x4 Sudoku for speed-battle format
const PUZZLES_4x4 = [
  { puzzle: [1,0,3,4, 0,4,0,2, 4,0,2,0, 0,2,4,0], solution: [1,2,3,4, 3,4,1,2, 4,1,2,3, 2,3,4,1] },
  { puzzle: [0,2,0,4, 4,0,2,0, 0,4,0,2, 2,0,4,0], solution: [1,2,3,4, 4,3,2,1, 3,4,1,2, 2,1,4,3] },
  { puzzle: [2,0,4,0, 0,4,0,2, 4,0,2,0, 0,2,0,4], solution: [2,1,4,3, 3,4,1,2, 4,3,2,1, 1,2,3,4] },
];

export default function SmartSudokuShowdown() {
  const [pIdx, setPIdx] = useState(0);
  const puzzle = PUZZLES_4x4[pIdx % PUZZLES_4x4.length];
  const [grid, setGrid] = useState<number[]>([...puzzle.puzzle]);
  const [selected, setSelected] = useState<number|null>(null);
  const [errors, setErrors] = useState<Set<number>>(new Set());
  const [solved, setSolved] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90);
  const [p1Time, setP1Time] = useState<number|null>(null);
  const [p1Done, setP1Done] = useState(false);
  const [currentP, setCurrentP] = useState<1|2>(1);
  const [, setP2Grid] = useState<number[]>([...puzzle.puzzle]);
  const [winner, setWinner] = useState<string|null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started || solved || winner) return;
    if (timeLeft <= 0) { setWinner("Time's up! Draw!"); return; }
    const t = setTimeout(() => setTimeLeft(l=>l-1), 1000);
    return () => clearTimeout(t);
  }, [started, solved, winner, timeLeft]);

  const checkSolved = useCallback((g: number[], sol: number[]): boolean => {
    return g.every((v,i) => v === sol[i]);
  }, []);

  const handleInput = (val: number) => {
    if (selected === null || puzzle.puzzle[selected] !== 0 || solved) return;
    const ng = [...grid];
    ng[selected] = val;
    const newErrors = new Set<number>();
    ng.forEach((v,i) => { if (v !== 0 && v !== puzzle.solution[i]) newErrors.add(i); });
    setErrors(newErrors);
    setGrid(ng);
    if (checkSolved(ng, puzzle.solution)) {
      if (currentP === 1 && !p1Done) {
        setP1Time(90 - timeLeft);
        setP1Done(true);
        // switch to P2
        setCurrentP(2);
        setGrid([...puzzle.puzzle]);
        setSelected(null); setErrors(new Set()); setTimeLeft(90);
      } else {
        const p2Time = 90 - timeLeft;
        const pt1 = p1Time || 999;
        if (!p1Done) { setWinner("P2 wins! P1 gave up."); }
        else setWinner(pt1 < p2Time ? `P1 Wins! (${pt1}s vs ${p2Time}s)` : p2Time < pt1 ? `P2 Wins! (${p2Time}s vs ${pt1}s)` : "Draw!");
        setSolved(true);
      }
    }
  };

  const start = () => { setStarted(true); setTimeLeft(90); };

  const nextPuzzle = () => {
    const ni = pIdx+1;
    const np = PUZZLES_4x4[ni % PUZZLES_4x4.length];
    setPIdx(ni); setGrid([...np.puzzle]); setP2Grid([...np.puzzle]);
    setSelected(null); setErrors(new Set()); setSolved(false);
    setP1Time(null); setP1Done(false); setCurrentP(1);
    setWinner(null); setStarted(false); setTimeLeft(90);
  };

  const boxBorder = (i: number) => {
    const r = Math.floor(i/4), c = i%4;
    const borders: string[] = [];
    if (r%2===0) borders.push("border-t-2 border-t-slate-500");
    if (c%2===0) borders.push("border-l-2 border-l-slate-500");
    return borders.join(" ");
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-xs mx-auto p-2">
      <div className="text-center">
        <h2 className="text-xl font-black text-indigo-300">🔣 Smart Sudoku Showdown</h2>
        <p className="text-slate-400 text-xs">Race to solve the 4×4 Sudoku! P1 goes first, then P2. Fastest wins!</p>
      </div>

      {!started ? (
        <button onClick={start} className="px-8 py-3 bg-indigo-700 hover:bg-indigo-600 text-white font-black rounded-2xl text-lg transition">
          Start Race! 🏁
        </button>
      ) : (
        <>
          <div className="flex justify-between w-full items-center">
            <div className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${currentP===1?"bg-blue-900/40 border-blue-500/40 text-blue-300":"bg-red-900/40 border-red-500/40 text-red-300"}`}>
              P{currentP}'s Turn
            </div>
            <div className={`text-xl font-black ${timeLeft<=20?"text-red-400":"text-green-400"}`}>{timeLeft}s</div>
            {p1Done && <div className="text-xs text-slate-400">P1: {p1Time}s</div>}
          </div>

          <div className="grid grid-cols-4 gap-1 bg-slate-900 border-2 border-slate-500 rounded-xl p-2">
            {grid.map((val,i) => {
              const isFixed = puzzle.puzzle[i] !== 0;
              const isError = errors.has(i);
              const isSelected = selected === i;
              return (
                <button key={i} onClick={() => !isFixed && setSelected(i)}
                  className={`w-12 h-12 rounded-lg border text-xl font-black transition-all ${boxBorder(i)}
                    ${isFixed?"bg-slate-700 border-slate-600 text-slate-300 cursor-default":
                      isSelected?"bg-indigo-700 border-indigo-400 text-white":
                      isError?"bg-red-900/50 border-red-600 text-red-300":
                      "bg-slate-800 border-slate-700 text-indigo-300 hover:border-indigo-500 cursor-pointer"}`}>
                  {val || ""}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2">
            {[1,2,3,4].map(n=>(
              <button key={n} onClick={() => handleInput(n)} disabled={solved||!!winner}
                className="w-12 h-12 rounded-xl border-2 border-indigo-600 bg-indigo-900/40 text-indigo-300 font-black text-xl hover:bg-indigo-800 transition active:scale-90">
                {n}
              </button>
            ))}
            <button onClick={() => handleInput(0)} disabled={solved||!!winner}
              className="w-12 h-12 rounded-xl border-2 border-slate-600 bg-slate-800 text-slate-400 font-black text-sm hover:bg-slate-700 transition active:scale-90">
              ✗
            </button>
          </div>
        </>
      )}

      {winner && (
        <div className="w-full bg-green-900/30 border border-green-500/40 rounded-2xl p-4 text-center">
          <p className="text-green-300 text-xl font-black">{winner}</p>
          <button onClick={nextPuzzle} className="mt-2 px-6 py-2 bg-indigo-700 hover:bg-indigo-600 text-white font-bold rounded-xl transition">Next Puzzle →</button>
        </div>
      )}
    </div>
  );
}
