// Firebase configuration for Short URL Generator
const firebaseConfig = {
    apiKey: "AIzaSyB1Nejcpv0jubaq85ufjZwll-k62aIjFuQ",
    authDomain: "short-url-generator-9ab67.firebaseapp.com",
    databaseURL: "https://short-url-generator-9ab67-default-rtdb.firebaseio.com",
    projectId: "short-url-generator-9ab67",
    storageBucket: "short-url-generator-9ab67.firebasestorage.app",
    messagingSenderId: "375644970022",
    appId: "1:375644970022:web:be24008ed6f3a57a66dae7",
    measurementId: "G-1Q7PCGD8TM"
  };
// Flag to track initialization status
window.firebaseInitialized = false;

// Initialize Short URL Firebase app separately
let shortUrlApp;
if (!firebase.apps.some(app => app.name === "ShortURLApp")) {
    shortUrlApp = firebase.initializeApp(shortUrlFirebaseConfig, "ShortURLApp");
} else {
    shortUrlApp = firebase.app("ShortURLApp");
}

// Get Firestore for Short URL App
const shortUrlDb = shortUrlApp.firestore();