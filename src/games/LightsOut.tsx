import { useState, useCallback } from "react";

const SIZE = 5;

function randomBoard(): boolean[][] {
  const board: boolean[][] = Array.from({length: SIZE}, () => Array(SIZE).fill(false));
  for (let i = 0; i < 10; i++) {
    const r = Math.floor(Math.random() * SIZE);
    const c = Math.floor(Math.random() * SIZE);
    toggle(board, r, c);
  }
  return board;
}

function toggle(board: boolean[][], r: number, c: number) {
  const dirs = [[0,0],[1,0],[-1,0],[0,1],[0,-1]];
  for (const [dr,dc] of dirs) {
    const nr = r+dr, nc = c+dc;
    if (nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE) board[nr][nc] = !board[nr][nc];
  }
}

export default function LightsOut() {
  const [board, setBoard] = useState<boolean[][]>(randomBoard);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  const click = useCallback((r: number, c: number) => {
    if (won) return;
    const newBoard = board.map(row => [...row]);
    toggle(newBoard, r, c);
    const isWon = newBoard.every(row => row.every(cell => !cell));
    setBoard(newBoard);
    setMoves(m => m + 1);
    if (isWon) setWon(true);
  }, [board, won]);

  const reset = () => { setBoard(randomBoard()); setMoves(0); setWon(false); };

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-sm mx-auto p-4">
      <h2 className="text-2xl font-black text-white">💡 Lights Out</h2>
      <p className="text-slate-400 text-sm text-center">Turn off all lights! Clicking a cell toggles it and its neighbors.</p>

      <div className="flex gap-4 text-center">
        <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 min-w-[80px]">
          <p className="text-2xl font-black text-yellow-400">{moves}</p>
          <p className="text-slate-400 text-xs">Moves</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 min-w-[80px]">
          <p className="text-2xl font-black text-cyan-400">{board.flat().filter(Boolean).length}</p>
          <p className="text-slate-400 text-xs">Lights On</p>
        </div>
      </div>

      {won && (
        <div className="bg-yellow-900/40 border border-yellow-500/40 rounded-2xl p-4 text-center w-full animate-bounce">
          <p className="text-3xl mb-1">🏆</p>
          <p className="text-white font-black text-xl">All lights out in {moves} moves!</p>
          <button onClick={reset} className="mt-3 px-5 py-2 bg-yellow-600 text-white font-bold rounded-xl text-sm">New Puzzle</button>
        </div>
      )}

      <div className="grid gap-2" style={{gridTemplateColumns: `repeat(${SIZE}, 1fr)`}}>
        {board.map((row, r) =>
          row.map((cell, c) => (
            <button key={`${r}-${c}`} onClick={() => click(r,c)}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 transition-all duration-150 font-black text-2xl ${
                cell
                  ? "bg-yellow-400 border-yellow-300 shadow-lg shadow-yellow-400/50"
                  : "bg-slate-800 border-slate-700 hover:border-slate-500"
              }`}
              style={cell ? {boxShadow: "0 0 20px rgba(250,204,21,0.6)"} : {}}>
              {cell ? "💡" : "⬛"}
            </button>
          ))
        )}
      </div>

      <button onClick={reset} className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-black rounded-xl hover:brightness-110 transition">New Puzzle</button>
    </div>
  );
}
