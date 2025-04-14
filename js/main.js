// Global variables
const POSTS_PER_PAGE = 12;
let lastDoc = null;
let isLastPage = false;
const groupContainer = document.querySelector('.groups-grid');
const loadMoreBtn = document.querySelector('#loadMoreBtn');
const searchInput = document.querySelector('#searchGroups');
let currentTopic = 'all';
let currentCountry = 'all';
let form = document.querySelector('#addGroupForm');

// Function to create a group card with lazy loading
function createGroupCard(group) {
    const card = document.createElement('div');
    card.className = 'group-card';
    card.setAttribute('data-group-id', group.id);
    // Force grid layout to apply properly with specific styling
    card.style.height = "450px";
    card.style.display = "flex";
    card.style.flexDirection = "column";

    // Handle timestamp display safely
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

    // Use a default image if none is provided
    const defaultImage = '/favicon-96x96.png';
    let imageUrl = group.image || defaultImage;

    // Create card with immediate image loading to ensure images display
    card.innerHTML = `
        <div class="card-image">
            <img src="${imageUrl}" alt="${group.title || 'Group'}" loading="lazy" onerror="this.onerror=null; this.src='${defaultImage}';">
        </div>
        <div class="group-badges">
            <span class="category-badge">${group.category || 'Uncategorized'}</span>
            <span class="country-badge">${group.country || 'Global'}</span>
        </div>
        <h3>${group.title || 'Untitled Group'}</h3>
        <p>${group.description || 'No description available'}</p>
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
                ${timeDisplay}
            </div>
        </div>
    `;

    return card;
}

// Function to update load more button visibility
function updateLoadMoreButton(totalGroups) {
    if (loadMoreBtn) {
        if (isLastPage || totalGroups < POSTS_PER_PAGE) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
        }
    }
}

// Function to load groups
function loadGroups(filterTopic = 'all', filterCountry = 'all', loadMore = false) {
    if (!groupContainer) return;

    // Check if Firebase is initialized
    if (!window.db) {
        console.log("Firebase not initialized yet. Waiting...");
        // Show loading message
        groupContainer.innerHTML = '<div class="loading">Connecting to database...</div>';
        
        // Try again in 1 second
        setTimeout(() => {
            loadGroups(filterTopic, filterCountry, loadMore);
        }, 1000);
        return;
    }

    try {
        console.log('Loading groups with filters:', { filterTopic, filterCountry });

        if (!loadMore) {
            // Display skeleton loading cards
            groupContainer.innerHTML = '';
            for (let i = 0; i < 6; i++) {
                groupContainer.innerHTML += createLoadingSkeleton();
            }
            lastDoc = null;
            isLastPage = false;
        }

        // Create base query
        let baseQuery = window.db.collection("groups");

        // For queries with filters, we'll use a different approach to avoid index issues
        const hasTopicFilter = filterTopic && filterTopic !== 'all';
        const hasCountryFilter = filterCountry && filterCountry !== 'all';

        // First get all groups and apply filter in memory if using advanced filtering
        if ((hasTopicFilter && hasCountryFilter) || 
            (hasTopicFilter && !hasCountryFilter) || 
            (!hasTopicFilter && hasCountryFilter)) {
            // Fetch all groups with a limit and apply filters in memory
            baseQuery = baseQuery.orderBy("timestamp", "desc");

            if (lastDoc && loadMore) {
                baseQuery = baseQuery.startAfter(lastDoc).limit(POSTS_PER_PAGE * 3); // Get more to ensure we have enough after filtering
            } else {
                baseQuery = baseQuery.limit(POSTS_PER_PAGE * 3); // Get more to ensure we have enough after filtering
            }
        } else {
            // No filters, just apply ordering and pagination
            baseQuery = baseQuery.orderBy("timestamp", "desc");

            if (lastDoc && loadMore) {
                baseQuery = baseQuery.startAfter(lastDoc).limit(POSTS_PER_PAGE);
            } else {
                baseQuery = baseQuery.limit(POSTS_PER_PAGE);
            }
        }

        // Add cache settings to improve performance
        const queryOptions = {
            source: 'default' // Use cache if available but verify with server
        };

        // Execute query with cache options
        baseQuery.get(queryOptions).then(querySnapshot => {
            // Clear container if not loading more
            if (!loadMore) {
                groupContainer.innerHTML = '';
            }

            // Create array of groups
            let groups = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                groups.push({
                    id: doc.id,
                    ...data
                });
            });

            // Apply filters in memory since we've already fetched the data
            const hasTopicFilter = filterTopic && filterTopic !== 'all';
            const hasCountryFilter = filterCountry && filterCountry !== 'all';

            // Apply category filter if needed
            if (hasTopicFilter) {
                groups = groups.filter(group => 
                    group.category === filterTopic
                );
            }

            // Apply country filter if needed
            if (hasCountryFilter) {
                groups = groups.filter(group => 
                    group.country === filterCountry
                );
            }

            // Limit the results to POSTS_PER_PAGE
            const limitedGroups = groups.slice(0, POSTS_PER_PAGE);

            // Show no results message if needed
            if (limitedGroups.length === 0) {
                if (!loadMore) {
                    groupContainer.innerHTML = '<div class="no-groups">No groups found matching your criteria</div>';
                }
                isLastPage = true;
                updateLoadMoreButton(0);
                return;
            }

            // Store the last document for pagination
            if (querySnapshot.docs.length > 0) {
                lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
            }

            // Check if this is the last page but always show the button initially
            isLastPage = groups.length < POSTS_PER_PAGE; // More accurate last page check

            // Apply search filter if needed
            const searchTerm = searchInput?.value.toLowerCase();
            if (searchTerm) {
                groups = limitedGroups.filter(group => 
                    (group.title || '').toLowerCase().includes(searchTerm) ||
                    (group.description || '').toLowerCase().includes(searchTerm)
                );
            } else {
                groups = limitedGroups;
            }

            // Render groups efficiently
            const fragment = document.createDocumentFragment();
            groups.forEach(group => {
                const card = createGroupCard(group);
                fragment.appendChild(card);
            });
            groupContainer.appendChild(fragment);

            // Update load more button visibility
            updateLoadMoreButton(groups.length);

            console.log(`Rendered ${groups.length} groups`);
        }).catch(error => {
            console.error('Error loading groups:', error);
            groupContainer.innerHTML = `<div class="error">
                <p>Error loading groups: ${error.message}</p>
                <button onclick="location.reload()" class="submit-btn">Retry</button>
            </div>`;
            updateLoadMoreButton(0);
        });
    } catch (error) {
        console.error('Error loading groups:', error);
        groupContainer.innerHTML = `<div class="error">
            <p>Error loading groups: ${error.message}</p>
            <button onclick="location.reload()" class="submit-btn">Retry</button>
        </div>`;
        updateLoadMoreButton(0);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Firebase event listeners with retry mechanism
    const checkFirebaseAndInitialize = () => {
        if (window.firebaseInitialized) {
            console.log("Firebase is initialized, proceeding with app initialization");
            initializeApp();
        } else {
            console.log("Firebase not initialized yet, waiting...");
            setTimeout(checkFirebaseAndInitialize, 300);
        }
    };

    // Start initialization process
    setTimeout(checkFirebaseAndInitialize, 100);

    // Main app initialization
    function initializeApp() {
        // Initialize mobile menu
        const navToggle = document.querySelector('.nav-toggle');
        const navLinks = document.querySelector('.nav-links');

        if (navToggle && navLinks) {
            navToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                navLinks.classList.toggle('active');
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (navLinks.classList.contains('active') && 
                    !navLinks.contains(e.target) && 
                    e.target !== navToggle) {
                    navLinks.classList.remove('active');
                }
            });
        }

        // Initial load will be triggered by firebase-config.js when ready

        // Load More button click handler with enhanced animation
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', (e) => {
                // Add loading class for animation
                loadMoreBtn.classList.add('loading');
                loadMoreBtn.innerHTML = '<i class="fas fa-sync"></i> Loading...';

                // Add a click animation
                loadMoreBtn.style.transform = 'scale(0.95)';

                // Load content with minimal delay
                setTimeout(() => {
                    loadGroups(currentTopic, currentCountry, true);

                    // Reset button after loading
                    setTimeout(() => {
                        loadMoreBtn.style.transform = 'scale(1)';
                        loadMoreBtn.classList.remove('loading');
                        loadMoreBtn.innerHTML = '<i class="fas fa-sync"></i> Load More';
                    }, 300);
                }, 300);
            });
        }

        // Category buttons (top section)
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.dataset.category;
                console.log('Category button clicked:', category);

                // Update UI
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update state and load groups
                currentTopic = category;
                loadGroups(category, currentCountry);

                // Update dropdown to match selected category
                const dropdownBtn = document.querySelector('#topicFilters')?.closest('.dropdown')?.querySelector('.dropdown-btn');
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

        // Topic filter dropdown
        const topicFilters = document.querySelector('#topicFilters');
        if (topicFilters) {
            topicFilters.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const category = btn.dataset.category;
                    console.log('Topic filter clicked:', category);

                    // Update UI
                    topicFilters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    // Update dropdown button text
                    const dropdownBtn = btn.closest('.dropdown')?.querySelector('.dropdown-btn');
                    if (dropdownBtn) {
                        dropdownBtn.innerHTML = `${btn.textContent} <i class="fas fa-chevron-down"></i>`;
                    }

                    // Update state and load groups
                    currentTopic = category;
                    loadGroups(category, currentCountry);

                    // Close dropdown
                    btn.closest('.dropdown')?.classList.remove('active');

                    // Update category buttons to match
                    const categoryBtn = document.querySelector(`.category-btn[data-category="${category}"]`);
                    if (categoryBtn) {
                        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                        categoryBtn.classList.add('active');
                    }
                });
            });
        }

        // Country filter dropdown
        const countryFilters = document.querySelector('#countryFilters');
        if (countryFilters) {
            countryFilters.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const country = btn.dataset.country;
                    console.log('Country filter clicked:', country);

                    // Update UI
                    countryFilters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    // Update dropdown button text
                    const dropdownBtn = btn.closest('.dropdown')?.querySelector('.dropdown-btn');
                    if (dropdownBtn) {
                        dropdownBtn.innerHTML = `${btn.textContent} <i class="fas fa-chevron-down"></i>`;
                    }

                    // Update state and load groups
                    currentCountry = country;
                    loadGroups(currentTopic, country);

                    // Close dropdown
                    btn.closest('.dropdown')?.classList.remove('active');
                });
            });
        }

        // Dropdown toggle functionality
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            const btn = dropdown.querySelector('.dropdown-btn');
            if (!btn) return;

            // Toggle dropdown
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const wasActive = dropdown.classList.contains('active');

                // Close all dropdowns
                document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active'));

                // Toggle this dropdown
                if (!wasActive) {
                    dropdown.classList.add('active');
                }
            });
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active'));
        });

        // Search input listener
        if (searchInput) {
            searchInput.addEventListener('input', debounce(() => {
                loadGroups(currentTopic, currentCountry);
            }, 300));
        }

        // Setup lazy loading
        setupLazyLoading();
    }
});

// Helper Functions
function createLoadingSkeleton() {
    return `
        <div class="loading-skeleton">
            <div class="skeleton-image pulse"></div>
            <div class="skeleton-content">
                <div class="skeleton-badges">
                    <div class="skeleton-badge pulse"></div>
                    <div class="skeleton-badge pulse"></div>
                </div>
                <div class="skeleton-title pulse"></div>
                <div class="skeleton-description pulse"></div>
                <div class="skeleton-description pulse"></div>
                <div class="skeleton-button pulse"></div>
            </div>
            <div class="skeleton-footer">
                <div class="skeleton-stat pulse"></div>
                <div class="skeleton-stat pulse"></div>
            </div>
        </div>
    `;
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

    if ('IntersectionObserver' in window) {
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
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.classList.remove('lazy-image');
        });
    }
}

// Add error handling function
function showErrorState(message) {
    if (groupContainer) {
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
}

// Utility Functions
function isValidWhatsAppLink(link) {
    return link && link.includes('chat.whatsapp.com/');
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
        // Check if it's a WhatsApp URL
        const isWhatsAppUrl = url.includes('chat.whatsapp.com/');
        
        if (isWhatsAppUrl) {
            // For WhatsApp links, we'll use a fallback approach since their OG data often has CORS issues
            console.log('Processing WhatsApp link with fallback method');
            
            // Extract group ID from WhatsApp link
            const groupId = url.split('chat.whatsapp.com/')[1];
            
            if (!groupId) {
                return null;
            }
            
            // Create a fallback object with default values
            return {
                title: 'WhatsApp Group',
                description: 'Join this WhatsApp group',
                // Use a reliable WhatsApp logo that won't be blocked by CORS
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png',
                url: url
            };
        }
        
        // For non-WhatsApp URLs, try to fetch OG data (may still have CORS issues)
        console.log('Fetching OpenGraph data for: ', url);
        
        // Use a CORS proxy for better results (you can replace with your own if needed)
        const corsProxy = 'https://corsproxy.io/?';
        const response = await fetch(corsProxy + encodeURIComponent(url));
        
        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.status}`);
        }
        
        const html = await response.text();
        
        // Parse the HTML to extract OpenGraph tags
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Extract OpenGraph data
        const ogTitle = doc.querySelector('meta[property="og:title"]')?.content || 
                        doc.querySelector('title')?.textContent || 
                        'No Title Available';
                        
        const ogDescription = doc.querySelector('meta[property="og:description"]')?.content || 
                             doc.querySelector('meta[name="description"]')?.content || 
                             'No description available';
                             
        const ogImage = doc.querySelector('meta[property="og:image"]')?.content || 
                       doc.querySelector('meta[property="og:image:url"]')?.content || 
                       'https://via.placeholder.com/600x400?text=No+Image';
        
        return {
            title: ogTitle,
            description: ogDescription,
            image: ogImage,
            url: url
        };
    } catch (error) {
        console.error('Error fetching OpenGraph data:', error);
        
        // Return a fallback object
        return {
            title: 'Link Preview',
            description: 'No preview available for this link.',
            image: 'https://via.placeholder.com/600x400?text=Preview+Not+Available',
            url: url
        };
    }
}

// Helper function for time formatting
function timeAgo(date) {
    try {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);

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
    } catch (error) {
        console.error('Error calculating time ago:', error);
        return 'Recently added';
    }
}

// Function to update group views
function updateGroupViews(groupId) {
    try {
        const groupRef = window.db.collection("groups").doc(groupId);
        groupRef.update({
            views: firebase.firestore.FieldValue.increment(1)
        });
        console.log('Group views updated');
    } catch (error) {
        console.error('Error updating group views:', error);
    }
}

// Initialize form event listeners if on the add-group page
document.addEventListener('DOMContentLoaded', () => {
    // Handle WhatsApp link input and preview
    const groupLinkInput = document.getElementById('groupLink');
    if (groupLinkInput) {
        groupLinkInput.addEventListener('input', debounce(async function() {
            const url = this.value ? this.value.trim() : '';
            const previewDiv = document.getElementById('preview');

            if (!previewDiv) return;

            // Clear the preview if empty
            if (!url) {
                previewDiv.innerHTML = '<p class="preview-tip">Paste a WhatsApp group link to see a preview</p>';
                return;
            }

            if (url.includes('chat.whatsapp.com/')) {
                // Show loading indicator
                previewDiv.innerHTML = '<div class="loading">Loading preview...</div>';

                try {
                    const ogData = await fetchOpenGraph(url);
                    if (ogData) {
                        // Create an image object to pre-load the image and check if it loads
                        const img = new Image();
                        img.onload = function() {
                            // Image loaded successfully
                            previewDiv.innerHTML = `
                                <div class="link-preview">
                                    <img src="${ogData.image}" alt="Preview">
                                    <div class="link-preview-content">
                                        <h3>${ogData.title}</h3>
                                        <p>${ogData.description}</p>
                                    </div>
                                </div>
                            `;
                        };
                        img.onerror = function() {
                            // Image failed to load, use fallback
                            previewDiv.innerHTML = `
                                <div class="link-preview">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png" alt="WhatsApp Logo">
                                    <div class="link-preview-content">
                                        <h3>${ogData.title}</h3>
                                        <p>${ogData.description}</p>
                                    </div>
                                </div>
                            `;
                        };
                        img.src = ogData.image;
                    } else {
                        previewDiv.innerHTML = '<p class="error">Could not load preview</p>';
                    }
                } catch (error) {
                    console.error('Error loading preview:', error);
                    previewDiv.innerHTML = '<p class="error">Could not load preview</p>';
                }
            } else {
                previewDiv.innerHTML = '<p class="preview-tip">Enter a valid WhatsApp group link starting with https://chat.whatsapp.com/</p>';
            }
        }, 500));
    }

    // Form Submission handler
    const form = document.getElementById('groupForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('.submit-btn');
            const btnText = submitBtn.querySelector('.btn-text');
            const spinner = submitBtn.querySelector('.loading-spinner');

            try {
                // Check if Firebase is initialized
                if (!window.db || !window.firebaseInitialized) {
                    throw new Error("Database connection not ready. Please refresh the page and try again.");
                }
                
                btnText.style.display = 'none';
                spinner.style.display = 'inline-block';
                submitBtn.disabled = true;

                const link = form.groupLink.value.trim();
                
                if (!isValidWhatsAppLink(link)) {
                    throw new Error('Please enter a valid WhatsApp group link starting with https://chat.whatsapp.com/');
                }
                
                const ogData = await fetchOpenGraph(link);

                // We'll test if the image is accessible
                let imageUrl = null;
                if (ogData && ogData.image) {
                    imageUrl = ogData.image;
                    
                    // If it's not our fallback image, test if it's accessible
                    if (!imageUrl.includes('wikimedia.org') && !imageUrl.includes('placeholder.com')) {
                        try {
                            // Test if the image can be loaded
                            await new Promise((resolve, reject) => {
                                const img = new Image();
                                img.onload = resolve;
                                img.onerror = reject;
                                img.src = imageUrl;
                                // Set a timeout to abort if image loading takes too long
                                setTimeout(reject, 3000);
                            });
                            console.log('Image successfully loaded:', imageUrl);
                        } catch (error) {
                            console.warn('Image failed to load, using fallback:', error);
                            imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png';
                        }
                    }
                } else {
                    // Use default WhatsApp logo if no image was found
                    imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png';
                }

                // Prepare group data
                const groupData = {
                    title: form.groupTitle.value.trim() || 'WhatsApp Group',
                    link: link,
                    category: form.groupCategory.value,
                    country: form.groupCountry.value,
                    description: form.groupDescription.value.trim() || 'Join this WhatsApp group',
                    image: imageUrl,
                    timestamp: window.serverTimestamp(),
                    views: 0 // Initialize views counter
                };

                console.log('Submitting group with image:', imageUrl);

                // Now add the document
                const docRef = await window.db.collection("groups").add(groupData);
                console.log("Document written with ID: ", docRef.id);
                
                // Show success message
                showNotification('Group added successfully!', 'success');
                form.reset();
                document.getElementById('preview').innerHTML = '<p class="preview-tip">Paste a WhatsApp group link to see a preview</p>';

            } catch (error) {
                console.error("Form submission error:", error);
                showNotification(error.message, 'error');
            } finally {
                btnText.style.display = 'block';
                spinner.style.display = 'none';
                submitBtn.disabled = false;
            }
        });
    }
});

// Make updateGroupViews available globally
window.updateGroupViews = updateGroupViews;