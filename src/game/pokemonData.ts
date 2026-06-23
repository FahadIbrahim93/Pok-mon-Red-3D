import { Pokemon, Move } from '../store/gameStore';

// Types for the Pokémon type system
export const POKEMON_TYPES = [
  'NORMAL', 'FIRE', 'WATER', 'ELECTRIC', 'GRASS', 'ICE',
  'FIGHTING', 'POISON', 'GROUND', 'FLYING', 'PSYCHIC', 'BUG',
  'ROCK', 'GHOST', 'DRAGON'
] as const;

export type PokemonType = typeof POKEMON_TYPES[number];

// Full move registry with categories and effects
export const MOVE_REGISTRY: Record<string, Move> = {
  // === PHYSICAL MOVES ===
  TACKLE:      { name: 'TACKLE',      power: 4,  type: 'NORMAL',  category: 'PHYSICAL' },
  SCRATCH:     { name: 'SCRATCH',     power: 4,  type: 'NORMAL',  category: 'PHYSICAL' },
  POUND:       { name: 'POUND',       power: 4,  type: 'NORMAL',  category: 'PHYSICAL' },
  VINE_WHIP:   { name: 'VINE WHIP',   power: 6,  type: 'GRASS',   category: 'PHYSICAL' },
  RAZOR_LEAF:  { name: 'RAZOR LEAF',  power: 8,  type: 'GRASS',   category: 'PHYSICAL' },
  SOLAR_BEAM:  { name: 'SOLAR BEAM',  power: 15, type: 'GRASS',   category: 'SPECIAL' },
  EMBER:       { name: 'EMBER',       power: 6,  type: 'FIRE',    category: 'SPECIAL' },
  FLAMETHROWER:{ name: 'FLAMETHROWER',power: 9,  type: 'FIRE',    category: 'SPECIAL' },
  FIRE_BLAST:  { name: 'FIRE BLAST',  power: 14, type: 'FIRE',    category: 'SPECIAL' },
  WATER_GUN:   { name: 'WATER GUN',   power: 6,  type: 'WATER',   category: 'SPECIAL' },
  HYDRO_PUMP:  { name: 'HYDRO PUMP',  power: 10, type: 'WATER',   category: 'SPECIAL' },
  SURF:        { name: 'SURF',        power: 12, type: 'WATER',   category: 'SPECIAL' },
  THUNDER_SHOCK:{name: 'THUNDER SHOCK',power:5,  type: 'ELECTRIC',category: 'SPECIAL' },
  THUNDERBOLT: { name: 'THUNDERBOLT', power: 11, type: 'ELECTRIC',category: 'SPECIAL' },
  THUNDER:     { name: 'THUNDER',     power: 14, type: 'ELECTRIC',category: 'SPECIAL' },
  GUST:        { name: 'GUST',        power: 5,  type: 'FLYING',  category: 'SPECIAL' },
  WING_ATTACK: { name: 'WING ATTACK', power: 7,  type: 'FLYING',  category: 'PHYSICAL' },
  DRILL_PECK:  { name: 'DRILL PECK',  power: 10, type: 'FLYING',  category: 'PHYSICAL' },
  BITE:        { name: 'BITE',        power: 5,  type: 'NORMAL',  category: 'PHYSICAL' },
  SLASH:       { name: 'SLASH',       power: 7,  type: 'NORMAL',  category: 'PHYSICAL' },
  QUICK_ATTACK:{ name: 'QUICK ATTACK',power: 5,  type: 'NORMAL',  category: 'PHYSICAL' },
  HYPER_FANG:  { name: 'HYPER FANG',  power: 10, type: 'NORMAL',  category: 'PHYSICAL' },
  BODY_SLAM:   { name: 'BODY SLAM',   power: 8,  type: 'NORMAL',  category: 'PHYSICAL' },
  HYPER_BEAM:  { name: 'HYPER BEAM',  power: 18, type: 'NORMAL',  category: 'SPECIAL' },
  PECK:        { name: 'PECK',        power: 4,  type: 'FLYING',  category: 'PHYSICAL' },
  FURY_ATTACK: { name: 'FURY ATTACK', power: 6,  type: 'NORMAL',  category: 'PHYSICAL' },
  POISON_STING:{ name: 'POISON STING',power: 4,  type: 'POISON',  category: 'PHYSICAL', effect: { type: 'POISON', target: 'OPPONENT', chance: 0.2 } },
  PSYBEAM:     { name: 'PSYBEAM',     power: 7,  type: 'PSYCHIC', category: 'SPECIAL' },
  PSYCHIC:     { name: 'PSYCHIC',     power: 10, type: 'PSYCHIC', category: 'SPECIAL' },
  SHADOW_BALL: { name: 'SHADOW BALL', power: 11, type: 'GHOST',   category: 'SPECIAL' },
  ROCK_THROW:  { name: 'ROCK THROW',  power: 6,  type: 'ROCK',    category: 'PHYSICAL' },
  ROCK_SLIDE:  { name: 'ROCK SLIDE',  power: 8,  type: 'ROCK',    category: 'PHYSICAL' },
  EARTHQUAKE:  { name: 'EARTHQUAKE',  power: 14, type: 'GROUND',  category: 'PHYSICAL' },
  KARATE_CHOP: { name: 'KARATE CHOP', power: 6,  type: 'FIGHTING',category: 'PHYSICAL' },
  CROSS_CHOP:  { name: 'CROSS CHOP',  power: 10, type: 'FIGHTING',category: 'PHYSICAL' },
  HORN_ATTACK: { name: 'HORN ATTACK', power: 6,  type: 'NORMAL',  category: 'PHYSICAL' },
  HEADBUTT:    { name: 'HEADBUTT',    power: 5,  type: 'NORMAL',  category: 'PHYSICAL' },
  STOMP:       { name: 'STOMP',       power: 6,  type: 'NORMAL',  category: 'PHYSICAL' },
  BUBBLE:      { name: 'BUBBLE',      power: 4,  type: 'WATER',   category: 'SPECIAL' },
  BUBBLE_BEAM: { name: 'BUBBLE BEAM', power: 6,  type: 'WATER',   category: 'SPECIAL' },
  ICE_BEAM:    { name: 'ICE BEAM',    power: 10, type: 'ICE',     category: 'SPECIAL' },
  BLIZZARD:    { name: 'BLIZZARD',    power: 14, type: 'ICE',     category: 'SPECIAL' },
  DRAGON_BREATH:{name: 'DRAGON BREATH',power:7,  type: 'DRAGON',  category: 'SPECIAL' },
  OUTRAGE:     { name: 'OUTRAGE',     power: 14, type: 'DRAGON',  category: 'PHYSICAL' },
  MEGA_DRAIN:  { name: 'MEGA DRAIN',  power: 6,  type: 'GRASS',   category: 'SPECIAL' },
  PETAL_DANCE: { name: 'PETAL DANCE', power: 12, type: 'GRASS',   category: 'SPECIAL' },
  LEAF_BLADE:  { name: 'LEAF BLADE',  power: 9,  type: 'GRASS',   category: 'PHYSICAL' },
  SLUDGE:      { name: 'SLUDGE',      power: 6,  type: 'POISON',  category: 'SPECIAL' },
  SLUDGE_BOMB: { name: 'SLUDGE BOMB', power: 10, type: 'POISON',  category: 'SPECIAL' },
  DIG:         { name: 'DIG',         power: 10, type: 'GROUND',  category: 'PHYSICAL' },
  FLAME_WHEEL: { name: 'FLAME WHEEL', power: 8,  type: 'FIRE',    category: 'PHYSICAL' },
  FIRE_PUNCH:  { name: 'FIRE PUNCH',  power: 8,  type: 'FIRE',    category: 'PHYSICAL' },
  THUNDER_PUNCH:{name: 'THUNDER PUNCH',power:8,  type: 'ELECTRIC',category: 'PHYSICAL' },
  ICE_PUNCH:   { name: 'ICE PUNCH',   power: 8,  type: 'ICE',     category: 'PHYSICAL' },
  SEISMIC_TOSS:{ name: 'SEISMIC TOSS',power: 8,  type: 'FIGHTING',category: 'PHYSICAL' },
  MEGA_KICK:   { name: 'MEGA KICK',   power: 14, type: 'NORMAL',  category: 'PHYSICAL' },
  MEGA_PUNCH:  { name: 'MEGA PUNCH',  power: 10, type: 'NORMAL',  category: 'PHYSICAL' },
  DIZZY_PUNCH: { name: 'DIZZY PUNCH', power: 7,  type: 'NORMAL',  category: 'PHYSICAL', effect: { type: 'CONFUSION', target: 'OPPONENT', chance: 0.2 } },
  BONEMERANG:  { name: 'BONEMERANG',  power: 10, type: 'GROUND',  category: 'PHYSICAL' },
  WATERFALL:   { name: 'WATERFALL',   power: 10, type: 'WATER',   category: 'PHYSICAL' },
  CRABHAMMER:  { name: 'CRABHAMMER',  power: 10, type: 'WATER',   category: 'PHYSICAL' },
  GUILLOTINE:  { name: 'GUILLOTINE',  power: 15, type: 'NORMAL',  category: 'PHYSICAL' },
  EXPLOSION:   { name: 'EXPLOSION',   power: 17, type: 'NORMAL',  category: 'PHYSICAL' },
  TRI_ATTACK:  { name: 'TRI ATTACK',  power: 9,  type: 'NORMAL',  category: 'SPECIAL' },
  HURRICANE:   { name: 'HURRICANE',   power: 13, type: 'FLYING',  category: 'SPECIAL' },
  BUG_BUZZ:    { name: 'BUG BUZZ',    power: 9,  type: 'BUG',     category: 'SPECIAL' },
  TWINEEDLE:   { name: 'TWINEEDLE',   power: 8,  type: 'BUG',     category: 'PHYSICAL' },
  X_SCISSOR:   { name: 'X-SCISSOR',   power: 10, type: 'BUG',     category: 'PHYSICAL' },
  MEGA_HORN:   { name: 'MEGA HORN',   power: 14, type: 'BUG',     category: 'PHYSICAL' },
  DRAGON_RAGE: { name: 'DRAGON RAGE', power: 8,  type: 'DRAGON',  category: 'SPECIAL' },
  SKY_ATTACK:  { name: 'SKY ATTACK',  power: 16, type: 'FLYING',  category: 'PHYSICAL' },
  ANCIENT_POWER:{name: 'ANCIENT POWER',power:8,  type: 'ROCK',    category: 'SPECIAL' },
  STONE_EDGE:  { name: 'STONE EDGE',  power: 14, type: 'ROCK',    category: 'PHYSICAL' },
  FIRE_SPIN:   { name: 'FIRE SPIN',   power: 8,  type: 'FIRE',    category: 'SPECIAL' },
  FLARE_BLITZ: { name: 'FLARE BLITZ', power: 14, type: 'FIRE',    category: 'PHYSICAL' },
  ZEN_HEADBUTT:{ name: 'ZEN HEADBUTT',power: 10, type: 'PSYCHIC', category: 'PHYSICAL' },
  DARK_PULSE:  { name: 'DARK PULSE',  power: 11, type: 'GHOST',   category: 'SPECIAL' },
  THRASH:      { name: 'THRASH',      power: 12, type: 'NORMAL',  category: 'PHYSICAL' },
  SLAM:        { name: 'SLAM',        power: 10, type: 'NORMAL',  category: 'PHYSICAL' },
  WRAP:        { name: 'WRAP',        power: 3,  type: 'NORMAL',  category: 'PHYSICAL' },
  VICE_GRIP:   { name: 'VICE GRIP',   power: 6,  type: 'NORMAL',  category: 'PHYSICAL' },
  LICK:        { name: 'LICK',        power: 4,  type: 'GHOST',   category: 'PHYSICAL', effect: { type: 'PARALYSIS', target: 'OPPONENT', chance: 0.3 } },
  SMOG:        { name: 'SMOG',        power: 4,  type: 'POISON',  category: 'SPECIAL' },
  ABSORB:      { name: 'ABSORB',      power: 4,  type: 'GRASS',   category: 'SPECIAL' },
  AURORA_BEAM: { name: 'AURORA BEAM', power: 7,  type: 'ICE',     category: 'SPECIAL' },
  ICE_SHARD:   { name: 'ICE SHARD',   power: 5,  type: 'ICE',     category: 'PHYSICAL' },
  MUD_SLAP:    { name: 'MUD SLAP',    power: 4,  type: 'GROUND',  category: 'SPECIAL', effect: { type: 'ACC', target: 'OPPONENT', chance: 1, stages: -1 } },
  PAY_DAY:     { name: 'PAY DAY',     power: 4,  type: 'NORMAL',  category: 'PHYSICAL' },
  SONIC_BOOM:  { name: 'SONIC BOOM',  power: 0,  type: 'NORMAL',  category: 'SPECIAL' },
  CLAMP:       { name: 'CLAMP',       power: 6,  type: 'WATER',   category: 'PHYSICAL' },
  SPIKE_CANNON:{ name: 'SPIKE CANNON',power: 6,  type: 'NORMAL',  category: 'PHYSICAL' },
  HI_JUMP_KICK:{ name: 'HI JUMP KICK',power: 12, type: 'FIGHTING',category: 'PHYSICAL' },
  DYNAMIC_PUNCH:{name:'DYNAMIC PUNCH',power: 14, type: 'FIGHTING',category: 'PHYSICAL', effect: { type: 'CONFUSION', target: 'OPPONENT', chance: 0.5 } },
  BONE_CLUB:   { name: 'BONE CLUB',   power: 6,  type: 'GROUND',  category: 'PHYSICAL' },
  LOW_KICK:    { name: 'LOW KICK',    power: 5,  type: 'FIGHTING',category: 'PHYSICAL' },
  ACID:        { name: 'ACID',        power: 6,  type: 'POISON',  category: 'SPECIAL' },
  POISON_FANG: { name: 'POISON FANG', power: 8,  type: 'POISON',  category: 'PHYSICAL', effect: { type: 'POISON', target: 'OPPONENT', chance: 0.3 } },
  AIR_CUTTER:  { name: 'AIR CUTTER',  power: 7,  type: 'FLYING',  category: 'SPECIAL' },
  AQUA_JET:    { name: 'AQUA JET',    power: 5,  type: 'WATER',   category: 'PHYSICAL' },
  BULK_UP:     { name: 'BULK UP',     power: 0,  type: 'FIGHTING',category: 'STATUS', effect: { type: 'ATK', target: 'SELF', chance: 1, stages: 1 } },
  DOUBLE_SLAP: { name: 'DOUBLE SLAP', power: 6,  type: 'NORMAL',  category: 'PHYSICAL' },
  HYPER_VOICE: { name: 'HYPER VOICE', power: 10, type: 'NORMAL',  category: 'SPECIAL' },
  MOONBLAST:   { name: 'MOONBLAST',   power: 12, type: 'NORMAL', category: 'SPECIAL' },
  SAND_TOMB:   { name: 'SAND TOMB',   power: 6,  type: 'GROUND',  category: 'PHYSICAL' },
  POWER_GEM:   { name: 'POWER GEM',   power: 10, type: 'ROCK',    category: 'SPECIAL' },
  MAGNITUDE:   { name: 'MAGNITUDE',   power: 8,  type: 'GROUND',  category: 'PHYSICAL' },
  SLUDGE_WAVE: { name: 'SLUDGE WAVE', power: 12, type: 'POISON',  category: 'SPECIAL' },
  MINIMIZE:    { name: 'MINIMIZE',    power: 0,  type: 'NORMAL',  category: 'STATUS', effect: { type: 'DEF', target: 'SELF', chance: 1, stages: 1 } },
  SOFT_BOILED: { name: 'SOFT BOILED', power: 0,  type: 'NORMAL',  category: 'STATUS' },
  BARRIER:     { name: 'BARRIER',     power: 0,  type: 'PSYCHIC', category: 'STATUS', effect: { type: 'DEF', target: 'SELF', chance: 1, stages: 2 } },
  LOVELY_KISS: { name: 'LOVELY KISS', power: 0,  type: 'NORMAL',  category: 'STATUS', effect: { type: 'SLEEP', target: 'OPPONENT', chance: 0.75 } },
  TRANSFORM:   { name: 'TRANSFORM',   power: 0,  type: 'NORMAL',  category: 'STATUS' },
  HARDEN:      { name: 'HARDEN',      power: 0,  type: 'NORMAL',  category: 'STATUS', effect: { type: 'DEF', target: 'SELF', chance: 1, stages: 1 } },
  STRING_SHOT: { name: 'STRING SHOT', power: 0,  type: 'BUG',     category: 'STATUS', effect: { type: 'SPD', target: 'OPPONENT', chance: 1, stages: -1 } },
  LEER:        { name: 'LEER',        power: 0,  type: 'NORMAL',  category: 'STATUS', effect: { type: 'DEF', target: 'OPPONENT', chance: 1, stages: -1 } },
  GROWL:       { name: 'GROWL',       power: 0,  type: 'NORMAL',  category: 'STATUS', effect: { type: 'ATK', target: 'OPPONENT', chance: 1, stages: -1 } },
  TAIL_WHIP:   { name: 'TAIL WHIP',   power: 0,  type: 'NORMAL',  category: 'STATUS', effect: { type: 'DEF', target: 'OPPONENT', chance: 1, stages: -1 } },
  SAND_ATTACK: { name: 'SAND ATTACK', power: 0,  type: 'GROUND',  category: 'STATUS', effect: { type: 'ACC', target: 'OPPONENT', chance: 1, stages: -1 } },
  SING:        { name: 'SING',        power: 0,  type: 'NORMAL',  category: 'STATUS', effect: { type: 'SLEEP', target: 'OPPONENT', chance: 0.55 } },
  HYPNOSIS:    { name: 'HYPNOSIS',    power: 0,  type: 'PSYCHIC', category: 'STATUS', effect: { type: 'SLEEP', target: 'OPPONENT', chance: 0.6 } },
  SPORE:       { name: 'SPORE',       power: 0,  type: 'GRASS',   category: 'STATUS', effect: { type: 'SLEEP', target: 'OPPONENT', chance: 1 } },
  STUN_SPORE:  { name: 'STUN SPORE',  power: 0,  type: 'GRASS',   category: 'STATUS', effect: { type: 'PARALYSIS', target: 'OPPONENT', chance: 0.75 } },
  POISON_POWDER:{name:'POISON POWDER',power:0,  type: 'POISON',  category: 'STATUS', effect: { type: 'POISON', target: 'OPPONENT', chance: 0.75 } },
  CONFUSE_RAY: { name: 'CONFUSE RAY', power: 0,  type: 'GHOST',   category: 'STATUS', effect: { type: 'CONFUSION', target: 'OPPONENT', chance: 1 } },
  SUPERSONIC:  { name: 'SUPERSONIC',  power: 0,  type: 'NORMAL',  category: 'STATUS', effect: { type: 'CONFUSION', target: 'OPPONENT', chance: 0.55 } },
  TELEPORT:    { name: 'TELEPORT',    power: 0,  type: 'PSYCHIC', category: 'STATUS' },
  AGILITY:     { name: 'AGILITY',     power: 0,  type: 'PSYCHIC', category: 'STATUS', effect: { type: 'SPD', target: 'SELF', chance: 1, stages: 2 } },
  CONFUSION:   { name: 'CONFUSION',   power: 5,  type: 'PSYCHIC', category: 'SPECIAL', effect: { type: 'CONFUSION', target: 'OPPONENT', chance: 0.1 } },
  SPLASH:      { name: 'SPLASH',      power: 0,  type: 'NORMAL',  category: 'STATUS' },
  SMOKESCREEN: { name: 'SMOKESCREEN', power: 0,  type: 'NORMAL',  category: 'STATUS', effect: { type: 'ACC', target: 'OPPONENT', chance: 1, stages: -1 } },
  NIGHT_SHADE: { name: 'NIGHT SHADE', power: 0,  type: 'GHOST',   category: 'SPECIAL' },
  TAIL_SLAP:   { name: 'TAIL SLAP',   power: 3,  type: 'NORMAL',  category: 'PHYSICAL' },
  HORN_DRILL:  { name: 'HORN DRILL',  power: 15, type: 'NORMAL',  category: 'PHYSICAL' },
  FOCUS_ENERGY:{ name: 'FOCUS ENERGY',power: 0,  type: 'NORMAL',  category: 'STATUS', effect: { type: 'ACC', target: 'SELF', chance: 1, stages: 1 } },
};

// Look up a move by name (case-insensitive, handles spaces) and return full Move data
export function getMoveDetails(name: string): Move {
  const key = name.toUpperCase().replace(/[\s'-]/g, '_');
  return MOVE_REGISTRY[key] || { name, power: 4, type: 'NORMAL', category: 'PHYSICAL' };
}

// Calculate stat multiplier from stages (Gen 1 formula)
export function getStatMultiplier(stages: number): number {
  if (stages >= 0) return (2 + stages) / 2;
  return 2 / (2 - stages);
}

// Check if a status effect was applied based on chance
export function checkEffectApplied(chance: number): boolean {
  return Math.random() < chance;
}

// Get the name of a status effect for display
export function getStatusEffectName(effect: string): string {
  const names: Record<string, string> = {
    'POISON': 'Poisoned',
    'SLEEP': 'Fell asleep!',
    'PARALYSIS': 'Paralyzed!',
    'CONFUSION': 'Confused!',
    'BURN': 'Burned!',
    'FREEZE': 'Frozen!',
  };
  return names[effect] || effect;
}

// Get the stage change description
export function getStageChangeDescription(mod: string, stages: number): string {
  const names: Record<string, string> = {
    'ATK': 'Attack',
    'DEF': 'Defense',
    'SPD': 'Speed',
    'ACC': 'Accuracy',
  };
  const name = names[mod] || mod;
  if (stages > 0) return `${name} rose!`;
  return `${name} fell!`;
}

export interface PokedexEntry {
  name: string;
  num: string;
  types: string[];
  description: string;
  color: string;
  evolutionChain: string[];
  baseHp: number;
  catchRate: number; // 0-255, higher = easier to catch
  baseXp: number;
  moves: { name: string; power: number; type: string }[];
}

// Full Gen 1 Type Effectiveness Chart
const TYPE_CHART: Record<string, Record<string, number>> = {
  NORMAL:   { ROCK: 0.5, GHOST: 0, STEEL: 0.5 },
  FIRE:     { FIRE: 0.5, WATER: 0.5, GRASS: 2, ICE: 2, BUG: 2, ROCK: 0.5, DRAGON: 0.5 },
  WATER:    { FIRE: 2, WATER: 0.5, GRASS: 0.5, GROUND: 2, ROCK: 2, DRAGON: 0.5 },
  ELECTRIC: { WATER: 2, ELECTRIC: 0.5, GRASS: 0.5, GROUND: 0, FLYING: 2, DRAGON: 0.5 },
  GRASS:    { FIRE: 0.5, WATER: 2, GRASS: 0.5, POISON: 0.5, GROUND: 2, FLYING: 0.5, BUG: 0.5, ROCK: 2, DRAGON: 0.5 },
  ICE:      { FIRE: 0.5, WATER: 0.5, GRASS: 2, ICE: 0.5, GROUND: 2, FLYING: 2, DRAGON: 2 },
  FIGHTING: { NORMAL: 2, ICE: 2, POISON: 0.5, FLYING: 0.5, PSYCHIC: 0.5, BUG: 0.5, ROCK: 2, GHOST: 0, DARK: 2, STEEL: 2 },
  POISON:   { GRASS: 2, POISON: 0.5, GROUND: 0.5, ROCK: 0.5, GHOST: 0.5, STEEL: 0 },
  GROUND:   { FIRE: 2, GRASS: 0.5, ELECTRIC: 2, FLYING: 0, BUG: 0.5, ROCK: 2, POISON: 2 },
  FLYING:   { GRASS: 2, ELECTRIC: 0.5, FIGHTING: 2, BUG: 2, ROCK: 0.5, STEEL: 0.5 },
  PSYCHIC:  { FIGHTING: 2, POISON: 2, PSYCHIC: 0.5, DARK: 0, STEEL: 0.5 },
  BUG:      { FIRE: 0.5, GRASS: 2, FIGHTING: 0.5, POISON: 0.5, FLYING: 0.5, PSYCHIC: 2, GHOST: 0.5, DARK: 2, STEEL: 0.5 },
  ROCK:     { FIRE: 2, ICE: 2, FIGHTING: 0.5, GROUND: 0.5, FLYING: 2, BUG: 2, STEEL: 0.5 },
  GHOST:    { NORMAL: 0, PSYCHIC: 2, GHOST: 2, DARK: 0.5 },
  DRAGON:   { DRAGON: 2, STEEL: 0.5, FAIRY: 0 },
};

export const POKEDEX_CATALOG: Record<string, PokedexEntry> = {
  // --- #001-009: Kanto Starters ---
  BULBASAUR: {
    name: 'BULBASAUR', num: '001', types: ['GRASS', 'POISON'],
    description: 'A strange seed was planted on its back at birth. The plant sprouts and grows with this Pokémon.',
    color: '#38d9a9', evolutionChain: ['BULBASAUR', 'IVYSAUR', 'VENUSAUR'],
    baseHp: 20, catchRate: 45, baseXp: 64,
    moves: [{ name: 'TACKLE', power: 4, type: 'NORMAL' }, { name: 'VINE WHIP', power: 6, type: 'GRASS' }]
  },
  IVYSAUR: {
    name: 'IVYSAUR', num: '002', types: ['GRASS', 'POISON'],
    description: 'When the bulb on its back grows large, it appears to lose the ability to stand on its hind legs.',
    color: '#0ca678', evolutionChain: ['BULBASAUR', 'IVYSAUR', 'VENUSAUR'],
    baseHp: 30, catchRate: 45, baseXp: 142,
    moves: [{ name: 'VINE WHIP', power: 6, type: 'GRASS' }, { name: 'RAZOR LEAF', power: 8, type: 'GRASS' }]
  },
  VENUSAUR: {
    name: 'VENUSAUR', num: '003', types: ['GRASS', 'POISON'],
    description: 'Its flower is said to take on vivid colors if it gets plenty of nutrition and sunlight.',
    color: '#087f5b', evolutionChain: ['BULBASAUR', 'IVYSAUR', 'VENUSAUR'],
    baseHp: 45, catchRate: 45, baseXp: 236,
    moves: [{ name: 'RAZOR LEAF', power: 8, type: 'GRASS' }, { name: 'SOLAR BEAM', power: 15, type: 'GRASS' }]
  },
  CHARMANDER: {
    name: 'CHARMANDER', num: '004', types: ['FIRE'],
    description: 'The flame at the tip of its tail makes a sound as it burns. You can tell its life force by the flame.',
    color: '#ff922b', evolutionChain: ['CHARMANDER', 'CHARMELEON', 'CHARIZARD'],
    baseHp: 20, catchRate: 45, baseXp: 62,
    moves: [{ name: 'SCRATCH', power: 4, type: 'NORMAL' }, { name: 'EMBER', power: 6, type: 'FIRE' }]
  },
  CHARMELEON: {
    name: 'CHARMELEON', num: '005', types: ['FIRE'],
    description: 'In the hot climates where it lives, it rips at foes with its claws first, then spits high heat flames.',
    color: '#fd7e14', evolutionChain: ['CHARMANDER', 'CHARMELEON', 'CHARIZARD'],
    baseHp: 28, catchRate: 45, baseXp: 142,
    moves: [{ name: 'EMBER', power: 6, type: 'FIRE' }, { name: 'FLAMETHROWER', power: 9, type: 'FIRE' }]
  },
  CHARIZARD: {
    name: 'CHARIZARD', num: '006', types: ['FIRE', 'FLYING'],
    description: 'Spits fire that is hot enough to melt boulders. Known to cause forest fires unintentionally.',
    color: '#e8590c', evolutionChain: ['CHARMANDER', 'CHARMELEON', 'CHARIZARD'],
    baseHp: 42, catchRate: 45, baseXp: 240,
    moves: [{ name: 'FLAMETHROWER', power: 9, type: 'FIRE' }, { name: 'FIRE BLAST', power: 14, type: 'FIRE' }]
  },
  SQUIRTLE: {
    name: 'SQUIRTLE', num: '007', types: ['WATER'],
    description: 'Shoots pressurized water at prey from the water. Retracts into its shell when in danger.',
    color: '#4dabf7', evolutionChain: ['SQUIRTLE', 'WARTORTLE', 'BLASTOISE'],
    baseHp: 22, catchRate: 45, baseXp: 63,
    moves: [{ name: 'TACKLE', power: 4, type: 'NORMAL' }, { name: 'WATER GUN', power: 6, type: 'WATER' }]
  },
  WARTORTLE: {
    name: 'WARTORTLE', num: '008', types: ['WATER'],
    description: 'It is clever at hiding in water. Its furry ears and tail are symbols of longevity and health.',
    color: '#228be6', evolutionChain: ['SQUIRTLE', 'WARTORTLE', 'BLASTOISE'],
    baseHp: 32, catchRate: 45, baseXp: 142,
    moves: [{ name: 'WATER GUN', power: 6, type: 'WATER' }, { name: 'HYDRO PUMP', power: 10, type: 'WATER' }]
  },
  BLASTOISE: {
    name: 'BLASTOISE', num: '009', types: ['WATER'],
    description: 'A brutal Pokémon with water cannons on its shell. They can burst high speed water rockets.',
    color: '#1c7ed6', evolutionChain: ['SQUIRTLE', 'WARTORTLE', 'BLASTOISE'],
    baseHp: 44, catchRate: 45, baseXp: 239,
    moves: [{ name: 'HYDRO PUMP', power: 10, type: 'WATER' }, { name: 'SURF', power: 12, type: 'WATER' }]
  },

  // --- #010-012: Bug Types ---
  CATERPIE: {
    name: 'CATERPIE', num: '010', types: ['BUG'],
    description: 'Its short feet are tipped with suction pads that enable it to tirelessly climb slopes and walls.',
    color: '#69db7c', evolutionChain: ['CATERPIE', 'METAPOD', 'BUTTERFREE'],
    baseHp: 13, catchRate: 255, baseXp: 39,
    moves: [{ name: 'TACKLE', power: 3, type: 'NORMAL' }, { name: 'STRING SHOT', power: 0, type: 'BUG' }]
  },
  METAPOD: {
    name: 'METAPOD', num: '011', types: ['BUG'],
    description: 'This Pokémon is vulnerable to attack while its shell is soft, exposing its fragile body.',
    color: '#40c057', evolutionChain: ['CATERPIE', 'METAPOD', 'BUTTERFREE'],
    baseHp: 18, catchRate: 120, baseXp: 72,
    moves: [{ name: 'HARDEN', power: 0, type: 'NORMAL' }, { name: 'TACKLE', power: 3, type: 'NORMAL' }]
  },
  BUTTERFREE: {
    name: 'BUTTERFREE', num: '012', types: ['BUG', 'FLYING'],
    description: 'In battle, it flaps its wings at high speed to release highly toxic sleep spores into the air.',
    color: '#4c6ef5', evolutionChain: ['CATERPIE', 'METAPOD', 'BUTTERFREE'],
    baseHp: 26, catchRate: 45, baseXp: 173,
    moves: [{ name: 'GUST', power: 5, type: 'FLYING' }, { name: 'BUG BUZZ', power: 9, type: 'BUG' }]
  },

  // --- #013-015: More Bugs ---
  WEEDLE: {
    name: 'WEEDLE', num: '013', types: ['BUG', 'POISON'],
    description: 'Often found in forests and grasslands. It has a sharp venomous stinger on its head.',
    color: '#fcc419', evolutionChain: ['WEEDLE', 'KAKUNA', 'BEEDRILL'],
    baseHp: 14, catchRate: 255, baseXp: 39,
    moves: [{ name: 'POISON STING', power: 4, type: 'POISON' }, { name: 'STRING SHOT', power: 0, type: 'BUG' }]
  },
  KAKUNA: {
    name: 'KAKUNA', num: '014', types: ['BUG', 'POISON'],
    description: 'Nearly incapable of movement, this Pokémon relies on its hard shell to protect itself.',
    color: '#fab005', evolutionChain: ['WEEDLE', 'KAKUNA', 'BEEDRILL'],
    baseHp: 18, catchRate: 120, baseXp: 72,
    moves: [{ name: 'HARDEN', power: 0, type: 'NORMAL' }, { name: 'POISON STING', power: 4, type: 'POISON' }]
  },
  BEEDRILL: {
    name: 'BEEDRILL', num: '015', types: ['BUG', 'POISON'],
    description: 'Flies at high speed and attacks using its large venomous stingers on its forelegs and tail.',
    color: '#e67700', evolutionChain: ['WEEDLE', 'KAKUNA', 'BEEDRILL'],
    baseHp: 27, catchRate: 45, baseXp: 173,
    moves: [{ name: 'FURY ATTACK', power: 6, type: 'NORMAL' }, { name: 'TWINEEDLE', power: 8, type: 'BUG' }]
  },

  // --- #016-018: Bird Pokémon ---
  PIDGEY: {
    name: 'PIDGEY', num: '016', types: ['NORMAL', 'FLYING'],
    description: 'Very docile. If attacked, it will often kick up sand to protect itself rather than fight back.',
    color: '#d4a373', evolutionChain: ['PIDGEY', 'PIDGEOTO', 'PIDGEOT'],
    baseHp: 15, catchRate: 255, baseXp: 50,
    moves: [{ name: 'TACKLE', power: 4, type: 'NORMAL' }, { name: 'GUST', power: 5, type: 'FLYING' }]
  },
  PIDGEOTO: {
    name: 'PIDGEOTO', num: '017', types: ['NORMAL', 'FLYING'],
    description: 'This Pokémon is full of vitality. It constantly flies over its large territory in search of prey.',
    color: '#c48b53', evolutionChain: ['PIDGEY', 'PIDGEOTO', 'PIDGEOT'],
    baseHp: 25, catchRate: 120, baseXp: 122,
    moves: [{ name: 'GUST', power: 5, type: 'FLYING' }, { name: 'WING ATTACK', power: 7, type: 'FLYING' }]
  },
  PIDGEOT: {
    name: 'PIDGEOT', num: '018', types: ['NORMAL', 'FLYING'],
    description: 'When hunting, it skims the surface of water at high speed to scoop up prey.',
    color: '#a36d35', evolutionChain: ['PIDGEY', 'PIDGEOTO', 'PIDGEOT'],
    baseHp: 38, catchRate: 45, baseXp: 211,
    moves: [{ name: 'WING ATTACK', power: 7, type: 'FLYING' }, { name: 'HURRICANE', power: 13, type: 'FLYING' }]
  },

  // --- #019-020: Rat Pokémon ---
  RATTATA: {
    name: 'RATTATA', num: '019', types: ['NORMAL'],
    description: 'Bites anything when it attacks. Small and quick, it is a common sight in grassy plains.',
    color: '#be4bdb', evolutionChain: ['RATTATA', 'RATICATE'],
    baseHp: 14, catchRate: 255, baseXp: 51,
    moves: [{ name: 'TACKLE', power: 4, type: 'NORMAL' }, { name: 'QUICK ATTACK', power: 5, type: 'NORMAL' }]
  },
  RATICATE: {
    name: 'RATICATE', num: '020', types: ['NORMAL'],
    description: 'It uses its tough whiskers to maintain balance. It slows dramatically if they are clipped.',
    color: '#862e9c', evolutionChain: ['RATTATA', 'RATICATE'],
    baseHp: 24, catchRate: 127, baseXp: 116,
    moves: [{ name: 'QUICK ATTACK', power: 5, type: 'NORMAL' }, { name: 'HYPER FANG', power: 10, type: 'NORMAL' }]
  },

  // --- #021-022: Spearow Line ---
  SPEAROW: {
    name: 'SPEAROW', num: '021', types: ['NORMAL', 'FLYING'],
    description: 'Very short-tempered and fierce. It flaps its wings at high speeds while hunting small bugs.',
    color: '#c92a2a', evolutionChain: ['SPEAROW', 'FEAROW'],
    baseHp: 14, catchRate: 255, baseXp: 58,
    moves: [{ name: 'PECK', power: 4, type: 'FLYING' }, { name: 'FURY ATTACK', power: 6, type: 'NORMAL' }]
  },
  FEAROW: {
    name: 'FEAROW', num: '022', types: ['NORMAL', 'FLYING'],
    description: 'A Pokémon that dates back many years. It flies high overhead and swoops down to attack prey.',
    color: '#e03131', evolutionChain: ['SPEAROW', 'FEAROW'],
    baseHp: 27, catchRate: 90, baseXp: 155,
    moves: [{ name: 'DRILL PECK', power: 10, type: 'FLYING' }, { name: 'AGILITY', power: 0, type: 'PSYCHIC' }]
  },

  // --- #023-024: Snake Pokémon ---
  EKANS: {
    name: 'EKANS', num: '023', types: ['POISON'],
    description: 'It sneaks through grass at high speed, hunting for prey with its venomous fangs.',
    color: '#7c3aed', evolutionChain: ['EKANS', 'ARBOK'],
    baseHp: 16, catchRate: 255, baseXp: 58,
    moves: [{ name: 'POISON STING', power: 4, type: 'POISON' }, { name: 'BITE', power: 5, type: 'NORMAL' }]
  },
  ARBOK: {
    name: 'ARBOK', num: '024', types: ['POISON'],
    description: 'The frightening patterns on its belly are studied by researchers to identify regional variations.',
    color: '#6d28d9', evolutionChain: ['EKANS', 'ARBOK'],
    baseHp: 26, catchRate: 90, baseXp: 153,
    moves: [{ name: 'BITE', power: 5, type: 'NORMAL' }, { name: 'SLUDGE BOMB', power: 10, type: 'POISON' }]
  },

  // --- #025-026: Pikachu Line ---
  PIKACHU: {
    name: 'PIKACHU', num: '025', types: ['ELECTRIC'],
    description: 'When several of these Pokémon gather, their electricity could build and cause lightning storms.',
    color: '#fcc419', evolutionChain: ['PIKACHU', 'RAICHU'],
    baseHp: 18, catchRate: 190, baseXp: 82,
    moves: [{ name: 'THUNDER SHOCK', power: 5, type: 'ELECTRIC' }, { name: 'QUICK ATTACK', power: 5, type: 'NORMAL' }]
  },
  RAICHU: {
    name: 'RAICHU', num: '026', types: ['ELECTRIC'],
    description: 'Its long tail serves as a ground to protect itself from its own high-voltage electrical power.',
    color: '#fab005', evolutionChain: ['PIKACHU', 'RAICHU'],
    baseHp: 30, catchRate: 75, baseXp: 186,
    moves: [{ name: 'QUICK ATTACK', power: 5, type: 'NORMAL' }, { name: 'THUNDERBOLT', power: 11, type: 'ELECTRIC' }]
  },

  // --- #027-028: Sandshrew Line ---
  SANDSHREW: {
    name: 'SANDSHREW', num: '027', types: ['GROUND'],
    description: 'It burrows deep underground and curls into a ball to protect itself from predators.',
    color: '#d4a373', evolutionChain: ['SANDSHREW', 'SANDSLASH'],
    baseHp: 18, catchRate: 255, baseXp: 60,
    moves: [{ name: 'SCRATCH', power: 4, type: 'NORMAL' }, { name: 'SAND ATTACK', power: 0, type: 'GROUND' }]
  },
  SANDSLASH: {
    name: 'SANDSLASH', num: '028', types: ['GROUND'],
    description: 'Curled up into a spiky ball, it can roll at high speeds to ram into prey and foes alike.',
    color: '#b08968', evolutionChain: ['SANDSHREW', 'SANDSLASH'],
    baseHp: 34, catchRate: 90, baseXp: 158,
    moves: [{ name: 'SLASH', power: 7, type: 'NORMAL' }, { name: 'DIG', power: 10, type: 'GROUND' }]
  },

  // --- #029-031: Nidoran♀ Line ---
  NIDORAN_F: {
    name: 'NIDORAN-F', num: '029', types: ['POISON'],
    description: 'Although small, its venom is potent enough to paralyze larger prey from a single sting.',
    color: '#748ffc', evolutionChain: ['NIDORAN-F', 'NIDORINA', 'NIDOQUEEN'],
    baseHp: 19, catchRate: 235, baseXp: 55,
    moves: [{ name: 'SCRATCH', power: 4, type: 'NORMAL' }, { name: 'POISON STING', power: 4, type: 'POISON' }]
  },
  NIDORINA: {
    name: 'NIDORINA', num: '030', types: ['POISON'],
    description: 'When it senses danger, it raises all of the barbs on its body in unison to threaten enemies.',
    color: '#5c7cfa', evolutionChain: ['NIDORAN♀', 'NIDORINA', 'NIDOQUEEN'],
    baseHp: 28, catchRate: 120, baseXp: 128,
    moves: [{ name: 'BITE', power: 5, type: 'NORMAL' }, { name: 'POISON STING', power: 4, type: 'POISON' }]
  },
  NIDOQUEEN: {
    name: 'NIDOQUEEN', num: '031', types: ['POISON', 'GROUND'],
    description: 'Its tough scales provide strong defense. It uses its weight and raw power to crush its foes.',
    color: '#4c6ef5', evolutionChain: ['NIDORAN♀', 'NIDORINA', 'NIDOQUEEN'],
    baseHp: 45, catchRate: 45, baseXp: 227,
    moves: [{ name: 'BODY SLAM', power: 8, type: 'NORMAL' }, { name: 'EARTHQUAKE', power: 14, type: 'GROUND' }]
  },

  // --- #032-034: Nidoran♂ Line ---
  NIDORAN_M: {
    name: 'NIDORAN-M', num: '032', types: ['POISON'],
    description: 'Its ears are used to detect danger. Larger ears mean the Pokémon is more alert.',
    color: '#7c3aed', evolutionChain: ['NIDORAN-M', 'NIDORINO', 'NIDOKING'],
    baseHp: 20, catchRate: 235, baseXp: 55,
    moves: [{ name: 'PECK', power: 4, type: 'FLYING' }, { name: 'POISON STING', power: 4, type: 'POISON' }]
  },
  NIDORINO: {
    name: 'NIDORINO', num: '033', types: ['POISON'],
    description: 'Its highly aggressive nature drives it to attack anything that enters its territory.',
    color: '#6d28d9', evolutionChain: ['NIDORAN♂', 'NIDORINO', 'NIDOKING'],
    baseHp: 27, catchRate: 120, baseXp: 128,
    moves: [{ name: 'HORN ATTACK', power: 6, type: 'NORMAL' }, { name: 'POISON JAB', power: 8, type: 'POISON' }]
  },
  NIDOKING: {
    name: 'NIDOKING', num: '034', types: ['POISON', 'GROUND'],
    description: 'Its tail is thick and packed with muscle. It uses its powerful tail to sweep enemies away.',
    color: '#5b21b6', evolutionChain: ['NIDORAN♂', 'NIDORINO', 'NIDOKING'],
    baseHp: 46, catchRate: 45, baseXp: 227,
    moves: [{ name: 'MEGA HORN', power: 14, type: 'BUG' }, { name: 'EARTHQUAKE', power: 14, type: 'GROUND' }]
  },

  // --- #035-036: Clefairy Line ---
  CLEFAIRY: {
    name: 'CLEFAIRY', num: '035', types: ['NORMAL'],
    description: 'Adored for its cute appearance, it is rarely found in the wild. It is known as the Moon Fairy.',
    color: '#f783ac', evolutionChain: ['CLEFAIRY', 'CLEFABLE'],
    baseHp: 28, catchRate: 150, baseXp: 113,
    moves: [{ name: 'POUND', power: 4, type: 'NORMAL' }, { name: 'SING', power: 0, type: 'NORMAL' }]
  },
  CLEFABLE: {
    name: 'CLEFABLE', num: '036', types: ['NORMAL'],
    description: 'A shy and reclusive Pokémon. It is very difficult to capture in the wild.',
    color: '#f06595', evolutionChain: ['CLEFAIRY', 'CLEFABLE'],
    baseHp: 40, catchRate: 25, baseXp: 178,
    moves: [{ name: 'DOUBLE SLAP', power: 6, type: 'NORMAL' }, { name: 'MOONBLAST', power: 12, type: 'NORMAL' }]
  },

  // --- #037-038: Vulpix Line ---
  VULPIX: {
    name: 'VULPIX', num: '037', types: ['FIRE'],
    description: 'As it develops, its single tail splits into six. A warm flame burns inside its body.',
    color: '#ffa94d', evolutionChain: ['VULPIX', 'NINETALES'],
    baseHp: 17, catchRate: 190, baseXp: 60,
    moves: [{ name: 'EMBER', power: 5, type: 'FIRE' }, { name: 'TAIL SLAP', power: 3, type: 'NORMAL' }]
  },
  NINETALES: {
    name: 'NINETALES', num: '038', types: ['FIRE'],
    description: 'Very smart and very vengeful. It is said to live for a thousand years, cursing those who wrong it.',
    color: '#ff922b', evolutionChain: ['VULPIX', 'NINETALES'],
    baseHp: 38, catchRate: 75, baseXp: 177,
    moves: [{ name: 'FLAMETHROWER', power: 9, type: 'FIRE' }, { name: 'CONFUSE RAY', power: 0, type: 'GHOST' }]
  },

  // --- #039-040: Jigglypuff Line ---
  JIGGLYPUFF: {
    name: 'JIGGLYPUFF', num: '039', types: ['NORMAL'],
    description: 'When it sings a mysterious song, everyone who hears it will inevitably fall into a deep sleep.',
    color: '#f783ac', evolutionChain: ['JIGGLYPUFF', 'WIGGLYTUFF'],
    baseHp: 40, catchRate: 170, baseXp: 76,
    moves: [{ name: 'POUND', power: 4, type: 'NORMAL' }, { name: 'SING', power: 0, type: 'NORMAL' }]
  },
  WIGGLYTUFF: {
    name: 'WIGGLYTUFF', num: '040', types: ['NORMAL'],
    description: 'It has a very fine fur. It is so light that it can drift on the wind like a balloon.',
    color: '#f06595', evolutionChain: ['JIGGLYPUFF', 'WIGGLYTUFF'],
    baseHp: 47, catchRate: 50, baseXp: 109,
    moves: [{ name: 'DOUBLE SLAP', power: 6, type: 'NORMAL' }, { name: 'HYPER VOICE', power: 10, type: 'NORMAL' }]
  },

  // --- #041-042: Zubat Line ---
  ZUBAT: {
    name: 'ZUBAT', num: '041', types: ['POISON', 'FLYING'],
    description: 'It emits ultrasonic waves from its mouth to navigate in the dark and detect prey.',
    color: '#7c3aed', evolutionChain: ['ZUBAT', 'GOLBAT'],
    baseHp: 14, catchRate: 255, baseXp: 49,
    moves: [{ name: 'ABSORB', power: 4, type: 'GRASS' }, { name: 'BITE', power: 5, type: 'NORMAL' }]
  },
  GOLBAT: {
    name: 'GOLBAT', num: '042', types: ['POISON', 'FLYING'],
    description: 'It loves to drink the blood of living things. It flies through the night sky in search of prey.',
    color: '#6d28d9', evolutionChain: ['ZUBAT', 'GOLBAT'],
    baseHp: 30, catchRate: 90, baseXp: 159,
    moves: [{ name: 'AIR CUTTER', power: 7, type: 'FLYING' }, { name: 'POISON FANG', power: 8, type: 'POISON' }]
  },

  // --- #043-045: Oddish Line ---
  ODDISH: {
    name: 'ODDISH', num: '043', types: ['GRASS', 'POISON'],
    description: 'During the day, it buries itself in soil to absorb nutrients. At night, it scatters seeds.',
    color: '#51cf66', evolutionChain: ['ODDISH', 'GLOOM', 'VILEPLUME'],
    baseHp: 18, catchRate: 255, baseXp: 64,
    moves: [{ name: 'ABSORB', power: 4, type: 'GRASS' }, { name: 'STUN SPORE', power: 0, type: 'GRASS' }]
  },
  GLOOM: {
    name: 'GLOOM', num: '044', types: ['GRASS', 'POISON'],
    description: 'It secretes a sticky nectar that smells remarkably like rotten meat to attract prey.',
    color: '#40c057', evolutionChain: ['ODDISH', 'GLOOM', 'VILEPLUME'],
    baseHp: 26, catchRate: 120, baseXp: 132,
    moves: [{ name: 'RAZOR LEAF', power: 7, type: 'GRASS' }, { name: 'SLUDGE', power: 6, type: 'POISON' }]
  },
  VILEPLUME: {
    name: 'VILEPLUME', num: '045', types: ['GRASS', 'POISON'],
    description: 'Its flower petals are the largest in the world. It sprinkles a toxic pollen to immobilize prey.',
    color: '#2f9e44', evolutionChain: ['ODDISH', 'GLOOM', 'VILEPLUME'],
    baseHp: 38, catchRate: 45, baseXp: 216,
    moves: [{ name: 'PETAL DANCE', power: 12, type: 'GRASS' }, { name: 'SLUDGE BOMB', power: 10, type: 'POISON' }]
  },

  // --- #046-047: Paras Line ---
  PARAS: {
    name: 'PARAS', num: '046', types: ['BUG', 'GRASS'],
    description: 'Mushrooms called tochukaso grow on its back. They help regulate the Pokémon\'s health.',
    color: '#f59f00', evolutionChain: ['PARAS', 'PARASECT'],
    baseHp: 16, catchRate: 190, baseXp: 57,
    moves: [{ name: 'SCRATCH', power: 4, type: 'NORMAL' }, { name: 'STUN SPORE', power: 0, type: 'GRASS' }]
  },
  PARASECT: {
    name: 'PARASECT', num: '047', types: ['BUG', 'GRASS'],
    description: 'The larger the mushroom on its back grows, the stronger the mushroom spores become.',
    color: '#d9480f', evolutionChain: ['PARAS', 'PARASECT'],
    baseHp: 26, catchRate: 75, baseXp: 142,
    moves: [{ name: 'SLASH', power: 7, type: 'NORMAL' }, { name: 'SPORE', power: 0, type: 'GRASS' }]
  },

  // --- #048-049: Venonat Line ---
  VENONAT: {
    name: 'VENONAT', num: '048', types: ['BUG', 'POISON'],
    description: 'Its large eyes act as radar. In bright light, it can track moving objects with ease.',
    color: '#7c3aed', evolutionChain: ['VENONAT', 'VENOMOTH'],
    baseHp: 26, catchRate: 190, baseXp: 61,
    moves: [{ name: 'TACKLE', power: 4, type: 'NORMAL' }, { name: 'PSYBEAM', power: 6, type: 'PSYCHIC' }]
  },
  VENOMOTH: {
    name: 'VENOMOTH', num: '049', types: ['BUG', 'POISON'],
    description: 'Its wings are covered in toxic scales. It shakes its wings to scatter poisonous powder.',
    color: '#5b21b6', evolutionChain: ['VENONAT', 'VENOMOTH'],
    baseHp: 34, catchRate: 75, baseXp: 158,
    moves: [{ name: 'PSYCHIC', power: 9, type: 'PSYCHIC' }, { name: 'POISON POWDER', power: 0, type: 'POISON' }]
  },

  // --- #050-051: Diglett Line ---
  DIGLETT: {
    name: 'DIGLETT', num: '050', types: ['GROUND'],
    description: 'It lives about one yard underground where it feeds on plant roots. It appears above ground rarely.',
    color: '#a52a2a', evolutionChain: ['DIGLETT', 'DUGTRIO'],
    baseHp: 10, catchRate: 255, baseXp: 53,
    moves: [{ name: 'SCRATCH', power: 4, type: 'NORMAL' }, { name: 'MUD SLAP', power: 4, type: 'GROUND' }]
  },
  DUGTRIO: {
    name: 'DUGTRIO', num: '051', types: ['GROUND'],
    description: 'A team of Diglett triplets. It triggers massive earthquakes by burrowing deep underground.',
    color: '#8b4513', evolutionChain: ['DIGLETT', 'DUGTRIO'],
    baseHp: 18, catchRate: 50, baseXp: 142,
    moves: [{ name: 'DIG', power: 10, type: 'GROUND' }, { name: 'SAND TOMB', power: 6, type: 'GROUND' }]
  },

  // --- #052-053: Meowth Line ---
  MEOWTH: {
    name: 'MEOWTH', num: '052', types: ['NORMAL'],
    description: 'It loves coins and precious gems. It will do anything to get its paws on shiny objects.',
    color: '#fcc419', evolutionChain: ['MEOWTH', 'PERSIAN'],
    baseHp: 14, catchRate: 255, baseXp: 58,
    moves: [{ name: 'SCRATCH', power: 4, type: 'NORMAL' }, { name: 'PAY DAY', power: 4, type: 'NORMAL' }]
  },
  PERSIAN: {
    name: 'PERSIAN', num: '053', types: ['NORMAL'],
    description: 'Although admired for its elegant fur and graceful stride, it is a fierce predator.',
    color: '#fab005', evolutionChain: ['MEOWTH', 'PERSIAN'],
    baseHp: 27, catchRate: 90, baseXp: 154,
    moves: [{ name: 'SLASH', power: 7, type: 'NORMAL' }, { name: 'POWER GEM', power: 10, type: 'NORMAL' }]
  },

  // --- #054-055: Psyduck Line ---
  PSYDUCK: {
    name: 'PSYDUCK', num: '054', types: ['WATER'],
    description: 'It suffers from constant headaches. When its headache gets too bad, it unleashes powerful psychic powers.',
    color: '#fcc419', evolutionChain: ['PSYDUCK', 'GOLDUCK'],
    baseHp: 18, catchRate: 190, baseXp: 64,
    moves: [{ name: 'WATER GUN', power: 5, type: 'WATER' }, { name: 'SCRATCH', power: 4, type: 'NORMAL' }]
  },
  GOLDUCK: {
    name: 'GOLDUCK', num: '055', types: ['WATER'],
    description: 'A master swimmer that moves through water with incredible grace using its webbed hands and feet.',
    color: '#fab005', evolutionChain: ['PSYDUCK', 'GOLDUCK'],
    baseHp: 35, catchRate: 75, baseXp: 168,
    moves: [{ name: 'HYDRO PUMP', power: 10, type: 'WATER' }, { name: 'ZEN HEADBUTT', power: 10, type: 'PSYCHIC' }]
  },

  // --- #056-057: Mankey Line ---
  MANKEY: {
    name: 'MANKEY', num: '056', types: ['FIGHTING'],
    description: 'It will never forgive its opponents. It becomes even more enraged when it loses a fight.',
    color: '#a52a2a', evolutionChain: ['MANKEY', 'PRIMEAPE'],
    baseHp: 14, catchRate: 190, baseXp: 61,
    moves: [{ name: 'KARATE CHOP', power: 6, type: 'FIGHTING' }, { name: 'SCRATCH', power: 4, type: 'NORMAL' }]
  },
  PRIMEAPE: {
    name: 'PRIMEAPE', num: '057', types: ['FIGHTING'],
    description: 'It becomes uncontrollably angry if it feels challenged. It throws wild tantrums of rage.',
    color: '#8b4513', evolutionChain: ['MANKEY', 'PRIMEAPE'],
    baseHp: 27, catchRate: 75, baseXp: 159,
    moves: [{ name: 'CROSS CHOP', power: 10, type: 'FIGHTING' }, { name: 'THRASH', power: 12, type: 'NORMAL' }]
  },

  // --- #058-059: Growlithe Line ---
  GROWLITHE: {
    name: 'GROWLITHE', num: '058', types: ['FIRE'],
    description: 'A loyal and faithful companion known for its courageous nature. It protects its trainer fiercely.',
    color: '#ff922b', evolutionChain: ['GROWLITHE', 'ARCANINE'],
    baseHp: 20, catchRate: 190, baseXp: 70,
    moves: [{ name: 'EMBER', power: 5, type: 'FIRE' }, { name: 'BITE', power: 5, type: 'NORMAL' }]
  },
  ARCANINE: {
    name: 'ARCANINE', num: '059', types: ['FIRE'],
    description: 'Its proud and regal appearance has captivated people since ancient times. It runs at incredible speeds.',
    color: '#e8590c', evolutionChain: ['GROWLITHE', 'ARCANINE'],
    baseHp: 45, catchRate: 75, baseXp: 194,
    moves: [{ name: 'FLAME WHEEL', power: 8, type: 'FIRE' }, { name: 'FIRE BLAST', power: 14, type: 'FIRE' }]
  },

  // --- #060-062: Poliwag Line ---
  POLIWAG: {
    name: 'POLIWAG', num: '060', types: ['WATER'],
    description: 'Its skin is so thin and damp that its internal organs can be seen as a spiraling pattern.',
    color: '#748ffc', evolutionChain: ['POLIWAG', 'POLIWHIRL', 'POLIWRATH'],
    baseHp: 14, catchRate: 255, baseXp: 60,
    moves: [{ name: 'BUBBLE', power: 4, type: 'WATER' }, { name: 'POUND', power: 4, type: 'NORMAL' }]
  },
  POLIWHIRL: {
    name: 'POLIWHIRL', num: '061', types: ['WATER'],
    description: 'Its muscular body is always dripping with water. It can swim faster than most fish.',
    color: '#5c7cfa', evolutionChain: ['POLIWAG', 'POLIWHIRL', 'POLIWRATH'],
    baseHp: 27, catchRate: 120, baseXp: 128,
    moves: [{ name: 'BUBBLE BEAM', power: 6, type: 'WATER' }, { name: 'DOUBLE SLAP', power: 6, type: 'NORMAL' }]
  },
  POLIWRATH: {
    name: 'POLIWRATH', num: '062', types: ['WATER', 'FIGHTING'],
    description: 'An expert swimmer, it can also deliver a devastating punch with its enormous, muscular arms.',
    color: '#4c6ef5', evolutionChain: ['POLIWAG', 'POLIWHIRL', 'POLIWRATH'],
    baseHp: 45, catchRate: 45, baseXp: 225,
    moves: [{ name: 'HYDRO PUMP', power: 10, type: 'WATER' }, { name: 'ICE PUNCH', power: 8, type: 'ICE' }]
  },

  // --- #063-065: Abra Line ---
  ABRA: {
    name: 'ABRA', num: '063', types: ['PSYCHIC'],
    description: 'It sleeps for 18 hours a day. Even while sleeping, it can use telepathy to sense danger.',
    color: '#fcc419', evolutionChain: ['ABRA', 'KADABRA', 'ALAKAZAM'],
    baseHp: 12, catchRate: 200, baseXp: 62,
    moves: [{ name: 'TELEPORT', power: 0, type: 'PSYCHIC' }, { name: 'CONFUSION', power: 5, type: 'PSYCHIC' }]
  },
  KADABRA: {
    name: 'KADABRA', num: '064', types: ['PSYCHIC'],
    description: 'It emits special waves from its silver spoon-like appendages to amplify its psychic power.',
    color: '#fab005', evolutionChain: ['ABRA', 'KADABRA', 'ALAKAZAM'],
    baseHp: 14, catchRate: 100, baseXp: 140,
    moves: [{ name: 'CONFUSION', power: 5, type: 'PSYCHIC' }, { name: 'PSYBEAM', power: 7, type: 'PSYCHIC' }]
  },
  ALAKAZAM: {
    name: 'ALAKAZAM', num: '065', types: ['PSYCHIC'],
    description: 'An incredible psychic Pokémon that can remember everything. Its brain never stops growing.',
    color: '#f59f00', evolutionChain: ['ABRA', 'KADABRA', 'ALAKAZAM'],
    baseHp: 20, catchRate: 50, baseXp: 221,
    moves: [{ name: 'PSYCHIC', power: 10, type: 'PSYCHIC' }, { name: 'SHADOW BALL', power: 11, type: 'GHOST' }]
  },

  // --- #066-068: Machop Line ---
  MACHOP: {
    name: 'MACHOP', num: '066', types: ['FIGHTING'],
    description: 'Loves to build its muscles. It trains in all styles of martial arts to become even stronger.',
    color: '#868e96', evolutionChain: ['MACHOP', 'MACHOKE', 'MACHAMP'],
    baseHp: 28, catchRate: 180, baseXp: 61,
    moves: [{ name: 'KARATE CHOP', power: 6, type: 'FIGHTING' }, { name: 'LOW KICK', power: 5, type: 'FIGHTING' }]
  },
  MACHOKE: {
    name: 'MACHOKE', num: '067', types: ['FIGHTING'],
    description: 'Its formidable physique never tires. It can continuously train for an entire day without rest.',
    color: '#6c757d', evolutionChain: ['MACHOP', 'MACHOKE', 'MACHAMP'],
    baseHp: 35, catchRate: 90, baseXp: 142,
    moves: [{ name: 'SEISMIC TOSS', power: 8, type: 'FIGHTING' }, { name: 'BULK UP', power: 0, type: 'FIGHTING' }]
  },
  MACHAMP: {
    name: 'MACHAMP', num: '068', types: ['FIGHTING'],
    description: 'It has four super-developed arms. It can throw 1,000 punches in two seconds flat.',
    color: '#495057', evolutionChain: ['MACHOP', 'MACHOKE', 'MACHAMP'],
    baseHp: 45, catchRate: 45, baseXp: 227,
    moves: [{ name: 'CROSS CHOP', power: 10, type: 'FIGHTING' }, { name: 'DYNAMIC PUNCH', power: 14, type: 'FIGHTING' }]
  },

  // --- #069-071: Bellsprout Line ---
  BELLSPROUT: {
    name: 'BELLSPROUT', num: '069', types: ['GRASS', 'POISON'],
    description: 'A carnivorous Pokémon that traps and eats bugs. It uses its root feet to soak up nutrients.',
    color: '#51cf66', evolutionChain: ['BELLSPROUT', 'WEEPINBELL', 'VICTREEBEL'],
    baseHp: 18, catchRate: 255, baseXp: 60,
    moves: [{ name: 'VINE WHIP', power: 6, type: 'GRASS' }, { name: 'WRAP', power: 3, type: 'NORMAL' }]
  },
  WEEPINBELL: {
    name: 'WEEPINBELL', num: '070', types: ['GRASS', 'POISON'],
    description: 'It spits out a fluid that dissolves almost anything. Beware of its acid-filled mouth.',
    color: '#40c057', evolutionChain: ['BELLSPROUT', 'WEEPINBELL', 'VICTREEBEL'],
    baseHp: 27, catchRate: 120, baseXp: 132,
    moves: [{ name: 'RAZOR LEAF', power: 7, type: 'GRASS' }, { name: 'ACID', power: 6, type: 'POISON' }]
  },
  VICTREEBEL: {
    name: 'VICTREEBEL', num: '071', types: ['GRASS', 'POISON'],
    description: 'Lures prey with the sweet aroma of its mouth nectar. When prey comes close, it snaps shut.',
    color: '#2f9e44', evolutionChain: ['BELLSPROUT', 'WEEPINBELL', 'VICTREEBEL'],
    baseHp: 35, catchRate: 45, baseXp: 216,
    moves: [{ name: 'LEAF BLADE', power: 9, type: 'GRASS' }, { name: 'SLUDGE BOMB', power: 10, type: 'POISON' }]
  },

  // --- #072-073: Tentacool Line ---
  TENTACOOL: {
    name: 'TENTACOOL', num: '072', types: ['WATER', 'POISON'],
    description: 'Drifts in surface waters. It uses its two long tentacles to zap stunned prey with poison.',
    color: '#4dabf7', evolutionChain: ['TENTACOOL', 'TENTACRUEL'],
    baseHp: 14, catchRate: 190, baseXp: 67,
    moves: [{ name: 'BUBBLE', power: 4, type: 'WATER' }, { name: 'POISON STING', power: 4, type: 'POISON' }]
  },
  TENTACRUEL: {
    name: 'TENTACRUEL', num: '073', types: ['WATER', 'POISON'],
    description: 'Its 80 tentacles can extend freely. It uses them to entangle prey and inject venom.',
    color: '#228be6', evolutionChain: ['TENTACOOL', 'TENTACRUEL'],
    baseHp: 35, catchRate: 60, baseXp: 161,
    moves: [{ name: 'SURF', power: 12, type: 'WATER' }, { name: 'SLUDGE WAVE', power: 12, type: 'POISON' }]
  },

  // --- #074-076: Geodude Line ---
  GEODUDE: {
    name: 'GEODUDE', num: '074', types: ['ROCK', 'GROUND'],
    description: 'Commonly found near mountain trails and caves. People often mistake it for a boulder.',
    color: '#868e96', evolutionChain: ['GEODUDE', 'GRAVELER', 'GOLEM'],
    baseHp: 14, catchRate: 255, baseXp: 60,
    moves: [{ name: 'TACKLE', power: 4, type: 'NORMAL' }, { name: 'ROCK THROW', power: 6, type: 'ROCK' }]
  },
  GRAVELER: {
    name: 'GRAVELER', num: '075', types: ['ROCK', 'GROUND'],
    description: 'Rolls down slopes to move. It rolls over anything without showing any sign of concern.',
    color: '#6c757d', evolutionChain: ['GEODUDE', 'GRAVELER', 'GOLEM'],
    baseHp: 24, catchRate: 120, baseXp: 134,
    moves: [{ name: 'ROCK SLIDE', power: 8, type: 'ROCK' }, { name: 'MAGNITUDE', power: 8, type: 'GROUND' }]
  },
  GOLEM: {
    name: 'GOLEM', num: '076', types: ['ROCK', 'GROUND'],
    description: 'Its body is made of solid rock. It sheds its hide once a year to grow even larger.',
    color: '#495057', evolutionChain: ['GEODUDE', 'GRAVELER', 'GOLEM'],
    baseHp: 35, catchRate: 45, baseXp: 218,
    moves: [{ name: 'EARTHQUAKE', power: 14, type: 'GROUND' }, { name: 'STONE EDGE', power: 14, type: 'ROCK' }]
  },

  // --- #077-078: Ponyta Line ---
  PONYTA: {
    name: 'PONYTA', num: '077', types: ['FIRE'],
    description: 'Its hooves are 10 times harder than diamonds. It can trample anything in its path.',
    color: '#ffd43b', evolutionChain: ['PONYTA', 'RAPIDASH'],
    baseHp: 18, catchRate: 190, baseXp: 82,
    moves: [{ name: 'EMBER', power: 5, type: 'FIRE' }, { name: 'STOMP', power: 6, type: 'NORMAL' }]
  },
  RAPIDASH: {
    name: 'RAPIDASH', num: '078', types: ['FIRE'],
    description: 'An incredibly fast runner. It can race at speeds exceeding 150 mph while its mane burns.',
    color: '#fab005', evolutionChain: ['PONYTA', 'RAPIDASH'],
    baseHp: 32, catchRate: 60, baseXp: 173,
    moves: [{ name: 'FIRE SPIN', power: 8, type: 'FIRE' }, { name: 'FLARE BLITZ', power: 14, type: 'FIRE' }]
  },

  // --- #079-080: Slowpoke Line ---
  SLOWPOKE: {
    name: 'SLOWPOKE', num: '079', types: ['WATER', 'PSYCHIC'],
    description: 'Incredibly slow and dopey. It takes five seconds to feel pain from an attack.',
    color: '#f783ac', evolutionChain: ['SLOWPOKE', 'SLOWBRO'],
    baseHp: 45, catchRate: 190, baseXp: 63,
    moves: [{ name: 'WATER GUN', power: 5, type: 'WATER' }, { name: 'CONFUSION', power: 5, type: 'PSYCHIC' }]
  },
  SLOWBRO: {
    name: 'SLOWBRO', num: '080', types: ['WATER', 'PSYCHIC'],
    description: 'Has a Shellder attached to its tail. The Shellder\'s bite triggers strange chemical reactions.',
    color: '#f06595', evolutionChain: ['SLOWPOKE', 'SLOWBRO'],
    baseHp: 50, catchRate: 75, baseXp: 172,
    moves: [{ name: 'SURF', power: 12, type: 'WATER' }, { name: 'PSYCHIC', power: 10, type: 'PSYCHIC' }]
  },

  // --- #081-082: Magnemite Line ---
  MAGNEMITE: {
    name: 'MAGNEMITE', num: '081', types: ['ELECTRIC'],
    description: 'Uses electromagnetic waves to float in the air. It is attracted by strong electric currents.',
    color: '#868e96', evolutionChain: ['MAGNEMITE', 'MAGNETON'],
    baseHp: 12, catchRate: 190, baseXp: 65,
    moves: [{ name: 'THUNDER SHOCK', power: 5, type: 'ELECTRIC' }, { name: 'SONIC BOOM', power: 0, type: 'NORMAL' }]
  },
  MAGNETON: {
    name: 'MAGNETON', num: '082', types: ['ELECTRIC'],
    description: 'Three Magnemite linked together by a strong magnetic field. It can generate powerful EM waves.',
    color: '#495057', evolutionChain: ['MAGNEMITE', 'MAGNETON'],
    baseHp: 18, catchRate: 60, baseXp: 163,
    moves: [{ name: 'THUNDERBOLT', power: 11, type: 'ELECTRIC' }, { name: 'TRI ATTACK', power: 9, type: 'NORMAL' }]
  },

  // --- #083: Farfetch'd ---
  FARFETCHD: {
    name: 'FARFETCHD', num: '083', types: ['NORMAL', 'FLYING'],
    description: 'Always carries a leek stalk. If the leek is broken or missing, it becomes despondent.',
    color: '#f59f00', evolutionChain: ['FARFETCHD'],
    baseHp: 16, catchRate: 45, baseXp: 94,
    moves: [{ name: 'PECK', power: 4, type: 'FLYING' }, { name: 'SLASH', power: 7, type: 'NORMAL' }]
  },

  // --- #084-085: Doduo Line ---
  DODUO: {
    name: 'DODUO', num: '084', types: ['NORMAL', 'FLYING'],
    description: 'A bird that makes up for its poor flying with its fast running speed. It has two heads.',
    color: '#a52a2a', evolutionChain: ['DODUO', 'DODRIO'],
    baseHp: 16, catchRate: 190, baseXp: 62,
    moves: [{ name: 'PECK', power: 4, type: 'FLYING' }, { name: 'FURY ATTACK', power: 6, type: 'NORMAL' }]
  },
  DODRIO: {
    name: 'DODRIO', num: '085', types: ['NORMAL', 'FLYING'],
    description: 'One of the fastest running Pokémon. It uses its three heads to attack from three directions.',
    color: '#8b4513', evolutionChain: ['DODUO', 'DODRIO'],
    baseHp: 26, catchRate: 45, baseXp: 155,
    moves: [{ name: 'DRILL PECK', power: 10, type: 'FLYING' }, { name: 'TRI ATTACK', power: 9, type: 'NORMAL' }]
  },

  // --- #086-087: Seel Line ---
  SEEL: {
    name: 'SEEL', num: '086', types: ['WATER'],
    description: 'Loves freezing-cold conditions. It uses its horn to break through ice floes to surface.',
    color: '#e9ecef', evolutionChain: ['SEEL', 'DEWGONG'],
    baseHp: 27, catchRate: 190, baseXp: 65,
    moves: [{ name: 'HEADBUTT', power: 5, type: 'NORMAL' }, { name: 'ICE SHARD', power: 5, type: 'ICE' }]
  },
  DEWGONG: {
    name: 'DEWGONG', num: '087', types: ['WATER', 'ICE'],
    description: 'Stores thermal energy in its blubber. It can dive deep into freezing waters without shivering.',
    color: '#dee2e6', evolutionChain: ['SEEL', 'DEWGONG'],
    baseHp: 45, catchRate: 75, baseXp: 166,
    moves: [{ name: 'AURORA BEAM', power: 7, type: 'ICE' }, { name: 'BLIZZARD', power: 14, type: 'ICE' }]
  },

  // --- #088-089: Grimer Line ---
  GRIMER: {
    name: 'GRIMER', num: '088', types: ['POISON'],
    description: 'Appeared from sludge in factories. It oozes toxic slime from its entire body.',
    color: '#7c3aed', evolutionChain: ['GRIMER', 'MUK'],
    baseHp: 35, catchRate: 190, baseXp: 65,
    moves: [{ name: 'POUND', power: 4, type: 'NORMAL' }, { name: 'SLUDGE', power: 6, type: 'POISON' }]
  },
  MUK: {
    name: 'MUK', num: '089', types: ['POISON'],
    description: 'Its body is composed of a thick, toxic sludge. Anything that touches it becomes poisoned.',
    color: '#5b21b6', evolutionChain: ['GRIMER', 'MUK'],
    baseHp: 42, catchRate: 75, baseXp: 157,
    moves: [{ name: 'SLUDGE BOMB', power: 10, type: 'POISON' }, { name: 'MINIMIZE', power: 0, type: 'NORMAL' }]
  },

  // --- #090-091: Shellder Line ---
  SHELLDER: {
    name: 'SHELLDER', num: '090', types: ['WATER'],
    description: 'Its shell is harder than diamond. It clamps onto prey and drains their fluids.',
    color: '#4dabf7', evolutionChain: ['SHELLDER', 'CLOYSTER'],
    baseHp: 14, catchRate: 190, baseXp: 63,
    moves: [{ name: 'WATER GUN', power: 5, type: 'WATER' }, { name: 'CLAMP', power: 6, type: 'WATER' }]
  },
  CLOYSTER: {
    name: 'CLOYSTER', num: '091', types: ['WATER'],
    description: 'Its shell is extremely hard. It fires spikes from its shell with tremendous force.',
    color: '#228be6', evolutionChain: ['SHELLDER', 'CLOYSTER'],
    baseHp: 18, catchRate: 60, baseXp: 184,
    moves: [{ name: 'ICE BEAM', power: 10, type: 'ICE' }, { name: 'SPIKE CANNON', power: 6, type: 'NORMAL' }]
  },

  // --- #092-094: Gastly Line ---
  GASTLY: {
    name: 'GASTLY', num: '092', types: ['GHOST', 'POISON'],
    description: 'Born from poison gases. It wraps its opponents in its gas-like body to suffocate them.',
    color: '#7c3aed', evolutionChain: ['GASTLY', 'HAUNTER', 'GENGAR'],
    baseHp: 14, catchRate: 190, baseXp: 62,
    moves: [{ name: 'LICK', power: 4, type: 'GHOST' }, { name: 'SHADOW BALL', power: 11, type: 'GHOST' }]
  },
  HAUNTER: {
    name: 'HAUNTER', num: '093', types: ['GHOST', 'POISON'],
    description: 'It is said to steal the life force of anyone who stares into its glowing red eyes.',
    color: '#6d28d9', evolutionChain: ['GASTLY', 'HAUNTER', 'GENGAR'],
    baseHp: 18, catchRate: 90, baseXp: 142,
    moves: [{ name: 'SHADOW BALL', power: 11, type: 'GHOST' }, { name: 'NIGHT SHADE', power: 0, type: 'GHOST' }]
  },
  GENGAR: {
    name: 'GENGAR', num: '094', types: ['GHOST', 'POISON'],
    description: 'Under a full moon, its shadow becomes alive and malicious. It loves to curse people.',
    color: '#5b21b6', evolutionChain: ['GASTLY', 'HAUNTER', 'GENGAR'],
    baseHp: 26, catchRate: 45, baseXp: 225,
    moves: [{ name: 'SHADOW BALL', power: 11, type: 'GHOST' }, { name: 'DARK PULSE', power: 11, type: 'GHOST' }]
  },

  // --- #095: Onix ---
  ONIX: {
    name: 'ONIX', num: '095', types: ['ROCK', 'GROUND'],
    description: 'It twists and squirms through the ground. The torque of its body can shatter huge boulders.',
    color: '#868e96', evolutionChain: ['ONIX'],
    baseHp: 16, catchRate: 45, baseXp: 77,
    moves: [{ name: 'ROCK THROW', power: 6, type: 'ROCK' }, { name: 'BIND', power: 4, type: 'NORMAL' }]
  },

  // --- #096-097: Drowzee Line ---
  DROWZEE: {
    name: 'DROWZEE', num: '096', types: ['PSYCHIC'],
    description: 'Puts enemies to sleep then eats their dreams. It is known to have a fondness for happy dreams.',
    color: '#f59f00', evolutionChain: ['DROWZEE', 'HYPNO'],
    baseHp: 26, catchRate: 190, baseXp: 66,
    moves: [{ name: 'HYPNOSIS', power: 0, type: 'PSYCHIC' }, { name: 'CONFUSION', power: 5, type: 'PSYCHIC' }]
  },
  HYPNO: {
    name: 'HYPNO', num: '097', types: ['PSYCHIC'],
    description: 'Carries a pendulum-like device. It hypnotizes victims and leads them into a deep trance.',
    color: '#d9480f', evolutionChain: ['DROWZEE', 'HYPNO'],
    baseHp: 38, catchRate: 75, baseXp: 169,
    moves: [{ name: 'PSYCHIC', power: 10, type: 'PSYCHIC' }, { name: 'HYPNOSIS', power: 0, type: 'PSYCHIC' }]
  },

  // --- #098-099: Krabby Line ---
  KRABBY: {
    name: 'KRABBY', num: '098', types: ['WATER'],
    description: 'Its pincers are extremely powerful. They can even snap a steel rod in two.',
    color: '#e03131', evolutionChain: ['KRABBY', 'KINGLER'],
    baseHp: 14, catchRate: 225, baseXp: 65,
    moves: [{ name: 'BUBBLE', power: 4, type: 'WATER' }, { name: 'VICE GRIP', power: 6, type: 'NORMAL' }]
  },
  KINGLER: {
    name: 'KINGLER', num: '099', types: ['WATER'],
    description: 'Its oversized claw is its main weapon. It can crush any object with 10,000 horsepower.',
    color: '#c92a2a', evolutionChain: ['KRABBY', 'KINGLER'],
    baseHp: 24, catchRate: 60, baseXp: 166,
    moves: [{ name: 'CRABHAMMER', power: 10, type: 'WATER' }, { name: 'GUILLOTINE', power: 15, type: 'NORMAL' }]
  },

  // --- #100-101: Voltorb Line ---
  VOLTORB: {
    name: 'VOLTORB', num: '100', types: ['ELECTRIC'],
    description: 'Often mistaken for a Poké Ball. It explodes in response to any sort of stimulus.',
    color: '#e03131', evolutionChain: ['VOLTORB', 'ELECTRODE'],
    baseHp: 14, catchRate: 190, baseXp: 66,
    moves: [{ name: 'TACKLE', power: 4, type: 'NORMAL' }, { name: 'SONIC BOOM', power: 0, type: 'NORMAL' }]
  },
  ELECTRODE: {
    name: 'ELECTRODE', num: '101', types: ['ELECTRIC'],
    description: 'Stores vast amounts of electrical energy. It can explode with tremendous force.',
    color: '#c92a2a', evolutionChain: ['VOLTORB', 'ELECTRODE'],
    baseHp: 26, catchRate: 60, baseXp: 168,
    moves: [{ name: 'THUNDERBOLT', power: 11, type: 'ELECTRIC' }, { name: 'EXPLOSION', power: 17, type: 'NORMAL' }]
  },

  // --- #102-103: Exeggcute Line ---
  EXEGGCUTE: {
    name: 'EXEGGCUTE', num: '102', types: ['GRASS', 'PSYCHIC'],
    description: 'A cluster of six eggs that think collectively. Each egg is a part of a single consciousness.',
    color: '#f783ac', evolutionChain: ['EXEGGCUTE', 'EXEGGUTOR'],
    baseHp: 26, catchRate: 90, baseXp: 65,
    moves: [{ name: 'ABSORB', power: 4, type: 'GRASS' }, { name: 'CONFUSION', power: 5, type: 'PSYCHIC' }]
  },
  EXEGGUTOR: {
    name: 'EXEGGUTOR', num: '103', types: ['GRASS', 'PSYCHIC'],
    description: 'Each of its three heads thinks independently. They work together to get things done.',
    color: '#f06595', evolutionChain: ['EXEGGCUTE', 'EXEGGUTOR'],
    baseHp: 42, catchRate: 45, baseXp: 212,
    moves: [{ name: 'SOLAR BEAM', power: 15, type: 'GRASS' }, { name: 'PSYCHIC', power: 10, type: 'PSYCHIC' }]
  },

  // --- #104-105: Cubone Line ---
  CUBONE: {
    name: 'CUBONE', num: '104', types: ['GROUND'],
    description: 'Wears the skull of its deceased mother. It mourns its mother\'s passing in the moonlight.',
    color: '#868e96', evolutionChain: ['CUBONE', 'MAROWAK'],
    baseHp: 18, catchRate: 190, baseXp: 64,
    moves: [{ name: 'BONE CLUB', power: 6, type: 'GROUND' }, { name: 'HEADBUTT', power: 5, type: 'NORMAL' }]
  },
  MAROWAK: {
    name: 'MAROWAK', num: '105', types: ['GROUND'],
    description: 'Has evolved from wearing its mother\'s skull. It uses a bone as a weapon like a boomerang.',
    color: '#6c757d', evolutionChain: ['CUBONE', 'MAROWAK'],
    baseHp: 26, catchRate: 75, baseXp: 149,
    moves: [{ name: 'BONEMERANG', power: 10, type: 'GROUND' }, { name: 'THRASH', power: 12, type: 'NORMAL' }]
  },

  // --- #106-107: Hitmonlee/Hitmonchan ---
  HITMONLEE: {
    name: 'HITMONLEE', num: '106', types: ['FIGHTING'],
    description: 'Its legs can stretch to double their length. It can kick a falling leaf in midair.',
    color: '#868e96', evolutionChain: ['HITMONLEE'],
    baseHp: 18, catchRate: 45, baseXp: 139,
    moves: [{ name: 'HI JUMP KICK', power: 12, type: 'FIGHTING' }, { name: 'MEGA KICK', power: 14, type: 'NORMAL' }]
  },
  HITMONCHAN: {
    name: 'HITMONCHAN', num: '107', types: ['FIGHTING'],
    description: 'Throws punches that are faster than a bullet train. Its fists are as hard as steel.',
    color: '#e03131', evolutionChain: ['HITMONCHAN'],
    baseHp: 18, catchRate: 45, baseXp: 140,
    moves: [{ name: 'THUNDER PUNCH', power: 8, type: 'ELECTRIC' }, { name: 'FIRE PUNCH', power: 8, type: 'FIRE' }]
  },

  // --- #108: Lickitung ---
  LICKITUNG: {
    name: 'LICKITUNG', num: '108', types: ['NORMAL'],
    description: 'Its tongue can be extended like a chameleon\'s. It uses its saliva to paralyze prey.',
    color: '#f783ac', evolutionChain: ['LICKITUNG'],
    baseHp: 45, catchRate: 45, baseXp: 77,
    moves: [{ name: 'LICK', power: 4, type: 'GHOST' }, { name: 'STOMP', power: 6, type: 'NORMAL' }]
  },

  // --- #109-110: Koffing Line ---
  KOFFING: {
    name: 'KOFFING', num: '109', types: ['POISON'],
    description: 'Its body is full of toxic gas. It floats into the air and explodes when agitated.',
    color: '#7c3aed', evolutionChain: ['KOFFING', 'WEEZING'],
    baseHp: 14, catchRate: 190, baseXp: 68,
    moves: [{ name: 'SMOG', power: 4, type: 'POISON' }, { name: 'SLUDGE', power: 6, type: 'POISON' }]
  },
  WEEZING: {
    name: 'WEEZING', num: '110', types: ['POISON'],
    description: 'Where two kinds of poison gases meet, two Koffing can fuse into a Weezing over time.',
    color: '#5b21b6', evolutionChain: ['KOFFING', 'WEEZING'],
    baseHp: 27, catchRate: 60, baseXp: 172,
    moves: [{ name: 'SLUDGE BOMB', power: 10, type: 'POISON' }, { name: 'EXPLOSION', power: 17, type: 'NORMAL' }]
  },

  // --- #111-112: Rhyhorn Line ---
  RHYHORN: {
    name: 'RHYHORN', num: '111', types: ['GROUND', 'ROCK'],
    description: 'Its massive bones are 1,000 times harder than human bones. It can topple skyscrapers.',
    color: '#868e96', evolutionChain: ['RHYHORN', 'RHYDON'],
    baseHp: 35, catchRate: 120, baseXp: 69,
    moves: [{ name: 'HORN ATTACK', power: 6, type: 'NORMAL' }, { name: 'STOMP', power: 6, type: 'NORMAL' }]
  },
  RHYDON: {
    name: 'RHYDON', num: '112', types: ['GROUND', 'ROCK'],
    description: 'Protected by an armor-like hide. It can bore through solid rock with its powerful drill horn.',
    color: '#6c757d', evolutionChain: ['RHYHORN', 'RHYDON'],
    baseHp: 42, catchRate: 60, baseXp: 170,
    moves: [{ name: 'EARTHQUAKE', power: 14, type: 'GROUND' }, { name: 'MEGA HORN', power: 14, type: 'BUG' }]
  },

  // --- #113: Chansey ---
  CHANSEY: {
    name: 'CHANSEY', num: '113', types: ['NORMAL'],
    description: 'A rare and elusive Pokémon that lays highly nutritious eggs. It is known as a gentle caretaker.',
    color: '#f783ac', evolutionChain: ['CHANSEY'],
    baseHp: 120, catchRate: 30, baseXp: 255,
    moves: [{ name: 'POUND', power: 4, type: 'NORMAL' }, { name: 'SOFT BOILED', power: 0, type: 'NORMAL' }]
  },

  // --- #114: Tangela ---
  TANGELA: {
    name: 'TANGELA', num: '114', types: ['GRASS'],
    description: 'Its entire body is covered in blue vines. It shakes its vines to entangle approaching prey.',
    color: '#51cf66', evolutionChain: ['TANGELA'],
    baseHp: 27, catchRate: 45, baseXp: 87,
    moves: [{ name: 'VINE WHIP', power: 6, type: 'GRASS' }, { name: 'MEGA DRAIN', power: 6, type: 'GRASS' }]
  },

  // --- #115: Kangaskhan ---
  KANGASKHAN: {
    name: 'KANGASKHAN', num: '115', types: ['NORMAL'],
    description: 'Raises its young in its belly pouch. It is fiercely protective of its infant offspring.',
    color: '#a52a2a', evolutionChain: ['KANGASKHAN'],
    baseHp: 42, catchRate: 45, baseXp: 172,
    moves: [{ name: 'POUND', power: 4, type: 'NORMAL' }, { name: 'MEGA PUNCH', power: 10, type: 'NORMAL' }]
  },

  // --- #116-117: Horsea Line ---
  HORSEA: {
    name: 'HORSEA', num: '116', types: ['WATER'],
    description: 'Known to shoot down flying bugs with precision blasts of ink from its snout.',
    color: '#4dabf7', evolutionChain: ['HORSEA', 'SEADRA'],
    baseHp: 14, catchRate: 225, baseXp: 59,
    moves: [{ name: 'BUBBLE', power: 4, type: 'WATER' }, { name: 'SMOKESCREEN', power: 0, type: 'NORMAL' }]
  },
  SEADRA: {
    name: 'SEADRA', num: '117', types: ['WATER'],
    description: 'Its fins and tail are thin and poisonous. It can spin its fins to generate whirlpools.',
    color: '#228be6', evolutionChain: ['HORSEA', 'SEADRA'],
    baseHp: 24, catchRate: 75, baseXp: 154,
    moves: [{ name: 'BUBBLE BEAM', power: 6, type: 'WATER' }, { name: 'DRAGON BREATH', power: 7, type: 'DRAGON' }]
  },

  // --- #118-119: Goldeen Line ---
  GOLDEEN: {
    name: 'GOLDEEN', num: '118', types: ['WATER'],
    description: 'Its dorsal fin is made of razor-sharp horn. It swims at 5 knots using its powerful tail fin.',
    color: '#f59f00', evolutionChain: ['GOLDEEN', 'SEAKING'],
    baseHp: 18, catchRate: 225, baseXp: 64,
    moves: [{ name: 'PECK', power: 4, type: 'FLYING' }, { name: 'SUPERSONIC', power: 0, type: 'NORMAL' }]
  },
  SEAKING: {
    name: 'SEAKING', num: '119', types: ['WATER'],
    description: 'In autumn, its horn grows larger as it prepares to battle rivals for a mate.',
    color: '#d9480f', evolutionChain: ['GOLDEEN', 'SEAKING'],
    baseHp: 35, catchRate: 60, baseXp: 158,
    moves: [{ name: 'HORN DRILL', power: 15, type: 'NORMAL' }, { name: 'WATERFALL', power: 10, type: 'WATER' }]
  },

  // --- #120-121: Staryu Line ---
  STARYU: {
    name: 'STARYU', num: '120', types: ['WATER'],
    description: 'If its central core is injured, it can regenerate its entire body. It sparkles at night.',
    color: '#f59f00', evolutionChain: ['STARYU', 'STARMIE'],
    baseHp: 14, catchRate: 225, baseXp: 68,
    moves: [{ name: 'TACKLE', power: 4, type: 'NORMAL' }, { name: 'WATER GUN', power: 5, type: 'WATER' }]
  },
  STARMIE: {
    name: 'STARMIE', num: '121', types: ['WATER', 'PSYCHIC'],
    description: 'Its central core glows with all colors of the rainbow. It is said to be a gem of the sea.',
    color: '#d9480f', evolutionChain: ['STARYU', 'STARMIE'],
    baseHp: 26, catchRate: 60, baseXp: 182,
    moves: [{ name: 'SURF', power: 12, type: 'WATER' }, { name: 'PSYCHIC', power: 10, type: 'PSYCHIC' }]
  },

  // --- #122: Mr. Mime ---
  MR_MIME: {
    name: 'MR_MIME', num: '122', types: ['PSYCHIC'],
    description: 'A master of pantomime. It creates invisible barriers using its finger movements.',
    color: '#f783ac', evolutionChain: ['MR_MIME'],
    baseHp: 14, catchRate: 45, baseXp: 136,
    moves: [{ name: 'CONFUSION', power: 5, type: 'PSYCHIC' }, { name: 'BARRIER', power: 0, type: 'PSYCHIC' }]
  },

  // --- #123: Scyther ---
  SCYTHER: {
    name: 'SCYTHER', num: '123', types: ['BUG', 'FLYING'],
    description: 'Its scythe-like arms are as sharp as swords. It uses them to slice through thick foliage.',
    color: '#51cf66', evolutionChain: ['SCYTHER'],
    baseHp: 28, catchRate: 45, baseXp: 100,
    moves: [{ name: 'SLASH', power: 7, type: 'NORMAL' }, { name: 'X-SCISSOR', power: 10, type: 'BUG' }]
  },

  // --- #124: Jynx ---
  JYNX: {
    name: 'JYNX', num: '124', types: ['ICE', 'PSYCHIC'],
    description: 'Speaks a language that sounds like human speech. It dances to communicate with its kind.',
    color: '#7c3aed', evolutionChain: ['JYNX'],
    baseHp: 27, catchRate: 45, baseXp: 137,
    moves: [{ name: 'LOVELY KISS', power: 0, type: 'NORMAL' }, { name: 'ICE PUNCH', power: 8, type: 'ICE' }]
  },

  // --- #125: Electabuzz ---
  ELECTABUZZ: {
    name: 'ELECTABUZZ', num: '125', types: ['ELECTRIC'],
    description: 'It generates electrical energy by rubbing its two arms together. The sparks can ignite trees.',
    color: '#fcc419', evolutionChain: ['ELECTABUZZ'],
    baseHp: 27, catchRate: 45, baseXp: 156,
    moves: [{ name: 'THUNDER SHOCK', power: 5, type: 'ELECTRIC' }, { name: 'THUNDER PUNCH', power: 8, type: 'ELECTRIC' }]
  },

  // --- #126: Magmar ---
  MAGMAR: {
    name: 'MAGMAR', num: '126', types: ['FIRE'],
    description: 'Born in an active volcano. Its body is covered in flames that burn at 2,200°F.',
    color: '#e03131', evolutionChain: ['MAGMAR'],
    baseHp: 27, catchRate: 45, baseXp: 167,
    moves: [{ name: 'EMBER', power: 5, type: 'FIRE' }, { name: 'FIRE PUNCH', power: 8, type: 'FIRE' }]
  },

  // --- #127: Pinsir ---
  PINSIR: {
    name: 'PINSIR', num: '127', types: ['BUG'],
    description: 'Its two horns are as strong as a steel clamp. It can crush and throw its enemies.',
    color: '#868e96', evolutionChain: ['PINSIR'],
    baseHp: 27, catchRate: 45, baseXp: 175,
    moves: [{ name: 'VICE GRIP', power: 6, type: 'NORMAL' }, { name: 'HYPER BEAM', power: 18, type: 'NORMAL' }]
  },

  // --- #128: Tauros ---
  TAUROS: {
    name: 'TAUROS', num: '128', types: ['NORMAL'],
    description: 'A violent and aggressive Pokémon. It whips itself into a frenzy using its three tails.',
    color: '#868e96', evolutionChain: ['TAUROS'],
    baseHp: 38, catchRate: 45, baseXp: 211,
    moves: [{ name: 'STOMP', power: 6, type: 'NORMAL' }, { name: 'THRASH', power: 12, type: 'NORMAL' }]
  },

  // --- #129-130: Magikarp Line ---
  MAGIKARP: {
    name: 'MAGIKARP', num: '129', types: ['WATER'],
    description: 'A pathetic excuse for a Pokémon. It can only splash around weakly and is totally helpless.',
    color: '#e03131', evolutionChain: ['MAGIKARP', 'GYARADOS'],
    baseHp: 10, catchRate: 255, baseXp: 20,
    moves: [{ name: 'SPLASH', power: 0, type: 'NORMAL' }, { name: 'TACKLE', power: 2, type: 'NORMAL' }]
  },
  GYARADOS: {
    name: 'GYARADOS', num: '130', types: ['WATER', 'FLYING'],
    description: 'Once it goes on a rampage, nothing can stop it. Its fearsome roar echoes for miles.',
    color: '#1971c2', evolutionChain: ['MAGIKARP', 'GYARADOS'],
    baseHp: 42, catchRate: 45, baseXp: 214,
    moves: [{ name: 'HYDRO PUMP', power: 10, type: 'WATER' }, { name: 'HYPER BEAM', power: 18, type: 'NORMAL' }]
  },

  // --- #131: Lapras ---
  LAPRAS: {
    name: 'LAPRAS', num: '131', types: ['WATER', 'ICE'],
    description: 'A gentle and intelligent Pokémon that enjoys ferrying people across the sea.',
    color: '#4dabf7', evolutionChain: ['LAPRAS'],
    baseHp: 60, catchRate: 45, baseXp: 187,
    moves: [{ name: 'SURF', power: 12, type: 'WATER' }, { name: 'ICE BEAM', power: 10, type: 'ICE' }]
  },

  // --- #132: Ditto ---
  DITTO: {
    name: 'DITTO', num: '132', types: ['NORMAL'],
    description: 'Capable of copying an enemy\'s genetic code to transform into a perfect replica of any being.',
    color: '#7c3aed', evolutionChain: ['DITTO'],
    baseHp: 20, catchRate: 35, baseXp: 61,
    moves: [{ name: 'TRANSFORM', power: 0, type: 'NORMAL' }]
  },

  // --- #133-136: Eevee Evolutions ---
  EEVEE: {
    name: 'EEVEE', num: '133', types: ['NORMAL'],
    description: 'Its genetic code is irregular. It may mutate if exposed to elemental stones.',
    color: '#a52a2a', evolutionChain: ['EEVEE', 'VAPOREON', 'JOLTEON', 'FLAREON'],
    baseHp: 20, catchRate: 45, baseXp: 65,
    moves: [{ name: 'TACKLE', power: 4, type: 'NORMAL' }, { name: 'QUICK ATTACK', power: 5, type: 'NORMAL' }]
  },
  VAPOREON: {
    name: 'VAPOREON', num: '134', types: ['WATER'],
    description: 'Its cell structure is similar to water. It can melt into water and become invisible.',
    color: '#4dabf7', evolutionChain: ['EEVEE', 'VAPOREON'],
    baseHp: 52, catchRate: 45, baseXp: 184,
    moves: [{ name: 'WATER GUN', power: 6, type: 'WATER' }, { name: 'SURF', power: 12, type: 'WATER' }]
  },
  JOLTEON: {
    name: 'JOLTEON', num: '135', types: ['ELECTRIC'],
    description: 'When its fur stands on end, it sends 10,000-volt lightning bolts to punish attackers.',
    color: '#fcc419', evolutionChain: ['EEVEE', 'JOLTEON'],
    baseHp: 27, catchRate: 45, baseXp: 184,
    moves: [{ name: 'THUNDER SHOCK', power: 5, type: 'ELECTRIC' }, { name: 'THUNDER', power: 14, type: 'ELECTRIC' }]
  },
  FLAREON: {
    name: 'FLAREON', num: '136', types: ['FIRE'],
    description: 'Stores thermal energy in its body. Its body temperature can reach 1,650°F during battle.',
    color: '#e03131', evolutionChain: ['EEVEE', 'FLAREON'],
    baseHp: 27, catchRate: 45, baseXp: 184,
    moves: [{ name: 'EMBER', power: 5, type: 'FIRE' }, { name: 'FLARE BLITZ', power: 14, type: 'FIRE' }]
  },

  // --- #137: Porygon ---
  PORYGON: {
    name: 'PORYGON', num: '137', types: ['NORMAL'],
    description: 'The world\'s first artificially created Pokémon. It can travel through cyberspace.',
    color: '#f783ac', evolutionChain: ['PORYGON'],
    baseHp: 27, catchRate: 45, baseXp: 79,
    moves: [{ name: 'TACKLE', power: 4, type: 'NORMAL' }, { name: 'PSYBEAM', power: 7, type: 'PSYCHIC' }]
  },

  // --- #138-139: Omanyte Line ---
  OMANYTE: {
    name: 'OMANYTE', num: '138', types: ['ROCK', 'WATER'],
    description: 'An ancient Pokémon that was resurrected from a fossil. It uses its tentacles to catch prey.',
    color: '#4dabf7', evolutionChain: ['OMANYTE', 'OMASTAR'],
    baseHp: 16, catchRate: 45, baseXp: 71,
    moves: [{ name: 'WATER GUN', power: 5, type: 'WATER' }, { name: 'BITE', power: 5, type: 'NORMAL' }]
  },
  OMASTAR: {
    name: 'OMASTAR', num: '139', types: ['ROCK', 'WATER'],
    description: 'Its tentacles are extremely powerful. They can crush the shells of even the toughest prey.',
    color: '#228be6', evolutionChain: ['OMANYTE', 'OMASTAR'],
    baseHp: 28, catchRate: 45, baseXp: 173,
    moves: [{ name: 'HYDRO PUMP', power: 10, type: 'WATER' }, { name: 'ANCIENT POWER', power: 8, type: 'ROCK' }]
  },

  // --- #140-141: Kabuto Line ---
  KABUTO: {
    name: 'KABUTO', num: '140', types: ['ROCK', 'WATER'],
    description: 'A Pokémon that was resurrected from a fossil. It swims through the water by wiggling its shell.',
    color: '#e03131', evolutionChain: ['KABUTO', 'KABUTOPS'],
    baseHp: 14, catchRate: 45, baseXp: 71,
    moves: [{ name: 'SCRATCH', power: 4, type: 'NORMAL' }, { name: 'AQUA JET', power: 5, type: 'WATER' }]
  },
  KABUTOPS: {
    name: 'KABUTOPS', num: '141', types: ['ROCK', 'WATER'],
    description: 'A vicious predator from ancient seas. It slashes prey with its razor-sharp scythes.',
    color: '#c92a2a', evolutionChain: ['KABUTO', 'KABUTOPS'],
    baseHp: 26, catchRate: 45, baseXp: 173,
    moves: [{ name: 'SLASH', power: 7, type: 'NORMAL' }, { name: 'STONE EDGE', power: 14, type: 'ROCK' }]
  },

  // --- #142: Aerodactyl ---
  AERODACTYL: {
    name: 'AERODACTYL', num: '142', types: ['ROCK', 'FLYING'],
    description: 'A Pokémon resurrected from an ancient amber fossil. It flies through the skies with massive wings.',
    color: '#7c3aed', evolutionChain: ['AERODACTYL'],
    baseHp: 35, catchRate: 45, baseXp: 180,
    moves: [{ name: 'WING ATTACK', power: 7, type: 'FLYING' }, { name: 'HYPER BEAM', power: 18, type: 'NORMAL' }]
  },

  // --- #143: Snorlax ---
  SNORLAX: {
    name: 'SNORLAX', num: '143', types: ['NORMAL'],
    description: 'Very lazy and sleeps most of the day. Its enormous appetite can devour mountains of food.',
    color: '#4dabf7', evolutionChain: ['SNORLAX'],
    baseHp: 70, catchRate: 25, baseXp: 189,
    moves: [{ name: 'HEADBUTT', power: 5, type: 'NORMAL' }, { name: 'BODY SLAM', power: 8, type: 'NORMAL' }]
  },

  // --- #144-146: Legendary Birds ---
  ARTICUNO: {
    name: 'ARTICUNO', num: '144', types: ['ICE', 'FLYING'],
    description: 'A legendary bird Pokémon that can freeze water vapor in the air to make snow.',
    color: '#74c0fc', evolutionChain: ['ARTICUNO'],
    baseHp: 45, catchRate: 3, baseXp: 261,
    moves: [{ name: 'BLIZZARD', power: 14, type: 'ICE' }, { name: 'ICE BEAM', power: 10, type: 'ICE' }]
  },
  ZAPDOS: {
    name: 'ZAPDOS', num: '145', types: ['ELECTRIC', 'FLYING'],
    description: 'A legendary bird Pokémon said to appear from thunderclouds while dropping lightning bolts.',
    color: '#fcc419', evolutionChain: ['ZAPDOS'],
    baseHp: 45, catchRate: 3, baseXp: 261,
    moves: [{ name: 'THUNDER', power: 14, type: 'ELECTRIC' }, { name: 'DRILL PECK', power: 10, type: 'FLYING' }]
  },
  MOLTRES: {
    name: 'MOLTRES', num: '146', types: ['FIRE', 'FLYING'],
    description: 'One of the legendary bird Pokémon. Its wingbeats create blazing flames that scorch the sky.',
    color: '#e03131', evolutionChain: ['MOLTRES'],
    baseHp: 45, catchRate: 3, baseXp: 261,
    moves: [{ name: 'FIRE BLAST', power: 14, type: 'FIRE' }, { name: 'SKY ATTACK', power: 16, type: 'FLYING' }]
  },

  // --- #147-149: Dratini Line ---
  DRATINI: {
    name: 'DRATINI', num: '147', types: ['DRAGON'],
    description: 'A mythical Pokémon of long ago. It is said to have been spotted in the seas and lakes.',
    color: '#748ffc', evolutionChain: ['DRATINI', 'DRAGONAIR', 'DRAGONITE'],
    baseHp: 18, catchRate: 45, baseXp: 60,
    moves: [{ name: 'WRAP', power: 3, type: 'NORMAL' }, { name: 'DRAGON BREATH', power: 7, type: 'DRAGON' }]
  },
  DRAGONAIR: {
    name: 'DRAGONAIR', num: '148', types: ['DRAGON'],
    description: 'A mystical Pokémon that exudes a gentle aura. It can change the weather at will.',
    color: '#5c7cfa', evolutionChain: ['DRATINI', 'DRAGONAIR', 'DRAGONITE'],
    baseHp: 30, catchRate: 45, baseXp: 147,
    moves: [{ name: 'DRAGON RAGE', power: 8, type: 'DRAGON' }, { name: 'SLAM', power: 10, type: 'NORMAL' }]
  },
  DRAGONITE: {
    name: 'DRAGONITE', num: '149', types: ['DRAGON', 'FLYING'],
    description: 'An extremely rare and powerful Pokémon. It can circle the globe in just 16 hours.',
    baseHp: 50, catchRate: 45, baseXp: 218,
    color: '#fab005', evolutionChain: ['DRATINI', 'DRAGONAIR', 'DRAGONITE'],
    moves: [{ name: 'OUTRAGE', power: 14, type: 'DRAGON' }, { name: 'HURRICANE', power: 13, type: 'FLYING' }]
  },

  // --- #150: Mewtwo ---
  MEWTWO: {
    name: 'MEWTWO', num: '150', types: ['PSYCHIC'],
    description: 'A Pokémon created by genetic manipulation. It has the most savage heart among all Pokémon.',
    color: '#7c3aed', evolutionChain: ['MEWTWO'],
    baseHp: 52, catchRate: 3, baseXp: 306,
    moves: [{ name: 'PSYCHIC', power: 10, type: 'PSYCHIC' }, { name: 'SHADOW BALL', power: 11, type: 'GHOST' }]
  },

  // --- #151: Mew ---
  MEW: {
    name: 'MEW', num: '151', types: ['PSYCHIC'],
    description: 'So rare that it is said to be a mirage. It can learn any move and has a playful nature.',
    color: '#f783ac', evolutionChain: ['MEW'],
    baseHp: 50, catchRate: 45, baseXp: 270,
    moves: [{ name: 'PSYCHIC', power: 10, type: 'PSYCHIC' }, { name: 'TRANSFORM', power: 0, type: 'NORMAL' }]
  },
};

// Returns a list of types for the given Pokémon species name
export const getPokemonTypes = (name: string): string[] => {
  const entry = POKEDEX_CATALOG[name.toUpperCase()];
  return entry ? entry.types : ['NORMAL'];
};

// Full type effectiveness calculation with complete Gen 1 type chart
export const getTypeEffectiveness = (
  moveType: string,
  defenderTypes: string[]
): { multiplier: number; description: string } => {
  const normMoveType = moveType.toUpperCase();
  let multiplier = 1;
  const moveRules = TYPE_CHART[normMoveType] || {};

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
  if (normName === 'WEEDLE' && level >= 7) return 'KAKUNA';
  if (normName === 'KAKUNA' && level >= 10) return 'BEEDRILL';
  if (normName === 'PIDGEY' && level >= 18) return 'PIDGEOTO';
  if (normName === 'PIDGEOTO' && level >= 36) return 'PIDGEOT';
  if (normName === 'RATTATA' && level >= 20) return 'RATICATE';
  if (normName === 'SPEAROW' && level >= 20) return 'FEAROW';
  if (normName === 'EKANS' && level >= 22) return 'ARBOK';
  if (normName === 'PIKACHU' && level >= 22) return 'RAICHU';
  if (normName === 'SANDSHREW' && level >= 22) return 'SANDSLASH';
  if (normName === 'NIDORAN-F' && level >= 16) return 'NIDORINA';
  if (normName === 'NIDORINA' && level >= 32) return 'NIDOQUEEN';
  if (normName === 'NIDORAN-M' && level >= 16) return 'NIDORINO';
  if (normName === 'NIDORINO' && level >= 32) return 'NIDOKING';
  if (normName === 'VULPIX' && level >= 22) return 'NINETALES';
  if (normName === 'JIGGLYPUFF' && level >= 22) return 'WIGGLYTUFF';
  if (normName === 'ZUBAT' && level >= 22) return 'GOLBAT';
  if (normName === 'ODDISH' && level >= 21) return 'GLOOM';
  if (normName === 'GLOOM' && level >= 31) return 'VILEPLUME';
  if (normName === 'PARAS' && level >= 24) return 'PARASECT';
  if (normName === 'VENONAT' && level >= 31) return 'VENOMOTH';
  if (normName === 'DIGLETT' && level >= 26) return 'DUGTRIO';
  if (normName === 'MEOWTH' && level >= 28) return 'PERSIAN';
  if (normName === 'PSYDUCK' && level >= 33) return 'GOLDUCK';
  if (normName === 'MANKEY' && level >= 28) return 'PRIMEAPE';
  if (normName === 'GROWLITHE' && level >= 22) return 'ARCANINE';
  if (normName === 'POLIWAG' && level >= 25) return 'POLIWHIRL';
  if (normName === 'POLIWHIRL' && level >= 36) return 'POLIWRATH';
  if (normName === 'ABRA' && level >= 16) return 'KADABRA';
  if (normName === 'KADABRA' && level >= 36) return 'ALAKAZAM';
  if (normName === 'MACHOP' && level >= 28) return 'MACHOKE';
  if (normName === 'MACHOKE' && level >= 36) return 'MACHAMP';
  if (normName === 'BELLSPROUT' && level >= 21) return 'WEEPINBELL';
  if (normName === 'WEEPINBELL' && level >= 31) return 'VICTREEBEL';
  if (normName === 'TENTACOOL' && level >= 30) return 'TENTACRUEL';
  if (normName === 'GEODUDE' && level >= 25) return 'GRAVELER';
  if (normName === 'GRAVELER' && level >= 36) return 'GOLEM';
  if (normName === 'PONYTA' && level >= 40) return 'RAPIDASH';
  if (normName === 'SLOWPOKE' && level >= 37) return 'SLOWBRO';
  if (normName === 'MAGNEMITE' && level >= 30) return 'MAGNETON';
  if (normName === 'DODUO' && level >= 31) return 'DODRIO';
  if (normName === 'SEEL' && level >= 34) return 'DEWGONG';
  if (normName === 'GRIMER' && level >= 38) return 'MUK';
  if (normName === 'SHELLDER' && level >= 22) return 'CLOYSTER';
  if (normName === 'GASTLY' && level >= 25) return 'HAUNTER';
  if (normName === 'HAUNTER' && level >= 36) return 'GENGAR';
  if (normName === 'DROWZEE' && level >= 26) return 'HYPNO';
  if (normName === 'KRABBY' && level >= 28) return 'KINGLER';
  if (normName === 'VOLTORB' && level >= 30) return 'ELECTRODE';
  if (normName === 'EXEGGCUTE' && level >= 22) return 'EXEGGUTOR';
  if (normName === 'CUBONE' && level >= 28) return 'MAROWAK';
  if (normName === 'KOFFING' && level >= 35) return 'WEEZING';
  if (normName === 'RHYHORN' && level >= 42) return 'RHYDON';
  if (normName === 'HORSEA' && level >= 32) return 'SEADRA';
  if (normName === 'GOLDEEN' && level >= 33) return 'SEAKING';
  if (normName === 'STARYU' && level >= 22) return 'STARMIE';
  if (normName === 'MAGIKARP' && level >= 20) return 'GYARADOS';
  if (normName === 'EEVEE' && level >= 22) {
    // Random Eeveelution for gameplay variety
    const evos = ['VAPOREON', 'JOLTEON', 'FLAREON'];
    return evos[Math.floor(Math.random() * evos.length)];
  }
  if (normName === 'OMANYTE' && level >= 40) return 'OMASTAR';
  if (normName === 'KABUTO' && level >= 40) return 'KABUTOPS';
  if (normName === 'DRATINI' && level >= 30) return 'DRAGONAIR';
  if (normName === 'DRAGONAIR' && level >= 55) return 'DRAGONITE';
  
  return null;
};

// Encounter tables by location type
export interface EncounterTable {
  minLevel: number;
  maxLevel: number;
  species: { name: string; weight: number }[];
}

export const ENCOUNTER_TABLES: Record<string, EncounterTable> = {
  // Pallet Town grassy areas - early game
  GRASS_PALLET: {
    minLevel: 2, maxLevel: 5,
    species: [
      { name: 'RATTATA', weight: 25 },
      { name: 'PIDGEY', weight: 20 },
      { name: 'CATERPIE', weight: 16 },
      { name: 'WEEDLE', weight: 12 },
      { name: 'PIKACHU', weight: 10 },
      { name: 'BULBASAUR', weight: 5 },
      { name: 'CHARMANDER', weight: 5 },
      { name: 'SQUIRTLE', weight: 5 },
      { name: 'EKANS', weight: 2 },
    ]
  },
  // Route 1 - standard route encounters
  ROUTE_1: {
    minLevel: 3, maxLevel: 6,
    species: [
      { name: 'PIDGEY', weight: 25 },
      { name: 'RATTATA', weight: 22 },
      { name: 'SPEAROW', weight: 15 },
      { name: 'EKANS', weight: 10 },
      { name: 'SANDSHREW', weight: 8 },
      { name: 'MANKEY', weight: 8 },
      { name: 'PIDGEOTO', weight: 5 },
      { name: 'RATICATE', weight: 4 },
      { name: 'JIGGLYPUFF', weight: 3 },
    ]
  },
  // Water encounter table for fishing spots
  WATER_POND: {
    minLevel: 5, maxLevel: 15,
    species: [
      { name: 'TENTACOOL', weight: 30 },
      { name: 'MAGIKARP', weight: 25 },
      { name: 'POLIWAG', weight: 15 },
      { name: 'GOLDEEN', weight: 10 },
      { name: 'STARYU', weight: 8 },
      { name: 'PSYDUCK', weight: 7 },
      { name: 'SLOWPOKE', weight: 3 },
      { name: 'GYARADOS', weight: 2 },
    ]
  },
  // Rare encounters
  RARE: {
    minLevel: 10, maxLevel: 25,
    species: [
      { name: 'CHANSEY', weight: 10 },
      { name: 'EEVEE', weight: 10 },
      { name: 'DITTO', weight: 10 },
      { name: 'SCYTHER', weight: 8 },
      { name: 'PINSIR', weight: 8 },
      { name: 'AERODACTYL', weight: 5 },
      { name: 'LAPRAS', weight: 5 },
      { name: 'DRATINI', weight: 4 },
      { name: 'PIKACHU', weight: 15 },
      { name: 'VULPIX', weight: 10 },
      { name: 'GROWLITHE', weight: 10 },
      { name: 'ABRA', weight: 5 },
    ]
  },
  // Forest area - more bug types
  GRASS_FOREST: {
    minLevel: 4, maxLevel: 10,
    species: [
      { name: 'WEEDLE', weight: 20 },
      { name: 'CATERPIE', weight: 18 },
      { name: 'PIDGEY', weight: 12 },
      { name: 'ODDISH', weight: 10 },
      { name: 'PARAS', weight: 10 },
      { name: 'VENONAT', weight: 8 },
      { name: 'BELLSPROUT', weight: 8 },
      { name: 'METAPOD', weight: 5 },
      { name: 'KAKUNA', weight: 5 },
      { name: 'PIKACHU', weight: 4 },
    ]
  },
  // Viridian Forest - dense bug habitat
  VIRIDIAN_FOREST: {
    minLevel: 5, maxLevel: 12,
    species: [
      { name: 'WEEDLE', weight: 22 },
      { name: 'CATERPIE', weight: 18 },
      { name: 'ODDISH', weight: 12 },
      { name: 'PARAS', weight: 10 },
      { name: 'VENONAT', weight: 10 },
      { name: 'PIKACHU', weight: 8 },
      { name: 'BELLSPROUT', weight: 8 },
      { name: 'METAPOD', weight: 5 },
      { name: 'KAKUNA', weight: 5 },
      { name: 'PIDGEY', weight: 2 },
    ]
  }
};

// Generate Rival Gary's team based on player's starter choice
// Gary picks the starter with a type advantage over the player
export const generateRivalTeam = (playerStarterName: string): Pokemon[] => {
  let rivalStarterName: string;
  let rivalLevel = 7;

  // Pick the counter-starter (type advantage)
  if (playerStarterName === 'BULBASAUR') {
    rivalStarterName = 'CHARMANDER'; // Fire beats Grass
  } else if (playerStarterName === 'CHARMANDER') {
    rivalStarterName = 'SQUIRTLE'; // Water beats Fire
  } else if (playerStarterName === 'SQUIRTLE') {
    rivalStarterName = 'BULBASAUR'; // Grass beats Water
  } else {
    rivalStarterName = 'EEVEE'; // Fallback
  }

  const catalogEntry = POKEDEX_CATALOG[rivalStarterName];
  if (!catalogEntry) {
    // Fallback to Eevee
    const fallback = POKEDEX_CATALOG.EEVEE;
    const maxHp = fallback.baseHp + (rivalLevel * 2);
    return [{
      id: 'rival_1',
      name: 'EEVEE',
      level: rivalLevel,
      hp: maxHp,
      maxHp: maxHp,
      color: fallback.color,
      moves: [
        { name: 'TACKLE', power: 4, type: 'NORMAL', category: 'PHYSICAL' },
        { name: 'QUICK ATTACK', power: 5, type: 'NORMAL', category: 'PHYSICAL' }
      ] as Move[]
    }];
  }

  // Build moves with proper category from the catalog (default PHYSICAL)
  const rivalMoves = catalogEntry.moves.slice(0, 2).map(m => ({
    ...m,
    category: 'PHYSICAL' as const
  })) as Move[];

  const maxHp = catalogEntry.baseHp + (rivalLevel * 2);

  return [{
    id: 'rival_1',
    name: catalogEntry.name,
    level: rivalLevel,
    hp: maxHp,
    maxHp: maxHp,
    color: catalogEntry.color,
    moves: rivalMoves
  }];
};

// Generate a wild Pokémon from a specific encounter table
// Generate a Route 1 trainer's team based on trainer ID
export const generateRoute1TrainerTeam = (trainerId: string): Pokemon[] => {
  const team: Pokemon[] = [];

  if (trainerId === 'BUG_CATCHER_1') {
    // Bug Catcher: Weedle Lv 7 + Caterpie Lv 6
    const weedleEntry = POKEDEX_CATALOG.WEEDLE;
    const caterpieEntry = POKEDEX_CATALOG.CATERPIE;

    if (weedleEntry) {
      const level = 7;
      const maxHp = weedleEntry.baseHp + (level * 2);
      team.push({
        id: 'trainer_1a',
        name: 'WEEDLE',
        level,
        hp: maxHp,
        maxHp: maxHp,
        color: weedleEntry.color,
        moves: weedleEntry.moves.slice(0, 2).map(m => ({
          ...m,
          category: m.power > 0 ? 'PHYSICAL' as const : 'STATUS' as const
        })) as Move[]
      });
    }
    if (caterpieEntry) {
      const level = 6;
      const maxHp = caterpieEntry.baseHp + (level * 2);
      team.push({
        id: 'trainer_1b',
        name: 'CATERPIE',
        level,
        hp: maxHp,
        maxHp: maxHp,
        color: caterpieEntry.color,
        moves: caterpieEntry.moves.slice(0, 2).map(m => ({
          ...m,
          category: m.power > 0 ? 'PHYSICAL' as const : 'STATUS' as const
        })) as Move[]
      });
    }
  } else if (trainerId === 'YOUNGSTER_1') {
    // Youngster: Rattata Lv 8 + Spearow Lv 7
    const rattataEntry = POKEDEX_CATALOG.RATTATA;
    const spearowEntry = POKEDEX_CATALOG.SPEAROW;

    if (rattataEntry) {
      const level = 8;
      const maxHp = rattataEntry.baseHp + (level * 2);
      team.push({
        id: 'trainer_2a',
        name: 'RATTATA',
        level,
        hp: maxHp,
        maxHp: maxHp,
        color: rattataEntry.color,
        moves: rattataEntry.moves.slice(0, 2).map(m => ({
          ...m,
          category: m.power > 0 ? 'PHYSICAL' as const : 'STATUS' as const
        })) as Move[]
      });
    }
    if (spearowEntry) {
      const level = 7;
      const maxHp = spearowEntry.baseHp + (level * 2);
      team.push({
        id: 'trainer_2b',
        name: 'SPEAROW',
        level,
        hp: maxHp,
        maxHp: maxHp,
        color: spearowEntry.color,
        moves: spearowEntry.moves.slice(0, 2).map(m => ({
          ...m,
          category: m.power > 0 ? 'PHYSICAL' as const : 'STATUS' as const
        })) as Move[]
      });
    }
  }

  // Fallback
  if (team.length === 0) {
    const fallback = POKEDEX_CATALOG.RATTATA;
    const level = 6;
    const maxHp = fallback.baseHp + (level * 2);
    team.push({
      id: 'trainer_fallback',
      name: 'RATTATA',
      level,
      hp: maxHp,
      maxHp: maxHp,
      color: fallback.color,
      moves: fallback.moves.slice(0, 2).map(m => ({
        ...m,
        category: m.power > 0 ? 'PHYSICAL' as const : 'STATUS' as const
      })) as Move[]
    });
  }

  return team;
};


export const generateWildPokemon = (tableKey?: string): Pokemon => {
  let table = ENCOUNTER_TABLES.GRASS_PALLET;
  
  // Select appropriate encounter table
  if (tableKey && ENCOUNTER_TABLES[tableKey]) {
    table = ENCOUNTER_TABLES[tableKey];
  } else {
    // Weighted random table selection
    const roll = Math.random();
    if (roll < 0.70) table = ENCOUNTER_TABLES.GRASS_PALLET;
    else if (roll < 0.90) table = ENCOUNTER_TABLES.ROUTE_1;
    else if (roll < 0.97) table = ENCOUNTER_TABLES.GRASS_FOREST;
    else table = ENCOUNTER_TABLES.RARE;
  }

  // Weighted species selection
  const totalWeight = table.species.reduce((sum, s) => sum + s.weight, 0);
  let weightRoll = Math.random() * totalWeight;
  let selectedSpecies = table.species[0].name;
  
  for (const entry of table.species) {
    weightRoll -= entry.weight;
    if (weightRoll <= 0) {
      selectedSpecies = entry.name;
      break;
    }
  }

  const catalogEntry = POKEDEX_CATALOG[selectedSpecies];
  if (!catalogEntry) {
    // Fallback
    const fallback = POKEDEX_CATALOG.RATTATA;
    const level = 3;
    return {
      id: Math.random().toString(),
      name: fallback.name,
      level,
      hp: fallback.baseHp + (level * 2),
      maxHp: fallback.baseHp + (level * 2),
      color: fallback.color,
      moves: fallback.moves.map(m => ({ ...m, category: 'PHYSICAL' as const })) as Move[]
    };
  }

  const level = Math.floor(Math.random() * (table.maxLevel - table.minLevel + 1)) + table.minLevel;
  const maxHp = catalogEntry.baseHp + (level * 2);

  return {
    id: Math.random().toString(),
    name: catalogEntry.name,
    level,
    hp: maxHp,
    maxHp: maxHp,
    color: catalogEntry.color,      moves: catalogEntry.moves.map(m => ({ ...m, category: 'PHYSICAL' as const })) as Move[]
  };
};
