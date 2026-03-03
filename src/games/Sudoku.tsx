import { useState, useCallback } from "react";

type Grid = (number | null)[][];
type FixedGrid = boolean[][];

function generateSolved(): number[][] {
  const grid: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0));
  fill(grid, 0, 0);
  return grid;
}

function fill(grid: number[][], row: number, col: number): boolean {
  if (row === 9) return true;
  const nextRow = col === 8 ? row + 1 : row;
  const nextCol = col === 8 ? 0 : col + 1;
  const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  for (const n of nums) {
    if (isValid(grid, row, col, n)) {
      grid[row][col] = n;
      if (fill(grid, nextRow, nextCol)) return true;
      grid[row][col] = 0;
    }
  }
  return false;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isValid(grid: number[][], row: number, col: number, n: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === n) return false;
    if (grid[i][col] === n) return false;
  }
  const br = Math.floor(row / 3) * 3, bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r++)
    for (let c = bc; c < bc + 3; c++)
      if (grid[r][c] === n) return false;
  return true;
}

function createPuzzle(solved: number[][], clues: number): { puzzle: Grid; fixed: FixedGrid } {
  const puzzle: Grid = solved.map(row => [...row] as (number | null)[]);
  const fixed: FixedGrid = Array.from({ length: 9 }, () => Array(9).fill(true));
  let removed = 81 - clues;
  while (removed > 0) {
    const r = Math.floor(Math.random() * 9), c = Math.floor(Math.random() * 9);
    if (puzzle[r][c] !== null) { puzzle[r][c] = null; fixed[r][c] = false; removed--; }
  }
  return { puzzle, fixed };
}

const DIFFICULTIES = { Easy: 45, Medium: 35, Hard: 26 };
type Diff = keyof typeof DIFFICULTIES;

function isConflict(grid: Grid, r: number, c: number): boolean {
  const v = grid[r][c];
  if (!v) return false;
  for (let i = 0; i < 9; i++) {
    if (i !== c && grid[r][i] === v) return true;
    if (i !== r && grid[i][c] === v) return true;
  }
  const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
  for (let dr = br; dr < br + 3; dr++)
    for (let dc = bc; dc < bc + 3; dc++)
      if ((dr !== r || dc !== c) && grid[dr][dc] === v) return true;
  return false;
}

export default function Sudoku() {
  const [diff, setDiff] = useState<Diff>("Easy");
  const [solved, setSolved] = useState<number[][] | null>(null);
  const [grid, setGrid] = useState<Grid | null>(null);
  const [fixed, setFixed] = useState<FixedGrid | null>(null);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [won, setWon] = useState(false);

  const newGame = useCallback((d: Diff = diff) => {
    const s = generateSolved();
    const { puzzle, fixed: f } = createPuzzle(s, DIFFICULTIES[d]);
    setSolved(s);
    setGrid(puzzle);
    setFixed(f);
    setSelected(null);
    setWon(false);
  }, [diff]);

  const handleInput = (val: number | null) => {
    if (!selected || !grid || !fixed) return;
    const [r, c] = selected;
    if (fixed[r][c]) return;
    const ng = grid.map(row => [...row]);
    ng[r][c] = val;
    setGrid(ng);
    if (ng.every((row, ri) => row.every((cell, ci) => cell === solved![ri][ci]))) setWon(true);
  };

  const getSameBox = (r: number, c: number) => {
    const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
    return { br, bc };
  };

  const isHighlighted = (r: number, c: number) => {
    if (!selected) return false;
    const [sr, sc] = selected;
    if (r === sr || c === sc) return true;
    const { br, bc } = getSameBox(sr, sc);
    return r >= br && r < br + 3 && c >= bc && c < bc + 3;
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
      <h2 className="text-2xl font-black text-white">🔢 Sudoku</h2>

      {/* Difficulty */}
      <div className="flex gap-2">
        {(Object.keys(DIFFICULTIES) as Diff[]).map(d => (
          <button key={d} onClick={() => { setDiff(d); newGame(d); }}
            className={`px-4 py-1.5 rounded-lg font-bold text-sm transition border ${diff === d && grid ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"}`}>
            {d}
          </button>
        ))}
      </div>

      {!grid ? (
        <button onClick={() => newGame()} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition text-lg">
          ▶ New Game
        </button>
      ) : (
        <>
          {/* Board */}
          <div className="border-2 border-slate-400 rounded-lg overflow-hidden">
            {Array.from({ length: 9 }, (_, r) => (
              <div key={r} className={`flex ${r % 3 === 0 && r !== 0 ? "border-t-2 border-slate-400" : ""}`}>
                {Array.from({ length: 9 }, (_, c) => {
                  const val = grid[r][c];
                  const isFixed = fixed![r][c];
                  const isSel = selected?.[0] === r && selected?.[1] === c;
                  const conflict = !isFixed && isConflict(grid, r, c);
                  const highlighted = isHighlighted(r, c);
                  const sameVal = selected && val && grid[selected[0]][selected[1]] === val;

                  return (
                    <button
                      key={c}
                      onClick={() => setSelected([r, c])}
                      className={`w-9 h-9 flex items-center justify-center text-sm font-bold transition
                        ${c % 3 === 0 && c !== 0 ? "border-l-2 border-slate-400" : "border-l border-slate-700"}
                        ${r % 3 !== 0 ? "border-t border-slate-700" : ""}
                        ${isSel ? "bg-blue-500 text-white" : conflict ? "bg-red-900/60 text-red-300" : sameVal ? "bg-blue-800/60 text-blue-200" : highlighted ? "bg-slate-700" : "bg-slate-900"}
                        ${isFixed ? "text-slate-200" : conflict ? "text-red-300" : "text-blue-400"}
                      `}
                    >
                      {val || ""}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Number pad */}
          <div className="flex gap-2 flex-wrap justify-center">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
              <button key={n} onClick={() => handleInput(n)}
                className="w-9 h-9 rounded-lg bg-slate-700 hover:bg-blue-600 text-white font-black transition">
                {n}
              </button>
            ))}
            <button onClick={() => handleInput(null)}
              className="w-9 h-9 rounded-lg bg-red-900/60 hover:bg-red-700 text-red-300 font-black transition text-xs">
              ✕
            </button>
          </div>

          {won && (
            <div className="text-center">
              <p className="text-2xl font-black text-green-400">🎉 Puzzle Solved!</p>
            </div>
          )}

          <button onClick={() => newGame()} className="text-sm text-slate-500 hover:text-slate-300 transition underline">
            New Puzzle
          </button>
        </>
      )}
    </div>
  );
}
