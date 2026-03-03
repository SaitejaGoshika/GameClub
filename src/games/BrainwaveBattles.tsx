import { useState, useEffect, useCallback } from "react";

type QType = "math" | "logic" | "sequence" | "trivia";
type Question = { q: string; options: string[]; answer: number; type: QType; points: number };

const QUESTIONS: Question[] = [
  {q:"What is 17 × 8?",options:["126","136","146","156"],answer:1,type:"math",points:10},
  {q:"√144 = ?",options:["10","11","12","13"],answer:2,type:"math",points:10},
  {q:"Next in sequence: 2, 6, 18, 54, ?",options:["108","162","216","270"],answer:1,type:"sequence",points:15},
  {q:"If all Bloops are Razzles and all Razzles are Lazzles, are all Bloops Lazzles?",options:["Yes","No","Maybe","Impossible"],answer:0,type:"logic",points:20},
  {q:"What is 25% of 200?",options:["40","50","60","75"],answer:1,type:"math",points:10},
  {q:"Next: 1, 1, 2, 3, 5, 8, ?",options:["11","12","13","14"],answer:2,type:"sequence",points:15},
  {q:"If A>B, B>C, then A _ C?",options:[">","<","=","≠"],answer:0,type:"logic",points:20},
  {q:"How many sides does a dodecagon have?",options:["10","11","12","13"],answer:2,type:"trivia",points:15},
  {q:"2³ + 3² = ?",options:["17","18","19","20"],answer:0,type:"math",points:10},
  {q:"Next: 3, 6, 11, 18, 27, ?",options:["36","38","39","40"],answer:1,type:"sequence",points:15},
  {q:"All cats are animals. Mittens is a cat. Therefore?",options:["Mittens is an animal","All animals are cats","Mittens is a dog","None"],answer:0,type:"logic",points:20},
  {q:"Prime numbers between 10-20?",options:["2","3","4","5"],answer:1,type:"math",points:15},
  {q:"Next: Z, Y, X, W, ?",options:["V","U","T","S"],answer:0,type:"sequence",points:10},
  {q:"Which shape has the most sides: hexagon, octagon, pentagon?",options:["Pentagon","Hexagon","Octagon","Equal"],answer:2,type:"trivia",points:10},
  {q:"(8 + 4) × 3 - 6 = ?",options:["28","30","32","36"],answer:1,type:"math",points:15},
];

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(()=>Math.random()-0.5); }

export default function BrainwaveBattles() {
  const [questions] = useState(() => shuffle(QUESTIONS));
  const [qIdx, setQIdx] = useState(0);
  const [scores, setScores] = useState({p1:0, p2:0});
  const [currentPlayer, setCurrentPlayer] = useState<1|2>(1);
  const [selected, setSelected] = useState<number|null>(null);
  const [phase, setPhase] = useState<"question"|"result"|"done">("question");
  const [timeLeft, setTimeLeft] = useState(15);
  const [streak, setStreak] = useState({p1:0,p2:0});
  const [vsAI, setVsAI] = useState(false);

  const q = questions[qIdx];

  const answer = useCallback((optIdx: number) => {
    if (phase !== "question" || selected !== null) return;
    setSelected(optIdx);
    const correct = optIdx === q.answer;
    const bonus = streak[currentPlayer===1?"p1":"p2"] >= 2 ? 5 : 0;
    const pts = correct ? q.points + bonus : 0;
    setScores(s => currentPlayer===1 ? {...s,p1:s.p1+pts} : {...s,p2:s.p2+pts});
    setStreak(s => {
      if (currentPlayer===1) return {...s,p1:correct?s.p1+1:0};
      return {...s,p2:correct?s.p2+1:0};
    });
    setPhase("result");
    setTimeout(() => {
      const nextQ = qIdx + 1;
      if (nextQ >= questions.length) { setPhase("done"); return; }
      setQIdx(nextQ);
      setSelected(null);
      setPhase("question");
      setTimeLeft(15);
      const nextP: 1|2 = currentPlayer===1?2:1;
      setCurrentPlayer(nextP);
      if (vsAI && nextP===2) {
        setTimeout(() => {
          const aiAnswer = Math.random() < 0.65 ? questions[nextQ].answer : Math.floor(Math.random()*4);
          answer(aiAnswer);
        }, 800);
      }
    }, 1500);
  }, [phase, selected, q, currentPlayer, streak, qIdx, questions, vsAI]);

  useEffect(() => {
    if (phase !== "question" || (vsAI && currentPlayer===2)) return;
    if (timeLeft <= 0) { answer(99); return; }
    const t = setTimeout(() => setTimeLeft(l=>l-1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, phase, answer, vsAI, currentPlayer]);

  useEffect(() => {
    if (phase==="question") setTimeLeft(15);
  }, [qIdx, phase]);

  const restart = () => {
    setQIdx(0); setScores({p1:0,p2:0}); setCurrentPlayer(1);
    setSelected(null); setPhase("question"); setTimeLeft(15); setStreak({p1:0,p2:0});
  };

  const TYPE_COLORS: Record<QType, string> = {math:"text-blue-400",logic:"text-purple-400",sequence:"text-green-400",trivia:"text-yellow-400"};
  const TYPE_BG: Record<QType, string> = {math:"bg-blue-900/30 border-blue-500/40",logic:"bg-purple-900/30 border-purple-500/40",sequence:"bg-green-900/30 border-green-500/40",trivia:"bg-yellow-900/30 border-yellow-500/40"};

  if (phase==="done") return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto p-2 text-center">
      <h2 className="text-xl font-black text-cyan-300">🧠 Brainwave Battles</h2>
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full">
        <p className="text-2xl font-black text-yellow-300 mb-4">Game Over!</p>
        <div className="flex justify-around">
          <div><p className="text-3xl font-black text-blue-400">{scores.p1}</p><p className="text-slate-400 text-sm">P1</p></div>
          <div><p className="text-3xl font-black text-red-400">{scores.p2}</p><p className="text-slate-400 text-sm">P2{vsAI?" (AI)":""}</p></div>
        </div>
        <p className="text-green-300 font-bold mt-4 text-lg">{scores.p1>scores.p2?"🏆 P1 Wins!":scores.p2>scores.p1?"🏆 P2 Wins!":"🤝 Draw!"}</p>
        <button onClick={restart} className="mt-4 px-6 py-2 bg-cyan-700 hover:bg-cyan-600 text-white font-bold rounded-xl transition">Play Again</button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-sm mx-auto p-2">
      <div className="text-center">
        <h2 className="text-xl font-black text-cyan-300">🧠 Brainwave Battles</h2>
        <p className="text-slate-400 text-xs">Race to answer — knowledge, logic & math! 15s per question.</p>
      </div>

      <div className="flex gap-2">
        <button onClick={() => { setVsAI(false); restart(); }} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${!vsAI?"bg-blue-700 border-blue-500 text-white":"bg-slate-800 border-slate-700 text-slate-400"}`}>👥 2 Player</button>
        <button onClick={() => { setVsAI(true); restart(); }} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${vsAI?"bg-purple-700 border-purple-500 text-white":"bg-slate-800 border-slate-700 text-slate-400"}`}>🤖 vs AI</button>
      </div>

      <div className="grid grid-cols-3 gap-2 w-full">
        <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-2 text-center">
          <p className="text-xl font-black text-blue-300">{scores.p1}</p>
          <p className="text-xs text-slate-500">P1 {streak.p1>=2?`🔥×${streak.p1}`:""}</p>
        </div>
        <div className={`border rounded-xl p-2 text-center ${timeLeft<=5?"bg-red-900/40 border-red-500/40":"bg-slate-800 border-slate-700"}`}>
          <p className={`text-xl font-black ${timeLeft<=5?"text-red-300":"text-white"}`}>{timeLeft}s</p>
          <p className="text-xs text-slate-500">Q {qIdx+1}/{questions.length}</p>
        </div>
        <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-2 text-center">
          <p className="text-xl font-black text-red-300">{scores.p2}</p>
          <p className="text-xs text-slate-500">P2{vsAI?" AI":""} {streak.p2>=2?`🔥×${streak.p2}`:""}</p>
        </div>
      </div>

      <div className={`w-full px-2 py-1 rounded-lg text-xs font-bold text-center ${currentPlayer===1?"bg-blue-900/40 text-blue-300":"bg-red-900/40 text-red-300"}`}>
        {vsAI && currentPlayer===2 ? "🤖 AI is thinking..." : `P${currentPlayer}'s Turn`}
      </div>

      <div className={`w-full rounded-2xl p-4 border ${TYPE_BG[q.type]}`}>
        <div className="flex justify-between items-center mb-2">
          <span className={`text-xs font-bold uppercase ${TYPE_COLORS[q.type]}`}>{q.type}</span>
          <span className="text-xs text-slate-500">{q.points} pts</span>
        </div>
        <p className="text-white font-bold text-base leading-snug">{q.q}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 w-full">
        {q.options.map((opt, i) => (
          <button key={i} onClick={() => answer(i)} disabled={phase==="result" || (vsAI && currentPlayer===2)}
            className={`py-3 px-2 rounded-xl border-2 font-bold text-sm transition-all active:scale-95
              ${phase==="result"
                ? i===q.answer ? "bg-green-700 border-green-500 text-white" : i===selected ? "bg-red-800 border-red-600 text-white" : "bg-slate-800 border-slate-700 text-slate-500"
                : "bg-slate-800 border-slate-700 text-white hover:border-slate-500 hover:bg-slate-700 disabled:opacity-50"}`}>
            {["A","B","C","D"][i]}. {opt}
          </button>
        ))}
      </div>

      {/* Timer bar */}
      <div className="w-full bg-slate-800 rounded-full h-1.5">
        <div className="h-1.5 rounded-full transition-all duration-1000" style={{width:`${(timeLeft/15)*100}%`, backgroundColor: timeLeft<=5?"#ef4444":"#22c55e"}}/>
      </div>
    </div>
  );
}
