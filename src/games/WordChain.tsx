import { useState, useCallback, useRef } from "react";

const STARTER_WORDS = ["apple","orange","eagle","animal","island","dragon","umbrella","anchor","echo","opera"];
const WORD_LIST = new Set([
  "apple","element","elephant","tail","lamp","map","pen","nail","leaf","fox","xray","yacht",
  "tree","ear","ring","game","egg","girl","lion","night","tiger","rabbit","basket","king",
  "novel","lake","echo","orange","eagle","anchor","animal","island","dragon","umbrella","opera",
  "name","end","door","rain","nose","eye","yard","desk","snake","even","note","empty",
  "old","deep","park","key","yellow","wolf","fence","exit","torn","narrow","wave","east",
  "top","plant","test","sky","yarn","never","real","large","earth","hill","last","table",
  "blue","under","red","dark","kite","eye","yes","sun","net","tan","nut","tip","pea",
  "ant","town","war","rat","oak","kept","pot","use","ace","ice","ode","age","ale",
  "bat","cap","den","elf","fin","gap","hat","ink","jet","keg","lip","mud","nap","orb",
  "paw","rag","sap","tar","urn","van","web","zap","bar","car","far","jar","star","tar",
]);

export default function WordChain() {
  const [chain, setChain] = useState<string[]>(() => {
    const w = STARTER_WORDS[Math.floor(Math.random() * STARTER_WORDS.length)];
    return [w];
  });
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [best, setBest] = useState(() => Number(localStorage.getItem("wc_best") || 0));
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  const lastWord = chain[chain.length - 1];

  const startGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const w = STARTER_WORDS[Math.floor(Math.random() * STARTER_WORDS.length)];
    setChain([w]); setInput(""); setScore(0); setStreak(0);
    setError(""); setTimeLeft(30); setFinished(false); setStarted(true);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); setFinished(true); return 0; }
        return t - 1;
      });
    }, 1000) as unknown as ReturnType<typeof setTimeout>;
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const submit = useCallback(() => {
    const word = input.trim().toLowerCase();
    if (!word) return;
    if (word.length < 2) { setError("Word too short!"); return; }
    if (word[0] !== lastWord[lastWord.length - 1]) {
      setError(`Must start with "${lastWord[lastWord.length - 1].toUpperCase()}"`);
      setStreak(0); return;
    }
    if (chain.includes(word)) { setError("Already used!"); return; }
    if (!WORD_LIST.has(word)) { setError("Not in word list!"); return; }
    const newStreak = streak + 1;
    const pts = word.length * (newStreak >= 5 ? 3 : newStreak >= 3 ? 2 : 1);
    setChain(c => [...c, word]);
    setScore(s => s + pts);
    setStreak(newStreak);
    setTimeLeft(t => Math.min(30, t + 3));
    setError("");
    setInput("");
    if (score + pts > best) { setBest(score + pts); localStorage.setItem("wc_best", String(score + pts)); }
    inputRef.current?.focus();
  }, [input, lastWord, chain, streak, score, best]);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-black text-white">🔗 Word Chain</h2>
        <p className="text-slate-400 text-xs mt-1">Each word must start with the last letter of the previous word!</p>
      </div>

      {!started && !finished ? (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="text-6xl">🔗</div>
          <p className="text-slate-300 text-center text-sm">Chain words together — each word starts where the last one ended! +3s per word!</p>
          <button onClick={startGame} className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-black px-10 py-3 rounded-2xl text-lg hover:brightness-110 transition">
            🚀 Start!
          </button>
          {best > 0 && <p className="text-purple-400 text-sm">🏆 Best: {best} pts</p>}
        </div>
      ) : finished ? (
        <div className="w-full bg-slate-900 border-2 border-cyan-500/40 rounded-2xl p-6 text-center">
          <p className="text-5xl mb-3">{score >= 100 ? "🏆" : score >= 50 ? "⭐" : "🎯"}</p>
          <h3 className="text-2xl font-black text-white mb-1">Time's Up!</h3>
          <p className="text-cyan-400 font-black text-3xl mb-1">{score} pts</p>
          <p className="text-slate-400 text-sm mb-1">{chain.length - 1} words chained</p>
          <p className="text-slate-400 text-sm mb-4">Best streak: {streak}</p>
          <div className="flex flex-wrap gap-1 justify-center mb-4 max-h-24 overflow-y-auto">
            {chain.map((w, i) => (
              <span key={i} className="text-xs px-2 py-0.5 bg-cyan-900/40 text-cyan-300 rounded-full border border-cyan-700/40">{w}</span>
            ))}
          </div>
          {score >= best && score > 0 && <p className="text-yellow-400 font-bold text-sm mb-3">🎉 New Best!</p>}
          <button onClick={startGame} className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-black px-8 py-3 rounded-xl hover:brightness-110 transition">Play Again</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-2 w-full">
            {[
              { label: "Score", value: score, color: "text-yellow-400" },
              { label: "Words", value: chain.length - 1, color: "text-cyan-400" },
              { label: "Streak", value: streak >= 3 ? `🔥${streak}` : streak, color: "text-orange-400" },
              { label: "Time", value: `${timeLeft}s`, color: timeLeft <= 10 ? "text-red-400" : "text-blue-400" },
            ].map(s => (
              <div key={s.label} className="bg-slate-800 rounded-xl p-2 text-center border border-slate-700">
                <p className={`font-black text-base ${s.color}`}>{s.value}</p>
                <p className="text-slate-500 text-xs">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-1000"
              style={{ width: `${(timeLeft / 30) * 100}%` }} />
          </div>

          <div className="w-full bg-slate-900 rounded-2xl p-4 border border-slate-700 min-h-16 flex flex-wrap gap-1 items-center max-h-28 overflow-y-auto">
            {chain.map((w, i) => (
              <span key={i} className={`text-sm px-2 py-0.5 rounded-full border ${i === chain.length - 1 ? "bg-cyan-600 text-white border-cyan-400 font-bold text-base" : "bg-slate-800 text-slate-300 border-slate-600"}`}>
                {w}
              </span>
            ))}
            <span className="text-cyan-400 font-black text-xl animate-pulse">
              {lastWord[lastWord.length - 1].toUpperCase()}...
            </span>
          </div>

          <div className="w-full">
            <p className="text-slate-500 text-xs mb-1">Word must start with <span className="text-cyan-400 font-black text-sm">"{lastWord[lastWord.length - 1].toUpperCase()}"</span></p>
            <div className="flex gap-2">
              <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value.toLowerCase())}
                onKeyDown={e => e.key === "Enter" && submit()}
                placeholder={`Word starting with "${lastWord[lastWord.length - 1]}"...`}
                autoComplete="off" autoCorrect="off" spellCheck={false}
                className="flex-1 bg-slate-800 border-2 border-slate-600 focus:border-cyan-500 rounded-xl px-4 py-3 text-white text-base outline-none transition placeholder-slate-600" />
              <button onClick={submit} className="px-5 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-black rounded-xl hover:brightness-110 transition">→</button>
            </div>
            {error && <p className="text-red-400 text-xs mt-1 font-semibold">⚠️ {error}</p>}
          </div>
        </>
      )}
    </div>
  );
}
