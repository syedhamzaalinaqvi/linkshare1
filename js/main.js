// Global variables
const POSTS_PER_PAGE = 12;
let lastDoc = null;
let isLastPage = false;
const groupContainer = document.querySelector('.groups-grid');
const loadMoreBtn = document.querySelector('#loadMoreBtn');
const searchInput = document.querySelector('#searchGroups');
let currentTopic = 'all';
let currentCountry = 'all';

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

    // Check if the image URL is likely to cause CORS issues
    let imageUrl = '/favicon-96x96.png'; // Default fallback
    
    // If we have an image, check if it's a problematic source
    if (group.image) {
        // Check for common problematic domains that might cause 403 errors
        const problematicDomains = [
            'whatsapp.net', 
            'fbcdn.net', 
            'facebook.com',
            'cdninstagram.com',
            'fbsbx.com'
        ];
        
        const hasProblematicDomain = problematicDomains.some(domain => 
            group.image.includes(domain)
        );
        
        if (hasProblematicDomain) {
            // Use reliable WhatsApp logo instead
            imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png';
        } else if (group.image.includes('wikipedia.org') || group.image.includes('wikimedia.org')) {
            // Trusted sources - use directly
            imageUrl = group.image;
        } else if (group.image.includes('chat.whatsapp.com')) {
            // Direct WhatsApp link - use logo
            imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png';
        } else {
            // For other sources, use but with good fallback
            imageUrl = group.image;
        }
    }

    // Create card with reliable image loading pattern
    card.innerHTML = `
        <div class="card-image">
            <img src="${imageUrl}" alt="${group.title || 'Group'}" loading="lazy" 
                 onerror="this.onerror=null; this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png';">
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

// Global variable to store the current preview data and image URL
window.previewImageUrl = null;

// Function to fetch link preview using Microlink.io API with direct fetch approach
async function fetchLinkPreview(url, previewContainer) {
    // Reset the hidden input field for the image URL
    const imageUrlInput = document.getElementById('groupImageUrl');
    if (imageUrlInput) {
        imageUrlInput.value = '';
    }
    
    if (!url || !url.includes('chat.whatsapp.com/')) {
        previewContainer.innerHTML = '<p class="preview-tip">Enter a valid WhatsApp group link starting with https://chat.whatsapp.com/</p>';
        return null;
    }

    try {
        // Show loading indicator
        previewContainer.innerHTML = '<div class="loading">Loading preview...</div>';
        console.log('[FETCH] Starting preview fetch for:', url);

        // Direct fetch to the public API endpoint
        const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}`;
        console.log('[FETCH] Calling Microlink API:', apiUrl);
        
        const response = await fetch(apiUrl);
        const json = await response.json();
        
        console.log('[FETCH] Microlink API response:', json);
        
        if (json.status !== 'success') {
            throw new Error('Failed to fetch link preview');
        }
        
        // Extract data from the response
        const data = json.data;
        
        // Extract the metadata we need
        const title = data.title || 'WhatsApp Group';
        const description = data.description || 'Join this WhatsApp group';
        let imageUrl = null;
        
        // Find the best image to use in order of preference
        if (data.image && data.image.url) {
            imageUrl = data.image.url;
            console.log('[FETCH] Using image URL:', imageUrl);
        } else if (data.logo && data.logo.url) {
            imageUrl = data.logo.url;
            console.log('[FETCH] Using logo URL:', imageUrl);
        } else if (data.screenshot && data.screenshot.url) {
            imageUrl = data.screenshot.url;
            console.log('[FETCH] Using screenshot URL:', imageUrl);
        } else {
            // Fallback to WhatsApp logo
            imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png';
            console.log('[FETCH] No image found, using default WhatsApp logo');
        }
        
        // CRITICALLY IMPORTANT: Set the hidden input field value
        if (imageUrlInput) {
            imageUrlInput.value = imageUrl;
            console.log('[FETCH] Set hidden input field value to:', imageUrl);
        } else {
            console.error('[FETCH] Could not find the groupImageUrl hidden input field!');
        }
        
        // Create a visually appealing preview card
        previewContainer.innerHTML = `
            <div class="link-preview">
                <div class="preview-image">
                    <img src="${imageUrl}" alt="${title}" />
                </div>
                <div class="preview-content">
                    <h3>${title}</h3>
                    <p>${description}</p>
                    <div class="preview-url">
                        <span>${url.substring(0, 30)}${url.length > 30 ? '...' : ''}</span>
                    </div>
                    <div class="preview-status">
                        <span style="color: #26a269; font-weight: bold">✓ Image will be used as feature image</span>
                    </div>
                </div>
            </div>
        `;
        
        // Add responsive styles
        const previewElement = previewContainer.querySelector('.link-preview');
        if (previewElement) {
            previewElement.style.display = 'flex';
            previewElement.style.flexDirection = 'column';
            previewElement.style.border = '1px solid #ddd';
            previewElement.style.borderRadius = '8px';
            previewElement.style.overflow = 'hidden';
            previewElement.style.maxWidth = '100%';
            previewElement.style.backgroundColor = '#fff';
            previewElement.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        }
        
        const imageContainer = previewContainer.querySelector('.preview-image');
        if (imageContainer) {
            imageContainer.style.width = '100%';
            imageContainer.style.height = '180px';
            imageContainer.style.overflow = 'hidden';
            imageContainer.style.backgroundColor = '#f5f5f5';
        }
        
        const imageElement = previewContainer.querySelector('.preview-image img');
        if (imageElement) {
            imageElement.style.width = '100%';
            imageElement.style.height = '100%';
            imageElement.style.objectFit = 'cover';
        }
        
        const contentElement = previewContainer.querySelector('.preview-content');
        if (contentElement) {
            contentElement.style.padding = '12px';
        }
        
        return data;
    } catch (error) {
        console.error('[FETCH] Error fetching link preview:', error);
        
        // Clear hidden input field on error
        if (imageUrlInput) {
            imageUrlInput.value = '';
        }
        
        // Show error and fallback to a basic preview
        previewContainer.innerHTML = `
            <div class="link-preview">
                <div class="preview-image">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png" alt="WhatsApp" />
                </div>
                <div class="preview-content">
                    <h3>WhatsApp Group</h3>
                    <p>Join this WhatsApp group</p>
                    <div class="preview-url">
                        <span>${url.substring(0, 30)}${url.length > 30 ? '...' : ''}</span>
                    </div>
                    <div class="preview-status">
                        <span style="color: #c01c28;">⚠️ Failed to load preview image</span>
                    </div>
                </div>
            </div>
        `;
        
        return null;
    }
}

// Form Submission handler that uses the hidden input field for the image URL
const form = document.getElementById('groupForm');
if (form) {
    // Clone the form to remove any existing listeners
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    // Get necessary elements from the new form
    const newSubmitBtn = newForm.querySelector('.submit-btn');
    const newBtnText = newSubmitBtn?.querySelector('.btn-text');
    const newSpinner = newSubmitBtn?.querySelector('.loading-spinner');
    const newLinkInput = newForm.querySelector('#groupLink');
    
    // Re-attach the link preview handler to the new input
    if (newLinkInput) {
        // Debounce function to avoid too many API calls
        function debounce(func, wait) {
            let timeout;
            return function(...args) {
                const context = this;
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(context, args), wait);
            };
        }
        
        const handleNewLinkInput = debounce(async function() {
            const url = this.value ? this.value.trim() : '';
            const previewDiv = document.getElementById('preview');
            
            if (!previewDiv) return;
            
            if (!url) {
                previewDiv.innerHTML = '<p class="preview-tip">Paste a WhatsApp group link to see a preview</p>';
                // Also clear the hidden image URL field
                const imageUrlInput = document.getElementById('groupImageUrl');
                if (imageUrlInput) {
                    imageUrlInput.value = '';
                }
                return;
            }
            
            if (url.includes('chat.whatsapp.com/')) {
                await fetchLinkPreview(url, previewDiv);
            } else {
                previewDiv.innerHTML = '<p class="preview-tip">Enter a valid WhatsApp group link starting with https://chat.whatsapp.com/</p>';
                // Also clear the hidden image URL field
                const imageUrlInput = document.getElementById('groupImageUrl');
                if (imageUrlInput) {
                    imageUrlInput.value = '';
                }
            }
        }, 500);
        
        newLinkInput.addEventListener('input', handleNewLinkInput);
        newLinkInput.addEventListener('paste', () => {
            setTimeout(() => {
                handleNewLinkInput.call(newLinkInput);
            }, 100);
        });
        
        // Initial check if there's already a value
        if (newLinkInput.value) {
            setTimeout(() => {
                handleNewLinkInput.call(newLinkInput);
            }, 500);
        }
    }
    
    // Track if form submission is in progress
    let isSubmitting = false;
    
    // Form submission handler
    newForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Prevent double submissions
        if (isSubmitting) {
            console.log('[SUBMIT] Submission already in progress, ignoring duplicate');
            return;
        }
        
        console.log('[SUBMIT] Form submission started');
        isSubmitting = true;
        
        try {
            // Check if Firebase is initialized
            if (!window.db || !window.firebaseInitialized) {
                throw new Error("Database connection not ready. Please refresh the page and try again.");
            }
            
            // Update UI to show loading
            if (newBtnText && newSpinner) {
                newBtnText.style.display = 'none';
                newSpinner.style.display = 'inline-block';
            }
            
            if (newSubmitBtn) {
                newSubmitBtn.disabled = true;
            }
            
            // Get form values
            const titleInput = newForm.querySelector('#groupTitle');
            const linkInput = newForm.querySelector('#groupLink');
            const categoryInput = newForm.querySelector('#groupCategory');
            const countryInput = newForm.querySelector('#groupCountry');
            const descriptionInput = newForm.querySelector('#groupDescription');
            const imageUrlInput = newForm.querySelector('#groupImageUrl');
            
            const link = linkInput?.value?.trim() || '';
            const title = titleInput?.value?.trim() || 'WhatsApp Group';
            const category = categoryInput?.value || '';
            const country = countryInput?.value || '';
            const description = descriptionInput?.value?.trim() || 'Join this WhatsApp group';
            
            console.log('[SUBMIT] Form data collected:', { 
                title, 
                link, 
                category, 
                country,
                imageUrl: imageUrlInput?.value 
            });
            
            // Validate the link
            if (!isValidWhatsAppLink(link)) {
                throw new Error('Please enter a valid WhatsApp group link starting with https://chat.whatsapp.com/');
            }
            
            // Get the image URL from the hidden input field
            let imageUrl = imageUrlInput?.value || '';
            
            // If we don't have an image URL yet, try to fetch a preview first
            if (!imageUrl) {
                console.log('[SUBMIT] No image URL found, trying to fetch preview...');
                const previewDiv = document.getElementById('preview');
                if (previewDiv) {
                    await fetchLinkPreview(link, previewDiv);
                    // Try to get the image URL from the hidden input again
                    imageUrl = imageUrlInput?.value || '';
                }
            }
            
            // If still no image URL, use default WhatsApp logo
            if (!imageUrl) {
                console.warn('[SUBMIT] Still no image URL, using default WhatsApp logo');
                imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png';
            }
            
            console.log('[SUBMIT] Final image URL for submission:', imageUrl);
            
            // Prepare data for Firebase
            const groupData = {
                title: title,
                link: link,
                category: category,
                country: country,
                description: description,
                image: imageUrl, // Use the image URL from the hidden input
                timestamp: window.serverTimestamp(),
                views: 0
            };
            
            console.log('[SUBMIT] Saving group data to Firebase:', groupData);
            
            // Add to Firebase
            const docRef = await window.db.collection("groups").add(groupData);
            console.log("[SUBMIT] Document written with ID:", docRef.id);
            
            // Show success message
            showNotification('Group added successfully!', 'success');
            
            // Reset form and preview
            newForm.reset();
            
            const previewElement = document.getElementById('preview');
            if (previewElement) {
                previewElement.innerHTML = '<p class="preview-tip">Paste a WhatsApp group link to see a preview</p>';
            }
            
            // Also clear the hidden image URL field
            if (imageUrlInput) {
                imageUrlInput.value = '';
            }
            
        } catch (error) {
            console.error("[SUBMIT] Form submission error:", error);
            showNotification(error.message, 'error');
        } finally {
            // Reset UI
            if (newBtnText && newSpinner) {
                newBtnText.style.display = 'block';
                newSpinner.style.display = 'none';
            }
            if (newSubmitBtn) {
                newSubmitBtn.disabled = false;
            }
            isSubmitting = false;
        }
    });
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

// Make updateGroupViews available globally
window.updateGroupViews = updateGroupViews;

//stylish Text Generator tool js 
const input = document.getElementById("inputText");
const output = document.getElementById("output");

// Define character maps
const medievalMap = {
    'a': '𝖆', 'b': '𝖇', 'c': '𝖈', 'd': '𝖉', 'e': '𝖊', 'f': '𝖋', 'g': '𝖌', 'h': '𝖍',
    'i': '𝖎', 'j': '𝖏', 'k': '𝖐', 'l': '𝖑', 'm': '𝖒', 'n': '𝖓', 'o': '𝖔', 'p': '𝖕',
    'q': '𝖖', 'r': '𝖗', 's': '𝖘', 't': '𝖙', 'u': '𝖚', 'v': '𝖛', 'w': '𝖜', 'x': '𝖝',
    'y': '𝖞', 'z': '𝖟'
};

const fancyCharMap = {
    'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡', 'i': '𝐢',
    'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫',
    's': '𝐬', 't': '𝐭', 'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳'
};

const bubbleMap = {
    'a': 'ⓐ', 'b': 'ⓑ', 'c': 'ⓒ', 'd': 'ⓓ', 'e': 'ⓔ', 'f': 'ⓕ', 'g': 'ⓖ', 'h': 'ⓗ',
    'i': 'ⓘ', 'j': 'ⓙ', 'k': 'ⓚ', 'l': 'ⓛ', 'm': 'ⓜ', 'n': 'ⓝ', 'o': 'ⓞ', 'p': 'ⓟ',
    'q': 'ⓠ', 'r': 'ⓡ', 's': 'ⓢ', 't': 'ⓣ', 'u': 'ⓤ', 'v': 'ⓥ', 'w': 'ⓦ', 'x': 'ⓧ',
    'y': 'ⓨ', 'z': 'ⓩ'
};

const styles = {

    blank: s => '\u3164\u200E\u200D',
    fullBlank: s => s.replace(/\S/g, 'ㅤ‎‍'),
    neonGlow: s => `<span style="text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #0073e6, 0 0 20px #0073e6, 0 0 25px #0073e6">${s}</span>`,
    glitch: s => s.split('').map(c => `${c}҉`).join(''),
    gaming1: s => `꧁ ${s} ꧂`,
    gaming2: s => `▄︻デ ${s} ══━一`,
    gaming3: s => `★彡 ${s} 彡★`,
    matrix: s => `█▓▒░⡷⠂${s}⠐⢾░▒▓█`,
    aesthetic: s => s.split('').join(' '),
    vaporwave: s => s.split('').map(c => String.fromCharCode(0xFF00 + c.charCodeAt(0) - 0x20)).join(''),
    medieval: s => s.replace(/[A-Za-z]/g, c => medievalMap[c.toLowerCase()] || c),
    bubbles: s => s.replace(/[A-Za-z]/g, c => bubbleMap[c.toLowerCase()] || c),
    waves: s => s.split('').map(c => c + '〰️').join(''),
    reverse: s => s.split('').reverse().join(''),
    diamonds: s => `💎${s.split('').join('💎')}💎`,
    rainbow: s => s.split('').map((c, i) => 
        `<span style="color: hsl(${Math.floor(i * 360 / s.length)}, 100%, 50%)">${c}</span>`
    ).join(''),
    bold: s => s.replace(/[a-z]/gi, c => String.fromCodePoint(c.charCodeAt(0) + (c < 'a' ? 0x1D400 - 65 : 0x1D41A - 97))),
    italic: s => s.replace(/[a-z]/gi, c => String.fromCodePoint(c.charCodeAt(0) + (c < 'a' ? 0x1D434 - 65 : 0x1D44E - 97))),
    monospace: s => s.replace(/[a-z]/gi, c => String.fromCodePoint(c.charCodeAt(0) + (c < 'a' ? 0x1D670 - 65 : 0x1D68A - 97))),
    bubble: s => s.replace(/[a-z]/gi, c => "ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ"[c.toLowerCase().charCodeAt(0) - 97] || c),
    tiny: s => s.replace(/[a-z]/gi, c => ({a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'})[c.toLowerCase()] || c),
    upside: s => s.split('').reverse().map(c => ({a:'ɐ',b:'q',c:'ɔ',d:'p',e:'ǝ',f:'ɟ',g:'ƃ',h:'ɥ',i:'ᴉ',j:'ɾ',k:'ʞ',l:'ʃ',m:'ɯ',n:'u',o:'o',p:'d',q:'b',r:'ɹ',s:'s',t:'ʇ',u:'n',v:'ʌ',w:'ʍ',x:'x',y:'ʎ',z:'z'})[c.toLowerCase()] || c).join(''),
    circledLetters: s => s.replace(/[a-z]/gi, c => String.fromCharCode((c === c.toLowerCase() ? 0x24D0 : 0x24B6) + (c.toLowerCase().charCodeAt(0) - 97))),
    shadowText: s => `<span style="text-shadow: 3px 3px 5px rgba(0,0,0,0.5);">${s}</span>`,
    hollowText: s => `<span style="color: White; -webkit-background-clip: text; background: linear-gradient(45deg, #ff6ec7, #ff8a00); border: 2px solid #ff00ff; padding: 0 5px;">${s}</span>`,
    spaced: s => s.split('').join(' '),
    doubleStruck: s => s.replace(/[A-Za-z]/g, c => String.fromCharCode(c.charCodeAt(0) + 120205)),
    cursive: s => s.replace(/[A-Za-z]/g, c => String.fromCharCode(c.charCodeAt(0) + 119951)),
    circled: s => s.replace(/[A-Za-z]/g, c => String.fromCharCode((c.toLowerCase().charCodeAt(0) - 97) + 0x24D0)),
    squares: s => s.replace(/[A-Za-z]/g, c => String.fromCharCode((c.toLowerCase().charCodeAt(0) - 97) + 0x1F130)),
    
    fancy: s => s.replace(/[A-Za-z]/g, c => fancyCharMap[c.toLowerCase()] || c),
    hearts: s => `❤️${s.split('').join('❤️')}❤️`,
    sparkles: s => `✨${s.split('').join('✨')}✨`,
    fire: s => `🔥${s.split('').join('🔥')}🔥`,
    stars: s => `⭐${s.split('').join('⭐')}⭐`,
    
};


function generateBox(title, content) {
    const escapedContent = content
        .replace(/'/g, "\\'")
        .replace(/"/g, "&quot;");
        
    return `
        <div class="style-box">
            <strong>${title}</strong>
            <p class="stylized-text">${content}</p>
            <button class="copy-btn" data-text="${escapedContent}">
                <i class="fas fa-copy"></i> <span class="copy-text">Copy</span>
            </button>
        </div>
    `;
}

function copyToClipboard(text) {
    const plainText = text.replace(/<[^>]*>/g, '');
    const btn = event.target.closest('.copy-btn');
    const copyText = btn.querySelector('.copy-text');
    
    navigator.clipboard.writeText(plainText)
        .then(() => {
            copyText.textContent = 'Copied!';
            btn.style.background = 'linear-gradient(45deg, #25D366, #128C7E)';
            
            setTimeout(() => {
                copyText.textContent = 'Copy';
                btn.style.background = 'linear-gradient(45deg, #128C7E, #25D366)';
            }, 2000);
        })
        .catch(err => {
            console.error("Failed to copy:", err);
            alert("Failed to copy text");
        });
}

// Add click event listener for copy buttons
document.addEventListener('click', function(e) {
    if (e.target.closest('.copy-btn')) {
        const btn = e.target.closest('.copy-btn');
        copyToClipboard(btn.dataset.text);
    }
});

function generateStylishText(showAll = false) {
    const txt = input.value.trim();
    if (!txt) {
        output.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                Please enter some text first
            </div>
        `;
        return;
    }
    
    const styleEntries = Object.entries(styles);
    const stylesToShow = showAll ? styleEntries : styleEntries.slice(0, 6);
    
    let html = stylesToShow
        .map(([name, styleFn]) => generateBox(
            name.charAt(0).toUpperCase() + name.slice(1),
            styleFn(txt)
        ))
        .join('');

    if (!showAll && styleEntries.length > 6) {
        html += `
            <div style="grid-column: 1 / -1; text-align: center;">
                <button id="showMoreBtn" class="show-more-btn">
                    Show More Styles (${styleEntries.length - 6} more)
                </button>
            </div>
        `;
    }
    
    output.innerHTML = html;

    // Add event listener for show more button
    const showMoreBtn = document.getElementById('showMoreBtn');
    if (showMoreBtn) {
        showMoreBtn.style.display = 'block';
        showMoreBtn.addEventListener('click', () => generateStylishText(true));
    }
}

input.addEventListener("input", () => generateStylishText(false));
document.getElementById("generateBtn").addEventListener("click", () => generateStylishText(false));

// Add CSS styles
const style = document.createElement('style');
style.textContent = `
    .copy-notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        animation: slideIn 0.3s ease-out;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }

    @keyframes slideIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
    }

    .style-box:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 24px rgba(0,0,0,0.1);
    }
`;
document.head.appendChild(style);