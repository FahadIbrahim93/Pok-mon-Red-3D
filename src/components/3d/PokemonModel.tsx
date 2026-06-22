import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh } from 'three';

interface PokemonModelProps {
  name: string;
  color: string;
  state?: 'IDLE' | 'WALK' | 'ATTACK' | 'HIT' | 'FAINTED';
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
  const leftArmRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const leftWingRef = useRef<Group>(null);
  const rightWingRef = useRef<Group>(null);
  const earsGroupRef = useRef<Group>(null);
  const bodyRef = useRef<Mesh>(null);
  const tailRef = useRef<Group>(null);
  const flameMeshRef = useRef<Mesh>(null);
  const auraRef = useRef<Mesh>(null);

  const normName = name.toUpperCase();

  // Procedural archetype detection
  const isStarterBulb = normName.includes('BULBA') || normName.includes('IVY') || normName.includes('VENU');
  const isStarterFlame = normName.includes('CHAR');
  const isStarterShell = normName.includes('SQUIRT') || normName.includes('WAR') || normName.includes('BLAST');
  const isElectricMouse = normName.includes('PIKA') || normName.includes('RAI') || normName.includes('JOLT');
  const isBird = normName.includes('PIDG') || normName.includes('SPEAR') || normName.includes('FEAR') || normName.includes('ARTIC') || normName.includes('ZAPD') || normName.includes('MOLT') || normName.includes('AERO') || normName.includes('DODU') || normName.includes('DODRI');
  const isBug = normName.includes('CATER') || normName.includes('META') || normName.includes('BUTTER') || normName.includes('WEED') || normName.includes('KAKU') || normName.includes('BEED') || normName.includes('PARAS') || normName.includes('VENON') || normName.includes('SCYTH') || normName.includes('PINS');
  const isRoundBall = normName.includes('VOLTORB') || normName.includes('ELECTRODE') || normName.includes('JIGGLY') || normName.includes('WIGGLY') || normName.includes('KOFF') || normName.includes('WEEZ') || normName.includes('ODDISH') || normName.includes('CLEF') || normName.includes('SHELL') || normName.includes('CLOYST') || normName.includes('CHANSEY') || normName.includes('EXEGG') || normName.includes('DITTO');
  const isSerpent = normName.includes('EKAN') || normName.includes('ARBOK') || normName.includes('ONIX') || normName.includes('DRATIN') || normName.includes('DRAGONAIR') || normName.includes('GYARAD') || normName.includes('TENTA');
  // New expanded archetypes
  const isBipedalFighter = normName.includes('MACH') || normName.includes('MANKEY') || normName.includes('PRIME') || normName.includes('HITMON') || normName.includes('KANGA') || normName.includes('CUBON') || normName.includes('MAROW');
  const isFoxCat = normName.includes('VULPIX') || normName.includes('NINE') || normName.includes('MEOWTH') || normName.includes('PERSI') || normName.includes('EEVEE') || normName.includes('VAPOR') || normName.includes('FLARE') || normName.includes('GROW') || normName.includes('ARCA') || normName.includes('PONYTA') || normName.includes('RAPID');
  const isPsychicHumanoid = normName.includes('ABRA') || normName.includes('KADAB') || normName.includes('ALAKA') || normName.includes('DROWZ') || normName.includes('HYPNO') || normName.includes('MR MIME') || normName.includes('JYNX') || normName.includes('MEW') || normName.includes('MEWT');
  const isGhostly = normName.includes('GASTLY') || normName.includes('HAUNT') || normName.includes('GENG');
  const isCrab = normName.includes('KRAB') || normName.includes('KING');
  const isRockGolem = normName.includes('GEOD') || normName.includes('GRAVEL') || normName.includes('GOLEM');

  // Expanded type-specific secondary colors
  const primaryColor = color || '#ced4da';
  const secondaryColor = isStarterBulb ? '#f783ac' : isStarterFlame ? '#fab005' : isStarterShell ? '#e8590c' : isElectricMouse ? '#ff922b' : isPsychicHumanoid ? '#cc5de8' : isGhostly ? '#845ef7' : isBipedalFighter ? '#e03131' : isFoxCat ? '#f59f00' : isRockGolem ? '#6c757d' : '#868e96';

  // Determine body shape parameters
  const bodyWidth = isBipedalFighter ? 0.52 : isFoxCat ? 0.48 : isCrab ? 0.54 : 0.42;
  const bodyHeight = isBipedalFighter ? 0.48 : isFoxCat ? 0.32 : isCrab ? 0.28 : 0.38;
  const bodyDepth = isBipedalFighter ? 0.32 : isFoxCat ? 0.42 : isCrab ? 0.36 : 0.46;

  useFrame((stateObj) => {
    if (!groupRef.current) return;
    const time = stateObj.clock.getElapsedTime();

    // Idle Hover or breathing animation
    if (state === 'IDLE') {
      const hoverAmp = isBird ? 0.08 : isGhostly ? 0.06 : 0.02;
      const hoverFreq = isBird ? 4.5 : isGhostly ? 3.0 : 2.0;
      groupRef.current.position.y = Math.sin(time * hoverFreq) * hoverAmp;
      if (bodyRef.current) {
        const breathScale = 1.0 + Math.sin(time * 2.5) * 0.015;
        bodyRef.current.scale.set(breathScale, breathScale, breathScale);
      }
    } else if (state === 'WALK') {
      const hopFreq = isBipedalFighter ? 9 : 11;
      const hopAmp = isBipedalFighter ? 0.06 : 0.09;
      groupRef.current.position.y = Math.abs(Math.sin(time * hopFreq)) * hopAmp;
    }

    // Wing Flap animation
    if (leftWingRef.current && rightWingRef.current) {
      const flapSpeed = state === 'WALK' ? 16 : (isBird ? 12 : 6);
      const flapAngle = Math.sin(time * flapSpeed) * (state === 'WALK' ? 0.45 : 0.35) + 0.1;
      leftWingRef.current.rotation.z = -flapAngle;
      rightWingRef.current.rotation.z = flapAngle;
    }

    // Legs cycle
    if (leftLegRef.current && rightLegRef.current) {
      if (state === 'WALK') {
        const legSpeed = isBipedalFighter ? 10 : 12;
        leftLegRef.current.rotation.x = Math.sin(time * legSpeed) * 0.35;
        rightLegRef.current.rotation.x = -Math.sin(time * legSpeed) * 0.35;
      } else {
        leftLegRef.current.rotation.x = 0;
        rightLegRef.current.rotation.x = 0;
      }
    }

    // Arm swing during walk for bipedal fighters
    if (leftArmRef.current && rightArmRef.current) {
      if (state === 'WALK') {
        const armSpeed = 10;
        leftArmRef.current.rotation.x = -Math.sin(time * armSpeed) * 0.25;
        rightArmRef.current.rotation.x = Math.sin(time * armSpeed) * 0.25;
      } else if (state === 'ATTACK') {
        leftArmRef.current.rotation.x = -1.2;
        rightArmRef.current.rotation.x = -1.2;
      } else {
        leftArmRef.current.rotation.x = 0;
        rightArmRef.current.rotation.x = 0;
      }
    }

    // Tail sway
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(time * 3) * 0.15;
    }

    // Ear twitch
    if (earsGroupRef.current) {
      earsGroupRef.current.rotation.z = Math.sin(time * 4) * 0.04;
    }

    // Ghostly aura pulse
    if (auraRef.current) {
      const pulse = 0.5 + Math.abs(Math.sin(time * 2)) * 0.5;
      (auraRef.current.material as any).opacity = pulse * 0.3;
      auraRef.current.scale.setScalar(1 + Math.sin(time * 3) * 0.05);
    }

    // State transitions
    if (state === 'HIT') {
      groupRef.current.position.x = Math.sin(time * 28) * 0.09;
      groupRef.current.position.z = Math.cos(time * 28) * 0.04;
    } else if (state === 'ATTACK') {
      groupRef.current.position.z = isBackView ? 0.35 : -0.35;
      groupRef.current.position.y = Math.sin(time * 20) * 0.15;
    } else if (state === 'FAINTED') {
      groupRef.current.rotation.z = Math.min(Math.PI / 2, groupRef.current.rotation.z + 0.18);
      groupRef.current.position.y = -0.3;
    } else {
      groupRef.current.position.x = 0;
    }

    // Tail flame for fire starters
    if (flameMeshRef.current) {
      flameMeshRef.current.scale.set(
        1.0 + Math.sin(time * 19.0) * 0.16,
        1.0 + Math.cos(time * 23.0) * 0.16,
        1.0 + Math.sin(time * 17.0) * 0.16
      );
      const mat = flameMeshRef.current.material as any;
      if (mat) {
        mat.emissiveIntensity = 1.35 + Math.sin(time * 26.0) * 0.45;
      }
    }
  });

  return (
    <group ref={groupRef} scale={[scale, scale, scale]} rotation={[0, isBackView ? 0 : Math.PI, 0]}>
      {/* Ghostly aura ring */}
      {isGhostly && (
        <mesh ref={auraRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.15, 0]}>
          <ringGeometry args={[0.3, 0.5, 16]} />
          <meshBasicMaterial color="#845ef7" transparent opacity={0.2} side={2} />
        </mesh>
      )}

      {/* 3D Base Pokemon Group */}
      <group position={[0, 0.4, 0]}>
        {/* Core Body mesh with archetype-specific geometry */}
        <mesh ref={bodyRef} castShadow receiveShadow>
          {isRoundBall ? (
            <sphereGeometry args={[0.36, 12, 12]} />
          ) : isSerpent ? (
            <cylinderGeometry args={[0.1, 0.14, 0.9, 8]} />
          ) : isFoxCat ? (
            // Fox/cat: elongated horizontal body
            <boxGeometry args={[bodyWidth * 0.8, bodyHeight, bodyDepth * 1.2]} />
          ) : isBipedalFighter ? (
            // Fighter: upright, wider shoulders
            <boxGeometry args={[bodyWidth, bodyHeight * 1.2, bodyDepth]} />
          ) : isCrab ? (
            // Crab: flat, wide
            <boxGeometry args={[bodyWidth * 1.3, bodyHeight * 0.7, bodyDepth]} />
          ) : isRockGolem ? (
            // Rock golem: rounder body
            <sphereGeometry args={[0.32, 8, 8]} />
          ) : (
            <boxGeometry args={[bodyWidth, bodyHeight, bodyDepth]} />
          )}
          <meshStandardMaterial
            color={primaryColor}
            roughness={isRockGolem ? 0.9 : 0.7}
            metalness={isGhostly ? 0.3 : 0}
            transparent={isGhostly}
            opacity={isGhostly ? 0.8 : 1}
          />
        </mesh>

        {/* Ghostly inner glow */}
        {isGhostly && (
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.28, 8, 8]} />
            <meshStandardMaterial color="#b388ff" emissive="#b388ff" emissiveIntensity={0.8} transparent opacity={0.4} />
          </mesh>
        )}

        {/* Head rendering */}
        {!isRoundBall && !isSerpent && (
          <group position={[0, isFoxCat ? 0.18 : isCrab ? 0.15 : 0.25, isBackView ? -0.1 : 0.16]}>
            <mesh castShadow>
              {isFoxCat ? (
                <boxGeometry args={[0.26, 0.24, 0.26]} />
              ) : isBipedalFighter ? (
                <boxGeometry args={[0.28, 0.32, 0.28]} />
              ) : isCrab ? (
                <boxGeometry args={[0.16, 0.12, 0.16]} />
              ) : (
                <boxGeometry args={[0.3, 0.28, 0.3]} />
              )}
              <meshStandardMaterial color={primaryColor} roughness={0.7} />
            </mesh>

            {/* Eyes */}
            <group position={[0, 0.04, isBackView ? -0.16 : 0.16]}>
              <mesh position={[-0.09, 0, 0]}>
                <boxGeometry args={[0.04, 0.08, 0.02]} />
                <meshStandardMaterial color={isGhostly ? '#e0e0ff' : '#212529'} roughness={0.9} />
              </mesh>
              <mesh position={[0.09, 0, 0]}>
                <boxGeometry args={[0.04, 0.08, 0.02]} />
                <meshStandardMaterial color={isGhostly ? '#e0e0ff' : '#212529'} roughness={0.9} />
              </mesh>
            </group>

            {/* Red cheeks for electric mouse */}
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

            {/* Ears */}
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
              ) : isFoxCat ? (
                <>
                  <mesh position={[-0.12, 0.2, 0]} rotation={[0, 0, 0.15]} castShadow>
                    <coneGeometry args={[0.04, 0.18, 4]} />
                    <meshStandardMaterial color={primaryColor} />
                  </mesh>
                  <mesh position={[0.12, 0.2, 0]} rotation={[0, 0, -0.15]} castShadow>
                    <coneGeometry args={[0.04, 0.18, 4]} />
                    <meshStandardMaterial color={primaryColor} />
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

        {/* Back attachments */}
        {isStarterBulb && (
          <group position={[0, 0.22, -0.1]}>
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
            <mesh castShadow>
              <boxGeometry args={[0.34, 0.3, 0.16]} />
              <meshStandardMaterial color="#862e9c" roughness={0.4} />
            </mesh>
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

        {/* Crab claws */}
        {isCrab && (
          <group position={[0, 0.05, 0]}>
            <mesh position={[-0.28, 0.1, 0.15]} rotation={[0.3, 0, 0.5]} castShadow>
              <boxGeometry args={[0.12, 0.08, 0.18]} />
              <meshStandardMaterial color={primaryColor} roughness={0.6} />
            </mesh>
            <mesh position={[0.28, 0.1, 0.15]} rotation={[0.3, 0, -0.5]} castShadow>
              <boxGeometry args={[0.12, 0.08, 0.18]} />
              <meshStandardMaterial color={primaryColor} roughness={0.6} />
            </mesh>
          </group>
        )}

        {/* Arms for bipedal fighters */}
        {isBipedalFighter && (
          <>
            <group ref={leftArmRef} position={[-0.26, 0.14, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.1, 0.28, 0.1]} />
                <meshStandardMaterial color={primaryColor} roughness={0.7} />
              </mesh>
            </group>
            <group ref={rightArmRef} position={[0.26, 0.14, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.1, 0.28, 0.1]} />
                <meshStandardMaterial color={primaryColor} roughness={0.7} />
              </mesh>
            </group>
          </>
        )}

        {/* Tails */}
        {(isStarterFlame || isElectricMouse || isFoxCat) && (
          <group ref={tailRef} position={[0, -0.06, -0.22]}>
            {isStarterFlame ? (
              <>
                <mesh rotation={[-0.5, 0, 0]} castShadow>
                  <cylinderGeometry args={[0.03, 0.05, 0.35, 6]} />
                  <meshStandardMaterial color={primaryColor} />
                </mesh>
                <mesh ref={flameMeshRef} position={[0, 0.2, -0.1]} castShadow>
                  <boxGeometry args={[0.14, 0.14, 0.14]} />
                  <meshStandardMaterial color="#fd7e14" emissive="#ff922b" emissiveIntensity={2.0} />
                </mesh>
              </>
            ) : isElectricMouse ? (
              <mesh rotation={[0.4, 0, 0.8]} castShadow>
                <boxGeometry args={[0.06, 0.45, 0.08]} />
                <meshStandardMaterial color="#fcc419" roughness={0.4} />
              </mesh>
            ) : isFoxCat ? (
              <mesh rotation={[0.2, 0, 0.1]} castShadow>
                <cylinderGeometry args={[0.02, 0.06, 0.3, 6]} />
                <meshStandardMaterial color={secondaryColor} roughness={0.6} />
              </mesh>
            ) : null}
          </group>
        )}

        {/* Wings */}
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

        {/* Legs */}
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

      {/* Shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[0.3, 16]} />
        <meshBasicMaterial color="#343a40" opacity={0.28} transparent />
      </mesh>
    </group>
  );
}
