import { useState, useCallback } from "react";

const ROWS = 8, COLS = 8;
type Owner = 0|1|2;
type Cell = { owner: Owner };

function initGrid(): Cell[][] {
  return Array(ROWS).fill(null).map(() => Array(COLS).fill(null).map(() => ({ owner: 0 as Owner })));
}

function countTerritory(grid: Cell[][]): {p1:number,p2:number} {
  let p1=0,p2=0;
  grid.flat().forEach(c=>{if(c.owner===1)p1++;if(c.owner===2)p2++;});
  return {p1,p2};
}

export default function TerritoryTactix() {
  const [grid, setGrid] = useState<Cell[][]>(initGrid());
  const [player, setPlayer] = useState<1|2>(1);
  const [scores, setScores] = useState({p1:0,p2:0});
  const [movesLeft, setMovesLeft] = useState(32);
  const [done, setDone] = useState(false);
  const [vsAI, setVsAI] = useState(false);

  const makeMove = useCallback((r: number, c: number, g: Cell[][], p: 1|2): Cell[][] => {
    const ng = g.map(row=>row.map(cell=>({...cell})));
    if (ng[r][c].owner === 0) {
      ng[r][c].owner = p;
    } else if (ng[r][c].owner === p) {
      [[r-1,c],[r+1,c],[r,c-1],[r,c+1]].forEach(([nr,nc])=>{
        if(nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&ng[nr][nc].owner===0) ng[nr][nc].owner=p;
      });
    }
    return ng;
  }, []);

  const processMove = (r: number, c: number, g: Cell[][], p: 1|2, ml: number) => {
    if (done || (vsAI && p===2)) return;
    if (g[r][c].owner !== 0 && g[r][c].owner !== p) return;
    const ng = makeMove(r, c, g, p);
    const t = countTerritory(ng);
    setScores(t);
    setGrid(ng);
    const nm = ml - 1;
    setMovesLeft(nm);
    if (nm <= 0) { setDone(true); return; }
    const next: 1|2 = p===1?2:1;
    setPlayer(next);
    if (vsAI && next===2) {
      setTimeout(() => {
        const candidates: [number,number,number][] = [];
        for(let rr=0;rr<ROWS;rr++) for(let cc=0;cc<COLS;cc++) {
          if(ng[rr][cc].owner===0) {
            const adj = [[rr-1,cc],[rr+1,cc],[rr,cc-1],[rr,cc+1]].filter(([nr,nc])=>nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&ng[nr][nc].owner===2).length;
            candidates.push([rr,cc,adj+Math.random()]);
          } else if (ng[rr][cc].owner===2) candidates.push([rr,cc,5+Math.random()]);
        }
        if (!candidates.length) { setDone(true); return; }
        candidates.sort((a,b)=>b[2]-a[2]);
        const [ar,ac] = candidates[0];
        const ng2 = makeMove(ar,ac,ng,2);
        const t2 = countTerritory(ng2);
        setScores(t2);
        setGrid(ng2);
        const nm2 = nm-1;
        setMovesLeft(nm2);
        if(nm2<=0){setDone(true);return;}
        setPlayer(1);
      }, 400);
    }
  };

  const restart = () => {
    setGrid(initGrid()); setPlayer(1); setScores({p1:0,p2:0});
    setMovesLeft(32); setDone(false);
  };

  const cellColor = (owner: Owner) => {
    if (owner===1) return "bg-blue-600/70 border-blue-400/50";
    if (owner===2) return "bg-red-600/70 border-red-400/50";
    return "bg-slate-800 border-slate-700 hover:border-slate-500 hover:bg-slate-700/50";
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-sm mx-auto p-2">
      <div className="text-center">
        <h2 className="text-xl font-black text-emerald-300">🗺️ Territory Tactix</h2>
        <p className="text-slate-400 text-xs">Claim cells and expand territory. Most cells after 32 moves wins!</p>
      </div>
      <div className="flex gap-2 flex-wrap justify-center">
        <button onClick={()=>{setVsAI(false);restart();}} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${!vsAI?"bg-blue-700 border-blue-500 text-white":"bg-slate-800 border-slate-700 text-slate-400"}`}>👥 2P</button>
        <button onClick={()=>{setVsAI(true);restart();}} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${vsAI?"bg-purple-700 border-purple-500 text-white":"bg-slate-800 border-slate-700 text-slate-400"}`}>🤖 AI</button>
        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${player===1?"bg-blue-900/40 border-blue-500/40 text-blue-300":"bg-red-900/40 border-red-500/40 text-red-300"}`}>
          {done ? (scores.p1>scores.p2?"P1 Wins! 🏆":scores.p2>scores.p1?"P2 Wins! 🏆":"Draw! 🤝") : `P${player}'s Turn`}
        </div>
        <div className="px-3 py-1.5 rounded-lg text-xs font-bold border bg-slate-800 border-slate-700 text-slate-300">{movesLeft} moves</div>
      </div>
      <div className="flex gap-6 w-full justify-center">
        <div className="text-center"><p className="text-2xl font-black text-blue-400">{scores.p1}</p><p className="text-xs text-slate-500">P1 Cells</p></div>
        <div className="text-center"><p className="text-2xl font-black text-red-400">{scores.p2}</p><p className="text-xs text-slate-500">P2 Cells</p></div>
      </div>
      <div className="grid gap-0.5 w-full" style={{gridTemplateColumns:`repeat(${COLS},1fr)`}}>
        {grid.map((row,r)=>row.map((cell,c)=>(
          <button key={`${r}-${c}`}
            onClick={()=>processMove(r,c,grid,player,movesLeft)}
            disabled={done||(cell.owner!==0&&cell.owner!==player)||(vsAI&&player===2)}
            className={`aspect-square rounded border transition-all active:scale-90 ${cellColor(cell.owner)}`}>
          </button>
        )))}
      </div>
      <button onClick={restart} className="px-6 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl transition">New Game</button>
    </div>
  );
}
