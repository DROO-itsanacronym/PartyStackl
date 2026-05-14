import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../../contexts/GameContext';
import { Button, Card } from '../../components/ui';
import { InstructionOverlay } from '../../components/InstructionOverlay';
import { TRUTH_DARE_DATA } from '../../data/gameData';
import { RefreshCcw } from 'lucide-react';
import { cn } from '../../lib/utils';
import confetti from 'canvas-confetti';
import { Player, TruthDareCard } from '../../types';

type Step = 'instructions' | 'wheel' | 'selection' | 'prompt';

export default function TruthDare() {
  const navigate = useNavigate();
  const { session } = useGame();
  const [currentStep, setCurrentStep] = useState<Step>('instructions');
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [card, setCard] = useState<TruthDareCard | null>(null);
  const [isHighlighted, setIsHighlighted] = useState(false);
  
  const [selectedPlayer, setSelectedPlayer] = useState<Player>(session.players[0]);

  const spinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setIsHighlighted(false);
    
    const winnerIdx = Math.floor(Math.random() * session.players.length);
    const winner = session.players[winnerIdx];
    setSelectedPlayer(winner);

    const sliceAngle = 360 / session.players.length;
    const extraSpins = 8 + Math.floor(Math.random() * 5);
    
    // Pointer is at 90 degrees (Right)
    // We want the center of the winner slice (indexIdx + 0.5) * sliceAngle to be at 90 degrees
    // targetRotation = (cumulativeSpins * 360) + (90 - sliceCenter)
    const baseRotation = Math.ceil(rotation / 360) * 360;
    const targetRotation = baseRotation + (extraSpins * 360) + 90 - (winnerIdx + 0.5) * sliceAngle;
    
    setRotation(targetRotation);
    
    setTimeout(() => {
      setIsSpinning(false);
      setIsHighlighted(true);
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.5 },
        colors: ['#00D9FF', '#9B5CFF', '#F5F5F5']
      });
      
      setTimeout(() => {
        setCurrentStep('selection');
      }, 2000);
    }, 4500);
  };

  const handleSelect = (type: 'truth' | 'dare') => {
    const spiceLevels = { 'family': 1, 'friends': 2, 'savage': 3 };
    const maxLevel = spiceLevels[session.spiceLevel] || 1;
    
    const pool = TRUTH_DARE_DATA.filter(c => c.type === type && c.level <= maxLevel);
    const selected = pool[Math.floor(Math.random() * pool.length)];
    
    setCard({
      ...selected,
      text: selected.text.replace('{name}', selectedPlayer.name)
    });
    setCurrentStep('prompt');
  };

  const handleFinish = () => {
    setCurrentStep('wheel');
    setIsHighlighted(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex flex-col p-6 bg-party-black text-party-white">
      {currentStep === 'instructions' && (
        <InstructionOverlay 
          title="Truth or Dare"
          description="A classic game! Spin the wheel to randomly choose a person. That person picks Truth or Dare. Have fun!"
          onStart={() => setCurrentStep('wheel')}
          onQuit={() => navigate('/')}
        />
      )}

      <header className="py-8 flex items-center justify-between">
        <h2 className="text-xl font-display text-party-pink uppercase tracking-tighter">Truth or Dare</h2>
        {currentStep !== 'wheel' && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-party-black text-xs" style={{ backgroundColor: selectedPlayer.color }}>
              {selectedPlayer.name[0]}
            </div>
            <span className="font-bold text-party-white">{selectedPlayer.name}'s turn</span>
          </motion.div>
        )}
      </header>

      <div className="flex-1 flex flex-col justify-center gap-6">
        <AnimatePresence mode="wait">
          {currentStep === 'wheel' && (
            <motion.div key="wheel" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="text-center space-y-12">
              <div className="relative">
                <AnimatePresence>
                  {isHighlighted && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1.1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-0 bg-party-cyan/20 blur-3xl rounded-full" 
                    />
                  )}
                </AnimatePresence>
                
                <div className="relative w-80 h-80 mx-auto z-10 group">
                   {/* Pointer */}
                   <div className="absolute top-1/2 -right-4 -translate-y-1/2 w-12 h-12 flex items-center z-30">
                      <motion.div 
                        animate={isSpinning ? { x: [0, -5, 0] } : {}}
                        transition={{ repeat: Infinity, duration: 0.1 }}
                        className="w-0 h-0 border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent border-r-[25px] border-r-party-purple drop-shadow-[0_0_10px_rgba(155,92,255,0.5)]" 
                      />
                   </div>

                   <motion.div 
                     animate={{ rotate: rotation }} 
                     transition={{ duration: 4.5, ease: [0.12, 0, 0.39, 1] }} 
                     className="w-full h-full rounded-full border-[12px] border-white/10 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]" 
                     style={{ background: `conic-gradient(${session.players.map((p, i) => `${i % 2 === 0 ? '#4E7DF0' : '#8CA9F5'} ${i * (360/session.players.length)}deg ${(i+1) * (360/session.players.length)}deg`).join(', ')})` }}
                   >
                     {session.players.map((p, i) => (
                        <div key={p.id} className="absolute top-0 left-1/2 -translate-x-1/2 h-1/2 origin-bottom flex flex-col items-center pt-6" style={{ transform: `translateX(-50%) rotate(${i * (360/session.players.length) + (360/session.players.length)/2}deg)` }}>
                           <span className="text-[10px] font-black uppercase text-white/90 transform rotate-180 [writing-mode:vertical-rl]">{p.name}</span>
                        </div>
                     ))}
                     {/* Center button look */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-party-purple border-4 border-white/20 shadow-inner z-20" />
                   </motion.div>
                </div>
              </div>

              <div className="space-y-6">
                {isHighlighted ? (
                  <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-2">
                    <p className="text-party-white/40 uppercase font-black text-xs tracking-widest">The wheel chose...</p>
                    <h3 className="text-4xl font-arcade uppercase text-party-yellow animate-bounce">{selectedPlayer.name}</h3>
                  </motion.div>
                ) : (
                  <Button onClick={spinWheel} disabled={isSpinning} className="w-full h-24 text-3xl font-display !rounded-[2.5rem] bg-party-yellow text-party-black shadow-[0_8px_0_#D4B400] active:translate-y-1 active:shadow-none transition-all uppercase italic flex items-center justify-center gap-4">
                    <RefreshCcw className={cn("w-8 h-8", isSpinning && "animate-spin")} /> SPIN WHEEL
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {currentStep === 'selection' && (
            <motion.div key="selection" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-12">
              <div className="space-y-4">
                <div className="w-24 h-24 rounded-full mx-auto shadow-2xl flex items-center justify-center border-4 border-white/10" style={{ backgroundColor: selectedPlayer.color }}>
                  <span className="text-4xl font-display text-party-black uppercase">{selectedPlayer.name[0]}</span>
                </div>
                <h2 className="text-3xl font-arcade text-party-yellow uppercase tracking-tighter">{selectedPlayer.name}</h2>
              </div>

              <div className="grid grid-cols-1 gap-6 px-4">
                <Card 
                  className="bg-party-cyan h-40 flex flex-col items-center justify-center border-b-[12px] border-black/30 shadow-2xl rounded-[3rem] group active:scale-95 transition-transform" 
                  onClick={() => handleSelect('truth')}
                >
                  <h3 className="text-4xl font-display text-party-black uppercase tracking-tighter">Truth</h3>
                  <div className="mt-2 px-4 py-1 bg-black/10 rounded-full">
                    <span className="text-[10px] font-black uppercase text-party-black/60 tracking-widest">Answer Honestly</span>
                  </div>
                </Card>
                
                <Card 
                  className="bg-party-pink h-40 flex flex-col items-center justify-center border-b-[12px] border-black/30 shadow-2xl rounded-[3rem] group active:scale-95 transition-transform" 
                  onClick={() => handleSelect('dare')}
                >
                  <h3 className="text-4xl font-display text-party-white uppercase tracking-tighter">Dare</h3>
                  <div className="mt-2 px-4 py-1 bg-black/10 rounded-full">
                    <span className="text-[10px] font-black uppercase text-white/50 tracking-widest">Take the Challenge</span>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {currentStep === 'prompt' && card && (
            <motion.div key="prompt" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
              <div className="text-center space-y-2">
                <span className={cn("px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", card.type === 'truth' ? 'bg-party-cyan text-party-black' : 'bg-party-pink text-white')}>
                  {card.type}
                </span>
              </div>
              
              <Card className={cn(
                "min-h-[350px] flex items-center justify-center text-center p-10 border-b-[12px] border-black/30 shadow-2xl rounded-[4rem] relative overflow-hidden",
                card.type === 'truth' ? 'bg-party-white text-party-black' : 'bg-party-purple-dark text-white'
              )}>
                {card.type === 'truth' && <div className="absolute inset-0 bg-party-cyan/5 pointer-events-none" />}
                <p className="text-3xl font-display leading-tight italic uppercase tracking-tighter">{card.text}</p>
              </Card>

              <Button className="w-full h-24 text-3xl font-display !rounded-[2.5rem] shadow-2xl bg-party-cyan text-party-black uppercase italic tracking-tighter" onClick={handleFinish}>
                Done! ✓
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="mt-auto py-8 text-center">
        <Button variant="ghost" onClick={() => navigate('/')} className="text-white/20 font-black uppercase tracking-widest text-[10px]">Quit Game</Button>
      </footer>
    </motion.div>
  );
}
