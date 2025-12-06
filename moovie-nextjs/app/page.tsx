'use client';

import { useState, useEffect } from 'react';
import MovieCard from '@/components/MovieCard';
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${filterType === 'all' ? 'bg-gradient-to-r from-red-500 to-pink-500' : 'bg-gray-800 hover:bg-gray-700'
                }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('movie')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${filterType === 'movie' ? 'bg-gradient-to-r from-red-500 to-pink-500' : 'bg-gray-800 hover:bg-gray-700'
                }`}
            >
              Movies
            </button>
            <button
              onClick={() => setFilterType('tv')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${filterType === 'tv' ? 'bg-gradient-to-r from-red-500 to-pink-500' : 'bg-gray-800 hover:bg-gray-700'
                }`}
            >
              TV Shows
            </button>
          </div>
        </div>

        {/* Movies Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            <p className="mt-4 text-gray-400">Loading movies...</p>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>No movies found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onClick={() => setSelectedMovie(movie)}
              />
            ))}
          </div>
        )}

        {/* Simple Modal */}
        {selectedMovie && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedMovie(null)}
          >
            <div
              className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedMovie.tmdbData?.title || selectedMovie.tmdbData?.name}</h2>
                <button onClick={() => setSelectedMovie(null)} className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {selectedMovie.embed_code && (
                <div className="mb-4" dangerouslySetInnerHTML={{ __html: selectedMovie.embed_code }} />
              )}

              <p className="text-gray-300 mb-4">{selectedMovie.tmdbData?.overview}</p>

              {selectedMovie.downloads && selectedMovie.downloads.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Download Links:</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedMovie.downloads.map((download, idx) => (
                      <a
                        key={idx}
                        href={download.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg hover:shadow-lg hover:shadow-red-500/50 transition"
                      >
                        {download.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
