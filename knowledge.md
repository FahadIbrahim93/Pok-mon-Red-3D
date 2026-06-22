# Project Knowledge — Pokémon Red 3D

A 3D Pokémon Red prototype built with React Three Fiber, Zustand state management, and a procedural chiptune sound engine.

---

## Quickstart

- **Setup:** `npm install`
- **Dev:** `npm run dev`
- **Typecheck:** `npx tsc --noEmit`

---

## Game Flow

### Starter Sequence (New Game Flow)
1. **Spawn** at (7, 11) outside Oak's Lab, facing UP
2. **Walk north** into the lab entrance (7, 10) → Oak's introductory dialogue appears automatically
3. **Dismiss Oak's dialogue** (Z/Space/Enter/Escape)
4. **Interact** with the Starter Table at (8, 7) → Starter modal opens
5. **Choose** Bulbasaur, Charmander, or Squirtle:
   - **Enter** to confirm, **Escape** to close (when no starter selected)
   - Visual effects on confirm: screen flash → 20 emoji burst + 36 confetti sparkle particles → camera shake → Poké Ball click sound
6. **Oak congratulates you** → Continue your adventure!

### Starter Modal Features
- Keyboard shortcuts: **Enter** (confirm), **Escape** (close when no selection)
- Animated screen flash with radial gradient in the starter's color
- 20 emoji burst particles radiating from center (🌿/🔥/💧)
- 36 confetti sparkle particles — staggered delays, varied shapes/sizes, cubic-bezier easing, glow shadows
- Camera shake on confirm — decaying oscillation [0, -8, 8, -6, 6, -4, 4, -2, 2, 0]px over 350ms
- Poké Ball click sound synced with screen flash

### Battle System
- Turn-based wild Pokémon encounters in tall grass (14% step rate)
- **Move pool** with 100+ moves organized in `MOVE_REGISTRY`:
  - **PHYSICAL/SPECIAL** — damage-dealing moves with type effectiveness multipliers
  - **STATUS** — stat modifications (Growl, Tail Whip, Sand Attack, Harden, Bulk Up, Agility) and status conditions (Sleep, Poison, Paralysis, Confusion)
  - **Secondary effects** — Poison Sting (20% poison), Lick (30% paralysis), etc. trigger after damage
- **Stat stage modifiers** affect damage calculation (Gen 1 formula)
- **Intelligent opponent AI** — prioritizes status moves when beneficial
- **Capture system** — 70% base catch rate, Poké Balls, Great Balls, Master Balls
- **Victory rewards** — XP, Gold, level-ups, evolution chains (full Gen 1)
- **Status badges** in HUD (PSN/PAR/SLP/CNF/BRN/FRZ)
- **Move category icons** on FIGHT buttons (💪 PHYSICAL, ✨ SPECIAL, 🎯 STATUS)

---

## Architecture

### Key Directories
- `src/components/3d/` — R3F canvas components (World, Player, PokemonModel, Scene, etc.)
- `src/components/ui/` — Overlay UI (BattleUI, DialogueBox, PokedexModal, PCBox, Inventory, StarterSelection, etc.)
- `src/store/` — Zustand state management (`gameStore.ts`)
- `src/game/` — Game logic (`pokemonData.ts`, `MapData.ts`, `soundManager.ts`, `usePlayerControls.ts`)

### Data Flow
- **Zustand** global store (`useGameStore`) manages: position, party, inventory, pokedex, battle state, quests, settings
- **Persist** middleware saves to `localStorage` key `pokemon-3d-save`
- **Battle state** (`BattleState`) tracks: opponent, turn, log, menu state, status effects, stat stages
- **Move resolution** — `getMoveDetails(move.name)` normalizes flat move data via `MOVE_REGISTRY` at runtime

### Key State Flags
- `starterChosen` / `showStarterModal` — starter selection flow
- `metOak` — Oak's lab intro dialogue (persisted, triggers once on first lab entry)
- `readSign` / `hiddenTreasureClaimed` — world interaction flags
- `bicycleActive` / `showTownMap` — item toggles

---

## Conventions

- **TypeScript strict mode** — no `any` casts (only `as Move[]` type assertions for inline move arrays)
- **Framer Motion** for all UI animations (`motion/react`)
- **Tailwind CSS** for all styling
- **Sound:** Procedural chiptune via Web Audio API in `soundManager.ts` — square/triangle oscillators with frequency sweeps
- **Moves** stored flat in `POKEDEX_CATALOG`, fully resolved via `MOVE_REGISTRY` + `getMoveDetails()`
- **Use `BATTLE_BASE`** spread when creating battle states to ensure all required fields present
- **Module-level constants** for pure functions — `getStatusBadgeStyle`, `CONFETTI_COLORS`, `TYPE_BADGES` are outside components

### Things to Avoid
- Don't mutate Zustand state directly — always use `set()` with spread
- Don't cast as `any` — prefer proper type assertions
- Don't use `setInterval` for UI animations — use Framer Motion keyframes
- Don't hardcode move objects — use `getMoveDetails()` for runtime resolution
