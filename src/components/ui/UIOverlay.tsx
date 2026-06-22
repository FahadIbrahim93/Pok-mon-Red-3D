import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Sparkles, Backpack, Swords, HelpCircle, Clock, Sun, Moon, CloudSun, Sunset } from 'lucide-react';
import { DialogueBox } from './DialogueBox';
import { PokemonCenterAnimation } from './PokemonCenterAnimation';

export function UIOverlay() {
  const dialogue = useGameStore((state) => state.dialogue);
  const actions = useGameStore((state) => state.actions);
  const mode = useGameStore((state) => state.mode);
  const party = useGameStore((state) => state.party);
  const potions = useGameStore((state) => state.potions);

  const activePokemon = party[0] || null;
  const bicycleActive = useGameStore((state) => state.bicycleActive);

  // Replicate ThreeJS clock timing to display live in-game time
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let animationId: number;
    const start = performance.now();
    const update = () => {
      setElapsedTime((performance.now() - start) / 1000);
      animationId = requestAnimationFrame(update);
    };
    animationId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationId);
  }, []);

  const cycleDuration = 90; // 90 real seconds = 24 in-game hours
  const progress = (elapsedTime % cycleDuration) / cycleDuration;
  const hour = progress * 24;

  const totalInGameMinutes = Math.floor(hour * 60);
  const displayHour24 = Math.floor(hour);
  const displayMinutes = totalInGameMinutes % 60;
  const isAm = displayHour24 < 12;
  const displayHour12 = displayHour24 % 12 === 0 ? 12 : displayHour24 % 12;
  const timeString = `${displayHour12.toString().padStart(2, '0')}:${displayMinutes.toString().padStart(2, '0')} ${isAm ? 'AM' : 'PM'}`;

  let phaseText = "BRIGHT NOON";
  let phaseIcon = <Sun size={13} className="text-cyan-300 animate-spin" style={{ animationDuration: '12s' }} />;
  let phaseBadgeColor = "text-cyan-300 border-cyan-500/30 bg-cyan-950/40";

  if (hour < 4.8 || hour >= 20) {
    phaseText = "STARLIT NIGHT";
    phaseIcon = <Moon size={13} className="text-indigo-400 animate-bounce" />;
    phaseBadgeColor = "text-indigo-300 border-indigo-500/30 bg-indigo-950/40";
  } else if (hour < 6.5) {
    phaseText = "DAWN SUNBURST";
    phaseIcon = <CloudSun size={13} className="text-orange-400 animate-pulse" />;
    phaseBadgeColor = "text-orange-300 border-orange-500/30 bg-orange-950/40";
  } else if (hour < 11.0) {
    phaseText = "GOLDEN SUNRISE";
    phaseIcon = <Sun size={13} className="text-yellow-300 animate-pulse" />;
    phaseBadgeColor = "text-yellow-300 border-yellow-500/30 bg-yellow-950/40";
  } else if (hour < 16.5) {
    phaseText = "BRIGHT NOON";
    phaseIcon = <Sun size={13} className="text-cyan-300 animate-spin" style={{ animationDuration: '12s' }} />;
    phaseBadgeColor = "text-cyan-300 border-cyan-500/30 bg-cyan-950/40";
  } else if (hour < 18.2) {
    phaseText = "GOLDEN HOUR";
    phaseIcon = <CloudSun size={13} className="text-amber-400" />;
    phaseBadgeColor = "text-amber-300 border-amber-500/30 bg-amber-950/40";
  } else {
    phaseText = "FIERY SUNSET";
    phaseIcon = <Sunset size={13} className="text-rose-400" />;
    phaseBadgeColor = "text-rose-300 border-rose-500/30 bg-rose-950/40";
  }

  if (mode !== 'OVERWORLD') return null;

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-5 z-20 w-full h-full text-zinc-100 font-mono">
      
      {/* Top Bar with Live HUD and Instructions */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-start gap-4 pointer-events-auto">
        
        {/* Playful Kanto Handheld Instructions Block */}
        <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-slate-700/60 max-w-xs transform hover:scale-105 transition-transform">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="font-black text-xs text-rose-400 tracking-wider">3D POKéMON SYSTEM</span>
          </div>
          <h1 className="font-black text-xl text-white mb-1.5 tracking-tight">PALLET TOWN</h1>
          
          {/* Realtime aesthetic climate status row */}
          <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded-xl border border-slate-800/80 mb-3 select-none">
            <div className="flex items-center gap-1.5">
              <Clock size={13} className="text-slate-400 animate-pulse" />
              <span className="text-slate-200 font-extrabold text-xs tracking-wider">{timeString}</span>
            </div>
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[9px] font-black tracking-wide ${phaseBadgeColor}`}>
              {phaseIcon}
              <span>{phaseText}</span>
            </div>
          </div>
          
          <div className="space-y-1 text-xs text-slate-300 font-bold">
            <div className="flex justify-between border-b border-slate-800 pb-1">
              <span className="text-slate-400">WALK:</span>
              <span>W, A, S, D / ARROWS</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1">
              <span className="text-slate-400">INTERACT:</span>
              <span>Z / ENTER / SPACE</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
            🌿 Walk into <span className="text-green-400 font-black">Tall Grass</span> to encounter wild Pokémon!
          </p>
        </div>

        {/* Live Partner HUD Card for the Active Pokémon */}
        {activePokemon && (
          <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-slate-700/60 min-w-[240px] transform hover:scale-105 transition-transform flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full animate-bounce" style={{ backgroundColor: activePokemon.color }} />
                <span className="font-extrabold uppercase text-white tracking-wider">{activePokemon.name}</span>
              </div>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded font-black text-slate-300 border border-slate-700">Lv{activePokemon.level}</span>
            </div>

            {/* Health Bar Slider */}
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 font-black mb-1">
                <span>HEALTH METER</span>
                <span className="text-slate-200">{activePokemon.hp} / {activePokemon.maxHp} HP</span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div 
                  className="h-full rounded-full bg-[#40c057] transition-all duration-300"
                  style={{ width: `${(activePokemon.hp / activePokemon.maxHp) * 100}%` }}
                />
              </div>
            </div>

            {/* Quick status counter summary & interactive Bag trigger */}
            <div className="flex flex-col gap-2 mt-2 border-t border-slate-800/60 pt-2 text-[10px]">
              <div className="flex items-center justify-between text-slate-400 font-bold">
                <div className="flex items-center gap-1">
                  <Swords size={12} className="text-red-400" />
                  <span>STATUS: COMBAT READY</span>
                </div>
                {bicycleActive && (
                  <span className="text-yellow-400 animate-pulse font-black">🚴 ACTIVE BIKE</span>
                )}
              </div>
              
              <button 
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-bag'));
                }}
                className="flex items-center justify-between text-[10px] text-amber-300 font-black w-full bg-slate-950 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-800/80 transition-all pointer-events-auto cursor-pointer shadow-inner hover:scale-[1.02]"
              >
                <span className="flex items-center gap-1.5">
                  <Backpack size={12} className="text-[#fab005] animate-bounce" />
                  <span>OPEN BAG (INVENTORY)</span>
                </span>
                <span className="bg-slate-905 px-2 py-0.5 rounded text-white border border-slate-800 font-black">PRESS [I]</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Modular Dialogue System with character portraits and typewriter effects */}
      <DialogueBox />
      <PokemonCenterAnimation />
    </div>
  );
}
