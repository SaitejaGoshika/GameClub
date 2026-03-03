import { useState, useEffect, useCallback } from "react";

type Board = number[][];

const SIZE = 4;

function createEmpty(): Board {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function addRandom(board: Board): Board {
  const empty: [number, number][] = [];
  board.forEach((row, r) => row.forEach((v, c) => { if (!v) empty.push([r, c]); }));
  if (!empty.length) return board;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const nb = board.map(row => [...row]);
  nb[r][c] = Math.random() < 0.9 ? 2 : 4;
  return nb;
}

function initBoard(): Board {
  return addRandom(addRandom(createEmpty()));
}

function slideRow(row: number[]): { row: number[]; score: number } {
  const filtered = row.filter(v => v !== 0);
  let score = 0;
  const merged: number[] = [];
  let i = 0;
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      merged.push(filtered[i] * 2);
      score += filtered[i] * 2;
      i += 2;
    } else {
      merged.push(filtered[i]);
      i++;
    }
  }
  while (merged.length < SIZE) merged.push(0);
  return { row: merged, score };
}

function move(board: Board, dir: string): { board: Board; score: number; moved: boolean } {
  let b = board.map(r => [...r]);
  let total = 0;
  let moved = false;

  if (dir === "left") {
    b = b.map(row => {
      const { row: nr, score } = slideRow(row);
      total += score;
      if (nr.join() !== row.join()) moved = true;
      return nr;
    });
  } else if (dir === "right") {
    b = b.map(row => {
      const { row: nr, score } = slideRow([...row].reverse());
      total += score;
      const reversed = nr.reverse();
      if (reversed.join() !== row.join()) moved = true;
      return reversed;
    });
  } else if (dir === "up") {
    for (let c = 0; c < SIZE; c++) {
      const col = b.map(r => r[c]);
      const { row: nc, score } = slideRow(col);
      total += score;
      if (nc.join() !== col.join()) moved = true;
      nc.forEach((v, r) => { b[r][c] = v; });
    }
  } else if (dir === "down") {
    for (let c = 0; c < SIZE; c++) {
      const col = b.map(r => r[c]).reverse();
      const { row: nc, score } = slideRow(col);
      total += score;
      const reversed = nc.reverse();
      if (reversed.join() !== b.map(r => r[c]).join()) moved = true;
      reversed.forEach((v, r) => { b[r][c] = v; });
    }
  }
  return { board: b, score: total, moved };
}

function isGameOver(board: Board): boolean {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (!board[r][c]) return false;
      if (c + 1 < SIZE && board[r][c] === board[r][c + 1]) return false;
      if (r + 1 < SIZE && board[r][c] === board[r + 1][c]) return false;
    }
  return true;
}

const TILE_COLORS: Record<number, string> = {
  0: "bg-slate-800 text-transparent",
  2: "bg-yellow-100 text-slate-800",
  4: "bg-yellow-200 text-slate-800",
  8: "bg-orange-300 text-white",
  16: "bg-orange-400 text-white",
  32: "bg-orange-500 text-white",
  64: "bg-red-500 text-white",
  128: "bg-yellow-400 text-white",
  256: "bg-yellow-500 text-white",
  512: "bg-yellow-600 text-white",
  1024: "bg-yellow-700 text-white",
  2048: "bg-green-500 text-white",
};

function getTileColor(v: number) {
  return TILE_COLORS[v] || "bg-purple-600 text-white";
}

export default function Game2048() {
  const [board, setBoard] = useState<Board>(initBoard);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [over, setOver] = useState(false);
  const [won, setWon] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const handleMove = useCallback((dir: string) => {
    if (over) return;
    setBoard(prev => {
      const { board: nb, score: gained, moved } = move(prev, dir);
      if (!moved) return prev;
      const withNew = addRandom(nb);
      setScore(s => {
        const ns = s + gained;
        setBest(b => Math.max(b, ns));
        return ns;
      });
      if (withNew.some(row => row.includes(2048))) setWon(true);
      if (isGameOver(withNew)) setOver(true);
      return withNew;
    });
  }, [over]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, string> = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down" };
      if (map[e.key]) { e.preventDefault(); handleMove(map[e.key]); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleMove]);

  const restart = () => { setBoard(initBoard()); setScore(0); setOver(false); setWon(false); };

  return (
    <div className="flex flex-col items-center gap-4 w-full select-none">
      <div className="flex items-center justify-between w-full max-w-xs">
        <div className="text-center">
          <p className="text-xs text-slate-400 uppercase tracking-widest">Score</p>
          <p className="text-2xl font-black text-yellow-400">{score}</p>
        </div>
        <div className="text-3xl font-black text-slate-300">2048</div>
        <div className="text-center">
          <p className="text-xs text-slate-400 uppercase tracking-widest">Best</p>
          <p className="text-2xl font-black text-orange-400">{best}</p>
        </div>
      </div>

      <div
        className="bg-slate-700 rounded-xl p-2 grid gap-2 touch-none"
        style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}
        onTouchStart={e => setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY })}
        onTouchEnd={e => {
          if (!touchStart) return;
          const dx = e.changedTouches[0].clientX - touchStart.x;
          const dy = e.changedTouches[0].clientY - touchStart.y;
          if (Math.abs(dx) > Math.abs(dy)) handleMove(dx > 0 ? "right" : "left");
          else handleMove(dy > 0 ? "down" : "up");
          setTouchStart(null);
        }}
      >
        {board.flat().map((v, i) => (
          <div key={i} className={`w-16 h-16 rounded-lg flex items-center justify-center font-black text-lg transition-all ${getTileColor(v)}`}>
            {v || ""}
          </div>
        ))}
      </div>

      {(over || won) && (
        <div className="text-center">
          <p className={`text-2xl font-black mb-2 ${won ? "text-green-400" : "text-red-400"}`}>
            {won ? "🎉 You Win!" : "💀 Game Over!"}
          </p>
          <button onClick={restart} className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-black rounded-xl transition">
            New Game
          </button>
        </div>
      )}

      {!over && !won && (
        <div className="grid grid-cols-3 gap-2 mt-2">
          <div />
          <button onClick={() => handleMove("up")} className="bg-slate-700 hover:bg-slate-600 rounded-lg p-3 text-xl font-bold transition">↑</button>
          <div />
          <button onClick={() => handleMove("left")} className="bg-slate-700 hover:bg-slate-600 rounded-lg p-3 text-xl font-bold transition">←</button>
          <button onClick={() => handleMove("down")} className="bg-slate-700 hover:bg-slate-600 rounded-lg p-3 text-xl font-bold transition">↓</button>
          <button onClick={() => handleMove("right")} className="bg-slate-700 hover:bg-slate-600 rounded-lg p-3 text-xl font-bold transition">→</button>
        </div>
      )}

      <button onClick={restart} className="text-sm text-slate-500 hover:text-slate-300 transition underline">
        Restart
      </button>
    </div>
  );
}
