import { useState } from "react";

type Puzzle = { clues: string[]; grid: string[][]; headers: {rows:string[], cols:string[]}, solution: boolean[][], hint: string };

const PUZZLES: Puzzle[] = [
  {
    headers: { rows: ["Alice","Bob","Carol"], cols: ["Red","Blue","Green"] },
    clues: [
      "Alice does not like Blue.",
      "Bob's favorite color is not Red.",
      "Carol likes Green.",
    ],
    solution: [[true,false,false],[false,true,false],[false,false,true]],
    grid: [["","",""],["","",""],["","",""]],
    hint: "Carol=Green → others can't have Green. Bob≠Red → Bob=Blue."
  },
  {
    headers: { rows: ["Dog","Cat","Bird"], cols: ["Amy","Ben","Cara"] },
    clues: [
      "Amy does not own the Dog.",
      "Ben owns the Cat.",
      "Cara does not own the Bird.",
    ],
    solution: [[false,false,true],[false,true,false],[true,false,false]],
    grid: [["","",""],["","",""],["","",""]],
    hint: "Ben=Cat → Amy,Cara≠Cat. Cara≠Bird → Cara=Dog → Amy=Bird."
  },
  {
    headers: { rows: ["Math","Art","PE"], cols: ["Mon","Wed","Fri"] },
    clues: [
      "Math is not on Monday.",
      "Art is on Wednesday.",
      "PE is not on Friday.",
    ],
    solution: [[false,false,true],[false,true,false],[true,false,false]],
    grid: [["","",""],["","",""],["","",""]],
    hint: "Art=Wed → Math,PE≠Wed. PE≠Fri → PE=Mon → Math=Fri."
  },
];

export default function LogicGridWars() {
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const puzzle = PUZZLES[puzzleIdx];
  const [state, setState] = useState<(boolean|null)[][]>(puzzle.grid.map(r=>r.map(()=>null)));
  const [score, setScore] = useState(0);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const toggle = (r: number, c: number) => {
    if (checked) return;
    const ns = state.map(row=>[...row]);
    if (ns[r][c] === null) ns[r][c] = true;
    else if (ns[r][c] === true) ns[r][c] = false;
    else ns[r][c] = null;
    setState(ns);
  };

  const check = () => {
    let allCorrect = true;
    for (let r=0;r<puzzle.solution.length;r++) for(let c=0;c<puzzle.solution[r].length;c++) {
      const expected = puzzle.solution[r][c];
      const got = state[r][c] === true;
      if (expected !== got) { allCorrect = false; }
    }
    setChecked(true);
    setCorrect(allCorrect);
    if (allCorrect) setScore(s=>s+30);
  };

  const next = () => {
    const ni = (puzzleIdx+1) % PUZZLES.length;
    setPuzzleIdx(ni);
    setState(PUZZLES[ni].grid.map(r=>r.map(()=>null)));
    setChecked(false); setCorrect(false); setShowHint(false);
  };

  const cellClass = (r: number, c: number) => {
    const v = state[r][c];
    if (checked) {
      const expected = puzzle.solution[r][c];
      const got = v === true;
      if (expected && got) return "bg-green-700 border-green-500 text-white";
      if (!expected && !got) return "bg-slate-800 border-slate-700 text-slate-600";
      if (expected && !got) return "bg-yellow-800 border-yellow-600 text-yellow-300";
      return "bg-red-800 border-red-600 text-white";
    }
    if (v === true) return "bg-blue-700 border-blue-500 text-white";
    if (v === false) return "bg-red-900/50 border-red-700 text-red-400";
    return "bg-slate-800 border-slate-700 text-slate-600 hover:border-slate-500";
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto p-2">
      <div className="text-center">
        <h2 className="text-xl font-black text-violet-300">🧩 Logic Grid Wars</h2>
        <p className="text-slate-400 text-xs">Use the clues to fill the logic grid. Tap once=✓, twice=✗, three=clear</p>
      </div>

      <div className="flex justify-between w-full items-center">
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-center">
          <p className="text-lg font-black text-violet-400">{score}</p>
          <p className="text-xs text-slate-500">Score</p>
        </div>
        <p className="text-slate-400 text-xs font-bold">Puzzle {puzzleIdx+1}/{PUZZLES.length}</p>
        <button onClick={()=>setShowHint(!showHint)} className="px-3 py-1.5 text-xs font-bold bg-yellow-900/40 border border-yellow-600/40 text-yellow-300 rounded-xl transition">
          💡 Hint
        </button>
      </div>

      {showHint && (
        <div className="w-full bg-yellow-900/20 border border-yellow-600/30 rounded-xl p-2 text-xs text-yellow-200">
          {puzzle.hint}
        </div>
      )}

      {/* Clues */}
      <div className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3">
        <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Clues:</p>
        {puzzle.clues.map((clue,i)=>(
          <p key={i} className="text-white text-sm mb-1">• {clue}</p>
        ))}
      </div>

      {/* Grid */}
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-20"/>
              {puzzle.headers.cols.map(c=>(
                <th key={c} className="text-xs text-slate-400 font-bold p-1 text-center">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {puzzle.headers.rows.map((row,r)=>(
              <tr key={row}>
                <td className="text-xs text-slate-400 font-bold pr-2 text-right">{row}</td>
                {puzzle.headers.cols.map((_col,c)=>(
                  <td key={c} className="p-0.5">
                    <button onClick={()=>toggle(r,c)} disabled={checked}
                      className={`w-full aspect-square rounded-lg border-2 flex items-center justify-center text-lg font-black transition-all active:scale-90 ${cellClass(r,c)}`}>
                      {state[r][c]===true ? "✓" : state[r][c]===false ? "✗" : ""}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {checked ? (
        <div className={`w-full rounded-2xl p-3 text-center border ${correct?"bg-green-900/30 border-green-500/40":"bg-red-900/30 border-red-500/40"}`}>
          <p className={`font-black text-base ${correct?"text-green-300":"text-red-300"}`}>
            {correct ? "🎉 Perfect! +30 points" : "❌ Not quite! Yellow = missed answer"}
          </p>
          <button onClick={next} className="mt-2 px-6 py-2 bg-violet-700 hover:bg-violet-600 text-white font-bold rounded-xl transition">
            {puzzleIdx+1<PUZZLES.length?"Next Puzzle →":"Restart 🔄"}
          </button>
        </div>
      ) : (
        <button onClick={check} className="w-full py-2.5 bg-violet-700 hover:bg-violet-600 text-white font-bold rounded-xl transition">
          Check Solution ✓
        </button>
      )}
    </div>
  );
}
