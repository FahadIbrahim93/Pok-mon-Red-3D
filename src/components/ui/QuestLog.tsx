import { useState, useMemo } from 'react';
import { useGameStore, Quest } from '../../store/gameStore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  MapPin, 
  Flame, 
  Compass, 
  Volume2, 
  VolumeX, 
  Music, 
  X, 
  Check, 
  Sparkles,
  Inbox,
  Award
} from 'lucide-react';
import { soundManager } from '../../game/soundManager';

export function QuestLog() {
  const quests = useGameStore((state) => state.quests);
  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const bgmEnabled = useGameStore((state) => state.bgmEnabled);
  const actions = useGameStore((state) => state.actions);
  const mode = useGameStore((state) => state.mode);

  // Modal open list
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  // Listen for mobile triggers to open quests
  useState(() => {
    if (typeof window !== 'undefined') {
      const handleOpen = () => {
        setIsOpen(true);
        soundManager.playSFX('click');
        soundManager.syncBGMWithState();
      };
      window.addEventListener('open-quests', handleOpen);
      return () => window.removeEventListener('open-quests', handleOpen);
    }
  });

  // Count active vs completed
  const totalQuests = quests.length;
  const completedCount = useMemo(() => quests.filter((q) => q.completed).length, [quests]);
  const activeCount = totalQuests - completedCount;
  const progressPercent = totalQuests ? Math.round((completedCount / totalQuests) * 100) : 0;

  // Filter list
  const filteredQuests = useMemo(() => {
    return quests.filter((q) => {
      if (activeTab === 'ACTIVE') return !q.completed;
      if (activeTab === 'COMPLETED') return q.completed;
      return true;
    });
  }, [quests, activeTab]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    soundManager.playSFX('click');
    // Ensure chiptune audio wakes up on user clicking any game overlay
    soundManager.syncBGMWithState();
  };

  const handleTabClick = (tab: 'ALL' | 'ACTIVE' | 'COMPLETED') => {
    setActiveTab(tab);
    soundManager.playSFX('click');
  };

  const handleSoundToggle = () => {
    actions.toggleSound();
  };

  const handleBgmToggle = () => {
    actions.toggleBgm();
  };

  return (
    <>
      {/* Floating launcher trigger button (un-intrusive bottom left) */}
      <div className="hidden md:flex absolute bottom-6 left-6 z-30 flex-col items-start gap-2.5 pointer-events-auto select-none">
        <button
          id="quest-log-trigger"
          onClick={handleToggle}
          className="relative px-4 py-3 bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md text-white font-extrabold text-xs tracking-wider uppercase flex items-center gap-2.5 rounded-2xl border-2 border-slate-700/80 hover:border-teal-500 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all cursor-pointer active:scale-95 group"
        >
          <div className="relative">
            <Trophy size={14} className="text-[#fab005] group-hover:animate-bounce" />
            {activeCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </div>
          <span>QUEST LOG</span>

          {totalQuests > 0 && (
            <span className="text-[10px] bg-slate-800 text-teal-400 font-mono px-1.5 py-0.5 rounded-md border border-slate-700/60 font-black">
              {completedCount}/{totalQuests}
            </span>
          )}
        </button>
      </div>

      {/* Main Quest slideout panel overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            
            {/* Modal Body container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="relative w-full max-w-lg bg-slate-950/95 border-[3px] border-slate-800 rounded-2xl text-slate-100 font-mono shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              
              {/* Top gradient layout banner */}
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-sky-400 via-teal-500 to-emerald-400" />
              
              {/* Header block with statistics indicator */}
              <div className="p-5 border-b border-slate-800/80 bg-slate-900/60 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-xl bg-teal-500/10 border border-teal-500/30">
                      <Compass className="text-teal-400 animate-spin" size={18} />
                    </div>
                    <div>
                      <h2 className="font-black text-sm text-slate-400 tracking-widest uppercase">TRAINER JOURNAL</h2>
                      <h1 className="font-black text-xl text-white tracking-tight">KANTO ADVENTURE</h1>
                    </div>
                  </div>

                  {/* Close button container */}
                  <button
                    onClick={handleToggle}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-900 transition-colors pointer-events-auto cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Progress calculation meter */}
                <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Award size={13} className="text-[#fab005]" />
                      <span>REGION COMPLETION PROGRESS</span>
                    </span>
                    <span className="text-teal-400 font-black font-mono">{progressPercent}%</span>
                  </div>
                  
                  <div className="relative w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800/60 p-0.5">
                    <motion.div 
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-[10px] text-slate-500 font-extrabold">
                    <span>{activeCount} OBJECTIVES IN PROGRESS</span>
                    <span>{completedCount} COMPLETED TASKS</span>
                  </div>
                </div>
              </div>

              {/* Central Filter Tab List */}
              <div className="flex items-center justify-between px-5 pt-3 pb-1 border-b border-slate-800/50">
                <div className="flex gap-1.5">
                  {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => handleTabClick(tab)}
                      className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
                        activeTab === tab
                          ? 'bg-teal-500/10 text-teal-400 border-teal-500/40 shadow-sm'
                          : 'bg-slate-900/40 text-slate-400 border-transparent hover:text-slate-300'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Companion Quick Audio Controls block directly embedded! */}
                <div className="flex items-center gap-2 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800/80">
                  <button
                    onClick={handleSoundToggle}
                    className={`p-1 rounded cursor-pointer transition-colors ${
                      soundEnabled ? 'text-teal-400 hover:text-teal-300' : 'text-slate-500 hover:text-slate-400'
                    }`}
                    title={soundEnabled ? "Mute All SFX Sound" : "Enable SFX Sound"}
                  >
                    {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                  </button>

                  <div className="w-px h-3 bg-slate-800" />

                  <button
                    onClick={handleBgmToggle}
                    className={`p-1 rounded cursor-pointer transition-colors ${
                      bgmEnabled ? 'text-[#ff922b] hover:text-amber-400' : 'text-slate-500 hover:text-slate-400'
                    }`}
                    title={bgmEnabled ? "Mute Music BGM" : "Enable Music BGM"}
                  >
                    <Music size={13} className={bgmEnabled ? "animate-pulse" : ""} />
                  </button>
                </div>
              </div>

              {/* Scrollable Dynamic Quest List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3.5 max-h-[45vh] bg-slate-950/40 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                  {filteredQuests.length > 0 ? (
                    filteredQuests.map((quest) => {
                      const categoryBg = 
                        quest.category === 'EXPLORE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        quest.category === 'TRAINING' ? 'bg-[#ff922b]/10 text-[#ff922b] border-[#ff922b]/20' :
                        'bg-sky-500/10 text-sky-400 border-sky-500/20';

                      return (
                        <motion.div
                          layout
                          key={quest.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.15 }}
                          className={`p-4 rounded-xl border transition-all ${
                            quest.completed
                              ? 'bg-slate-900/30 border-slate-800/50 opacity-65'
                              : 'bg-slate-900/70 border-slate-800 hover:border-slate-700/80 shadow-[0_4px_16px_rgba(0,0,0,0.15)]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              
                              {/* Category Header badge */}
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${categoryBg}`}>
                                  {quest.category}
                                </span>
                                {quest.completed && (
                                  <span className="text-[9px] font-black uppercase bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                                    <Sparkles size={9} className="animate-pulse" />
                                    <span>DONE</span>
                                  </span>
                                )}
                              </div>

                              {/* Title and details */}
                              <h3 className={`font-black text-sm tracking-tight ${quest.completed ? 'text-slate-500 line-through' : 'text-slate-100'}`}>
                                {quest.title}
                              </h3>
                              <p className={`text-xs mt-1 leading-relaxed ${quest.completed ? 'text-slate-500/80 font-normal' : 'text-slate-300 font-medium'}`}>
                                {quest.description}
                              </p>
                              
                              {/* Progress metric sub-bar */}
                              {!quest.completed && (
                                <div className="mt-3 flex items-center justify-between gap-4">
                                  <div className="flex-1 h-1.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-900">
                                    <div 
                                      className={`h-full rounded-full transition-all duration-300 ${
                                        quest.category === 'EXPLORE' ? 'bg-emerald-500' :
                                        quest.category === 'TRAINING' ? 'bg-orange-500' :
                                        'bg-sky-500'
                                      }`}
                                      style={{ width: `${(quest.progress / quest.maxProgress) * 100}%` }}
                                    />
                                  </div>
                                  <div className="text-[10px] font-bold text-slate-400 font-mono shrink-0 select-none">
                                    {quest.progress} / {quest.maxProgress}
                                  </div>
                                </div>
                              )}

                            </div>

                            {/* Circular state checkboxes */}
                            <div className="shrink-0 pt-0.5">
                              {quest.completed ? (
                                <div className="w-5 h-5 rounded-full bg-teal-500/20 border-2 border-teal-500 flex items-center justify-center text-teal-400">
                                  <Check size={11} className="stroke-[3.5px]" />
                                </div>
                              ) : (
                                <div className={`w-5 h-5 rounded-full bg-slate-950 border-2 ${
                                  quest.category === 'EXPLORE' ? 'border-emerald-700/60' :
                                  quest.category === 'TRAINING' ? 'border-orange-700/60' :
                                  'border-sky-700/60'
                                }`} />
                              )}
                            </div>

                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <motion.div
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-12 flex flex-col items-center justify-center gap-3 bg-slate-900/20 border border-dashed border-slate-800 rounded-xl text-center"
                    >
                      <Inbox className="text-slate-600 size-8 animate-bounce" />
                      <div className="text-xs text-slate-500 font-black uppercase tracking-wider">
                        Nothing found in this view
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footnotes instruction bar */}
              <div className="bg-slate-950 border-t border-slate-800 p-4 text-[10px] text-slate-500 font-extrabold leading-relaxed text-center select-none uppercase">
                ⚙️ Progress is auto-saved locally. <br /> Tap or keypress anywhere inside the town to synthesize more sound!
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
