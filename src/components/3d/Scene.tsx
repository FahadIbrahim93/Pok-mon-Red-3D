import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing';
import { Player } from './Player';
import { World } from './World';
import { usePlayerControls } from '../../game/usePlayerControls';
import { CameraController } from './CameraController';

export function Scene() {
  usePlayerControls(); // Attach logic here

  return (
    <Canvas shadows camera={{ position: [0, 10, 10], fov: 45 }}>
      <CameraController />
      <World />
      <Player />

      {/* Cinematic Post-Processing Pipeline */}
      <EffectComposer>
        <Bloom 
          intensity={0.8} 
          luminanceThreshold={0.15} 
          luminanceSmoothing={0.8} 
          mipmapBlur={true} 
        />
        <ToneMapping mode={3} />
      </EffectComposer>
    </Canvas>
  );
}
