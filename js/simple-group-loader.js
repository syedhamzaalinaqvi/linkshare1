/**
 * Simple Group Loader - Directly loads and displays groups from Firebase
 */

// Initialize Firebase if not already done
function ensureFirebaseInitialized() {
    if (typeof firebase === 'undefined' || !firebase.apps.length) {
        console.warn('Firebase not initialized, loading now...');
        // Load Firebase scripts if not already loaded
        const firebaseScript = document.createElement('script');
        firebaseScript.src = 'https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js';
        firebaseScript.onload = () => {
            const firestoreScript = document.createElement('script');
            firestoreScript.src = 'https://www.gstatic.com/firebasejs/8.10.0/firebase-firestore.js';
            firestoreScript.onload = initializeFirebase;
            document.head.appendChild(firestoreScript);
        };
        document.head.appendChild(firebaseScript);
        return false;
    }
    return true;
}

function initializeFirebase() {
    // Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyAOUI5JCbOa3ZnsZ_wXRFjv3-QfY0L8v-0",
        authDomain: "linkshare-5635c.firebaseapp.com",
        projectId: "linkshare-5635c",
        storageBucket: "linkshare-5635c.appspot.com",
        messagingSenderId: "119032426237",
        appId: "1:119032426237:web:98d085bd9bd1a63c1ed894",
        measurementId: "G-5VEQPNG163"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    window.db = firebase.firestore();
    
    // Start loading groups
    loadGroupsDirectly();
}

async function loadGroupsDirectly() {
    const groupsGrid = document.getElementById('groupsGrid');
    if (!groupsGrid) return;

    try {
        // Clear any existing content
        groupsGrid.innerHTML = '';
        
        // Get groups from Firestore
        const querySnapshot = await firebase.firestore()
            .collection('groups')
            .where('status', '==', 'approved')
            .orderBy('created_at', 'desc')
            .limit(50)
            .get();

        if (querySnapshot.empty) {
            groupsGrid.innerHTML = `
                <div class="empty-state">
                    <p>No groups found. Be the first to add one!</p>
                    <a href="/add-group" class="btn">Add Group</a>
                </div>`;
            return;
        }

        // Process and display groups
        querySnapshot.forEach(doc => {
            const group = { id: doc.id, ...doc.data() };
            const groupCard = createGroupCard(group);
            if (groupCard) {
                groupsGrid.appendChild(groupCard);
            }
        });

    } catch (error) {
        console.error('Error loading groups:', error);
        groupsGrid.innerHTML = `
            <div class="error-state">
                <p>Failed to load groups. Please refresh the page.</p>
                <button onclick="window.location.reload()" class="btn">Refresh Page</button>
            </div>`;
    }
}

function createGroupCard(group) {
    if (!group || !group.link) return null;
    
    const card = document.createElement('div');
    card.className = 'group-card';
    
    // Format date
    let dateDisplay = 'Recently added';
    if (group.created_at) {
        const date = group.created_at.toDate ? group.created_at.toDate() : new Date(group.created_at);
        dateDisplay = formatDate(date);
    }
    
    // Create card HTML
    card.innerHTML = `
        <div class="card-image">
            <img src="${group.image || '/favicon-96x96.png'}" 
                 alt="${group.title || 'Group'}" 
                 onerror="this.onerror=null; this.src='/favicon-96x96.png'">
        </div>
        <div class="group-badges">
            <span class="category-badge">${group.category || 'General'}</span>
            <span class="country-badge">${group.country || 'Global'}</span>
        </div>
        <h3>${group.title || 'Untitled Group'}</h3>
        <p>${group.description || 'Join our WhatsApp group'}</p>
        <div class="card-actions">
            <a href="${group.link}" target="_blank" rel="noopener" class="join-btn">
                <i class="fab fa-whatsapp"></i> Join Group
            </a>
        </div>
        <div class="card-footer">
            <div class="views-count">
                <i class="fas fa-eye"></i>
                <span>${group.views || 0}</span> views
            </div>
            <div class="date-added">${dateDisplay}</div>
        </div>`;
    
    return card;
}

function formatDate(date) {
    if (!(date instanceof Date)) return '';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (ensureFirebaseInitialized()) {
            loadGroupsDirectly();
        }
    });
} else {
    if (ensureFirebaseInitialized()) {
        loadGroupsDirectly();
    }
}
