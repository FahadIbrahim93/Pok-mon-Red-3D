import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mapGrid, TileType } from '../game/MapData';
import { POKEDEX_CATALOG, checkEvolution, generateWildPokemon } from '../game/pokemonData';
import { soundManager } from '../game/soundManager';

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type GameMode = 'OVERWORLD' | 'BATTLE';
export type MoveCategory = 'PHYSICAL' | 'SPECIAL' | 'STATUS';
export type StatusEffect = 'NONE' | 'BURN' | 'FREEZE' | 'PARALYSIS' | 'POISON' | 'SLEEP' | 'CONFUSION';
export type StatMod = 'ATK' | 'DEF' | 'SPD' | 'ACC';

export interface Move {
  name: string;
  power: number;
  type: string;
  category: MoveCategory;
  effect?: {
    type: StatusEffect | StatMod;
    target: 'SELF' | 'OPPONENT';
    chance: number; // 0-1 probability
    stages?: number; // number of stat stages to raise/lower
  };
}

export interface Pokemon {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  moves: Move[];
  color: string;
  xp?: number;
  maxXp?: number;
}

export interface StatStages {
  atk: number; // -6 to +6, default 0
  def: number;
  spd: number;
  acc: number;
}

export interface BattleState {
  opponent: Pokemon | null;
  playerActiveIndex: number;
  turn: 'PLAYER' | 'OPPONENT' | 'END';
  log: string[];
  menuState: 'MAIN' | 'FIGHT' | 'ITEM' | 'VICTORY';
  playerStatus: StatusEffect;
  opponentStatus: StatusEffect;
  playerStatStages: StatStages;
  opponentStatStages: StatStages;
  sleepTurns: number; // tracks remaining sleep turns for active battler
  victoryRewards?: {
    xpGained: number;
    goldEarned: number;
    leveledUp: boolean;
    newLevel: number;
    evolvedName: string | null;
  } | null;
}

export const DEFAULT_STAT_STAGES: StatStages = { atk: 0, def: 0, spd: 0, acc: 0 };

const BATTLE_BASE = {
  playerStatus: 'NONE' as StatusEffect,
  opponentStatus: 'NONE' as StatusEffect,
  playerStatStages: { atk: 0, def: 0, spd: 0, acc: 0 } as StatStages,
  opponentStatStages: { atk: 0, def: 0, spd: 0, acc: 0 } as StatStages,
  sleepTurns: 0,
};

export interface Quest {
  id: string;
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
  category: 'EXPLORE' | 'TRAINING' | 'RESEARCH';
}

export interface InventoryItem {
  id: string;
  name: string;
  displayName: string;
  description: string;
  quantity: number;
  category: 'RECOVERY' | 'CAPTURE' | 'STATUS_HEAL' | 'KEY_ITEM';
  isFavorite: boolean;
  effectPower?: number;
}

const createInitialInventory = (): InventoryItem[] => [
  { id: 'item_potion', name: 'POTION', displayName: 'Potion', description: "Restores a Pokémon's health cells by 20 HP.", quantity: 5, category: 'RECOVERY', isFavorite: false, effectPower: 20 },
  { id: 'item_super_potion', name: 'SUPER_POTION', displayName: 'Super Potion', description: "Restores a Pokémon's health cells by 50 HP.", quantity: 2, category: 'RECOVERY', isFavorite: false, effectPower: 50 },
  { id: 'item_hyper_potion', name: 'HYPER_POTION', displayName: 'Hyper Potion', description: "Restores a Pokémon's health cells by 120 HP.", quantity: 1, category: 'RECOVERY', isFavorite: false, effectPower: 120 },
  { id: 'item_pokeball', name: 'POKEBALL', displayName: 'Poké-Ball', description: 'Captures wild Pokémon in Battle Arena (70% rate).', quantity: 5, category: 'CAPTURE', isFavorite: false },
  { id: 'item_greatball', name: 'GREATBALL', displayName: 'Great Ball', description: 'High-performance capture ball (85% rate).', quantity: 3, category: 'CAPTURE', isFavorite: false },
  { id: 'item_masterball', name: 'MASTERBALL', displayName: 'Master Ball', description: 'The ultimate capturing device. Captures any Pokémon 100% of the time!', quantity: 1, category: 'CAPTURE', isFavorite: true },
  { id: 'item_antidote', name: 'ANTIDOTE', displayName: 'Antidote', description: 'A herbal spray that immediately cures status afflictions.', quantity: 4, category: 'STATUS_HEAL', isFavorite: false },
  { id: 'item_bicycle', name: 'BICYCLE', displayName: 'Bicycle', description: 'Hop on to fly through Pallet Town at dual movement speed!', quantity: 1, category: 'KEY_ITEM', isFavorite: false },
  { id: 'item_town_map', name: 'TOWN_MAP', displayName: 'Town Map', description: 'Displays an interactive digital geographic layout of Pallet Town.', quantity: 1, category: 'KEY_ITEM', isFavorite: false }
];

const createInitialPokedex = () => {
  const dex: Record<string, { seen: boolean; caught: boolean }> = {};
  Object.keys(POKEDEX_CATALOG).forEach((name) => {
    dex[name] = { seen: false, caught: false };
  });
  return dex;
};

const createInitialQuests = (): Quest[] => [
  {
    id: 'starter_quest',
    title: 'Choose Your Partner',
    description: 'Visit Oak\'s Laboratory and choose your first partner Pokémon from the Starter Table.',
    progress: 0,
    maxProgress: 1,
    completed: false,
    category: 'EXPLORE'
  },
  {
    id: 'town_sign',
    title: 'Orient Yourself',
    description: 'Read the high-contrast golden Town Signboard at (8,4) to understand the landscape.',
    progress: 0,
    maxProgress: 1,
    completed: false,
    category: 'EXPLORE'
  },
  {
    id: 'explore_lab',
    title: "Oak's Research Dome",
    description: "Walk up and visit Professor Oak's advanced research center near (7.5,9).",
    progress: 0,
    maxProgress: 1,
    completed: false,
    category: 'EXPLORE'
  },
  {
    id: 'catch_pokemon',
    title: 'Catch a Wild Pokémon',
    description: 'Throw a Poké-Ball to catch a wild teammate inside the leafy tall grass.',
    progress: 0,
    maxProgress: 1,
    completed: false,
    category: 'RESEARCH'
  },
  {
    id: 'pokedex_research',
    title: 'Register 3 Species',
    description: 'Scout of visual species to seen/catch at least 3 distinct types in your Dex catalog.',
    progress: 0,
    maxProgress: 3,
    completed: false,
    category: 'RESEARCH'
  },
  {
    id: 'level_up',
    title: 'Active Partner Training',
    description: 'Gain tactical combat victories in tall grass to grow your main Pokémon to Level 7.',
    progress: 0,
    maxProgress: 7,
    completed: false,
    category: 'TRAINING'
  },
  {
    id: 'hidden_treasure',
    title: 'Secret Collector',
    description: "Search for a hidden, dust-coated artifact box tucked behind Red's home around (1,1).",
    progress: 0,
    maxProgress: 1,
    completed: false,
    category: 'EXPLORE'
  }
];

const syncQuests = (quests: Quest[], party: Pokemon[], pokedex: Record<string, any>, currentPos: [number, number], readSign: boolean, starterChosen?: boolean): Quest[] => {
  return quests.map(q => {
    if (q.completed) return q;
    const updated = { ...q };

    if (updated.id === 'starter_quest') {
      if (starterChosen || party.length > 0) {
        updated.progress = 1;
        updated.completed = true;
      }
    }
    
    else if (updated.id === 'town_sign') {
      if (readSign) {
        updated.progress = 1;
        updated.completed = true;
      }
    } 
    
    else if (updated.id === 'explore_lab') {
      const [x, z] = currentPos;
      // Laboratory coordinates range [5, 8] to [9, 10]
      if (x >= 5 && x <= 9 && z >= 8 && z <= 10) {
        updated.progress = 1;
        updated.completed = true;
      }
    } 
    
    else if (updated.id === 'catch_pokemon') {
      // Caught at least 1 wild pokemon if party length increases
      if (party.length >= 2) {
        updated.progress = 1;
        updated.completed = true;
      }
    } 
    
    else if (updated.id === 'level_up') {
      const maxLevel = party.length > 0 ? Math.max(...party.map(p => p.level)) : 0;
      updated.progress = Math.min(updated.maxProgress, maxLevel);
      if (updated.progress >= updated.maxProgress) {
        updated.completed = true;
      }
    } 
    
    else if (updated.id === 'pokedex_research') {
      const seenOrCaught = Object.values(pokedex).filter(d => d.seen || d.caught).length;
      updated.progress = Math.min(updated.maxProgress, seenOrCaught);
      if (updated.progress >= updated.maxProgress) {
        updated.completed = true;
      }
    } 
    


    return updated;
  });
};

interface GameState {
  mode: GameMode;
  position: [number, number];
  targetPosition: [number, number];
  facing: Direction;
  isMoving: boolean;
  dialogue: string | null;
  interactedObject: string | null;
  
  potions: number;
  pokeballs: number;
  gold: number;
  inventoryItems: InventoryItem[];
  bicycleActive: boolean;
  showTownMap: boolean;
  party: Pokemon[];
  pcBox: Pokemon[];
  pokedex: Record<string, { seen: boolean; caught: boolean }>;
  battle: BattleState;

  quests: Quest[];
  soundEnabled: boolean;
  bgmEnabled: boolean;
  starterChosen: boolean;
  showStarterModal: boolean;
  metOak: boolean;
  readSign: boolean;
  hiddenTreasureClaimed: boolean;

  actions: {
    startMove: (dir: Direction, newPos: [number, number]) => void;
    endMove: () => void;
    setFacing: (dir: Direction) => void;
    showDialogue: (text: string) => void;
    clearDialogue: () => void;
    
    startBattle: (opponent: Pokemon) => void;
    endBattle: () => void;
    setBattleMenuState: (menuState: BattleState['menuState']) => void;
    addBattleLog: (message: string) => void;
    clearBattleLog: () => void;
    shiftBattleLog: () => void;
    applyDamage: (target: 'PLAYER' | 'OPPONENT', amount: number) => void;
    setTurn: (turn: BattleState['turn']) => void;
    usePotion: () => void;
    usePokeball: () => void;
    healPlayer: (amount: number) => void;
    applyStatusEffect: (target: 'PLAYER' | 'OPPONENT', effect: StatusEffect) => void;
    applyStatMod: (target: 'PLAYER' | 'OPPONENT', mod: StatMod, stages: number) => void;
    resetStatStages: (target: 'PLAYER' | 'OPPONENT') => void;
    gainVictory: () => void;
    resetGame: () => void;

    // PC Storage System actions
    depositPokemon: (idx: number) => void;
    withdrawPokemon: (idx: number) => void;
    releasePokemon: (id: string, isFromParty: boolean) => void;
    healStoredPokemon: () => void;
    swapPartyMembers: (idx: number) => void;    
    toggleSound: () => void;
    toggleBgm: () => void;
    triggerReadSign: () => void;
    claimHiddenTreasure: () => void;
    
    toggleFavoriteItem: (id: string) => void;
    useOverworldItem: (id: string) => void;
    closeTownMap: () => void;
    openStarterModal: () => void;
    closeStarterModal: () => void;
    chooseStarter: (name: string) => void;
  };
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      mode: 'OVERWORLD',
      position: [7, 11],
      targetPosition: [7, 11],
      facing: 'UP',
      isMoving: false,
      dialogue: null,
      interactedObject: null,
      
      potions: 5,
      pokeballs: 5,
      gold: 120,
      inventoryItems: createInitialInventory(),
      bicycleActive: false,
      showTownMap: false,
      party: [],
      pcBox: [
        {
          id: 'pc1',
          name: 'PIDGEY',
          level: 4,
          hp: 18,
          maxHp: 18,
          color: '#d4a373',
          xp: 20,
          maxXp: 110,
          moves: [
            { name: 'TACKLE', power: 3, type: 'NORMAL', category: 'PHYSICAL' },
            { name: 'GUST', power: 4, type: 'FLYING', category: 'SPECIAL' }
          ] as Move[]
        },
        {
          id: 'pc2',
          name: 'RATTATA',
          level: 3,
          hp: 16,
          maxHp: 16,
          color: '#be4bdb',
          xp: 15,
          maxXp: 90,
          moves: [
            { name: 'TACKLE', power: 3, type: 'NORMAL', category: 'PHYSICAL' },
            { name: 'QUICK ATTACK', power: 4, type: 'NORMAL', category: 'PHYSICAL' }
          ] as Move[]
        }
      ],
      pokedex: createInitialPokedex(),        battle: {
          ...BATTLE_BASE,
          opponent: null,
          playerActiveIndex: 0,
          turn: 'PLAYER',
          log: [],
          menuState: 'MAIN',
        },

      quests: createInitialQuests(),
      soundEnabled: true,
      bgmEnabled: true,
      readSign: false,
      hiddenTreasureClaimed: false,
      starterChosen: false,
      showStarterModal: false,
      metOak: false,

      actions: {
        startMove: (dir, newPos) =>
          set({ facing: dir, targetPosition: newPos, isMoving: true }),
        
        endMove: () => {
          set((state) => {
            const nextPos = state.targetPosition;
            const x = nextPos[0];
            const z = nextPos[1];
            const tile = mapGrid[z]?.[x];
            
            let finalState: Partial<GameState> = { position: nextPos, isMoving: false };

            // Checking if the step leads to a Wild Pokémon encounter in Grass
            if (tile === TileType.GRASS && state.mode === 'OVERWORLD') {
              if (Math.random() < 0.14) { // 14% step-encounter chance
                const wildOpponent = generateWildPokemon();
                
                // Immediately register species as SEEN in our Pokedex
                const nextPokedex = { ...state.pokedex };
                if (!nextPokedex[wildOpponent.name]) {
                  nextPokedex[wildOpponent.name] = { seen: true, caught: false };
                } else {
                  nextPokedex[wildOpponent.name].seen = true;
                }

                // Play encounter transition sound effect
                soundManager.playSFX('hit');
                setTimeout(() => {
                  soundManager.syncBGMWithState();
                }, 60);

                finalState = {
                  position: nextPos,
                  isMoving: false,
                  mode: 'BATTLE',
                  pokedex: nextPokedex,
                  battle: {
                    ...BATTLE_BASE,
                    opponent: wildOpponent,
                    playerActiveIndex: 0,
                    turn: 'PLAYER',
                    log: [`A wild ${wildOpponent.name} appeared!${state.party[0] ? ` Go, ${state.party[0].name}!` : ''}`],
                    menuState: 'MAIN'
                  }
                };
              } else {
                // Grass step sound effect
                soundManager.playSFX('rustle');
              }
            }

            // Check if player just entered Oak's Lab for the first time
            const xCoord = nextPos[0];
            const zCoord = nextPos[1];
            const insideLab = xCoord >= 5 && xCoord <= 9 && zCoord >= 8 && zCoord <= 10;
            const oakIntroShown = insideLab && !state.metOak && !state.starterChosen && state.party.length === 0;

            // Synchronize Quests logic
            const partyToUse = finalState.party ?? state.party;
            const pokedexToUse = finalState.pokedex ?? state.pokedex;
            const updatedQuests = syncQuests(state.quests, partyToUse, pokedexToUse, nextPos, state.readSign, state.starterChosen);

            return {
              ...finalState,
              quests: updatedQuests,
              ...(oakIntroShown ? {
                dialogue: "PROFESSOR OAK: 'Ah, Red! Perfect timing, my boy! I've been expecting you. Step right up — what I have here is the choice of a lifetime!'",
                metOak: true as const,
              } : {})
            };
          });
        },
        
        setFacing: (dir) => set({ facing: dir }),
        showDialogue: (text) => {
          soundManager.playSFX('click');
          set({ dialogue: text });
        },
        clearDialogue: () => {
          soundManager.playSFX('click');
          set({ dialogue: null });
        },
        
        startBattle: (opponent) => {
          set((state) => {
            const nextPokedex = { ...state.pokedex };
            if (!nextPokedex[opponent.name]) {
              nextPokedex[opponent.name] = { seen: true, caught: false };
            } else {
              nextPokedex[opponent.name].seen = true;
            }

            // Sync music
            soundManager.playSFX('hit');
            setTimeout(() => {
              soundManager.syncBGMWithState();
            }, 60);

            const updatedQuests = syncQuests(state.quests, state.party, nextPokedex, state.position, state.readSign, state.starterChosen);

            return {
              mode: 'BATTLE',
              pokedex: nextPokedex,
              quests: updatedQuests,
              battle: {
                ...BATTLE_BASE,
                opponent,
                playerActiveIndex: 0,
                turn: 'PLAYER',
                log: [`Wild ${opponent.name} appeared!`],
                menuState: 'MAIN'
              }
            };
          });
        },

        endBattle: () => set((state) => {
            const party = [...state.party];
            // Safe fallback heals to let players continue
            if (party[0] && party[0].hp <= 0) {
              party[0].hp = Math.floor(party[0].maxHp * 0.5);
            }
            
            // Sync music
            setTimeout(() => {
              soundManager.syncBGMWithState();
            }, 60);

            const updatedQuests = syncQuests(state.quests, party, state.pokedex, state.position, state.readSign, state.starterChosen);

            return { 
              mode: 'OVERWORLD', 
              battle: { ...state.battle, opponent: null, log: [] },
              party,
              quests: updatedQuests
            };
        }),

        setBattleMenuState: (menuState) => {
          soundManager.playSFX('click');
          set((state) => ({ battle: { ...state.battle, menuState } }));
        },
        addBattleLog: (message) => set((state) => ({ battle: { ...state.battle, log: [...state.battle.log, message] } })),
        shiftBattleLog: () => set((state) => ({ battle: { ...state.battle, log: state.battle.log.slice(1) } })),
        clearBattleLog: () => set((state) => ({ battle: { ...state.battle, log: [] } })),
        setTurn: (turn) => set((state) => ({ battle: { ...state.battle, turn } })),
        
        applyDamage: (target, amount) => set((state) => {
          // Play hit physical strike sound
          soundManager.playSFX('hit');
          if (target === 'OPPONENT' && state.battle.opponent) {
            return {
              battle: {
                ...state.battle,
                opponent: {
                  ...state.battle.opponent,
                  hp: Math.max(0, state.battle.opponent.hp - amount)
                }
              }
            };
          } else if (target === 'PLAYER') {
            const party = [...state.party];
            const active = party[state.battle.playerActiveIndex];
            active.hp = Math.max(0, active.hp - amount);
            return { party };
          }
          return state;
        }),

        healPlayer: (amount) => set((state) => {
            const party = [...state.party];
            const active = party[state.battle.playerActiveIndex];
            active.hp = Math.min(active.maxHp, active.hp + amount);
            return { party };
        }),

        applyStatusEffect: (target, effect) => set((state) => {
          if (target === 'PLAYER') {
            return { battle: { ...state.battle, playerStatus: effect } };
          } else {
            return { battle: { ...state.battle, opponentStatus: effect } };
          }
        }),

        applyStatMod: (target, mod, stages) => set((state) => {
          const clamp = (v: number) => Math.max(-6, Math.min(6, v));
          if (target === 'PLAYER') {
            const newStages = { ...state.battle.playerStatStages };
            if (mod === 'ATK') newStages.atk = clamp(newStages.atk + stages);
            if (mod === 'DEF') newStages.def = clamp(newStages.def + stages);
            if (mod === 'SPD') newStages.spd = clamp(newStages.spd + stages);
            if (mod === 'ACC') newStages.acc = clamp(newStages.acc + stages);
            return { battle: { ...state.battle, playerStatStages: newStages } };
          } else {
            const newStages = { ...state.battle.opponentStatStages };
            if (mod === 'ATK') newStages.atk = clamp(newStages.atk + stages);
            if (mod === 'DEF') newStages.def = clamp(newStages.def + stages);
            if (mod === 'SPD') newStages.spd = clamp(newStages.spd + stages);
            if (mod === 'ACC') newStages.acc = clamp(newStages.acc + stages);
            return { battle: { ...state.battle, opponentStatStages: newStages } };
          }
        }),

        resetStatStages: (target) => set((state) => {
          if (target === 'PLAYER') {
            return { battle: { ...state.battle, playerStatStages: { ...DEFAULT_STAT_STAGES } } };
          } else {
            return { battle: { ...state.battle, opponentStatStages: { ...DEFAULT_STAT_STAGES } } };
          }
        }),

        usePotion: () => set((state) => {
          soundManager.playSFX('heal');
          const nextItems = (state.inventoryItems || []).map(item =>
            item.name === 'POTION' ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item
          );
          return { potions: Math.max(0, state.potions - 1), inventoryItems: nextItems };
        }),

        usePokeball: () => set((state) => {
          if (state.pokeballs <= 0 || !state.battle.opponent) return state;

          const opponent = state.battle.opponent;
          const nextPokeballs = state.pokeballs - 1;
          const nextItems = (state.inventoryItems || []).map(item =>
            item.name === 'POKEBALL' ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item
          );
          const captureSuccessful = Math.random() < 0.70; // High success rate (70%) for enjoyable gameplay

          const logs = [`You threw a POKéBALL!`, `Wobble...`, `Wobble...`];
          const nextPokedex = { ...state.pokedex };
          const nextParty = [...state.party];
          const nextPcBox = [...(state.pcBox || [])];

          if (captureSuccessful) {
            logs.push(`Gotcha! ${opponent.name} was caught!`);
            
            // Register caught in pokedex
            nextPokedex[opponent.name] = { seen: true, caught: true };

            // Add caught Pokémon to party if party has room (< 6)
            if (nextParty.length < 6) {
              nextParty.push({
                ...opponent,
                id: Math.random().toString(),
                hp: opponent.hp > 0 ? opponent.hp : opponent.maxHp // heal if dead/captured
              });
              logs.push(`${opponent.name} was added to your battle party!`);
            } else {
              nextPcBox.push({
                ...opponent,
                id: Math.random().toString(),
                hp: opponent.hp > 0 ? opponent.hp : opponent.maxHp,
                xp: 0,
                maxXp: opponent.level * 20 + 30
              });
              logs.push(`${opponent.name} was sent link-transfer to the PC Storage!`);
            }
            // Capture fanfare melody sfx
            soundManager.playSFX('capture_success');
          } else {
            logs.push(`Oh no! The wild ${opponent.name} broke free!`);
            soundManager.playSFX('capture_fail');
          }

          const updatedQuests = syncQuests(state.quests, nextParty, nextPokedex, state.position, state.readSign, state.starterChosen);

          return {
            pokeballs: nextPokeballs,
            inventoryItems: nextItems,
            pokedex: nextPokedex,
            party: nextParty,
            pcBox: nextPcBox,
            quests: updatedQuests,
            battle: {
              ...state.battle,
              log: [...state.battle.log, ...logs],
              turn: captureSuccessful ? 'END' : 'OPPONENT'
            }
          };
        }),

        gainVictory: () => set((state) => {
          if (!state.battle.opponent) return state;
          
          const opponent = state.battle.opponent;
          const nextParty = [...state.party];
          const active = nextParty[state.battle.playerActiveIndex];
          const nextPokedex = { ...state.pokedex };

          const logs: string[] = [];

          // Dynamic calculation of XP and Gold rewards
          const xpGained = opponent.level * 25 + Math.floor(Math.random() * 15) + 10;
          const goldEarned = opponent.level * 15 + Math.floor(Math.random() * 10) + 10;
          
          const currentXp = active.xp ?? 0;
          const currentMaxXp = active.maxXp ?? (active.level * 20 + 30);
          
          let nextXp = currentXp + xpGained;
          let nextMaxXp = currentMaxXp;
          let nextLevel = active.level;
          let leveledUp = false;
          
          if (nextXp >= currentMaxXp) {
            nextXp = nextXp - currentMaxXp;
            nextLevel += 1;
            nextMaxXp = nextLevel * 20 + 30;
            leveledUp = true;
            
            active.level = nextLevel;
            // Scale HP
            const catalogEntry = POKEDEX_CATALOG[active.name] || POKEDEX_CATALOG.CHARMANDER;
            active.maxHp = catalogEntry.baseHp + (nextLevel * 2);
            active.hp = Math.min(active.maxHp, active.hp + 5); // small victory heal!
            
            logs.push(`${active.name} grew to Level ${nextLevel}!`);
            soundManager.playSFX('level_up');
          }
          
          active.xp = nextXp;
          active.maxXp = nextMaxXp;

          // Check for Evolution
          let evolvedSpecies: string | null = null;
          if (leveledUp) {
            const possibleEvo = checkEvolution(active.name, nextLevel);
            if (possibleEvo) {
              const evoCatalog = POKEDEX_CATALOG[possibleEvo];
              if (evoCatalog) {
                logs.push(`What? Your ${active.name} is evolving!`);
                logs.push(`Congratulations! ${active.name} evolved into ${possibleEvo}!`);

                active.name = possibleEvo;
                active.color = evoCatalog.color;
                active.maxHp = evoCatalog.baseHp + (nextLevel * 2);
                active.hp = active.maxHp; // full recovery upon evolution!
                active.moves = evoCatalog.moves.map(m => ({ ...m, category: 'PHYSICAL' as const })) as Move[];
                active.xp = 0; // reset XP on evolution to keep balance
                active.maxXp = nextLevel * 20 + 30;

                evolvedSpecies = possibleEvo;

                // Register evolved species as SEEN & CAUGHT in Pokedex
                nextPokedex[possibleEvo] = { seen: true, caught: true };
              }
            }
          }

          const updatedQuests = syncQuests(state.quests, nextParty, nextPokedex, state.position, state.readSign, state.starterChosen);

          return {
            party: nextParty,
            pokedex: nextPokedex,
            quests: updatedQuests,
            gold: (state.gold ?? 120) + goldEarned,
            battle: {
              ...state.battle,
              menuState: 'VICTORY',
              victoryRewards: {
                xpGained,
                goldEarned,
                leveledUp,
                newLevel: nextLevel,
                evolvedName: evolvedSpecies
              },
              log: [...state.battle.log, ...logs]
            }
          };
        }),

        resetGame: () => {
          localStorage.removeItem('pokemon-3d-save');
          set({
            mode: 'OVERWORLD',
            position: [7, 11],
            targetPosition: [7, 11],
            facing: 'UP',
            isMoving: false,
            dialogue: null,
            interactedObject: null,
            potions: 5,
            pokeballs: 5,
            gold: 120,
            inventoryItems: createInitialInventory(),
            bicycleActive: false,
            showTownMap: false,
            party: [],
            pokedex: createInitialPokedex(),
      quests: createInitialQuests(),
      soundEnabled: true,
            bgmEnabled: true,
            readSign: false,
            hiddenTreasureClaimed: false,
            starterChosen: false,
            showStarterModal: false,
            metOak: false,
            battle: {
              ...BATTLE_BASE,
              opponent: null,
              playerActiveIndex: 0,
              turn: 'PLAYER',
              log: [],
              menuState: 'MAIN',
              victoryRewards: null
            },
            pcBox: [
              {
                id: 'pc1',
                name: 'PIDGEY',
                level: 4,
                hp: 18,
                maxHp: 18,
                color: '#d4a373',
                xp: 20,
                maxXp: 110,
                moves: [
                  { name: 'TACKLE', power: 3, type: 'NORMAL', category: 'PHYSICAL' },
                  { name: 'GUST', power: 4, type: 'FLYING', category: 'SPECIAL' }
                ] as Move[]
              },
              {
                id: 'pc2',
                name: 'RATTATA',
                level: 3,
                hp: 16,
                maxHp: 16,
                color: '#be4bdb',
                xp: 15,
                maxXp: 90,
                moves: [
                  { name: 'TACKLE', power: 3, type: 'NORMAL', category: 'PHYSICAL' },
                  { name: 'QUICK ATTACK', power: 4, type: 'NORMAL', category: 'PHYSICAL' }
                ] as Move[]
              }
            ]
          });
          
          setTimeout(() => {
            soundManager.updateVolumeSettings();
          }, 50);
        },

        depositPokemon: (idx: number) => {
          set((state) => {
            const party = [...state.party];
            if (party.length <= 1) {
              return {
                dialogue: "OAK'S PC SYSTEM: Cannot deposit Pokémon! You must keep at least 1 active partner in your Battle Party."
              };
            }
            const pcBox = [...(state.pcBox || [])];
            const [deposited] = party.splice(idx, 1);
            
            // Auto-heal upon depositing
            deposited.hp = deposited.maxHp;

            pcBox.push(deposited);
            soundManager.playSFX('click');
            return {
              party,
              pcBox,
              dialogue: `OAK'S PC SYSTEM: Sucessfully deposited ${deposited.name} into Box Storage. Its health was fully restored!`
            };
          });
        },

        withdrawPokemon: (idx: number) => {
          set((state) => {
            const party = [...state.party];
            if (party.length >= 6) {
              return {
                dialogue: "OAK'S PC SYSTEM: Party is full (Max 6)! Deposit an active Pokémon before withdrawing another partner."
              };
            }
            const pcBox = [...(state.pcBox || [])];
            const [withdrawn] = pcBox.splice(idx, 1);
            party.push(withdrawn);
            soundManager.playSFX('level_up');
            return {
              party,
              pcBox,
              dialogue: `OAK'S PC SYSTEM: Successfully withdrew ${withdrawn.name} from Box Storage into your Battle Party!`
            };
          });
        },

        releasePokemon: (id: string, isFromParty: boolean) => {
          set((state) => {
            let releasedName = '';
            let nextParty = [...state.party];
            let nextPcBox = [...(state.pcBox || [])];

            if (isFromParty) {
              if (nextParty.length <= 1) {
                return {
                  dialogue: "OAK'S PC SYSTEM: Unable to release! You cannot release your only active Battle partner!"
                };
              }
              const idx = nextParty.findIndex(p => p.id === id);
              if (idx !== -1) {
                releasedName = nextParty[idx].name;
                nextParty.splice(idx, 1);
              }
            } else {
              const idx = nextPcBox.findIndex(p => p.id === id);
              if (idx !== -1) {
                releasedName = nextPcBox[idx].name;
                nextPcBox.splice(idx, 1);
              }
            }

            soundManager.playSFX('click');
            return {
              party: nextParty,
              pcBox: nextPcBox,
              dialogue: `Red released ${releasedName} into the wild meadows... Bye bye, ${releasedName}!`
            };
          });
        },

        healStoredPokemon: () => {
          set((state) => {
            const nextPcBox = (state.pcBox || []).map(p => ({
              ...p,
              hp: p.maxHp
            }));
            const nextParty = state.party.map(p => ({
              ...p,
              hp: p.maxHp
            }));
            soundManager.playSFX('heal');
            return {
              pcBox: nextPcBox,
              party: nextParty,
              dialogue: "OAK'S PC SYSTEM: Initialized full scan and recovery. All Party partners and Box Pokémon were restored to 100% HEALTH!"
            };
          });
        },

        swapPartyMembers: (idx: number) => {
          set((state) => {
            const nextParty = [...state.party];
            if (idx > 0 && idx < nextParty.length) {
              const temp = nextParty[0];
              nextParty[0] = nextParty[idx];
              nextParty[idx] = temp;
            }
            return { party: nextParty };
          });
        },

        toggleSound: () => {
          set((state) => {
            const nextSound = !state.soundEnabled;
            // Brief timeout lets zustand push the state to storage before sound manager reads it
            setTimeout(() => {
              soundManager.updateVolumeSettings();
            }, 20);
            return { soundEnabled: nextSound };
          });
        },

        toggleBgm: () => {
          set((state) => {
            const nextBgm = !state.bgmEnabled;
            setTimeout(() => {
              soundManager.updateVolumeSettings();
            }, 20);
            return { bgmEnabled: nextBgm };
          });
        },

        triggerReadSign: () => {
          set((state) => {
            const updatedQuests = syncQuests(state.quests, state.party, state.pokedex, state.position, true, state.starterChosen);
            return {
              readSign: true,
              quests: updatedQuests
            };
          });
        },

        claimHiddenTreasure: () => {
          set((state) => {
            if (state.hiddenTreasureClaimed) {
              return {
                dialogue: "SECRET TRUNK: Red inspected the old box again... There's nothing inside but dry leaves and cobwebs."
              };
            }
            
            const nextItems = (state.inventoryItems || []).map(item => {
              if (item.name === 'GREATBALL') {
                return { ...item, quantity: item.quantity + 3 };
              }
              if (item.name === 'MASTERBALL') {
                return { ...item, quantity: item.quantity + 1 };
              }
              if (item.name === 'HYPER_POTION') {
                return { ...item, quantity: item.quantity + 1 };
              }
              return item;
            });
            
            const nextGold = (state.gold ?? 120) + 250;
            const updatedQuests = state.quests.map(q => {
              if (q.id === 'hidden_treasure') {
                return { ...q, progress: 1, completed: true };
              }
              return q;
            });

            soundManager.playSFX('level_up');
            
            return {
              hiddenTreasureClaimed: true,
              gold: nextGold,
              inventoryItems: nextItems,
              quests: updatedQuests,
              dialogue: "SECRET TRUNK: Red discovered the dusty chest hidden behind his home! Found 3x GREAT BALLS, 1x MASTER BALL, 1x HYPER POTION, and 250 GOLD!"
            };
          });
        },

        toggleFavoriteItem: (id) => {
          soundManager.playSFX('click');
          set((state) => ({
            inventoryItems: (state.inventoryItems || []).map(item =>
              item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
            )
          }));
        },

        useOverworldItem: (id) => {
          set((state) => {
            const item = (state.inventoryItems || []).find(i => i.id === id);
            if (!item || item.quantity <= 0) return state;

            const nextItems = state.inventoryItems.map(i => {
              if (i.id === id) {
                const nextQty = i.category === 'KEY_ITEM' ? i.quantity : i.quantity - 1;
                return { ...i, quantity: nextQty };
              }
              return i;
            });

            const activePokemon = state.party[0];

            // Guard: no party member yet
            if (!activePokemon && (item.category === 'RECOVERY' || item.category === 'STATUS_HEAL')) {
              return { dialogue: `You don't have a Pokémon partner yet! Visit Oak's Lab to choose your first partner.` };
            }

            // 1. RECOVERY ITEMS
            if (item.category === 'RECOVERY' && item.effectPower) {
              if (activePokemon && activePokemon.hp >= activePokemon.maxHp) {
                return { dialogue: `${activePokemon.name} is already at full health!` };
              }
              soundManager.playSFX('heal');
              const nextParty = [...state.party];
              if (!nextParty[0]) return state;
              nextParty[0] = {
                ...activePokemon,
                hp: Math.min(activePokemon.maxHp, activePokemon.hp + item.effectPower),
              };
              
              let nextPotions = state.potions;
              if (item.name === 'POTION') {
                nextPotions = Math.max(0, state.potions - 1);
              }

              return {
                inventoryItems: nextItems,
                party: nextParty,
                potions: nextPotions,
                dialogue: `RECOVERED: You used a ${item.displayName}! Restored ${item.effectPower} HP to ${activePokemon.name}!`
              };
            }

            // 2. CAPTURE ITEMS
            if (item.category === 'CAPTURE') {
              return {
                dialogue: `${item.displayName} is a capturing gear! You must wait until you are in combat with a wild Pokémon to throw it.`
              };
            }

            // 3. STATUS HEAL
            if (item.category === 'STATUS_HEAL') {
              soundManager.playSFX('heal');
              return {
                inventoryItems: nextItems,
                dialogue: `CURED: Sprayed ${item.displayName} on ${activePokemon.name}! It feels full of vim and vigor!`
              };
            }

            // 4. BICYCLE
            if (item.name === 'BICYCLE') {
              soundManager.playSFX('level_up');
              const nextBike = !state.bicycleActive;
              return {
                bicycleActive: nextBike,
                dialogue: nextBike 
                  ? `BICYCLE: Red hopped onto the awesome yellow Bicycle! You can now zip through Pallet Town at dual speeds!`
                  : `BICYCLE: Red got off the Bicycle and returned it to the pack.`
              };
            }

            // 5. TOWN MAP
            if (item.name === 'TOWN_MAP') {
              soundManager.playSFX('click');
              return {
                showTownMap: true,
                dialogue: `TOWN MAP: Switched on the high-fidelity Town Navigator coordinates layout.`
              };
            }

            return state;
          });
        },

        closeTownMap: () => {
          soundManager.playSFX('click');
          set({ showTownMap: false });
        },

        openStarterModal: () => {
          soundManager.playSFX('click');
          set({ showStarterModal: true });
        },

        closeStarterModal: () => {
          soundManager.playSFX('click');
          set({ showStarterModal: false });
        },



        chooseStarter: (name) => {
          set((state) => {
            let starter: Pokemon;
            
            if (name === 'BULBASAUR') {
              starter = {
                id: 'p1',
                name: 'BULBASAUR',
                level: 5,
                hp: 20,
                maxHp: 20,
                color: '#38d9a9',
                xp: 0,
                maxXp: 130,
                moves: [
                  { name: 'TACKLE', power: 4, type: 'NORMAL', category: 'PHYSICAL' },
                  { name: 'VINE WHIP', power: 6, type: 'GRASS', category: 'PHYSICAL' }
                ] as Move[]
              };
            } else if (name === 'CHARMANDER') {
              starter = {
                id: 'p1',
                name: 'CHARMANDER',
                level: 5,
                hp: 20,
                maxHp: 20,
                color: '#ff922b',
                xp: 0,
                maxXp: 130,
                moves: [
                  { name: 'SCRATCH', power: 4, type: 'NORMAL', category: 'PHYSICAL' },
                  { name: 'EMBER', power: 6, type: 'FIRE', category: 'SPECIAL' }
                ] as Move[]
              };
            } else { // SQUIRTLE
              starter = {
                id: 'p1',
                name: 'SQUIRTLE',
                level: 5,
                hp: 22,
                maxHp: 22,
                color: '#4dabf7',
                xp: 0,
                maxXp: 130,
                moves: [
                  { name: 'TACKLE', power: 4, type: 'NORMAL', category: 'PHYSICAL' },
                  { name: 'WATER GUN', power: 6, type: 'WATER', category: 'SPECIAL' }
                ] as Move[]
              };
            }

            const nextPokedex = { ...state.pokedex };
            nextPokedex[name] = { seen: true, caught: true };

            const updatedQuests = state.quests.map(q => {
              if (q.id === 'starter_quest') {
                return { ...q, progress: 1, completed: true };
              }
              return q;
            });

            soundManager.playSFX('level_up');

            return {
              starterChosen: true,
              showStarterModal: false,
              party: [starter],
              pokedex: nextPokedex,
              quests: updatedQuests,
              dialogue: `PROFESSOR OAK: 'Excellent choice, Red! This ${name} is a fine partner! Now, be on your way — there's a whole world of Pokémon to discover! Take these Poké Balls and start your journey!'`
            };
          });
        }
      }
    }),
    {
      name: 'pokemon-3d-save',
      partialize: (state) => ({
        position: state.position,
        targetPosition: state.targetPosition,
        facing: state.facing,
        potions: state.potions,
        pokeballs: state.pokeballs,
        gold: state.gold,
        inventoryItems: state.inventoryItems,
        bicycleActive: state.bicycleActive,
        showTownMap: state.showTownMap,
        party: state.party,
        pcBox: state.pcBox,
        pokedex: state.pokedex,
        quests: state.quests,
        soundEnabled: state.soundEnabled,
        bgmEnabled: state.bgmEnabled,
        metOak: state.metOak,
        readSign: state.readSign,
        hiddenTreasureClaimed: state.hiddenTreasureClaimed,
        starterChosen: state.starterChosen
      })
    }
  )
);
