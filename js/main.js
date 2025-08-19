// Global variables - using unified loader
let currentTopic = "all";
let currentCountry = "all";

// Function to create a group card with lazy loading
function createGroupCard(group) {
    const card = document.createElement("div");
    card.className = "group-card";
    card.setAttribute("data-group-id", group.id);
    // Let CSS handle all styling including responsive heights
    card.style.width = "100%";
    card.style.maxWidth = "100%";
    card.style.boxSizing = "border-box";

    // Handle timestamp display safely
    let timeDisplay = "Recently added";
    try {
        if (group.timestamp) {
            if (typeof group.timestamp === "object" && group.timestamp.toDate) {
                timeDisplay = timeAgo(group.timestamp.toDate());
            } else if (group.timestamp instanceof Date) {
                timeDisplay = timeAgo(group.timestamp);
            } else if (typeof group.timestamp === "number") {
                timeDisplay = timeAgo(new Date(group.timestamp));
            }
        }
    } catch (error) {
        console.error("Error formatting timestamp:", error);
    }

    // Check if the image URL is likely to cause CORS issues
    let imageUrl = "/favicon-96x96.png"; // Default fallback

    // If we have an image, check if it's a problematic source
    if (group.image) {
        // Check for common problematic domains that might cause 403 errors
        const problematicDomains = [
            "whatsapp.net",
            "fbcdn.net",
            "facebook.com",
            "cdninstagram.com",
            "fbsbx.com",
        ];

        const hasProblematicDomain = problematicDomains.some((domain) =>
            group.image.includes(domain),
        );

        if (hasProblematicDomain) {
            // Use reliable WhatsApp logo instead
            imageUrl =
                "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png";
        } else if (
            group.image.includes("wikipedia.org") ||
            group.image.includes("wikimedia.org")
        ) {
            // Trusted sources - use directly
            imageUrl = group.image;
        } else if (group.image.includes("chat.whatsapp.com")) {
            // Direct WhatsApp link - use logo
            imageUrl =
                "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png";
        } else {
            // For other sources, use but with good fallback
            imageUrl = group.image;
        }
    }

    // Create card with reliable image loading pattern
    card.innerHTML = `
        <div class="card-image">
            <img src="${imageUrl}" alt="${group.title || "Group"}" loading="lazy" 
                 onerror="this.onerror=null; this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png';">
        </div>
        <div class="group-badges">
            <span class="category-badge">${group.category || "Uncategorized"}</span>
            <span class="country-badge">${group.country || "Global"}</span>
        </div>
        <h3>${group.title || "Untitled Group"}</h3>
        <p>${group.description || "No description available"}</p>
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
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        if (totalGroups >= 12) {
            loadMoreBtn.style.display = 'block';
            loadMoreBtn.classList.remove("loading");
            loadMoreBtn.innerHTML = '<i class="fas fa-plus"></i> Load More Groups';
            loadMoreBtn.disabled = false;
        } else {
            loadMoreBtn.style.display = 'none';
        }
    }
}

// Main function to load groups from Firebase
async function loadGroups(
    filterTopic = "all", 
    filterCountry = "all",
    loadMore = false,
) {
    console.log(`🚀 Loading groups: topic=${filterTopic}, country=${filterCountry}, loadMore=${loadMore}`);
    
    const groupsGrid = document.getElementById('groupsGrid') || document.querySelector('.groups-grid');
    if (!groupsGrid) {
        console.error('Groups grid container not found');
        return;
    }

    // Show loading state if not loading more
    if (!loadMore) {
        groupsGrid.innerHTML = '<div class="loading-spinner">⏳ Loading groups...</div>';
    }

    try {
        // Wait for Firebase to be ready
        if (!window.firebaseInitialized || !window.db) {
            console.log('⏳ Waiting for Firebase initialization...');
            let attempts = 0;
            while ((!window.firebaseInitialized || !window.db) && attempts < 50) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            if (!window.firebaseInitialized || !window.db) {
                throw new Error('Firebase not available');
            }
        }

        // Build Firebase query
        let query = window.db.collection('groups');
        
        // Apply filters
        if (filterTopic !== 'all') {
            query = query.where('category', '==', filterTopic);
        }
        if (filterCountry !== 'all') {
            query = query.where('country', '==', filterCountry);
        }

        // Order by timestamp descending (newest first)
        query = query.orderBy('timestamp', 'desc');
        
        // Add pagination
        if (loadMore && window.lastDoc) {
            query = query.startAfter(window.lastDoc);
        }
        query = query.limit(12);

        // Execute query with better timeout and source handling
        console.log('🔄 Executing Firebase query...');
        let querySnapshot;
        try {
            // Try server first with 8 second timeout
            querySnapshot = await Promise.race([
                query.get({ source: 'server' }),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Server timeout')), 8000)
                )
            ]);
            console.log(`📦 Loaded ${querySnapshot.docs.length} groups from Firebase server`);
        } catch (serverError) {
            console.warn('⚠️ Server failed, trying cache:', serverError.message);
            try {
                querySnapshot = await query.get({ source: 'cache' });
                console.log(`📂 Loaded ${querySnapshot.docs.length} groups from Firebase cache`);
            } catch (cacheError) {
                console.error('❌ Both server and cache failed:', cacheError);
                throw new Error('Firebase completely unavailable');
            }
        }

        // Process results
        const groups = [];
        querySnapshot.forEach((doc) => {
            groups.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Apply search filter
        const searchInput = document.getElementById('searchInput') || document.getElementById('searchGroups');
        const searchTerm = searchInput?.value?.toLowerCase();
        const filteredGroups = searchTerm ? 
            groups.filter(group => 
                (group.title || '').toLowerCase().includes(searchTerm) ||
                (group.description || '').toLowerCase().includes(searchTerm)
            ) : groups;

        // Store last document for pagination
        if (querySnapshot.docs.length > 0) {
            window.lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        }

        // Render groups
        if (!loadMore) {
            groupsGrid.innerHTML = '';
        }

        if (filteredGroups.length === 0 && !loadMore) {
            groupsGrid.innerHTML = '<div class="no-groups">No groups found matching your criteria</div>';
            updateLoadMoreButton(0);
            return;
        }

        // Create and append group cards
        filteredGroups.forEach(group => {
            const card = createGroupCard(group);
            groupsGrid.appendChild(card);
        });

        // Update load more button
        updateLoadMoreButton(filteredGroups.length);
        
        console.log(`✅ Successfully displayed ${filteredGroups.length} groups (newest first)`);

    } catch (error) {
        console.error('❌ Error loading groups:', error);
        groupsGrid.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Unable to load groups. Please check your connection.</p>
                <button onclick="loadGroups('${filterTopic}', '${filterCountry}', false)" class="retry-btn">
                    <i class="fas fa-redo"></i> Try Again
                </button>
            </div>
        `;
    }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    // Initialize Firebase event listeners with retry mechanism
    const checkFirebaseAndInitialize = () => {
        if (window.firebaseInitialized) {
            console.log(
                "Firebase is initialized, proceeding with app initialization",
            );
            initializeApp();
        } else {
            console.log("Firebase not initialized yet, waiting...");
            setTimeout(checkFirebaseAndInitialize, 300);
        }
    };

    // Initialize app immediately
    setTimeout(checkFirebaseAndInitialize, 100);

    // Main app initialization
    function initializeApp() {
        // Initialize mobile menu
        const navToggle = document.querySelector(".nav-toggle");
        const navLinks = document.querySelector(".nav-links");

        if (navToggle && navLinks) {
            navToggle.addEventListener("click", (e) => {
                e.stopPropagation();
                navLinks.classList.toggle("active");
            });

            // Close menu when clicking outside
            document.addEventListener("click", (e) => {
                if (
                    navLinks.classList.contains("active") &&
                    !navLinks.contains(e.target) &&
                    e.target !== navToggle
                ) {
                    navLinks.classList.remove("active");
                }
            });
        }

        // Load groups on initial page load
        if (document.querySelector('.groups-grid')) {
            console.log('🚀 Starting initial group load...');
            setTimeout(() => {
                loadGroups('all', 'all', false);
            }, 200);
        }

        // Load More button click handler with enhanced animation
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener("click", (e) => {
                // Add loading class for animation
                loadMoreBtn.classList.add("loading");
                loadMoreBtn.innerHTML = '<i class="fas fa-sync fa-spin"></i> Loading...';
                loadMoreBtn.disabled = true;

                // Load more groups
                loadGroups(currentTopic, currentCountry, true);
            });
        }

        // Category buttons (top section)
        document.querySelectorAll(".category-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const category = btn.dataset.category;
                console.log("Category button clicked:", category);

                // Update UI
                document
                    .querySelectorAll(".category-btn")
                    .forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");

                // Update state and load groups
                currentTopic = category;
                window.currentTopic = category; // Store globally for Firebase config
                loadGroups(category, currentCountry, false);

                // Update dropdown to match selected category
                const dropdownBtn = document
                    .querySelector("#topicFilters")
                    ?.closest(".dropdown")
                    ?.querySelector(".dropdown-btn");
                if (dropdownBtn) {
                    dropdownBtn.innerHTML = `${btn.textContent.trim()} <i class="fas fa-chevron-down"></i>`;
                    // Also update the dropdown menu selection
                    const dropdownItem = document.querySelector(
                        `#topicFilters .filter-btn[data-category="${category}"]`,
                    );
                    if (dropdownItem) {
                        document
                            .querySelectorAll("#topicFilters .filter-btn")
                            .forEach((b) => b.classList.remove("active"));
                        dropdownItem.classList.add("active");
                    }
                }
            });
        });

        // Topic filter dropdown
        const topicFilters = document.querySelector("#topicFilters");
        if (topicFilters) {
            topicFilters.querySelectorAll(".filter-btn").forEach((btn) => {
                btn.addEventListener("click", () => {
                    const category = btn.dataset.category;
                    console.log("Topic filter clicked:", category);

                    // Update UI
                    topicFilters
                        .querySelectorAll(".filter-btn")
                        .forEach((b) => b.classList.remove("active"));
                    btn.classList.add("active");

                    // Update dropdown button text
                    const dropdownBtn = btn
                        .closest(".dropdown")
                        ?.querySelector(".dropdown-btn");
                    if (dropdownBtn) {
                        dropdownBtn.innerHTML = `${btn.textContent} <i class="fas fa-chevron-down"></i>`;
                    }

                    // Update state and load groups
                    currentTopic = category;
                    window.currentTopic = category; // Store globally for Firebase config
                    loadGroups(category, currentCountry, false);

                    // Close dropdown
                    btn.closest(".dropdown")?.classList.remove("active");

                    // Update category buttons to match
                    const categoryBtn = document.querySelector(
                        `.category-btn[data-category="${category}"]`,
                    );
                    if (categoryBtn) {
                        document
                            .querySelectorAll(".category-btn")
                            .forEach((b) => b.classList.remove("active"));
                        categoryBtn.classList.add("active");
                    }
                });
            });
        }

        // Country filter dropdown
        const countryFilters = document.querySelector("#countryFilters");
        if (countryFilters) {
            countryFilters.querySelectorAll(".filter-btn").forEach((btn) => {
                btn.addEventListener("click", () => {
                    const country = btn.dataset.country;
                    console.log("Country filter clicked:", country);

                    // Update UI
                    countryFilters
                        .querySelectorAll(".filter-btn")
                        .forEach((b) => b.classList.remove("active"));
                    btn.classList.add("active");

                    // Update dropdown button text
                    const dropdownBtn = btn
                        .closest(".dropdown")
                        ?.querySelector(".dropdown-btn");
                    if (dropdownBtn) {
                        dropdownBtn.innerHTML = `${btn.textContent} <i class="fas fa-chevron-down"></i>`;
                    }

                    // Update state and load groups
                    currentCountry = country;
                    window.currentCountry = country; // Store globally for Firebase config
                    loadGroups(currentTopic, country, false);

                    // Close dropdown
                    btn.closest(".dropdown")?.classList.remove("active");
                });
            });
        }

        // Dropdown toggle functionality
        document.querySelectorAll(".dropdown").forEach((dropdown) => {
            const btn = dropdown.querySelector(".dropdown-btn");
            if (!btn) return;

            // Toggle dropdown
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const wasActive = dropdown.classList.contains("active");

                // Close all dropdowns
                document
                    .querySelectorAll(".dropdown")
                    .forEach((d) => d.classList.remove("active"));

                // Toggle this dropdown
                if (!wasActive) {
                    dropdown.classList.add("active");
                }
            });
        });

        // Close dropdowns when clicking outside
        document.addEventListener("click", () => {
            document
                .querySelectorAll(".dropdown")
                .forEach((d) => d.classList.remove("active"));
        });

        // Search input listener
        const searchInput = document.getElementById('searchInput') || document.getElementById('searchGroups');
        if (searchInput) {
            searchInput.addEventListener(
                "input",
                debounce(() => {
                    loadGroups(currentTopic, currentCountry, false);
                }, 300),
            );
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
    const lazyImages = document.querySelectorAll(".lazy-image");

    if ("IntersectionObserver" in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove("lazy-image");
                    observer.unobserve(img);
                }
            });
        });

        lazyImages.forEach((img) => imageObserver.observe(img));
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        lazyImages.forEach((img) => {
            img.src = img.dataset.src;
            img.classList.remove("lazy-image");
        });
    }
}

// Global variable to store the current preview data and image URL
window.previewImageUrl = null;

// Enhanced function to fetch link preview using our Flask backend with multiple extraction methods
async function fetchLinkPreview(url, previewContainer) {
    // Reset the hidden input field for the image URL
    const imageUrlInput = document.getElementById("groupImageUrl");
    if (imageUrlInput) {
        imageUrlInput.value = "";
    }

    if (!url || !url.includes("chat.whatsapp.com/")) {
        previewContainer.innerHTML =
            '<p class="preview-tip">Enter a valid WhatsApp group link starting with https://chat.whatsapp.com/</p>';
        return null;
    }

    try {
        // Show loading indicator with improved styling
        previewContainer.innerHTML = `
            <div class="loading-preview">
                <div class="loading-spinner"></div>
                <p>Extracting group image and details...</p>
            </div>
        `;
        console.log("[FETCH] Starting enhanced preview fetch for:", url);

        // Call our Flask backend API for enhanced image extraction
        const response = await fetch('/api/extract-group-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url })
        });

        const result = await response.json();
        console.log("[FETCH] Backend API response:", result);

        let imageUrl, title, description;

        if (result.success) {
            imageUrl = result.image;
            title = result.title || "WhatsApp Group";
            description = result.description || "Join this WhatsApp group";
            console.log("[FETCH] Successfully extracted data via backend:", { imageUrl, title, description });
        } else {
            // If backend fails, fallback to Microlink API
            console.warn("[FETCH] Backend extraction failed, trying Microlink fallback:", result.error);
            
            const microlinkUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}`;
            const microlinkResponse = await fetch(microlinkUrl);
            const microlinkJson = await microlinkResponse.json();

            if (microlinkJson.status === "success") {
                const data = microlinkJson.data;
                title = data.title || "WhatsApp Group";
                description = data.description || "Join this WhatsApp group";
                
                // Find the best image to use in order of preference
                if (data.image && data.image.url) {
                    imageUrl = data.image.url;
                } else if (data.logo && data.logo.url) {
                    imageUrl = data.logo.url;
                } else if (data.screenshot && data.screenshot.url) {
                    imageUrl = data.screenshot.url;
                } else {
                    imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png";
                }
                
                console.log("[FETCH] Microlink fallback successful:", { imageUrl, title, description });
            } else {
                throw new Error("Both backend and Microlink APIs failed");
            }
        }

        // CRITICALLY IMPORTANT: Set the hidden input field value
        if (imageUrlInput) {
            imageUrlInput.value = imageUrl;
            console.log("[FETCH] Set hidden input field value to:", imageUrl);
        } else {
            console.error("[FETCH] Could not find the groupImageUrl hidden input field!");
        }

        // Create a visually appealing preview card with enhanced styling
        previewContainer.innerHTML = `
            <div class="link-preview enhanced">
                <div class="preview-image">
                    <img src="${imageUrl}" alt="${title}" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png'" />
                    <div class="image-overlay">
                        <i class="fab fa-whatsapp"></i>
                    </div>
                </div>
                <div class="preview-content">
                    <h3>${title}</h3>
                    <p>${description}</p>
                    <div class="preview-url">
                        <i class="fas fa-link"></i>
                        <span>${url.substring(0, 35)}${url.length > 35 ? "..." : ""}</span>
                    </div>
                    <div class="preview-status success">
                        <i class="fas fa-check-circle"></i>
                        <span>Group image extracted successfully</span>
                    </div>
                </div>
            </div>
        `;

        // Add enhanced responsive styles
        const previewElement = previewContainer.querySelector(".link-preview");
        if (previewElement) {
            Object.assign(previewElement.style, {
                display: "flex",
                flexDirection: "column",
                border: "1px solid #25D366",
                borderRadius: "12px",
                overflow: "hidden",
                maxWidth: "100%",
                backgroundColor: "#fff",
                boxShadow: "0 4px 16px rgba(37, 211, 102, 0.15)",
                transition: "all 0.3s ease"
            });
        }

        const imageContainer = previewContainer.querySelector(".preview-image");
        if (imageContainer) {
            Object.assign(imageContainer.style, {
                width: "100%",
                height: "200px",
                overflow: "hidden",
                backgroundColor: "#f5f5f5",
                position: "relative"
            });
        }

        const imageElement = previewContainer.querySelector(".preview-image img");
        if (imageElement) {
            Object.assign(imageElement.style, {
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.3s ease"
            });
        }

        const overlay = previewContainer.querySelector(".image-overlay");
        if (overlay) {
            Object.assign(overlay.style, {
                position: "absolute",
                top: "10px",
                right: "10px",
                backgroundColor: "rgba(37, 211, 102, 0.9)",
                color: "white",
                padding: "8px",
                borderRadius: "50%",
                fontSize: "14px"
            });
        }

        const contentElement = previewContainer.querySelector(".preview-content");
        if (contentElement) {
            Object.assign(contentElement.style, {
                padding: "16px"
            });
        }

        const statusElement = previewContainer.querySelector(".preview-status");
        if (statusElement) {
            Object.assign(statusElement.style, {
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#26a269",
                fontWeight: "500",
                fontSize: "14px",
                marginTop: "8px"
            });
        }

        return { title, description, imageUrl };
        
    } catch (error) {
        console.error("[FETCH] Error fetching link preview:", error);

        // Clear hidden input field on error
        if (imageUrlInput) {
            imageUrlInput.value = "";
        }

        // Show enhanced error preview
        previewContainer.innerHTML = `
            <div class="link-preview error">
                <div class="preview-image">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png" alt="WhatsApp" />
                    <div class="image-overlay error">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                </div>
                <div class="preview-content">
                    <h3>WhatsApp Group</h3>
                    <p>Join this WhatsApp group</p>
                    <div class="preview-url">
                        <i class="fas fa-link"></i>
                        <span>${url.substring(0, 35)}${url.length > 35 ? "..." : ""}</span>
                    </div>
                    <div class="preview-status error">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>Could not extract group image - using default</span>
                    </div>
                </div>
            </div>
        `;

        // Apply error-specific styles
        const previewElement = previewContainer.querySelector(".link-preview");
        if (previewElement) {
            Object.assign(previewElement.style, {
                border: "1px solid #dc3545",
                boxShadow: "0 4px 16px rgba(220, 53, 69, 0.15)"
            });
        }

        return null;
    }
}

// Form Submission handler that uses the hidden input field for the image URL
const form = document.getElementById("groupForm");
if (form) {
    // Clone the form to remove any existing listeners
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    // Get necessary elements from the new form
    const newSubmitBtn = newForm.querySelector(".submit-btn");
    const newBtnText = newSubmitBtn?.querySelector(".btn-text");
    const newSpinner = newSubmitBtn?.querySelector(".loading-spinner");
    const newLinkInput = newForm.querySelector("#groupLink");

    // Re-attach the link preview handler to the new input
    if (newLinkInput) {
        // Debounce function to avoid too many API calls
        function debounce(func, wait) {
            let timeout;
            return function (...args) {
                const context = this;
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(context, args), wait);
            };
        }

        const handleNewLinkInput = debounce(async function () {
            const url = this.value ? this.value.trim() : "";
            const previewDiv = document.getElementById("preview");

            if (!previewDiv) return;

            if (!url) {
                previewDiv.innerHTML =
                    '<p class="preview-tip">Paste a WhatsApp group link to see a preview</p>';
                // Also clear the hidden image URL field
                const imageUrlInput = document.getElementById("groupImageUrl");
                if (imageUrlInput) {
                    imageUrlInput.value = "";
                }
                return;
            }

            if (url.includes("chat.whatsapp.com/")) {
                await fetchLinkPreview(url, previewDiv);
            } else {
                previewDiv.innerHTML =
                    '<p class="preview-tip">Enter a valid WhatsApp group link starting with https://chat.whatsapp.com/</p>';
                // Also clear the hidden image URL field
                const imageUrlInput = document.getElementById("groupImageUrl");
                if (imageUrlInput) {
                    imageUrlInput.value = "";
                }
            }
        }, 500);

        newLinkInput.addEventListener("input", handleNewLinkInput);
        newLinkInput.addEventListener("paste", () => {
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
    newForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        // Prevent double submissions
        if (isSubmitting) {
            console.log(
                "[SUBMIT] Submission already in progress, ignoring duplicate",
            );
            return;
        }

        console.log("[SUBMIT] Form submission started");
        isSubmitting = true;

        try {
            // Check if Firebase is initialized
            if (!window.db || !window.firebaseInitialized) {
                throw new Error(
                    "Database connection not ready. Please refresh the page and try again.",
                );
            }

            // Update UI to show loading
            if (newBtnText && newSpinner) {
                newBtnText.style.display = "none";
                newSpinner.style.display = "inline-block";
            }

            if (newSubmitBtn) {
                newSubmitBtn.disabled = true;
            }

            // Get form values
            const titleInput = newForm.querySelector("#groupTitle");
            const linkInput = newForm.querySelector("#groupLink");
            const categoryInput = newForm.querySelector("#groupCategory");
            const countryInput = newForm.querySelector("#groupCountry");
            const descriptionInput = newForm.querySelector("#groupDescription");
            const imageUrlInput = newForm.querySelector("#groupImageUrl");

            const link = linkInput?.value?.trim() || "";
            const title = titleInput?.value?.trim() || "WhatsApp Group";
            const category = categoryInput?.value || "";
            const country = countryInput?.value || "";
            const description =
                descriptionInput?.value?.trim() || "Join this WhatsApp group";

            console.log("[SUBMIT] Form data collected:", {
                title,
                link,
                category,
                country,
                imageUrl: imageUrlInput?.value,
            });

            // Validate the link
            if (!isValidWhatsAppLink(link)) {
                throw new Error(
                    "Please enter a valid WhatsApp group link starting with https://chat.whatsapp.com/",
                );
            }

            // Get the image URL from the hidden input field
            let imageUrl = imageUrlInput?.value || "";

            // If we don't have an image URL yet, try to fetch a preview first
            if (!imageUrl) {
                console.log(
                    "[SUBMIT] No image URL found, trying to fetch preview...",
                );
                const previewDiv = document.getElementById("preview");
                if (previewDiv) {
                    await fetchLinkPreview(link, previewDiv);
                    // Try to get the image URL from the hidden input again
                    imageUrl = imageUrlInput?.value || "";
                }
            }

            // If still no image URL, use default WhatsApp logo
            if (!imageUrl) {
                console.warn(
                    "[SUBMIT] Still no image URL, using default WhatsApp logo",
                );
                imageUrl =
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png";
            }

            console.log("[SUBMIT] Final image URL for submission:", imageUrl);

            // Prepare data for Firebase
            const groupData = {
                title: title,
                link: link,
                category: category,
                country: country,
                description: description,
                image: imageUrl, // Use the image URL from the hidden input
                timestamp: window.serverTimestamp(),
                views: 0,
            };

            console.log("[SUBMIT] Saving group data to Firebase:", groupData);

            // Add to Firebase
            const docRef = await window.db.collection("groups").add(groupData);
            console.log("[SUBMIT] Document written with ID:", docRef.id);

            // Show success message
            showNotification("Group added successfully!", "success");

            // Reset form and preview
            newForm.reset();

            const previewElement = document.getElementById("preview");
            if (previewElement) {
                previewElement.innerHTML =
                    '<p class="preview-tip">Paste a WhatsApp group link to see a preview</p>';
            }

            // Also clear the hidden image URL field
            if (imageUrlInput) {
                imageUrlInput.value = "";
            }
        } catch (error) {
            console.error("[SUBMIT] Form submission error:", error);
            showNotification(error.message, "error");
        } finally {
            // Reset UI
            if (newBtnText && newSpinner) {
                newBtnText.style.display = "block";
                newSpinner.style.display = "none";
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
            <button onclick="loadGroups(currentTopic, currentCountry, false)" class="retry-btn">
                <i class="fas fa-redo"></i> Try Again
            </button>
        </div>
        `;
    }
}

// Utility Functions
function isValidWhatsAppLink(link) {
    return link && link.includes("chat.whatsapp.com/");
}

function showNotification(message, type) {
    const notification = document.createElement("div");
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
        if (interval > 1) return Math.floor(interval) + " years ago";

        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";

        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";

        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";

        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";

        return Math.floor(seconds) + " seconds ago";
    } catch (error) {
        console.error("Error calculating time ago:", error);
        return "Recently added";
    }
}

// Function to update group views
function updateGroupViews(groupId) {
    try {
        const groupRef = window.db.collection("groups").doc(groupId);
        groupRef.update({
            views: firebase.firestore.FieldValue.increment(1),
        });
        console.log("Group views updated");
    } catch (error) {
        console.error("Error updating group views:", error);
    }
}

// Make updateGroupViews available globally
window.updateGroupViews = updateGroupViews;
