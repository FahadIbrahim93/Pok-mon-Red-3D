<div align="center">

# Pokémon Red 3D 🎮

### A browser-native 3D recreation of the classic monster-catching RPG

[![Play Now](https://img.shields.io/badge/▶️_Play_Now-GitHub_Pages-2ea44f?style=for-the-badge&logo=github)](https://fahadibrahim93.github.io/Pok-mon-Red-3D/)
[![Built with Vite](https://img.shields.io/badge/Built_with-Vite-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-000000?style=for-the-badge&logo=three.js)](https://docs.pmnd.rs/react-three-fiber)

**[▶ Play the game now!](https://fahadibrahim93.github.io/Pok-mon-Red-3D/)**

</div>

## Overview

Explore the world of Pokémon in full 3D! This project reimagines the classic Pokémon Red experience with modern web technologies — rendered in real-time 3D with React Three Fiber, featuring turn-based battles, an interactive world, and classic Pokémon mechanics.

### Features

- **3D Open World** — Navigate Pallet Town and the surrounding area from a third-person perspective
- **Turn-Based Battles** — Classic battle system with PHYSICAL, SPECIAL, and STATUS moves
- **Starter Selection** — Choose Bulbasaur, Charmander, or Squirtle with a cinematic particle celebration
- **Status Conditions** — Sleep, Paralysis, Poison, Burn, Freeze, and Confusion with full gameplay effects
- **PC Box System** — Store and manage your Pokémon collection
- **Inventory System** — Use items, potions, and Poké Balls
- **Dynamic Time** — Day/night cycle with NPC behavior changes
- **Chiptune Sound** — Synth-generated sound effects for battles and interactions
- **Touch Controls** — Mobile-friendly with on-screen controls

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Tech Stack

| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **Three.js / React Three Fiber** | 3D rendering engine |
| **React Three Drei** | 3D helpers (orbit controls, etc.) |
| **Zustand** | State management |
| **Framer Motion** | Animations and transitions |
| **Tailwind CSS v4** | Styling |
| **Vite** | Build tool and dev server |
| **TypeScript** | Type safety |

## Game Controls

| Key | Action |
|---|---|
| `W/A/S/D` or Arrow Keys | Move character |
| `Enter` / `Space` | Interact / Confirm |
| `Escape` | Back / Cancel |
| `I` | Open inventory |
| `P` | Open Pokédex |
| `Q` | Toggle quest log |
| `B` | Open PC Box |
| `M` | Toggle minimap |

## Architecture

```
src/
├── components/
│   ├── 3d/          # 3D scene components (World, Player, Battle)
│   └── ui/          # UI overlays (Battle, Inventory, PC Box, etc.)
├── game/            # Game logic (movement, maps, sound, Pokémon data)
├── store/           # Zustand state management
└── App.tsx          # Root application
```

## Deployment

The game is deployed via **GitHub Pages** at:
**[https://fahadibrahim93.github.io/Pok-mon-Red-3D/](https://fahadibrahim93.github.io/Pok-mon-Red-3D/)**

Any push to the `main` branch triggers automatic redeployment via GitHub Actions.

### Manual Deploy

```bash
npm run deploy
```

---

<div align="center">
  <sub>Built with ❤️ using React Three Fiber, TypeScript, and a lot of nostalgia</sub>
</div>
