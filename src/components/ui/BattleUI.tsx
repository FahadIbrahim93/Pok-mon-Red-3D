import { useEffect, useState, useRef } from 'react';
import { useGameStore, Move } from '../../store/gameStore';
import { ChevronRight, ShieldAlert, Zap, Swords, Sparkles, Heart } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { PokemonModel } from '../3d/PokemonModel';
import { motion } from 'motion/react';
import { AttackParticles } from '../3d/AttackParticles';
import { getTypeEffectiveness, getPokemonTypes, getMoveDetails, checkEffectApplied, getStatusEffectName, getStageChangeDescription } from '../../game/pokemonData';

const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case 'POISON': return 'bg-purple-900/80 text-purple-300 border border-purple-500/50';
    case 'PARALYSIS': return 'bg-yellow-900/80 text-yellow-300 border border-yellow-500/50';
    case 'SLEEP': return 'bg-sky-900/80 text-sky-300 border border-sky-500/50';
    case 'CONFUSION': return 'bg-pink-900/80 text-pink-300 border border-pink-500/50';
    case 'BURN': return 'bg-red-900/80 text-red-300 border border-red-500/50';
    case 'FREEZE': return 'bg-cyan-900/80 text-cyan-300 border border-cyan-500/50';
    default: return 'bg-slate-800 text-slate-400';
  }
};

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

  const [playerActionType, setPlayerActionType] = useState<string>('NORMAL');
  const [opponentActionType, setOpponentActionType] = useState<string>('NORMAL');

  const activePokemon = party[battle.playerActiveIndex];
  const { opponent, menuState, log, turn } = battle;

  const triggerFloater = (text: string, isHeal: boolean) => {
    setFloater({ text, isHeal, key: Date.now() });
  };

  useEffect(() => {
    if (mode !== 'BATTLE') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (menuState === 'VICTORY') {
        if (e.key === 'z' || e.key === ' ' || e.key === 'Enter') {
          if (log.length > 0) {
            actions.shiftBattleLog();
          } else {
            actions.endBattle();
          }
        }
        return;
      }

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

  // Track which turn's status effects have been processed
  const lastProcessedTurn = useRef<'PLAYER' | 'OPPONENT' | null>(null);

  // Process status effects at the start of each turn (sleep, paralysis, poison)
  useEffect(() => {
    if (mode !== 'BATTLE' || !opponent || !activePokemon || turn === 'END') return;
    if (log.length > 0) return; // wait until logs are dismissed
    if (lastProcessedTurn.current === turn) return; // already processed this turn
    lastProcessedTurn.current = turn;

    const isPlayerTurn = turn === 'PLAYER';
    const status = isPlayerTurn ? battle.playerStatus : battle.opponentStatus;
    const battler = isPlayerTurn ? activePokemon : opponent;
    if (!battler || status === 'NONE') return;

    // --- SLEEP CHECK ---
    if (status === 'SLEEP') {
      const currentSleepTurns = battle.sleepTurns;
      if (currentSleepTurns > 0) {
        const newSleepTurns = currentSleepTurns - 1;
        actions.setSleepTurns(newSleepTurns);

        if (newSleepTurns > 0) {
          actions.addBattleLog(`${battler.name} is fast asleep...`);
          setTimeout(() => {
            actions.setTurn(isPlayerTurn ? 'OPPONENT' : 'PLAYER');
          }, 700);
          return; // skip this turn
        } else {
          // Wake up!
          actions.applyStatusEffect(isPlayerTurn ? 'PLAYER' : 'OPPONENT', 'NONE');
          actions.addBattleLog(`${battler.name} woke up!`);
          // Fall through — battler can act this turn
        }
      }
    }

    // --- PARALYSIS CHECK (25% chance to skip turn) ---
    if (status === 'PARALYSIS' && Math.random() < 0.25) {
      actions.addBattleLog(`${battler.name} is paralyzed! It can't move!`);
      setTimeout(() => {
        actions.setTurn(isPlayerTurn ? 'OPPONENT' : 'PLAYER');
      }, 700);
      return;
    }

    // --- POISON CHECK (1/8 max HP damage at start of turn, then skip turn) ---
    if (status === 'POISON') {
      const poisonDamage = Math.max(1, Math.floor(battler.maxHp / 8));
      actions.applyDamage(isPlayerTurn ? 'PLAYER' : 'OPPONENT', poisonDamage);

      const name = isPlayerTurn ? battler.name : opponent.name;
      actions.addBattleLog(`${name} is hurt by poison! (-${poisonDamage} HP)`);

      // Check if the battler fainted from poison
      setTimeout(() => {
        const state = useGameStore.getState();
        if (isPlayerTurn) {
          const p = state.party[state.battle.playerActiveIndex];
          if (p && p.hp <= 0) {
            actions.addBattleLog(`${p.name} fainted! You blacked out!`);
            setTimeout(() => actions.endBattle(), 2000);
          }
        } else {
          if (state.battle.opponent && state.battle.opponent.hp <= 0) {
            actions.addBattleLog(`Wild ${opponent.name} fainted!`);
            setTimeout(() => actions.gainVictory(), 400);
          }
        }
      }, 300);

      // Skip the battler's turn after poison damage (avoids AI log conflict)
      setTimeout(() => {
        actions.setTurn(isPlayerTurn ? 'OPPONENT' : 'PLAYER');
      }, 700);
      return;
    }
  }, [mode, turn, battle.playerStatus, battle.opponentStatus, battle.sleepTurns, log.length, opponent, activePokemon]);

  // OPPONENT turn logic — now with STATUS move support
  useEffect(() => {
      if (mode === 'BATTLE' && turn === 'OPPONENT') {
          const timer = setTimeout(() => {
              if (opponent) {
                  // Intelligent opponent AI: prefer status moves if player not already affected
                  const hasStatModsAvailable = battle.playerStatStages.atk > -6 || battle.playerStatStages.def > -6 || battle.playerStatStages.acc > -6;
                  const hasNoStatus = battle.playerStatus === 'NONE';

                  // Sort moves: prefer status if beneficial, otherwise pick best attacking move
                  const sortedMoves = [...opponent.moves].sort((a, b) => {
                    const fa = getMoveDetails(a.name);
                    const fb = getMoveDetails(b.name);
                    const aIsStatus = fa.category === 'STATUS' ? 1 : 0;
                    const bIsStatus = fb.category === 'STATUS' ? 1 : 0;
                    // Prefer status moves when they would be useful
                    if (aIsStatus !== bIsStatus && (hasNoStatus || hasStatModsAvailable)) return bIsStatus - aIsStatus;
                    // Otherwise prefer higher-power moves
                    return (b.power || 0) - (a.power || 0);
                  });

                  const move = sortedMoves[0];
                  const fullMove = getMoveDetails(move.name);
                  setOpponentActionType(fullMove.type);

                  actions.addBattleLog(`Enemy ${opponent.name} used ${fullMove.name}!`);

                  // STATUS move handling for opponent
                  if (fullMove.category === 'STATUS') {
                    if (fullMove.effect) {
                      const { type, target, chance, stages } = fullMove.effect;
                      const actualTarget = target === 'SELF' ? 'OPPONENT' : 'PLAYER';
                      const targetName = target === 'SELF' ? opponent.name : activePokemon.name;

                      if (checkEffectApplied(chance)) {
                        if (type === 'ATK' || type === 'DEF' || type === 'SPD' || type === 'ACC') {
                          const mod = type as 'ATK' | 'DEF' | 'SPD' | 'ACC';
                          actions.applyStatMod(actualTarget, mod, stages || -1);
                          actions.addBattleLog(`${targetName}'s ${getStageChangeDescription(mod, stages || -1)}`);
                        } else {
                          const effectType = type as any;
                          actions.applyStatusEffect(actualTarget, effectType);
                          actions.addBattleLog(`${targetName} ${getStatusEffectName(type)}`);
                        }
                      } else {
                        actions.addBattleLog(`But it had no effect!`);
                      }
                    }
                    // After opponent status move, it's the player's turn
                    setTimeout(() => {
                      actions.setTurn('PLAYER');
                      actions.setBattleMenuState('MAIN');
                      setCursorIdx(0);
                    }, 600);
                  } else {
                    // PHYSICAL / SPECIAL damage move
                    const defenderTypes = getPokemonTypes(activePokemon.name);
                    const { multiplier, description: typeDesc } = getTypeEffectiveness(fullMove.type, defenderTypes);
                    // Apply stat stage modifiers
                    const atkStages = battle.opponentStatStages.atk;
                    const defStages = battle.playerStatStages.def;
                    const atkMultiplier = atkStages >= 0 ? (2 + atkStages) / 2 : 2 / (2 - atkStages);
                    const defMultiplier = defStages >= 0 ? (2 + defStages) / 2 : 2 / (2 - defStages);
                    const calculatedDamage = Math.max(1, Math.round(fullMove.power * multiplier * (atkMultiplier / defMultiplier)));

                    if (typeDesc) {
                        actions.addBattleLog(typeDesc);
                    }
                    
                    setTimeout(() => {
                        // Trigger Flash & Shake player
                        setScreenFlash(true);
                        setPlayerDamaged(true);
                        triggerFloater(`-${calculatedDamage} HP`, false);
                        setActiveCombatEffect('scratch');

                        setTimeout(() => {
                          setScreenFlash(false);
                          setPlayerDamaged(false);
                          setActiveCombatEffect(null);
                        }, 400);

                        actions.applyDamage('PLAYER', calculatedDamage);

                        // Check for move secondary effects on player
                        if (fullMove.effect && checkEffectApplied(fullMove.effect.chance)) {
                          const { type } = fullMove.effect;
                          if (type !== 'ATK' && type !== 'DEF' && type !== 'SPD' && type !== 'ACC') {
                            const effectType = type as any;
                            const state = useGameStore.getState();
                            if (state.battle.playerStatus === 'NONE') {
                              actions.applyStatusEffect('PLAYER', effectType);
                              actions.addBattleLog(`${activePokemon.name} ${getStatusEffectName(type)}`);
                            }
                          }
                        }

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
              }
          }, 800);
          return () => clearTimeout(timer);
      }
  }, [mode, turn, opponent, activePokemon, battle.playerStatStages, battle.playerStatus, battle.opponentStatStages]);

  const handleSelect = (idx?: number) => {
      const actualIdx = idx !== undefined ? idx : cursorIdx;
      if (menuState === 'MAIN') {
          if (actualIdx === 0) { 
            actions.setBattleMenuState('FIGHT'); 
            setCursorIdx(0); 
          } else if (actualIdx === 1) { 
            actions.addBattleLog("There's no time to switch Pokémon!");
          } else if (actualIdx === 2) { 
            // Enter Bag Submenu
            actions.setBattleMenuState('ITEM'); 
            setCursorIdx(0);
          } else if (actualIdx === 3) { // RUN
             actions.addBattleLog("Got away safely!");
             setTimeout(() => { actions.endBattle(); }, 1500);
          }
      } else if (menuState === 'ITEM') {
          if (actualIdx === 0) { // POTION
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
          } else if (actualIdx === 1) { // POKéBALL
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
          const move = activePokemon.moves[actualIdx];
          if (!move) return;
          const fullMove = getMoveDetails(move.name);
          setPlayerActionType(fullMove.type);

          actions.addBattleLog(`${activePokemon.name} used ${fullMove.name}!`);

          // STATUS moves: apply effects instead of damage
          if (fullMove.category === 'STATUS') {
            if (fullMove.effect && opponent) {
              const { type, target, chance, stages } = fullMove.effect;
              const actualTarget = target === 'SELF' ? 'PLAYER' : 'OPPONENT';
              const targetName = target === 'SELF' ? activePokemon.name : opponent.name;

              if (checkEffectApplied(chance)) {
                if (type === 'ATK' || type === 'DEF' || type === 'SPD' || type === 'ACC') {
                  const mod = type as 'ATK' | 'DEF' | 'SPD' | 'ACC';
                  actions.applyStatMod(actualTarget, mod, stages || -1);
                  actions.addBattleLog(`${targetName}'s ${getStageChangeDescription(mod, stages || -1)}`);
                  // Brief visual feedback
                  setActiveCombatEffect('heal-sparkle');
                  setTimeout(() => setActiveCombatEffect(null), 600);
                } else {
                  // Status condition effect
                  const effectType = type as any;
                  actions.applyStatusEffect(actualTarget, effectType);
                  actions.addBattleLog(`${targetName} ${getStatusEffectName(type)}`);
                }
              } else {
                actions.addBattleLog(`But it had no effect!`);
              }
            }
            actions.setTurn('OPPONENT');
          } else {
            // PHYSICAL / SPECIAL damage move
            const defenderTypes = opponent ? getPokemonTypes(opponent.name) : ['NORMAL'];
            const { multiplier, description: typeDesc } = getTypeEffectiveness(fullMove.type, defenderTypes);
            // Apply stat stage modifiers to damage
            const atkStages = battle.playerStatStages.atk;
            const defStages = battle.opponentStatStages.def;
            const atkMultiplier = atkStages >= 0 ? (2 + atkStages) / 2 : 2 / (2 - atkStages);
            const defMultiplier = defStages >= 0 ? (2 + defStages) / 2 : 2 / (2 - defStages);
            const calculatedDamage = Math.max(1, Math.round(fullMove.power * multiplier * (atkMultiplier / defMultiplier)));

            if (typeDesc) {
                actions.addBattleLog(typeDesc);
            }
            actions.setTurn('END'); // wait for damage

            setTimeout(() => {
               // Shake opponent, trigger flash of screen
               setScreenFlash(true);
               setOpponentDamaged(true);
               triggerFloater(`-${calculatedDamage} HP`, false);
               setActiveCombatEffect(fullMove.type === 'FIRE' ? 'fire-burst' : 'slash-spark');

               setTimeout(() => {
                 setScreenFlash(false);
                 setOpponentDamaged(false);
                 setActiveCombatEffect(null);
               }, 500);

               actions.applyDamage('OPPONENT', calculatedDamage);

               // Check for move effects after damage (e.g. poison sting chance)
               if (fullMove.effect && opponent && checkEffectApplied(fullMove.effect.chance)) {
                 const { type, target } = fullMove.effect;
                 if (type !== 'ATK' && type !== 'DEF' && type !== 'SPD' && type !== 'ACC') {
                   const effectType = type as any;
                   actions.applyStatusEffect('OPPONENT', effectType);
                   actions.addBattleLog(`${opponent.name} ${getStatusEffectName(type)}`);
                 }
               }

               const state = useGameStore.getState();
               
               if (state.battle.opponent && state.battle.opponent.hp <= 0) {
                   setTimeout(() => {
                     actions.addBattleLog(`Enemy ${state.battle.opponent.name} fainted!`);
                     actions.gainVictory();
                   }, 400);
               } else {
                   actions.setTurn('OPPONENT');
               }
            }, 1200);
          }
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

      {/* State-of-the-art Victory Modal */}
      {menuState === 'VICTORY' && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex items-center justify-center p-4 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-full max-w-sm bg-slate-900 border-4 border-yellow-400 p-6 rounded-2xl shadow-2xl relative flex flex-col gap-6"
          >
            {/* Header */}
            <div className="flex flex-col items-center text-center gap-1">
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-300 to-amber-500 flex items-center justify-center shadow-lg"
              >
                <Sparkles className="text-slate-950" size={28} />
               </motion.div>
              <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 tracking-wider">VICTORY</h2>
              <p className="text-slate-400 text-[10px]">WILD POKÉMON DEFEATED</p>
            </div>

            {/* Reward Summary */}
            <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-700/50 flex flex-col gap-3 font-mono">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-xs font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400" />
                  XP GAINED
                </span>
                <span className="text-base font-extrabold text-yellow-300">+{battle.victoryRewards?.xpGained ?? 45} XP</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-xs font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  GOLD EARNED
                </span>
                <span className="text-base font-extrabold text-emerald-400">+{battle.victoryRewards?.goldEarned ?? 25}g</span>
              </div>
            </div>

            {/* Level up / Evolution states */}
            {battle.victoryRewards?.leveledUp && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-sky-950/50 border-2 border-sky-400/80 rounded-xl p-3 flex flex-col items-center gap-1"
              >
                <span className="text-[#a5d8ff] text-xs font-black tracking-widest animate-pulse">LEVEL UP!</span>
                <span className="text-slate-200 text-xs text-center">
                  Your <strong className="text-sky-300">{activePokemon.name}</strong> grew to <strong className="text-sky-300">Level {battle.victoryRewards?.newLevel}</strong>!
                </span>
              </motion.div>
            )}

            {battle.victoryRewards?.evolvedName && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-fuchsia-950/50 border-2 border-fuchsia-400/80 rounded-xl p-3 flex flex-col items-center gap-1"
              >
                <span className="text-[#f5b3f3] text-xs font-black tracking-widest animate-pulse">EVOLUTION!</span>
                <span className="text-slate-200 text-xs text-center">
                  What? Congratulations! Your partner evolved into <strong className="text-fuchsia-300">{battle.victoryRewards?.evolvedName}</strong>!
                </span>
              </motion.div>
            )}

            {/* Active Pokemon Status / XP bar */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400 font-bold">{activePokemon.name}</span>
                <span className="text-slate-400">
                  {activePokemon.xp ?? 0} / {activePokemon.maxXp ?? 100} XP
                </span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, ((activePokemon.xp ?? 0) / (activePokemon.maxXp ?? 130)) * 100)}%` }}
                  transition={{ delay: 0.2, duration: 1 }}
                  className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                />
              </div>
            </div>

            {/* Claim button */}
            <button 
              onClick={() => actions.endBattle()}
              className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black tracking-widest py-3 px-6 rounded-xl shadow-lg hover:shadow-yellow-500/20 active:scale-95 transition-all text-center uppercase border-b-4 border-amber-600 font-mono cursor-pointer"
            >
              Back to Town (Z)
            </button>
          </motion.div>
        </div>
      )}

      {/* Dynamic Battle Zone Arena */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
         
         {/* Top Half - Opponent */}
         <div className="h-1/2 flex justify-start items-start p-8 relative">
             
             {/* Opponent Stat Glass HUD Panel card */}
             <div className={`transition-all duration-300 transform flex bg-slate-900/90 backdrop-blur-md border-[3px] border-slate-700/80 p-4 rounded-xl shadow-2xl z-10 w-72 absolute top-6 left-6 ${opponentDamaged ? 'translate-x-2 border-red-500 scale-95' : 'translate-x-0'}`}>
                 <div className="flex-1">
                     <div className="flex items-center justify-between">
                         <div className="flex items-center gap-1.5">
                           <div className="font-extrabold uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#ffd8a8] to-slate-100 text-lg sm:text-xl tracking-tight">{opponent.name}</div>
                           {battle.opponentStatus !== 'NONE' && (
                             <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider ${getStatusBadgeStyle(battle.opponentStatus)}`}>
                               {battle.opponentStatus === 'POISON' ? 'PSN' : battle.opponentStatus === 'PARALYSIS' ? 'PAR' : battle.opponentStatus === 'SLEEP' ? 'SLP' : battle.opponentStatus === 'CONFUSION' ? 'CNF' : battle.opponentStatus === 'BURN' ? 'BRN' : battle.opponentStatus === 'FREEZE' ? 'FRZ' : battle.opponentStatus}
                             </span>
                           )}
                         </div>
                         <div className="text-right text-[#ced4da] font-black text-xs px-2 py-0.5 rounded bg-slate-800">Lv{opponent.level}</div>
                     </div>
                     <div className="w-full bg-slate-950/70 h-3 mt-3 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                         <motion.div 
                           className={`h-full rounded-full ${getHpColor(opponent.hp, opponent.maxHp)}`}
                           initial={{ width: `${Math.max(0, (opponent.hp / opponent.maxHp) * 100)}%` }}
                           animate={{ width: `${Math.max(0, (opponent.hp / opponent.maxHp) * 100)}%` }}
                           transition={{ type: "spring", stiffness: 60, damping: 14 }}
                         />
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
                       <AttackParticles type={playerActionType} active={opponentDamaged} />
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
                       <AttackParticles type={opponentActionType} active={playerDamaged} />
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
                         <div className="flex items-center gap-1.5">
                           <div className="font-extrabold uppercase text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-indigo-100 text-lg sm:text-xl tracking-tight">{activePokemon.name}</div>
                           {battle.playerStatus !== 'NONE' && (
                             <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider ${getStatusBadgeStyle(battle.playerStatus)}`}>
                               {battle.playerStatus === 'POISON' ? 'PSN' : battle.playerStatus === 'PARALYSIS' ? 'PAR' : battle.playerStatus === 'SLEEP' ? 'SLP' : battle.playerStatus === 'CONFUSION' ? 'CNF' : battle.playerStatus === 'BURN' ? 'BRN' : battle.playerStatus === 'FREEZE' ? 'FRZ' : battle.playerStatus}
                             </span>
                           )}
                         </div>
                         <div className="text-right text-[#ced4da] font-black text-xs px-2 py-0.5 rounded bg-slate-800">Lv{activePokemon.level}</div>
                     </div>
                     <div className="w-full bg-slate-950/70 h-3 mt-3 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                         <motion.div 
                           className={`h-full rounded-full ${getHpColor(activePokemon.hp, activePokemon.maxHp)}`}
                           initial={{ width: `${Math.max(0, (activePokemon.hp / activePokemon.maxHp) * 100)}%` }}
                           animate={{ width: `${Math.max(0, (activePokemon.hp / activePokemon.maxHp) * 100)}%` }}
                           transition={{ type: "spring", stiffness: 60, damping: 14 }}
                         />
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
                         <button key="FIGHT" className={`flex items-center gap-2 justify-start px-4 py-2 border-2 rounded-xl transition-all cursor-pointer ${cursorIdx === 0 ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800'}`} onClick={() => { setCursorIdx(0); handleSelect(0); }}>
                             <span className="w-4 flex items-center">{cursorIdx === 0 ? <ChevronRight size={18} /> : ''}</span>
                             <Swords size={16} className={cursorIdx === 0 ? 'text-yellow-300' : 'text-slate-400'} />
                             <span>FIGHT</span>
                         </button>,
                         <button key="PKMN" className="flex items-center gap-2 justify-start px-4 py-2 border-2 rounded-xl bg-slate-950/40 border-slate-900/60 text-slate-600 cursor-not-allowed">
                             <span className="w-4"></span>
                             <span><s>PKMN</s></span>
                         </button>,
                         <button key="ITEM" className={`flex items-center gap-2 justify-start px-4 py-2 border-2 rounded-xl transition-all cursor-pointer ${cursorIdx === 2 ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800'}`} onClick={() => { setCursorIdx(2); handleSelect(2); }}>
                             <span className="w-4 flex items-center">{cursorIdx === 2 ? <ChevronRight size={18} /> : ''}</span>
                             <Sparkles size={16} className={cursorIdx === 2 ? 'text-yellow-300 animate-pulse' : 'text-slate-400'} />
                             <span>BAG</span>
                         </button>,
                         <button key="RUN" className={`flex items-center gap-2 justify-start px-4 py-2 border-2 rounded-xl transition-all cursor-pointer ${cursorIdx === 3 ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800'}`} onClick={() => { setCursorIdx(3); handleSelect(3); }}>
                             <span className="w-4 flex items-center">{cursorIdx === 3 ? <ChevronRight size={18} /> : ''}</span>
                             <span>RUN</span>
                         </button>,
                     ]}
                     
                     {menuState === 'ITEM' && [
                         <button key="POTION" className={`flex items-center justify-between px-4 py-2 border-2 rounded-xl transition-all cursor-pointer col-span-2 ${cursorIdx === 0 ? 'bg-[#96f2d7] text-[#0ca678] border-[#38d9a9] shadow-lg' : 'bg-slate-800 border-slate-700 hover:bg-slate-800'}`} onClick={() => { setCursorIdx(0); handleSelect(0); }}>
                             <span className="flex items-center gap-2">
                                 <span className="w-4 flex items-center">{cursorIdx === 0 ? <ChevronRight size={18} /> : ''}</span>
                                 <span>POTION (HEALS 20HP)</span>
                             </span>
                             <span className="text-xs bg-slate-900 px-2.5 py-1 rounded-md text-slate-300 border border-slate-700">QTY: {potions}</span>
                         </button>,
                         <button key="POKEBALL" className={`flex items-center justify-between px-4 py-2 border-2 rounded-xl transition-all cursor-pointer col-span-2 ${cursorIdx === 1 ? 'bg-[#96f2d7] text-[#0ca678] border-[#38d9a9] shadow-lg' : 'bg-slate-800 border-slate-700 hover:bg-slate-800'}`} onClick={() => { setCursorIdx(1); handleSelect(1); }}>
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
                         ...activePokemon.moves.map((m, i) => {
                             const fullMove = getMoveDetails(m.name);
                             const isStatus = fullMove.category === 'STATUS';
                             return (
                               <button key={m.name} className={`flex items-center justify-between px-4 py-2 border-2 rounded-xl transition-all cursor-pointer col-span-2 ${cursorIdx === i ? 'bg-[#96f2d7] text-[#0ca678] border-[#38d9a9] shadow-lg' : 'bg-slate-800 border-slate-700 hover:bg-slate-800'}`} onClick={() => { setCursorIdx(i); handleSelect(i); }}>
                                   <span className="flex items-center gap-2">
                                       <span className="w-4 flex items-center">{cursorIdx === i ? <ChevronRight size={18} /> : ''}</span>
                                       <span>{fullMove.name}</span>
                                       {fullMove.power > 0 && <span className="text-[10px] text-slate-500">[{fullMove.category === 'PHYSICAL' ? '💪' : '✨'}]</span>}
                                       {isStatus && <span className="text-[10px] text-slate-500">[🎯]</span>}
                                   </span>
                                   <span className="flex items-center gap-1">
                                     <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${isStatus ? 'bg-indigo-900/60 text-indigo-300' : 'bg-slate-900 text-slate-300'}`}>
                                       {isStatus ? 'STATUS' : fullMove.power}
                                     </span>
                                     <span className="text-xs bg-slate-900 px-2 py-1 rounded-md text-slate-300 border border-slate-700">{fullMove.type}</span>
                                   </span>
                               </button>
                             );
                         }),
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
