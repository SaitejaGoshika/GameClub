import { useState, useEffect } from "react";

const EMOJIS = ["🐶", "🐱", "🦊", "🐸", "🦁", "🐯", "🐻", "🦄", "🐙", "🦋", "🌈", "⭐", "🍕", "🎸", "🚀", "💎"];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

export default function MemoryGame() {
  const [gridSize, setGridSize] = useState(4);
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [won, setWon] = useState(false);

  const initGame = (size: number) => {
    const count = (size * size) / 2;
    const emojis = shuffle(EMOJIS).slice(0, count);
    const deck = shuffle([...emojis, ...emojis]).map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
    setCards(deck);
    setFlipped([]);
    setMoves(0);
    setMatches(0);
    setTime(0);
    setRunning(false);
    setWon(false);
  };

  useEffect(() => { initGame(gridSize); }, []);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (running && !won) { t = setTimeout(() => setTime(s => s + 1), 1000); }
    return () => clearTimeout(t);
  }, [running, time, won]);

  const handleCard = (id: number) => {
    if (flipped.length === 2 || cards[id].flipped || cards[id].matched) return;
    if (!running) setRunning(true);
    const newCards = [...cards];
    newCards[id].flipped = true;
    setCards(newCards);
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);
    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newFlipped;
      if (newCards[a].emoji === newCards[b].emoji) {
        newCards[a].matched = true;
        newCards[b].matched = true;
        const newMatches = matches + 1;
        setMatches(newMatches);
        setCards([...newCards]);
        setFlipped([]);
        if (newMatches === cards.length / 2) { setWon(true); setRunning(false); }
      } else {
        setTimeout(() => {
          newCards[a].flipped = false;
          newCards[b].flipped = false;
          setCards([...newCards]);
          setFlipped([]);
        }, 900);
      }
    }
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">
        {[4, 6].map(s => (
          <button key={s} onClick={() => { setGridSize(s); initGame(s); }} className={`px-4 py-1.5 rounded-lg font-bold text-sm transition ${gridSize === s ? "bg-cyan-500 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}>{s}×{s}</button>
        ))}
      </div>
      <div className="flex gap-6 text-sm font-bold">
        <span className="text-cyan-400">Moves: {moves}</span>
        <span className="text-yellow-400">⏱ {formatTime(time)}</span>
        <span className="text-green-400">✓ {matches}/{cards.length / 2}</span>
      </div>
      {won && (
        <div className="text-center py-2">
          <p className="text-yellow-400 text-xl font-bold">🎉 You Won!</p>
          <p className="text-slate-300 text-sm">{moves} moves • {formatTime(time)}</p>
        </div>
      )}
      <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}>
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCard(card.id)}
            className={`${gridSize === 4 ? "w-16 h-16 text-3xl" : "w-12 h-12 text-xl"} rounded-xl flex items-center justify-center font-bold transition-all duration-300 border-2 ${
              card.matched ? "bg-green-500/20 border-green-500 scale-95" :
              card.flipped ? "bg-slate-600 border-cyan-400 scale-105" :
              "bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-500 hover:scale-105"
            }`}
          >
            {card.flipped || card.matched ? card.emoji : "❓"}
          </button>
        ))}
      </div>
      <button onClick={() => initGame(gridSize)} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition">
        {won ? "Play Again" : "Restart"}
      </button>
    </div>
  );
}
