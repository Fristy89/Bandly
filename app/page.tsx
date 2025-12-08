'use client';

import Navigation from '@/components/Navigation';
import Link from 'next/link';

export default function Home() {
  const featuredArtists = [
    {
      id: '1',
      name: 'The Echo Band',
      genre: 'Indie Rock',
      image: '🎸',
      rating: 4.8,
    },
    {
      id: '2',
      name: 'Luna Beats',
      genre: 'Electronic',
      image: '🎵',
      rating: 4.9,
    },
    {
      id: '3',
      name: 'Jazz Collective',
      genre: 'Jazz',
      image: '🎷',
      rating: 4.7,
    },
  ];

  const recentBookings = [
    {
      id: '1',
      artist: 'The Echo Band',
      event: 'Summer Festival 2024',
      date: '2024-07-15',
      status: 'confirmed',
    },
    {
      id: '2',
      artist: 'Luna Beats',
      event: 'Club Night',
      date: '2024-06-20',
      status: 'pending',
    },
    {
      id: '3',
      artist: 'Jazz Collective',
      event: 'Gala Dinner',
      date: '2024-08-10',
      status: 'completed',
    },
  ];

  return (
    <>
      <Navigation />
      <main className="pt-20 min-h-screen bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Welcome to Bandly
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl">
              The all-in-one platform for discovering, booking, and connecting with talented musicians and artists worldwide.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Link
              href="/artists"
              className="bg-gradient-to-br from-purple-900 to-purple-700 p-8 rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all cursor-pointer"
            >
              <div className="text-4xl mb-4">🎤</div>
              <h2 className="text-2xl font-bold mb-2">Discover Artists</h2>
              <p className="text-gray-300">Browse thousands of talented musicians and bands</p>
            </Link>
            <Link
              href="/bookings"
              className="bg-gradient-to-br from-pink-900 to-pink-700 p-8 rounded-lg hover:shadow-lg hover:shadow-pink-500/50 transition-all cursor-pointer"
            >
              <div className="text-4xl mb-4">📅</div>
              <h2 className="text-2xl font-bold mb-2">Book Talent</h2>
              <p className="text-gray-300">Easily book artists for your events</p>
            </Link>
            <Link
              href="/content"
              className="bg-gradient-to-br from-blue-900 to-blue-700 p-8 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all cursor-pointer"
            >
              <div className="text-4xl mb-4">💬</div>
              <h2 className="text-2xl font-bold mb-2">Connect & Chat</h2>
              <p className="text-gray-300">Network and collaborate with other artists</p>
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <section>
              <h2 className="text-3xl font-bold mb-6">Featured Artists</h2>
              <div className="space-y-4">
                {featuredArtists.map((artist) => (
                  <div
                    key={artist.id}
                    className="bg-gray-900 p-4 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{artist.image}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{artist.name}</h3>
                        <p className="text-sm text-gray-400">{artist.genre}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-yellow-400 font-semibold">⭐ {artist.rating}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/artists"
                className="mt-6 block text-center bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                View All Artists
              </Link>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6">Recent Bookings</h2>
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-gray-900 p-4 rounded-lg border border-gray-800"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{booking.artist}</h3>
                        <p className="text-sm text-gray-400 mb-2">{booking.event}</p>
                        <p className="text-xs text-gray-500">{booking.date}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed'
                            ? 'bg-green-900 text-green-300'
                            : booking.status === 'pending'
                            ? 'bg-yellow-900 text-yellow-300'
                            : 'bg-gray-700 text-gray-300'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/bookings"
                className="mt-6 block text-center bg-pink-600 hover:bg-pink-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Manage Bookings
              </Link>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
