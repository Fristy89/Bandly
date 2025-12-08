'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 w-full bg-black text-white shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
            <span className="font-bold text-xl">Bandly</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`transition-colors ${
                isActive('/') ? 'text-purple-400' : 'text-gray-300 hover:text-white'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/artists"
              className={`transition-colors ${
                isActive('/artists') ? 'text-purple-400' : 'text-gray-300 hover:text-white'
              }`}
            >
              Artists
            </Link>
            <Link
              href="/bookings"
              className={`transition-colors ${
                isActive('/bookings') ? 'text-purple-400' : 'text-gray-300 hover:text-white'
              }`}
            >
              Bookings
            </Link>
            <Link
              href="/content"
              className={`transition-colors ${
                isActive('/content') ? 'text-purple-400' : 'text-gray-300 hover:text-white'
              }`}
            >
              Content
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors text-sm font-medium">
              Sign In
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
