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

    // Sound parameters (attempt at a 'croak')
    oscillator.type = 'sawtooth'; // A slightly harsher sound
    oscillator.frequency.setValueAtTime(300, audioCtx.currentTime); // Lower starting pitch
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime); // Slightly louder start

    // Ramp down frequency more slowly for a 'croak' feel
    oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.15); // Lower end pitch, longer duration
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2); // Fade out over 200ms

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.2); // Stop after 200ms
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

    // changeColor(); // Removed color change
    moveShape();
});

// Initial placement of the shape
moveShape();
// Set initial color (optional, CSS already sets red) - REMOVED
// shape.style.backgroundColor = colors[currentColorIndex];
