import { useState, useEffect, useCallback } from "react";

type Difficulty = "Easy" | "Medium" | "Hard";

interface Question { a: number; b: number; op: string; answer: number; }

function generate(diff: Difficulty): Question {
  const ops = diff === "Easy" ? ["+","-"] : diff === "Medium" ? ["+","-","×"] : ["+","-","×","÷"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a = 0, b = 0, answer = 0;
  const max = diff === "Easy" ? 20 : diff === "Medium" ? 50 : 100;
  if (op === "+") { a = Math.floor(Math.random()*max)+1; b = Math.floor(Math.random()*max)+1; answer = a+b; }
  else if (op === "-") { a = Math.floor(Math.random()*max)+10; b = Math.floor(Math.random()*a)+1; answer = a-b; }
  else if (op === "×") { a = Math.floor(Math.random()*12)+1; b = Math.floor(Math.random()*12)+1; answer = a*b; }
  else { b = Math.floor(Math.random()*11)+2; answer = Math.floor(Math.random()*10)+1; a = b*answer; }
  return { a, b, op, answer };
}

export default function MathDuel() {
  const [diff, setDiff] = useState<Difficulty>("Easy");
  const [q, setQ] = useState<Question>(generate("Easy"));
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [running, setRunning] = useState(false);
  const [feedback, setFeedback] = useState<"correct"|"wrong"|null>(null);
  const [total, setTotal] = useState(0);

  const nextQ = useCallback((d: Difficulty) => {
    setQ(generate(d)); setInput(""); setFeedback(null);
  }, []);

  useEffect(() => {
    if (!running) return;
    if (timeLeft <= 0) { setRunning(false); setBest(b => Math.max(b, score)); return; }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [running, timeLeft, score]);

  const submit = () => {
    const ans = parseInt(input);
    if (isNaN(ans)) return;
    setTotal(t => t + 1);
    if (ans === q.answer) {
      const pts = diff === "Easy" ? 10 : diff === "Medium" ? 20 : 30;
      const bonus = streak >= 4 ? pts : 0;
      setScore(s => s + pts + bonus);
      setStreak(s => s + 1);
      setFeedback("correct");
    } else {
      setStreak(0);
      setFeedback("wrong");
    }
    setTimeout(() => nextQ(diff), 400);
  };

  const start = (d: Difficulty) => {
    setDiff(d); setScore(0); setStreak(0); setTotal(0);
    setTimeLeft(60); setRunning(true); setQ(generate(d)); setInput(""); setFeedback(null);
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-md mx-auto p-4">
      <h2 className="text-2xl font-black text-white">🧮 Math Duel</h2>

      <div className="flex gap-3">
        <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 text-center min-w-[70px]">
          <p className="text-2xl font-black text-yellow-400">{score}</p>
          <p className="text-slate-400 text-xs">Score</p>
        </div>
        <div className={`bg-slate-800 rounded-xl p-3 border text-center min-w-[70px] ${timeLeft<=10&&running?"border-red-500 animate-pulse":"border-slate-700"}`}>
          <p className={`text-2xl font-black ${timeLeft<=10?"text-red-400":"text-cyan-400"}`}>{timeLeft}s</p>
          <p className="text-slate-400 text-xs">Time</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 text-center min-w-[70px]">
          <p className="text-2xl font-black text-orange-400">🔥{streak}</p>
          <p className="text-slate-400 text-xs">Streak</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 text-center min-w-[70px]">
          <p className="text-2xl font-black text-green-400">{best}</p>
          <p className="text-slate-400 text-xs">Best</p>
        </div>
      </div>

      {!running ? (
        <div className="w-full bg-slate-800 rounded-2xl p-6 border border-slate-700 flex flex-col items-center gap-4">
          {timeLeft === 0 && (
            <div className="text-center mb-2">
              <p className="text-3xl mb-1">🏁</p>
              <p className="text-white font-black text-xl">Time's Up!</p>
              <p className="text-slate-400 text-sm">{score} pts • {total} questions answered</p>
            </div>
          )}
          <p className="text-slate-300 font-bold">Select Difficulty:</p>
          <div className="flex gap-3">
            {(["Easy","Medium","Hard"] as Difficulty[]).map(d => (
              <button key={d} onClick={() => start(d)}
                className={`px-4 py-2 rounded-xl font-black text-sm border-2 transition ${
                  d==="Easy"?"bg-green-700 border-green-500 text-white hover:bg-green-600":
                  d==="Medium"?"bg-yellow-700 border-yellow-500 text-white hover:bg-yellow-600":
                  "bg-red-700 border-red-500 text-white hover:bg-red-600"}`}>
                {d}
              </button>
            ))}
          </div>
          <p className="text-slate-500 text-xs text-center">Easy: +−20 | Medium: +−×50 | Hard: +−×÷100</p>
        </div>
      ) : (
        <div className="w-full bg-slate-800 rounded-2xl p-6 border border-slate-700 flex flex-col items-center gap-5">
          {streak >= 3 && <div className="text-orange-400 font-black text-sm animate-bounce">🔥 {streak}x Combo! Next correct = Bonus points!</div>}
          <div className={`text-5xl font-black text-center p-6 rounded-2xl border-2 w-full transition-all ${
            feedback==="correct"?"bg-green-900/40 border-green-500 text-green-300":
            feedback==="wrong"?"bg-red-900/40 border-red-500 text-red-300":
            "bg-slate-900 border-slate-700 text-white"}`}>
            {q.a} {q.op} {q.b} = ?
          </div>
          <div className="flex gap-2 w-full">
            <input autoFocus type="number" value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key==="Enter" && submit()}
              className="flex-1 bg-slate-700 border border-slate-600 text-white rounded-xl px-4 py-3 text-2xl font-black text-center focus:outline-none focus:border-yellow-400"
              placeholder="?"
            />
            <button onClick={submit} className="px-5 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-black rounded-xl text-xl hover:brightness-110">→</button>
          </div>
        </div>
      )}
    </div>
  );
}
