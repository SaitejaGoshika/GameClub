import { useState } from "react";

type Mark = { player: 1 | 2; turn: number };
type Cell = Mark[];

function checkWinner(collapsed: (string | null)[]): string | null {
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (const [a,b,c] of lines) {
    if (collapsed[a] && collapsed[a] === collapsed[b] && collapsed[b] === collapsed[c]) return collapsed[a];
  }
  return null;
}

export default function QuantumTicTacToe() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null).map(() => []));
  const [collapsed, setCollapsed] = useState<(string | null)[]>(Array(9).fill(null));
  const [player, setPlayer] = useState<1 | 2>(1);
  const [turn, setTurn] = useState(1);
  const [firstCell, setFirstCell] = useState<number | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [phase, setPhase] = useState<"select1" | "select2">("select1");
  const [message, setMessage] = useState("P1: Choose your first superposition cell");
  const [entangled, setEntangled] = useState<[number,number,number][]>([]);

  const doCollapse = (newBoard: Cell[], newEnt: [number,number,number][], triggerCell: number, curCollapsed: (string|null)[]) => {
    const nc = [...curCollapsed];
    // Find a starting mark in trigger cell
    const startMark = newBoard[triggerCell].length > 0 ? newBoard[triggerCell][newBoard[triggerCell].length-1] : null;
    if (!startMark) return;
    nc[triggerCell] = startMark.player === 1 ? "X" : "O";

    // Propagate through entangled pairs
    let changed = true;
    while (changed) {
      changed = false;
      for (const [c1, c2, t] of newEnt) {
        if (nc[c1] !== null && nc[c2] === null) {
          const mark = newBoard[c2].find(m => m.turn === t);
          if (mark) { nc[c2] = mark.player === 1 ? "X" : "O"; changed = true; }
        }
        if (nc[c2] !== null && nc[c1] === null) {
          const mark = newBoard[c1].find(m => m.turn === t);
          if (mark) { nc[c1] = mark.player === 1 ? "X" : "O"; changed = true; }
        }
      }
    }

    setCollapsed(nc);
    const w = checkWinner(nc);
    if (w) { setWinner(w); setMessage(`Player ${w} wins! 🎉`); }
    else if (nc.every(c => c !== null)) { setWinner("Draw"); setMessage("Quantum Draw!"); }
    else {
      const np = player === 1 ? 2 : 1;
      setPlayer(np);
      setTurn(t => t + 1);
      setEntangled([]);
      setMessage(`P${np}: Choose your first superposition cell`);
    }
  };

  const detectCycle = (ent: [number,number,number][]): boolean => {
    const pairs = ent.map(([a,b]) => `${Math.min(a,b)}-${Math.max(a,b)}`);
    return pairs.length !== new Set(pairs).size;
  };

  const handleClick = (idx: number) => {
    if (winner || collapsed[idx] !== null) return;
    if (phase === "select1") {
      setFirstCell(idx);
      setPhase("select2");
      setMessage(`P${player}: Choose the 2nd superposition cell`);
    } else {
      if (idx === firstCell) { setMessage(`P${player}: Choose a DIFFERENT cell`); return; }
      const newBoard = board.map(c => [...c]);
      newBoard[firstCell!] = [...newBoard[firstCell!], { player, turn }];
      newBoard[idx] = [...newBoard[idx], { player, turn }];
      const newEnt: [number,number,number][] = [...entangled, [firstCell!, idx, turn]];
      setBoard(newBoard);
      if (detectCycle(newEnt)) {
        doCollapse(newBoard, newEnt, idx, collapsed);
        setPhase("select1");
        setFirstCell(null);
      } else {
        setEntangled(newEnt);
        const np = player === 1 ? 2 : 1;
        setPlayer(np);
        setTurn(t => t + 1);
        setPhase("select1");
        setFirstCell(null);
        setMessage(`P${np}: Choose your first superposition cell`);
      }
    }
  };

  const restart = () => {
    setBoard(Array(9).fill(null).map(() => []));
    setCollapsed(Array(9).fill(null));
    setPlayer(1); setTurn(1); setFirstCell(null); setWinner(null);
    setPhase("select1"); setMessage("P1: Choose your first superposition cell");
    setEntangled([]);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto p-2">
      <div className="text-center">
        <h2 className="text-xl font-black text-cyan-300">⚛️ Quantum Tic-Tac-Toe</h2>
        <p className="text-slate-400 text-xs mt-1">Each move is a superposition in 2 cells. Cycles collapse the board!</p>
      </div>
      <div className={`w-full rounded-xl p-2 text-center text-sm font-bold border ${player===1?"bg-blue-900/30 border-blue-500/40 text-blue-300":"bg-red-900/30 border-red-500/40 text-red-300"}`}>
        {message}
      </div>
      <div className="grid grid-cols-3 gap-2 w-full">
        {board.map((cell, idx) => {
          const isCollapsed = collapsed[idx] !== null;
          const isSelected = idx === firstCell;
          return (
            <button key={idx} onClick={() => handleClick(idx)} disabled={!!winner || (isCollapsed)}
              className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all relative overflow-hidden
                ${isCollapsed ? collapsed[idx]==="X" ? "border-blue-500 bg-blue-900/30" : "border-red-500 bg-red-900/30"
                  : isSelected ? "border-yellow-400 bg-yellow-900/20"
                  : "border-slate-700 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800"}`}>
              {isCollapsed ? (
                <span className={`text-4xl font-black ${collapsed[idx]==="X"?"text-blue-400":"text-red-400"}`}>{collapsed[idx]}</span>
              ) : (
                <div className="flex flex-wrap gap-0.5 justify-center p-1 max-w-full">
                  {cell.map((m, i) => (
                    <span key={i} className={`text-xs font-bold px-0.5 rounded ${m.player===1?"text-blue-300 bg-blue-900/50":"text-red-300 bg-red-900/50"}`}>
                      {m.player===1?"X":"O"}{m.turn}
                    </span>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
      <div className="flex gap-4 text-xs text-slate-500">
        <span className="text-blue-400 font-bold">P1 = X</span>
        <span className="text-red-400 font-bold">P2 = O</span>
        <span>Turn {turn}</span>
      </div>
      <button onClick={restart} className="px-6 py-2 bg-cyan-700 hover:bg-cyan-600 text-white font-bold rounded-xl transition">New Game</button>
    </div>
  );
}
