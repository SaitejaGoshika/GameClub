import { useState, useMemo } from "react";
import GCLogo from "./components/GCLogo";

// ── Classic Games ──
import SnakeGame from "./games/SnakeGame";
import TicTacToe from "./games/TicTacToe";
import MemoryGame from "./games/MemoryGame";
import BreakoutGame from "./games/BreakoutGame";
import Wordle from "./games/Wordle";
import Tetris from "./games/Tetris";
import Game2048 from "./games/Game2048";
import Minesweeper from "./games/Minesweeper";
import Sudoku from "./games/Sudoku";

// ── Arcade Games ──
import FlappyBird from "./games/FlappyBird";
import WhackAMole from "./games/WhackAMole";
import RockPaperScissors from "./games/RockPaperScissors";
import SimonSays from "./games/SimonSays";
import AsteroidDodge from "./games/AsteroidDodge";
import BubblePop from "./games/BubblePop";
import ReflexRoyale from "./games/ReflexRoyale";

// ── 2 Player Games ──
import Pong from "./games/Pong";
import ConnectFour from "./games/ConnectFour";
import Battleship from "./games/Battleship";
import AirHockey from "./games/AirHockey";
import CheckersGame from "./games/CheckersGame";
import QuantumTicTacToe from "./games/QuantumTicTacToe";
import MathDuel from "./games/MathDuel";
import PairsCard from "./games/PairsCard";

// ── Adventure Games ──
import DungeonCrawler from "./games/DungeonCrawler";
import SpaceShooter from "./games/SpaceShooter";
import PlatformRunner from "./games/PlatformRunner";
import DragonQuest from "./games/DragonQuest";
import ChainReactionArena from "./games/ChainReactionArena";
import EndlessRunner from "./games/EndlessRunner";
import GravityBall from "./games/GravityBall";

// ── Puzzle Games ──
import CodeBreakerArena from "./games/CodeBreakerArena";
import LogicGridWars from "./games/LogicGridWars";
import SmartSudokuShowdown from "./games/SmartSudokuShowdown";
import CipherConquest from "./games/CipherConquest";
import TowerOfHanoi from "./games/TowerOfHanoi";
import LightsOut from "./games/LightsOut";
import SliderPuzzle from "./games/SliderPuzzle";
import ColorFlood from "./games/ColorFlood";
import NumberGuess from "./games/NumberGuess";

// ── Brain / Strategy Games ──
import AIMindReader from "./games/AIMindReader";
import PatternClash from "./games/PatternClash";
import BluffAndDetect from "./games/BluffAndDetect";
import BrainwaveBattles from "./games/BrainwaveBattles";
import HexaDomination from "./games/HexaDomination";
import TerritoryTactix from "./games/TerritoryTactix";
import ColorMemory from "./games/ColorMemory";
import MineRacer from "./games/MineRacer";

// ── Word / Casual Games ──
import CardWar from "./games/CardWar";
import EmojiQuiz from "./games/EmojiQuiz";
import WordChain from "./games/WordChain";
import WordScramble from "./games/WordScramble";
import TypingSpeed from "./games/TypingSpeed";
import MathSprint from "./games/MathSprint";
import TriviaQuiz from "./games/TriviaQuiz";
import PingPongSolo from "./games/PingPongSolo";

interface Game {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  bg: string;
  border: string;
  textColor: string;
  component: React.FC;
  tag: string;
  instructions?: string[];
  hot?: boolean;
  new?: boolean;
}

const GAMES: Game[] = [
  // ── CLASSIC (9) ──
  {
    id: "snake", name: "Snake", emoji: "🐍", tag: "Classic",
    description: "Eat food, grow longer, don't hit walls!",
    color: "from-green-600 to-emerald-700", bg: "bg-green-900/20", border: "border-green-500/40", textColor: "text-green-400",
    component: SnakeGame,
    instructions: ["Use Arrow Keys or WASD to move the snake", "Eat the 🔴 food to grow longer", "Don't hit the walls or your own tail", "Speed increases as you grow — survive as long as possible!"],
  },
  {
    id: "tetris", name: "Tetris", emoji: "🧩", tag: "Classic",
    description: "Stack blocks and clear lines to level up!",
    color: "from-purple-600 to-violet-700", bg: "bg-purple-900/20", border: "border-purple-500/40", textColor: "text-purple-400",
    component: Tetris,
    instructions: ["← → Arrow Keys to move pieces", "↑ Arrow to rotate", "↓ Arrow to soft drop, Space to hard drop", "Clear full horizontal lines to score points", "Game ends when pieces stack to the top"],
  },
  {
    id: "breakout", name: "Breakout", emoji: "🧱", tag: "Classic",
    description: "Break all bricks with your paddle and ball!",
    color: "from-orange-600 to-amber-700", bg: "bg-orange-900/20", border: "border-orange-500/40", textColor: "text-orange-400",
    component: BreakoutGame,
    instructions: ["Move mouse or use ← → Arrow Keys to control the paddle", "Keep the ball from falling off the bottom", "Break all bricks to advance to the next level", "Gold bricks require 2 hits!", "You have 3 lives — use them wisely"],
  },
  {
    id: "minesweeper", name: "Minesweeper", emoji: "💣", tag: "Classic",
    description: "Clear the board without hitting mines!",
    color: "from-red-600 to-rose-700", bg: "bg-red-900/20", border: "border-red-500/40", textColor: "text-red-400",
    component: Minesweeper,
    instructions: ["Left-click to reveal a cell", "Right-click to place or remove a flag 🚩", "Numbers show how many mines are nearby", "Clear all non-mine cells to win", "Choose Easy, Medium or Hard difficulty"],
  },
  {
    id: "2048", name: "2048", emoji: "🔢", tag: "Classic",
    description: "Merge tiles and reach the 2048 tile!",
    color: "from-yellow-500 to-orange-600", bg: "bg-yellow-900/20", border: "border-yellow-500/40", textColor: "text-yellow-400",
    component: Game2048,
    instructions: ["Use Arrow Keys or swipe to slide all tiles", "Matching tiles merge and double in value", "Reach the 2048 tile to win!", "The game ends when no moves are left", "Try to beat your highest score!"],
  },
  {
    id: "sudoku", name: "Sudoku", emoji: "🔣", tag: "Classic",
    description: "Fill the grid with numbers 1–9!",
    color: "from-blue-600 to-indigo-700", bg: "bg-blue-900/20", border: "border-blue-500/40", textColor: "text-blue-400",
    component: Sudoku,
    instructions: ["Click a cell and type a number 1–9", "Every row, column, and 3×3 box must have 1–9", "Blue cells are pre-filled clues — don't change them", "Red cells indicate conflicts — fix them!", "Choose Easy, Medium or Hard difficulty"],
  },
  {
    id: "memory", name: "Memory Match", emoji: "🃏", tag: "Classic",
    description: "Flip cards and match emoji pairs!",
    color: "from-cyan-600 to-sky-700", bg: "bg-cyan-900/20", border: "border-cyan-500/40", textColor: "text-cyan-400",
    component: MemoryGame,
    instructions: ["Click any card to flip it over", "Flip a second card to try to find its match", "Matched pairs stay face up", "If they don't match, both cards flip back after a moment", "Match all pairs in the fewest moves!"],
  },
  {
    id: "wordle", name: "Wordle", emoji: "📝", tag: "Classic",
    description: "Guess the 5-letter word in 6 tries!",
    color: "from-lime-600 to-green-700", bg: "bg-lime-900/20", border: "border-lime-500/40", textColor: "text-lime-400",
    component: Wordle,
    instructions: ["Type a 5-letter word and press Enter", "🟩 Green = correct letter in correct spot", "🟨 Yellow = correct letter in wrong spot", "⬛ Gray = letter not in the word", "You have 6 guesses — find the secret word!"],
    hot: true,
  },
  {
    id: "pingpong", name: "Ping Pong Solo", emoji: "🏓", tag: "Classic",
    description: "Solo paddle challenge — keep the rally going!",
    color: "from-sky-500 to-blue-600", bg: "bg-sky-900/20", border: "border-sky-500/40", textColor: "text-sky-400",
    component: PingPongSolo,
    instructions: ["Move mouse or use ← → to control your paddle", "Don't let the ball get past you!", "Ball speeds up with each hit", "Beat your high score!"],
  },

  // ── ARCADE (7) ──
  {
    id: "flappy", name: "Flappy Bird", emoji: "🐦", tag: "Arcade",
    description: "Tap to fly through the pipes!",
    color: "from-teal-500 to-cyan-600", bg: "bg-teal-900/20", border: "border-teal-500/40", textColor: "text-teal-400",
    component: FlappyBird,
    instructions: ["Press Space, click, or tap the screen to flap", "Fly through the gaps between the green pipes", "Each pipe you pass earns 1 point", "Don't hit the pipes or the ground — game over!", "Beat your best score!"],
  },
  {
    id: "whack", name: "Whack-a-Mole", emoji: "🔨", tag: "Arcade",
    description: "Whack the moles as fast as you can!",
    color: "from-amber-500 to-yellow-600", bg: "bg-amber-900/20", border: "border-amber-500/40", textColor: "text-amber-400",
    component: WhackAMole,
    instructions: ["Click or tap moles as they pop up to whack them!", "You have 30 seconds — score as many hits as possible", "Combos give bonus points — hit multiple moles quickly!", "Missed moles cost you a point", "Aim for the highest score!"],
  },
  {
    id: "rps", name: "Rock Paper Scissors", emoji: "✂️", tag: "Arcade",
    description: "Challenge the CPU — best of 5 wins!",
    color: "from-fuchsia-600 to-purple-700", bg: "bg-fuchsia-900/20", border: "border-fuchsia-500/40", textColor: "text-fuchsia-400",
    component: RockPaperScissors,
    instructions: ["Choose Rock 🪨, Paper 📄, or Scissors ✂️", "Rock beats Scissors, Scissors beats Paper, Paper beats Rock", "Win 5 rounds before the CPU to win!", "The CPU adapts based on your past choices — be unpredictable!"],
  },
  {
    id: "simon", name: "Simon Says", emoji: "🎵", tag: "Arcade",
    description: "Repeat the color pattern — how far can you go?",
    color: "from-indigo-600 to-blue-700", bg: "bg-indigo-900/20", border: "border-indigo-500/40", textColor: "text-indigo-400",
    component: SimonSays,
    instructions: ["Watch the colored buttons light up in a sequence", "Repeat the sequence by pressing the same buttons", "Each round adds one more color to the sequence", "One mistake and the game is over!", "How long a sequence can you remember?"],
  },
  {
    id: "asteroid", name: "Asteroid Dodge", emoji: "☄️", tag: "Arcade",
    description: "Dodge falling asteroids as long as you can!",
    color: "from-slate-500 to-gray-700", bg: "bg-slate-900/20", border: "border-slate-500/40", textColor: "text-slate-400",
    component: AsteroidDodge,
    instructions: ["Move your ship left and right with ← → or drag on mobile", "Dodge all incoming asteroids", "Asteroids speed up over time — stay sharp!", "One hit and it's game over", "Survive as long as possible!"],
    new: true,
  },
  {
    id: "bubblepop", name: "Bubble Pop", emoji: "🫧", tag: "Arcade",
    description: "Pop matching colored bubbles before they overflow!",
    color: "from-pink-500 to-rose-600", bg: "bg-pink-900/20", border: "border-pink-500/40", textColor: "text-pink-400",
    component: BubblePop,
    instructions: ["Click groups of 2 or more same-colored bubbles to pop them", "Larger groups give more points", "Don't let bubbles reach the top — game over!", "Use special bubbles for bonus clears", "Clear the board for a big bonus!"],
    new: true,
  },
  {
    id: "reflexroyale", name: "Reflex Royale", emoji: "⚡", tag: "Arcade",
    description: "Fastest reflexes win! Tap targets instantly!",
    color: "from-yellow-500 to-orange-500", bg: "bg-yellow-900/20", border: "border-yellow-500/40", textColor: "text-yellow-300",
    component: ReflexRoyale,
    instructions: ["Tap/click the glowing target as fast as possible", "Each successful hit scores points based on your reaction time", "Miss a target and lose a life", "Targets move faster as levels increase", "Compete for the fastest reaction time!"],
  },

  // ── 2 PLAYER (8) ──
  {
    id: "tictactoe", name: "Tic Tac Toe", emoji: "❌", tag: "2 Player",
    description: "X vs O — play vs AI or a friend!",
    color: "from-pink-600 to-rose-700", bg: "bg-pink-900/20", border: "border-pink-500/40", textColor: "text-pink-400",
    component: TicTacToe,
    instructions: ["Players take turns placing X and O", "Get 3 in a row (horizontal, vertical, diagonal) to win", "Play vs AI or pass the device for 2-player mode", "AI uses minimax — try to outsmart it!"],
  },
  {
    id: "pong", name: "Pong", emoji: "🏓", tag: "2 Player",
    description: "Classic paddle battle vs AI or a friend!",
    color: "from-sky-600 to-blue-700", bg: "bg-sky-900/20", border: "border-sky-500/40", textColor: "text-sky-400",
    component: Pong,
    instructions: ["Player 1: W/S keys or drag on mobile to move paddle", "Player 2: ↑/↓ Arrow Keys (or vs AI)", "First to score 7 points wins!", "Ball speeds up after each hit", "Aim for the edges of the opponent's paddle for tricky angles"],
  },
  {
    id: "connectfour", name: "Connect Four", emoji: "🔴", tag: "2 Player",
    description: "Drop discs to connect 4 in a row!",
    color: "from-yellow-500 to-red-600", bg: "bg-yellow-900/20", border: "border-yellow-500/40", textColor: "text-yellow-400",
    component: ConnectFour,
    instructions: ["Click a column to drop your disc", "Connect 4 discs in a row — horizontal, vertical, or diagonal", "Play vs AI or a friend in 2-player mode", "AI uses smart minimax strategy — plan ahead!"],
  },
  {
    id: "battleship", name: "Battleship", emoji: "⚓", tag: "2 Player",
    description: "Sink the enemy fleet before yours sinks!",
    color: "from-blue-600 to-cyan-700", bg: "bg-blue-900/20", border: "border-blue-500/40", textColor: "text-blue-400",
    component: Battleship,
    instructions: ["Place your ships on the grid by clicking and dragging", "Take turns clicking enemy grid squares to fire", "💥 Hit = red, 🌊 Miss = blue", "Sink all enemy ships before they sink yours!", "AI opponent uses hunt-target logic"],
  },
  {
    id: "airhockey", name: "Air Hockey", emoji: "🏒", tag: "2 Player",
    description: "Score 7 goals — mouse vs AI or 2-player!",
    color: "from-cyan-500 to-teal-600", bg: "bg-cyan-900/20", border: "border-cyan-500/40", textColor: "text-cyan-400",
    component: AirHockey,
    instructions: ["Move your mouse or drag to control your mallet", "Hit the puck into the opponent's goal", "First player to 7 goals wins!", "Player 2 controls: drag on upper half of the table", "AI reacts to puck position — stay aggressive!"],
  },
  {
    id: "checkers", name: "Checkers", emoji: "♟️", tag: "2 Player",
    description: "Classic draughts — capture all enemy pieces!",
    color: "from-orange-500 to-amber-600", bg: "bg-orange-900/20", border: "border-orange-500/40", textColor: "text-orange-300",
    component: CheckersGame,
    instructions: ["Click a piece to select it, then click the destination", "Pieces move diagonally forward only", "Jump over enemy pieces to capture them", "Chain multiple jumps in one turn!", "Reach the opponent's back row to become a King (moves any direction)"],
  },
  {
    id: "quantumttt", name: "Quantum Tic-Tac-Toe", emoji: "⚛️", tag: "2 Player",
    description: "Superposition moves — quantum strategy!",
    color: "from-violet-600 to-purple-700", bg: "bg-violet-900/20", border: "border-violet-500/40", textColor: "text-violet-300",
    component: QuantumTicTacToe,
    instructions: ["Each turn, place your mark in 2 cells simultaneously (superposition)", "When a cycle forms, a collapse happens — one cell becomes classical", "Classical marks follow standard Tic-Tac-Toe rules", "Get 3 classical marks in a row to win!", "Think quantum — plan both possibilities at once"],
    hot: true,
  },
  {
    id: "mathduel", name: "Math Duel", emoji: "🧮", tag: "2 Player",
    description: "Two players race to solve math problems!",
    color: "from-teal-600 to-cyan-700", bg: "bg-teal-900/20", border: "border-teal-500/40", textColor: "text-teal-300",
    component: MathDuel,
    instructions: ["Two players on the same device", "A math question appears — answer as fast as you can", "Player 1 uses left side buttons, Player 2 uses right side", "First to 10 correct answers wins!", "Difficulty increases every 3 correct answers"],
    new: true,
  },

  // ── ADVENTURE (7) ──
  {
    id: "dungeon", name: "Dungeon Crawler", emoji: "⚔️", tag: "Adventure",
    description: "Explore dungeons, slay monsters, level up!",
    color: "from-purple-700 to-indigo-800", bg: "bg-purple-900/30", border: "border-purple-400/40", textColor: "text-purple-300",
    component: DungeonCrawler,
    instructions: ["Use Arrow Keys or WASD to move your hero", "Walk into enemies to attack them", "Collect ❤️ potions to restore health", "Find the 🔑 key to unlock the 🚪 exit door", "Clear all 5 dungeon floors to win!"],
  },
  {
    id: "spaceshooter", name: "Space Shooter", emoji: "🚀", tag: "Adventure",
    description: "Blast alien invaders across the galaxy!",
    color: "from-blue-700 to-indigo-800", bg: "bg-blue-900/30", border: "border-blue-400/40", textColor: "text-blue-300",
    component: SpaceShooter,
    instructions: ["Move: Arrow Keys or WASD, or drag on mobile", "Auto-fires bullets at enemies", "Shoot all enemies before they reach the bottom", "Collect power-ups for multi-shot and shields", "Each wave gets harder — survive as long as possible!"],
  },
  {
    id: "platform", name: "Platform Runner", emoji: "🏃", tag: "Adventure",
    description: "Jump across platforms, collect coins!",
    color: "from-green-600 to-teal-700", bg: "bg-green-900/30", border: "border-green-400/40", textColor: "text-green-300",
    component: PlatformRunner,
    instructions: ["← → Arrow Keys or A/D to run", "Space or ↑ to jump (double-jump available)", "Collect coins 🪙 for points", "Avoid spikes and gaps", "Reach the flag 🚩 to complete the level!"],
  },
  {
    id: "dragonquest", name: "Dragon Quest", emoji: "🐉", tag: "Adventure",
    description: "RPG adventure — level up and slay the Dragon!",
    color: "from-yellow-600 to-red-700", bg: "bg-yellow-900/30", border: "border-yellow-400/40", textColor: "text-yellow-300",
    component: DragonQuest,
    instructions: ["Choose Attack, Magic, or Defend each turn in battle", "Collect gold from defeated enemies", "Visit the Shop between battles to buy HP potions", "Level up to increase your Attack and Max HP", "Defeat the final Dragon Boss to win the game!"],
  },
  {
    id: "chainreaction", name: "Chain Reaction Arena", emoji: "💥", tag: "Adventure",
    description: "Explode orbs in a chain reaction strategy!",
    color: "from-red-600 to-orange-600", bg: "bg-red-900/30", border: "border-red-400/40", textColor: "text-red-300",
    component: ChainReactionArena,
    instructions: ["Click a cell to add your colored orb", "When a cell reaches its critical mass, it explodes", "Explosions spread to adjacent cells — convert enemy orbs!", "Eliminate all enemy orbs to win", "Play vs AI or take turns with a friend"],
  },
  {
    id: "endlessrunner", name: "Endless Runner", emoji: "🏅", tag: "Adventure",
    description: "Run forever, jump obstacles, beat your best!",
    color: "from-amber-600 to-orange-700", bg: "bg-amber-900/30", border: "border-amber-400/40", textColor: "text-amber-300",
    component: EndlessRunner,
    instructions: ["Press Space, tap, or click to jump over obstacles", "Double-tap for a double jump", "Speed increases over time — stay alert!", "Collect coins for bonus score", "How far can you run?"],
    new: true,
  },
  {
    id: "gravityball", name: "Gravity Ball", emoji: "🌀", tag: "Adventure",
    description: "Navigate a ball through gravity puzzles!",
    color: "from-violet-600 to-indigo-700", bg: "bg-violet-900/30", border: "border-violet-400/40", textColor: "text-violet-300",
    component: GravityBall,
    instructions: ["Tilt the device or use Arrow Keys to roll the ball", "Reach the goal ⭐ to complete the level", "Avoid falling into holes!", "Collect stars for bonus points", "Each level increases in complexity"],
    new: true,
  },

  // ── PUZZLE (9) ──
  {
    id: "codebreaker", name: "CodeBreaker Arena", emoji: "🔐", tag: "Puzzle",
    description: "Crack the 4-color secret code in 8 tries!",
    color: "from-orange-600 to-yellow-600", bg: "bg-orange-900/20", border: "border-orange-500/40", textColor: "text-orange-300",
    component: CodeBreakerArena,
    instructions: ["Select 4 colors to make your guess", "⚫ = right color, wrong position", "🟡 = right color, right position", "Use feedback to narrow down the code", "Crack it in 8 tries or less!"],
  },
  {
    id: "logicgrid", name: "Logic Grid Wars", emoji: "🧮", tag: "Puzzle",
    description: "Solve logic grid puzzles before time runs out!",
    color: "from-sky-600 to-blue-700", bg: "bg-sky-900/20", border: "border-sky-500/40", textColor: "text-sky-300",
    component: LogicGridWars,
    instructions: ["Read the clues carefully to deduce the solution", "Click cells to mark ✓ (true) or ✗ (false)", "Use process of elimination with the given clues", "Complete the grid before the timer runs out", "Solve more puzzles to unlock harder grids"],
  },
  {
    id: "smartsudoku", name: "Smart Sudoku Showdown", emoji: "🏆", tag: "Puzzle",
    description: "Race to complete Sudoku faster than the AI!",
    color: "from-emerald-600 to-green-700", bg: "bg-emerald-900/20", border: "border-emerald-500/40", textColor: "text-emerald-300",
    component: SmartSudokuShowdown,
    instructions: ["Click cells and type numbers 1–9 to fill the grid", "Every row, column, and 3×3 box must contain 1–9", "Race against the AI solver — finish before it does!", "Accuracy matters — mistakes slow you down", "Choose your difficulty before the race starts"],
  },
  {
    id: "cipher", name: "Cipher Conquest", emoji: "🔏", tag: "Puzzle",
    description: "Decode encrypted messages to conquer the realm!",
    color: "from-amber-600 to-yellow-700", bg: "bg-amber-900/20", border: "border-amber-500/40", textColor: "text-amber-300",
    component: CipherConquest,
    instructions: ["A scrambled message is shown using a cipher key", "Use letter frequency hints to decode it", "Click encoded letters and type what you think they map to", "Decode the full message before time runs out", "Each level uses a harder encryption method"],
  },
  {
    id: "towerofhanoi", name: "Tower of Hanoi", emoji: "🗼", tag: "Puzzle",
    description: "Move all discs from peg A to peg C!",
    color: "from-indigo-600 to-purple-700", bg: "bg-indigo-900/20", border: "border-indigo-500/40", textColor: "text-indigo-300",
    component: TowerOfHanoi,
    instructions: ["Click a peg to pick up the top disc", "Click another peg to place the disc there", "A larger disc can NEVER be placed on a smaller one", "Move all discs from the left peg to the right peg", "Try to solve it in the minimum number of moves (2ⁿ − 1)!"],
    new: true,
  },
  {
    id: "lightsout", name: "Lights Out", emoji: "💡", tag: "Puzzle",
    description: "Turn all lights off by clicking cells!",
    color: "from-yellow-600 to-amber-700", bg: "bg-yellow-900/20", border: "border-yellow-500/40", textColor: "text-yellow-300",
    component: LightsOut,
    instructions: ["Click any cell to toggle it and its neighbors on/off", "Your goal is to turn ALL lights OFF", "Each click affects the clicked cell and adjacent cells (up/down/left/right)", "Plan your moves carefully — order matters!", "Solve in fewer moves for a higher score"],
    new: true,
  },
  {
    id: "sliderpuzzle", name: "Slider Puzzle", emoji: "🎭", tag: "Puzzle",
    description: "Slide tiles into the correct order!",
    color: "from-teal-600 to-cyan-700", bg: "bg-teal-900/20", border: "border-teal-500/40", textColor: "text-teal-300",
    component: SliderPuzzle,
    instructions: ["Click a tile adjacent to the empty space to slide it", "Arrange all numbered tiles in order (1–15)", "The blank space should end up in the bottom-right corner", "Try to solve it in as few moves as possible", "Smaller number of moves = higher star rating!"],
    new: true,
  },
  {
    id: "colorflood", name: "Color Flood", emoji: "🌊", tag: "Puzzle",
    description: "Flood fill the board with one color!",
    color: "from-blue-500 to-cyan-600", bg: "bg-blue-900/20", border: "border-blue-500/40", textColor: "text-blue-300",
    component: ColorFlood,
    instructions: ["Click a color button to flood-fill from the top-left corner", "Connected same-colored cells all change to the chosen color", "Expand your territory to cover the entire board", "Complete the board within the allowed number of moves", "Fewer moves = higher score!"],
  },
  {
    id: "numberguess", name: "Number Guess", emoji: "🔮", tag: "Puzzle",
    description: "Guess the secret number with hot/cold hints!",
    color: "from-fuchsia-600 to-pink-700", bg: "bg-fuchsia-900/20", border: "border-fuchsia-500/40", textColor: "text-fuchsia-300",
    component: NumberGuess,
    instructions: ["The computer picks a secret number", "Type your guess and press Enter", "Too High / Too Low hints guide you", "Find the number in the fewest guesses possible", "Challenge: guess it in 7 tries or less!"],
  },

  // ── BRAIN / STRATEGY (8) ──
  {
    id: "aimindreader", name: "AI Mind Reader Duel", emoji: "🧠", tag: "Brain",
    description: "The AI predicts your next move — can you beat it?",
    color: "from-purple-600 to-pink-700", bg: "bg-purple-900/20", border: "border-purple-500/40", textColor: "text-purple-300",
    component: AIMindReader,
    instructions: ["Choose Left or Right each round", "The AI studies your patterns and tries to predict your choice", "If the AI guesses correctly, it scores — if not, you score", "Play 20 rounds — highest score wins!", "Be as random as possible to fool the AI"],
  },
  {
    id: "patternclash", name: "Pattern Clash", emoji: "🌀", tag: "Brain",
    description: "Match patterns faster than your opponent!",
    color: "from-pink-600 to-rose-700", bg: "bg-pink-900/20", border: "border-pink-500/40", textColor: "text-pink-300",
    component: PatternClash,
    instructions: ["A pattern flashes on screen briefly", "Choose the matching pattern from 4 options", "Answer fast — speed = bonus points!", "Patterns get more complex each level", "First to 10 correct wins!"],
  },
  {
    id: "bluffdetect", name: "Bluff & Detect", emoji: "🃏", tag: "Brain",
    description: "Bluff your way to victory or catch the liar!",
    color: "from-rose-600 to-red-700", bg: "bg-rose-900/20", border: "border-rose-500/40", textColor: "text-rose-300",
    component: BluffAndDetect,
    instructions: ["You're dealt cards — decide whether to play honestly or bluff", "Your opponent does the same", "Call 'Bluff' if you think the opponent is lying", "Caught bluffing = lose points; wrong call = lose points too", "Highest score after 10 rounds wins!"],
  },
  {
    id: "brainwave", name: "Brainwave Battles", emoji: "🎯", tag: "Brain",
    description: "Math & logic duels — fastest brain wins!",
    color: "from-cyan-600 to-teal-700", bg: "bg-cyan-900/20", border: "border-cyan-500/40", textColor: "text-cyan-300",
    component: BrainwaveBattles,
    instructions: ["A math or logic question appears on screen", "Tap the correct answer before the timer runs out", "Faster answers = more points", "Questions get harder every 5 rounds", "Reach 20 correct answers to win the battle!"],
  },
  {
    id: "hexadomination", name: "Hexa Domination", emoji: "⬡", tag: "Brain",
    description: "Conquer the hex board with strategic moves!",
    color: "from-violet-600 to-indigo-700", bg: "bg-violet-900/20", border: "border-violet-500/40", textColor: "text-violet-300",
    component: HexaDomination,
    instructions: ["Click a hex cell to claim it", "Connect your cells from one side of the board to the other", "Block your opponent from connecting their side", "First player to form an unbroken chain wins!", "You cannot capture an opponent's cell directly"],
  },
  {
    id: "territorytactix", name: "Territory Tactix", emoji: "🗺️", tag: "Brain",
    description: "Claim and defend territory against the AI!",
    color: "from-green-600 to-emerald-700", bg: "bg-green-900/20", border: "border-green-500/40", textColor: "text-green-300",
    component: TerritoryTactix,
    instructions: ["Click an empty cell to claim it as your territory", "Surround enemy territory to capture it", "The player with the most territory at the end wins", "AI will try to cut off your expansion — plan ahead!", "Game ends when the board is full"],
  },
  {
    id: "colormemory", name: "Color Memory", emoji: "🎨", tag: "Brain",
    description: "Memorize and recreate the color sequence!",
    color: "from-pink-500 to-fuchsia-600", bg: "bg-pink-900/20", border: "border-pink-500/40", textColor: "text-pink-300",
    component: ColorMemory,
    instructions: ["Watch the color sequence carefully", "After it plays, recreate the exact sequence", "Each successful round adds one more color", "One mistake ends the game", "How long a sequence can you remember?"],
    new: true,
  },
  {
    id: "mineracer", name: "Mine Racer", emoji: "🏁", tag: "Brain",
    description: "Navigate the mine field — fastest path wins!",
    color: "from-red-600 to-orange-700", bg: "bg-red-900/20", border: "border-red-500/40", textColor: "text-red-300",
    component: MineRacer,
    instructions: ["Click adjacent cells to move your racer forward", "Avoid hidden mines — step on one and restart!", "Reach the finish line ⭐ as fast as possible", "Flagging suspected mines helps you plan safe paths", "Fastest time on the leaderboard wins!"],
    new: true,
  },

  // ── WORD & CASUAL (8) ──
  {
    id: "cardwar", name: "Card War", emoji: "🎴", tag: "Casual",
    description: "Flip cards — highest card takes the pile!",
    color: "from-red-500 to-rose-600", bg: "bg-red-900/20", border: "border-red-500/40", textColor: "text-red-300",
    component: CardWar,
    instructions: ["Press 'Draw' to flip your top card", "The higher card wins both cards", "Ties go to a 'War' — 3 face-down, 1 face-up decides!", "Collect all cards to win", "Classic card game — pure luck!"],
  },
  {
    id: "emojiquiz", name: "Emoji Quiz", emoji: "😀", tag: "Casual",
    description: "Guess the word from emoji clues!",
    color: "from-yellow-400 to-orange-500", bg: "bg-yellow-900/20", border: "border-yellow-500/40", textColor: "text-yellow-300",
    component: EmojiQuiz,
    instructions: ["A sequence of emojis represents a word, phrase, or movie", "Type your answer in the input box", "Get hints if you're stuck (costs points)", "Answer as many as possible in 60 seconds", "Each correct answer scores based on difficulty"],
  },
  {
    id: "wordchain", name: "Word Chain", emoji: "🔗", tag: "Word",
    description: "Chain words — each must start with last letter!",
    color: "from-lime-500 to-green-600", bg: "bg-lime-900/20", border: "border-lime-500/40", textColor: "text-lime-300",
    component: WordChain,
    instructions: ["Type a word that starts with the last letter of the previous word", "Example: CAT → TABLE → ELEPHANT → ...", "No repeating words allowed!", "You have 10 seconds per word — think fast!", "Beat the AI at its own game"],
  },
  {
    id: "wordscramble", name: "Word Scramble", emoji: "🔀", tag: "Word",
    description: "Unscramble the letters to find the word!",
    color: "from-cyan-500 to-blue-600", bg: "bg-cyan-900/20", border: "border-cyan-500/40", textColor: "text-cyan-300",
    component: WordScramble,
    instructions: ["A scrambled word is displayed", "Type the correct unscrambled word", "Use the hint button if you're stuck", "Faster answers = more points", "50 words — how many can you unscramble?"],
  },
  {
    id: "typingspeed", name: "Typing Speed", emoji: "⌨️", tag: "Casual",
    description: "Type the passage as fast and accurate as you can!",
    color: "from-slate-500 to-gray-600", bg: "bg-slate-900/20", border: "border-slate-500/40", textColor: "text-slate-300",
    component: TypingSpeed,
    instructions: ["Read the text passage shown on screen", "Start typing to begin the timer", "Type as fast and accurately as possible", "Your WPM (Words Per Minute) and accuracy are scored", "Beat your personal best!"],
  },
  {
    id: "mathsprint", name: "Math Sprint", emoji: "➕", tag: "Casual",
    description: "Solve math problems as fast as possible!",
    color: "from-green-500 to-teal-600", bg: "bg-green-900/20", border: "border-green-500/40", textColor: "text-green-300",
    component: MathSprint,
    instructions: ["A math problem appears — solve it as fast as possible!", "Type your answer and press Enter", "Wrong answers don't count — keep going!", "Score 1 point per correct answer within 60 seconds", "Difficulty rises every 10 correct answers"],
  },
  {
    id: "trivia", name: "Trivia Quiz", emoji: "❓", tag: "Casual",
    description: "Test your knowledge across many topics!",
    color: "from-purple-500 to-indigo-600", bg: "bg-purple-900/20", border: "border-purple-500/40", textColor: "text-purple-300",
    component: TriviaQuiz,
    instructions: ["Answer multiple choice questions", "Categories: Science, History, Sports, Pop Culture & more", "You have 15 seconds per question", "Score points for correct answers — faster = more points", "Get all 10 right for a perfect score!"],
    hot: true,
  },
  {
    id: "pairscard", name: "Pairs Card", emoji: "🀄", tag: "Casual",
    description: "Classic card pairs — beat the AI dealer!",
    color: "from-rose-500 to-pink-600", bg: "bg-rose-900/20", border: "border-rose-500/40", textColor: "text-rose-300",
    component: PairsCard,
    instructions: ["Click two cards to flip them over", "Match pairs to collect them", "Matched pairs stay face-up and are added to your score", "Player with most pairs at the end wins", "Play against the AI which remembers previously flipped cards!"],
    new: true,
  },
];

const TAG_COLORS: Record<string, string> = {
  Classic:    "bg-slate-700/80 text-slate-300",
  "2 Player": "bg-green-900/60 text-green-300",
  Adventure:  "bg-purple-900/60 text-purple-300",
  Brain:      "bg-cyan-900/60 text-cyan-300",
  Arcade:     "bg-orange-900/60 text-orange-300",
  Word:       "bg-lime-900/60 text-lime-300",
  Puzzle:     "bg-blue-900/60 text-blue-300",
  Casual:     "bg-pink-900/60 text-pink-300",
};

const TAG_ICONS: Record<string, string> = {
  All:        "🎮",
  Classic:    "🕹️",
  "2 Player": "👥",
  Adventure:  "⚔️",
  Puzzle:     "🧩",
  Arcade:     "🎯",
  Brain:      "🧠",
  Word:       "📖",
  Casual:     "😄",
};

const ALL_TAGS = ["All", "Classic", "Arcade", "2 Player", "Adventure", "Puzzle", "Brain", "Word", "Casual"];

interface InstructionModalProps {
  game: Game;
  onPlay: () => void;
  onClose: () => void;
}

function InstructionModal({ game, onPlay, onClose }: InstructionModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`relative w-full max-w-md rounded-3xl border-2 ${game.border} bg-slate-900 shadow-2xl overflow-hidden`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header gradient */}
        <div className={`bg-gradient-to-br ${game.color} p-5 sm:p-6 text-center`}>
          <div className="text-6xl mb-2 drop-shadow-lg">{game.emoji}</div>
          <h2 className="text-2xl font-black text-white drop-shadow">{game.name}</h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-black/30 text-white`}>
              {TAG_ICONS[game.tag]} {game.tag}
            </span>
            {game.hot && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-500/80 text-yellow-900">🔥 HOT</span>}
            {game.new && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-500/80 text-green-900">✨ NEW</span>}
          </div>
        </div>

        {/* Instructions */}
        <div className="p-5 sm:p-6">
          <h3 className="text-slate-300 text-xs font-black uppercase tracking-widest mb-3">How to Play</h3>
          <ul className="space-y-2 mb-6">
            {(game.instructions || ["Click Play to start the game!"]).map((inst, i) => (
              <li key={i} className="flex items-start gap-2.5 text-slate-300 text-sm leading-relaxed">
                <span className={`shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${game.color} text-white text-[10px] font-black flex items-center justify-center mt-0.5`}>
                  {i + 1}
                </span>
                {inst}
              </li>
            ))}
          </ul>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              ← Back
            </button>
            <button
              onClick={onPlay}
              className={`flex-2 flex-grow py-3 rounded-xl font-black text-sm bg-gradient-to-r ${game.color} text-white shadow-lg hover:brightness-110 transition`}
            >
              🎮 Play Now!
            </button>
          </div>
        </div>

        {/* Close X */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/40 text-white/70 hover:text-white flex items-center justify-center text-sm font-bold transition"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [previewGame, setPreviewGame] = useState<Game | null>(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const filtered = useMemo(() => GAMES.filter(g => {
    const matchTag = filter === "All" || g.tag === filter;
    const matchSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.description.toLowerCase().includes(search.toLowerCase()) ||
      g.tag.toLowerCase().includes(search.toLowerCase());
    return matchTag && matchSearch;
  }), [filter, search]);

  const goHome = () => { setActiveGame(null); setPreviewGame(null); setMenuOpen(false); };

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    GAMES.forEach(g => { counts[g.tag] = (counts[g.tag] || 0) + 1; });
    return counts;
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">

      {/* Instruction Modal */}
      {previewGame && !activeGame && (
        <InstructionModal
          game={previewGame}
          onPlay={() => { setActiveGame(previewGame); setPreviewGame(null); }}
          onClose={() => setPreviewGame(null)}
        />
      )}

      {/* ══════════ HEADER ══════════ */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 shadow-xl shadow-black/40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">

          {/* Left: Back + Logo */}
          <div className="flex items-center gap-2 shrink-0">
            {activeGame && (
              <button
                onClick={goHome}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition text-slate-300 hover:text-white text-xs font-bold border border-slate-700"
              >
                ← Back
              </button>
            )}
            <button onClick={goHome} className="focus:outline-none flex items-center gap-2">
              <GCLogo size="sm" showText={false} animate={false} />
              <div className="hidden sm:block leading-tight">
                <p className="text-white font-black text-sm leading-none">Game Club</p>
                <p className="text-purple-400 text-[10px] font-semibold tracking-widest uppercase">Arcade Portal</p>
              </div>
            </button>
          </div>

          {/* Center: Game title or search */}
          <div className="flex-1 flex justify-center px-2">
            {activeGame ? (
              <div className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-1.5 max-w-xs w-full">
                <span className="text-base">{activeGame.emoji}</span>
                <span className="font-bold text-white text-xs sm:text-sm truncate">{activeGame.name}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-auto shrink-0 hidden sm:inline ${TAG_COLORS[activeGame.tag] || "bg-slate-700 text-slate-300"}`}>
                  {activeGame.tag}
                </span>
              </div>
            ) : (
              <input
                type="text"
                placeholder="🔍 Search games..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-purple-500 w-full max-w-sm transition"
              />
            )}
          </div>

          {/* Right: count + menu */}
          <div className="shrink-0 flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 bg-purple-900/40 border border-purple-700/40 rounded-full px-3 py-1">
              <span className="text-purple-300 text-xs font-black">{GAMES.length}</span>
              <span className="text-purple-400/70 text-xs font-semibold">Games</span>
            </div>
            {!activeGame && (
              <button
                onClick={() => setMenuOpen(m => !m)}
                className="sm:hidden p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300"
              >
                {menuOpen ? "✕" : "☰"}
              </button>
            )}
          </div>
        </div>

        {/* Mobile filter dropdown */}
        {menuOpen && !activeGame && (
          <div className="sm:hidden border-t border-slate-800 bg-slate-900 px-3 py-3 flex flex-wrap gap-2">
            {ALL_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => { setFilter(tag); setMenuOpen(false); }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1 ${
                  filter === tag
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 border-purple-500 text-white"
                    : "bg-slate-800 border-slate-700 text-slate-400"
                }`}
              >
                {TAG_ICONS[tag] || "🎮"} {tag}
                {tag !== "All" && (
                  <span className={`text-[10px] px-1 py-0.5 rounded-full font-black ${filter === tag ? "bg-white/20 text-white" : "bg-slate-700 text-slate-400"}`}>
                    {tagCounts[tag] || 0}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ══════════ MAIN ══════════ */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 py-6 sm:py-8">
        {!activeGame ? (
          <>
            {/* ── HERO ── */}
            <div className="text-center mb-8 sm:mb-12">
              <div className="flex justify-center mb-5">
                <div className="relative">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 blur-2xl opacity-40 scale-110" />
                  <div className="relative bg-gradient-to-br from-violet-700 via-purple-700 to-pink-700 rounded-3xl p-5 sm:p-6 border-2 border-purple-400/30 shadow-2xl"
                    style={{ boxShadow: "inset 0 2px 0 rgba(255,255,255,0.15), 0 20px 60px rgba(139,92,246,0.4)" }}>
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/10 to-transparent" />
                    <div className="relative flex items-baseline gap-0.5">
                      <span className="font-black text-white leading-none select-none"
                        style={{ fontSize: "clamp(48px,10vw,72px)", textShadow: "0 2px 8px rgba(0,0,0,0.5), 0 0 30px rgba(196,132,252,0.9)", letterSpacing: "-0.04em" }}>G</span>
                      <span className="font-black leading-none select-none"
                        style={{ fontSize: "clamp(48px,10vw,72px)", color: "#f9a8d4", textShadow: "0 2px 8px rgba(0,0,0,0.5), 0 0 30px rgba(249,168,212,0.9)", letterSpacing: "-0.04em" }}>C</span>
                    </div>
                    <div className="absolute top-2 right-3 text-yellow-300 text-lg" style={{ textShadow: "0 0 8px rgba(253,224,71,0.8)" }}>★</div>
                    <div className="absolute bottom-2 left-3 text-yellow-300 text-xs opacity-60">✦</div>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-3 bg-purple-500/30 rounded-full blur-md" />
                </div>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black mb-2 bg-gradient-to-r from-violet-300 via-purple-200 to-pink-300 bg-clip-text text-transparent leading-tight tracking-tight">
                Game Club
              </h1>
              <p className="text-purple-400/80 text-xs font-bold tracking-[0.3em] uppercase mb-4">Arcade Portal</p>
              <div className="inline-flex items-center gap-2 bg-purple-900/30 border border-purple-500/30 rounded-full px-4 py-1.5 text-xs font-bold text-purple-300 mb-4">
                ✨ {GAMES.length} Games — All Free, No Downloads!
              </div>
              <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                Epic adventures, brain-bending puzzles, classic showdowns —{" "}
                <span className="text-purple-300 font-semibold">play instantly!</span>
              </p>
            </div>

            {/* ── DESKTOP CATEGORY FILTERS ── */}
            <div className="hidden sm:flex gap-2 flex-wrap justify-center mb-6">
              {ALL_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => setFilter(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all border flex items-center gap-1.5 ${
                    filter === tag
                      ? "bg-gradient-to-r from-violet-600 to-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/30 scale-105"
                      : "bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-600"
                  }`}
                >
                  <span>{TAG_ICONS[tag] || "🎮"}</span>
                  <span>{tag}</span>
                  {tag !== "All" && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-black ${filter === tag ? "bg-white/20 text-white" : "bg-slate-700 text-slate-400"}`}>
                      {tagCounts[tag] || 0}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ── MOBILE QUICK FILTER PILLS ── */}
            <div className="sm:hidden flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
              {ALL_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => setFilter(tag)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1 ${
                    filter === tag
                      ? "bg-gradient-to-r from-violet-600 to-purple-600 border-purple-500 text-white"
                      : "bg-slate-800 border-slate-700 text-slate-400"
                  }`}
                >
                  {TAG_ICONS[tag] || "🎮"} {tag}
                  {tag !== "All" && (
                    <span className={`text-[10px] px-1 py-0.5 rounded-full font-black ${filter === tag ? "bg-white/20 text-white" : "bg-slate-700 text-slate-300"}`}>
                      {tagCounts[tag] || 0}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ── RESULTS COUNT ── */}
            <div className="flex items-center justify-between mb-4 px-1">
              <p className="text-slate-500 text-xs font-semibold">
                {filter === "All" && !search ? "All Games" : `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`}
                {filter !== "All" && <span className="text-purple-400 ml-1">· {filter}</span>}
              </p>
              <p className="text-slate-600 text-xs">Click any game to see instructions</p>
            </div>

            {/* ── GAME GRID ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {filtered.map((game) => (
                <div
                  key={game.id}
                  className={`group relative rounded-2xl border-2 ${game.border} ${game.bg} p-3 sm:p-4 cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl active:scale-95 overflow-hidden flex flex-col`}
                  onClick={() => setPreviewGame(game)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl`} />
                  <div className="relative flex flex-col flex-1">
                    {/* Badges */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-3xl sm:text-4xl drop-shadow-lg">{game.emoji}</div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[9px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full ${TAG_COLORS[game.tag] || "bg-slate-700 text-slate-300"}`}>
                          {game.tag}
                        </span>
                        {game.hot && <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">🔥 HOT</span>}
                        {game.new && <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">✨ NEW</span>}
                      </div>
                    </div>
                    <h3 className="text-sm sm:text-base font-black mb-1 text-white leading-tight">{game.name}</h3>
                    <p className="text-slate-400 text-[10px] sm:text-xs mb-3 leading-relaxed flex-1">{game.description}</p>
                    <button className={`w-full py-1.5 sm:py-2 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r ${game.color} text-white shadow transition group-hover:shadow-lg group-hover:brightness-110`}>
                      Play Now →
                    </button>
                  </div>
                  <div className="absolute bottom-2 right-2 opacity-10 group-hover:opacity-20 transition text-5xl pointer-events-none select-none">
                    {game.emoji}
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-20 text-slate-500">
                <p className="text-5xl mb-4">🎮</p>
                <p className="text-xl font-black mb-1">No games found</p>
                <p className="text-sm">Try a different search or category</p>
              </div>
            )}

            {/* ── STATS BAR ── */}
            <div className="mt-12 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
              {[
                { value: GAMES.length, label: "Total Games", color: "text-purple-400", icon: "🎮" },
                { value: GAMES.filter(g => g.tag === "2 Player").length, label: "2-Player Games", color: "text-green-400", icon: "👥" },
                { value: ALL_TAGS.length - 1, label: "Categories", color: "text-yellow-400", icon: "🏷️" },
                { value: "100%", label: "Free to Play", color: "text-cyan-400", icon: "✨" },
              ].map((s, i) => (
                <div key={i} className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-4 sm:p-5 border border-slate-700/60 shadow-xl">
                  <p className="text-2xl mb-1">{s.icon}</p>
                  <p className={`text-3xl sm:text-4xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1 font-semibold">{s.label}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* ══════════ GAME VIEW ══════════ */
          <div className="flex flex-col items-center">
            {/* Game info card */}
            <div className={`w-full max-w-4xl rounded-2xl border-2 ${activeGame.border} ${activeGame.bg} p-3 sm:p-4 mb-4 sm:mb-6 flex items-center gap-3 sm:gap-4`}>
              <span className="text-4xl sm:text-5xl drop-shadow-lg shrink-0">{activeGame.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-2xl font-black text-white">{activeGame.name}</h2>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${TAG_COLORS[activeGame.tag] || "bg-slate-700 text-slate-300"}`}>
                    {TAG_ICONS[activeGame.tag]} {activeGame.tag}
                  </span>
                  {activeGame.hot && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">🔥 HOT</span>}
                  {activeGame.new && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">✨ NEW</span>}
                </div>
                <p className="text-slate-400 text-xs sm:text-sm mt-1 line-clamp-2">{activeGame.description}</p>
              </div>
              <button
                onClick={() => setPreviewGame(activeGame)}
                className="shrink-0 px-2 sm:px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:text-white hover:bg-slate-700 transition font-bold"
              >
                ❓ How to Play
              </button>
            </div>

            {/* Game component */}
            <div className="w-full max-w-4xl bg-slate-900 rounded-2xl border border-slate-800 p-3 sm:p-6 flex justify-center overflow-x-auto min-h-[400px]">
              <activeGame.component />
            </div>

            {/* Quick-switch other games */}
            <div className="mt-6 sm:mt-8 w-full max-w-4xl">
              <p className="text-slate-500 text-xs mb-3 font-bold uppercase tracking-widest">More Games</p>
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {GAMES.filter(g => g.id !== activeGame.id).map(g => (
                  <button
                    key={g.id}
                    onClick={() => setPreviewGame(g)}
                    title={g.name}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border ${g.border} ${g.bg} hover:scale-110 transition-all duration-200 active:scale-95`}
                  >
                    <span className="text-xl sm:text-2xl">{g.emoji}</span>
                    <span className={`text-[9px] font-bold ${g.textColor} text-center leading-tight line-clamp-2`}>{g.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="border-t border-slate-800/80 mt-8 py-8 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-3">
          <GCLogo size="md" showText={true} animate={false} />
          <p className="text-slate-500 text-xs sm:text-sm text-center">
            {GAMES.length} Games &nbsp;·&nbsp; {ALL_TAGS.length - 1} Categories &nbsp;·&nbsp; Zero Downloads &nbsp;·&nbsp; Infinite Fun
          </p>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-purple-600 to-transparent" />
          <p className="text-slate-600 text-xs">© 2026 Game Club — All games free to play</p>
          <p className="text-slate-500 text-xs font-bold tracking-widest uppercase mt-1 bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            ✦ Created by Sai Teja G ✦
          </p>
        </div>
      </footer>
    </div>
  );
}
