// TMDB API Configuration - direct frontend calls with CORS proxy
const TMDB_API_KEY = "46d13701165988b5bb5fb4d123c0447e";
const CORS_PROXY = "https://api.allorigins.win/raw?url=";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

// Video Data - Now supporting Movies/Series with TMDB integration
const videoData = [
    {
        id: 1,
        title: "Avengers: Endgame",
        duration: "181 min",
        views: "2.8B views",
        category: "action",
        tmdbId: 1061474,
        type: "movie",
        thumbnail:
            "https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_FMjpg_UY2048_.jpg",
        embedCode: `<iframe src="https://www.youtube.com/embed/TcMBFSGVi1c" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`,
        description:
            "The direct sequel to Avengers: Infinity War, the surviving members of the Avengers and their allies work to reverse the damage caused by Thanos.",
    },
    {
        id: 2,
        title: "Stranger Things",
        duration: "Season 1-4",
        views: "890M views",
        category: "horror",
        tmdbId: 1151334,
        type: "movie",
        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
        embedCode: `<iframe src="https://www.youtube.com/embed/StTqXEQ2l-Y" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`,
        description:
            "When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back.",
    },
    {
        id: 3,
        title: "Spider-Man: No Way Home",
        duration: "148 min",
        views: "1.9B views",
        category: "action",
        tmdbId: 634649,
        type: "movie",
        thumbnail: "https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg",
        embedCode: `<iframe src="https://www.youtube.com/embed/9bZkp7q19f0" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`,
        description:
            "With Spider-Man's identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds start to appear.",
    },
    {
        id: 4,
        title: "Football Highlights - Champions League",
        duration: "10:33",
        views: "3.2M views",
        category: "sports",
        thumbnail: "https://img.youtube.com/vi/kJQP7kiw5Fk/maxresdefault.jpg",
        embedCode: `<iframe src="https://www.youtube.com/embed/kJQP7kiw5Fk" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`,
        description:
            "The best moments from the latest Champions League matches.",
    },
    {
        id: 5,
        title: "Stand-up Comedy Special",
        duration: "22:45",
        views: "1.8M views",
        category: "comedy",
        thumbnail: "https://img.youtube.com/vi/DLzxrzFCyOs/maxresdefault.jpg",
        embedCode: `<iframe src="https://www.youtube.com/embed/DLzxrzFCyOs" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`,
        description:
            "Laugh out loud with this hilarious stand-up comedy performance.",
    },
    {
        id: 6,
        title: "Entertainment Tonight Special",
        duration: "18:20",
        views: "965K views",
        category: "entertainment",
        thumbnail: "https://img.youtube.com/vi/fJ9rUzIMcZQ/maxresdefault.jpg",
        embedCode: `<iframe src="https://www.youtube.com/embed/fJ9rUzIMcZQ" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`,
        description: "All the latest celebrity news and entertainment updates.",
    },
    {
        id: 7,
        title: "Learn JavaScript in 30 Minutes",
        duration: "30:15",
        views: "742K views",
        category: "educational",
        thumbnail: "https://img.youtube.com/vi/PkZNo7MFNFg/maxresdefault.jpg",
        embedCode: `<iframe src="https://www.youtube.com/embed/PkZNo7MFNFg" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`,
        description:
            "Complete JavaScript tutorial for beginners in just 30 minutes.",
    },
    {
        id: 8,
        title: "Best Gaming Setup 2024",
        duration: "14:52",
        views: "1.5M views",
        category: "gaming",
        thumbnail: "https://img.youtube.com/vi/Ks-_Mh1QhMc/maxresdefault.jpg",
        embedCode: `<iframe src="https://www.youtube.com/embed/Ks-_Mh1QhMc" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`,
        description:
            "Ultimate guide to building the perfect gaming setup in 2024.",
    },
    {
        id: 9,
        title: "Classical Music Collection",
        duration: "45:33",
        views: "890K views",
        category: "music",
        thumbnail: "https://img.youtube.com/vi/jgpJVI3tDbY/maxresdefault.jpg",
        embedCode: `<iframe src="https://www.youtube.com/embed/jgpJVI3tDbY" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`,
        description:
            "Beautiful collection of classical music for relaxation and focus.",
    },
    {
        id: 10,
        title: "Basketball Best Plays",
        duration: "9:28",
        views: "2.1M views",
        category: "sports",
        thumbnail: "https://img.youtube.com/vi/XBhY347jmgI/maxresdefault.jpg",
        embedCode: `<iframe src="https://www.youtube.com/embed/XBhY347jmgI" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`,
        description: "The most incredible basketball plays from this season.",
    },
    {
        id: 11,
        title: "Comedy Sketch Compilation",
        duration: "16:42",
        views: "3.4M views",
        category: "comedy",
        thumbnail: "https://img.youtube.com/vi/hFZFjoX2cGg/maxresdefault.jpg",
        embedCode: `<iframe src="https://www.youtube.com/embed/hFZFjoX2cGg" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`,
        description:
            "Hilarious sketch comedy compilation that will make you laugh.",
    },
    {
        id: 12,
        title: "Stranger Things",
        duration: "Season 1-4",
        views: "890M views",
        category: "horror",
        tmdbId: 1151334,
        type: "movie",
        thumbnail: "https://img.youtube.com/vi/C0DPdy98e4c/maxresdefault.jpg",
        embedCode: `<iframe src="https://www.youtube.com/embed/C0DPdy98e4c" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`,
        description:
            "Exclusive behind-the-scenes footage from the latest blockbuster movies.",
    },
];

// TMDB API Functions
async function fetchTMDBData(tmdbId, type) {
    try {
        const endpoint = type === "movie" ? "movie" : "tv";
        const response = await fetch(
            `${API_BASE_URL}/${endpoint}/${tmdbId}?append_to_response=credits,videos,release_dates`,
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Debug: log the raw TMDB response to see what we're getting
        console.log("🔍 Raw TMDB API response:", data);
        console.log("🔍 Credits data:", data.credits);
        console.log("🔍 Videos data:", data.videos);

        // Format the data to match our expected structure
        const formattedData = {
            id: data.id,
            title: data.title || data.name,
            description: data.overview,
            release_date: data.release_date || data.first_air_date,
            release_year:
                (data.release_date || data.first_air_date)?.substring(0, 4) ||
                "Unknown",
            rating: data.vote_average ? data.vote_average.toFixed(1) : null,
            runtime: data.runtime
                ? `${data.runtime} minutes`
                : data.number_of_seasons
                  ? `${data.number_of_seasons} seasons`
                  : "Unknown",
            genres: data.genres?.map((g) => g.name) || [],
            poster_path: data.poster_path
                ? `${TMDB_IMAGE_BASE_URL}${data.poster_path}`
                : null,
            backdrop_path: data.backdrop_path
                ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}`
                : null,
            status: data.status || "Unknown",
            tagline: data.tagline || "",
            homepage: data.homepage || "",
            budget: data.budget ? formatMoney(data.budget) : "Not disclosed",
            revenue: data.revenue ? formatMoney(data.revenue) : "Not disclosed",
            countries: data.production_countries?.map((c) => c.name) || [],
            directors: [],
            writers: [],
            creators: data.created_by?.map((c) => c.name) || [],
            cast: [],
            trailer: null,
        };

        // Extract crew information
        if (data.credits?.crew) {
            formattedData.directors = data.credits.crew
                .filter((p) => p.job === "Director")
                .map((p) => p.name);
            formattedData.writers = data.credits.crew
                .filter((p) =>
                    ["Writer", "Screenplay", "Story"].includes(p.job),
                )
                .map((p) => p.name);
        }

        // Extract cast information (top 12 for better display)
        if (data.credits?.cast) {
            formattedData.cast = data.credits.cast
                .slice(0, 12)
                .map((actor) => ({
                    name: actor.name,
                    character: actor.character,
                    profile_path: actor.profile_path
                        ? `${TMDB_IMAGE_BASE_URL}${actor.profile_path}`
                        : null,
                }));
        }

        // Find trailer (prioritize official trailers)
        if (data.videos?.results) {
            const trailers = data.videos.results.filter(
                (v) => v.type === "Trailer" && v.site === "YouTube",
            );
            const officialTrailer =
                trailers.find((v) =>
                    v.name.toLowerCase().includes("official"),
                ) || trailers[0];
            if (officialTrailer) {
                formattedData.trailer = `https://www.youtube.com/embed/${officialTrailer.key}`;
            }
        }

        return formattedData;
    } catch (error) {
        console.error("Error fetching movie data:", error);
        console.error("Error details:", error.message);
        console.error("URL attempted:", url);
        return null;
    }
}

function formatMoney(amount) {
    if (amount >= 1000000000) {
        return `$${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
        return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
        return `$${(amount / 1000).toFixed(1)}K`;
    } else {
        return amount > 0 ? `$${amount}` : "Not disclosed";
    }
}

async function fetchTrendingContent() {
    try {
        const response = await fetch(`${API_BASE_URL}/trending/all/week`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.results?.slice(0, 20) || [];
    } catch (error) {
        console.error("Error fetching trending data:", error);
        console.error("Error details:", error.message);
        return [];
    }
}

// Credits are now included in the main fetchTMDBData response
async function fetchTMDBCredits(tmdbId, type) {
    const data = await fetchTMDBData(tmdbId, type);
    return data ? { cast: data.cast, crew: [] } : null;
}

// Videos/trailers are now included in the main fetchTMDBData response
async function fetchTMDBVideos(tmdbId, type) {
    const data = await fetchTMDBData(tmdbId, type);
    return data && data.trailer
        ? {
              results: [
                  {
                      key: data.trailer.split("/").pop(),
                      site: "YouTube",
                      type: "Trailer",
                  },
              ],
          }
        : { results: [] };
}

function formatRuntime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

// Live TV Data
const liveTvChannels = [
    {
        id: "tv1",
        name: "News 24/7",
        channel: "CNN Live",
        thumbnail: "https://img.youtube.com/vi/W1NTtBs8M2Q/maxresdefault.jpg",
        embedCode: `<iframe src="https://www.youtube.com/embed/W1NTtBs8M2Q" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`,
    },
    {
        id: "tv2",
        name: "Sports Central",
        channel: "ESPN HD",
        thumbnail: "https://img.youtube.com/vi/kJQP7kiw5Fk/maxresdefault.jpg",
        embedCode: `<iframe src="https://www.youtube.com/embed/kJQP7kiw5Fk" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`,
    },
    {
        id: "tv3",
        name: "Music Hits",
        channel: "MTV Live",
        thumbnail: "https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg",
        embedCode: `<iframe src="https://www.youtube.com/embed/9bZkp7q19f0" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`,
    },
    {
        id: "tv4",
        name: "Comedy Central",
        channel: "Comedy HD",
        thumbnail: "https://img.youtube.com/vi/DLzxrzFCyOs/maxresdefault.jpg",
        embedCode: `<iframe src="https://www.youtube.com/embed/DLzxrzFCyOs" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`,
    },
    {
        id: "tv5",
        name: "Discovery Science",
        channel: "Discovery HD",
        thumbnail: "https://img.youtube.com/vi/PkZNo7MFNFg/maxresdefault.jpg",
        embedCode: `<iframe src="https://www.youtube.com/embed/PkZNo7MFNFg" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`,
    },
];

// DOM Elements
const videosGrid = document.getElementById("videosGrid");
const categoryFilters = document.querySelectorAll(".filter-btn");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const videoModal = document.getElementById("videoModal");
const modalOverlay = document.getElementById("modalOverlay");
const modalClose = document.getElementById("modalClose");
const modalPlayer = document.getElementById("modalPlayer");
const modalTitle = document.getElementById("modalTitle");
const modalDuration = document.getElementById("modalDuration");
const modalViews = document.getElementById("modalViews");
const modalCategory = document.getElementById("modalCategory");
const modalDescription = document.getElementById("modalDescription");
const loginBtn = document.getElementById("loginBtn");
const loginModal = document.getElementById("loginModal");
const loginOverlay = document.getElementById("loginOverlay");
const loginModalClose = document.getElementById("loginModalClose");
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const navMenu = document.getElementById("navMenu");
const navLinks = document.querySelectorAll(".nav-link");
const gridViewBtn = document.getElementById("gridViewBtn");
const listViewBtn = document.getElementById("listViewBtn");
const viewBtns = document.querySelectorAll(".view-btn");

// Global variables
let currentCategory = "all";
let searchQuery = "";
let filteredVideos = [...videoData];
let currentView = "grid";

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
    renderVideos();
    setupEventListeners();
    loadLiveTvSlider();
    loadTrendingSlider();
});

// Setup Event Listeners
function setupEventListeners() {
    // Category filters
    categoryFilters.forEach((btn) => {
        btn.addEventListener("click", handleCategoryFilter);
    });

    // Search functionality
    searchBtn.addEventListener("click", handleSearch);
    searchInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            handleSearch();
        }
    });
    searchInput.addEventListener("input", handleSearch);

    // Modal functionality
    modalOverlay.addEventListener("click", closeVideoModal);
    modalClose.addEventListener("click", closeVideoModal);

    // Login modal
    loginBtn.addEventListener("click", openLoginModal);
    loginOverlay.addEventListener("click", closeLoginModal);
    loginModalClose.addEventListener("click", closeLoginModal);

    // Mobile menu
    mobileMenuBtn.addEventListener("click", toggleMobileMenu);

    // Navigation links
    navLinks.forEach((link) => {
        link.addEventListener("click", handleNavigation);
    });

    // View toggle buttons
    viewBtns.forEach((btn) => {
        btn.addEventListener("click", handleViewToggle);
    });

    // Close modal on escape key
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            closeVideoModal();
            closeLoginModal();
        }
    });

    // Login form submission
    const loginForm = document.querySelector(".login-form form");
    loginForm.addEventListener("submit", handleLogin);
}

// Render Videos
function renderVideos() {
    videosGrid.innerHTML = "";

    if (filteredVideos.length === 0) {
        videosGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-secondary);">
                <h3>No videos found</h3>
                <p>Try adjusting your search or filter criteria.</p>
            </div>
        `;
        return;
    }

    filteredVideos.forEach((video) => {
        const videoCard = createVideoCard(video);
        videosGrid.appendChild(videoCard);
    });
}

// Create Video Card
function createVideoCard(video) {
    const card = document.createElement("div");
    card.className = "video-card";
    card.innerHTML = `
        <div class="video-thumbnail">
            <img src="${video.thumbnail}" alt="${video.title}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='">
            <div class="video-duration">${video.duration}</div>
        </div>
        <div class="video-info">
            <h3 class="video-title">${video.title}</h3>
            <div class="video-meta">
                <span class="video-views">${video.views}</span>
                <span class="video-category">${video.category}</span>
            </div>
        </div>
    `;

    card.addEventListener("click", () => openVideoModal(video));
    return card;
}

// Handle Category Filter
function handleCategoryFilter(e) {
    const selectedCategory = e.target.dataset.category;

    // Update active filter button
    categoryFilters.forEach((btn) => btn.classList.remove("active"));
    e.target.classList.add("active");

    currentCategory = selectedCategory;
    filterVideos();
}

// Handle Search
function handleSearch() {
    searchQuery = searchInput.value.toLowerCase().trim();
    filterVideos();
}

// Filter Videos
function filterVideos() {
    filteredVideos = videoData.filter((video) => {
        const matchesCategory =
            currentCategory === "all" || video.category === currentCategory;
        const matchesSearch =
            searchQuery === "" ||
            video.title.toLowerCase().includes(searchQuery) ||
            video.description.toLowerCase().includes(searchQuery) ||
            video.category.toLowerCase().includes(searchQuery);

        return matchesCategory && matchesSearch;
    });

    renderVideos();
}

// Open Video Modal
async function openVideoModal(video) {
    // Clear previous content and add the complete iframe
    modalPlayer.style.display = "none";
    const modalVideo = document.querySelector(".modal-video");
    modalVideo.innerHTML = video.embedCode;

    modalTitle.textContent = video.title;
    modalDuration.textContent = video.duration;
    modalViews.textContent = video.views;
    modalCategory.textContent = video.category;
    modalDescription.textContent = video.description;

    // Show loading state for TMDB details
    const tmdbDetails = document.getElementById("tmdbDetails");

    // If video has TMDB ID, fetch and display movie/series details
    if (video.tmdbId && video.type) {
        tmdbDetails.style.display = "block";
        tmdbDetails.innerHTML =
            '<div style="text-align: center; padding: 20px; color: var(--text-secondary);">Loading movie details...</div>';

        try {
            const movieData = await fetchTMDBData(video.tmdbId, video.type);
            if (movieData) {
                displayTMDBDetails(movieData, video.type);
            }
        } catch (error) {
            console.error("Error loading TMDB data:", error);
            tmdbDetails.innerHTML =
                '<div style="text-align: center; padding: 20px; color: var(--text-secondary);">Failed to load movie details</div>';
        }
    } else {
        tmdbDetails.style.display = "none";
    }

    videoModal.classList.add("active");
    document.body.style.overflow = "hidden";
}

// Display TMDB Details
function displayTMDBDetails(movieData, type) {
    console.log("🎬 Displaying movie details:", movieData);

    // Update basic meta info
    const modalYear = document.getElementById("modalYear");
    const modalStatus = document.getElementById("modalStatus");
    const modalRating = document.getElementById("modalRating");

    modalYear.textContent = movieData.release_year || "Unknown";
    modalStatus.textContent = movieData.status || "";
    modalRating.textContent = movieData.rating ? `⭐ ${movieData.rating}` : "";

    // Update modal title and description with fetched data
    document.getElementById("modalTitle").textContent = movieData.title;
    document.getElementById("modalDescription").textContent =
        movieData.description || "No description available.";

    // Create the complete movie information section with proper backend API structure
    const tmdbDetails = document.getElementById("tmdbDetails");
    tmdbDetails.innerHTML = `
        <div class="movie-info-header">
            <div class="download-section">
                <button class="download-btn" onclick="downloadMovie('${movieData.title}', '${movieData.release_year}', '${movieData.id}')">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7,10 12,15 17,10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Download Movie
                </button>
            </div>
        </div>

        <div class="movie-stats">
            <div class="stat-item">
                <label>Release Year:</label>
                <span>${movieData.release_year || "Unknown"}</span>
            </div>
            <div class="stat-item">
                <label>Runtime:</label>
                <span>${movieData.runtime || "Unknown"}</span>
            </div>
            <div class="stat-item">
                <label>Budget:</label>
                <span>${movieData.budget || "Not disclosed"}</span>
            </div>
            <div class="stat-item">
                <label>Revenue:</label>
                <span>${movieData.revenue || "Not disclosed"}</span>
            </div>
            <div class="stat-item">
                <label>Director:</label>
                <span>${movieData.directors?.join(", ") || movieData.creators?.join(", ") || "Unknown"}</span>
            </div>
            <div class="stat-item">
                <label>Writers:</label>
                <span>${movieData.writers?.join(", ") || "Unknown"}</span>
            </div>
            <div class="stat-item">
                <label>Countries:</label>
                <span>${movieData.countries?.join(", ") || "Unknown"}</span>
            </div>
            <div class="stat-item">
                <label>Genres:</label>
                <span>${movieData.genres?.join(", ") || "Unknown"}</span>
            </div>
        </div>
        
        ${
            movieData.cast && movieData.cast.length > 0
                ? `
        <div class="cast-section">
            <h4>🎭 Cast & Characters</h4>
            <div class="cast-grid">
                ${movieData.cast
                    .map(
                        (actor) => `
                    <div class="cast-member">
                        <img 
                            class="cast-photo" 
                            src="${actor.profile_path || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiMzMzMiLz4KPHR0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5OL0E8L3RleHQ+Cjwvc3ZnPg=="}" 
                            alt="${actor.name}"
                        >
                        <div class="cast-name">${actor.name}</div>
                        <div class="cast-character">${actor.character}</div>
                    </div>
                `,
                    )
                    .join("")}
            </div>
        </div>
        `
                : ""
        }
        
        ${
            movieData.trailer
                ? `
        <div class="trailer-section">
            <h4>🎬 Official Trailer</h4>
            <div class="trailer-player">
                <iframe 
                    src="${movieData.trailer}" 
                    frameborder="0" 
                    allowfullscreen>
                </iframe>
            </div>
        </div>
        `
                : ""
        }
        
        ${
            movieData.tagline
                ? `
        <div class="movie-tagline">
            <em>"${movieData.tagline}"</em>
        </div>
        `
                : ""
        }
    `;
}
// Close Video Modal
function closeVideoModal() {
    videoModal.classList.remove("active");
    // Clear the iframe content
    const modalVideo = document.querySelector(".modal-video");
    modalVideo.innerHTML =
        '<iframe id="modalPlayer" frameborder="0" allowfullscreen style="display: none;"></iframe>';
    document.body.style.overflow = "auto";
}

// Open Login Modal
function openLoginModal() {
    loginModal.classList.add("active");
    document.body.style.overflow = "hidden";
}

// Close Login Modal
function closeLoginModal() {
    loginModal.classList.remove("active");
    document.body.style.overflow = "auto";
}

// Handle Login
function handleLogin(e) {
    e.preventDefault();

    // Show loading state
    const submitBtn = e.target.querySelector(".login-submit-btn");
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<div class="loading"></div>';
    submitBtn.disabled = true;

    // Simulate login process
    setTimeout(() => {
        alert(
            "Login functionality is for demo purposes only. In a real application, this would authenticate with a server.",
        );
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        closeLoginModal();
    }, 2000);
}

// Toggle Mobile Menu
function toggleMobileMenu() {
    navMenu.classList.toggle("active");

    // Animate hamburger menu
    const spans = mobileMenuBtn.querySelectorAll("span");
    if (navMenu.classList.contains("active")) {
        spans[0].style.transform = "rotate(45deg) translate(5px, 5px)";
        spans[1].style.opacity = "0";
        spans[2].style.transform = "rotate(-45deg) translate(7px, -6px)";
    } else {
        spans[0].style.transform = "none";
        spans[1].style.opacity = "1";
        spans[2].style.transform = "none";
    }
}

// Handle View Toggle
function handleViewToggle(e) {
    const selectedView = e.target.dataset.view;

    // Update active view button
    viewBtns.forEach((btn) => btn.classList.remove("active"));
    e.target.classList.add("active");

    currentView = selectedView;

    // Toggle view class on videos grid
    if (selectedView === "list") {
        videosGrid.classList.add("list-view");
    } else {
        videosGrid.classList.remove("list-view");
    }
}

// Handle Navigation
function handleNavigation(e) {
    e.preventDefault();

    // Update active nav link
    navLinks.forEach((link) => link.classList.remove("active"));
    e.target.classList.add("active");

    // Close mobile menu if open
    navMenu.classList.remove("active");
    const spans = mobileMenuBtn.querySelectorAll("span");
    spans[0].style.transform = "none";
    spans[1].style.opacity = "1";
    spans[2].style.transform = "none";

    // Handle different sections
    const section = e.target.dataset.section;

    switch (section) {
        case "home":
            currentCategory = "all";
            searchQuery = "";
            searchInput.value = "";
            categoryFilters.forEach((btn) => {
                if (btn.dataset.category === "all") {
                    btn.classList.add("active");
                } else {
                    btn.classList.remove("active");
                }
            });
            filterVideos();
            break;

        case "categories":
            // Scroll to categories section
            document.querySelector(".filters-section").scrollIntoView({
                behavior: "smooth",
            });
            break;

        case "popular":
            // Sort by views (mock popular videos)
            filteredVideos = [...videoData].sort((a, b) => {
                const aViews = parseFloat(a.views);
                const bViews = parseFloat(b.views);
                return bViews - aViews;
            });
            renderVideos();
            break;

        case "search":
            // Focus search input
            searchInput.focus();
            break;
    }
}

// Smooth Scroll for Internal Links
document.addEventListener("click", function (e) {
    if (
        e.target.tagName === "A" &&
        e.target.getAttribute("href").startsWith("#")
    ) {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute("href"));
        if (target) {
            target.scrollIntoView({ behavior: "smooth" });
        }
    }
});

// Lazy Loading for Video Thumbnails
function lazyLoadImages() {
    const images = document.querySelectorAll(".video-thumbnail img");
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                observer.unobserve(img);
            }
        });
    });

    images.forEach((img) => imageObserver.observe(img));
}

// Initialize lazy loading after videos are rendered
const originalRenderVideos = renderVideos;
renderVideos = function () {
    originalRenderVideos();
    setTimeout(lazyLoadImages, 100);
};

// Add scroll effects
window.addEventListener("scroll", function () {
    const header = document.querySelector(".header");
    if (window.scrollY > 100) {
        header.style.background = "rgba(10, 10, 10, 0.98)";
    } else {
        header.style.background = "rgba(10, 10, 10, 0.95)";
    }
});

// Add some interactive effects
document.addEventListener("mousemove", function (e) {
    const cards = document.querySelectorAll(".video-card:hover");
    cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
    });
});

// Performance optimization: debounce search
let searchTimeout;
const originalHandleSearch = handleSearch;
handleSearch = function () {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(originalHandleSearch, 300);
};

// Load Live TV Slider
function loadLiveTvSlider() {
    const liveTvGrid = document.getElementById("liveTvGrid");
    if (!liveTvGrid) return;

    liveTvGrid.innerHTML = liveTvChannels
        .map(
            (channel) => `
        <div class="live-tv-card" onclick="openLiveTv('${channel.id}')">
            <div class="live-tv-thumbnail">
                <img src="${channel.thumbnail}" alt="${channel.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjExMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxpdmUgVFY8L3RleHQ+PC9zdmc+'">
                <div class="live-tv-status">LIVE</div>
            </div>
            <div class="live-tv-info">
                <div class="live-tv-title">${channel.name}</div>
                <div class="live-tv-channel">${channel.channel}</div>
            </div>
        </div>
    `,
        )
        .join("");

    setupSliderNavigation("liveTv");
}

// Load Trending Slider
async function loadTrendingSlider() {
    const trendingGrid = document.getElementById("trendingGrid");
    if (!trendingGrid) return;

    trendingGrid.innerHTML =
        '<div style="color: var(--text-secondary); padding: 20px;">Loading trending content...</div>';

    try {
        const trendingContent = await fetchTrendingContent();
        if (trendingContent && trendingContent.length > 0) {
            trendingGrid.innerHTML = trendingContent
                .slice(0, 20)
                .map((item) => {
                    const title = item.title || item.name;
                    const date = item.release_date || item.first_air_date;
                    const year = date ? new Date(date).getFullYear() : "";
                    const type = item.media_type;

                    return `
                    <div class="trending-card" onclick="openTrendingModal(${item.id}, '${type}')">
                        <div class="trending-thumbnail">
                            <img src="${item.poster_path ? TMDB_IMAGE_BASE_URL + item.poster_path : "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjIwIiBoZWlnaHQ9IjEyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=="}" alt="${title}">
                        </div>
                        <div class="trending-info">
                            <div class="trending-title">${title}</div>
                            <div class="trending-meta">
                                ${year} • ${type === "movie" ? "Movie" : "TV Series"}
                                ${item.vote_average ? `<span class="trending-rating">⭐ ${item.vote_average.toFixed(1)}</span>` : ""}
                            </div>
                        </div>
                    </div>
                `;
                })
                .join("");
        } else {
            trendingGrid.innerHTML =
                '<div style="color: var(--text-secondary); padding: 20px;">No trending content available</div>';
        }
    } catch (error) {
        console.error("Error loading trending content:", error);
        trendingGrid.innerHTML =
            '<div style="color: var(--text-secondary); padding: 20px;">Failed to load trending content</div>';
    }

    setupSliderNavigation("trending");
}

// Setup Slider Navigation
function setupSliderNavigation(sliderType) {
    const prevBtn = document.getElementById(sliderType + "Prev");
    const nextBtn = document.getElementById(sliderType + "Next");
    const grid = document.getElementById(sliderType + "Grid");

    if (!prevBtn || !nextBtn || !grid) return;

    prevBtn.addEventListener("click", () => {
        grid.scrollBy({ left: -300, behavior: "smooth" });
    });

    nextBtn.addEventListener("click", () => {
        grid.scrollBy({ left: 300, behavior: "smooth" });
    });
}

// Open Live TV
function openLiveTv(channelId) {
    const channel = liveTvChannels.find((ch) => ch.id === channelId);
    if (!channel) return;

    const liveVideoObj = {
        title: channel.name,
        duration: "LIVE",
        views: "Live Stream",
        category: "Live TV",
        embedCode: channel.embedCode,
        description: `Watch ${channel.name} live on ${channel.channel}`,
    };

    openVideoModal(liveVideoObj);
}

// Open Trending Modal
async function openTrendingModal(tmdbId, mediaType) {
    try {
        const movieData = await fetchTMDBData(tmdbId, mediaType);
        if (!movieData) return;

        const trendingVideoObj = {
            title: movieData.title || movieData.name,
            duration: movieData.runtime
                ? formatRuntime(movieData.runtime)
                : "N/A",
            views: movieData.popularity
                ? `${Math.round(movieData.popularity)}K views`
                : "N/A",
            category:
                movieData.genres && movieData.genres[0]
                    ? movieData.genres[0].name
                    : "Unknown",
            tmdbId: tmdbId,
            type: mediaType,
            embedCode: `<iframe src="https://bradm.ax/build/202410/09/10dddbda311d7cd7ad4cb3ee7ffaaa441bf5a620/index.html?mediaUrl=https%3A%2F%2Fmedia.tubewankers.com%2Fvideos%2Ftrending%2F${tmdbId}.mp4" width="100%" height="100%" frameBorder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`,
            description: movieData.overview || "No description available",
        };

        openVideoModal(trendingVideoObj);
    } catch (error) {
        console.error("Error opening trending modal:", error);
    }
}

console.log("H-TV Video Streaming Platform initialized successfully!");

// Download functionality
function downloadMovie(title, year, id) {
    const downloadInfo = `
🎬 Movie: ${title}
📅 Year: ${year}
⭐ Quality: HD Available
🆔 ID: ${id}

This download feature connects to your streaming service.
Click OK to proceed with download.`;

    if (confirm(`Download "${title}"?\n\n${downloadInfo}`)) {
        // Create download notification
        showDownloadNotification(title);

        // You can customize this to integrate with your actual download service
        console.log("🎬 Initiating download for:", title);

        // Example: Open in new tab (replace with your download logic)
        // window.open(`/download/${id}`, "_blank");
    }
}

// Download notification
function showDownloadNotification(title) {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = "download-notification";
    notification.innerHTML = `
        <div class="notification-content">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
            </svg>
            <span>Download started: ${title}</span>
        </div>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Show animation
    setTimeout(() => notification.classList.add("show"), 100);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}
