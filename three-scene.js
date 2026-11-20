import * as THREE from "three";

(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const container = document.getElementById("art-canvas");
  if (!container || reduceMotion) return;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x080b12);

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = container.clientWidth;
  const height = container.clientHeight;
  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
  camera.position.set(0, 0.4, 7.2);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(dpr);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // ---- Lights ----
  const ambient = new THREE.AmbientLight(0x444666, 0.55);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xd8ecf7, 1.6);
  key.position.set(2.5, 3.2, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x80e7f3, 0.6);
  fill.position.set(-3, 1, -4);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xb8a1ff, 0.35);
  rim.position.set(0, -2.2, -5);
  scene.add(rim);

  // ---- Ground ring (shadow catcher) ----
  const ringGeo = new THREE.RingGeometry(2.7, 3.5, 64);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0x80e7f3,
    roughness: 0.8,
    metalness: 0.1,
    transparent: true,
    opacity: 0.12,
    side: THREE.DoubleSide,
  });
  const ground = new THREE.Mesh(ringGeo, ringMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.05;
  ground.receiveShadow = true;
  scene.add(ground);

  // ---- Core group ----
  const coreGroup = new THREE.Group();
  scene.add(coreGroup);

  // outer glow
  const glowMat = new THREE.MeshBasicMaterial({ color: 0x80e7f3, transparent: true, opacity: 0.16 });
  const glowMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.35, 1), glowMat);
  coreGroup.add(glowMesh);

  // core sphere
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x80e7f3,
    emissive: 0x80e7f3,
    emissiveIntensity: 1.1,
    metalness: 0.3,
    roughness: 0.2,
  });
  const coreMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.0, 1), coreMat);
  coreGroup.add(coreMesh);

  // orbiting rings
  const ringMat2 = new THREE.MeshStandardMaterial({
    color: 0x80e7f3,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
    roughness: 0.5,
  });
  const r1 = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.05, 16, 48), ringMat2);
  r1.rotation.x = Math.PI / 2;
  r1.position.y = 0.55;
  coreGroup.add(r1);

  const r2 = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.05, 16, 48), ringMat2);
  r2.rotation.z = Math.PI / 2;
  r2.position.y = -0.55;
  coreGroup.add(r2);

  // ---- Orbital nodes & connectors ----
  const nodeGeo = new THREE.SphereGeometry(0.16, 12, 12);
  const nodeMat = new THREE.MeshStandardMaterial({
    color: 0xc3f584,
    emissive: 0xc3f584,
    emissiveIntensity: 0.8,
    metalness: 0.1,
    roughness: 0.35,
  });

  const orbits = [
    { type: "y", radius: 2.45, count: 5, phase: 0.3, speed: 0.55 },
    { type: "x", radius: 3.05, count: 4, phase: 1.7, speed: 0.42 },
    { type: "z", radius: 2.05, count: 5, phase: 3.2, speed: 0.68 },
    { type: "y", radius: 3.6, count: 3, phase: 0.8, speed: 0.48 },
    { type: "x", radius: 2.65, count: 4, phase: 2.5, speed: 0.58 },
  ];

  const nodeList = [];
  for (const orbit of orbits) {
    for (let i = 0; i < orbit.count; i++) {
      const theta = orbit.phase + (i / orbit.count) * Math.PI * 2;
      const mesh = new THREE.Mesh(nodeGeo, nodeMat);
      mesh.castShadow = true;
      coreGroup.add(mesh);

      // pre-init the connector geometry with two points so attributes.position exists
      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 0], 3));
      const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0x80e7f3, transparent: true, opacity: 0.35 }));
      coreGroup.add(line);

      nodeList.push({ mesh, line, theta, radius: orbit.radius, type: orbit.type, speed: orbit.speed });
    }
  }

  // ---- Starfield ----
  const starCount = 1400;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 20 + Math.random() * 45;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    starPos[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
    starPos[i * 3 + 1] = Math.cos(phi) * r;
    starPos[i * 3 + 2] = Math.sin(theta) * Math.sin(phi) * r;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0x80e7f3,
    size: 0.06,
    transparent: true,
    opacity: 0.7,
    sizeAttenuation: true,
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // ---- Animation loop ----
  const clock = new THREE.Clock();

  const render = () => {
    const t = clock.getElapsedTime();

    for (const n of nodeList) {
      n.theta += n.speed * t;
      let x, y, z;
      if (n.type === "y") {
        x = Math.cos(n.theta) * n.radius;
        z = Math.sin(n.theta) * n.radius;
      } else if (n.type === "x") {
        y = Math.cos(n.theta) * n.radius;
        z = Math.sin(n.theta) * n.radius;
      } else {
        x = Math.cos(n.theta) * n.radius;
        y = Math.sin(n.theta) * n.radius;
      }
      n.mesh.position.set(x, y, z);

      const c = n.line.geometry.attributes.position.array;
      c[0] = 0; c[1] = 0; c[2] = 0;
      c[3] = x; c[4] = y; c[5] = z;
      n.line.geometry.attributes.position.needsUpdate = true;
    }

    // rings rotating opposite directions
    r1.rotation.z += 0.006;
    r2.rotation.z -= 0.006;

    // core pulse
    const pulse = 1 + Math.sin(t * 2.3) * 0.06;
    coreMesh.scale.set(pulse, pulse, pulse);
    glowMesh.material.opacity = 0.12 + Math.sin(t * 2.3) * 0.06;

    // gentle system roll
    coreGroup.rotation.z += 0.0003;

    // slow camera orbit
    const camT = t * 0.08;
    camera.position.x = Math.sin(camT) * 7.2;
    camera.position.z = Math.cos(camT) * 7.2;
    camera.position.y = 0.35 + Math.sin(camT * 0.5) * 0.25;
    camera.lookAt(0, 0, 0);

    stars.rotation.y = 0.0006;
    renderer.render(scene, camera);

    // Drive the loop with a fixed-interval timer so the scene keeps advancing
    // even in environments where requestAnimationFrame is throttled or not fired.
    window.setTimeout(render, 16);
  };

  render();

  // ---- Resize ----
  window.addEventListener("resize", () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderer.setPixelRatio(dpr);
  });
})();
