import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../../store/gameStore';
import { soundManager } from '../../game/soundManager';
import { Sparkles, Shield, Swords, Heart, Zap } from 'lucide-react';

const STARTERS = [
  {
    name: 'BULBASAUR',
    num: '#001',
    types: ['GRASS', 'POISON'],
    color: '#38d9a9',
    colorLight: '#69db7c',
    colorDark: '#087f5b',
    description: 'A strange seed was planted on its back at birth. The plant sprouts and grows with this Pokémon.',
    hp: 20,
    moves: [
      { name: 'TACKLE', power: 4, type: 'NORMAL' },
      { name: 'VINE WHIP', power: 6, type: 'GRASS' },
    ],
    emoji: '🌿',
    statSpeed: 45,
    statAttack: 49,
    statDefense: 49,
  },
  {
    name: 'CHARMANDER',
    num: '#004',
    types: ['FIRE'],
    color: '#ff922b',
    colorLight: '#ffa94d',
    colorDark: '#e8590c',
    description: 'The flame at the tip of its tail makes a sound as it burns. You can tell its life force by the flame.',
    hp: 20,
    moves: [
      { name: 'SCRATCH', power: 4, type: 'NORMAL' },
      { name: 'EMBER', power: 6, type: 'FIRE' },
    ],
    emoji: '🔥',
    statSpeed: 65,
    statAttack: 52,
    statDefense: 43,
  },
  {
    name: 'SQUIRTLE',
    num: '#007',
    types: ['WATER'],
    color: '#4dabf7',
    colorLight: '#74c0fc',
    colorDark: '#1c7ed6',
    description: 'Shoots pressurized water at prey from the water. Retracts into its shell when in danger.',
    hp: 22,
    moves: [
      { name: 'TACKLE', power: 4, type: 'NORMAL' },
      { name: 'WATER GUN', power: 6, type: 'WATER' },
    ],
    emoji: '💧',
    statSpeed: 43,
    statAttack: 48,
    statDefense: 65,
  },
];

const TYPE_BADGES: Record<string, { color: string; textColor: string }> = {
  GRASS: { color: '#78c850', textColor: '#000' },
  POISON: { color: '#a040a0', textColor: '#fff' },
  FIRE: { color: '#f08030', textColor: '#000' },
  WATER: { color: '#6890f0', textColor: '#000' },
  NORMAL: { color: '#a8a878', textColor: '#000' },
};

const CONFETTI_COLORS = ['#fcc419', '#ff6b6b', '#51cf66', '#339af0', '#cc5de8', '#ff922b', '#f783ac', '#20c997', '#e599f7'];

export function StarterSelection() {
  const showStarterModal = useGameStore((state) => state.showStarterModal);
  const actions = useGameStore((state) => state.actions);
  const [selectedStarter, setSelectedStarter] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [hoveredStarter, setHoveredStarter] = useState<string | null>(null);
  const [screenFlash, setScreenFlash] = useState(false);
  const [burstParticles, setBurstParticles] = useState<{ id: number; x: number; y: number; color: string; emoji: string }[]>([]);
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; color: string; size: number; shape: 'circle' | 'square'; delay: number; duration: number; rotation: number }[]>([]);
  const [cascadeConfetti, setCascadeConfetti] = useState<{ id: number; x: number; color: string; size: number; shape: 'circle' | 'square'; delay: number; duration: number; rotation: number; drift: number }[]>([]);
  const [shaking, setShaking] = useState(false);

  const handleConfirm = () => {
    if (selectedStarter && !confirmed) {
      setConfirmed(true);

      // Camera shake for impact
      setShaking(true);
      setTimeout(() => setShaking(false), 350);

      // Poké Ball click sound synced with screen flash
      soundManager.playSFX('click');

      // Screen flash
      setScreenFlash(true);
      setTimeout(() => setScreenFlash(false), 500);

      // Burst particle spawn — spawn particles radiating from center
      const starter = STARTERS.find(s => s.name === selectedStarter);
      if (starter) {
        const newParticles = Array.from({ length: 20 }, (_, i) => ({
          id: Date.now() + i,
          x: (Math.random() - 0.5) * 250,
          y: (Math.random() - 0.5) * 250,
          color: starter.color,
          emoji: starter.emoji,
        }));
        setBurstParticles(newParticles);

        // Confetti sparkle burst — 36 colorful particles with varied motion
        const newConfetti = Array.from({ length: 36 }, (_, i) => ({
          id: Date.now() + 100 + i,
          x: (Math.random() - 0.5) * 400,
          y: (Math.random() - 0.5) * 400 - 100, // bias upward for fall effect
          color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
          size: Math.random() * 8 + 4,
          shape: (Math.random() > 0.5 ? 'circle' : 'square') as 'circle' | 'square',
          delay: Math.random() * 0.15,
          duration: Math.random() * 0.4 + 0.6,
          rotation: Math.random() * 360,
        }));
        setConfetti(newConfetti);

        // Clear particles after animation completes
        setTimeout(() => {
          setBurstParticles([]);
          setConfetti([]);
        }, 1200);

        // Secondary cascade wave — particles fall from top after 300ms delay
        const cascadeTimer = setTimeout(() => {
          const newCascade = Array.from({ length: 30 }, (_, i) => ({
            id: Date.now() + 200 + i,
            x: Math.random() * 100, // random horizontal start position (vw)
            color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
            size: Math.random() * 6 + 3,
            shape: (Math.random() > 0.5 ? 'circle' : 'square') as 'circle' | 'square',
            delay: Math.random() * 0.4, // stagger start times
            duration: Math.random() * 1.0 + 1.2, // 1.2–2.2s to fall
            rotation: Math.random() * 720,
            drift: (Math.random() - 0.5) * 200, // horizontal drift in px
          }));
          setCascadeConfetti(newCascade);

          // Clear cascade after its animation completes
          setTimeout(() => {
            setCascadeConfetti([]);
          }, 2800);
        }, 300);      }

      // Brief delay for dramatic effect
      setTimeout(() => {
        actions.chooseStarter(selectedStarter);
        setSelectedStarter(null);
        setConfirmed(false);
        setScreenFlash(false);
        setBurstParticles([]);
        setConfetti([]);
        setCascadeConfetti([]);
      }, 800);
    }
  };

  const handleClose = () => {
    if (!selectedStarter) {
      actions.closeStarterModal();
    }
  };

  // Keyboard shortcuts: Enter to confirm, Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        handleClose();
      } else if (e.key === 'Enter') {
        e.stopPropagation();
        handleConfirm();
      }
    };

    if (showStarterModal) {
      window.addEventListener('keydown', handleKeyDown, true);
    }
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [showStarterModal, selectedStarter, confirmed]);

  return (
    <AnimatePresence>
      {showStarterModal && (
        <motion.div
          className="absolute inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none pointer-events-auto font-sans"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Screen flash overlay */}
          {screenFlash && (
            <motion.div
              className="absolute inset-0 z-50 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0.4, 0] }}
              transition={{ duration: 0.5, times: [0, 0.15, 0.35, 1] }}
              style={{
                background: confirmed && selectedStarter
                  ? `radial-gradient(circle at center, ${STARTERS.find(s => s.name === selectedStarter)?.color || '#fff'} 0%, rgba(255,255,255,0.9) 40%, transparent 70%)`
                  : 'transparent',
              }}
            />
          )}

          {/* Background overlay */}
          <motion.div
            className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Burst emoji particles */}
          {burstParticles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute z-50 pointer-events-none text-2xl"
              initial={{ x: '50vw', y: '50vh', scale: 0, opacity: 1 }}
              animate={{
                x: `calc(50vw + ${p.x}px)`,
                y: `calc(50vh + ${p.y}px)`,
                scale: [0, 1.5, 0.5, 0],
                opacity: [1, 1, 0.8, 0],
                rotate: [0, 180, 360],
              }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              {p.emoji}
            </motion.div>
          ))}

          {/* Confetti sparkle particles — colorful shapes with varied motion */}
          {confetti.map((c) => (
            <motion.div
              key={c.id}
              className="absolute z-50 pointer-events-none"
              initial={{ x: '50vw', y: '50vh', scale: 0, rotate: 0, opacity: 1 }}
              animate={{
                x: `calc(50vw + ${c.x}px)`,
                y: `calc(50vh + ${c.y}px)`,
                scale: [0, 1.2, 0.3, 0],
                opacity: [1, 1, 0.6, 0],
                rotate: [0, c.rotation, c.rotation * 2],
              }}
              transition={{
                duration: c.duration,
                delay: c.delay,
                ease: [0.25, 0.46, 0.45, 0.94], // cubic bezier for bounce/fade
              }}
              style={{
                width: c.size,
                height: c.size,
                borderRadius: c.shape === 'circle' ? '50%' : '2px',
                backgroundColor: c.color,
                boxShadow: `0 0 6px ${c.color}88`,
              }}
            />
          ))}

          {/* Secondary cascade confetti wave — falls from top after initial burst */}
          {cascadeConfetti.map((c) => (
            <motion.div
              key={c.id}
              className="absolute z-50 pointer-events-none"
              initial={{
                x: `${c.x}vw`,
                y: '-5vh',
                scale: 0.3,
                rotate: 0,
                opacity: 1,
              }}
              animate={{
                y: '105vh',
                x: `calc(${c.x}vw + ${c.drift}px)`,
                scale: [0.3, 1, 0.8, 0.4],
                opacity: [1, 1, 0.6, 0],
                rotate: [0, c.rotation * 0.5, c.rotation],
              }}
              transition={{
                duration: c.duration,
                delay: c.delay,
                ease: [0.25, 0.1, 0.45, 0.95], // gentle ease for falling
              }}
              style={{
                width: c.size,
                height: c.size,
                borderRadius: c.shape === 'circle' ? '50%' : '2px',
                backgroundColor: c.color,
                boxShadow: `0 0 6px ${c.color}88`,
              }}
            />
          ))}

          {/* Main Modal */}
          <motion.div
            className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-slate-700/80 rounded-3xl shadow-[0_32px_64px_rgba(0,0,0,0.8)] p-6 sm:p-8"
            initial={{ scale: 0.85, y: 40, opacity: 0 }}
            animate={shaking ? { scale: 1, y: 0, opacity: 1, x: [0, -8, 8, -6, 6, -4, 4, -2, 2, 0] } : { scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 40, opacity: 0 }}
            transition={shaking ? { duration: 0.35, ease: 'easeOut' } : { type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Decorative top edge glow */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-amber-500 to-blue-500 rounded-t-3xl" />

            {/* Header */}
            <div className="text-center mb-8 mt-2">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles size={20} className="text-amber-400" />
                  <span className="text-[10px] font-black text-amber-400 tracking-[0.2em] uppercase bg-amber-950/40 px-3 py-1 rounded-full border border-amber-500/30">
                    Professor Oak's Lab
                  </span>
                  <Sparkles size={20} className="text-amber-400" />
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
                  Choose Your
                  <span className="bg-gradient-to-r from-emerald-400 via-amber-400 to-sky-400 bg-clip-text text-transparent ml-2">
                    Partner
                  </span>
                </h1>
                <p className="text-slate-400 text-sm sm:text-base mt-3 max-w-lg mx-auto font-bold leading-relaxed">
                  Every great journey begins with a first friend. Pick the Pokémon that speaks to your spirit!
                </p>
              </motion.div>
            </div>

            {/* Starter Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
              {STARTERS.map((starter, index) => {
                const isSelected = selectedStarter === starter.name;
                const isHovered = hoveredStarter === starter.name;

                return (
                  <motion.div
                    key={starter.name}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 + index * 0.1, type: 'spring', stiffness: 200 }}
                    className={`
                      relative rounded-2xl border-2 cursor-pointer transition-all duration-300
                      ${isSelected
                        ? 'border-white/80 shadow-[0_0_30px_rgba(255,255,255,0.15)] scale-[1.02]'
                        : 'border-slate-700/60 hover:border-slate-500/60 hover:scale-[1.01]'
                      }
                      bg-gradient-to-b from-slate-800/90 to-slate-900/90
                    `}
                    onClick={() => {
                      if (!confirmed) {
                        setSelectedStarter(isSelected ? null : starter.name);
                      }
                    }}
                    onMouseEnter={() => setHoveredStarter(starter.name)}
                    onMouseLeave={() => setHoveredStarter(null)}
                  >
                    {/* Selection indicator */}
                    {isSelected && (
                      <motion.div
                        className="absolute -top-3 -right-3 z-10 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </motion.div>
                    )}

                    {/* Card content */}
                    <div className="p-5">
                      {/* Pokémon 3D Model Display */}
                      <div
                        className="relative w-full h-36 sm:h-44 rounded-xl mb-4 overflow-hidden flex items-center justify-center"
                        style={{
                          background: `radial-gradient(ellipse at center, ${starter.colorLight}33 0%, ${starter.colorDark}22 60%, transparent 80%)`,
                        }}
                      >
                        {/* Animated glow ring */}
                        <motion.div
                          className="absolute w-28 h-28 rounded-full"
                          style={{
                            background: `radial-gradient(circle, ${starter.color}44 0%, transparent 70%)`,
                          }}
                          animate={{
                            scale: [1, 1.15, 1],
                            opacity: [0.5, 0.8, 0.5],
                          }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        />

                        {/* Pokémon Sphere Body */}
                        <div className="relative z-10 flex flex-col items-center">
                          <motion.div
                            className="relative"
                            animate={isHovered ? { y: -4 } : { y: 0 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                          >
                            {/* Main body */}
                            <div
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full shadow-xl flex items-center justify-center"
                              style={{ backgroundColor: starter.color }}
                            >
                              <span className="text-3xl sm:text-4xl">{starter.emoji}</span>
                            </div>
                            {/* Sparkle effects on hover */}
                            {isHovered && (
                              <motion.div
                                className="absolute -top-2 -right-2"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                              >
                                <Sparkles size={16} className="text-yellow-300" />
                              </motion.div>
                            )}
                          </motion.div>

                          {/* Number badge */}
                          <span className="mt-2 text-[10px] font-black text-slate-500 tracking-wider">
                            {starter.num}
                          </span>
                        </div>
                      </div>

                      {/* Name */}
                      <h2
                        className="text-lg sm:text-xl font-black text-white text-center tracking-wide mb-2"
                        style={{ textShadow: isSelected ? `0 0 20px ${starter.color}66` : 'none' }}
                      >
                        {starter.name}
                      </h2>

                      {/* Type Badges */}
                      <div className="flex justify-center gap-2 mb-3">
                        {starter.types.map((type) => {
                          const badge = TYPE_BADGES[type] || { color: '#888', textColor: '#fff' };
                          return (
                            <span
                              key={type}
                              className="text-[9px] sm:text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider"
                              style={{ backgroundColor: badge.color, color: badge.textColor }}
                            >
                              {type}
                            </span>
                          );
                        })}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-400 text-center leading-relaxed mb-4 line-clamp-2">
                        {starter.description}
                      </p>

                      {/* Stats bar */}
                      <div className="flex justify-center gap-3 mb-4 text-[10px]">
                        <div className="flex flex-col items-center gap-1">
                          <Heart size={12} className="text-red-400" />
                          <span className="font-black text-slate-300">{starter.hp}</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <Swords size={12} className="text-orange-400" />
                          <span className="font-black text-slate-300">{starter.statAttack}</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <Shield size={12} className="text-blue-400" />
                          <span className="font-black text-slate-300">{starter.statDefense}</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <Zap size={12} className="text-yellow-400" />
                          <span className="font-black text-slate-300">{starter.statSpeed}</span>
                        </div>
                      </div>

                      {/* Moves */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block text-center">
                          Starting Moves
                        </span>
                        {starter.moves.map((move) => (
                          <div
                            key={move.name}
                            className="flex items-center justify-between bg-slate-950/60 rounded-lg px-3 py-1.5 border border-slate-800"
                          >
                            <span className="text-[11px] font-bold text-slate-200">{move.name}</span>
                            <span className="text-[10px] font-black text-slate-400">
                              {move.power > 0 ? `POW ${move.power}` : '---'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Action buttons */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <button
                className={`
                  px-8 py-3.5 rounded-xl font-black text-sm tracking-widest uppercase transition-all duration-300
                  ${selectedStarter && !confirmed
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-[0_8px_24px_rgba(16,185,129,0.3)] hover:shadow-[0_12px_32px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95 cursor-pointer'
                    : confirmed
                      ? 'bg-emerald-600 text-white cursor-wait animate-pulse'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }
                `}
                onClick={handleConfirm}
                disabled={!selectedStarter || confirmed}
              >
                {confirmed ? (
                  <span className="flex items-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      ⚡
                    </motion.span>
                    RELEASING PARTNER...
                  </span>
                ) : selectedStarter ? (
                  <span className="flex items-center gap-2">
                    <Sparkles size={16} className="animate-pulse" />
                    CONFIRM {selectedStarter}
                  </span>
                ) : (
                  'SELECT A POKÉMON'
                )}
              </button>

              {!selectedStarter && (
                <button
                  className="px-6 py-3 rounded-xl font-black text-xs tracking-widest uppercase text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700 border border-slate-700/60 transition-all cursor-pointer"
                  onClick={handleClose}
                >
                  LEAVE LAB
                </button>
              )}
            </motion.div>

            {/* Footer */}
            <div className="text-center mt-6">
              <p className="text-[9px] text-slate-600 font-bold tracking-wider">
                PROFESSOR OAK PRESENTS &bull; PALLET TOWN POKÉMON RESEARCH LAB
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
