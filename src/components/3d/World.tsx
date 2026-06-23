import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh } from 'three';
import * as THREE from 'three';
import { mapGrid, MAP_HEIGHT, MAP_WIDTH, TileType } from '../../game/MapData';
import { TrainerModel } from './TrainerModel';
import { PokemonModel } from './PokemonModel';
import { useGameStore } from '../../store/gameStore';

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
  
  // Game state subscriptions for dynamic Kanto interactions
  const position = useGameStore((state) => state.position);
  const targetPosition = useGameStore((state) => state.targetPosition);
  const isMoving = useGameStore((state) => state.isMoving);
  const bicycleActive = useGameStore((state) => state.bicycleActive);

  // Local state desynchronization for NPC overworld pacing pathways
  const [oakHeading, setOakHeading] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('DOWN');
  const [oakPacingState, setOakPacingState] = useState<'IDLE' | 'WALK'>('IDLE');
  const [rivalHeading, setRivalHeading] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('LEFT');
  const [rivalPacingState, setRivalPacingState] = useState<'IDLE' | 'WALK'>('IDLE');
  // Route 1 wandering trainer NPCs
  const [bcHeading, setBcHeading] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT');
  const [bcPacingState, setBcPacingState] = useState<'IDLE' | 'WALK'>('IDLE');
  const [ysHeading, setYsHeading] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('DOWN');
  const [ysPacingState, setYsPacingState] = useState<'IDLE' | 'WALK'>('IDLE');

  // Multi-tier 3D particle registers to simulate high-fidelity rustling in grass patches
  const playerPosLocal = useRef<THREE.Vector3>(new THREE.Vector3(5, 0, 4));
  const particlesRef = useRef<{
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    age: number;
    maxAge: number;
    color: string;
    scale: number;
    rotation: number;
    rotSpeed: number;
  }[]>([]);
  const leafParticlesGroupRef = useRef<Group>(null);
  const particlePoolSize = 24;

  // Day/Night atmosphere references
  const dirLightRef = useRef<THREE.DirectionalLight>(null);
  const ambientLightRef = useRef<THREE.AmbientLight>(null);
  const starsGroupRef = useRef<Group>(null);
  const petalsGroupRef = useRef<Group>(null);
  const firefliesGroupRef = useRef<Group>(null);

  // Mascot dynamic references
  const pikachuGroupRef = useRef<Group>(null);
  const bulbasaurGroupRef = useRef<Group>(null);
  const charmanderGroupRef = useRef<Group>(null);
  const oakGroupRef = useRef<Group>(null);
  const rivalGroupRef = useRef<Group>(null);
  // Route 1 wandering trainer NPC refs
  const bugCatcherGroupRef = useRef<Group>(null);
  const youngsterGroupRef = useRef<Group>(null);

  // High fidelity wind / satellite / streetlight references
  const rivalTurbineRef = useRef<Group>(null);
  const labSatelliteRef = useRef<Group>(null);
  const cloudsGroupRef = useRef<Group>(null);
  const streetlampLightRefs = useRef<(THREE.PointLight | null)[]>([]);
  const streetlampMaterialRefs = useRef<(any | null)[]>([]);

  // Memoized streetlamp structural locations
  const streetlamps = useMemo(() => {
    return [
      { x: 4.8, z: 4.8 },
      { x: 9.2, z: 4.8 },
      { x: 4.8, z: 11.2 },
      { x: 9.2, z: 11.2 },
      // Viridian City streetlamps
      { x: 2.5, z: 36.8 },
      { x: 7.0, z: 36.8 },
      { x: 11.5, z: 36.8 },
      { x: 5.0, z: 43.8 },
      { x: 9.0, z: 43.8 },
    ];
  }, []);

  // Soft low-poly clouds drifting slowly across the extended Kanto sky
  const clouds = useMemo(() => {
    return [
      { y: 7.2, x: -3, z: 2.5, scale: 1.1, speed: 0.14 },
      { y: 8.8, x: 7, z: 4.5, scale: 0.85, speed: 0.09 },
      { y: 7.6, x: 2, z: 12.0, scale: 1.3, speed: 0.16 },
      { y: 9.2, x: 14, z: 8.5, scale: 0.95, speed: 0.11 },
      { y: 8.0, x: -4, z: 18.0, scale: 1.0, speed: 0.12 },
      { y: 9.5, x: 16, z: 22.0, scale: 1.2, speed: 0.10 },
      { y: 7.8, x: -2, z: 28.0, scale: 0.9, speed: 0.13 },
      { y: 8.6, x: 12, z: 32.0, scale: 1.15, speed: 0.08 },
      // Viridian City clouds
      { y: 8.5, x: 3, z: 36.0, scale: 1.0, speed: 0.11 },
      { y: 9.0, x: 8, z: 40.0, scale: 1.3, speed: 0.09 },
      { y: 7.4, x: -1, z: 44.0, scale: 0.95, speed: 0.14 },
      { y: 8.2, x: 14, z: 48.0, scale: 1.1, speed: 0.10 },
    ];
  }, []);

  // Dynamic Route 1 & Viridian Forest tall grass patches covering all zones
  const route1GrassPatches = useMemo(() => {
    const patches: { x: number; z: number; phase: number; scale: number }[] = [];
    // Original Route 1 grass patches on north side of Town
    const northCoords = [
      { x: 2, z: 1 }, { x: 3, z: 1 }, { x: 4, z: 1 }, { x: 5, z: 1 },
      { x: 9, z: 1 }, { x: 10, z: 1 }, { x: 11, z: 1 }, { x: 12, z: 1 },
      { x: 3, z: 0 }, { x: 4, z: 0 }, { x: 10, z: 0 }, { x: 11, z: 0 }
    ];
    // Route 1 south patches (rows 15-24)
    const route1Coords = [
      { x: 1, z: 15 }, { x: 2, z: 15 }, { x: 3, z: 15 }, { x: 12, z: 15 }, { x: 13, z: 15 },
      { x: 1, z: 16 }, { x: 2, z: 16 }, { x: 12, z: 16 }, { x: 13, z: 16 },
      { x: 1, z: 17 }, { x: 2, z: 17 }, { x: 12, z: 17 }, { x: 13, z: 17 },
      { x: 1, z: 18 }, { x: 13, z: 18 },
      { x: 1, z: 19 }, { x: 13, z: 19 },
      { x: 5, z: 21 }, { x: 9, z: 21 },
      { x: 5, z: 22 }, { x: 9, z: 22 },
      { x: 1, z: 23 }, { x: 13, z: 23 },
    ];
    // Viridian Forest interior patches (rows 25-34)
    const forestCoords = [
      { x: 1, z: 25 }, { x: 13, z: 25 },
      { x: 1, z: 26 }, { x: 13, z: 26 },
      { x: 1, z: 27 }, { x: 2, z: 27 }, { x: 12, z: 27 }, { x: 13, z: 27 },
      { x: 1, z: 28 }, { x: 13, z: 28 },
      { x: 1, z: 29 }, { x: 13, z: 29 },
      { x: 1, z: 30 }, { x: 13, z: 30 },
      { x: 5, z: 31 }, { x: 9, z: 31 },
      { x: 1, z: 32 }, { x: 2, z: 32 }, { x: 12, z: 32 }, { x: 13, z: 32 },
      { x: 1, z: 33 }, { x: 13, z: 33 },
      { x: 5, z: 34 }, { x: 9, z: 34 },
    ];
    // Viridian City grass patches (rows 35-49)
    const cityCoords = [
      { x: 1, z: 36 }, { x: 13, z: 36 },
      { x: 1, z: 37 }, { x: 13, z: 37 },
      { x: 3, z: 39 }, { x: 11, z: 39 },
      { x: 3, z: 40 }, { x: 11, z: 40 },
      { x: 1, z: 44 }, { x: 13, z: 44 },
      { x: 1, z: 45 }, { x: 13, z: 45 },
      { x: 1, z: 46 }, { x: 13, z: 46 },
      { x: 1, z: 47 }, { x: 2, z: 47 }, { x: 12, z: 47 }, { x: 13, z: 47 },
      { x: 5, z: 48 }, { x: 9, z: 48 },
    ];
    const allCoords = [...northCoords, ...route1Coords, ...forestCoords, ...cityCoords];
    allCoords.forEach((coord) => {
      patches.push({
        x: coord.x,
        z: coord.z,
        phase: Math.random() * Math.PI,
        scale: 0.85 + Math.random() * 0.3
      });
    });
    return patches;
  }, []);

  // Decorative Sakura Cherry Blossom trees coordinates
  const sakuraTrees = useMemo(() => {
    return [
      { x: 1.2, z: 4.5 },
      { x: 13.8, z: 4.5 },
      { x: 1.2, z: 10.5 },
      { x: 13.8, z: 10.5 },
    ];
  }, []);

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

    // 9. Mascot Pokémon cute active roaming paths
    if (pikachuGroupRef.current) {
      const pikaAngle = time * 0.7;
      pikachuGroupRef.current.position.x = 4.0 + Math.cos(pikaAngle) * 0.8;
      pikachuGroupRef.current.position.z = 6.0 + Math.sin(pikaAngle) * 0.8;
      pikachuGroupRef.current.rotation.y = -pikaAngle - Math.PI / 2;
    }

    if (bulbasaurGroupRef.current) {
      const bulbXDir = Math.sin(time * 0.35);
      const bulbX = 2.0 + bulbXDir * 0.6;
      bulbasaurGroupRef.current.position.x = bulbX;
      bulbasaurGroupRef.current.position.z = 6.0;
      const speedX = Math.cos(time * 0.35);
      bulbasaurGroupRef.current.rotation.y = speedX > 0 ? Math.PI / 2 : -Math.PI / 2;
    }

    if (charmanderGroupRef.current) {
      const charAngle = time * 0.78;
      charmanderGroupRef.current.position.x = 12.0 + Math.sin(charAngle) * 0.65;
      charmanderGroupRef.current.position.z = 6.0 + Math.cos(charAngle) * 0.65;
      charmanderGroupRef.current.rotation.y = -charAngle + Math.PI;
    }

    // 10. NPC interactive desynchronized pacing pathways & heading updates
    // Professor Oak pacing inside his tile (7,7)
    const oakCycle = Math.floor(time) % 12;
    let nextOakHeading: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' = 'DOWN';
    let nextOakState: 'IDLE' | 'WALK' = 'IDLE';
    let nextOakX = 7;

    if (oakCycle < 3) {
      const t = (time % 12) / 3;
      nextOakX = 7.0 - 0.45 * t;
      nextOakHeading = 'LEFT';
      nextOakState = 'WALK';
    } else if (oakCycle < 6) {
      nextOakX = 6.55;
      nextOakHeading = 'DOWN';
      nextOakState = 'IDLE';
    } else if (oakCycle < 9) {
      const t = ((time % 12) - 6) / 3;
      nextOakX = 6.55 + 0.9 * t;
      nextOakHeading = 'RIGHT';
      nextOakState = 'WALK';
    } else {
      const t = ((time % 12) - 9) / 3;
      nextOakX = 7.45 - 0.45 * t;
      nextOakHeading = 'LEFT';
      nextOakState = 'WALK';
    }

    if (oakGroupRef.current) {
      oakGroupRef.current.position.x = nextOakX;
    }
    if (oakHeading !== nextOakHeading) setOakHeading(nextOakHeading);
    if (oakPacingState !== nextOakState) setOakPacingState(nextOakState);

    // Rival Gary pacing inside his tile (10,5) desynchronized by 3.5s phase shift
    const garyCycle = Math.floor(time + 3.5) % 10;
    let nextGaryHeading: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' = 'LEFT';
    let nextGaryState: 'IDLE' | 'WALK' = 'IDLE';
    let nextGaryZ = 5;

    if (garyCycle < 2.5) {
      const t = ((time + 3.5) % 10) / 2.5;
      nextGaryZ = 5.0 - 0.4 * t;
      nextGaryHeading = 'UP';
      nextGaryState = 'WALK';
    } else if (garyCycle < 5) {
      nextGaryZ = 4.6;
      nextGaryHeading = 'LEFT';
      nextGaryState = 'IDLE';
    } else if (garyCycle < 7.5) {
      const t = (((time + 3.5) % 10) - 5) / 2.5;
      nextGaryZ = 4.6 + 0.8 * t;
      nextGaryHeading = 'DOWN';
      nextGaryState = 'WALK';
    } else {
      const t = (((time + 3.5) % 10) - 7.5) / 2.5;
      nextGaryZ = 5.4 - 0.4 * t;
      nextGaryHeading = 'UP';
      nextGaryState = 'WALK';
    }

    if (rivalGroupRef.current) {
      rivalGroupRef.current.position.z = nextGaryZ;
    }
    if (rivalHeading !== nextGaryHeading) setRivalHeading(nextGaryHeading);
    if (rivalPacingState !== nextGaryState) setRivalPacingState(nextGaryState);

    // Bug Catcher pacing LEFT-RIGHT on Route 1 (11, 18) — 5s cycle
    const bcCycle = Math.floor(time + 1.2) % 8;
    let nextBcHeading: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' = 'RIGHT';
    let nextBcState: 'IDLE' | 'WALK' = 'IDLE';
    let nextBcX = 11;

    if (bcCycle < 3) {
      const t = ((time + 1.2) % 8) / 3;
      nextBcX = 11.0 - 0.4 * t;
      nextBcHeading = 'LEFT';
      nextBcState = 'WALK';
    } else if (bcCycle < 4) {
      nextBcX = 10.6;
      nextBcHeading = 'LEFT';
      nextBcState = 'IDLE';
    } else if (bcCycle < 7) {
      const t = (((time + 1.2) % 8) - 4) / 3;
      nextBcX = 10.6 + 0.4 * t;
      nextBcHeading = 'RIGHT';
      nextBcState = 'WALK';
    } else {
      nextBcX = 11.0;
      nextBcHeading = 'RIGHT';
      nextBcState = 'IDLE';
    }

    if (bugCatcherGroupRef.current) {
      bugCatcherGroupRef.current.position.x = nextBcX;
    }
    if (bcHeading !== nextBcHeading) setBcHeading(nextBcHeading);
    if (bcPacingState !== nextBcState) setBcPacingState(nextBcState);

    // Youngster pacing UP-DOWN on Route 1 (4, 22) — 6s cycle
    const ysCycle = Math.floor(time + 2.8) % 10;
    let nextYsHeading: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' = 'DOWN';
    let nextYsState: 'IDLE' | 'WALK' = 'IDLE';
    let nextYsZ = 22;

    if (ysCycle < 3.5) {
      const t = ((time + 2.8) % 10) / 3.5;
      nextYsZ = 22.0 - 0.35 * t;
      nextYsHeading = 'UP';
      nextYsState = 'WALK';
    } else if (ysCycle < 5) {
      nextYsZ = 21.65;
      nextYsHeading = 'UP';
      nextYsState = 'IDLE';
    } else if (ysCycle < 8.5) {
      const t = (((time + 2.8) % 10) - 5) / 3.5;
      nextYsZ = 21.65 + 0.7 * t;
      nextYsHeading = 'DOWN';
      nextYsState = 'WALK';
    } else {
      nextYsZ = 22.35;
      nextYsHeading = 'DOWN';
      nextYsState = 'IDLE';
    }

    if (youngsterGroupRef.current) {
      youngsterGroupRef.current.position.z = nextYsZ;
    }
    if (ysHeading !== nextYsHeading) setYsHeading(nextYsHeading);
    if (ysPacingState !== nextYsState) setYsPacingState(nextYsState);

    // 11. High-fidelity dynamic Player 3D sync and 3D grass patch walk rustle particles
    const targetVec = new THREE.Vector3(targetPosition[0], 0, targetPosition[1]);
    const moveSpeedValue = bicycleActive ? 8.5 : 5.0;
    playerPosLocal.current.lerp(targetVec, dt * moveSpeedValue * 1.5);

    const px = Math.round(playerPosLocal.current.x);
    const pz = Math.round(playerPosLocal.current.z);
    
    // Check if player is on a grass tile
    let isOnGrassTile = false;
    if (pz >= 0 && pz < MAP_HEIGHT && px >= 0 && px < MAP_WIDTH) {
      isOnGrassTile = mapGrid[pz][px] === TileType.GRASS;
    }
    if (!isOnGrassTile) {
      isOnGrassTile = route1GrassPatches.some((p) => Math.round(p.x) === px && Math.round(p.z) === pz);
    }

    if (isOnGrassTile && isMoving && Math.random() < 0.35) {
      particlesRef.current.push({
        x: playerPosLocal.current.x + (Math.random() - 0.5) * 0.4,
        y: 0.15 + Math.random() * 0.1,
        z: playerPosLocal.current.z + (Math.random() - 0.5) * 0.4,
        vx: (Math.random() - 0.5) * 1.2,
        vy: 1.5 + Math.random() * 2.0, // Shoot upwards quickly!
        vz: (Math.random() - 0.5) * 1.2,
        age: 0,
        maxAge: 0.6 + Math.random() * 0.4,
        color: ['#40c057', '#37b24d', '#2b8a3e', '#51cf66', '#a9e34b'][Math.floor(Math.random() * 5)],
        scale: 0.08 + Math.random() * 0.08,
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 10,
      });
    }

    // Update grass particles physical motion frame-by-frame
    particlesRef.current = particlesRef.current.filter((p) => {
      p.age += dt;
      if (p.age >= p.maxAge) return false;

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;

      p.vy -= 4.2 * dt; // gravity deceleration
      p.vx += Math.sin(time * 5.0 + p.y) * 0.22 * dt; // wind sway
      p.rotation += p.rotSpeed * dt;

      return true;
    });

    // Update static particle pool geometry transformations directly for high performance
    if (leafParticlesGroupRef.current) {
      const children = leafParticlesGroupRef.current.children;
      for (let i = 0; i < particlePoolSize; i++) {
        const mesh = children[i] as THREE.Mesh;
        const particle = particlesRef.current[i];
        if (mesh) {
          if (particle) {
            mesh.position.set(particle.x, particle.y, particle.z);
            mesh.rotation.set(particle.rotation, particle.rotation * 0.5, 0);
            
            const lifeRatio = 1.0 - (particle.age / particle.maxAge);
            const currentScale = particle.scale * lifeRatio;
            mesh.scale.set(currentScale, currentScale, currentScale);
            
            const mat = mesh.material as THREE.MeshStandardMaterial;
            if (mat) {
              mat.color.set(particle.color);
              mat.transparent = true;
              mat.opacity = lifeRatio;
            }
            mesh.visible = true;
          } else {
            mesh.visible = false;
          }
        }
      }
    }

    // 11. Spinning energy wind-turbine on Rival Gary's roof
    if (rivalTurbineRef.current) {
      rivalTurbineRef.current.rotation.z += dt * 3.8;
    }

    // 12. Scanning research satellite radar on Oak's Laboratory roof
    if (labSatelliteRef.current) {
      labSatelliteRef.current.rotation.y = Math.sin(time * 0.45) * 0.6;
    }

    // 13. Streetlamp light intensity & material luminance synchronization
    streetlampLightRefs.current.forEach((light) => {
      if (light) {
        light.intensity = climate.nightFactor * 2.6;
      }
    });
    streetlampMaterialRefs.current.forEach((mat) => {
      if (mat) {
        mat.emissiveIntensity = climate.nightFactor * 2.2;
      }
    });

    // 14. Puffy clouds drifting across Kanto skies
    if (cloudsGroupRef.current) {
      const childClouds = cloudsGroupRef.current.children;
      clouds.forEach((cloud, idx) => {
        const item = childClouds[idx];
        if (item) {
          item.position.x += cloud.speed * dt;
          if (item.position.x > MAP_WIDTH + 6) {
            item.position.x = -6;
          }
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

      {/* DRIFTING PUFFY LOW-POLY CLOUDS */}
      <group ref={cloudsGroupRef}>
        {clouds.map((cloud, i) => (
          <group key={`cloud-${i}`} position={[cloud.x, cloud.y, cloud.z]} scale={[cloud.scale, cloud.scale, cloud.scale]}>
            <mesh castShadow>
              <sphereGeometry args={[0.8, 7, 7]} />
              <meshStandardMaterial color="#ffffff" roughness={0.9} flatShading opacity={0.88} transparent />
            </mesh>
            <mesh position={[0.5, -0.2, 0.2]} castShadow>
              <sphereGeometry args={[0.55, 6, 6]} />
              <meshStandardMaterial color="#f1f3f5" roughness={0.9} flatShading opacity={0.88} transparent />
            </mesh>
            <mesh position={[-0.5, -0.2, -0.2]} castShadow>
              <sphereGeometry args={[0.55, 6, 6]} />
              <meshStandardMaterial color="#f1f3f5" roughness={0.9} flatShading opacity={0.88} transparent />
            </mesh>
          </group>
        ))}
      </group>

      {/* DYNAMIC ATMOSPHERIC STREETLIGHTS */}
      {streetlamps.map((lamp, i) => (
        <group key={`streetlamp-${i}`} position={[lamp.x, 0, lamp.z]}>
          {/* Base and metallic black Post */}
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.12, 0.2, 6]} />
            <meshStandardMaterial color="#212529" roughness={0.5} />
          </mesh>
          <mesh position={[0, 1.2, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 2.2, 8]} />
            <meshStandardMaterial color="#343a40" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Ornate hanger bracket */}
          <mesh position={[0.18, 2.1, 0]} castShadow>
            <boxGeometry args={[0.4, 0.05, 0.05]} />
            <meshStandardMaterial color="#212529" roughness={0.5} />
          </mesh>
          {/* Glowing Lantern head with pointlight attached */}
          <group position={[0.34, 1.95, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.22, 0.32, 0.22]} />
              <meshStandardMaterial color="#212529" roughness={0.5} />
            </mesh>
            <mesh 
              position={[0, -0.06, 0]} 
              ref={(el) => {
                if (el) {
                  streetlampMaterialRefs.current[i] = el.material as any;
                }
              }}
            >
              <cylinderGeometry args={[0.08, 0.06, 0.14, 5]} />
              <meshStandardMaterial color="#5c5f66" emissive="#ffd8a8" emissiveIntensity={0.0} toneMapped={false} />
            </mesh>
            
            {/* Real 3D PointLight casting soft shadows at night */}
            <pointLight
              ref={(el) => {
                streetlampLightRefs.current[i] = el;
              }}
              color="#ffd8a8"
              intensity={0.0}
              distance={7.5}
              decay={2}
              castShadow
              shadow-bias={-0.002}
            />
          </group>
        </group>
      ))}

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

      {/* HIGH-FIDELITY ROUTE 1 BATTLE TALL GRASS CLUSTERS */}
      {route1GrassPatches.map((patch, i) => (
        <group key={`route1-grass-${i}`} position={[patch.x, 0.05, patch.z]} scale={[patch.scale, patch.scale, patch.scale]}>
          <mesh position={[-0.15, 0.25, -0.15]} castShadow>
            <boxGeometry args={[0.08, 0.5, 0.08]} />
            <meshStandardMaterial color="#37b24d" roughness={0.9} />
          </mesh>
          <mesh position={[0.15, 0.25, 0.15]} castShadow>
            <boxGeometry args={[0.08, 0.55, 0.08]} />
            <meshStandardMaterial color="#2b8a3e" roughness={0.9} />
          </mesh>
          <mesh position={[-0.15, 0.22, 0.15]} castShadow>
            <boxGeometry args={[0.08, 0.45, 0.08]} />
            <meshStandardMaterial color="#40c057" roughness={0.9} />
          </mesh>
          <mesh position={[0.15, 0.28, -0.15]} castShadow>
            <boxGeometry args={[0.08, 0.58, 0.08]} />
            <meshStandardMaterial color="#37b24d" roughness={0.9} />
          </mesh>
          {/* Central thick leaf bunch */}
          <mesh position={[0, 0.35, 0]} castShadow>
            <boxGeometry args={[0.18, 0.7, 0.18]} />
            <meshStandardMaterial color="#51cf66" roughness={1.0} />
          </mesh>
        </group>
      ))}

      {/* LUXURIOUS SAKURA CHERRY BLOSSOM TREES */}
      {sakuraTrees.map((tree, i) => (
        <group key={`sakura-tree-${i}`} position={[tree.x, 0, tree.z]}>
          {/* Trunk */}
          <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.12, 0.18, 0.9, 8]} />
            <meshStandardMaterial color="#6a4c33" roughness={0.9} />
          </mesh>
          {/* Fluffy Blossom Layers */}
          <mesh position={[0, 1.25, 0]} castShadow>
            <sphereGeometry args={[0.55, 7, 7]} />
            <meshStandardMaterial color="#ff92b1" roughness={0.8} flatShading />
          </mesh>
          <mesh position={[0.25, 1.6, -0.15]} castShadow>
            <sphereGeometry args={[0.42, 6, 6]} />
            <meshStandardMaterial color="#ffb3c6" roughness={0.8} flatShading />
          </mesh>
          <mesh position={[-0.25, 1.5, 0.25]} castShadow>
            <sphereGeometry args={[0.42, 6, 6]} />
            <meshStandardMaterial color="#faadb1" roughness={0.8} flatShading />
          </mesh>
          <mesh position={[0, 1.85, 0]} castShadow>
            <sphereGeometry args={[0.34, 5, 5]} />
            <meshStandardMaterial color="#ffccd5" roughness={0.8} flatShading />
          </mesh>
        </group>
      ))}

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

              {/* Dynamic sustainable wind turbine on Gary's roof */}
              <group position={[1.3, 2.5, -0.6]}>
                {/* Wind turbine tall post */}
                <mesh castShadow>
                  <cylinderGeometry args={[0.03, 0.05, 1.2]} />
                  <meshStandardMaterial color="#ced4da" metalness={0.7} roughness={0.3} />
                </mesh>
                {/* Nacelle housing */}
                <mesh position={[0, 0.6, 0.06]} castShadow>
                  <boxGeometry args={[0.15, 0.15, 0.25]} />
                  <meshStandardMaterial color="#dee2e6" metalness={0.5} />
                </mesh>
                {/* Spinning hub and blades */}
                <group position={[0, 0.6, 0.2]} ref={rivalTurbineRef}>
                  {/* Rotor nose cap */}
                  <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
                    <coneGeometry args={[0.06, 0.12, 5]} />
                    <meshStandardMaterial color="#fab005" />
                  </mesh>
                  {/* Blade 1 */}
                  <mesh position={[0, 0.4, 0]} castShadow>
                    <boxGeometry args={[0.04, 0.72, 0.01]} />
                    <meshStandardMaterial color="#f8f9fa" />
                  </mesh>
                  {/* Blade 2 (angled 120deg) */}
                  <mesh position={[-0.34, -0.2, 0]} rotation={[0, 0, Math.PI * 2 / 3]} castShadow>
                    <boxGeometry args={[0.04, 0.72, 0.01]} />
                    <meshStandardMaterial color="#f8f9fa" />
                  </mesh>
                  {/* Blade 3 (angled 240deg) */}
                  <mesh position={[0.34, -0.2, 0]} rotation={[0, 0, -Math.PI * 2 / 3]} castShadow>
                    <boxGeometry args={[0.04, 0.72, 0.01]} />
                    <meshStandardMaterial color="#f8f9fa" />
                  </mesh>
                </group>
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
              {/* Lab satellite dish (dynamic rolling sweep) */}
              <group position={[1.8, 3.2, 0.4]} ref={labSatelliteRef}>
                {/* Mast */}
                <mesh castShadow>
                  <cylinderGeometry args={[0.04, 0.04, 0.6]} />
                  <meshStandardMaterial color="#868e96" />
                </mesh>
                {/* Dish cup */}
                <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                  <cylinderGeometry args={[0.35, 0.05, 0.1, 8]} />
                  <meshStandardMaterial color="#adb5bd" roughness={0.4} />
                </mesh>
                {/* Active scan tip indicator */}
                <mesh position={[0, 0.5, 0.1]} castShadow>
                  <sphereGeometry args={[0.05, 6, 6]} />
                  <meshStandardMaterial color="#40c057" emissive="#51cf66" emissiveIntensity={1.5} />
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

              {/* Stack of scientific research maps/papers next to entrance */}
              <group position={[-1.1, 0.15, 2.05]} rotation={[0, 0.3, 0]}>
                {/* Scroll 1 */}
                <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                  <cylinderGeometry args={[0.06, 0.06, 0.35, 6]} />
                  <meshStandardMaterial color="#f8f9fa" roughness={0.8} />
                </mesh>
                {/* Scroll 1 leather wrap tie */}
                <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                  <cylinderGeometry args={[0.063, 0.063, 0.04, 6]} />
                  <meshStandardMaterial color="#862e9c" />
                </mesh>
                {/* Scroll 2 stacked on top */}
                <mesh position={[0.06, 0.09, 0.04]} rotation={[0, 0, Math.PI / 2 - 0.2]} castShadow>
                  <cylinderGeometry args={[0.05, 0.05, 0.36, 6]} />
                  <meshStandardMaterial color="#ffd8a8" roughness={0.9} />
                </mesh>
                {/* Scroll 3 stacked behind */}
                <mesh position={[-0.07, 0.05, -0.05]} rotation={[0, 0, Math.PI / 2 + 0.15]} castShadow>
                  <cylinderGeometry args={[0.055, 0.055, 0.33, 6]} />
                  <meshStandardMaterial color="#f8f9fa" roughness={0.8} />
                </mesh>
              </group>
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

        // ===== VIRIDIAN CITY POKÉMON CENTER (x=2-3, z=37-38) =====
        if (x === 2 && z === 37) {
          return (
            <group key="viridian-center" position={[2, 0, 37.5]}>
              {/* Foundation — covers rows 37-38 only */}
              <mesh position={[0, 0.1, 0]} receiveShadow>
                <boxGeometry args={[3.2, 0.2, 2.2]} />
                <meshStandardMaterial color="#495057" roughness={0.9} />
              </mesh>
              {/* White walls */}
              <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
                <boxGeometry args={[3.0, 2.2, 2.0]} />
                <meshStandardMaterial color="#f8f9fa" roughness={0.6} />
              </mesh>
              {/* Red roof stripe */}
              <mesh position={[0, 2.35, 0]} castShadow>
                <boxGeometry args={[3.2, 0.15, 2.2]} />
                <meshStandardMaterial color="#e03131" roughness={0.5} />
              </mesh>
              {/* Flat roof top */}
              <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[3.0, 0.12, 2.0]} />
                <meshStandardMaterial color="#dee2e6" roughness={0.4} />
              </mesh>
              {/* Poké Ball symbol on roof */}
              <mesh position={[0, 2.56, 0]}>
                <sphereGeometry args={[0.12, 8, 8]} />
                <meshStandardMaterial color="#e03131" roughness={0.3} />
              </mesh>
              <mesh position={[0, 2.56, 0]}>
                <sphereGeometry args={[0.06, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color="#f8f9fa" roughness={0.3} />
              </mesh>
              {/* Front door on south face — faces the PATH tiles at z=39 */}
              <mesh position={[0, 0.6, 1.01]} castShadow>
                <boxGeometry args={[0.6, 1.2, 0.05]} />
                <meshStandardMaterial color="#74c0fc" transparent opacity={0.5} roughness={0.1} metalness={0.5} />
              </mesh>
              <mesh position={[0, 0.6, 1.01]}>
                <boxGeometry args={[0.65, 1.25, 0.03]} />
                <meshStandardMaterial color="#343a40" />
              </mesh>
              {/* Center sign above door */}
              <mesh position={[0, 1.9, 1.01]}>
                <boxGeometry args={[1.0, 0.3, 0.06]} />
                <meshStandardMaterial color="#e03131" roughness={0.5} />
              </mesh>
              <mesh position={[0, 1.9, 1.03]}>
                <boxGeometry args={[0.9, 0.22, 0.02]} />
                <meshStandardMaterial color="#f8f9fa" />
              </mesh>
              {/* Side windows */}
              <mesh position={[-0.8, 1.2, 1.01]}>
                <boxGeometry args={[0.45, 0.45, 0.04]} />
                <meshStandardMaterial color="#74c0fc" transparent opacity={0.6} roughness={0.1} />
              </mesh>
              <mesh position={[0.8, 1.2, 1.01]}>
                <boxGeometry args={[0.45, 0.45, 0.04]} />
                <meshStandardMaterial color="#74c0fc" transparent opacity={0.6} roughness={0.1} />
              </mesh>
              {/* North windows */}
              <mesh position={[-0.8, 1.2, -1.01]}>
                <boxGeometry args={[0.45, 0.45, 0.04]} />
                <meshStandardMaterial color="#74c0fc" transparent opacity={0.6} roughness={0.1} />
              </mesh>
              <mesh position={[0.8, 1.2, -1.01]}>
                <boxGeometry args={[0.45, 0.45, 0.04]} />
                <meshStandardMaterial color="#74c0fc" transparent opacity={0.6} roughness={0.1} />
              </mesh>
              {/* Entrance ramp */}
              <mesh position={[0, 0.04, 1.35]} receiveShadow>
                <boxGeometry args={[0.8, 0.08, 0.5]} />
                <meshStandardMaterial color="#868e96" roughness={0.8} />
              </mesh>
              {/* Nurse Joy's healing machine */}
              <mesh position={[-0.5, 0.4, -0.95]}>
                <boxGeometry args={[0.3, 0.3, 0.05]} />
                <meshStandardMaterial color="#40c057" emissive="#40c057" emissiveIntensity={0.5} />
              </mesh>
            </group>
          );
        }
        if (x >= 2 && x <= 3 && z >= 37 && z <= 38) return null;

        // ===== VIRIDIAN CITY POKÉ MART (x=12-13, z=37-38) =====
        if (x === 12 && z === 37) {
          return (
            <group key="viridian-mart" position={[12, 0, 37.5]}>
              {/* Foundation */}
              <mesh position={[0, 0.1, 0]} receiveShadow>
                <boxGeometry args={[3.2, 0.2, 2.2]} />
                <meshStandardMaterial color="#495057" roughness={0.9} />
              </mesh>
              {/* Blue walls */}
              <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
                <boxGeometry args={[3.0, 2.2, 2.0]} />
                <meshStandardMaterial color="#e7f5ff" roughness={0.6} />
              </mesh>
              {/* Blue roof stripe */}
              <mesh position={[0, 2.35, 0]} castShadow>
                <boxGeometry args={[3.2, 0.15, 2.2]} />
                <meshStandardMaterial color="#1c7ed6" roughness={0.5} />
              </mesh>
              {/* Flat roof top */}
              <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[3.0, 0.12, 2.0]} />
                <meshStandardMaterial color="#dee2e6" roughness={0.4} />
              </mesh>
              {/* Front door on south face */}
              <mesh position={[0, 0.6, 1.01]} castShadow>
                <boxGeometry args={[0.6, 1.2, 0.05]} />
                <meshStandardMaterial color="#74c0fc" transparent opacity={0.5} roughness={0.1} metalness={0.5} />
              </mesh>
              <mesh position={[0, 0.6, 1.01]}>
                <boxGeometry args={[0.65, 1.25, 0.03]} />
                <meshStandardMaterial color="#343a40" />
              </mesh>
              {/* MART sign above door */}
              <mesh position={[0, 1.9, 1.01]}>
                <boxGeometry args={[1.0, 0.3, 0.06]} />
                <meshStandardMaterial color="#1c7ed6" roughness={0.5} />
              </mesh>
              <mesh position={[0, 1.9, 1.03]}>
                <boxGeometry args={[0.9, 0.22, 0.02]} />
                <meshStandardMaterial color="#f8f9fa" />
              </mesh>
              {/* Windows */}
              <mesh position={[-0.8, 1.2, 1.01]}>
                <boxGeometry args={[0.45, 0.45, 0.04]} />
                <meshStandardMaterial color="#74c0fc" transparent opacity={0.6} roughness={0.1} />
              </mesh>
              <mesh position={[0.8, 1.2, 1.01]}>
                <boxGeometry args={[0.45, 0.45, 0.04]} />
                <meshStandardMaterial color="#74c0fc" transparent opacity={0.6} roughness={0.1} />
              </mesh>
              <mesh position={[-0.8, 1.2, -1.01]}>
                <boxGeometry args={[0.45, 0.45, 0.04]} />
                <meshStandardMaterial color="#74c0fc" transparent opacity={0.6} roughness={0.1} />
              </mesh>
              <mesh position={[0.8, 1.2, -1.01]}>
                <boxGeometry args={[0.45, 0.45, 0.04]} />
                <meshStandardMaterial color="#74c0fc" transparent opacity={0.6} roughness={0.1} />
              </mesh>
              {/* Awning above door */}
              <mesh position={[0, 1.55, 1.01]}>
                <boxGeometry args={[1.6, 0.06, 0.3]} />
                <meshStandardMaterial color="#1c7ed6" roughness={0.5} />
              </mesh>
              {/* Entrance ramp */}
              <mesh position={[0, 0.04, 1.35]} receiveShadow>
                <boxGeometry args={[0.8, 0.08, 0.5]} />
                <meshStandardMaterial color="#868e96" roughness={0.8} />
              </mesh>
              {/* Display shelves inside */}
              <mesh position={[0.6, 0.3, -0.95]}>
                <boxGeometry args={[0.4, 0.6, 0.1]} />
                <meshStandardMaterial color="#adb5bd" roughness={0.6} />
              </mesh>
              <mesh position={[-0.6, 0.3, -0.95]}>
                <boxGeometry args={[0.4, 0.6, 0.1]} />
                <meshStandardMaterial color="#adb5bd" roughness={0.6} />
              </mesh>
            </group>
          );
        }
        if (x >= 11 && x <= 12 && z >= 37 && z <= 38) return null;

        // ===== VIRIDIAN GYM (x=4-10, z=41-42) =====
        if (x === 7 && z === 41) {
          return (
            <group key="viridian-gym" position={[7, 0, 41.5]}>
              {/* Large stone foundation — covers rows 41-42 */}
              <mesh position={[0, 0.15, 0]} receiveShadow>
                <boxGeometry args={[7.2, 0.3, 2.2]} />
                <meshStandardMaterial color="#495057" roughness={0.9} />
              </mesh>
              {/* Sandstone walls */}
              <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[7.0, 2.8, 2.0]} />
                <meshStandardMaterial color="#e9ecef" roughness={0.7} />
              </mesh>
              {/* Green domed roof */}
              <mesh position={[0, 3.2, 0]} castShadow receiveShadow>
                <boxGeometry args={[7.4, 0.4, 2.4]} />
                <meshStandardMaterial color="#099268" roughness={0.5} />
              </mesh>
              {/* Dome center */}
              <mesh position={[0, 3.6, 0]} castShadow>
                <sphereGeometry args={[1.2, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2.5]} />
                <meshStandardMaterial color="#2f9e44" roughness={0.6} flatShading />
              </mesh>
              {/* Gold Gym symbol on dome */}
              <mesh position={[0, 3.6, 0.2]}>
                <torusGeometry args={[0.2, 0.04, 6, 12]} />
                <meshStandardMaterial color="#fab005" metalness={0.8} roughness={0.2} />
              </mesh>
              <mesh position={[0, 3.6, 0.2]}>
                <sphereGeometry args={[0.06, 6, 6]} />
                <meshStandardMaterial color="#fcc419" />
              </mesh>
              {/* Grand entrance doors on south face — faces the PATH tiles at z=43 */}
              <mesh position={[0, 0.8, 1.01]} castShadow>
                <boxGeometry args={[1.6, 1.6, 0.06]} />
                <meshStandardMaterial color="#343a40" roughness={0.5} />
              </mesh>
              <mesh position={[-0.4, 0.8, 1.04]}>
                <boxGeometry args={[0.7, 1.3, 0.02]} />
                <meshStandardMaterial color="#1c7ed6" roughness={0.3} />
              </mesh>
              <mesh position={[0.4, 0.8, 1.04]}>
                <boxGeometry args={[0.7, 1.3, 0.02]} />
                <meshStandardMaterial color="#1c7ed6" roughness={0.3} />
              </mesh>
              {/* GYM sign above door */}
              <mesh position={[0, 2.2, 1.01]}>
                <boxGeometry args={[1.8, 0.35, 0.06]} />
                <meshStandardMaterial color="#fab005" roughness={0.5} />
              </mesh>
              <mesh position={[0, 2.2, 1.03]}>
                <boxGeometry args={[1.6, 0.25, 0.02]} />
                <meshStandardMaterial color="#1a1b1e" />
              </mesh>
              {/* Pillars flanking entrance */}
              <mesh position={[-0.9, 0.85, 1.01]} castShadow>
                <cylinderGeometry args={[0.08, 0.1, 1.7, 8]} />
                <meshStandardMaterial color="#868e96" roughness={0.6} />
              </mesh>
              <mesh position={[0.9, 0.85, 1.01]} castShadow>
                <cylinderGeometry args={[0.08, 0.1, 1.7, 8]} />
                <meshStandardMaterial color="#868e96" roughness={0.6} />
              </mesh>
              {/* Side windows (tall, narrow) */}
              <mesh position={[-2.5, 1.4, 1.01]}>
                <boxGeometry args={[0.3, 1.0, 0.04]} />
                <meshStandardMaterial color="#74c0fc" transparent opacity={0.5} roughness={0.1} />
              </mesh>
              <mesh position={[2.5, 1.4, 1.01]}>
                <boxGeometry args={[0.3, 1.0, 0.04]} />
                <meshStandardMaterial color="#74c0fc" transparent opacity={0.5} roughness={0.1} />
              </mesh>
              <mesh position={[-2.5, 1.4, -1.01]}>
                <boxGeometry args={[0.3, 1.0, 0.04]} />
                <meshStandardMaterial color="#74c0fc" transparent opacity={0.5} roughness={0.1} />
              </mesh>
              <mesh position={[2.5, 1.4, -1.01]}>
                <boxGeometry args={[0.3, 1.0, 0.04]} />
                <meshStandardMaterial color="#74c0fc" transparent opacity={0.5} roughness={0.1} />
              </mesh>
              {/* Entrance steps */}
              <mesh position={[0, 0.04, 1.35]} receiveShadow>
                <boxGeometry args={[2.0, 0.08, 0.5]} />
                <meshStandardMaterial color="#868e96" roughness={0.8} />
              </mesh>
            </group>
          );
        }
        if (x >= 4 && x <= 10 && z >= 41 && z <= 42) return null;

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
      <group ref={oakGroupRef} position={[7, 0, 7]}>
        <TrainerModel role="OAK" heading={oakHeading} state={oakPacingState} scale={0.9} />
      </group>

      {/* Professor Oak's Poké Ball Starter Selection Table (8, 7) */}
      <group position={[8, 0, 7]}>
        {/* Desk Base structure */}
        <mesh position={[0, 0.32, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.78, 0.62, 0.52]} />
          <meshStandardMaterial color="#343a40" roughness={0.4} /> {/* Dark high tech metal */}
        </mesh>
        <mesh position={[0, 0.64, 0]} castShadow>
          <boxGeometry args={[0.82, 0.04, 0.56]} />
          <meshStandardMaterial color="#dee2e6" roughness={0.3} /> {/* Light silver top rim */}
        </mesh>
        {/* Felt starter display panel */}
        <mesh position={[0, 0.665, 0]}>
          <boxGeometry args={[0.68, 0.02, 0.42]} />
          <meshStandardMaterial color="#2b8a3e" roughness={0.9} /> {/* Classic green felt pad */}
        </mesh>
        
        {/* Three high-tech circular capsule holders */}
        {[-0.22, 0.0, 0.22].map((offsetX, bIdx) => (
          <group key={`holder-${bIdx}`} position={[offsetX, 0.68, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.07, 0.07, 0.02, 12]} />
              <meshStandardMaterial color="#1a1b1e" roughness={0.2} metalness={0.8} />
            </mesh>
            {/* Cute 3D custom Poké Ball red & white */}
            <group position={[0, 0.08, 0]}>
              {/* Upper Sphere (Red) */}
              <mesh castShadow position={[0, 0.02, 0]}>
                <sphereGeometry args={[0.065, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color="#e03131" roughness={0.25} metalness={0.3} />
              </mesh>
              {/* Lower Sphere (White) */}
              <mesh castShadow position={[0, 0.02, 0]}>
                <sphereGeometry args={[0.065, 12, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
                <meshStandardMaterial color="#f8f9fa" roughness={0.25} />
              </mesh>
              {/* Middle seam belt */}
              <mesh position={[0, 0.02, 0]}>
                <cylinderGeometry args={[0.066, 0.066, 0.012, 12]} />
                <meshStandardMaterial color="#1a1b1e" roughness={0.9} />
              </mesh>
              {/* Shiny white center trigger button */}
              <mesh position={[0, 0.02, 0.062]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.015, 0.015, 0.01, 8]} />
                <meshStandardMaterial color="#ffffff" roughness={0.1} emissive="#ffffff" emissiveIntensity={0.3} />
              </mesh>
            </group>
          </group>
        ))}

        {/* Electronic scientific analyzer strip */}
        <group position={[0, 0.4, 0.265]}>
          <mesh castShadow>
            <boxGeometry args={[0.3, 0.16, 0.02]} />
            <meshStandardMaterial color="#1a1b1e" />
          </mesh>
          {/* Blinking green pixel led */}
          <mesh position={[-0.08, 0.02, 0.012]}>
            <boxGeometry args={[0.02, 0.02, 0.01]} />
            <meshStandardMaterial color="#40c057" emissive="#40c057" emissiveIntensity={1.5} />
          </mesh>
          <mesh position={[0.08, 0.02, 0.012]}>
            <boxGeometry args={[0.02, 0.02, 0.01]} />
            <meshStandardMaterial color="#fa5252" emissive="#fa5252" emissiveIntensity={0.5} />
          </mesh>
        </group>

        {/* Clean glass protector dome on top */}
        <mesh position={[0, 0.82, 0]} castShadow>
          <boxGeometry args={[0.76, 0.28, 0.48]} />
          <meshStandardMaterial color="#e7f5ff" transparent opacity={0.25} roughness={0.1} metalness={0.9} />
        </mesh>
      </group>

      {/* Rival Gary: Stands in front of his house (10, 5) */}
      <group ref={rivalGroupRef} position={[10, 0, 5]}>
        <TrainerModel role="RIVAL" heading={rivalHeading} state={rivalPacingState} scale={0.9} />
      </group>

      {/* Bug Catcher: Wandering Route 1 eastern grass (11, 18) */}
      <group ref={bugCatcherGroupRef} position={[11, 0, 18]}>
        <TrainerModel role="TRAINER" heading={bcHeading} state={bcPacingState} scale={0.88} />
      </group>

      {/* Youngster: Wandering Route 1 western grass (4, 22) */}
      <group ref={youngsterGroupRef} position={[4, 0, 22]}>
        <TrainerModel role="TRAINER" heading={ysHeading} state={ysPacingState} scale={0.88} />
      </group>

      {/* Wild Pikachu Mascot: Hopping around grass (4, 6) */}
      <group ref={pikachuGroupRef} position={[4, 0, 6]}>
        <PokemonModel name="Pikachu" color="#fcc419" state="WALK" scale={0.9} />
      </group>

      {/* Wild Bulbasaur Mascot: Shaded near lake (2, 6) */}
      <group ref={bulbasaurGroupRef} position={[2, 0, 6]}>
        <PokemonModel name="Bulbasaur" color="#3bc9db" state="WALK" scale={0.95} />
      </group>

      {/* Wild Charmander Mascot: Near east trees (12, 6) */}
      <group ref={charmanderGroupRef} position={[12, 0, 6]}>
        <PokemonModel name="Charmander" color="#ff922b" state="WALK" scale={0.9} />
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

      {/* Fishing Pier dock (Route 21 Lake Area) */}
      <group position={[5, 0.02, 12.2]}>
        {/* Main weathered logs deck */}
        <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.92, 0.04, 0.82]} />
          <meshStandardMaterial color="#8c5a3c" roughness={0.9} />
        </mesh>
        {/* Support columns going deep into water */}
        <mesh position={[-0.4, -0.22, 0.3]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.52, 8]} />
          <meshStandardMaterial color="#5c3e10" roughness={1.0} />
        </mesh>
        <mesh position={[0.4, -0.22, 0.3]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.52, 8]} />
          <meshStandardMaterial color="#5c3e10" roughness={1.0} />
        </mesh>
        <mesh position={[-0.4, -0.22, -0.3]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.52, 8]} />
          <meshStandardMaterial color="#5c3e10" roughness={1.0} />
        </mesh>
        <mesh position={[0.4, -0.22, -0.3]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.52, 8]} />
          <meshStandardMaterial color="#5c3e10" roughness={1.0} />
        </mesh>

        {/* Dynamic bobbing buoy floating in nearby water (coordinate 5.8, 13.0) */}
        <group position={[1.4, -0.05, 0.8]}>
          <mesh castShadow>
            <sphereGeometry args={[0.09, 8, 8]} />
            <meshStandardMaterial color="#ff922b" roughness={0.5} /> {/* Orange buoy body */}
          </mesh>
          <mesh position={[0, 0.08, 0]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.12, 6]} />
            <meshStandardMaterial color="#212529" /> {/* Indicator post */}
          </mesh>
          <mesh position={[0, 0.14, 0]} castShadow>
            <sphereGeometry args={[0.02, 4, 4]} />
            <meshStandardMaterial color="#fa5252" emissive="#fa5252" emissiveIntensity={1.0} /> {/* Warning light */}
          </mesh>
          {/* Support ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
            <torusGeometry args={[0.1, 0.02, 4, 8]} />
            <meshStandardMaterial color="#f8f9fa" />
          </mesh>
        </group>
      </group>

      {/* ROUTE 1 DIRECTIONAL MARKER (7, 11) */}
      <group position={[7, 0, 11]}>
        {/* Tall weathered wooden post */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.055, 1.2, 7]} />
          <meshStandardMaterial color="#8c5a3c" roughness={0.9} />
        </mesh>
        {/* Decorative crossbeam */}
        <mesh position={[0, 1.05, -0.02]} castShadow>
          <boxGeometry args={[0.28, 0.04, 0.06]} />
          <meshStandardMaterial color="#6a4c33" roughness={0.9} />
        </mesh>
        {/* Route 1 Shield Sign */}
        <group position={[0, 1.25, 0.02]}>
          <mesh castShadow>
            <boxGeometry args={[0.28, 0.22, 0.04]} />
            <meshStandardMaterial color="#2b8a3e" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.022]}>
            <boxGeometry args={[0.24, 0.18, 0.01]} />
            <meshStandardMaterial color="#f8f9fa" roughness={0.3} />
          </mesh>
          <mesh position={[-0.07, 0.05, 0.032]}>
            <boxGeometry args={[0.03, 0.03, 0.01]} />
            <meshStandardMaterial color="#1a1b1e" />
          </mesh>
          <mesh position={[0.07, 0.05, 0.032]}>
            <boxGeometry args={[0.03, 0.03, 0.01]} />
            <meshStandardMaterial color="#1a1b1e" />
          </mesh>
          <mesh position={[0, -0.03, 0.032]}>
            <boxGeometry args={[0.06, 0.04, 0.01]} />
            <meshStandardMaterial color="#1a1b1e" />
          </mesh>
        </group>
        <mesh position={[0, 1.0, 0.03]} rotation={[0, 0, Math.PI]} castShadow>
          <coneGeometry args={[0.05, 0.08, 4]} />
          <meshStandardMaterial color="#fab005" />
        </mesh>
        <mesh position={[0, 0.92, 0.03]}>
          <boxGeometry args={[0.05, 0.015, 0.01]} />
          <meshStandardMaterial color="#f8f9fa" />
        </mesh>
        <mesh position={[0, 0.88, 0.03]}>
          <boxGeometry args={[0.03, 0.015, 0.01]} />
          <meshStandardMaterial color="#f8f9fa" />
        </mesh>
      </group>

      {/* ===== ROUTE 1 SIGN (7, 15) ===== */}
      <group position={[7, 0, 15]}>
        <mesh position={[0, 0.55, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.05, 1.1, 7]} />
          <meshStandardMaterial color="#8c5a3c" roughness={0.9} />
        </mesh>
        <mesh position={[0, 1.05, -0.02]} castShadow>
          <boxGeometry args={[0.32, 0.04, 0.06]} />
          <meshStandardMaterial color="#6a4c33" roughness={0.9} />
        </mesh>
        <group position={[0, 1.25, 0.02]}>
          <mesh castShadow>
            <boxGeometry args={[0.28, 0.22, 0.04]} />
            <meshStandardMaterial color="#2b8a3e" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.022]}>
            <boxGeometry args={[0.24, 0.18, 0.01]} />
            <meshStandardMaterial color="#f8f9fa" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.05, 0.032]}>
            <boxGeometry args={[0.06, 0.03, 0.01]} />
            <meshStandardMaterial color="#1a1b1e" />
          </mesh>
          <mesh position={[0, -0.03, 0.032]}>
            <boxGeometry args={[0.05, 0.04, 0.01]} />
            <meshStandardMaterial color="#1a1b1e" />
          </mesh>
        </group>
        <mesh position={[0, 1.0, 0.03]} rotation={[0, 0, Math.PI]} castShadow>
          <coneGeometry args={[0.05, 0.08, 4]} />
          <meshStandardMaterial color="#fab005" />
        </mesh>
      </group>

      {/* ===== ROUTE 1 HIDDEN BERRY BUSH (7, 20) ===== */}
      <group position={[7, 0, 20]}>
        <mesh position={[0, 0.04, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[0.28, 0.34, 0.08, 8]} />
          <meshStandardMaterial color="#5c3e10" roughness={1.0} />
        </mesh>
        <mesh position={[0, 0.22, 0]} castShadow>
          <sphereGeometry args={[0.28, 7, 7]} />
          <meshStandardMaterial color="#2b8a3e" roughness={0.9} flatShading />
        </mesh>
        <mesh position={[0.12, 0.3, 0.08]} castShadow>
          <sphereGeometry args={[0.2, 6, 6]} />
          <meshStandardMaterial color="#37b24d" roughness={0.9} flatShading />
        </mesh>
        <mesh position={[-0.08, 0.32, -0.06]} castShadow>
          <sphereGeometry args={[0.18, 6, 6]} />
          <meshStandardMaterial color="#40c057" roughness={0.9} flatShading />
        </mesh>
        <mesh position={[0, 0.38, 0]} castShadow>
          <sphereGeometry args={[0.14, 5, 5]} />
          <meshStandardMaterial color="#51cf66" roughness={0.9} flatShading />
        </mesh>
        <mesh position={[-0.1, 0.28, 0.15]} castShadow>
          <sphereGeometry args={[0.035, 6, 6]} />
          <meshStandardMaterial color="#e03131" roughness={0.3} />
        </mesh>
        <mesh position={[0.12, 0.34, -0.05]} castShadow>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshStandardMaterial color="#fa5252" roughness={0.3} />
        </mesh>
        <mesh position={[-0.06, 0.4, 0.04]} castShadow>
          <sphereGeometry args={[0.028, 6, 6]} />
          <meshStandardMaterial color="#ff6b6b" roughness={0.3} />
        </mesh>
        <mesh position={[0.08, 0.26, -0.12]} castShadow>
          <sphereGeometry args={[0.032, 6, 6]} />
          <meshStandardMaterial color="#c92a2a" roughness={0.3} />
        </mesh>
        <mesh position={[-0.14, 0.22, -0.08]} castShadow>
          <sphereGeometry args={[0.025, 6, 6]} />
          <meshStandardMaterial color="#e03131" roughness={0.3} />
        </mesh>
        <mesh position={[0.08, 0.2, 0.12]} rotation={[0.3, 0.5, 0]}>
          <boxGeometry args={[0.04, 0.02, 0.04]} />
          <meshStandardMaterial color="#51cf66" roughness={0.8} />
        </mesh>
        <mesh position={[-0.1, 0.18, -0.1]} rotation={[-0.2, -0.3, 0]}>
          <boxGeometry args={[0.04, 0.02, 0.04]} />
          <meshStandardMaterial color="#69db7c" roughness={0.8} />
        </mesh>
      </group>

      {/* ===== ROUTE 1 HIDDEN ITEM SPARKLES ===== */}
      {/* Hidden Potion (1, 16) — sparkling bush */}
      <group position={[1, 0.12, 16]}>
        <mesh>
          <sphereGeometry args={[0.02, 4, 4]} />
          <meshBasicMaterial color="#ffd43b" transparent opacity={0.8} toneMapped={false} />
        </mesh>
        <mesh position={[0.05, 0.03, 0.03]}>
          <sphereGeometry args={[0.015, 4, 4]} />
          <meshBasicMaterial color="#fab005" transparent opacity={0.6} toneMapped={false} />
        </mesh>
      </group>
      {/* Hidden Poké Ball (13, 18) — shiny grass */}
      <group position={[13, 0.1, 18]}>
        <mesh>
          <sphereGeometry args={[0.025, 4, 4]} />
          <meshBasicMaterial color="#fa5252" transparent opacity={0.7} toneMapped={false} />
        </mesh>
      </group>
      {/* Hidden Antidote (4, 22) — sparkle in flowers */}
      <group position={[4, 0.1, 22]}>
        <mesh>
          <sphereGeometry args={[0.02, 4, 4]} />
          <meshBasicMaterial color="#69db7c" transparent opacity={0.8} toneMapped={false} />
        </mesh>
      </group>
      {/* Hidden Super Potion (13, 23) — tree sparkle */}
      <group position={[13, 0.12, 23]}>
        <mesh>
          <sphereGeometry args={[0.02, 4, 4]} />
          <meshBasicMaterial color="#74c0fc" transparent opacity={0.7} toneMapped={false} />
        </mesh>
      </group>

      {/* ===== VIRIDIAN FOREST HIDDEN ITEM SPARKLES ===== */}
      {/* Hidden Poké Ball (10, 26) — hollow log glow */}
      <group position={[10, 0.1, 26]}>
        <mesh>
          <sphereGeometry args={[0.025, 4, 4]} />
          <meshBasicMaterial color="#fa5252" transparent opacity={0.7} toneMapped={false} />
        </mesh>
      </group>
      {/* Hidden Antidote (1, 28) — fern sparkle */}
      <group position={[1, 0.12, 28]}>
        <mesh>
          <sphereGeometry args={[0.02, 4, 4]} />
          <meshBasicMaterial color="#69db7c" transparent opacity={0.8} toneMapped={false} />
        </mesh>
      </group>
      {/* Hidden Great Ball (13, 30) — wall sparkle */}
      <group position={[13, 0.08, 30]}>
        <mesh>
          <sphereGeometry args={[0.025, 4, 4]} />
          <meshBasicMaterial color="#228be6" transparent opacity={0.7} toneMapped={false} />
        </mesh>
      </group>
      {/* Hidden Super Potion (4, 32) — clearing sparkle */}
      <group position={[4, 0.1, 32]}>
        <mesh>
          <sphereGeometry args={[0.02, 4, 4]} />
          <meshBasicMaterial color="#74c0fc" transparent opacity={0.8} toneMapped={false} />
        </mesh>
      </group>
      {/* Hidden Hyper Potion (12, 33) — rare gold sparkle */}
      <group position={[12, 0.15, 33]}>
        <mesh>
          <sphereGeometry args={[0.03, 4, 4]} />
          <meshBasicMaterial color="#ffd700" transparent opacity={0.9} toneMapped={false} />
        </mesh>
        <mesh position={[0.04, 0.04, 0.03]}>
          <sphereGeometry args={[0.02, 4, 4]} />
          <meshBasicMaterial color="#ffec99" transparent opacity={0.6} toneMapped={false} />
        </mesh>
      </group>

      {/* ===== WILD FLOWER FIELD (3, 18) ===== */}
      <group position={[3, 0, 18]}>
        <mesh position={[0, 0.02, 0]} receiveShadow>
          <boxGeometry args={[0.6, 0.04, 0.6]} />
          <meshStandardMaterial color="#5c3e10" roughness={0.9} />
        </mesh>
        <mesh position={[-0.15, 0.1, -0.12]} castShadow>
          <sphereGeometry args={[0.05, 5, 5]} />
          <meshStandardMaterial color="#748ffc" roughness={0.4} />
        </mesh>
        <mesh position={[0.15, 0.12, 0.1]} castShadow>
          <sphereGeometry args={[0.06, 5, 5]} />
          <meshStandardMaterial color="#fcc419" roughness={0.4} />
        </mesh>
        <mesh position={[-0.05, 0.08, 0.15]} castShadow>
          <sphereGeometry args={[0.04, 5, 5]} />
          <meshStandardMaterial color="#748ffc" roughness={0.4} />
        </mesh>
        <mesh position={[0.12, 0.1, -0.08]} castShadow>
          <sphereGeometry args={[0.045, 5, 5]} />
          <meshStandardMaterial color="#fcc419" roughness={0.4} />
        </mesh>
        <mesh position={[-0.1, 0.06, -0.05]} castShadow>
          <cylinderGeometry args={[0.01, 0.01, 0.08, 4]} />
          <meshStandardMaterial color="#51cf66" roughness={0.8} />
        </mesh>
        <mesh position={[0.08, 0.06, 0.05]} castShadow>
          <cylinderGeometry args={[0.01, 0.01, 0.08, 4]} />
          <meshStandardMaterial color="#51cf66" roughness={0.8} />
        </mesh>
      </group>

      {/* ===== WEATHERED TREE STUMP (11, 22) ===== */}
      <group position={[11, 0, 22]}>
        <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.22, 0.28, 0.16, 7]} />
          <meshStandardMaterial color="#6a4c33" roughness={0.9} flatShading />
        </mesh>
        <mesh position={[0, 0.16, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.22, 0.06, 7]} />
          <meshStandardMaterial color="#8c5a3c" roughness={0.9} flatShading />
        </mesh>
        <mesh position={[0.05, 0.19, 0.04]} castShadow>
          <sphereGeometry args={[0.025, 4, 4]} />
          <meshStandardMaterial color="#adb5bd" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.06, 0.22]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.12, 4]} />
          <meshStandardMaterial color="#51cf66" roughness={0.8} />
        </mesh>
        <mesh position={[-0.1, 0.06, 0.16]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.1, 4]} />
          <meshStandardMaterial color="#40c057" roughness={0.8} />
        </mesh>
        {/* Tiny ring markings */}
        <mesh position={[0, 0.08, 0.1]}>
          <torusGeometry args={[0.06, 0.008, 4, 8]} />
          <meshStandardMaterial color="#495057" roughness={0.9} />
        </mesh>
      </group>

      {/* ===== VIRIDIAN FOREST ENTRANCE ARCH (7, 24) ===== */}
      <group position={[7, 0, 24]}>
        {/* Left post */}
        <mesh position={[-0.45, 0.7, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.06, 1.4, 7]} />
          <meshStandardMaterial color="#5c3e10" roughness={0.9} />
        </mesh>
        {/* Right post */}
        <mesh position={[0.45, 0.7, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.06, 1.4, 7]} />
          <meshStandardMaterial color="#5c3e10" roughness={0.9} />
        </mesh>
        {/* Arch top beam */}
        <mesh position={[0, 1.45, 0]} castShadow>
          <boxGeometry args={[1.0, 0.06, 0.08]} />
          <meshStandardMaterial color="#6a4c33" roughness={0.9} />
        </mesh>
        {/* Arch sign board */}
        <mesh position={[0, 1.35, 0.02]} castShadow>
          <boxGeometry args={[0.7, 0.28, 0.04]} />
          <meshStandardMaterial color="#2b8a3e" roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.35, 0.03]}>
          <boxGeometry args={[0.62, 0.2, 0.01]} />
          <meshStandardMaterial color="#e9ecef" roughness={0.3} />
        </mesh>
        {/* Leaf decorations */}
        <mesh position={[-0.35, 0.3, 0.05]} castShadow rotation={[0, 0, 0.3]}>
          <boxGeometry args={[0.08, 0.05, 0.02]} />
          <meshStandardMaterial color="#37b24d" roughness={0.8} />
        </mesh>
        <mesh position={[0.35, 0.3, 0.05]} castShadow rotation={[0, 0, -0.3]}>
          <boxGeometry args={[0.08, 0.05, 0.02]} />
          <meshStandardMaterial color="#2f9e44" roughness={0.8} />
        </mesh>
      </group>

      {/* ===== VIRIDIAN FOREST EXIT MARKER (7, 34) ===== */}
      <group position={[7, 0, 34]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.045, 1.0, 7]} />
          <meshStandardMaterial color="#8c5a3c" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.95, -0.02]} castShadow>
          <boxGeometry args={[0.24, 0.04, 0.06]} />
          <meshStandardMaterial color="#6a4c33" roughness={0.9} />
        </mesh>
        <group position={[0, 1.12, 0.02]}>
          <mesh castShadow>
            <boxGeometry args={[0.2, 0.18, 0.04]} />
            <meshStandardMaterial color="#2b8a3e" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.03, 0.022]}>
            <boxGeometry args={[0.06, 0.05, 0.01]} />
            <meshStandardMaterial color="#f8f9fa" />
          </mesh>
          <mesh position={[0, -0.05, 0.022]}>
            <boxGeometry args={[0.08, 0.04, 0.01]} />
            <meshStandardMaterial color="#f8f9fa" />
          </mesh>
        </group>
      </group>

      {/* ===== FOREST MOSS-COVERED ROCK (2, 27) ===== */}
      <group position={[2, 0, 27]}>
        <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
          <dodecahedronGeometry args={[0.18, 0]} />
          <meshStandardMaterial color="#868e96" roughness={0.9} flatShading />
        </mesh>
        <mesh position={[0.08, 0.12, 0.06]} castShadow>
          <dodecahedronGeometry args={[0.08, 0]} />
          <meshStandardMaterial color="#6c757d" roughness={0.9} flatShading />
        </mesh>
        {/* Moss patches */}
        <mesh position={[-0.05, 0.16, 0.08]}>
          <sphereGeometry args={[0.05, 4, 4]} />
          <meshStandardMaterial color="#40c057" roughness={0.8} />
        </mesh>
        <mesh position={[0.06, 0.14, -0.04]}>
          <sphereGeometry args={[0.035, 4, 4]} />
          <meshStandardMaterial color="#37b24d" roughness={0.8} />
        </mesh>
      </group>

      {/* ===== FOREST FALLEN LOG (12, 29) ===== */}
      <group position={[12, 0, 29]}>
        {/* Main log body */}
        <mesh position={[0, 0.1, 0]} rotation={[0, 0.6, 0.15]} castShadow receiveShadow>
          <cylinderGeometry args={[0.08, 0.12, 0.7, 7]} />
          <meshStandardMaterial color="#6a4c33" roughness={0.9} flatShading />
        </mesh>
        {/* Tiny mushrooms on log */}
        <mesh position={[0.15, 0.16, 0.1]} castShadow>
          <cylinderGeometry args={[0.012, 0.016, 0.04, 5]} />
          <meshStandardMaterial color="#f1f3f5" roughness={0.8} />
        </mesh>
        <mesh position={[0.15, 0.2, 0.1]} castShadow>
          <sphereGeometry args={[0.025, 4, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#f783ac" roughness={0.6} />
        </mesh>
        <mesh position={[0.22, 0.15, 0.06]} castShadow>
          <cylinderGeometry args={[0.01, 0.012, 0.03, 5]} />
          <meshStandardMaterial color="#f1f3f5" roughness={0.8} />
        </mesh>
        <mesh position={[0.22, 0.18, 0.06]} castShadow>
          <sphereGeometry args={[0.018, 4, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#fab005" roughness={0.6} />
        </mesh>
      </group>

      {/* ===== FOREST CLEARING SPRING (8, 32) ===== */}
      <group position={[8, 0, 32]}>
        {/* Stone ring */}
        <mesh position={[0, 0.03, 0]} receiveShadow>
          <torusGeometry args={[0.2, 0.04, 6, 12]} />
          <meshStandardMaterial color="#868e96" roughness={0.9} />
        </mesh>
        {/* Water surface */}
        <mesh position={[0, 0.05, 0]}>
          <circleGeometry args={[0.16, 12]} />
          <meshStandardMaterial color="#4dabf7" transparent opacity={0.7} roughness={0.1} metalness={0.5} />
        </mesh>
        {/* Glowing water center */}
        <mesh position={[0, 0.06, 0]}>
          <circleGeometry args={[0.06, 8]} />
          <meshStandardMaterial color="#a5d8ff" transparent opacity={0.5} />
        </mesh>
        {/* Sparkle effect */}
        <mesh position={[0.04, 0.07, 0.04]}>
          <sphereGeometry args={[0.015, 4, 4]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.0} />
        </mesh>
      </group>

      {/* ===== ANCIENT FOREST ALTAR (2, 33) ===== */}
      <group position={[2, 0, 33]}>
        {/* Base stone */}
        <mesh position={[0, 0.06, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.3, 0.12, 0.3]} />
          <meshStandardMaterial color="#6c757d" roughness={0.9} />
        </mesh>
        {/* Upper stone */}
        <mesh position={[0, 0.18, 0]} castShadow>
          <boxGeometry args={[0.22, 0.1, 0.22]} />
          <meshStandardMaterial color="#adb5bd" roughness={0.8} />
        </mesh>
        {/* Vine patterns */}
        <mesh position={[0.1, 0.18, 0.08]}>
          <cylinderGeometry args={[0.008, 0.008, 0.1, 4]} />
          <meshStandardMaterial color="#2b8a3e" roughness={0.9} />
        </mesh>
        <mesh position={[-0.08, 0.18, -0.1]}>
          <cylinderGeometry args={[0.008, 0.008, 0.08, 4]} />
          <meshStandardMaterial color="#37b24d" roughness={0.9} />
        </mesh>
        {/* Mystical glow */}
        <mesh position={[0, 0.22, 0]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshStandardMaterial color="#51cf66" emissive="#40c057" emissiveIntensity={0.6} />
        </mesh>
      </group>

      {/* HIDDEN BERRY BUSH (14, 9) */}
      <group position={[14, 0, 9]}>
        {/* Dark soil mound base */}
        <mesh position={[0, 0.04, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[0.28, 0.34, 0.08, 8]} />
          <meshStandardMaterial color="#5c3e10" roughness={1.0} />
        </mesh>
        {/* Main bush body - layered spheres for lush look */}
        <mesh position={[0, 0.22, 0]} castShadow>
          <sphereGeometry args={[0.28, 7, 7]} />
          <meshStandardMaterial color="#2b8a3e" roughness={0.9} flatShading />
        </mesh>
        <mesh position={[0.12, 0.3, 0.08]} castShadow>
          <sphereGeometry args={[0.2, 6, 6]} />
          <meshStandardMaterial color="#37b24d" roughness={0.9} flatShading />
        </mesh>
        <mesh position={[-0.08, 0.32, -0.06]} castShadow>
          <sphereGeometry args={[0.18, 6, 6]} />
          <meshStandardMaterial color="#40c057" roughness={0.9} flatShading />
        </mesh>
        <mesh position={[0, 0.38, 0]} castShadow>
          <sphereGeometry args={[0.14, 5, 5]} />
          <meshStandardMaterial color="#51cf66" roughness={0.9} flatShading />
        </mesh>
        {/* Ripe red berries */}
        <mesh position={[-0.1, 0.28, 0.15]} castShadow>
          <sphereGeometry args={[0.035, 6, 6]} />
          <meshStandardMaterial color="#e03131" roughness={0.3} />
        </mesh>
        <mesh position={[0.12, 0.34, -0.05]} castShadow>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshStandardMaterial color="#fa5252" roughness={0.3} />
        </mesh>
        <mesh position={[-0.06, 0.4, 0.04]} castShadow>
          <sphereGeometry args={[0.028, 6, 6]} />
          <meshStandardMaterial color="#ff6b6b" roughness={0.3} />
        </mesh>
        <mesh position={[0.08, 0.26, -0.12]} castShadow>
          <sphereGeometry args={[0.032, 6, 6]} />
          <meshStandardMaterial color="#c92a2a" roughness={0.3} />
        </mesh>
        <mesh position={[-0.14, 0.22, -0.08]} castShadow>
          <sphereGeometry args={[0.025, 6, 6]} />
          <meshStandardMaterial color="#e03131" roughness={0.3} />
        </mesh>
        {/* Small leaves */}
        <mesh position={[0.08, 0.2, 0.12]} rotation={[0.3, 0.5, 0]}>
          <boxGeometry args={[0.04, 0.02, 0.04]} />
          <meshStandardMaterial color="#51cf66" roughness={0.8} />
        </mesh>
        <mesh position={[-0.1, 0.18, -0.1]} rotation={[-0.2, -0.3, 0]}>
          <boxGeometry args={[0.04, 0.02, 0.04]} />
          <meshStandardMaterial color="#69db7c" roughness={0.8} />
        </mesh>
      </group>

      {/* SCATTERED PATH ROCKS */}
      {/* Rock cluster near lab entrance */}
      <group position={[5.2, 0, 8.2]}>
        <mesh position={[0, 0.04, 0]} castShadow>
          <dodecahedronGeometry args={[0.07, 0]} />
          <meshStandardMaterial color="#868e96" roughness={0.9} flatShading />
        </mesh>
        <mesh position={[0.1, 0.025, 0.06]} castShadow>
          <dodecahedronGeometry args={[0.04, 0]} />
          <meshStandardMaterial color="#6c757d" roughness={0.9} flatShading />
        </mesh>
      </group>
      {/* Rock cluster near lake path */}
      <group position={[5.8, 0, 11.5]}>
        <mesh position={[0, 0.03, 0]} castShadow>
          <dodecahedronGeometry args={[0.05, 0]} />
          <meshStandardMaterial color="#868e96" roughness={0.9} flatShading />
        </mesh>
        <mesh position={[-0.07, 0.02, 0.04]} castShadow>
          <dodecahedronGeometry args={[0.035, 0]} />
          <meshStandardMaterial color="#adb5bd" roughness={0.9} flatShading />
        </mesh>
      </group>
      {/* Rock near forest edge */}
      <group position={[13.5, 0, 2.5]}>
        <mesh position={[0, 0.035, 0]} castShadow>
          <dodecahedronGeometry args={[0.06, 0]} />
          <meshStandardMaterial color="#868e96" roughness={0.9} flatShading />
        </mesh>
      </group>

      {/* MUSHROOMS */}
      {/* Mushroom cluster near Red's house */}
      <group position={[4.5, 0, 2.5]}>
        {/* Mushroom 1 */}
        <mesh position={[0, 0.03, 0]} castShadow>
          <cylinderGeometry args={[0.015, 0.02, 0.06, 6]} />
          <meshStandardMaterial color="#f1f3f5" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.07, 0]} castShadow>
          <sphereGeometry args={[0.04, 5, 5, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#f783ac" roughness={0.6} />
        </mesh>
        {/* Mushroom 2 */}
        <mesh position={[0.08, 0.02, 0.06]} castShadow>
          <cylinderGeometry args={[0.012, 0.016, 0.04, 6]} />
          <meshStandardMaterial color="#f1f3f5" roughness={0.8} />
        </mesh>
        <mesh position={[0.08, 0.055, 0.06]} castShadow>
          <sphereGeometry args={[0.03, 5, 5, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#fab005" roughness={0.6} />
        </mesh>
      </group>
      {/* Mushroom near forest trees */}
      <group position={[0.8, 0, 12.5]}>
        <mesh position={[0, 0.025, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.018, 0.05, 6]} />
          <meshStandardMaterial color="#f1f3f5" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.06, 0]} castShadow>
          <sphereGeometry args={[0.035, 5, 5, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#7950f2" roughness={0.6} /> {/* Purple glowshroom */}
        </mesh>
      </group>

      {/* WOODEN BENCH near the Route 1 path */}
      <group position={[6.5, 0.01, 11.5]}>
        {/* Seat plank */}
        <mesh position={[0, 0.28, 0]} castShadow>
          <boxGeometry args={[0.45, 0.04, 0.14]} />
          <meshStandardMaterial color="#8c5a3c" roughness={0.9} />
        </mesh>
        {/* Back rest */}
        <mesh position={[0, 0.42, -0.07]} castShadow>
          <boxGeometry args={[0.4, 0.18, 0.03]} />
          <meshStandardMaterial color="#7a4a2c" roughness={0.9} />
        </mesh>
        {/* Left leg */}
        <mesh position={[-0.16, 0.13, 0]} castShadow>
          <boxGeometry args={[0.04, 0.26, 0.04]} />
          <meshStandardMaterial color="#5c3e10" roughness={0.9} />
        </mesh>
        {/* Right leg */}
        <mesh position={[0.16, 0.13, 0]} castShadow>
          <boxGeometry args={[0.04, 0.26, 0.04]} />
          <meshStandardMaterial color="#5c3e10" roughness={0.9} />
        </mesh>
        {/* Cross brace */}
        <mesh position={[0, 0.12, 0]} castShadow>
          <boxGeometry args={[0.36, 0.02, 0.02]} />
          <meshStandardMaterial color="#5c3e10" roughness={0.9} />
        </mesh>
      </group>

      {/* SMALL GRAVESTONE MEMORIAL near the east trees */}
      <group position={[13.2, 0, 11.5]}>
        <mesh position={[0, 0.18, 0]} castShadow>
          <boxGeometry args={[0.16, 0.32, 0.08]} />
          <meshStandardMaterial color="#adb5bd" roughness={0.7} />
        </mesh>
        {/* Rounded top */}
        <mesh position={[0, 0.34, 0]} castShadow>
          <sphereGeometry args={[0.08, 6, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#ced4da" roughness={0.7} />
        </mesh>
        {/* Simple epitaph engraving */}
        <mesh position={[0, 0.18, 0.041]}>
          <boxGeometry args={[0.06, 0.03, 0.01]} />
          <meshStandardMaterial color="#495057" />
        </mesh>
      </group>

      {/* POKÉMON CENTER (left side of town at (1,7)-(3,9)) */}
      <group position={[2, 0, 8]}>
        {/* Foundation */}
        <mesh position={[0, 0.1, 0]} receiveShadow>
          <boxGeometry args={[3.2, 0.2, 3.2]} />
          <meshStandardMaterial color="#495057" roughness={0.9} />
        </mesh>
        {/* White walls */}
        <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.0, 2.2, 3.0]} />
          <meshStandardMaterial color="#f8f9fa" roughness={0.6} />
        </mesh>
        {/* Red roof stripe */}
        <mesh position={[0, 2.35, 0]} castShadow>
          <boxGeometry args={[3.2, 0.15, 3.2]} />
          <meshStandardMaterial color="#e03131" roughness={0.5} />
        </mesh>
        {/* Flat roof top */}
        <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.0, 0.12, 3.0]} />
          <meshStandardMaterial color="#dee2e6" roughness={0.4} />
        </mesh>
        {/* Poké Ball symbol on roof */}
        <mesh position={[0, 2.56, 0]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#e03131" roughness={0.3} />
        </mesh>
        <mesh position={[0, 2.56, 0]}>
          <sphereGeometry args={[0.06, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#f8f9fa" roughness={0.3} />
        </mesh>
        {/* Front door with glass */}
        <mesh position={[0, 0.6, 1.51]} castShadow>
          <boxGeometry args={[0.6, 1.2, 0.05]} />
          <meshStandardMaterial color="#74c0fc" transparent opacity={0.5} roughness={0.1} metalness={0.5} />
        </mesh>
        {/* Door frame */}
        <mesh position={[0, 0.6, 1.51]}>
          <boxGeometry args={[0.65, 1.25, 0.03]} />
          <meshStandardMaterial color="#343a40" />
        </mesh>
        {/* Center sign */}
        <mesh position={[0, 1.9, 1.51]}>
          <boxGeometry args={[1.0, 0.3, 0.06]} />
          <meshStandardMaterial color="#e03131" roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.9, 1.53]}>
          <boxGeometry args={[0.9, 0.22, 0.02]} />
          <meshStandardMaterial color="#f8f9fa" />
        </mesh>
        {/* Windows */}
        <mesh position={[-0.8, 1.2, 1.51]}>
          <boxGeometry args={[0.45, 0.45, 0.04]} />
          <meshStandardMaterial color="#74c0fc" transparent opacity={0.6} roughness={0.1} />
        </mesh>
        <mesh position={[0.8, 1.2, 1.51]}>
          <boxGeometry args={[0.45, 0.45, 0.04]} />
          <meshStandardMaterial color="#74c0fc" transparent opacity={0.6} roughness={0.1} />
        </mesh>
        {/* Window frames */}
        <mesh position={[-0.8, 1.2, 1.52]}>
          <boxGeometry args={[0.48, 0.48, 0.02]} />
          <meshStandardMaterial color="#343a40" />
        </mesh>
        <mesh position={[0.8, 1.2, 1.52]}>
          <boxGeometry args={[0.48, 0.48, 0.02]} />
          <meshStandardMaterial color="#343a40" />
        </mesh>
        {/* Side entrance ramp */}
        <mesh position={[0, 0.04, 1.85]} receiveShadow>
          <boxGeometry args={[0.8, 0.08, 0.5]} />
          <meshStandardMaterial color="#868e96" roughness={0.8} />
        </mesh>
        {/* Nurse Joy's healing machine (visible through window) */}
        <mesh position={[-0.5, 0.4, -1.45]}>
          <boxGeometry args={[0.3, 0.3, 0.05]} />
          <meshStandardMaterial color="#40c057" emissive="#40c057" emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* POKÉ MART (right side of town at (11,7)-(13,9)) */}
      <group position={[12, 0, 8]}>
        {/* Foundation */}
        <mesh position={[0, 0.1, 0]} receiveShadow>
          <boxGeometry args={[3.2, 0.2, 3.2]} />
          <meshStandardMaterial color="#495057" roughness={0.9} />
        </mesh>
        {/* Blue walls */}
        <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.0, 2.2, 3.0]} />
          <meshStandardMaterial color="#e7f5ff" roughness={0.6} />
        </mesh>
        {/* Blue roof stripe */}
        <mesh position={[0, 2.35, 0]} castShadow>
          <boxGeometry args={[3.2, 0.15, 3.2]} />
          <meshStandardMaterial color="#1c7ed6" roughness={0.5} />
        </mesh>
        {/* Flat roof top */}
        <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.0, 0.12, 3.0]} />
          <meshStandardMaterial color="#dee2e6" roughness={0.4} />
        </mesh>
        {/* Front door */}
        <mesh position={[0, 0.6, 1.51]} castShadow>
          <boxGeometry args={[0.6, 1.2, 0.05]} />
          <meshStandardMaterial color="#74c0fc" transparent opacity={0.5} roughness={0.1} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.6, 1.51]}>
          <boxGeometry args={[0.65, 1.25, 0.03]} />
          <meshStandardMaterial color="#343a40" />
        </mesh>
        {/* MART sign */}
        <mesh position={[0, 1.9, 1.51]}>
          <boxGeometry args={[1.0, 0.3, 0.06]} />
          <meshStandardMaterial color="#1c7ed6" roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.9, 1.53]}>
          <boxGeometry args={[0.9, 0.22, 0.02]} />
          <meshStandardMaterial color="#f8f9fa" />
        </mesh>
        {/* Windows */}
        <mesh position={[-0.8, 1.2, 1.51]}>
          <boxGeometry args={[0.45, 0.45, 0.04]} />
          <meshStandardMaterial color="#74c0fc" transparent opacity={0.6} roughness={0.1} />
        </mesh>
        <mesh position={[0.8, 1.2, 1.51]}>
          <boxGeometry args={[0.45, 0.45, 0.04]} />
          <meshStandardMaterial color="#74c0fc" transparent opacity={0.6} roughness={0.1} />
        </mesh>
        {/* Window frames */}
        <mesh position={[-0.8, 1.2, 1.52]}>
          <boxGeometry args={[0.48, 0.48, 0.02]} />
          <meshStandardMaterial color="#343a40" />
        </mesh>
        <mesh position={[0.8, 1.2, 1.52]}>
          <boxGeometry args={[0.48, 0.48, 0.02]} />
          <meshStandardMaterial color="#343a40" />
        </mesh>
        {/* Awning */}
        <mesh position={[0, 1.55, 1.51]}>
          <boxGeometry args={[1.6, 0.06, 0.3]} />
          <meshStandardMaterial color="#1c7ed6" roughness={0.5} />
        </mesh>
        {/* Side entrance */}
        <mesh position={[0, 0.04, 1.85]} receiveShadow>
          <boxGeometry args={[0.8, 0.08, 0.5]} />
          <meshStandardMaterial color="#868e96" roughness={0.8} />
        </mesh>
        {/* Display shelves inside */}
        <mesh position={[0.6, 0.3, -1.45]}>
          <boxGeometry args={[0.4, 0.6, 0.1]} />
          <meshStandardMaterial color="#adb5bd" roughness={0.6} />
        </mesh>
        <mesh position={[-0.6, 0.3, -1.45]}>
          <boxGeometry args={[0.4, 0.6, 0.1]} />
          <meshStandardMaterial color="#adb5bd" roughness={0.6} />
        </mesh>
      </group>

      {/* HIGH-FIDELITY ACTIVE GRASS WALK LEAF PARTICLES POOL */}
      <group ref={leafParticlesGroupRef}>
        {Array.from({ length: 24 }).map((_, i) => (
          <mesh key={`leaf-p-${i}`} castShadow visible={false}>
            <boxGeometry args={[0.08, 0.08, 0.02]} />
            <meshStandardMaterial color="#40c057" roughness={0.8} />
          </mesh>
        ))}
      </group>

    </group>
  );
}
