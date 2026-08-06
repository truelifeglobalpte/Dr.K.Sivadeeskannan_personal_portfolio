// GSAP, Lenis, and Portfolio UI Controller
document.addEventListener('DOMContentLoaded', () => {
    // 0. Theme Management (Light/Dark Mode)
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    // Check saved theme or default to 'light' (Normal mood)
    const savedTheme = localStorage.getItem('portfolio-theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (themeIcon) themeIcon.setAttribute('data-lucide', 'lightbulb');
    } else {
        document.documentElement.removeAttribute('data-theme');
        if (themeIcon) themeIcon.setAttribute('data-lucide', 'lightbulb');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const lampCord = document.getElementById('lamp-cord');
            if (lampCord) {
                lampCord.classList.add('pulling');
                setTimeout(() => lampCord.classList.remove('pulling'), 260);
            }

            const currentTheme = document.documentElement.getAttribute('data-theme');
            if (currentTheme === 'dark') {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('portfolio-theme', 'light');
                if (themeIcon) themeIcon.setAttribute('data-lucide', 'lightbulb');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('portfolio-theme', 'dark');
                if (themeIcon) themeIcon.setAttribute('data-lucide', 'lightbulb');
            }
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        });
    }

    // 1. Initialize Smooth Scrolling (Lenis)
    let lenis;
    try {
        if (typeof Lenis !== 'undefined') {
            lenis = new Lenis({
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                direction: 'vertical',
                gestureDirection: 'vertical',
                smooth: true,
                mouseMultiplier: 1,
                smoothTouch: false,
                touchMultiplier: 2,
                infinite: false,
            });

            // Integrate Lenis with GSAP ScrollTrigger
            lenis.on('scroll', ScrollTrigger.update);

            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });

            gsap.ticker.lagSmoothing(0);
        }
    } catch (e) {
        console.warn('Lenis smooth scroll failed to initialize:', e);
    }

    // 1.5 Custom Cursor & Magnetic Buttons
    const cursorDot = document.querySelector('[data-cursor-dot]');
    const cursorOutline = document.querySelector('[data-cursor-outline]');
    
    if (cursorDot && cursorOutline && window.innerWidth > 768) {
        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;

            // Dot follows exactly
            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;

            // Outline follows with slight delay using GSAP if available, else standard
            if (typeof gsap !== 'undefined') {
                gsap.to(cursorOutline, {
                    x: posX - window.innerWidth / 2, // Account for translate(-50%, -50%) relative positioning in GSAP 3
                    y: posY - window.innerHeight / 2,
                    left: "50%",
                    top: "50%",
                    duration: 0.15,
                    ease: "power2.out"
                });
            }
        });

        // Add magnetic pull and hover states to links/buttons
        const interactives = document.querySelectorAll('a, button, .pillar-card, .biz-card, .practice-card');
        interactives.forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.classList.add('cursor-hover');
            });
            el.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-hover');
                if (typeof gsap !== 'undefined') {
                    gsap.to(el, { x: 0, y: 0, duration: 0.3, ease: 'power2.out' });
                }
            });

            // Magnetic Button effect for primary buttons
            if (el.classList.contains('btn') || el.classList.contains('social-btn')) {
                el.addEventListener('mousemove', (e) => {
                    const rect = el.getBoundingClientRect();
                    const h = rect.width / 2;
                    const v = rect.height / 2;
                    const x = e.clientX - rect.left - h;
                    const y = e.clientY - rect.top - v;
                    
                    if (typeof gsap !== 'undefined') {
                        gsap.to(el, {
                            x: x * 0.3,
                            y: y * 0.3,
                            duration: 0.2,
                            ease: 'power2.out'
                        });
                    }
                });
            }
        });
    }

    // 2. Mobile Navigation Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    const header = document.querySelector('header');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });

        // Close menu and scroll smoothly when link is clicked
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href');
                if (targetId && targetId.startsWith('#')) {
                    e.preventDefault();
                    const targetEl = document.querySelector(targetId);
                    if (targetEl) {
                        if (typeof lenis !== 'undefined') {
                            lenis.scrollTo(targetEl, { offset: -90 });
                        } else {
                            targetEl.scrollIntoView({ behavior: 'smooth' });
                        }
                    }
                }
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });
    }

    // Sticky Header visual update on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 3. GSAP Entry & Timeline Animations
    if (typeof gsap !== 'undefined') {
        // Register ScrollTrigger plugin
        gsap.registerPlugin(ScrollTrigger);

        // Hero content is shown immediately via CSS - no animation dependency

        // 3D Pillars Interactive Hover Rotations
        const pillars = document.querySelectorAll('.pillar-card');
        pillars.forEach(pillar => {
            pillar.addEventListener('mousemove', (e) => {
                const rect = pillar.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                const rotX = -(y / (rect.height / 2)) * 10;
                const rotY = (x / (rect.width / 2)) * 10;
                
                gsap.to(pillar, {
                    rotationX: rotX,
                    rotationY: rotY,
                    transformPerspective: 800,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });

            pillar.addEventListener('mouseleave', () => {
                gsap.to(pillar, {
                    rotationX: 0,
                    rotationY: 0,
                    duration: 0.5,
                    ease: 'power3.out'
                });
            });
        });

        // Safe Counter Up Animation
        const counters = document.querySelectorAll('.counter-val');
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'), 10);
            const countObj = { val: 0 };
            const isPlus = target === 6 || target === 10;
            
            gsap.to(countObj, {
                scrollTrigger: {
                    trigger: counter,
                    start: 'top 90%',
                    toggleActions: 'play none none none'
                },
                val: target,
                duration: 2,
                ease: 'power2.out',
                onUpdate: () => {
                    counter.textContent = Math.floor(countObj.val) + (isPlus ? '+' : '');
                }
            });
        });
    }

    // 4. Advanced GSAP Text Reveals (Trending Effect)
    if (typeof gsap !== 'undefined') {
        const splitTextIntoWords = (element) => {
            const text = element.innerText;
            if(!text.trim()) return;
            element.innerHTML = '';
            const words = text.split(' ');
            words.forEach((word, index) => {
                const outerSpan = document.createElement('span');
                outerSpan.style.display = 'inline-block';
                outerSpan.style.overflow = 'hidden';
                outerSpan.style.verticalAlign = 'top';
                
                const innerSpan = document.createElement('span');
                innerSpan.style.display = 'inline-block';
                // preserve spacing
                innerSpan.innerHTML = word + (index < words.length - 1 ? '&nbsp;' : '');
                
                outerSpan.appendChild(innerSpan);
                element.appendChild(outerSpan);
            });
            return element.querySelectorAll('span > span');
        };

        // Animate hero name smoothly without stripping color spans
        const heroName = document.querySelector('.hero-name');
        if (heroName) {
            gsap.from(heroName, {
                y: 30,
                opacity: 0,
                duration: 1,
                ease: 'power3.out',
                delay: 0.2
            });
        }
    }

    // Observe all animate-on-scroll elements with original staggered logic
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add stagger delay based on element index within its parent
                const parent = entry.target.parentElement;
                const siblings = parent ? Array.from(parent.querySelectorAll('.animate-on-scroll')) : [];
                const siblingIndex = siblings.indexOf(entry.target);
                const delay = siblingIndex >= 0 ? siblingIndex * 150 : 0;

                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05 });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        revealObserver.observe(el);
    });

    // 4. Lightbox/Gallery Viewer
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');

    if (galleryItems.length > 0 && lightbox && lightboxImg) {
        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const img = item.querySelector('img');
                const captionText = item.querySelector('.gallery-overlay p')?.textContent || '';
                
                if (img) {
                    lightboxImg.src = img.src;
                    lightboxCaption.textContent = captionText;
                    lightbox.classList.add('active');
                    if (lenis) lenis.stop();
                }
            });
        });

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            if (lenis) lenis.start();
        };

        if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }

    // 5. Contact Form Validation
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            const email = document.getElementById('form-email');
            const name = document.getElementById('form-name');
            const message = document.getElementById('form-message');

            if (!email.value || !name.value || !message.value) {
                e.preventDefault();
                alert('Please fill out all fields before submitting.');
                return;
            }
        });
    }

    // 6. Typing Animation for Hero Tagline
    const typedRole = document.getElementById('typed-role');
    if (typedRole) {
        const roles = ['Legal Practice', 'Global Business', 'Social Service', 'Public Governance'];
        let roleIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        const typeSpeed = 100;
        const deleteSpeed = 50;
        const pauseAfterType = 2000;
        const pauseAfterDelete = 500;

        function typeRole() {
            const currentRole = roles[roleIndex];

            if (!isDeleting) {
                // Typing
                typedRole.textContent = currentRole.substring(0, charIndex + 1);
                charIndex++;

                if (charIndex === currentRole.length) {
                    // Finished typing, pause then start deleting
                    isDeleting = true;
                    setTimeout(typeRole, pauseAfterType);
                    return;
                }
                setTimeout(typeRole, typeSpeed);
            } else {
                // Deleting
                typedRole.textContent = currentRole.substring(0, charIndex - 1);
                charIndex--;

                if (charIndex === 0) {
                    // Finished deleting, move to next role
                    isDeleting = false;
                    roleIndex = (roleIndex + 1) % roles.length;
                    setTimeout(typeRole, pauseAfterDelete);
                    return;
                }
                setTimeout(typeRole, deleteSpeed);
            }
        }

        // Start the typing animation
        setTimeout(typeRole, 800);
    }

    // 7. Public & Political Slider Showcase (Auto-moving slider)
    const slides = document.querySelectorAll('.political-slide');
    const dots = document.querySelectorAll('.slider-dots .dot');
    const prevBtn = document.getElementById('pol-prev');
    const nextBtn = document.getElementById('pol-next');
    let currentSlide = 0;
    let autoSlideTimer;

    if (slides.length > 0) {
        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
            currentSlide = index;
        }

        function nextSlide() {
            const nextIndex = (currentSlide + 1) % slides.length;
            showSlide(nextIndex);
        }

        function prevSlide() {
            const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(prevIndex);
        }

        function startAutoSlide() {
            stopAutoSlide();
            autoSlideTimer = setInterval(nextSlide, 2000); // Fast automatic movement every 2 seconds
        }

        function stopAutoSlide() {
            if (autoSlideTimer) clearInterval(autoSlideTimer);
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                nextSlide();
                startAutoSlide();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                prevSlide();
                startAutoSlide();
            });
        }

        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'), 10);
                showSlide(index);
                startAutoSlide();
            });
        });

        // Pause auto-sliding on hover
        const container = document.querySelector('.political-slider-container');
        if (container) {
            container.addEventListener('mouseenter', stopAutoSlide);
            container.addEventListener('mouseleave', startAutoSlide);
        }

        // Start auto-slider
        startAutoSlide();
    }
});
