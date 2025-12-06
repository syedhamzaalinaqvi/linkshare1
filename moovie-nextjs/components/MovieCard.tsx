'use client';

import { useState } from 'react';

interface MovieCardProps {
    movie: {
        id: number;
        tmdb_id: number;
        type: 'movie' | 'tv';
        tmdbData?: {
            title?: string;
            name?: string;
            poster_path: string | null;
            vote_average: number;
            release_date?: string;
            first_air_date?: string;
        };
    };
    onClick: () => void;
}

export default function MovieCard({ movie, onClick }: MovieCardProps) {
    const [imageError, setImageError] = useState(false);

    const title = movie.tmdbData?.title || movie.tmdbData?.name || 'Loading...';
    const rating = movie.tmdbData?.vote_average?.toFixed(1) || 'N/A';
    const year = movie.tmdbData?.release_date?.substring(0, 4) ||
        movie.tmdbData?.first_air_date?.substring(0, 4) || '';
    const posterUrl = movie.tmdbData?.poster_path || '';

    return (
        <div
            onClick={onClick}
            className="group relative bg-gray-900 rounded-lg overflow-hidden cursor-pointer movie-card-hover shadow-lg hover:shadow-2xl hover:shadow-red-500/20"
        >
            {/* Poster Image */}
            <div className="relative aspect-[2/3] bg-gradient-to-b from-gray-800 to-gray-900 overflow-hidden">
                {posterUrl && !imageError ? (
                    <img
                        src={posterUrl}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={() => setImageError(true)}
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                        </svg>
                    </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Type Badge */}
                <div className="absolute top-2 right-2 px-2 py-1 bg-red-600 rounded text-xs font-bold uppercase shadow-lg">
                    {movie.type}
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 shadow-2xl">
                        <svg className="w-8 h-8 text-black ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Info Section */}
            <div className="p-3 bg-gradient-to-b from-gray-900 to-black">
                <h3 className="font-bold text-white text-sm md:text-base mb-2 line-clamp-2 group-hover:text-red-400 transition-colors">
                    {title}
                </h3>
                <div className="flex justify-between items-center text-xs md:text-sm">
                    <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {rating}
                    </span>
                    {year && <span className="text-gray-400">{year}</span>}
                </div>
            </div>
        </div>
    );
}
