'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isActive = (path: string) => pathname === path;

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    router.push('/');
  };

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

          <div className="flex items-center space-x-4 relative">
            {user ? (
              <>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-900 transition-colors"
                >
                  <Image
                    src={user.image}
                    alt={user.name}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full"
                    unoptimized
                  />
                  <span className="hidden sm:inline text-sm font-medium">{user.name}</span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-xl py-2 top-12">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 hover:bg-gray-800 transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      👤 My Profile
                    </Link>
                    <Link
                      href="/artist-bio"
                      className="block px-4 py-2 hover:bg-gray-800 transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      ✍️ Artist Bio
                    </Link>
                    <hr className="my-2 border-gray-700" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-800 transition-colors text-red-400"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg text-gray-300 hover:text-white transition-colors text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
