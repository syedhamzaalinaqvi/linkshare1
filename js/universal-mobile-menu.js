/**
 * Universal Mobile Menu Fix
 * Works consistently across all pages without requiring specific IDs
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 Initializing universal mobile menu...');
    
    // Find mobile navigation elements
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (!navToggle || !navLinks) {
        console.log('⚠️ Mobile menu elements not found');
        return;
    }
    
    console.log('✅ Found mobile menu elements, setting up...');
    
    // Enhanced mobile menu toggle
    navToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('📱 Mobile menu clicked');
        
        const isActive = navLinks.classList.contains('active');
        
        if (isActive) {
            navLinks.classList.remove('active');
            navToggle.innerHTML = '<i class="fas fa-bars"></i>';
            console.log('📱 Menu closed');
        } else {
            navLinks.classList.add('active');
            navToggle.innerHTML = '<i class="fas fa-times"></i>';
            console.log('📱 Menu opened');
        }
        
        // Visual feedback
        navToggle.style.transform = 'scale(1.1)';
        setTimeout(() => {
            navToggle.style.transform = 'scale(1)';
        }, 150);
    });
    
    // Touch support for mobile devices
    navToggle.addEventListener('touchstart', function(e) {
        e.stopPropagation();
    }, { passive: true });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.navbar') && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            navToggle.innerHTML = '<i class="fas fa-bars"></i>';
            console.log('📱 Menu closed by outside click');
        }
    });
    
    // Close menu when clicking nav links (mobile only)
    const navLinkItems = navLinks.querySelectorAll('a');
    navLinkItems.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 868) {
                navLinks.classList.remove('active');
                navToggle.innerHTML = '<i class="fas fa-bars"></i>';
                console.log('📱 Menu closed after link click');
            }
        });
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 868 && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            navToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
    
    console.log('✅ Universal mobile menu setup complete');
});

console.log('📱 Universal Mobile Menu loaded');