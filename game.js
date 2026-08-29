import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.179.1/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 30, 140);

const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 500);
camera.position.set(0, 5, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
document.querySelector('#game').appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x557755, 2));
const sun = new THREE.DirectionalLight(0xffffff, 3);
sun.position.set(20, 30, 10);
sun.castShadow = true;
scene.add(sun);

// Starter world
const ground = new THREE.Mesh(
  new THREE.BoxGeometry(100, 1, 100),
  new THREE.MeshStandardMaterial({ color: 0x4caf50 })
);
ground.position.y = -0.5;
ground.receiveShadow = true;
scene.add(ground);

// Load the included Joytopia player model.
const player = new THREE.Group();
player.position.set(0, 0, 0);
scene.add(player);

new GLTFLoader().load(
  './jergplr.glb',
  (gltf) => {
    const model = gltf.scene;
    model.scale.setScalar(1);
    model.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    player.add(model);
  },
  undefined,
  (error) => console.warn('Player model could not be loaded:', error)
);

const keys = new Set();
addEventListener('keydown', (e) => keys.add(e.key.toLowerCase()));
addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let grounded = true;
let last = performance.now();

function update(dt) {
  direction.set(0, 0, 0);
  if (keys.has('w') || keys.has('arrowup')) direction.z -= 1;
  if (keys.has('s') || keys.has('arrowdown')) direction.z += 1;
  if (keys.has('a') || keys.has('arrowleft')) direction.x -= 1;
  if (keys.has('d') || keys.has('arrowright')) direction.x += 1;
  if (direction.lengthSq() > 0) direction.normalize();

  const speed = 8;
  velocity.x = THREE.MathUtils.lerp(velocity.x, direction.x * speed, Math.min(1, dt * 10));
  velocity.z = THREE.MathUtils.lerp(velocity.z, direction.z * speed, Math.min(1, dt * 10));

  if ((keys.has(' ') || keys.has('space')) && grounded) {
    velocity.y = 10;
    grounded = false;
  }

  velocity.y -= 24 * dt;
  player.position.addScaledVector(velocity, dt);

  if (player.position.y <= 0) {
    player.position.y = 0;
    velocity.y = 0;
    grounded = true;
  }

  if (direction.lengthSq() > 0) {
    const target = Math.atan2(direction.x, direction.z);
    player.rotation.y = THREE.MathUtils.lerp(player.rotation.y, target, Math.min(1, dt * 12));
  }

  const cameraOffset = new THREE.Vector3(0, 5, 10).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotation.y);
  const targetCamera = player.position.clone().add(cameraOffset);
  camera.position.lerp(targetCamera, Math.min(1, dt * 6));
  camera.lookAt(player.position.x, player.position.y + 1.5, player.position.z);
}

function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  update(dt);
  renderer.render(scene, camera);
}

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

requestAnimationFrame(animate);
