import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../../contexts/GameContext';
import { Button, Card } from '../../components/ui';
import { InstructionOverlay } from '../../components/InstructionOverlay';
import { MOST_LIKELY_PROMPTS } from '../../data/gameData';
import { RefreshCcw, Users } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MostLikely() {
  const navigate = useNavigate();
  const { session } = useGame();
  const [currentStep, setCurrentStep] = useState<'instructions' | 'reveal'>('instructions');
  const [prompt, setPrompt] = useState('');

  const nextPrompt = () => {
    const pool = MOST_LIKELY_PROMPTS;
    setPrompt(pool[Math.floor(Math.random() * pool.length)]);
  };

  useEffect(() => {
    nextPrompt();
  }, []);

  const handleNext = () => {
    nextPrompt();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#FFD400', '#FF4FA3', '#00D9FF']
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col p-6 bg-party-black text-party-white"
    >
      {currentStep === 'instructions' && (
        <InstructionOverlay 
          title="Most Likely To"
          description="A prompt will appear. On the count of three, everyone points to the person they think is most likely to do it! Hilarious debates guaranteed."
          onStart={() => setCurrentStep('reveal')}
          onQuit={() => navigate('/')}
        />
      )}

      <header className="py-8 flex items-center justify-between">
        <h2 className="text-xl font-display uppercase tracking-tighter text-party-cyan">Most Likely To</h2>
      </header>

      <div className="flex-1 flex flex-col justify-center gap-12">
        <AnimatePresence mode="wait">
          <motion.div 
            key={prompt}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="perspective-1000"
          >
            <Card className="bg-party-cyan min-h-[400px] flex flex-col items-center justify-center text-center p-12 border-b-[12px] border-black/30 shadow-2xl rounded-[4rem] relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/5 pointer-events-none" />
              <Users className="w-20 h-20 text-party-black/20 mb-8 animate-pulse" />
              <p className="text-party-black/40 font-black uppercase tracking-[0.4em] text-[10px] mb-4">Who is...</p>
              <h3 className="text-3xl font-display text-party-black leading-[0.9] uppercase tracking-tighter">
                "{prompt}"
              </h3>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="space-y-4">
           <Button onClick={handleNext} className="w-full h-24 text-3xl font-display !rounded-[2.5rem] bg-party-yellow text-party-black shadow-2xl flex items-center justify-center gap-4 uppercase italic tracking-tighter border-b-8 border-black/20 active:translate-y-1 active:shadow-none transition-all">
             Next <RefreshCcw className="w-8 h-8" />
           </Button>
           
           <div className="flex justify-center flex-wrap gap-2">
              <div className="bg-party-cyan/10 px-6 py-2 rounded-full text-[10px] font-black uppercase text-party-cyan tracking-[0.3em] border border-party-cyan/20">
                Point at Count of 3!
              </div>
           </div>
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
