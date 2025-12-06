import { NextResponse } from 'next/server';
import { getMovieById, updateMovie, deleteMovie } from '@/lib/db';

// GET /api/movies/[id] - Get single movie
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const movie = await getMovieById(parseInt(id));

        if (!movie) {
            return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
        }

        return NextResponse.json(movie);
    } catch (error) {
        console.error('Error fetching movie:', error);
        return NextResponse.json({ error: 'Failed to fetch movie' }, { status: 500 });
    }
}

// PUT /api/movies/[id] - Update movie (admin only)
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Check authentication
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        const updatedMovie = await updateMovie(parseInt(id), body);

        if (!updatedMovie) {
            return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
        }

        return NextResponse.json(updatedMovie);
    } catch (error) {
        console.error('Error updating movie:', error);
        return NextResponse.json({ error: 'Failed to update movie' }, { status: 500 });
    }
}

// DELETE /api/movies/[id] - Delete movie (admin only)
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Check authentication
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const success = await deleteMovie(parseInt(id));

        if (!success) {
            return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting movie:', error);
        return NextResponse.json({ error: 'Failed to delete movie' }, { status: 500 });
    }
}
