// TMDB API integration
const TMDB_API_KEY = process.env.TMDB_API_KEY || '46d13701165988b5bb5fb4d123c0447e';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export interface TMDBMovie {
    id: number;
    title: string;
    name?: string;
    overview: string;
    release_date?: string;
    first_air_date?: string;
    vote_average: number;
    runtime?: number;
    number_of_seasons?: number;
    genres: { id: number; name: string }[];
    poster_path: string | null;
    backdrop_path: string | null;
    status: string;
    tagline: string;
}

export async function fetchTMDBData(tmdbId: number, type: 'movie' | 'tv'): Promise<TMDBMovie | null> {
    try {
        const endpoint = type === 'movie' ? 'movie' : 'tv';
        const response = await fetch(
            `${TMDB_BASE_URL}/${endpoint}/${tmdbId}?api_key=${TMDB_API_KEY}&language=en-US`,
            { next: { revalidate: 3600 } } // Cache for 1 hour
        );

        if (!response.ok) {
            console.error(`TMDB API error: ${response.status}`);
            return null;
        }

        const data = await response.json();

        return {
            ...data,
            poster_path: data.poster_path ? `${TMDB_IMAGE_BASE_URL}${data.poster_path}` : null,
            backdrop_path: data.backdrop_path ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}` : null,
        };
    } catch (error) {
        console.error('Error fetching TMDB data:', error);
        return null;
    }
}

export async function fetchTrendingContent() {
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/trending/all/week?api_key=${TMDB_API_KEY}`,
            { next: { revalidate: 3600 } }
        );

        if (!response.ok) return [];

        const data = await response.json();
        return data.results.slice(0, 10);
    } catch (error) {
        console.error('Error fetching trending content:', error);
        return [];
    }
}
