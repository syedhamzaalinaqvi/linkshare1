/**
 * Fast Group Loader - Unified loading system for optimal performance
 * Handles both database and Firebase groups with aggressive caching prevention
 */

// Global cache buster
const CACHE_BUSTER = Date.now();

// Fast group loading with cache prevention
async function loadGroupsFast() {
    console.log('🚀 Fast loader starting...');
    
    let groupsGrid = document.getElementById('groupsGrid');
    if (!groupsGrid) {
        groupsGrid = document.querySelector('.groups-grid');
    }
    if (!groupsGrid) {
        console.error('❌ Groups grid not found - creating one');
        // Create the grid if it doesn't exist
        const container = document.querySelector('.container') || document.querySelector('main') || document.body;
        groupsGrid = document.createElement('div');
        groupsGrid.id = 'groupsGrid';
        groupsGrid.className = 'groups-grid';
        container.appendChild(groupsGrid);
    }
    
    // Clear any existing content immediately
    groupsGrid.innerHTML = '<div class="loading-spinner">⏳ Loading groups...</div>';
    
    try {
        // Try database first with aggressive cache prevention
        const dbResponse = await fetch(`/api/groups?cb=${CACHE_BUSTER}&t=${Date.now()}`, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        
        const dbResult = await dbResponse.json();
        
        if (dbResult.success && dbResult.groups && dbResult.groups.length > 0) {
            console.log(`✅ Loaded ${dbResult.groups.length} groups from database`);
            renderGroupsInstantly(dbResult.groups, groupsGrid);
            return;
        }
        
        console.log('📡 Database empty, showing empty state...');
        
        // Show empty state instead of trying Firebase
        showEmptyState(groupsGrid);
        
    } catch (error) {
        console.error('❌ Fast loader error:', error);
        // Show error state instead of trying Firebase
        showErrorState(groupsGrid);
    }
}

// Render groups instantly without any delays
function renderGroupsInstantly(groups, container) {
    console.log(`🎯 Starting to render ${groups.length} groups to container:`, container);
    
    // Clear loading state
    container.innerHTML = '';
    
    // Add visible debug info
    container.style.minHeight = '400px';
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
    container.style.gap = '1.5rem';
    container.style.visibility = 'visible';
    container.style.opacity = '1';
    container.style.width = '100%';
    container.style.padding = '1rem 0';
    
    groups.forEach((group, index) => {
        console.log(`🔧 Creating card ${index + 1} for group:`, group.title);
        const card = createOptimizedGroupCard(group);
        container.appendChild(card);
        
        // Debug each card
        console.log(`✅ Added card ${index + 1} to container`);
        
        // Animate in batches for better performance
        if (index % 4 === 0) {
            requestAnimationFrame(() => {
                // Allow other operations to continue
            });
        }
    });
    
    // Final verification
    console.log(`🎯 Rendered ${groups.length} groups instantly. Container children:`, container.children.length);
    console.log('📦 Container element:', container);
    console.log('🎨 Container styles:', window.getComputedStyle(container));
}

// Create optimized group card for fast rendering
function createOptimizedGroupCard(group) {
    console.log('🏗️ Creating card for:', group.title);
    const card = document.createElement('div');
    card.className = 'group-card fast-loaded';
    card.style.display = 'block';
    card.style.visibility = 'visible';
    card.style.opacity = '1';
    card.setAttribute('data-category', (group.category || 'general').toLowerCase());
    card.setAttribute('data-country', (group.country || 'global').toLowerCase());
    
    // Use fastest image loading strategy
    let imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png';
    
    if (group.image_url && group.image_url !== 'null' && group.image_url !== '') {
        // Only use external images if they're from trusted sources
        if (group.image_url.includes('wikipedia.org') || 
            group.image_url.includes('wikimedia.org') ||
            group.image_url.includes('upload.wikimedia.org')) {
            imageUrl = group.image_url;
        }
    }
    
    // Format timestamp quickly
    let timeDisplay = 'Recently added';
    if (group.created_at || group.timestamp) {
        const date = new Date(group.created_at || group.timestamp);
        if (!isNaN(date.getTime())) {
            timeDisplay = timeAgo(date);
        }
    }
    
    card.innerHTML = `
        <div class="card-image">
            <img src="${imageUrl}" alt="${group.title || 'Group'}" loading="lazy">
        </div>
        <div class="group-badges">
            <span class="category-badge">${group.category || 'General'}</span>
            <span class="country-badge">${group.country || 'Global'}</span>
        </div>
        <h3>${group.title || 'WhatsApp Group'}</h3>
        <p>${group.description || 'Join this WhatsApp group for discussions'}</p>
        <div class="card-actions">
            <a href="${group.group_url || group.link}" target="_blank" rel="noopener noreferrer" class="join-btn">
                <i class="fab fa-whatsapp"></i> Join Group
            </a>
        </div>
        <div class="card-footer">
            <div class="views-count">
                <i class="fas fa-eye"></i>
                <span>${group.views || 0}</span> views
            </div>
            <div class="date-added">${timeDisplay}</div>
        </div>
    `;
    
    return card;
}

// Load Firebase groups as fallback
async function loadFirebaseGroups(container) {
    try {
        console.log('🔥 Loading Firebase groups...');
        
        if (window.originalLoadGroups && typeof window.originalLoadGroups === 'function') {
            // Call original Firebase loader
            window.originalLoadGroups('all', 'all', false);
        } else {
            // Manual Firebase loading
            const db = firebase.firestore();
            const snapshot = await db.collection('groups')
                .where('isActive', '==', true)
                .orderBy('timestamp', 'desc')
                .limit(20)
                .get();
            
            const firebaseGroups = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            if (firebaseGroups.length > 0) {
                renderGroupsInstantly(firebaseGroups, container);
            } else {
                showFallbackGroups(container);
            }
        }
    } catch (error) {
        console.error('Firebase loading failed:', error);
        showFallbackGroups(container);
    }
}

// Show empty state when no groups in database
function showEmptyState(container) {
    container.innerHTML = `
        <div class="no-groups-message">
            <div class="no-groups-icon">📱</div>
            <h3>No Groups Available</h3>
            <p>No WhatsApp groups have been added yet. Be the first to add a group!</p>
            <a href="/add-group" class="refresh-btn">
                <i class="fas fa-plus"></i> Add First Group
            </a>
        </div>
    `;
    console.log('📝 Showing empty state');
}

// Show error state when loading fails
function showErrorState(container) {
    container.innerHTML = `
        <div class="no-groups-message">
            <div class="no-groups-icon">⚠️</div>
            <h3>Loading Error</h3>
            <p>There was a problem loading groups. Please try refreshing the page.</p>
            <button onclick="window.location.reload()" class="refresh-btn">
                <i class="fas fa-refresh"></i> Refresh Page
            </button>
        </div>
    `;
    console.log('📝 Showing error state');
}

// Initialize fast loading on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadGroupsFast);
} else {
    // DOM is already loaded
    loadGroupsFast();
}

// Helper function for time formatting
function timeAgo(date) {
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return interval + " years ago";
    if (interval === 1) return "1 year ago";
    
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return interval + " months ago";
    if (interval === 1) return "1 month ago";
    
    interval = Math.floor(seconds / 86400);
    if (interval > 1) return interval + " days ago";
    if (interval === 1) return "1 day ago";
    
    interval = Math.floor(seconds / 3600);
    if (interval > 1) return interval + " hours ago";
    if (interval === 1) return "1 hour ago";
    
    interval = Math.floor(seconds / 60);
    if (interval > 1) return interval + " minutes ago";
    if (interval === 1) return "1 minute ago";
    
    return "Just now";
}

// Add to window for external access
window.loadGroupsFast = loadGroupsFast;
window.timeAgo = timeAgo;

console.log('⚡ Fast Group Loader initialized');