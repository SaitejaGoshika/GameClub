import { useState, useCallback } from "react";

const ROWS = 7, COLS = 7;
type Cell = { owner: 0|1|2; count: number };

function maxOrbs(r: number, c: number): number {
  const corners = (r===0||r===ROWS-1) && (c===0||c===COLS-1);
  const edges = r===0||r===ROWS-1||c===0||c===COLS-1;
  return corners ? 1 : edges ? 2 : 3;
}

function getNeighbors(r: number, c: number): [number,number][] {
  const n: [number,number][] = [];
  if(r>0) n.push([r-1,c]); if(r<ROWS-1) n.push([r+1,c]);
  if(c>0) n.push([r,c-1]); if(c<COLS-1) n.push([r,c+1]);
  return n;
}

function explode(board: Cell[][], player: 1|2): Cell[][] {
  let b = board.map(row => row.map(c => ({...c})));
  let hasExplosion = true;
  let iters = 0;
  while (hasExplosion && iters < 200) {
    hasExplosion = false; iters++;
    const newB = b.map(row => row.map(c => ({...c})));
    for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++) {
      if (b[r][c].count > maxOrbs(r,c)) {
        hasExplosion = true;
        newB[r][c].count -= (maxOrbs(r,c)+1);
        if (newB[r][c].count <= 0) { newB[r][c].count = 0; newB[r][c].owner = 0; }
        for (const [nr,nc] of getNeighbors(r,c)) {
          newB[nr][nc].count++;
          newB[nr][nc].owner = player;
        }
      }
    }
    b = newB;
  }
  return b;
}

function checkWinner(board: Cell[][], moveCount: number): 0|1|2 {
  if (moveCount < 2) return 0;
  const p1 = board.flat().some(c => c.owner === 1);
  const p2 = board.flat().some(c => c.owner === 2);
  if (!p1) return 2;
  if (!p2) return 1;
  return 0;
}

const initBoard = (): Cell[][] => Array(ROWS).fill(null).map(() => Array(COLS).fill(null).map(()=>({owner:0,count:0})));

export default function ChainReactionArena() {
  const [board, setBoard] = useState<Cell[][]>(initBoard());
  const [player, setPlayer] = useState<1|2>(1);
  const [winner, setWinner] = useState<0|1|2>(0);
  const [moveCount, setMoveCount] = useState(0);
  const [vsAI, setVsAI] = useState(false);

  const makeMove = useCallback((r: number, c: number, b: Cell[][], p: 1|2, _mc?: number): Cell[][] | null => {
    if (b[r][c].owner !== 0 && b[r][c].owner !== p) return null;
    const nb = b.map(row => row.map(cl => ({...cl})));
    nb[r][c].count++;
    nb[r][c].owner = p;
    return explode(nb, p);
  }, []);

  const handleClick = (r: number, c: number) => {
    if (winner || (vsAI && player === 2)) return;
    if (board[r][c].owner !== 0 && board[r][c].owner !== player) return;
    const nb = makeMove(r, c, board, player, moveCount);
    if (!nb) return;
    const newMC = moveCount + 1;
    const w = checkWinner(nb, newMC);
    setBoard(nb); setMoveCount(newMC);
    if (w) { setWinner(w); return; }
    const nextP = player === 1 ? 2 : 1;
    setPlayer(nextP);
    if (vsAI && nextP === 2) {
      setTimeout(() => {
        // AI: pick random valid cell
        const valid: [number,number][] = [];
        for (let rr=0;rr<ROWS;rr++) for (let cc=0;cc<COLS;cc++) {
          if (nb[rr][cc].owner === 0 || nb[rr][cc].owner === 2) valid.push([rr,cc]);
        }
        if (!valid.length) return;
        // prefer cells owned by AI
        const ai2 = valid.filter(([rr,cc]) => nb[rr][cc].owner === 2);
        const pick = ai2.length ? ai2[Math.floor(Math.random()*ai2.length)] : valid[Math.floor(Math.random()*valid.length)];
        const nb2 = makeMove(pick[0], pick[1], nb, 2, newMC);
        if (!nb2) return;
        const nmc2 = newMC + 1;
        const w2 = checkWinner(nb2, nmc2);
        setBoard(nb2); setMoveCount(nmc2);
        if (w2) { setWinner(w2); return; }
        setPlayer(1);
      }, 400);
    }
  };

  const restart = () => { setBoard(initBoard()); setPlayer(1); setWinner(0); setMoveCount(0); };

  const getCellColor = (cell: Cell) => {
    if (cell.owner === 1) return "bg-blue-500/80 border-blue-400";
    if (cell.owner === 2) return "bg-red-500/80 border-red-400";
    return "bg-slate-800 border-slate-700 hover:border-slate-500 hover:bg-slate-700";
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-sm mx-auto p-2">
      <div className="text-center">
        <h2 className="text-xl font-black text-orange-300">💥 Chain Reaction Arena</h2>
        <p className="text-slate-400 text-xs">Add orbs to cells. Overload → explode into neighbors! Eliminate all enemy orbs to win.</p>
      </div>

      <div className="flex gap-2 items-center">
        <button onClick={() => { setVsAI(false); restart(); }} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${!vsAI?"bg-blue-700 border-blue-500 text-white":"bg-slate-800 border-slate-700 text-slate-400"}`}>👥 2 Player</button>
        <button onClick={() => { setVsAI(true); restart(); }} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${vsAI?"bg-purple-700 border-purple-500 text-white":"bg-slate-800 border-slate-700 text-slate-400"}`}>🤖 vs AI</button>
        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${player===1?"bg-blue-900/40 border-blue-500/40 text-blue-300":"bg-red-900/40 border-red-500/40 text-red-300"}`}>
          {winner ? `P${winner} Wins! 🎉` : `P${player}'s Turn`}
        </div>
      </div>

      <div className="grid gap-0.5" style={{gridTemplateColumns:`repeat(${COLS},1fr)`}}>
        {board.map((row, r) => row.map((cell, c) => (
          <button key={`${r}-${c}`} onClick={() => handleClick(r, c)} disabled={!!winner}
            className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center transition-all active:scale-90 text-white font-black text-sm ${getCellColor(cell)}`}
            style={{boxShadow: cell.count > 0 ? `0 0 ${cell.count*4}px ${cell.owner===1?"#3b82f6":"#ef4444"}` : "none"}}>
            {cell.count > 0 ? (
              <div className="flex flex-wrap gap-0.5 justify-center p-0.5">
                {Array.from({length: Math.min(cell.count, 4)}).map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full ${cell.owner===1?"bg-blue-200":"bg-red-200"}`}/>
                ))}
              </div>
            ) : null}
          </button>
        )))}
      </div>

      <div className="flex gap-6 text-sm">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500"/><span className="text-blue-300 font-bold">P1 {board.flat().filter(c=>c.owner===1).reduce((s,c)=>s+c.count,0)} orbs</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500"/><span className="text-red-300 font-bold">P2 {board.flat().filter(c=>c.owner===2).reduce((s,c)=>s+c.count,0)} orbs</span></div>
      </div>

      <button onClick={restart} className="px-6 py-2 bg-orange-700 hover:bg-orange-600 text-white font-bold rounded-xl transition">New Game</button>
    </div>
  );
}
