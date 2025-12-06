'use client';

import { useEffect } from 'react';

interface MovieModalProps {
    movie: {
        id: number;
        tmdb_id: number;
        type: 'movie' | 'tv';
        downloads: { url: string; label: string }[];
        embed_code: string;
        tmdbData?: {
            title?: string;
            name?: string;
            overview?: string;
            backdrop_path?: string | null;
            poster_path?: string | null;
            vote_average?: number;
            release_date?: string;
            first_air_date?: string;
            runtime?: number;
            number_of_seasons?: number;
            genres?: { id: number; name: string }[];
        };
    };
    onClose: () => void;
}

export default function MovieModal({ movie, onClose }: MovieModalProps) {
    useEffect(() => {
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const title = movie.tmdbData?.title || movie.tmdbData?.name || 'Unknown Title';
    const backdrop = movie.tmdbData?.backdrop_path || movie.tmdbData?.poster_path;
    const rating = movie.tmdbData?.vote_average?.toFixed(1) || 'N/A';
    const year = movie.tmdbData?.release_date?.substring(0, 4) ||
        movie.tmdbData?.first_air_date?.substring(0, 4) || '';
    const genres = movie.tmdbData?.genres?.map(g => g.name).join(', ') || '';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fadeIn"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-gray-900 to-black rounded-2xl shadow-2xl animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/60 hover:bg-black/80 rounded-full transition-all duration-300 hover:scale-110"
                    aria-label="Close"
                >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Backdrop Image */}
                {backdrop && (
                    <div className="relative h-[400px] overflow-hidden rounded-t-2xl">
                        <img
                            src={backdrop}
                            alt={title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />

                        {/* Title Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-8">
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
                                {title}
                            </h2>
                            <div className="flex items-center gap-4 text-sm md:text-base">
                                <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    {rating}
                                </span>
                                {year && <span className="text-gray-300">{year}</span>}
                                <span className="px-3 py-1 bg-red-600 rounded text-white text-xs font-semibold uppercase">
                                    {movie.type}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="p-8">
                    {/* Embed Player */}
                    {movie.embed_code && (
                        <div className="mb-6 rounded-lg overflow-hidden bg-black">
                            <div
                                className="aspect-video"
                                dangerouslySetInnerHTML={{ __html: movie.embed_code }}
                            />
                        </div>
                    )}

                    {/* Overview */}
                    {movie.tmdbData?.overview && (
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-white mb-3">Overview</h3>
                            <p className="text-gray-300 leading-relaxed">{movie.tmdbData.overview}</p>
                        </div>
                    )}

                    {/* Genres */}
                    {genres && (
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-white mb-3">Genres</h3>
                            <div className="flex flex-wrap gap-2">
                                {movie.tmdbData?.genres?.map((genre) => (
                                    <span
                                        key={genre.id}
                                        className="px-4 py-2 bg-gray-800 rounded-full text-sm text-gray-300 border border-gray-700"
                                    >
                                        {genre.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Download Links */}
                    {movie.downloads && movie.downloads.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-white mb-3">Download Links</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {movie.downloads.map((download, idx) => (
                                    <a
                                        key={idx}
                                        href={download.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg font-semibold text-white text-center overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/50"
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            {download.label}
                                        </span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Additional Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Type</p>
                            <p className="text-white font-semibold capitalize">{movie.type}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Rating</p>
                            <p className="text-white font-semibold">{rating}/10</p>
                        </div>
                        {year && (
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Year</p>
                                <p className="text-white font-semibold">{year}</p>
                            </div>
                        )}
                        {movie.type === 'tv' && movie.tmdbData?.number_of_seasons && (
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Seasons</p>
                                <p className="text-white font-semibold">{movie.tmdbData.number_of_seasons}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
