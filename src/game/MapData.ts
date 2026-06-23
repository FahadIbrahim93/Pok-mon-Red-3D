// Collision and Interaction Map for Pallet Town inspired starter map
// Coordinates are [x, z]. Map is 15x15. (Top-Left is 0,0)

export const MAP_WIDTH = 15;
export const MAP_HEIGHT = 50;

export const VIRIDIAN_CITY_START_ROW = 35;
export const VIRIDIAN_CITY_END_ROW = 49;

export enum TileType {
  GRASS = 0,
  PATH = 1,
  WATER = 2,
  SOLID = 3, // Fences, walls, trees, etc.
}

// 15x35 map — Pallet Town (rows 0-14), Route 1 (rows 15-24), Viridian Forest (rows 25-34)
export const mapGrid = [
  // ===== PALLET TOWN (rows 0-14) =====
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
  [3,2,2,3,3,1,3,3,3,1,3,3,2,2,3], // Town exit at (5,14) and (9,14)

  // ===== ROUTE 1 (rows 15-24) =====
  // Winding path southward with tall grass and tree borders
  [3,3,3,3,3,1,1,3,1,1,3,3,3,3,3], // Row 15: Route 1 gate — narrow path
  [3,0,0,3,1,1,0,0,0,1,1,3,0,0,3], // Row 16: path widens
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,3], // Row 17: open grass
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,3], // Row 18: open grass
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,3], // Row 19: open grass
  [3,3,3,0,0,0,0,0,0,0,0,0,3,3,3], // Row 20: trees pinch in
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,3], // Row 21: open grass
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,3], // Row 22: open grass
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,3], // Row 23: open grass
  [3,3,3,3,3,1,1,1,1,1,3,3,3,3,3], // Row 24: Viridian Forest entrance gate

  // ===== VIRIDIAN FOREST (rows 25-34) =====
  // Dense tree canopy, narrow winding paths, bug territory
  [3,3,3,3,3,1,3,3,3,1,3,3,3,3,3], // Row 25: forest entrance — two paths
  [3,0,0,3,0,0,3,0,0,0,0,3,0,0,3], // Row 26: zigzag passage
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,3], // Row 27: forest clearing
  [3,0,0,0,0,0,0,3,3,0,0,0,0,0,3], // Row 28: rock wall with gap
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,3], // Row 29: open
  [3,0,0,0,0,0,0,3,3,3,0,0,0,0,3], // Row 30: wall with narrow gap at x=5-6
  [3,3,3,3,0,0,0,0,0,0,0,3,3,3,3], // Row 31: narrow pass
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,3], // Row 32: clearing
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,3], // Row 33: clearing
  [3,3,3,3,3,3,1,1,1,3,3,3,3,3,3], // Row 34: forest exit

  // ===== VIRIDIAN CITY (rows 35-49) =====
  // A bustling town at the foot of Viridian Forest, home to the famous Viridian Gym
  [3,3,3,3,3,3,1,1,1,3,3,3,3,3,3], // Row 35: City entrance gate
  [3,0,0,3,1,1,1,1,1,1,1,3,0,0,3], // Row 36: Entry plaza with garden beds
  [3,0,3,3,0,0,0,1,0,0,0,3,3,0,3], // Row 37: PokeCenter building (left) + Mart building (right)
  [3,0,3,3,0,0,0,1,0,0,0,3,3,0,3], // Row 38: Building bodies
  [3,0,1,0,0,0,0,1,0,0,0,0,1,0,3], // Row 39: Center door x=2, Mart door x=12
  [3,0,1,0,0,0,0,1,0,0,0,0,1,0,3], // Row 40: Building entrances
  [3,0,0,0,3,3,3,3,3,3,3,0,0,0,3], // Row 41: Viridian Gym (x=4-10)
  [3,0,0,0,3,3,3,3,3,3,3,0,0,0,3], // Row 42: Gym
  [3,0,0,0,0,0,1,1,1,0,0,0,0,0,3], // Row 43: Gym entrance path
  [3,3,3,0,0,0,0,1,0,0,0,0,3,3,3], // Row 44: Path with trees
  [3,0,0,0,0,0,0,1,0,0,0,0,0,0,3], // Row 45: Lower city
  [3,0,0,0,0,0,0,1,0,0,0,0,0,0,3], // Row 46: Lower city
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,3], // Row 47: Open area
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,3], // Row 48: Open area
  [3,3,3,3,3,3,3,1,3,3,3,3,3,3,3], // Row 49: City boundary
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

  // Pokémon Center door at (2,9) - player stands at (2,10) facing UP
  "2,9": "POKÉMON CENTER: 'Welcome to the Pallet Town Pokémon Center! Would you like us to restore your Pokémon to full health?'",
  // Poké Mart door at (12,9) - player stands at (12,10) facing UP
  "12,9": "POKÉ MART: 'Welcome! We've got the finest selection of items for trainers like you! Stock up before your journey!'",

  // ===== ROUTE 1 INTERACTIONS =====
  "7,15": "ROUTE 1 SIGN: 'Route 1 — Pallet Town southbound to Viridian City. Wild Pokémon roam the tall grass. Trainers, stay alert!'",
  "5,14": "ROUTE 1 GATE: 'Leaving Pallet Town. The road ahead winds through grassy fields into Viridian Forest.'",
  "9,14": "ROUTE 1 GATE: 'Leaving Pallet Town. The road ahead winds through grassy fields into Viridian Forest.'",
  "7,20": "HIDDEN BERRY BUSH: A patch of wild oran berries! They smell sweet and refreshing. Wild Pokémon love these!",
  "3,18": "WILD FLOWER FIELD: A beautiful cluster of blue and yellow Kanto wildflowers sways in the Route 1 breeze.",
  "11,22": "WEATHERED TREE STUMP: This old stump has been carved with initials — 'T.M. + K.H. 1996'. A relic of trainers past!",

  // ===== ROUTE 1 HIDDEN ITEMS =====
  "1,16": "HIDDEN ITEM: A small bush with unusually bright berries catches your eye. You push the leaves aside...",
  "13,18": "HIDDEN ITEM: The tall grass here rustles strangely. You part the blades and spot something shiny!",
  "4,22": "HIDDEN ITEM: Among the wildflowers, a metallic glint catches the sunlight. You kneel down to investigate...",
  "13,23": "HIDDEN ITEM: Behind the sturdy tree trunk, a small hollow conceals a useful item!",

  // ===== VIRIDIAN FOREST INTERACTIONS =====
  "7,24": "VIRIDIAN FOREST ENTRANCE: 'Welcome to Viridian Forest! A dense canopy of trees shelters many bug-type Pokémon. Watch your step!'",
  "7,34": "VIRIDIAN FOREST EXIT: 'The forest ends here. Viridian City lies ahead!'",
  "6,26": "FOREST SIGN: 'Beware of wild Bug Pokémon! They love to hide in the tall grass and jump out at unsuspecting trainers!'",
  "2,27": "MOSS-COVERED ROCK: The rock is covered in soft, damp moss. Tiny bug Pokémon scurry beneath it.",
  "12,29": "FALLEN LOG: A massive fallen tree trunk blocks part of the path. Tiny mushrooms grow along its bark.",
  "8,32": "FOREST CLEARING SPRING: A small, crystal-clear spring bubbles up from the ground. The water tastes sweet and clean.",
  "2,33": "ANCIENT FOREST ALTAR: A small stone altar covered in vine patterns. It feels like a sacred place for bug-type Pokémon rituals.",

  // ===== VIRIDIAN FOREST HIDDEN ITEMS =====
  "10,26": "HIDDEN ITEM: Inside the hollow of an old tree, something glints in the dim forest light...",
  "1,28": "HIDDEN ITEM: A large fern frond is bent at an odd angle. Beneath it, you spot a concealed stash!",
  "13,30": "HIDDEN ITEM: Near the stone wall, loose soil reveals the corner of something buried. You dig carefully...",
  "4,32": "HIDDEN ITEM: In the middle of the forest clearing, a patch of disturbed earth catches your eye.",
  "12,33": "HIDDEN ITEM: An unusually shaped tree root conceals a small cavity. You reach inside and feel something!",

  // ===== VIRIDIAN FOREST ITEMS (non-collider, after scenery) =====
  "7,29": "FOREST CANOPY: You look up through the dense tree canopy. Sunlight filters through in beautiful green-tinted rays.",

  // ===== VIRIDIAN CITY INTERACTIONS =====
  "7,35": "VIRIDIAN CITY: 'Welcome to Viridian City — The Gateway to Kanto! Home of the Viridian Gym and endless adventure!'",
  "2,39": "VIRIDIAN POKÉMON CENTER: 'Welcome to the Viridian City Pokémon Center! We can restore your Pokémon to full health!'",
  "12,39": "VIRIDIAN POKÉ MART: 'Welcome! The Viridian City Poké Mart has the best selection of items for traveling trainers!'",
  "7,43": "VIRIDIAN GYM: 'Viridian City Gym! Home of the Earth Badge. The Gym Leader is away on training... The doors are locked for now.'",
  "6,36": "CITY FOUNTAIN: A beautiful stone fountain sparkles in the Viridian sunlight. The water dances and shimmers with rainbow reflections.",
  "8,36": "CITY FOUNTAIN: (Other side) The fountain's crystal-clear water flows in a gentle, calming pattern. You can see coins glinting at the bottom.",
  "6,46": "COMFORTABLE BENCH: A sturdy wooden bench under the shade of a large tree. Looks like a nice spot to rest and watch the city go by.",
  "9,45": "INFORMATION KIOSK: A city bulletin board with notices about Viridian Forest trail conditions and upcoming Pokémon tournaments.",
};

// Route 1 wandering trainer NPC definitions
export interface TrainerNpcData {
  id: string;
  displayName: string;
  x: number;
  z: number;
  dialogue: string;
  encounterRadius: number;
}

export const TRAINER_NPCS: TrainerNpcData[] = [
  {
    id: 'BUG_CATCHER_1',
    displayName: 'Bug Catcher',
    x: 11,
    z: 18,
    dialogue: "BUG CATCHER: 'Hey! You're a trainer, right? My bug Pokémon are super tough! Let's see what you've got!'",
    encounterRadius: 1,
  },
  {
    id: 'YOUNGSTER_1',
    displayName: 'Youngster',
    x: 4,
    z: 22,
    dialogue: "YOUNGSTER: 'I'm the strongest trainer on Route 1! My Pokémon are super fast! Get ready to lose!'",
    encounterRadius: 1,
  },
];

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

  // ===== ROUTE 1 COLLIDERS =====
  if (x === 7 && z === 15) return true; // Route 1 sign
  if (x === 7 && z === 20) return true; // Hidden berry bush Route 1
  if (x === 3 && z === 18) return true; // Wildflower field
  if (x === 11 && z === 22) return true; // Tree stump

  // ===== ROUTE 1 HIDDEN ITEM COLLIDERS =====
  if (x === 1 && z === 16) return true; // Hidden Potion
  if (x === 13 && z === 18) return true; // Hidden Poké Ball
  if (x === 4 && z === 22) return true; // Hidden Antidote
  if (x === 13 && z === 23) return true; // Hidden Super Potion

  // ===== VIRIDIAN FOREST COLLIDERS =====
  if (x === 7 && z === 24) return true; // Forest entrance marker
  if (x === 7 && z === 34) return true; // Forest exit marker
  if (x === 6 && z === 26) return true; // Forest sign
  if (x === 2 && z === 27) return true; // Moss-covered rock
  if (x === 12 && z === 29) return true; // Fallen log
  if (x === 8 && z === 32) return true; // Forest spring
  if (x === 2 && z === 33) return true; // Ancient altar

  // ===== VIRIDIAN FOREST HIDDEN ITEM COLLIDERS =====
  if (x === 10 && z === 26) return true; // Hidden Poké Ball (hollow log)
  if (x === 1 && z === 28) return true; // Hidden Antidote
  if (x === 13 && z === 30) return true; // Hidden Great Ball
  if (x === 4 && z === 32) return true; // Hidden Super Potion
  if (x === 12 && z === 33) return true; // Hidden Hyper Potion (rare!)

  // ===== ROUTE 1 WANDERING TRAINER NPCS =====
  if (x === 11 && z === 18) return true; // Bug Catcher
  if (x === 4 && z === 22) return true; // Youngster

  // ===== VIRIDIAN CITY COLLIDERS =====
  if (x === 7 && z === 35) return true; // City entrance sign
  if (x === 6 && z === 36) return true; // Fountain (left side)
  if (x === 8 && z === 36) return true; // Fountain (right side)
  if (x === 6 && z === 46) return true; // Bench
  if (x === 9 && z === 45) return true; // Info kiosk

  // Pokémon Center colliders (1,7)-(3,9)
  if (x >= 1 && x <= 3 && z >= 7 && z <= 9) return true;
  // Poké Mart colliders (11,7)-(13,9)
  if (x >= 11 && x <= 13 && z >= 7 && z <= 9) return true;

  const tile = mapGrid[z]?.[x];
  return tile === TileType.SOLID || tile === TileType.WATER; // Cannot walk on solid or water
};

export const getInteraction = (x: number, z: number): string | null => {
  return interactionMap[`${x},${z}`] || null;
};
