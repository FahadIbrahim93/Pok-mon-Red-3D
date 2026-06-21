import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mapGrid, TileType } from '../game/MapData';
import { POKEDEX_CATALOG, checkEvolution, generateWildPokemon } from '../game/pokemonData';
import { soundManager } from '../game/soundManager';

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type GameMode = 'OVERWORLD' | 'BATTLE';

export interface Move {
  name: string;
  power: number;
  type: string;
}

export interface Pokemon {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  moves: Move[];
  color: string;
}

export interface BattleState {
  opponent: Pokemon | null;
  playerActiveIndex: number;
  turn: 'PLAYER' | 'OPPONENT' | 'END';
  log: string[];
  menuState: 'MAIN' | 'FIGHT' | 'ITEM';
}

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
    dex[name] = {
      seen: name === 'CHARMANDER',
      caught: name === 'CHARMANDER',
    };
  });
  return dex;
};

const createInitialQuests = (): Quest[] => [
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
    progress: 1, // Charmander is registered seen+caught
    maxProgress: 3,
    completed: false,
    category: 'RESEARCH'
  },
  {
    id: 'level_up',
    title: 'Active Partner Training',
    description: 'Gain tactical combat victories in tall grass to grow your main Pokémon to Level 7.',
    progress: 5,
    maxProgress: 7,
    completed: false,
    category: 'TRAINING'
  }
];

const syncQuests = (quests: Quest[], party: Pokemon[], pokedex: Record<string, any>, currentPos: [number, number], readSign: boolean): Quest[] => {
  return quests.map(q => {
    if (q.completed) return q;
    const updated = { ...q };

    if (updated.id === 'town_sign') {
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
    
    else if (updated.id === 'pokedex_research') {
      const seenOrCaught = Object.values(pokedex).filter(d => d.seen || d.caught).length;
      updated.progress = Math.min(updated.maxProgress, seenOrCaught);
      if (updated.progress >= updated.maxProgress) {
        updated.completed = true;
      }
    } 
    
    else if (updated.id === 'level_up') {
      const maxLevel = Math.max(...party.map(p => p.level), 5);
      updated.progress = Math.min(updated.maxProgress, maxLevel);
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
  inventoryItems: InventoryItem[];
  bicycleActive: boolean;
  showTownMap: boolean;
  party: Pokemon[];
  pokedex: Record<string, { seen: boolean; caught: boolean }>;
  battle: BattleState;

  quests: Quest[];
  soundEnabled: boolean;
  bgmEnabled: boolean;
  readSign: boolean;

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
    gainVictory: () => void;
    resetGame: () => void;

    toggleSound: () => void;
    toggleBgm: () => void;
    triggerReadSign: () => void;
    
    toggleFavoriteItem: (id: string) => void;
    useOverworldItem: (id: string) => void;
    closeTownMap: () => void;
  };
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      mode: 'OVERWORLD',
      position: [5, 4],
      targetPosition: [5, 4],
      facing: 'DOWN',
      isMoving: false,
      dialogue: null,
      interactedObject: null,
      
      potions: 5,
      pokeballs: 5,
      inventoryItems: createInitialInventory(),
      bicycleActive: false,
      showTownMap: false,
      party: [
        {
          id: 'p1',
          name: 'CHARMANDER',
          level: 5,
          hp: 20,
          maxHp: 20,
          color: '#ff922b',
          moves: [
            { name: 'SCRATCH', power: 4, type: 'NORMAL' },
            { name: 'EMBER', power: 6, type: 'FIRE' }
          ]
        }
      ],
      pokedex: createInitialPokedex(),
      battle: {
        opponent: null,
        playerActiveIndex: 0,
        turn: 'PLAYER',
        log: [],
        menuState: 'MAIN'
      },

      quests: createInitialQuests(),
      soundEnabled: true,
      bgmEnabled: true,
      readSign: false,

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
                    opponent: wildOpponent,
                    playerActiveIndex: 0,
                    turn: 'PLAYER',
                    log: [`A wild ${wildOpponent.name} appeared! Go, ${state.party[0].name}!`],
                    menuState: 'MAIN'
                  }
                };
              } else {
                // Grass step sound effect
                soundManager.playSFX('rustle');
              }
            }

            // Synchronize Quests logic
            const partyToUse = finalState.party ?? state.party;
            const pokedexToUse = finalState.pokedex ?? state.pokedex;
            const updatedQuests = syncQuests(state.quests, partyToUse, pokedexToUse, nextPos, state.readSign);
            
            return {
              ...finalState,
              quests: updatedQuests
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

            const updatedQuests = syncQuests(state.quests, state.party, nextPokedex, state.position, state.readSign);

            return {
              mode: 'BATTLE',
              pokedex: nextPokedex,
              quests: updatedQuests,
              battle: {
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
            if (party[0].hp <= 0) {
              party[0].hp = Math.floor(party[0].maxHp * 0.5);
            }
            
            // Sync music
            setTimeout(() => {
              soundManager.syncBGMWithState();
            }, 60);

            const updatedQuests = syncQuests(state.quests, party, state.pokedex, state.position, state.readSign);

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
              logs.push(`${opponent.name} was sent link-transfer to the PC Storage!`);
            }
            // Capture fanfare melody sfx
            soundManager.playSFX('capture_success');
          } else {
            logs.push(`Oh no! The wild ${opponent.name} broke free!`);
            soundManager.playSFX('capture_fail');
          }

          const updatedQuests = syncQuests(state.quests, nextParty, nextPokedex, state.position, state.readSign);

          return {
            pokeballs: nextPokeballs,
            inventoryItems: nextItems,
            pokedex: nextPokedex,
            party: nextParty,
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

          // Award active pokemon a level-up for victory!
          const prevLevel = active.level;
          const nextLevel = prevLevel + 1;
          
          active.level = nextLevel;
          // Scale HP
          const catalogEntry = POKEDEX_CATALOG[active.name] || POKEDEX_CATALOG.CHARMANDER;
          active.maxHp = catalogEntry.baseHp + (nextLevel * 2);
          active.hp = Math.min(active.maxHp, active.hp + 5); // small victory heal!

          logs.push(`${active.name} grew to Level ${nextLevel}!`);

          // Level up chime sfx
          soundManager.playSFX('level_up');

          // Check for Evolution
          const evolvedSpecies = checkEvolution(active.name, nextLevel);
          if (evolvedSpecies) {
            const evoCatalog = POKEDEX_CATALOG[evolvedSpecies];
            if (evoCatalog) {
              logs.push(`What? ${active.name} is evolving!`);
              logs.push(`Congratulations! Your ${active.name} evolved into ${evolvedSpecies}!`);

              active.name = evolvedSpecies;
              active.color = evoCatalog.color;
              active.maxHp = evoCatalog.baseHp + (nextLevel * 2);
              active.hp = active.maxHp; // full recovery upon evolution!
              active.moves = evoCatalog.moves.map(m => ({ ...m }));

              // Register evolved species as SEEN & CAUGHT in Pokedex
              nextPokedex[evolvedSpecies] = { seen: true, caught: true };
            }
          }

          const updatedQuests = syncQuests(state.quests, nextParty, nextPokedex, state.position, state.readSign);

          return {
            party: nextParty,
            pokedex: nextPokedex,
            quests: updatedQuests,
            battle: {
              ...state.battle,
              log: [...state.battle.log, ...logs]
            }
          };
        }),

        resetGame: () => {
          localStorage.removeItem('pokemon-3d-save');
          set({
            mode: 'OVERWORLD',
            position: [5, 4],
            targetPosition: [5, 4],
            facing: 'DOWN',
            isMoving: false,
            dialogue: null,
            interactedObject: null,
            potions: 5,
            pokeballs: 5,
            inventoryItems: createInitialInventory(),
            bicycleActive: false,
            showTownMap: false,
            party: [
              {
                id: 'p1',
                name: 'CHARMANDER',
                level: 5,
                hp: 20,
                maxHp: 20,
                color: '#ff922b',
                moves: [
                  { name: 'SCRATCH', power: 4, type: 'NORMAL' },
                  { name: 'EMBER', power: 6, type: 'FIRE' }
                ]
              }
            ],
            pokedex: createInitialPokedex(),
            quests: createInitialQuests(),
            soundEnabled: true,
            bgmEnabled: true,
            readSign: false,
            battle: {
              opponent: null,
              playerActiveIndex: 0,
              turn: 'PLAYER',
              log: [],
              menuState: 'MAIN'
            }
          });
          
          setTimeout(() => {
            soundManager.updateVolumeSettings();
          }, 50);
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
            const updatedQuests = syncQuests(state.quests, state.party, state.pokedex, state.position, true);
            return {
              readSign: true,
              quests: updatedQuests
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

            // 1. RECOVERY ITEMS
            if (item.category === 'RECOVERY' && item.effectPower) {
              if (activePokemon.hp >= activePokemon.maxHp) {
                return { dialogue: `${activePokemon.name} is already at full health!` };
              }
              soundManager.playSFX('heal');
              const nextParty = [...state.party];
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
        inventoryItems: state.inventoryItems,
        bicycleActive: state.bicycleActive,
        showTownMap: state.showTownMap,
        party: state.party,
        pokedex: state.pokedex,
        quests: state.quests,
        soundEnabled: state.soundEnabled,
        bgmEnabled: state.bgmEnabled,
        readSign: state.readSign
      })
    }
  )
);
