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
document.addEventListener('DOMContentLoaded', function() {
    try {
        if (typeof firebase === 'undefined') {
            console.error("Firebase SDK not loaded. Make sure you've included the Firebase scripts.");
            return;
        }

        // Only initialize once
        if (!firebase.apps || !firebase.apps.length) {
            const app = firebase.initializeApp(firebaseConfig);
            const analytics = firebase.analytics();
            console.log("Firebase app initialized");
        } else {
            console.log("Firebase already initialized");
        }
        
        const db = firebase.firestore();
        
        // Configure Firestore settings for better connectivity
        db.settings({
            cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
            merge: true
        });
        
        // Try to enable persistence with better error handling
        db.enablePersistence({ synchronizeTabs: false })
          .then(() => {
            console.log('✅ Firestore persistence enabled');
          })
          .catch(err => {
            if (err.code === 'failed-precondition') {
              console.warn('⚠️ Persistence failed: Multiple tabs open');
            } else if (err.code === 'unimplemented') {
              console.warn('⚠️ Persistence not supported in this browser');
            } else {
              console.warn('⚠️ Persistence setup failed:', err);
            }
          });
        
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
        
        // Test Firebase connection immediately
        console.log('🔍 Testing Firebase connection...');
        db.collection('groups').limit(1).get({ source: 'server' })
          .then(snapshot => {
            console.log('✅ Firebase connection successful!');
            console.log(`📊 Test query returned ${snapshot.size} documents`);
          })
          .catch(error => {
            console.error('❌ Firebase connection test failed:', error);
            console.log('🔄 Attempting to use cache...');
            return db.collection('groups').limit(1).get({ source: 'cache' });
          })
          .then(snapshot => {
            if (snapshot) {
              console.log(`📂 Cache query returned ${snapshot.size} documents`);
            }
          })
          .catch(cacheError => {
            console.error('❌ Cache also failed:', cacheError);
          });
        
        // Set flag to true
        window.firebaseInitialized = true;
        
        console.log("Firebase initialized successfully and global functions set");
        
<<<<<<< HEAD
        // If we're on the home page, start loading groups immediately
        if (document.querySelector('.groups-grid') && typeof loadGroups === 'function') {
            setTimeout(() => {
                loadGroups();
            }, 100);
        }
=======
        // Initialize loading when DOM is ready - but don't auto-load to prevent conflicts
        console.log("Firebase initialized - ready for manual loading");
>>>>>>> a746f97777ac15ef751e2f32c253550ee932efa6
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
