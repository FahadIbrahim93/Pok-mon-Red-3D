import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import { useGameStore } from '../../store/gameStore';
import { mapGrid, MAP_HEIGHT, MAP_WIDTH, TileType } from '../../game/MapData';
import { Group, Vector3 } from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { Navigation, Compass, Plus, Minus } from 'lucide-react';

function MinimapScene({ zoomLevel }: { zoomLevel: number }) {
  const position = useGameStore((state) => state.position);
  const targetPosition = useGameStore((state) => state.targetPosition);
  const isMoving = useGameStore((state) => state.isMoving);
  const facing = useGameStore((state) => state.facing);

  const playerRef = useRef<Group>(null);

  // Maintain local player position vector for smooth lerping
  const currentPos = useMemo(() => new Vector3(position[0], 0.1, position[1]), []);

  // Simplified and optimized map database calculations
  const tiles = useMemo(() => {
    const list = [];
    for (let z = 0; z < MAP_HEIGHT; z++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        list.push({ x, z, type: mapGrid[z][x] });
      }
    }
    return list;
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const speed = 5.0; // matches player's MOVE_SPEED

    // Move player visual marker smoothly to match 3D world state
    if (isMoving) {
      const [tx, tz] = targetPosition;
      
      if (Math.abs(currentPos.x - tx) > 0.02) {
        currentPos.x += Math.sign(tx - currentPos.x) * speed * dt;
      } else {
        currentPos.x = tx;
      }

      if (Math.abs(currentPos.z - tz) > 0.02) {
        currentPos.z += Math.sign(tz - currentPos.z) * speed * dt;
      } else {
        currentPos.z = tz;
      }
    } else {
      currentPos.set(position[0], 0.1, position[1]);
    }

    // Apply translation to player marker
    if (playerRef.current) {
      playerRef.current.position.copy(currentPos);

      // Rotate player indicator seamlessly based on current direction
      let targetRotY = 0;
      if (facing === 'DOWN') targetRotY = 0;
      if (facing === 'LEFT') targetRotY = -Math.PI / 2;
      if (facing === 'UP') targetRotY = Math.PI;
      if (facing === 'RIGHT') targetRotY = Math.PI / 2;

      let diff = targetRotY - playerRef.current.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      playerRef.current.rotation.y += diff * 15 * dt;
    }

    // Lock orthographic camera to track and peek centered at player position
    const cam = state.camera;
    if (cam) {
      cam.position.x += (currentPos.x - cam.position.x) * 0.15;
      cam.position.z += (currentPos.z - cam.position.z) * 0.15;
      cam.lookAt(cam.position.x, 0, cam.position.z);
    }
  });

  return (
    <>
      {/* Lighting for the model */}
      <ambientLight intensity={1.3} />
      <directionalLight position={[5, 10, 5]} intensity={0.6} />

      {/* Orthographic camera centered on the player */}
      <OrthographicCamera
        makeDefault
        position={[position[0], 12, position[1]]}
        zoom={zoomLevel}
        near={0.1}
        far={100}
      />

      {/* Ground Meadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[MAP_WIDTH / 2 - 0.5, -0.05, MAP_HEIGHT / 2 - 0.5]}>
        <planeGeometry args={[MAP_WIDTH, MAP_HEIGHT]} />
        <meshBasicMaterial color="#3f6212" /> {/* Subtle forest green floor */}
      </mesh>

      {/* Miniature Map Cells */}
      {tiles.map(({ x, z, type }) => {
        // Hero's house (red tiled roof)
        if (x >= 2 && x <= 4 && z >= 2 && z <= 4) {
          if (x === 2 && z === 2) {
            return (
              <group key="mini-building-hero" position={[3, 0, 3]}>
                {/* Flat model shadow */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
                  <planeGeometry args={[3.3, 2.3]} />
                  <meshBasicMaterial color="#1c1917" transparent opacity={0.3} />
                </mesh>
                {/* House Base */}
                <mesh position={[0, 0.35, 0]}>
                  <boxGeometry args={[3, 0.7, 2]} />
                  <meshBasicMaterial color="#f8fafc" />
                </mesh>
                {/* Cute slope red roof */}
                <mesh position={[0, 0.95, 0]} rotation={[0, Math.PI / 4, 0]}>
                  <coneGeometry args={[2.0, 0.8, 4]} />
                  <meshBasicMaterial color="#dc2626" />
                </mesh>
              </group>
            );
          }
          return null;
        }

        // Rival's house (modern dark slate roof)
        if (x >= 9 && x <= 11 && z >= 2 && z <= 4) {
          if (x === 9 && z === 2) {
            return (
              <group key="mini-building-rival" position={[10, 0, 3]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
                  <planeGeometry args={[3.3, 2.3]} />
                  <meshBasicMaterial color="#1c1917" transparent opacity={0.3} />
                </mesh>
                <mesh position={[0, 0.35, 0]}>
                  <boxGeometry args={[3, 0.7, 2]} />
                  <meshBasicMaterial color="#f1f5f9" />
                </mesh>
                <mesh position={[0, 0.95, 0]} rotation={[0, Math.PI / 4, 0]}>
                  <coneGeometry args={[2.0, 0.8, 4]} />
                  <meshBasicMaterial color="#1e1e38" />
                </mesh>
              </group>
            );
          }
          return null;
        }

        // Oak's Research Laboratory (silver scientific dome structure)
        if (x >= 5 && x <= 9 && z >= 8 && z <= 10) {
          if (x === 6 && z === 8) {
            return (
              <group key="mini-building-lab" position={[7.5, 0, 9]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
                  <planeGeometry args={[5.3, 3.3]} />
                  <meshBasicMaterial color="#1c1917" transparent opacity={0.3} />
                </mesh>
                <mesh position={[0, 0.4, 0]}>
                  <boxGeometry args={[5, 0.8, 3]} />
                  <meshBasicMaterial color="#cbd5e1" />
                </mesh>
                {/* Purple scientific lab scanner dome */}
                <mesh position={[-1.2, 0.9, -0.3]}>
                  <sphereGeometry args={[0.55, 8, 8]} />
                  <meshBasicMaterial color="#a78bfa" />
                </mesh>
                <mesh position={[1.2, 0.9, 0.3]}>
                  <boxGeometry args={[0.35, 0.5, 0.35]} />
                  <meshBasicMaterial color="#475569" />
                </mesh>
              </group>
            );
          }
          return null;
        }

        // Standard terrain maps
        if (type === TileType.WATER) {
          return (
            <mesh key={`mini-tile-${x}-${z}`} position={[x, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.96, 0.96]} />
              <meshBasicMaterial color="#2563eb" /> {/* Vivid sapphire water */}
            </mesh>
          );
        } else if (type === TileType.PATH) {
          return (
            <mesh key={`mini-tile-${x}-${z}`} position={[x, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.96, 0.96]} />
              <meshBasicMaterial color="#fab005" /> {/* High contrast path gold */}
            </mesh>
          );
        } else if (type === TileType.GRASS) {
          return (
            <mesh key={`mini-tile-${x}-${z}`} position={[x, 0.01, z]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.96, 0.96]} />
              <meshBasicMaterial color="#10b981" /> {/* Livelier grass green */}
            </mesh>
          );
        } else {
          // Boundary solids / Forests
          const isBoundary = x === 0 || x === MAP_WIDTH - 1 || z === 0 || z === MAP_HEIGHT - 1;
          if (isBoundary) {
            return (
              <group key={`mini-tile-${x}-${z}`} position={[x, 0, z]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                  <planeGeometry args={[0.96, 0.96]} />
                  <meshBasicMaterial color="#047857" />
                </mesh>
                <mesh position={[0, 0.25, 0]}>
                  <cylinderGeometry args={[0.1, 0.1, 0.5, 4]} />
                  <meshBasicMaterial color="#f8fafc" />
                </mesh>
              </group>
            );
          } else {
            // Internal protective trees mapping as cute pine cones!
            return (
              <group key={`mini-tile-${x}-${z}`} position={[x, 0, z]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                  <planeGeometry args={[0.96, 0.96]} />
                  <meshBasicMaterial color="#064e3b" />
                </mesh>
                <mesh position={[0, 0.12, 0]}>
                  <cylinderGeometry args={[0.06, 0.08, 0.24, 4]} />
                  <meshBasicMaterial color="#451a03" />
                </mesh>
                <mesh position={[0, 0.44, 0]}>
                  <coneGeometry args={[0.34, 0.48, 4]} />
                  <meshBasicMaterial color="#15803d" />
                </mesh>
              </group>
            );
          }
        }
      })}

      {/* Mini 3D Player Marker */}
      <group ref={playerRef}>
        {/* Soft shadow */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
          <circleGeometry args={[0.42, 16]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.4} />
        </mesh>
        
        {/* Conical Pointer Body Facing Forward (+Z local direction) */}
        <mesh position={[0, 0.18, 0]} rotation={[0, 0, 0]}>
          <coneGeometry args={[0.26, 0.44, 4]} />
          <meshBasicMaterial color="#fed7aa" />
        </mesh>

        {/* Highlight red cap visor indicator extending along the visual facing plane */}
        <mesh position={[0, 0.22, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.16, 0.36, 4]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      </group>
    </>
  );
}

export function Minimap() {
  const mode = useGameStore((state) => state.mode);
  const position = useGameStore((state) => state.position);
  
  // Dynamic adjustable zoom levels: 14x, 22x, 32x
  const [zoomOption, setZoomOption] = useState<1 | 2 | 3>(2);

  const activeZoomVal = useMemo(() => {
    if (zoomOption === 1) return 14;  // Zoomed Out region wide
    if (zoomOption === 2) return 22;  // Beautiful Default
    return 32;                       // Magnified detail
  }, [zoomOption]);

  if (mode !== 'OVERWORLD') return null;

  return (
    <div className="absolute bottom-56 right-4 md:bottom-6 md:right-6 z-30 flex flex-col items-end gap-2.5 pointer-events-auto select-none">
      
      {/* Outer Compass HUD Housing */}
      <div className="relative w-40 h-40 sm:w-44 sm:h-44 bg-slate-950/80 backdrop-blur-md rounded-full border-[3px] border-slate-700/80 shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex items-center justify-center overflow-hidden">
        
        {/* Radar Crosshairs lines */}
        <div className="absolute inset-0 border-r border-t border-dashed border-slate-700/30 pointer-events-none z-10" style={{ transform: 'rotate(45deg)' }} />
        <div className="absolute inset-0 border-r border-b border-dashed border-slate-705/30 pointer-events-none z-10" />

        {/* Glowing Radar scanline pulse rings */}
        <div className="absolute inset-4 rounded-full border border-teal-500/10 pointer-events-none z-10 animate-ping" />
        <div className="absolute inset-10 rounded-full border border-sky-500/10 pointer-events-none z-10" />

        {/* Cardinal Markers on Rim */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-500 z-20">N</div>
        <div className="absolute bottom-1 right-1/2 translate-x-1/2 text-[10px] font-black text-slate-400 z-20">S</div>
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 z-20 font-mono">E</div>
        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 z-20 font-mono">W</div>

        {/* Secondary Orthographic fiber representation */}
        <div className="absolute inset-2 overflow-hidden rounded-full border-2 border-slate-800/80 z-0 bg-slate-950">
          <Canvas gl={{ antialias: true }} shadows={false}>
            <MinimapScene zoomLevel={activeZoomVal} />
          </Canvas>
        </div>

      </div>

      {/* Control Strip Strip beneath minimap */}
      <div className="flex items-center justify-between w-full bg-slate-900/90 backdrop-blur-md border border-slate-800/80 px-2 py-1.5 rounded-xl gap-2 font-mono shadow-md text-[11px] font-black text-slate-300">
        
        {/* Coordinate panel */}
        <div className="flex items-center gap-1 text-slate-400 select-none pl-1 font-bold">
          <Navigation size={10} className="text-teal-400 shrink-0" />
          <span>({position[0]},{position[1]})</span>
        </div>

        {/* Zoom adjustment buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoomOption((prev) => (prev > 1 ? (prev - 1 as any) : 1))}
            disabled={zoomOption === 1}
            className={`p-1 rounded cursor-pointer transition-all hover:bg-slate-800 active:scale-95 ${
              zoomOption === 1 ? 'opacity-30 text-slate-600' : 'text-slate-300 hover:text-white'
            }`}
            title="Zoom Out"
          >
            <Minus size={11} />
          </button>
          
          <span className="text-[10px] text-slate-500 font-extrabold w-5 text-center px-0.5">
            {zoomOption === 1 ? '1x' : zoomOption === 2 ? '2x' : '3x'}
          </span>

          <button
            onClick={() => setZoomOption((prev) => (prev < 3 ? (prev + 1 as any) : 3))}
            disabled={zoomOption === 3}
            className={`p-1 rounded cursor-pointer transition-all hover:bg-slate-800 active:scale-95 ${
              zoomOption === 3 ? 'opacity-30 text-slate-600' : 'text-slate-300 hover:text-white'
            }`}
            title="Zoom In"
          >
            <Plus size={11} />
          </button>
        </div>
      </div>

    </div>
  );
}
