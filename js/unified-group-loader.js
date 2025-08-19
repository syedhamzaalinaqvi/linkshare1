/**
 * Unified Group Loader - Single source of truth for all group loading
 * Handles Firebase integration with proper ordering and caching prevention
 */

// Global variables for unified group management
window.unifiedGroupLoader = {
    isLoading: false,
    currentGroups: [],
    lastDoc: null,
    currentTopic: 'all',
    currentCountry: 'all',
    isLastPage: false,
    POSTS_PER_PAGE: 15
};

// Single function to load groups with proper ordering
async function loadGroupsUnified(topic = 'all', country = 'all', loadMore = false) {
    const loader = window.unifiedGroupLoader;
    
    // Prevent multiple simultaneous loads
    if (loader.isLoading) {
        console.log('🔄 Load already in progress, skipping...');
        return;
    }
    
    loader.isLoading = true;
    console.log(`🚀 Loading groups: topic=${topic}, country=${country}, loadMore=${loadMore}`);
    
    // Update current filters
    loader.currentTopic = topic;
    loader.currentCountry = country;
    
    // Get container
    const groupContainer = document.getElementById('groupsGrid') || document.querySelector('.groups-grid');
    if (!groupContainer) {
        console.error('❌ Groups container not found');
        loader.isLoading = false;
        return;
    }
    
    // Clear container if not loading more
    if (!loadMore) {
        groupContainer.innerHTML = '<div class="loading-spinner">⏳ Loading latest groups...</div>';
        loader.lastDoc = null;
        loader.currentGroups = [];
    }
    
    try {
        // Wait for Firebase to be ready
        if (!window.firebaseInitialized || !window.db) {
            console.log('⏳ Waiting for Firebase...');
            let attempts = 0;
            while ((!window.firebaseInitialized || !window.db) && attempts < 50) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            if (!window.firebaseInitialized || !window.db) {
                throw new Error('Firebase initialization timeout');
            }
        }
        
        // Build query with aggressive cache prevention
        let baseQuery = window.db.collection('groups');
        
        // Apply filters if needed
        if (topic !== 'all') {
            baseQuery = baseQuery.where('category', '==', topic);
        }
        if (country !== 'all') {
            baseQuery = baseQuery.where('country', '==', country);
        }
        
        // Always order by timestamp descending for newest first
        baseQuery = baseQuery.orderBy('timestamp', 'desc');
        
        // Add pagination
        if (loadMore && loader.lastDoc) {
            baseQuery = baseQuery.startAfter(loader.lastDoc);
        }
        baseQuery = baseQuery.limit(loader.POSTS_PER_PAGE);
        
        // Execute query with fallback to cache if server fails
        let querySnapshot;
        try {
            querySnapshot = await baseQuery.get({ source: 'server' });
        } catch (serverError) {
            console.log('⚠️ Server unavailable, trying cache...');
            querySnapshot = await baseQuery.get({ source: 'cache' });
        }
        
        // Process results
        const groups = [];
        querySnapshot.forEach((doc) => {
            groups.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        console.log(`📦 Loaded ${groups.length} fresh groups from server`);
        
        // Apply search filter if active
        const searchInput = document.getElementById('searchInput') || document.getElementById('searchGroups');
        const searchTerm = searchInput?.value?.toLowerCase();
        const filteredGroups = searchTerm ? 
            groups.filter(group => 
                (group.title || '').toLowerCase().includes(searchTerm) ||
                (group.description || '').toLowerCase().includes(searchTerm)
            ) : groups;
        
        // Update state
        if (loadMore) {
            loader.currentGroups = [...loader.currentGroups, ...filteredGroups];
        } else {
            loader.currentGroups = filteredGroups;
        }
        
        // Store last document for pagination
        if (querySnapshot.docs.length > 0) {
            loader.lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        }
        
        // Check if last page
        loader.isLastPage = querySnapshot.docs.length < loader.POSTS_PER_PAGE;
        
        // Render groups
        renderGroupsClean(loadMore ? filteredGroups : loader.currentGroups, groupContainer, !loadMore);
        
        // Update load more button
        updateLoadMoreButton(filteredGroups.length);
        
        console.log(`✅ Successfully rendered ${filteredGroups.length} groups (newest first)`);
        
    } catch (error) {
        console.error('❌ Error loading groups:', error);
        
        // Show fallback test groups for immediate display
        console.log('🔄 Loading fallback test groups...');
        const fallbackGroups = [
            {
                id: 'test1',
                title: 'Tech Jobs & Career Opportunities',
                description: 'Join our community for latest job postings, career advice, and networking opportunities in the tech industry.',
                category: 'Jobs',
                country: 'USA',
                link: 'https://chat.whatsapp.com/sample1',
                views: 1250,
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
            },
            {
                id: 'test2', 
                title: 'Crypto Trading & Investment',
                description: 'Discuss cryptocurrency trading strategies, market analysis, and investment opportunities.',
                category: 'Business',
                country: 'Global',
                link: 'https://chat.whatsapp.com/sample2',
                views: 890,
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
            },
            {
                id: 'test3',
                title: 'Dating & Relationships',
                description: 'Connect with like-minded people, share experiences, and find meaningful relationships.',
                category: 'Dating',
                country: 'India',
                link: 'https://chat.whatsapp.com/sample3',
                views: 2100,
                timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
            }
        ];
        
        renderGroupsClean(fallbackGroups, groupContainer, true);
        updateLoadMoreButton(fallbackGroups.length);
        
        // Show subtle error message
        setTimeout(() => {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'connection-notice';
            errorDiv.innerHTML = `
                <div style="background: rgba(255, 193, 7, 0.1); border: 1px solid rgba(255, 193, 7, 0.3); 
                           border-radius: 8px; padding: 12px; margin: 20px 0; text-align: center;">
                    <i class="fas fa-info-circle" style="color: #ffc107; margin-right: 8px;"></i>
                    <span style="color: #856404;">Showing sample groups. Reconnecting to server...</span>
                    <button onclick="loadGroupsUnified('${topic}', '${country}', false)" 
                            style="margin-left: 10px; padding: 4px 12px; background: #ffc107; color: #000; 
                                   border: none; border-radius: 4px; cursor: pointer;">
                        Retry
                    </button>
                </div>
            `;
            groupContainer.appendChild(errorDiv);
        }, 1000);
    } finally {
        loader.isLoading = false;
    }
}

// Clean group rendering function
function renderGroupsClean(groups, container, clearFirst = true) {
    if (clearFirst) {
        container.innerHTML = '';
    }
    
    if (groups.length === 0) {
        container.innerHTML = '<div class="no-groups">No groups found matching your criteria</div>';
        return;
    }
    
    // Create document fragment for better performance
    const fragment = document.createDocumentFragment();
    
    groups.forEach(group => {
        const card = createGroupCardClean(group);
        fragment.appendChild(card);
    });
    
    container.appendChild(fragment);
    
    // Setup lazy loading after rendering
    setupLazyLoadingClean();
}

// Clean group card creation
function createGroupCardClean(group) {
    const card = document.createElement('div');
    card.className = 'group-card';
    card.setAttribute('data-group-id', group.id);
    
    // Format timestamp
    let timeDisplay = 'Recently added';
    try {
        if (group.timestamp) {
            if (typeof group.timestamp === 'object' && group.timestamp.toDate) {
                timeDisplay = timeAgo(group.timestamp.toDate());
            } else if (group.timestamp instanceof Date) {
                timeDisplay = timeAgo(group.timestamp);
            } else if (typeof group.timestamp === 'number') {
                timeDisplay = timeAgo(new Date(group.timestamp));
            }
        }
    } catch (error) {
        console.error('Error formatting timestamp:', error);
    }
    
    // Handle image with fallback
    let imageUrl = '/favicon-96x96.png';
    if (group.image) {
        const problematicDomains = ['whatsapp.net', 'fbcdn.net', 'facebook.com', 'cdninstagram.com', 'fbsbx.com'];
        const hasProblematicDomain = problematicDomains.some(domain => group.image.includes(domain));
        
        if (hasProblematicDomain || group.image.includes('chat.whatsapp.com')) {
            imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png';
        } else if (group.image.includes('wikipedia.org') || group.image.includes('wikimedia.org')) {
            imageUrl = group.image;
        } else {
            imageUrl = group.image;
        }
    }
    
    card.innerHTML = `
        <div class="group-image">
            <img 
                class="lazy-image" 
                data-src="${imageUrl}" 
                src="/favicon-96x96.png" 
                alt="${group.title || 'WhatsApp Group'}"
                loading="lazy"
                onerror="this.src='/favicon-96x96.png'; this.onerror=null;"
            >
            <div class="group-badges">
                ${group.category ? `<span class="badge category-badge">${group.category}</span>` : ''}
                ${group.country ? `<span class="badge country-badge">${group.country}</span>` : ''}
            </div>
        </div>
        <div class="group-content">
            <h3 class="group-title">${group.title || 'WhatsApp Group'}</h3>
            <p class="group-description">${group.description || 'Join this group to connect with others!'}</p>
            <a href="${group.link || '#'}" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="join-btn"
               onclick="window.open(this.href, '_blank'); return false;">
                <i class="fab fa-whatsapp"></i> Join Group
            </a>
        </div>
        <div class="group-footer">
            <div class="group-stats">
                <span class="views">
                    <i class="fas fa-eye"></i> ${group.views || 0}
                </span>
                <span class="time">${timeDisplay}</span>
            </div>
        </div>
    `;
    
    return card;
}

// Clean lazy loading setup
function setupLazyLoadingClean() {
    const lazyImages = document.querySelectorAll('.lazy-image');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy-image');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach((img) => imageObserver.observe(img));
    } else {
        lazyImages.forEach((img) => {
            img.src = img.dataset.src;
            img.classList.remove('lazy-image');
        });
    }
}

// Update load more button visibility
function updateLoadMoreButton(groupsLoaded) {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (!loadMoreBtn) return;
    
    const loader = window.unifiedGroupLoader;
    
    if (loader.isLastPage || groupsLoaded === 0) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'block';
        loadMoreBtn.innerHTML = '<i class="fas fa-sync"></i> Load More';
        loadMoreBtn.disabled = false;
    }
}

// Time ago helper function
function timeAgo(date) {
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
}

// Export for global use
window.loadGroupsUnified = loadGroupsUnified;