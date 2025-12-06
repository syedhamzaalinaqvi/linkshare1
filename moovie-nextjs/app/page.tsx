'use client';

import { useState, useEffect } from 'react';
import MovieCard from '@/components/MovieCard';
import MovieModal from '@/components/MovieModal';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Movie {
  id: number;
  tmdb_id: number;
  type: 'movie' | 'tv';
  downloads: { url: string; label: string }[];
  embed_code: string;
  tmdbData?: any;
}

export default function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');

  useEffect(() => {
    fetchMovies();
  }, []);

  async function fetchMovies() {
    try {
      const res = await fetch('/api/movies');
      const data = await res.json();
      setMovies(data);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.tmdbData?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.tmdbData?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || movie.type === filterType;
    return matchesSearch && matchesType;
  });

  // Get featured movie (first movie with backdrop)
  const featuredMovie = movies.find(m => m.tmdbData?.backdrop_path) || movies[0];

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      {/* Hero Section - Netflix Style */}
      {featuredMovie && featuredMovie.tmdbData && (
        <div className="relative h-[70vh] md:h-[85vh] overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={featuredMovie.tmdbData.backdrop_path || featuredMovie.tmdbData.poster_path}
              alt={featuredMovie.tmdbData.title || featuredMovie.tmdbData.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative h-full flex items-center">
            <div className="container mx-auto px-4 md:px-8 max-w-2xl">
              <div className="animate-slideUp">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 drop-shadow-2xl">
                  {featuredMovie.tmdbData.title || featuredMovie.tmdbData.name}
                </h1>

                <div className="flex items-center gap-4 mb-6 text-sm md:text-base">
                  <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {featuredMovie.tmdbData.vote_average?.toFixed(1) || 'N/A'}
                  </span>
                  <span className="text-gray-300">
                    {featuredMovie.tmdbData.release_date?.substring(0, 4) ||
                      featuredMovie.tmdbData.first_air_date?.substring(0, 4)}
                  </span>
                  <span className="px-3 py-1 bg-red-600 rounded text-xs font-semibold uppercase">
                    {featuredMovie.type}
                  </span>
                </div>

                <p className="text-base md:text-lg text-gray-200 mb-8 line-clamp-3 drop-shadow-lg">
                  {featuredMovie.tmdbData.overview}
                </p>

                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => setSelectedMovie(featuredMovie)}
                    className="group px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-all duration-300 flex items-center gap-2 shadow-lg hover:scale-105"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                    Play Now
                  </button>
                  <button
                    onClick={() => setSelectedMovie(featuredMovie)}
                    className="px-8 py-3 bg-gray-600/80 hover:bg-gray-600 text-white font-bold rounded-lg transition-all duration-300 flex items-center gap-2 backdrop-blur-sm hover:scale-105"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    More Info
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 md:px-8 py-12 -mt-32 relative z-10">
        {/* Search and Filter */}
        <div className="mb-12 glass rounded-2xl p-6 animate-slideUp">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search for movies or TV shows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${filterType === 'all'
                    ? 'bg-gradient-to-r from-red-600 to-pink-600 shadow-lg shadow-red-500/30'
                    : 'bg-gray-800 hover:bg-gray-700'
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('movie')}
                className={`px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${filterType === 'movie'
                    ? 'bg-gradient-to-r from-red-600 to-pink-600 shadow-lg shadow-red-500/30'
                    : 'bg-gray-800 hover:bg-gray-700'
                  }`}
              >
                Movies
              </button>
              <button
                onClick={() => setFilterType('tv')}
                className={`px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${filterType === 'tv'
                    ? 'bg-gradient-to-r from-red-600 to-pink-600 shadow-lg shadow-red-500/30'
                    : 'bg-gray-800 hover:bg-gray-700'
                  }`}
              >
                TV Shows
              </button>
            </div>
          </div>
        </div>

        {/* Movies Grid */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            {filterType === 'all' ? 'All Content' : filterType === 'movie' ? 'Movies' : 'TV Shows'}
          </h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-gray-700 border-t-red-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-pink-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
              </div>
              <p className="mt-6 text-gray-400 text-lg">Loading amazing content...</p>
            </div>
          ) : filteredMovies.length === 0 ? (
            <div className="text-center py-32">
              <svg className="w-24 h-24 mx-auto text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-400 text-xl">No content found</p>
              <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {filteredMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onClick={() => setSelectedMovie(movie)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Movie Modal */}
      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>
  );
}
