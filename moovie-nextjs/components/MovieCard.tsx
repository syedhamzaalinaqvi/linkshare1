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
            className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/30 border border-gray-700 hover:border-red-500/50"
        >
            <div className="relative aspect-[2/3] bg-gray-900">
                {posterUrl && !imageError ? (
                    <img
                        src={posterUrl}
                        alt={title}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                        </svg>
                    </div>
                )}
                <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-semibold uppercase">
                    {movie.type}
                </div>
            </div>
            <div className="p-4">
                <h3 className="font-bold text-white text-lg mb-2 line-clamp-2">{title}</h3>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-yellow-400">⭐ {rating}</span>
                    {year && <span className="text-gray-400">{year}</span>}
                </div>
            </div>
        </div>
    );
}
