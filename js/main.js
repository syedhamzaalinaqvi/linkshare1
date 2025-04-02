import { db } from './firebase-config.js';
import { collection, getDocs, query, orderBy, where, startAfter, limit, doc, updateDoc, increment, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// Global variables
const POSTS_PER_PAGE = 12;
let lastDoc = null;
const groupContainer = document.querySelector('.groups-grid');
const searchInput = document.querySelector('#searchGroups');
let currentTopic = 'all';
let currentCountry = 'all';
let form = document.querySelector('#addGroupForm');

// Debug function to check document fields
async function debugCollection() {
    try {
        const snapshot = await getDocs(collection(db, "groups"));
        snapshot.forEach(doc => {
            console.log('Document data:', {
                id: doc.id,
                data: doc.data()
            });
        });
    } catch (error) {
        console.error('Debug error:', error);
    }
}

// Function to create a group card
function createGroupCard(group) {
    const card = document.createElement('div');
    card.className = 'group-card';
    card.setAttribute('data-group-id', group.id);
    
    card.innerHTML = `
        ${group.image ? `<img src="${group.image}" alt="${group.title}" onerror="this.src='https://via.placeholder.com/150'">` : ''}
        <div class="group-badges">
            <span class="category-badge">${group.category || 'Uncategorized'}</span>
            <span class="country-badge">${group.country || 'Global'}</span>
        </div>
        <h3>${group.title}</h3>
        <p>${group.description}</p>
        <div class="card-actions">
            <a href="${group.link}" target="_blank" rel="noopener noreferrer" class="join-btn" onclick="updateGroupViews('${group.id}')">
                <i class="fab fa-whatsapp"></i> Join Group
            </a>
        </div>
        <div class="card-footer">
            <div class="views-count">
                <i class="fas fa-eye"></i>
                <span>${group.views || 0}</span> views
            </div>
            <div class="date-added">
                ${group.timestamp ? timeAgo(group.timestamp.toDate()) : 'Recently added'}
            </div>
        </div>
    `;

    return card;
}

// Function to update group views
async function updateGroupViews(groupId) {
    try {
        const groupRef = doc(db, "groups", groupId);
        await updateDoc(groupRef, {
            views: increment(1)
        });
    } catch (error) {
        console.error('Error updating views:', error);
    }
}

// Function to load groups
async function loadGroups(filterTopic = 'all', filterCountry = 'all', loadMore = false) {
    if (!groupContainer) return;

    try {
        console.log('Loading groups with filters:', { filterTopic, filterCountry });
        
        if (!loadMore) {
            const loadingSkeletons = Array(6).fill(createLoadingState()).join('');
            groupContainer.innerHTML = loadingSkeletons;
            lastDoc = null;
        }

        let baseQuery = collection(db, "groups");
        let constraints = [];

        // Add category filter if not 'all'
        if (filterTopic !== 'all') {
            console.log('Adding category filter:', filterTopic);
            constraints.push(where("category", "==", filterTopic));
        }

        // Add country filter if not 'all'
        if (filterCountry !== 'all') {
            console.log('Adding country filter:', filterCountry);
            constraints.push(where("country", "==", filterCountry));
        }

        // Always add ordering and limit
        constraints.push(orderBy("timestamp", "desc"));
        
        // Create the query
        let groupsQuery = query(baseQuery, ...constraints);

        // Add pagination
        if (lastDoc && loadMore) {
            groupsQuery = query(groupsQuery, startAfter(lastDoc), limit(POSTS_PER_PAGE));
        } else {
            groupsQuery = query(groupsQuery, limit(POSTS_PER_PAGE));
        }

        console.log('Executing query...');
        const querySnapshot = await getDocs(groupsQuery);
        
        if (!loadMore) {
            groupContainer.innerHTML = '';
        }

        let groups = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log('Document data:', {
                id: doc.id,
                category: data.category,
                country: data.country,
                timestamp: data.timestamp
            });
            groups.push({ 
                id: doc.id, 
                ...data,
                timestamp: data.timestamp?.toDate() // Convert Firebase timestamp to JS Date
            });
        });

        if (groups.length === 0 && !loadMore) {
            console.log('No groups found');
            groupContainer.innerHTML = '<div class="no-groups">No groups found matching your criteria</div>';
            return;
        }

        // Update lastDoc for pagination
        lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

        // Apply search filter if there's a search term
        const searchTerm = searchInput?.value.toLowerCase();
        if (searchTerm) {
            console.log('Applying search filter:', searchTerm);
            groups = groups.filter(group => 
                group.title?.toLowerCase().includes(searchTerm) ||
                group.description?.toLowerCase().includes(searchTerm)
            );
        }

        groups.forEach(group => {
            const card = createGroupCard(group);
            groupContainer.appendChild(card);
        });

        console.log(`Rendered ${groups.length} groups`);

    } catch (error) {
        console.error('Error loading groups:', error);
        groupContainer.innerHTML = '<div class="error">Error loading groups. Please try again later.</div>';
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Debug check for data structure
    debugCollection();

    // Initial load
    loadGroups();

    // Category buttons (top section)
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            console.log('Category button clicked:', category);
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTopic = category;
            loadGroups(category, currentCountry);
            
            // Update dropdown to match selected category
            const dropdownBtn = document.querySelector('#topicFilters').closest('.dropdown').querySelector('.dropdown-btn');
            if (dropdownBtn) {
                dropdownBtn.innerHTML = `${btn.textContent.trim()} <i class="fas fa-chevron-down"></i>`;
                // Also update the dropdown menu selection
                const dropdownItem = document.querySelector(`#topicFilters .filter-btn[data-category="${category}"]`);
                if (dropdownItem) {
                    document.querySelectorAll('#topicFilters .filter-btn').forEach(b => b.classList.remove('active'));
                    dropdownItem.classList.add('active');
                }
            }
        });
    });

    // Dropdown functionality
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const btn = dropdown.querySelector('.dropdown-btn');
        const menu = dropdown.querySelector('.dropdown-menu');

        // Toggle dropdown
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdowns.forEach(d => {
                if (d !== dropdown) {
                    d.classList.remove('active');
                }
            });
            dropdown.classList.toggle('active');
        });

        // Handle filter selection
        if (menu.id === 'topicFilters') {
            menu.querySelectorAll('.filter-btn').forEach(item => {
                item.addEventListener('click', () => {
                    const category = item.dataset.category;
                    console.log('Topic filter clicked:', category);
                    menu.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    item.classList.add('active');
                    currentTopic = category;
                    loadGroups(category, currentCountry);
                    btn.innerHTML = `${item.textContent} <i class="fas fa-chevron-down"></i>`;
                    dropdown.classList.remove('active');

                    // Update category buttons to match
                    const categoryBtn = document.querySelector(`.category-btn[data-category="${category}"]`);
                    if (categoryBtn) {
                        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                        categoryBtn.classList.add('active');
                    }
                });
            });
        } else if (menu.id === 'countryFilters') {
            menu.querySelectorAll('.filter-btn').forEach(item => {
                item.addEventListener('click', () => {
                    const country = item.dataset.country;
                    console.log('Country filter clicked:', country);
                    menu.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    item.classList.add('active');
                    currentCountry = country;
                    loadGroups(currentTopic, country);
                    btn.innerHTML = `${item.textContent} <i class="fas fa-chevron-down"></i>`;
                    dropdown.classList.remove('active');
                });
            });
        }
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        dropdowns.forEach(dropdown => dropdown.classList.remove('active'));
    });

    // Search input listener
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            loadGroups(currentTopic, currentCountry);
        }, 300));
    }

    // Topic filter listeners
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTopic = btn.dataset.category;
            loadGroups(currentTopic, currentCountry);
        });
    });

    // Country filter listeners
    document.querySelectorAll('.country-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.country-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCountry = btn.dataset.country;
            loadGroups(currentTopic, currentCountry);
        });
    });

    // Initialize lazy loading
    setupLazyLoading();
});

// Helper Functions
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

function timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return Math.floor(seconds) + ' seconds ago';
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

// Setup lazy loading for images
function setupLazyLoading() {
    const lazyImages = document.querySelectorAll('.lazy-image');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy-image');
                observer.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
}

// Add error handling function
function showErrorState(message) {
        groupContainer.innerHTML = `
        <div class="error-state" role="alert">
                <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
            <button onclick="loadGroups(currentTopic, currentCountry)" class="retry-btn">
                <i class="fas fa-redo"></i> Try Again
            </button>
            </div>
        `;
    }

// Utility Functions
function isValidWhatsAppLink(link) {
    return link.includes('chat.whatsapp.com/');
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Adding the OpenGraph preview functionality to the existing code
async function fetchOpenGraph(url) {
    try {
        // Using allorigins.win as CORS proxy
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
        const data = await response.json();

        // Parse HTML response
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.contents, "text/html");

        // Extract Open Graph metadata
        const ogTitle = doc.querySelector('meta[property="og:title"]')?.content || 
                       doc.querySelector('title')?.textContent || 
                       "No Title Found";
        const ogImage = doc.querySelector('meta[property="og:image"]')?.content || 
                       "https://via.placeholder.com/150";
        const ogDescription = doc.querySelector('meta[property="og:description"]')?.content || 
                             doc.querySelector('meta[name="description"]')?.content || 
                             "No Description Available";

        return { title: ogTitle, image: ogImage, description: ogDescription };
    } catch (error) {
        console.error("Error fetching Open Graph data:", error);
        return null;
    }
}

// Update the form event listener to include preview functionality
document.getElementById('groupLink')?.addEventListener('input', async function() {
    const url = this.value.trim();
    const previewDiv = document.getElementById('preview');

    if (!previewDiv) return;

    if (url.includes('chat.whatsapp.com/')) {
        previewDiv.innerHTML = '<div class="loading">Loading preview...</div>';

        const ogData = await fetchOpenGraph(url);
        if (ogData) {
            previewDiv.innerHTML = `
                <div class="link-preview">
                    <img src="${ogData.image}" alt="Preview" onerror="this.src='https://via.placeholder.com/150'">
                    <div class="link-preview-content">
                        <h3>${ogData.title}</h3>
                        <p>${ogData.description}</p>
                    </div>
                </div>
            `;
        } else {
            previewDiv.innerHTML = '<p class="error">Could not load preview</p>';
        }
    } else {
        previewDiv.innerHTML = '';
    }
});

// Form Submission
form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('.submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.loading-spinner');

    try {
        btnText.style.display = 'none';
        spinner.style.display = 'inline-block';
        submitBtn.disabled = true;

        const link = form.groupLink.value.trim();
        const ogData = await fetchOpenGraph(link);

        const groupData = {
            title: form.groupTitle.value.trim(),
            link: link,
            category: form.groupCategory.value,
            country: form.groupCountry.value,
            description: form.groupDescription.value.trim(),
            image: ogData?.image || null,
            timestamp: new Date()
        };

        if (!isValidWhatsAppLink(groupData.link)) {
            throw new Error('Please enter a valid WhatsApp group link');
        }

        await addDoc(collection(db, "groups"), groupData);
        showNotification('Group added successfully!', 'success');
        form.reset();
        document.getElementById('preview').innerHTML = '';
        loadGroups(currentTopic, currentCountry);

    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        btnText.style.display = 'block';
        spinner.style.display = 'none';
        submitBtn.disabled = false;
    }
});
