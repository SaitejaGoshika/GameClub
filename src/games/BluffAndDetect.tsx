import { useState } from "react";

type Card = { value: number; suit: string };
const SUITS = ["♠","♥","♦","♣"];
const VALUES = [2,3,4,5,6,7,8,9,10,11,12,13,14]; // 11=J,12=Q,13=K,14=A
const VALUE_NAMES: Record<number,string> = {2:"2",3:"3",4:"4",5:"5",6:"6",7:"7",8:"8",9:"9",10:"10",11:"J",12:"Q",13:"K",14:"A"};

function makeDeck(): Card[] {
  const d: Card[] = [];
  for (const s of SUITS) for (const v of VALUES) d.push({value:v, suit:s});
  return d.sort(() => Math.random()-0.5);
}

function dealHands(): [Card[], Card[]] {
  const deck = makeDeck();
  return [deck.slice(0,5), deck.slice(5,10)];
}

function handRank(hand: Card[]): [number, string] {
  const vals = hand.map(c=>c.value).sort((a,b)=>b-a);
  const suits = hand.map(c=>c.suit);
  const isFlush = new Set(suits).size === 1;
  const isStraight = vals[0]-vals[4]===4 && new Set(vals).size===5;
  const counts: Record<number,number> = {};
  for(const v of vals) counts[v]=(counts[v]||0)+1;
  const groups = Object.values(counts).sort((a,b)=>b-a);

  if (isFlush && isStraight) return [8, "Straight Flush"];
  if (groups[0]===4) return [7, "Four of a Kind"];
  if (groups[0]===3 && groups[1]===2) return [6, "Full House"];
  if (isFlush) return [5, "Flush"];
  if (isStraight) return [4, "Straight"];
  if (groups[0]===3) return [3, "Three of a Kind"];
  if (groups[0]===2 && groups[1]===2) return [2, "Two Pair"];
  if (groups[0]===2) return [1, "One Pair"];
  return [0, `High Card (${VALUE_NAMES[vals[0]]})`];
}

export default function BluffAndDetect() {
  const [[pHand, aHand], setHands] = useState<[Card[], Card[]]>(dealHands);
  const [phase, setPhase] = useState<"bet"|"reveal">("bet");
  const [pBet, setPBet] = useState(10);
  const [pChips, setPChips] = useState(100);
  const [aChips, setAChips] = useState(100);
  const [result, setResult] = useState("");
  const [aAction, setAAction] = useState("");
  const [pot, setPot] = useState(0);
  const [selectedCard, setSelectedCard] = useState<number|null>(null);
  const [discarded, setDiscarded] = useState<boolean[]>([false,false,false,false,false]);
  const [round, setRound] = useState(1);

  const [, ] = handRank(pHand.filter((_,i)=>!discarded[i]));
  const [aRank, aRankName] = handRank(aHand);

  const aiBluffChance = aRank < 2 ? 0.5 : aRank < 4 ? 0.2 : 0.05;
  const aiBluffs = Math.random() < aiBluffChance;

  const handleBet = (action: "bet"|"call"|"fold") => {
    const bet = pBet;
    if (action === "fold") {
      setAChips(a => a + pot + bet);
      setResult("You folded! AI wins the pot.");
      setPhase("reveal"); setAAction("collected the pot");
      return;
    }
    // AI decides
    let aiAct: string;
    let aiBet = 0;
    if (aRank >= 5 || aiBluffs) {
      aiAct = "raises"; aiBet = Math.min(bet * 2, aChips);
    } else if (aRank >= 2) {
      aiAct = "calls"; aiBet = bet;
    } else {
      aiAct = "checks"; aiBet = Math.max(5, Math.floor(bet * 0.5));
    }
    setAAction(aiAct);
    const newPot = pot + bet + aiBet;
    setPot(newPot);
    setPChips(p => p - bet);
    setAChips(a => a - aiBet);

    // showdown
    const [pR] = handRank(pHand.filter((_,i)=>!discarded[i]));
    const [aR] = handRank(aHand);
    let res = "";
    if (pR > aR) { setPChips(p => p + bet + newPot); res = "🎉 You win! " + aRankName + " vs your better hand!"; }
    else if (aR > pR) { setAChips(a => a + bet + newPot); res = `AI wins with ${aRankName}!`; }
    else { setPChips(p => p + Math.floor(newPot/2)); setAChips(a => a + Math.ceil(newPot/2)); res = "Split pot!"; }
    setResult(res);
    setPhase("reveal");
  };

  const discard = (i: number) => {
    if (phase !== "bet") return;
    const nd = [...discarded];
    nd[i] = !nd[i];
    setDiscarded(nd);
  };

  const nextRound = () => {
    const [nh1, nh2] = dealHands();
    setHands([nh1, nh2]);
    setPhase("bet"); setResult(""); setAAction("");
    setPBet(10); setPot(0); setDiscarded([false,false,false,false,false]);
    setSelectedCard(null); setRound(r=>r+1);
  };

  const cardColor = (suit: string) => suit==="♥"||suit==="♦" ? "text-red-400" : "text-slate-200";

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-sm mx-auto p-2">
      <div className="text-center">
        <h2 className="text-xl font-black text-yellow-300">🃏 Bluff & Detect</h2>
        <p className="text-slate-400 text-xs">Poker-style bluffing! Discard cards, bet, and call the AI's bluff!</p>
      </div>

      <div className="flex justify-between w-full">
        <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl px-3 py-2 text-center">
          <p className="text-lg font-black text-blue-300">{pChips}</p>
          <p className="text-xs text-slate-500">Your Chips</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-center">
          <p className="text-lg font-black text-yellow-300">{pot}</p>
          <p className="text-xs text-slate-500">Pot | R{round}</p>
        </div>
        <div className="bg-red-900/30 border border-red-500/30 rounded-xl px-3 py-2 text-center">
          <p className="text-lg font-black text-red-300">{aChips}</p>
          <p className="text-xs text-slate-500">AI Chips</p>
        </div>
      </div>

      {/* AI Hand */}
      <div className="w-full">
        <p className="text-xs text-slate-500 mb-1 font-bold">🤖 AI Hand {phase==="reveal" ? `(${aRankName})` : "(hidden)"}</p>
        <div className="flex gap-1.5 justify-center">
          {aHand.map((card, i) => (
            <div key={i} className={`w-10 h-14 rounded-lg border flex items-center justify-center text-sm font-black ${phase==="reveal" ? "bg-slate-800 border-slate-600" : "bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600"}`}>
              {phase==="reveal" ? <div className="flex flex-col items-center"><span className={cardColor(card.suit)}>{VALUE_NAMES[card.value]}</span><span className={cardColor(card.suit)}>{card.suit}</span></div> : <span className="text-slate-500 text-lg">🂠</span>}
            </div>
          ))}
        </div>
        {aAction && <p className="text-xs text-slate-400 text-center mt-1">AI {aAction}</p>}
      </div>

      {/* Player Hand */}
      <div className="w-full">
        <p className="text-xs text-slate-500 mb-1 font-bold">👤 Your Hand {phase==="bet" ? "(tap to discard)" : ""}</p>
        <div className="flex gap-1.5 justify-center">
          {pHand.map((card, i) => (
            <button key={i} onClick={() => discard(i)} disabled={phase==="reveal"}
              className={`w-10 h-14 rounded-lg border flex items-center justify-center transition-all active:scale-95 ${discarded[i] ? "opacity-30 border-slate-700 bg-slate-900" : selectedCard===i ? "border-yellow-400 bg-yellow-900/20" : "bg-slate-800 border-slate-600 hover:border-slate-400"}`}>
              <div className="flex flex-col items-center">
                <span className={`text-sm font-black ${cardColor(card.suit)}`}>{VALUE_NAMES[card.value]}</span>
                <span className={`text-sm ${cardColor(card.suit)}`}>{card.suit}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {phase === "bet" && (
        <div className="w-full flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 shrink-0">Bet:</label>
            <input type="range" min={5} max={Math.min(50, pChips)} value={pBet} onChange={e=>setPBet(Number(e.target.value))} className="flex-1 accent-yellow-400"/>
            <span className="text-yellow-300 font-black text-sm w-8">{pBet}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => handleBet("fold")} className="py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 font-bold text-xs rounded-xl transition">Fold 🏳️</button>
            <button onClick={() => handleBet("call")} className="py-2 bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition">Call ✓</button>
            <button onClick={() => handleBet("bet")} className="py-2 bg-yellow-600 hover:bg-yellow-500 text-white font-bold text-xs rounded-xl transition">Bet 💰</button>
          </div>
        </div>
      )}

      {phase === "reveal" && result && (
        <div className="w-full bg-slate-800 border border-slate-600 rounded-2xl p-3 text-center">
          <p className="text-white font-black text-sm">{result}</p>
          {(pChips <= 0 || aChips <= 0) ? (
            <p className="text-yellow-300 font-bold mt-1">{pChips <= 0 ? "AI wins the game!" : "You win the game! 🏆"}</p>
          ) : (
            <button onClick={nextRound} className="mt-2 px-6 py-2 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-xl transition">Next Round →</button>
          )}
        </div>
      )}
    </div>
  );
}
