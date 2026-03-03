import { useState, useEffect, useRef, useCallback } from "react";

const SENTENCES = [
  "The quick brown fox jumps over the lazy dog",
  "Pack my box with five dozen liquor jugs",
  "How vexingly quick daft zebras jump",
  "The five boxing wizards jump quickly",
  "Sphinx of black quartz judge my vow",
  "Crazy Fredrick bought many very exquisite opal jewels",
  "We promptly judged antique ivory buckles for the next prize",
  "A mad boxer shot a quick gloved jab to the jaw of his dizzy opponent",
  "Amazingly few discotheques provide jukeboxes",
  "Six big juicy steaks sizzled in a pan as twelve weary cooks drank red wine",
];

export default function SpeedTyping() {
  const [sentence] = useState(() => SENTENCES[Math.floor(Math.random() * SENTENCES.length)]);
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const timerRef = useRef<number | null>(null);
  const startTime = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const time = (Date.now() - startTime.current) / 1000;
    setElapsed(time);
    const words = sentence.trim().split(" ").length;
    setWpm(Math.round((words / time) * 60));
    let correct = 0;
    for (let i = 0; i < sentence.length; i++) {
      if (input[i] === sentence[i]) correct++;
    }
    setAccuracy(Math.round((correct / sentence.length) * 100));
    setFinished(true);
  }, [sentence, input]);

  useEffect(() => {
    if (input === sentence && started) stop();
  }, [input, sentence, started, stop]);

  const handleInput = (val: string) => {
    if (finished) return;
    if (!started && val.length > 0) {
      setStarted(true);
      startTime.current = Date.now();
      timerRef.current = window.setInterval(() => {
        setElapsed((Date.now() - startTime.current) / 1000);
      }, 100);
    }
    setInput(val);
  };

  const reset = () => window.location.reload();

  const getColor = (i: number) => {
    if (i >= input.length) return "text-slate-400";
    return input[i] === sentence[i] ? "text-green-400" : "text-red-400 bg-red-900/30";
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-black text-white">⌨️ Speed Typing</h2>

      <div className="flex gap-4 text-center">
        <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 min-w-[70px]">
          <p className="text-2xl font-black text-yellow-400">{elapsed.toFixed(1)}s</p>
          <p className="text-slate-400 text-xs">Time</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 min-w-[70px]">
          <p className="text-2xl font-black text-cyan-400">{finished ? wpm : "--"}</p>
          <p className="text-slate-400 text-xs">WPM</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 min-w-[70px]">
          <p className="text-2xl font-black text-green-400">{finished ? accuracy : "--"}%</p>
          <p className="text-slate-400 text-xs">Accuracy</p>
        </div>
      </div>

      <div className="w-full bg-slate-800 rounded-2xl p-5 border border-slate-700 font-mono text-lg leading-relaxed tracking-wide">
        {sentence.split("").map((char, i) => (
          <span key={i} className={`${getColor(i)} ${i === input.length ? "border-b-2 border-white animate-pulse" : ""}`}>{char}</span>
        ))}
      </div>

      {!finished ? (
        <input
          ref={inputRef}
          autoFocus
          value={input}
          onChange={e => handleInput(e.target.value)}
          className="w-full bg-slate-700 border-2 border-slate-600 focus:border-yellow-400 text-white rounded-xl px-4 py-3 text-base font-mono focus:outline-none transition"
          placeholder="Start typing here..."
          disabled={finished}
        />
      ) : (
        <div className="w-full text-center bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <p className="text-4xl mb-2">{wpm > 60 ? "🚀" : wpm > 40 ? "✅" : "🐢"}</p>
          <p className="text-white font-black text-xl mb-1">{wpm > 60 ? "Blazing Fast!" : wpm > 40 ? "Good Job!" : "Keep Practicing!"}</p>
          <p className="text-slate-400 text-sm mb-4">{wpm} WPM • {accuracy}% accuracy • {elapsed.toFixed(1)}s</p>
          <button onClick={reset} className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-black rounded-xl hover:brightness-110 transition">Try Again</button>
        </div>
      )}
    </div>
  );
}
