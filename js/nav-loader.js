// Navbar Loading and Initialization
document.addEventListener('DOMContentLoaded', async function() {
    await loadNavbar();
});

async function loadNavbar() {
    try {
        // Fetch the navbar content with cache
        const response = await fetch('/nav.html', {
            cache: 'force-cache',
            headers: {
                'Cache-Control': 'max-age=3600'
            }
        });
        
        if (!response.ok) throw new Error('Failed to load navbar');
        
        const navContent = await response.text();
        
        // Create a temporary container
        const temp = document.createElement('div');
        temp.innerHTML = navContent;
        
        // Get the nav element from the loaded content
        const navElement = temp.querySelector('nav');
        
        // Insert the navbar at the start of the body
        document.body.insertAdjacentElement('afterbegin', navElement);
        
        // Set current page as active
        setActiveNavLink();
        
        // Initialize mobile menu
        initMobileMenu();
        
    } catch (error) {
        console.error('Error loading navbar:', error);
    }
}

function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function initMobileMenu() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    let isMenuOpen = false;

    if (!navToggle || !navLinks) return;

    // Handle mobile menu toggle
    navToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        isMenuOpen = !isMenuOpen;
        navLinks.style.display = isMenuOpen ? 'flex' : 'none';
        navLinks.classList.toggle('active');
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    });

    // Handle dropdowns
    dropdowns.forEach(dropdown => {
        const dropBtn = dropdown.querySelector('.dropbtn');
        if (dropBtn) {
            dropBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Close other dropdowns
                dropdowns.forEach(d => {
                    if (d !== dropdown) d.classList.remove('active');
                });
                
                dropdown.classList.toggle('active');
            });
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) {
            isMenuOpen = false;
            navLinks.classList.remove('active');
            if (window.innerWidth < 992) {
                navLinks.style.display = 'none';
            }
        }
        
        // Close dropdowns when clicking outside
        if (!e.target.closest('.nav-dropdown')) {
            dropdowns.forEach(dropdown => dropdown.classList.remove('active'));
        }
    });

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth >= 992) {
                navLinks.style.display = 'flex';
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
                isMenuOpen = false;
            } else if (!isMenuOpen) {
                navLinks.style.display = 'none';
            }
        }, 100);
    });
    
    // Initial state based on screen size
    if (window.innerWidth >= 992) {
        navLinks.style.display = 'flex';
    } else {
        navLinks.style.display = 'none';
    }
}
