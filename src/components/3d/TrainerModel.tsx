import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh } from 'three';

interface TrainerModelProps {
  role: 'OAK' | 'RIVAL' | 'TRAINER' | 'GIRL' | 'MASCAL_PIKA';
  heading?: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  scale?: number;
  state?: 'IDLE' | 'WALK';
}

export function TrainerModel({ role, heading = 'DOWN', scale = 1.0, state = 'IDLE' }: TrainerModelProps) {
  const groupRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);
  const bodyRef = useRef<Group>(null);
  const leftLegRef = useRef<Group>(null);
  const rightLegRef = useRef<Group>(null);

  useFrame((stateObj) => {
    if (!groupRef.current) return;
    const time = stateObj.clock.getElapsedTime();

    // Gentle life-like idle breathing animation
    if (headRef.current) {
      headRef.current.position.y = 0.42 + Math.sin(time * 2.0) * 0.008;
      headRef.current.rotation.y = Math.sin(time * 1.2) * 0.04;
    }
    if (bodyRef.current) {
      bodyRef.current.scale.set(
        1.0, 
        1.0 + Math.sin(time * 2.0) * 0.005, 
        1.0
      );
    }

    // Walking leg animation cycle
    if (state === 'WALK') {
      const swingAngle = Math.sin(time * 10) * 0.42;
      if (leftLegRef.current) leftLegRef.current.rotation.x = swingAngle;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -swingAngle;
    } else {
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
    }
  });

  // Calculate rotation based on heading direction
  let rotY = 0;
  if (heading === 'DOWN') rotY = 0;
  if (heading === 'LEFT') rotY = -Math.PI / 2;
  if (heading === 'UP') rotY = Math.PI;
  if (heading === 'RIGHT') rotY = Math.PI / 2;

  // Custom colors and meshes per trainer classification
  const coatColor = role === 'OAK' ? '#f1f3f5' : role === 'RIVAL' ? '#7950f2' : role === 'TRAINER' ? '#2b8a3e' : '#f783ac';
  const shirtColor = role === 'OAK' ? '#c92a2a' : role === 'RIVAL' ? '#1a1b1e' : '#15aabf';
  const pantsColor = role === 'OAK' ? '#495057' : role === 'RIVAL' ? '#fcc419' : '#1971c2';
  const hairColor = role === 'OAK' ? '#ced4da' : role === 'RIVAL' ? '#d9480f' : '#495057';

  return (
    <group ref={groupRef} scale={[scale, scale, scale]} rotation={[0, rotY, 0]}>
      
      {/* Human Skeleton Anchor Group */}
      <group ref={bodyRef} position={[0, 0.5, 0]}>
        
        {/* Main Torso */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.42, 0.54, 0.28]} />
          <meshStandardMaterial color={coatColor} roughness={0.7} />
        </mesh>

        {/* Oak research coat lapel undershirt */}
        {role === 'OAK' && (
          <mesh position={[0, 0.05, 0.15]} castShadow>
            <boxGeometry args={[0.18, 0.4, 0.03]} />
            <meshStandardMaterial color={shirtColor} />
          </mesh>
        )}

        {/* Character Stylized Head */}
        <group ref={headRef} position={[0, 0.42, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.36, 0.36, 0.36]} />
            <meshStandardMaterial color="#ffd8a8" roughness={0.8} />
          </mesh>

          {/* Hair block */}
          <mesh position={[0, 0.14, -0.06]} castShadow>
            <boxGeometry args={[0.38, 0.16, 0.38]} />
            <meshStandardMaterial color={hairColor} roughness={0.9} />
          </mesh>

          {/* RIVAL spiky hair crowns */}
          {role === 'RIVAL' && (
            <mesh position={[0.08, 0.22, -0.08]} rotation={[0.4, 0.4, 0]} castShadow>
              <coneGeometry args={[0.1, 0.18, 4]} />
              <meshStandardMaterial color={hairColor} />
            </mesh>
          )}

          {/* Eyes */}
          <group position={[0, 0.02, 0.19]}>
            <mesh position={[-0.09, 0, 0]}>
              <boxGeometry args={[0.05, 0.1, 0.01]} />
              <meshStandardMaterial color="#212529" />
            </mesh>
            <mesh position={[0.09, 0, 0]}>
              <boxGeometry args={[0.05, 0.1, 0.01]} />
              <meshStandardMaterial color="#212529" />
            </mesh>
          </group>
        </group>

        {/* Left Leg */}
        <group ref={leftLegRef} position={[-0.12, -0.24, 0]}>
          <mesh position={[0, -0.12, 0]} castShadow>
            <boxGeometry args={[0.14, 0.24, 0.16]} />
            <meshStandardMaterial color={pantsColor} roughness={0.8} />
          </mesh>
        </group>

        {/* Right Leg */}
        <group ref={rightLegRef} position={[0.12, -0.24, 0]}>
          <mesh position={[0, -0.12, 0]} castShadow>
            <boxGeometry args={[0.14, 0.24, 0.16]} />
            <meshStandardMaterial color={pantsColor} roughness={0.8} />
          </mesh>
        </group>

      </group>

      {/* Circle shadow base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.34, 16]} />
        <meshBasicMaterial color="#212529" opacity={0.3} transparent />
      </mesh>
    </group>
  );
}
