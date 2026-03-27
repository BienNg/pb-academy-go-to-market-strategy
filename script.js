const slides = [
    'slide-01-hero.html',
    'slide-02-problem.html',
    'slide-03-objective.html',
    'slide-04-approach.html',
    'slide-06-content-engine.html',
    'slide-07-content-output.html',
    'slide-08-distribution.html',
    'slide-09-paid-strategy.html',
    'slide-14-scalability.html',
    'slide-15-competition.html',
    'slide-17-outcome.html',
    'slide-18-closing.html'
];

let currentSlideIndex = 0;
let isAnimating = false;
let startTouchY = 0;

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
            if (diff > 0 && currentSlideIndex < slides.length - 1) {
                // Swipe up
                goToSlide(currentSlideIndex + 1);
            } else if (diff < 0 && currentSlideIndex > 0) {
                // Swipe down
                goToSlide(currentSlideIndex - 1);
            }
            startTouchY = touchY; // Reset threshold
        }
    }, { passive: false });
});

function handleScroll(e) {
    e.preventDefault(); // Prevent default scrolling
    
    if (isAnimating) return;

    if (e.deltaY > 0 && currentSlideIndex < slides.length - 1) {
        goToSlide(currentSlideIndex + 1);
    } else if (e.deltaY < 0 && currentSlideIndex > 0) {
        goToSlide(currentSlideIndex - 1);
    }
}

function handleKeyDown(e) {
    if (isAnimating) return;

    if ((e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') && currentSlideIndex < slides.length - 1) {
        goToSlide(currentSlideIndex + 1);
    } else if ((e.key === 'ArrowUp' || e.key === 'PageUp') && currentSlideIndex > 0) {
        goToSlide(currentSlideIndex - 1);
    } else if (e.key === 'Home') {
        goToSlide(0);
    } else if (e.key === 'End') {
        goToSlide(slides.length - 1);
    }
}

function goToSlide(index) {
    if (isAnimating || index === currentSlideIndex) return;
    isAnimating = true;

    // Remove active class from current slide
    const currentSlide = document.getElementById(`slide-${currentSlideIndex}`);
    currentSlide.classList.remove('active');
    
    // Reset animations in previous slide
    const animatedElements = currentSlide.querySelectorAll('.slide-up, .fade-in');
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

    const elements = slide.querySelectorAll('.slide-up, .fade-in');
    elements.forEach(el => {
        // slight delay to ensure display has updated
        setTimeout(() => el.classList.add('visible'), 50);
    });
}

function setupObserver() {
    // We handle animations manually via JS when slides change
    // but keep this structure in case we want to observe specific elements later
}