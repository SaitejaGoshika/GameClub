import { useState, useEffect, useCallback } from 'react';

const MAP_W = 20, MAP_H = 15;
type Tile = 'wall'|'floor'|'door'|'stairs'|'chest';
type Dir = 'up'|'down'|'left'|'right';

interface Enemy { id: number; x: number; y: number; hp: number; maxHp: number; name: string; atk: number; }
interface Item { id: number; x: number; y: number; type: 'potion'|'sword'|'shield'|'gold'; value: number; }
interface Player { x: number; y: number; hp: number; maxHp: number; atk: number; def: number; xp: number; level: number; gold: number; }

let enemyId = 0, itemId = 0;

function generateMap(level: number): { tiles: Tile[][], enemies: Enemy[], items: Item[], stairX: number, stairY: number } {
  const tiles: Tile[][] = Array.from({ length: MAP_H }, () => Array(MAP_W).fill('wall'));
  // Simple room carving
  const rooms: { x:number; y:number; w:number; h:number }[] = [];
  for (let i = 0; i < 8; i++) {
    const w = 3 + Math.floor(Math.random()*4);
    const h = 3 + Math.floor(Math.random()*3);
    const x = 1 + Math.floor(Math.random()*(MAP_W-w-2));
    const y = 1 + Math.floor(Math.random()*(MAP_H-h-2));
    rooms.push({ x, y, w, h });
    for (let r = y; r < y+h; r++)
      for (let c = x; c < x+w; c++)
        tiles[r][c] = 'floor';
  }
  // Connect rooms
  for (let i = 1; i < rooms.length; i++) {
    const a = rooms[i-1], b = rooms[i];
    let cx = Math.floor(a.x+a.w/2), cy = Math.floor(a.y+a.h/2);
    const tx = Math.floor(b.x+b.w/2), ty = Math.floor(b.y+b.h/2);
    while (cx !== tx) { tiles[cy][cx] = 'floor'; cx += cx < tx ? 1 : -1; }
    while (cy !== ty) { tiles[cy][cx] = 'floor'; cy += cy < ty ? 1 : -1; }
  }
  // Place stairs in last room
  const lastRoom = rooms[rooms.length-1];
  const stairX = Math.floor(lastRoom.x+lastRoom.w/2);
  const stairY = Math.floor(lastRoom.y+lastRoom.h/2);
  tiles[stairY][stairX] = 'stairs';

  // Enemies
  const enemies: Enemy[] = [];
  const names = ['Goblin','Skeleton','Orc','Troll','Dark Knight'];
  for (let i = 0; i < 4+level*2; i++) {
    const room = rooms[Math.floor(Math.random()*rooms.length)];
    const ex = room.x + 1 + Math.floor(Math.random()*(room.w-2));
    const ey = room.y + 1 + Math.floor(Math.random()*(room.h-2));
    if (tiles[ey][ex] === 'floor') {
      const hp = 8 + level*4 + Math.floor(Math.random()*5);
      enemies.push({ id: enemyId++, x: ex, y: ey, hp, maxHp: hp, name: names[Math.min(level-1,4)], atk: 3+level*2 });
    }
  }

  // Items
  const items: Item[] = [];
  for (let i = 0; i < 5; i++) {
    const room = rooms[Math.floor(Math.random()*rooms.length)];
    const ix = room.x + Math.floor(Math.random()*room.w);
    const iy = room.y + Math.floor(Math.random()*room.h);
    if (tiles[iy][ix] === 'floor') {
      const types: Item['type'][] = ['potion','potion','sword','shield','gold'];
      const type = types[Math.floor(Math.random()*types.length)];
      items.push({ id: itemId++, x: ix, y: iy, type, value: type==='gold'?10+Math.floor(Math.random()*20):10+level*5 });
    }
  }

  // Start in first room
  tiles[Math.floor(rooms[0].y+rooms[0].h/2)][Math.floor(rooms[0].x+rooms[0].w/2)] = 'floor';

  return { tiles, enemies, items, stairX, stairY };
}

export default function DungeonCrawler() {
  const [dungeon, setDungeon] = useState(() => generateMap(1));
  const [player, setPlayer] = useState<Player>({ x:2, y:2, hp:30, maxHp:30, atk:8, def:3, xp:0, level:1, gold:0 });
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [floor, setFloor] = useState(1);
  const [log, setLog] = useState<string[]>(['🗡️ Welcome to the Dungeon! Use WASD or arrow keys.']);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);

  useEffect(() => {
    const d = generateMap(floor);
    setDungeon(d);
    setEnemies(d.enemies);
    setItems(d.items);
    // Find start
    for (let r = 0; r < MAP_H; r++)
      for (let c = 0; c < MAP_W; c++)
        if (d.tiles[r][c] === 'floor') {
          setPlayer(p => ({ ...p, x: c, y: r }));
          return;
        }
  }, [floor]);

  const addLog = (msg: string) => setLog(l => [msg, ...l.slice(0,8)]);

  const movePlayer = useCallback((dir: Dir) => {
    if (gameOver || victory) return;
    setPlayer(p => {
      let nx = p.x, ny = p.y;
      if (dir==='up') ny--;
      if (dir==='down') ny++;
      if (dir==='left') nx--;
      if (dir==='right') nx++;
      if (nx<0||nx>=MAP_W||ny<0||ny>=MAP_H) return p;
      const tile = dungeon.tiles[ny][nx];
      if (tile === 'wall') return p;

      // Check enemy
      const enemy = enemies.find(e => e.x===nx && e.y===ny);
      if (enemy) {
        const dmg = Math.max(1, p.atk - Math.floor(Math.random()*3));
        const eDmg = Math.max(1, enemy.atk - p.def);
        const newEHp = enemy.hp - dmg;
        const newPHp = p.hp - eDmg;
        addLog(`⚔️ Hit ${enemy.name} for ${dmg}! It hits back for ${eDmg}.`);
        if (newEHp <= 0) {
          setEnemies(es => es.filter(e => e.id !== enemy.id));
          const xpGain = 10 + floor * 5;
          addLog(`💀 ${enemy.name} defeated! +${xpGain} XP`);
          const newXp = p.xp + xpGain;
          const levelUp = newXp >= p.level * 20;
          if (levelUp) addLog(`🌟 Level Up! Now level ${p.level+1}`);
          return { ...p, hp: Math.max(0,newPHp), xp: levelUp?0:newXp, level: levelUp?p.level+1:p.level, maxHp: levelUp?p.maxHp+10:p.maxHp, atk: levelUp?p.atk+2:p.atk };
        } else {
          setEnemies(es => es.map(e => e.id===enemy.id ? {...e,hp:newEHp} : e));
          if (newPHp <= 0) { setGameOver(true); addLog('💀 You died!'); }
          return { ...p, hp: Math.max(0,newPHp) };
        }
      }

      // Check item
      const item = items.find(i => i.x===nx && i.y===ny);
      if (item) {
        setItems(is => is.filter(i => i.id !== item.id));
        if (item.type==='potion') { addLog(`🧪 Potion! +${item.value} HP`); return { ...p, x:nx, y:ny, hp: Math.min(p.maxHp, p.hp+item.value) }; }
        if (item.type==='sword') { addLog(`⚔️ Sword! +${item.value} ATK`); return { ...p, x:nx, y:ny, atk: p.atk+item.value }; }
        if (item.type==='shield') { addLog(`🛡️ Shield! +${item.value} DEF`); return { ...p, x:nx, y:ny, def: p.def+item.value }; }
        if (item.type==='gold') { addLog(`💰 Found ${item.value} gold!`); return { ...p, x:nx, y:ny, gold: p.gold+item.value }; }
      }

      // Stairs
      if (tile === 'stairs') {
        if (floor >= 5) { setVictory(true); addLog('🏆 You escaped the dungeon!'); }
        else { setFloor(f => f+1); addLog(`🔽 Descending to floor ${floor+1}...`); }
      }

      return { ...p, x:nx, y:ny };
    });
  }, [dungeon, enemies, items, floor, gameOver, victory]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (['ArrowUp','w','W'].includes(e.key)) { e.preventDefault(); movePlayer('up'); }
      if (['ArrowDown','s','S'].includes(e.key)) { e.preventDefault(); movePlayer('down'); }
      if (['ArrowLeft','a','A'].includes(e.key)) { e.preventDefault(); movePlayer('left'); }
      if (['ArrowRight','d','D'].includes(e.key)) { e.preventDefault(); movePlayer('right'); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [movePlayer]);

  const tileEmoji = (tile: Tile, hasPlayer: boolean, hasEnemy: Enemy|undefined, hasItem: Item|undefined) => {
    if (hasPlayer) return '🧙';
    if (hasEnemy) return hasEnemy.name==='Goblin'?'👺':hasEnemy.name==='Skeleton'?'💀':hasEnemy.name==='Orc'?'👹':hasEnemy.name==='Troll'?'🧌':'⚔️';
    if (hasItem) return hasItem.type==='potion'?'🧪':hasItem.type==='sword'?'⚔️':hasItem.type==='shield'?'🛡️':'💰';
    if (tile==='stairs') return '🔽';
    if (tile==='wall') return '⬛';
    return '⬜';
  };

  // Calculate visible area around player (fog of war - 8 radius)
  const VISION = 7;
  const visibleTile = (r: number, c: number) => {
    const dx = Math.abs(c - player.x), dy = Math.abs(r - player.y);
    return dx + dy <= VISION;
  };

  const reset = () => {
    setFloor(1);
    setPlayer({ x:2, y:2, hp:30, maxHp:30, atk:8, def:3, xp:0, level:1, gold:0 });
    setGameOver(false);
    setVictory(false);
    setLog(['🗡️ New adventure begins!']);
  };

  return (
    <div className="flex flex-col items-center gap-3 p-3">
      <h2 className="text-3xl font-bold text-purple-400">⚔️ Dungeon Crawler</h2>
      <div className="flex gap-4 text-sm font-semibold flex-wrap justify-center">
        <span className="text-green-400">❤️ {player.hp}/{player.maxHp}</span>
        <span className="text-orange-400">⚔️ ATK {player.atk}</span>
        <span className="text-blue-400">🛡️ DEF {player.def}</span>
        <span className="text-yellow-400">⭐ Lv.{player.level}</span>
        <span className="text-amber-400">💰 {player.gold}g</span>
        <span className="text-purple-300">🏰 Floor {floor}/5</span>
      </div>

      {/* HP bar */}
      <div className="w-full max-w-sm h-3 bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-green-500 transition-all" style={{ width: `${(player.hp/player.maxHp)*100}%` }} />
      </div>

      {(gameOver || victory) && (
        <div className="text-2xl font-bold animate-bounce">
          {victory ? '🏆 Victory! You escaped!' : '💀 Game Over!'}
        </div>
      )}

      <div className="font-mono text-xs leading-none bg-gray-900 rounded-xl p-1 border border-purple-500/30 overflow-auto" style={{maxHeight:'300px'}}>
        {dungeon.tiles.map((row, r) => (
          <div key={r} className="flex">
            {row.map((tile, c) => {
              const visible = visibleTile(r, c);
              const hasPlayer = player.x===c && player.y===r;
              const hasEnemy = enemies.find(e=>e.x===c&&e.y===r);
              const hasItem = items.find(i=>i.x===c&&i.y===r);
              return (
                <span key={c} className={`text-base ${!visible?'opacity-5':''}`} style={{lineHeight:'1.4rem'}}>
                  {visible ? tileEmoji(tile, hasPlayer, hasEnemy, hasItem) : '⬛'}
                </span>
              );
            })}
          </div>
        ))}
      </div>

      {/* D-Pad */}
      <div className="grid grid-cols-3 gap-1 mt-1">
        <div/><button onClick={() => movePlayer('up')} className="w-10 h-10 bg-gray-700 rounded-lg text-lg hover:bg-gray-600 active:scale-95">↑</button><div/>
        <button onClick={() => movePlayer('left')} className="w-10 h-10 bg-gray-700 rounded-lg text-lg hover:bg-gray-600 active:scale-95">←</button>
        <button onClick={() => movePlayer('down')} className="w-10 h-10 bg-gray-700 rounded-lg text-lg hover:bg-gray-600 active:scale-95">↓</button>
        <button onClick={() => movePlayer('right')} className="w-10 h-10 bg-gray-700 rounded-lg text-lg hover:bg-gray-600 active:scale-95">→</button>
      </div>

      {/* Log */}
      <div className="w-full max-w-md bg-gray-900/80 rounded-lg p-2 text-xs h-20 overflow-y-auto border border-gray-700">
        {log.map((l, i) => <div key={i} className={`${i===0?'text-yellow-300':'text-gray-400'}`}>{l}</div>)}
      </div>

      {(gameOver || victory) && (
        <button onClick={reset} className="px-8 py-3 bg-purple-500 text-white font-bold rounded-xl hover:bg-purple-400 transition">
          Play Again
        </button>
      )}
    </div>
  );
}
