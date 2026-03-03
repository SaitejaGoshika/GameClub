import { useEffect, useRef, useState, useCallback } from "react";

const COLS = 10, ROWS = 20, CELL = 28;
const SHAPES = [
  [[1,1,1,1]],
  [[1,1],[1,1]],
  [[1,1,1],[0,1,0]],
  [[1,1,1],[1,0,0]],
  [[1,1,1],[0,0,1]],
  [[1,1,0],[0,1,1]],
  [[0,1,1],[1,1,0]],
];
const COLORS = ["#22d3ee","#fbbf24","#a78bfa","#f97316","#3b82f6","#f43f5e","#4ade80"];

type Board = (string | null)[][];
type Piece = { shape: number[][]; x: number; y: number; color: string };

function emptyBoard(): Board { return Array(ROWS).fill(null).map(() => Array(COLS).fill(null)); }
function randomPiece(): Piece {
  const i = Math.floor(Math.random() * SHAPES.length);
  return { shape: SHAPES[i], x: Math.floor(COLS / 2) - 1, y: 0, color: COLORS[i] };
}
function rotate(shape: number[][]): number[][] {
  return shape[0].map((_, c) => shape.map(r => r[c]).reverse());
}
function fits(board: Board, piece: Piece, dx = 0, dy = 0, shape?: number[][]): boolean {
  const s = shape || piece.shape;
  return s.every((row, r) => row.every((v, c) => {
    if (!v) return true;
    const nx = piece.x + c + dx, ny = piece.y + r + dy;
    return nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS && !board[ny][nx];
  }));
}
function place(board: Board, piece: Piece): Board {
  const next = board.map(r => [...r]);
  piece.shape.forEach((row, r) => row.forEach((v, c) => { if (v) next[piece.y + r][piece.x + c] = piece.color; }));
  return next;
}
function clearLines(board: Board): { board: Board; lines: number } {
  const kept = board.filter(row => row.some(c => !c));
  const lines = ROWS - kept.length;
  const newRows = Array(lines).fill(null).map(() => Array(COLS).fill(null));
  return { board: [...newRows, ...kept], lines };
}

export default function Tetris() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boardRef = useRef<Board>(emptyBoard());
  const pieceRef = useRef<Piece>(randomPiece());
  const nextRef = useRef<Piece>(randomPiece());
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState(false);
  const scoreRef = useRef(0);
  const linesRef = useRef(0);
  const levelRef = useRef(1);

  const draw = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.fillStyle = "#0f172a"; ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);
    ctx.strokeStyle = "#1e293b";
    for (let r = 0; r <= ROWS; r++) { ctx.beginPath(); ctx.moveTo(0, r * CELL); ctx.lineTo(COLS * CELL, r * CELL); ctx.stroke(); }
    for (let c = 0; c <= COLS; c++) { ctx.beginPath(); ctx.moveTo(c * CELL, 0); ctx.lineTo(c * CELL, ROWS * CELL); ctx.stroke(); }
    boardRef.current.forEach((row, r) => row.forEach((color, c) => {
      if (color) { ctx.fillStyle = color; ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2); ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 2, 4); }
    }));
    const p = pieceRef.current;
    // Ghost
    let ghostY = p.y;
    while (fits(boardRef.current, p, 0, ghostY - p.y + 1)) ghostY++;
    if (ghostY !== p.y) {
      p.shape.forEach((row, r) => row.forEach((v, c) => { if (v) { ctx.fillStyle = "rgba(255,255,255,0.1)"; ctx.fillRect((p.x + c) * CELL + 1, (ghostY + r) * CELL + 1, CELL - 2, CELL - 2); } }));
    }
    p.shape.forEach((row, r) => row.forEach((v, c) => { if (v) { ctx.fillStyle = p.color; ctx.fillRect((p.x + c) * CELL + 1, (p.y + r) * CELL + 1, CELL - 2, CELL - 2); ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.fillRect((p.x + c) * CELL + 1, (p.y + r) * CELL + 1, CELL - 2, 4); } }));
  }, []);

  const lockPiece = useCallback(() => {
    const board = place(boardRef.current, pieceRef.current);
    const { board: cleared, lines: clearedLines } = clearLines(board);
    boardRef.current = cleared;
    if (clearedLines) {
      const pts = [0, 100, 300, 500, 800][clearedLines] * levelRef.current;
      scoreRef.current += pts; setScore(scoreRef.current);
      linesRef.current += clearedLines; setLines(linesRef.current);
      levelRef.current = Math.floor(linesRef.current / 10) + 1; setLevel(levelRef.current);
    }
    pieceRef.current = nextRef.current;
    nextRef.current = randomPiece();
    if (!fits(boardRef.current, pieceRef.current)) { setRunning(false); setOver(true); }
  }, []);

  const drop = useCallback(() => {
    if (fits(boardRef.current, pieceRef.current, 0, 1)) pieceRef.current = { ...pieceRef.current, y: pieceRef.current.y + 1 };
    else lockPiece();
    draw();
  }, [draw, lockPiece]);

  useEffect(() => {
    if (!running) return;
    const speed = Math.max(100, 600 - (levelRef.current - 1) * 50);
    const t = setInterval(drop, speed);
    return () => clearInterval(t);
  }, [running, drop, level]);

  useEffect(() => {
    draw();
    const handleKey = (e: KeyboardEvent) => {
      if (!running) return;
      const p = pieceRef.current;
      if (e.key === "ArrowLeft" && fits(boardRef.current, p, -1)) { pieceRef.current = { ...p, x: p.x - 1 }; draw(); }
      if (e.key === "ArrowRight" && fits(boardRef.current, p, 1)) { pieceRef.current = { ...p, x: p.x + 1 }; draw(); }
      if (e.key === "ArrowDown") { drop(); }
      if (e.key === "ArrowUp" || e.key === "x") { const r = rotate(p.shape); if (fits(boardRef.current, p, 0, 0, r)) { pieceRef.current = { ...p, shape: r }; draw(); } }
      if (e.key === " ") { e.preventDefault(); let gy = p.y; while (fits(boardRef.current, p, 0, gy - p.y + 1)) gy++; pieceRef.current = { ...p, y: gy }; lockPiece(); draw(); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [running, draw, drop, lockPiece]);

  const startGame = () => {
    boardRef.current = emptyBoard();
    pieceRef.current = randomPiece();
    nextRef.current = randomPiece();
    scoreRef.current = 0; linesRef.current = 0; levelRef.current = 1;
    setScore(0); setLines(0); setLevel(1); setOver(false); setRunning(true);
    draw();
  };

  const handleMobile = (action: string) => {
    if (!running) return;
    const p = pieceRef.current;
    if (action === "left" && fits(boardRef.current, p, -1)) { pieceRef.current = { ...p, x: p.x - 1 }; draw(); }
    if (action === "right" && fits(boardRef.current, p, 1)) { pieceRef.current = { ...p, x: p.x + 1 }; draw(); }
    if (action === "down") drop();
    if (action === "rotate") { const r = rotate(p.shape); if (fits(boardRef.current, p, 0, 0, r)) { pieceRef.current = { ...p, shape: r }; draw(); } }
    if (action === "drop") { let gy = p.y; while (fits(boardRef.current, p, 0, gy - p.y + 1)) gy++; pieceRef.current = { ...p, y: gy }; lockPiece(); draw(); }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-6">
        <div className="text-center"><p className="text-slate-400 text-xs">SCORE</p><p className="text-purple-400 font-bold text-lg">{score}</p></div>
        <div className="text-center"><p className="text-slate-400 text-xs">LINES</p><p className="text-blue-400 font-bold text-lg">{lines}</p></div>
        <div className="text-center"><p className="text-slate-400 text-xs">LEVEL</p><p className="text-yellow-400 font-bold text-lg">{level}</p></div>
      </div>
      <div className="relative">
        <canvas ref={canvasRef} width={COLS * CELL} height={ROWS * CELL} className="rounded-lg border-2 border-purple-500/30" />
        {(!running) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 rounded-lg">
            {over ? <p className="text-red-400 text-2xl font-bold mb-1">💀 Game Over</p> : <p className="text-white text-2xl font-bold mb-1">🧩 Tetris</p>}
            {over && <p className="text-purple-400 mb-3">Score: {score}</p>}
            <button onClick={startGame} className="px-6 py-2 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-lg">{over ? "Play Again" : "Start Game"}</button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <button onPointerDown={() => handleMobile("rotate")} className="p-3 bg-yellow-600/50 hover:bg-yellow-600 rounded-lg text-white font-bold text-sm">↻</button>
        <button onPointerDown={() => handleMobile("drop")} className="p-3 bg-purple-600/50 hover:bg-purple-600 rounded-lg text-white font-bold text-sm">⬇⬇</button>
        <div />
        <button onPointerDown={() => handleMobile("left")} className="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-bold">◀</button>
        <button onPointerDown={() => handleMobile("down")} className="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-bold">▼</button>
        <button onPointerDown={() => handleMobile("right")} className="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-bold">▶</button>
      </div>
      <p className="text-slate-500 text-xs">← → move • ↑/X rotate • ↓ soft drop • Space hard drop</p>
    </div>
  );
}
