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

// Fix createGroupCard function
function createGroupCard(group) {
    const card = document.createElement('div');
    card.className = 'group-card';
    
    card.innerHTML = `
        <img src="${group.image || 'https://via.placeholder.com/150'}" alt="${group.title}" onerror="this.src='https://via.placeholder.com/150'">
        <div class="group-badges">
            <span class="category-badge">${group.category || 'Uncategorized'}</span>
            <span class="country-badge">${group.country || 'Unknown'}</span>
        </div>
        <h3>${group.title}</h3>
        <p>${group.description}</p>
        <div class="card-actions">
            <a href="${group.link}" target="_blank" rel="noopener noreferrer" class="join-btn" onclick="updateGroupViews('${group.id}')">
                <i class="fab fa-whatsapp"></i> Join Group
            </a>
        </div>
    `;

    // Add click event for group details
    card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('join-btn')) {
            showGroupDetails(group);
        }
    });
    
    return card;
}

// Add function to show group details
function showGroupDetails(group) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close">&times;</button>
            <img src="${group.image || 'https://via.placeholder.com/150'}" alt="${group.title}">
            <h2>${group.title}</h2>
            <p>${group.description}</p>
            <div class="modal-actions">
                <a href="${group.link}" target="_blank" class="join-btn" onclick="updateGroupViews('${group.id}')">
                    <i class="fab fa-whatsapp"></i> Join Group
                </a>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);

    modal.querySelector('.modal-close').onclick = () => {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    };

    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    };
}

// ...rest of your existing code...

