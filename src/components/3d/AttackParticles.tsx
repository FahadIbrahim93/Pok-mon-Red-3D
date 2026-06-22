import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh } from 'three';

interface AttackParticlesProps {
  type: string;
  active: boolean;
  intensity?: number;
}

interface ParticleData {
  position: [number, number, number];
  velocity: [number, number, number];
  size: number;
  rotSpeed: number;
  color: string;
  life: number;
  maxLife: number;
  phase: number;
}

function getTypeColors(moveType: string): string[] {
  const mt = moveType.toUpperCase();
  const palette: Record<string, string[]> = {
    FIRE: ['#ff1744', '#ff6d00', '#ffab00', '#ffd600', '#ff3d00'],
    WATER: ['#2979ff', '#00b0ff', '#00e5ff', '#18ffff', '#4080ff'],
    GRASS: ['#00e676', '#69f0ae', '#76ff03', '#00c853', '#2eb82e'],
    ELECTRIC: ['#ffea00', '#ffd600', '#ffff00', '#ffc107', '#fff350'],
    ICE: ['#80deea', '#18ffff', '#b2ebf2', '#00bcd4', '#e0f7fa'],
    FIGHTING: ['#d50000', '#ff6d00', '#bf360c', '#e53935', '#ff8a65'],
    POISON: ['#e040fb', '#d500f9', '#aa00ff', '#7c4dff', '#ea80fc'],
    GROUND: ['#8d6e63', '#a1887f', '#6d4c41', '#d7ccc8', '#bcaaa4'],
    FLYING: ['#90caf9', '#b3e5fc', '#e1f5fe', '#81d4fa', '#bbdefb'],
    PSYCHIC: ['#f50057', '#c51162', '#ff4081', '#f06292', '#e91e63'],
    BUG: ['#76ff03', '#aeea00', '#64dd17', '#c6ff00', '#9ccc65'],
    ROCK: ['#795548', '#8d6e63', '#a1887f', '#5d4037', '#bcaaa4'],
    GHOST: ['#7c4dff', '#b388ff', '#9575cd', '#651fff', '#d1c4e9'],
    DRAGON: ['#651fff', '#7c4dff', '#b388ff', '#536dfe', '#304ffe'],
    NORMAL: ['#cfd8dc', '#eeeeee', '#b0bec5', '#ffffff', '#90a4ae'],
  };
  const colors = palette[mt] || palette.NORMAL;
  return colors;
}

function createBurstPattern(
  type: string,
  count: number,
  spread: number
): ParticleData[] {
  const particles: ParticleData[] = [];
  const colors = getTypeColors(type);
  const mt = type.toUpperCase();

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    const speed = 0.8 + Math.random() * spread;

    // Fire: upward burst pattern
    let vx = Math.sin(phi) * Math.cos(theta) * speed;
    let vy = Math.sin(phi) * Math.sin(theta) * speed;
    let vz = Math.cos(phi) * speed;

    if (mt === 'FIRE') {
      vy = Math.abs(vy) * 1.5 + 0.5;
      vx *= 0.6;
      vz *= 0.6;
    } else if (mt === 'WATER') {
      vy *= 0.5;
      vx *= 1.2;
      vz *= 1.2;
    } else if (mt === 'ELECTRIC') {
      vx = (Math.random() - 0.5) * 3;
      vy = (Math.random() - 0.5) * 3;
      vz = (Math.random() - 0.5) * 3;
    } else if (mt === 'ICE') {
      vx *= 1.5;
      vy = Math.abs(vy) * 0.8;
      vz *= 1.5;
    } else if (mt === 'PSYCHIC') {
      vx *= 2;
      vy *= 2;
      vz *= 2;
    }

    particles.push({
      position: [(Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2],
      velocity: [vx, vy, vz],
      size: 0.03 + Math.random() * 0.12,
      rotSpeed: (Math.random() - 0.5) * 12,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 0,
      maxLife: 0.4 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
    });
  }
  return particles;
}

export function AttackParticles({ type, active, intensity = 1.0 }: AttackParticlesProps) {
  const groupRef = useRef<Group>(null);
  const timeRef = useRef(0);
  const count = Math.floor(28 * intensity);

  const particles = useMemo(() => createBurstPattern(type, Math.max(12, count), 2.0), [type, count]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.05);
    timeRef.current += dt;

    const children = groupRef.current.children;

    if (!active) {
      groupRef.current.position.set(0, -999, 0);
      return;
    }
    groupRef.current.position.set(0, 0.45, 0.2);

    const time = timeRef.current;
    const mt = type.toUpperCase();

    for (let i = 0; i < children.length; i++) {
      const mesh = children[i] as Mesh;
      const data = particles[i];
      if (!mesh || !data) continue;

      data.life += dt;
      if (data.life >= data.maxLife) {
        // Reset particle for continuous effect
        data.life = 0;
        const theta = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 1.5;
        const phi = Math.acos(Math.random() * 2 - 1);
        data.velocity = [
          Math.sin(phi) * Math.cos(theta) * speed,
          Math.sin(phi) * Math.sin(theta) * speed + 0.5,
          Math.cos(phi) * speed
        ];
        data.position = [
          (Math.random() - 0.5) * 0.15,
          (Math.random() - 0.5) * 0.15,
          (Math.random() - 0.5) * 0.15
        ];
        mesh.position.set(...data.position);
        continue; // Skip movement on reset frame
      }

      const lifeRatio = 1 - data.life / data.maxLife;
      const decay = Math.max(0, lifeRatio);

      // Type-specific movement
      const vx = data.velocity[0];
      const vy = data.velocity[1];
      const vz = data.velocity[2];

      switch (mt) {
        case 'FIRE':
          // Fire: upward draft with flicker
          mesh.position.x += (vx + Math.sin(time * 12 + data.phase) * 0.3) * dt * 1.2;
          mesh.position.y += (Math.abs(vy) * 1.5 + Math.sin(time * 8 + data.phase) * 0.2) * dt * 1.5;
          mesh.position.z += (vz + Math.cos(time * 10 + data.phase) * 0.3) * dt * 1.2;
          mesh.scale.setScalar(data.size * (0.5 + Math.abs(Math.sin(time * 20 + data.phase)) * 0.5) * decay);
          break;

        case 'WATER':
          // Water: downward spray with bubble wobble
          mesh.position.x += (vx + Math.sin(time * 5 + data.phase) * 0.5) * dt * 1.5;
          mesh.position.y += (vy - 0.8) * dt * 1.2;
          mesh.position.z += (vz + Math.cos(time * 5 + data.phase) * 0.5) * dt * 1.5;
          mesh.scale.setScalar(data.size * (0.6 + Math.sin(time * 4 + data.phase) * 0.4) * decay);
          break;

        case 'ELECTRIC':
          // Electric: chaotic zigzag, bright flashes
          mesh.position.x = data.position[0] + vx * 0.25 * Math.sin(time * 22 + data.phase + i);
          mesh.position.y = data.position[1] + vy * 0.25 * Math.cos(time * 22 + data.phase + i * 0.7);
          mesh.position.z = data.position[2] + vz * 0.25 * Math.sin(time * 18 + data.phase + i * 1.3);
          const flash = Math.sin(time * 30 + data.phase + i * 2) > 0.3 ? 1 : 0.1;
          mesh.scale.setScalar(data.size * flash * 1.3 * (0.3 + decay * 0.7));
          break;

        case 'ICE':
          // Ice: sharp shards that slow down
          mesh.position.x += vx * dt * 1.8;
          mesh.position.y += vy * dt * 0.6;
          mesh.position.z += vz * dt * 1.8;
          mesh.rotation.x += data.rotSpeed * dt;
          mesh.rotation.z += data.rotSpeed * dt * 0.5;
          mesh.scale.setScalar(data.size * (0.4 + Math.sin(time * 3 + data.phase) * 0.3) * decay);
          break;

        case 'PSYCHIC':
          // Psychic: swirling spiral pattern
          const angle = time * 2 + data.phase;
          mesh.position.x = vx * 0.15 * Math.cos(angle + i * 0.5) * decay;
          mesh.position.y = vy * 0.15 * Math.sin(angle * 1.3 + i * 0.3) * decay + 0.3 * decay;
          mesh.position.z = vz * 0.15 * Math.cos(angle * 0.7 + i * 0.8) * decay;
          mesh.scale.setScalar(data.size * (0.5 + Math.sin(time * 6 + data.phase) * 0.5) * decay);
          break;

        case 'GHOST':
          // Ghost: dark wisps that fade in and out
          mesh.position.x += (vx * 0.5 + Math.sin(time * 3 + data.phase) * 0.2) * dt;
          mesh.position.y += (vy * 0.3 + Math.cos(time * 2 + data.phase) * 0.1) * dt;
          mesh.position.z += (vz * 0.5 + Math.sin(time * 3 + data.phase * 1.3) * 0.2) * dt;
          const ghostFlash = Math.abs(Math.sin(time * 2 + data.phase + i));
          mesh.scale.setScalar(data.size * (0.2 + ghostFlash * 0.8) * decay);
          break;

        case 'DRAGON':
          // Dragon: powerful, explosive burst
          mesh.position.x += (vx * 2 + Math.sin(time * 8 + data.phase) * 0.4) * dt;
          mesh.position.y += (Math.abs(vy) * 1.2 + Math.sin(time * 6 + data.phase) * 0.3) * dt;
          mesh.position.z += (vz * 2 + Math.cos(time * 8 + data.phase) * 0.4) * dt;
          mesh.scale.setScalar(data.size * (0.8 + Math.sin(time * 10 + data.phase) * 0.2) * decay);
          break;

        case 'FIGHTING':
          // Fighting: heavy impact-style burst
          mesh.position.x += (vx * 1.8 + Math.sin(time * 10 + data.phase) * 0.15) * dt;
          mesh.position.y += vy * 1.0 * dt;
          mesh.position.z += (vz * 1.8 + Math.cos(time * 10 + data.phase) * 0.15) * dt;
          mesh.scale.setScalar(data.size * Math.max(0, 1.0 - data.life / data.maxLife * 1.2) * 2);
          break;

        default:
          // Normal/Ground/Bug/Flying/Poison
          mesh.position.x += vx * dt * 1.4;
          mesh.position.y += vy * dt * 1.4;
          mesh.position.z += vz * dt * 1.4;
          const dist = Math.sqrt(
            mesh.position.x ** 2 + mesh.position.y ** 2 + mesh.position.z ** 2
          );
          mesh.scale.setScalar(Math.max(0, data.size * (1.8 - dist * 1.5)) * decay);
          break;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {particles.map((p, idx) => (
        <mesh key={idx} position={p.position}>
          {type === 'ELECTRIC' ? (
            <boxGeometry args={[0.015, 0.12, 0.015]} />
          ) : type === 'ICE' ? (
            <coneGeometry args={[0.04, 0.1, 4]} />
          ) : type === 'GRASS' ? (
            <coneGeometry args={[0.05, 0.12, 4]} />
          ) : type === 'FIRE' ? (
            <sphereGeometry args={[1, 5, 5]} />
          ) : type === 'GHOST' ? (
            <sphereGeometry args={[1, 6, 6]} />
          ) : (
            <sphereGeometry args={[1, 4, 4]} />
          )}
          <meshStandardMaterial
            color={p.color}
            emissive={p.color}
            emissiveIntensity={2.0}
            roughness={0.15}
            metalness={type === 'ELECTRIC' || type === 'ICE' ? 0.5 : 0}
            transparent
            opacity={0.9}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
