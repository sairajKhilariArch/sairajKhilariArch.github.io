import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js";

const archArt = `
                   -`
                  .o+`
                 `ooo/
                `+oooo:
               `+oooooo:
               -+oooooo+:
             `/:-:++oooo+:
            `/++++/+++++++:
           `/++++++++++++++:
          `/+++ooooooooooooo/`
         ./ooosssso++osssssso+`
        .oossssso-````/ossssss+`
       -osssssso.      :ssssssso.
      :osssssss/        osssso+++.
     /ossssssss/        +ssssooo/-
   `/ossssso+/:-        -:/+osssso+-
  `+sso+:-`                 `.-/+oso:
 `++:.                           `-/+/
 .`                                 `/
`;

const typedLines = [
  "whoami",
  "Rust-first developer · Python developer",
  "MCA student at Parul University",
  "Arch Linux user, btw",
  "Exploring game development & OS internals"
];

const asciiElement = document.getElementById("archAscii");
const typedElement = document.getElementById("typedText");

let asciiIndex = 0;

function typeAscii() {
  if (asciiIndex <= archArt.length) {
    asciiElement.textContent = archArt.slice(0, asciiIndex);
    asciiIndex++;
    setTimeout(typeAscii, 8);
  } else {
    typeCommand(0, 0);
  }
}

function typeCommand(lineIndex, charIndex) {
  if (lineIndex >= typedLines.length) {
    setTimeout(() => {
      typedElement.textContent = "";
      typeCommand(0, 0);
    }, 3200);
    return;
  }

  const line = typedLines[lineIndex];

  if (charIndex <= line.length) {
    typedElement.textContent = line.slice(0, charIndex);
    setTimeout(() => typeCommand(lineIndex, charIndex + 1), 38);
  } else {
    setTimeout(() => {
      typedElement.textContent = "";
      typeCommand(lineIndex + 1, 0);
    }, 1100);
  }
}

typeAscii();

const canvas = document.getElementById("three-bg");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x07050d, 0.08);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 1.5, 7);

const grid = new THREE.GridHelper(45, 70, 0x8b5cf6, 0x241a3d);
grid.material.transparent = true;
grid.material.opacity = 0.22;
grid.position.y = -2;
scene.add(grid);

const particleCount = 1000;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 26;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 26;
}

geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

const particles = new THREE.Points(
  geometry,
  new THREE.PointsMaterial({
    color: 0xf97316,
    size: 0.04,
    transparent: true,
    opacity: 0.7
  })
);
scene.add(particles);

const shapes = [];

for (let i = 0; i < 3; i++) {
  const mesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.6 + i * 0.35, 1),
    new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? 0x8b5cf6 : 0xf97316,
      wireframe: true,
      transparent: true,
      opacity: 0.18
    })
  );

  mesh.position.set(
    (i - 1) * 4.5,
    0.8 + i * 0.35,
    -2 - i * 1.2
  );

  shapes.push(mesh);
  scene.add(mesh);
}

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

  particles.rotation.y = time * 0.035;

  shapes.forEach((shape, index) => {
    shape.rotation.x = time * (0.12 + index * 0.03);
    shape.rotation.y = time * (0.09 + index * 0.025);
  });

  camera.position.x += (mouse.x * 1.3 - camera.position.x) * 0.03;
  camera.position.y += (1.5 + mouse.y * 0.65 - camera.position.y) * 0.03;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
}

animate();

document.getElementById("year").textContent = new Date().getFullYear();
