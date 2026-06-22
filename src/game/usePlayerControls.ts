import { KeyboardEvent, useEffect } from 'react';
import { useGameStore, Direction } from '../store/gameStore';
import { checkCollision, getInteraction } from './MapData';
import { soundManager } from './soundManager';

export function usePlayerControls() {
  const { position, targetPosition, isMoving, facing, dialogue, actions } = useGameStore();

  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      // Don't move if dialogue is open or in battle
      const state = useGameStore.getState();
      if (state.mode === 'BATTLE') return;

      if (dialogue) {
        if (e.key === 'z' || e.key === 'x' || e.key === 'Enter' || e.key === ' ') {
          actions.clearDialogue();
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
          // Check if we're interacting with Oak's Starter Table and starter not chosen
          const state = useGameStore.getState();
          if (targetX === 8 && targetZ === 7 && state.party.length === 0) {
            actions.openStarterModal();
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
