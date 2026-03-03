import { useState, useEffect } from "react";

const WORDS = [
  { word: "PYTHON", hint: "A programming language" },
  { word: "GALAXY", hint: "Collection of stars" },
  { word: "PUZZLE", hint: "A brain teaser" },
  { word: "JUNGLE", hint: "Dense tropical forest" },
  { word: "CASTLE", hint: "A medieval fortress" },
  { word: "BRIDGE", hint: "Connects two places" },
  { word: "PLANET", hint: "Orbits a star" },
  { word: "THRONE", hint: "Royal seat" },
  { word: "KNIGHT", hint: "Armored warrior" },
  { word: "MAGNET", hint: "Attracts metal" },
  { word: "FROZEN", hint: "Icy cold" },
  { word: "GOBLIN", hint: "Mischievous fantasy creature" },
  { word: "HARBOR", hint: "Where ships dock" },
  { word: "IGNITE", hint: "To set on fire" },
  { word: "JIGSAW", hint: "A type of puzzle" },
];

function scramble(word: string): string {
  const arr = word.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("") === word ? scramble(word) : arr.join("");
}

export default function WordScramble() {
  const [wordIdx, setWordIdx] = useState(() => Math.floor(Math.random() * WORDS.length));
  const [scrambled, setScrambled] = useState("");
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState<"idle"|"correct"|"wrong">("idle");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [active, setActive] = useState(false);

  useEffect(() => {
    setScrambled(scramble(WORDS[wordIdx].word));
    setGuess(""); setResult("idle"); setShowHint(false);
  }, [wordIdx]);

  useEffect(() => {
    if (!active) return;
    if (timeLeft <= 0) { setActive(false); setResult("wrong"); return; }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [active, timeLeft]);

  const submit = () => {
    if (guess.toUpperCase() === WORDS[wordIdx].word) {
      setResult("correct");
      setScore(s => s + (showHint ? 5 : 10) + Math.max(0, timeLeft));
      setStreak(s => s + 1);
      setActive(false);
    } else {
      setResult("wrong");
      setStreak(0);
      setActive(false);
    }
  };

  const next = () => {
    setWordIdx(Math.floor(Math.random() * WORDS.length));
    setTimeLeft(30);
    setActive(true);
  };

  const start = () => { setActive(true); setTimeLeft(30); setResult("idle"); };

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-md mx-auto p-4">
      <h2 className="text-2xl font-black text-white">🔀 Word Scramble</h2>

      <div className="flex gap-3">
        <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 text-center min-w-[70px]">
          <p className="text-2xl font-black text-yellow-400">{score}</p>
          <p className="text-slate-400 text-xs">Score</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 text-center min-w-[70px]">
          <p className="text-2xl font-black text-orange-400">🔥{streak}</p>
          <p className="text-slate-400 text-xs">Streak</p>
        </div>
        <div className={`bg-slate-800 rounded-xl p-3 border text-center min-w-[70px] ${timeLeft < 10 ? "border-red-500 animate-pulse" : "border-slate-700"}`}>
          <p className={`text-2xl font-black ${timeLeft < 10 ? "text-red-400" : "text-cyan-400"}`}>{timeLeft}s</p>
          <p className="text-slate-400 text-xs">Time</p>
        </div>
      </div>

      <div className="w-full bg-slate-800 rounded-2xl p-6 border border-slate-700 text-center">
        <p className="text-slate-400 text-sm mb-2">Unscramble this word:</p>
        <p className="text-5xl font-black tracking-[0.3em] text-purple-300 mb-4">{scrambled}</p>

        {showHint && (
          <div className="bg-blue-900/40 border border-blue-500/30 rounded-xl px-4 py-2 text-blue-300 text-sm mb-3">
            💡 {WORDS[wordIdx].hint}
          </div>
        )}

        {result === "correct" && <div className="text-3xl">🎉 <span className="text-green-400 font-black text-xl">Correct! +{(showHint ? 5 : 10) + Math.max(0, timeLeft)} pts</span></div>}
        {result === "wrong" && <div className="text-xl text-red-400 font-bold">❌ The word was: <span className="text-white font-black">{WORDS[wordIdx].word}</span></div>}
      </div>

      {result === "idle" && active && (
        <div className="w-full flex gap-2">
          <input
            autoFocus value={guess}
            onChange={e => setGuess(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            className="flex-1 bg-slate-700 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-lg font-bold uppercase text-center focus:outline-none focus:border-purple-400"
            placeholder="Your answer..."
          />
          <button onClick={submit} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black rounded-xl">✓</button>
        </div>
      )}

      <div className="flex gap-3">
        {result === "idle" && !active && (
          <button onClick={start} className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black rounded-2xl hover:brightness-110 transition text-lg">▶ Start</button>
        )}
        {result === "idle" && active && !showHint && (
          <button onClick={() => setShowHint(true)} className="px-4 py-2 bg-slate-700 text-yellow-300 font-bold rounded-xl text-sm border border-slate-600">💡 Hint (-5pts)</button>
        )}
        {result !== "idle" && (
          <button onClick={next} className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black rounded-2xl hover:brightness-110 transition">Next Word →</button>
        )}
      </div>
    </div>
  );
}
