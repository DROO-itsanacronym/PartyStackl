import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useGame } from '../contexts/GameContext';
import { Card, Button } from '../components/ui';
import { Sparkles, Users, UserMinus, ShieldAlert, Heart, MessageCircle } from 'lucide-react';

const GAMES = [
  { 
    id: 'truth-dare', 
    title: 'Truth Dare', 
    icon: <Heart className="w-8 h-8" />, 
    color: 'bg-party-pink', 
    accent: '#FF4FA3', 
    label: 'Chaos',
    description: 'Chaos awaits! Spin the wheel and face the ultimate choice.'
  },
  { 
    id: 'charades', 
    title: 'Charades', 
    icon: <Sparkles className="w-8 h-8" />, 
    color: 'bg-party-yellow', 
    accent: '#FFD93D', 
    label: 'Action',
    description: 'Act it out! Multiple categories from movies to animals.'
  },
  { 
    id: 'impostor', 
    title: 'Impostor', 
    icon: <UserMinus className="w-8 h-8" />, 
    color: 'bg-party-purple', 
    accent: '#9B5CFF', 
    label: 'Deduction',
    description: "Spot the liar! One person doesn't know the secret word."
  },
  { 
    id: 'most-likely', 
    title: 'Most Likely', 
    icon: <Users className="w-8 h-8" />, 
    color: 'bg-party-green', 
    accent: '#4ade80', 
    label: 'Social',
    description: 'Point fingers! Who is most likely to do something crazy?'
  },
  { 
    id: 'mafia', 
    title: 'Mafia', 
    icon: <ShieldAlert className="w-8 h-8" />, 
    color: 'bg-party-orange', 
    accent: '#fb923c', 
    label: 'Strategy',
    description: 'Strategy & deception. Can you find the mafia before dark?'
  },
  { 
    id: 'who-said-this', 
    title: 'Who Said This?', 
    icon: <MessageCircle className="w-8 h-8" />, 
    color: 'bg-party-cyan', 
    accent: '#00D9FF', 
    label: 'Secrets',
    description: 'Guess who! Everyone types answers, but only one is revealed.'
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { session, setGame } = useGame();

  const handleGameSelect = (gameId: any) => {
    if (session.players.length < 2) {
      navigate('/setup');
      return;
    }
    setGame(gameId);
    navigate(`/games/${gameId}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-md mx-auto p-6 flex flex-col min-h-screen bg-party-black text-party-white"
    >
      <header className="py-8 flex justify-between items-center">
        <h1 className="text-2xl font-arcade text-party-yellow tracking-tighter uppercase drop-shadow-[0_0_10px_rgba(255,217,61,0.3)]">PartyStack</h1>
        <div className="flex -space-x-3">
          {session.players.slice(0, 3).map((p) => (
            <div 
              key={p.id} 
              className="w-10 h-10 rounded-full border-2 border-party-black flex items-center justify-center text-party-black font-black text-sm shadow-xl"
              style={{ backgroundColor: p.color }}
            >
              {p.name[0].toUpperCase()}
            </div>
          ))}
          {session.players.length > 3 && (
            <div className="w-10 h-10 rounded-full border-2 border-party-black bg-party-white/10 flex items-center justify-center text-white/40 font-black text-sm backdrop-blur-sm shadow-xl">
              +{session.players.length - 3}
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 flex-1 pb-4">
        {GAMES.map((game, i) => (
          <motion.button
            key={game.id}
            whileHover={{ scale: 1.02, x: i % 2 === 0 ? 4 : -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleGameSelect(game.id)}
            className={cn(
              "relative px-6 py-8 rounded-[2.5rem] text-left border-b-8 border-black/30 shadow-2xl overflow-hidden group transition-all h-44",
              game.color
            )}
          >
            <div className="relative z-10 flex flex-col h-full justify-between items-stretch">
               <div className="flex justify-between items-start">
                 <div className="p-4 bg-black/10 rounded-2xl text-party-black group-hover:rotate-12 transition-transform">
                   {game.icon}
                 </div>
                 <span className="bg-black/20 text-party-black font-black text-[10px] uppercase px-4 py-1 rounded-full tracking-widest">
                   {game.label}
                 </span>
               </div>
               <div className="mt-auto">
                 <h3 className="text-2xl font-display text-party-black uppercase tracking-tighter leading-none mb-1">
                   {game.title}
                 </h3>
                 <p className="text-party-black/60 font-bold text-[10px] leading-tight max-w-[80%] uppercase tracking-tight">
                   {game.description}
                 </p>
               </div>
            </div>
            {/* Glossy overlay */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10" />
            
            {/* Decoration */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-black/5 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
          </motion.button>
        ))}
      </div>

      <footer className="py-10">
        <Button 
          className="w-full h-16 shadow-[0_8px_0_#D4B400] active:translate-y-1 active:shadow-none transition-all text-xl font-display uppercase italic tracking-widest bg-party-yellow text-party-black" 
          onClick={() => navigate('/setup')}
        >
          {session.players.length > 0 ? 'Edit Squad' : 'Join the Party'}
        </Button>
      </footer>
    </motion.div>
  );
}

import { cn } from '../lib/utils';
