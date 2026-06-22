import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Tv, Play, Volume2, VolumeX, BookOpen, Backpack, Shield, Award, Sparkles, HelpCircle, User, LogOut, ChevronRight, X
} from 'lucide-react';
import { soundManager } from '../../game/soundManager';

export function GameMenuController() {
  const [showTitleScreen, setShowTitleScreen] = useState(true);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [showTrainerCard, setShowTrainerCard] = useState(false);

  const mode = useGameStore((state) => state.mode);
  const party = useGameStore((state) => state.party);
  const pcBox = useGameStore((state) => state.pcBox || []);
  const gold = useGameStore((state) => state.gold);
  const pokedexState = useGameStore((state) => state.pokedex);
  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const bgmEnabled = useGameStore((state) => state.bgmEnabled);
  const actions = useGameStore((state) => state.actions);

  // Hook global keyboard keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode !== 'OVERWORLD') return;

      const key = e.key.toUpperCase();
      if (key === 'ESCAPE' || key === 'C' || key === 'P') {
        if (!showTitleScreen) {
          e.preventDefault();
          setShowPauseMenu((prev) => {
            const next = !prev;
            soundManager.playSFX('click');
            return next;
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, showTitleScreen]);

  // Compute stats
  const pokedexCount = Object.keys(pokedexState).filter(k => pokedexState[k].caught).length;
  const companion = party[0] || null;

  const handleStartGame = () => {
    setShowTitleScreen(false);
    soundManager.playSFX('level_up');
    soundManager.syncBGMWithState();
  };

  const handleMenuAction = (eventType: string) => {
    setShowPauseMenu(false);
    window.dispatchEvent(new CustomEvent(eventType));
  };

  return (
    <>
      {/* 1. MAIN MENU TITLE SCREEN OVERLAY */}
      <AnimatePresence>
        {showTitleScreen && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-[#0b0e14] z-50 flex flex-col justify-between p-6 overflow-y-auto pointer-events-auto select-none"
            style={{
              backgroundImage: 'radial-gradient(circle at center, #1e293b 0%, #090d16 100%)'
            }}
          >
            {/* Ambient flashing star particles */}
            <div className="absolute inset-0 opacity-15 pointer-events-none bg-[url('https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&w=1200&q=30')] bg-cover" />

            {/* Top Bar */}
            <div className="w-full flex justify-between items-center z-10 font-mono text-[10px] text-zinc-500 font-extrabold tracking-widest leading-none">
              <span className="flex items-center gap-1.5 text-rose-500">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                <span>3D GAME SYSTEM ONLINE</span>
              </span>
              <span>VER 1.2 • REMASTERED</span>
            </div>

            {/* Middle Logo & Actions Container */}
            <div className="w-full max-w-lg mx-auto flex flex-col items-center text-center my-auto py-8 z-10">
              
              {/* Pokeball glowing visual */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 rounded-full bg-gradient-to-b from-red-600 via-white to-stone-200 border-4 border-slate-950 flex items-center justify-center shadow-[0_12px_36px_rgba(239,68,68,0.4)] mb-4"
              >
                <div className="w-4 h-4 rounded-full bg-white border-2 border-slate-950 shadow-inner" />
              </motion.div>

              {/* Title logo text */}
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-widest uppercase select-none relative mb-2">
                <span className="bg-gradient-to-b from-yellow-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent font-black block p-2 drop-shadow-[0_4px_12px_rgba(245,158,11,0.5)] leading-tight">POKéMON</span>
                <span className="text-red-500 tracking-[0.25em] font-black block text-2xl -mt-1 drop-shadow-[0_4px_12px_rgba(239,68,68,0.4)]">RED 3D</span>
              </h1>
              <p className="text-xs text-slate-400 tracking-wider uppercase font-bold font-mono">
                Explore Kanto in a Virtual Space
              </p>

              {/* Sub-Card Menu buttons list */}
              <div className="w-full mt-8 space-y-3.5 px-4">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStartGame}
                  className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-extrabold text-sm tracking-widest rounded-2xl shadow-[0_10px_25px_rgba(239,68,68,0.35)] border border-red-500/20 cursor-pointer flex items-center justify-center gap-2.5 transition-all text-center"
                >
                  <Play size={18} fill="currentColor" />
                  <span>START ADVENTURE</span>
                </motion.button>

                <div className="grid grid-cols-2 gap-3 shrink-0">
                  {/* Settings Sound Toggle */}
                  <button
                    onClick={() => {
                      actions.toggleSound();
                      soundManager.playSFX('click');
                    }}
                    className={`py-3 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      soundEnabled 
                        ? 'bg-slate-900 border-teal-500/30 text-teal-400' 
                        : 'bg-slate-950 border-slate-800 text-slate-600'
                    }`}
                  >
                    {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                    <span>SFX: {soundEnabled ? 'ON' : 'MUTED'}</span>
                  </button>

                  <button
                    onClick={() => {
                      actions.toggleBgm();
                      soundManager.playSFX('click');
                    }}
                    className={`py-3 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      bgmEnabled 
                        ? 'bg-slate-900 border-teal-500/30 text-teal-400' 
                        : 'bg-slate-950 border-slate-800 text-slate-605'
                    }`}
                  >
                    {bgmEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                    <span>BGM: {bgmEnabled ? 'ON' : 'MUTED'}</span>
                  </button>
                </div>
              </div>

              {/* Game keys and Lore Help block */}
              <div className="w-full mt-7 bg-slate-950/70 border border-slate-800 p-4.5 rounded-2xl text-left font-mono">
                <h3 className="text-slate-300 font-extrabold text-xs mb-3 flex items-center gap-1.5 uppercase tracking-wide border-b border-slate-900 pb-2">
                  <HelpCircle size={13} className="text-amber-400" />
                  <span>Trainer Guidebook</span>
                </h3>
                <div className="space-y-2 text-[10px] text-slate-400/90 font-bold leading-relaxed">
                  <div className="flex justify-between border-b border-slate-900/60 pb-1 uppercase">
                    <span>Move character</span>
                    <span className="text-slate-200">W, A, S, D / Arrows</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900/60 pb-1 uppercase">
                    <span>Interact / Signposts</span>
                    <span className="text-slate-200">Z / ENTER / SPACE</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900/60 pb-1 uppercase">
                    <span>Toggle overworld menu</span>
                    <span className="text-slate-200">ESC / C / P</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900/60 pb-1 uppercase">
                    <span>Action inventory bag</span>
                    <span className="text-slate-200">KEY [ I ]</span>
                  </div>
                  <div className="font-sans font-medium text-[10px] text-slate-500 leading-normal mt-2 gap-1 flex flex-col">
                    <p>🌿 Walk into tall grass to trigger random battle encounters with wild creatures!</p>
                    <p>📦 Use or check your computer at any time using the Oak's PC Storage button!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Footer Credits */}
            <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-2.5 text-slate-600 font-mono text-[9px] font-extrabold uppercase mt-auto">
              <span>DESIGNED FOR NATIVE CANVAS RENDERING & WEB GL</span>
              <span>© OAK POKÉLABS INC. & BILL DATA STORAGE</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. OVERWORLD PAUSE MENU PORTAL TRIGGER BUTTON */}
      {!showTitleScreen && mode === 'OVERWORLD' && (
        <div className="absolute top-4 left-4 z-40 pointer-events-auto flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowPauseMenu(true);
              soundManager.playSFX('click');
            }}
            className="flex items-center gap-2 px-4 py-3 bg-slate-900/95 hover:bg-slate-800 text-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.35)] border border-slate-700/60 cursor-pointer font-sans font-extrabold text-xs uppercase transition-all tracking-wider"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Overworld Menu [ESC]</span>
          </motion.button>
        </div>
      )}

      {/* 3. OVERWORLD SLIDE-OUT PAUSE MENU DASHBOARD */}
      <AnimatePresence>
        {showPauseMenu && mode === 'OVERWORLD' && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm z-45 flex justify-end pointer-events-auto font-sans select-none">
            
            {/* Dark background dismiss trigger click-shield */}
            <div className="absolute inset-0 cursor-pointer" onClick={() => setShowPauseMenu(false)} />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="w-full max-w-sm h-full bg-slate-900 border-l border-slate-800/80 p-5 flex flex-col justify-between shadow-[0_0_50px_rgba(0,0,0,0.6)] z-10 relative overflow-y-auto"
            >
              
              {/* Header block with trainer name */}
              <div className="flex justify-between items-center border-b border-slate-800 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-rose-500 flex items-center justify-center font-black text-white text-base shadow-md">
                    R
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-tight">Trainer Red</h3>
                    <p className="text-[10px] text-teal-400 font-extrabold font-mono tracking-widest mt-0.5">LOCATION: PALLET TOWN</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowPauseMenu(false)}
                  className="p-1 px-3 bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs border border-slate-700/80 transition-all font-mono font-bold uppercase cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Navigation Menu Grid */}
              <div className="flex-1 overflow-y-auto py-5 space-y-3.5">
                
                {/* Companion Partner mini view card */}
                {companion && (
                  <div 
                    onClick={() => {
                      setShowPauseMenu(false);
                      setShowTrainerCard(true);
                      soundManager.playSFX('click');
                    }}
                    className="p-3 bg-slate-950 border border-slate-850 rounded-2xl flex items-center justify-between cursor-pointer group hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-slate-950" style={{ backgroundColor: companion.color }}>
                        {companion.name[0]}
                      </div>
                      <div>
                        <div className="text-[9px] font-bold font-mono text-slate-500">ACTIVE COMPANION</div>
                        <div className="text-xs font-black text-white uppercase tracking-wider group-hover:text-yellow-400 transition-colors">{companion.name}</div>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-600 group-hover:text-white transition-all transform group-hover:translate-x-0.5" />
                  </div>
                )}

                {/* PAUSE ITEMS LIST ACTIONS */}
                <div className="space-y-2 shrink-0">
                  <button
                    onClick={() => handleMenuAction('open-pokedex')}
                    className="w-full p-3.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-850 rounded-xl text-left text-xs font-extrabold text-white tracking-widest flex items-center justify-between transition-all group uppercase cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <BookOpen size={15} className="text-red-400" />
                      <span>Kanto Pokédex</span>
                    </span>
                    <span className="text-[10px] bg-slate-900 px-2.5 py-0.5 rounded font-mono border border-slate-800 text-slate-400">
                      {pokedexCount} Species
                    </span>
                  </button>

                  <button
                    onClick={() => handleMenuAction('open-bag')}
                    className="w-full p-3.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-850 rounded-xl text-left text-xs font-extrabold text-white tracking-widest flex items-center justify-between transition-all group uppercase cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <Backpack size={15} className="text-amber-400 animate-bounce" />
                      <span>Trainer Pack (Bag)</span>
                    </span>
                    <span className="text-[10px] bg-slate-900 px-2.5 py-0.5 rounded font-mono border border-slate-800 text-slate-400 uppercase">
                      Bag [ I ]
                    </span>
                  </button>

                  <button
                    onClick={() => handleMenuAction('open-pc')}
                    className="w-full p-3.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-850 rounded-xl text-left text-xs font-extrabold text-white tracking-widest flex items-center justify-between transition-all group uppercase cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <Shield size={15} className="text-emerald-400" />
                      <span>Oak's PC Storage Box</span>
                    </span>
                    <span className="text-[10px] bg-slate-900 px-2.5 py-0.5 rounded font-mono border border-slate-800 text-slate-400">
                      {pcBox.length} Stored
                    </span>
                  </button>

                  <button
                    onClick={() => handleMenuAction('open-quests')}
                    className="w-full p-3.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-850 rounded-xl text-left text-xs font-extrabold text-white tracking-widest flex items-center justify-between transition-all group uppercase cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <Award size={15} className="text-indigo-400 animate-pulse" />
                      <span>Kanto Quest Journal</span>
                    </span>
                    <span className="text-[10px] bg-slate-900 px-2.5 py-0.5 rounded font-mono border border-slate-800 text-slate-400 uppercase">
                      Quests
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setShowTrainerCard(true);
                      soundManager.playSFX('click');
                    }}
                    className="w-full p-3.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-850 rounded-xl text-left text-xs font-extrabold text-white tracking-widest flex items-center justify-between transition-all group uppercase cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <User size={15} className="text-teal-400" />
                      <span>Trainer Profile ID</span>
                    </span>
                    <span className="text-teal-400 text-[10px] font-mono uppercase font-bold">
                      Badge Case
                    </span>
                  </button>
                </div>
              </div>

              {/* Quit or Return to Main controls */}
              <div className="border-t border-slate-800 pt-4 space-y-2 shrink-0">
                <button
                  onClick={() => {
                    soundManager.playSFX('click');
                    setShowPauseMenu(false);
                    setShowTitleScreen(true);
                  }}
                  className="w-full py-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white font-extrabold text-xs tracking-wider rounded-xl uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut size={13} />
                  <span>Return to Title Screen</span>
                </button>
                
                <p className="text-[8px] font-mono text-slate-600 text-center uppercase tracking-widest">
                  PALLET TOWN • LOCAL ENGINE
                </p>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. TRAINER PROFILE BADGES MODAL */}
      <AnimatePresence>
        {showTrainerCard && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none pointer-events-auto font-sans">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-slate-900 border-2 border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative p-6"
            >
              
              {/* Card visual header */}
              <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Award size={18} className="text-amber-500 animate-bounce" />
                  <h3 className="text-base font-black text-rose-100 uppercase tracking-wider">KANTO LEAGUE TRAINER ID</h3>
                </div>
                <button 
                  onClick={() => setShowTrainerCard(false)}
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Graphic Profile content representing retro retro badge card */}
              <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-4 font-mono">
                
                {/* ID Info */}
                <div className="flex justify-between items-start gap-4 pb-2 border-b border-slate-900">
                  <div className="w-16 h-16 rounded-xl bg-slate-800 text-3xl font-black text-slate-400 uppercase flex items-center justify-center border border-slate-700">
                    RED
                  </div>
                  <div className="flex-1 space-y-1.5 text-xs text-slate-400 font-bold uppercase text-right leading-none">
                    <div>
                      ID No. <span className="text-slate-100">01004</span>
                    </div>
                    <div>
                      NAME: <span className="text-slate-100">RED PALLET</span>
                    </div>
                    <div>
                      MONEY: <span className="text-amber-400">${gold} GOLD</span>
                    </div>
                  </div>
                </div>

                {/* Mini Party display */}
                <div>
                  <h4 className="text-[10px] text-slate-500 font-extrabold uppercase mb-2">ACTIVE PARTNERS</h4>
                  <div className="grid grid-cols-6 gap-2">
                    {party.map((p, i) => (
                      <div 
                        key={p.id || i}
                        className="h-7 w-full rounded focus:outline-none flex items-center justify-center font-black text-xs text-slate-950" 
                        style={{ backgroundColor: p.color }}
                        title={`${p.name} Lv.${p.level}`}
                      >
                        {p.name[0]}
                      </div>
                    ))}
                    {Array.from({ length: 6 - party.length }).map((_, i) => (
                      <div key={i} className="h-7 w-full rounded bg-slate-900 border border-dashed border-slate-800" />
                    ))}
                  </div>
                </div>

                {/* Badge Case collection representation */}
                <div>
                  <h4 className="text-[10px] text-slate-500 font-extrabold uppercase mb-2 flex justify-between items-center">
                    <span>Badge Case</span>
                    <span className="text-emerald-400">{pokedexCount >= 10 ? '1 / 8 BADGES' : '0 / 8 BADGES'}</span>
                  </h4>
                  <div className="grid grid-cols-4 gap-2.5">
                    {/* Boulder badge check */}
                    <div className={`py-2 px-1.5 rounded-lg border text-center text-[10px] font-black flex flex-col items-center justify-center gap-1 ${
                      pokedexCount >= 10
                        ? 'bg-amber-950/40 border-amber-500/40 text-amber-400'
                        : 'bg-slate-955/20 border-slate-950 text-slate-650 opacity-40'
                    }`}>
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shadow-inner" />
                      <span>BOULDER</span>
                    </div>

                    <div className="py-2 px-1.5 rounded-lg border text-center text-[10px] font-black flex flex-col items-center justify-center gap-1 bg-slate-955/20 border-slate-950 text-slate-650 opacity-40">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-inner" />
                      <span>CASCADE</span>
                    </div>

                    <div className="py-2 px-1.5 rounded-lg border text-center text-[10px] font-black flex flex-col items-center justify-center gap-1 bg-slate-955/20 border-slate-950 text-slate-650 opacity-40">
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-inner" />
                      <span>THUNDER</span>
                    </div>

                    <div className="py-2 px-1.5 rounded-lg border text-center text-[10px] font-black flex flex-col items-center justify-center gap-1 bg-slate-955/20 border-slate-950 text-slate-650 opacity-40">
                      <span className="w-2.5 h-2.5 rounded-full bg-rainbow shadow-inner" style={{ backgroundColor: '#2f9e44' }} />
                      <span>RAINBOW</span>
                    </div>
                  </div>
                  {pokedexCount < 10 && (
                    <p className="text-[9px] text-slate-500/90 leading-tight mt-3 text-center uppercase">
                      🔒 Catch <b className="text-slate-300">10</b> unique species in the pokedex registry to unlock your first Gym invitation!
                    </p>
                  )}
                </div>

              </div>

              {/* Close profile button */}
              <button
                onClick={() => setShowTrainerCard(false)}
                className="w-full py-3 bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-700 transition-all cursor-pointer mt-4"
              >
                Back to Overworld
              </button>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
