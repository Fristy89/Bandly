'use client';

import Navigation from '@/components/Navigation';
import { useState } from 'react';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<
    Array<{
      id: string;
      artistId: string;
      artistName: string;
      eventName: string;
      eventDate: string;
      eventLocation: string;
      duration: number;
      budget: number;
      status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
      bookedBy: string;
      notes: string;
      createdAt: string;
    }>
  >([
    {
      id: '1',
      artistId: '1',
      artistName: 'The Echo Band',
      eventName: 'Summer Festival 2024',
      eventDate: '2024-07-15',
      eventLocation: 'Central Park, New York',
      duration: 2,
      budget: 1500,
      status: 'confirmed',
      bookedBy: 'John Event Organizer',
      notes: 'Sound check at 4 PM',
      createdAt: '2024-05-01',
    },
    {
      id: '2',
      artistId: '2',
      artistName: 'Luna Beats',
      eventName: 'Club Night',
      eventDate: '2024-06-20',
      eventLocation: '123 Main St, Los Angeles',
      duration: 3,
      budget: 1200,
      status: 'pending',
      bookedBy: 'Jane Club Manager',
      notes: 'DJ setup required',
      createdAt: '2024-05-05',
    },
    {
      id: '3',
      artistId: '3',
      artistName: 'Jazz Collective',
      eventName: 'Gala Dinner',
      eventDate: '2024-08-10',
      eventLocation: 'Grand Hotel, Chicago',
      duration: 4,
      budget: 3000,
      status: 'completed',
      bookedBy: 'Mike Hotel Manager',
      notes: 'Elegant dress code required',
      createdAt: '2024-04-20',
    },
  ]);

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const filteredBookings = bookings.filter(
    (booking) => filterStatus === null || booking.status === filterStatus
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-900 text-green-300';
      case 'pending':
        return 'bg-yellow-900 text-yellow-300';
      case 'completed':
        return 'bg-blue-900 text-blue-300';
      case 'cancelled':
        return 'bg-red-900 text-red-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  const handleCancelBooking = (id: string) => {
    setBookings(
      bookings.map((booking) =>
        booking.id === id ? { ...booking, status: 'cancelled' } : booking
      )
    );
  };

  return (
    <>
      <Navigation />
      <main className="pt-20 min-h-screen bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl font-bold mb-2">Bookings</h1>
              <p className="text-gray-400">Manage and track your event bookings</p>
            </div>
            <button
              onClick={() => setShowBookingForm(true)}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              + New Booking
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-8">
            {['All', 'Pending', 'Confirmed', 'Completed'].map((status) => (
              <button
                key={status}
                onClick={() =>
                  setFilterStatus(
                    status === 'All' ? null : status.toLowerCase()
                  )
                }
                className={`py-3 rounded-lg font-medium transition-colors ${
                  (status === 'All' && filterStatus === null) ||
                  filterStatus === status.toLowerCase()
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-gray-900 rounded-lg p-6 border border-gray-800"
              >
                <div className="grid lg:grid-cols-5 gap-4 items-center">
                  <div>
                    <h3 className="font-bold text-lg">{booking.artistName}</h3>
                    <p className="text-sm text-gray-400">{booking.eventName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Event Date</p>
                    <p className="font-semibold">{booking.eventDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Budget</p>
                    <p className="font-semibold text-purple-400">
                      ${booking.budget}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Duration</p>
                    <p className="font-semibold">{booking.duration} hours</p>
                  </div>
                  <div className="flex items-center justify-between lg:flex-col lg:items-start gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="text-xs text-red-400 hover:text-red-300 font-medium"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Location:</span>
                      <p className="font-medium">{booking.eventLocation}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Booked By:</span>
                      <p className="font-medium">{booking.bookedBy}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Notes:</span>
                      <p className="font-medium">{booking.notes}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No bookings found</p>
            </div>
          )}

          {showBookingForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-900 rounded-lg p-8 max-w-2xl w-full max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">New Booking</h2>
                  <button
                    onClick={() => setShowBookingForm(false)}
                    className="text-gray-400 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setShowBookingForm(false);
                  }}
                  className="space-y-4"
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Artist Name
                      </label>
                      <input
                        type="text"
                        placeholder="Select artist..."
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Event Name
                      </label>
                      <input
                        type="text"
                        placeholder="Event name..."
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Event Date
                      </label>
                      <input
                        type="date"
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Duration (hours)
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="Hours..."
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Event Location
                    </label>
                    <input
                      type="text"
                      placeholder="City, venue..."
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Budget ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Budget..."
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Notes
                    </label>
                    <textarea
                      placeholder="Special requests or notes..."
                      rows={3}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    ></textarea>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="flex-1 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Create Booking
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowBookingForm(false)}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
