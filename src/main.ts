import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import spriteTextureUrl from "/out-horizontal-correct.png";
import * as dat from "lil-gui";
import Stats from "stats.js";

// Monitor performance
const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

// Canvas
const canvas: HTMLElement | null = document.querySelector("canvas#webgl");

if (!canvas) {
  throw new Error(
    'You need to have a canvas element with the id "webgl" in your html document'
  );
}

// Scene
const scene = new THREE.Scene();

// Texture
const tilesHoriz = 4;
const textureLoader = new THREE.TextureLoader();
const spriteTexture = textureLoader.load(spriteTextureUrl);

spriteTexture.repeat.set(1 / tilesHoriz, 1);

const gui = new dat.GUI();
gui
  .add(spriteTexture.offset, "x", 0, 1, 1 / tilesHoriz)
  .name("offsetX")
  .listen();

// Sprite
const spriteMaterial = new THREE.SpriteMaterial({
  map: spriteTexture,
  transparent: true,
});
const sprite = new THREE.Sprite(spriteMaterial);
scene.add(sprite);

const planeGeometry = new THREE.PlaneGeometry(2, 2);
const planeMaterial = new THREE.MeshBasicMaterial({
  color: 0x2ec27e,
  wireframe: false,
  side: THREE.DoubleSide,
});

const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(planeMesh);
planeMesh.position.z = -2;

// Lights
const ambientLight = new THREE.AmbientLight("#5b4269", 1);
scene.add(ambientLight);

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor("#312f4c");

// Animate
const clock = new THREE.Clock();

const spriteParams = {
  framesPerSecond: 9,
};

/** The time between switching frames of the flame animation in seconds. */
let showNewFrame = 1 / spriteParams.framesPerSecond;

gui.add(spriteParams, "framesPerSecond", 1, 30, 1).onChange((v: number) => {
  showNewFrame = 1 / v;
});

let flameTimeTracker = 0;

const tick = () => {
  stats.begin();
  // `clock.getDelta()` will return the seconds passed since the last call (in this case).
  const deltaTime = clock.getDelta();

  flameTimeTracker += deltaTime;

  if (flameTimeTracker >= showNewFrame) {
    flameTimeTracker = 0;
    spriteTexture.offset.x =
      spriteTexture.offset.x === 1 - 1 / tilesHoriz
        ? 0
        : spriteTexture.offset.x + 0.25;
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  stats.end();
  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
