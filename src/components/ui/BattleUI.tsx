import { useEffect, useState } from 'react';
import { useGameStore, Move } from '../../store/gameStore';
import { ChevronRight, ShieldAlert, Zap, Swords, Sparkles, Heart } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { PokemonModel } from '../3d/PokemonModel';

export function BattleUI() {
  const mode = useGameStore(state => state.mode);
  const battle = useGameStore(state => state.battle);
  const party = useGameStore(state => state.party);
  const potions = useGameStore(state => state.potions);
  const pokeballs = useGameStore(state => state.pokeballs);
  const actions = useGameStore(state => state.actions);
  
  const [cursorIdx, setCursorIdx] = useState(0);

  // High fidelity state for visual effects
  const [playerDamaged, setPlayerDamaged] = useState(false);
  const [opponentDamaged, setOpponentDamaged] = useState(false);
  const [screenFlash, setScreenFlash] = useState(false);
  const [activeCombatEffect, setActiveCombatEffect] = useState<string | null>(null);
  
  // Floating numbers state
  const [floater, setFloater] = useState<{ text: string; isHeal: boolean; key: number } | null>(null);

  const activePokemon = party[battle.playerActiveIndex];
  const { opponent, menuState, log, turn } = battle;

  const triggerFloater = (text: string, isHeal: boolean) => {
    setFloater({ text, isHeal, key: Date.now() });
  };

  useEffect(() => {
    if (mode !== 'BATTLE') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (turn !== 'PLAYER') return;
      if (log.length > 0) {
        if (e.key === 'z' || e.key === ' ' || e.key === 'Enter') {
            actions.shiftBattleLog();
        }
        return;
      }

      let maxIdx = 0;
      if (menuState === 'MAIN') maxIdx = 3;
      if (menuState === 'FIGHT') maxIdx = activePokemon.moves.length - 1;
      if (menuState === 'ITEM') maxIdx = 1;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          setCursorIdx(curr => Math.max(0, curr - (menuState === 'FIGHT' ? 1 : (menuState === 'ITEM' ? 1 : 2))));
          break;
        case 'ArrowDown':
        case 's':
          setCursorIdx(curr => Math.min(maxIdx, curr + (menuState === 'FIGHT' ? 1 : (menuState === 'ITEM' ? 1 : 2))));
          break;
        case 'ArrowLeft':
        case 'a':
          if (menuState === 'MAIN') setCursorIdx(curr => Math.max(0, curr - 1));
          break;
        case 'ArrowRight':
        case 'd':
          if (menuState === 'MAIN') setCursorIdx(curr => Math.min(maxIdx, curr + 1));
          break;
        case 'x':
        case 'Backspace':
          if (menuState !== 'MAIN') {
             actions.setBattleMenuState('MAIN');
             setCursorIdx(0);
          }
          break;
        case 'z':
        case ' ':
        case 'Enter':
          handleSelect();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, turn, log, menuState, cursorIdx, activePokemon]);

  // OPPONENT turn logic
  useEffect(() => {
      if (mode === 'BATTLE' && turn === 'OPPONENT') {
          const timer = setTimeout(() => {
              if (opponent) {
                  const move = opponent.moves[Math.floor(Math.random() * opponent.moves.length)];
                  actions.addBattleLog(`Enemy ${opponent.name} used ${move.name}!`);
                  
                  setTimeout(() => {
                      // Trigger Flash & Shake player
                      setScreenFlash(true);
                      setPlayerDamaged(true);
                      triggerFloater(`-${move.power} HP`, false);
                      setActiveCombatEffect('scratch');

                      setTimeout(() => {
                        setScreenFlash(false);
                        setPlayerDamaged(false);
                        setActiveCombatEffect(null);
                      }, 400);

                      actions.applyDamage('PLAYER', move.power);
                      const state = useGameStore.getState();
                      const p = state.party[state.battle.playerActiveIndex];
                      
                      if (p.hp <= 0) {
                          setTimeout(() => {
                            actions.addBattleLog(`${p.name} fainted! You blacked out!`);
                            setTimeout(() => {
                                actions.endBattle();
                            }, 2000);
                          }, 500);
                      } else {
                          actions.setTurn('PLAYER');
                          actions.setBattleMenuState('MAIN');
                          setCursorIdx(0);
                      }
                  }, 1200);
              }
          }, 800);
          return () => clearTimeout(timer);
      }
  }, [mode, turn, opponent]);

  const handleSelect = () => {
      if (menuState === 'MAIN') {
          if (cursorIdx === 0) { 
            actions.setBattleMenuState('FIGHT'); 
            setCursorIdx(0); 
          } else if (cursorIdx === 1) { 
            actions.addBattleLog("There's no time to switch Pokémon!");
          } else if (cursorIdx === 2) { 
            // Enter Bag Submenu
            actions.setBattleMenuState('ITEM'); 
            setCursorIdx(0);
          } else if (cursorIdx === 3) { // RUN
             actions.addBattleLog("Got away safely!");
             setTimeout(() => { actions.endBattle(); }, 1500);
          }
      } else if (menuState === 'ITEM') {
          if (cursorIdx === 0) { // POTION
             if (potions > 0) {
                 actions.usePotion();
                 actions.healPlayer(20);
                 triggerFloater(`+20 HP`, true);
                 setActiveCombatEffect('heal-sparkle');
                 setTimeout(() => setActiveCombatEffect(null), 800);
                 actions.addBattleLog(`You used a POTION! ${activePokemon.name} recovered HP!`);
                 actions.setTurn('OPPONENT');
             } else {
                 actions.addBattleLog("You don't have any POTIONs left!");
             }
          } else if (cursorIdx === 1) { // POKéBALL
             if (pokeballs > 0) {
                 // Trigger full pokeball throw sequence in core store
                 actions.usePokeball();
                 
                 // Shake & capture flash animations
                 setActiveCombatEffect('pokeball-aura');
                 setTimeout(() => {
                   setActiveCombatEffect(null);
                   const finalState = useGameStore.getState();
                   // If successfully captured, the opponent will be added to team and end battle soon 
                   const didCatch = finalState.party.some(pk => pk.name === opponent.name && pk.id !== activePokemon.id);
                   if (didCatch || (finalState.pokedex[opponent.name]?.caught)) {
                     // captured successfully! End combat gracefully after logs cleared
                     setTimeout(() => {
                       actions.endBattle();
                     }, 3000);
                   }
                 }, 2500);
             } else {
                 actions.addBattleLog("You don't have any POKéBALLs left!");
             }
          }
      } else if (menuState === 'FIGHT') {
          const move = activePokemon.moves[cursorIdx];
          actions.addBattleLog(`${activePokemon.name} used ${move.name}!`);
          actions.setTurn('END'); // wait for damage

          setTimeout(() => {
             // Shake opponent, trigger flash of screen
             setScreenFlash(true);
             setOpponentDamaged(true);
             triggerFloater(`-${move.power} HP`, false);
             setActiveCombatEffect(move.type === 'FIRE' ? 'fire-burst' : 'slash-spark');

             setTimeout(() => {
               setScreenFlash(false);
               setOpponentDamaged(false);
               setActiveCombatEffect(null);
             }, 500);

             actions.applyDamage('OPPONENT', move.power);
             const state = useGameStore.getState();
             
             if (state.battle.opponent && state.battle.opponent.hp <= 0) {
                 setTimeout(() => {
                   actions.addBattleLog(`Enemy ${state.battle.opponent.name} fainted!`);
                   
                   // Gaining victory level-up & evolving experience!
                   actions.gainVictory();
                   
                   setTimeout(() => { 
                     actions.endBattle(); 
                   }, 3200);
                 }, 400);
             } else {
                 actions.setTurn('OPPONENT');
             }
          }, 1200);
      }
  };

  if (mode !== 'BATTLE' || !opponent) return null;

  const currentLog = log.length > 0 ? log[0] : null;

  // Compute color based on HP percentage
  const getHpColor = (hp: number, max: number) => {
    const ratio = hp / max;
    if (ratio > 0.5) return 'bg-[#40c057] shadow-[0_0_12px_#40c057]';
    if (ratio > 0.2) return 'bg-[#fab005] shadow-[0_0_12px_#fab005]';
    return 'bg-[#fa5252] shadow-[0_0_12px_#fa5252] animate-pulse';
  };

  return (
    <div className="absolute inset-0 bg-slate-900 z-50 flex flex-col font-mono select-none overflow-hidden">
      
      {/* State-of-the-art CRT scanline screen and ambient vignette */}
      <div className="absolute inset-0 pointer-events-none bg-radial-vignette opacity-40 z-40" />
      <div className="absolute inset-0 pointer-events-none bg-scanlines opacity-[0.06] z-40" />

      {/* Full screen Flash indicator for impact feel */}
      {screenFlash && (
        <div className="absolute inset-0 bg-white z-50 pointer-events-none animate-flash duration-200" />
      )}

      {/* Dynamic Battle Zone Arena */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
         
         {/* Top Half - Opponent */}
         <div className="h-1/2 flex justify-start items-start p-8 relative">
             
             {/* Opponent Stat Glass HUD Panel card */}
             <div className={`transition-all duration-300 transform flex bg-slate-900/90 backdrop-blur-md border-[3px] border-slate-700/80 p-4 rounded-xl shadow-2xl z-10 w-72 absolute top-6 left-6 ${opponentDamaged ? 'translate-x-2 border-red-500 scale-95' : 'translate-x-0'}`}>
                 <div className="flex-1">
                     <div className="flex items-center justify-between">
                         <div className="font-extrabold uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#ffd8a8] to-slate-100 text-lg sm:text-xl tracking-tight">{opponent.name}</div>
                         <div className="text-right text-[#ced4da] font-black text-xs px-2 py-0.5 rounded bg-slate-800">Lv{opponent.level}</div>
                     </div>
                     <div className="w-full bg-slate-950/70 h-3 mt-3 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                         <div className={`h-full rounded-full transition-all duration-500 ${getHpColor(opponent.hp, opponent.maxHp)}`} style={{ width: `${Math.max(0, (opponent.hp / opponent.maxHp) * 100)}%` }} />
                     </div>
                     <div className="flex items-center justify-between mt-1.5 text-xs text-slate-400 font-bold">
                         <span>HP METER</span>
                         <span>{opponent.hp} / {opponent.maxHp}</span>
                     </div>
                 </div>
                 {opponentDamaged && <ShieldAlert className="text-red-500 ml-2 animate-bounce self-center" size={24} />}
             </div>
             
             {/* Opponent Stylized 3D Stage & Shadow */}
             <div className="absolute right-12 sm:right-24 top-20 w-40 h-40 flex flex-col items-center justify-center">
                {/* 3D Circular Arena Stage pedestal */}
                <div className="w-32 h-10 bg-slate-800/80 border-2 border-slate-600/50 rounded-[100%] absolute bottom-2 shadow-[0_12px_24px_rgba(0,0,0,0.5)] transform -rotate-12" />
                
                {/* Floating Opponent Avatar Silhouette/Box with unique styled colors and state shakes */}
                <div className={`w-28 h-28 rounded-2xl shadow-2xl transition-all duration-200 relative flex items-center justify-center font-black text-white text-3xl select-none ${opponentDamaged ? 'animate-shake-impact bg-red-600 scale-95' : 'animate-bounce-slow'}`} style={{ backgroundColor: opponentDamaged ? '#ff0000' : opponent.color, clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)' }}>
                   {/* Immersive 3D Procedural Pokemon rendering */}
                   <div className="absolute inset-0 w-full h-full pointer-events-none">
                     <Canvas camera={{ position: [0, 0.5, 1.4], fov: 42 }}>
                       <ambientLight intensity={1.5} />
                       <directionalLight position={[2, 3, 2]} intensity={1.5} />
                       <PokemonModel 
                         name={opponent.name} 
                         color={opponent.color} 
                         state={
                           opponent.hp <= 0 
                             ? 'FAINTED' 
                             : opponentDamaged 
                               ? 'HIT' 
                               : (turn === 'OPPONENT' && activeCombatEffect === 'scratch') 
                                 ? 'ATTACK' 
                                 : 'IDLE'
                         } 
                         isBackView={false}
                         scale={1.4} 
                       />
                     </Canvas>
                   </div>

                   {/* Fallback Label if loading */}
                   <span className="opacity-0 absolute">{opponent.name[0]}</span>
                   
                   {/* Capture Aura and Ring flashes */}
                   {activeCombatEffect === 'pokeball-aura' && (
                     <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center rounded-xl animate-ping border-4 border-white z-20">
                        <span className="text-white text-xs font-black tracking-widest animate-pulse">CATCHING...</span>
                     </div>
                   )}

                   {/* Attack burst particle effects on top of enemy avatar */}
                   {activeCombatEffect === 'slash-spark' && (
                     <div className="absolute inset-0 bg-yellow-400/80 flex items-center justify-center rounded-xl animate-ping z-20">
                       <Swords className="text-slate-950" size={48} />
                     </div>
                   )}
                   {activeCombatEffect === 'fire-burst' && (
                     <div className="absolute inset-0 bg-orange-500/80 flex items-center justify-center rounded-xl animate-ping z-20">
                       <Zap className="text-yellow-300" size={48} />
                     </div>
                   )}
                </div>

                {/* Floating Damage value float indicators */}
                {floater && !opponentDamaged && playerDamaged && (
                   <div key={floater.key} className="absolute -top-12 text-2xl font-black text-red-500 animate-float-fade drop-shadow-[0_2px_8px_rgba(0,0,0,1)] uppercase">
                      CRITICAL!
                   </div>
                )}
             </div>
         </div>

         {/* Bottom Half - Player */}
         <div className="h-1/2 flex justify-end items-end p-8 relative">
             
             {/* Floating dynamic status effect icons or healers */}
             {activeCombatEffect === 'heal-sparkle' && (
                <div className="absolute left-1/4 bottom-28 animate-pulse text-green-400 flex flex-col items-center z-30">
                  <Sparkles size={40} className="animate-spin" />
                  <span className="text-xs font-black bg-[#40c057] text-[#1e293b] px-2 py-0.5 mt-1 rounded shadow-lg uppercase">POTION HEAL</span>
                </div>
             )}

             {/* Player Primary Pokemon Arena Platform */}
             <div className="absolute left-12 sm:left-24 bottom-22 w-40 h-40 flex flex-col items-center justify-center">
                <div className="w-32 h-10 bg-indigo-950/80 border-2 border-indigo-700/50 rounded-[100%] absolute bottom-2 shadow-[0_12px_24px_rgba(0,0,0,0.5)] transform rotate-12" />
                
                {/* Visual player back silhouette */}
                <div className={`w-28 h-28 rounded-2xl shadow-2xl transition-all duration-200 relative flex items-center justify-center font-black text-white text-3xl select-none ${playerDamaged ? 'animate-shake-impact bg-red-600 scale-95' : 'animate-pulse'}`} style={{ backgroundColor: playerDamaged ? '#ff0000' : activePokemon.color, clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }}>
                   {/* Immersive 3D Procedural Back-View Pokemon rendering */}
                   <div className="absolute inset-0 w-full h-full pointer-events-none">
                     <Canvas camera={{ position: [0, 0.5, 1.4], fov: 42 }}>
                       <ambientLight intensity={1.5} />
                       <directionalLight position={[1, 3, -2]} intensity={1.2} />
                       <PokemonModel 
                         name={activePokemon.name} 
                         color={activePokemon.color} 
                         state={
                           activePokemon.hp <= 0 
                             ? 'FAINTED' 
                             : playerDamaged 
                               ? 'HIT' 
                               : (turn === 'PLAYER' && activeCombatEffect && activeCombatEffect !== 'heal-sparkle') 
                                 ? 'ATTACK' 
                                 : 'IDLE'
                         } 
                         isBackView={true} 
                         scale={1.4} 
                       />
                     </Canvas>
                   </div>

                   <span className="opacity-0 absolute">{activePokemon.name[0]}</span>

                   {activeCombatEffect === 'scratch' && (
                     <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center rounded-xl animate-pulse z-20">
                       <Zap className="text-white" size={44} />
                     </div>
                   )}
                </div>

                {/* Real-time floating health restore indicators */}
                {floater && (
                   <div key={floater.key} className={`absolute -top-10 text-2xl font-black px-3 py-1 rounded-md shadow-2xl z-40 animate-float-fade ${floater.isHeal ? 'text-green-400 bg-slate-900 border border-green-500' : 'text-red-500 bg-slate-900 border border-red-500'}`}>
                      {floater.text}
                   </div>
                )}
             </div>

             {/* Player Stat HUD panel */}
             <div className={`transition-all duration-300 transform flex flex-col bg-slate-900/95 backdrop-blur-md border-[3px] border-slate-700/80 p-4 rounded-xl shadow-2xl z-10 w-72 absolute bottom-6 right-6 ${playerDamaged ? 'translate-x--2 border-red-500 scale-95' : 'translate-x-0'}`}>
                 <div className="flex-1">
                     <div className="flex items-center justify-between">
                         <div className="font-extrabold uppercase text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-indigo-100 text-lg sm:text-xl tracking-tight">{activePokemon.name}</div>
                         <div className="text-right text-[#ced4da] font-black text-xs px-2 py-0.5 rounded bg-slate-800">Lv{activePokemon.level}</div>
                     </div>
                     <div className="w-full bg-slate-950/70 h-3 mt-3 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                         <div className={`h-full rounded-full transition-all duration-500 ${getHpColor(activePokemon.hp, activePokemon.maxHp)}`} style={{ width: `${Math.max(0, (activePokemon.hp / activePokemon.maxHp) * 100)}%` }} />
                     </div>
                     <div className="flex items-center justify-between mt-2 text-xs font-bold font-mono">
                         <div className="flex items-center gap-1 text-slate-400">
                           <Heart size={12} className="text-red-500" />
                           <span>HEALTH</span>
                         </div>
                         <span className="text-slate-100 text-sm">{activePokemon.hp} <span className="text-slate-500">/</span> {activePokemon.maxHp}</span>
                     </div>
                 </div>
             </div>
         </div>
      </div>

      {/* Bottom Console Gameboy Frame text UI */}
      <div className="flex-none min-h-[165px] h-auto md:h-48 border-t-4 border-slate-700 bg-slate-950 grid grid-cols-1 md:grid-cols-2 relative shadow-inner">
         
         {/* Live Text Dialogue Box */}
         <div className="col-span-1 border-r-0 md:border-r-4 border-slate-700 p-6 text-slate-100 text-lg sm:text-xl flex items-center justify-center">
            {currentLog ? (
                <div className="w-full flex justify-between items-center cursor-pointer select-none py-2" onClick={() => actions.shiftBattleLog()}>
                   <span className="leading-snug text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-200 tracking-wide font-medium">{currentLog}</span>
                   <span className="text-[#fcc419] animate-bounce shrink-0 ml-4 font-black text-xl">&#9660;</span>
                </div>
            ) : (
                <div className="w-full flex items-center pl-2 font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-300 font-mono text-xs sm:text-sm md:text-base uppercase">
                   {menuState === 'MAIN' && <span className="leading-relaxed">WHAT WILL<br/>{activePokemon.name} DO?</span>}
                   {menuState === 'FIGHT' && <span>CHOOSE AN ATTACK</span>}
                   {menuState === 'ITEM' && <span>CHOOSE AN ITEM FROM BAG</span>}
                </div>
            )}
         </div>
         
         {/* Action Battle Command Keys Menu Box */}
         <div className="col-span-1 bg-gradient-to-br from-slate-900 to-slate-950 relative pointer-events-auto">
             {!currentLog && (
                 <div className="grid grid-cols-2 gap-3 p-4 h-full text-base sm:text-lg font-black uppercase text-slate-200">
                     {menuState === 'MAIN' && [
                         <button key="FIGHT" className={`flex items-center gap-2 justify-start px-4 py-2 border-2 rounded-xl transition-all cursor-pointer ${cursorIdx === 0 ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800'}`} onClick={() => { setCursorIdx(0); handleSelect(); }}>
                             <span className="w-4 flex items-center">{cursorIdx === 0 ? <ChevronRight size={18} /> : ''}</span>
                             <Swords size={16} className={cursorIdx === 0 ? 'text-yellow-300' : 'text-slate-400'} />
                             <span>FIGHT</span>
                         </button>,
                         <button key="PKMN" className="flex items-center gap-2 justify-start px-4 py-2 border-2 rounded-xl bg-slate-950/40 border-slate-900/60 text-slate-600 cursor-not-allowed">
                             <span className="w-4"></span>
                             <span><s>PKMN</s></span>
                         </button>,
                         <button key="ITEM" className={`flex items-center gap-2 justify-start px-4 py-2 border-2 rounded-xl transition-all cursor-pointer ${cursorIdx === 2 ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800'}`} onClick={() => { setCursorIdx(2); handleSelect(); }}>
                             <span className="w-4 flex items-center">{cursorIdx === 2 ? <ChevronRight size={18} /> : ''}</span>
                             <Sparkles size={16} className={cursorIdx === 2 ? 'text-yellow-300 animate-pulse' : 'text-slate-400'} />
                             <span>BAG</span>
                         </button>,
                         <button key="RUN" className={`flex items-center gap-2 justify-start px-4 py-2 border-2 rounded-xl transition-all cursor-pointer ${cursorIdx === 3 ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800'}`} onClick={() => { setCursorIdx(3); handleSelect(); }}>
                             <span className="w-4 flex items-center">{cursorIdx === 3 ? <ChevronRight size={18} /> : ''}</span>
                             <span>RUN</span>
                         </button>,
                     ]}
                     
                     {menuState === 'ITEM' && [
                         <button key="POTION" className={`flex items-center justify-between px-4 py-2 border-2 rounded-xl transition-all cursor-pointer col-span-2 ${cursorIdx === 0 ? 'bg-[#96f2d7] text-[#0ca678] border-[#38d9a9] shadow-lg' : 'bg-slate-800 border-slate-700 hover:bg-slate-800'}`} onClick={() => { setCursorIdx(0); handleSelect(); }}>
                             <span className="flex items-center gap-2">
                                 <span className="w-4 flex items-center">{cursorIdx === 0 ? <ChevronRight size={18} /> : ''}</span>
                                 <span>POTION (HEALS 20HP)</span>
                             </span>
                             <span className="text-xs bg-slate-900 px-2.5 py-1 rounded-md text-slate-300 border border-slate-700">QTY: {potions}</span>
                         </button>,
                         <button key="POKEBALL" className={`flex items-center justify-between px-4 py-2 border-2 rounded-xl transition-all cursor-pointer col-span-2 ${cursorIdx === 1 ? 'bg-[#96f2d7] text-[#0ca678] border-[#38d9a9] shadow-lg' : 'bg-slate-800 border-slate-700 hover:bg-slate-800'}`} onClick={() => { setCursorIdx(1); handleSelect(); }}>
                             <span className="flex items-center gap-2">
                                 <span className="w-4 flex items-center">{cursorIdx === 1 ? <ChevronRight size={18} /> : ''}</span>
                                 <span>POKéBALL (70% CATCH)</span>
                             </span>
                             <span className="text-xs bg-slate-900 px-2.5 py-1 rounded-md text-slate-300 border border-slate-700">QTY: {pokeballs}</span>
                         </button>,
                         <button key="BACK_ITEM" className="flex items-center gap-2 cursor-pointer col-span-2 text-slate-400 hover:text-white mt-1 justify-center py-1 text-sm font-bold bg-slate-900/60 rounded-lg hover:bg-slate-900 border border-slate-800 font-mono" onClick={() => { actions.setBattleMenuState('MAIN'); setCursorIdx(0); }}>
                             <span>[ RETURN TO BATTLE OPTIONS ]</span>
                         </button>
                     ]}

                     {menuState === 'FIGHT' && [
                         ...activePokemon.moves.map((m, i) => (
                             <button key={m.name} className={`flex items-center justify-between px-4 py-2 border-2 rounded-xl transition-all cursor-pointer col-span-2 ${cursorIdx === i ? 'bg-[#96f2d7] text-[#0ca678] border-[#38d9a9] shadow-lg' : 'bg-slate-800 border-slate-700 hover:bg-slate-800'}`} onClick={() => { setCursorIdx(i); handleSelect(); }}>
                                 <span className="flex items-center gap-2">
                                     <span className="w-4 flex items-center">{cursorIdx === i ? <ChevronRight size={18} /> : ''}</span>
                                     <span>{m.name}</span>
                                 </span>
                                 <span className="text-xs bg-slate-900 px-2 py-1 rounded-md text-slate-300 border border-slate-700">{m.type}</span>
                             </button>
                         )),
                         <button key="BACK_FIGHT" className="flex items-center gap-2 cursor-pointer col-span-2 text-slate-400 hover:text-white mt-1 justify-center py-1 text-sm font-bold bg-slate-900/60 rounded-lg hover:bg-slate-900 border border-slate-800 font-mono" onClick={() => { actions.setBattleMenuState('MAIN'); setCursorIdx(0); }}>
                             <span>[ RETURN TO BATTLE OPTIONS ]</span>
                         </button>
                     ]}
                 </div>
             )}
         </div>
      </div>
    </div>
  );
}
