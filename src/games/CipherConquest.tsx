import { useState } from "react";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function genCipher(): Record<string,string> {
  const shuffled = ALPHABET.split("").sort(()=>Math.random()-0.5);
  const cipher: Record<string,string> = {};
  ALPHABET.split("").forEach((c,i) => cipher[c] = shuffled[i]);
  return cipher;
}

const PHRASES = [
  "THE QUICK BROWN FOX JUMPS",
  "GAME CLUB IS THE BEST",
  "CRACK THE CODE TO WIN",
  "LOGIC IS THE KEY TO VICTORY",
  "EVERY CIPHER HAS A PATTERN",
  "KNOWLEDGE IS POWER AND SPEED",
];

export default function CipherConquest() {
  const [phrase] = useState(() => PHRASES[Math.floor(Math.random()*PHRASES.length)]);
  const [cipher] = useState(genCipher);
  const [guesses, setGuesses] = useState<Record<string,string>>({});
  const [selected, setSelected] = useState<string|null>(null);
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(false);

  const encoded = phrase.split("").map(c => c===" " ? " " : cipher[c]);
  const uniqueEncoded = [...new Set(encoded.filter(c=>c!==" "))];

  const handleEncodedClick = (ec: string) => setSelected(ec);

  const handleGuess = (plain: string) => {
    if (!selected) return;
    const ng = {...guesses, [selected]: plain};
    setGuesses(ng);
    // Check if complete
    let allCorrect = true;
    for (const ec of uniqueEncoded) {
      const orig = Object.entries(cipher).find(([,v])=>v===ec)?.[0];
      if (ng[ec] !== orig) { allCorrect = false; break; }
    }
    if (allCorrect) { setScore(s=>s+50); setSolved(true); }
    setSelected(null);
  };

  const revealLetter = () => {
    // reveal one random unsolved letter
    const unsolved = uniqueEncoded.filter(ec=>{
      const orig = Object.entries(cipher).find(([,v])=>v===ec)?.[0];
      return guesses[ec] !== orig;
    });
    if (!unsolved.length) return;
    const ec = unsolved[Math.floor(Math.random()*unsolved.length)];
    const orig = Object.entries(cipher).find(([,v])=>v===ec)?.[0];
    if (orig) { setGuesses(g=>({...g,[ec]:orig})); setScore(s=>Math.max(0,s-5)); }
  };

  const restart = () => window.location.reload();

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto p-2">
      <div className="text-center">
        <h2 className="text-xl font-black text-amber-300">🔐 Cipher Conquest</h2>
        <p className="text-slate-400 text-xs">Each letter is replaced by another. Decode the message!</p>
      </div>

      <div className="flex justify-between w-full">
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-center">
          <p className="text-lg font-black text-amber-400">{score}</p>
          <p className="text-xs text-slate-500">Score</p>
        </div>
        <button onClick={revealLetter} className="px-3 py-1.5 text-xs font-bold bg-yellow-900/40 border border-yellow-600/40 text-yellow-300 rounded-xl transition">
          💡 Reveal (-5pts)
        </button>
      </div>

      {/* Encoded message */}
      <div className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4">
        <p className="text-xs text-slate-500 mb-2 font-bold">ENCODED MESSAGE:</p>
        <div className="flex flex-wrap gap-1.5 justify-center">
          {encoded.map((ec, i) => (
            ec === " " ? <div key={i} className="w-3"/> :
            <div key={i} className="flex flex-col items-center gap-0.5">
              <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-sm font-black cursor-pointer transition-all
                ${selected===ec?"border-amber-400 bg-amber-900/30 text-amber-300":"border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-400"}`}
                onClick={()=>handleEncodedClick(ec)}>
                {ec}
              </div>
              <div className={`w-8 h-6 rounded border flex items-center justify-center text-xs font-black
                ${guesses[ec] ? "border-green-500/60 bg-green-900/20 text-green-300" : "border-slate-700 bg-slate-900 text-slate-600"}`}>
                {guesses[ec] || "?"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div className="w-full bg-amber-900/20 border border-amber-500/30 rounded-xl p-2 text-center">
          <p className="text-xs text-amber-300">Guessing for encoded letter: <strong>{selected}</strong></p>
        </div>
      )}

      {/* Alphabet keyboard */}
      <div className="grid grid-cols-9 gap-1 w-full">
        {ALPHABET.split("").map(c => {
          const alreadyUsed = Object.values(guesses).includes(c);
          return (
            <button key={c} onClick={() => handleGuess(c)} disabled={!selected || alreadyUsed || solved}
              className={`aspect-square rounded-lg border text-xs font-bold transition-all active:scale-90
                ${alreadyUsed?"bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed":
                  !selected?"bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed opacity-50":
                  "bg-slate-800 border-slate-600 text-white hover:bg-amber-900/40 hover:border-amber-500"}`}>
              {c}
            </button>
          );
        })}
      </div>

      {solved && (
        <div className="w-full bg-green-900/30 border border-green-500/40 rounded-2xl p-4 text-center">
          <p className="text-green-300 text-xl font-black">🎉 Cipher Cracked! +50pts</p>
          <p className="text-green-400 text-sm mt-1">"{phrase}"</p>
          <button onClick={restart} className="mt-3 px-6 py-2 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-xl transition">New Cipher</button>
        </div>
      )}
    </div>
  );
}
