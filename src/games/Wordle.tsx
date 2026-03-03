import { useState, useEffect, useCallback } from "react";

const WORDS = ["APPLE","BRAVE","CRANE","DELTA","EAGLE","FLAME","GRACE","HEART","IGLOO","JOKER","KNIFE","LEMON","MAGIC","NOBLE","OCEAN","PIXEL","QUEEN","RIVER","STONE","TIGER","ULTRA","VIVID","WATCH","XENON","YACHT","ZEBRA","BLAZE","CHESS","DRIFT","ELBOW","FROST","GLOBE","HONEY","INDEX","JUICE","KNEEL","LIGHT","MANOR","NIGHT","ORBIT","PLUMB","QUEST","RAZOR","SHELF","TOWER","UNDER","VAPOR","WASTE","YEARN","ZONAL"];

const KEYBOARD = ["QWERTYUIOP".split(""), "ASDFGHJKL".split(""), ["⌫", ..."ZXCVBNM".split(""), "↵"]];

type Status = "correct" | "present" | "absent" | "empty" | "active";

export default function Wordle() {
  const [target, setTarget] = useState(() => WORDS[Math.floor(Math.random() * WORDS.length)]);
  const [guesses, setGuesses] = useState<string[][]>(Array(6).fill(null).map(() => []));
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [shake, setShake] = useState(false);
  const [letterStatus, setLetterStatus] = useState<Record<string, Status>>({});
  const [message, setMessage] = useState("");

  const showMsg = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 1500);
  };

  const submit = useCallback(() => {
    if (input.length !== 5) { setShake(true); setTimeout(() => setShake(false), 500); showMsg("Word must be 5 letters!"); return; }
    const newGuesses = guesses.map((g, i) => i === current ? input.split("") : g);
    setGuesses(newGuesses);
    // Update letter status
    const newStatus = { ...letterStatus };
    input.split("").forEach((letter, i) => {
      if (target[i] === letter) newStatus[letter] = "correct";
      else if (target.includes(letter) && newStatus[letter] !== "correct") newStatus[letter] = "present";
      else if (!newStatus[letter]) newStatus[letter] = "absent";
    });
    setLetterStatus(newStatus);
    if (input === target) { setWon(true); setGameOver(true); showMsg("🎉 Brilliant!"); return; }
    if (current === 5) { setGameOver(true); showMsg(`The word was ${target}`); return; }
    setCurrent(c => c + 1);
    setInput("");
  }, [input, current, guesses, target, letterStatus]);

  const handleKey = useCallback((key: string) => {
    if (gameOver) return;
    if (key === "⌫" || key === "Backspace") { setInput(s => s.slice(0, -1)); return; }
    if (key === "↵" || key === "Enter") { submit(); return; }
    if (/^[A-Z]$/.test(key) && input.length < 5) setInput(s => s + key);
  }, [gameOver, input, submit]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => handleKey(e.key.toUpperCase());
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleKey]);

  const reset = () => {
    setTarget(WORDS[Math.floor(Math.random() * WORDS.length)]);
    setGuesses(Array(6).fill(null).map(() => []));
    setCurrent(0); setInput(""); setGameOver(false); setWon(false); setLetterStatus({}); setMessage("");
  };

  const getTileStatus = (row: number, col: number): Status => {
    if (row > current) return "empty";
    if (row === current) return col < input.length ? "active" : "empty";
    const letter = guesses[row][col];
    if (target[col] === letter) return "correct";
    if (target.includes(letter)) return "present";
    return "absent";
  };

  const tileClass = (status: Status) => {
    const base = "w-12 h-12 flex items-center justify-center text-2xl font-black border-2 rounded transition-all duration-200";
    return `${base} ${
      status === "correct" ? "bg-green-600 border-green-500 text-white" :
      status === "present" ? "bg-yellow-600 border-yellow-500 text-white" :
      status === "absent" ? "bg-slate-700 border-slate-600 text-white" :
      status === "active" ? "bg-transparent border-slate-400 text-white" :
      "bg-transparent border-slate-700 text-white"
    }`;
  };

  const keyClass = (letter: string) => {
    const status = letterStatus[letter];
    const base = "px-2 py-3 min-w-[30px] flex items-center justify-center font-bold text-sm rounded cursor-pointer select-none transition";
    return `${base} ${
      status === "correct" ? "bg-green-600 text-white" :
      status === "present" ? "bg-yellow-600 text-white" :
      status === "absent" ? "bg-slate-700 text-slate-400" :
      "bg-slate-600 hover:bg-slate-500 text-white"
    }`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="h-8 flex items-center">
        {message && <span className="px-4 py-1 bg-white text-black font-bold rounded-lg text-sm animate-bounce">{message}</span>}
      </div>
      <div className={`flex flex-col gap-1.5 ${shake ? "animate-pulse" : ""}`}>
        {Array(6).fill(0).map((_, row) => (
          <div key={row} className="flex gap-1.5">
            {Array(5).fill(0).map((_, col) => {
              const status = getTileStatus(row, col);
              const letter = row === current ? (col < input.length ? input[col] : "") : (guesses[row][col] || "");
              return <div key={col} className={tileClass(status)}>{letter}</div>;
            })}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1.5 mt-2">
        {KEYBOARD.map((row, ri) => (
          <div key={ri} className="flex gap-1 justify-center">
            {row.map(key => (
              <button key={key} onClick={() => handleKey(key)} className={`${keyClass(key)} ${key.length > 1 ? "px-3" : ""}`}>{key}</button>
            ))}
          </div>
        ))}
      </div>
      {gameOver && (
        <button onClick={reset} className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition mt-2">
          {won ? "Play Again 🎉" : "Try Again"}
        </button>
      )}
    </div>
  );
}
