import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../../contexts/GameContext';
import { Button, Card } from '../../components/ui';
import { InstructionOverlay } from '../../components/InstructionOverlay';
import { Shield, Skull, Search, Users, Eye, Star, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

type Role = 'Mafia' | 'Detective' | 'Doctor' | 'Innocent';

interface MafiaPlayer {
  id: string;
  name: string;
  color: string;
  role: Role;
}

type Phase = 'instructions' | 'choose-god' | 'pass-to-god' | 'role-reveal' | 'god-summary';

export default function Mafia() {
  const navigate = useNavigate();
  const { session } = useGame();
  const [phase, setPhase] = useState<Phase>('instructions');
  const [players, setPlayers] = useState<MafiaPlayer[]>([]);
  const [godId, setGodId] = useState<string | null>(null);
  const [revealIdx, setRevealIdx] = useState(0);
  const [isRoleVisible, setIsRoleVisible] = useState(false);

  // Initialize Roles (excluding God)
  const initializeRoles = (selectedGodId: string) => {
    const gamePlayers = session.players.filter(p => p.id !== selectedGodId);
    if (gamePlayers.length < 3) {
      alert("Need at least 4 players for Mafia!");
      return;
    }
    const pCount = gamePlayers.length;
    const mafiaCount = pCount >= 6 ? 2 : 1;
    
    const shuffled = [...gamePlayers].sort(() => Math.random() - 0.5);
    const assigned: MafiaPlayer[] = shuffled.map((p, i) => {
      let role: Role = 'Innocent';
      if (i < mafiaCount) role = 'Mafia';
      else if (i === mafiaCount) role = 'Detective';
      else if (i === mafiaCount + 1) role = 'Doctor';
      return { ...p, role };
    });

    setPlayers(assigned.sort((a, b) => a.name.localeCompare(b.name)));
    setGodId(selectedGodId);
    setPhase('role-reveal');
  };

  const handleRandomGod = () => {
    const randomIdx = Math.floor(Math.random() * session.players.length);
    initializeRoles(session.players[randomIdx].id);
  };

  const handleRoleNext = () => {
    if (revealIdx < players.length - 1) {
      setRevealIdx(prev => prev + 1);
      setIsRoleVisible(false);
    } else {
      setPhase('pass-to-god');
    }
  };

  const getRoleDesc = (role: Role) => {
    switch(role) {
      case 'Mafia': return "The killers. Each night, pick one person to eliminate together.";
      case 'Detective': return "The investigator. Each night, check if one person is Mafia.";
      case 'Doctor': return "The protector. Each night, pick one person to save from the Mafia.";
      case 'Innocent': return "The villagers. Discuss and vote out suspects during the day.";
    }
  };

  const godPlayer = session.players.find(p => p.id === godId);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen p-6 flex flex-col bg-party-black text-party-white">
      {phase === 'instructions' && (
        <InstructionOverlay 
          title="Mafia"
          description="Deception and mystery! Use secret roles at night. The 'God' (Mediator) leads the flow of the game and tells everyone what is happening."
          onStart={() => setPhase('choose-god')}
          onQuit={() => navigate('/')}
        />
      )}

      {phase === 'choose-god' && (
        <div className="flex-1 flex flex-col justify-center gap-8">
           <div className="text-center">
             <Star className="w-16 h-16 text-party-yellow mx-auto mb-4" />
             <h2 className="text-4xl font-display text-party-yellow uppercase italic">Who is God?</h2>
             <p className="text-party-white/40 font-bold text-xs uppercase tracking-widest mt-2">The mediator who leads the game</p>
           </div>
           
           <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[40vh] pr-2">
             {session.players.map(p => (
               <button key={p.id} onClick={() => initializeRoles(p.id)} className="p-5 rounded-2xl bg-party-white/5 border border-white/10 font-bold hover:border-party-yellow transition-colors shadow-sm">
                 {p.name}
               </button>
             ))}
           </div>
           <Button icon={Star} onClick={handleRandomGod} className="w-full bg-party-yellow text-party-black font-display uppercase tracking-widest shadow-xl">Pick Randomly</Button>
           
           <div className="p-6 bg-party-yellow/10 rounded-3xl border-2 border-party-yellow/20">
              <div className="flex items-center gap-2 mb-2">
                 <Info className="w-4 h-4 text-party-yellow" />
                 <h4 className="font-black text-xs uppercase text-party-yellow">God's Job</h4>
              </div>
              <p className="text-sm text-party-white/60 leading-tight font-medium">Moderates the flow, confirms night actions, and announces deaths. God does not play as a role.</p>
           </div>
        </div>
      )}

      {phase === 'role-reveal' && players[revealIdx] && (
        <div className="flex-1 flex flex-col justify-center items-center text-center gap-8">
           <div className="space-y-2">
             <p className="text-party-white/40 uppercase font-black tracking-widest text-xs">Pass to</p>
             <h2 className="text-6xl font-display italic tracking-tighter" style={{ color: players[revealIdx].color }}>
               {players[revealIdx].name}
             </h2>
           </div>

           {!isRoleVisible ? (
             <Card 
                className="bg-party-white/5 border-2 border-white/10 border-dashed w-full h-72 flex flex-col items-center justify-center gap-4 cursor-pointer rounded-[3rem]"
                onClick={() => setIsRoleVisible(true)}
             >
                <Eye className="w-16 h-16 text-party-white/20" />
                <span className="font-display text-xl text-party-white/40 uppercase tracking-widest italic">Tap to Reveal</span>
             </Card>
           ) : (
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full space-y-8">
                <Card className={cn(
                  "h-72 flex flex-col items-center justify-center p-8 border-b-8 border-black/30 shadow-2xl rounded-[3rem]",
                  players[revealIdx].role === 'Mafia' ? 'bg-party-pink' : 
                  players[revealIdx].role === 'Detective' ? 'bg-party-cyan' :
                  players[revealIdx].role === 'Doctor' ? 'bg-party-green' : 'bg-party-yellow'
                )}>
                  {players[revealIdx].role === 'Mafia' && <Skull className="w-16 h-16 text-party-black mb-4" />}
                  {players[revealIdx].role === 'Detective' && <Search className="w-16 h-16 text-party-black mb-4" />}
                  {players[revealIdx].role === 'Doctor' && <Shield className="w-16 h-16 text-party-black mb-4" />}
                  {players[revealIdx].role === 'Innocent' && <Users className="w-16 h-16 text-party-black mb-4" />}
                  
                  <h3 className="text-5xl font-display text-party-black uppercase italic mb-2 tracking-tighter">{players[revealIdx].role}</h3>
                  <p className="text-party-black font-bold text-sm leading-tight max-w-[240px]">
                    {getRoleDesc(players[revealIdx].role)}
                  </p>
                </Card>
                <Button onClick={handleRoleNext} className="w-full h-16 bg-party-white text-party-black font-display uppercase tracking-widest italic">Got It</Button>
             </motion.div>
           )}
        </div>
      )}

      {phase === 'pass-to-god' && godPlayer && (
        <div className="flex-1 flex flex-col justify-center items-center text-center gap-12">
          <div className="space-y-4">
             <motion.div 
               animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
               transition={{ repeat: Infinity, duration: 4 }}
               className="w-40 h-40 rounded-full bg-party-yellow mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(255,217,61,0.4)] border-4 border-white/20"
             >
                <Star className="w-20 h-20 text-party-black" />
             </motion.div>
             <div className="space-y-2">
               <p className="text-party-white/40 uppercase font-black tracking-[0.3em] text-xs">Pass the phone to</p>
               <h2 className="text-7xl font-display text-party-yellow uppercase italic tracking-tighter drop-shadow-lg">The God</h2>
               <p className="text-party-cyan text-xl font-display uppercase tracking-wide">{godPlayer.name}</p>
             </div>
          </div>
          
          <Button onClick={() => setPhase('god-summary')} className="w-full h-24 text-3xl font-display bg-party-yellow text-party-black !rounded-3xl uppercase italic tracking-tighter shadow-2xl">
            I am God ⚡️
          </Button>
        </div>
      )}

      {phase === 'god-summary' && (
        <div className="flex-1 flex flex-col gap-6 py-6 overflow-y-auto">
           <div className="text-center p-10 bg-party-yellow rounded-[3rem] shadow-2xl border-b-8 border-black/30">
             <Star className="w-16 h-16 text-party-black mx-auto mb-4" />
             <h2 className="text-4xl font-display uppercase text-party-black italic tracking-tighter">God Dashboard</h2>
             <p className="text-party-black/60 font-black text-xs uppercase tracking-widest">Secret Summary — Don't show anyone!</p>
           </div>

           <div className="space-y-4">
             <h3 className="text-xl font-display text-party-yellow flex items-center gap-2 uppercase italic">
                <Info className="w-5 h-5 text-party-yellow" /> Player Roles
             </h3>
             <div className="grid grid-cols-1 gap-3">
               {players.map(p => (
                 <div key={p.id} className="bg-party-white/5 border border-white/10 p-5 rounded-2xl flex justify-between items-center shadow-lg group">
                   <div className="flex items-center gap-3">
                     <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                     <span className="font-bold text-lg">{p.name}</span>
                   </div>
                   <span className={cn(
                     "px-4 py-1 rounded-full text-[10px] font-display uppercase italic border border-black/20",
                     p.role === 'Mafia' ? 'bg-party-pink text-party-black border-none' : 
                     p.role === 'Detective' ? 'bg-party-cyan text-party-black border-none' :
                     p.role === 'Doctor' ? 'bg-party-green text-party-black border-none' : 'bg-white/10 text-white/40'
                   )}>{p.role}</span>
                 </div>
               ))}
             </div>
           </div>

           <div className="p-8 bg-party-purple-dark text-white rounded-[2.5rem] space-y-6 shadow-2xl border-b-8 border-black/30">
              <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                <Skull className="w-5 h-5 text-party-pink" />
                <h4 className="font-display uppercase tracking-widest text-xs">The Script</h4>
              </div>
              <ul className="space-y-4 text-xs leading-relaxed font-bold italic tracking-wide">
                <li className="flex gap-3"><span className="text-party-yellow">1.</span> "Everyone, eyes closed."</li>
                <li className="flex gap-3"><span className="text-party-yellow">2.</span> "Mafia, identify target."</li>
                <li className="flex gap-3"><span className="text-party-yellow">3.</span> "Detective, check someone." (God nod)</li>
                <li className="flex gap-3"><span className="text-party-yellow">4.</span> "Doctor, save someone."</li>
                <li className="flex gap-3 font-display text-center text-party-cyan uppercase pt-2">"Wake up!"</li>
              </ul>
           </div>
           
           <Button onClick={() => navigate('/')} className="w-full h-20 text-2xl font-display bg-party-yellow text-party-black rounded-[2rem] uppercase italic shadow-xl">Finish Game</Button>
        </div>
      )}

      <footer className="py-4">
        <Button variant="ghost" onClick={() => navigate('/')} className="w-full text-white/20 font-bold uppercase tracking-widest text-[10px]">Quit Game</Button>
      </footer>
    </motion.div>
  );
}
