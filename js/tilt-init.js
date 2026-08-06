// Initialize Vanilla Tilt on .tilt-card elements
document.addEventListener('DOMContentLoaded', () => {
    // Check if VanillaTilt is loaded via CDN
    if (typeof VanillaTilt !== 'undefined') {
        const tiltCards = document.querySelectorAll('.tilt-card');
        
        VanillaTilt.init(Array.from(tiltCards), {
            max: 12,                  // max tilt rotation (degrees)
            speed: 400,                // Speed of the enter/exit transition
            glare: true,               // enable glare effect
            'max-glare': 0.15,         // max glare opacity
            scale: 1.02,               // Scale card on hover
            perspective: 1000,         // Transform perspective
            gyroscope: true            // Enable mobile gyroscope tilt
        });
    } else {
        console.warn('VanillaTilt is not loaded. Cards will not tilt.');
    }
});
