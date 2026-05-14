import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../../contexts/GameContext';
import { Button, Card } from '../../components/ui';
import { InstructionOverlay } from '../../components/InstructionOverlay';
import { CHARADES_WORDS, CHARADES_CATEGORIES } from '../../data/gameData';
import { Timer, Trophy } from 'lucide-react';
import { cn } from '../../lib/utils';
import confetti from 'canvas-confetti';
import { Player } from '../../types';

type Team = 'A' | 'B';
interface CharadesPlayer extends Player { team: Team; }

export default function Charades() {
  const navigate = useNavigate();
  const { session } = useGame();
  const [phase, setPhase] = useState<'instructions' | 'categories' | 'team-setup' | 'ready' | 'acting' | 'result'>('instructions');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [players, setPlayers] = useState<CharadesPlayer[]>([]);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [word, setWord] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState({ A: 0, B: 0 });
  const [roundPoints, setRoundPoints] = useState(0);

  useEffect(() => {
    const half = Math.ceil(session.players.length / 2);
    setPlayers(session.players.map((p, i) => ({ ...p, team: i < half ? 'A' : 'B' })));
  }, [session.players]);

  const player = players[currentPlayerIdx];

  useEffect(() => {
    let timer: any;
    if (phase === 'acting' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && phase === 'acting') {
      handleRoundEnd();
    }
    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  const startActing = () => {
    const wordPool = selectedCategory ? CHARADES_CATEGORIES[selectedCategory] : CHARADES_WORDS;
    setWord(wordPool[Math.floor(Math.random() * wordPool.length)]);
    setPhase('acting');
    setTimeLeft(60);
    setRoundPoints(0);
  };

  const handleCorrect = () => {
    setRoundPoints(prev => prev + 1);
    const wordPool = selectedCategory ? CHARADES_CATEGORIES[selectedCategory] : CHARADES_WORDS;
    setWord(wordPool[Math.floor(Math.random() * wordPool.length)]);
    confetti({ particleCount: 20, spread: 30, origin: { y: 0.8 }, colors: [player.color, '#FFD400'] });
  };

  const handleRoundEnd = () => {
    setScore(prev => ({ ...prev, [player.team]: prev[player.team] + roundPoints }));
    if (currentPlayerIdx < players.length - 1) {
      setCurrentPlayerIdx(prev => prev + 1);
      setPhase('ready');
    } else {
      setPhase('result');
    }
  };

  const movePlayer = (id: string, toTeam: Team) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, team: toTeam } : p));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex flex-col p-6 bg-party-black text-party-white">
      {phase === 'instructions' && (
        <InstructionOverlay title="Charades" description="Split into teams! Act out words from your chosen category. No speaking!" onStart={() => setPhase('categories')} onQuit={() => navigate('/')} />
      )}

      {phase === 'categories' && (
        <div className="flex-1 flex flex-col justify-center gap-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-arcade text-party-yellow uppercase tracking-tighter">Pick a Category</h2>
            <p className="text-white/40 font-black uppercase text-[10px] tracking-widest">What are we acting out?</p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {Object.keys(CHARADES_CATEGORIES).map((cat) => (
              <Button 
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setPhase('team-setup');
                }}
                className="h-20 text-xl font-display uppercase italic bg-party-white/10 text-white border border-white/10 hover:bg-party-cyan hover:text-party-black transition-all !rounded-3xl"
              >
                {cat}
              </Button>
            ))}
            <Button 
              onClick={() => {
                setSelectedCategory(null);
                setPhase('team-setup');
              }}
              variant="outline"
              className="h-16 text-white/40 border-white/10"
            >
              All Categories Mixed
            </Button>
          </div>
        </div>
      )}

      {phase === 'team-setup' && (
        <div className="flex-1 flex flex-col gap-6 py-8">
          <h2 className="text-3xl font-arcade text-center uppercase tracking-tighter text-party-yellow">Split Teams</h2>
          <div className="grid grid-cols-2 gap-4 flex-1">
            <div className="space-y-3 p-4 bg-party-cyan/10 rounded-[2rem] border-2 border-party-cyan/20">
               <h3 className="text-center font-black text-party-cyan uppercase text-[10px] tracking-widest">Team A</h3>
               {players.filter(p => p.team === 'A').map(p => (
                 <button key={p.id} onClick={() => movePlayer(p.id, 'B')} className="w-full p-3 bg-white/5 text-white rounded-xl font-bold shadow-sm border border-white/10" style={{ borderLeft: `4px solid ${p.color}` }}>{p.name}</button>
               ))}
            </div>
            <div className="space-y-3 p-4 bg-party-pink/10 rounded-[2rem] border-2 border-party-pink/20">
               <h3 className="text-center font-black text-party-pink uppercase text-[10px] tracking-widest">Team B</h3>
               {players.filter(p => p.team === 'B').map(p => (
                 <button key={p.id} onClick={() => movePlayer(p.id, 'A')} className="w-full p-3 bg-white/5 text-white rounded-xl font-bold shadow-sm border border-white/10" style={{ borderLeft: `4px solid ${p.color}` }}>{p.name}</button>
               ))}
            </div>
          </div>
          <Button onClick={() => setPhase('ready')} className="w-full h-20 text-2xl font-display uppercase italic bg-party-cyan text-party-black !rounded-3xl shadow-xl">Confirm Teams →</Button>
        </div>
      )}

      {phase === 'ready' && player && (
        <div className="flex-1 flex flex-col justify-center items-center text-center gap-8">
           <Trophy className="w-20 h-20 text-party-yellow animate-bounce" />
           <div className="space-y-2">
             <h2 className="text-4xl font-arcade uppercase tracking-tighter" style={{ color: player.color }}>{player.name}</h2>
             <span className={cn("inline-block px-6 py-1 rounded-full font-black text-xs uppercase text-party-black shadow-lg", player.team === 'A' ? 'bg-party-cyan' : 'bg-party-pink')}>Team {player.team}</span>
           </div>
           <Button onClick={startActing} className="w-full h-24 text-3xl font-display uppercase italic bg-party-yellow text-party-black !rounded-[2.5rem] shadow-2xl">Start Round ⚡️</Button>
        </div>
      )}

      {phase === 'acting' && (
        <div className="flex-1 flex flex-col justify-center gap-10">
           <div className="flex justify-between items-center px-4">
              <div className="flex items-center gap-3">
                <span className="font-display text-4xl text-party-pink">{timeLeft}</span>
                <Timer className="w-8 h-8 text-party-pink" />
              </div>
              <div className="text-right space-y-1">
                <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">Round Score</p>
                <div className="text-4xl font-display text-party-cyan italic">{roundPoints}</div>
              </div>
           </div>
           <Card className="bg-party-white min-h-[300px] flex items-center justify-center text-center p-10 border-b-[12px] border-black/30 shadow-2xl rounded-[4rem] relative overflow-hidden">
              <div className="absolute inset-0 bg-party-yellow/5 pointer-events-none" />
              <h3 className="text-4xl font-display text-party-black leading-tight uppercase tracking-tighter">{word}</h3>
           </Card>
           <div className="grid grid-cols-2 gap-4">
              <Button onClick={handleCorrect} className="h-24 text-2xl font-display uppercase italic bg-party-green text-party-black !rounded-3xl border-b-8 border-black/20 shadow-xl">Correct ✓</Button>
              <Button 
                onClick={() => {
                  const wordPool = selectedCategory ? CHARADES_CATEGORIES[selectedCategory] : CHARADES_WORDS;
                  setWord(wordPool[Math.floor(Math.random() * wordPool.length)]);
                }} 
                className="h-24 text-2xl font-display uppercase italic bg-white/10 text-white border border-white/20 !rounded-3xl shadow-xl hover:bg-white/20 transition-colors"
              >
                Skip ↷
              </Button>
           </div>
        </div>
      )}

      {phase === 'result' && (
        <div className="flex-1 flex flex-col justify-center gap-10">
           <div className="text-center space-y-2">
             <h3 className="text-4xl font-arcade uppercase text-party-yellow tracking-tighter">Round Over!</h3>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-party-cyan p-8 rounded-[2.5rem] text-center border-b-8 border-black/30 shadow-xl flex flex-col items-center">
                <h4 className="font-black text-party-black uppercase text-[10px] tracking-widest mb-1">Team A</h4>
                <span className="text-6xl font-display text-party-black italic">{score.A}</span>
              </div>
              <div className="bg-party-pink p-8 rounded-[2.5rem] text-center border-b-8 border-black/30 shadow-xl flex flex-col items-center text-party-black">
                <h4 className="font-black uppercase text-[10px] tracking-widest mb-1">Team B</h4>
                <span className="text-6xl font-display italic">{score.B}</span>
              </div>
           </div>
           <div className="p-10 bg-party-white/5 rounded-[3rem] text-center border border-white/10 shadow-inner">
              <h3 className="text-3xl font-display uppercase italic tracking-tighter text-party-yellow">
                {score.A > score.B ? 'Team A Wins!' : score.B > score.A ? 'Team B Wins!' : 'It\'s a Tie!'}
              </h3>
           </div>
           <Button onClick={() => navigate('/')} className="w-full h-24 text-3xl font-display uppercase italic bg-party-cyan text-party-black !rounded-[2.5rem] shadow-2xl">Finish Game</Button>
        </div>
      )}
      <footer className="mt-auto py-8 text-center">
        <Button variant="ghost" onClick={() => navigate('/')} className="text-white/20 font-black uppercase tracking-widest text-[10px]">Quit Game</Button>
      </footer>
    </motion.div>
  );
}
