/**
 * Database Groups Loader
 * Loads WhatsApp groups from PostgreSQL database and displays them
 */

// Global variable to store database groups
window.databaseGroups = [];

// Load groups from database
async function loadDatabaseGroups() {
    try {
        console.log('[DB] Loading groups from database...');
        
        const response = await fetch('/api/groups');
        const result = await response.json();
        
        if (result.success && result.groups) {
            window.databaseGroups = result.groups;
            console.log(`[DB] Loaded ${result.groups.length} groups from database`);
            
            // If we're on the homepage, render the groups
            if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
                renderDatabaseGroups(result.groups);
            }
            
            return result.groups;
        } else {
            console.warn('[DB] No groups found in database');
            return [];
        }
        
    } catch (error) {
        console.error('[DB] Error loading groups:', error);
        return [];
    }
}

// Render database groups on homepage
function renderDatabaseGroups(groups) {
    // Try multiple selectors to find the groups container
    let groupsGrid = document.getElementById('groupsGrid');
    if (!groupsGrid) {
        groupsGrid = document.querySelector('.groups-grid');
    }
    if (!groupsGrid) {
        groupsGrid = document.querySelector('.groups-container');
    }
    if (!groupsGrid) {
        groupsGrid = document.querySelector('[data-groups]');
    }
    
    if (!groupsGrid) {
        console.warn('[DB] Groups grid element not found, creating one');
        // Create the groups grid if it doesn't exist
        const container = document.querySelector('.container, main, .main-content');
        if (container) {
            groupsGrid = document.createElement('div');
            groupsGrid.id = 'groupsGrid';
            groupsGrid.className = 'groups-grid';
            container.appendChild(groupsGrid);
        } else {
            console.error('[DB] Cannot find container to create groups grid');
            return;
        }
    }
    
    console.log(`[DB] Rendering ${groups.length} database groups`);
    
    // Clear existing content
    groupsGrid.innerHTML = '';
    
    if (groups.length === 0) {
        groupsGrid.innerHTML = `
            <div class="no-groups">
                <i class="fas fa-search"></i>
                <h3>No Groups Found</h3>
                <p>Be the first to add a WhatsApp group!</p>
                <a href="/add-group/" class="btn-primary">Add Group</a>
            </div>
        `;
        return;
    }
    
    // Render each group
    groups.forEach(group => {
        const groupCard = createGroupCard(group);
        groupsGrid.appendChild(groupCard);
    });
    
    // Apply lazy loading for images
    setupLazyLoadingForNewCards();
}

// Create individual group card
function createGroupCard(group) {
    const card = document.createElement('div');
    card.className = 'group-card database-group';
    card.setAttribute('data-category', group.category.toLowerCase());
    card.setAttribute('data-country', group.country.toLowerCase());
    
    // Ensure image URL is valid
    let imageUrl = group.image_url;
    if (!imageUrl || imageUrl === 'null' || imageUrl === '') {
        imageUrl = 'https://static.whatsapp.net/rsrc.php/v4/yo/r/J5gK5AgJ_L5.png';
    }
    
    card.innerHTML = `
        <div class="card-image">
            <img src="${imageUrl}" 
                 alt="${group.title}" 
                 loading="lazy"
                 onerror="this.src='https://static.whatsapp.net/rsrc.php/v4/yo/r/J5gK5AgJ_L5.png'">
            <div class="card-overlay">
                <span class="category-badge">${group.category}</span>
                <span class="country-badge">${group.country}</span>
            </div>
        </div>
        <div class="card-content">
            <h3 class="card-title">${group.title}</h3>
            <p class="card-description">${group.description}</p>
            <div class="card-meta">
                <span class="member-count">
                    <i class="fas fa-users"></i>
                    ${group.member_count || 'N/A'} members
                </span>
                <span class="added-date">
                    <i class="fas fa-clock"></i>
                    ${formatDate(group.created_at)}
                </span>
            </div>
            <div class="card-actions">
                <a href="${group.group_url}" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="join-btn">
                    <i class="fab fa-whatsapp"></i>
                    Join Group
                </a>
                <button class="share-btn" onclick="shareGroup('${group.title}', '${group.group_url}')">
                    <i class="fas fa-share-alt"></i>
                    Share
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return 'Recently';
    
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`;
        } else if (diffInHours < 24 * 7) {
            return `${Math.floor(diffInHours / 24)}d ago`;
        } else {
            return date.toLocaleDateString();
        }
    } catch (error) {
        return 'Recently';
    }
}

// Share group function
function shareGroup(title, url) {
    if (navigator.share) {
        navigator.share({
            title: title,
            text: `Check out this WhatsApp group: ${title}`,
            url: url
        }).catch(console.error);
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(url).then(() => {
            showNotification('Group link copied to clipboard!', 'success');
        }).catch(() => {
            // Fallback: show URL in prompt
            prompt('Copy this group link:', url);
        });
    }
}

// Setup lazy loading for newly added cards
function setupLazyLoadingForNewCards() {
    const lazyImages = document.querySelectorAll('.database-group img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    }
}

// Filter database groups
function filterDatabaseGroups(filterTopic = 'all', filterCountry = 'all') {
    console.log(`[DB] Filtering groups by topic: ${filterTopic}, country: ${filterCountry}`);
    
    let filteredGroups = window.databaseGroups;
    
    if (filterTopic !== 'all') {
        filteredGroups = filteredGroups.filter(group => 
            group.category.toLowerCase() === filterTopic.toLowerCase()
        );
    }
    
    if (filterCountry !== 'all') {
        filteredGroups = filteredGroups.filter(group => 
            group.country.toLowerCase() === filterCountry.toLowerCase()
        );
    }
    
    console.log(`[DB] Filtered to ${filteredGroups.length} groups`);
    renderDatabaseGroups(filteredGroups);
}

// Simple notification function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed; 
        top: 20px; 
        right: 20px; 
        background: ${type === 'success' ? '#4CAF50' : '#2196F3'}; 
        color: white; 
        padding: 12px 20px; 
        border-radius: 8px; 
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Initialize database groups loading
document.addEventListener('DOMContentLoaded', function() {
    console.log('[DB] DOM loaded - initializing database groups loader');
    
    // Load database groups immediately on page load
    setTimeout(() => {
        console.log('[DB] Loading initial database groups...');
        loadDatabaseGroups();
    }, 200);
    
    // Store original loadGroups function from main.js
    setTimeout(() => {
        if (window.loadGroups && typeof window.loadGroups === 'function') {
            window.originalLoadGroups = window.loadGroups;
            console.log('[DB] Stored original loadGroups function');
        }
        
        // Override loadGroups function to handle database + Firebase
        window.loadGroups = function(topic, country, loadMore = false) {
            console.log(`[DB] Override loadGroups called with topic: ${topic}, country: ${country}, loadMore: ${loadMore}`);
            
            if (!loadMore) {
                // For initial load or filter changes, show database groups
                console.log('[DB] Loading database groups for filter change');
                filterDatabaseGroups(topic || 'all', country || 'all');
            } else {
                // For load more, fall back to Firebase
                console.log('[DB] Load More requested - trying Firebase groups');
                if (window.originalLoadGroups) {
                    window.originalLoadGroups(topic, country, true);
                } else {
                    console.warn('[DB] Original loadGroups function not available');
                }
            }
        };
    }, 500);
});

console.log('💾 Database Groups Loader initialized');