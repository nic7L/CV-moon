import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const MODEL_URLS = {
  astronaut: 'https://cdn.jsdelivr.net/gh/nasa/NASA-3D-Resources@master/3D%20Models/Astronaut/Astronaut.glb',
  shuttle: 'https://cdn.jsdelivr.net/gh/nasa/NASA-3D-Resources@master/3D%20Models/Space%20Shuttle%20%28A%29/Space%20Shuttle%20%28A%29.glb',
  rover: 'https://cdn.jsdelivr.net/gh/nasa/NASA-3D-Resources@master/3D%20Models/Mars%202020%20Perseverance%20Rover/Mars%202020%20Perseverance%20Rover.glb'
};
const TEXTURE_URLS = {
  moon: 'https://threejs.org/examples/textures/planets/moon_1024.jpg',
  earth: 'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
  earthNormal: 'https://threejs.org/examples/textures/planets/earth_normal_2048.jpg'
};

const canvas = document.getElementById('webgl-canvas');
const loadingScreen = document.getElementById('loading-screen');
const sections = [...document.querySelectorAll('.panel')];
const currentSectionLabel = document.getElementById('current-section');
const scrollProgress = document.getElementById('scroll-progress');
const navToggle = document.querySelector('.nav-toggle');
const mobileNav = document.querySelector('.mobile-nav');
const parallaxLayers = [...document.querySelectorAll('.parallax-layer')];

navToggle?.addEventListener('click', () => {
  const hidden = mobileNav.hasAttribute('hidden');
  if (hidden) mobileNav.removeAttribute('hidden');
  else mobileNav.setAttribute('hidden', '');
});
[...document.querySelectorAll('.mobile-nav a')].forEach(link => {
  link.addEventListener('click', () => mobileNav.setAttribute('hidden', ''));
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.14 });
[...document.querySelectorAll('.reveal-up')].forEach(el => revealObserver.observe(el));

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x04060c, 0.025);
const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 300);
camera.position.set(0, 0.2, 8.8);

const textureLoader = new THREE.TextureLoader();
const moonTexture = textureLoader.load(TEXTURE_URLS.moon);
const earthTexture = textureLoader.load(TEXTURE_URLS.earth);
const earthNormal = textureLoader.load(TEXTURE_URLS.earthNormal);
moonTexture.colorSpace = THREE.SRGBColorSpace;
earthTexture.colorSpace = THREE.SRGBColorSpace;

scene.add(new THREE.AmbientLight(0x7a95dd, 0.62));
const keyLight = new THREE.DirectionalLight(0xffffff, 2.85);
keyLight.position.set(7, 5, 6);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
scene.add(keyLight);
const fillLight = new THREE.PointLight(0x72dfff, 1.7, 35, 1.5);
fillLight.position.set(-8, -2.5, 2.2);
scene.add(fillLight);
const backLight = new THREE.PointLight(0x8aa6ff, 1.4, 30, 1.8);
backLight.position.set(0, 2, -8);
scene.add(backLight);

const starGeo = new THREE.BufferGeometry();
const starCount = 4000;
const starPos = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  const radius = 28 + Math.random() * 95;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  starPos[i*3] = radius * Math.sin(phi) * Math.cos(theta);
  starPos[i*3+1] = radius * Math.sin(phi) * Math.sin(theta);
  starPos[i*3+2] = radius * Math.cos(phi);
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
  color: 0xffffff, size: 0.08, transparent: true, opacity: 0.92, sizeAttenuation: true
}));
scene.add(stars);

const moonPivot = new THREE.Group();
scene.add(moonPivot);
const moon = new THREE.Mesh(
  new THREE.SphereGeometry(2.05, 128, 128),
  new THREE.MeshStandardMaterial({
    map: moonTexture,
    bumpMap: moonTexture,
    bumpScale: 0.09,
    roughness: 0.98,
    metalness: 0.03
  })
);
moon.receiveShadow = true;
moon.castShadow = true;
moonPivot.add(moon);

const moonGlow = new THREE.Mesh(
  new THREE.SphereGeometry(2.22, 64, 64),
  new THREE.MeshBasicMaterial({ color: 0xdce8ff, transparent: true, opacity: 0.06 })
);
moonPivot.add(moonGlow);

const orbitRing = new THREE.Mesh(
  new THREE.TorusGeometry(3.15, 0.009, 18, 200),
  new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.16 })
);
orbitRing.rotation.x = Math.PI / 2.18;
orbitRing.rotation.z = 0.44;
moonPivot.add(orbitRing);

const earthGroup = new THREE.Group();
const earth = new THREE.Mesh(
  new THREE.SphereGeometry(1.15, 64, 64),
  new THREE.MeshStandardMaterial({ map: earthTexture, normalMap: earthNormal, roughness: 0.84, metalness: 0.02 })
);
const earthAtmos = new THREE.Mesh(
  new THREE.SphereGeometry(1.23, 48, 48),
  new THREE.MeshBasicMaterial({ color: 0x74c7ff, transparent: true, opacity: 0.12 })
);
earthGroup.add(earth, earthAtmos);
earthGroup.position.set(-5.4, 2.75, -8.8);
scene.add(earthGroup);

const moonDustGeo = new THREE.BufferGeometry();
const dustCount = 900;
const dustPos = new Float32Array(dustCount * 3);
for (let i = 0; i < dustCount; i++) {
  const a = Math.random() * Math.PI * 2;
  const r = 2.25 + Math.random() * 0.55;
  dustPos[i*3] = Math.cos(a) * r;
  dustPos[i*3+1] = -1.58 + Math.random() * 0.38;
  dustPos[i*3+2] = Math.sin(a) * (0.55 + Math.random() * 0.45);
}
moonDustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
const moonDust = new THREE.Points(moonDustGeo, new THREE.PointsMaterial({ color: 0xe7dccb, size: 0.022, transparent: true, opacity: 0.6 }));
moonPivot.add(moonDust);

const trailMaterial = new THREE.LineBasicMaterial({ color: 0x9ee8ff, transparent: true, opacity: 0.35 });
function makeTrail(radiusX, radiusZ, yOffset, segments = 140) {
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(t) * radiusX, yOffset, Math.sin(t) * radiusZ));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  return new THREE.LineLoop(geo, trailMaterial);
}
const shuttleTrail = makeTrail(4.15, 3.1, 0.7);
const astronautTrail = makeTrail(3.05, 2.15, 1.0);
moonPivot.add(shuttleTrail, astronautTrail);

const satelliteGroup = new THREE.Group();
for (let i = 0; i < 5; i++) {
  const sat = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.05, 0.12),
    new THREE.MeshBasicMaterial({ color: i % 2 ? 0xfff2ab : 0x87e3ff })
  );
  sat.userData = {
    angle: (Math.PI * 2 / 5) * i,
    radius: 5.4 + Math.random() * 1.2,
    speed: 0.12 + Math.random() * 0.05,
    y: -0.4 + Math.random() * 1.8
  };
  satelliteGroup.add(sat);
}
scene.add(satelliteGroup);

const gltfLoader = new GLTFLoader();
const mixers = [];
const modelRoots = { astronaut: null, shuttle: null, rover: null };

function setShadows(root) {
  root.traverse((obj) => {
    if (obj.isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(mat => { if ('envMapIntensity' in mat) mat.envMapIntensity = 1.25; });
        else if ('envMapIntensity' in obj.material) obj.material.envMapIntensity = 1.25;
      }
    }
  });
}

function makeFallback(kind) {
  const group = new THREE.Group();
  const white = new THREE.MeshStandardMaterial({ color: 0xf1f4ff, roughness: 0.45, metalness: 0.18 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x242d3f, roughness: 0.72, metalness: 0.25 });
  if (kind === 'astronaut') {
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.36, 8, 16), white);
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 20), white);
    helmet.position.y = 0.34;
    const visor = new THREE.Mesh(new THREE.SphereGeometry(0.09, 18, 18), new THREE.MeshStandardMaterial({ color: 0xb58742, roughness: 0.2, metalness: 0.8 }));
    visor.position.set(0.03, 0.01, 0.11); helmet.add(visor);
    group.add(body, helmet);
  } else if (kind === 'shuttle') {
    const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.14, 1.05, 16), white); fuselage.rotation.z = Math.PI / 2;
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.04, 0.28), white);
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.24, 14), white); nose.position.x = 0.65; nose.rotation.z = -Math.PI / 2;
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.02, 0.18), dark); top.position.set(0.1, 0.1, 0);
    group.add(fuselage, wing, nose, top);
  } else if (kind === 'rover') {
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.12, 0.32), new THREE.MeshStandardMaterial({ color: 0xd8cea5, roughness: 0.7 }));
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.3, 8), white); mast.position.set(0.08, 0.2, 0);
    group.add(base, mast);
  }
  setShadows(group);
  return group;
}

function loadModel(kind, onReady) {
  gltfLoader.load(
    MODEL_URLS[kind],
    (gltf) => {
      const root = gltf.scene || gltf.scenes?.[0];
      if (!root) return onReady(makeFallback(kind));
      setShadows(root);
      if (gltf.animations?.length) {
        const mixer = new THREE.AnimationMixer(root);
        gltf.animations.forEach(clip => mixer.clipAction(clip).play());
        mixers.push(mixer);
      }
      onReady(root);
    },
    undefined,
    () => onReady(makeFallback(kind))
  );
}

const astronautOrbit = new THREE.Group();
moonPivot.add(astronautOrbit);
const shuttleOrbit = new THREE.Group();
moonPivot.add(shuttleOrbit);
const roverAnchor = new THREE.Group();
moonPivot.add(roverAnchor);

loadModel('astronaut', (model) => {
  normalizeAsset(model, 0.85);
  astronautOrbit.add(model);
  modelRoots.astronaut = model;
});
loadModel('shuttle', (model) => {
  normalizeAsset(model, 1.60);
  shuttleOrbit.add(model);
  modelRoots.shuttle = model;
});
loadModel('rover', (model) => {
  normalizeAsset(model, 0.75);
  roverAnchor.add(model);
  modelRoots.rover = model;
});

// Normalize imported NASA model scale and origin for the 3D portfolio scene.
function normalizeAsset(model, desiredExtent) {
  model.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(model);
  if (bounds.isEmpty()) return;
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const longest = Math.max(size.x, size.y, size.z, 0.00001);
  model.position.sub(center);
  model.scale.multiplyScalar(desiredExtent / longest);
}
const cameraTargets = [
  { x: 0, y: 0.25, z: 8.8, look: new THREE.Vector3(0, 0.1, 0) },
  { x: -1.35, y: 0.75, z: 6.6, look: new THREE.Vector3(0.32, 0.08, 0) },
  { x: 1.35, y: -0.1, z: 6.1, look: new THREE.Vector3(-0.2, 0.05, 0) },
  { x: 0.35, y: 0.2, z: 5.45, look: new THREE.Vector3(0, 0.02, 0) },
  { x: -0.95, y: -0.62, z: 6.25, look: new THREE.Vector3(0.05, -0.18, 0) },
  { x: 0.72, y: 0.52, z: 7.2, look: new THREE.Vector3(0, 0.15, 0) }
];
let activeScene = 0;
const cameraLook = new THREE.Vector3(0, 0.1, 0);
let mouseOffset = new THREE.Vector2(0, 0);
let smoothMouse = new THREE.Vector2(0, 0);
let dragging = false;
let prevX = 0;
let prevY = 0;

function updateActiveSection() {
  const mid = window.innerHeight * 0.5;
  let current = sections[0];
  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    const active = rect.top <= mid && rect.bottom >= mid;
    section.classList.toggle('active', active);
    if (active) current = section;
  });
  activeScene = Number(current.dataset.sceneIndex || 0);
  currentSectionLabel.textContent = current.dataset.sectionName || 'Hero';
}

function updateScrollUI() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const p = max > 0 ? window.scrollY / max : 0;
  scrollProgress.style.transform = `scaleY(${p})`;
}

function updateParallax() {
  const centerY = window.innerHeight / 2;
  parallaxLayers.forEach(layer => {
    const speed = Number(layer.dataset.parallax || 0.1);
    const rect = layer.getBoundingClientRect();
    const offset = (rect.top + rect.height / 2 - centerY) * speed;
    layer.style.transform = `translate3d(0, ${-offset}px, 0)`;
  });
}

window.addEventListener('scroll', () => {
  updateActiveSection();
  updateScrollUI();
  updateParallax();
});
updateActiveSection();
updateScrollUI();
updateParallax();

window.addEventListener('pointermove', (e) => {
  const x = (e.clientX / window.innerWidth) * 2 - 1;
  const y = (e.clientY / window.innerHeight) * 2 - 1;
  mouseOffset.set(x * 0.4, y * 0.22);
  if (dragging) {
    moonPivot.rotation.y += (e.clientX - prevX) * 0.003;
    moonPivot.rotation.x += (e.clientY - prevY) * 0.0012;
    prevX = e.clientX;
    prevY = e.clientY;
  }
});
canvas.addEventListener('pointerdown', (e) => { dragging = true; prevX = e.clientX; prevY = e.clientY; });
window.addEventListener('pointerup', () => dragging = false);
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  updateParallax();
});

const clock = new THREE.Clock();
let elapsed = 0;
function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();
  elapsed += dt;
  const t = elapsed;
  mixers.forEach(mixer => mixer.update(dt));

  smoothMouse.lerp(mouseOffset, 0.035);
  const target = cameraTargets[activeScene];
  camera.position.x += ((target.x + smoothMouse.x) - camera.position.x) * 0.045;
  camera.position.y += ((target.y - smoothMouse.y) - camera.position.y) * 0.045;
  camera.position.z += (target.z - camera.position.z) * 0.045;
  cameraLook.lerp(target.look, 0.045);
  camera.lookAt(cameraLook);

  keyLight.position.x = 6.8 + Math.cos(t * 0.15) * 0.4;
  keyLight.position.y = 5.0 + Math.sin(t * 0.2) * 0.2;

  stars.rotation.y += 0.00018;
  earth.rotation.y += 0.0017;
  earthGroup.rotation.z = Math.sin(t * 0.12) * 0.08;
  moon.rotation.y += 0.0008;
  moonGlow.scale.setScalar(1 + Math.sin(t * 1.15) * 0.012);
  moonDust.rotation.y += 0.0015;

  astronautOrbit.rotation.y = t * 0.48;
  astronautOrbit.rotation.x = 0.55;
  if (modelRoots.astronaut) {
    modelRoots.astronaut.position.set(Math.cos(t * 0.48) * 3.05, 1.0 + Math.sin(t * 0.48) * 0.6, Math.sin(t * 0.48) * 2.1);
    modelRoots.astronaut.lookAt(moon.position);
    modelRoots.astronaut.rotation.z += 0.01;
  }

  shuttleOrbit.rotation.y = -t * 0.24 + 0.6;
  shuttleOrbit.rotation.z = 0.42;
  if (modelRoots.shuttle) {
    modelRoots.shuttle.position.set(Math.cos(t * 0.24) * 4.1, 0.85 + Math.sin(t * 0.24) * 0.85, Math.sin(t * 0.24) * 3.0);
    modelRoots.shuttle.lookAt(moon.position);
    modelRoots.shuttle.rotation.z += 0.006;
  }

  roverAnchor.rotation.y = 0.72;
  if (modelRoots.rover) {
    modelRoots.rover.position.set(0.42 + Math.sin(t * 0.28) * 0.22, -1.87, 1.52 + Math.cos(t * 0.34) * 0.12);
    modelRoots.rover.rotation.y = -Math.PI / 5 + Math.sin(t * 0.28) * 0.22;
  }

  satelliteGroup.children.forEach((sat, i) => {
    const d = sat.userData;
    const a = d.angle + t * d.speed;
    sat.position.set(Math.cos(a) * d.radius, d.y + Math.sin(a * 1.5) * 0.16, Math.sin(a) * d.radius * 0.7 - 8);
    sat.scale.setScalar(0.9 + Math.sin(t * 2 + i) * 0.15);
  });

  renderer.render(scene, camera);
}
animate();

window.addEventListener('load', () => {
  setTimeout(() => loadingScreen.classList.add('hidden'), 900);
});