import { useState, useCallback } from 'react';

const ROWS = 6;
const COLS = 7;

type Cell = null | 'R' | 'Y';
type Board = Cell[][];

const emptyBoard = (): Board => Array.from({ length: ROWS }, () => Array(COLS).fill(null));

function checkWinner(board: Board): { winner: Cell; cells: [number, number][] } | null {
  const directions = [[0,1],[1,0],[1,1],[1,-1]];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = board[r][c];
      if (!cell) continue;
      for (const [dr, dc] of directions) {
        const cells: [number, number][] = [[r, c]];
        for (let i = 1; i < 4; i++) {
          const nr = r + dr * i, nc = c + dc * i;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || board[nr][nc] !== cell) break;
          cells.push([nr, nc]);
        }
        if (cells.length === 4) return { winner: cell, cells };
      }
    }
  }
  return null;
}

function dropPiece(board: Board, col: number, player: Cell): Board | null {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (!board[r][col]) {
      const nb = board.map(row => [...row]);
      nb[r][col] = player;
      return nb;
    }
  }
  return null;
}

function aiMove(board: Board): number {
  // Try to win or block
  for (const player of ['Y', 'R'] as Cell[]) {
    for (let c = 0; c < COLS; c++) {
      const nb = dropPiece(board, c, player);
      if (nb && checkWinner(nb)) return c;
    }
  }
  // Center preference
  const preferred = [3,2,4,1,5,0,6];
  for (const c of preferred) {
    if (board[0][c] === null) return c;
  }
  return 0;
}

export default function ConnectFour() {
  const [board, setBoard] = useState<Board>(emptyBoard());
  const [current, setCurrent] = useState<'R' | 'Y'>('R');
  const [winInfo, setWinInfo] = useState<{ winner: Cell; cells: [number, number][] } | null>(null);
  const [mode, setMode] = useState<'2p' | 'ai'>('2p');
  const [scores, setScores] = useState({ R: 0, Y: 0 });
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  const handleClick = useCallback((col: number) => {
    if (winInfo) return;
    const nb = dropPiece(board, col, current);
    if (!nb) return;
    const win = checkWinner(nb);
    if (win) {
      setBoard(nb);
      setWinInfo(win);
      setScores(s => ({ ...s, [win.winner!]: s[win.winner as 'R'|'Y'] + 1 }));
      return;
    }
    if (mode === 'ai' && current === 'R') {
      const aiCol = aiMove(nb);
      const nb2 = dropPiece(nb, aiCol, 'Y');
      if (nb2) {
        const win2 = checkWinner(nb2);
        setBoard(nb2);
        if (win2) {
          setWinInfo(win2);
          setScores(s => ({ ...s, Y: s.Y + 1 }));
        }
        return;
      }
    }
    setBoard(nb);
    setCurrent(c => c === 'R' ? 'Y' : 'R');
  }, [board, current, winInfo, mode]);

  const reset = () => {
    setBoard(emptyBoard());
    setCurrent('R');
    setWinInfo(null);
  };

  const winCells = new Set(winInfo?.cells.map(([r,c]) => `${r}-${c}`));

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h2 className="text-3xl font-bold text-yellow-400">🔴 Connect Four</h2>
      <div className="flex gap-4 mb-2">
        {(['2p','ai'] as const).map(m => (
          <button key={m} onClick={() => { setMode(m); reset(); }}
            className={`px-4 py-2 rounded-lg font-bold transition ${mode===m?'bg-yellow-400 text-black':'bg-gray-700 text-white hover:bg-gray-600'}`}>
            {m === '2p' ? '👥 2 Player' : '🤖 vs AI'}
          </button>
        ))}
      </div>
      <div className="flex gap-8 mb-2">
        <div className={`px-6 py-3 rounded-xl font-bold text-lg ${current==='R'&&!winInfo?'ring-4 ring-red-400':''}`}>
          <span className="text-red-400">🔴 Red</span> <span className="text-white ml-2">{scores.R}</span>
        </div>
        <div className={`px-6 py-3 rounded-xl font-bold text-lg ${current==='Y'&&!winInfo?'ring-4 ring-yellow-400':''}`}>
          <span className="text-yellow-400">🟡 Yellow</span> <span className="text-white ml-2">{scores.Y}</span>
        </div>
      </div>
      {winInfo && (
        <div className="text-2xl font-bold animate-bounce">
          {winInfo.winner === 'R' ? '🔴 Red Wins!' : '🟡 Yellow Wins!'}
        </div>
      )}
      <div className="bg-blue-800 p-3 rounded-2xl shadow-2xl">
        {/* Column click arrows */}
        <div className="flex mb-1">
          {Array(COLS).fill(0).map((_,c) => (
            <div key={c} className="w-12 h-6 flex items-center justify-center cursor-pointer"
              onMouseEnter={() => setHoveredCol(c)} onMouseLeave={() => setHoveredCol(null)}
              onClick={() => handleClick(c)}>
              {hoveredCol === c && !winInfo && (
                <div className={`w-4 h-4 rounded-full ${current==='R'?'bg-red-400':'bg-yellow-400'} opacity-80`} />
              )}
            </div>
          ))}
        </div>
        {board.map((row, r) => (
          <div key={r} className="flex">
            {row.map((cell, c) => (
              <div key={c}
                className="w-12 h-12 m-0.5 rounded-full cursor-pointer flex items-center justify-center"
                style={{ background: '#1e3a8a' }}
                onClick={() => handleClick(c)}
                onMouseEnter={() => setHoveredCol(c)} onMouseLeave={() => setHoveredCol(null)}>
                <div className={`w-10 h-10 rounded-full transition-all duration-200
                  ${cell === 'R' ? 'bg-red-500 shadow-lg shadow-red-500/50' :
                    cell === 'Y' ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50' : 'bg-blue-900'}
                  ${winCells.has(`${r}-${c}`) ? 'ring-4 ring-white animate-pulse' : ''}
                `} />
              </div>
            ))}
          </div>
        ))}
      </div>
      <button onClick={reset} className="mt-2 px-8 py-3 bg-yellow-400 text-black font-bold rounded-xl hover:bg-yellow-300 transition">
        New Game
      </button>
    </div>
  );
}
