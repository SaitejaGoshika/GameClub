import { useState, useEffect, useCallback } from "react";

const COLS = 7, ROWS = 8;
type Cell = "empty"|"mine"|"safe"|"player";

function generateGrid(playerCol: number): Cell[][] {
  const grid: Cell[][] = Array.from({length: ROWS}, () => Array(COLS).fill("empty") as Cell[]);
  grid[ROWS-1][playerCol] = "player";
  for (let r = 0; r < ROWS-1; r++) {
    const mineCount = 1 + Math.floor(r/2);
    const mineCols = new Set<number>();
    while(mineCols.size < Math.min(mineCount, COLS-1)) {
      mineCols.add(Math.floor(Math.random()*COLS));
    }
    for(const c of mineCols) grid[r][c] = "mine";
  }
  return grid;
}

export default function MineRacer() {
  const [playerCol, setPlayerCol] = useState(3);
  const [grid, setGrid] = useState<Cell[][]>(() => generateGrid(3));
  const [playerRow, setPlayerRow] = useState(ROWS-1);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [status, setStatus] = useState<"idle"|"playing"|"dead"|"win">("idle");
  const [trail, setTrail] = useState<{r:number;c:number}[]>([]);

  const start = () => {
    const col = 3;
    setPlayerCol(col); setPlayerRow(ROWS-1);
    setGrid(generateGrid(col));
    setScore(0); setStatus("playing"); setTrail([]);
  };

  const move = useCallback((direction: "left"|"right"|"up") => {
    if (status !== "playing") return;
    let newCol = playerCol, newRow = playerRow;
    if (direction === "left") newCol = Math.max(0, playerCol-1);
    if (direction === "right") newCol = Math.min(COLS-1, playerCol+1);
    if (direction === "up") newRow = playerRow-1;
    if (newRow < 0) { setStatus("win"); setBest(b=>Math.max(b,score+50)); setScore(s=>s+50); return; }
    if (grid[newRow][newCol] === "mine") {
      setStatus("dead"); setBest(b=>Math.max(b,score));
      const newGrid = grid.map(r=>[...r] as Cell[]);
      newGrid[newRow][newCol] = "safe";
      setGrid(newGrid); return;
    }
    setTrail(t=>[...t,{r:playerRow,c:playerCol}]);
    setPlayerRow(newRow); setPlayerCol(newCol);
    const pts = direction==="up" ? 10 + (ROWS-1-newRow)*5 : 2;
    setScore(s=>s+pts);
  }, [status, playerCol, playerRow, grid, score]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key==="ArrowLeft") move("left");
      if (e.key==="ArrowRight") move("right");
      if (e.key==="ArrowUp") move("up");
      if (e.key==="w"||e.key==="W") move("up");
      if (e.key==="a"||e.key==="A") move("left");
      if (e.key==="d"||e.key==="D") move("right");
    };
    window.addEventListener("keydown", onKey);
    return ()=>window.removeEventListener("keydown", onKey);
  }, [move]);

  const isTrail = (r:number,c:number) => trail.some(t=>t.r===r&&t.c===c);

  const cellStyle = (cell: Cell, r: number, c: number) => {
    const isPlayer = r===playerRow && c===playerCol;
    const isTr = isTrail(r,c);
    if (isPlayer) return "bg-purple-500 border-purple-300 text-2xl shadow-lg shadow-purple-500/50 scale-110";
    if (cell==="mine" && status!=="playing") return "bg-red-600 border-red-400";
    if (isTr) return "bg-purple-900/40 border-purple-700/40";
    if (r===0) return "bg-green-900/40 border-green-600/40";
    return "bg-slate-800 border-slate-700 hover:border-slate-500";
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto p-4">
      <h2 className="text-2xl font-black text-white">💣 Mine Racer</h2>
      <p className="text-slate-400 text-xs text-center">Navigate from bottom to top without hitting mines! Arrow keys or buttons.</p>

      <div className="flex gap-3">
        <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 text-center min-w-[70px]">
          <p className="text-2xl font-black text-yellow-400">{score}</p>
          <p className="text-slate-400 text-xs">Score</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 text-center min-w-[70px]">
          <p className="text-2xl font-black text-green-400">{best}</p>
          <p className="text-slate-400 text-xs">Best</p>
        </div>
      </div>

      {status==="dead"&&<div className="text-red-400 font-black text-lg animate-bounce">💥 Hit a mine!</div>}
      {status==="win"&&<div className="text-green-400 font-black text-lg animate-bounce">🏆 You escaped! +50 bonus!</div>}

      <div className="bg-slate-900 rounded-2xl p-2 border border-slate-700">
        <div className="text-center text-xs text-green-400 font-bold mb-1">🏁 GOAL (reach here!)</div>
        <div className="grid gap-1" style={{gridTemplateColumns:`repeat(${COLS},1fr)`}}>
          {grid.map((row,r) => row.map((cell,c) => (
            <div key={`${r}-${c}`} className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg border-2 flex items-center justify-center text-base transition-all duration-150 ${cellStyle(cell,r,c)}`}>
              {r===playerRow&&c===playerCol?"🧑":
               cell==="mine"&&status!=="playing"?"💣":
               isTrail(r,c)?"·":
               r===0?"🚩":""}
            </div>
          )))}
        </div>
      </div>

      {status==="playing" && (
        <div className="grid grid-cols-3 gap-2">
          <div />
          <button onClick={()=>move("up")} className="p-3 bg-slate-700 rounded-xl text-white font-black text-xl hover:bg-slate-600 active:scale-95">↑</button>
          <div />
          <button onClick={()=>move("left")} className="p-3 bg-slate-700 rounded-xl text-white font-black text-xl hover:bg-slate-600 active:scale-95">←</button>
          <div className="p-3 flex items-center justify-center text-slate-600 text-xs">move</div>
          <button onClick={()=>move("right")} className="p-3 bg-slate-700 rounded-xl text-white font-black text-xl hover:bg-slate-600 active:scale-95">→</button>
        </div>
      )}

      {(status==="idle"||status==="dead"||status==="win") && (
        <button onClick={start} className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-black rounded-2xl text-lg hover:brightness-110 transition">
          {status==="idle"?"▶ Start":"🔄 Try Again"}
        </button>
      )}
    </div>
  );
}
