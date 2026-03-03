import { useState, useEffect, useRef, useCallback } from "react";

const WORDS = [
  "the quick brown fox jumps over the lazy dog",
  "programming is the art of telling a computer what to do",
  "practice makes perfect in every skill you learn",
  "game club is the best arcade portal ever made",
  "speed and accuracy are both important in typing",
  "the keyboard warrior types without looking down",
  "react and typescript make building apps a joy",
  "every champion was once a beginner who kept going",
  "play hard train harder never give up on your goals",
  "the fastest typists see words not individual letters",
  "consistent practice builds muscle memory over time",
  "focus on accuracy first then speed will follow naturally",
];

function getRandomText() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

export default function TypingSpeed() {
  const [target, setTarget] = useState(getRandomText());
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [best, setBest] = useState(() => Number(localStorage.getItem("typing_best") || 0));
  const [errors, setErrors] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const startTimeRef = useRef<number>(0);

  const reset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTarget(getRandomText());
    setInput("");
    setStarted(false);
    setFinished(false);
    setTimeLeft(60);
    setWpm(0);
    setAccuracy(100);
    setErrors(0);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

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
    if (finished && wpm > best) {
      setBest(wpm);
      localStorage.setItem("typing_best", String(wpm));
    }
  }, [finished, wpm, best]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (finished) return;
    if (!started) { setStarted(true); startTimeRef.current = Date.now(); }
    setInput(val);
    let errs = 0;
    for (let i = 0; i < val.length; i++) { if (val[i] !== target[i]) errs++; }
    setErrors(errs);
    const correct = val.length - errs;
    setAccuracy(val.length > 0 ? Math.round((correct / val.length) * 100) : 100);
    const elapsed = (Date.now() - startTimeRef.current) / 1000 / 60;
    setWpm(elapsed > 0 ? Math.round((correct / 5) / elapsed) : 0);
    if (val === target) { setFinished(true); if (timerRef.current) clearInterval(timerRef.current); }
  }, [target, started, finished]);

  const getCharClass = (i: number) => {
    if (i >= input.length) return "text-slate-400";
    if (input[i] === target[i]) return "text-green-400";
    return "text-red-400 bg-red-900/30";
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-black text-white">⌨️ Typing Speed</h2>
        <p className="text-slate-400 text-xs mt-1">Type the text as fast and accurately as possible!</p>
      </div>
      <div className="grid grid-cols-4 gap-2 w-full">
        {[
          { label: "WPM", value: wpm, color: "text-yellow-400" },
          { label: "Accuracy", value: `${accuracy}%`, color: "text-green-400" },
          { label: "Time", value: `${timeLeft}s`, color: timeLeft <= 10 ? "text-red-400" : "text-blue-400" },
          { label: "Best", value: best, color: "text-purple-400" },
        ].map(s => (
          <div key={s.label} className="bg-slate-800 rounded-xl p-2 text-center border border-slate-700">
            <p className={`font-black text-lg ${s.color}`}>{s.value}</p>
            <p className="text-slate-500 text-xs">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all duration-200"
          style={{ width: `${Math.min(100, (input.length / target.length) * 100)}%` }} />
      </div>
      <div className="w-full bg-slate-900 rounded-2xl p-4 border border-slate-700 font-mono text-lg leading-relaxed min-h-24">
        {target.split("").map((char, i) => (
          <span key={i} className={`transition-colors ${getCharClass(i)} ${i === input.length ? "border-b-2 border-violet-400 animate-pulse" : ""}`}>
            {char}
          </span>
        ))}
      </div>
      <input ref={inputRef} type="text" value={input} onChange={handleInput} disabled={finished}
        placeholder={started ? "" : "Start typing to begin..."}
        autoFocus autoComplete="off" autoCorrect="off" spellCheck={false}
        className="w-full bg-slate-800 border-2 border-slate-600 focus:border-violet-500 rounded-xl px-4 py-3 text-white font-mono text-base outline-none transition placeholder-slate-600" />
      {errors > 0 && !finished && <p className="text-red-400 text-xs">⚠️ {errors} error{errors > 1 ? "s" : ""} — keep going!</p>}
      {finished && (
        <div className="w-full bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-violet-500/40 rounded-2xl p-6 text-center">
          <p className="text-4xl mb-2">{wpm >= 60 ? "🚀" : wpm >= 40 ? "⚡" : "✍️"}</p>
          <h3 className="text-2xl font-black text-white mb-3">{input === target ? "🏆 Completed!" : "⏰ Time's Up!"}</h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-slate-800 rounded-xl p-3"><p className="text-yellow-400 font-black text-2xl">{wpm}</p><p className="text-slate-400 text-xs">WPM</p></div>
            <div className="bg-slate-800 rounded-xl p-3"><p className="text-green-400 font-black text-2xl">{accuracy}%</p><p className="text-slate-400 text-xs">Accuracy</p></div>
            <div className="bg-slate-800 rounded-xl p-3"><p className="text-red-400 font-black text-2xl">{errors}</p><p className="text-slate-400 text-xs">Errors</p></div>
          </div>
          {wpm >= best && wpm > 0 && <p className="text-yellow-400 font-bold text-sm mb-3">🎉 New Personal Best!</p>}
          <button onClick={reset} className="bg-gradient-to-r from-violet-600 to-purple-600 text-white font-black px-8 py-3 rounded-xl hover:brightness-110 transition">Try Again</button>
        </div>
      )}
      {!started && !finished && <p className="text-violet-400 text-sm">Click on input field to start typing!</p>}
    </div>
  );
}
