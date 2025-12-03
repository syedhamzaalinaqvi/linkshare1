# 🎬 Featured Movie Configuration Guide

## How to Change Featured Movie/Series

### Method 1: Direct TMDB ID
In `script.js`, find this configuration and change the `tmdbId`:

```javascript
const FEATURED_MOVIE_CONFIG = {
    tmdbId: 1061474,    // Change this number
    type: "movie"       // "movie" or "tv"
};
```

### Method 2: Use Pre-configured Options
Uncomment the options section and choose from popular movies:

```javascript
// Uncomment these lines:
const FEATURED_MOVIE_OPTIONS = {
    superman: { tmdbId: 1061474, type: "movie" },
    venom: { tmdbId: 912649, type: "movie" },
    deadpool: { tmdbId: 533535, type: "movie" },
    batman: { tmdbId: 414906, type: "movie" },
    wednesday: { tmdbId: 119051, type: "tv" },
    stranger: { tmdbId: 66732, type: "tv" },
};

// Then use:
const FEATURED_MOVIE_CONFIG = FEATURED_MOVIE_OPTIONS.venom;
```

## Popular TMDB IDs

### Movies:
- **Superman (2025)**: 1061474
- **Deadpool & Wolverine**: 533535
- **Spider-Man: No Way Home**: 634649
- **The Batman**: 414906
- **Avatar 2**: 76600
- **Top Gun: Maverick**: 361743
- **Black Panther**: 284054

### TV Series:
- **Wednesday**: 119051
- **Stranger Things**: 66732
- **The Boys**: 76479
- **House of Dragon**: 94997
- **Peacemaker**: 110492

## What Gets Updated Automatically:
✅ Movie/Series Title  
✅ Release Year  
✅ Description  
✅ Runtime/Seasons  
✅ TMDB Rating  
✅ Genre  
✅ Official Trailer  
✅ Watch Now Button (opens detailed modal)  

## Example Changes:

**To feature Deadpool & Wolverine:**
```javascript
const FEATURED_MOVIE_CONFIG = {
    tmdbId: 533535,
    type: "movie"
};
```

**To feature Wednesday TV series:**
```javascript
const FEATURED_MOVIE_CONFIG = {
    tmdbId: 119051,
    type: "tv"
};
```

## Finding TMDB IDs:
1. Go to [themoviedb.org](https://themoviedb.org)
2. Search for your movie/series
3. The ID is in the URL: `themoviedb.org/movie/533535` → ID is `533535`

That's it! Just change the number and refresh the page! 🚀
