// Immediate Theme Initialization to avoid caching flash
(function() {
    const savedTheme = localStorage.getItem('portfolio-theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
})();

// GSAP, Lenis, and Portfolio UI Controller
document.addEventListener('DOMContentLoaded', () => {
    // 0. Theme Management (Light/Dark Mode)
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('portfolio-theme', 'dark');
            if (themeIcon) themeIcon.setAttribute('data-lucide', 'sun');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('portfolio-theme', 'light');
            if (themeIcon) themeIcon.setAttribute('data-lucide', 'moon');
        }
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    // Refresh state on load
    const currentActiveTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    applyTheme(currentActiveTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const nextTheme = isDark ? 'light' : 'dark';
            applyTheme(nextTheme);
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
            } else {
                cursorOutline.style.left = `${posX}px`;
                cursorOutline.style.top = `${posY}px`;
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

    // Sticky Header visual update and ScrollSpy on scroll
    const navLinksList = document.querySelectorAll('.nav-links a:not(.nav-cta)');
    const sectionsList = document.querySelectorAll('section');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        let currentSectionId = '';
        const scrollPosition = window.scrollY + 200; // offset for sticky header

        sectionsList.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < (sectionTop + sectionHeight)) {
                currentSectionId = section.getAttribute('id');
            }
        });

        if (currentSectionId) {
            navLinksList.forEach(link => {
                const href = link.getAttribute('href');
                if (href === `#${currentSectionId}`) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
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

    // 4. Lightbox/Gallery Viewer Modal
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');

    function openLightbox(imgSrc, captionText) {
        if (lightbox && lightboxImg) {
            lightboxImg.src = imgSrc;
            if (lightboxCaption) lightboxCaption.textContent = captionText || '';
            lightbox.classList.add('active');
            if (typeof lenis !== 'undefined' && lenis) lenis.stop();
        }
    }

    function closeLightbox() {
        if (lightbox) {
            lightbox.classList.remove('active');
            if (typeof lenis !== 'undefined' && lenis) lenis.start();
        }
    }

    // Attach click triggers to all view buttons & image wrappers
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-img]');
        if (trigger) {
            const imgSrc = trigger.getAttribute('data-img');
            const captionText = trigger.getAttribute('data-caption');
            if (imgSrc) openLightbox(imgSrc, captionText);
        }
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });

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

    // 7. Gallery, Recognition & Certificates Interactive Moving Showcase
    const gallerySlides = Array.from(document.querySelectorAll('.gallery-slide'));
    const galleryTrack = document.getElementById('gallery-track');
    const galleryDotsContainer = document.getElementById('gallery-dots');
    const galleryPrevBtn = document.getElementById('gallery-prev');
    const galleryNextBtn = document.getElementById('gallery-next');
    const filterTabs = document.querySelectorAll('.gallery-tab');

    let currentFilter = 'all';
    let visibleSlides = [...gallerySlides];
    let currentSlideIndex = 0;
    let autoSlideTimer;

    if (gallerySlides.length > 0 && galleryTrack) {

        function updateVisibleSlides() {
            visibleSlides = gallerySlides.filter(slide => {
                const category = slide.getAttribute('data-category');
                if (currentFilter === 'all' || category === currentFilter) {
                    slide.classList.remove('hidden-by-filter');
                    return true;
                } else {
                    slide.classList.add('hidden-by-filter');
                    return false;
                }
            });

            // Rebuild pagination dots
            if (galleryDotsContainer) {
                galleryDotsContainer.innerHTML = '';
                visibleSlides.forEach((_, idx) => {
                    const dot = document.createElement('span');
                    dot.className = `dot ${idx === 0 ? 'active' : ''}`;
                    dot.setAttribute('data-idx', idx);
                    dot.addEventListener('click', () => {
                        showSlide(idx);
                        startAutoSlide();
                    });
                    galleryDotsContainer.appendChild(dot);
                });
            }

            // Reset slide position
            currentSlideIndex = 0;
            showSlide(0);
        }

        function showSlide(index) {
            if (visibleSlides.length === 0) return;
            if (index < 0) index = visibleSlides.length - 1;
            if (index >= visibleSlides.length) index = 0;

            currentSlideIndex = index;

            // Find index of current visible slide relative to track layout
            gallerySlides.forEach(slide => slide.classList.remove('active'));
            const activeSlide = visibleSlides[currentSlideIndex];

            if (activeSlide) {
                activeSlide.classList.add('active');
                // Calculate position relative to visible slides
                galleryTrack.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
            }

            // Update dots
            if (galleryDotsContainer) {
                const dots = galleryDotsContainer.querySelectorAll('.dot');
                dots.forEach((dot, idx) => {
                    dot.classList.toggle('active', idx === currentSlideIndex);
                });
            }
        }

        function nextSlide() {
            showSlide(currentSlideIndex + 1);
        }

        function prevSlide() {
            showSlide(currentSlideIndex - 1);
        }

        function startAutoSlide() {
            stopAutoSlide();
            autoSlideTimer = setInterval(nextSlide, 3000); // Continuous automatic slide switching every 3 seconds
        }

        function stopAutoSlide() {
            if (autoSlideTimer) clearInterval(autoSlideTimer);
        }

        // Prev & Next Buttons
        if (galleryNextBtn) {
            galleryNextBtn.addEventListener('click', () => {
                nextSlide();
                startAutoSlide();
            });
        }

        if (galleryPrevBtn) {
            galleryPrevBtn.addEventListener('click', () => {
                prevSlide();
                startAutoSlide();
            });
        }

        // Category Filter Tab click handling
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                filterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentFilter = tab.getAttribute('data-filter') || 'all';
                updateVisibleSlides();
                startAutoSlide();
                if (typeof lucide !== 'undefined') lucide.createIcons();
            });
        });

        // Pause on hover
        const container = document.querySelector('.gallery-slider-container');
        if (container) {
            container.addEventListener('mouseenter', stopAutoSlide);
            container.addEventListener('mouseleave', startAutoSlide);
        }

        // Initial setup
        updateVisibleSlides();
        startAutoSlide();
    }

    // 8. Testimonials Interactive Moving Slider
    const testimonialSlides = Array.from(document.querySelectorAll('.testimonial-slide'));
    const testimonialTrack = document.getElementById('testimonial-track');
    const testimonialDotsContainer = document.getElementById('testimonial-dots');
    const testimonialPrevBtn = document.getElementById('testimonial-prev');
    const testimonialNextBtn = document.getElementById('testimonial-next');

    let currentTestimonialIndex = 0;
    let testimonialAutoTimer;

    if (testimonialSlides.length > 0 && testimonialTrack) {
        // Build dots
        if (testimonialDotsContainer) {
            testimonialDotsContainer.innerHTML = '';
            testimonialSlides.forEach((_, idx) => {
                const dot = document.createElement('span');
                dot.className = `dot ${idx === 0 ? 'active' : ''}`;
                dot.setAttribute('data-idx', idx);
                dot.addEventListener('click', () => {
                    showTestimonial(idx);
                    startTestimonialAuto();
                });
                testimonialDotsContainer.appendChild(dot);
            });
        }

        function showTestimonial(index) {
            if (index < 0) index = testimonialSlides.length - 1;
            if (index >= testimonialSlides.length) index = 0;

            currentTestimonialIndex = index;

            testimonialSlides.forEach((slide, idx) => {
                slide.classList.toggle('active', idx === currentTestimonialIndex);
            });

            testimonialTrack.style.transform = `translateX(-${currentTestimonialIndex * 100}%)`;

            if (testimonialDotsContainer) {
                const dots = testimonialDotsContainer.querySelectorAll('.dot');
                dots.forEach((dot, idx) => {
                    dot.classList.toggle('active', idx === currentTestimonialIndex);
                });
            }
        }

        function nextTestimonial() {
            showTestimonial(currentTestimonialIndex + 1);
        }

        function prevTestimonial() {
            showTestimonial(currentTestimonialIndex - 1);
        }

        function startTestimonialAuto() {
            stopTestimonialAuto();
            testimonialAutoTimer = setInterval(nextTestimonial, 5000);
        }

        function stopTestimonialAuto() {
            if (testimonialAutoTimer) clearInterval(testimonialAutoTimer);
        }

        if (testimonialNextBtn) {
            testimonialNextBtn.addEventListener('click', () => {
                nextTestimonial();
                startTestimonialAuto();
            });
        }

        if (testimonialPrevBtn) {
            testimonialPrevBtn.addEventListener('click', () => {
                prevTestimonial();
                startTestimonialAuto();
            });
        }

        const testimonialContainer = document.querySelector('.testimonials-slider-container');
        if (testimonialContainer) {
            testimonialContainer.addEventListener('mouseenter', stopTestimonialAuto);
            testimonialContainer.addEventListener('mouseleave', startTestimonialAuto);
        }

        showTestimonial(0);
        startTestimonialAuto();
    }

    // 9. Universal 3D Interactive Touch & Mouse Tilt Effect for All Images
    function init3DImageEffects() {
        const imageContainers = document.querySelectorAll(
            '.hero-graphic, .about-img-box, .gallery-card, .pillar-card, .practice-card, .biz-card, .testimonial-slide, .hero-avatar'
        );

        imageContainers.forEach(container => {
            if (container.dataset.tilt3dInit) return;
            container.dataset.tilt3dInit = "true";

            container.classList.add('tilt-3d-container');

            const isMainPortrait = container.classList.contains('hero-graphic') || container.classList.contains('about-img-box') || container.classList.contains('hero-avatar');

            let glare = container.querySelector('.tilt-3d-glare');
            if (!glare) {
                glare = document.createElement('div');
                glare.className = 'tilt-3d-glare';
                container.appendChild(glare);
            }

            const img = container.querySelector('img');
            const bgGlow = container.querySelector('.graphic-bg-glow');
            const glassCard = container.querySelector('.glass-card');

            function handleMove(e) {
                const rect = container.getBoundingClientRect();
                const clientX = (e.touches && e.touches.length > 0) ? e.touches[0].clientX : e.clientX;
                const clientY = (e.touches && e.touches.length > 0) ? e.touches[0].clientY : e.clientY;

                if (!clientX || !clientY) return;

                const x = clientX - rect.left;
                const y = clientY - rect.top;

                if (x < -20 || x > rect.width + 20 || y < -20 || y > rect.height + 20) {
                    handleEnd();
                    return;
                }

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const percentX = (x - centerX) / centerX;
                const percentY = (y - centerY) / centerY;

                const isMobile = window.innerWidth <= 768;

                // Extra strong tilt angle for main hero & about portraits - made extremely subtle
                const maxTilt = isMainPortrait ? (isMobile ? 8 : 6) : (isMobile ? 6 : 4);
                const rotateX = (-percentY * maxTilt).toFixed(2);
                const rotateY = (percentX * maxTilt).toFixed(2);

                const scaleVal = isMainPortrait ? 1.01 : 1.005;
                const zVal = isMainPortrait ? 4 : 3;

                container.style.transition = 'transform 0.1s ease-out, box-shadow 0.2s ease-out';
                
                if (isMobile) {
                    // Keep container flat on mobile
                    container.style.transform = 'none';
                } else {
                    container.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scaleVal}, ${scaleVal}, ${scaleVal}) translateZ(${zVal}px)`;
                }
                container.classList.add('tilt-3d-active');

                // 3D Z-Pop layer for the actual photo
                if (img) {
                    img.style.transition = 'transform 0.1s ease-out, border-color 0.2s ease';
                    if (isMobile) {
                        // Apply tilt rotation directly to the image itself on mobile screens
                        // For the main hero avatar, keep the scale to 1.18 to prevent white margins from showing.
                        const scale = isMainPortrait ? 1.18 : 1.02;
                        img.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
                    } else {
                        const imgZ = isMainPortrait ? 8 : 5;
                        img.style.transform = `translateZ(${imgZ}px) scale(1.01)`;
                    }
                    if (isMainPortrait) {
                        img.style.borderColor = 'var(--color-accent-gold)';
                    }
                }

                if (glassCard) {
                    glassCard.style.transition = 'transform 0.1s ease-out';
                    glassCard.style.transform = isMobile ? 'none' : 'translateZ(5px)';
                }

                // Reverse 3D Parallax for ambient background glow
                if (bgGlow) {
                    if (isMobile) {
                        bgGlow.style.transform = 'none';
                    } else {
                        const glowX = (-percentX * 5).toFixed(2);
                        const glowY = (-percentY * 5).toFixed(2);
                        bgGlow.style.transform = `translate(${glowX}px, ${glowY}px) scale(1.05)`;
                    }
                }

                glare.style.opacity = isMobile ? '0' : '1';
                if (!isMobile) {
                    const glareIntensity = isMainPortrait ? 0.2 : 0.15;
                    glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, ${glareIntensity}) 0%, rgba(56, 189, 248, 0.05) 40%, transparent 80%)`;
                }
            }

            function handleEnd() {
                const isMobile = window.innerWidth <= 768;
                container.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s ease';
                container.style.transform = 'none';
                container.classList.remove('tilt-3d-active');

                if (img) {
                    img.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
                    if (isMobile && isMainPortrait) {
                        // Restore base scale on mobile to keep white borders cropped out
                        img.style.transform = 'scale(1.15)';
                    } else {
                        img.style.transform = 'none';
                    }
                }

                if (glassCard) {
                    glassCard.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
                    glassCard.style.transform = 'none';
                }

                if (bgGlow) {
                    bgGlow.style.transform = 'none';
                }

                glare.style.opacity = '0';
            }

            // Mouse Events
            container.addEventListener('mousemove', handleMove);
            container.addEventListener('mouseleave', handleEnd);

            // Mobile Touch Events
            container.addEventListener('touchstart', handleMove, { passive: true });
            container.addEventListener('touchmove', handleMove, { passive: true });
            container.addEventListener('touchend', handleEnd);
            container.addEventListener('touchcancel', handleEnd);
        });
    }

    init3DImageEffects();
});


