import { useState, useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles, X, Plus, Minus, Trash2, Heart, RefreshCw } from 'lucide-react';
import { soundManager } from '../../game/soundManager';

export function PcBoxModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedInParty, setSelectedInParty] = useState<number | null>(null);
  const [selectedInPc, setSelectedInPc] = useState<number | null>(null);

  const party = useGameStore((state) => state.party);
  const pcBox = useGameStore((state) => state.pcBox || []);
  const gold = useGameStore((state) => state.gold);
  const actions = useGameStore((state) => state.actions);
  const mode = useGameStore((state) => state.mode);

  // Custom Event Listener to show/hide the PC Storage
  useState(() => {
    if (typeof window !== 'undefined') {
      const handleOpen = () => {
        setIsOpen(true);
        soundManager.playSFX('click');
      };
      window.addEventListener('open-pc', handleOpen);
      return () => window.removeEventListener('open-pc', handleOpen);
    }
  });

  if (mode !== 'OVERWORLD') return null;

  const handleDeposit = (idx: number) => {
    if (party.length <= 1) {
      actions.showDialogue("OAK'S PC SYSTEM: Cannot deposit Pokémon! You must keep at least 1 active partner in your Battle Party.");
      soundManager.playSFX('click');
      return;
    }
    actions.depositPokemon(idx);
    setSelectedInParty(null);
  };

  const handleWithdraw = (idx: number) => {
    if (party.length >= 6) {
      actions.showDialogue("OAK'S PC SYSTEM: Party is full (Max 6)! Deposit an active Pokémon before withdrawing another partner.");
      soundManager.playSFX('click');
      return;
    }
    actions.withdrawPokemon(idx);
    setSelectedInPc(null);
  };

  const handleRelease = (id: string, name: string, isFromParty: boolean) => {
    if (isFromParty && party.length <= 1) {
      actions.showDialogue("OAK'S PC SYSTEM: Unable to release! You cannot release your only active Battle partner!");
      soundManager.playSFX('click');
      return;
    }
    const confirmRelease = window.confirm(`Are you absolutely sure you want to release ${name} back into the wild meadows? This action cannot be undone!`);
    if (confirmRelease) {
      actions.releasePokemon(id, isFromParty);
      setSelectedInParty(null);
      setSelectedInPc(null);
    }
  };

  const handleHealAll = () => {
    actions.healStoredPokemon();
    actions.showDialogue("OAK'S PC SYSTEM: Initialized full scan and recovery. All Party partners and Box Pokémon were restored to 100% HEALTH!");
  };

  return (
    <>
      {/* Floating overworld button for PC storage (alternative to oak terminal interaction) */}
      <div className="hidden md:flex absolute top-18 right-4 z-40 items-center gap-3 pointer-events-auto">
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-500 hover:to-emerald-600 text-white rounded-2xl shadow-[0_8px_20px_rgba(16,185,129,0.3)] border border-teal-500/30 cursor-pointer font-sans font-bold text-sm tracking-wide transition-all"
        >
          <Shield size={18} className="animate-pulse" />
          <span>OAK'S PC STORAGE</span>
          <span className="bg-emerald-950/60 px-2 py-0.5 rounded-lg text-xs border border-emerald-500/20 text-emerald-200">
            {pcBox.length} In Storage
          </span>
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none pointer-events-auto font-sans">
            
            {/* Main Modal Panel */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 40 }}
              transition={{ type: 'spring', damping: 24, stiffness: 210 }}
              className="w-full max-w-5xl h-[92vh] bg-slate-900 border-2 border-slate-700/80 rounded-3xl overflow-hidden shadow-[0_24px_50px_rgba(0,0,0,0.85)] flex flex-col relative"
            >
              
              {/* Header */}
              <div className="flex bg-gradient-to-r from-teal-950/40 via-slate-900 to-slate-900 px-6 py-4.5 border-b border-slate-800 items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4.5 h-4.5 rounded-full bg-emerald-500 animate-pulse border border-emerald-400" />
                  <div>
                    <h2 className="text-xl font-black text-teal-100 tracking-tight leading-none uppercase">BILL'S PC STORAGE SYSTEM</h2>
                    <p className="text-xs text-teal-300 font-medium tracking-wide mt-1">PALLET TOWN TERMINAL 3000 • FULLY RESTORED DATA PIPELINE</p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-4 text-xs font-bold text-slate-400 select-none">
                  <div className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                    GOLD WALLET: <b className="text-amber-400">${gold}</b>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white border border-transparent hover:border-slate-700 transition-all cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Main Workspace Layout */}
              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                
                {/* Left Panel: Active Battle Party (Max 6) */}
                <div className="w-full lg:w-[45%] border-r border-slate-800 flex flex-col h-1/2 lg:h-full bg-slate-900/60 p-4">
                  <div className="flex justify-between items-center mb-3 shrink-0">
                    <h3 className="text-sm font-black text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={14} className="text-yellow-400" />
                      <span>Active Battle Party ({party.length}/6)</span>
                    </h3>
                    <p className="text-[10px] text-slate-500 font-extrabold uppercase font-mono">
                      PRIMARY STACKS
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 p-1.5 bg-slate-950/20 border border-slate-850 rounded-2xl scrollbar-thin">
                    {party.map((pokemon, idx) => {
                      const isSelected = selectedInParty === idx;
                      const hpPercent = (pokemon.hp / pokemon.maxHp) * 100;
                      const isCompanion = idx === 0;

                      return (
                        <div
                          key={pokemon.id}
                          onClick={() => {
                            setSelectedInParty(isSelected ? null : idx);
                            setSelectedInPc(null);
                          }}
                          className={`w-full p-3.5 rounded-xl border transition-all text-left flex flex-col gap-2.5 cursor-pointer relative overflow-hidden group ${
                            isSelected
                              ? 'bg-gradient-to-r from-teal-950/40 to-slate-900 border-teal-500/80 shadow-md'
                              : 'bg-slate-950/40 hover:bg-slate-950/70 border-slate-800/80'
                          }`}
                        >
                          {/* Companion indicator badge */}
                          {isCompanion && (
                            <div className="absolute top-0 right-0 bg-yellow-500 text-slate-950 font-black text-[8px] px-2 py-0.5 rounded-bl-lg tracking-wider uppercase">
                              COMPANION PARTNER
                            </div>
                          )}

                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              {/* Procedural icon representation in primary color */}
                              <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-slate-950 group-hover:scale-105 transition-transform"
                                style={{ backgroundColor: pokemon.color }}
                              >
                                {pokemon.name[0]}
                              </div>
                              <div>
                                <h4 className="text-sm font-black text-white uppercase tracking-wide flex items-center gap-1.5">
                                  {pokemon.name}
                                </h4>
                                <p className="text-[10px] text-slate-500 font-extrabold font-mono mt-0.5">Lv.{pokemon.level} • {pokemon.moves.length} MOVES</p>
                              </div>
                            </div>

                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 font-mono border border-slate-700">
                              Party #{idx+1}
                            </span>
                          </div>

                          {/* Vitality health bar */}
                          <div className="mt-1">
                            <div className="flex justify-between text-[10px] text-slate-400 font-semibold mb-1">
                              <span>HP: {pokemon.hp} / {pokemon.maxHp}</span>
                              <span>{Math.round(hpPercent)}%</span>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden p-0.5 border border-slate-800">
                              <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                  width: `${hpPercent}%`,
                                  backgroundColor: hpPercent > 50 ? '#10b981' : hpPercent > 20 ? '#f59e0b' : '#ef4444'
                                }}
                              />
                            </div>
                          </div>

                          {/* Interactive individual buttons when clicked/selected */}
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex gap-2 mt-1.5 border-t border-slate-800/60 pt-2 shrink-0 overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {/* Set Companion companion (shift to idx 0) */}
                                {!isCompanion && (
                                  <button
                                    onClick={() => {
                                      actions.swapPartyMembers(idx);
                                      setSelectedInParty(0);
                                      soundManager.playSFX('level_up');
                                    }}
                                    className="flex-1 py-1.5 bg-yellow-600/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500 hover:text-slate-950 font-bold text-[10px] rounded-lg uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    Set Companion
                                  </button>
                                )}

                                {/* Deposit to PC */}
                                <button
                                  onClick={() => handleDeposit(idx)}
                                  className="flex-1 py-1.5 bg-teal-600/20 text-teal-400 border border-teal-500/30 hover:bg-teal-500 hover:text-white font-bold text-[10px] rounded-lg uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Minus size={11} />
                                  <span>Deposit to PC</span>
                                </button>

                                {/* Release Wild */}
                                <button
                                  onClick={() => handleRelease(pokemon.id, pokemon.name, true)}
                                  className="py-1.5 px-2 bg-red-650/20 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white font-bold text-[10px] rounded-lg uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
                                  title="Release into the wild meadows"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Panel: Digital PC Storage Boxes */}
                <div className="w-full lg:w-[55%] flex flex-col h-1/2 lg:h-full bg-slate-950/30 p-4">
                  <div className="flex justify-between items-center mb-3 shrink-0">
                    <h3 className="text-sm font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Shield size={14} className="text-teal-400" />
                      <span>Digital Storage PC Box ({pcBox.length} Stored)</span>
                    </h3>

                    {/* Console wide Full heal button */}
                    <button
                      onClick={handleHealAll}
                      className="text-[10px] font-mono font-black text-teal-400 border border-teal-500/20 bg-teal-950/20 hover:bg-teal-500 hover:text-white px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer uppercase py-1"
                    >
                      <Heart size={11} className="animate-pulse text-rose-500 fill-rose-500" />
                      <span>Full Scan & Heal</span>
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto bg-slate-950/50 p-3.5 border border-slate-900 rounded-3xl scrollbar-thin">
                    {pcBox.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-800 bg-slate-900/10 rounded-2xl">
                        <Shield size={44} className="text-slate-800 mb-2" />
                        <h4 className="text-slate-500 font-extrabold uppercase text-sm">Storage Box Empty</h4>
                        <p className="text-slate-600 text-xs max-w-sm leading-relaxed mt-1 uppercase">
                          No duplicate Pokémon in reserve. Captured wild Pokémon exceeding the six limits of your active party are instantly stored here!
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {pcBox.map((pokemon, idx) => {
                          const isSelected = selectedInPc === idx;
                          const hpPercent = (pokemon.hp / pokemon.maxHp) * 100;

                          return (
                            <div
                              key={pokemon.id}
                              onClick={() => {
                                setSelectedInPc(isSelected ? null : idx);
                                setSelectedInParty(null);
                              }}
                              className={`p-3 rounded-xl border transition-all text-left flex flex-col gap-2 cursor-pointer relative ${
                                isSelected
                                  ? 'bg-gradient-to-br from-emerald-950/50 to-slate-900 border-emerald-500/70 shadow-md'
                                  : 'bg-slate-900/70 hover:bg-slate-900 border-slate-800/80 shadow-inner'
                              }`}
                            >
                              <div className="flex gap-2.5 items-center">
                                {/* Color Block icon */}
                                <div
                                  className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-slate-950"
                                  style={{ backgroundColor: pokemon.color }}
                                >
                                  {pokemon.name[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-xs font-black text-white uppercase truncate tracking-wide flex items-center justify-between">
                                    <span>{pokemon.name}</span>
                                    <span className="text-[9px] text-teal-400 font-bold font-mono">Lv.{pokemon.level}</span>
                                  </h4>
                                  <p className="text-[9px] text-slate-500 uppercase font-bold mt-0.5">HEALTH CAP: {pokemon.maxHp} HP</p>
                                </div>
                              </div>

                              <AnimatePresence>
                                {isSelected && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex gap-2 border-t border-slate-800/50 pt-2 shrink-0 overflow-hidden"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {/* Withdraw */}
                                    <button
                                      onClick={() => handleWithdraw(idx)}
                                      className="flex-1 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white font-bold text-[9px] rounded-md uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
                                    >
                                      <Plus size={10} />
                                      <span>Withdraw</span>
                                    </button>

                                    {/* Release */}
                                    <button
                                      onClick={() => handleRelease(pokemon.id, pokemon.name, false)}
                                      className="py-1 px-2 bg-red-650/20 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white font-bold text-[9px] rounded-md uppercase transition-all flex items-center justify-center gap-1 cursor-pointer font-mono"
                                      title="Release partner back into nature"
                                    >
                                      <Trash2 size={10} />
                                      <span>Release</span>
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Reset / Diagnostic Footer */}
              <div className="flex bg-slate-950 px-6 py-4.5 border-t border-slate-800/80 items-center justify-between shrink-0 leading-normal gap-4 font-mono font-black text-[10px] text-slate-600">
                <p className="uppercase tracking-widest hidden md:inline">
                  BILL'S CLOUD ROUTER ONLINE • ALL REPOSITORIES INTACT
                </p>
                <div className="flex gap-3">
                  <span className="text-emerald-500">SYS_STATUS: ACTIVE</span>
                  <span className="text-teal-500">PERSISTENCE: LOCAL_DB</span>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
