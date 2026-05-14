import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../contexts/GameContext';
import { Button } from '../components/ui';
import { X, UserPlus, Flame, Users, Heart } from 'lucide-react';
import { SpiceLevel } from '../types';
import { cn } from '../lib/utils';

export default function Setup() {
  const navigate = useNavigate();
  const { session, addPlayer, removePlayer, updateSpiceLevel, startSession } = useGame();
  const [name, setName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      addPlayer(name.trim());
      setName('');
    }
  };

  const spiceLevels: { id: SpiceLevel; label: string; icon: any; color: string }[] = [
    { id: 'family', label: 'Mild', icon: <Heart className="w-4 h-4" />, color: 'bg-party-green' },
    { id: 'friends', label: 'Spicy', icon: <Users className="w-4 h-4" />, color: 'bg-party-yellow' },
    { id: 'savage', label: 'Nasty', icon: <Flame className="w-4 h-4" />, color: 'bg-party-pink' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-md mx-auto p-6 flex flex-col min-h-screen bg-party-black text-white"
    >
      <header className="py-8">
        <h2 className="text-4xl font-arcade text-party-yellow uppercase tracking-tighter shadow-party-yellow/20 drop-shadow-md">Who's Playing?</h2>
        <p className="text-white/40 mt-3 font-bold uppercase tracking-widest text-[10px]">Add 2-8 players to start the chaos.</p>
      </header>

      <div className="flex-1 space-y-8">
        <form onSubmit={handleAdd} className="relative">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name..."
            maxLength={12}
            className="w-full bg-white/5 border-2 border-white/10 rounded-3xl px-6 py-4 text-xl font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-party-yellow transition-colors"
          />
          <button 
            type="submit"
            disabled={!name.trim() || session.players.length >= 8}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-party-yellow rounded-2xl flex items-center justify-center text-party-black disabled:opacity-50 transition-opacity"
          >
            <UserPlus className="w-6 h-6" />
          </button>
        </form>

        <div className="flex flex-wrap gap-3">
          <AnimatePresence>
            {session.players.map((p) => (
              <motion.div
                key={p.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-party-black shadow-lg"
                style={{ backgroundColor: p.color }}
              >
                <span>{p.name}</span>
                <button onClick={() => removePlayer(p.id)} className="hover:scale-110 transition-transform">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <section>
          <label className="text-xs font-black uppercase text-white/40 tracking-[0.2em] mb-3 block">Intensity Level</label>
          <div className="grid grid-cols-3 gap-2">
            {spiceLevels.map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => updateSpiceLevel(lvl.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 p-4 rounded-3xl font-bold transition-all border-2",
                  session.spiceLevel === lvl.id 
                    ? `border-white text-white ${lvl.color}` 
                    : "border-white/5 bg-white/5 text-white/40 opacity-50"
                )}
              >
                {lvl.icon}
                <span className="text-sm">{lvl.label}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <footer className="py-8">
        <Button 
          className="w-full h-16 text-xl font-display uppercase italic tracking-widest bg-party-cyan text-party-black !rounded-2xl shadow-xl shadow-party-cyan/20" 
          disabled={session.players.length < 2}
          onClick={() => {
            startSession();
            navigate('/');
          }}
        >
          Let's Party 🎉
        </Button>
      </footer>
    </motion.div>
  );
}
