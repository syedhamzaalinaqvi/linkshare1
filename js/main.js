import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, where, startAfter, limit } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
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
    return description;
}

// New COdium script to display cards
function createGroupCard(group) {
    const timeString = group.timestamp ? timeAgo(group.timestamp.seconds) : 'N/A';
    const truncatedDescription = truncateDescription(group.description);
  
    // Create the group card HTML
    const groupCard = `
      <div class="group-card">
        ${group.image ? `<img src="${group.image}" alt="${group.title}" onerror="this.src='https://via.placeholder.com/150'">` : ''}
        <h3>${group.title}</h3>
        <div class="group-badges">
          <span class="category-badge">${group.category}</span>
          <span class="country-badge">${group.country}</span>
        </div>
        <p>${truncatedDescription}</p>
  
        <div class="card-actions">
          <a href="${group.link}" target="_blank" rel="noopener noreferrer" class="join-btn whatsapp-style">
            <i class="fab fa-whatsapp"></i> Join Group
            <span class="whatsapp-icon-bg"></span>
          </a>
        </div>
        <div class="card-footer">
          <small><i class="far fa-clock"></i> ${timeString}</small>
        </div>
        <span><p>Views: <span class="view-count">0</span></p></span>
      </div>
    `;
  
    // Create a reference to the Firebase Realtime Database
    const postId = group.postId;
    const viewsRef = firebase.database().ref(`posts/${postId}/views`);
  
    // Initialize the view count
    viewsRef.on('value', (snapshot) => {
      const views = snapshot.val() || 0;
      document.querySelector(`.group-card .view-count`).textContent = views;
    });
  
    // Increment the view count when the group card is clicked
    const groupCardElement = document.querySelector('.group-card');
    groupCardElement.addEventListener('click', () => {
      viewsRef.transaction((currentViews) => {
        return (currentViews || 0) + 1;
      });
    });
  
    return groupCard;
  }
/*
function createGroupCard(group) {
    const timeString = group.timestamp ? timeAgo(group.timestamp.seconds) : 'N/A';
    const truncatedDescription = truncateDescription(group.description);
    
    // adding codeium view count code sccript

    const postCards = document.querySelectorAll('.post-card');
    postCards.forEach((postCard) => {
    const postId = postCard.getAttribute('data-post-id');
    const viewsRef = firebase.database().ref(`posts/${postId}/views`);
  
    postCard.addEventListener('click', () => {
      viewsRef.transaction((currentViews) => {
        return currentViews + 1;
      });
    });
  
    viewsRef.on('value', (snapshot) => {
      const views = snapshot.val();
      postCard.querySelector('.view-count').textContent = views;
    });
  });

//end codium script............  

    return `
        <div class="group-card">
            ${group.image ? `<img src="${group.image}" alt="${group.title}" onerror="this.src='https://via.placeholder.com/150'">` : ''}
            <h3>${group.title}</h3>
            <div class="group-badges">
                <span class="category-badge">${group.category}</span>
                <span class="country-badge">${group.country}</span>
            </div>
            <p>${truncatedDescription}</p>

            <div class="card-actions">
                <a href="${group.link}" target="_blank" rel="noopener noreferrer" class="join-btn whatsapp-style">
                    <i class="fab fa-whatsapp"></i> Join Group
                    <span class="whatsapp-icon-bg"></span>
                </a>
            </div>
            <div class="card-footer">
                <small><i class="far fa-clock"></i> ${timeString}</small>
            </div> <span><p>Views: <span class="view-count"> 1015 +</span></p></span>
        </div>
    `;
}
*/

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

async function loadGroups(filterTopic = 'all', filterCountry = 'all', loadMore = false) {
    if (!groupContainer) return;

    try {
        if (!loadMore) {
            groupContainer.innerHTML = '<div class="loading">Loading groups...</div>';
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

            //----------------------------NEW CODE: PLACE "LOAD MORE" BUTTON SEPARATELY
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
                     loadMoreBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Loading...`; // Show spinner
    		     loadMoreBtn.disabled = true; // Disable button during loading
                    
			await loadGroups(currentTopic, currentCountry, true); // Load more posts

                    loadMoreBtn.innerHTML = `Load More <i class="fas fa-chevron-down"></i>`; // Reset button text
		    loadMoreBtn.disabled = false; // Re-enable button

                    // Add fade-in animation to newly loaded posts
                    document.querySelectorAll('.group-item').forEach(item => {
                        item.classList.add('new-post');
                    });
                };

                // Append button wrapper AFTER the group container
                groupContainer.parentNode.appendChild(loadMoreWrapper);
            }
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
        groupContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading groups. Please try again later.</p>
            </div>
        `;
    }
}
/*
//----------------------------OLD CODE
            // Add Load More button if we got a full page
            if (groups.length === POSTS_PER_PAGE) {
                const loadMoreBtn = document.createElement('button');
                loadMoreBtn.className = 'load-more-btn';
                loadMoreBtn.innerHTML = `
                    Load More
                    <i class="fas fa-chevron-down"></i>
                `;
                loadMoreBtn.onclick = () => loadGroups(currentTopic, currentCountry, true);
                groupContainer.appendChild(loadMoreBtn);
            }

        } 
----------------------------------END*/
/*else {
            if (!loadMore) {
                groupContainer.innerHTML = `
                    <div class="no-groups">
                        <i class="fas fa-search" style="font-size: 3rem; color: var(--gray);"></i>
                        <p>No groups found matching your criteria</p>
                    </div>
                `;
            }
        }

  }   catch (error) {
        console.error('Error loading groups:', error);
        groupContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading groups. Please try again later.</p>
            </div>
        `;
    }
}

*/

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

