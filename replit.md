# WhatsApp Group Hub

## Project Overview
A static HTML/CSS/JavaScript web application that serves as a WhatsApp Group Hub, allowing users to discover and join various WhatsApp groups. The application uses Firebase as the backend database and includes multiple utility tools.

## Architecture
- **Frontend**: Static HTML, CSS, and JavaScript files using modern ES6+ features
- **Backend**: Firebase Firestore for group data, Firebase Realtime Database for short URLs
- **Database**: 
  - Firebase Firestore: Groups collection with real-time data loading
  - Firebase Realtime Database: Short URL links with user management
- **Deployment**: Originally designed for Vercel hosting, now running on Replit with Flask server

## Key Features
- WhatsApp group discovery and joining
- Document converter tool
- QR code generator and reader
- M3U playlist viewer
- Mathematical problem solver
- Stylish text generator
- Short URL generator

## File Structure
- `main.py`: Main Flask application entry point
- `index.html`: Homepage
- Various feature directories with HTML, CSS, and JS files
- Static assets (CSS, JS, images)

## Configuration
- Flask app serves static files from root directory
- Configured for both development and production deployment
- Uses Gunicorn for production server

## Migration Status
✅ Migration completed successfully from Replit Agent to standard Replit environment.

## User Preferences
None specified yet.

## Recent Changes
- 2025-08-01: Initial migration from Replit Agent environment
- 2025-08-01: Fixed responsive grid layout issue - now shows minimum 2 columns on all mobile devices (340px+)
- 2025-08-01: Implemented progressive responsive grid system with optimized breakpoints
- 2025-08-01: Fixed card height issue - changed from 400px/450px to consistent 350px across all breakpoints
- 2025-08-01: Implemented 5px spacing between card elements (description, join button, view/time)
- 2025-08-01: Enhanced Add Group button - now large, centered, mobile-only with WhatsApp green styling
- 2025-08-01: Added centered Add Group button to join-group page, hidden on desktop (768px+)
- 2025-08-02: Fixed groups grid loading on homepage by removing duplicate Firebase configuration
- 2025-08-02: Added tools section mobile responsiveness with proper grid breakpoints
- 2025-08-02: Added URL Shortener card to tools section with orange gradient styling
- 2025-08-12: Completed migration from Replit Agent to standard Replit environment
- 2025-08-12: Verified Flask application running successfully with proper package dependencies
- 2025-08-12: Confirmed Firebase integration and frontend functionality working correctly