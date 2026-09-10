// Chodhyam Auth-05 Engine & Interactive Handlers
(function() {
  'use strict';

  // --- State ---
  let currentMode = 'login'; // 'login' | 'signup'
  let isSubmitting = false;

  // --- DOM Elements ---
  const el = {
    tabLogin: document.getElementById('tab-login'),
    tabSignup: document.getElementById('tab-signup'),
    authTitle: document.getElementById('auth-title'),
    authSubtitle: document.getElementById('auth-subtitle'),
    authForm: document.getElementById('auth-form'),
    fieldNameGroup: document.getElementById('field-name-group'),
    fieldConfirmGroup: document.getElementById('field-confirm-group'),
    inputName: document.getElementById('input-name'),
    inputEmail: document.getElementById('input-email'),
    inputPassword: document.getElementById('input-password'),
    inputConfirm: document.getElementById('input-confirm'),
    checkEphemeral: document.getElementById('check-ephemeral'),
    btnTogglePassword: document.getElementById('btn-toggle-password'),
    iconEye: document.getElementById('icon-eye'),
    btnSubmit: document.getElementById('btn-submit'),
    btnSubmitText: document.getElementById('btn-submit-text'),
    btnSubmitArrow: document.getElementById('btn-submit-arrow'),
    btnSubmitSpinner: document.getElementById('btn-submit-spinner'),
    btnGoogle: document.getElementById('btn-google'),
    googleBtnText: document.getElementById('google-btn-text'),
    authAlert: document.getElementById('auth-alert'),
    linkForgotPass: document.getElementById('link-forgot-pass'),
    emailError: document.getElementById('email-error'),
    passwordError: document.getElementById('password-error'),
    confirmError: document.getElementById('confirm-error')
  };

  // --- Three.js Background Particle Cloud in Left Panel ---
  function initThreeBg() {
    const canvas = document.getElementById('auth-field');
    if (!canvas || !window.THREE) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 1, 1000);
    camera.position.z = 320;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    function resize() {
      if (!canvas.parentElement) return;
      const width = canvas.parentElement.clientWidth;
      const height = canvas.parentElement.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    resize();
    window.addEventListener('resize', resize);

    // Create a rotating dual-torus particle helix
    const particleCount = 2800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI * 2;
      const r = 90 + Math.sin(v * 3) * 20;
      
      const x = r * Math.cos(u);
      const y = r * Math.sin(u) * 0.7 + (Math.random() - 0.5) * 25;
      const z = Math.sin(v) * 45 + (Math.random() - 0.5) * 30;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Teal / Cyan glowing tint
      const isTeal = Math.random() > 0.3;
      colors[i * 3] = isTeal ? 0.08 : 0.06;     // R
      colors[i * 3 + 1] = isTeal ? 0.72 : 0.40; // G
      colors[i * 3 + 2] = isTeal ? 0.65 : 0.85; // B
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Gentle floating loop
    let clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime() * 0.4;
      particles.rotation.y = t * 0.5;
      particles.rotation.x = Math.sin(t * 0.3) * 0.2;
      renderer.render(scene, camera);
    }
    animate();
  }

  // --- Mode Switching (Login vs Sign Up) ---
  function setMode(mode) {
    if (mode === currentMode) return;
    currentMode = mode;

    if (mode === 'login') {
      el.tabLogin.classList.add('bg-[#18181b]', 'text-white');
      el.tabLogin.classList.remove('text-gray-400');
      el.tabLogin.setAttribute('aria-selected', 'true');

      el.tabSignup.classList.remove('bg-[#18181b]', 'text-white');
      el.tabSignup.classList.add('text-gray-400');
      el.tabSignup.setAttribute('aria-selected', 'false');

      el.authTitle.textContent = 'Welcome back';
      el.authSubtitle.textContent = 'Sign in to access your secure ephemeral workspace.';
      el.btnSubmitText.textContent = 'Sign In to Workspace';
      if (el.googleBtnText) el.googleBtnText.textContent = 'Sign in with Google';

      if (window.gsap) {
        gsap.to([el.fieldNameGroup, el.fieldConfirmGroup], {
          opacity: 0,
          height: 0,
          duration: 0.2,
          onComplete: () => {
            el.fieldNameGroup.classList.add('hidden');
            el.fieldConfirmGroup.classList.add('hidden');
          }
        });
      } else {
        el.fieldNameGroup.classList.add('hidden');
        el.fieldConfirmGroup.classList.add('hidden');
      }

    } else {
      el.tabSignup.classList.add('bg-[#18181b]', 'text-white');
      el.tabSignup.classList.remove('text-gray-400');
      el.tabSignup.setAttribute('aria-selected', 'true');

      el.tabLogin.classList.remove('bg-[#18181b]', 'text-white');
      el.tabLogin.classList.add('text-gray-400');
      el.tabLogin.setAttribute('aria-selected', 'false');

      el.authTitle.textContent = 'Create an account';
      el.authSubtitle.textContent = 'Get started with zero-data document intelligence.';
      el.btnSubmitText.textContent = 'Create & Launch Session';
      if (el.googleBtnText) el.googleBtnText.textContent = 'Sign up with Google';

      el.fieldNameGroup.classList.remove('hidden');
      el.fieldConfirmGroup.classList.remove('hidden');

      if (window.gsap) {
        gsap.fromTo([el.fieldNameGroup, el.fieldConfirmGroup], 
          { opacity: 0, height: 0 }, 
          { opacity: 1, height: 'auto', duration: 0.3, stagger: 0.05 }
        );
      }
    }

    clearErrors();
    hideAlert();
  }

  // --- Password Visibility Toggle ---
  let showPassword = false;
  function togglePasswordVisibility() {
    showPassword = !showPassword;
    el.inputPassword.type = showPassword ? 'text' : 'password';
    if (el.inputConfirm) el.inputConfirm.type = showPassword ? 'text' : 'password';
    
    el.iconEye.innerHTML = showPassword 
      ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`
      : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
  }

  // --- Error Handling Helpers ---
  function clearErrors() {
    el.emailError.classList.add('hidden');
    el.emailError.textContent = '';
    el.passwordError.classList.add('hidden');
    el.passwordError.textContent = '';
    el.confirmError.classList.add('hidden');
    el.confirmError.textContent = '';
  }

  function showAlert(msg, isSuccess = false) {
    el.authAlert.classList.remove('hidden', 'bg-rose-950/40', 'border-rose-500/40', 'text-rose-300', 'bg-teal-950/40', 'border-teal-500/40', 'text-teal-300');
    if (isSuccess) {
      el.authAlert.classList.add('bg-teal-950/40', 'border-teal-500/40', 'text-teal-300');
    } else {
      el.authAlert.classList.add('bg-rose-950/40', 'border-rose-500/40', 'text-rose-300');
    }
    el.authAlert.textContent = msg;
  }

  function hideAlert() {
    el.authAlert.classList.add('hidden');
  }

  // --- Form Submission & Validation ---
  function handleFormSubmit(e) {
    e.preventDefault();
    if (isSubmitting) return;

    clearErrors();
    hideAlert();

    const email = el.inputEmail.value.trim();
    const password = el.inputPassword.value;
    const name = el.inputName.value.trim();
    const confirm = el.inputConfirm.value;

    let hasError = false;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      el.emailError.textContent = 'Please enter a valid email address.';
      el.emailError.classList.remove('hidden');
      hasError = true;
    }

    // Password validation
    if (!password || password.length < 6) {
      el.passwordError.textContent = 'Password must be at least 6 characters.';
      el.passwordError.classList.remove('hidden');
      hasError = true;
    }

    // Sign up specific checks
    if (currentMode === 'signup') {
      if (password !== confirm) {
        el.confirmError.textContent = 'Passwords do not match.';
        el.confirmError.classList.remove('hidden');
        hasError = true;
      }
    }

    if (hasError) return;

    // Simulate Authentication & Ephemeral Session Initializer
    isSubmitting = true;
    el.btnSubmitSpinner.classList.remove('hidden');
    el.btnSubmitArrow.classList.add('hidden');
    el.btnSubmitText.textContent = currentMode === 'login' ? 'Authenticating...' : 'Initializing Sandbox...';
    el.btnSubmit.disabled = true;

    setTimeout(() => {
      isSubmitting = false;
      el.btnSubmitSpinner.classList.add('hidden');
      el.btnSubmitArrow.classList.remove('hidden');
      el.btnSubmit.disabled = false;

      const userDisplay = name || email.split('@')[0];
      showAlert(`✓ Ephemeral session created for ${userDisplay}. Launching in-memory workspace...`, true);

      // Redirect into workspace after a brief delay
      setTimeout(() => {
        window.location.href = 'workspace.html';
      }, 1200);

    }, 900);
  }

  // --- Event Listeners ---
  el.tabLogin.addEventListener('click', () => setMode('login'));
  el.tabSignup.addEventListener('click', () => setMode('signup'));
  el.btnTogglePassword.addEventListener('click', togglePasswordVisibility);
  el.authForm.addEventListener('submit', handleFormSubmit);

  if (el.btnGoogle) {
    el.btnGoogle.addEventListener('click', () => {
      showAlert('Connecting to Google Identity Services...');
      setTimeout(() => {
        showAlert('✓ Google OAuth Authenticated. Initializing ephemeral workspace...', true);
        setTimeout(() => { window.location.href = 'workspace.html'; }, 1000);
      }, 900);
    });
  }

  el.linkForgotPass.addEventListener('click', (e) => {
    e.preventDefault();
    showAlert('Password recovery link sent to your registered zero-retention email channel.');
  });

  // Init
  initThreeBg();

})();
