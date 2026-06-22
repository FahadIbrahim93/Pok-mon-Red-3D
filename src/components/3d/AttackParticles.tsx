import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh } from 'three';

interface AttackParticlesProps {
  type: string;
  active: boolean;
}

interface ParticleData {
  position: [number, number, number];
  velocity: [number, number, number];
  size: number;
  rotSpeed: number;
  color: string;
}

export function AttackParticles({ type, active }: AttackParticlesProps) {
  const groupRef = useRef<Group>(null);
  
  const particleCount = 28;
  const particles = useMemo(() => {
    const list: ParticleData[] = [];
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const speed = 0.5 + Math.random() * 1.5;
      
      list.push({
        position: [
          (Math.random() - 0.5) * 0.15,
          (Math.random() - 0.5) * 0.15,
          (Math.random() - 0.5) * 0.15
        ],
        velocity: [
          Math.sin(phi) * Math.cos(theta) * speed,
          Math.sin(phi) * Math.sin(theta) * speed,
          Math.cos(phi) * speed
        ],
        size: 0.05 + Math.random() * 0.08,
        rotSpeed: (Math.random() - 0.5) * 6,
        color: getRandomColor(type)
      });
    }
    return list;
  }, [type]);

  function getRandomColor(moveType: string): string {
    const mt = moveType.toUpperCase();
    const colors: Record<string, string[]> = {
      FIRE: ['#ff4d4d', '#ff944d', '#ffea4d', '#ff761a'],
      WATER: ['#3399ff', '#33ffff', '#80ccff', '#1a75ff'],
      GRASS: ['#33cc33', '#99ff33', '#2eb82e', '#8cd91a'],
      BUG: ['#99cc33', '#ccff33', '#739926', '#b3ff66'],
      ELECTRIC: ['#ffff33', '#ffcc00', '#ffea66', '#ffff99'],
      FLYING: ['#e6f2ff', '#b3d9ff', '#80c0ff', '#ffffff'],
      POISON: ['#cc33ff', '#df80ff', '#9900cc', '#e600e6'],
      NORMAL: ['#e6e6e6', '#c8c8c8', '#ffffff', '#ffd700']
    };
    const cList = colors[mt] || colors.NORMAL;
    return cList[Math.floor(Math.random() * cList.length)];
  }

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    const children = groupRef.current.children;
    
    if (!active) {
      groupRef.current.position.set(0, -999, 0);
      return;
    } else {
      groupRef.current.position.set(0, 0.4, 0.15);
    }

    const time = state.clock.getElapsedTime();

    for (let i = 0; i < children.length; i++) {
      const mesh = children[i] as Mesh;
      const data = particles[i];
      if (!mesh || !data) continue;

      const mt = type.toUpperCase();
      if (mt === 'FIRE') {
        mesh.position.x += data.velocity[0] * delta * 0.7;
        mesh.position.y += Math.abs(data.velocity[1]) * delta * 1.6;
        mesh.position.z += data.velocity[2] * delta * 0.7;
        
        const scale = Math.max(0, data.size * (1.2 - mesh.position.y * 0.5));
        mesh.scale.setScalar(scale);
      } else if (mt === 'WATER') {
        mesh.position.x += (data.velocity[0] + Math.sin(time * 6 + i) * 0.6) * delta;
        mesh.position.y += (data.velocity[1] - 0.4) * delta;
        mesh.position.z += data.velocity[2] * delta;
        mesh.scale.setScalar(data.size);
      } else if (mt === 'GRASS') {
        mesh.position.x += (data.velocity[0] + Math.cos(time * 4 + i) * 0.9) * delta;
        mesh.position.y += data.velocity[1] * delta;
        mesh.position.z += (data.velocity[2] + Math.sin(time * 4 + i) * 0.9) * delta;
        mesh.rotation.x += data.rotSpeed * delta;
        mesh.rotation.y += data.rotSpeed * delta;
        mesh.scale.setScalar(data.size);
      } else if (mt === 'ELECTRIC') {
        mesh.position.x = data.position[0] + data.velocity[0] * 0.35 * Math.sin(time * 24 + i);
        mesh.position.y = data.position[1] + data.velocity[1] * 0.35 * Math.cos(time * 24 + i);
        mesh.position.z = data.position[2] + data.velocity[2] * 0.35 * Math.sin(time * 18 + i);
        mesh.scale.setScalar((Math.sin(time * 35 + i) > 0 ? 1 : 0) * data.size * 1.6);
      } else if (mt === 'FLYING') {
        mesh.position.x += data.velocity[0] * delta * 2.2;
        mesh.position.y += (data.velocity[1] * 0.25) * delta;
        mesh.position.z += data.velocity[2] * delta;
        mesh.scale.setScalar(data.size);
      } else {
        mesh.position.x += data.velocity[0] * delta * 1.4;
        mesh.position.y += data.velocity[1] * delta * 1.4;
        mesh.position.z += data.velocity[2] * delta * 1.4;
        
        const dist = Math.sqrt(mesh.position.x ** 2 + mesh.position.y ** 2 + mesh.position.z ** 2);
        const scale = Math.max(0, data.size * (1.3 - dist));
        mesh.scale.setScalar(scale);
      }
    }
  });

  return (
    <group ref={groupRef}>
      {particles.map((p, idx) => (
        <mesh key={idx} position={p.position}>
          {type === 'GRASS' ? (
            <coneGeometry args={[0.05, 0.1, 4]} />
          ) : type === 'ELECTRIC' ? (
            <boxGeometry args={[0.015, 0.1, 0.015]} />
          ) : (
            <sphereGeometry args={[1, 4, 4]} />
          )}
          <meshStandardMaterial 
            color={p.color} 
            emissive={p.color} 
            emissiveIntensity={1.3} 
            roughness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}
