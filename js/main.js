/* ========================================
   LifeWink - Main JavaScript
   Animations and Interactions
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
    // Lock page during splash intro (homepage, first visit only)
    const splashEl = document.getElementById('heroSplash');
    if (splashEl) {
        if (sessionStorage.getItem('splashShown')) {
            // Already seen this session — remove splash, show homepage directly
            splashEl.remove();
        } else {
            document.body.classList.add('splash-active');
        }
    }

    // Initialize all components
    initNavbar();
    initMobileMenu();
    initScrollAnimations();
    initSmoothScroll();
    initParallaxEffects();
    initHIWDeviceParallax();
    initRolesSection();
    initHoverEffects();

    // Animation enhancements
    initRotatingWords();
    initHeroParticles();
});

/* ========================================
   Navbar
   ======================================== */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        // Add/remove scrolled class
        if (currentScrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScrollY = currentScrollY;
    });
}

/* ========================================
   Mobile Menu
   ======================================== */
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when clicking a link
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
}

/* ========================================
   Scroll Animations
   ======================================== */
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const delay = element.dataset.delay || 0;

                setTimeout(() => {
                    element.classList.add('visible');
                }, delay);

                // Optional: unobserve after animation
                // observer.unobserve(element);
            }
        });
    }, observerOptions);

    // Observe all animated elements
    const animatedElements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right');
    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // Classic Bento Cards Scroll Animation
    initBentoCardAnimations();
}

/* ========================================
   Bento Card Scroll Animations
   ======================================== */
function initBentoCardAnimations() {
    // Select Classic, AI bento cards, 2x2 cards, and Share cards
    const bentoCards = document.querySelectorAll('.classic-bento-card, .ai-bento-card');
    const classic2x2Cards = document.querySelectorAll('.classic-2x2-card');
    const shareCards = document.querySelectorAll('.share-card');

    // Add scroll-animate class to bento cards
    bentoCards.forEach(card => {
        card.classList.add('scroll-animate');
    });

    const bentoObserverOptions = {
        root: null,
        rootMargin: '-50px',
        threshold: 0.1
    };

    const bentoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                bentoObserver.unobserve(entry.target);
            }
        });
    }, bentoObserverOptions);

    // Observe bento cards
    bentoCards.forEach(card => {
        bentoObserver.observe(card);
    });

    // Observe 2x2 cards (they already have scroll-animate class in HTML)
    classic2x2Cards.forEach(card => {
        bentoObserver.observe(card);
    });

    // Observe share cards (they already have scroll-animate class in HTML)
    shareCards.forEach(card => {
        bentoObserver.observe(card);
    });

    // Observe final CTA device stack for cascade-in animation
    const finalCta = document.querySelector('.hiw-final-cta');
    if (finalCta) {
        const ctaObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    ctaObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        ctaObserver.observe(finalCta);
    }
}

/* ========================================
   Smooth Scroll
   ======================================== */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const offsetTop = target.offsetTop - 80; // Account for fixed navbar

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ========================================
   Parallax Effects
   ======================================== */
function initParallaxEffects() {
    const shapes = document.querySelectorAll('.shape');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        shapes.forEach((shape, index) => {
            const speed = 0.05 + (index * 0.02);
            const yPos = scrollY * speed;
            shape.style.transform = `translateY(${yPos}px)`;
        });
    });

    // Mouse move parallax for hero devices
    // Targets the actual Figma-layout device classes
    const heroSection = document.querySelector('.hero');
    const heroDevices = document.querySelectorAll('.hero-device-phone, .hero-device-desktop, .hero-device-tablet');

    if (heroSection && heroDevices.length > 0) {
        // Store each device's original CSS transform so we can layer parallax on top
        const deviceBaseTransforms = [];
        heroDevices.forEach(device => {
            const computed = window.getComputedStyle(device);
            deviceBaseTransforms.push(computed.transform === 'none' ? '' : computed.transform);
        });

        // Intensity per device: phone gets most, desktop least, tablet medium
        const intensities = [15, 5, 10];

        heroSection.addEventListener('mousemove', throttle((e) => {
            const { clientX, clientY } = e;
            const rect = heroSection.getBoundingClientRect();

            // Normalised mouse position: -0.5 to 0.5
            const xNorm = (clientX - rect.left) / rect.width - 0.5;
            const yNorm = (clientY - rect.top) / rect.height - 0.5;

            heroDevices.forEach((device, index) => {
                const intensity = intensities[index] || 8;
                const translateX = xNorm * intensity;
                const translateY = yNorm * intensity;

                // Layer subtle translate on top of existing transform
                device.style.transform =
                    device.classList.contains('visible')
                        ? `translateX(${translateX}px) translateY(${translateY}px)` +
                          (device.classList.contains('hero-device-phone') ? ' rotate(-7.01deg)' : '')
                        : '';
                device.style.transition = 'transform 0.15s ease-out';
            });
        }, 16));

        heroSection.addEventListener('mouseleave', () => {
            heroDevices.forEach(device => {
                // Reset to CSS-defined transform
                device.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                if (device.classList.contains('hero-device-phone')) {
                    device.style.transform = 'translateX(0) rotate(-7.01deg)';
                } else {
                    device.style.transform = '';
                }
            });
        });
    }
}

/* ========================================
   HIW Hero - 3-Device Parallax on Scroll
   ======================================== */
function initHIWDeviceParallax() {
    const hiwHeroSection = document.querySelector('.hiw-hero-split');
    const hiwDevices = document.querySelectorAll('.hiw-device[data-parallax-speed]');

    if (!hiwHeroSection || hiwDevices.length === 0) return;

    // Store base transforms for each device
    const baseTransforms = {
        'hiw-device-desktop': 'translateX(-50%)',
        'hiw-device-tablet': '',
        'hiw-device-phone': 'rotate(-5deg)'
    };

    // Scroll-based parallax: each device moves at a different speed
    window.addEventListener('scroll', () => {
        const rect = hiwHeroSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Only animate when section is in viewport
        if (rect.bottom < 0 || rect.top > windowHeight) return;

        // Calculate scroll progress through the section (0 to 1)
        const scrollProgress = (windowHeight - rect.top) / (windowHeight + rect.height);

        hiwDevices.forEach(device => {
            const speed = parseFloat(device.getAttribute('data-parallax-speed')) || 0.05;
            const yOffset = (scrollProgress - 0.5) * speed * 300;

            // Get the base transform for this device
            let base = '';
            for (const [className, transform] of Object.entries(baseTransforms)) {
                if (device.classList.contains(className)) {
                    base = transform;
                    break;
                }
            }

            device.style.transform = `${base} translateY(${yOffset}px)`;
        });
    });

    // Mouse-move parallax for extra depth
    hiwHeroSection.addEventListener('mousemove', throttle((e) => {
        const rect = hiwHeroSection.getBoundingClientRect();
        const xNorm = (e.clientX - rect.left) / rect.width - 0.5;
        const yNorm = (e.clientY - rect.top) / rect.height - 0.5;

        hiwDevices.forEach(device => {
            const speed = parseFloat(device.getAttribute('data-parallax-speed')) || 0.05;
            const intensity = speed * 150;
            const translateX = xNorm * intensity;
            const translateY = yNorm * intensity;

            let base = '';
            for (const [className, transform] of Object.entries(baseTransforms)) {
                if (device.classList.contains(className)) {
                    base = transform;
                    break;
                }
            }

            device.style.transform = `${base} translate(${translateX}px, ${translateY}px)`;
            device.style.transition = 'transform 0.15s ease-out';
        });
    }, 16));

    hiwHeroSection.addEventListener('mouseleave', () => {
        hiwDevices.forEach(device => {
            let base = '';
            for (const [className, transform] of Object.entries(baseTransforms)) {
                if (device.classList.contains(className)) {
                    base = transform;
                    break;
                }
            }
            device.style.transform = base;
            device.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });
}

/* ========================================
   Roles Section - Scroll-Driven Interaction
   ======================================== */
function initRolesSection() {
    const rolesSection = document.getElementById('rolesSection');
    if (!rolesSection) return;

    const scrollArea = rolesSection.querySelector('.hiw-roles-scroll-area');
    const roleItems = rolesSection.querySelectorAll('.hiw-role-item');
    const roleImages = rolesSection.querySelectorAll('.hiw-role-image');

    if (roleItems.length === 0 || !scrollArea) return;

    const totalRoles = roleItems.length; // 4

    // Click handler: clicking an item still activates it
    roleItems.forEach(item => {
        item.addEventListener('click', () => {
            const roleIndex = item.getAttribute('data-role');
            activateRole(roleIndex, roleItems, roleImages);
        });
    });

    // Scroll-progress handler: calculate which role should be active
    // based on how far through the scroll-area the user has scrolled
    let lastActiveIndex = 0;

    function onScroll() {
        const scrollAreaRect = scrollArea.getBoundingClientRect();
        const scrollAreaTop = scrollAreaRect.top;
        const scrollAreaHeight = scrollAreaRect.height;

        // Progress: 0 when top of scroll-area reaches viewport top,
        // 1 when bottom of scroll-area reaches viewport bottom.
        // Sticky top is 0 (full-viewport layout), so offset is 0.
        const stickyOffset = 0;
        const progress = Math.max(0, Math.min(1, (-scrollAreaTop + stickyOffset) / (scrollAreaHeight - window.innerHeight)));

        // Divide progress into equal segments for each role
        // Each role gets 1/totalRoles of the scroll
        const segmentSize = 1 / totalRoles;
        let activeIndex = Math.floor(progress / segmentSize);

        // Clamp to valid range
        activeIndex = Math.max(0, Math.min(totalRoles - 1, activeIndex));

        // Only update if the active role has changed
        if (activeIndex !== lastActiveIndex) {
            lastActiveIndex = activeIndex;
            activateRole(activeIndex, roleItems, roleImages);
        }
    }

    // Use requestAnimationFrame for smooth performance
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                onScroll();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Run once on load to set initial state
    onScroll();
}

function activateRole(index, roleItems, roleImages) {
    // Deactivate all
    roleItems.forEach(item => item.classList.remove('active'));
    roleImages.forEach(img => img.classList.remove('active'));

    // Activate the target
    const targetItem = document.querySelector(`.hiw-role-item[data-role="${index}"]`);
    const targetImage = document.querySelector(`.hiw-role-image[data-role-img="${index}"]`);

    if (targetItem) targetItem.classList.add('active');
    if (targetImage) targetImage.classList.add('active');
}

/* ========================================
   Hover Effects
   ======================================== */
function initHoverEffects() {
    // Button ripple effect
    const buttons = document.querySelectorAll('.btn');

    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();

            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;

            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';

            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Add ripple animation to stylesheet
    if (!document.querySelector('#ripple-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-style';
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Explore card tilt effect
    const exploreCards = document.querySelectorAll('.explore-card');

    exploreCards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            this.style.transform = `translateY(-8px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) perspective(1000px) rotateX(0) rotateY(0)';
        });
    });

    // Feature phone float animation
    const featurePhones = document.querySelectorAll('.feature-phone');

    featurePhones.forEach(phone => {
        phone.addEventListener('mouseenter', function() {
            this.style.animation = 'floatPhone 3s ease-in-out infinite';
        });

        phone.addEventListener('mouseleave', function() {
            this.style.animation = 'none';
        });
    });

    // Add float animation
    if (!document.querySelector('#float-phone-style')) {
        const style = document.createElement('style');
        style.id = 'float-phone-style';
        style.textContent = `
            @keyframes floatPhone {
                0%, 100% {
                    transform: translateY(0);
                }
                50% {
                    transform: translateY(-10px);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

/* ========================================
   Counter Animation (if needed)
   ======================================== */
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);

    const updateCounter = () => {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    };

    updateCounter();
}

/* ========================================
   Typing Effect (if needed)
   ======================================== */
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}

/* ========================================
   Lazy Loading Images
   ======================================== */
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

/* ========================================
   Scroll to Top Button
   ======================================== */
function initScrollToTop() {
    const scrollBtn = document.createElement('button');
    scrollBtn.innerHTML = '↑';
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--primary-blue);
        color: white;
        border: none;
        cursor: pointer;
        font-size: 20px;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
    `;

    document.body.appendChild(scrollBtn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollBtn.style.opacity = '1';
            scrollBtn.style.visibility = 'visible';
        } else {
            scrollBtn.style.opacity = '0';
            scrollBtn.style.visibility = 'hidden';
        }
    });

    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    scrollBtn.addEventListener('mouseenter', () => {
        scrollBtn.style.transform = 'scale(1.1)';
    });

    scrollBtn.addEventListener('mouseleave', () => {
        scrollBtn.style.transform = 'scale(1)';
    });
}

// Initialize scroll to top
initScrollToTop();

/* ========================================
   Page Load Animation
   ======================================== */
window.addEventListener('load', () => {
    document.body.classList.add('loaded');

    // If splash intro is active, DON'T auto-reveal hero
    // — the splash handles the reveal after its cycle completes.
    const splashActive = document.body.classList.contains('splash-active');
    if (!splashActive) {
        // Reveal hero content + devices (in case splash was skipped)
        const cw = document.querySelector('.hero-content-wrapper');
        const dw = document.querySelector('.hero-devices-wrapper');
        if (cw) cw.classList.add('revealed');
        if (dw) dw.classList.add('revealed');

        // Reveal hero elements with stagger animation
        setTimeout(() => {
            const heroElements = document.querySelectorAll('.hero .fade-in-up, .hero .fade-in-left, .hero .fade-in-right');
            heroElements.forEach((el, index) => {
                setTimeout(() => {
                    el.classList.add('visible');
                }, index * 150);
            });
        }, 100);
    }
});

/* ========================================
   Form Validation Helper (for future use)
   ======================================== */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/* ========================================
   Utility Functions
   ======================================== */
function debounce(func, wait = 20) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit = 100) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}


/* ========================================
   ANIMATION ENHANCEMENTS
   Premium interactive animations for the
   landing page. Clean, separate from core code.
   ======================================== */


/* ----------------------------------------
   Rotating Words in Hero Title
   Cycles: love → memories → moments →
           stories → legacy
   ---------------------------------------- */
function initRotatingWords() {
    const heroSplash = document.getElementById('heroSplash');
    const hasSplash = !!heroSplash;

    // ----- SPLASH INTRO (homepage, first visit only) -----
    if (hasSplash && !sessionStorage.getItem('splashShown')) {
        initSplashIntro(heroSplash);
    }

    // ----- MAIN HERO rotating words (infinite, starts after splash) -----
    const wrapper = document.querySelector('.hero-rotating-wrapper');
    const words = document.querySelectorAll('.hero-word');
    if (!wrapper || words.length === 0) return;

    let currentIndex = 0;
    const totalWords = words.length;
    const INTERVAL = 2800; // ms between word changes

    // Measure each word's natural width
    const wordWidths = [];
    words.forEach(word => {
        word.style.position = 'static';
        word.style.visibility = 'hidden';
        word.style.display = 'inline-block';
        word.style.opacity = '1';
        word.style.transform = 'none';
        wordWidths.push(word.offsetWidth + 8);
        word.style.position = '';
        word.style.visibility = '';
        word.style.display = '';
        word.style.opacity = '';
        word.style.transform = '';
    });

    wrapper.style.width = wordWidths[0] + 'px';
    wrapper.style.transition = 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)';

    function rotateWord() {
        const current = words[currentIndex];
        const nextIndex = (currentIndex + 1) % totalWords;
        const next = words[nextIndex];

        wrapper.style.width = wordWidths[nextIndex] + 'px';

        current.classList.remove('active');
        current.classList.add('exit-up');

        next.classList.remove('exit-up');
        next.classList.add('active');

        setTimeout(() => {
            current.classList.remove('exit-up');
        }, 600);

        currentIndex = nextIndex;
    }

    // Delay the infinite rotation start if splash is active
    const startDelay = hasSplash ? 11000 : 1500;
    setTimeout(() => {
        setInterval(rotateWord, INTERVAL);
    }, startDelay);
}


/* ----------------------------------------
   Splash Intro — Full-screen rotating words
   Plays once (~10s), then fades out to reveal
   the main hero content.
   ---------------------------------------- */
function initSplashIntro(splashEl) {
    const splashWrapper = splashEl.querySelector('.splash-rotating-wrapper');
    const splashWords = splashEl.querySelectorAll('.splash-word');
    if (!splashWrapper || splashWords.length === 0) return;

    const contentWrapper = document.querySelector('.hero-content-wrapper');
    const devicesWrapper = document.querySelector('.hero-devices-wrapper');

    const SPLASH_INTERVAL = 1800; // ms per word
    const totalWords = splashWords.length;
    let splashIndex = 0;

    // Cursor sparkles on splash screen
    const splashParticleContainer = splashEl.querySelector('.splash-particles');
    if (splashParticleContainer) {
        let splashSparkleThrottle = 0;
        splashEl.style.cursor = 'default';
        splashEl.style.pointerEvents = 'auto';
        splashEl.addEventListener('mousemove', function(e) {
            const now = Date.now();
            if (now - splashSparkleThrottle > 80) {
                splashSparkleThrottle = now;
                const sparkle = document.createElement('div');
                sparkle.classList.add('hero-sparkle');
                const size = Math.random() * 3 + 2;
                sparkle.style.cssText = `
                    width: ${size}px;
                    height: ${size}px;
                    left: ${e.clientX}px;
                    top: ${e.clientY}px;
                `;
                splashParticleContainer.appendChild(sparkle);
                setTimeout(() => sparkle.remove(), 1500);
            }
        });
    }

    // Measure splash word widths
    const splashWidths = [];
    splashWords.forEach(word => {
        word.style.position = 'static';
        word.style.visibility = 'hidden';
        word.style.display = 'inline-block';
        word.style.opacity = '1';
        word.style.transform = 'none';
        splashWidths.push(word.offsetWidth + 8);
        word.style.position = '';
        word.style.visibility = '';
        word.style.display = '';
        word.style.opacity = '';
        word.style.transform = '';
    });

    splashWrapper.style.width = splashWidths[0] + 'px';
    splashWrapper.style.transition = 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)';

    function rotateSplashWord() {
        const current = splashWords[splashIndex];
        const nextIndex = splashIndex + 1;

        // Safety check — if somehow called after last word, do nothing
        if (nextIndex >= totalWords) return;

        const next = splashWords[nextIndex];

        // Animate wrapper width
        splashWrapper.style.width = splashWidths[nextIndex] + 'px';

        // Current exits up
        current.classList.remove('active');
        current.classList.add('exit-up');

        // Next enters from below
        next.classList.remove('exit-up');
        next.classList.add('active');

        setTimeout(() => {
            current.classList.remove('exit-up');
        }, 600);

        splashIndex = nextIndex;
    }

    function revealHero() {
        // Fade out the splash overlay
        splashEl.classList.add('fade-out');

        // Mark splash as shown so it won't play again this session
        sessionStorage.setItem('splashShown', 'true');

        // Unlock scrolling and restore navbar
        document.body.classList.remove('splash-active');

        // After splash is gone, reveal main hero content
        setTimeout(() => {
            if (contentWrapper) contentWrapper.classList.add('revealed');
            if (devicesWrapper) devicesWrapper.classList.add('revealed');

            // Trigger the hero fade-in animations
            const heroElements = document.querySelectorAll('.hero .fade-in-up, .hero .fade-in-left, .hero .fade-in-right');
            heroElements.forEach((el, index) => {
                setTimeout(() => {
                    el.classList.add('visible');
                }, index * 150);
            });

            // Remove splash from DOM after transition
            setTimeout(() => {
                splashEl.remove();
            }, 500);
        }, 800); // Wait for splash fade-out transition
    }

    // Start the splash word rotation after a brief initial pause
    setTimeout(() => {
        const splashTimer = setInterval(() => {
            rotateSplashWord();
            // Stop interval once all words have been shown
            if (splashIndex >= totalWords - 1) {
                clearInterval(splashTimer);
                // Hold on last word for 1.5s, then reveal homepage
                setTimeout(() => revealHero(), 1500);
            }
        }, SPLASH_INTERVAL);
    }, 1000);
}


/* ----------------------------------------
   Hero Floating Particles
   Creates soft glowing dots that drift
   upward through the hero gradient.
   ---------------------------------------- */
function initHeroParticles() {
    const container = document.querySelector('.hero-particles');
    if (!container) return;

    // Respect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const heroSection = container.closest('section') || container.parentElement;
    const PARTICLE_COUNT = window.innerWidth < 768 ? 10 : 25;
    let particlesStarted = false;
    let sparkleThrottle = 0;

    function createParticle() {
        const particle = document.createElement('div');
        particle.classList.add('hero-particle');

        // Random properties — subtle and soft
        const size = Math.random() * 4 + 2; // 2-6px
        const startX = Math.random() * 100; // % from left
        const startY = 80 + Math.random() * 20; // Start from bottom 20%
        const duration = Math.random() * 6 + 6; // 6-12s
        const delay = Math.random() * 2; // 0-2s stagger (appear fast)
        const driftX = (Math.random() - 0.5) * 80; // Horizontal drift

        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${startX}%;
            top: ${startY}%;
            --drift-x: ${driftX}px;
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
            opacity: 0;
        `;

        container.appendChild(particle);

        // Remove and recreate after animation completes
        const totalTime = (duration + delay) * 1000;
        setTimeout(() => {
            particle.remove();
            createParticle(); // Recycle
        }, totalTime);
    }

    function createSparkle(x, y) {
        const sparkle = document.createElement('div');
        sparkle.classList.add('hero-sparkle');

        const size = Math.random() * 3 + 2; // 2-5px
        const heroRect = heroSection.getBoundingClientRect();
        const relX = x - heroRect.left;
        const relY = y - heroRect.top;

        sparkle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${relX}px;
            top: ${relY}px;
        `;

        container.appendChild(sparkle);

        // Remove after animation
        setTimeout(() => sparkle.remove(), 1500);
    }

    function startParticles() {
        if (particlesStarted) return;
        particlesStarted = true;

        // Create initial batch immediately
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            createParticle();
        }
    }

    // Trigger on first mouse movement anywhere on the hero
    heroSection.addEventListener('mousemove', function(e) {
        // Start ambient particles on first movement
        startParticles();

        // Spawn cursor sparkles (throttled)
        const now = Date.now();
        if (now - sparkleThrottle > 80) { // Max ~12 sparkles/sec
            sparkleThrottle = now;
            createSparkle(e.clientX, e.clientY);
        }
    });

    // Also trigger on touch for mobile
    heroSection.addEventListener('touchstart', function() {
        startParticles();
    }, { once: true });
}
