import { useState, useCallback } from "react";

const N = 3;
const TOTAL = N * N;

function isSolvable(tiles: number[]): boolean {
  const arr = tiles.filter(x => x !== 0);
  let inv = 0;
  for (let i = 0; i < arr.length; i++)
    for (let j = i + 1; j < arr.length; j++)
      if (arr[i] > arr[j]) inv++;
  return inv % 2 === 0;
}

function shuffleTiles(): number[] {
  let arr: number[];
  do {
    arr = Array.from({length: TOTAL}, (_, i) => i).sort(() => Math.random() - 0.5);
  } while (!isSolvable(arr) || arr.every((v,i) => v===i));
  return arr;
}

const GOAL = Array.from({length: TOTAL}, (_, i) => (i + 1) % TOTAL);

export default function SliderPuzzle() {
  const [tiles, setTiles] = useState<number[]>(shuffleTiles);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  const click = useCallback((idx: number) => {
    if (won) return;
    const blankIdx = tiles.indexOf(0);
    const r = Math.floor(idx / N), c = idx % N;
    const br = Math.floor(blankIdx / N), bc = blankIdx % N;
    if (Math.abs(r - br) + Math.abs(c - bc) !== 1) return;
    const newTiles = [...tiles];
    [newTiles[idx], newTiles[blankIdx]] = [newTiles[blankIdx], newTiles[idx]];
    const isWon = newTiles.every((v, i) => v === GOAL[i]);
    setTiles(newTiles);
    setMoves(m => m + 1);
    if (isWon) setWon(true);
  }, [tiles, won]);

  const reset = () => { setTiles(shuffleTiles()); setMoves(0); setWon(false); };

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-sm mx-auto p-4">
      <h2 className="text-2xl font-black text-white">🔢 Slider Puzzle</h2>
      <p className="text-slate-400 text-sm text-center">Arrange numbers 1–8 in order. Slide tiles into the empty space!</p>

      <div className="flex gap-4 text-center">
        <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 min-w-[80px]">
          <p className="text-2xl font-black text-yellow-400">{moves}</p>
          <p className="text-slate-400 text-xs">Moves</p>
        </div>
      </div>

      {won && (
        <div className="bg-green-900/40 border border-green-500/40 rounded-2xl p-4 text-center w-full">
          <p className="text-3xl mb-1">🎉</p>
          <p className="text-white font-black text-xl">Puzzle Solved in {moves} moves!</p>
          <button onClick={reset} className="mt-3 px-5 py-2 bg-green-600 text-white font-bold rounded-xl text-sm">New Game</button>
        </div>
      )}

      <div className="grid gap-2" style={{gridTemplateColumns: `repeat(${N}, 1fr)`}}>
        {tiles.map((tile, idx) => (
          <button key={idx} onClick={() => click(idx)}
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl font-black text-2xl sm:text-3xl transition-all duration-150 border-2 ${
              tile === 0
                ? "bg-slate-900 border-slate-800 cursor-default"
                : "bg-gradient-to-br from-indigo-600 to-purple-700 border-indigo-400/60 text-white hover:brightness-110 active:scale-95 shadow-lg"
            }`}>
            {tile !== 0 ? tile : ""}
          </button>
        ))}
      </div>

      <button onClick={reset} className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black rounded-xl hover:brightness-110 transition">Shuffle</button>
    </div>
  );
}
