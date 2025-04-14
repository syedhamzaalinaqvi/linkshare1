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
        
        // Test connection to make sure permissions are working
        db.collection("groups").limit(1).get()
            .then(() => {
                console.log("Firestore connection successful - permissions verified");
            })
            .catch(error => {
                console.error("Firestore permission error:", error);
                // Display error notification if on the main page with groups
                if (document.querySelector('.groups-grid')) {
                    document.querySelector('.groups-grid').innerHTML = 
                        `<div class="error">Firebase database connection error: ${error.message}. 
                        Please check your network connection and try again.</div>`;
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