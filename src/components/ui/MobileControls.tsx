import { useEffect, useState, useRef } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Backpack, 
  Trophy 
} from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { soundManager } from '../../game/soundManager';

export function MobileControls() {
  const dialogue = useGameStore((state) => state.dialogue);
  const mode = useGameStore((state) => state.mode);
  
  const [activeDir, setActiveDir] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const simulateKey = (key: string) => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key }));
  };

  // Continuous pointer down moving logic
  useEffect(() => {
    if (!activeDir) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Fire immediately
    simulateKey(activeDir);

    // Repeat at high speed (every 60ms) to check if player can make next tile step
    timerRef.current = setInterval(() => {
      const state = useGameStore.getState();
      if (state.mode === 'BATTLE' || state.dialogue) {
        setActiveDir(null);
        return;
      }
      simulateKey(activeDir);
    }, 60);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [activeDir]);

  // Handle battle controls separately or do not render overworld controls in battle
  if (mode !== 'OVERWORLD') return null;

  return (
    <div className={`md:hidden fixed bottom-4 left-3 right-3 flex flex-col gap-3 pointer-events-none transition-all duration-300 z-30 ${dialogue ? 'opacity-30 scale-[0.98]' : 'opacity-100'}`}>
      
      {/* Central Option Keys: Game Console Menu Bar */}
      <div className="flex justify-center w-full">
        <div className="flex bg-slate-900/95 backdrop-blur-md px-4 py-2.5 rounded-full border-2 border-slate-700/60 shadow-[0_8px_24px_rgba(0,0,0,0.5)] pointer-events-auto items-center gap-6">
          
          {/* Pokédex */}
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-pokedex'));
            }}
            className="flex flex-col items-center justify-center gap-1 active:scale-90 transition-all cursor-pointer text-slate-300"
          >
            <div className="p-2 bg-red-600 active:bg-red-700 rounded-full border border-red-400/30 text-white shadow-md">
              <BookOpen size={14} />
            </div>
            <span className="text-[9px] font-black tracking-widest uppercase">DEX</span>
          </button>

          {/* Divider */}
          <div className="w-0.5 h-5 bg-slate-800" />

          {/* Trainer Bag */}
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-bag'));
            }}
            className="flex flex-col items-center justify-center gap-1 active:scale-90 transition-all cursor-pointer text-slate-300 animate-pulse"
          >
            <div className="p-2 bg-amber-500 active:bg-amber-600 rounded-full border border-amber-450/30 text-white shadow-md">
              <Backpack size={14} />
            </div>
            <span className="text-[9px] font-black tracking-widest uppercase text-amber-350">BAG</span>
          </button>

          {/* Divider */}
          <div className="w-0.5 h-5 bg-slate-800" />

          {/* Quest Log */}
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-quests'));
            }}
            className="flex flex-col items-center justify-center gap-1 active:scale-90 transition-all cursor-pointer text-slate-300"
          >
            <div className="p-2 bg-teal-600 active:bg-teal-700 rounded-full border border-teal-450/30 text-white shadow-md">
              <Trophy size={14} />
            </div>
            <span className="text-[9px] font-black tracking-widest uppercase">QUESTS</span>
          </button>

        </div>
      </div>

      {/* Main joystick and primary control action layout */}
      <div className="flex justify-between items-end w-full">
        
        {/* Sleek dpad design layout */}
        <div className="flex flex-col items-center justify-center p-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border-2 border-slate-700/60 shadow-[0_12px_24px_rgba(0,0,0,0.5)] pointer-events-auto">
          
          {/* Tactile D-PAD cross */}
          <div className="relative w-28 h-28 flex items-center justify-center bg-slate-950 rounded-full border-4 border-slate-800">
            
            {/* Inner cross center cosmetic divider */}
            <div className="absolute w-8 h-8 bg-slate-900 rounded-lg z-0 pointer-events-none border border-slate-800/50" />

            {/* D-PAD UP */}
            <button 
              onPointerDown={(e) => { e.preventDefault(); setActiveDir('w'); }} 
              onPointerUp={() => setActiveDir(null)}
              onPointerLeave={() => setActiveDir(null)}
              onPointerCancel={() => setActiveDir(null)}
              className="absolute top-1 w-9 h-9 bg-slate-800 border-b-4 border-slate-950 rounded-t-lg hover:bg-slate-700 active:bg-indigo-650 transition-colors flex items-center justify-center text-slate-100 shadow-md touch-none"
            >
              <ChevronUp size={20} className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
            </button>

            {/* D-PAD LEFT */}
            <button 
              onPointerDown={(e) => { e.preventDefault(); setActiveDir('a'); }} 
              onPointerUp={() => setActiveDir(null)}
              onPointerLeave={() => setActiveDir(null)}
              onPointerCancel={() => setActiveDir(null)}
              className="absolute left-1 w-9 h-9 bg-slate-800 border-r-4 border-slate-950 rounded-l-lg hover:bg-slate-700 active:bg-indigo-650 transition-colors flex items-center justify-center text-slate-100 shadow-md touch-none"
            >
              <ChevronLeft size={20} className="drop-shadow-[1px_0_2px_rgba(0,0,0,0.5)]" />
            </button>

            {/* D-PAD RIGHT */}
            <button 
              onPointerDown={(e) => { e.preventDefault(); setActiveDir('d'); }} 
              onPointerUp={() => setActiveDir(null)}
              onPointerLeave={() => setActiveDir(null)}
              onPointerCancel={() => setActiveDir(null)}
              className="absolute right-1 w-9 h-9 bg-slate-800 border-l-4 border-slate-950 rounded-r-lg hover:bg-slate-700 active:bg-indigo-650 transition-colors flex items-center justify-center text-slate-100 shadow-md touch-none"
            >
              <ChevronRight size={20} className="drop-shadow-[-1px_0_2px_rgba(0,0,0,0.5)]" />
            </button>

            {/* D-PAD DOWN */}
            <button 
              onPointerDown={(e) => { e.preventDefault(); setActiveDir('s'); }} 
              onPointerUp={() => setActiveDir(null)}
              onPointerLeave={() => setActiveDir(null)}
              onPointerCancel={() => setActiveDir(null)}
              className="absolute bottom-1 w-9 h-9 bg-slate-800 border-t-4 border-slate-950 rounded-b-lg hover:bg-slate-700 active:bg-indigo-650 transition-colors flex items-center justify-center text-slate-100 shadow-md touch-none"
            >
              <ChevronDown size={20} className="drop-shadow-[0_-1px_2px_rgba(0,0,0,0.5)]" />
            </button>

          </div>
        </div>

        {/* Primary Console Action Buttons */}
        <div className="flex gap-3 p-3 rounded-2xl bg-slate-900/90 backdrop-blur-md border-2 border-slate-700/60 shadow-[0_12px_24px_rgba(0,0,0,0.5)] pointer-events-auto transform skew-y-[-2deg]">
           
           {/* Button B: Cancel / Run */}
           <div className="flex flex-col items-center gap-1">
             <button 
               onPointerDown={(e) => { e.preventDefault(); simulateKey('x'); }} 
               className="bg-sky-600 hover:bg-sky-500 text-sky-100 font-extrabold text-xl h-12 w-12 rounded-full border-2 border-sky-450/40 shadow-[0_4px_0_#0284c7,0_6px_8px_rgba(0,0,0,0.6)] active:shadow-none active:translate-y-[4px] active:bg-sky-700 transition-all flex items-center justify-center select-none touch-none"
               aria-label="Action B"
             >
               B
             </button>
             <span className="text-[8px] text-slate-400 font-black tracking-widest uppercase">CANCEL</span>
           </div>

           {/* Button A: Talk / Accept */}
           <div className="flex flex-col items-center gap-1 -translate-y-3">
             <button 
               onPointerDown={(e) => { e.preventDefault(); simulateKey('z'); }} 
               className="bg-rose-600 hover:bg-rose-500 text-rose-100 font-extrabold text-xl h-12 w-12 rounded-full border-2 border-rose-450/40 shadow-[0_4px_0_#e11d48,0_6px_8px_rgba(0,0,0,0.6)] active:shadow-none active:translate-y-[4px] active:bg-rose-700 transition-all flex items-center justify-center select-none touch-none"
               aria-label="Action A"
             >
               A
             </button>
             <span className="text-[8px] text-slate-400 font-black tracking-widest uppercase">TALK / OK</span>
           </div>

        </div>

      </div>

    </div>
  );
}
