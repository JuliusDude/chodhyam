// WebGL Canvas Effect (Morphing Dot Matrix - Distinct Cloud & PDF)
const canvas = document.getElementById('field');

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 2000);
camera.position.z = 700;
camera.position.x = -250; 

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const particlesCount = 12000;

// Generator for a highly distinctive Cloud Shape (Flat bottom, puffy top)
function getCloudPoints(count) {
    const pts = [];
    while (pts.length < count) {
        let x = (Math.random() - 0.5) * 2;
        let y = (Math.random() - 0.5) * 2;
        let z = (Math.random() - 0.5) * 2;
        if (x*x + y*y + z*z < 1) {
            let sphere = Math.random();
            let sx, sy, sz, sr;
            if (sphere < 0.35) {
                sx = 0; sy = 0; sz = 0; sr = 120; // Center
            } else if (sphere < 0.65) {
                sx = -90; sy = -20; sz = 15; sr = 75; // Left bump
            } else if (sphere < 0.85) {
                sx = 90; sy = -10; sz = -15; sr = 85; // Right bump
            } else {
                sx = 20; sy = 60; sz = 10; sr = 80; // Top bump
            }
            
            let px = sx + x * sr;
            let py = sy + y * sr;
            let pz = sz + z * sr;
            
            // Flatten the bottom to look like a classic cloud icon
            if (py < -40) {
                py = -40 + (Math.random() * 8); 
            }
            
            pts.push({ x: px, y: py, z: pz });
        }
    }
    return pts;
}

// Generator for a highly distinctive PDF Document Shape (Folded corner, text lines)
function getDocumentPoints(count) {
    const pts = [];
    const width = 160;
    const height = 220;
    for (let i = 0; i < count; i++) {
        let x = (Math.random() - 0.5) * width;
        let y = (Math.random() - 0.5) * height;
        let z = (Math.random() - 0.5) * 4; 
        
        // Simulating distinct text lines
        if (Math.random() < 0.6) {
            let line = Math.floor(Math.random() * 7);
            y = (height / 2) - 60 - (line * 24) + (Math.random() - 0.5) * 6;
            
            let lineWidth = width - 40;
            if (line === 0) lineWidth = width / 2; // Short title
            if (line === 6) lineWidth = width * 0.7; // Short last line
            
            let leftEdge = -width/2 + 20;
            x = leftEdge + Math.random() * lineWidth;
            z += 6; // Raise text slightly
        }

        // Folded top-right corner
        let corner = 50;
        let lx = x - (width/2 - corner);
        let ly = y - (height/2 - corner);
        if (lx > 0 && ly > 0 && lx + ly > corner) {
            // Reflect point across the diagonal line
            x = (width/2 - corner) + (corner - ly);
            y = (height/2 - corner) + (corner - lx);
            z += 8; // Pop the fold out
        }

        pts.push({ x, y, z });
    }
    return pts;
}

const cloudData = getCloudPoints(particlesCount);
const docData = getDocumentPoints(particlesCount);

const geometry = new THREE.BufferGeometry();
const posArray = new Float32Array(particlesCount * 3);
const colorsArray = new Float32Array(particlesCount * 3);
const currentPos = new Float32Array(particlesCount * 3);

const colorTeal = new THREE.Color('#14B8A6');
const colorPurple = new THREE.Color('#9333EA');
const colorBlue = new THREE.Color('#0F5AC8');

for(let i = 0; i < particlesCount; i++) {
    const i3 = i * 3;
    posArray[i3] = cloudData[i].x;
    posArray[i3+1] = cloudData[i].y;
    posArray[i3+2] = cloudData[i].z;
    
    currentPos[i3] = cloudData[i].x;
    currentPos[i3+1] = cloudData[i].y;
    currentPos[i3+2] = cloudData[i].z;

    // Rich gradient mixing
    let mix = Math.random();
    let c = colorTeal.clone();
    if (mix < 0.5) {
        c.lerp(colorBlue, mix * 2);
    } else {
        c = colorBlue.clone().lerp(colorPurple, (mix - 0.5) * 2);
    }
    colorsArray[i3] = c.r;
    colorsArray[i3+1] = c.g;
    colorsArray[i3+2] = c.b;
}

geometry.setAttribute('position', new THREE.BufferAttribute(currentPos, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

const material = new THREE.PointsMaterial({
    size: 3,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(geometry, material);
scene.add(particlesMesh);

let rawMouseX = 0;
let rawMouseY = 0;

document.addEventListener('mousemove', (event) => {
    rawMouseX = (event.clientX / window.innerWidth) * 2 - 1;
    rawMouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();
let transitionProgress = 0;

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Morph Logic (Switch every 6 seconds)
    const cycle = (elapsedTime % 12);
    let targetShape = cycle < 6 ? 0 : 1; // 0 = cloud, 1 = doc
    
    if (targetShape === 0) {
        transitionProgress -= 0.015;
    } else {
        transitionProgress += 0.015;
    }
    transitionProgress = Math.max(0, Math.min(1, transitionProgress));

    // Smooth cubic ease for morphing
    const t = transitionProgress < 0.5 ? 2 * transitionProgress * transitionProgress : 1 - Math.pow(-2 * transitionProgress + 2, 2) / 2;

    // Get Mouse World Position for Interactive Repulsion
    const vector = new THREE.Vector3(rawMouseX, rawMouseY, 0.5);
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const mouseWorldPos = camera.position.clone().add(dir.multiplyScalar(distance));

    const positions = particlesMesh.geometry.attributes.position.array;
    
    for(let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        
        let cx = cloudData[i].x;
        let cy = cloudData[i].y;
        let cz = cloudData[i].z;
        
        let dx = docData[i].x;
        let dy = docData[i].y;
        let dz = docData[i].z;
        
        // Target shape position
        let targetX = cx * (1 - t) + dx * t;
        let targetY = cy * (1 - t) + dy * t;
        let targetZ = cz * (1 - t) + dz * t;
        
        // Add subtle floating noise to keep it alive
        targetY += Math.sin(elapsedTime * 2 + i * 0.1) * 3;
        
        // Interactive Mouse Repulsion
        const localPos = new THREE.Vector3(targetX, targetY, targetZ);
        localPos.applyEuler(particlesMesh.rotation);
        
        const distToMouse = localPos.distanceTo(mouseWorldPos);
        const radius = 150; 
        
        if (distToMouse < radius) {
            const force = (radius - distToMouse) / radius;
            const pushDir = localPos.clone().sub(mouseWorldPos).normalize();
            
            // Explosive scatter away from cursor
            targetX += pushDir.x * force * 60;
            targetY += pushDir.y * force * 60;
            targetZ += pushDir.z * force * 60;
        }
        
        // Elastic snap-back to target positions
        positions[i3] += (targetX - positions[i3]) * 0.12;
        positions[i3+1] += (targetY - positions[i3+1]) * 0.12;
        positions[i3+2] += (targetZ - positions[i3+2]) * 0.12;
    }
    
    particlesMesh.geometry.attributes.position.needsUpdate = true;

    // Smooth whole-object rotation reacting to mouse
    let targetRotX = -(rawMouseY * 0.2);
    let targetRotY = (rawMouseX * 0.2) + (elapsedTime * 0.2); 
    
    particlesMesh.rotation.x += (targetRotX - particlesMesh.rotation.x) * 0.05;
    particlesMesh.rotation.y += (targetRotY - particlesMesh.rotation.y) * 0.05;

    renderer.render(scene, camera);
}

animate();

// GSAP Animations
gsap.registerPlugin(ScrollTrigger);

gsap.from(".display-lg", {
  y: 30,
  opacity: 0,
  duration: 1,
  ease: "power3.out",
  delay: 0.2
});

gsap.from("p, .btn-primary, nav", {
  y: 20,
  opacity: 0,
  duration: 1,
  stagger: 0.1,
  ease: "power2.out",
  delay: 0.5
});

// GSAP Dropdown Menu Interaction
const menuBtn = document.getElementById('menu-btn');
const menuTl = gsap.timeline({ paused: true, reversed: true });

menuTl.to("#dropdown-menu", {
  autoAlpha: 1, // Toggles visibility and opacity
  y: 0,
  duration: 0.5,
  ease: "power4.out"
})
.fromTo(".menu-link", {
  y: 20,
  opacity: 0
}, {
  y: 0,
  opacity: 1,
  duration: 0.4,
  stagger: 0.08,
  ease: "power3.out"
}, "-=0.3")
.to(".menu-divider", {
  opacity: 1,
  duration: 0.3
}, "-=0.2");

menuBtn.addEventListener("click", () => {
  if (menuTl.reversed()) {
    menuTl.play();
    menuBtn.textContent = "Close";
    menuBtn.classList.add("bg-white/20");
  } else {
    menuTl.reverse();
    menuBtn.textContent = "Menu";
    menuBtn.classList.remove("bg-white/20");
  }
});

// GSAP Scrollytelling Journey
let scrollProgress = 0; // Global variable for WebGL to read

const steps = document.querySelectorAll('.journey-step');

ScrollTrigger.create({
  trigger: '#journey',
  start: 'top top',
  end: 'bottom bottom',
  onUpdate: (self) => {
    scrollProgress = self.progress; 
    
    const currentStepIndex = Math.min(3, Math.floor(self.progress * 4));
    
    steps.forEach((step, i) => {
      if (i === currentStepIndex) {
        gsap.to(step, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
      } else {
        const yOffset = i < currentStepIndex ? -40 : 40;
        gsap.to(step, { autoAlpha: 0, y: yOffset, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
      }
    });
  }
});

