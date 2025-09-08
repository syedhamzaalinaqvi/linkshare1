/**
 * OPTIMIZED GROUP LOADER - Fixes caching and loading speed issues
 * Forces fresh data, implements lazy loading, and improves performance
 */

// Configuration
const CONFIG = {
    BATCH_SIZE: 12,
    INITIAL_LOAD: 6, // Load fewer initially for faster first paint
    CACHE_DURATION: 0, // No cache for fresh data
    LAZY_THRESHOLD: '200px'
};

// Global state management
let loadingState = {
    isLoading: false,
    hasMore: true,
    lastDoc: null,
    totalLoaded: 0,
    currentFilter: { topic: 'all', country: 'all' },
    allGroups: []
};

/**
 * MAIN OPTIMIZED LOADER - Forces fresh data every time
 */
async function loadGroupsOptimized(topic = 'all', country = 'all', append = false) {
    console.log('🚀 OPTIMIZED LOADER: Starting with fresh data priority...');
    
    const container = document.querySelector('.groups-grid');
    if (!container) {
        console.error('❌ Groups container not found');
        return;
    }

    // Prevent multiple simultaneous loads
    if (loadingState.isLoading && !append) return;
    loadingState.isLoading = true;

    try {
        // Update filter state
        loadingState.currentFilter = { topic, country };

        // Show loading for initial load only
        if (!append) {
            container.innerHTML = '<div class="optimized-loading">⚡ Loading fresh groups...</div>';
            loadingState.lastDoc = null;
            loadingState.totalLoaded = 0;
            loadingState.hasMore = true;
        }

        // Check Firebase connection
        if (!window.db || !window.firebaseInitialized) {
            throw new Error('Firebase not ready');
        }

        // Build query with FRESH DATA PRIORITY
        let query = window.db.collection('groups');
        
        // FORCE FRESH DATA - This fixes your caching issue!
        const freshDataOptions = {
            source: 'server' // CRITICAL: Always fetch from server, never cache
        };

        // Apply filters if needed
        if (topic !== 'all') {
            query = query.where('category', '==', topic);
        }
        if (country !== 'all') {
            query = query.where('country', '==', country);
        }

        // Order and paginate
        query = query.orderBy('timestamp', 'desc');
        
        if (loadingState.lastDoc && append) {
            query = query.startAfter(loadingState.lastDoc);
        }
        
        query = query.limit(append ? CONFIG.BATCH_SIZE : CONFIG.INITIAL_LOAD);

        console.log('📡 Fetching FRESH data from server...');
        const startTime = performance.now();
        
        // Execute query with server-only option
        const snapshot = await query.get(freshDataOptions);
        
        const loadTime = performance.now() - startTime;
        console.log(`⚡ Fresh data loaded in ${loadTime.toFixed(2)}ms`);

        if (snapshot.empty && !append) {
            container.innerHTML = '<div class="no-groups">No groups found. <a href="/add-group">Add the first one!</a></div>';
            loadingState.isLoading = false;
            return;
        }

        // Process groups
        const groups = [];
        snapshot.forEach(doc => {
            groups.push({
                id: doc.id,
                ...doc.data(),
                _loadedAt: new Date() // Track when loaded for debugging
            });
        });

        console.log(`📦 Processed ${groups.length} fresh groups`);

        // Update pagination state
        if (groups.length > 0) {
            loadingState.lastDoc = snapshot.docs[snapshot.docs.length - 1];
            loadingState.hasMore = groups.length >= (append ? CONFIG.BATCH_SIZE : CONFIG.INITIAL_LOAD);
        } else {
            loadingState.hasMore = false;
        }

        // Clear container for initial load
        if (!append) {
            container.innerHTML = '';
        }

        // Render groups with lazy loading
        renderGroupsWithLazyLoading(groups, container, append);
        
        loadingState.totalLoaded += groups.length;
        console.log(`✅ Total groups loaded: ${loadingState.totalLoaded}`);

        // Setup load more if needed
        setupLoadMore(container);

    } catch (error) {
        console.error('❌ Optimized loader error:', error);
        if (!append) {
            container.innerHTML = `
                <div class="error-state">
                    <h3>⚠️ Loading Error</h3>
                    <p>Failed to load fresh groups: ${error.message}</p>
                    <button onclick="loadGroupsOptimized()" class="retry-btn">
                        🔄 Try Again
                    </button>
                </div>
            `;
        }
    } finally {
        loadingState.isLoading = false;
        
        // Remove any loading indicators
        const loadingElements = container.querySelectorAll('.optimized-loading, .loading-more');
        loadingElements.forEach(el => el.remove());
    }
}

/**
 * LAZY LOADING RENDERER - Professional lazy loading implementation
 */
function renderGroupsWithLazyLoading(groups, container, append = false) {
    console.log('🎯 Rendering with professional lazy loading...');

    const fragment = document.createDocumentFragment();
    
    groups.forEach((group, index) => {
        const card = createOptimizedGroupCard(group, index);
        fragment.appendChild(card);
    });

    container.appendChild(fragment);

    // Setup lazy loading observers
    setupLazyLoadingObservers();
}

/**
 * CREATE OPTIMIZED GROUP CARD - Fast rendering
 */
function createOptimizedGroupCard(group, index) {
    const card = document.createElement('div');
    card.className = 'group-card lazy-card';
    card.setAttribute('data-group-id', group.id);
    card.setAttribute('data-category', (group.category || 'general').toLowerCase());
    card.setAttribute('data-country', (group.country || 'global').toLowerCase());
    
    // Add stagger animation delay
    card.style.setProperty('--stagger-delay', `${index * 50}ms`);

    // Fast image handling
    let imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png';
    if (group.image && !group.image.includes('whatsapp.net') && !group.image.includes('fbcdn.net')) {
        imageUrl = group.image;
    }

    // Time formatting
    let timeDisplay = 'Recently added';
    try {
        if (group.timestamp) {
            const date = group.timestamp.toDate ? group.timestamp.toDate() : new Date(group.timestamp);
            timeDisplay = formatTimeAgo(date);
        }
    } catch (e) {
        // Keep default
    }

    card.innerHTML = `
        <div class="card-image">
            <img class="lazy-image" data-src="${imageUrl}" alt="${group.title || 'Group'}" loading="lazy">
            <div class="image-placeholder">
                <i class="fab fa-whatsapp"></i>
            </div>
        </div>
        <div class="group-badges">
            <span class="category-badge">${group.category || 'General'}</span>
            <span class="country-badge">${group.country || 'Global'}</span>
        </div>
        <h3 class="card-title">${group.title || 'WhatsApp Group'}</h3>
        <p class="card-description">${group.description || 'Join this WhatsApp group for discussions'}</p>
        <div class="card-actions">
            <a href="${group.link || group.group_url}" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="join-btn"
               onclick="updateGroupViews('${group.id}')">
                <i class="fab fa-whatsapp"></i>
                <span>Join Group</span>
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

/**
 * LAZY LOADING OBSERVERS - Professional implementation
 */
function setupLazyLoadingObservers() {
    // Image lazy loading
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const placeholder = img.parentElement.querySelector('.image-placeholder');
                
                img.src = img.dataset.src;
                img.onload = () => {
                    img.classList.add('loaded');
                    placeholder.style.display = 'none';
                };
                img.onerror = () => {
                    img.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png';
                    img.classList.add('loaded');
                    placeholder.style.display = 'none';
                };
                
                imageObserver.unobserve(img);
            }
        });
    }, {
        rootMargin: CONFIG.LAZY_THRESHOLD,
        threshold: 0.1
    });

    // Card animation observer
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                cardObserver.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '50px',
        threshold: 0.1
    });

    // Apply observers
    document.querySelectorAll('.lazy-image:not([src])').forEach(img => {
        imageObserver.observe(img);
    });

    document.querySelectorAll('.lazy-card:not(.visible)').forEach(card => {
        cardObserver.observe(card);
    });
}

/**
 * LOAD MORE FUNCTIONALITY
 */
function setupLoadMore(container) {
    // Remove existing load more button
    const existingBtn = container.parentElement?.querySelector('.load-more-btn');
    if (existingBtn) existingBtn.remove();

    // Add new load more button if there are more groups
    if (loadingState.hasMore && loadingState.totalLoaded >= CONFIG.INITIAL_LOAD) {
        const loadMoreContainer = document.createElement('div');
        loadMoreContainer.className = 'load-more-container';
        loadMoreContainer.innerHTML = `
            <button class="load-more-btn optimized" onclick="loadMoreGroups()">
                <span class="btn-text">
                    <i class="fas fa-plus"></i>
                    Load More Groups
                </span>
                <span class="btn-loading" style="display: none;">
                    <i class="fas fa-spinner fa-spin"></i>
                    Loading...
                </span>
            </button>
        `;
        
        container.parentElement.appendChild(loadMoreContainer);
    }
}

/**
 * LOAD MORE HANDLER
 */
async function loadMoreGroups() {
    const btn = document.querySelector('.load-more-btn');
    if (!btn || loadingState.isLoading) return;

    // Update button state
    const btnText = btn.querySelector('.btn-text');
    const btnLoading = btn.querySelector('.btn-loading');
    btnText.style.display = 'none';
    btnLoading.style.display = 'block';
    btn.disabled = true;

    try {
        await loadGroupsOptimized(
            loadingState.currentFilter.topic,
            loadingState.currentFilter.country,
            true
        );
    } finally {
        // Reset button state
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
        btn.disabled = false;
    }
}

/**
 * UTILITY FUNCTIONS
 */
function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' minutes ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
    if (seconds < 2592000) return Math.floor(seconds / 86400) + ' days ago';
    if (seconds < 31536000) return Math.floor(seconds / 2592000) + ' months ago';
    return Math.floor(seconds / 31536000) + ' years ago';
}

/**
 * CLEAR CACHE FUNCTION - Use this to force refresh
 */
function clearGroupsCache() {
    console.log('🗑️ Clearing all groups cache...');
    loadingState = {
        isLoading: false,
        hasMore: true,
        lastDoc: null,
        totalLoaded: 0,
        currentFilter: { topic: 'all', country: 'all' },
        allGroups: []
    };
    
    // Force fresh data load
    loadGroupsOptimized();
}

// Make functions globally available
window.loadGroupsOptimized = loadGroupsOptimized;
window.loadMoreGroups = loadMoreGroups;
window.clearGroupsCache = clearGroupsCache;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('⚡ Optimized Group Loader initialized');
    
    // Auto-clear cache on page load for fresh data
    if (performance.navigation.type === 1) {
        console.log('🔄 Page refresh detected - clearing cache for fresh data');
        setTimeout(clearGroupsCache, 100);
    }
});

// Add visibility change handler to refresh data when user comes back
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && loadingState.totalLoaded === 0) {
        console.log('👁️ Page became visible - loading fresh data');
        loadGroupsOptimized();
    }
});

console.log('🚀 OPTIMIZED GROUP LOADER: Ready for fresh data loading!');
