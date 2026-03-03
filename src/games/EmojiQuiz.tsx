import { useState, useCallback } from "react";

const PUZZLES = [
  { emojis: "🦁👑", answer: "lion king", hint: "Disney classic" },
  { emojis: "🕷️🧑", answer: "spider man", hint: "Marvel superhero" },
  { emojis: "❄️👸", answer: "frozen", hint: "Let it go!" },
  { emojis: "🔫🌌", answer: "star wars", hint: "May the force be with you" },
  { emojis: "🦇🧑", answer: "batman", hint: "Dark knight" },
  { emojis: "🧙🔮", answer: "harry potter", hint: "Hogwarts wizard" },
  { emojis: "🚢❄️", answer: "titanic", hint: "Sinking ship romance" },
  { emojis: "🦖🌴", answer: "jurassic park", hint: "Dinosaur theme park" },
  { emojis: "🧟🧠", answer: "zombie", hint: "Undead creature" },
  { emojis: "🐠🔍", answer: "finding nemo", hint: "Just keep swimming" },
  { emojis: "👸🐉", answer: "shrek", hint: "Animated fairy tale" },
  { emojis: "🤖🌮", answer: "transformer", hint: "More than meets the eye" },
  { emojis: "🌹💀", answer: "beauty and the beast", hint: "Tale as old as time" },
  { emojis: "🐒👑", answer: "king kong", hint: "Giant ape" },
  { emojis: "🧑🌊🏄", answer: "surf", hint: "Riding waves" },
  { emojis: "🍕🗼", answer: "italy", hint: "European country" },
  { emojis: "🌮🎸", answer: "coco", hint: "Pixar Day of Dead" },
  { emojis: "🦊🌲", answer: "fox", hint: "Sly forest animal" },
  { emojis: "🏋️🦾", answer: "iron man", hint: "Tony Stark" },
  { emojis: "🐧🏔️", answer: "happy feet", hint: "Dancing penguin movie" },
  { emojis: "🌻😊", answer: "sunflower", hint: "Bright yellow flower" },
  { emojis: "🎸🤘", answer: "rock music", hint: "Head banging genre" },
  { emojis: "🏰👻", answer: "haunted house", hint: "Scary dwelling" },
  { emojis: "🐝🎬", answer: "bee movie", hint: "Animated bee drama" },
  { emojis: "🦸‍♂️🦸‍♀️", answer: "superhero", hint: "Caped crusader" },
];

export default function EmojiQuiz() {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * PUZZLES.length));
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [total, setTotal] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [usedIdxs, setUsedIdxs] = useState<Set<number>>(new Set([idx]));

  const puzzle = PUZZLES[idx];

  const nextPuzzle = useCallback((currentIdxs: Set<number>) => {
    let ni = Math.floor(Math.random() * PUZZLES.length);
    let tries = 0;
    while (currentIdxs.has(ni) && tries < 30) { ni = Math.floor(Math.random() * PUZZLES.length); tries++; }
    if (currentIdxs.size >= PUZZLES.length) { setUsedIdxs(new Set([ni])); }
    else { setUsedIdxs(new Set([...currentIdxs, ni])); }
    setIdx(ni);
    setInput("");
    setShowHint(false);
    setFeedback(null);
  }, []);

  const submit = useCallback(() => {
    if (!input.trim()) return;
    const guess = input.trim().toLowerCase();
    const correct = puzzle.answer.toLowerCase();
    const words = correct.split(" ");
    const isCorrect = guess === correct || words.some(w => guess === w && w.length > 3);
    setTotal(t => t + 1);
    if (isCorrect) {
      const pts = showHint ? 5 : 10;
      setScore(s => s + pts);
      setStreak(s => s + 1);
      setFeedback("correct");
      setTimeout(() => nextPuzzle(usedIdxs), 800);
    } else {
      setStreak(0);
      setFeedback("wrong");
      setTimeout(() => setFeedback(null), 600);
    }
  }, [input, puzzle, showHint, usedIdxs, nextPuzzle]);

  const skip = useCallback(() => {
    setSkipped(s => s + 1);
    setStreak(0);
    nextPuzzle(usedIdxs);
  }, [usedIdxs, nextPuzzle]);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-black text-white">🤔 Emoji Quiz</h2>
        <p className="text-slate-400 text-xs mt-1">Guess the movie, show, or phrase from the emojis!</p>
      </div>

      <div className="flex gap-3 w-full justify-center">
        {[
          { label: "Score", value: score, color: "text-yellow-400" },
          { label: "Streak", value: streak >= 3 ? `🔥${streak}` : streak, color: "text-orange-400" },
          { label: "Correct", value: `${total - skipped}/${total}`, color: "text-green-400" },
        ].map(s => (
          <div key={s.label} className="flex-1 bg-slate-800 rounded-xl p-2 text-center border border-slate-700">
            <p className={`font-black text-lg ${s.color}`}>{s.value}</p>
            <p className="text-slate-500 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      <div className={`w-full rounded-3xl p-8 text-center border-2 transition-all duration-200 ${
        feedback === "correct" ? "bg-green-900/40 border-green-500" :
        feedback === "wrong" ? "bg-red-900/40 border-red-500" :
        "bg-slate-900 border-slate-700"}`}>
        <p className="text-7xl mb-2 leading-none">{puzzle.emojis}</p>
        {feedback === "correct" && <p className="text-green-400 font-bold text-sm mt-2">✅ Correct! +{showHint ? 5 : 10} pts</p>}
        {feedback === "wrong" && <p className="text-red-400 font-bold text-sm mt-2">❌ Try again!</p>}
        {showHint && !feedback && <p className="text-yellow-400 text-sm mt-2 font-semibold">💡 {puzzle.hint}</p>}
      </div>

      <input type="text" value={input} onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === "Enter" && submit()}
        placeholder="Type your guess..." autoComplete="off" autoCorrect="off"
        className="w-full bg-slate-800 border-2 border-slate-600 focus:border-violet-500 rounded-xl px-4 py-3 text-white text-base outline-none transition placeholder-slate-600" />

      <div className="flex gap-3 w-full">
        <button onClick={submit}
          className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-black rounded-xl hover:brightness-110 transition active:scale-95">
          Submit ✓
        </button>
        {!showHint && (
          <button onClick={() => setShowHint(true)}
            className="px-4 py-3 bg-yellow-900/40 border border-yellow-600/40 text-yellow-400 font-bold rounded-xl hover:bg-yellow-900/60 transition text-sm">
            💡 Hint
          </button>
        )}
        <button onClick={skip}
          className="px-4 py-3 bg-slate-800 border border-slate-600 text-slate-400 font-bold rounded-xl hover:bg-slate-700 transition text-sm">
          Skip →
        </button>
      </div>

      <div className="w-full bg-slate-800/50 rounded-xl p-3 text-center border border-slate-700">
        <p className="text-slate-500 text-xs">#{idx + 1} of {PUZZLES.length} puzzles</p>
        <div className="flex gap-1 mt-2 justify-center flex-wrap">
          {PUZZLES.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${usedIdxs.has(i) ? "bg-violet-500" : "bg-slate-700"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
