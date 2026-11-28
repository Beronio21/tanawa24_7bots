import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  createRig,
  createCharacterTexture,
  textureAspect,
  listRigPresets,
  EXPRESSIONS,
  POSES,
} from "./CharacterRig.js";
import {
  getPixelSpriteLibrary,
  PIXEL_PRESETS,
  pixelPresetBaseHeight,
} from "./PixelSpriteEngine.js";

/**
 * HD-2D world & cast film studio.
 *
 * Ported from docs/references/hd_2d_pixel_art_sprite_3d_world_studio.html:
 * low-poly diorama worlds, camera presets, NearestFilter sprite actors and a
 * deterministic frame hook for later Playwright renders.
 */

export const WORLD_SETS = [
  {
    id: "cozy",
    label: "Cozy Morning Studio",
    background: 0xead9c2,
    fog: 0xead9c2,
    sun: { color: 0xfff0cf, intensity: 1.9, position: [3.2, 6.5, 4.8] },
  },
  {
    id: "meadow",
    label: "Meadow Plaza",
    background: 0xcde3d3,
    fog: 0xd8e9dc,
    sun: { color: 0xfff1d6, intensity: 2.05, position: [-4.8, 7.5, 5.2] },
  },
  {
    id: "sunset",
    label: "Sunset Overlook",
    background: 0xf3c39c,
    fog: 0xf3c39c,
    sun: { color: 0xffb469, intensity: 2.3, position: [-6.5, 3.8, 4.2] },
  },
];

export const CAMERA_PRESETS = [
  { id: "wide", label: "Wide", pos: [0, 3.1, 6.4], target: [0, 0.78, 0] },
  { id: "two_shot", label: "Two-Shot", pos: [0, 1.15, 3.45], target: [0, 0.72, 0] },
  { id: "low_hero", label: "Low Hero", pos: [-0.35, 0.72, 2.85], target: [0, 0.85, 0] },
  { id: "diorama", label: "Diorama", pos: [3.8, 3.9, 4.8], target: [0, 0.65, 0] },
];

const FLAT = { roughness: 0.88, metalness: 0.04, flatShading: true };

function flatMat(color, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, ...FLAT, ...extra });
}

function disposer(root) {
  root.traverse((node) => {
    if (node.geometry) node.geometry.dispose();
    if (node.material) {
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      for (const material of materials) {
        if (material.map) material.map.dispose();
        material.dispose();
      }
    }
  });
}

function buildCozyStudio(group) {
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(15, 15), flatMat(0xc9a274));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  group.add(floor);

  for (let ix = -3; ix <= 3; ix += 1) {
    for (let iz = -2; iz <= 2; iz += 1) {
      const tile = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.02, 0.55),
        flatMat((ix + iz) % 2 === 0 ? 0xefe3cf : 0xc4704f),
      );
      tile.position.set(ix * 0.56, 0.012, iz * 0.56 + 0.2);
      tile.receiveShadow = true;
      group.add(tile);
    }
  }

  const backWall = new THREE.Mesh(new THREE.BoxGeometry(11, 5.6, 0.2), flatMat(0xf2e6d4));
  backWall.position.set(0, 2.8, -2.6);
  backWall.receiveShadow = true;
  group.add(backWall);

  const sideWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 5.6, 8), flatMat(0xe9dcc8));
  sideWall.position.set(-4.6, 2.8, 0.8);
  sideWall.receiveShadow = true;
  group.add(sideWall);

  const windowPane = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 2.2),
    new THREE.MeshBasicMaterial({ color: 0xfff7dd }),
  );
  windowPane.position.set(-1.4, 2.5, -2.48);
  group.add(windowPane);

  const frameMat = flatMat(0x9c6537);
  const frameTop = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.1, 0.1), frameMat);
  frameTop.position.set(-1.4, 3.63, -2.44);
  group.add(frameTop);
  const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.2, 0.1), frameMat);
  mullion.position.set(-1.4, 2.5, -2.44);
  group.add(mullion);

  const beam = new THREE.Mesh(
    new THREE.PlaneGeometry(4.6, 3.4),
    new THREE.MeshBasicMaterial({ color: 0xfef3c7, transparent: true, opacity: 0.32, depthWrite: false }),
  );
  beam.rotation.x = -Math.PI / 2;
  beam.rotation.z = 0.45;
  beam.position.set(-0.4, 0.02, 0.6);
  group.add(beam);

  const desk = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.1, 1), flatMat(0xb8814c));
  desk.position.set(1.9, 0.85, -1.5);
  desk.castShadow = true;
  desk.receiveShadow = true;
  group.add(desk);
  for (const [lx, lz] of [
    [-1.25, -0.4],
    [1.25, -0.4],
    [-1.25, 0.4],
    [1.25, 0.4],
  ]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.85, 0.08), flatMat(0x6e4a32));
    leg.position.set(1.9 + lx, 0.425, -1.5 + lz);
    leg.castShadow = true;
    group.add(leg);
  }

  const monitor = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.6, 0.06), flatMat(0x3a322b));
  monitor.position.set(1.9, 1.3, -1.9);
  group.add(monitor);
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.86, 0.5),
    new THREE.MeshBasicMaterial({ color: 0xd96b43 }),
  );
  screen.position.set(1.9, 1.3, -1.86);
  group.add(screen);

  const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.9, 0.35), flatMat(0xa0703f));
  shelf.position.set(-3.3, 0.95, -2.35);
  shelf.castShadow = true;
  group.add(shelf);
  const bookColors = [0xd96b43, 0x2b6e68, 0xc88a2b, 0x9c4a3e, 0x8b76ac];
  bookColors.forEach((color, index) => {
    const book = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.34, 0.26), flatMat(color));
    book.position.set(-3.95 + index * 0.2, 1.55, -2.2);
    group.add(book);
  });

  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.17, 0.36, 7), flatMat(0xc0703f));
  pot.position.set(-4.0, 0.18, 1.5);
  pot.castShadow = true;
  group.add(pot);
  const leaves = new THREE.Mesh(new THREE.DodecahedronGeometry(0.42, 1), flatMat(0x4f7d4a));
  leaves.position.set(-4.0, 0.62, 1.5);
  leaves.castShadow = true;
  group.add(leaves);

  for (const [x, z, color] of [
    [-3.6, 0.2, 0xe8b9a0],
    [3.2, -2.5, 0x2b6e68],
  ]) {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.8, 0.06), flatMat(0x6e5a45));
    frame.position.set(x, 2.2, z === -2.5 ? -2.44 : -2.44);
    group.add(frame);
    const art = new THREE.Mesh(new THREE.PlaneGeometry(0.96, 0.66), new THREE.MeshBasicMaterial({ color }));
    art.position.z = 0.04;
    frame.add(art);
  }
}

function buildMeadow(group) {
  const grassGeometry = new THREE.PlaneGeometry(46, 46, 36, 36);
  grassGeometry.rotateX(-Math.PI / 2);
  const positions = grassGeometry.attributes.position;
  const colors = [];
  const shades = [new THREE.Color(0x8fb27a), new THREE.Color(0x7fa36b), new THREE.Color(0xa1c08a)];
  for (let i = 0; i < positions.count; i += 1) {
    const x = positions.getX(i);
    const z = positions.getZ(i);
    if (Math.hypot(x, z) > 5.2) {
      positions.setY(i, Math.sin(x * 0.7) * Math.cos(z * 0.7) * 0.14);
    }
    const shade = shades[Math.abs(Math.round(x + z)) % 3];
    colors.push(shade.r, shade.g, shade.b);
  }
  grassGeometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  const grass = new THREE.Mesh(
    grassGeometry,
    new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.94 }),
  );
  grass.receiveShadow = true;
  group.add(grass);

  const plazaRadius = 3.85;
  const tileSize = 0.56;
  const tileGeometry = new THREE.BoxGeometry(tileSize * 0.96, 0.07, tileSize * 0.96);
  const creamTile = flatMat(0xe6d9c3);
  const stoneTile = flatMat(0xb0a695);
  const trimTile = flatMat(0xcdbda4);
  const range = Math.ceil(plazaRadius / tileSize);
  for (let ix = -range; ix <= range; ix += 1) {
    for (let iz = -range; iz <= range; iz += 1) {
      const distance = Math.hypot(ix * tileSize, iz * tileSize);
      if (distance > plazaRadius) continue;
      const isBorder = distance > plazaRadius - 0.52;
      const material = isBorder ? trimTile : (ix + iz) % 2 === 0 ? creamTile : stoneTile;
      const tile = new THREE.Mesh(tileGeometry, material);
      tile.position.set(ix * tileSize, 0.035, iz * tileSize);
      tile.receiveShadow = true;
      group.add(tile);
    }
  }

  const cottage = new THREE.Group();
  cottage.position.set(-3.1, 0, -4.1);
  cottage.rotation.y = 0.25;
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.5, 1.75), flatMat(0xf1e8db));
  body.position.y = 0.75;
  body.castShadow = true;
  body.receiveShadow = true;
  cottage.add(body);
  const roofGeometry = new THREE.ConeGeometry(1.62, 1.15, 4);
  roofGeometry.rotateY(Math.PI / 4);
  const roof = new THREE.Mesh(roofGeometry, flatMat(0xc4704f));
  roof.scale.set(1.08, 1, 0.92);
  roof.position.y = 2.05;
  roof.castShadow = true;
  cottage.add(roof);
  const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.75, 0.28), flatMat(0xa8563f));
  chimney.position.set(0.55, 2.25, -0.2);
  chimney.castShadow = true;
  cottage.add(chimney);
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.78, 0.08), flatMat(0x8a5c37));
  door.position.set(-0.42, 0.39, 0.88);
  cottage.add(door);
  const windowMaterial = flatMat(0xfef3c7, { emissive: 0xfde68a, emissiveIntensity: 0.4 });
  const windowFront = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.08), windowMaterial);
  windowFront.position.set(0.42, 0.85, 0.88);
  cottage.add(windowFront);
  const windowSide = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.44, 0.44), windowMaterial);
  windowSide.position.set(1.06, 0.85, 0.15);
  cottage.add(windowSide);
  group.add(cottage);

  const pine = (scale) => {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 0.75, 6), flatMat(0x8a5c37));
    trunk.position.y = 0.375;
    trunk.castShadow = true;
    tree.add(trunk);
    [0x5c8a4c, 0x6c9a58, 0x7ba966].forEach((color, index) => {
      const tier = [
        { y: 1.05, r: 0.88, h: 1.1 },
        { y: 1.65, r: 0.68, h: 0.95 },
        { y: 2.18, r: 0.46, h: 0.8 },
      ][index];
      const cone = new THREE.Mesh(new THREE.ConeGeometry(tier.r, tier.h, 6), flatMat(color));
      cone.position.y = tier.y;
      cone.rotation.y = index * 0.5;
      cone.castShadow = true;
      tree.add(cone);
    });
    tree.scale.setScalar(scale);
    return tree;
  };

  for (const [tx, tz, scale] of [
    [-2.05, -3.55, 1.12],
    [-0.95, -5.1, 1.05],
    [3.15, -3.65, 1.18],
    [4.55, -2.4, 0.92],
    [-4.8, -1.9, 1.08],
  ]) {
    const tree = pine(scale);
    tree.position.set(tx, 0, tz);
    group.add(tree);
  }

  const rockMaterial = flatMat(0x9a958c);
  const bushMaterial = flatMat(0x6b9460);
  [
    [-3.6, -2.5, "rock", 0.38],
    [-1.7, -2.6, "bush", 0.42],
    [1.9, -2.7, "rock", 0.34],
    [2.85, -2.2, "bush", 0.48],
    [4.1, 0.6, "bush", 0.4],
    [-3.9, 1.1, "rock", 0.3],
  ].forEach(([px, pz, kind, scale], index) => {
    const mesh = new THREE.Mesh(
      new THREE.DodecahedronGeometry(scale, kind === "bush" ? 1 : 0),
      kind === "rock" ? rockMaterial : bushMaterial,
    );
    mesh.scale.set(1.15, kind === "bush" ? 0.85 : 0.78, 1.05);
    mesh.position.set(px, scale * 0.48, pz);
    mesh.rotation.y = index * 0.9;
    mesh.castShadow = true;
    group.add(mesh);
  });

  const lamppost = (x, z) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.11, 1.45, 0.11), flatMat(0x7a4a28));
    post.position.set(x, 0.725, z);
    post.castShadow = true;
    group.add(post);
    const lantern = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.28, 0.26),
      flatMat(0xfef3c7, { emissive: 0xfde047, emissiveIntensity: 0.6 }),
    );
    lantern.position.set(x, 1.56, z);
    group.add(lantern);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.16, 4), flatMat(0x5a3a24));
    cap.rotation.y = Math.PI / 4;
    cap.position.set(x, 1.77, z);
    group.add(cap);
  };
  lamppost(-4.35, -1.65);
  lamppost(4.35, -1.55);

  [
    [-9.2, -19, 3.4, 5.6, 0x9db6bc],
    [-3.6, -21, 4.2, 6.8, 0xa9c1c6],
    [2.8, -20, 3.8, 6.2, 0x9db6bc],
    [8.4, -18, 3.1, 5.2, 0xa9c1c6],
  ].forEach(([x, z, radius, height, color], index) => {
    const mountain = new THREE.Mesh(new THREE.ConeGeometry(radius, height, 5), flatMat(color));
    mountain.position.set(x, height * 0.42, z);
    mountain.rotation.y = index * 0.6;
    group.add(mountain);
  });
}

function buildSunsetOverlook(group) {
  buildMeadow(group);
  const ledge = new THREE.Mesh(new THREE.BoxGeometry(9, 0.5, 3.2), flatMat(0xcbb79a));
  ledge.position.set(0, 0.2, 5.6);
  ledge.receiveShadow = true;
  group.add(ledge);
  for (const x of [-4.2, 4.2]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.1, 0.16), flatMat(0x8a5c37));
    rail.position.set(x, 0.95, 7.0);
    rail.castShadow = true;
    group.add(rail);
  }
  const topRail = new THREE.Mesh(new THREE.BoxGeometry(8.8, 0.12, 0.16), flatMat(0x8a5c37));
  topRail.position.set(0, 1.5, 7.0);
  group.add(topRail);
}

function addFireflies(scene) {
  const material = new THREE.MeshBasicMaterial({ color: 0xffe9a8 });
  const geometry = new THREE.PlaneGeometry(0.05, 0.05);
  const group = new THREE.Group();
  const particles = [];
  for (let i = 0; i < 24; i += 1) {
    const mesh = new THREE.Mesh(geometry, material);
    const base = {
      x: (i % 6) * 1.1 - 3.2,
      y: 0.5 + ((i * 7) % 9) * 0.24,
      z: ((i * 11) % 9) * 0.7 - 3,
      speed: 0.55 + (i % 5) * 0.16,
      phase: i * 0.7,
    };
    mesh.position.set(base.x, base.y, base.z);
    group.add(mesh);
    particles.push({ mesh, base });
  }
  scene.add(group);
  return { group, particles };
}

/**
 * @param {object} options
 * @param {HTMLElement} options.container
 * @param {string} [options.world]
 * @param {string} [options.camera]
 * @param {{left?: object, right?: object}} [options.cast]
 */
export function createFilmStudioEngine({
  container,
  world = "meadow",
  camera = "wide",
  cast = {},
  onChange = () => {},
  onSkit = null,
}) {
  const canvas = document.createElement("canvas");
  canvas.className = "film-gl";
  canvas.setAttribute("aria-hidden", "true");
  container.insertBefore(canvas, container.firstChild);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.04;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(WORLD_SETS[1].background);
  scene.fog = new THREE.FogExp2(WORLD_SETS[1].fog, 0.024);

  const cameraRig = new THREE.PerspectiveCamera(36, 1, 0.1, 90);

  const hemiLight = new THREE.HemisphereLight(0xfff9eb, 0x9a8a6a, 1.15);
  scene.add(hemiLight);
  const sunLight = new THREE.DirectionalLight(0xfff1d6, 2.05);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  sunLight.shadow.camera.near = 1;
  sunLight.shadow.camera.far = 30;
  sunLight.shadow.camera.left = -7;
  sunLight.shadow.camera.right = 7;
  sunLight.shadow.camera.top = 7;
  sunLight.shadow.camera.bottom = -7;
  sunLight.shadow.bias = -0.0004;
  sunLight.shadow.normalBias = 0.015;
  scene.add(sunLight);
  const rimLight = new THREE.DirectionalLight(0xd7ecff, 0.5);
  rimLight.position.set(4.5, 3.5, -4.5);
  scene.add(rimLight);

  const worldGroups = {
    cozy: new THREE.Group(),
    meadow: new THREE.Group(),
    sunset: new THREE.Group(),
  };
  buildCozyStudio(worldGroups.cozy);
  buildMeadow(worldGroups.meadow);
  buildSunsetOverlook(worldGroups.sunset);
  Object.values(worldGroups).forEach((group) => scene.add(group));

  const fireflies = addFireflies(scene);

  // ------------------------------------------------------------------- actors
  const ACTOR_HEIGHT = 1.32;
  const rigPresets = listRigPresets();
  const pixelLibrary = getPixelSpriteLibrary();
  const DEFAULT_SLOTS = {
    left: { x: -0.65, z: 0.15 },
    right: { x: 0.65, z: -0.05 },
  };

  function rigInputFromCast(config = {}, preset, expression, facing) {
    const {
      style: _style,
      pixelPreset: _pixelPreset,
      pose: _pose,
      presetId: _presetId,
      expression: _expression,
      rig,
      ...overrides
    } = config;
    return {
      presetId: preset.id,
      expression,
      facing,
      ...(rig ?? {}),
      ...overrides,
    };
  }

  function createActor(slot, config = {}) {
    const style = config.style === "pixel" ? "pixel" : "rig";
    const pose = POSES.includes(config.pose) ? config.pose : "idle";
    const slotDefault = DEFAULT_SLOTS[slot];

    let presetId = null;
    let pixelPreset = null;
    let expression = null;
    let rig = null;
    let frames = [];
    let baseHeight = ACTOR_HEIGHT;
    let firstTexture = null;
    let firstAspect = 0.28;

    if (style === "pixel") {
      pixelPreset = PIXEL_PRESETS.some((item) => item.id === config.pixelPreset)
        ? config.pixelPreset
        : "traveler_boy";
      const pixelFrames = pixelLibrary[pixelPreset][pose];
      firstTexture = pixelFrames[0].texture;
      firstAspect = pixelFrames[0].canvas.width / pixelFrames[0].canvas.height;
      baseHeight = pixelPresetBaseHeight(pixelPreset);
    } else {
      const preset = rigPresets.find((item) => item.id === config.presetId) ?? rigPresets[7];
      presetId = preset.id;
      expression =
        typeof config.expression === "string" && config.expression.trim()
          ? config.expression
          : preset.expression;
      rig = createRig(rigInputFromCast(config, preset, expression, slot === "left" ? 1 : -1));
      frames = [0, 1, 2, 3].map((index) =>
        createCharacterTexture(rig, { pose, expression, phase: (index / 4) * Math.PI * 2 }),
      );
      firstTexture = frames[0];
      firstAspect = textureAspect(firstTexture);
    }

    const geometry = new THREE.PlaneGeometry(baseHeight * firstAspect, baseHeight);
    geometry.translate(0, baseHeight / 2, 0);
    const material = new THREE.MeshStandardMaterial({
      map: firstTexture,
      transparent: true,
      alphaTest: 0.45,
      side: THREE.DoubleSide,
      roughness: 0.9,
      metalness: 0,
    });
    const depthMaterial = new THREE.MeshDepthMaterial({
      depthPacking: THREE.RGBADepthPacking,
      map: firstTexture,
      alphaTest: 0.45,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.customDepthMaterial = depthMaterial;
    mesh.position.set(slotDefault.x, 0, slotDefault.z);
    scene.add(mesh);

    return {
      slot,
      style,
      presetId,
      pixelPreset,
      expression,
      pose,
      rig,
      frames,
      customFrames: null,
      baseHeight,
      posX: slotDefault.x,
      posZ: slotDefault.z,
      scale: 1,
      flipX: false,
      mesh,
      material,
      depthMaterial,
      lastTexture: firstTexture,
    };
  }

  const actors = {
    left: createActor("left", cast.left ?? { presetId: "cast_hana", pose: "idle" }),
    right: createActor("right", cast.right ?? { presetId: "cast_ren", pose: "idle" }),
  };

  function applyTexture(actor, texture) {
    if (actor.lastTexture === texture) return;
    actor.lastTexture = texture;
    actor.material.map = texture;
    actor.material.needsUpdate = true;
    actor.depthMaterial.map = texture;
    actor.depthMaterial.needsUpdate = true;
  }

  function rebuildActorGeometry(actor, aspect) {
    const geometry = new THREE.PlaneGeometry(actor.baseHeight * aspect, actor.baseHeight);
    geometry.translate(0, actor.baseHeight / 2, 0);
    actor.mesh.geometry.dispose();
    actor.mesh.geometry = geometry;
  }

  function clearCustomFrames(actor) {
    if (!actor.customFrames) return;
    actor.customFrames.forEach((frame) => frame.texture.dispose());
    actor.customFrames = null;
  }

  // ------------------------------------------------------------------ presets
  let activeWorld = WORLD_SETS.find((item) => item.id === world) ?? WORLD_SETS[1];
  let activeCamera =
    CAMERA_PRESETS.find((item) => item.id === camera) ?? CAMERA_PRESETS[0];
  let targetPosition = new THREE.Vector3(...activeCamera.pos);
  let targetTarget = new THREE.Vector3(...activeCamera.target);
  let lerping = true;

  // Drag-to-orbit + wheel zoom around the stage target (ported from the
  // reference's OrbitControls). Grabbing the canvas cancels any preset lerp;
  // picking a camera preset glides back to the framed shot.
  const controls = new OrbitControls(cameraRig, canvas);
  controls.target.set(...activeCamera.target);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enableZoom = false; // custom wheel dolly below owns zoom
  controls.minDistance = 1.6;
  controls.maxDistance = 14.0;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.addEventListener("start", () => {
    lerping = false;
  });

  // Mouse-wheel / touchpad zoom toward the look target with clamped bounds.
  // Precision touchpads send pinch gestures as wheel events with
  // ctrlKey === true — those get a stronger multiplier. Camera presets
  // reset the framing (and therefore the zoom distance).
  const MIN_ZOOM_DISTANCE = 1.6;
  const MAX_ZOOM_DISTANCE = 14.0;
  const WHEEL_DELTA_CLAMP = 240;
  const WHEEL_ZOOM_SENSITIVITY = 0.0016;
  const PINCH_ZOOM_SENSITIVITY = 0.004;

  function dollyCamera(multiplier) {
    lerping = false;
    const offset = cameraRig.position.clone().sub(controls.target);
    const distance = THREE.MathUtils.clamp(offset.length(), MIN_ZOOM_DISTANCE, MAX_ZOOM_DISTANCE);
    const nextDistance = THREE.MathUtils.clamp(distance * multiplier, MIN_ZOOM_DISTANCE, MAX_ZOOM_DISTANCE);
    if (nextDistance === distance) return;
    offset.normalize().multiplyScalar(nextDistance);
    cameraRig.position.copy(controls.target).add(offset);
  }

  const onWheelZoom = (event) => {
    event.preventDefault();
    const delta = THREE.MathUtils.clamp(event.deltaY, -WHEEL_DELTA_CLAMP, WHEEL_DELTA_CLAMP);
    const sensitivity = event.ctrlKey ? PINCH_ZOOM_SENSITIVITY : WHEEL_ZOOM_SENSITIVITY;
    dollyCamera(Math.exp(delta * sensitivity));
  };
  canvas.style.touchAction = "none";
  canvas.addEventListener("wheel", onWheelZoom, { passive: false });

  function zoomIn() {
    dollyCamera(0.85);
  }

  function zoomOut() {
    dollyCamera(1 / 0.85);
  }

  function resetZoom() {
    // Glide back to the active preset's default distance along the current
    // view direction — orbit yaw/pitch and look target are preserved.
    const presetDistance = new THREE.Vector3(...activeCamera.pos)
      .distanceTo(new THREE.Vector3(...activeCamera.target));
    const direction = cameraRig.position.clone().sub(controls.target);
    if (direction.lengthSq() < 1e-6) direction.set(0, 0.6, 1);
    direction.normalize();
    targetPosition = controls.target.clone().add(direction.multiplyScalar(presetDistance));
    targetTarget = controls.target.clone();
    lerping = true;
  }

  function applyWorld(id) {
    const next = WORLD_SETS.find((item) => item.id === id);
    if (!next) return;
    activeWorld = next;
    for (const [key, group] of Object.entries(worldGroups)) {
      group.visible = key === id;
    }
    fireflies.group.visible = id === "sunset";
    scene.background.setHex(next.background);
    scene.fog.color.setHex(next.fog);
    sunLight.color.setHex(next.sun.color);
    sunLight.intensity = next.sun.intensity;
    sunLight.position.set(...next.sun.position);
    onChange({ world: id });
  }

  function applyCamera(id) {
    const next = CAMERA_PRESETS.find((item) => item.id === id);
    if (!next) return;
    activeCamera = next;
    targetPosition = new THREE.Vector3(...next.pos);
    targetTarget = new THREE.Vector3(...next.target);
    lerping = true;
    onChange({ camera: id });
  }

  function reseatActor(actor) {
    resetActorTransform(actor);
    actor.mesh.position.x = actor.posX;
    actor.mesh.position.z = actor.posZ;
  }

  function bakeRigFrames(actor) {
    actor.frames.forEach((frame) => frame.dispose());
    actor.frames = [0, 1, 2, 3].map((index) =>
      createCharacterTexture(actor.rig, {
        pose: actor.pose,
        expression: actor.expression,
        phase: (index / 4) * Math.PI * 2,
      }),
    );
    rebuildActorGeometry(actor, textureAspect(actor.frames[0]));
    applyTexture(actor, actor.frames[0]);
  }

  /** Change only the animation pose (used by skit cue playback). */
  function setActorPose(actor, anim) {
    if (!POSES.includes(anim)) return;
    actor.pose = anim;
    if (actor.customFrames?.length) return;
    if (actor.style === "pixel") {
      applyTexture(actor, pixelLibrary[actor.pixelPreset][anim][0].texture);
      return;
    }
    bakeRigFrames(actor);
  }

  function setCast(slot, config = {}) {
    const actor = actors[slot];
    if (!actor) return;
    clearCustomFrames(actor);
    const style = config.style === "pixel" ? "pixel" : "rig";
    const pose = POSES.includes(config.pose) ? config.pose : "idle";
    actor.style = style;
    actor.pose = pose;

    if (style === "pixel") {
      actor.pixelPreset = PIXEL_PRESETS.some((item) => item.id === config.pixelPreset)
        ? config.pixelPreset
        : "traveler_boy";
      actor.presetId = null;
      actor.baseHeight = pixelPresetBaseHeight(actor.pixelPreset);
      const first = pixelLibrary[actor.pixelPreset][pose][0];
      rebuildActorGeometry(actor, first.canvas.width / first.canvas.height);
      applyTexture(actor, first.texture);
      reseatActor(actor);
      onChange({ cast: { slot, style, pixelPreset: actor.pixelPreset, pose } });
      return;
    }

    const preset = rigPresets.find((item) => item.id === config.presetId) ?? rigPresets[7];
    const expression =
      typeof config.expression === "string" && config.expression.trim()
        ? config.expression
        : preset.expression;
    actor.presetId = preset.id;
    actor.pixelPreset = null;
    actor.expression = expression;
    actor.baseHeight = ACTOR_HEIGHT;
    actor.rig = createRig(rigInputFromCast(config, preset, expression, actor.slot === "left" ? 1 : -1));
    bakeRigFrames(actor);
    reseatActor(actor);
    onChange({ cast: { slot, style, presetId: preset.id, pose, expression } });
  }

  function setActorTransform(slot, transform = {}) {
    const actor = actors[slot];
    if (!actor) return;
    if (typeof transform.x === "number") actor.posX = transform.x;
    if (typeof transform.z === "number") actor.posZ = transform.z;
    if (typeof transform.scale === "number") actor.scale = Math.min(1.8, Math.max(0.4, transform.scale));
    if (typeof transform.flipX === "boolean") actor.flipX = transform.flipX;
  }

  function resetActorTransform(actor) {
    const fallback = DEFAULT_SLOTS[actor.slot];
    actor.posX = fallback.x;
    actor.posZ = fallback.z;
    actor.scale = 1;
    actor.flipX = false;
  }

  function loadSpriteSheet(slot, image, frameCount = 4) {
    const actor = actors[slot];
    if (!actor) return;
    clearCustomFrames(actor);
    const frameWidth = Math.max(1, Math.floor(image.width / frameCount));
    const frameHeight = image.height;
    actor.customFrames = [];
    for (let index = 0; index < frameCount; index += 1) {
      const frameCanvas = document.createElement("canvas");
      frameCanvas.width = frameWidth;
      frameCanvas.height = frameHeight;
      const context = frameCanvas.getContext("2d");
      context.imageSmoothingEnabled = false;
      context.drawImage(
        image,
        index * frameWidth,
        0,
        frameWidth,
        frameHeight,
        0,
        0,
        frameWidth,
        frameHeight,
      );
      const texture = new THREE.CanvasTexture(frameCanvas);
      texture.magFilter = THREE.NearestFilter;
      texture.minFilter = THREE.NearestFilter;
      texture.generateMipmaps = false;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
      actor.customFrames.push({ canvas: frameCanvas, texture });
    }
    rebuildActorGeometry(actor, frameWidth / frameHeight);
    applyTexture(actor, actor.customFrames[0].texture);
    onChange({ cast: { slot, custom: true, frames: frameCount } });
  }

  // --------------------------------------------------------------- render loop
  let elapsed = 0;
  let lastTime = 0;
  let frameHandle = 0;
  let disposed = false;

  const resize = () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;
    cameraRig.aspect = width / height;
    cameraRig.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  };
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  resize();

  function renderAt(time) {
    const delta = lastTime ? Math.min(time - lastTime, 0.1) : 0.016;
    lastTime = time;
    elapsed += delta;

    if (lerping) {
      cameraRig.position.lerp(targetPosition, 0.08);
      controls.target.lerp(targetTarget, 0.08);
      if (
        cameraRig.position.distanceTo(targetPosition) < 0.012 &&
        controls.target.distanceTo(targetTarget) < 0.012
      ) {
        lerping = false;
      }
    }
    controls.update();

    if (fireflies.group.visible) {
      for (const { mesh, base } of fireflies.particles) {
        mesh.position.y = base.y + Math.sin(elapsed * base.speed + base.phase) * 0.16;
        mesh.position.x = base.x + Math.cos(elapsed * base.speed * 0.7 + base.phase) * 0.14;
        mesh.lookAt(cameraRig.position);
      }
    }

    for (const actor of Object.values(actors)) {
      const pulse = actor.pose === "talk" ? 7.5 : actor.pose === "walk" ? 6.5 : actor.pose === "cheer" ? 5 : 2.2;
      const frameIdx = Math.floor(elapsed * pulse) % 4;
      if (actor.customFrames?.length) {
        applyTexture(actor, actor.customFrames[Math.floor(elapsed * pulse) % actor.customFrames.length].texture);
      } else if (actor.style === "pixel") {
        applyTexture(actor, pixelLibrary[actor.pixelPreset][actor.pose][frameIdx].texture);
      } else {
        applyTexture(actor, actor.frames[frameIdx]);
      }
      actor.mesh.position.x = actor.posX;
      actor.mesh.position.z = actor.posZ;
      const signX = actor.flipX ? -1 : 1;
      actor.mesh.scale.set(signX * actor.scale, actor.scale, actor.scale);
      const dx = cameraRig.position.x - actor.posX;
      const dz = cameraRig.position.z - actor.posZ;
      actor.mesh.rotation.y = Math.atan2(dx, dz);
    }

    renderer.render(scene, cameraRig);
  }

  function loop(time) {
    if (disposed) return;
    frameHandle = requestAnimationFrame(loop);
    renderAt(time / 1000);
  }

  applyWorld(activeWorld.id);
  cameraRig.position.set(...activeCamera.pos);
  controls.target.set(...activeCamera.target);
  controls.update();
  frameHandle = requestAnimationFrame(loop);

  // ------------------------------------------------- skit cues & HUD overlay
  const overlay = document.createElement("div");
  overlay.className = "film-overlay";
  overlay.innerHTML = `
    <div class="film-crt" aria-hidden="true"></div>
    <div class="film-state" aria-hidden="true">
      <span class="film-state-dot"></span>
      <span class="film-state-label">IDLE</span>
    </div>
    <div class="film-subtitle">
      <span class="film-speaker"></span>
      <p class="film-line"></p>
    </div>
    <div class="film-transport">
      <button type="button" class="film-btn film-btn--play">
        <span class="film-play-icon">▶</span><span class="film-play-text">PLAY</span>
      </button>
      <button type="button" class="film-btn film-btn--reset"><span>↺</span><span>RESET</span></button>
    </div>
  `;
  container.appendChild(overlay);

  const subtitleEl = overlay.querySelector(".film-subtitle");
  const speakerEl = overlay.querySelector(".film-speaker");
  const lineEl = overlay.querySelector(".film-line");
  const stateDotEl = overlay.querySelector(".film-state-dot");
  const stateLabelEl = overlay.querySelector(".film-state-label");
  const playBtn = overlay.querySelector(".film-btn--play");
  const playIconEl = overlay.querySelector(".film-play-icon");
  const playTextEl = overlay.querySelector(".film-play-text");
  const resetBtn = overlay.querySelector(".film-btn--reset");

  let skitCues = [];
  let isPlayingSkit = false;
  let skitTimer = null;
  let currentCueIndex = 0;

  function notifySkit() {
    const cue = skitCues[currentCueIndex] ?? null;
    onSkit?.({
      playing: isPlayingSkit,
      cueIndex: currentCueIndex,
      speaker: cue?.speaker ?? "",
      text: cue?.text ?? "",
    });
  }

  function updateTransportUI() {
    stateLabelEl.textContent = isPlayingSkit ? "PLAYING" : "IDLE";
    stateDotEl.classList.toggle("is-live", isPlayingSkit);
    playIconEl.textContent = isPlayingSkit ? "⏸" : "▶";
    playTextEl.textContent = isPlayingSkit ? "PAUSE" : "PLAY";
  }

  function applyCue(cue) {
    if (!cue) return;
    speakerEl.textContent = cue.speaker || "NARRATOR";
    lineEl.textContent = cue.text || "";

    for (const actor of [actors.left, actors.right]) {
      if (actor.pose !== "idle") setActorPose(actor, "idle");
    }
    if (cue.actor === "left") setActorPose(actors.left, cue.anim);
    else if (cue.actor === "right") setActorPose(actors.right, cue.anim);
    else if (cue.actor === "both") {
      setActorPose(actors.left, cue.anim);
      setActorPose(actors.right, cue.anim);
    }
    if (cue.cam) applyCamera(cue.cam);
    notifySkit();
  }

  function stopSkit() {
    isPlayingSkit = false;
    if (skitTimer) {
      clearTimeout(skitTimer);
      skitTimer = null;
    }
    for (const actor of [actors.left, actors.right]) {
      if (actor.pose !== "idle") setActorPose(actor, "idle");
    }
    updateTransportUI();
    notifySkit();
  }

  function playSkit() {
    if (!skitCues.length) return;
    isPlayingSkit = true;
    updateTransportUI();
    const step = () => {
      if (!isPlayingSkit) return;
      if (currentCueIndex >= skitCues.length) {
        currentCueIndex = 0;
        stopSkit();
        return;
      }
      applyCue(skitCues[currentCueIndex]);
      currentCueIndex += 1;
      const duration = skitCues[currentCueIndex - 1]?.duration ?? 2600;
      skitTimer = setTimeout(step, duration);
    };
    step();
  }

  function resetStage() {
    stopSkit();
    currentCueIndex = 0;
    resetActorTransform(actors.left);
    resetActorTransform(actors.right);
    actors.left.flipX = false;
    actors.right.flipX = false;
    applyCamera("wide");
    if (skitCues[0]) applyCue(skitCues[0]);
    notifySkit();
  }

  const onPlayClick = () => (isPlayingSkit ? stopSkit() : playSkit());
  const onResetClick = () => resetStage();
  playBtn.addEventListener("click", onPlayClick);
  resetBtn.addEventListener("click", onResetClick);

  function setOverlay({ crt = true, subtitles = true, hud = true } = {}) {
    overlay.classList.toggle("film-crt--off", !crt);
    subtitleEl.classList.toggle("film-subtitle--off", !subtitles);
    container.classList.toggle("film-hud-off", !hud);
  }

  updateTransportUI();

  // Deterministic hook for the future Playwright frame stepper.
  const previousRenderFrame = window.renderFrame;
  window.renderFrame = (time = 0) => {
    lerping = false;
    cameraRig.position.copy(targetPosition);
    controls.target.copy(targetTarget);
    elapsed = Math.max(0, Number(time) || 0);
    lastTime = elapsed;
    renderAt(elapsed);
  };

  return {
    setWorld: applyWorld,
    setCamera: applyCamera,
    setCast,
    setActorPose: (slot, anim) => {
      const actor = actors[slot];
      if (actor) setActorPose(actor, anim);
    },
    setActorTransform,
    loadSpriteSheet,
    setCues(cues = []) {
      skitCues = Array.isArray(cues) ? cues : [];
    },
    applyCue(index) {
      const cue = skitCues[index];
      if (cue) applyCue(cue);
      return cue ?? null;
    },
    previewCue(index) {
      const cue = skitCues[index];
      if (cue) {
        isPlayingSkit = false;
        if (skitTimer) {
          clearTimeout(skitTimer);
          skitTimer = null;
        }
        updateTransportUI();
        applyCue(cue);
      }
      return cue ?? null;
    },
    playSkit,
    stopSkit,
    resetStage,
    zoomIn,
    zoomOut,
    resetZoom,
    setOverlay,
    getSkitState() {
      return {
        playing: isPlayingSkit,
        cueIndex: currentCueIndex,
        cueCount: skitCues.length,
      };
    },
    getState() {
      return {
        world: activeWorld.id,
        camera: activeCamera.id,
        cast: {
          left: { style: actors.left.style, presetId: actors.left.presetId, pixelPreset: actors.left.pixelPreset, pose: actors.left.pose },
          right: { style: actors.right.style, presetId: actors.right.presetId, pixelPreset: actors.right.pixelPreset, pose: actors.right.pose },
        },
      };
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frameHandle);
      observer.disconnect();
      canvas.removeEventListener("wheel", onWheelZoom);
      controls.dispose();
      if (skitTimer) clearTimeout(skitTimer);
      playBtn.removeEventListener("click", onPlayClick);
      resetBtn.removeEventListener("click", onResetClick);
      overlay.remove();
      if (previousRenderFrame) {
        window.renderFrame = previousRenderFrame;
      } else {
        delete window.renderFrame;
      }
      disposer(scene);
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
