import { useState } from "react";

type Choice = "Rock" | "Paper" | "Scissors";
type Brain = { [key: string]: { [key: string]: number } };

const CHOICES: Choice[] = ["Rock", "Paper", "Scissors"];
const BEATS: Record<Choice, Choice> = { Rock: "Scissors", Scissors: "Paper", Paper: "Rock" };
const EMOJI: Record<Choice, string> = { Rock: "🪨", Paper: "📄", Scissors: "✂️" };

function buildDefaultBrain(): Brain {
  const b: Brain = {};
  for (const h1 of CHOICES) for (const h2 of CHOICES) {
    const key = `${h1},${h2}`;
    b[key] = { Rock: 1, Paper: 1, Scissors: 1 };
  }
  return b;
}

export default function AIMindReader() {
  const [brain, setBrain] = useState<Brain>(buildDefaultBrain());
  const [history, setHistory] = useState<Choice[]>([]);
  const [result, setResult] = useState("");
  const [scores, setScores] = useState({ player: 0, ai: 0, tie: 0 });
  const [aiPick, setAiPick] = useState<Choice | null>(null);
  const [playerPick, setPlayerPick] = useState<Choice | null>(null);
  const [thinking, setThinking] = useState(false);
  const [streak, setStreak] = useState(0);
  const [aiMessage, setAiMessage] = useState("I'm reading your mind... make a move!");

  const getAiPrediction = (): Choice => {
    if (history.length < 2) return CHOICES[Math.floor(Math.random() * 3)];
    const last2 = `${history[history.length - 2]},${history[history.length - 1]}`;
    const counts = brain[last2] || { Rock: 1, Paper: 1, Scissors: 1 };
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const rand = Math.random() * total;
    let cum = 0;
    for (const c of CHOICES) { cum += counts[c]; if (rand < cum) return BEATS[c]; }
    return CHOICES[Math.floor(Math.random() * 3)];
  };

  const play = (choice: Choice) => {
    if (thinking) return;
    setThinking(true);
    setPlayerPick(choice);
    setTimeout(() => {
      const ai = getAiPrediction();
      setAiPick(ai);
      if (history.length >= 2) {
        const last2 = `${history[history.length - 2]},${history[history.length - 1]}`;
        setBrain(prev => {
          const nb = { ...prev };
          nb[last2] = { ...nb[last2], [choice]: (nb[last2][choice] || 0) + 1 };
          return nb;
        });
      }
      const newHistory = [...history, choice];
      setHistory(newHistory);

      let res = "";
      if (choice === ai) {
        res = "🤝 Tie!";
        setScores(s => ({ ...s, tie: s.tie + 1 }));
        setStreak(0);
        setAiMessage("A tie! I'm recalibrating...");
      } else if (BEATS[choice] === ai) {
        res = "🎉 You Win!";
        setScores(s => ({ ...s, player: s.player + 1 }));
        setStreak(p => {
          const ns = p + 1;
          if (ns >= 3) setAiMessage("Impressive! But I'm learning fast...");
          else setAiMessage("You got lucky... for now.");
          return ns;
        });
      } else {
        res = "🤖 AI Wins!";
        setScores(s => ({ ...s, ai: s.ai + 1 }));
        setStreak(0);
        setAiMessage("I read your mind! My neural net predicted that.");
      }
      setResult(res);
      setThinking(false);
    }, 800);
  };

  const reset = () => {
    setBrain(buildDefaultBrain());
    setHistory([]);
    setResult("");
    setScores({ player: 0, ai: 0, tie: 0 });
    setAiPick(null);
    setPlayerPick(null);
    setStreak(0);
    setAiMessage("I'm reading your mind... make a move!");
  };

  const total = scores.player + scores.ai + scores.tie;
  const aiAccuracy = total > 0 ? Math.round((scores.ai / total) * 100) : 0;

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto p-2">
      <div className="text-center">
        <h2 className="text-xl font-black text-purple-300">🧠 AI Mind Reader Duel</h2>
        <p className="text-slate-400 text-xs mt-1">The AI learns your patterns and predicts your next move!</p>
      </div>
      <div className="w-full bg-purple-900/30 border border-purple-500/30 rounded-xl p-3 text-center">
        <p className="text-purple-300 text-sm font-semibold italic">"{aiMessage}"</p>
        <p className="text-slate-500 text-xs mt-1">AI Accuracy: <span className="text-purple-400 font-bold">{aiAccuracy}%</span> | Rounds: {total}</p>
      </div>
      <div className="grid grid-cols-3 gap-2 w-full">
        <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-2 text-center">
          <p className="text-2xl font-black text-blue-400">{scores.player}</p>
          <p className="text-xs text-slate-400">You</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-2 text-center">
          <p className="text-2xl font-black text-slate-400">{scores.tie}</p>
          <p className="text-xs text-slate-400">Ties</p>
        </div>
        <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-2 text-center">
          <p className="text-2xl font-black text-red-400">{scores.ai}</p>
          <p className="text-xs text-slate-400">AI</p>
        </div>
      </div>
      <div className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 flex items-center justify-between">
        <div className="text-center flex-1">
          <p className="text-xs text-slate-500 mb-1">You</p>
          <div className="text-5xl h-14 flex items-center justify-center">
            {thinking ? "🤔" : playerPick ? EMOJI[playerPick] : "❓"}
          </div>
        </div>
        <div className="text-center px-2">
          <p className="text-lg font-black text-slate-500">VS</p>
          {result && <p className="text-xs font-bold mt-1 text-yellow-300">{result}</p>}
        </div>
        <div className="text-center flex-1">
          <p className="text-xs text-slate-500 mb-1">AI</p>
          <div className="text-5xl h-14 flex items-center justify-center">
            {thinking ? "💭" : aiPick ? EMOJI[aiPick] : "🤖"}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 w-full">
        {CHOICES.map(c => (
          <button key={c} onClick={() => play(c)} disabled={thinking}
            className="flex flex-col items-center gap-1 p-3 bg-slate-800 hover:bg-purple-900/40 border border-slate-700 hover:border-purple-500 rounded-xl transition-all active:scale-95 disabled:opacity-50">
            <span className="text-3xl">{EMOJI[c]}</span>
            <span className="text-xs font-bold text-slate-300">{c}</span>
          </button>
        ))}
      </div>
      {streak >= 2 && (
        <div className="bg-yellow-900/30 border border-yellow-500/40 rounded-xl p-2 text-center w-full">
          <p className="text-yellow-300 text-sm font-bold">🔥 {streak} Win Streak!</p>
        </div>
      )}
      <button onClick={reset} className="text-xs text-slate-500 hover:text-slate-300 underline transition">Reset & Wipe AI Memory</button>
    </div>
  );
}
