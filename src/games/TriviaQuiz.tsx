import { useState } from "react";

const QUESTIONS = [
  { q: "What is the capital of France?", options: ["London","Berlin","Paris","Madrid"], a: 2 },
  { q: "How many sides does a hexagon have?", options: ["5","6","7","8"], a: 1 },
  { q: "What is the largest planet in our solar system?", options: ["Saturn","Neptune","Jupiter","Uranus"], a: 2 },
  { q: "Who painted the Mona Lisa?", options: ["Picasso","Michelangelo","Da Vinci","Raphael"], a: 2 },
  { q: "What is the chemical symbol for Gold?", options: ["Ag","Fe","Au","Cu"], a: 2 },
  { q: "How many bones are in the human body?", options: ["186","206","226","246"], a: 1 },
  { q: "What year did World War II end?", options: ["1943","1944","1945","1946"], a: 2 },
  { q: "What is the fastest land animal?", options: ["Lion","Cheetah","Horse","Leopard"], a: 1 },
  { q: "Which ocean is the largest?", options: ["Atlantic","Indian","Arctic","Pacific"], a: 3 },
  { q: "What is the square root of 144?", options: ["11","12","13","14"], a: 1 },
  { q: "Which planet is known as the Red Planet?", options: ["Venus","Mars","Jupiter","Saturn"], a: 1 },
  { q: "How many continents are there on Earth?", options: ["5","6","7","8"], a: 2 },
  { q: "What gas do plants absorb from the atmosphere?", options: ["Oxygen","Nitrogen","CO₂","Hydrogen"], a: 2 },
  { q: "Who wrote Romeo and Juliet?", options: ["Dickens","Shakespeare","Austen","Hemingway"], a: 1 },
  { q: "What is the powerhouse of the cell?", options: ["Nucleus","Ribosome","Mitochondria","Golgi"], a: 2 },
  { q: "In which country was the Eiffel Tower built?", options: ["Italy","UK","Spain","France"], a: 3 },
  { q: "How many players are on a basketball team (on court)?", options: ["4","5","6","7"], a: 1 },
  { q: "What is the hardest natural substance?", options: ["Gold","Platinum","Diamond","Quartz"], a: 2 },
  { q: "How many zeros in a billion?", options: ["6","7","8","9"], a: 3 },
  { q: "What colour is the sky on a clear day?", options: ["Green","Red","Blue","Yellow"], a: 2 },
];

export default function TriviaQuiz() {
  const [questions] = useState(() => [...QUESTIONS].sort(() => Math.random()-0.5).slice(0,10));
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number|null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [answers, setAnswers] = useState<(number|null)[]>([]);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  const q = questions[current];

  const choose = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === q.a;
    const newAnswers = [...answers, idx];
    setAnswers(newAnswers);
    if (correct) {
      setScore(s => s + 10);
      const ns = streak + 1;
      setStreak(ns);
      setMaxStreak(m => Math.max(m, ns));
    } else {
      setStreak(0);
    }
  };

  const next = () => {
    if (current + 1 >= questions.length) { setDone(true); return; }
    setCurrent(c => c + 1);
    setSelected(null);
  };

  const restart = () => {
    setCurrent(0); setSelected(null); setScore(0); setDone(false);
    setAnswers([]); setStreak(0); setMaxStreak(0);
  };

  if (done) {
    const pct = Math.round((score / (questions.length * 10)) * 100);
    return (
      <div className="flex flex-col items-center gap-5 w-full max-w-lg mx-auto p-4">
        <h2 className="text-2xl font-black text-white">📊 Quiz Results</h2>
        <div className="w-full bg-slate-800 rounded-2xl p-6 border border-slate-700 text-center">
          <p className="text-6xl mb-3">{pct>=80?"🏆":pct>=60?"🎉":pct>=40?"👍":"😅"}</p>
          <p className="text-4xl font-black text-white mb-1">{score}/{questions.length*10}</p>
          <p className="text-slate-400 mb-4">{pct}% correct • Max streak: {maxStreak}</p>
          <div className="w-full bg-slate-700 rounded-full h-4 mb-6">
            <div className={`h-4 rounded-full ${pct>=80?"bg-green-500":pct>=60?"bg-yellow-500":"bg-red-500"}`} style={{width:`${pct}%`}} />
          </div>
          {questions.map((q, i) => (
            <div key={i} className={`flex items-center gap-2 p-2 rounded-lg mb-1 text-sm text-left ${answers[i]===q.a?"bg-green-900/30":"bg-red-900/30"}`}>
              <span>{answers[i]===q.a?"✅":"❌"}</span>
              <span className="text-slate-300 flex-1">{q.q}</span>
              <span className="text-xs font-bold text-slate-400">{q.options[q.a]}</span>
            </div>
          ))}
        </div>
        <button onClick={restart} className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black rounded-2xl hover:brightness-110 transition">Play Again</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-lg mx-auto p-4">
      <h2 className="text-2xl font-black text-white">🎯 Trivia Quiz</h2>

      <div className="flex gap-3 w-full justify-between">
        <span className="text-slate-400 text-sm font-bold">{current+1}/{questions.length}</span>
        <span className="text-yellow-400 font-black text-sm">Score: {score}</span>
        {streak > 1 && <span className="text-orange-400 font-bold text-sm">🔥 {streak} streak!</span>}
      </div>

      <div className="w-full bg-slate-700 rounded-full h-2">
        <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all" style={{width:`${((current)/questions.length)*100}%`}} />
      </div>

      <div className="w-full bg-slate-800 rounded-2xl p-6 border border-slate-700">
        <p className="text-white font-bold text-lg leading-relaxed mb-6">{q.q}</p>
        <div className="grid grid-cols-1 gap-3">
          {q.options.map((opt, i) => {
            let style = "bg-slate-700 border-slate-600 text-white hover:bg-slate-600";
            if (selected !== null) {
              if (i === q.a) style = "bg-green-700 border-green-500 text-white";
              else if (i === selected) style = "bg-red-700 border-red-500 text-white";
              else style = "bg-slate-800 border-slate-700 text-slate-500";
            }
            return (
              <button key={i} onClick={() => choose(i)}
                className={`w-full px-4 py-3 rounded-xl border-2 font-bold text-left transition-all ${style}`}>
                <span className="text-slate-400 mr-2">{["A","B","C","D"][i]}.</span> {opt}
              </button>
            );
          })}
        </div>
      </div>

      {selected !== null && (
        <button onClick={next} className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black rounded-2xl hover:brightness-110 transition">
          {current+1 >= questions.length ? "See Results 🏆" : "Next Question →"}
        </button>
      )}
    </div>
  );
}
