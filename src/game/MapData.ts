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
// 15x15 map
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
  "7,10": "OAK POKéMON RESEARCH LAB",
  "8,4": "A sign! It says: 'PALLET TOWN: Shades of your journey await!'",
  
  // Custom 3D Character interaction dialogues
  "7,7": "PROFESSOR OAK: 'Good day, Red! I am compiling our region's master research. Scout out 151 original Kanto species in your Dex, and see your progress in the Quest Log!'",
  "10,5": "RIVAL GARY: 'Yo Red! Smell ya later! My team is already high level and evolving. Test your partners in the tall grass!'",
  "4,6": "PIKACHU: 'Pika-chuuuu! *Its cheeks spark with cute static electricity.*'",
  "2,6": "BULBASAUR: 'Bulba-saur! *It points its beautiful green plant seed toward the skies.*'",
  "12,6": "CHARMANDER: 'Char-char! *The lively flame on the tip of its tail dances in the breeze.*'"
};

export const checkCollision = (x: number, z: number): boolean => {
  if (x < 0 || x >= MAP_WIDTH || z < 0 || z >= MAP_HEIGHT) return true;
  
  // Overworld character colliders
  if (x === 7 && z === 7) return true;
  if (x === 10 && z === 5) return true;
  if (x === 4 && z === 6) return true;
  if (x === 2 && z === 6) return true;
  if (x === 12 && z === 6) return true;

  const tile = mapGrid[z]?.[x];
  return tile === TileType.SOLID || tile === TileType.WATER; // Cannot walk on solid or water
};

export const getInteraction = (x: number, z: number): string | null => {
  return interactionMap[`${x},${z}`] || null;
};
