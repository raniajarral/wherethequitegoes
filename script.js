// Horizontal Image Gallery with Touch Support
document.addEventListener('DOMContentLoaded', function() {
    console.log('Horizontal Gallery Loaded');
    initHorizontalGallery();
});

function initHorizontalGallery() {
    const galleryTrack = document.querySelector('.gallery-track');
    const dots = document.querySelectorAll('.dot');
    const galleryContainer = document.querySelector('.gallery-container');
    const images = document.querySelectorAll('.gallery-image');
    
    console.log('Gallery elements found:', {
        track: !!galleryTrack,
        dots: dots.length,
        container: !!galleryContainer,
        images: images.length
    });
    
    // Check if images load successfully
    images.forEach((img, index) => {
        img.addEventListener('load', () => {
            console.log(`Image ${index + 1} loaded successfully:`, img.src);
        });
        img.addEventListener('error', () => {
            console.error(`Image ${index + 1} failed to load:`, img.src);
        });
    });
    
    let currentSlide = 0;
    const totalSlides = 3;
    
    // Touch/swipe variables
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    let startTime = 0;
    
    // Update gallery position
    function updateGallery() {
        const translateX = -(currentSlide * (100 / totalSlides));
        galleryTrack.style.transform = `translateX(${translateX}%)`;
        
        // Update dots
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }
    
    // Go to specific slide
    function goToSlide(slideIndex) {
        currentSlide = Math.max(0, Math.min(slideIndex, totalSlides - 1));
        updateGallery();
    }
    
    // Next slide
    function nextSlide() {
        goToSlide(currentSlide + 1);
    }
    
    // Previous slide  
    function prevSlide() {
        goToSlide(currentSlide - 1);
    }
    
    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToSlide(index);
        });
    });
    
    // Touch/Mouse events for swiping
    function handleStart(clientX) {
        startX = clientX;
        currentX = clientX;
        isDragging = true;
        startTime = Date.now();
        galleryTrack.style.transition = 'none';
    }
    
    function handleMove(clientX) {
        if (!isDragging) return;
        
        currentX = clientX;
        const diffX = currentX - startX;
        const translateX = -(currentSlide * (100 / totalSlides)) + (diffX / galleryContainer.offsetWidth) * (100 / totalSlides);
        galleryTrack.style.transform = `translateX(${translateX}%)`;
    }
    
    function handleEnd() {
        if (!isDragging) return;
        
        isDragging = false;
        galleryTrack.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        const diffX = currentX - startX;
        const diffTime = Date.now() - startTime;
        const velocity = Math.abs(diffX) / diffTime;
        
        // Determine if swipe was significant enough
        const threshold = 50;
        const velocityThreshold = 0.3;
        
        if (Math.abs(diffX) > threshold || velocity > velocityThreshold) {
            if (diffX > 0 && currentSlide > 0) {
                prevSlide();
            } else if (diffX < 0 && currentSlide < totalSlides - 1) {
                nextSlide();
            } else {
                updateGallery(); // Snap back
            }
        } else {
            updateGallery(); // Snap back
        }
    }
    
    // Mouse events
    galleryContainer.addEventListener('mousedown', (e) => {
        e.preventDefault();
        handleStart(e.clientX);
    });
    
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            e.preventDefault();
            handleMove(e.clientX);
        }
    });
    
    document.addEventListener('mouseup', () => {
        handleEnd();
    });
    
    // Touch events
    galleryContainer.addEventListener('touchstart', (e) => {
        handleStart(e.touches[0].clientX);
    }, { passive: true });
    
    galleryContainer.addEventListener('touchmove', (e) => {
        if (isDragging) {
            handleMove(e.touches[0].clientX);
        }
    }, { passive: true });
    
    galleryContainer.addEventListener('touchend', () => {
        handleEnd();
    }, { passive: true });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            prevSlide();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
        }
    });
    
    // Auto-advance gallery every 3 seconds
    let autoAdvanceInterval = setInterval(() => {
        if (currentSlide === totalSlides - 1) {
            goToSlide(0); // Loop back to first slide
        } else {
            nextSlide(); // Go to next slide
        }
    }, 3000);
    
    // Pause auto-advance when user interacts
    function pauseAutoAdvance() {
        clearInterval(autoAdvanceInterval);
        // Resume after 5 seconds of no interaction
        setTimeout(() => {
            autoAdvanceInterval = setInterval(() => {
                if (currentSlide === totalSlides - 1) {
                    goToSlide(0);
                } else {
                    nextSlide();
                }
            }, 3000);
        }, 5000);
    }
    
    // Pause on user interaction
    galleryContainer.addEventListener('mousedown', pauseAutoAdvance);
    galleryContainer.addEventListener('touchstart', pauseAutoAdvance);
    dots.forEach(dot => {
        dot.addEventListener('click', pauseAutoAdvance);
    });
    
    // Initialize
    updateGallery();
    
    console.log('Horizontal gallery initialized with', totalSlides, 'slides and 3-second auto-advance');
    
    // Text overlay scroll effect
    initTextOverlayEffect();
}

// Text overlay scroll effect
function initTextOverlayEffect() {
    const gallery = document.querySelector('.image-gallery');
    const essay = document.querySelector('.essay');
    
    if (!gallery || !essay) return;
    
    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;
        const galleryHeight = gallery.offsetHeight;
        
        // Start overlay immediately when scrolling begins
        const overlayProgress = Math.max(0, Math.min(1, scrollY / (galleryHeight * 0.8)));
        
        // Apply transform to essay for overlay effect
        const translateY = -overlayProgress * 30; // Move essay up more dramatically as we scroll
        const opacity = 0.95 + (overlayProgress * 0.05); // Slight opacity change
        
        essay.style.transform = `translateY(${translateY}px)`;
        essay.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
        
        // Parallax effect on gallery
        const parallaxOffset = scrollY * 0.3;
        gallery.style.transform = `translateY(${parallaxOffset}px)`;
    });
}

// Smooth scroll utility for any internal links
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

// Easing function
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

// Mobile device detection
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           window.innerWidth <= 768;
}

// Add device class to body
if (isMobile()) {
    document.body.classList.add('mobile-device');
} else {
    document.body.classList.add('desktop-device');
}

// Handle orientation changes on mobile
window.addEventListener('orientationchange', function() {
    setTimeout(() => {
        // Re-initialize gallery dimensions after orientation change
        const gallery = document.querySelector('.gallery-track');
        if (gallery) {
            gallery.style.transition = 'none';
            setTimeout(() => {
                gallery.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            }, 100);
        }
    }, 100);
});