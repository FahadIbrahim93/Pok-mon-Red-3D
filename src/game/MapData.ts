// Collision and Interaction Map for Pallet Town inspired starter map
// Coordinates are [x, z]. Map is 15x15. (Top-Left is 0,0)

export const MAP_WIDTH = 15;
export const MAP_HEIGHT = 15;

export enum TileType {
  GRASS = 0,
  PATH = 1,
  WATER = 2,
  SOLID = 3, // Fences, walls, etc.
}

// Simple layout: 0=grass, 1=path, 3=solid
// 15x15 map - KEPT AT 15x15 to maintain compatibility with World.tsx rendering
export const mapGrid = [
  [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
  [3,0,0,0,0,0,0,1,0,0,0,0,0,0,3],
  [3,0,3,3,3,0,0,1,0,3,3,3,0,0,3], // Houses (Hero and Rival)
  [3,0,3,3,3,0,0,1,0,3,3,3,0,0,3],
  [3,0,0,1,0,0,0,1,0,0,1,0,0,0,3], // Doors at x=3, x=10
  [3,0,0,1,1,1,1,1,1,1,1,0,0,0,3], // Connecting path
  [3,0,0,0,0,0,0,1,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,1,0,0,0,0,0,0,3],
  [3,0,0,0,0,3,3,3,3,3,0,0,0,0,3], // Lab
  [3,0,0,0,0,3,3,3,3,3,0,0,0,0,3],
  [3,0,0,0,0,0,0,1,0,0,0,0,0,0,3], // Lab Door at x=7
  [3,0,0,0,0,0,0,1,0,0,0,0,0,0,3],
  [3,3,3,3,0,1,1,1,1,1,0,3,3,3,3], // Route start at bottom
  [3,2,2,3,0,1,0,0,0,1,0,3,2,2,3], // Water pools
  [3,2,2,3,3,1,3,3,3,1,3,3,2,2,3],
];

// Objects that can be interacted with
export const interactionMap: Record<string, string> = {
  // Key is "x,z" (Position you must be facing)
  "3,4": "This is your home.",
  "10,4": "This is your rival's home.",
  "7,10": "OAK POKéMON RESEARCH LAB - Portal to Pokémon science.",
  "8,4": "A sign! It says: 'PALLET TOWN: Shades of your journey await!'",
  
  // Custom 3D Character interaction dialogues
  "7,7": "PROFESSOR OAK: 'Good day, Red! I am compiling our region's master research. Scout out 151 original Kanto species in your Dex, and see your progress in the Quest Log!'",
  "10,5": "RIVAL GARY: 'Yo Red! Smell ya later! My team is already high level and evolving. Test your partners in the tall grass!'",
  "4,6": "PIKACHU: 'Pika-chuuuu! *Its cheeks spark with cute static electricity.*'",
  "2,6": "BULBASAUR: 'Bulba-saur! *It points its beautiful green plant seed toward the skies.*'",
  "12,6": "CHARMANDER: 'Char-char! *The lively flame on the tip of its tail dances in the breeze.*'",
  "8,7": "OAK'S STARTER TABLE: Three pristine red-and-white Poké Balls are placed neatly under the acrylic casing! Inside, the spirits of Bulbasaur, Charmander, and Squirtle wait patiently for their lifelong partners.",

  // Scenery interactions
  "2,4": "RED'S MAILBOX: A postcard from your Mom in Cinnabar Island: 'Take care of your partners! Remember to change shoes when riding your bike!'",
  "9,4": "GARY'S MAILBOX: A glossy invitation letter from the Viridian Gym leader. Gary's name is hand-written on the invite...",
  "4,4": "RED'S FLOWER GARDEN: Sweet-smelling orange and yellow marigolds, tended carefully. They represent the fire inside every starting Trainer!",
  "11,4": "GARY'S FLOWER GARDEN: Pristine blue and white roses. They look extremely neat and competitive.",
  "5,10": "OAK'S RESEARCH BOOKSHELF: 'Fascinating! Bulb-based species demonstrate a 32% increased metabolic rate during clear daylight...'",
  "9,10": "DEX TERMINAL: The screens are blinking with genetic mapping data of legendary birds Articuno, Zapdos, and Moltres!",
  "6,10": "LAB TRASH CAN: You look inside... It's a half-eaten jelly donut! Red decides to leave it alone.",
  "5,13": "FISHING PIER: The lake water is crystal clear and sparkles under the Kanto sky. A wild Gyarados is said to slumber in the deep trenches.",
  "6,13": "FISHING PIER: Deep lake water. You see some small silhouette of wild Magikarp jumping playfully from time to time.",
  "1,1": "SECRET TRUNK: You found a dust-coated chest! *You must press Z or Enter to open it.*",

  // NEW interactions
  "7,11": "ROUTE 1 MARKER: 'Route 1 — Pallet Town to Viridian City. Wild Pokémon inhabit the tall grass. Trainers, be prepared!'",
  "14,9": "HIDDEN BERRY BUSH: A small bush with ripe, juicy berries. They smell delicious and attract wild Pokémon!",
};

export const checkCollision = (x: number, z: number): boolean => {
  if (x < 0 || x >= MAP_WIDTH || z < 0 || z >= MAP_HEIGHT) return true;
  
  // Overworld character colliders
  if (x === 7 && z === 7) return true;
  if (x === 10 && z === 5) return true;
  if (x === 4 && z === 6) return true;
  if (x === 2 && z === 6) return true;
  if (x === 12 && z === 6) return true;

  // New Scenery colliders for physical immersion
  if (x === 8 && z === 7) return true; // Oak's Starter Poké Ball table
  if (x === 1 && z === 1) return true; // Secret chest box
  if (x === 2 && z === 4) return true; // Red's mailbox
  if (x === 9 && z === 4) return true; // Gary's mailbox
  if (x === 4 && z === 4) return true; // Red's flower garden
  if (x === 11 && z === 4) return true; // Gary's flower garden
  if (x === 5 && z === 10) return true; // Lab left terminal
  if (x === 9 && z === 10) return true; // Lab right bookshelf
  if (x === 6 && z === 10) return true; // Lab trash can
  if (x === 14 && z === 9) return true; // Hidden berry bush (NEW)
  if (x === 7 && z === 11) return true; // Route marker (NEW)

  const tile = mapGrid[z]?.[x];
  return tile === TileType.SOLID || tile === TileType.WATER; // Cannot walk on solid or water
};

export const getInteraction = (x: number, z: number): string | null => {
  return interactionMap[`${x},${z}`] || null;
};
