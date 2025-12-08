'use client';

import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { useState } from 'react';

export default function ArtistsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const allArtists = [
    {
      id: '1',
      name: 'The Echo Band',
      genre: ['Indie Rock', 'Alternative'],
      image: '🎸',
      bio: 'High-energy indie rock band with infectious melodies',
      rating: 4.8,
      verified: true,
      followers: 1250,
      priceRange: '$500-$2000',
    },
    {
      id: '2',
      name: 'Luna Beats',
      genre: ['Electronic', 'Synth-pop'],
      image: '🎵',
      bio: 'Electronic producer creating hypnotic dance music',
      rating: 4.9,
      verified: true,
      followers: 2100,
      priceRange: '$800-$3000',
    },
    {
      id: '3',
      name: 'Jazz Collective',
      genre: ['Jazz', 'Fusion'],
      image: '🎷',
      bio: 'Sophisticated jazz ensemble perfect for upscale events',
      rating: 4.7,
      verified: true,
      followers: 890,
      priceRange: '$1000-$4000',
    },
    {
      id: '4',
      name: 'Soul Speakers',
      genre: ['R&B', 'Soul'],
      image: '🎤',
      bio: 'Soulful vocals with smooth instrumentation',
      rating: 4.6,
      verified: false,
      followers: 650,
      priceRange: '$400-$1500',
    },
    {
      id: '5',
      name: 'Country Roads',
      genre: ['Country', 'Americana'],
      image: '🎺',
      bio: 'Authentic country music with traditional roots',
      rating: 4.8,
      verified: true,
      followers: 1500,
      priceRange: '$600-$2500',
    },
    {
      id: '6',
      name: 'Hip-Hop Vibes',
      genre: ['Hip-Hop', 'Rap'],
      image: '🎧',
      bio: 'Dynamic hip-hop collective with fresh beats',
      rating: 4.5,
      verified: true,
      followers: 2800,
      priceRange: '$700-$2800',
    },
  ];

  const genres = ['Indie Rock', 'Electronic', 'Jazz', 'R&B', 'Country', 'Hip-Hop'];

  const filteredArtists = allArtists.filter((artist) => {
    const matchesSearch = artist.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesGenre =
      selectedGenre === null || artist.genre.includes(selectedGenre);
    return matchesSearch && matchesGenre;
  });

  return (
    <>
      <Navigation />
      <main className="pt-20 min-h-screen bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">Discover Artists</h1>
            <p className="text-gray-400">
              Browse and connect with talented musicians from around the world
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8 mb-12">
            <div className="lg:col-span-1">
              <div className="bg-gray-900 rounded-lg p-6 sticky top-24">
                <h3 className="font-bold text-lg mb-4">Filters</h3>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">
                    Search
                  </label>
                  <input
                    type="text"
                    placeholder="Artist name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">
                    Genre
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedGenre(null)}
                      className={`w-full text-left px-3 py-2 rounded transition-colors ${
                        selectedGenre === null
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      All Genres
                    </button>
                    {genres.map((genre) => (
                      <button
                        key={genre}
                        onClick={() => setSelectedGenre(genre)}
                        className={`w-full text-left px-3 py-2 rounded transition-colors ${
                          selectedGenre === genre
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="grid md:grid-cols-2 gap-6">
                {filteredArtists.map((artist) => (
                  <Link
                    key={artist.id}
                    href={`/artists/${artist.id}`}
                    className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-colors"
                  >
                    <div className="p-6">
                      <div className="text-6xl mb-4">{artist.image}</div>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h2 className="text-xl font-bold">{artist.name}</h2>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-400">
                              {artist.genre.join(', ')}
                            </p>
                            {artist.verified && (
                              <span className="text-blue-400">✓</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 mb-4">{artist.bio}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-yellow-400 font-semibold">
                          ⭐ {artist.rating}
                        </span>
                        <span className="text-gray-400">
                          👥 {artist.followers.toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-800">
                        <p className="text-gray-400 text-sm mb-3">
                          {artist.priceRange}
                        </p>
                        <button className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded font-medium transition-colors">
                          View Profile
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {filteredArtists.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">
                    No artists found matching your criteria
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
