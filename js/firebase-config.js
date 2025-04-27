// Firebase configuration for LinkShare
const linkShareConfig = {
    apiKey: "AIzaSyAOUI5JCbOa3ZnsZ_wXRFjv3-QfY0L8v-0",
    authDomain: "linkshare-5635c.firebaseapp.com",
    projectId: "linkshare-5635c",
    storageBucket: "linkshare-5635c.appspot.com",
    messagingSenderId: "119032426237",
    appId: "1:119032426237:web:98d085bd9bd1a63c1ed894",
    measurementId: "G-5VEQPNG163"
};

// Firebase configuration for Short URL Generator
const shortUrlConfig = {
    apiKey: "YOUR_SHORT_URL_API_KEY", // Replace with your Short URL project's API key
    authDomain: "shorturl.firebaseapp.com", // Replace with your Short URL project's authDomain
    projectId: "shorturl", // Replace with your Short URL project's project ID
    storageBucket: "shorturl.appspot.com", // Replace with your Short URL project's storage bucket
    messagingSenderId: "YOUR_SENDER_ID", // Replace with your Short URL project's sender ID
    appId: "YOUR_APP_ID", // Replace with your Short URL project's app ID
    measurementId: "YOUR_MEASUREMENT_ID" // Replace with your Short URL project's measurement ID
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

        // Initialize Firebase for LinkShare
        if (!firebase.apps.length) {
            const linkShareApp = firebase.initializeApp(linkShareConfig, "linkshareApp");
            const analytics = firebase.analytics(linkShareApp);
            console.log("LinkShare Firebase app initialized");
        } else {
            console.log("LinkShare Firebase already initialized");
        }

        // Initialize Firebase for Short URL Generator
        const shortUrlApp = firebase.initializeApp(shortUrlConfig, "shortUrlApp");
        console.log("Short URL Generator Firebase app initialized");

        // Firestore for LinkShare
        const linkShareDb = linkShareApp.firestore();

        // Firestore for Short URL Generator
        const shortUrlDb = shortUrlApp.firestore();

        // Enable better offline support with cache for both databases
        linkShareDb.enablePersistence({ synchronizeTabs: true })
            .catch(err => handlePersistenceError(err, 'LinkShare'));
        
        shortUrlDb.enablePersistence({ synchronizeTabs: true })
            .catch(err => handlePersistenceError(err, 'Short URL Generator'));

        // Make db and Firebase functions available globally
        window.db = linkShareDb; // Default is for LinkShare, can be switched based on use
        window.collection = (path, isShortUrl = false) => {
            return (isShortUrl ? shortUrlDb : linkShareDb).collection(path);
        };
        window.getDocs = (query, isShortUrl = false) => query.get();
        window.query = linkShareDb;
        window.orderBy = (field, direction) => ({ field, direction });
        window.where = (field, op, value) => ({ field, op, value });
        window.startAfter = (doc) => ({ doc });
        window.limit = (value) => ({ value });
        window.doc = (collectionPath, id, isShortUrl = false) => (isShortUrl ? shortUrlDb : linkShareDb).collection(collectionPath).doc(id);
        window.updateDoc = (ref, data) => ref.update(data);
        window.increment = (value) => firebase.firestore.FieldValue.increment(value);
        window.addDoc = (collectionRef, data) => collectionRef.add(data);
        window.serverTimestamp = () => firebase.firestore.FieldValue.serverTimestamp();

        // Set flag to true
        window.firebaseInitialized = true;

        console.log("Firebase initialized successfully and global functions set");

        // If we're on the home page, start loading groups immediately
        if (document.querySelector('.groups-grid') && typeof loadGroups === 'function') {
            setTimeout(() => {
                loadGroups();
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

// Handle errors for enabling persistence
function handlePersistenceError(err, dbName) {
    if (err.code == 'failed-precondition') {
        console.log(`${dbName} persistence can only be enabled in one tab at a time.`);
    } else if (err.code == 'unimplemented') {
        console.log(`${dbName} persistence is not supported in this browser.`);
    }
}



//BACKUP of ORignal Add group Firebase initializng ===================
/*// Firebase configuration
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
        
        // Enable better offline support with cache
        db.enablePersistence({ synchronizeTabs: true })
          .catch(err => {
            if (err.code == 'failed-precondition') {
              console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
            } else if (err.code == 'unimplemented') {
              console.log('The current browser does not support all of the features required to enable persistence');
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
        
        // Set flag to true
        window.firebaseInitialized = true;
        
        console.log("Firebase initialized successfully and global functions set");
        
        // If we're on the home page, start loading groups immediately
        if (document.querySelector('.groups-grid') && typeof loadGroups === 'function') {
            setTimeout(() => {
                loadGroups();
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
*/