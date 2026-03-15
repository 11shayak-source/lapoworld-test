// LAPOWORLD - Main JavaScript File

document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // 1. SCROLL ANIMATIONS (Intersection Observer)
    // ==========================================
    // This watches elements as you scroll and adds the 'visible' class
    // to trigger the CSS animations (fade-in-up, pop-in)
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Triggers when 15% of the element is visible on screen
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add the visible class to trigger the animation
                entry.target.classList.add('visible');
                
                // Unobserve the element so it only animates once when scrolling down
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Grab all elements that have our animation classes
    const animatedElements = document.querySelectorAll('.fade-in-up, .pop-in');
    
    // Attach the observer to each element
    animatedElements.forEach(el => scrollObserver.observe(el));


    // ==========================================
    // 2. MOBILE MENU TOGGLE
    // ==========================================
    
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    // Quick fix to ensure the mobile button shows up on small screens
    // and hides on large screens without needing extra CSS
    function handleResize() {
        if (window.innerWidth <= 768) {
            mobileMenuBtn.style.display = 'block';
            if (mobileMenuBtn.textContent === '☰') {
                navLinks.style.display = 'none';
            }
        } else {
            mobileMenuBtn.style.display = 'none';
            navLinks.style.display = 'flex';
            navLinks.style.flexDirection = 'row';
            navLinks.style.position = 'static';
            navLinks.style.background = 'transparent';
            navLinks.style.padding = '0';
            navLinks.style.borderBottom = 'none';
        }
    }

    // Run on load and on window resize
    handleResize();
    window.addEventListener('resize', handleResize);

    // Toggle menu when clicking the hamburger icon
    if(mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            if (navLinks.style.display === 'flex' && window.innerWidth <= 768) {
                // Close Menu
                navLinks.style.display = 'none';
                mobileMenuBtn.textContent = '☰';
            } else {
                // Open Menu
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '100%';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = 'rgba(0, 0, 0, 0.95)'; // Pure black with slight transparency
                navLinks.style.padding = '1.5rem 0';
                navLinks.style.textAlign = 'center';
                navLinks.style.borderBottom = '1px solid var(--accent)'; // Orange border at bottom
                navLinks.style.gap = '1.5rem';
                mobileMenuBtn.textContent = '✕';
            }
        });

        // Close the mobile menu automatically if the user clicks a link (like "Services" or "Plans")
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    navLinks.style.display = 'none';
                    mobileMenuBtn.textContent = '☰';
                }
            });
        });
    }

});