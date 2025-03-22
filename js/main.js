import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, where, startAfter, limit, doc, updateDoc, increment, getDoc, onSnapshot, Timestamp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { db } from './firebase-config.js';

// DOM Elements
const form = document.getElementById('groupForm');
const groupContainer = document.getElementById('groupArchive');
const searchInput = document.getElementById('searchGroups');
const filterButtons = document.querySelectorAll('.filter-btn');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const topicFilters = document.querySelector('#topicFilters');
const countryFilters = document.querySelector('#countryFilters');
const categoryButtons = document.querySelectorAll('.category-btn');

// Navigation Toggle
navToggle?.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Group Page Rendering
async function renderGroupPage(slug) {
    try {
        // Query Firestore for the group
        const groupsRef = collection(db, "groups");
        const q = query(groupsRef);
        const querySnapshot = await getDocs(q);

        let groupData = null;
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const groupSlug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            if (groupSlug === slug) {
                groupData = { id: doc.id, ...data };
            }
        });

        if (!groupData) {
            window.location.href = '/';
            return;
        }

        // Create and inject the HTML
        document.body.innerHTML = `
            <nav class="navbar">
                <div class="nav-brand">
                    <i class="fab fa-whatsapp"></i>
                    <span>WhatsApp Group Hub</span>
                </div>
                <button class="nav-toggle">
                    <i class="fas fa-bars"></i>
                </button>
                <ul class="nav-links">
                    <li><a href="/">Home</a></li>
                    <li><a href="/pages/about.html">About</a></li>
                    <li><a href="/pages/contact.html">Contact</a></li>
                    <li><a href="/pages/privacy.html">Privacy</a></li>
                    <li><a href="/pages/terms.html">Terms</a></li>
                </ul>
            </nav>

            <main class="container group-detail-page">
                <div class="group-header">
                    <div class="group-info">
                        <h1>${groupData.title}</h1>
                        <div class="group-meta">
                            <span class="category-badge">${groupData.category}</span>
                            <span class="country-badge">${groupData.country}</span>
                        </div>
                    </div>
                </div>

                <section class="group-content">
                    <div class="group-join-card">
                        <div class="group-card detail-view">
                            ${groupData.image ? `<img src="${groupData.image}" alt="${groupData.title}" onerror="this.src='https://via.placeholder.com/150'">` : ''}
                            <h3>${groupData.title}</h3>
                            <div class="group-badges">
                                <span class="category-badge">${groupData.category}</span>
                                <span class="country-badge">${groupData.country}</span>
                            </div>
                            <p>${groupData.description}</p>
                            <div class="card-actions">
                                <a href="${groupData.link}" target="_blank" rel="noopener noreferrer" class="join-btn whatsapp-style">
                                    <i class="fab fa-whatsapp"></i> Join WhatsApp Group
                                    <span class="whatsapp-icon-bg"></span>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div class="group-article">
                        <h2>About WhatsApp Groups</h2>
                        <h3>What is WhatsApp?</h3>
                        <p>WhatsApp is a popular messaging app that allows users to send messages, make voice and video calls, and share media with friends and family worldwide. It's used by over 2 billion people globally and is known for its end-to-end encryption and user-friendly interface.</p>

                        <h3>What are WhatsApp Groups?</h3>
                        <p>WhatsApp groups are communities within the WhatsApp platform where multiple users can interact together. They serve as virtual meeting spaces where people with common interests can share messages, media, and engage in discussions.</p>

                        <h3>Uses of WhatsApp Groups</h3>
                        <ul>
                            <li>Connecting with like-minded people in the ${groupData.category} community</li>
                            <li>Sharing updates and news related to ${groupData.category}</li>
                            <li>Organizing events and meetups</li>
                            <li>Learning from experts and enthusiasts</li>
                            <li>Networking with people from ${groupData.country}</li>
                        </ul>

                        <h3>Advantages of WhatsApp Groups</h3>
                        <ul>
                            <li>Free and easy communication with multiple people simultaneously</li>
                            <li>Share photos, videos, and documents instantly</li>
                            <li>Create focused communities around specific interests</li>
                            <li>Stay updated with real-time notifications</li>
                            <li>End-to-end encryption for secure communications</li>
                        </ul>

                        <h3>Why Join This Group?</h3>
                        <p>This ${groupData.category} group in ${groupData.country} offers a unique opportunity to connect with others who share your interests. You'll be able to participate in discussions, share knowledge, and stay updated with the latest developments in this field.</p>
                    </div>
                </section>
            </main>

            <footer class="footer">
                <div class="footer-content">
                    <div class="footer-section">
                        <h3>WhatsApp Group Hub</h3>
                        <p>Share and discover amazing WhatsApp groups</p>
                    </div>
                    <div class="footer-links">
                        <a href="/pages/about.html">About</a>
                        <a href="/pages/privacy.html">Privacy Policy</a>
                        <a href="/pages/terms.html">Terms</a>
                        <a href="/pages/contact.html">Contact</a>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>&copy; 2024 WhatsApp Group Hub. All rights reserved.</p>
                </div>
            </footer>

            <!-- Add structured data -->
            <script type="application/ld+json">
            {
                "@context": "https://schema.org",
                "@type": "WhatsAppGroup",
                "name": "${groupData.title}",
                "description": "${groupData.description}",
                "url": "${window.location.href}",
                "category": "${groupData.category}",
                "country": "${groupData.country}",
                "image": "${groupData.image || ''}",
                "dateCreated": "${groupData.timestamp?.toDate().toISOString() || new Date().toISOString()}",
                "interactionStatistic": {
                    "@type": "InteractionCounter",
                    "interactionType": "https://schema.org/ViewAction",
                    "userInteractionCount": ${groupData.views || 0}
                },
                "offers": {
                    "@type": "Offer",
                    "url": "${groupData.link}",
                    "price": "0",
                    "priceCurrency": "USD"
                }
            }
            </script>

            <script type="application/ld+json">
            {
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": "${groupData.title}",
                "description": "${groupData.description}",
                "image": "${groupData.image || ''}",
                "author": {
                    "@type": "Organization",
                    "name": "LinkShare",
                    "url": "https://www.linkshare.online"
                },
                "publisher": {
                    "@type": "Organization",
                    "name": "LinkShare",
                    "logo": {
                        "@type": "ImageObject",
                        "url": "https://www.linkshare.online/linkshare-favicon.png"
                    }
                },
                "datePublished": "${groupData.timestamp?.toDate().toISOString() || new Date().toISOString()}",
                "dateModified": "${groupData.timestamp?.toDate().toISOString() || new Date().toISOString()}"
            }
            </script>

            <script type="application/ld+json">
            {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "LinkShare",
                "url": "https://www.linkshare.online",
                "logo": "https://www.linkshare.online/linkshare-favicon.png",
                "sameAs": [
                    "https://www.linkshare.online/about",
                    "https://www.linkshare.online/contact"
                ],
                "description": "Share and discover WhatsApp group links. Join communities based on your interests, connect with like-minded people, and explore trending groups worldwide."
            }
            </script>
        `;

        // Reattach event listeners
        const newNavToggle = document.querySelector('.nav-toggle');
        const newNavLinks = document.querySelector('.nav-links');
        newNavToggle?.addEventListener('click', () => {
            newNavLinks.classList.toggle('active');
        });

    } catch (error) {
        console.error('Error rendering group page:', error);
        window.location.href = '/';
    }
}

// Handle client-side routing
function handleRoute() {
    const path = window.location.pathname;
    const groupMatch = path.match(/^\/group\/(.+)$/);

    if (groupMatch) {
        renderGroupPage(groupMatch[1]);
    }
}

// Listen for route changes
window.addEventListener('popstate', handleRoute);
handleRoute();

function truncateDescription(description, wordLimit = 20) {
    const words = description.split(' ');
    if (words.length > wordLimit) {
        return words.slice(0, wordLimit).join(' ') + '...';
    }
    // If description is shorter than 20 words, pad it with spaces to maintain consistent height
    return description + ' '.repeat(wordLimit - words.length);
}

// Function to update views count with click tracking
async function updateGroupViews(groupId) {
    try {
        // Get the current views count
        const groupRef = doc(db, "groups", groupId);
        const groupDoc = await getDoc(groupRef);
        const currentViews = groupDoc.data()?.views || 0;

        // Update views count in Firestore
        await updateDoc(groupRef, {
            views: increment(1),
            lastUpdated: serverTimestamp()
        });

        // Update the view count in the UI immediately
        const viewCountElement = document.querySelector(`[data-group-id="${groupId}"] .views-count`);
        if (viewCountElement) {
            viewCountElement.innerHTML = `<i class="far fa-eye" aria-hidden="true"></i> ${currentViews + 1}`;
        }

    } catch (error) {
        console.error("Error updating views:", error);
    }
}

// Function to generate URL-friendly slug
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// Function to create group detail page URL
function createGroupDetailUrl(group) {
    const slug = generateSlug(group.title);
    return `/group/${slug}`;
}

// Update createGroupCard function to add view tracking to join button
function createGroupCard(group) {
    const timeString = group.timestamp ? timeAgo(group.timestamp.seconds) : 'N/A';
    const truncatedDescription = truncateDescription(group.description);
    const views = group.views || 0;
    
    return `
        <div class="group-card" data-group-id="${group.id}">
            ${group.image ? `
                <img 
                    loading="lazy"
                    src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                    data-src="${group.image}"
                    alt="${group.title}"
                    class="lazy-image"
                    onerror="this.src='https://via.placeholder.com/150'"
                >
            ` : ''}
            <h3>${group.title}</h3>
            <div class="group-badges">
                <span class="category-badge"><i class="fas fa-tag"></i> ${group.category}</span>
                <span class="country-badge"><i class="fas fa-globe"></i> ${group.country}</span>
            </div>
            <p>${truncatedDescription}</p>

            <div class="card-actions">
                <a href="${group.link}" target="_blank" rel="noopener noreferrer" 
                   class="join-btn whatsapp-style" 
                   aria-label="Join ${group.title} WhatsApp group"
                   onclick="updateGroupViews('${group.id}')">
                    <i class="fab fa-whatsapp" aria-hidden="true"></i> Join Group
                    <span class="whatsapp-icon-bg"></span>
                </a>
            </div>
            <div class="card-footer">
                <small><i class="far fa-clock" aria-hidden="true"></i> ${timeString}</small>
                <small class="views-count"><i class="far fa-eye" aria-hidden="true"></i> ${views}</small>
            </div> 
        </div>
    `;
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

// Load Groups
let lastDoc = null;
const POSTS_PER_PAGE = 15;

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
            const groupsHTML = groups.map(group => createGroupCard(group)).join('');
            if (loadMore) {
                groupContainer.insertAdjacentHTML('beforeend', groupsHTML);
            } else {
                groupContainer.innerHTML = groupsHTML;
            }

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

                    // Add fade-in animation to newly loaded posts
                    document.querySelectorAll('.group-item').forEach(item => {
                        item.classList.add('new-post');
                    });
                };

                groupContainer.parentNode.appendChild(loadMoreWrapper);
            }

            // After rendering the cards, set up lazy loading and view tracking
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
        // More specific error message based on the error type
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
let currentTopic = 'all';
let currentCountry = 'all';

// Update filter event listeners
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

