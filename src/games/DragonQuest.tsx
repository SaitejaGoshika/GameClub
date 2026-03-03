import { useState } from 'react';

type Scene = 'village'|'forest'|'cave'|'castle'|'shop'|'battle'|'gameover'|'victory';

interface Hero { hp:number; maxHp:number; mp:number; maxMp:number; atk:number; def:number; level:number; xp:number; gold:number; name:string; }
interface Monster { name:string; hp:number; maxHp:number; atk:number; def:number; xpReward:number; goldReward:number; emoji:string; }
interface BattleLog { msg:string; type:'good'|'bad'|'info'; }

const MONSTERS_BY_AREA: Record<string,Monster[]> = {
  forest: [
    { name:'Slime',hp:12,maxHp:12,atk:3,def:1,xpReward:8,goldReward:5,emoji:'🟢' },
    { name:'Wolf',hp:20,maxHp:20,atk:6,def:2,xpReward:15,goldReward:8,emoji:'🐺' },
    { name:'Goblin',hp:18,maxHp:18,atk:5,def:3,xpReward:12,goldReward:10,emoji:'👺' },
  ],
  cave: [
    { name:'Bat',hp:15,maxHp:15,atk:8,def:2,xpReward:18,goldReward:10,emoji:'🦇' },
    { name:'Spider',hp:22,maxHp:22,atk:10,def:4,xpReward:22,goldReward:15,emoji:'🕷️' },
    { name:'Stone Golem',hp:35,maxHp:35,atk:12,def:8,xpReward:35,goldReward:25,emoji:'🗿' },
  ],
  castle: [
    { name:'Dark Knight',hp:40,maxHp:40,atk:15,def:8,xpReward:40,goldReward:30,emoji:'⚔️' },
    { name:'Demon',hp:50,maxHp:50,atk:18,def:10,xpReward:50,goldReward:40,emoji:'👿' },
    { name:'Dragon',hp:80,maxHp:80,atk:25,def:15,xpReward:100,goldReward:100,emoji:'🐉' },
  ],
};

function newHero(): Hero { return { hp:30,maxHp:30,mp:15,maxMp:15,atk:8,def:3,level:1,xp:0,gold:20,name:'Hero' }; }

export default function DragonQuest() {
  const [scene, setScene] = useState<Scene>('village');
  const [hero, setHero] = useState<Hero>(newHero());
  const [monster, setMonster] = useState<Monster|null>(null);
  const [, setArea] = useState<'forest'|'cave'|'castle'>('forest');
  const [battleLog, setBattleLog] = useState<BattleLog[]>([]);
  const [story, setStory] = useState<string[]>(['🏰 Welcome to Dragon Quest! Defeat the Dragon to save the kingdom!','Talk to the Elder in the village to begin your quest.']);
  const [prevScene, setPrevScene] = useState<Scene>('village');
  const [inventory, setInventory] = useState<{potions:number;elixirs:number}>({potions:3,elixirs:0});

  const addLog = (msg:string, type:BattleLog['type']='info') => {
    setBattleLog(l => [{msg,type},...l.slice(0,6)]);
  };

  const addStory = (msg:string) => setStory(l => [msg,...l.slice(0,8)]);

  const enterBattle = (targetArea: 'forest'|'cave'|'castle') => {
    const monsters = MONSTERS_BY_AREA[targetArea];
    const m = {...monsters[Math.floor(Math.random()*monsters.length)]};
    setMonster(m);
    setArea(targetArea);
    setPrevScene(scene);
    setScene('battle');
    setBattleLog([{msg:`⚔️ A wild ${m.name} appeared!`,type:'info'}]);
  };

  const attack = () => {
    if (!monster) return;
    const dmg = Math.max(1, hero.atk - monster.def + Math.floor(Math.random()*4)-1);
    const newMHp = monster.hp - dmg;
    addLog(`🗡️ You hit ${monster.name} for ${dmg} damage!`, 'good');
    if (newMHp <= 0) {
      const xpGain = monster.xpReward;
      const goldGain = monster.goldReward;
      const newXp = hero.xp + xpGain;
      const lvThresh = hero.level * 20;
      const levelUp = newXp >= lvThresh;
      addLog(`💀 ${monster.name} defeated! +${xpGain}XP +${goldGain}G`, 'good');
      if (levelUp) addLog(`🌟 LEVEL UP! Now Lv.${hero.level+1}!`, 'good');
      setHero(h => ({
        ...h,
        gold: h.gold+goldGain,
        xp: levelUp?newXp-lvThresh:newXp,
        level: levelUp?h.level+1:h.level,
        maxHp: levelUp?h.maxHp+10:h.maxHp,
        hp: levelUp?Math.min(h.hp+15,h.maxHp+10):h.hp,
        atk: levelUp?h.atk+2:h.atk,
        def: levelUp?h.def+1:h.def,
        maxMp: levelUp?h.maxMp+5:h.maxMp,
      }));
      setMonster(null);
      if (monster.name === 'Dragon') { setScene('victory'); addStory('🏆 The Dragon has been defeated! The kingdom is saved!'); }
      else setTimeout(()=>setScene(prevScene),1500);
      return;
    }
    setMonster(m => m?{...m,hp:newMHp}:null);
    // Monster attacks back
    setTimeout(()=>{
      const mDmg = Math.max(1, monster.atk - hero.def + Math.floor(Math.random()*4)-1);
      addLog(`💢 ${monster.name} hits you for ${mDmg}!`, 'bad');
      setHero(h=>{
        const newHp = h.hp - mDmg;
        if (newHp <= 0) { setScene('gameover'); return {...h,hp:0}; }
        return {...h, hp:newHp};
      });
    },400);
  };

  const magic = () => {
    if (!monster || hero.mp < 5) { addLog('Not enough MP!','bad'); return; }
    const dmg = Math.max(5, hero.atk*2 - monster.def + Math.floor(Math.random()*6));
    const newMHp = monster.hp - dmg;
    addLog(`✨ Magic attack for ${dmg}!`, 'good');
    setHero(h=>({...h,mp:h.mp-5}));
    if (newMHp <= 0) {
      addLog(`💀 ${monster.name} defeated!`, 'good');
      setHero(h=>({...h,gold:h.gold+monster.goldReward,xp:h.xp+monster.xpReward}));
      setMonster(null);
      if (monster.name === 'Dragon') { setScene('victory'); }
      else setTimeout(()=>setScene(prevScene),1500);
      return;
    }
    setMonster(m=>m?{...m,hp:newMHp}:null);
  };

  const heal = () => {
    if (inventory.potions <= 0) { addLog('No potions!','bad'); return; }
    const amount = 20;
    setInventory(i=>({...i,potions:i.potions-1}));
    setHero(h=>({...h,hp:Math.min(h.maxHp,h.hp+amount)}));
    addLog(`🧪 Healed ${amount} HP!`,'good');
  };

  const flee = () => {
    if (Math.random()>0.4) { addLog('Fled successfully!','info'); setScene(prevScene); setMonster(null); }
    else { addLog('Couldn\'t flee! Monster attacks!','bad'); const d=Math.max(1,monster!.atk-hero.def); setHero(h=>({...h,hp:Math.max(0,h.hp-d)})); }
  };

  const buyPotion = (type:'potion'|'elixir') => {
    const cost = type==='potion'?10:30;
    if (hero.gold < cost) { addStory('Not enough gold!'); return; }
    setHero(h=>({...h,gold:h.gold-cost}));
    if (type==='potion') setInventory(i=>({...i,potions:i.potions+1}));
    else setInventory(i=>({...i,elixirs:i.elixirs+1}));
    addStory(`Bought a ${type}!`);
  };

  const Bar = ({val,max,color}:{val:number;max:number;color:string}) => (
    <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
      <div className={`h-full ${color} transition-all`} style={{width:`${Math.max(0,(val/max)*100)}%`}} />
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-3 p-3 max-w-lg mx-auto">
      <h2 className="text-3xl font-bold text-yellow-400">🐉 Dragon Quest</h2>

      {/* Hero Stats */}
      <div className="w-full bg-gray-800 rounded-xl p-3 border border-yellow-500/30">
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold text-yellow-300">⚔️ {hero.name} Lv.{hero.level}</span>
          <span className="text-amber-400 font-bold">💰 {hero.gold}G</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
          <div><span className="text-red-400">❤️ {hero.hp}/{hero.maxHp}</span><Bar val={hero.hp} max={hero.maxHp} color="bg-red-500"/></div>
          <div><span className="text-blue-400">✨ {hero.mp}/{hero.maxMp}</span><Bar val={hero.mp} max={hero.maxMp} color="bg-blue-500"/></div>
        </div>
        <div className="flex gap-3 text-xs text-gray-300">
          <span>⚔️ ATK:{hero.atk}</span><span>🛡️ DEF:{hero.def}</span>
          <span>⭐ XP:{hero.xp}/{hero.level*20}</span>
          <span>🧪 Pots:{inventory.potions}</span>
        </div>
      </div>

      {scene === 'village' && (
        <div className="w-full flex flex-col gap-3">
          <div className="bg-gray-800 rounded-xl p-4 border border-green-500/30">
            <h3 className="text-green-400 font-bold text-lg mb-2">🏘️ Village of Hope</h3>
            <div className="flex flex-wrap gap-2">
              <button onClick={()=>setScene('shop')} className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-bold transition">🏪 Shop</button>
              <button onClick={()=>{setArea('forest');enterBattle('forest');addStory('You venture into the dark forest...');}} className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg font-bold transition">🌲 Enter Forest</button>
              <button onClick={()=>{if(hero.level<3){addStory('Too dangerous! Train more first.');return;}enterBattle('cave');addStory('You enter the dark cave...');}} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-bold transition">🗻 Enter Cave</button>
              <button onClick={()=>{if(hero.level<5){addStory('The castle is too dangerous! Level 5+ required.');return;}enterBattle('castle');addStory('You storm the Dark Castle!');}} className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded-lg font-bold transition">🏰 Dark Castle</button>
              <button onClick={()=>{setHero(h=>({...h,hp:h.maxHp,mp:h.maxMp}));addStory('You rested at the inn. HP & MP fully restored!');}} className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg font-bold transition">🛏️ Rest (Free)</button>
            </div>
          </div>
        </div>
      )}

      {scene === 'shop' && (
        <div className="w-full bg-gray-800 rounded-xl p-4 border border-yellow-500/30">
          <h3 className="text-yellow-400 font-bold text-lg mb-3">🏪 Item Shop</h3>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center bg-gray-700 rounded-lg p-2">
              <span>🧪 Health Potion (+20 HP)</span>
              <button onClick={()=>buyPotion('potion')} className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded font-bold">10G</button>
            </div>
            <div className="flex justify-between items-center bg-gray-700 rounded-lg p-2">
              <span>✨ Elixir (+Full HP/MP)</span>
              <button onClick={()=>buyPotion('elixir')} className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold">30G</button>
            </div>
          </div>
          <button onClick={()=>setScene('village')} className="mt-3 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-bold transition">← Back to Village</button>
        </div>
      )}

      {scene === 'battle' && monster && (
        <div className="w-full bg-gray-800 rounded-xl p-4 border border-red-500/30">
          <div className="flex justify-between items-center mb-3">
            <span className="text-4xl">{monster.emoji}</span>
            <div className="flex-1 ml-3">
              <div className="font-bold text-red-300 text-lg">{monster.name}</div>
              <div className="text-xs text-gray-400">HP: {monster.hp}/{monster.maxHp}</div>
              <Bar val={monster.hp} max={monster.maxHp} color="bg-red-500"/>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <button onClick={attack} className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg font-bold transition">⚔️ Attack</button>
            <button onClick={magic} disabled={hero.mp<5} className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg font-bold transition disabled:opacity-40">✨ Magic (5MP)</button>
            <button onClick={heal} disabled={inventory.potions<=0} className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg font-bold transition disabled:opacity-40">🧪 Potion ({inventory.potions})</button>
            <button onClick={flee} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-bold transition">🏃 Flee</button>
          </div>
          <div className="bg-gray-900 rounded-lg p-2 h-28 overflow-y-auto text-xs">
            {battleLog.map((l,i)=><div key={i} className={`${l.type==='good'?'text-green-400':l.type==='bad'?'text-red-400':'text-gray-300'}`}>{l.msg}</div>)}
          </div>
        </div>
      )}

      {scene === 'gameover' && (
        <div className="w-full text-center bg-gray-800 rounded-xl p-6">
          <div className="text-4xl mb-2">💀</div>
          <div className="text-2xl font-bold text-red-400 mb-2">Game Over!</div>
          <button onClick={()=>{setHero(newHero());setInventory({potions:3,elixirs:0});setScene('village');setStory(['New adventure begins!']);}} className="px-8 py-3 bg-red-500 hover:bg-red-400 text-white font-bold rounded-xl transition">Start Over</button>
        </div>
      )}

      {scene === 'victory' && (
        <div className="w-full text-center bg-gray-800 rounded-xl p-6">
          <div className="text-4xl mb-2">🏆</div>
          <div className="text-2xl font-bold text-yellow-400 mb-2">Victory! Dragon Slain!</div>
          <button onClick={()=>{setHero(newHero());setInventory({potions:3,elixirs:0});setScene('village');setStory(['A new hero rises!']);}} className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition">Play Again</button>
        </div>
      )}

      {/* Story Log */}
      <div className="w-full bg-gray-900/80 rounded-lg p-2 text-xs h-20 overflow-y-auto border border-gray-700">
        {story.map((s,i)=><div key={i} className={`${i===0?'text-yellow-300':'text-gray-400'}`}>{s}</div>)}
      </div>
    </div>
  );
}
