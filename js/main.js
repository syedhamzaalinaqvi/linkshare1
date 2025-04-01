import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, where, startAfter, limit, doc, updateDoc, increment, getDoc, onSnapshot, Timestamp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// Add these global variables at the top
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

document.body.appendChild(modal);
requestAnimationFrame(() => modal.classList.add('active'));

// Close modal when clicking close button or outside
modal.querySelector('.modal-close').addEventListener('click', () => {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
});

// Handle join button click
const joinBtn = modal.querySelector('.modal-join-btn');
joinBtn.addEventListener('click', (e) => {
    e.preventDefault();
    updateGroupViews(group.id);
    window.open(group.link, '_blank');
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
});

// Lazy load image
const img = modal.querySelector('.lazy-image');
img.addEventListener('load', () => img.classList.add('loaded'));

function closeModal() {
    const modalOverlay = document.querySelector('.modal-overlay');
    modalOverlay.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
}

// Add modal close events
document.querySelector('.modal-close')?.addEventListener('click', closeModal);
document.querySelector('.modal-overlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
});

// Add escape key handler for modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
}

// Update createGroupCard function to handle missing thumbnails and titles
function createGroupCard(group) {
    const card = document.createElement('div');
    card.className = 'group-card';
    card.setAttribute('data-group-id', group.id);
    
    card.innerHTML = `
            ${group.image ? `<img src="${group.image}" alt="${group.title}" onerror="this.src='https://via.placeholder.com/150'">` : ''}
            <div class="group-badges">
                <span class="category-badge">${group.category}</span>
                <span class="country-badge">${group.country}</span>
            </div>
        <h3>${group.title}</h3>
        <p>${truncateDescription(group.description)}</p>
            <div class="card-actions">
            <a href="${group.link}" target="_blank" rel="noopener noreferrer" class="join-btn" onclick="event.preventDefault();">
                    <i class="fab fa-whatsapp"></i> Join Group
                </a>
            </div>
            <div class="card-footer">
            <div class="views-count">
                <i class="fas fa-eye"></i>
                <span>${group.views || 0}</span> views
            </div>
            <div class="date-added">
                ${group.timestamp ? timeAgo(group.timestamp.seconds) : 'Recently added'}
            </div> 
        </div>
    `;

    // Add click event listener to the join button
    const joinBtn = card.querySelector('.join-btn');
    joinBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent modal from opening when clicking join button
        
        // Open the link immediately
        window.open(group.link, '_blank');
        
        // Update views count in the background
        updateGroupViews(group.id).catch(console.error);
    });

    // Add click event listener to the card for modal
    card.addEventListener('click', () => openModal(group));

    return card;
}

// Function to render groups
async function renderGroups(groups) {
    if (!groupContainer) return;
    
    groupContainer.innerHTML = '';
    groups.forEach(group => {
        const card = createGroupCard(group);
        groupContainer.appendChild(card);
    });
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

// Ensure spinner is hidden on page load
document.addEventListener("DOMContentLoaded", () => {
    const spinner = document.querySelector('.loading-spinner');
    if (spinner) spinner.style.display = 'none';
});

// Form Submission
form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('.submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.loading-spinner');

    try {
        btnText.style.display = 'none';
        spinner.style.display = 'inline-block'; // Show spinner
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
            timestamp: serverTimestamp()
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
        spinner.style.display = 'none'; // Hide spinner
        submitBtn.disabled = false;
    }
});

// Add lazy loading implementation
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

// Add loading state component
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

// Update loadGroups function with better error handling
async function loadGroups(filterTopic = 'all', filterCountry = 'all', loadMore = false) {
    if (!groupContainer) return;

    try {
        if (!loadMore) {
            // Show loading skeletons
            const loadingSkeletons = Array(6).fill(createLoadingState()).join('');
            groupContainer.innerHTML = loadingSkeletons;
            lastDoc = null;
        }

        let groupsQuery;
        if (lastDoc) {
            groupsQuery = query(
                collection(db, "groups"),
                orderBy("timestamp", "desc"),
                startAfter(lastDoc),
                limit(POSTS_PER_PAGE)
            );
        } else {
            groupsQuery = query(
                collection(db, "groups"),
                orderBy("timestamp", "desc"),
                limit(POSTS_PER_PAGE)
            );
        }

        const querySnapshot = await getDocs(groupsQuery);

        if (!querySnapshot.empty) {
            lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        }

        let groups = [];
        querySnapshot.forEach((doc) => {
            groups.push({ id: doc.id, ...doc.data() });
        });

        // Apply filters
        const searchTerm = searchInput?.value.toLowerCase();
        if (searchTerm) {
            groups = groups.filter(group => 
                group.title.toLowerCase().includes(searchTerm) ||
                group.description.toLowerCase().includes(searchTerm) ||
                group.category.toLowerCase().includes(searchTerm) ||
                group.country.toLowerCase().includes(searchTerm)
            );
        }

        if (filterTopic !== 'all') {
            groups = groups.filter(group => group.category === filterTopic);
        }

        if (filterCountry !== 'all') {
            groups = groups.filter(group => group.country === filterCountry);
        }

        // Render groups
        if (groups.length) {
            if (!loadMore) {
                groupContainer.innerHTML = ''; // Clear container first
            }
            
            // Append each group card
            groups.forEach(group => {
                const card = createGroupCard(group);
                groupContainer.appendChild(card);
            });

            // Remove existing Load More button if it exists
            let loadMoreWrapper = document.querySelector('.load-more-wrapper');
            if (loadMoreWrapper) loadMoreWrapper.remove();

            // Add Load More button only if we got a full page
            if (groups.length === POSTS_PER_PAGE) {
                loadMoreWrapper = document.createElement('div');
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

            // After rendering the cards, set up lazy loading
            setupLazyLoading();
        } else {
            if (!loadMore) {
                groupContainer.innerHTML = `
                    <div class="no-groups">
                        <i class="fas fa-search" style="font-size: 3rem; color: var(--gray);"></i>
                        <p>No groups found matching your criteria</p>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Error loading groups:', error);
        let errorMessage = 'Failed to load groups. Please try again later.';
        if (error.code === 'permission-denied') {
            errorMessage = 'Access denied. Please check your permissions.';
        } else if (error.code === 'unavailable') {
            errorMessage = 'Service temporarily unavailable. Please try again in a few minutes.';
        }
        showErrorState(errorMessage);
    }
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

// Event Listeners
topicFilters?.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
        topicFilters.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        currentTopic = e.target.dataset.category;
        loadGroups(currentTopic, currentCountry);
    }
});

countryFilters?.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
        countryFilters.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        currentCountry = e.target.dataset.country;
        loadGroups(currentTopic, currentCountry);
    }
});

searchInput?.addEventListener('input', debounce(() => {
    loadGroups(currentTopic, currentCountry);
}, 300));

filterButtons?.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        loadGroups(button.dataset.category, currentCountry); 
    });
});

// Category Menu Event Listeners
categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        button.classList.add('active');
        
        // Get the selected category
        const selectedCategory = button.dataset.category;
        
        // Update the topic filter dropdown to match
        const topicFilter = document.querySelector(`#topicFilters .filter-btn[data-category="${selectedCategory}"]`);
        if (topicFilter) {
            document.querySelectorAll('#topicFilters .filter-btn').forEach(btn => btn.classList.remove('active'));
            topicFilter.classList.add('active');
        }
        
        // Load groups with the selected category
        loadGroups(selectedCategory, 'all');
    });
});

// Debounce Function
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadGroups();
});

//chat gpt filter script updated
document.addEventListener("DOMContentLoaded", function () {
    const dropdowns = document.querySelectorAll(".dropdown");
    const searchInput = document.getElementById("searchGroups");
    let selectedTopic = "all";
    let selectedCountry = "all";

    // Toggle Dropdowns
    dropdowns.forEach(dropdown => {
        const btn = dropdown.querySelector(".dropdown-btn");
        const menu = dropdown.querySelector(".dropdown-menu");
        const items = menu.querySelectorAll(".filter-btn");

        btn.addEventListener("click", function () {
            dropdown.classList.toggle("active");
        });

        // Close dropdown when clicking outside
        document.addEventListener("click", function (e) {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove("active");
            }
        });

        // Handle filter selection
        items.forEach(item => {
            item.addEventListener("click", function () {
                const category = item.dataset.category || null;
                const country = item.dataset.country || null;

                if (category !== null) {
                    selectedTopic = category;
                    document.querySelector("#topicFilters .active").classList.remove("active");
                    btn.innerHTML = `${item.textContent} <i class="fas fa-chevron-down"></i>`; // Preserve icon
                }

                if (country !== null) {
                    selectedCountry = country;
                    document.querySelector("#countryFilters .active").classList.remove("active");
                    btn.innerHTML = `${item.textContent} <i class="fas fa-chevron-down"></i>`; // Preserve icon
                }

                item.classList.add("active");
                filterGroups();
                dropdown.classList.remove("active"); // Close dropdown after selection
            });
        });
    });

    // Filter function
    function filterGroups() {
        console.log(`Filtering by Topic: ${selectedTopic}, Country: ${selectedCountry}`);
        // Add your logic here to filter the groups on the page based on selectedTopic & selectedCountry
    }

    // Search Logic
    searchInput.addEventListener("input", function () {
        const query = searchInput.value.toLowerCase();
        console.log(`Searching for: ${query}`);
        // Add your search filter logic here
    });
});

