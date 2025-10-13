// Mobile-First Scrollytelling Photo Essay
document.addEventListener('DOMContentLoaded', function() {
    console.log('Mobile-First Photo Essay Loaded');
    
    // Initialize mobile-first scrollytelling features
    initScrollProgress();
    initScrollytelling();
    initStickyHeader();
    initMobileOptimizations();
});

// Scroll progress indicator
function initScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);
    
    const updateProgress = throttle(() => {
        const scrollTop = window.pageYOffset;
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = Math.min((scrollTop / documentHeight) * 100, 100);
        progressBar.style.width = progress + '%';
    }, 16);
    
    window.addEventListener('scroll', updateProgress);
}

// Sticky Header functionality
function initStickyHeader() {
    const header = document.getElementById('sticky-header');
    const heroImage = document.querySelector('.hero-image-container');
    
    if (!header || !heroImage) return;
    
    // Wait for image to load to get proper height
    const heroImg = heroImage.querySelector('.hero-image');
    if (heroImg) {
        heroImg.addEventListener('load', function() {
            updateHeaderTrigger();
        });
        
        // Also check if already loaded
        if (heroImg.complete) {
            updateHeaderTrigger();
        }
    }
    
    function updateHeaderTrigger() {
        const showHeaderAtScroll = heroImage.offsetHeight * 0.7; // Show after 70% of hero image
        
        window.addEventListener('scroll', () => {
            const scrollY = window.pageYOffset;
            
            if (scrollY > showHeaderAtScroll) {
                header.classList.add('visible');
            } else {
                header.classList.remove('visible');
            }
        });
    }
}

// Fixed scrollytelling - forward scroll only
function initScrollytelling() {
    console.log('Initializing forward-scroll scrollytelling...');
    
    // Debug: check what images exist
    const allImages = document.querySelectorAll('.image-container');
    const scrollImages = document.querySelectorAll('.scroll-image');
    console.log('All image containers found:', allImages.length);
    console.log('All scroll images found:', scrollImages.length);
    
    const imageRevealOptions = {
        threshold: 0.3,
        rootMargin: '0px 0px -100px 0px'
    };
    
    // Forward-scroll-only observer for images
    const imageRevealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const imageContainer = entry.target;
            
            if (entry.isIntersecting && !imageContainer.classList.contains('revealed')) {
                console.log('🎬 Revealing image container:', imageContainer);
                imageContainer.classList.add('revealed');
                // Don't remove revealed class when scrolling backward
            }
            // No fade-out on scroll - images stay visible once revealed
        });
    }, imageRevealOptions);
    
    // Initialize title animation
    const title = document.querySelector('.essay-title');
    if (title) {
        setTimeout(() => title.classList.add('scrolled'), 500);
    }
    
    // Find and observe all image containers (excluding hero)
    const imageContainers = document.querySelectorAll('.image-container:not(.hero-image-container)');
    console.log('Found image containers:', imageContainers.length);
    
    imageContainers.forEach((container, index) => {
        console.log(`Setting up image container ${index}:`, container);
        
        // Start observing
        imageRevealObserver.observe(container);
        
        // Fallback reveal after delay
        setTimeout(() => {
            if (!container.classList.contains('revealed')) {
                console.log('🔄 Fallback reveal for image container:', index);
                container.classList.add('revealed');
            }
        }, 2000 + (index * 800));
    });
    
    // Add text section animations
    initTextScrollAnimations();
}

// Get initial transform based on animation type
function getInitialTransform(animationType) {
    switch(animationType) {
        case 'slide-up':
            return 'translateY(200px)';
        case 'zoom-out':
            return 'scale(1.8) translateY(30px)';
        case 'slide-in':
            return 'translateX(-150px)';
        default:
            return 'translateY(100px)';
    }
}

// Mobile-specific optimizations
function initMobileOptimizations() {
    // Prevent zoom on double tap for iOS
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // Optimize scroll performance for mobile
    let ticking = false;
    
    function updateOnScroll() {
        // Handle any scroll-based animations here
        handleParallaxEffects();
        ticking = false;
    }
    
    function requestScrollUpdate() {
        if (!ticking) {
            requestAnimationFrame(updateOnScroll);
            ticking = true;
        }
    }
    
    // Use passive listeners for better scroll performance
    window.addEventListener('scroll', requestScrollUpdate, { passive: true });
    
    // Handle orientation changes
    window.addEventListener('orientationchange', function() {
        setTimeout(() => {
            window.scrollTo(0, window.pageYOffset);
        }, 100);
    });
}

// Subtle parallax effects for mobile (very light to maintain performance)
function handleParallaxEffects() {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('[data-scroll="parallax"]');
    
    parallaxElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            const speed = 0.02; // Very subtle for mobile performance
            const yPos = scrolled * speed;
            element.style.transform = `translateY(${yPos}px)`;
        }
    });
}

// Image interaction for mobile (tap to focus)
function initImageInteractions() {
    const images = document.querySelectorAll('.essay-image');
    
    images.forEach(img => {
        img.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Simple focus effect for mobile
            this.classList.toggle('focused');
            
            // Remove focus after 3 seconds
            setTimeout(() => {
                this.classList.remove('focused');
            }, 3000);
        });
    });
}

// Initialize image interactions
initImageInteractions();


// Smooth scroll utility for internal navigation
function smoothScrollTo(targetY, duration = 800) {
    const startY = window.pageYOffset;
    const distance = targetY - startY;
    const startTime = performance.now();
    
    function animation(currentTime) {
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        
        const ease = easeInOutCubic(progress);
        window.scrollTo(0, startY + (distance * ease));
        
        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        }
    }
    
    requestAnimationFrame(animation);
}

// Easing function for smooth animations
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

// Throttle function for performance optimization
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Viewport detection for mobile
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           window.innerWidth <= 768;
}

// Add CSS class for mobile detection
if (isMobile()) {
    document.body.classList.add('mobile-device');
} else {
    document.body.classList.add('desktop-device');
}

// Lazy loading for images (performance boost on mobile)
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Text section scroll animations
function initTextScrollAnimations() {
    console.log('Initializing text scroll animations...');
    
    // Observer for text content fade-ins
    const textObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                console.log('🎬 Revealing text section');
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
    });

    // Observe story sections
    const storySections = document.querySelectorAll('.story-section');
    storySections.forEach(section => {
        textObserver.observe(section);
    });
    
    // Observe any additional text content sections
    const textSections = document.querySelectorAll('p, .text-content, .content-section');
    textSections.forEach(section => {
        textObserver.observe(section);
    });
}