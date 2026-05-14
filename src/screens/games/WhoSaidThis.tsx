import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../../contexts/GameContext';
import { Button, Card } from '../../components/ui';
import { InstructionOverlay } from '../../components/InstructionOverlay';
import confetti from 'canvas-confetti';
import { cn } from '../../lib/utils';
import { Eye, HelpCircle, UserCheck, Send } from 'lucide-react';

const PROMPTS = [
  "What is the most embarrassing thing you've ever done at a party?",
  "If you could have any superpower for one day, what would it be?",
  "What is your biggest pet peeve?",
  "What's the weirdest food you've ever tried?",
  "What is a secret talent you have?",
];

type Phase = 'instructions' | 'peeking' | 'collecting' | 'voting' | 'reveal';

type RoundData = {
  playerAnswers: Record<string, string>;
  thinkerId: string;
};

export default function WhoSaidThis() {
  const navigate = useNavigate();
  const { session } = useGame();
  const [phase, setPhase] = useState<Phase>('instructions');
  const [prompt, setPrompt] = useState(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
  const [roundData, setRoundData] = useState<RoundData>({ playerAnswers: {}, thinkerId: '' });
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [input, setInput] = useState('');
  const [votedPlayerId, setVotedPlayerId] = useState<string | null>(null);
  const [revealTargetId, setRevealTargetId] = useState<string | null>(null);

  const players = session.players;

  const startCollecting = () => {
    setPhase('collecting');
    setCurrentPlayerIdx(0);
    setRoundData({ playerAnswers: {}, thinkerId: '' });
  };

  const handleAnswerSubmit = () => {
    if (!input.trim()) return;
    
    const newAnswers = { ...roundData.playerAnswers, [players[currentPlayerIdx].id]: input.trim() };
    setRoundData(prev => ({ ...prev, playerAnswers: newAnswers }));
    setInput('');

    if (currentPlayerIdx < players.length - 1) {
      setCurrentPlayerIdx(prev => prev + 1);
    } else {
      // Pick one person to be the "subject"
      const targetIdx = Math.floor(Math.random() * players.length);
      setRevealTargetId(players[targetIdx].id);
      setPhase('voting');
    }
  };

  const handleVote = (thinkerId: string) => {
    setVotedPlayerId(thinkerId);
    setPhase('reveal');
    if (thinkerId === revealTargetId) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00D9FF', '#FFD400', '#F5F5F5']
      });
    }
  };

  const nextRoundNewPrompt = () => {
    setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
    setVotedPlayerId(null);
    setRevealTargetId(null);
    startCollecting();
  };

  const nextRoundSamePrompt = () => {
    // Pick a DIFFERENT target person
    const otherPlayers = players.filter(p => p.id !== revealTargetId);
    if (otherPlayers.length > 0) {
      const targetIdx = Math.floor(Math.random() * otherPlayers.length);
      setRevealTargetId(otherPlayers[targetIdx].id);
      setVotedPlayerId(null);
      setPhase('voting');
    } else {
      nextRoundNewPrompt();
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen p-6 flex flex-col bg-party-black text-party-white">
      {phase === 'instructions' && (
        <InstructionOverlay 
          title="Who Said This?"
          description="A prompt will appear. Everyone types in their answer secretly. Then, we reveal ONE answer, and you have to guess who said it!"
          onStart={startCollecting}
          onQuit={() => navigate('/')}
        />
      )}

      {phase === 'collecting' && (
        <div className="flex-1 flex flex-col justify-center gap-8">
           <div className="text-center space-y-2">
             <p className="text-party-white/40 font-black uppercase tracking-[0.3em] text-xs">Pass to</p>
             <h2 className="text-5xl font-display text-party-cyan italic tracking-tighter" style={{ color: players[currentPlayerIdx].color }}>{players[currentPlayerIdx].name}</h2>
           </div>

           <Card className="bg-party-white/5 border border-white/10 min-h-[150px] flex items-center justify-center text-center p-8 rounded-[3rem] shadow-xl">
             <p className="text-2xl font-display text-party-yellow italic leading-tight">"{prompt}"</p>
           </Card>

           <div className="space-y-4">
             <textarea
               autoFocus
               value={input}
               onChange={(e) => setInput(e.target.value)}
               placeholder="Type your answer..."
               className="w-full bg-white/5 border-2 border-white/10 rounded-3xl p-6 text-xl font-bold text-white focus:outline-none focus:border-party-cyan transition-colors min-h-[120px] shadow-inner"
             />
             <Button onClick={handleAnswerSubmit} className="w-full h-20 bg-party-cyan text-party-black font-display uppercase italic text-2xl !rounded-3xl shadow-xl flex items-center justify-center gap-3">
               Submit Answer <Send className="w-6 h-6" />
             </Button>
             <p className="text-center text-[10px] font-black uppercase text-white/30 tracking-widest">
               Player {currentPlayerIdx + 1} of {players.length}
             </p>
           </div>
        </div>
      )}

      {phase === 'voting' && revealTargetId && (
        <div className="flex-1 flex flex-col justify-center gap-10">
          <div className="text-center space-y-2">
             <HelpCircle className="w-16 h-16 text-party-cyan mx-auto mb-2 animate-pulse" />
             <h3 className="text-4xl font-display uppercase italic text-party-yellow tracking-tighter">Who Said This?</h3>
             <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Guess the author of this answer</p>
          </div>

          <Card className="bg-party-cyan min-h-[250px] flex items-center justify-center text-center p-10 shadow-[0_0_50px_rgba(0,217,255,0.2)] rounded-[4rem] border-b-8 border-black/30">
            <p className="text-4xl font-display text-party-black leading-tight italic uppercase tracking-tighter">
              "{roundData.playerAnswers[revealTargetId]}"
            </p>
          </Card>

          <div className="space-y-4">
            <p className="text-center text-white/40 font-bold uppercase text-[10px] tracking-widest">Pick a suspect:</p>
            <div className="grid grid-cols-2 gap-3 max-h-[30vh] overflow-y-auto pr-2">
               {players.map(p => (
                 <button
                    key={p.id}
                    onClick={() => handleVote(p.id)}
                    className="p-5 rounded-3xl bg-white/5 border border-white/10 hover:border-party-cyan text-left transition-all group active:scale-95 shadow-lg"
                 >
                   <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                     <span className="font-bold text-lg">{p.name}</span>
                   </div>
                 </button>
               ))}
            </div>
          </div>
        </div>
      )}

      {phase === 'reveal' && votedPlayerId && revealTargetId && (
        <div className="flex-1 flex flex-col justify-center gap-10">
           <div className={cn(
             "rounded-[4rem] p-12 text-center border-b-8 border-black/30 shadow-2xl relative overflow-hidden",
             votedPlayerId === revealTargetId ? "bg-party-green" : "bg-party-pink"
           )}>
             <motion.div initial={{ scale: 0.5, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} className="relative z-10">
               <UserCheck className="w-24 h-24 text-party-black mx-auto mb-6" />
               <h3 className="text-6xl font-display text-party-black mb-2 italic tracking-tighter uppercase">
                 {votedPlayerId === revealTargetId ? "Bingo!" : "Oops!"}
               </h3>
               <p className="text-party-black font-black uppercase tracking-widest text-sm">
                 It was actually {players.find(p => p.id === revealTargetId)?.name}!
               </p>
             </motion.div>
           </div>
           
           <div className="space-y-4">
             <Button onClick={nextRoundNewPrompt} className="w-full h-20 text-2xl font-display uppercase italic bg-party-yellow text-party-black !rounded-3xl shadow-xl">
               Next Round (New Prompt)
             </Button>
             <Button onClick={nextRoundSamePrompt} variant="secondary" className="w-full h-20 text-xl font-display uppercase bg-white/10 text-white border border-white/20 !rounded-3xl">
               Try same prompt, different person
             </Button>
           </div>
        </div>
      )}

      <footer className="mt-auto py-8">
        <Button variant="ghost" onClick={() => navigate('/')} className="w-full text-white/20 font-black uppercase text-[10px] tracking-widest">
          Quit Game
        </Button>
      </footer>
    </motion.div>
  );
}
