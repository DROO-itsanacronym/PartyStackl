import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui';
import { Volume2, VolumeX, Play, X } from 'lucide-react';
import { speak, stopSpeaking } from '../services/voiceService';

interface InstructionOverlayProps {
  title: string;
  description: string;
  onStart: () => void;
  onQuit: () => void;
}

export const InstructionOverlay: React.FC<InstructionOverlayProps> = ({ 
  title, 
  description, 
  onStart, 
  onQuit 
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const toggleSpeech = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      speak(`${title}. ${description}`);
      setIsSpeaking(true);
    }
  };

  const handleStart = () => {
    stopSpeaking();
    onStart();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-party-black/95 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-white/5 border-2 border-white/10 rounded-[3rem] p-8 relative overflow-hidden"
      >
        <button 
          onClick={onQuit}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X className="w-6 h-6 text-white/40" />
        </button>

        <header className="mb-8">
          <h2 className="text-4xl font-black text-party-yellow mb-2 tracking-tight">{title}</h2>
          <div className="flex items-center gap-3">
             <button 
              onClick={toggleSpeech}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-party-yellow/10 text-party-yellow font-bold text-xs"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              {isSpeaking ? 'Stop Dictation' : 'Listen to Rules'}
            </button>
          </div>
        </header>

        <div className="mb-12">
          <p className="text-xl text-white/80 font-medium leading-relaxed">
            {description}
          </p>
        </div>

        <Button onClick={handleStart} className="w-full h-20 text-2xl !rounded-3xl flex items-center justify-center gap-3">
          <Play className="w-6 h-6 fill-current" /> Let's Play
        </Button>
      </motion.div>
    </div>
  );
};
