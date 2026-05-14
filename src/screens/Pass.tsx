import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useGame } from '../contexts/GameContext';
import { Button } from '../components/ui';
import { Smartphone, HandMetal } from 'lucide-react';

const GAME_TITLES: Record<string, string> = {
  'truth-dare': 'Truth or Dare',
  'charades': 'Charades',
  'impostor': 'Impostor',
  'most-likely': 'Most Likely To',
  'mafia': 'Mafia',
  'who-said-this': 'Who Said This?',
};

export default function Pass() {
  const navigate = useNavigate();
  const { session } = useGame();
  
  const player = session.players[session.currentPlayerIndex];
  const gameTitle = session.currentGame ? GAME_TITLES[session.currentGame] : 'Game';

  const handleReady = () => {
    if (session.currentGame) {
      navigate(`/games/${session.currentGame}`);
    } else {
      navigate('/');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col p-6 bg-party-black text-party-white"
    >
      <header className="py-8 flex justify-between items-center">
        <h2 className="text-xl font-display uppercase tracking-tighter text-party-pink">Next Up</h2>
        <div className="px-6 py-1 rounded-full bg-white/5 border border-white/10 font-black text-[10px] uppercase tracking-widest text-white/40">
          {gameTitle}
        </div>
      </header>

      <div className="flex-1 flex flex-col justify-center items-center text-center gap-12">
        <div className="space-y-6">
          <motion.div 
            animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }} 
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="w-40 h-40 rounded-[3rem] mx-auto flex items-center justify-center shadow-2xl relative border-b-8 border-black/30"
            style={{ backgroundColor: player.color }}
          >
            <Smartphone className="w-20 h-20 text-party-black" />
            <div className="absolute -inset-4 rounded-[3.5rem] border-2 border-white/10 animate-pulse" />
          </motion.div>
          
          <div className="space-y-2">
            <p className="text-white/30 font-black uppercase tracking-[0.5em] text-[10px]">Pass the phone to</p>
            <h2 className="text-5xl font-arcade uppercase text-white tracking-tighter leading-none">{player.name}</h2>
          </div>
        </div>

        <div className="w-full max-w-sm space-y-6">
           <Button onClick={handleReady} className="w-full h-24 text-3xl font-display !rounded-[2.5rem] bg-party-yellow text-party-black shadow-2xl flex items-center justify-center gap-4 uppercase italic tracking-tighter border-b-8 border-black/20">
             I'm {player.name} <HandMetal className="w-10 h-10" />
           </Button>
           
           <p className="text-white/40 font-bold px-8 leading-tight text-xs uppercase tracking-tight">
             No peeking! Only the active player should see the screen next.
           </p>
        </div>
      </div>

      <footer className="mt-auto py-8 text-center">
        <Button variant="ghost" onClick={() => navigate('/')} className="text-white/20 font-black uppercase tracking-widest text-[10px]">
          Quit Game
        </Button>
      </footer>
    </motion.div>
  );
}
