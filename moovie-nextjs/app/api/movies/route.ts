import { NextResponse } from 'next/server';
import { getAllMovies, createMovie } from '@/lib/db';
import { fetchTMDBData } from '@/lib/tmdb';

// GET /api/movies - Get all movies with TMDB data
export async function GET() {
    try {
        const movies = await getAllMovies();

        // Fetch TMDB data for each movie
        const moviesWithTMDB = await Promise.all(
            movies.map(async (movie) => {
                const tmdbData = await fetchTMDBData(movie.tmdb_id, movie.type);
                return {
                    ...movie,
                    tmdbData,
                };
            })
        );

        return NextResponse.json(moviesWithTMDB);
    } catch (error) {
        console.error('Error fetching movies:', error);
        return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 });
    }
}

// POST /api/movies - Create new movie (admin only)
export async function POST(request: Request) {
    try {
        // Check authentication (simple check for now)
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { tmdb_id, type, downloads, embed_code } = body;

        if (!tmdb_id || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newMovie = await createMovie({
            tmdb_id,
            type,
            downloads: downloads || [],
            embed_code: embed_code || '',
        });

        return NextResponse.json(newMovie, { status: 201 });
    } catch (error) {
        console.error('Error creating movie:', error);
        return NextResponse.json({ error: 'Failed to create movie' }, { status: 500 });
    }
}
