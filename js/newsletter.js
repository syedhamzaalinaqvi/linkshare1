// Newsletter and Notification System

class Newsletter {
    constructor() {
        this.initialized = false;
        this.subscribers = new Set();
        this.form = null;
        this.emailInput = null;
        this.subscribeBtn = null;
        this.messageContainer = null;
        this.emailNotificationsCheckbox = null;
        this.pushNotificationsCheckbox = null;
    }

    async init() {
        if (this.initialized) return;

        // Initialize Firebase
        if (!firebase.apps.length) {
            firebase.initializeApp({
                apiKey: "YOUR_FIREBASE_API_KEY",
                authDomain: "YOUR_AUTH_DOMAIN",
                projectId: "YOUR_PROJECT_ID",
                messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
                appId: "YOUR_APP_ID"
            });
        }

        // Initialize Firebase Cloud Messaging
        this.messaging = firebase.messaging();
        
        // Load the newsletter template
        await this.loadNewsletterTemplate();
        
        // Initialize elements
        this.initializeElements();
        
        // Add event listeners
        this.addEventListeners();
        
        this.initialized = true;
    }

    async loadNewsletterTemplate() {
        try {
            const response = await fetch('/newsletter.html');
            const html = await response.text();
            
            // Create a custom element for the newsletter
            if (!customElements.get('news-letter')) {
                customElements.define('news-letter', class extends HTMLElement {
                    connectedCallback() {
                        this.innerHTML = html;
                    }
                });
            }
        } catch (error) {
            console.error('Error loading newsletter template:', error);
        }
    }

    initializeElements() {
        this.form = document.getElementById('newsletterForm');
        this.emailInput = document.getElementById('newsletterEmail');
        this.subscribeBtn = document.getElementById('subscribeBtn');
        this.messageContainer = document.getElementById('newsletterMessage');
        this.emailNotificationsCheckbox = document.getElementById('emailNotifications');
        this.pushNotificationsCheckbox = document.getElementById('pushNotifications');
    }

    addEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.pushNotificationsCheckbox.addEventListener('change', () => this.handlePushNotificationChange());
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const email = this.emailInput.value.trim();
        if (!this.validateEmail(email)) {
            this.showMessage('Please enter a valid email address.', 'error');
            return;
        }

        this.setLoading(true);

        try {
            // Subscribe to email notifications
            if (this.emailNotificationsCheckbox.checked) {
                await this.subscribeToEmailNotifications(email);
            }

            // Subscribe to push notifications
            if (this.pushNotificationsCheckbox.checked) {
                await this.subscribeToPushNotifications();
            }

            this.showMessage('Successfully subscribed to notifications!', 'success');
            this.emailInput.value = '';
        } catch (error) {
            console.error('Subscription error:', error);
            this.showMessage('An error occurred. Please try again later.', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async subscribeToEmailNotifications(email) {
        try {
            // Store subscriber in Firebase
            const subscribersRef = firebase.firestore().collection('subscribers');
            await subscribersRef.doc(email).set({
                email,
                subscribed: true,
                subscribedAt: firebase.firestore.FieldValue.serverTimestamp(),
                preferences: {
                    email: true,
                    push: this.pushNotificationsCheckbox.checked
                }
            });

            // Trigger welcome email using Cloud Functions
            const addSubscriberFunction = firebase.functions().httpsCallable('addSubscriber');
            await addSubscriberFunction({ email });

            this.subscribers.add(email);
            return true;
        } catch (error) {
            console.error('Email subscription error:', error);
            throw error;
        }
    }

    async subscribeToPushNotifications() {
        try {
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                const token = await this.messaging.getToken();
                
                // Store the token in Firebase
                const tokenRef = firebase.firestore().collection('push_tokens');
                await tokenRef.doc(token).set({
                    token,
                    email: this.emailInput.value,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                // Handle token refresh
                this.messaging.onTokenRefresh(async () => {
                    const newToken = await this.messaging.getToken();
                    await this.updatePushToken(newToken);
                });

                return true;
            } else {
                throw new Error('Push notification permission denied');
            }
        } catch (error) {
            console.error('Push subscription error:', error);
            throw error;
        }
    }

    async updatePushToken(newToken) {
        try {
            const tokenRef = firebase.firestore().collection('push_tokens');
            await tokenRef.doc(newToken).set({
                token: newToken,
                email: this.emailInput.value,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating push token:', error);
        }
    }

    async handlePushNotificationChange() {
        if (this.pushNotificationsCheckbox.checked) {
            try {
                await this.subscribeToPushNotifications();
            } catch (error) {
                this.pushNotificationsCheckbox.checked = false;
                this.showMessage('Failed to enable push notifications. Please try again.', 'error');
            }
        }
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    setLoading(isLoading) {
        if (isLoading) {
            this.subscribeBtn.classList.add('loading');
            this.subscribeBtn.disabled = true;
        } else {
            this.subscribeBtn.classList.remove('loading');
            this.subscribeBtn.disabled = false;
        }
    }

    showMessage(message, type) {
        this.messageContainer.textContent = message;
        this.messageContainer.className = 'message-container ' + type;
        setTimeout(() => {
            this.messageContainer.style.display = 'none';
        }, 5000);
    }
}

// Initialize the newsletter system
const newsletter = new Newsletter();
document.addEventListener('DOMContentLoaded', () => newsletter.init());
