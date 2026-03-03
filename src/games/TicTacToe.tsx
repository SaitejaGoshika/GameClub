import { useState } from "react";

type Cell = "X" | "O" | null;

const WINS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function checkWinner(board: Cell[]): { winner: Cell; line: number[] } | null {
  for (const [a, b, c] of WINS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  return null;
}

function minimax(board: Cell[], isMax: boolean): number {
  const result = checkWinner(board);
  if (result?.winner === "O") return 10;
  if (result?.winner === "X") return -10;
  if (board.every(Boolean)) return 0;
  if (isMax) {
    let best = -Infinity;
    board.forEach((cell, i) => {
      if (!cell) {
        board[i] = "O";
        best = Math.max(best, minimax(board, false));
        board[i] = null;
      }
    });
    return best;
  } else {
    let best = Infinity;
    board.forEach((cell, i) => {
      if (!cell) {
        board[i] = "X";
        best = Math.min(best, minimax(board, true));
        board[i] = null;
      }
    });
    return best;
  }
}

function bestMove(board: Cell[]): number {
  let best = -Infinity, move = -1;
  board.forEach((cell, i) => {
    if (!cell) {
      board[i] = "O";
      const val = minimax(board, false);
      board[i] = null;
      if (val > best) { best = val; move = i; }
    }
  });
  return move;
}

export default function TicTacToe() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [isX, setIsX] = useState(true);
  const [mode, setMode] = useState<"pvp" | "ai">("ai");
  const [scores, setScores] = useState({ X: 0, O: 0, draw: 0 });

  const result = checkWinner(board);
  const isDraw = !result && board.every(Boolean);

  const handleClick = (i: number) => {
    if (board[i] || result || isDraw) return;
    const next = [...board] as Cell[];
    next[i] = isX ? "X" : "O";
    setBoard(next);
    setIsX(!isX);

    if (mode === "ai" && isX) {
      const aiBoard = [...next] as Cell[];
      const move = bestMove(aiBoard);
      if (move !== -1) {
        setTimeout(() => {
          aiBoard[move] = "O";
          const aiResult = checkWinner(aiBoard);
          setBoard([...aiBoard]);
          setIsX(true);
          if (aiResult) setScores(s => ({ ...s, [aiResult.winner as string]: s[aiResult.winner as "X" | "O"] + 1 }));
          else if (aiBoard.every(Boolean)) setScores(s => ({ ...s, draw: s.draw + 1 }));
        }, 300);
        return;
      }
    }

    const newResult = checkWinner(next);
    if (newResult) setScores(s => ({ ...s, [newResult.winner as string]: s[newResult.winner as "X" | "O"] + 1 }));
    else if (next.every(Boolean)) setScores(s => ({ ...s, draw: s.draw + 1 }));
  };

  const reset = () => { setBoard(Array(9).fill(null)); setIsX(true); };
  const fullReset = () => { reset(); setScores({ X: 0, O: 0, draw: 0 }); };

  const cellStyle = (i: number) => {
    const inLine = result?.line.includes(i);
    const val = board[i];
    return `w-20 h-20 text-4xl font-black rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 border-2 ${
      inLine ? "bg-yellow-400/20 border-yellow-400" :
      val ? "bg-slate-700 border-slate-600" : "bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-500"
    } ${val === "X" ? "text-blue-400" : "text-pink-400"}`;
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex gap-3">
        <button onClick={() => { setMode("pvp"); fullReset(); }} className={`px-4 py-1.5 rounded-lg font-bold text-sm transition ${mode === "pvp" ? "bg-purple-500 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}>2 Players</button>
        <button onClick={() => { setMode("ai"); fullReset(); }} className={`px-4 py-1.5 rounded-lg font-bold text-sm transition ${mode === "ai" ? "bg-purple-500 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}>vs AI</button>
      </div>
      <div className="flex gap-6 text-sm font-bold">
        <span className="text-blue-400">X: {scores.X}</span>
        <span className="text-slate-400">Draw: {scores.draw}</span>
        <span className="text-pink-400">O: {scores.O}</span>
      </div>
      <div className="text-center text-lg font-bold h-8">
        {result ? <span className={result.winner === "X" ? "text-blue-400" : "text-pink-400"}>🏆 {result.winner} wins!</span>
          : isDraw ? <span className="text-yellow-400">🤝 Draw!</span>
          : <span className="text-slate-300">{mode === "ai" && !isX ? "🤖 AI thinking..." : `${isX ? "X" : "O"}'s turn`}</span>}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {board.map((cell, i) => (
          <button key={i} className={cellStyle(i)} onClick={() => handleClick(i)}>
            {cell}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={reset} className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition">New Round</button>
        <button onClick={fullReset} className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition">Reset All</button>
      </div>
    </div>
  );
}
