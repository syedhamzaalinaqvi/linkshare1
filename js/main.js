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

// Function to display WhatsApp link preview without relying on external fetching
function showWhatsAppLinkPreview(url, previewContainer) {
    // Extract the invite code from the WhatsApp URL
    const inviteCode = url.split('chat.whatsapp.com/')[1]?.trim();
    
    if (!inviteCode) {
        previewContainer.innerHTML = '<p class="error">Invalid WhatsApp group invite link</p>';
        return;
    }
    
    // Use a reliable WhatsApp logo
    const whatsAppLogo = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png';
    
    // Create a visually appealing preview
    previewContainer.innerHTML = `
        <div class="link-preview">
            <div class="preview-header">
                <img src="${whatsAppLogo}" alt="WhatsApp Logo" class="preview-logo">
                <div class="preview-title">
                    <strong>WhatsApp Group Invite</strong>
                    <small>chat.whatsapp.com/${inviteCode.substring(0, 10)}${inviteCode.length > 10 ? '...' : ''}</small>
                </div>
            </div>
            <div class="preview-content">
                <p>Click to join this WhatsApp group</p>
                <div class="preview-invite">
                    <span class="invite-code">${inviteCode.substring(0, 6)}...${inviteCode.substring(inviteCode.length - 4)}</span>
                </div>
            </div>
            <div class="preview-footer">
                <span class="preview-status">✓ Valid WhatsApp invite link</span>
            </div>
        </div>
    `;
    
    // Add some inline styles for immediate visual feedback if the existing CSS doesn't have these classes
    const previewElement = previewContainer.querySelector('.link-preview');
    if (previewElement) {
        previewElement.style.border = '1px solid #25D366';
        previewElement.style.borderRadius = '8px';
        previewElement.style.padding = '12px';
        previewElement.style.backgroundColor = '#f5f5f5';
        previewElement.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    }
    
    const logoElement = previewContainer.querySelector('.preview-logo');
    if (logoElement) {
        logoElement.style.width = '48px';
        logoElement.style.height = '48px';
        logoElement.style.marginRight = '12px';
    }
    
    const headerElement = previewContainer.querySelector('.preview-header');
    if (headerElement) {
        headerElement.style.display = 'flex';
        headerElement.style.alignItems = 'center';
        headerElement.style.marginBottom = '12px';
    }
}

// Handle WhatsApp link input and preview - THIS MUST WORK IMMEDIATELY
const groupLinkInput = document.getElementById('groupLink');
if (groupLinkInput) {
    // Function to handle input
    function handleLinkInput() {
        const url = groupLinkInput.value ? groupLinkInput.value.trim() : '';
        const previewDiv = document.getElementById('preview');

        if (!previewDiv) return;

        // Clear the preview if empty
        if (!url) {
            previewDiv.innerHTML = '<p class="preview-tip">Paste a WhatsApp group link to see a preview</p>';
            return;
        }

        if (url.includes('chat.whatsapp.com/')) {
            console.log('Valid WhatsApp link detected, showing preview');
            // Show preview immediately without any async operations
            showWhatsAppLinkPreview(url, previewDiv);
        } else {
            previewDiv.innerHTML = '<p class="preview-tip">Enter a valid WhatsApp group link starting with https://chat.whatsapp.com/</p>';
        }
    }

    // Handle both input event and paste event for immediate response
    groupLinkInput.addEventListener('input', handleLinkInput);
    
    // Special handling for paste events for even faster response
    groupLinkInput.addEventListener('paste', (e) => {
        // Short timeout to let the paste complete
        setTimeout(handleLinkInput, 10);
    });
    
    // Initial check in case the field already has a value
    handleLinkInput();
}

// Form Submission handler
const form = document.getElementById('groupForm');
if (form) {
    // Remove any existing listeners to prevent duplicate submissions
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    // Re-get necessary elements from our new form
    const newSubmitBtn = newForm.querySelector('.submit-btn');
    const newBtnText = newSubmitBtn?.querySelector('.btn-text');
    const newSpinner = newSubmitBtn?.querySelector('.loading-spinner');
    
    // We need to reattach the link preview handler to the new input field
    const newLinkInput = newForm.querySelector('#groupLink');
    if (newLinkInput) {
        function handleNewLinkInput() {
            const url = newLinkInput.value ? newLinkInput.value.trim() : '';
            const previewDiv = document.getElementById('preview');
    
            if (!previewDiv) return;
    
            if (!url) {
                previewDiv.innerHTML = '<p class="preview-tip">Paste a WhatsApp group link to see a preview</p>';
                return;
            }
    
            if (url.includes('chat.whatsapp.com/')) {
                console.log('Valid WhatsApp link detected in new form, showing preview');
                showWhatsAppLinkPreview(url, previewDiv);
            } else {
                previewDiv.innerHTML = '<p class="preview-tip">Enter a valid WhatsApp group link starting with https://chat.whatsapp.com/</p>';
            }
        }
    
        newLinkInput.addEventListener('input', handleNewLinkInput);
        newLinkInput.addEventListener('paste', () => setTimeout(handleNewLinkInput, 10));
        
        // Initial check
        setTimeout(handleNewLinkInput, 50);
    }
    
    // Track if submission is in progress
    let isSubmitting = false;
    
    newForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Prevent double submissions
        if (isSubmitting) {
            console.log('Submission already in progress, ignoring duplicate');
            return;
        }
        
        console.log('Form submission started');
        isSubmitting = true;

        try {
            // Check if Firebase is initialized
            if (!window.db || !window.firebaseInitialized) {
                throw new Error("Database connection not ready. Please refresh the page and try again.");
            }
            
            if (newBtnText && newSpinner) {
                newBtnText.style.display = 'none';
                newSpinner.style.display = 'inline-block';
            }
            newSubmitBtn.disabled = true;

            // Get form values from our new form
            const titleInput = newForm.querySelector('#groupTitle');
            const linkInput = newForm.querySelector('#groupLink');
            const categoryInput = newForm.querySelector('#groupCategory');
            const countryInput = newForm.querySelector('#groupCountry');
            const descriptionInput = newForm.querySelector('#groupDescription');
            
            const link = linkInput?.value?.trim() || '';
            const title = titleInput?.value?.trim() || 'WhatsApp Group';
            const category = categoryInput?.value || '';
            const country = countryInput?.value || '';
            const description = descriptionInput?.value?.trim() || 'Join this WhatsApp group';
            
            console.log('Form data collected:', { title, link, category, country });
            
            if (!isValidWhatsAppLink(link)) {
                throw new Error('Please enter a valid WhatsApp group link starting with https://chat.whatsapp.com/');
            }
            
            // Always use our reliable WhatsApp image as the feature image
            const imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png';

            // Prepare group data with reliable image
            const groupData = {
                title: title,
                link: link,
                category: category,
                country: country,
                description: description,
                image: imageUrl,
                timestamp: window.serverTimestamp(),
                views: 0 // Initialize views counter
            };

            console.log('Adding group to database:', groupData);

            // Now add the document
            const docRef = await window.db.collection("groups").add(groupData);
            console.log("Document written with ID: ", docRef.id);
            
            // Show success message
            showNotification('Group added successfully!', 'success');
            newForm.reset();
            
            // Reset the preview
            const previewElement = document.getElementById('preview');
            if (previewElement) {
                previewElement.innerHTML = '<p class="preview-tip">Paste a WhatsApp group link to see a preview</p>';
            }

        } catch (error) {
            console.error("Form submission error:", error);
            showNotification(error.message, 'error');
        } finally {
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