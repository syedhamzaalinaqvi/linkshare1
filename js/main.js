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

// Function to create a group card
function createGroupCard(group) {
    const card = document.createElement('div');
    card.className = 'group-card';
    card.setAttribute('data-group-id', group.id);

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
    
    // Only replace WhatsApp images that cause 403 errors, but keep other valid images
    if (imageUrl && imageUrl.includes('whatsapp.net') && imageUrl.includes('403')) {
        imageUrl = defaultImage;
    }

    card.innerHTML = `
        <div class="card-image">
            <img src="${imageUrl}" alt="${group.title || 'Group'}" onerror="this.onerror=null; this.src='${defaultImage}'; console.log('Using default image for: ' + this.src);">
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

    try {
        console.log('Loading groups with filters:', { filterTopic, filterCountry });

        if (!loadMore) {
            groupContainer.innerHTML = '<div class="loading">Loading groups...</div>';
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

        // Execute query
        baseQuery.get().then(querySnapshot => {
            // Clear container if not loading more
            if (!loadMore) {
                groupContainer.innerHTML = '';
            }

            // Create array of groups
            let groups = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                console.log('Document data:', {
                    id: doc.id,
                    category: data.category,
                    country: data.country
                });
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
            isLastPage = false; // Always show load more button

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

            // Render groups
            groups.forEach(group => {
                const card = createGroupCard(group);
                groupContainer.appendChild(card);
            });

            // Update load more button visibility
            updateLoadMoreButton(groups.length);

            console.log(`Rendered ${groups.length} groups`);
        }).catch(error => {
            console.error('Error loading groups:', error);
            groupContainer.innerHTML = '<div class="error">Error loading groups. Please try again later.</div>';
            updateLoadMoreButton(0);
        });
    } catch (error) {
        console.error('Error loading groups:', error);
        groupContainer.innerHTML = '<div class="error">Error loading groups. Please try again later.</div>';
        updateLoadMoreButton(0);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Firebase to initialize
    setTimeout(() => {
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

        // Initial load
        loadGroups();

        // Load More button click handler
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                loadGroups(currentTopic, currentCountry, true);
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
    }, 1000); // Give Firebase time to initialize
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
        // Using allorigins.win as CORS proxy
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
        const data = await response.json();

        // Parse HTML response
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.contents, "text/html");

        // Extract Open Graph metadata with fallbacks
        const ogTitle = doc.querySelector('meta[property="og:title"]')?.content || 
                       doc.querySelector('title')?.textContent || 
                       "WhatsApp Group";
                       
        // Try multiple image sources for better success rate
        let ogImage = doc.querySelector('meta[property="og:image"]')?.content;
        if (!ogImage || ogImage.includes('whatsapp.net')) {
            // Try alternative image sources if the og:image is missing or is a WhatsApp image
            ogImage = doc.querySelector('meta[property="og:image:url"]')?.content ||
                     doc.querySelector('meta[name="twitter:image"]')?.content ||
                     doc.querySelector('link[rel="image_src"]')?.href ||
                     "/favicon-96x96.png";
        }
        
        const ogDescription = doc.querySelector('meta[property="og:description"]')?.content || 
                             doc.querySelector('meta[name="description"]')?.content || 
                             "Join this active WhatsApp group!";

        console.log("Fetched OpenGraph data:", { title: ogTitle, image: ogImage });
        return { title: ogTitle, image: ogImage, description: ogDescription };
    } catch (error) {
        console.error("Error fetching Open Graph data:", error);
        return { title: "WhatsApp Group", image: "/favicon-96x96.png", description: "Join this active WhatsApp group!" };
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
    const groupLinkInput = document.getElementById('groupLink');
    if (groupLinkInput) {
        groupLinkInput.addEventListener('input', async function() {
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
                btnText.style.display = 'none';
                spinner.style.display = 'inline-block';
                submitBtn.disabled = true;

                const link = form.groupLink.value.trim();
                const ogData = await fetchOpenGraph(link);

                // Make sure we properly capture the image from OpenGraph data
                let imageUrl = null;
                if (ogData && ogData.image) {
                    // Filter out problematic WhatsApp images that cause 403 errors
                    if (!ogData.image.includes('whatsapp.net')) {
                        imageUrl = ogData.image;
                    }
                }

                const groupData = {
                    title: form.groupTitle.value.trim(),
                    link: link,
                    category: form.groupCategory.value,
                    country: form.groupCountry.value,
                    description: form.groupDescription.value.trim(),
                    image: imageUrl,
                    timestamp: window.serverTimestamp()
                };

                if (!isValidWhatsAppLink(groupData.link)) {
                    throw new Error('Please enter a valid WhatsApp group link');
                }

                await window.addDoc(window.collection("groups"), groupData);
                showNotification('Group added successfully!', 'success');
                form.reset();
                document.getElementById('preview').innerHTML = '';

            } catch (error) {
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