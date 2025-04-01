import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, where, startAfter, limit, doc, updateDoc, increment, getDoc, onSnapshot, Timestamp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// Global variables
const groupContainer = document.getElementById('groupArchive');
const filterButtons = document.querySelectorAll('.filter-btn');
const categoryButtons = document.querySelectorAll('.category-btn');
const searchInput = document.getElementById('searchGroups');
const topicFilters = document.getElementById('topicFilters');
const countryFilters = document.getElementById('countryFilters');
const POSTS_PER_PAGE = 15;
let lastDoc = null;
let currentTopic = 'all';
let currentCountry = 'all';

// Fix createGroupCard function
function createGroupCard(group) {
    const card = document.createElement('div');
    card.className = 'group-card';
    
    // Ensure group properties exist to prevent undefined errors
    const title = group.title || 'Untitled Group';
    const description = group.description || 'No description available';
    const category = group.category || 'Uncategorized';
    const country = group.country || 'Unknown';
    const views = group.views || 0;
    
    card.innerHTML = `
        ${group.image ? `<img src="${group.image}" alt="${title}" onerror="this.src='https://via.placeholder.com/150'">` : ''}
        <div class="group-badges">
            <span class="category-badge">${category}</span>
            <span class="country-badge">${country}</span>
        </div>
        <h3>${title}</h3>
        <p>${description}</p>
        <div class="card-actions">
            <a href="${group.link}" target="_blank" rel="noopener noreferrer" class="join-btn">
                <i class="fab fa-whatsapp"></i> Join Group
            </a>
        </div>
        <div class="card-footer">
            <div class="views-count">
                <i class="fas fa-eye"></i>
                <span>${views}</span> views
            </div>
            <div class="date-added">
                ${group.timestamp ? timeAgo(group.timestamp.seconds) : 'Recently added'}
            </div>
        </div>
    `;
    
    return card;
}

// Fix loadGroups function
async function loadGroups(filterTopic = 'all', filterCountry = 'all', loadMore = false) {
    if (!groupContainer) {
        console.error('Group container not found');
        return;
    }

    try {
        if (!loadMore) {
            groupContainer.innerHTML = Array(6).fill(createLoadingState()).join('');
            lastDoc = null;
        }

        // Create basic query
        let groupsQuery = query(
            collection(db, "groups"),
            orderBy("timestamp", "desc"),
            limit(POSTS_PER_PAGE)
        );

        // Add startAfter if loading more
        if (lastDoc) {
            groupsQuery = query(
                collection(db, "groups"),
                orderBy("timestamp", "desc"),
                startAfter(lastDoc),
                limit(POSTS_PER_PAGE)
            );
        }

        // Get documents
        const querySnapshot = await getDocs(groupsQuery);
        
        if (querySnapshot.empty && !loadMore) {
            groupContainer.innerHTML = '<div class="no-groups">No groups found</div>';
            return;
        }

        // Update lastDoc for pagination
        lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

        // Get all groups
        let groups = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Apply filters
        if (filterTopic !== 'all') {
            groups = groups.filter(group => group.category === filterTopic);
        }
        if (filterCountry !== 'all') {
            groups = groups.filter(group => group.country === filterCountry);
        }
        
        // Handle search
        const searchTerm = searchInput?.value.toLowerCase();
        if (searchTerm) {
            groups = groups.filter(group => 
                (group.title?.toLowerCase().includes(searchTerm)) ||
                (group.description?.toLowerCase().includes(searchTerm))
            );
        }

        // Clear container if not loading more
        if (!loadMore) {
            groupContainer.innerHTML = '';
        }

        // Render groups
        groups.forEach(group => {
            const card = createGroupCard(group);
            groupContainer.appendChild(card);
        });

        // Add load more button if needed
        if (groups.length === POSTS_PER_PAGE) {
            addLoadMoreButton();
        }

    } catch (error) {
        console.error('Error loading groups:', error);
        groupContainer.innerHTML = `
            <div class="error-state">
                <p>Error loading groups. Please try again.</p>
                <button onclick="loadGroups()">Retry</button>
            </div>
        `;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, initializing groups...');
    loadGroups();
    
    // Add event listeners
    searchInput?.addEventListener('input', debounce(() => {
        loadGroups(currentTopic, currentCountry);
    }, 300));

    categoryButtons?.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentTopic = button.dataset.category;
            loadGroups(currentTopic, currentCountry);
        });
    });
});

// Utility Functions
function createLoadingState() {
    return `
        <div class="loading-skeleton">
            <div class="skeleton-image"></div>
            <div class="skeleton-content">
                <div class="skeleton-title"></div>
                <div class="skeleton-badges"></div>
                <div class="skeleton-description"></div>
                <div class="skeleton-button"></div>
            </div>
        </div>
    `;
}

function timeAgo(timestamp) {
    if (!timestamp) return 'N/A';

    const seconds = Math.floor((new Date() - new Date(timestamp * 1000)) / 1000);

    let interval = seconds / 31536000; // years
    if (interval > 1) return Math.floor(interval) + ' years ago';

    interval = seconds / 2592000; // months
    if (interval > 1) return Math.floor(interval) + ' months ago';

    interval = seconds / 604800; // weeks
    if (interval > 1) return Math.floor(interval) + ' weeks ago';

    interval = seconds / 86400; // days
    if (interval > 1) return Math.floor(interval) + ' days ago';

    interval = seconds / 3600; // hours
    if (interval > 1) return Math.floor(interval) + 'h ago';

    interval = seconds / 60; // minutes
    if (interval > 1) return Math.floor(interval) + 'm ago';

    return Math.floor(seconds) + 's ago';
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function addLoadMoreButton() {
    const loadMoreWrapper = document.createElement('div');
    loadMoreWrapper.className = 'load-more-wrapper';
    loadMoreWrapper.innerHTML = `
        <button class="load-more-btn">
            Load More
            <i class="fas fa-chevron-down"></i>
        </button>
    `;

    const loadMoreBtn = loadMoreWrapper.querySelector('.load-more-btn');

    loadMoreBtn.onclick = async () => {
        loadMoreBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Loading...`;
        loadMoreBtn.disabled = true;
        
        await loadGroups(currentTopic, currentCountry, true);

        loadMoreBtn.innerHTML = `Load More <i class="fas fa-chevron-down"></i>`;
        loadMoreBtn.disabled = false;
    };

    groupContainer.parentNode.appendChild(loadMoreWrapper);
}

