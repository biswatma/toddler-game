
const shape = document.getElementById('shape');
const gameArea = document.getElementById('game-area');
// const clickSound = document.getElementById('click-sound'); // Removed

// const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan']; // Removed color logic
// let currentColorIndex = 0; // Removed color logic

// --- Web Audio API Setup ---
let audioCtx;
try {
    // Use || for broader browser compatibility
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
} catch (e) {
    console.warn("Web Audio API is not supported in this browser.");
    audioCtx = null; // Ensure audioCtx is null if setup fails
}

// Function to play a simple click sound
function playClickSound() {
    if (!audioCtx) return; // Don't play if AudioContext failed or isn't supported

    // Resume context if it's suspended (required for Chrome autoplay policy)
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Sound parameters (attempt at a 'pop'/'burst')
    // Use white noise for a burst sound
    const bufferSize = audioCtx.sampleRate * 0.1; // 0.1 seconds of noise
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1; // Generate white noise
    }

    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = buffer;

    // Shape the noise volume for a pop
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime); // Start loud
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05); // Decay quickly

    noiseSource.connect(gainNode);
    noiseSource.start(audioCtx.currentTime);
    noiseSource.stop(audioCtx.currentTime + 0.1); // Stop after 100ms
}
// --- End Web Audio API Setup ---


// Function to set a random position for the shape
function moveShape() {
    const gameAreaRect = gameArea.getBoundingClientRect();
    const shapeRect = shape.getBoundingClientRect();

    // Calculate max possible top and left values
    const maxTop = gameAreaRect.height - shapeRect.height;
    const maxLeft = gameAreaRect.width - shapeRect.width;

    // Generate random positions within the bounds
    const randomTop = Math.random() * maxTop;
    const randomLeft = Math.random() * maxLeft;

    shape.style.top = `${randomTop}px`;
    shape.style.left = `${randomLeft}px`;
}

// Function to change shape color - REMOVED
// function changeColor() {
//     currentColorIndex = (currentColorIndex + 1) % colors.length;
//     shape.style.backgroundColor = colors[currentColorIndex];
// }

// Event listener for clicking the shape
shape.addEventListener('click', () => {
    // Play the generated sound
    playClickSound();

    // Burst effect: Hide, move, then show
    shape.style.visibility = 'hidden'; // Hide the balloon

    // Wait a short moment before moving and showing again
    setTimeout(() => {
        moveShape(); // Move to a new position
        shape.style.visibility = 'visible'; // Show the balloon again
    }, 150); // 150 milliseconds delay

    // changeColor(); // Removed color change
    // moveShape(); // Move is now handled in setTimeout
});

// Initial placement of the shape
moveShape();
// Set initial color (optional, CSS already sets red) - REMOVED
// shape.style.backgroundColor = colors[currentColorIndex];
