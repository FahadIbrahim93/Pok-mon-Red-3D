import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../../store/gameStore';
import { Heart, Activity } from 'lucide-react';

const POKEMON_CENTER_PINK = '#f783ac';
const POKEMON_CENTER_BG = '#212529';
const HEAL_DURATION = 2800; // total ms for the healing animation

export function PokemonCenterAnimation() {
  const centerHealing = useGameStore((state) => state.centerHealing);
  const party = useGameStore((state) => state.party);
  const actions = useGameStore((state) => state.actions);
  const [visible, setVisible] = useState(false);
  const [healingPhase, setHealingPhase] = useState<'intro' | 'healing' | 'done'>('intro');
  const [sparklePositions, setSparklePositions] = useState<{ id: number; x: number; y: number; delay: number; size: number }[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const healTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sparkleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (centerHealing === 'HEALING') {
      setVisible(true);
      setHealingPhase('intro');
      setSparklePositions([]);

      // Generate random sparkle positions for the healing beams
      const sparkles = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: 60 + Math.random() * 30, // start from bottom area
        delay: Math.random() * 1.5,
        size: 4 + Math.random() * 8,
      }));
      setSparklePositions(sparkles);

      // Phase 1: Intro fade (600ms)
      const introTimer = setTimeout(() => {
        setHealingPhase('healing');
      }, 600);

      // Phase 2: After healing duration, call healAllPokemon
      healTimerRef.current = setTimeout(() => {
        setHealingPhase('done');
        actions.healAllPokemon();
      }, HEAL_DURATION);

      timerRef.current = introTimer;

      // No interval needed — sparkles animate purely via framer-motion keyframes      } else if (centerHealing === 'DONE') {
        // Stay visible briefly as dialogue appears, then fade out
        const doneTimer = setTimeout(() => {
          setVisible(false);
          actions.setCenterHealing('IDLE');
        }, 500);
        timerRef.current = doneTimer;
    } else {
      setVisible(false);
      setHealingPhase('intro');
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (healTimerRef.current) clearTimeout(healTimerRef.current);
      if (sparkleTimerRef.current) clearInterval(sparkleTimerRef.current);
    };
  }, [centerHealing, actions]);

  // Get party member colors for the Poké Balls on the machine
  const partyColors = party.slice(0, 6).map((p) => p.color);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Dark gradient background */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-pink-950/80" />

          {/* Subtle pink radial glow */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-pink-500/20 blur-3xl animate-pulse" />
          </div>

          {/* Scanning beam effect */}
          <motion.div
            className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-pink-400 to-transparent"
            initial={{ top: '30%', opacity: 0 }}
            animate={{
              top: ['30%', '70%', '30%'],
              opacity: [0, 0.8, 0.6, 0.8, 0],
            }}
            transition={{
              duration: 2.2,
              repeat: 1,
              ease: 'easeInOut',
            }}
          />

          {/* Main healing machine */}
          <motion.div
            className="relative z-10 flex flex-col items-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {/* Machine base - large rectangular platform */}
            <div className="relative w-[320px] sm:w-[420px] bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border-2 border-pink-400/40 shadow-[0_0_40px_rgba(236,72,153,0.15)] overflow-hidden">
              {/* Glowing top strip */}
              <div className="h-2 bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 w-full" />

              {/* Machine header */}
              <div className="px-6 py-4 border-b border-pink-400/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity size={16} className="text-pink-400" />
                    <span className="text-pink-300 font-black text-xs tracking-widest uppercase">Pokémon Recovery System</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <motion.span
                      className="w-2 h-2 rounded-full bg-green-400"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                    <span className="text-green-400 text-[10px] font-black">ONLINE</span>
                  </div>
                </div>
              </div>

              {/* Healing chamber - where Poké Balls sit */}
              <div className="px-6 py-6">
                <div className="bg-slate-950/60 rounded-xl border border-pink-400/20 p-6 relative min-h-[180px]">
                  {/* Grid of slots for Poké Balls */}
                  <div className="grid grid-cols-3 gap-4 justify-items-center">
                    {partyColors.slice(0, 6).map((color, idx) => (
                      <motion.div
                        key={idx}
                        className="relative"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{
                          y: healingPhase === 'healing' ? [0, -3, 2, -1, 0] : 0,
                          opacity: 1,
                        }}
                        transition={{
                          y: healingPhase === 'healing'
                            ? { duration: 0.6, delay: idx * 0.15, repeat: 1, ease: 'easeInOut' }
                            : { duration: 0.3, delay: idx * 0.08 },
                          opacity: { duration: 0.3, delay: idx * 0.08 },
                        }}
                      >
                        {/* Poké Ball */}
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-red-500 via-red-400 to-white border-2 border-zinc-700 shadow-lg relative overflow-hidden">
                          {/* Center band */}
                          <div className="absolute top-1/2 left-0 right-0 h-[3px] bg-zinc-800" />
                          {/* Center button */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-zinc-200 border border-zinc-400 shadow-inner">
                            <motion.div
                              className="w-full h-full rounded-full bg-white"
                              animate={healingPhase === 'healing' ? { scale: [1, 1.3, 1] } : {}}
                              transition={{ duration: 0.8, delay: idx * 0.15, repeat: healingPhase === 'healing' ? 2 : 0 }}
                            />
                          </div>
                          {/* Inner glow when healing */}
                          {healingPhase === 'healing' && (
                            <motion.div
                              className="absolute inset-0 rounded-full"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0, 0.6, 0.3, 0.8, 0.2] }}
                              transition={{ duration: 1.5, delay: idx * 0.15, repeat: 1 }}
                              style={{
                                background: `radial-gradient(circle at 50% 50%, ${color}40, transparent)`,
                              }}
                            />
                          )}
                        </div>
                        {/* Pokémon name label */}
                        <div className="text-center mt-1">
                          <span className="text-[8px] text-slate-400 font-black uppercase tracking-tight">
                            {party[idx]?.name.slice(0, 8) || '---'}
                          </span>
                        </div>
                        {/* Floating heart over healed Pokémon */}
                        {healingPhase === 'healing' && (
                          <motion.div
                            className="absolute -top-4 left-1/2 -translate-x-1/2"
                            initial={{ y: 0, opacity: 0, scale: 0 }}
                            animate={{ y: -20, opacity: [0, 1, 0], scale: [0, 1.2, 0] }}
                            transition={{ duration: 1.2, delay: idx * 0.15 + 0.6, repeat: 1 }}
                          >
                            <Heart size={14} className="text-pink-400 fill-pink-400" />
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Healing beams rising up */}
                  {healingPhase === 'healing' && sparklePositions.map((s) => (
                    <motion.div
                      key={s.id}
                      className="absolute pointer-events-none"
                      initial={{
                        left: `${s.x}%`,
                        top: `${s.y}%`,
                        opacity: 0,
                        scale: 0,
                      }}
                      animate={{
                        top: ['60%', '10%'],
                        left: `${s.x + (Math.random() - 0.5) * 10}%`,
                        opacity: [0, 0.9, 0.4, 0],
                        scale: [0, 1, 0.5, 0],
                      }}
                      transition={{
                        duration: 1.5 + Math.random(),
                        delay: s.delay,
                        repeat: 1,
                        ease: 'easeOut',
                      }}
                    >
                      <div
                        className="rounded-full"
                        style={{
                          width: s.size,
                          height: s.size,
                          background: `radial-gradient(circle, ${['#f783ac', '#ff6b6b', '#da77f2', '#748ffc', '#38d9a9'][s.id % 5]}, transparent)`,
                          boxShadow: `0 0 8px 2px ${['#f783ac80', '#ff6b6b80', '#da77f280', '#748ffc80', '#38d9a980'][s.id % 5]}`,
                        }}
                      />
                    </motion.div>
                  ))}

                  {/* Central healing energy column */}
                  {healingPhase === 'healing' && (
                    <motion.div
                      className="absolute left-1/2 top-0 -translate-x-1/2 w-[2px] h-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.6, 0.3, 0.5, 0] }}
                      transition={{ duration: 2, repeat: 1 }}
                      style={{
                        background: 'linear-gradient(to bottom, transparent, #f783ac, #ff6b6b, #f783ac, transparent)',
                        boxShadow: '0 0 12px 4px rgba(247,131,172,0.3)',
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Machine status bar at bottom */}
              <div className="px-6 py-3 border-t border-pink-400/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {healingPhase === 'intro' && (
                    <span className="text-yellow-400 text-[10px] font-black animate-pulse">
                      INITIALIZING RECOVERY SEQUENCE...
                    </span>
                  )}
                  {healingPhase === 'healing' && (
                    <div className="flex items-center gap-1.5">
                      <motion.span
                        className="text-green-400 text-[10px] font-black"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                      >
                        RESTORING
                      </motion.span>
                      <motion.div
                        className="h-2 w-24 bg-slate-800 rounded-full overflow-hidden border border-slate-700"
                      >
                        <motion.div
                          className="h-full bg-gradient-to-r from-pink-500 via-rose-400 to-green-400 rounded-full"
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 2.2, ease: 'easeInOut' }}
                        />
                      </motion.div>
                      <span className="text-green-400 text-[10px] font-black">HP</span>
                    </div>
                  )}
                  {healingPhase === 'done' && (
                    <span className="text-green-400 text-[10px] font-black flex items-center gap-1">
                      <Heart size={10} className="fill-green-400" />
                      RECOVERY COMPLETE
                    </span>
                  )}
                </div>
                <div className="text-[9px] text-slate-500 font-mono">
                  {party.length}/6 SLOTS
                </div>
              </div>
            </div>

            {/* Nurse Joy portrait - below/alongside the machine */}
            <motion.div
              className="mt-4 flex items-center gap-3 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-pink-400/30 px-5 py-3 shadow-lg"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {/* Nurse Joy CSS portrait */}
              <div className="relative w-14 h-14 rounded-full bg-gradient-to-b from-pink-300 to-pink-100 border-2 border-pink-400 overflow-hidden flex-shrink-0">
                {/* Nurse cap */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-5 bg-white rounded-b-lg border-b-2 border-pink-300 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                </div>
                {/* Face */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
                  {/* Eyes */}
                  <div className="flex gap-3 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                  </div>
                  {/* Smile */}
                  <div className="w-3 h-1.5 rounded-b-full bg-rose-300 mt-0.5" />
                </div>
                {/* Nurse uniform collar */}
                <div className="absolute bottom-0 w-full h-4 bg-pink-200 flex justify-center">
                  <div className="w-1 h-2 bg-pink-400 rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-pink-400 text-[10px] font-black uppercase tracking-widest">Nurse Joy</span>
                  {healingPhase === 'healing' && (
                    <motion.span
                      className="text-xs"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                    >
                      ✨
                    </motion.span>
                  )}
                </div>
                <p className="text-slate-300 text-xs font-bold mt-0.5">
                  {healingPhase === 'intro' && "Just a moment, please! We'll take good care of your Pokémon!"}
                  {healingPhase === 'healing' && "Scanning vitals... Applying restorative energy..."}
                  {healingPhase === 'done' && "All done! Your Pokémon are as good as new!"}
                </p>
              </div>
            </motion.div>

            {/* Floating hearts background */}
            {healingPhase === 'healing' && Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={`heart-${i}`}
                className="absolute pointer-events-none"
                initial={{
                  left: `${20 + Math.random() * 60}%`,
                  bottom: '20%',
                  opacity: 0,
                  scale: 0,
                }}
                animate={{
                  bottom: ['20%', '90%'],
                  opacity: [0, 0.8, 0.3, 0],
                  scale: [0, 1.2, 0.8, 0],
                }}
                transition={{
                  duration: 2 + Math.random(),
                  delay: 0.5 + Math.random() * 1.5,
                  repeat: 0,
                  ease: 'easeOut',
                }}
              >
                <Heart
                  size={10 + Math.random() * 14}
                  className="text-pink-400/60"
                  style={{ fill: '#f783ac40' }}
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
