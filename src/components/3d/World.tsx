import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh } from 'three';
import { mapGrid, MAP_HEIGHT, MAP_WIDTH, TileType } from '../../game/MapData';
import { TrainerModel } from './TrainerModel';
import { PokemonModel } from './PokemonModel';

export function World() {
  const waterGroupRef = useRef<Group>(null);
  const grassGroupRef = useRef<Group>(null);

  // Generate dynamic, randomized decorative grass tufts across grass tiles (type 0)
  const grassTufts = useMemo(() => {
    const tufts: { x: number; z: number; scaleY: number; rotationY: number }[] = [];
    for (let z = 1; z < MAP_HEIGHT - 1; z++) {
      for (let x = 1; x < MAP_WIDTH - 1; x++) {
        if (mapGrid[z][x] === TileType.GRASS) {
          // Put a couple of tufts per grass tile with slight random offsets
          const count = Math.random() > 0.65 ? 2 : 1;
          for (let k = 0; k < count; k++) {
            tufts.push({
              x: x + (Math.random() - 0.5) * 0.4,
              z: z + (Math.random() - 0.5) * 0.4,
              scaleY: 0.2 + Math.random() * 0.35,
              rotationY: Math.random() * Math.PI,
            });
          }
        }
      }
    }
    return tufts;
  }, []);

  // Filter out boundary paths and solid coordinates
  const paths = useMemo(() => {
    const arr: [number, number][] = [];
    for (let z = 0; z < MAP_HEIGHT; z++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        if (mapGrid[z][x] === TileType.PATH) arr.push([x, z]);
      }
    }
    return arr;
  }, []);

  const water = useMemo(() => {
    const arr: [number, number][] = [];
    for (let z = 0; z < MAP_HEIGHT; z++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        if (mapGrid[z][x] === TileType.WATER) arr.push([x, z]);
      }
    }
    return arr;
  }, []);

  const solids = useMemo(() => {
    const arr: [number, number][] = [];
    for (let z = 0; z < MAP_HEIGHT; z++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        if (mapGrid[z][x] === TileType.SOLID) arr.push([x, z]);
      }
    }
    return arr;
  }, []);

  // Simple frame updates: sway grass and wave water
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Wave water up and down
    if (waterGroupRef.current) {
      waterGroupRef.current.position.y = Math.sin(time * 1.5) * 0.025;
    }

    // Sway grass tufts gently in the wind
    if (grassGroupRef.current) {
      grassGroupRef.current.children.forEach((child) => {
        child.rotation.z = Math.sin(time * 2.5 + child.position.x) * 0.12;
      });
    }
  });

  return (
    <group>
      {/* Visual Sky Sphere Background color */}
      <color attach="background" args={['#a5d8ff']} />

      {/* Gentle stylized ground fog */}
      <fogExp2 attach="fog" color="#a5d8ff" density={0.015} />

      {/* Main Ground Meadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[MAP_WIDTH / 2 - 0.5, -0.05, MAP_HEIGHT / 2 - 0.5]} receiveShadow>
        <planeGeometry args={[MAP_WIDTH, MAP_HEIGHT]} />
        <meshStandardMaterial color="#5c940d" roughness={0.9} />
      </mesh>

      {/* Raised Stone paths with vintage pattern border */}
      {paths.map(([x, z], i) => (
        <group key={`path-${i}`} position={[x, 0.01, z]}>
          <mesh receiveShadow>
            <boxGeometry args={[0.96, 0.03, 0.96]} />
            <meshStandardMaterial color="#fcc419" roughness={0.8} /> {/* Bright yellow brick path */}
          </mesh>
          {/* Subtle pave lines on edges */}
          <mesh position={[0, -0.005, 0]}>
            <boxGeometry args={[1.0, 0.01, 1.0]} />
            <meshStandardMaterial color="#e67e22" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Water Body with ripple group */}
      <group ref={waterGroupRef}>
        {water.map(([x, z], i) => (
          <group key={`water-${i}`} position={[x, 0.05, z]}>
            {/* Base water tile */}
            <mesh receiveShadow>
              <boxGeometry args={[0.98, 0.08, 0.98]} />
              <meshStandardMaterial color="#1971c2" roughness={0.1} metalness={0.7} transparent opacity={0.85} />
            </mesh>
            {/* Stylized water crest */}
            <mesh position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.8, 0.8]} />
              <meshBasicMaterial color="#a5d8ff" transparent opacity={0.3} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Dynamic Swaying Grass Group */}
      <group ref={grassGroupRef}>
        {grassTufts.map((tuft, i) => (
          <group key={`tuft-${i}`} position={[tuft.x, 0, tuft.z]} rotation={[0, tuft.rotationY, 0]} scale={[1, tuft.scaleY, 1]}>
            <mesh castShadow>
              <coneGeometry args={[0.06, 0.8, 4]} />
              <meshStandardMaterial color="#37b24d" roughness={1.0} />
            </mesh>
            {/* Companion blade */}
            <mesh position={[0.08, 0, 0.04]} rotation={[0.1, 0, -0.15]} castShadow>
              <coneGeometry args={[0.04, 0.6, 4]} />
              <meshStandardMaterial color="#2f9e44" roughness={1.0} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Solid structures, stylized house modeling */}
      {solids.map(([x, z], i) => {
        // Red's (Hero's) House at grid coordinates near (2,2)
        if (x === 2 && z === 2) {
          return (
            <group key="house-hero" position={[3, 0, 3]}>
              {/* Foundation brick row */}
              <mesh position={[0, 0.1, 0]} receiveShadow>
                <boxGeometry args={[4.2, 0.2, 3.2]} />
                <meshStandardMaterial color="#495057" roughness={0.9} />
              </mesh>
              
              {/* Main Walls */}
              <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
                <boxGeometry args={[4, 2.4, 3]} />
                <meshStandardMaterial color="#f1f3f5" roughness={0.6} /> {/* High fidelity panel wall */}
              </mesh>

              {/* Red tiled Roof */}
              <mesh position={[0, 3.0, 0]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
                <coneGeometry args={[3.2, 1.6, 4]} />
                <meshStandardMaterial color="#e03131" roughness={0.6} flatShading />
              </mesh>

              {/* Wooden Front Door */}
              <mesh position={[0, 0.65, 1.51]} castShadow>
                <boxGeometry args={[0.7, 1.3, 0.08]} />
                <meshStandardMaterial color="#862e9c" roughness={0.8} /> {/* Stylish purple door */}
              </mesh>
              <mesh position={[-0.2, 0.65, 1.56]}>
                <sphereGeometry args={[0.04, 8, 8]} />
                <meshStandardMaterial color="#fcc419" />
              </mesh>

              {/* Glowing Warm Windows */}
              <group position={[-1.1, 1.2, 1.51]}>
                <mesh castShadow>
                  <boxGeometry args={[0.8, 0.8, 0.06]} />
                  <meshStandardMaterial color="#fab005" emissive="#f59f00" emissiveIntensity={0.6} />
                </mesh>
                <mesh>
                  <boxGeometry args={[0.84, 0.84, 0.02]} />
                  <meshStandardMaterial color="#1a1b1e" />
                </mesh>
              </group>
              <group position={[1.1, 1.2, 1.51]}>
                <mesh castShadow>
                  <boxGeometry args={[0.8, 0.8, 0.06]} />
                  <meshStandardMaterial color="#fab005" emissive="#f59f00" emissiveIntensity={0.6} />
                </mesh>
                <mesh>
                  <boxGeometry args={[0.84, 0.84, 0.02]} />
                  <meshStandardMaterial color="#1a1b1e" />
                </mesh>
              </group>

              {/* Chimney */}
              <mesh position={[1.2, 2.5, -0.6]} castShadow>
                <boxGeometry args={[0.45, 1.5, 0.45]} />
                <meshStandardMaterial color="#c92a2a" roughness={0.8} />
              </mesh>
            </group>
          );
        }
        // Eliminate collision tiles matching the Hero house blocks
        if (x >= 2 && x <= 4 && z >= 2 && z <= 4) return null;

        // Gary's (Rival's) House near coordinates (9,2)
        if (x === 9 && z === 2) {
          return (
            <group key="house-rival" position={[10, 0, 3]}>
              <mesh position={[0, 0.1, 0]} receiveShadow>
                <boxGeometry args={[4.2, 0.2, 3.2]} />
                <meshStandardMaterial color="#495057" roughness={0.9} />
              </mesh>
              <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
                <boxGeometry args={[4, 2.4, 3]} />
                <meshStandardMaterial color="#f1f3f5" roughness={0.7} />
              </mesh>
              <mesh position={[0, 3.0, 0]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
                <coneGeometry args={[3.2, 1.6, 4]} />
                <meshStandardMaterial color="#1a1b1e" roughness={0.5} flatShading /> {/* Modern dark slate roof */}
              </mesh>

              {/* Door */}
              <mesh position={[0, 0.65, 1.51]} castShadow>
                <boxGeometry args={[0.7, 1.3, 0.08]} />
                <meshStandardMaterial color="#3b5bdb" roughness={0.8} />
              </mesh>

              {/* Modern Grid Windows */}
              <group position={[-1.1, 1.2, 1.51]}>
                <mesh castShadow>
                  <boxGeometry args={[0.8, 0.8, 0.06]} />
                  <meshStandardMaterial color="#96f2d7" emissive="#12b886" emissiveIntensity={0.3} />
                </mesh>
                <mesh>
                  <boxGeometry args={[0.84, 0.84, 0.02]} />
                  <meshStandardMaterial color="#1a1b1e" />
                </mesh>
              </group>
              <group position={[1.1, 1.2, 1.51]}>
                <mesh castShadow>
                  <boxGeometry args={[0.8, 0.8, 0.06]} />
                  <meshStandardMaterial color="#96f2d7" emissive="#12b886" emissiveIntensity={0.3} />
                </mesh>
                <mesh>
                  <boxGeometry args={[0.84, 0.84, 0.02]} />
                  <meshStandardMaterial color="#1a1b1e" />
                </mesh>
              </group>
            </group>
          );
        }
        if (x >= 9 && x <= 11 && z >= 2 && z <= 4) return null;

        // Oak's Pokémon Research Lab near coordinates (6,8)
        if (x === 6 && z === 8) {
          return (
            <group key="lab" position={[7.5, 0, 9]}>
              {/* Solid high-tech base */}
              <mesh position={[0, 0.1, 0]} receiveShadow>
                <boxGeometry args={[6.3, 0.2, 4.3]} />
                <meshStandardMaterial color="#343a40" />
              </mesh>
              {/* Main architecture */}
              <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
                <boxGeometry args={[6, 2.6, 4]} />
                <meshStandardMaterial color="#dee2e6" roughness={0.4} />
              </mesh>
              {/* Rounded roof-top generator lab detail */}
              <mesh position={[0, 2.8, 0]} castShadow receiveShadow>
                <boxGeometry args={[5.6, 0.4, 3.6]} />
                <meshStandardMaterial color="#495057" roughness={0.5} />
              </mesh>
              {/* Small scientific dome on roof */}
              <mesh position={[-1.8, 3.2, -0.6]} castShadow>
                <sphereGeometry args={[0.55, 12, 12]} />
                <meshStandardMaterial color="#d0bfff" metalness={0.7} roughness={0.1} />
              </mesh>
              {/* Lab satellite dish */}
              <group position={[1.8, 3.2, 0.4]} rotation={[0.4, -0.5, 0]}>
                <mesh castShadow>
                  <cylinderGeometry args={[0.04, 0.04, 0.6]} />
                  <meshStandardMaterial color="#868e96" />
                </mesh>
                <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                  <cylinderGeometry args={[0.35, 0.05, 0.1, 8]} />
                  <meshStandardMaterial color="#adb5bd" roughness={0.4} />
                </mesh>
              </group>

              {/* Research Lab Large Windows */}
              <group position={[-1.8, 1.5, 2.01]}>
                <mesh castShadow>
                  <boxGeometry args={[1.1, 0.9, 0.05]} />
                  <meshStandardMaterial color="#74c0fc" emissive="#1c7ed6" emissiveIntensity={0.4} />
                </mesh>
              </group>
              <group position={[1.8, 1.5, 2.01]}>
                <mesh castShadow>
                  <boxGeometry args={[1.1, 0.9, 0.05]} />
                  <meshStandardMaterial color="#74c0fc" emissive="#1c7ed6" emissiveIntensity={0.4} />
                </mesh>
              </group>

              {/* Double sliding automatic glass doors */}
              <mesh position={[0, 0.7, 2.01]} castShadow>
                <boxGeometry args={[1.3, 1.4, 0.04]} />
                <meshStandardMaterial color="#1a1b1e" metalness={0.8} transparent opacity={0.65} />
              </mesh>
            </group>
          );
        }
        if (x >= 5 && x <= 9 && z >= 8 && z <= 10) return null;

        // Custom Town Signboard at coordinate (8,4)
        if (x === 8 && z === 4) {
          return (
            <group key="special-sign" position={[x, 0, z]}>
              {/* Dual wooden support posts */}
              <mesh position={[-0.18, 0.35, 0]} castShadow>
                <cylinderGeometry args={[0.03, 0.03, 0.7]} />
                <meshStandardMaterial color="#5c940d" roughness={0.9} />
              </mesh>
              <mesh position={[0.18, 0.35, 0]} castShadow>
                <cylinderGeometry args={[0.03, 0.03, 0.7]} />
                <meshStandardMaterial color="#5c940d" roughness={0.9} />
              </mesh>
              {/* Elegant sign faceplate */}
              <mesh position={[0, 0.75, 0]} castShadow>
                <boxGeometry args={[0.62, 0.38, 0.08]} />
                <meshStandardMaterial color="#ffd8a8" roughness={0.9} />
              </mesh>
              {/* Tiny slanted sign roof */}
              <mesh position={[0, 0.96, 0]} rotation={[0.12, 0, 0]} castShadow>
                <boxGeometry args={[0.7, 0.04, 0.14]} />
                <meshStandardMaterial color="#d9480f" roughness={0.7} />
              </mesh>
            </group>
          );
        }

        // Town Picket Fences along edge blocks (Fences look more high-fidelity than just trees everywhere)
        const isBoundaryFence = x === 0 || x === MAP_WIDTH - 1 || z === 0 || z === MAP_HEIGHT - 1;
        if (isBoundaryFence) {
          return (
            <group key={`fence-${i}`} position={[x, 0, z]}>
              {/* Base post */}
              <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.12, 0.8, 0.12]} />
                <meshStandardMaterial color="#f8f9fa" roughness={0.5} />
              </mesh>
              {/* Left rail */}
              <mesh position={[-0.25, 0.5, 0]} castShadow>
                <boxGeometry args={[0.5, 0.1, 0.05]} />
                <meshStandardMaterial color="#f8f9fa" />
              </mesh>
              <mesh position={[-0.25, 0.25, 0]} castShadow>
                <boxGeometry args={[0.5, 0.1, 0.05]} />
                <meshStandardMaterial color="#f8f9fa" />
              </mesh>
              {/* Right rail */}
              <mesh position={[0.25, 0.5, 0]} castShadow>
                <boxGeometry args={[0.5, 0.1, 0.05]} />
                <meshStandardMaterial color="#f8f9fa" />
              </mesh>
              <mesh position={[0.25, 0.25, 0]} castShadow>
                <boxGeometry args={[0.5, 0.1, 0.05]} />
                <meshStandardMaterial color="#f8f9fa" />
              </mesh>
              {/* Vertical pickets */}
              <mesh position={[-0.22, 0.4, 0.03]} castShadow>
                <boxGeometry args={[0.08, 0.76, 0.03]} />
                <meshStandardMaterial color="#f1f3f5" />
              </mesh>
              <mesh position={[0.22, 0.4, 0.03]} castShadow>
                <boxGeometry args={[0.08, 0.76, 0.03]} />
                <meshStandardMaterial color="#f1f3f5" />
              </mesh>
            </group>
          );
        }

        // Gorgeous Stacked Conical Forest Trees
        return (
          <group key={`tree-${i}`} position={[x, 0, z]}>
            {/* Trunk */}
            <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.15, 0.2, 0.8, 8]} />
              <meshStandardMaterial color="#5c3e10" roughness={0.9} />
            </mesh>

            {/* Bottom Foliage cap */}
            <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
              <coneGeometry args={[0.72, 1.0, 6]} />
              <meshStandardMaterial color="#2b8a3e" roughness={0.8} flatShading />
            </mesh>

            {/* Mid Foliage cap */}
            <mesh position={[0, 1.7, 0]} castShadow receiveShadow>
              <coneGeometry args={[0.58, 0.8, 6]} />
              <meshStandardMaterial color="#37b24d" roughness={0.8} flatShading />
            </mesh>

            {/* Top Foliage cap */}
            <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
              <coneGeometry args={[0.42, 0.6, 6]} />
              <meshStandardMaterial color="#40c057" roughness={0.8} flatShading />
            </mesh>
          </group>
        );
      })}

      {/* ======================================================== */}
      {/* 3D CHARACTERS & MASCOT POKÉMON ROAMING PALLET TOWN ARENA */}
      {/* ======================================================== */}

      {/* Professor Oak: Near entrance of research lab (7, 7) */}
      <group position={[7, 0, 7]}>
        <TrainerModel role="OAK" heading="DOWN" scale={0.9} />
      </group>

      {/* Rival Gary: Stands in front of his house (10, 5) */}
      <group position={[10, 0, 5]}>
        <TrainerModel role="RIVAL" heading="LEFT" scale={0.9} />
      </group>

      {/* Wild Pikachu Mascot: Hopping around grass (4, 6) */}
      <group position={[4, 0, 6]}>
        <PokemonModel name="Pikachu" color="#fcc419" scale={0.9} />
      </group>

      {/* Wild Bulbasaur Mascot: Shaded near lake (2, 6) */}
      <group position={[2, 0, 6]}>
        <PokemonModel name="Bulbasaur" color="#3bc9db" scale={0.95} />
      </group>

      {/* Wild Charmander Mascot: Near east trees (12, 6) */}
      <group position={[12, 0, 6]}>
        <PokemonModel name="Charmander" color="#ff922b" scale={0.9} />
      </group>

    </group>
  );
}
