/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider, useGame } from './contexts/GameContext';
import Home from './screens/Home';
import Setup from './screens/Setup';
import Pass from './screens/Pass';
import TruthDare from './screens/games/TruthDare';
import MostLikely from './screens/games/MostLikely';
import Charades from './screens/games/Charades';
import Impostor from './screens/games/Impostor';
import Mafia from './screens/games/Mafia';
import WhoSaidThis from './screens/games/WhoSaidThis';
import { AnimatePresence } from 'motion/react';

function AppRoutes() {
  return (
    <div className="min-h-screen bg-party-black font-sans selection:bg-party-yellow selection:text-party-black overflow-x-hidden text-party-white">
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/pass" element={<Pass />} />
          <Route path="/games/truth-dare" element={<TruthDare />} />
          <Route path="/games/most-likely" element={<MostLikely />} />
          <Route path="/games/charades" element={<Charades />} />
          <Route path="/games/impostor" element={<Impostor />} />
          <Route path="/games/mafia" element={<Mafia />} />
          <Route path="/games/who-said-this" element={<WhoSaidThis />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}



export default function App() {
  return (
    <GameProvider>
      <Router>
        <AppRoutes />
      </Router>
    </GameProvider>
  );
}

