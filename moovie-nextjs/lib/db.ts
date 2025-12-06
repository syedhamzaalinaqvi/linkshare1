// Mock database - Replace with real Vercel Postgres later
// This stores movies in memory for testing

export interface Movie {
    id: number;
    tmdb_id: number;
    type: 'movie' | 'tv';
    downloads: { url: string; label: string }[];
    embed_code: string;
    created_at: string;
    updated_at: string;
}

// In-memory storage (will be replaced with real database)
let movies: Movie[] = [
    {
        id: 1,
        tmdb_id: 1246049,
        type: 'movie',
        downloads: [
            { url: 'https://linkmake.in/view/B05yw8ufD9', label: 'Hin/Eng' },
        ],
        embed_code: '<iframe src="https://ensta392zij.com/play/tt31434030" width="797" height="453" frameborder="0" allowfullscreen="allowfullscreen"></iframe>',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: 2,
        tmdb_id: 66732,
        type: 'tv',
        downloads: [
            { url: 'https://linkmake.in/view/7hH61pstIX', label: 'S01 Hin/Eng' },
            { url: 'https://linkmake.in/view/EpAizAKC2r', label: 'S02 Hin/Eng' },
            { url: 'https://linkmake.in/view/zQpGN5va3l', label: 'S03 Hin/Eng' },
            { url: 'https://linkmake.in/view/n32bRO4wOx', label: 'S04 Hin/Eng' },
            { url: 'https://linkmake.in/view/aReS4h8lnI', label: 'S05 Hin/Eng Vol. 1' },
        ],
        embed_code: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
];

let nextId = 3;

// Database functions
export async function getAllMovies(): Promise<Movie[]> {
    return movies;
}

export async function getMovieById(id: number): Promise<Movie | null> {
    return movies.find(m => m.id === id) || null;
}

export async function createMovie(data: Omit<Movie, 'id' | 'created_at' | 'updated_at'>): Promise<Movie> {
    const newMovie: Movie = {
        ...data,
        id: nextId++,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
    movies.push(newMovie);
    return newMovie;
}

export async function updateMovie(id: number, data: Partial<Omit<Movie, 'id' | 'created_at'>>): Promise<Movie | null> {
    const index = movies.findIndex(m => m.id === id);
    if (index === -1) return null;

    movies[index] = {
        ...movies[index],
        ...data,
        updated_at: new Date().toISOString(),
    };
    return movies[index];
}

export async function deleteMovie(id: number): Promise<boolean> {
    const index = movies.findIndex(m => m.id === id);
    if (index === -1) return false;

    movies.splice(index, 1);
    return true;
}

// Note: When you add Vercel Postgres, replace these functions with:
// import { sql } from '@vercel/postgres';
// Then use SQL queries instead of in-memory arrays
