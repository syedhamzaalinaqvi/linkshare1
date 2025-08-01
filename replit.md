# WhatsApp Group Hub

## Project Overview
A Flask web application that serves as a WhatsApp Group Hub, allowing users to discover and join various WhatsApp groups. The application includes multiple features like document conversion, QR code generation, M3U playlist viewing, and various utility tools.

## Architecture
- **Backend**: Flask web server serving static files and dynamic group pages
- **Frontend**: Static HTML, CSS, and JavaScript files
- **Database**: Not currently used, but configured for future expansion
- **Deployment**: Gunicorn WSGI server on port 5000

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
Currently migrating from Replit Agent to standard Replit environment.

## User Preferences
None specified yet.

## Recent Changes
- 2025-08-01: Initial migration from Replit Agent environment