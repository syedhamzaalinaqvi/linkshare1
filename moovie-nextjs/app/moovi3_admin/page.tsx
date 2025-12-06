'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Movie {
    id: number;
    tmdb_id: number;
    type: 'movie' | 'tv';
    downloads: { url: string; label: string }[];
    embed_code: string;
}

export default function AdminPanel() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
    const router = useRouter();

    // Form state
    const [tmdbId, setTmdbId] = useState('');
    const [type, setType] = useState<'movie' | 'tv'>('movie');
    const [downloads, setDownloads] = useState<{ url: string; label: string }[]>([{ url: '', label: '' }]);
    const [embedCode, setEmbedCode] = useState('');

    useEffect(() => {
        checkAuth();
        fetchMovies();
    }, []);

    async function checkAuth() {
        try {
            const res = await fetch('/api/auth');
            if (!res.ok) {
                router.push('/moovi3_admin/login');
            }
        } catch {
            router.push('/moovi3_admin/login');
        }
    }

    async function fetchMovies() {
        try {
            const res = await fetch('/api/movies');
            const data = await res.json();
            setMovies(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const movieData = {
            tmdb_id: parseInt(tmdbId),
            type,
            downloads: downloads.filter(d => d.url && d.label),
            embed_code: embedCode,
        };

        try {
            const url = editingMovie ? `/api/movies/${editingMovie.id}` : '/api/movies';
            const method = editingMovie ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer admin', // Simple auth for now
                },
                body: JSON.stringify(movieData),
            });

            if (res.ok) {
                resetForm();
                fetchMovies();
            }
        } catch (error) {
            console.error('Error saving movie:', error);
        }
    }

    async function handleDelete(id: number) {
        if (!confirm('Are you sure you want to delete this movie?')) return;

        try {
            const res = await fetch(`/api/movies/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer admin' },
            });

            if (res.ok) {
                fetchMovies();
            }
        } catch (error) {
            console.error('Error deleting movie:', error);
        }
    }

    function resetForm() {
        setTmdbId('');
        setType('movie');
        setDownloads([{ url: '', label: '' }]);
        setEmbedCode('');
        setEditingMovie(null);
        setShowForm(false);
    }

    function editMovie(movie: Movie) {
        setTmdbId(movie.tmdb_id.toString());
        setType(movie.type);
        setDownloads(movie.downloads.length > 0 ? movie.downloads : [{ url: '', label: '' }]);
        setEmbedCode(movie.embed_code);
        setEditingMovie(movie);
        setShowForm(true);
    }

    function addDownloadField() {
        setDownloads([...downloads, { url: '', label: '' }]);
    }

    function removeDownloadField(index: number) {
        setDownloads(downloads.filter((_, i) => i !== index));
    }

    async function handleLogout() {
        await fetch('/api/auth', { method: 'DELETE' });
        router.push('/moovi3_admin/login');
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                        MOOVI3 Admin Panel
                    </h1>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/50 transition"
                        >
                            {showForm ? 'Cancel' : '+ Add Movie'}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-6 py-3 bg-gray-800 rounded-lg font-semibold hover:bg-gray-700 transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Add/Edit Form */}
                {showForm && (
                    <div className="bg-gray-800 rounded-lg p-6 mb-8">
                        <h2 className="text-2xl font-bold mb-6">{editingMovie ? 'Edit Movie' : 'Add New Movie'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">TMDB ID</label>
                                    <input
                                        type="number"
                                        value={tmdbId}
                                        onChange={(e) => setTmdbId(e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Type</label>
                                    <select
                                        value={type}
                                        onChange={(e) => setType(e.target.value as 'movie' | 'tv')}
                                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500"
                                    >
                                        <option value="movie">Movie</option>
                                        <option value="tv">TV Show</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Download Links</label>
                                {downloads.map((download, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input
                                            type="url"
                                            placeholder="Download URL"
                                            value={download.url}
                                            onChange={(e) => {
                                                const newDownloads = [...downloads];
                                                newDownloads[index].url = e.target.value;
                                                setDownloads(newDownloads);
                                            }}
                                            className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Label (e.g., S01 Hin/Eng)"
                                            value={download.label}
                                            onChange={(e) => {
                                                const newDownloads = [...downloads];
                                                newDownloads[index].label = e.target.value;
                                                setDownloads(newDownloads);
                                            }}
                                            className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500"
                                        />
                                        {downloads.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeDownloadField(index)}
                                                className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addDownloadField}
                                    className="mt-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
                                >
                                    + Add Download Link
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Embed Code (Optional)</label>
                                <textarea
                                    value={embedCode}
                                    onChange={(e) => setEmbedCode(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 h-24"
                                    placeholder="<iframe src=...></iframe>"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/50 transition"
                            >
                                {editingMovie ? 'Update Movie' : 'Add Movie'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Movies List */}
                <div className="bg-gray-800 rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-900">
                            <tr>
                                <th className="px-6 py-4 text-left">ID</th>
                                <th className="px-6 py-4 text-left">TMDB ID</th>
                                <th className="px-6 py-4 text-left">Type</th>
                                <th className="px-6 py-4 text-left">Downloads</th>
                                <th className="px-6 py-4 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">Loading...</td>
                                </tr>
                            ) : movies.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">No movies yet</td>
                                </tr>
                            ) : (
                                movies.map((movie) => (
                                    <tr key={movie.id} className="border-t border-gray-700 hover:bg-gray-700/50">
                                        <td className="px-6 py-4">{movie.id}</td>
                                        <td className="px-6 py-4">{movie.tmdb_id}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-gray-900 rounded-full text-sm uppercase">
                                                {movie.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{movie.downloads.length} links</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => editMovie(movie)}
                                                    className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(movie.id)}
                                                    className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
