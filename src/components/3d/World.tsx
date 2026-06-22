import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh } from 'three';
import * as THREE from 'three';
import { mapGrid, MAP_HEIGHT, MAP_WIDTH, TileType } from '../../game/MapData';
import { TrainerModel } from './TrainerModel';
import { PokemonModel } from './PokemonModel';

interface ClimateState {
  skyColor: string;
  fogColor: string;
  fogDensity: number;
  ambientColor: string;
  ambientIntensity: number;
  sunColor: string;
  sunIntensity: number;
  sunPosition: [number, number, number];
  nightFactor: number; // 0 for high day, 1 for deep night
}

// Pieces for dynamic interpolation across game hours (0h to 24h)
function getClimate(hour: number): ClimateState {
  const keys = [
    { hour: 0, sky: '#02030b', fog: '#02030b', density: 0.018, amb: '#070914', ambInt: 0.18, sun: '#a5d8ff', sunInt: 0.28, pos: [-10, 14, -6], night: 1.0 },
    { hour: 4.8, sky: '#180e2b', fog: '#180e2b', density: 0.02, amb: '#120b22', ambInt: 0.22, sun: '#ff5533', sunInt: 0.45, pos: [-15, 1.2, 2], night: 0.8 },
    { hour: 6.5, sky: '#ffd3b6', fog: '#ffd3b6', density: 0.015, amb: '#ffd3b6', ambInt: 0.55, sun: '#fab005', sunInt: 0.95, pos: [-12, 7, 5], night: 0.25 },
    { hour: 12, sky: '#a5d8ff', fog: '#a5d8ff', density: 0.01, amb: '#ffffff', ambInt: 0.75, sun: '#ffffff', sunInt: 1.35, pos: [0, 22, 6], night: 0.0 },
    { hour: 16.5, sky: '#c1ebff', fog: '#c1ebff', density: 0.01, amb: '#e3fafc', ambInt: 0.7, sun: '#fff3bf', sunInt: 1.25, pos: [11, 13, 5], night: 0.0 },
    { hour: 18.2, sky: '#e8590c', fog: '#e8590c', density: 0.016, amb: '#e8590c', ambInt: 0.5, sun: '#fa5252', sunInt: 1.05, pos: [15, 2.5, 4], night: 0.35 },
    { hour: 20, sky: '#121021', fog: '#121021', density: 0.018, amb: '#090812', ambInt: 0.25, sun: '#be4bdb', sunInt: 0.35, pos: [14, -2, -6], night: 0.9 },
    { hour: 24, sky: '#02030b', fog: '#02030b', density: 0.018, amb: '#070914', ambInt: 0.18, sun: '#a5d8ff', sunInt: 0.28, pos: [-10, 14, -6], night: 1.0 },
  ];

  let lower = keys[0];
  let upper = keys[keys.length - 1];
  for (let i = 0; i < keys.length - 1; i++) {
    if (hour >= keys[i].hour && hour <= keys[i+1].hour) {
      lower = keys[i];
      upper = keys[i+1];
      break;
    }
  }

  const range = upper.hour - lower.hour;
  const t = range === 0 ? 0 : (hour - lower.hour) / range;

  const lerpNum = (a: number, b: number, factor: number) => a + (b - a) * factor;
  
  const cSky = new THREE.Color(lower.sky).lerp(new THREE.Color(upper.sky), t).getHexString();
  const cFog = new THREE.Color(lower.fog).lerp(new THREE.Color(upper.fog), t).getHexString();
  const cAmb = new THREE.Color(lower.amb).lerp(new THREE.Color(upper.amb), t).getHexString();
  const cSun = new THREE.Color(lower.sun).lerp(new THREE.Color(upper.sun), t).getHexString();
  
  const density = lerpNum(lower.density, upper.density, t);
  const ambInt = lerpNum(lower.ambInt, upper.ambInt, t);
  const sunInt = lerpNum(lower.sunInt, upper.sunInt, t);
  const nightFactor = lerpNum(lower.night, upper.night, t);

  const pos: [number, number, number] = [
    lerpNum(lower.pos[0], upper.pos[0], t),
    lerpNum(lower.pos[1], upper.pos[1], t),
    lerpNum(lower.pos[2], upper.pos[2], t),
  ];

  return {
    skyColor: '#' + cSky,
    fogColor: '#' + cFog,
    fogDensity: density,
    ambientColor: '#' + cAmb,
    ambientIntensity: ambInt,
    sunColor: '#' + cSun,
    sunIntensity: sunInt,
    sunPosition: pos,
    nightFactor
  };
}

export function World() {
  const waterGroupRef = useRef<Group>(null);
  const grassGroupRef = useRef<Group>(null);
  
  // Day/Night atmosphere references
  const dirLightRef = useRef<THREE.DirectionalLight>(null);
  const ambientLightRef = useRef<THREE.AmbientLight>(null);
  const starsGroupRef = useRef<Group>(null);
  const petalsGroupRef = useRef<Group>(null);
  const firefliesGroupRef = useRef<Group>(null);

  // Generate dynamic, randomized decorative grass tufts across grass tiles (type 0)
  const grassTufts = useMemo(() => {
    const tufts: { x: number; z: number; scaleY: number; rotationY: number }[] = [];
    for (let z = 1; z < MAP_HEIGHT - 1; z++) {
      for (let x = 1; x < MAP_WIDTH - 1; x++) {
        if (mapGrid[z][x] === TileType.GRASS) {
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

  // Shared emissive window materials for dynamic Day-Night glow synchronization (via useMemo to prevent ref overriding)
  const windowHeroMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#fab005'),
      emissive: new THREE.Color('#f59f00'),
      emissiveIntensity: 0.6,
      roughness: 0.2,
    });
  }, []);

  const windowRivalMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#96f2d7'),
      emissive: new THREE.Color('#12b886'),
      emissiveIntensity: 0.3,
      roughness: 0.2,
    });
  }, []);

  const windowLabMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#74c0fc'),
      emissive: new THREE.Color('#1c7ed6'),
      emissiveIntensity: 0.4,
      roughness: 0.2,
    });
  }, []);

  // Stars positioning high up in night sky
  const stars = useMemo(() => {
    const list: { x: number; y: number; z: number; scale: number; phase: number }[] = [];
    for (let i = 0; i < 75; i++) {
      list.push({
        x: (Math.random() - 0.5) * 55 + MAP_WIDTH / 2,
        y: 11 + Math.random() * 5,
        z: (Math.random() - 0.5) * 55 + MAP_HEIGHT / 2,
        scale: 0.04 + Math.random() * 0.05,
        phase: Math.random() * Math.PI * 2,
      });
    }
    return list;
  }, []);

  // Soft pink sakura cherry blossoms drifting downward in daylight
  const petals = useMemo(() => {
    const list: { x: number; y: number; z: number; speedY: number; speedX: number; phase: number; scale: number }[] = [];
    for (let i = 0; i < 35; i++) {
      list.push({
        x: Math.random() * MAP_WIDTH,
        y: 3 + Math.random() * 7,
        z: Math.random() * MAP_HEIGHT,
        speedY: 0.35 + Math.random() * 0.4,
        speedX: 0.12 + Math.random() * 0.22,
        phase: Math.random() * Math.PI * 2,
        scale: 0.035 + Math.random() * 0.045,
      });
    }
    return list;
  }, []);

  // Tiny glowing green neon fireflies around grass fields/ponds at night
  const fireflies = useMemo(() => {
    const list: { x: number; y: number; z: number; phase: number; speed: number }[] = [];
    for (let i = 0; i < 22; i++) {
      list.push({
        x: 1 + Math.random() * (MAP_WIDTH - 2),
        y: 0.22 + Math.random() * 1.5,
        z: 1 + Math.random() * (MAP_HEIGHT - 2),
        phase: Math.random() * Math.PI * 2,
        speed: 0.65 + Math.random() * 1.05,
      });
    }
    return list;
  }, []);

  // Atmosphere and updates loop
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const dt = Math.min(delta, 0.1);

    // Dynamic 24h cycle: 1 full cycle takes 90 seconds
    const cycleDuration = 90;
    const progress = (time % cycleDuration) / cycleDuration;
    const hour = progress * 24;
    const climate = getClimate(hour);

    // 1. Interpolate Sky and Fog Background
    const scene = state.scene;
    if (!scene.background) {
      scene.background = new THREE.Color();
    }
    (scene.background as THREE.Color).set(climate.skyColor);

    if (scene.fog) {
      (scene.fog as THREE.FogExp2).color.set(climate.fogColor);
      (scene.fog as THREE.FogExp2).density = climate.fogDensity;
    }

    // 2. Adjust live lights intensity, color, and location
    if (ambientLightRef.current) {
      ambientLightRef.current.color.set(climate.ambientColor);
      ambientLightRef.current.intensity = climate.ambientIntensity;
    }
    if (dirLightRef.current) {
      dirLightRef.current.color.set(climate.sunColor);
      dirLightRef.current.intensity = climate.sunIntensity;
      dirLightRef.current.position.set(climate.sunPosition[0], climate.sunPosition[1], climate.sunPosition[2]);
    }

    // 3. Update emissive window flows
    if (windowHeroMaterial && windowRivalMaterial && windowLabMaterial) {
      windowHeroMaterial.emissiveIntensity = 0.05 + climate.nightFactor * 2.1;
      windowRivalMaterial.emissiveIntensity = 0.02 + climate.nightFactor * 1.85;
      windowLabMaterial.emissiveIntensity = 0.03 + climate.nightFactor * 1.95;
    }

    // 4. Wave water up and down
    if (waterGroupRef.current) {
      waterGroupRef.current.position.y = Math.sin(time * 1.5) * 0.025;
    }

    // 5. Sway grass tufts gently in the wind
    if (grassGroupRef.current) {
      grassGroupRef.current.children.forEach((child) => {
        child.rotation.z = Math.sin(time * 2.5 + child.position.x) * 0.12;
      });
    }

    // 6. Twinkle Starfield in night sky
    if (starsGroupRef.current) {
      const starChildren = starsGroupRef.current.children;
      stars.forEach((star, idx) => {
        const child = starChildren[idx];
        if (child) {
          const twinkle = 0.45 + Math.abs(Math.sin(time * 1.8 + star.phase)) * 0.55;
          const currentScale = star.scale * climate.nightFactor * twinkle;
          child.scale.set(currentScale, currentScale, currentScale);
        }
      });
    }

    // 7. Fall Sakura Blossom petals (daylight drift, fade out on night)
    if (petalsGroupRef.current) {
      const petalChildren = petalsGroupRef.current.children;
      petals.forEach((petal, idx) => {
        const child = petalChildren[idx];
        if (child) {
          child.position.y -= petal.speedY * dt;
          child.position.x += Math.sin(time * 1.5 + petal.phase) * 0.012;
          child.rotation.x += 0.01;
          child.rotation.y += 0.02;

          if (child.position.y < 0.05) {
            child.position.y = 8 + Math.random() * 4;
            child.position.x = Math.random() * MAP_WIDTH;
            child.position.z = Math.random() * MAP_HEIGHT;
          }

          const currentScale = petal.scale * (1.0 - climate.nightFactor * 0.85);
          child.scale.set(currentScale, currentScale, currentScale);
        }
      });
    }

    // 8. Glow dancing forest fireflies at night time
    if (firefliesGroupRef.current) {
      const ffChildren = firefliesGroupRef.current.children;
      fireflies.forEach((ff, idx) => {
        const child = ffChildren[idx];
        if (child) {
          child.position.y = ff.y + Math.sin(time * ff.speed + ff.phase) * 0.18;
          child.position.x += Math.sin(time * 0.45 + ff.phase) * 0.004;
          child.position.z += Math.cos(time * 0.45 + ff.phase) * 0.004;

          const flash = Math.abs(Math.sin(time * 2.8 + ff.phase));
          const size = 0.055 * climate.nightFactor * (0.35 + flash * 0.65);
          child.scale.set(size, size, size);
        }
      });
    }
  });

  return (
    <group>
      {/* ATMOSPHERIC CLIMATE ENVIRONMENT & LIGHT SYSTEMS */}
      <ambientLight ref={ambientLightRef} intensity={0.6} />
      <directionalLight
        ref={dirLightRef}
        position={[10, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.0005}
      />

      {/* TWINKLING NIGHT STARFIELD */}
      <group ref={starsGroupRef}>
        {stars.map((star, i) => (
          <mesh key={`star-${i}`} position={[star.x, star.y, star.z]}>
            <sphereGeometry args={[1, 4, 4]} />
            <meshBasicMaterial color="#fffbe6" toneMapped={false} />
          </mesh>
        ))}
      </group>

      {/* FALLING SAKURA BLOSSOMS */}
      <group ref={petalsGroupRef}>
        {petals.map((petal, i) => (
          <mesh key={`petal-${i}`} position={[petal.x, petal.y, petal.z]} rotation={[Math.random(), Math.random(), 0]}>
            <planeGeometry args={[0.075, 0.05]} />
            <meshStandardMaterial color="#faadb1" roughness={0.7} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>

      {/* GLOWING AMBIENT FIREFLIES */}
      <group ref={firefliesGroupRef}>
        {fireflies.map((ff, i) => (
          <mesh key={`ff-${i}`} position={[ff.x, ff.y, ff.z]}>
            <sphereGeometry args={[1, 5, 5]} />
            <meshBasicMaterial color="#ccff33" toneMapped={false} />
          </mesh>
        ))}
      </group>

      {/* Initial background attaches */}
      <color attach="background" args={['#a5d8ff']} />
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

              {/* Glowing Warm Windows (synchronized automatically) */}
              <group position={[-1.1, 1.2, 1.51]}>
                <mesh castShadow material={windowHeroMaterial}>
                  <boxGeometry args={[0.8, 0.8, 0.06]} />
                </mesh>
                <mesh>
                  <boxGeometry args={[0.84, 0.84, 0.02]} />
                  <meshStandardMaterial color="#1a1b1e" />
                </mesh>
              </group>
              <group position={[1.1, 1.2, 1.51]}>
                <mesh castShadow material={windowHeroMaterial}>
                  <boxGeometry args={[0.8, 0.8, 0.06]} />
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
                <mesh castShadow  material={windowRivalMaterial}>
                  <boxGeometry args={[0.8, 0.8, 0.06]} />
                </mesh>
                <mesh>
                  <boxGeometry args={[0.84, 0.84, 0.02]} />
                  <meshStandardMaterial color="#1a1b1e" />
                </mesh>
              </group>
              <group position={[1.1, 1.2, 1.51]}>
                <mesh castShadow  material={windowRivalMaterial}>
                  <boxGeometry args={[0.8, 0.8, 0.06]} />
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
                <mesh castShadow material={windowLabMaterial}>
                  <boxGeometry args={[1.1, 0.9, 0.05]} />
                </mesh>
              </group>
              <group position={[1.8, 1.5, 2.01]}>
                <mesh castShadow material={windowLabMaterial}>
                  <boxGeometry args={[1.1, 0.9, 0.05]} />
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

      {/* 3D CHARACTERS & MASCOT POKÉMON ROAMING PALLET TOWN ARENA */}
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

      {/* Red's Mailbox (2, 4) */}
      <group position={[2, 0, 4]}>
        <mesh position={[0, 0.35, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.7, 8]} />
          <meshStandardMaterial color="#8c5a3c" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.75, 0]} castShadow>
          <boxGeometry args={[0.22, 0.24, 0.35]} />
          <meshStandardMaterial color="#e03131" roughness={0.5} />
        </mesh>
        <mesh position={[0.12, 0.8, -0.05]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.02, 0.16, 0.04]} />
          <meshStandardMaterial color="#ffd43b" />
        </mesh>
      </group>

      {/* Gary's Mailbox (9, 4) */}
      <group position={[9, 0, 4]}>
        <mesh position={[0, 0.35, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.7, 8]} />
          <meshStandardMaterial color="#8c5a3c" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.75, 0]} castShadow>
          <boxGeometry args={[0.22, 0.24, 0.35]} />
          <meshStandardMaterial color="#1c7ed6" roughness={0.5} />
        </mesh>
        <mesh position={[0.12, 0.8, -0.05]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.02, 0.16, 0.04]} />
          <meshStandardMaterial color="#ffd43b" />
        </mesh>
      </group>

      {/* Red's Flowerbed (4, 4) */}
      <group position={[4, 0, 4]}>
        <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.76, 0.1, 0.76]} />
          <meshStandardMaterial color="#5c3e10" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.065, 0]}>
          <boxGeometry args={[0.7, 0.08, 0.7]} />
          <meshStandardMaterial color="#342210" roughness={1.0} />
        </mesh>
        <mesh position={[-0.18, 0.16, -0.15]} castShadow>
          <sphereGeometry args={[0.08, 6, 6]} />
          <meshStandardMaterial color="#ff6b6b" roughness={0.4} />
        </mesh>
        <mesh position={[0.18, 0.18, 0.15]} castShadow>
          <sphereGeometry args={[0.07, 6, 6]} />
          <meshStandardMaterial color="#fcc419" roughness={0.4} />
        </mesh>
        <mesh position={[-0.1, 0.14, 0.18]} castShadow>
          <sphereGeometry args={[0.06, 6, 6]} />
          <meshStandardMaterial color="#ff922b" roughness={0.4} />
        </mesh>
      </group>

      {/* Gary's Flowerbed (11, 4) */}
      <group position={[11, 0, 4]}>
        <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.76, 0.1, 0.76]} />
          <meshStandardMaterial color="#5c3e10" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.065, 0]}>
          <boxGeometry args={[0.7, 0.08, 0.7]} />
          <meshStandardMaterial color="#342210" roughness={1.0} />
        </mesh>
        <mesh position={[-0.18, 0.16, -0.15]} castShadow>
          <sphereGeometry args={[0.08, 6, 6]} />
          <meshStandardMaterial color="#3bc9db" roughness={0.4} />
        </mesh>
        <mesh position={[0.18, 0.18, 0.15]} castShadow>
          <sphereGeometry args={[0.07, 6, 6]} />
          <meshStandardMaterial color="#e599f7" roughness={0.4} />
        </mesh>
        <mesh position={[0.12, 0.14, -0.18]} castShadow>
          <sphereGeometry args={[0.06, 6, 6]} />
          <meshStandardMaterial color="#228be6" roughness={0.4} />
        </mesh>
      </group>

      {/* Secret Wooden Chest (1, 1) */}
      <group position={[1, 0, 1]}>
        <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.62, 0.3, 0.42]} />
          <meshStandardMaterial color="#5c3e21" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.155, 0]}>
          <boxGeometry args={[0.64, 0.31, 0.06]} />
          <meshStandardMaterial color="#fab005" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.13, 0.215]}>
          <boxGeometry args={[0.1, 0.1, 0.01]} />
          <meshStandardMaterial color="#ffd43b" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.1, 0.222]}>
          <sphereGeometry args={[0.024, 8, 8]} />
          <meshStandardMaterial color="#1a1b1e" />
        </mesh>
      </group>

      {/* Fishing Pier dock */}
      <group position={[5, 0.02, 12.2]}>
        <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.92, 0.04, 0.82]} />
          <meshStandardMaterial color="#8c5a3c" roughness={0.9} />
        </mesh>
        <mesh position={[-0.4, -0.15, 0.3]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
          <meshStandardMaterial color="#5c3e10" />
        </mesh>
        <mesh position={[0.4, -0.15, 0.3]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
          <meshStandardMaterial color="#5c3e10" />
        </mesh>
      </group>

    </group>
  );
}
