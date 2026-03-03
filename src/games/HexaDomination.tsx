import { useState, useCallback } from "react";

// Hex grid game: connect top-bottom (P1) or left-right (P2)
const SIZE = 7;
type Owner = 0 | 1 | 2;

function initGrid(): Owner[][] {
  return Array(SIZE).fill(null).map(() => Array(SIZE).fill(0));
}

function getNeighbors(r: number, c: number): [number,number][] {
  const n: [number,number][] = [
    [r-1,c],[r-1,c+1],[r,c-1],[r,c+1],[r+1,c-1],[r+1,c]
  ];
  return n.filter(([rr,cc]) => rr>=0&&rr<SIZE&&cc>=0&&cc<SIZE);
}

function checkWin(grid: Owner[][], player: 1|2): boolean {
  const visited = new Set<string>();
  const queue: [number,number][] = [];
  if (player === 1) {
    // P1 connects top (row 0) to bottom (row SIZE-1)
    for (let c=0;c<SIZE;c++) if (grid[0][c]===1) queue.push([0,c]);
  } else {
    // P2 connects left (col 0) to right (col SIZE-1)
    for (let r=0;r<SIZE;r++) if (grid[r][0]===2) queue.push([r,0]);
  }
  while (queue.length) {
    const [r,c] = queue.pop()!;
    const key = `${r},${c}`;
    if (visited.has(key)) continue;
    visited.add(key);
    if (player===1 && r===SIZE-1) return true;
    if (player===2 && c===SIZE-1) return true;
    for (const [nr,nc] of getNeighbors(r,c)) {
      if (!visited.has(`${nr},${nc}`) && grid[nr][nc]===player) queue.push([nr,nc]);
    }
  }
  return false;
}

export default function HexaDomination() {
  const [grid, setGrid] = useState<Owner[][]>(initGrid());
  const [player, setPlayer] = useState<1|2>(1);
  const [winner, setWinner] = useState<1|2|null>(null);
  const [vsAI, setVsAI] = useState(false);

  const aiMove = useCallback((g: Owner[][]) => {
    // AI picks a random empty cell (can be improved)
    const empty: [number,number][] = [];
    for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) if(g[r][c]===0) empty.push([r,c]);
    if (!empty.length) return;
    // Prefer cells near center
    const scored = empty.map(([r,c]) => ({r,c,s:Math.abs(r-SIZE/2)+Math.abs(c-SIZE/2)+Math.random()*2}));
    scored.sort((a,b)=>a.s-b.s);
    const {r,c} = scored[0];
    const ng = g.map(row=>[...row]);
    ng[r][c] = 2;
    setGrid(ng);
    if (checkWin(ng, 2)) { setWinner(2); return; }
    setPlayer(1);
  }, []);

  const handleClick = (r: number, c: number) => {
    if (winner || grid[r][c] !== 0 || (vsAI && player===2)) return;
    const ng = grid.map(row=>[...row]);
    ng[r][c] = player;
    setGrid(ng);
    if (checkWin(ng, player)) { setWinner(player); return; }
    const next: 1|2 = player===1?2:1;
    setPlayer(next);
    if (vsAI && next===2) {
      setTimeout(() => aiMove(ng), 300);
    }
  };

  const restart = () => { setGrid(initGrid()); setPlayer(1); setWinner(null); };

  const getCellBg = (owner: Owner) => {
    if (owner===1) return "#3b82f6";
    if (owner===2) return "#ef4444";
    return "#1e293b";
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-sm mx-auto p-2">
      <div className="text-center">
        <h2 className="text-xl font-black text-teal-300">⬡ Hexa Domination</h2>
        <p className="text-slate-400 text-xs">P1 (Blue) connects Top↔Bottom. P2 (Red) connects Left↔Right.</p>
      </div>

      <div className="flex gap-2 items-center flex-wrap justify-center">
        <button onClick={() => { setVsAI(false); restart(); }} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${!vsAI?"bg-blue-700 border-blue-500 text-white":"bg-slate-800 border-slate-700 text-slate-400"}`}>👥 2 Player</button>
        <button onClick={() => { setVsAI(true); restart(); }} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${vsAI?"bg-purple-700 border-purple-500 text-white":"bg-slate-800 border-slate-700 text-slate-400"}`}>🤖 vs AI</button>
        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${winner?"bg-yellow-900/40 border-yellow-500/40 text-yellow-300":player===1?"bg-blue-900/40 border-blue-500/40 text-blue-300":"bg-red-900/40 border-red-500/40 text-red-300"}`}>
          {winner ? `P${winner} Wins! 🎉` : `P${player}'s Turn`}
        </div>
      </div>

      <div className="text-xs text-slate-500 flex gap-4">
        <span className="text-blue-400 font-bold">P1=Top↔Bottom</span>
        <span className="text-red-400 font-bold">P2=Left↔Right</span>
      </div>

      {/* Hex Grid */}
      <div className="overflow-x-auto w-full flex justify-center">
        <div className="flex flex-col gap-0" style={{padding:"4px"}}>
          {grid.map((row, r) => (
            <div key={r} className="flex" style={{marginLeft: r * 14}}>
              {row.map((cell, c) => (
                <button key={c} onClick={() => handleClick(r,c)} disabled={!!winner || cell!==0 || (vsAI&&player===2)}
                  style={{
                    width:32,height:28,margin:"1px",
                    backgroundColor: getCellBg(cell),
                    clipPath:"polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%)",
                    boxShadow: cell!==0 ? `0 0 8px ${getCellBg(cell)}88`:"none",
                    transition:"all 0.15s"
                  }}
                  className="hover:brightness-125 active:scale-90 disabled:cursor-not-allowed"
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <button onClick={restart} className="px-6 py-2 bg-teal-700 hover:bg-teal-600 text-white font-bold rounded-xl transition">New Game</button>
    </div>
  );
}
