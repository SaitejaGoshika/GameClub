import { useState, useCallback } from "react";

type Cell = { mine: boolean; revealed: boolean; flagged: boolean; count: number };
type Board = Cell[][];

const LEVELS = {
  Easy: { rows: 9, cols: 9, mines: 10 },
  Medium: { rows: 16, cols: 16, mines: 40 },
  Hard: { rows: 9, cols: 30, mines: 99 },
};
type Level = keyof typeof LEVELS;

function createBoard(rows: number, cols: number, mines: number, skipR: number, skipC: number): Board {
  const board: Board = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ mine: false, revealed: false, flagged: false, count: 0 }))
  );
  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (!board[r][c].mine && !(Math.abs(r - skipR) <= 1 && Math.abs(c - skipC) <= 1)) {
      board[r][c].mine = true;
      placed++;
    }
  }
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (board[r][c].mine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].mine) count++;
        }
      board[r][c].count = count;
    }
  return board;
}

function reveal(board: Board, r: number, c: number, rows: number, cols: number): Board {
  const nb = board.map(row => row.map(cell => ({ ...cell })));
  const stack: [number, number][] = [[r, c]];
  while (stack.length) {
    const [cr, cc] = stack.pop()!;
    if (cr < 0 || cr >= rows || cc < 0 || cc >= cols) continue;
    const cell = nb[cr][cc];
    if (cell.revealed || cell.flagged) continue;
    cell.revealed = true;
    if (cell.count === 0 && !cell.mine)
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++)
          stack.push([cr + dr, cc + dc]);
  }
  return nb;
}

const numColors = ["", "text-blue-400", "text-green-400", "text-red-400", "text-purple-500", "text-red-700", "text-cyan-400", "text-black", "text-slate-500"];

export default function Minesweeper() {
  const [level, setLevel] = useState<Level>("Easy");
  const [board, setBoard] = useState<Board | null>(null);
  const [_started, setStarted] = useState(false);
  const [over, setOver] = useState(false);
  const [won, setWon] = useState(false);
  const [flags, setFlags] = useState(0);
  const [time, setTime] = useState(0);
  const [timer, setTimer] = useState<ReturnType<typeof setInterval> | null>(null);

  const { rows, cols, mines } = LEVELS[level];

  const startTimer = useCallback(() => {
    const t = setInterval(() => setTime(p => p + 1), 1000);
    setTimer(t);
    return t;
  }, []);

  const stopTimer = useCallback(() => { if (timer) clearInterval(timer); }, [timer]);

  const reset = () => {
    stopTimer();
    setBoard(null);
    setStarted(false);
    setOver(false);
    setWon(false);
    setFlags(0);
    setTime(0);
    setTimer(null);
  };

  const checkWin = (b: Board) => {
    return b.every(row => row.every(cell => cell.revealed || cell.mine));
  };

  const handleClick = (r: number, c: number) => {
    if (over || won) return;
    let b = board;
    if (!b) {
      b = createBoard(rows, cols, mines, r, c);
      setBoard(b);
      setStarted(true);
      startTimer();
    }
    if (b[r][c].flagged || b[r][c].revealed) return;
    if (b[r][c].mine) {
      const nb = b.map(row => row.map(cell => ({ ...cell, revealed: cell.mine ? true : cell.revealed })));
      setBoard(nb);
      setOver(true);
      stopTimer();
      return;
    }
    const nb = reveal(b, r, c, rows, cols);
    setBoard(nb);
    if (checkWin(nb)) { setWon(true); stopTimer(); }
  };

  const handleFlag = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (!board || over || won) return;
    if (board[r][c].revealed) return;
    const nb = board.map(row => row.map(cell => ({ ...cell })));
    nb[r][c].flagged = !nb[r][c].flagged;
    setFlags(f => nb[r][c].flagged ? f + 1 : f - 1);
    setBoard(nb);
  };

  const cellSize = cols > 16 ? "w-7 h-7 text-xs" : cols > 9 ? "w-8 h-8 text-xs" : "w-9 h-9 text-sm";

  return (
    <div className="flex flex-col items-center gap-4 w-full select-none">
      <div className="flex items-center gap-3 flex-wrap justify-center">
        {(Object.keys(LEVELS) as Level[]).map(l => (
          <button key={l} onClick={() => { setLevel(l); reset(); }}
            className={`px-4 py-1.5 rounded-lg font-bold text-sm transition border ${level === l ? "bg-red-600 border-red-500 text-white" : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"}`}>
            {l}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between w-full max-w-sm">
        <div className="flex items-center gap-1.5 text-red-400 font-black text-lg">🚩 {mines - flags}</div>
        <button onClick={reset} className="text-2xl hover:scale-110 transition">{won ? "😎" : over ? "😵" : "🙂"}</button>
        <div className="flex items-center gap-1.5 text-yellow-400 font-black text-lg">⏱ {time}s</div>
      </div>

      <div className="overflow-auto max-w-full">
        <div className="inline-block bg-slate-700 p-1.5 rounded-xl" style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "2px" }}>
          {Array.from({ length: rows }, (_, r) =>
            Array.from({ length: cols }, (_, c) => {
              const cell = board?.[r]?.[c];
              const revealed = cell?.revealed;
              const flagged = cell?.flagged;
              const isMine = cell?.mine;
              const count = cell?.count ?? 0;
              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleClick(r, c)}
                  onContextMenu={e => handleFlag(e, r, c)}
                  className={`${cellSize} flex items-center justify-center font-black rounded transition
                    ${revealed
                      ? isMine ? "bg-red-600" : "bg-slate-900"
                      : "bg-slate-500 hover:bg-slate-400 active:bg-slate-600"
                    }`}
                >
                  {flagged && !revealed ? "🚩" : revealed ? (isMine ? "💣" : count > 0 ? <span className={numColors[count]}>{count}</span> : "") : ""}
                </button>
              );
            })
          )}
        </div>
      </div>

      {(won || over) && (
        <p className={`text-xl font-black ${won ? "text-green-400" : "text-red-400"}`}>
          {won ? "🎉 You Won!" : "💥 Boom! Game Over!"}
        </p>
      )}

      <p className="text-slate-500 text-xs">Right-click / long-press to flag</p>
    </div>
  );
}
