# replit.md

## Overview

H-TV is a premium video streaming web application built as a modern, responsive single-page application. The project provides a Netflix-like interface for video content discovery and playback, featuring categories like educational, gaming, music, sports, and comedy content. The application uses YouTube embeds for video playback and focuses on delivering a sleek, dark-themed user experience with gradient accents.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Single Page Application (SPA)**: Built with vanilla HTML5, CSS3, and JavaScript without frameworks
- **Responsive Design**: Mobile-first approach with CSS Grid and Flexbox layouts
- **Component-based Structure**: Modular JavaScript approach with separate concerns for video data, UI interactions, and navigation
- **CSS Custom Properties**: Centralized theming system using CSS variables for consistent styling

### UI/UX Design Patterns
- **Dark Theme**: Primary dark color scheme with purple-pink gradient accents
- **Sticky Navigation**: Fixed header with backdrop blur effect for modern aesthetics
- **Card-based Layout**: Video content displayed in responsive card grids
- **Progressive Enhancement**: Core functionality works without JavaScript, enhanced with interactive features

### Data Management
- **TMDB Integration**: Videos stored as JavaScript objects with TMDB IDs for fetching real movie data
- **Client-side Filtering**: Category and search filtering implemented in JavaScript
- **Frontend API Calls**: Direct TMDB API integration using CORS proxy for real movie data
- **Pure Frontend**: No backend server required - all functionality runs client-side

### Video Integration
- **YouTube Embeds**: Uses YouTube's embed API for video playback
- **Thumbnail Integration**: Leverages YouTube thumbnail API for video previews
- **No Custom Video Hosting**: Relies entirely on YouTube infrastructure for media delivery

## External Dependencies

### API Services
- **TMDB (The Movie Database)**: Real movie and TV show data
  - Movie details, ratings, cast, crew information
  - Images and poster paths
  - Trending content and search
  - Accessed via CORS proxy for frontend compatibility
- **YouTube**: Primary video hosting and playback service
  - Embed API for video players
  - Trailer integration from TMDB video data
  - No authentication required for public videos

### Assets and Resources
- **External Thumbnails**: YouTube thumbnail URLs for video preview images
- **SVG Icons**: Inline SVG icons for search and navigation elements
- **Web Fonts**: System fonts (Arial) with fallbacks for cross-platform compatibility

### Browser APIs
- **CSS Custom Properties**: For theming and responsive design
- **Flexbox/Grid**: For layout management
- **DOM Manipulation**: Vanilla JavaScript for interactive features
- **Local Storage**: Potential for user preferences (implementation not visible in current code)

Note: The application is a pure frontend project with TMDB API integration for real movie data. No backend server required - all functionality runs client-side with external API calls handled via CORS proxy.