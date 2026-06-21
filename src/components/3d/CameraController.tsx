import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/gameStore';

export function CameraController() {
  const position = useGameStore((state) => state.position);

  useFrame((state, delta) => {
    // Smoothly follow the player
    const targetX = position[0];
    const targetZ = position[1];

    // Desired camera position relative to player
    const camTargetX = targetX;
    const camTargetY = 12; // Height
    const camTargetZ = targetZ + 10; // Backwards offset for top-down isometric look

    // Lerp camera position
    state.camera.position.x += (camTargetX - state.camera.position.x) * 5 * delta;
    state.camera.position.y += (camTargetY - state.camera.position.y) * 5 * delta;
    state.camera.position.z += (camTargetZ - state.camera.position.z) * 5 * delta;

    // Look at player
    state.camera.lookAt(targetX, 0, targetZ);
  });

  return null;
}
