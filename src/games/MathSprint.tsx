import { useState, useEffect, useRef, useCallback } from "react";

type Level = "Easy" | "Medium" | "Hard";

function makeQuestion(level: Level) {
  const ops = level === "Easy" ? ["+", "-"] : level === "Medium" ? ["+", "-", "×"] : ["+", "-", "×", "÷"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a: number, b: number, answer: number;
  if (op === "+") { a = Math.floor(Math.random() * (level === "Easy" ? 20 : level === "Medium" ? 50 : 99)) + 1; b = Math.floor(Math.random() * (level === "Easy" ? 20 : 50)) + 1; answer = a + b; }
  else if (op === "-") { a = Math.floor(Math.random() * (level === "Easy" ? 20 : 50)) + 10; b = Math.floor(Math.random() * a) + 1; answer = a - b; }
  else if (op === "×") { a = Math.floor(Math.random() * (level === "Medium" ? 10 : 12)) + 2; b = Math.floor(Math.random() * (level === "Medium" ? 10 : 12)) + 2; answer = a * b; }
  else { b = Math.floor(Math.random() * 11) + 2; answer = Math.floor(Math.random() * 10) + 1; a = b * answer; }
  const wrongs = new Set<number>();
  while (wrongs.size < 3) {
    const w = answer + (Math.floor(Math.random() * 10) - 5);
    if (w !== answer && w > 0) wrongs.add(w);
  }
  const choices = [...Array.from(wrongs), answer].sort(() => Math.random() - 0.5);
  return { question: `${a} ${op} ${b}`, answer, choices };
}

export default function MathSprint() {
  const [level, setLevel] = useState<Level>("Easy");
  const [started, setStarted] = useState(false);
  const [q, setQ] = useState(() => makeQuestion("Easy"));
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem("math_best") || 0));
  const [timeLeft, setTimeLeft] = useState(60);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [finished, setFinished] = useState(false);
  const [totalQ, setTotalQ] = useState(0);
  const [correct, setCorrect] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const nextQ = useCallback(() => setQ(makeQuestion(level)), [level]);

  const start = useCallback(() => {
    setScore(0); setStreak(0); setTimeLeft(60); setFinished(false);
    setFeedback(null); setTotalQ(0); setCorrect(0);
    setQ(makeQuestion(level)); setStarted(true);
  }, [level]);

  useEffect(() => {
    if (started && !finished) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); setFinished(true); return 0; }
          return t - 1;
        });
      }, 1000) as unknown as ReturnType<typeof setTimeout>;
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started, finished]);

  useEffect(() => {
    if (finished && score > best) { setBest(score); localStorage.setItem("math_best", String(score)); }
  }, [finished, score, best]);

  const answer = useCallback((choice: number) => {
    if (!started || finished || feedback) return;
    setTotalQ(t => t + 1);
    if (choice === q.answer) {
      const newStreak = streak + 1;
      const bonus = newStreak >= 5 ? 3 : newStreak >= 3 ? 2 : 1;
      setStreak(newStreak);
      setScore(s => s + 10 * bonus);
      setCorrect(c => c + 1);
      setFeedback("correct");
    } else {
      setStreak(0);
      setScore(s => Math.max(0, s - 5));
      setFeedback("wrong");
    }
    setTimeout(() => { setFeedback(null); nextQ(); }, 400);
  }, [q, streak, started, finished, feedback, nextQ]);

  const pct = Math.round((correct / Math.max(1, totalQ)) * 100);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-black text-white">➕ Math Sprint</h2>
        <p className="text-slate-400 text-xs mt-1">Solve as many math problems as you can in 60 seconds!</p>
      </div>

      {!started ? (
        <div className="w-full flex flex-col items-center gap-4">
          <p className="text-slate-300 font-semibold">Select Difficulty:</p>
          <div className="flex gap-3">
            {(["Easy", "Medium", "Hard"] as Level[]).map(l => (
              <button key={l} onClick={() => setLevel(l)}
                className={`px-4 py-2 rounded-xl font-bold text-sm border-2 transition ${level === l ? "bg-violet-600 border-violet-400 text-white" : "bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500"}`}>
                {l}
              </button>
            ))}
          </div>
          <button onClick={start} className="mt-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black px-10 py-3 rounded-2xl text-lg hover:brightness-110 transition shadow-lg">
            🚀 Start!
          </button>
          {best > 0 && <p className="text-purple-400 text-sm font-bold">🏆 Best: {best} pts</p>}
        </div>
      ) : finished ? (
        <div className="w-full bg-slate-900 border-2 border-violet-500/40 rounded-2xl p-6 text-center">
          <p className="text-5xl mb-3">{score >= 150 ? "🏆" : score >= 80 ? "⭐" : "🎯"}</p>
          <h3 className="text-2xl font-black text-white mb-1">Time's Up!</h3>
          <p className="text-yellow-400 font-black text-3xl mb-1">{score} pts</p>
          <div className="grid grid-cols-3 gap-2 my-4 text-sm">
            <div className="bg-slate-800 rounded-xl p-2"><p className="text-green-400 font-black">{correct}</p><p className="text-slate-400 text-xs">Correct</p></div>
            <div className="bg-slate-800 rounded-xl p-2"><p className="text-blue-400 font-black">{totalQ}</p><p className="text-slate-400 text-xs">Total</p></div>
            <div className="bg-slate-800 rounded-xl p-2"><p className="text-purple-400 font-black">{pct}%</p><p className="text-slate-400 text-xs">Accuracy</p></div>
          </div>
          {score >= best && score > 0 && <p className="text-yellow-400 text-sm font-bold mb-3">🎉 New Best!</p>}
          <button onClick={start} className="bg-gradient-to-r from-violet-600 to-purple-600 text-white font-black px-8 py-3 rounded-xl hover:brightness-110 transition">Play Again</button>
          <button onClick={() => setStarted(false)} className="block mt-2 mx-auto text-slate-400 text-sm hover:text-slate-200 transition">Change Level</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-2 w-full text-center">
            {[
              { label: "Score", value: score, color: "text-yellow-400" },
              { label: "Streak", value: streak >= 5 ? `🔥${streak}` : streak, color: "text-orange-400" },
              { label: "Time", value: `${timeLeft}s`, color: timeLeft <= 10 ? "text-red-400" : "text-blue-400" },
              { label: "Best", value: best, color: "text-purple-400" },
            ].map(s => (
              <div key={s.label} className="bg-slate-800 rounded-xl p-2 border border-slate-700">
                <p className={`font-black text-base ${s.color}`}>{s.value}</p>
                <p className="text-slate-500 text-xs">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2">
            <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-1000"
              style={{ width: `${(timeLeft / 60) * 100}%` }} />
          </div>

          <div className={`w-full rounded-3xl p-8 text-center border-2 transition-all duration-200 ${
            feedback === "correct" ? "bg-green-900/40 border-green-500" :
            feedback === "wrong" ? "bg-red-900/40 border-red-500" :
            "bg-slate-900 border-slate-700"}`}>
            <p className="text-slate-400 text-sm mb-2">What is...</p>
            <p className="text-5xl font-black text-white mb-2">{q.question}</p>
            <p className="text-slate-500 text-sm">{streak >= 3 ? `🔥 ${streak}x streak!` : "= ?"}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full">
            {q.choices.map((c, i) => (
              <button key={i} onClick={() => answer(c)}
                className="py-4 rounded-2xl font-black text-xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 hover:border-violet-500 text-white transition active:scale-95">
                {c}
              </button>
            ))}
          </div>

          {streak >= 5 && <p className="text-orange-400 font-bold text-sm animate-bounce">🔥 x3 BONUS ACTIVE!</p>}
          {streak >= 3 && streak < 5 && <p className="text-yellow-400 font-bold text-sm">⚡ x2 Bonus!</p>}
        </>
      )}
    </div>
  );
}
