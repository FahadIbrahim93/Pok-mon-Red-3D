import { Pokemon } from '../store/gameStore';

export interface PokedexEntry {
  name: string;
  num: string;
  types: string[];
  description: string;
  color: string;
  evolutionChain: string[];
  baseHp: number;
  moves: { name: string; power: number; type: string }[];
}

export const POKEDEX_CATALOG: Record<string, PokedexEntry> = {
  BULBASAUR: {
    name: 'BULBASAUR',
    num: '001',
    types: ['GRASS', 'POISON'],
    description: 'A strange seed was planted on its back at birth. The plant sprouts and grows with this Pokémon.',
    color: '#38d9a9',
    evolutionChain: ['BULBASAUR', 'IVYSAUR', 'VENUSAUR'],
    baseHp: 20,
    moves: [
      { name: 'TACKLE', power: 3, type: 'NORMAL' },
      { name: 'VINE WHIP', power: 5, type: 'GRASS' }
    ]
  },
  IVYSAUR: {
    name: 'IVYSAUR',
    num: '002',
    types: ['GRASS', 'POISON'],
    description: 'When the bulb on its back grows large, it appears to lose the ability to stand on its hind legs.',
    color: '#0ca678',
    evolutionChain: ['BULBASAUR', 'IVYSAUR', 'VENUSAUR'],
    baseHp: 30,
    moves: [
      { name: 'VINE WHIP', power: 5, type: 'GRASS' },
      { name: 'RAZOR LEAF', power: 8, type: 'GRASS' }
    ]
  },
  VENUSAUR: {
    name: 'VENUSAUR',
    num: '003',
    types: ['GRASS', 'POISON'],
    description: 'Its flower is said to take on vivid colors if it gets plenty of nutrition and sunlight.',
    color: '#087f5b',
    evolutionChain: ['BULBASAUR', 'IVYSAUR', 'VENUSAUR'],
    baseHp: 45,
    moves: [
      { name: 'RAZOR LEAF', power: 8, type: 'GRASS' },
      { name: 'SOLAR BEAM', power: 15, type: 'GRASS' }
    ]
  },
  CHARMANDER: {
    name: 'CHARMANDER',
    num: '004',
    types: ['FIRE'],
    description: 'The flame at the tip of its tail makes a sound as it burns. You can tell its life force by the flame.',
    color: '#ff922b',
    evolutionChain: ['CHARMANDER', 'CHARMELEON', 'CHARIZARD'],
    baseHp: 20,
    moves: [
      { name: 'SCRATCH', power: 4, type: 'NORMAL' },
      { name: 'EMBER', power: 6, type: 'FIRE' }
    ]
  },
  CHARMELEON: {
    name: 'CHARMELEON',
    num: '005',
    types: ['FIRE'],
    description: 'In the hot climates where it lives, it rips at foes with its claws first, then spits high heat flames.',
    color: '#fd7e14',
    evolutionChain: ['CHARMANDER', 'CHARMELEON', 'CHARIZARD'],
    baseHp: 28,
    moves: [
      { name: 'EMBER', power: 6, type: 'FIRE' },
      { name: 'FLAMETHROWER', power: 9, type: 'FIRE' }
    ]
  },
  CHARIZARD: {
    name: 'CHARIZARD',
    num: '006',
    types: ['FIRE', 'FLYING'],
    description: 'Spits fire that is hot enough to melt boulders. Known to cause forest fires unintentionally.',
    color: '#e8590c',
    evolutionChain: ['CHARMANDER', 'CHARMELEON', 'CHARIZARD'],
    baseHp: 42,
    moves: [
      { name: 'FLAMETHROWER', power: 9, type: 'FIRE' },
      { name: 'FIRE BLAST', power: 14, type: 'FIRE' }
    ]
  },
  SQUIRTLE: {
    name: 'SQUIRTLE',
    num: '007',
    types: ['WATER'],
    description: 'Shoots pressurized water at prey from the water. Retracts into its shell when in danger.',
    color: '#4dabf7',
    evolutionChain: ['SQUIRTLE', 'WARTORTLE', 'BLASTOISE'],
    baseHp: 22,
    moves: [
      { name: 'TACKLE', power: 3, type: 'NORMAL' },
      { name: 'WATER GUN', power: 5, type: 'WATER' }
    ]
  },
  WARTORTLE: {
    name: 'WARTORTLE',
    num: '008',
    types: ['WATER'],
    description: 'It is clever at hiding in water. Its furry ears and tail are symbols of longevity and health.',
    color: '#228be6',
    evolutionChain: ['SQUIRTLE', 'WARTORTLE', 'BLASTOISE'],
    baseHp: 32,
    moves: [
      { name: 'WATER GUN', power: 5, type: 'WATER' },
      { name: 'HYDRO PUMP', power: 10, type: 'WATER' }
    ]
  },
  BLASTOISE: {
    name: 'BLASTOISE',
    num: '009',
    types: ['WATER'],
    description: 'A brutal Pokémon with water cannons on its shell. They can burst high speed water rockets.',
    color: '#1c7ed6',
    evolutionChain: ['SQUIRTLE', 'WARTORTLE', 'BLASTOISE'],
    baseHp: 44,
    moves: [
      { name: 'HYDRO PUMP', power: 10, type: 'WATER' },
      { name: 'SURF', power: 12, type: 'WATER' }
    ]
  },
  CATERPIE: {
    name: 'CATERPIE',
    num: '010',
    types: ['BUG'],
    description: 'Its short feet are tipped with suction pads that enable it to tirelessly climb slopes and walls.',
    color: '#69db7c',
    evolutionChain: ['CATERPIE', 'METAPOD', 'BUTTERFREE'],
    baseHp: 13,
    moves: [
      { name: 'TACKLE', power: 2, type: 'NORMAL' },
      { name: 'STRING SHOT', power: 3, type: 'BUG' }
    ]
  },
  METAPOD: {
    name: 'METAPOD',
    num: '011',
    types: ['BUG'],
    description: 'This Pokémon is vulnerable to attack while its shell is soft, exposing its fragile body.',
    color: '#40c057',
    evolutionChain: ['CATERPIE', 'METAPOD', 'BUTTERFREE'],
    baseHp: 18,
    moves: [
      { name: 'HARDEN', power: 1, type: 'NORMAL' },
      { name: 'TACKLE', power: 3, type: 'NORMAL' }
    ]
  },
  BUTTERFREE: {
    name: 'BUTTERFREE',
    num: '012',
    types: ['BUG', 'FLYING'],
    description: 'In battle, it flaps its wings at high speed to release highly toxic sleep spores into the air.',
    color: '#4c6ef5',
    evolutionChain: ['CATERPIE', 'METAPOD', 'BUTTERFREE'],
    baseHp: 26,
    moves: [
      { name: 'GUST', power: 5, type: 'FLYING' },
      { name: 'BUG BUZZ', power: 9, type: 'BUG' }
    ]
  },
  PIDGEY: {
    name: 'PIDGEY',
    num: '016',
    types: ['NORMAL', 'FLYING'],
    description: 'Very docile. If attacked, it will often kick up sand to protect itself rather than fight back.',
    color: '#d4a373',
    evolutionChain: ['PIDGEY', 'PIDGEOTO', 'PIDGEOT'],
    baseHp: 15,
    moves: [
      { name: 'TACKLE', power: 3, type: 'NORMAL' },
      { name: 'GUST', power: 4, type: 'FLYING' }
    ]
  },
  PIDGEOTO: {
    name: 'PIDGEOTO',
    num: '017',
    types: ['NORMAL', 'FLYING'],
    description: 'This Pokémon is full of vitality. It constantly flies over its large territory in search of prey.',
    color: '#c48b53',
    evolutionChain: ['PIDGEY', 'PIDGEOTO', 'PIDGEOT'],
    baseHp: 25,
    moves: [
      { name: 'GUST', power: 5, type: 'FLYING' },
      { name: 'WING ATTACK', power: 7, type: 'FLYING' }
    ]
  },
  PIDGEOT: {
    name: 'PIDGEOT',
    num: '018',
    types: ['NORMAL', 'FLYING'],
    description: 'When hunting, it skims the surface of water at high speed to scoop up fish prey like Magikarp.',
    color: '#a36d35',
    evolutionChain: ['PIDGEY', 'PIDGEOTO', 'PIDGEOT'],
    baseHp: 38,
    moves: [
      { name: 'WING ATTACK', power: 7, type: 'FLYING' },
      { name: 'HURRICANE', power: 12, type: 'FLYING' }
    ]
  },
  RATTATA: {
    name: 'RATTATA',
    num: '019',
    types: ['NORMAL'],
    description: 'Bites anything when it attacks. Small and quick, it is a common sight in grassy plains.',
    color: '#be4bdb',
    evolutionChain: ['RATTATA', 'RATICATE'],
    baseHp: 14,
    moves: [
      { name: 'TACKLE', power: 3, type: 'NORMAL' },
      { name: 'QUICK ATTACK', power: 4, type: 'NORMAL' }
    ]
  },
  RATICATE: {
    name: 'RATICATE',
    num: '020',
    types: ['NORMAL'],
    description: 'It uses its tough whiskers to maintain balance. It slows down dramatically if they are clipped.',
    color: '#862e9c',
    evolutionChain: ['RATTATA', 'RATICATE'],
    baseHp: 24,
    moves: [
      { name: 'QUICK ATTACK', power: 4, type: 'NORMAL' },
      { name: 'HYPER FANG', power: 10, type: 'NORMAL' }
    ]
  },
  PIKACHU: {
    name: 'PIKACHU',
    num: '025',
    types: ['ELECTRIC'],
    description: 'When several of these Pokémon gather, their electricity could build and cause lightning storms.',
    color: '#fcc419',
    evolutionChain: ['PIKACHU', 'RAICHU'],
    baseHp: 18,
    moves: [
      { name: 'THUNDER SHOCK', power: 4, type: 'ELECTRIC' },
      { name: 'QUICK ATTACK', power: 4, type: 'NORMAL' }
    ]
  },
  RAICHU: {
    name: 'RAICHU',
    num: '026',
    types: ['ELECTRIC'],
    description: 'Its long tail serves as a ground to protect itself from its own high-voltage electrical power.',
    color: '#fab005',
    evolutionChain: ['PIKACHU', 'RAICHU'],
    baseHp: 30,
    moves: [
      { name: 'QUICK ATTACK', power: 4, type: 'NORMAL' },
      { name: 'THUNDERBOLT', power: 11, type: 'ELECTRIC' }
    ]
  }
};

// Returns a list of types for the given Pokémon species name
export const getPokemonTypes = (name: string): string[] => {
  const entry = POKEDEX_CATALOG[name.toUpperCase()];
  return entry ? entry.types : ['NORMAL'];
};

// Calculates the type multiplier (e.g. 2, 0.5, 1) and status description text
export const getTypeEffectiveness = (
  moveType: string,
  defenderTypes: string[]
): { multiplier: number; description: string } => {
  const normMoveType = moveType.toUpperCase();
  let multiplier = 1;

  const rules: Record<string, Record<string, number>> = {
    FIRE: { GRASS: 2, BUG: 2, FIRE: 0.5, WATER: 0.5 },
    WATER: { FIRE: 2, WATER: 0.5, GRASS: 0.5 },
    GRASS: { WATER: 2, FIRE: 0.5, GRASS: 0.5, POISON: 0.5, FLYING: 0.5, BUG: 0.5 },
    BUG: { GRASS: 2, FIRE: 0.5, FLYING: 0.5, POISON: 0.5 },
    FLYING: { GRASS: 2, BUG: 2, ELECTRIC: 0.5 },
    ELECTRIC: { WATER: 2, FLYING: 2, ELECTRIC: 0.5, GRASS: 0.5 },
    POISON: { GRASS: 2, POISON: 0.5 },
    NORMAL: {}
  };

  const moveRules = rules[normMoveType] || {};
  for (const defType of defenderTypes) {
    const normDefType = defType.toUpperCase();
    if (moveRules[normDefType] !== undefined) {
      multiplier *= moveRules[normDefType];
    }
  }

  let description = '';
  if (multiplier > 1) {
    description = "It's super effective!";
  } else if (multiplier > 0 && multiplier < 1) {
    description = "It's not very effective...";
  } else if (multiplier === 0) {
    description = "It has no effect...";
  }

  return { multiplier, description };
};

// Returns a new evolved Pokémon structure if target levels are reached
export const checkEvolution = (name: string, level: number): string | null => {
  const normName = name.toUpperCase();
  if (normName === 'BULBASAUR' && level >= 16) return 'IVYSAUR';
  if (normName === 'IVYSAUR' && level >= 32) return 'VENUSAUR';
  
  if (normName === 'CHARMANDER' && level >= 16) return 'CHARMELEON';
  if (normName === 'CHARMELEON' && level >= 36) return 'CHARIZARD';
  
  if (normName === 'SQUIRTLE' && level >= 16) return 'WARTORTLE';
  if (normName === 'WARTORTLE' && level >= 36) return 'BLASTOISE';
  
  if (normName === 'CATERPIE' && level >= 7) return 'METAPOD';
  if (normName === 'METAPOD' && level >= 10) return 'BUTTERFREE';
  
  if (normName === 'PIDGEY' && level >= 18) return 'PIDGEOTO';
  if (normName === 'PIDGEOTO' && level >= 36) return 'PIDGEOT';
  
  if (normName === 'RATTATA' && level >= 20) return 'RATICATE';
  if (normName === 'PIKACHU' && level >= 22) return 'RAICHU';
  
  return null;
};

// Generates wild pokemon with levels scaled from 2 to 5 with appropriate stats
export const generateWildPokemon = (): Pokemon => {
  const roll = Math.random();
  let species = 'RATTATA';

  if (roll < 0.25) {
    species = 'RATTATA';
  } else if (roll < 0.50) {
    species = 'PIDGEY';
  } else if (roll < 0.70) {
    species = 'CATERPIE';
  } else if (roll < 0.80) {
    // Starters show up at 10% each
    const starters = ['BULBASAUR', 'CHARMANDER', 'SQUIRTLE'];
    species = starters[Math.floor(Math.random() * starters.length)];
  } else if (roll < 0.95) {
    // PIKACHU is a 15% encounter rate
    species = 'PIKACHU';
  } else {
    // 5% chance of encountering mid-stage evolutions!
    const midStages = ['METAPOD', 'PIDGEOTO'];
    species = midStages[Math.floor(Math.random() * midStages.length)];
  }

  const catalogEntry = POKEDEX_CATALOG[species] || POKEDEX_CATALOG.RATTATA;
  const level = Math.floor(Math.random() * 4) + 2; // Lv 2-5
  const maxHp = catalogEntry.baseHp + (level * 2);

  return {
    id: Math.random().toString(),
    name: catalogEntry.name,
    level: level,
    hp: maxHp,
    maxHp: maxHp,
    color: catalogEntry.color,
    moves: catalogEntry.moves.map(m => ({ ...m }))
  };
};
