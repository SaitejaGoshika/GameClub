import { useState, useCallback } from 'react';

const GRID = 10;
type CellState = 'empty' | 'ship' | 'hit' | 'miss';
type Grid = CellState[][];

const SHIPS = [
  { name: 'Carrier', size: 5 },
  { name: 'Battleship', size: 4 },
  { name: 'Cruiser', size: 3 },
  { name: 'Submarine', size: 3 },
  { name: 'Destroyer', size: 2 },
];

function emptyGrid(): Grid { return Array.from({ length: GRID }, () => Array(GRID).fill('empty')); }

function placeShipsRandom(): Grid {
  const grid = emptyGrid();
  for (const ship of SHIPS) {
    let placed = false;
    let tries = 0;
    while (!placed && tries < 200) {
      tries++;
      const horizontal = Math.random() > 0.5;
      const row = Math.floor(Math.random() * (horizontal ? GRID : GRID - ship.size));
      const col = Math.floor(Math.random() * (horizontal ? GRID - ship.size : GRID));
      let ok = true;
      for (let i = 0; i < ship.size; i++) {
        const r = horizontal ? row : row + i;
        const c = horizontal ? col + i : col;
        if (grid[r][c] !== 'empty') { ok = false; break; }
      }
      if (ok) {
        for (let i = 0; i < ship.size; i++) {
          const r = horizontal ? row : row + i;
          const c = horizontal ? col + i : col;
          grid[r][c] = 'ship';
        }
        placed = true;
      }
    }
  }
  return grid;
}

function countShips(grid: Grid) { return grid.flat().filter(c => c === 'ship').length; }

function aiShoot(playerGrid: Grid): [number, number] {
  // Find hits to continue
  const hits: [number,number][] = [];
  const available: [number,number][] = [];
  for (let r = 0; r < GRID; r++)
    for (let c = 0; c < GRID; c++) {
      if (playerGrid[r][c] === 'hit') hits.push([r,c]);
      if (playerGrid[r][c] === 'empty' || playerGrid[r][c] === 'ship') available.push([r,c]);
    }
  if (hits.length > 0) {
    for (const [hr, hc] of hits) {
      for (const [dr,dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
        const nr = hr+dr, nc = hc+dc;
        if (nr>=0&&nr<GRID&&nc>=0&&nc<GRID&&(playerGrid[nr][nc]==='empty'||playerGrid[nr][nc]==='ship'))
          return [nr,nc];
      }
    }
  }
  return available[Math.floor(Math.random()*available.length)];
}

export default function Battleship() {
  const [phase, setPhase] = useState<'setup'|'play'|'over'>('setup');
  const [playerGrid, setPlayerGrid] = useState<Grid>(emptyGrid());
  const [aiGrid, setAiGrid] = useState<Grid>(placeShipsRandom());
  const [playerView, setPlayerView] = useState<Grid>(emptyGrid()); // what player sees of AI
  const [aiView, setAiView] = useState<Grid>(emptyGrid()); // what AI sees of player
  const [turn, setTurn] = useState<'player'|'ai'>('player');
  const [msg, setMsg] = useState('');
  const [winner, setWinner] = useState('');

  const randomizePlayer = () => {
    setPlayerGrid(placeShipsRandom());
  };

  const startGame = () => {
    setPhase('play');
    setAiGrid(placeShipsRandom());
    setPlayerView(emptyGrid());
    setAiView(emptyGrid());
    setTurn('player');
    setMsg('Your turn! Click on enemy waters.');
    setWinner('');
  };

  const playerShoot = useCallback((r: number, c: number) => {
    if (phase !== 'play' || turn !== 'player') return;
    if (playerView[r][c] === 'hit' || playerView[r][c] === 'miss') return;
    const newAiGrid = aiGrid.map(row => [...row]);
    const newView = playerView.map(row => [...row]);
    const isHit = aiGrid[r][c] === 'ship';
    newAiGrid[r][c] = isHit ? 'hit' : 'miss';
    newView[r][c] = isHit ? 'hit' : 'miss';
    setAiGrid(newAiGrid);
    setPlayerView(newView);
    if (countShips(newAiGrid) === 0) { setWinner('🎉 You Win!'); setPhase('over'); return; }
    setMsg(isHit ? '💥 Hit! Now AI shoots...' : '💧 Miss! Now AI shoots...');
    setTurn('ai');
    setTimeout(() => {
      const [ar, ac] = aiShoot(playerGrid);
      const newPG = playerGrid.map(row => [...row]);
      const newAV = aiView.map(row => [...row]);
      const aiHit = playerGrid[ar][ac] === 'ship';
      newPG[ar][ac] = aiHit ? 'hit' : 'miss';
      newAV[ar][ac] = aiHit ? 'hit' : 'miss';
      setPlayerGrid(newPG);
      setAiView(newAV);
      if (countShips(newPG) === 0) { setWinner('💀 AI Wins!'); setPhase('over'); return; }
      setMsg(aiHit ? '😱 AI hit your ship! Your turn.' : '😅 AI missed! Your turn.');
      setTurn('player');
    }, 800);
  }, [phase, turn, aiGrid, playerView, playerGrid, aiView]);

  const cellColor = (cell: CellState, isEnemy: boolean) => {
    if (cell === 'hit') return 'bg-red-500';
    if (cell === 'miss') return 'bg-blue-300';
    if (cell === 'ship' && !isEnemy) return 'bg-gray-400';
    return 'bg-blue-700 hover:bg-blue-600';
  };

  const renderGrid = (grid: Grid, isEnemy: boolean, onClick?: (r:number,c:number)=>void) => (
    <div className="inline-block border-2 border-blue-500 rounded">
      {grid.map((row, r) => (
        <div key={r} className="flex">
          {row.map((cell, c) => (
            <div key={c}
              onClick={() => onClick?.(r,c)}
              className={`w-7 h-7 border border-blue-800/50 cursor-pointer flex items-center justify-center text-xs font-bold transition
                ${cellColor(cell, isEnemy)}`}>
              {cell==='hit'?'💥':cell==='miss'?'·':''}
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h2 className="text-3xl font-bold text-blue-400">⚓ Battleship</h2>
      {phase === 'setup' && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-gray-300">Place your fleet and start battle!</p>
          <div>
            <p className="text-center text-sm text-gray-400 mb-2">Your Fleet (randomized):</p>
            {renderGrid(playerGrid, false)}
          </div>
          <div className="flex gap-3">
            <button onClick={randomizePlayer} className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 font-bold transition">🔀 Randomize</button>
            <button onClick={startGame} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 font-bold transition">⚔️ Start Battle</button>
          </div>
        </div>
      )}
      {(phase === 'play' || phase === 'over') && (
        <div className="flex flex-col items-center gap-4">
          {winner && <div className="text-3xl font-bold animate-bounce">{winner}</div>}
          <p className="text-blue-300 font-semibold">{msg}</p>
          <div className="flex flex-wrap gap-6 justify-center">
            <div className="flex flex-col items-center gap-2">
              <p className="text-red-400 font-bold">🎯 Enemy Waters</p>
              {renderGrid(playerView, true, phase==='play'?playerShoot:undefined)}
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-green-400 font-bold">🛡️ Your Fleet</p>
              {renderGrid(playerGrid, false)}
            </div>
          </div>
          <button onClick={() => { setPhase('setup'); setPlayerGrid(placeShipsRandom()); }}
            className="px-8 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-400 transition">
            New Game
          </button>
        </div>
      )}
    </div>
  );
}
