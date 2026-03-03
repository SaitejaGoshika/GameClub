import { useState } from "react";

type Peg = number[];

export default function TowerOfHanoi() {
  const [disks, setDisks] = useState(3);
  const [pegs, setPegs] = useState<Peg[]>([[3,2,1],[],[]]); 
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [best, setBest] = useState<Record<number,number>>({});

  const minMoves = Math.pow(2, disks) - 1;

  const newGame = (d: number) => {
    const arr = Array.from({length: d}, (_, i) => d - i);
    setPegs([arr, [], []]);
    setMoves(0);
    setWon(false);
    setSelected(null);
    setDisks(d);
  };

  const clickPeg = (pegIdx: number) => {
    if (won) return;
    if (selected === null) {
      if (pegs[pegIdx].length > 0) setSelected(pegIdx);
    } else {
      if (selected === pegIdx) { setSelected(null); return; }
      const from = pegs[selected];
      const to = pegs[pegIdx];
      const disk = from[from.length - 1];
      if (to.length === 0 || to[to.length-1] > disk) {
        const newPegs: Peg[] = pegs.map(p => [...p]);
        newPegs[selected].pop();
        newPegs[pegIdx].push(disk);
        const newMoves = moves + 1;
        setMoves(newMoves);
        setPegs(newPegs);
        setSelected(null);
        if (newPegs[2].length === disks) {
          setWon(true);
          setBest(b => ({ ...b, [disks]: Math.min(b[disks] ?? Infinity, newMoves) }));
        }
      } else {
        setSelected(pegIdx);
      }
    }
  };

  const DISK_COLORS = [
    "bg-red-500","bg-orange-500","bg-yellow-500","bg-green-500",
    "bg-cyan-500","bg-blue-500","bg-purple-500","bg-pink-500",
  ];

  const MAX_WIDTH = 160;
  const MIN_WIDTH = 30;

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-lg mx-auto p-4">
      <h2 className="text-2xl font-black text-white">🗼 Tower of Hanoi</h2>

      <div className="flex gap-3 flex-wrap justify-center">
        {[3,4,5,6].map(d => (
          <button key={d} onClick={() => newGame(d)}
            className={`px-3 py-1.5 rounded-lg font-bold text-sm border transition ${disks===d ? "bg-indigo-600 border-indigo-400 text-white" : "bg-slate-800 border-slate-700 text-slate-400 hover:border-indigo-500"}`}>
            {d} Disks
          </button>
        ))}
      </div>

      <div className="flex gap-2 text-center">
        <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 min-w-[80px]">
          <p className="text-2xl font-black text-yellow-400">{moves}</p>
          <p className="text-slate-400 text-xs">Moves</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 min-w-[80px]">
          <p className="text-2xl font-black text-cyan-400">{minMoves}</p>
          <p className="text-slate-400 text-xs">Minimum</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 min-w-[80px]">
          <p className="text-2xl font-black text-green-400">{best[disks] ?? "—"}</p>
          <p className="text-slate-400 text-xs">Best</p>
        </div>
      </div>

      {won && (
        <div className="bg-green-900/40 border border-green-500/40 rounded-2xl p-4 text-center w-full">
          <p className="text-3xl mb-1">🏆</p>
          <p className="text-white font-black text-xl">Solved in {moves} moves!</p>
          <p className="text-green-300 text-sm">{moves === minMoves ? "🌟 Perfect — minimum moves!" : `Optimal is ${minMoves} moves`}</p>
          <button onClick={() => newGame(disks)} className="mt-3 px-5 py-2 bg-green-600 text-white font-bold rounded-xl text-sm">Play Again</button>
        </div>
      )}

      <div className="flex gap-4 sm:gap-8 justify-center items-end w-full">
        {pegs.map((peg, pegIdx) => (
          <div key={pegIdx} className="flex flex-col items-center cursor-pointer" onClick={() => clickPeg(pegIdx)}>
            <div className="flex flex-col-reverse items-center gap-1 relative" style={{minHeight: 160}}>
              {/* Peg pole */}
              <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-3 rounded-t-full transition-all ${selected===pegIdx ? "bg-yellow-400 shadow-lg shadow-yellow-400/50" : "bg-slate-500"}`} style={{height: 150}} />
              {/* Disks */}
              {peg.map((disk, di) => {
                const width = MIN_WIDTH + ((disk - 1) / (disks - 1)) * (MAX_WIDTH - MIN_WIDTH);
                return (
                  <div key={di} className={`relative rounded-lg h-6 flex items-center justify-center text-white font-black text-xs transition-all ${DISK_COLORS[disk-1]}`}
                    style={{width, zIndex: di + 1, boxShadow: selected===pegIdx && di===peg.length-1 ? "0 0 15px rgba(250,204,21,0.8)" : "none"}}>
                    {disk}
                  </div>
                );
              })}
            </div>
            {/* Base */}
            <div className={`h-3 rounded-lg mt-1 transition-all ${selected===pegIdx ? "bg-yellow-400" : "bg-slate-600"}`} style={{width: MAX_WIDTH + 20}} />
            <p className="text-slate-400 text-xs mt-2 font-bold">{["A","B","C"][pegIdx]}</p>
          </div>
        ))}
      </div>

      <p className="text-slate-500 text-xs text-center">Click a peg to select, click another to move. Get all disks to peg C!</p>
      <p className="text-slate-500 text-xs text-center">Larger disks cannot be placed on smaller ones.</p>
    </div>
  );
}
