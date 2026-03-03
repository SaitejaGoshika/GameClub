import { useState, useCallback } from "react";

const COLORS = ["#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#a855f7"];
const COLOR_NAMES = ["Red","Orange","Yellow","Green","Blue","Purple"];
const SIZE = 12;

function makeGrid() {
  return Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => Math.floor(Math.random() * COLORS.length))
  );
}

function flood(grid: number[][], color: number): number[][] {
  const newGrid = grid.map(r => [...r]);
  const startColor = newGrid[0][0];
  if (startColor === color) return newGrid;
  const stack = [[0, 0]];
  const visited = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
  visited[0][0] = true;
  while (stack.length > 0) {
    const [r, c] = stack.pop()!;
    if (newGrid[r][c] === startColor) {
      newGrid[r][c] = color;
      [[r-1,c],[r+1,c],[r,c-1],[r,c+1]].forEach(([nr,nc]) => {
        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && !visited[nr][nc] && (newGrid[nr][nc] === startColor || newGrid[nr][nc] === color)) {
          visited[nr][nc] = true;
          stack.push([nr, nc]);
        }
      });
    }
  }
  return newGrid;
}

function countConnected(grid: number[][]): number {
  const target = grid[0][0];
  let count = 0;
  const visited = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
  const stack = [[0, 0]];
  visited[0][0] = true;
  while (stack.length > 0) {
    const [r, c] = stack.pop()!;
    if (grid[r][c] === target) {
      count++;
      [[r-1,c],[r+1,c],[r,c-1],[r,c+1]].forEach(([nr,nc]) => {
        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && !visited[nr][nc]) {
          visited[nr][nc] = true;
          stack.push([nr, nc]);
        }
      });
    }
  }
  return count;
}

export default function ColorFlood() {
  const [grid, setGrid] = useState<number[][]>(() => makeGrid());
  const [moves, setMoves] = useState(0);
  const MAX_MOVES = 25;
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem("cf_best") || 0));

  const total = SIZE * SIZE;
  const connected = countConnected(grid);
  const pct = Math.round((connected / total) * 100);

  const reset = useCallback(() => {
    setGrid(makeGrid());
    setMoves(0);
    setWon(false);
    setLost(false);
    setScore(0);
  }, []);

  const pick = useCallback((colorIdx: number) => {
    if (won || lost) return;
    const newGrid = flood(grid, colorIdx);
    const newMoves = moves + 1;
    setGrid(newGrid);
    setMoves(newMoves);
    const conn = countConnected(newGrid);
    if (conn === total) {
      const pts = (MAX_MOVES - newMoves + 1) * 100;
      setScore(pts);
      setWon(true);
      if (pts > best) { setBest(pts); localStorage.setItem("cf_best", String(pts)); }
    } else if (newMoves >= MAX_MOVES) {
      setLost(true);
    }
  }, [grid, moves, won, lost, total, best]);

  const cellSize = Math.floor(Math.min(300, typeof window !== "undefined" ? window.innerWidth - 80 : 280) / SIZE);

  return (
    <div className="flex flex-col items-center gap-4 w-full select-none">
      <div className="text-center">
        <h2 className="text-2xl font-black text-white">🌊 Color Flood</h2>
        <p className="text-slate-400 text-xs mt-1">Flood-fill the entire board from top-left in {MAX_MOVES} moves!</p>
      </div>
      <div className="flex gap-3 text-sm">
        {[
          { label: "Moves", value: `${moves}/${MAX_MOVES}`, color: "text-yellow-400" },
          { label: "Flooded", value: `${pct}%`, color: "text-green-400" },
          { label: "Best", value: best, color: "text-purple-400" },
        ].map(s => (
          <div key={s.label} className="bg-slate-800 rounded-xl px-3 py-1.5 text-center border border-slate-700">
            <p className={`font-black ${s.color}`}>{s.value}</p>
            <p className="text-slate-500 text-xs">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="w-full max-w-xs bg-slate-800 rounded-full h-2 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
          style={{ width: `${pct}%` }} />
      </div>
      <div className="rounded-xl overflow-hidden border-2 border-slate-700 shadow-2xl"
        style={{ display: "grid", gridTemplateColumns: `repeat(${SIZE}, ${cellSize}px)` }}>
        {grid.map((row, r) => row.map((c, col) => (
          <div key={`${r}-${col}`}
            style={{ width: cellSize, height: cellSize, backgroundColor: COLORS[c], transition: "background-color 0.2s" }} />
        )))}
      </div>
      <div className="flex gap-2 flex-wrap justify-center">
        {COLORS.map((color, i) => (
          <button key={i} onClick={() => pick(i)}
            disabled={won || lost || grid[0][0] === i}
            className="w-12 h-12 rounded-xl border-2 border-white/20 transition-all active:scale-90 hover:scale-110 hover:border-white/60 disabled:opacity-40 disabled:scale-100 font-bold text-xs text-white shadow-lg"
            style={{ backgroundColor: color, boxShadow: grid[0][0] === i ? `0 0 12px ${color}` : "none" }}
            title={COLOR_NAMES[i]}>
            {grid[0][0] === i ? "✓" : ""}
          </button>
        ))}
      </div>
      {(won || lost) && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl p-8 text-center max-w-xs w-full">
            {won ? (
              <>
                <p className="text-5xl mb-3">🏆</p>
                <h3 className="text-2xl font-black text-green-400 mb-1">You Won!</h3>
                <p className="text-yellow-400 font-bold text-xl mb-1">{score} pts</p>
                <p className="text-slate-400 text-sm mb-4">Completed in {moves} moves!</p>
              </>
            ) : (
              <>
                <p className="text-5xl mb-3">😢</p>
                <h3 className="text-2xl font-black text-red-400 mb-1">Out of Moves!</h3>
                <p className="text-slate-400 text-sm mb-4">{pct}% flooded — so close!</p>
              </>
            )}
            <button onClick={reset}
              className="bg-gradient-to-r from-violet-600 to-purple-600 text-white font-black px-8 py-3 rounded-xl text-lg hover:brightness-110 transition">
              Play Again
            </button>
          </div>
        </div>
      )}
      <button onClick={reset} className="text-slate-500 text-xs hover:text-slate-300 transition underline">New Game</button>
    </div>
  );
}
