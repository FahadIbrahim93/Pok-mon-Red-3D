# Pokémon Red 3D: robust 3D Asset Pipeline & Standards

This document establishes the official technical standards and reference guidelines for importing, creating, and optimizing 3D models, textures, skeletal animations, and sound effects for **Pokémon Red 3D**. These standards ensure maximum fluid performance (60 FPS) on mobile and desktop web browsers utilizing **Three.js**, **React Three Fiber (R3F)**, and **React state hydration**.

---

## 1. 3D Model Import & Geometry Standards

For complex custom static assets and unique character structures, we enforce a strict low-poly pipeline to keep memory footprints low and canvas loaders ultra-fast.

### File Format & Deliverables
* **Standard**: `.glb` (GLTF Binary) or `.gltf` with separate texture maps.
* **Compression**: **Draco compression** must be applied. Draco compresses structural vertex arrays recursively, shrinking files by up to 90%.
* Use `npx gltf-pipeline -i model.gltf -o model.glb -d` to generate highly compressed target binaries.

### Polycount Budgets
To maintain smooth React-Three-Fiber context refreshes and responsive state renders, utilize the following budget quotas:

| Asset Archetype | Max Triangles | Max Vertices | Recommended Dimension |
| :--- | :--- | :--- | :--- |
| **Small Prop** (Mailbox, chest, flowers) | 150 - 300 | 200 | $0.5 \times 0.5 \times 0.5$ Units |
| **Building / Facility** (Oaks Lab, Houses) | 1,200 - 3,000 | 2,500 | $5.0 \times 4.0 \times 5.0$ Units |
| **Pokémon Characters** (Companion, Wilds) | 800 - 1,500 | 1,000 | $0.8 \times 0.9 \times 0.8$ Units |
| **Trainer Red / Gary** (Interactive NPCs) | 1,200 - 2,000 | 1,800 | $0.6 \times 1.7 \times 0.6$ Units |

---

## 2. CASE STUDY: Procedural Archetype Generation
In the absence of raw `.glb` files, or to avoid heavy initial MB network downloads, utilize **Procedural Mesh Assembly**. This is demonstrated inside `/src/components/3d/PokemonModel.tsx`:

* **Separation of Concerns**: Assemble skeletal models using nested Three.js primitive `<boxGeometry>` and `<sphereGeometry>` tags.
* **Benefits**:
  1. *Zero Network Loading Overhead*: Primitives compile into pure WebGL buffer geometries instantly at runtime.
  2. *Adaptive Styling*: Color palettes (e.g. Charmander orange #ff922b, Rattata purple #be4bdb) can be injected directly into R3F mesh materials using string hex props.
  3. *Lightweight Dynamic Animators*: Custom components can animate leg cycles and tail swags procedurally inside `useFrame` utilizing mathematical waves, eliminating heavy keyframe bone matrices.

---

## 3. Texture Optimization & Compression Guidelines

Uncompressed textures are the primary cause of graphical memory (VRAM) exhaust in Three.js environments:

* **Size Constraints**: Texture dimensions **MUST** be square, in ratios of powers of two (e.g., $128 \times 128$, $256 \times 256$, $512 \times 512$). Never exceed $1024 \times 1024$ for standard mobile viewport meshes.
* **Pixel Density & Filtering**: Use crisp retro-looking pixel art or solid warm modern vectors. To preserve pixel-perfect cartridge feel, set:
  ```typescript
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestMipmapLinearFilter;
  ```
* **Format**: All static map textures must be compiled in web-safe `.webp` format at 80% compression.
* **Roughness / Metalness Maps**: Instead of high resolution colors, use simple uniform numbers in `<meshStandardMaterial>` (e.g. `roughness={0.6}`, `metalness={0.1}`) to achieve matte/glowing surfaces without high loading weights.

---

## 4. Skeletal Rigging & Animation Pipeline

To align skeletal keys with Three.js's native `AnimationMixer` or procedural wave interpolation:

### Skeletal Rig naming specs:
* `Root`: Centered at $(0, 0, 0)$ floor level.
* `Spine` / `Chest`: Body core.
* `Head`: Top node, parented to Spine.
* `Leg_L` / `Leg_R`: Leg joints, pivot point situated at thighs for natural rotation.
* `Wing_L` / `Wing_R`: Pivot centered at joint attachment for wing flapping simulation.

### Procedural Wave Animations
To avoid bloated keyframe interpolation loops, use trigonometric sine/cosine loops inside R3F `useFrame` handlers. This creates lightweight, performant, and fully adjustable states:

```typescript
useFrame((state) => {
  const t = state.clock.getElapsedTime();
  
  // 1. Idle Tail Sway
  if (tailRef.current) {
    tailRef.current.rotation.y = Math.sin(t * 3.5) * 0.22;
  }
  
  // 2. Walking Cycle Leg Swings
  if (state === 'WALK') {
    leftLegRef.current.rotation.x = Math.sin(t * 12) * 0.45;
    rightLegRef.current.rotation.x = -Math.sin(t * 12) * 0.45;
  }
});
```

---

## 5. Sound & SFX Pipeline Design Pattern

The audio architecture utilizes a centralized singleton `SoundManager` class designed to handle modern browser restrictions (requiring user click interaction before context initialization).

### Audio Guidelines
1. **Background Music (BGM)**:
   - File Format: High-fidelity `.mp3` or `.ogg` set to loop.
   - Target Size: < 2MB.
2. **Sound Effects (SFX)**:
   - File Format: Small `.wav` or compressed `.mp3` for sound-board clicks, leveling up, heal chirps, and dynamic damage hits.
   - Use dynamic triggers or custom window hooks to bubble SFX events:
     ```typescript
     soundManager.playSFX('capture_success');
     ```

---

## 6. Memory Allocation & Garbage Collection (WebGL)

React-Three-Fiber dynamically mounts and unmounts meshes as the player switches from `OVERWORLD` to `BATTLE` screen. To prevent severe GPU memory accumulation:

* **Dispose Geometries**: R3F automatically disposes arguments of unmounted nodes, but if manual Three meshes are constructed, ensure geometry and materials are cleaned up inside normal `useEffect` cleanups:
  ```typescript
  return () => {
    geometry.dispose();
    material.dispose();
  };
  ```
* **Mesh Instancing**: For overlapping visual clutter (e.g. clusters of flowerbeds or mailboxes), prefer `<instancedMesh>` instead of individual `<mesh>` coordinates. Instanced meshes render up to 10,000 items in a single WebGL draw call!
