// Interactive Particle Canvas Background
class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particle-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.connectionDistance = 180;
        this.mouse = { x: null, y: null, radius: 180 };

        this.init();
        this.animate();
        this.bindEvents();
    }

    init() {
        this.resize();
        this.createParticles();
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
    }

    createParticles() {
        this.particles = [];
        const density = window.innerWidth < 768 ? 45 : 90;
        
        for (let i = 0; i < density; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 0.7,
                vy: (Math.random() - 0.5) * 0.7,
                radius: Math.random() * 2.5 + 1.5,
                // Store both theme colors
                colorDark: Math.random() > 0.3 ? 'rgba(217, 119, 6, 0.75)' : 'rgba(16, 185, 129, 0.75)',
                colorLight: Math.random() > 0.3 ? 'rgba(70, 70, 70, 0.7)' : 'rgba(120, 120, 120, 0.7)'
            });
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.resize();
            this.createParticles();
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        window.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];

            // Move particle
            p.x += p.vx;
            p.y += p.vy;

            // Bounce off boundaries
            if (p.x < 0 || p.x > this.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.height) p.vy *= -1;

            // Mouse interaction (repel effect)
            if (this.mouse.x !== null) {
                const dx = p.x - this.mouse.x;
                const dy = p.y - this.mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.mouse.radius) {
                    const force = (this.mouse.radius - dist) / this.mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    p.x += Math.cos(angle) * force * 2;
                    p.y += Math.sin(angle) * force * 2;
                }
            }

            // Check current theme
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const currentColor = isDark ? p.colorDark : p.colorLight;

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = currentColor;
            this.ctx.shadowBlur = 4;
            this.ctx.shadowColor = currentColor;
            this.ctx.fill();
            this.ctx.shadowBlur = 0; // Reset shadow

            // Connect close particles
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.connectionDistance) {
                    const alpha = (1 - dist / this.connectionDistance) * 0.4;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    const lineRGB = isDark ? '217, 119, 6' : '150, 150, 150'; // Gold in dark mode, light grey in light mode
                    this.ctx.strokeStyle = `rgba(${lineRGB}, ${alpha})`;
                    this.ctx.lineWidth = 0.9;
                    this.ctx.stroke();
                }
            }
        }

        requestAnimationFrame(() => this.animate());
    }
}

// Start system on load
document.addEventListener('DOMContentLoaded', () => {
    new ParticleSystem();
});
