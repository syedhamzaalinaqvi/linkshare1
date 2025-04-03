
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

// Initialize Firebase using regular script tags instead of modules
document.addEventListener('DOMContentLoaded', function() {
    try {
        const app = firebase.initializeApp(firebaseConfig);
        const analytics = firebase.analytics();
        const db = firebase.firestore();
        
        // Make db and Firebase functions available globally
        window.db = db;
        window.collection = firebase.firestore.collection;
        window.getDocs = (query) => query.get();
        window.query = (ref, ...constraints) => {
            let q = ref;
            constraints.forEach(constraint => {
                if (constraint.type === 'where') {
                    q = q.where(constraint._field.segments[0], constraint._op, constraint._value);
                } else if (constraint.type === 'orderBy') {
                    q = q.orderBy(constraint._field.segments[0], constraint._direction);
                } else if (constraint.type === 'startAfter') {
                    q = q.startAfter(constraint._value);
                } else if (constraint.type === 'limit') {
                    q = q.limit(constraint._value);
                }
            });
            return q;
        };
        window.orderBy = (field, direction) => ({
            _field: { segments: [field], offset: 0, len: 1 },
            _direction: direction,
            type: 'orderBy'
        });
        window.where = (field, op, value) => ({
            _field: { segments: [field], offset: 0, len: 1 },
            _op: op,
            _value: value,
            type: 'where'
        });
        window.startAfter = (doc) => ({
            _value: doc,
            type: 'startAfter'
        });
        window.limit = (value) => ({
            _value: value,
            type: 'limit'
        });
        window.doc = (db, path, id) => db.collection(path).doc(id);
        window.updateDoc = (ref, data) => ref.update(data);
        window.increment = (value) => firebase.firestore.FieldValue.increment(value);
        window.addDoc = (collectionRef, data) => collectionRef.add(data);
        window.serverTimestamp = () => firebase.firestore.FieldValue.serverTimestamp();
        
        console.log("Firebase initialized successfully");
    } catch (error) {
        console.error("Error initializing Firebase:", error);
    }
});
