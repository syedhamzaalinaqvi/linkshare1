import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp, where, startAfter, limit, doc, updateDoc, increment, getDoc, onSnapshot, Timestamp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBL3wtzUezPymRqe1aADr9xpOEQE7ecqa4",
  authDomain: "linkshare-7037a.firebaseapp.com",
  projectId: "linkshare-7037a",
  storageBucket: "linkshare-7037a.appspot.com",
  messagingSenderId: "641686824241",
  appId: "1:641686824241:web:c510eb7691b273100d24f9",
  measurementId: "G-KESZWF9G4B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Global variables
const groupContainer = document.getElementById('groupArchive');
const filterButtons = document.querySelectorAll('.filter-btn');
const categoryButtons = document.querySelectorAll('.category-btn');
const searchInput = document.getElementById('searchGroups');
const topicFilters = document.getElementById('topicFilters');
const countryFilters = document.getElementById('countryFilters');
const POSTS_PER_PAGE = 15;
let lastDoc = null;
let currentTopic = 'all';
let currentCountry = 'all';

// ...rest of your original working code...

