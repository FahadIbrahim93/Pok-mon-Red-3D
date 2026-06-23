import { KeyboardEvent, useEffect } from 'react';
import { useGameStore, Direction } from '../store/gameStore';
import { checkCollision, getInteraction } from './MapData';
import { soundManager } from './soundManager';
import { generateRivalTeam } from './pokemonData';

export function usePlayerControls() {
  const { position, targetPosition, isMoving, facing, dialogue, actions } = useGameStore();

  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      // Don't move if dialogue is open or in battle
      const state = useGameStore.getState();
      if (state.mode === 'BATTLE') return;

      if (dialogue) {
        // Check for Poké Mart shop number keys (1-5)
        if (dialogue.includes('POKÉ MART')) {
          const shopKeys: Record<string, string> = {
            '1': 'buy_potion',
            '2': 'buy_super_potion',
            '3': 'buy_pokeball',
            '4': 'buy_greatball',
            '5': 'buy_antidote',
          };
          if (e.key >= '1' && e.key <= '5') {
            actions.purchaseItem(shopKeys[e.key]);
            return;
          }
        }
        if (e.key === 'z' || e.key === 'x' || e.key === 'Enter' || e.key === ' ') {
          actions.clearDialogue();
          // Check if there's a pending rival battle after clearing dialogue
          // Check for rival battle pending
          const pendingRival = (window as any).__pendingRivalBattle;
          const rivalOpponent = (window as any).__rivalOpponent;
          // Always clear rival battle flags
          (window as any).__pendingRivalBattle = false;
          (window as any).__rivalOpponent = null;
          if (pendingRival && rivalOpponent) {
            actions.startTrainerBattle(rivalOpponent, 'RIVAL GARY');
            return;
          }
          // Check for route trainer battle pending
          const routeTrainerId = (window as any).__pendingRouteTrainerBattle;
          const routeTrainerTeam: any[] = (window as any).__pendingRouteTrainerTeam || [];
          const routeTrainerName: string = (window as any).__pendingRouteTrainerName || '';
          // Always clear route trainer flags
          (window as any).__pendingRouteTrainerBattle = null;
          (window as any).__pendingRouteTrainerTeam = null;
          (window as any).__pendingRouteTrainerName = null;
          if (routeTrainerId && routeTrainerTeam.length > 0 && routeTrainerName) {
            const firstMon = routeTrainerTeam[0];
            actions.startTrainerBattle(firstMon, routeTrainerName);
          }
        }
        return;
      }

      if (isMoving) return;

      let nextDir: Direction | null = null;
      let dx = 0;
      let dz = 0;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          nextDir = 'UP'; dz = -1; break;
        case 'ArrowDown':
        case 's':
          nextDir = 'DOWN'; dz = 1; break;
        case 'ArrowLeft':
        case 'a':
          nextDir = 'LEFT'; dx = -1; break;
        case 'ArrowRight':
        case 'd':
          nextDir = 'RIGHT'; dx = 1; break;
        case 'z':
        case 'Enter':
        case ' ':
          // Interact action
          interact();
          return;
        default:
          return;
      }

      const [curX, curZ] = position;

      if (nextDir && facing !== nextDir) {
        // Just turn if tapping quickly (in a polished version, we'd add an initial delay, but let's keep it simple: turn first if not moving)
        actions.setFacing(nextDir);
      }

      const nextX = curX + dx;
      const nextZ = curZ + dz;

      if (!checkCollision(nextX, nextZ)) {
        actions.startMove(nextDir, [nextX, nextZ]);
      } else {
        // Collision bounce feedback sound effect
        soundManager.playSFX('bump');
        // Just face the wall
        actions.setFacing(nextDir);
      }
    };

    const interact = () => {
      const [curX, curZ] = position;
      let targetX = curX;
      let targetZ = curZ;

      if (facing === 'UP') targetZ -= 1;
      else if (facing === 'DOWN') targetZ += 1;
      else if (facing === 'LEFT') targetX -= 1;
      else if (facing === 'RIGHT') targetX += 1;

      const text = getInteraction(targetX, targetZ);
      if (text) {
        // Trigger secret trunk rewards at coordinates (1,1)
        if (targetX === 1 && targetZ === 1) {
          actions.claimHiddenTreasure();
        } else {
          const state = useGameStore.getState();
          // Rival Gary battle — check if already defeated or player has no Pokémon
          if (targetX === 10 && targetZ === 5) {
            if (state.defeatedTrainers.includes('RIVAL GARY')) {
              actions.showDialogue("RIVAL GARY: 'What are you looking at? I already beat you once! Smell ya later!'");
              return;
            }
            if (state.party.length === 0) {
              actions.showDialogue("RIVAL GARY: 'Ha! You don't even have a Pokémon yet? Go see Gramps Oak first, loser!'");
              return;
            }
            // Show challenge dialogue, then start battle after player dismisses it
            const playerStarter = state.party[0].name;
            const rivalTeam = generateRivalTeam(playerStarter);
            const rivalMon = rivalTeam[0];
            actions.showDialogue(
              `RIVAL GARY: 'Hey Red! Check out my ${rivalMon.name}! It's way stronger than yours! Let's battle right now!'

[Press Z to accept the challenge!]`
            );
            // Store the rival data so battle starts after dialogue dismiss
            (window as any).__pendingRivalBattle = true;
            (window as any).__rivalOpponent = rivalMon;
            return;
          }
          
          // Check if we're interacting with Oak's Starter Table and starter not chosen
          if (targetX === 8 && targetZ === 7 && state.party.length === 0) {
            actions.openStarterModal();
          } else if (targetX === 2 && targetZ === 9) {
            // Pallet Town Pokémon Center — heal all Pokémon
            actions.usePokemonCenter();
          } else if (targetX === 2 && targetZ === 39) {
            // Viridian City Pokémon Center — heal all Pokémon
            actions.usePokemonCenter();
          } else if (targetX === 12 && targetZ === 9) {
            // Poké Mart — show shop dialogue with item list
            const gold = state.gold ?? 0;
            actions.showDialogue(
              `POKÉ MART CLERK: 'Welcome, trainer! We've got:\n[1] Potion (200g) — Restores 20 HP\n[2] Super Potion (500g) — Restores 50 HP\n[3] Poké Ball (200g) — Catch wild Pokémon\n[4] Great Ball (600g) — Better catch rate\n[5] Antidote (100g) — Cures poison\n\nYou have ${gold} gold.\nPress 1-5 to buy, or Z to leave.'`
            );
          } else if (targetX === 12 && targetZ === 39) {
            // Viridian City Poké Mart — show shop dialogue
            const gold = state.gold ?? 0;
            actions.showDialogue(
              `POKÉ MART CLERK: 'Welcome, traveler! We've got:\n[1] Potion (200g) — Restores 20 HP\n[2] Super Potion (500g) — Restores 50 HP\n[3] Poké Ball (200g) — Catch wild Pokémon\n[4] Great Ball (600g) — Better catch rate\n[5] Antidote (100g) — Cures poison\n\nYou have ${gold} gold.\nPress 1-5 to buy, or Z to leave.'`
            );
          } else if (text && text.startsWith('HIDDEN ITEM:')) {
            // Route hidden item system — map interaction coordinates to items
            const hiddenItems: Record<string, { itemName: string; quantity: number; displayName: string; description: string }> = {
              // Route 1
              '1,16': { itemName: 'POTION', quantity: 2, displayName: 'Potion', description: 'hidden bush near the Route 1 entrance' },
              '13,18': { itemName: 'POKEBALL', quantity: 3, displayName: 'Poké-Ball', description: 'tall grass along the eastern path' },
              '4,22': { itemName: 'ANTIDOTE', quantity: 2, displayName: 'Antidote', description: 'wildflower field on Route 1' },
              '13,23': { itemName: 'SUPER_POTION', quantity: 1, displayName: 'Super Potion', description: 'hollow tree on Route 1' },
              // Viridian Forest
              '10,26': { itemName: 'POKEBALL', quantity: 2, displayName: 'Poké-Ball', description: 'hollow tree in Viridian Forest' },
              '1,28': { itemName: 'ANTIDOTE', quantity: 1, displayName: 'Antidote', description: 'fern thicket in Viridian Forest' },
              '13,30': { itemName: 'GREATBALL', quantity: 1, displayName: 'Great Ball', description: 'buried cache near the forest wall' },
              '4,32': { itemName: 'SUPER_POTION', quantity: 2, displayName: 'Super Potion', description: 'forest clearing in Viridian Forest' },
              '12,33': { itemName: 'HYPER_POTION', quantity: 1, displayName: 'Hyper Potion', description: 'ancient tree root in the deep forest' },
            };
            const key = `${targetX},${targetZ}`;
            const hiddenItem = hiddenItems[key];
            if (hiddenItem) {
              actions.claimHiddenRouteItem(key, hiddenItem.itemName, hiddenItem.quantity, hiddenItem.displayName, hiddenItem.description);
            } else {
              actions.showDialogue(text);
            }
          } else {
            actions.showDialogue(text);
            
            // Trigger Quest update when reading the Signpost at (8,4)
            if (targetX === 8 && targetZ === 4) {
              actions.triggerReadSign();
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [position, isMoving, facing, dialogue, actions]);

  return null;
}
