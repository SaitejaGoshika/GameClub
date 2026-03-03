import { useState } from "react";

type Choice = "rock" | "paper" | "scissors";

const CHOICES: Choice[] = ["rock", "paper", "scissors"];
const EMOJI: Record<Choice, string> = { rock: "🪨", paper: "📄", scissors: "✂️" };
const LABELS: Record<Choice, string> = { rock: "Rock", paper: "Paper", scissors: "Scissors" };

const BEATS: Record<Choice, Choice> = { rock: "scissors", paper: "rock", scissors: "paper" };

function getResult(player: Choice, cpu: Choice): "win" | "lose" | "draw" {
  if (player === cpu) return "draw";
  return BEATS[player] === cpu ? "win" : "lose";
}

const RESULTS_MSG = {
  win: { text: "You Win! 🎉", color: "text-green-400" },
  lose: { text: "You Lose! 😢", color: "text-red-400" },
  draw: { text: "It's a Draw! 🤝", color: "text-yellow-400" },
};

const HISTORY_LIMIT = 6;

export default function RockPaperScissors() {
  const [score, setScore] = useState({ player: 0, cpu: 0, draws: 0 });
  const [round, setRound] = useState<{ player: Choice; cpu: Choice; result: "win" | "lose" | "draw" } | null>(null);
  const [history, setHistory] = useState<typeof round[]>([]);
  const [animating, setAnimating] = useState(false);
  const [cpuDisplay, setCpuDisplay] = useState<string>("❓");

  const play = (choice: Choice) => {
    if (animating) return;
    setAnimating(true);
    setCpuDisplay("🔄");

    let flashes = 0;
    const flashInterval = setInterval(() => {
      setCpuDisplay(EMOJI[CHOICES[Math.floor(Math.random() * 3)]]);
      flashes++;
      if (flashes >= 8) {
        clearInterval(flashInterval);
        const cpu = CHOICES[Math.floor(Math.random() * 3)];
        setCpuDisplay(EMOJI[cpu]);
        const result = getResult(choice, cpu);
        const r = { player: choice, cpu, result };
        setRound(r);
        setScore(s => ({
          player: s.player + (result === "win" ? 1 : 0),
          cpu: s.cpu + (result === "lose" ? 1 : 0),
          draws: s.draws + (result === "draw" ? 1 : 0),
        }));
        setHistory(h => [r, ...h].slice(0, HISTORY_LIMIT));
        setAnimating(false);
      }
    }, 80);
  };

  const reset = () => {
    setScore({ player: 0, cpu: 0, draws: 0 });
    setRound(null);
    setHistory([]);
    setCpuDisplay("❓");
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
      <h2 className="text-2xl font-black text-white">Rock Paper Scissors</h2>

      {/* Score Board */}
      <div className="grid grid-cols-3 gap-3 w-full">
        <div className="bg-green-900/30 border border-green-500/30 rounded-xl p-3 text-center">
          <p className="text-xs text-slate-400 mb-1">You</p>
          <p className="text-3xl font-black text-green-400">{score.player}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-center">
          <p className="text-xs text-slate-400 mb-1">Draws</p>
          <p className="text-3xl font-black text-yellow-400">{score.draws}</p>
        </div>
        <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-3 text-center">
          <p className="text-xs text-slate-400 mb-1">CPU</p>
          <p className="text-3xl font-black text-red-400">{score.cpu}</p>
        </div>
      </div>

      {/* Battle Arena */}
      <div className="flex items-center justify-around w-full bg-slate-800 rounded-2xl p-6 border border-slate-700">
        <div className="text-center">
          <p className="text-xs text-slate-400 mb-2">You</p>
          <div className="text-6xl transition-transform">
            {round ? EMOJI[round.player] : "❔"}
          </div>
        </div>
        <div className="text-slate-600 font-black text-2xl">VS</div>
        <div className="text-center">
          <p className="text-xs text-slate-400 mb-2">CPU</p>
          <div className="text-6xl">{cpuDisplay}</div>
        </div>
      </div>

      {/* Result */}
      {round && !animating && (
        <div className={`text-2xl font-black ${RESULTS_MSG[round.result].color} animate-bounce`}>
          {RESULTS_MSG[round.result].text}
        </div>
      )}

      {/* Choices */}
      <div className="flex gap-4">
        {CHOICES.map(c => (
          <button
            key={c}
            onClick={() => play(c)}
            disabled={animating}
            className="flex flex-col items-center gap-2 p-4 bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 hover:border-slate-400 rounded-2xl transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
          >
            <span className="text-4xl">{EMOJI[c]}</span>
            <span className="text-xs text-slate-400 font-bold">{LABELS[c]}</span>
          </button>
        ))}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="w-full">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Recent Rounds</p>
          <div className="flex gap-2 flex-wrap">
            {history.map((h, i) => h && (
              <div key={i} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold border ${
                h.result === "win" ? "bg-green-900/30 border-green-500/30 text-green-400" :
                h.result === "lose" ? "bg-red-900/30 border-red-500/30 text-red-400" :
                "bg-slate-800 border-slate-700 text-yellow-400"
              }`}>
                {EMOJI[h.player]} vs {EMOJI[h.cpu]}
                <span className="ml-1">{h.result === "win" ? "✓" : h.result === "lose" ? "✗" : "="}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={reset} className="text-sm text-slate-500 hover:text-slate-300 transition underline">
        Reset Score
      </button>
    </div>
  );
}
