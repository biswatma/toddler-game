import * as THREE from 'three';

// --- Basic Setup ---
const canvas = document.getElementById('game-canvas');
const gameArea = document.getElementById('game-area');
let scene, camera, renderer;
let balloon;
let popAnimation = { active: false, scale: 1, speed: 0.1 };

// --- Sound Generation (Copied from previous version) ---
let audioCtx;
try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
} catch (e) {
    console.warn("Web Audio API is not supported in this browser.");
    audioCtx = null;
}

function playPopSound() {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const gainNode = audioCtx.createGain();
    gainNode.connect(audioCtx.destination);
    const bufferSize = audioCtx.sampleRate * 0.1;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = buffer;
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
    noiseSource.connect(gainNode);
    noiseSource.start(audioCtx.currentTime);
    noiseSource.stop(audioCtx.currentTime + 0.1);
}
// --- End Sound Generation ---

// --- Initialization ---
function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff); // White background

    // Camera
    const aspect = gameArea.clientWidth / gameArea.clientHeight;
    camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    camera.position.z = 10; // Move camera back

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(gameArea.clientWidth, gameArea.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Create Balloon
    createBalloon();

    // Event Listeners
    window.addEventListener('resize', onWindowResize);
    canvas.addEventListener('click', onClick);

    // Start Animation Loop
    animate();
}

// --- Balloon Creation ---
function createBalloon() {
    const geometry = new THREE.SphereGeometry(1.5, 32, 16); // Radius, width segments, height segments
    const material = new THREE.MeshStandardMaterial({
        color: 0xff0000, // Red
        roughness: 0.5,
        metalness: 0.1
    });
    balloon = new THREE.Mesh(geometry, material);
    setRandomPosition(balloon);
    scene.add(balloon);
}

// --- Positioning ---
function setRandomPosition(object) {
    // Define bounds based roughly on camera view
    const bounds = { x: 5, y: 3 }; // Adjust as needed
    object.position.x = (Math.random() - 0.5) * 2 * bounds.x;
    object.position.y = (Math.random() - 0.5) * 2 * bounds.y;
    object.position.z = (Math.random() - 0.5) * 2; // Add some depth variation
}

// --- Event Handlers ---
function onWindowResize() {
    const width = gameArea.clientWidth;
    const height = gameArea.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

function onClick(event) {
    if (popAnimation.active) return; // Don't allow clicking during pop

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Calculate mouse position in normalized device coordinates (-1 to +1)
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObject(balloon);

    if (intersects.length > 0) {
        // Clicked on the balloon!
        playPopSound();
        startPopAnimation();
    }
}

// --- Animation ---
function startPopAnimation() {
    popAnimation.active = true;
    popAnimation.scale = 1; // Start at full scale
}

function animate() {
    requestAnimationFrame(animate);

    // Pop animation logic
    if (popAnimation.active) {
        popAnimation.scale -= popAnimation.speed; // Shrink
        balloon.scale.set(popAnimation.scale, popAnimation.scale, popAnimation.scale);

        if (popAnimation.scale <= 0) {
            popAnimation.active = false;
            popAnimation.scale = 0; // Ensure it's fully shrunk
            balloon.scale.set(0, 0, 0); // Keep it hidden briefly
            // Reposition and reset scale after a short delay
            setTimeout(() => {
                setRandomPosition(balloon);
                balloon.scale.set(1, 1, 1); // Reset scale for reappearance
            }, 100); // Delay before reappearing
        }
    } else {
         // Optional: Add subtle bobbing animation when not popping
         const time = Date.now() * 0.001;
         balloon.position.y += Math.sin(time * 2) * 0.005;
    }


    renderer.render(scene, camera);
}

// --- Start ---
init();
