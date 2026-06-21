import { useState, useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { POKEDEX_CATALOG } from '../../game/pokemonData';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Search, X, Award, RotateCcw, Shield, Trash2 } from 'lucide-react';

export function PokedexModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedName, setSelectedName] = useState<string>('BULBASAUR');

  const pokedexState = useGameStore(state => state.pokedex);
  const mode = useGameStore(state => state.mode);
  const actions = useGameStore(state => state.actions);

  // Mobile custom event trigger listener
  useState(() => {
    if (typeof window !== 'undefined') {
      const handleOpen = () => {
        setIsOpen(true);
        const { soundManager } = require('../../game/soundManager');
        if (soundManager) soundManager.playSFX('click');
      };
      window.addEventListener('open-pokedex', handleOpen);
      return () => window.removeEventListener('open-pokedex', handleOpen);
    }
  });

  // Compute total statistics
  const statsSummary = useMemo(() => {
    let seenCount = 0;
    let caughtCount = 0;
    const totalCount = Object.keys(POKEDEX_CATALOG).length;

    Object.keys(POKEDEX_CATALOG).forEach((name) => {
      const entry = pokedexState[name];
      if (entry?.seen) seenCount++;
      if (entry?.caught) caughtCount++;
    });

    return { seenCount, caughtCount, totalCount };
  }, [pokedexState]);

  // Handle species filtering
  const filteredCatalog = useMemo(() => {
    const query = search.trim().toUpperCase();
    return Object.values(POKEDEX_CATALOG).filter(entry => {
      const isMatchName = entry.name.includes(query);
      const isMatchType = entry.types.some(t => t.includes(query));
      const state = pokedexState[entry.name];
      if (!state?.seen && query.length > 0) return false; // hide unseen from search if query is typed
      return isMatchName || isMatchType;
    });
  }, [search, pokedexState]);

  const activeEntry = POKEDEX_CATALOG[selectedName] || POKEDEX_CATALOG.BULBASAUR;
  const activeState = pokedexState[selectedName] || { seen: false, caught: false };

  if (mode !== 'OVERWORLD') return null;

  return (
    <>
      {/* Floating Pokédex Button on Overworld HUD */}
      <div className="hidden md:flex absolute top-4 right-4 z-40 items-center gap-3 pointer-events-auto">
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-2xl shadow-[0_8px_20px_rgba(225,29,72,0.3)] border border-red-500/30 cursor-pointer font-sans font-bold text-sm tracking-wide transition-all"
        >
          <BookOpen size={18} className="animate-pulse" />
          <span>POKéDEX</span>
          <span className="bg-rose-950/60 px-2 py-0.5 rounded-lg text-xs border border-rose-500/20 text-rose-200">
            {statsSummary.caughtCount}/{statsSummary.totalCount}
          </span>
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none pointer-events-auto font-sans">
            
            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-full max-w-4xl h-[90vh] bg-slate-900 border-2 border-slate-700/80 rounded-3xl overflow-hidden shadow-[0_24px_50px_rgba(0,0,0,0.8)] flex flex-col relative"
            >
              
              {/* Header */}
              <div className="flex bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 px-6 py-4 border-b border-slate-800 items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-red-600 animate-pulse border border-red-400" />
                  <div>
                    <h2 className="text-xl font-black text-rose-100 tracking-tight leading-none uppercase">Kanto Pokédex</h2>
                    <p className="text-xs text-rose-300 font-medium tracking-wide mt-1">PALLET TOWN EDITION • SILPH CO. REGISTRY</p>
                  </div>
                </div>

                {/* Completion bar */}
                <div className="hidden md:flex items-center gap-4 text-xs font-bold text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-yellow-400" />
                    <span>SEEN: <b className="text-slate-200">{statsSummary.seenCount}</b></span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>CAUGHT: <b className="text-slate-200">{statsSummary.caughtCount}</b></span>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white border border-transparent hover:border-slate-700 transition-all cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Main Workspace */}
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                
                {/* Left Side: Directory Scroll List */}
                <div className="w-full md:w-[42%] border-r border-slate-800 flex flex-col h-1/2 md:h-full bg-slate-900/60">
                  
                  {/* Search bar wrapper */}
                  <div className="p-4 border-b border-slate-800/80 shrink-0">
                    <div className="relative">
                      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search species or types..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 font-medium placeholder-slate-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/25 transition-all uppercase"
                      />
                    </div>
                  </div>

                  {/* List Container */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
                    {filteredCatalog.length === 0 ? (
                      <div className="py-12 text-center text-slate-500 font-medium text-sm">
                        No registered species found.
                      </div>
                    ) : (
                      filteredCatalog.map((entry) => {
                        const status = pokedexState[entry.name] || { seen: false, caught: false };
                        const isSelected = selectedName === entry.name;

                        return (
                          <button
                            key={entry.name}
                            onClick={() => setSelectedName(entry.name)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left group cursor-pointer ${
                              isSelected
                                ? 'bg-gradient-to-r from-red-950/50 to-slate-900 border-red-500/80 text-white'
                                : 'bg-slate-950/20 hover:bg-slate-950/50 border-slate-800/70 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {/* Icon placeholder circle */}
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs transition-transform group-hover:scale-105"
                                style={{
                                  backgroundColor: status.caught ? entry.color : '#1e293b',
                                  color: status.caught ? '#111827' : '#475569',
                                  opacity: status.seen ? 1 : 0.3
                                }}
                              >
                                {status.seen ? entry.name[0] : '?'}
                              </div>

                              <div>
                                <div className="text-xs font-mono text-slate-500 font-extrabold">
                                  No. {entry.num}
                                </div>
                                <div className="text-sm font-bold tracking-wide uppercase transition-colors">
                                  {status.seen ? entry.name : '?????????'}
                                </div>
                              </div>
                            </div>

                            {/* Badges */}
                            <div className="flex items-center gap-1.5">
                              {status.caught ? (
                                <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 text-[9px] font-black tracking-wider px-2 py-0.5 rounded-md uppercase">
                                  CAUGHT
                                </span>
                              ) : status.seen ? (
                                <span className="bg-yellow-950/60 text-yellow-500 border border-yellow-500/30 text-[9px] font-black tracking-wider px-2 py-0.5 rounded-md uppercase">
                                  SEEN
                                </span>
                              ) : (
                                <span className="bg-slate-950/80 text-slate-600 border border-slate-800 text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded-md uppercase">
                                  UNKNOWN
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right Side: Master Species Inspector Card */}
                <div className="w-full md:w-[58%] h-1/2 md:h-full overflow-y-auto p-6 flex flex-col bg-slate-950/30">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeEntry.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.15 }}
                      className="flex-1 flex flex-col"
                    >
                      {activeState.seen ? (
                        <div className="flex-1 flex flex-col space-y-6">
                          
                          {/* Main Graphic banner Card */}
                          <div
                            className="w-full rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between shadow-2xl h-44 sm:h-52"
                            style={{
                              background: activeState.caught
                                ? `linear-gradient(135deg, ${activeEntry.color}25 0%, #0f172a 100%)`
                                : `linear-gradient(135deg, #33415525 0%, #0f172a 100%)`,
                              border: `1.5px solid ${activeState.caught ? activeEntry.color + '40' : '#33415540'}`
                            }}
                          >
                            <div className="absolute top-2 right-2 text-[60px] font-black text-white/5 tracking-tighter leading-none pointer-events-none uppercase">
                              #{activeEntry.num}
                            </div>

                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[10px] font-mono text-slate-500 font-black">KANTO INDEX No. {activeEntry.num}</span>
                                <h3 className="text-3xl font-black text-white uppercase tracking-tight mt-1">{activeEntry.name}</h3>
                              </div>

                              {/* Static Holographic visual */}
                              <div
                                className="w-20 h-20 rounded-2xl shadow-inner border border-white/10 flex items-center justify-center font-black text-4xl text-slate-950 animate-bounce-slow"
                                style={{
                                  backgroundColor: activeState.caught ? activeEntry.color : '#334155',
                                  color: activeState.caught ? '#111827' : '#64748b'
                                }}
                              >
                                {activeEntry.name[0]}
                              </div>
                            </div>

                            {/* Type tags list */}
                            <div className="flex gap-2">
                              {activeEntry.types.map((type) => {
                                const typeColors: Record<string, string> = {
                                  FIRE: 'bg-orange-950/70 text-orange-400 border border-orange-500/30',
                                  WATER: 'bg-blue-950/70 text-blue-400 border border-blue-500/30',
                                  GRASS: 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30',
                                  POISON: 'bg-purple-950/70 text-purple-400 border border-purple-500/30',
                                  BUG: 'bg-lime-950/70 text-lime-400 border border-lime-500/30',
                                  NORMAL: 'bg-slate-800/70 text-slate-300 border border-slate-700/50',
                                  FLYING: 'bg-sky-950/70 text-sky-400 border border-sky-500/30',
                                  ELECTRIC: 'bg-yellow-950/70 text-yellow-400 border border-yellow-500/30'
                                };
                                return (
                                  <span
                                    key={type}
                                    className={`text-[10px] font-extrabold tracking-widest px-3 py-1 rounded-lg uppercase ${typeColors[type] || 'bg-slate-800 text-slate-400'}`}
                                  >
                                    {type}
                                  </span>
                                );
                              })}
                            </div>
                          </div>

                          {/* Description text box */}
                          <div className="bg-slate-950/50 border border-slate-800/80 p-4 rounded-xl leading-relaxed">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Registered Bio Info</h4>
                            <p className="text-slate-300 text-sm font-medium leading-relaxed">
                              {activeState.caught ? activeEntry.description : "Bio description locked. Explore Pallet Town tall grass patches to encounter and run Pokéball captures to fully log details."}
                            </p>
                          </div>

                          {/* Stats / Moves summary panel */}
                          {activeState.caught && (
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-slate-900 border border-slate-800/80 p-3.5 rounded-xl">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Base Vitality</h4>
                                <div className="text-2xl font-black text-white">{activeEntry.baseHp} <span className="text-xs text-slate-500">HP</span></div>
                              </div>
                              <div className="bg-slate-900 border border-slate-800/80 p-3.5 rounded-xl">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Starting Attacks</h4>
                                <div className="space-y-1">
                                  {activeEntry.moves.map(m => (
                                    <div key={m.name} className="flex justify-between items-center text-xs font-semibold text-slate-300 md:text-[11px]">
                                      <span className="uppercase">{m.name}</span>
                                      <span className="text-slate-500 uppercase">{m.type}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Dynamic Evolution Chain Diagram */}
                          <div className="bg-radial-card border border-slate-800/80 p-4.5 rounded-xl">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3.5 flex items-center gap-1.5">
                              <Award size={14} className="text-red-500" />
                              <span>Evolutionary Line Path</span>
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 justify-start font-mono text-xs font-bold leading-normal">
                              {activeEntry.evolutionChain.map((chainName, idx) => {
                                const chainEntry = POKEDEX_CATALOG[chainName];
                                const chainState = pokedexState[chainName] || { seen: false, caught: false };
                                
                                return (
                                  <div key={chainName} className="flex items-center gap-2 sm:gap-4 shrink-0">
                                    {idx > 0 && <span className="text-slate-600 font-extrabold text-base">➔</span>}
                                    
                                    <div
                                      className={`px-3 py-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                                        chainName === selectedName
                                          ? 'border-red-500/60 bg-red-950/20 shadow-lg text-white'
                                          : 'border-slate-800/80 bg-slate-950/35 text-slate-400'
                                      }`}
                                    >
                                      <span className="text-[10px] text-slate-500">Lv.{idx === 0 ? '1' : (idx === 1 ? '16' : '36')}</span>
                                      <span className={chainState.caught ? 'text-slate-200' : 'text-slate-500'}>
                                        {chainState.seen ? chainName : '????'}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl p-8 text-center bg-slate-950/10">
                          <Shield size={48} className="text-slate-700 mb-3" />
                          <h3 className="text-slate-500 font-black text-lg uppercase tracking-wider">No Data Logged</h3>
                          <p className="text-slate-600 text-sm max-w-sm font-medium leading-relaxed mt-2 uppercase">
                            You have not encountered this Pokémon species in the overworld grass yet. Sighting details will appear here once seen in battle!
                          </p>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

              </div>

              {/* Console Reset Footer Controls */}
              <div className="flex bg-slate-950 px-6 py-4 border-t border-slate-800/80 items-center justify-between shrink-0">
                <p className="text-[10px] font-mono text-slate-600 font-extrabold tracking-widest uppercase">
                  ACTIVE ENGINE PERSIST: LOCAL_STORAGE_ZUSTAND
                </p>

                {/* Reset entire game save button */}
                <button
                  onClick={() => {
                    const confirmReset = window.confirm("Are you sure you want to clear your persistent save data? This will reset your location, party, inventory, and Pokéball counts back to defaults.");
                    if (confirmReset) {
                      actions.resetGame();
                      setIsOpen(false);
                    }
                  }}
                  className="flex items-center gap-1.5 text-[10px] font-mono font-black text-red-500 bg-red-950/20 border border-red-500/20 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg transition-all uppercase cursor-pointer"
                >
                  <Trash2 size={12} />
                  <span>Wipe Save Data</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
