'use client';

import Navigation from '@/components/Navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      bio: user?.bio || '',
    });
    setIsEditing(false);
  };

  const userTypeDisplay = {
    artist: '🎤 Artist',
    booking_agent: '👔 Booking Agent',
    fan: '👥 Fan',
  };

  return (
    <>
      <Navigation />
      <main className="pt-20 min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">My Profile</h1>
            <p className="text-gray-400">Manage your account information</p>
          </div>

          {successMessage && (
            <div className="mb-6 p-4 bg-green-900 border border-green-700 rounded-lg">
              <p className="text-green-300">{successMessage}</p>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
              <div className="text-center">
                <Image
                  src={user?.image || ''}
                  alt={user?.name || ''}
                  width={128}
                  height={128}
                  className="w-32 h-32 rounded-full mx-auto mb-4"
                  unoptimized
                />
                <h2 className="text-2xl font-bold mb-2">{user?.name}</h2>
                <p className="text-purple-400 font-medium mb-4">
                  {userTypeDisplay[user?.type as keyof typeof userTypeDisplay]}
                </p>
                {user?.verified && (
                  <div className="inline-block bg-blue-900 text-blue-300 px-3 py-1 rounded-full text-xs font-medium">
                    ✓ Verified
                  </div>
                )}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-800 space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Member Since</p>
                  <p className="text-sm font-medium">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>

                {user?.type === 'artist' && (
                  <a
                    href="/artist-bio"
                    className="block w-full text-center bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    ✍️ Manage Artist Bio
                  </a>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 bg-gray-900 rounded-lg p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Account Information</h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    ✏️ Edit
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-700 disabled:opacity-50 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      {isSaving ? 'Saving...' : '💾 Save Changes'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="text-lg font-medium">{user?.email}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Bio</p>
                    <p className="text-lg font-medium">
                      {user?.bio || 'No bio added yet'}
                    </p>
                  </div>

                  <div className="bg-gray-800 rounded p-4">
                    <p className="text-xs text-gray-500 mb-3">Account Type</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {user?.type === 'artist'
                          ? '🎤'
                          : user?.type === 'booking_agent'
                          ? '👔'
                          : '👥'}
                      </span>
                      <span className="text-lg font-medium">
                        {userTypeDisplay[
                          user?.type as keyof typeof userTypeDisplay
                        ]}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-12 bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-8 border border-gray-800">
            <h3 className="text-2xl font-bold mb-4">Account Security</h3>
            <p className="text-gray-400 mb-6">
              Manage your password and security settings
            </p>
            <button className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg font-medium transition-colors">
              🔐 Change Password
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
