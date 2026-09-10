// Clean & Lightweight Dynamic HTTP Error Handler for Chodhyam
(function() {
  'use strict';

  // --- HTTP Error Definitions ---
  const ERROR_MAP = {
    '404': {
      code: '404',
      title: 'Page Not Found',
      description: 'The page or ephemeral session you are looking for does not exist or has expired.',
      color: 'rose'
    },
    '420': {
      code: '420',
      title: 'Enhance Your Calm',
      description: 'Rate limit reached. Please wait a few moments before issuing your next query.',
      color: 'amber'
    },
    '403': {
      code: '403',
      title: 'Access Forbidden',
      description: 'Access to this ephemeral document sandbox is restricted.',
      color: 'rose'
    },
    '410': {
      code: '410',
      title: 'Session Expired',
      description: 'The requested document buffer has been cryptographically purged and zeroed from memory.',
      color: 'teal'
    },
    '500': {
      code: '500',
      title: 'Server Error',
      description: 'An unexpected internal fault occurred. Please return to the main page to start fresh.',
      color: 'rose'
    },
    '503': {
      code: '503',
      title: 'Service Temporarily Unavailable',
      description: 'Local inference engine is temporarily busy. Please try again shortly.',
      color: 'amber'
    }
  };

  // --- DOM Elements ---
  const el = {
    errorCode: document.getElementById('error-code-display'),
    errorTitle: document.getElementById('error-title-display'),
    errorDesc: document.getElementById('error-desc-display')
  };

  // --- Three.js Subtle Ambient Background ---
  let particlesMesh, renderer, scene, camera;

  function initThreeErrorField() {
    const canvas = document.getElementById('error-field');
    if (!canvas || !window.THREE) return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 400;

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const particleCount = 1400;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 800;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 600;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 400;

      // Soft Teal/Cyan ambient glow
      colors[i * 3] = 0.08;
      colors[i * 3 + 1] = 0.72;
      colors[i * 3 + 2] = 0.65;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });

    particlesMesh = new THREE.Points(geometry, material);
    scene.add(particlesMesh);

    let clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      particlesMesh.rotation.y = t * 0.04;
      particlesMesh.rotation.x = Math.sin(t * 0.03) * 0.08;
      renderer.render(scene, camera);
    }
    animate();
  }

  // --- Display Configured Error ---
  function displayError(code) {
    const errorData = ERROR_MAP[code] || ERROR_MAP['404'];

    document.title = `${errorData.code} — ${errorData.title} | Chodhyam`;
    el.errorCode.textContent = errorData.code;
    el.errorTitle.textContent = errorData.title;
    el.errorDesc.textContent = errorData.description;

    if (window.gsap) {
      gsap.fromTo([el.errorCode, el.errorTitle, el.errorDesc],
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out' }
      );
    }
  }

  // --- Parse URL Query ---
  function getCodeFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code && ERROR_MAP[code]) return code;
    return '404';
  }

  // --- Initialize ---
  initThreeErrorField();
  const code = getCodeFromUrl();
  displayError(code);

})();
