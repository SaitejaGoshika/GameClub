import { useState, useCallback } from "react";

const SUITS = ["♠️", "♥️", "♦️", "♣️"];
const VALUES = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];

interface Card { suit: string; value: string; rank: number; }

function makeDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS)
    for (let r = 0; r < VALUES.length; r++)
      deck.push({ suit, value: VALUES[r], rank: r + 2 });
  return deck.sort(() => Math.random() - 0.5);
}

function CardDisplay({ card, hidden = false }: { card: Card | null; hidden?: boolean }) {
  if (!card || hidden) return (
    <div className="w-24 h-36 sm:w-28 sm:h-40 rounded-2xl bg-gradient-to-br from-violet-800 to-purple-900 border-2 border-violet-600 flex items-center justify-center shadow-xl">
      <span className="text-4xl">🂠</span>
    </div>
  );
  const red = card.suit === "♥️" || card.suit === "♦️";
  return (
    <div className={`w-24 h-36 sm:w-28 sm:h-40 rounded-2xl bg-white border-2 ${red ? "border-red-300" : "border-slate-300"} flex flex-col items-center justify-center shadow-xl relative`}>
      <span className={`absolute top-2 left-2 text-base font-black ${red ? "text-red-500" : "text-slate-800"}`}>{card.value}</span>
      <span className="text-4xl">{card.suit}</span>
      <span className={`absolute bottom-2 right-2 text-base font-black rotate-180 ${red ? "text-red-500" : "text-slate-800"}`}>{card.value}</span>
    </div>
  );
}

export default function CardWar() {
  const [deck, setDeck] = useState<Card[]>(() => makeDeck());
  const [playerCard, setPlayerCard] = useState<Card | null>(null);
  const [cpuCard, setCpuCard] = useState<Card | null>(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [cpuScore, setCpuScore] = useState(0);
  const [round, setRound] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [showCpu, setShowCpu] = useState(false);
  const [streak, setStreak] = useState(0);
  const MAX_ROUNDS = 20;

  const draw = useCallback(() => {
    if (gameOver || deck.length < 2) return;
    const newDeck = [...deck];
    const pc = newDeck.pop()!;
    const cc = newDeck.pop()!;
    setDeck(newDeck);
    setPlayerCard(pc);
    setCpuCard(cc);
    setShowCpu(false);
    setTimeout(() => {
      setShowCpu(true);
      const newRound = round + 1;
      setRound(newRound);
      let res: string;
      let newStreak = streak;
      if (pc.rank > cc.rank) { setPlayerScore(s => s + 1); res = "✅ You Win the Round!"; newStreak++; }
      else if (cc.rank > pc.rank) { setCpuScore(s => s + 1); res = "❌ CPU Wins the Round!"; newStreak = 0; }
      else { setPlayerScore(s => s + 1); setCpuScore(s => s + 1); res = "🤝 WAR! Both score!"; }
      setStreak(newStreak);
      if (newStreak >= 3) res += ` 🔥 ${newStreak} streak!`;
      setResult(res);
      if (newRound >= MAX_ROUNDS) setGameOver(true);
    }, 600);
  }, [deck, round, streak, gameOver]);

  const reset = useCallback(() => {
    setDeck(makeDeck());
    setPlayerCard(null); setCpuCard(null);
    setPlayerScore(0); setCpuScore(0);
    setRound(0); setResult(null); setGameOver(false); setShowCpu(false); setStreak(0);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-black text-white">🃏 Card War</h2>
        <p className="text-slate-400 text-xs mt-1">Draw cards — highest card wins the round! {MAX_ROUNDS} rounds total.</p>
      </div>

      <div className="flex gap-4 w-full justify-center">
        {[
          { label: "You", score: playerScore, color: "text-green-400", bg: "bg-green-900/30" },
          { label: "Round", score: `${round}/${MAX_ROUNDS}`, color: "text-yellow-400", bg: "bg-yellow-900/30" },
          { label: "CPU", score: cpuScore, color: "text-red-400", bg: "bg-red-900/30" },
        ].map(s => (
          <div key={s.label} className={`flex-1 rounded-xl p-3 text-center ${s.bg} border border-slate-700`}>
            <p className={`font-black text-2xl ${s.color}`}>{s.score}</p>
            <p className="text-slate-400 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-8 items-center justify-center w-full py-4">
        <div className="flex flex-col items-center gap-2">
          <p className="text-slate-400 text-xs font-bold uppercase">You</p>
          <CardDisplay card={playerCard} />
        </div>
        <div className="text-3xl font-black text-slate-500">VS</div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-slate-400 text-xs font-bold uppercase">CPU</p>
          <CardDisplay card={cpuCard} hidden={!showCpu} />
        </div>
      </div>

      {result && (
        <div className={`w-full rounded-xl px-4 py-3 text-center font-bold text-sm border ${
          result.includes("You Win") ? "bg-green-900/40 border-green-600 text-green-300" :
          result.includes("CPU") ? "bg-red-900/40 border-red-600 text-red-300" :
          "bg-yellow-900/40 border-yellow-600 text-yellow-300"}`}>
          {result}
        </div>
      )}

      {gameOver ? (
        <div className="w-full bg-slate-900 border-2 border-violet-500/40 rounded-2xl p-6 text-center">
          <p className="text-5xl mb-2">{playerScore > cpuScore ? "🏆" : playerScore < cpuScore ? "💀" : "🤝"}</p>
          <h3 className="text-2xl font-black text-white mb-1">
            {playerScore > cpuScore ? "You Win!" : playerScore < cpuScore ? "CPU Wins!" : "Draw!"}
          </h3>
          <p className="text-slate-400 text-sm mb-4">Final: You {playerScore} — CPU {cpuScore}</p>
          <button onClick={reset} className="bg-gradient-to-r from-violet-600 to-purple-600 text-white font-black px-8 py-3 rounded-xl hover:brightness-110 transition">Play Again</button>
        </div>
      ) : (
        <button onClick={draw}
          className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-black text-xl rounded-2xl hover:brightness-110 transition active:scale-95 shadow-lg shadow-purple-900/40">
          {playerCard ? "Draw Again 🃏" : "Draw Card 🃏"}
        </button>
      )}

      {streak >= 3 && !gameOver && (
        <p className="text-orange-400 font-bold animate-bounce">🔥 {streak} Win Streak!</p>
      )}
    </div>
  );
}
