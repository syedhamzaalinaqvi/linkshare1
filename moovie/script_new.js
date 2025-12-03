// TMDB API Configuration
const TMDB_API_KEY = "46d13701165988b5bb5fb4d123c0447e";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const API_BASE_URL = TMDB_BASE_URL;

// Application State
const appState = {
    loadedMovies: [],
    filteredVideos: [],
    currentCategory: 'all',
    searchQuery: '',
    currentView: 'grid'
};

// DOM Elements
const elements = {
    videosGrid: null,
    categoryFilters: null,
    searchInput: null,
    searchBtn: null,
    videoModal: null,
    modalOverlay: null,
    modalClose: null,
    modalPlayer: null,
    modalTitle: null,
    modalDuration: null,
    modalViews: null,
    modalCategory: null,
    modalYear: null,
    modalStatus: null,
    modalRating: null,
    modalDescription: null,
    loginBtn: null,
    loginOverlay: null,
    loginModalClose: null,
    mobileMenuBtn: null,
    tmdbDetails: null,
    trailerSection: null,
    trailerPlayer: null,
    castGrid: null
};

// Movie cache
const movieCache = new Map();

// Initialize DOM Elements
function initElements() {
    elements.videosGrid = document.getElementById('videosGrid');
    elements.categoryFilters = document.querySelectorAll('.filter-btn');
    elements.searchInput = document.getElementById('searchInput');
    elements.searchBtn = document.getElementById('searchBtn');
    elements.videoModal = document.getElementById('videoModal');
    elements.modalOverlay = document.getElementById('modalOverlay');
    elements.modalClose = document.getElementById('modalClose');
    elements.modalPlayer = document.getElementById('modalPlayer');
    elements.modalTitle = document.getElementById('modalTitle');
    elements.modalDuration = document.getElementById('modalDuration');
    elements.modalViews = document.getElementById('modalViews');
    elements.modalCategory = document.getElementById('modalCategory');
    elements.modalDescription = document.getElementById('modalDescription');
    elements.loginBtn = document.getElementById('loginBtn');
    elements.loginOverlay = document.getElementById('loginOverlay');
    elements.loginModalClose = document.getElementById('loginModalClose');
    elements.mobileMenuBtn = document.getElementById('mobileMenuBtn');
    elements.tmdbDetails = document.getElementById('tmdbDetails');
    elements.trailerSection = document.getElementById('trailerSection');
    elements.trailerPlayer = document.getElementById('trailerPlayer');
    elements.castGrid = document.getElementById('castGrid');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    try {
        console.log('Starting application initialization...');
        
        // Initialize DOM elements
        initElements();
        console.log('DOM elements initialized');
        
        // Initial state setup
        appState.loadedMovies = [...videoData];
        appState.filteredVideos = [...videoData];
        
        // Render initial videos
        renderVideos();
        console.log('Initial videos rendered');
        
        // Setup event listeners
        setupEventListeners();
        console.log('Event listeners set up');
        
        // Load dynamic content
        await Promise.all([
            loadMoviesWithTMDBData(),
            loadLiveTvSlider(),
            loadTrendingSlider()
        ]);
        
        console.log('H-TV Video Streaming Platform initialized successfully!');
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

// Load movies with TMDB data
async function loadMoviesWithTMDBData() {
    const updatedMovies = [];

    for (const video of videoData) {
        try {
            const tmdbData = await fetchTMDBData(video.tmdbId, video.type);
            if (tmdbData) {
                updatedMovies.push({
                    ...video,
                    title: tmdbData.title,
                    duration: tmdbData.runtime,
                    views: `${tmdbData.vote_average}★ TMDB`,
                    category: tmdbData.genres[0]?.toLowerCase() || 'drama',
                    thumbnail: tmdbData.poster_path,
                    description: tmdbData.overview,
                    tmdbData: tmdbData,
                });
            }
        } catch (error) {
            console.error(`Error loading movie ${video.id}:`, error);
            updatedMovies.push(video);
        }
    }

    if (updatedMovies.length > 0) {
        appState.loadedMovies = updatedMovies;
        appState.filteredVideos = [...updatedMovies];
        renderVideos();
    }
}

// Render videos grid
function renderVideos() {
    if (!elements.videosGrid) return;
    
    elements.videosGrid.innerHTML = '';
    
    if (appState.filteredVideos.length === 0) {
        elements.videosGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-secondary);">
                <h3>No videos found</h3>
                <p>Try adjusting your search or filter criteria.</p>
            </div>
        `;
        return;
    }

    appState.filteredVideos.forEach(video => {
        const videoCard = createVideoCard(video);
        elements.videosGrid.appendChild(videoCard);
    });
}

// Create video card
function createVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card';
    
    const tmdbData = video.tmdbData || {};
    const thumbnail = tmdbData.poster_path || video.thumbnail || 'path_to_default_thumbnail.jpg';
    const title = tmdbData.title || video.title || 'Untitled';
    const year = tmdbData.release_year || new Date(video.release_date || '').getFullYear() || '';
    const rating = tmdbData.vote_average ? `${tmdbData.vote_average}` : 'N/A';
    
    card.innerHTML = `
        <div class="video-thumbnail">
            <img src="${thumbnail}" alt="${title}" loading="lazy">
            ${rating !== 'N/A' ? `<div class="video-rating">⭐ ${rating}</div>` : ''}
        </div>
        <div class="video-info">
            <h3 class="video-title">${title}</h3>
            <div class="video-meta">
                ${year ? `<span class="video-year">${year}</span>` : ''}
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => openVideoModal(video));
    return card;
}

// Event listeners setup
function setupEventListeners() {
    // Category filters
    elements.categoryFilters?.forEach(btn => {
        btn.addEventListener('click', handleCategoryFilter);
    });

    // Search
    elements.searchBtn?.addEventListener('click', handleSearch);
    elements.searchInput?.addEventListener('input', handleSearch);

    // Modal
    elements.modalOverlay?.addEventListener('click', closeVideoModal);
    elements.modalClose?.addEventListener('click', closeVideoModal);

    // Keyboard events
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeVideoModal();
    });
}

// Video modal functions
function openVideoModal(video) {
    if (!elements.videoModal || !elements.modalTitle || !elements.modalDescription) return;
    
    elements.modalTitle.textContent = video.title || '';
    elements.modalDescription.textContent = video.description || '';
    elements.videoModal.classList.add('active');
    
    if (elements.modalPlayer && video.embedCode) {
        elements.modalPlayer.src = video.embedCode;
        elements.modalPlayer.style.display = 'block';
    }
    
    document.body.style.overflow = 'hidden';
}

function closeVideoModal() {
    if (!elements.videoModal || !elements.modalPlayer) return;
    
    elements.videoModal.classList.remove('active');
    elements.modalPlayer.src = '';
    elements.modalPlayer.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Category filter handler
function handleCategoryFilter(e) {
    const category = e.target.dataset.category;
    appState.currentCategory = category;
    
    elements.categoryFilters?.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });
    
    filterVideos();
}

// Search handler
function handleSearch() {
    appState.searchQuery = elements.searchInput?.value.toLowerCase().trim() || '';
    filterVideos();
}

// Filter videos
function filterVideos() {
    appState.filteredVideos = appState.loadedMovies.filter(video => {
        const matchesCategory = 
            appState.currentCategory === 'all' || 
            video.category === appState.currentCategory;
            
        const matchesSearch = 
            !appState.searchQuery || 
            video.title.toLowerCase().includes(appState.searchQuery) ||
            video.description?.toLowerCase().includes(appState.searchQuery);
            
        return matchesCategory && matchesSearch;
    });
    
    renderVideos();
}

// Fetch TMDB data
async function fetchTMDBData(tmdbId, type) {
    const cacheKey = `${type}_${tmdbId}`;
    if (movieCache.has(cacheKey)) {
        return movieCache.get(cacheKey);
    }
    
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/${type}/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=videos,credits`
        );
        
        if (!response.ok) throw new Error('TMDB API request failed');
        
        const data = await response.json();
        const formattedData = {
            title: data.title || data.name,
            overview: data.overview,
            release_date: data.release_date || data.first_air_date,
            poster_path: data.poster_path ? `${TMDB_IMAGE_BASE_URL}${data.poster_path}` : null,
            vote_average: data.vote_average?.toFixed(1),
            genres: data.genres?.map(g => g.name) || [],
            runtime: data.runtime ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m` : 'N/A'
        };
        
        movieCache.set(cacheKey, formattedData);
        return formattedData;
    } catch (error) {
        console.error('Error fetching TMDB data:', error);
        return null;
    }
}
