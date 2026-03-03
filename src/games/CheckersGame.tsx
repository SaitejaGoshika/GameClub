import { useState, useCallback } from 'react';

type Piece = { player: 1 | 2; king: boolean } | null;
type Board = Piece[][];

function emptyBoard(): Board {
  const b: Board = Array.from({ length: 8 }, () => Array(8).fill(null));
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 8; c++)
      if ((r + c) % 2 === 1) b[r][c] = { player: 2, king: false };
  for (let r = 5; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if ((r + c) % 2 === 1) b[r][c] = { player: 1, king: false };
  return b;
}

type Move = { fr: number; fc: number; tr: number; tc: number; captured?: [number, number] };

function getMoves(board: Board, player: 1 | 2, onlyJumps = false): Move[] {
  const moves: Move[] = [];
  const jumps: Move[] = [];
  const dir = player === 1 ? -1 : 1;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p || p.player !== player) continue;
      const dirs = p.king ? [-1, 1] : [dir];
      for (const d of dirs) {
        for (const dc of [-1, 1]) {
          const nr = r + d, nc = c + dc;
          if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            if (!board[nr][nc]) moves.push({ fr: r, fc: c, tr: nr, tc: nc });
            else if (board[nr][nc]?.player !== player) {
              const jr = nr + d, jc = nc + dc;
              if (jr >= 0 && jr < 8 && jc >= 0 && jc < 8 && !board[jr][jc])
                jumps.push({ fr: r, fc: c, tr: jr, tc: jc, captured: [nr, nc] });
            }
          }
        }
      }
    }
  }
  if (jumps.length > 0) return jumps;
  return onlyJumps ? [] : moves;
}

function applyMove(board: Board, move: Move): Board {
  const nb = board.map(row => row.map(c => c ? { ...c } : null));
  nb[move.tr][move.tc] = { ...nb[move.fr][move.fc]! };
  nb[move.fr][move.fc] = null;
  if (move.captured) nb[move.captured[0]][move.captured[1]] = null;
  if (move.tr === 0 && nb[move.tr][move.tc]?.player === 1) nb[move.tr][move.tc]!.king = true;
  if (move.tr === 7 && nb[move.tr][move.tc]?.player === 2) nb[move.tr][move.tc]!.king = true;
  return nb;
}

function aiPickMove(board: Board): Move | null {
  const moves = getMoves(board, 2);
  if (!moves.length) return null;
  // Prefer jumps
  const jumps = moves.filter(m => m.captured);
  if (jumps.length) return jumps[Math.floor(Math.random() * jumps.length)];
  return moves[Math.floor(Math.random() * moves.length)];
}

export default function CheckersGame() {
  const [board, setBoard] = useState<Board>(emptyBoard());
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [turn, setTurn] = useState<1 | 2>(1);
  const [mode, setMode] = useState<'2p' | 'ai'>('ai');
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [msg, setMsg] = useState('Your turn! (Red)');
  const [gameOver, setGameOver] = useState(false);

  const validMoves = selected
    ? getMoves(board, turn).filter(m => m.fr === selected[0] && m.fc === selected[1])
    : [];

  const handleCell = useCallback((r: number, c: number) => {
    if (gameOver || (mode === 'ai' && turn === 2)) return;
    const piece = board[r][c];
    if (piece?.player === turn) {
      setSelected([r, c]);
      return;
    }
    if (selected) {
      const move = validMoves.find(m => m.tr === r && m.tc === c);
      if (move) {
        const nb = applyMove(board, move);
        const nextPlayer: 1 | 2 = turn === 1 ? 2 : 1;
        const nextMoves = getMoves(nb, nextPlayer);
        if (!nextMoves.length) {
          setBoard(nb);
          setGameOver(true);
          setMsg(turn === 1 ? '🎉 Red Wins!' : '🎉 Black Wins!');
          setScores(s => turn === 1 ? { ...s, p1: s.p1 + 1 } : { ...s, p2: s.p2 + 1 });
          return;
        }
        setSelected(null);
        if (mode === 'ai') {
          setBoard(nb);
          setTurn(2);
          setMsg('AI thinking...');
          setTimeout(() => {
            const aiMove = aiPickMove(nb);
            if (!aiMove) {
              setGameOver(true);
              setMsg('🎉 Red Wins!');
              setScores(s => ({ ...s, p1: s.p1 + 1 }));
              return;
            }
            const nb2 = applyMove(nb, aiMove);
            const p1Moves = getMoves(nb2, 1);
            setBoard(nb2);
            if (!p1Moves.length) {
              setGameOver(true);
              setMsg('🎉 Black/AI Wins!');
              setScores(s => ({ ...s, p2: s.p2 + 1 }));
              return;
            }
            setTurn(1);
            setMsg('Your turn! (Red)');
          }, 600);
        } else {
          setBoard(nb);
          setTurn(nextPlayer);
          setMsg(nextPlayer === 1 ? 'Red\'s turn' : 'Black\'s turn');
        }
      } else {
        setSelected(null);
      }
    }
  }, [board, selected, turn, validMoves, mode, gameOver]);

  const reset = () => {
    setBoard(emptyBoard());
    setSelected(null);
    setTurn(1);
    setGameOver(false);
    setMsg('Your turn! (Red)');
  };

  const isValidTarget = (r: number, c: number) => validMoves.some(m => m.tr === r && m.tc === c);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h2 className="text-3xl font-bold text-orange-400">🔴 Checkers</h2>
      <div className="flex gap-4">
        {(['2p', 'ai'] as const).map(m => (
          <button key={m} onClick={() => { setMode(m); reset(); }}
            className={`px-4 py-2 rounded-lg font-bold transition ${mode === m ? 'bg-orange-400 text-black' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
            {m === '2p' ? '👥 2 Player' : '🤖 vs AI'}
          </button>
        ))}
      </div>
      <div className="flex gap-8">
        <span className="text-red-400 font-bold">🔴 Red: {scores.p1}</span>
        <span className="text-gray-300 font-bold">⚫ Black: {scores.p2}</span>
      </div>
      <p className="text-orange-300 font-semibold">{msg}</p>
      <div className="border-4 border-amber-700 rounded-lg overflow-hidden shadow-2xl">
        {board.map((row, r) => (
          <div key={r} className="flex">
            {row.map((cell, c) => {
              const dark = (r + c) % 2 === 1;
              const isSel = selected?.[0] === r && selected?.[1] === c;
              const isTarget = isValidTarget(r, c);
              return (
                <div key={c} onClick={() => dark && handleCell(r, c)}
                  className={`w-14 h-14 flex items-center justify-center relative cursor-pointer
                    ${dark ? 'bg-amber-800' : 'bg-amber-100'}
                    ${isSel ? 'ring-4 ring-yellow-400 ring-inset' : ''}
                    ${isTarget && dark ? 'bg-green-700' : ''}
                  `}>
                  {cell && (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 transition-transform
                      ${cell.player === 1 ? 'bg-red-500 border-red-300' : 'bg-gray-800 border-gray-600'}
                      ${isSel ? 'scale-110' : 'hover:scale-105'}
                    `}>
                      {cell.king && <span className="text-yellow-400 text-lg">♛</span>}
                    </div>
                  )}
                  {isTarget && dark && !cell && (
                    <div className="w-5 h-5 rounded-full bg-green-400 opacity-70" />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <button onClick={reset} className="px-8 py-3 bg-orange-400 text-black font-bold rounded-xl hover:bg-orange-300 transition">
        New Game
      </button>
    </div>
  );
}
