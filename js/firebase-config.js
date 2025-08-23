//BACKUP of ORignal Add group Firebase initializng ===================
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

// Flag to track initialization status
window.firebaseInitialized = false;

// Initialize Firebase using regular script tags instead of modules
document.addEventListener('DOMContentLoaded', async function() {
    try {
        if (typeof firebase === 'undefined') {
            console.error("Firebase SDK not loaded. Make sure you've included the Firebase scripts.");
            return;
        }

        // Only initialize once
        let app;
        if (!firebase.apps || !firebase.apps.length) {
            app = firebase.initializeApp(firebaseConfig);
            const analytics = firebase.analytics();
            console.log("Firebase app initialized");
        } else {
            app = firebase.app();
            console.log("Firebase already initialized");
        }
        
        const db = firebase.firestore();
        
        // Configure Firestore with default settings and proper error handling
        try {
            // Enable persistence with synchronization between tabs
            await db.enablePersistence({ synchronizeTabs: true });
            console.log('Firestore persistence enabled with tab synchronization');
            
            // Set cache settings to balance between performance and freshness
            db.settings({
                cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
            });
            
        } catch (err) {
            console.warn('Could not enable Firestore persistence:', err);
            // Continue without persistence if it fails
        }
        
        // Make db and Firebase functions available globally
        window.db = db;
        window.collection = (path) => db.collection(path);
        window.getDocs = (query) => query.get();
        window.query = db;
        window.orderBy = (field, direction) => ({field, direction});
        window.where = (field, op, value) => ({field, op, value});
        window.startAfter = (doc) => ({doc});
        window.limit = (value) => ({value});
        window.doc = (collectionPath, id) => db.collection(collectionPath).doc(id);
        window.updateDoc = (ref, data) => ref.update(data);
        window.increment = (value) => firebase.firestore.FieldValue.increment(value);
        window.addDoc = (collectionRef, data) => collectionRef.add(data);
        window.serverTimestamp = () => firebase.firestore.FieldValue.serverTimestamp();
        
        // Set flag to true
        window.firebaseInitialized = true;
        
        console.log("Firebase initialized successfully and global functions set");
        
        // If we're on the home page, start loading groups immediately with current filters
        if (document.querySelector('.groups-grid') && typeof loadGroups === 'function') {
            setTimeout(() => {
                // Use current filter state if available, otherwise use defaults
                const currentTopic = window.currentTopic || 'all';
                const currentCountry = window.currentCountry || 'all';
                loadGroups(currentTopic, currentCountry);
            }, 100);
        }
    } catch (error) {
        console.error("Error initializing Firebase:", error);
        // Display error in UI if possible
        if (document.querySelector('.groups-grid')) {
            document.querySelector('.groups-grid').innerHTML = 
                `<div class="error">Error initializing Firebase: ${error.message}. 
                Please check your network connection and try again.</div>`;
        }
    }
});
