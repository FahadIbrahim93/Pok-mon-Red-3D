import { useEffect } from 'react';
import { Scene } from './components/3d/Scene';
import { UIOverlay } from './components/ui/UIOverlay';
import { BattleUI } from './components/ui/BattleUI';
import { MobileControls } from './components/ui/MobileControls';
import { PokedexModal } from './components/ui/PokedexModal';
import { Minimap } from './components/ui/Minimap';
import { QuestLog } from './components/ui/QuestLog';
import { InventoryModal } from './components/ui/InventoryModal';
import { PcBoxModal } from './components/ui/PcBoxModal';
import { GameMenuController } from './components/ui/GameMenuController';
import { soundManager } from './game/soundManager';

export default function App() {
  // Wake up game BGM system on first human action to obey modern browser policies
  useEffect(() => {
    const handleUserInteraction = () => {
      soundManager.syncBGMWithState();
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };
    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);
    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-[#82c91e] overflow-hidden select-none">
      <Scene />
      <UIOverlay />
      <BattleUI />
      <MobileControls />
      <Minimap />
      <PokedexModal />
      <QuestLog />
      <InventoryModal />
      <PcBoxModal />
      <GameMenuController />
    </div>
  );
}
