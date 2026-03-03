import { useState } from "react";

const SUITS = ["♠","♥","♦","♣"];
const VALUES = ["A","K","Q","J","10","9","8","7"];

function makeDeck() {
  const deck: {suit:string;val:string;id:number}[] = [];
  let id = 0;
  for (const s of SUITS) for (const v of VALUES) { deck.push({suit:s,val:v,id:id++}); }
  return deck.sort(() => Math.random()-0.5);
}

export default function PairsCard() {
  const [deck] = useState(makeDeck);
  const [hand1, setHand1] = useState<typeof deck>([]);
  const [hand2, setHand2] = useState<typeof deck>([]);
  const [field, setField] = useState<typeof deck>([]);
  const [turn, setTurn] = useState<1|2>(1);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [message, setMessage] = useState("Ask for a card from opponent's hand!");
  const [phase, setPhase] = useState<"deal"|"play"|"done">("deal");
  const [animCard, setAnimCard] = useState<number|null>(null);

  const deal = () => {
    const d = [...deck];
    const h1: typeof deck = [], h2: typeof deck = [];
    for (let i = 0; i < 7; i++) { h1.push(d.pop()!); h2.push(d.pop()!); }
    setHand1(h1); setHand2(h2); setField(d); setPhase("play");
    setMessage("Player 1's turn — click a card in P2's hand to ask for it!");
  };

  const checkPairs = (h: typeof deck) => {
    const pairs: string[] = [];
    const remaining: typeof deck = [];
    const seen = new Map<string, typeof deck[0]>();
    for (const c of h) {
      if (seen.has(c.val)) { pairs.push(c.val); seen.delete(c.val); }
      else { seen.set(c.val, c); }
    }
    for (const c of h) { if (seen.has(c.val)) remaining.push(c); }
    return { pairs: pairs.length, remaining };
  };

  const askCard = (card: typeof deck[0]) => {
    if (phase !== "play") return;
    const askerHand = turn === 1 ? hand1 : hand2;
    const targetHand = turn === 1 ? hand2 : hand1;
    const hasVal = askerHand.some(c => c.val === card.val);
    if (!hasVal) { setMessage(`You don't have a ${card.val}! You can't ask for it.`); return; }

    setAnimCard(card.id);
    setTimeout(() => setAnimCard(null), 500);

    const found = targetHand.filter(c => c.val === card.val);
    if (found.length > 0) {
      const newTarget = targetHand.filter(c => c.val !== card.val);
      const newAsker = [...askerHand, ...found];
      const { pairs, remaining } = checkPairs(newAsker);
      if (turn === 1) {
        setScore1(s => s + pairs);
        setHand1(remaining); setHand2(newTarget);
        setMessage(`Got ${found.length} ${card.val}(s)! Made ${pairs} pair(s)! Go again!`);
      } else {
        setScore2(s => s + pairs);
        setHand2(remaining); setHand1(newTarget);
        setMessage(`Got ${found.length} ${card.val}(s)! Made ${pairs} pair(s)! Go again!`);
      }
    } else {
      // Go fish
      if (field.length > 0) {
        const drawn = field[field.length-1];
        const newField = field.slice(0,-1);
        const newAskerWithFish = [...askerHand, drawn];
        const { pairs, remaining } = checkPairs(newAskerWithFish);
        if (turn === 1) { setScore1(s=>s+pairs); setHand1(remaining); }
        else { setScore2(s=>s+pairs); setHand2(remaining); }
        setField(newField);
        setMessage(`Go Fish! Drew a ${drawn.val}${drawn.suit}. ${pairs} pair(s) scored!`);
      } else {
        setMessage("Go Fish! But the pond is empty.");
      }
      setTurn(t => t === 1 ? 2 : 1);
    }
    if ((turn===1?hand2:hand1).length===0||(turn===1?hand1:hand2).length===0) setPhase("done");
  };

  const CardComp = ({c, onClick, glow}: {c:typeof deck[0]; onClick?:()=>void; glow?:boolean}) => (
    <button onClick={onClick} className={`w-10 h-14 sm:w-12 sm:h-16 rounded-lg border-2 flex flex-col items-center justify-center font-black text-xs sm:text-sm transition-all select-none
      ${c.suit==="♥"||c.suit==="♦"?"text-red-400":"text-slate-200"}
      ${glow?"border-yellow-400 shadow-lg shadow-yellow-400/40 scale-110":"border-slate-600 bg-slate-800 hover:border-indigo-400 hover:scale-105"}
      bg-slate-800`}>
      <span>{c.val}</span>
      <span>{c.suit}</span>
    </button>
  );

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-lg mx-auto p-4">
      <h2 className="text-2xl font-black text-white">🃏 Go Fish!</h2>

      {phase === "deal" && (
        <div className="text-center">
          <p className="text-slate-400 mb-4 text-sm">Classic 2-player Go Fish card game! Match pairs to win.</p>
          <button onClick={deal} className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl text-lg hover:brightness-110 transition">Deal Cards</button>
        </div>
      )}

      {phase !== "deal" && (
        <>
          <div className="flex gap-4 w-full justify-center">
            <div className={`bg-slate-800 rounded-xl p-3 border-2 text-center min-w-[90px] ${turn===1?"border-yellow-400":"border-slate-700"}`}>
              <p className="text-xl font-black text-yellow-400">{score1}</p>
              <p className="text-slate-400 text-xs">P1 Pairs</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 text-center min-w-[70px]">
              <p className="text-xl font-black text-cyan-400">{field.length}</p>
              <p className="text-slate-400 text-xs">🎴 Pond</p>
            </div>
            <div className={`bg-slate-800 rounded-xl p-3 border-2 text-center min-w-[90px] ${turn===2?"border-yellow-400":"border-slate-700"}`}>
              <p className="text-xl font-black text-pink-400">{score2}</p>
              <p className="text-slate-400 text-xs">P2 Pairs</p>
            </div>
          </div>

          <div className={`w-full text-center text-sm font-bold px-4 py-2 rounded-xl ${turn===1?"text-yellow-300 bg-yellow-900/30":"text-pink-300 bg-pink-900/30"}`}>
            {turn===1?"👤 Player 1":"👤 Player 2"}: {message}
          </div>

          {/* P2 Hand (clickable by P1) */}
          <div className="w-full bg-slate-900 rounded-xl p-3 border border-pink-500/30">
            <p className="text-pink-400 text-xs font-bold mb-2">P2's Hand ({hand2.length} cards) {turn===1?"← Click to ask":""}:</p>
            <div className="flex flex-wrap gap-1">
              {hand2.map(c => <CardComp key={c.id} c={c} glow={animCard===c.id} onClick={turn===1?()=>askCard(c):undefined} />)}
            </div>
          </div>

          {/* P1 Hand (clickable by P2) */}
          <div className="w-full bg-slate-900 rounded-xl p-3 border border-yellow-500/30">
            <p className="text-yellow-400 text-xs font-bold mb-2">P1's Hand ({hand1.length} cards) {turn===2?"← Click to ask":""}:</p>
            <div className="flex flex-wrap gap-1">
              {hand1.map(c => <CardComp key={c.id} c={c} glow={animCard===c.id} onClick={turn===2?()=>askCard(c):undefined} />)}
            </div>
          </div>
        </>
      )}

      {phase === "done" && (
        <div className="w-full bg-slate-800 rounded-2xl p-6 border border-slate-700 text-center">
          <p className="text-3xl mb-2">{score1>score2?"🏆":"🏆"}</p>
          <p className="text-white font-black text-xl">{score1>score2?"Player 1 Wins!":score2>score1?"Player 2 Wins!":"It's a Tie!"}</p>
          <p className="text-slate-400">P1: {score1} pairs | P2: {score2} pairs</p>
          <button onClick={() => window.location.reload()} className="mt-3 px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl">Play Again</button>
        </div>
      )}
    </div>
  );
}
