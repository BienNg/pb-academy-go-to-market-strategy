const slides = [
    'slide-01-hero.html',
    'slide-02-market-entry.html',
    'slide-03-objective.html',
    'slide-04-approach.html',
    'slide-05-phases-1-2.html',
    'slide-06-phase2-validation.html',
    'slide-07-placeholder.html',
    'slide-08-social-conversion.html',
    'slide-09-objective.html',
    'slide-10-placeholder.html',
    'slide-11-placeholder.html',
    'slide-12-placeholder.html'
];

let currentSlideIndex = 0;
let isAnimating = false;
let startTouchY = 0;
let slide2SubState = 0; // 0: initial, 1: steps 2,3,4 hidden

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    
    // Check if running on file:// protocol
    if (window.location.protocol === 'file:') {
        document.getElementById('cors-warning').classList.remove('hidden');
        return; // Stop execution to prevent CORS errors in console
    }

    const container = document.getElementById('slides-container');
    const navDotsContainer = document.getElementById('nav-dots');

    // Load all slides
    for (let i = 0; i < slides.length; i++) {
        try {
            const response = await fetch(`slides/${slides[i]}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const html = await response.text();
            
            // Create slide element
            const slideSection = document.createElement('section');
            slideSection.className = `slide-section ${i === 0 ? 'active' : ''}`;
            slideSection.id = `slide-${i}`;
            slideSection.innerHTML = html;
            container.appendChild(slideSection);

            // Create dot
            const dot = document.createElement('div');
            dot.className = `nav-dot ${i === 0 ? 'active' : ''}`;
            dot.dataset.index = i;
            dot.addEventListener('click', () => goToSlide(i));
            navDotsContainer.appendChild(dot);

        } catch (error) {
            console.error(`Error loading slide ${slides[i]}:`, error);
        }
    }

    // Setup Intersection Observer for animations within slides
    setupObserver();
    
    // Trigger initial animations for first slide
    triggerAnimations(0);

    // Event Listeners for slide navigation
    window.addEventListener('wheel', handleScroll, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    
    // Touch events for mobile
    window.addEventListener('touchstart', (e) => {
        startTouchY = e.touches[0].clientY;
    }, { passive: true });
    
    window.addEventListener('touchmove', (e) => {
        if (isAnimating) {
            e.preventDefault();
            return;
        }
        
        const touchY = e.touches[0].clientY;
        const diff = startTouchY - touchY;
        
        if (Math.abs(diff) > 50) { // Threshold
            if (diff > 0) {
                // Swipe up
                if (currentSlideIndex === 2 && slide2SubState === 0) {
                    transitionSlide2SubState(1);
                } else if (currentSlideIndex < slides.length - 1) {
                    goToSlide(currentSlideIndex + 1);
                }
            } else if (diff < 0) {
                // Swipe down
                if (currentSlideIndex === 2 && slide2SubState === 1) {
                    transitionSlide2SubState(0);
                } else if (currentSlideIndex > 0) {
                    goToSlide(currentSlideIndex - 1);
                }
            }
            startTouchY = touchY; // Reset threshold
        }
    }, { passive: false });
});

function handleScroll(e) {
    e.preventDefault(); // Prevent default scrolling
    
    if (isAnimating) return;

    if (e.deltaY > 0) {
        if (currentSlideIndex === 2 && slide2SubState === 0) {
            transitionSlide2SubState(1);
        } else if (currentSlideIndex < slides.length - 1) {
            goToSlide(currentSlideIndex + 1);
        }
    } else if (e.deltaY < 0) {
        if (currentSlideIndex === 2 && slide2SubState === 1) {
            transitionSlide2SubState(0);
        } else if (currentSlideIndex > 0) {
            goToSlide(currentSlideIndex - 1);
        }
    }
}

function handleKeyDown(e) {
    if (isAnimating) return;

    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        if (currentSlideIndex === 2 && slide2SubState === 0) {
            transitionSlide2SubState(1);
        } else if (currentSlideIndex < slides.length - 1) {
            goToSlide(currentSlideIndex + 1);
        }
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (currentSlideIndex === 2 && slide2SubState === 1) {
            transitionSlide2SubState(0);
        } else if (currentSlideIndex > 0) {
            goToSlide(currentSlideIndex - 1);
        }
    } else if (e.key === 'Home') {
        goToSlide(0);
    } else if (e.key === 'End') {
        goToSlide(slides.length - 1);
    }
}

function goToSlide(index) {
    if (isAnimating || index === currentSlideIndex) return;
    isAnimating = true;

    // Reset slide2 sub-state if we are leaving or entering slide 2
    if (currentSlideIndex === 2 || index === 2) {
        slide2SubState = 0;
        const slide2 = document.getElementById('slide-2');
        if (slide2) {
            const stepsToHide = slide2.querySelectorAll('.gtm-step-block--2, .gtm-step-block--3, .gtm-step-block--4, .gtm-climber');
            stepsToHide.forEach(el => el.classList.remove('shrink-away'));
        }
    }

    // Remove active class from current slide
    const currentSlide = document.getElementById(`slide-${currentSlideIndex}`);
    currentSlide.classList.remove('active');
    
    // Reset animations in previous slide
    const animatedElements = currentSlide.querySelectorAll('.slide-up, .fade-in, .slide-in-left, .scale-pop, .conversion-layer, .phase1-arrow');
    animatedElements.forEach(el => el.classList.remove('visible'));

    // Update index
    currentSlideIndex = index;

    // Add active class to new slide
    const newSlide = document.getElementById(`slide-${currentSlideIndex}`);
    newSlide.classList.add('active');

    // Update dots
    document.querySelectorAll('.nav-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlideIndex);
    });

    // Update Progress bar
    const progress = ((currentSlideIndex + 1) / slides.length) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;

    // Trigger animations in new slide
    setTimeout(() => {
        triggerAnimations(currentSlideIndex);
        setTimeout(() => { isAnimating = false; }, 600); // Wait for transition to finish before allowing next scroll
    }, 100);
}

function triggerAnimations(slideIndex) {
    const slide = document.getElementById(`slide-${slideIndex}`);
    if (!slide) return;

    const elements = slide.querySelectorAll('.slide-up, .fade-in, .slide-in-left, .scale-pop, .conversion-layer, .phase1-arrow');
    elements.forEach(el => {
        // slight delay to ensure display has updated
        setTimeout(() => el.classList.add('visible'), 50);
    });
}

function setupObserver() {
    // We handle animations manually via JS when slides change
    // but keep this structure in case we want to observe specific elements later
}

function transitionSlide2SubState(newState) {
    if (isAnimating) return;
    isAnimating = true;
    slide2SubState = newState;

    const slide = document.getElementById('slide-2');
    if (!slide) return;
    const stepsToHide = slide.querySelectorAll('.gtm-step-block--2, .gtm-step-block--3, .gtm-step-block--4, .gtm-climber');

    if (newState === 1) {
        stepsToHide.forEach(el => el.classList.add('shrink-away'));
    } else {
        stepsToHide.forEach(el => el.classList.remove('shrink-away'));
    }

    setTimeout(() => {
        isAnimating = false;
    }, 600); // Wait for transition to finish
}