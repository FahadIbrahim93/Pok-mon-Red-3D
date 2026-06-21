import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh } from 'three';

interface PokemonModelProps {
  name: string;
  color: string;
  state?: 'IDLE' | 'ATTACK' | 'HIT' | 'FAINTED';
  isBackView?: boolean;
  scale?: number;
}

export function PokemonModel({
  name,
  color,
  state = 'IDLE',
  isBackView = false,
  scale = 1.0,
}: PokemonModelProps) {
  const groupRef = useRef<Group>(null);
  const leftLegRef = useRef<Group>(null);
  const rightLegRef = useRef<Group>(null);
  const leftWingRef = useRef<Group>(null);
  const rightWingRef = useRef<Group>(null);
  const earsGroupRef = useRef<Group>(null);
  const bodyRef = useRef<Mesh>(null);
  const tailRef = useRef<Group>(null);

  const normName = name.toUpperCase();

  // Procedural archetype detection
  const isStarterBulb = normName.includes('BULBA') || normName.includes('IVY') || normName.includes('VENU');
  const isStarterFlame = normName.includes('CHAR');
  const isStarterShell = normName.includes('SQUIRT') || normName.includes('WAR') || normName.includes('BLAST');
  const isElectricMouse = normName.includes('PIKA') || normName.includes('RAI') || normName.includes('VOLT') || normName.includes('JOLT');
  const isBird = normName.includes('PIDG') || normName.includes('SPEAR') || normName.includes('FEAR') || normName.includes('WIDG') || normName.includes('ARTIC') || normName.includes('ZAPD') || normName.includes('MOLT') || normName.includes('AERO');
  const isBug = normName.includes('CATER') || normName.includes('META') || normName.includes('BUTTER') || normName.includes('WEED') || normName.includes('KAKU') || normName.includes('BEED');
  const isRoundBall = normName.includes('VOLTORB') || normName.includes('ELECTRODE') || normName.includes('JIGGLY') || normName.includes('WIGGLY') || normName.includes('KOFF') || normName.includes('WEEZ') || normName.includes('ODDISH') || normName.includes('CLEF') || normName.includes('SHELL') || normName.includes('CLOYST') || normName.includes('CHANSEY');
  const isSerpent = normName.includes('EKAN') || normName.includes('ARBOK') || normName.includes('ONIX') || normName.includes('DRATIN') || normName.includes('DRAGONAIR') || normName.includes('GYARAD');

  // Core colors
  const primaryColor = color || '#ced4da';
  const secondaryColor = isStarterBulb ? '#f783ac' : isStarterFlame ? '#fab005' : isStarterShell ? '#e8590c' : isElectricMouse ? '#ff922b' : '#868e96';

  useFrame((stateObj) => {
    if (!groupRef.current) return;
    const time = stateObj.clock.getElapsedTime();

    // 1. Idle Hover or breathing animation
    if (state === 'IDLE') {
      const hoverAmp = isBird ? 0.08 : 0.02;
      const hoverFreq = isBird ? 4.5 : 2.0;
      groupRef.current.position.y = Math.sin(time * hoverFreq) * hoverAmp;
      
      // Gentle breathing
      if (bodyRef.current) {
        const breathScale = 1.0 + Math.sin(time * 2.5) * 0.015;
        bodyRef.current.scale.set(breathScale, breathScale, breathScale);
      }
    }

    // 2. Wing Flap animation
    if (leftWingRef.current && rightWingRef.current) {
      const flapSpeed = isBird ? 12 : 6;
      const flapAngle = Math.sin(time * flapSpeed) * 0.35 + 0.1;
      leftWingRef.current.rotation.z = -flapAngle;
      rightWingRef.current.rotation.z = flapAngle;
    }

    // 3. Legs cycle if moving state or gentle hop
    if (leftLegRef.current && rightLegRef.current) {
      const legSpeed = 8;
      leftLegRef.current.rotation.x = Math.sin(time * legSpeed) * 0.25;
      rightLegRef.current.rotation.x = -Math.sin(time * legSpeed) * 0.25;
    }

    // 4. Tail sway movement
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(time * 3) * 0.15;
    }

    // 5. Ear twitch
    if (earsGroupRef.current) {
      earsGroupRef.current.rotation.z = Math.sin(time * 4) * 0.04;
    }

    // State transitions visual logic
    if (state === 'HIT') {
      // Rapid horizontal shaking when damaged
      groupRef.current.position.x = Math.sin(time * 28) * 0.09;
      groupRef.current.position.z = Math.cos(time * 28) * 0.04;
    } else if (state === 'ATTACK') {
      // Tackle leap action moving forward slightly
      groupRef.current.position.z = isBackView ? 0.35 : -0.35;
      groupRef.current.position.y = Math.sin(time * 20) * 0.15;
    } else if (state === 'FAINTED') {
      // Falling over rotation
      groupRef.current.rotation.z = Math.min(Math.PI / 2, groupRef.current.rotation.z + 0.18);
      groupRef.current.position.y = -0.3;
    } else {
      groupRef.current.position.x = 0;
    }
  });

  return (
    <group ref={groupRef} scale={[scale, scale, scale]} rotation={[0, isBackView ? 0 : Math.PI, 0]}>
      {/* 3D Base Pokemon Group */}
      <group position={[0, 0.4, 0]}>
        
        {/* Core Body mesh */}
        <mesh ref={bodyRef} castShadow receiveShadow>
          {isRoundBall ? (
            <sphereGeometry args={[0.36, 12, 12]} />
          ) : isSerpent ? (
            <cylinderGeometry args={[0.1, 0.14, 0.9, 8]} />
          ) : (
            <boxGeometry args={[0.42, 0.38, 0.46]} />
          )}
          <meshStandardMaterial color={primaryColor} roughness={0.7} />
        </mesh>

        {/* Head rendering based on species */}
        {!isRoundBall && (
          <group position={[0, 0.25, isBackView ? -0.1 : 0.16]}>
            <mesh castShadow>
              <boxGeometry args={[0.3, 0.28, 0.3]} />
              <meshStandardMaterial color={primaryColor} roughness={0.7} />
            </mesh>

            {/* Glowing Eyes */}
            <group position={[0, 0.04, isBackView ? -0.16 : 0.16]}>
              <mesh position={[-0.09, 0, 0]}>
                <boxGeometry args={[0.04, 0.08, 0.02]} />
                <meshStandardMaterial color="#212529" roughness={0.9} />
              </mesh>
              <mesh position={[0.09, 0, 0]}>
                <boxGeometry args={[0.04, 0.08, 0.02]} />
                <meshStandardMaterial color="#212529" roughness={0.9} />
              </mesh>
            </group>

            {/* Pikachu Red cheeks check */}
            {isElectricMouse && (
              <group position={[0, -0.04, isBackView ? -0.16 : 0.16]}>
                <mesh position={[-0.12, 0, 0]}>
                  <boxGeometry args={[0.06, 0.06, 0.02]} />
                  <meshStandardMaterial color="#fa5252" roughness={0.5} />
                </mesh>
                <mesh position={[0.12, 0, 0]}>
                  <boxGeometry args={[0.06, 0.06, 0.02]} />
                  <meshStandardMaterial color="#fa5252" roughness={0.5} />
                </mesh>
              </group>
            )}

            {/* Ears (Pointy, rabbit, or horns) */}
            <group ref={earsGroupRef}>
              {isElectricMouse ? (
                <>
                  <mesh position={[-0.14, 0.22, 0]} rotation={[0, 0, 0.25]} castShadow>
                    <coneGeometry args={[0.05, 0.24, 4]} />
                    <meshStandardMaterial color={primaryColor} roughness={0.7} />
                  </mesh>
                  <mesh position={[0.14, 0.22, 0]} rotation={[0, 0, -0.25]} castShadow>
                    <coneGeometry args={[0.05, 0.24, 4]} />
                    <meshStandardMaterial color={primaryColor} roughness={0.7} />
                  </mesh>
                </>
              ) : isStarterBulb ? (
                <>
                  <mesh position={[-0.1, 0.18, 0]} castShadow>
                    <boxGeometry args={[0.08, 0.12, 0.08]} />
                    <meshStandardMaterial color={primaryColor} />
                  </mesh>
                  <mesh position={[0.1, 0.18, 0]} castShadow>
                    <boxGeometry args={[0.08, 0.12, 0.08]} />
                    <meshStandardMaterial color={primaryColor} />
                  </mesh>
                </>
              ) : null}
            </group>
          </group>
        )}

        {/* Back attachments category */}
        {isStarterBulb && (
          <group position={[0, 0.22, -0.1]}>
            {/* Seed pouch or budding flower */}
            <mesh castShadow>
              <sphereGeometry args={[0.22, 8, 8]} />
              <meshStandardMaterial color={secondaryColor} roughness={0.6} />
            </mesh>
            <mesh position={[0, 0.1, 0]} rotation={[0.2, 0.4, 0.1]} castShadow>
              <coneGeometry args={[0.15, 0.3, 4]} />
              <meshStandardMaterial color="#2f9e44" />
            </mesh>
          </group>
        )}

        {isStarterShell && (
          <group position={[0, 0, -0.16]}>
            {/* Turtle Shell Pack */}
            <mesh castShadow>
              <boxGeometry args={[0.34, 0.3, 0.16]} />
              <meshStandardMaterial color="#862e9c" roughness={0.4} /> {/* Brown shell */}
            </mesh>
            {/* Blastoise Cannons */}
            {normName === 'BLASTOISE' && (
              <group position={[0, 0.15, 0]}>
                <mesh position={[-0.18, 0.15, 0.1]} rotation={[0.4, 0, 0]} castShadow>
                  <cylinderGeometry args={[0.05, 0.05, 0.28, 6]} />
                  <meshStandardMaterial color="#adb5bd" metalness={0.6} />
                </mesh>
                <mesh position={[0.18, 0.15, 0.1]} rotation={[0.4, 0, 0]} castShadow>
                  <cylinderGeometry args={[0.05, 0.05, 0.28, 6]} />
                  <meshStandardMaterial color="#adb5bd" metalness={0.6} />
                </mesh>
              </group>
            )}
          </group>
        )}

        {/* Tails Attachment category */}
        {(isStarterFlame || isElectricMouse) && (
          <group ref={tailRef} position={[0, -0.06, -0.22]}>
            {isStarterFlame ? (
              <>
                <mesh rotation={[-0.5, 0, 0]} castShadow>
                  <cylinderGeometry args={[0.03, 0.05, 0.35, 6]} />
                  <meshStandardMaterial color={primaryColor} />
                </mesh>
                {/* Lit Tail Fire box */}
                <mesh position={[0, 0.2, -0.1]} castShadow>
                  <boxGeometry args={[0.14, 0.14, 0.14]} />
                  <meshStandardMaterial color="#fd7e14" emissive="#ff922b" emissiveIntensity={2.0} />
                </mesh>
              </>
            ) : isElectricMouse ? (
              <mesh rotation={[0.4, 0, 0.8]} castShadow>
                {/* Lightning zig-zag tail representation */}
                <boxGeometry args={[0.06, 0.45, 0.08]} />
                <meshStandardMaterial color="#fcc419" roughness={0.4} />
              </mesh>
            ) : null}
          </group>
        )}

        {/* Wings Flapping block */}
        {(isBird || normName === 'CHARIZARD' || normName === 'BUTTERFREE') && (
          <group position={[0, 0.12, -0.1]}>
            <group ref={leftWingRef} position={[-0.2, 0, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.48, 0.22, 0.04]} />
                <meshStandardMaterial color={secondaryColor} roughness={0.6} />
              </mesh>
            </group>
            <group ref={rightWingRef} position={[0.2, 0, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.48, 0.22, 0.04]} />
                <meshStandardMaterial color={secondaryColor} roughness={0.6} />
              </mesh>
            </group>
          </group>
        )}

        {/* Leg and movement components */}
        {!isSerpent && !isRoundBall && (
          <>
            <group ref={leftLegRef} position={[-0.14, -0.28, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.12, 0.18, 0.12]} />
                <meshStandardMaterial color={primaryColor} roughness={0.8} />
              </mesh>
            </group>
            <group ref={rightLegRef} position={[0.14, -0.28, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.12, 0.18, 0.12]} />
                <meshStandardMaterial color={primaryColor} roughness={0.8} />
              </mesh>
            </group>
          </>
        )}

      </group>

      {/* Decorative Drop Shadow Circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[0.3, 16]} />
        <meshBasicMaterial color="#343a40" opacity={0.28} transparent />
      </mesh>
    </group>
  );
}
