import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh } from 'three';
import { useGameStore } from '../../store/gameStore';
import { mapGrid, TileType } from '../../game/MapData';
import { generateWildPokemon } from '../../game/pokemonData';

const MOVE_SPEED = 5.0; // Units per second

export function Player() {
  const groupRef = useRef<Group>(null);
  
  // Child parts for animations
  const leftLegRef = useRef<Group>(null);
  const rightLegRef = useRef<Group>(null);
  const bodyGroupRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);

  const position = useGameStore((state) => state.position);
  const targetPosition = useGameStore((state) => state.targetPosition);
  const isMoving = useGameStore((state) => state.isMoving);
  const facing = useGameStore((state) => state.facing);
  const actions = useGameStore((state) => state.actions);
  const bicycleActive = useGameStore((state) => state.bicycleActive);

  const moveSpeed = bicycleActive ? 8.5 : 5.0;

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Smooth delta clamping for safety
    const dt = Math.min(delta, 0.1);

    // Movement interpolation
    if (isMoving) {
      const g = groupRef.current;
      const [tx, tz] = targetPosition;
      
      let reachedX = false;
      let reachedZ = false;

      // Move X
      if (Math.abs(g.position.x - tx) > 0.05) {
        g.position.x += Math.sign(tx - g.position.x) * moveSpeed * dt;
      } else {
        g.position.x = tx;
        reachedX = true;
      }

      // Move Z
      if (Math.abs(g.position.z - tz) > 0.05) {
        g.position.z += Math.sign(tz - g.position.z) * moveSpeed * dt;
      } else {
        g.position.z = tz;
        reachedZ = true;
      }

      // Progress value for animations (from 0 to PI)
      const progress = Math.max(
        Math.abs(g.position.x - position[0]),
        Math.abs(g.position.z - position[1])
      );
      
      // Dynamic bouncing & leaning effects
      if (bodyGroupRef.current) {
        // High-fidelity squash & stretch walk cycle
        bodyGroupRef.current.position.y = 0.5 + Math.sin(progress * Math.PI) * 0.12;
        bodyGroupRef.current.rotation.x = Math.sin(progress * Math.PI * 2) * 0.05 + 0.08; // Lean forward
      }

      // Leg swing cycles
      const swingSpeed = bicycleActive ? 28 : 16;
      const swingAngle = Math.sin(state.clock.getElapsedTime() * swingSpeed) * 0.4;
      if (leftLegRef.current) leftLegRef.current.rotation.x = swingAngle;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -swingAngle;

      // Head bobbing
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 10) * 0.03;
      }

      if (reachedX && reachedZ) {
        actions.endMove();
      }
    } else {
      // Idle state: gentle breathing animation
      const idleTime = state.clock.getElapsedTime();
      if (bodyGroupRef.current) {
        bodyGroupRef.current.position.y = 0.5 + Math.sin(idleTime * 2.5) * 0.015;
      }
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      if (headRef.current) headRef.current.rotation.y = 0;
    }

    // Rotation based on facing direction
    let targetRotY = 0;
    if (facing === 'DOWN') targetRotY = 0;
    if (facing === 'LEFT') targetRotY = -Math.PI / 2;
    if (facing === 'UP') targetRotY = Math.PI;
    if (facing === 'RIGHT') targetRotY = Math.PI / 2;

    // Handle wrap-around rotation smoothing
    let diff = targetRotY - groupRef.current.rotation.y;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    groupRef.current.rotation.y += diff * 15 * dt;
  });

  return (
    <group ref={groupRef} position={[position[0], 0, position[1]]}>
      
      {/* Dynamic Player Pivot Group */}
      <group ref={bodyGroupRef} position={[0, 0.5, 0]}>
        
        {/* Core Body: Trainer Jacket */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.48, 0.55, 0.32]} />
          <meshStandardMaterial color="#e03131" roughness={0.7} /> {/* Red shirt/jacket */}
        </mesh>

        {/* Jacket collar & details */}
        <mesh position={[0, 0.28, 0.01]} castShadow>
          <boxGeometry args={[0.52, 0.08, 0.34]} />
          <meshStandardMaterial color="#f8f9fa" roughness={0.5} /> {/* White collar */}
        </mesh>

        {/* Dynamic Stylized Head */}
        <group ref={headRef} position={[0, 0.42, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.38, 0.38, 0.38]} />
            <meshStandardMaterial color="#ffd8a8" roughness={0.8} /> {/* Skin */}
          </mesh>

          {/* Adorable Anime Eyes */}
          <group position={[0, 0.02, 0.2]}>
            <mesh position={[-0.1, 0, 0]}>
              <boxGeometry args={[0.07, 0.12, 0.01]} />
              <meshStandardMaterial color="#212529" roughness={0.9} />
            </mesh>
            <mesh position={[0.1, 0, 0]}>
              <boxGeometry args={[0.07, 0.12, 0.01]} />
              <meshStandardMaterial color="#212529" roughness={0.9} />
            </mesh>
          </group>

          {/* Hair spikes under cap */}
          <mesh position={[0, 0.12, -0.16]} castShadow>
            <boxGeometry args={[0.34, 0.18, 0.12]} />
            <meshStandardMaterial color="#495057" roughness={0.9} /> {/* Hair */}
          </mesh>

          {/* Signature RED and WHITE Cap */}
          <group position={[0, 0.2, 0]}>
            {/* White Front Segment */}
            <mesh position={[0, -0.02, 0.04]} castShadow>
              <boxGeometry args={[0.42, 0.14, 0.36]} />
              <meshStandardMaterial color="#f8f9fa" roughness={0.6} />
            </mesh>
            {/* Red Cap Dome */}
            <mesh position={[0, 0.04, -0.06]} castShadow>
              <boxGeometry args={[0.4, 0.18, 0.3]} />
              <meshStandardMaterial color="#e03131" roughness={0.6} />
            </mesh>
            {/* Cap Brim / Visor */}
            <mesh position={[0, -0.04, 0.22]} rotation={[0.08, 0, 0]} castShadow>
              <boxGeometry args={[0.42, 0.03, 0.16]} />
              <meshStandardMaterial color="#e03131" roughness={0.5} />
            </mesh>
          </group>
        </group>

        {/* Yellow Explorer Backpack */}
        <mesh position={[0, 0.1, -0.22]} castShadow>
          <boxGeometry args={[0.32, 0.36, 0.14]} />
          <meshStandardMaterial color="#fab005" roughness={0.6} /> {/* Backpack yellow */}
        </mesh>
        {/* Backpack pocket */}
        <mesh position={[0, 0.02, -0.3]} castShadow>
          <boxGeometry args={[0.22, 0.18, 0.06]} />
          <meshStandardMaterial color="#15aabf" roughness={0.6} /> {/* Cyan accent */}
        </mesh>

        {/* Left Leg Block */}
        <group ref={leftLegRef} position={[-0.14, -0.32, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.16, 0.28, 0.18]} />
            <meshStandardMaterial color="#1971c2" roughness={0.8} /> {/* Blue trousers */}
          </mesh>
          {/* Shoe */}
          <mesh position={[0, -0.16, 0.04]} castShadow>
            <boxGeometry args={[0.18, 0.1, 0.26]} />
            <meshStandardMaterial color="#f8f9fa" roughness={0.5} /> {/* White-red sneaker */}
          </mesh>
        </group>

        {/* Right Leg Block */}
        <group ref={rightLegRef} position={[0.14, -0.32, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.16, 0.28, 0.18]} />
            <meshStandardMaterial color="#1971c2" roughness={0.8} />
          </mesh>
          {/* Shoe */}
          <mesh position={[0, -0.16, 0.04]} castShadow>
            <boxGeometry args={[0.18, 0.1, 0.26]} />
            <meshStandardMaterial color="#f8f9fa" roughness={0.5} />
          </mesh>
        </group>

      </group>

      {/* Stylized Drop Shadow Circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.38, 24]} />
        <meshBasicMaterial color="#1864ab" opacity={0.34} transparent />
      </mesh>
    </group>
  );
}
