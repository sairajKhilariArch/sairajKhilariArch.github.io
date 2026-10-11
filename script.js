import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js";

const canvas = document.getElementById("three-bg");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x05070d, 0.075);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 1.5, 7);

const grid = new THREE.GridHelper(40, 60, 0x58f2c7, 0x1b2b3a);
grid.material.transparent = true;
grid.material.opacity = 0.25;
grid.position.y = -2;
scene.add(grid);

const particlesGeometry = new THREE.BufferGeometry();
const particleCount = 900;
const positions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 24;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 24;
}

particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);

const particlesMaterial = new THREE.PointsMaterial({
  color: 0x58f2c7,
  size: 0.045,
  transparent: true,
  opacity: 0.75
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

const wireframe = new THREE.Mesh(
  new THREE.IcosahedronGeometry(2.2, 1),
  new THREE.MeshBasicMaterial({
    color: 0x7aa2ff,
    wireframe: true,
    transparent: true,
    opacity: 0.25
  })
);
wireframe.position.set(3.5, 1.2, -2);
scene.add(wireframe);

const mouse = { x: 0, y: 0 };

window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);

  const time = performance.now() * 0.001;

  particles.rotation.y = time * 0.04;
  wireframe.rotation.x = time * 0.18;
  wireframe.rotation.y = time * 0.12;

  camera.position.x += (mouse.x * 1.2 - camera.position.x) * 0.03;
  camera.position.y += (1.5 + mouse.y * 0.6 - camera.position.y) * 0.03;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
}

animate();

document.getElementById("year").textContent = new Date().getFullYear();
