import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../../contexts/GameContext';
import { IMPOSTOR_WORDS, ImpostorWordPair } from '../../data/gameData';
import { Button, Card } from '../../components/ui';
import { InstructionOverlay } from '../../components/InstructionOverlay';
import { Eye, MessageSquare, ShieldAlert, UserCheck, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '../../lib/utils';

type GamePhase = 'instructions' | 'peeking' | 'discussing' | 'voting' | 'reveal';

export default function Impostor() {
  const navigate = useNavigate();
  const { session } = useGame();
  const [phase, setPhase] = useState<GamePhase>('instructions');
  
  // Game Setup State
  const [impostorId, setImpostorId] = useState<string>('');
  const [wordPair, setWordPair] = useState<ImpostorWordPair | null>(null);
  const [peekIndex, setPeekIndex] = useState(0);
  const [isWordVisible, setIsWordVisible] = useState(false);
  
  // Voting State
  const [votedPlayerId, setVotedPlayerId] = useState<string | null>(null);

  // Initialize Game
  useEffect(() => {
    const pair = IMPOSTOR_WORDS[Math.floor(Math.random() * IMPOSTOR_WORDS.length)];
    const impIndex = Math.floor(Math.random() * session.players.length);
    setWordPair(pair);
    setImpostorId(session.players[impIndex].id);
  }, [session.players.length]);

  const currentPlayer = session.players[peekIndex];

  const handleNextPeek = () => {
    if (peekIndex < session.players.length - 1) {
      setPeekIndex(prev => prev + 1);
      setIsWordVisible(false);
    } else {
      setPhase('discussing');
    }
  };

  const handleVote = (playerId: string) => {
    setVotedPlayerId(playerId);
    setPhase('reveal');
    
    if (playerId === impostorId) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#9B5CFF', '#5EE87A', '#000000']
      });
    }
  };

  const isImpostor = (pid: string) => pid === impostorId;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col p-6 bg-party-black text-party-white"
    >
      {phase === 'instructions' && (
        <InstructionOverlay 
          title="Impostor"
          description="One person is the Impostor with NO word! Everyone else has the same word. The Impostor only knows the general category. Describe your word secretly, and find the Impostor!"
          onStart={() => setPhase('peeking')}
          onQuit={() => navigate('/')}
        />
      )}

      <header className="py-8 flex justify-between items-center text-party-purple">
        <h2 className="text-xl font-display uppercase tracking-tighter flex items-center gap-2">
          <ShieldAlert className="w-6 h-6" /> Impostor
        </h2>
      </header>

      <div className="flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {phase === 'peeking' && (
            <motion.div 
              key="peek"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-center space-y-8"
            >
              <p className="text-white/40 font-black uppercase tracking-[0.3em] text-[10px]">Pass to</p>
              <h2 className="text-4xl font-arcade uppercase tracking-tighter" style={{ color: currentPlayer?.color }}>
                {currentPlayer?.name}
              </h2>

              {!isWordVisible ? (
                <Card 
                  className="bg-party-purple/10 border-2 border-party-purple/30 border-dashed h-56 rounded-[3rem] flex flex-col items-center justify-center gap-4 cursor-pointer shadow-2xl"
                  onClick={() => setIsWordVisible(true)}
                >
                  <Eye className="w-14 h-14 text-party-purple animate-pulse" />
                  <span className="font-black text-party-purple uppercase tracking-widest text-xs">Tap to see role</span>
                </Card>
              ) : (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-6">
                  <Card className={cn(
                    "h-56 flex flex-col items-center justify-center border-b-[12px] border-black/30 shadow-2xl rounded-[3rem]",
                    isImpostor(currentPlayer.id) ? "bg-party-pink" : "bg-party-purple"
                  )}>
                    {isImpostor(currentPlayer.id) ? (
                      <>
                        <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full mb-4">
                          <AlertTriangle className="w-5 h-5 text-party-black" />
                          <span className="text-[10px] font-black uppercase text-party-black tracking-widest">You are the Impostor</span>
                        </div>
                        <span className="text-4xl font-arcade text-party-black uppercase animate-pulse">???</span>
                      </>
                    ) : (
                      <span className="text-4xl font-display text-party-black uppercase tracking-tighter">
                        {wordPair?.crew}
                      </span>
                    )}
                    <div className="mt-4 px-6 py-1 bg-black/10 rounded-full">
                       <span className="text-[10px] font-black uppercase text-party-black/60 tracking-widest">
                         Hint: {wordPair?.category}
                       </span>
                    </div>
                  </Card>
                  <Button onClick={handleNextPeek} className="w-full h-20 text-2xl font-display uppercase italic bg-party-white/10 text-white !rounded-3xl border border-white/10 shadow-xl">
                    Secret Kept
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {phase === 'discussing' && (
            <motion.div 
              key="discuss"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-8"
            >
              <div className="bg-party-white/5 rounded-[4rem] p-12 border border-white/10 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-party-purple/5 pointer-events-none" />
                <MessageSquare className="w-24 h-24 text-party-purple mx-auto mb-8 animate-bounce" />
                <h3 className="text-3xl font-arcade uppercase tracking-tighter mb-4 text-party-yellow">Discuss!</h3>
                <p className="text-white/60 font-bold text-lg leading-relaxed">
                  Go around the circle and describe your word. The Impostor is bluffing!
                </p>
              </div>
              <Button onClick={() => setPhase('voting')} className="w-full h-24 text-3xl font-display uppercase italic !rounded-[2.5rem] bg-party-purple text-white shadow-2xl border-b-8 border-black/30">
                Vote Suspect 👁️
              </Button>
            </motion.div>
          )}

          {phase === 'voting' && (
            <motion.div 
              key="vote"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h3 className="text-4xl font-display uppercase italic tracking-tighter text-party-yellow">Who's the Sus?</h3>
                <p className="text-white/30 uppercase font-black text-[10px] tracking-[0.4em]">Expose the Impostor</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {session.players.map(p => (
                  <motion.button
                    key={p.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleVote(p.id)}
                    className="p-6 rounded-[2rem] bg-white/5 border border-white/10 hover:border-party-purple text-left transition-all group shadow-xl"
                  >
                    <div className="w-10 h-10 rounded-full mb-4 flex items-center justify-center font-black text-party-black text-sm shadow-lg" style={{ backgroundColor: p.color }}>
                      {p.name[0]}
                    </div>
                    <span className="font-display text-xl uppercase italic text-white group-hover:text-party-purple transition-colors">{p.name}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {phase === 'reveal' && votedPlayerId && wordPair && (
            <motion.div 
              key="reveal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-8"
            >
              <div className={cn(
                "rounded-[4rem] p-12 border-b-[12px] border-black/30 shadow-2xl relative overflow-hidden",
                votedPlayerId === impostorId ? "bg-party-green text-party-black" : "bg-party-pink text-party-black"
              )}>
                <UserCheck className="w-24 h-24 mx-auto mb-6 opacity-30" />
                <h3 className="text-5xl font-display mb-2 leading-none uppercase italic tracking-tighter">
                  {votedPlayerId === impostorId ? "Found Him!" : "Innocent!"}
                </h3>
                <p className="font-black uppercase tracking-widest text-[10px] opacity-60">
                  {session.players.find(p => p.id === votedPlayerId)?.name} was {votedPlayerId === impostorId ? "the" : "NOT the"} Impostor
                </p>
              </div>

              <div className="bg-party-white/5 p-12 rounded-[3.5rem] space-y-6 border border-white/10 shadow-inner">
                <div className="space-y-1">
                   <span className="text-white/30 font-black uppercase text-[10px] tracking-[0.4em]">The Secret was</span>
                   <div className="font-display text-party-yellow text-6xl uppercase italic tracking-tighter drop-shadow-[0_0_15px_rgba(255,217,61,0.2)]">{wordPair.crew}</div>
                </div>
                <div className="pt-6 border-t border-white/10">
                   <p className="text-white/60 font-bold uppercase tracking-tight">
                     Real Impostor: <span className="text-party-purple font-display italic text-2xl uppercase tracking-tighter">{session.players.find(p => p.id === impostorId)?.name}</span>
                   </p>
                </div>
              </div>

              <Button onClick={() => navigate('/')} className="w-full h-24 text-3xl font-display shadow-2xl bg-party-cyan text-party-black uppercase italic !rounded-[2.5rem] tracking-tighter transition-transform active:scale-95 border-b-8 border-black/20">
                Continue Party ⚡️
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="mt-auto py-8 text-center">
        <Button variant="ghost" onClick={() => navigate('/')} className="text-white/20 font-black uppercase tracking-widest text-[10px]">
          Quit Game
        </Button>
      </footer>
    </motion.div>
  );
}
