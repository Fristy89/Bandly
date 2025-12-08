'use client';

import Navigation from '@/components/Navigation';
import { useParams } from 'next/navigation';

export default function ArtistDetailPage() {
  const params = useParams();
  const artistId = params.id;

  const artist = {
    id: artistId,
    name: 'The Echo Band',
    genre: ['Indie Rock', 'Alternative'],
    image: '🎸',
    bio: 'High-energy indie rock band with infectious melodies and powerful live performances.',
    rating: 4.8,
    verified: true,
    followers: 1250,
    priceRange: '$500-$2000',
    description:
      'The Echo Band has been performing for over 5 years, captivating audiences with their unique blend of indie rock and alternative music. Known for their energetic live shows and authentic songwriting, they are perfect for festivals, clubs, and private events.',
    samples: [
      { id: '1', title: 'Midnight Echo', url: '#', duration: 3.5 },
      { id: '2', title: 'Neon Dreams', url: '#', duration: 4.2 },
      { id: '3', title: 'Electric Pulse', url: '#', duration: 3.8 },
    ],
    availability: [
      { start: '2024-06-01', end: '2024-06-30', available: true },
      { start: '2024-07-15', end: '2024-07-31', available: true },
    ],
    socials: {
      spotify: 'https://spotify.com',
      instagram: 'https://instagram.com',
      soundcloud: 'https://soundcloud.com',
    },
    reviews: [
      {
        id: '1',
        author: 'John Doe',
        rating: 5,
        text: 'Amazing performance! The band was professional and energetic.',
        date: '2024-05-15',
      },
      {
        id: '2',
        author: 'Jane Smith',
        rating: 4,
        text: 'Great music and a fantastic crowd engagement.',
        date: '2024-05-10',
      },
    ],
  };

  return (
    <>
      <Navigation />
      <main className="pt-20 min-h-screen bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <button
            onClick={() => window.history.back()}
            className="mb-8 text-purple-400 hover:text-purple-300"
          >
            ← Back
          </button>

          <div className="grid lg:grid-cols-3 gap-12 mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-start gap-8 mb-8">
                <div className="text-9xl">{artist.image}</div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-4xl font-bold">{artist.name}</h1>
                    {artist.verified && (
                      <span className="text-2xl text-blue-400">✓</span>
                    )}
                  </div>
                  <p className="text-gray-400 mb-4">
                    {artist.genre.join(' • ')}
                  </p>
                  <div className="flex items-center gap-6 mb-6">
                    <div>
                      <div className="text-2xl font-bold text-yellow-400">
                        {artist.rating}⭐
                      </div>
                      <p className="text-sm text-gray-400">Rating</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {artist.followers.toLocaleString()}
                      </div>
                      <p className="text-sm text-gray-400">Followers</p>
                    </div>
                  </div>
                  <button className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-lg font-bold text-lg transition-colors">
                    Book Now
                  </button>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-8 mb-8">
                <h2 className="text-2xl font-bold mb-4">About</h2>
                <p className="text-gray-300 leading-relaxed">{artist.description}</p>
              </div>

              <div className="bg-gray-900 rounded-lg p-8 mb-8">
                <h2 className="text-2xl font-bold mb-6">Audio Samples</h2>
                <div className="space-y-4">
                  {artist.samples.map((sample) => (
                    <div
                      key={sample.id}
                      className="flex items-center gap-4 bg-gray-800 p-4 rounded"
                    >
                      <button className="text-2xl hover:text-purple-400">
                        ▶
                      </button>
                      <div className="flex-1">
                        <p className="font-semibold">{sample.title}</p>
                        <p className="text-sm text-gray-400">
                          {sample.duration}m
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-6">Reviews</h2>
                <div className="space-y-6">
                  {artist.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-800 pb-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold">{review.author}</p>
                          <p className="text-sm text-gray-400">{review.date}</p>
                        </div>
                        <div className="text-yellow-400">
                          {'⭐'.repeat(review.rating)}
                        </div>
                      </div>
                      <p className="text-gray-300">{review.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-gray-900 rounded-lg p-6 sticky top-24 space-y-6">
                <div>
                  <h3 className="font-bold text-lg mb-3">Price Range</h3>
                  <p className="text-2xl font-bold text-purple-400">
                    {artist.priceRange}
                  </p>
                </div>

                <div className="border-t border-gray-800 pt-6">
                  <h3 className="font-bold text-lg mb-3">Availability</h3>
                  <div className="space-y-2">
                    {artist.availability.map((slot, idx) => (
                      <div key={idx} className="text-sm text-gray-400">
                        <p className="font-medium text-white">
                          {new Date(slot.start).toLocaleDateString()} -{' '}
                          {new Date(slot.end).toLocaleDateString()}
                        </p>
                        <span className="inline-block bg-green-900 text-green-300 px-2 py-1 rounded text-xs mt-1">
                          Available
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-6">
                  <h3 className="font-bold text-lg mb-3">Follow</h3>
                  <div className="space-y-2">
                    {artist.socials.spotify && (
                      <a
                        href={artist.socials.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-center font-medium transition-colors"
                      >
                        Spotify
                      </a>
                    )}
                    {artist.socials.instagram && (
                      <a
                        href={artist.socials.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded text-center font-medium transition-colors"
                      >
                        Instagram
                      </a>
                    )}
                    {artist.socials.soundcloud && (
                      <a
                        href={artist.socials.soundcloud}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded text-center font-medium transition-colors"
                      >
                        SoundCloud
                      </a>
                    )}
                  </div>
                </div>

                <button className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-lg font-bold transition-colors">
                  Book This Artist
                </button>
                <button className="w-full bg-gray-800 hover:bg-gray-700 px-4 py-3 rounded-lg font-medium transition-colors">
                  Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
