'use client';

import Navigation from '@/components/Navigation';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function ArtistBioPage() {
  const { user, isAuthenticated, updateArtistBio, connectPlatform, disconnectPlatform, publishBio } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'bio' | 'platforms'>('bio');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedPlatformToConnect, setSelectedPlatformToConnect] = useState<string>('');
  const [platformHandle, setPlatformHandle] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [bioData, setBioData] = useState({
    shortBio: user?.artistBio?.shortBio || '',
    longBio: user?.artistBio?.longBio || '',
    genres: user?.artistBio?.genres || [],
    yearsActive: user?.artistBio?.yearsActive || '',
    achievements: user?.artistBio?.achievements || [],
    influences: user?.artistBio?.influences || [],
  });

  const [newGenre, setNewGenre] = useState('');
  const [newAchievement, setNewAchievement] = useState('');
  const [newInfluence, setNewInfluence] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.type !== 'artist') {
      router.push('/');
    }
  }, [isAuthenticated, user?.type, router]);

  const platforms = [
    { name: 'Spotify', icon: '🎵', color: 'from-green-900 to-green-700' },
    { name: 'Instagram', icon: '📸', color: 'from-pink-900 to-pink-700' },
    { name: 'SoundCloud', icon: '☁️', color: 'from-orange-900 to-orange-700' },
    { name: 'YouTube', icon: '📹', color: 'from-red-900 to-red-700' },
    { name: 'TikTok', icon: '🎵', color: 'from-black to-gray-800' },
  ];

  const handleSaveBio = async () => {
    setIsSaving(true);
    try {
      await updateArtistBio(bioData);
      setSuccessMessage('Artist bio saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddGenre = () => {
    if (newGenre && !bioData.genres.includes(newGenre)) {
      setBioData({
        ...bioData,
        genres: [...bioData.genres, newGenre],
      });
      setNewGenre('');
    }
  };

  const handleRemoveGenre = (genre: string) => {
    setBioData({
      ...bioData,
      genres: bioData.genres.filter((g) => g !== genre),
    });
  };

  const handleAddAchievement = () => {
    if (newAchievement) {
      setBioData({
        ...bioData,
        achievements: [...bioData.achievements, newAchievement],
      });
      setNewAchievement('');
    }
  };

  const handleRemoveAchievement = (achievement: string) => {
    setBioData({
      ...bioData,
      achievements: bioData.achievements.filter((a) => a !== achievement),
    });
  };

  const handleAddInfluence = () => {
    if (newInfluence) {
      setBioData({
        ...bioData,
        influences: [...bioData.influences, newInfluence],
      });
      setNewInfluence('');
    }
  };

  const handleRemoveInfluence = (influence: string) => {
    setBioData({
      ...bioData,
      influences: bioData.influences.filter((i) => i !== influence),
    });
  };

  const handleConnectPlatform = async () => {
    if (selectedPlatformToConnect && platformHandle) {
      try {
        await connectPlatform(selectedPlatformToConnect, { handle: platformHandle });
        setShowConnectModal(false);
        setSelectedPlatformToConnect('');
        setPlatformHandle('');
        setSuccessMessage(`${selectedPlatformToConnect} connected successfully!`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Failed to connect platform:', error);
      }
    }
  };

  const handlePublish = async () => {
    if (selectedPlatforms.length === 0) {
      setSuccessMessage('Please select platforms to publish to');
      return;
    }

    setIsPublishing(true);
    try {
      await publishBio(selectedPlatforms);
      setSuccessMessage(`Bio published to ${selectedPlatforms.join(', ')}!`);
      setSelectedPlatforms([]);
      setTimeout(() => setSuccessMessage(''), 3000);
    } finally {
      setIsPublishing(false);
    }
  };

  const connectedPlatforms = user?.publishedPlatforms || [];

  return (
    <>
      <Navigation />
      <main className="pt-20 min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Artist Bio & Publishing</h1>
            <p className="text-gray-400">
              Create and manage your artist profile, then publish it to your favorite platforms
            </p>
          </div>

          {successMessage && (
            <div className="mb-6 p-4 bg-green-900 border border-green-700 rounded-lg">
              <p className="text-green-300">{successMessage}</p>
            </div>
          )}

          <div className="flex border-b border-gray-800 mb-8">
            <button
              onClick={() => setActiveTab('bio')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'bio'
                  ? 'border-b-2 border-purple-500 text-purple-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              ✍️ Bio Information
            </button>
            <button
              onClick={() => setActiveTab('platforms')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'platforms'
                  ? 'border-b-2 border-purple-500 text-purple-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🌐 Connect & Publish
            </button>
          </div>

          {activeTab === 'bio' && (
            <div className="space-y-8">
              <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
                <h2 className="text-2xl font-bold mb-6">Bio Information</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Short Bio (One Line)
                    </label>
                    <input
                      type="text"
                      value={bioData.shortBio}
                      onChange={(e) =>
                        setBioData({ ...bioData, shortBio: e.target.value })
                      }
                      placeholder="e.g., Indie rock band from NYC with energetic live performances"
                      maxLength={100}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {bioData.shortBio.length}/100 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Long Bio
                    </label>
                    <textarea
                      value={bioData.longBio}
                      onChange={(e) =>
                        setBioData({ ...bioData, longBio: e.target.value })
                      }
                      placeholder="Tell your story... Share your journey, musical style, and what makes you unique"
                      rows={6}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Years Active (e.g., 2015-Present)
                    </label>
                    <input
                      type="text"
                      value={bioData.yearsActive}
                      onChange={(e) =>
                        setBioData({ ...bioData, yearsActive: e.target.value })
                      }
                      placeholder="2015-Present"
                      className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3">
                      Genres
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newGenre}
                        onChange={(e) => setNewGenre(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === 'Enter' && handleAddGenre()
                        }
                        placeholder="Add genre..."
                        className="flex-1 bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      />
                      <button
                        onClick={handleAddGenre}
                        className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded font-medium transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {bioData.genres.map((genre) => (
                        <div
                          key={genre}
                          className="bg-purple-900 text-purple-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          {genre}
                          <button
                            onClick={() => handleRemoveGenre(genre)}
                            className="hover:text-purple-100"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3">
                      Achievements & Awards
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newAchievement}
                        onChange={(e) => setNewAchievement(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === 'Enter' && handleAddAchievement()
                        }
                        placeholder="Add achievement..."
                        className="flex-1 bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      />
                      <button
                        onClick={handleAddAchievement}
                        className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded font-medium transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="space-y-2">
                      {bioData.achievements.map((achievement) => (
                        <div
                          key={achievement}
                          className="bg-gray-800 border border-gray-700 p-3 rounded flex items-center justify-between"
                        >
                          <span>🏆 {achievement}</span>
                          <button
                            onClick={() => handleRemoveAchievement(achievement)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3">
                      Musical Influences
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newInfluence}
                        onChange={(e) => setNewInfluence(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === 'Enter' && handleAddInfluence()
                        }
                        placeholder="Add influence..."
                        className="flex-1 bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      />
                      <button
                        onClick={handleAddInfluence}
                        className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded font-medium transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {bioData.influences.map((influence) => (
                        <div
                          key={influence}
                          className="bg-blue-900 text-blue-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          {influence}
                          <button
                            onClick={() => handleRemoveInfluence(influence)}
                            className="hover:text-blue-100"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleSaveBio}
                    disabled={isSaving}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-700 disabled:opacity-50 px-6 py-3 rounded-lg font-medium transition-colors mt-8"
                  >
                    {isSaving ? 'Saving...' : '💾 Save Bio'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'platforms' && (
            <div className="space-y-8">
              <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
                <h2 className="text-2xl font-bold mb-6">Connected Platforms</h2>

                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  {platforms.map((platform) => {
                    const isConnected =
                      connectedPlatforms.find(
                        (p) => p.platform === platform.name
                      )?.status === 'connected';

                    return (
                      <div
                        key={platform.name}
                        className={`border rounded-lg p-6 transition-all ${
                          isConnected
                            ? `bg-gradient-to-br ${platform.color} border-transparent`
                            : 'border-gray-700 bg-gray-800 hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{platform.icon}</span>
                            <div>
                              <h3 className="font-bold">{platform.name}</h3>
                              <p className="text-xs opacity-75">
                                {isConnected ? 'Connected' : 'Not connected'}
                              </p>
                            </div>
                          </div>
                          {isConnected && <span className="text-2xl">✓</span>}
                        </div>

                        <div className="mt-4 flex gap-2">
                          {!isConnected ? (
                            <button
                              onClick={() => {
                                setSelectedPlatformToConnect(platform.name);
                                setShowConnectModal(true);
                              }}
                              className="flex-1 bg-white/20 hover:bg-white/30 px-3 py-2 rounded text-sm font-medium transition-colors"
                            >
                              Connect
                            </button>
                          ) : (
                            <>
                              <label className="flex-1 flex items-center justify-center">
                                <input
                                  type="checkbox"
                                  checked={selectedPlatforms.includes(
                                    platform.name
                                  )}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedPlatforms([
                                        ...selectedPlatforms,
                                        platform.name,
                                      ]);
                                    } else {
                                      setSelectedPlatforms(
                                        selectedPlatforms.filter(
                                          (p) => p !== platform.name
                                        )
                                      );
                                    }
                                  }}
                                  className="w-4 h-4"
                                />
                                <span className="ml-2 text-sm">
                                  Publish
                                </span>
                              </label>
                              <button
                                onClick={() =>
                                  disconnectPlatform(platform.name)
                                }
                                className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm font-medium transition-colors"
                              >
                                Disconnect
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selectedPlatforms.length > 0 && (
                  <div className="bg-gradient-to-r from-purple-900 to-pink-900 p-6 rounded-lg mb-6">
                    <h3 className="font-bold mb-2">
                      Ready to publish to {selectedPlatforms.length} platform
                      {selectedPlatforms.length !== 1 ? 's' : ''}
                    </h3>
                    <p className="text-sm text-gray-300 mb-4">
                      {selectedPlatforms.join(', ')}
                    </p>
                    <button
                      onClick={handlePublish}
                      disabled={isPublishing}
                      className="w-full bg-white hover:bg-gray-100 disabled:bg-gray-100 disabled:opacity-50 text-purple-900 font-bold py-2 rounded transition-colors"
                    >
                      {isPublishing
                        ? '🔄 Publishing...'
                        : '🚀 Publish Bio Now'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {showConnectModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full border border-gray-800">
                <h2 className="text-2xl font-bold mb-6">
                  Connect {selectedPlatformToConnect}
                </h2>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Your {selectedPlatformToConnect} Handle/Username
                    </label>
                    <input
                      type="text"
                      value={platformHandle}
                      onChange={(e) => setPlatformHandle(e.target.value)}
                      placeholder="username"
                      className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <p className="text-sm text-gray-400">
                    We&apos;ll use this to link your bio and prepare it for publishing
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleConnectPlatform}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Connect
                  </button>
                  <button
                    onClick={() => {
                      setShowConnectModal(false);
                      setSelectedPlatformToConnect('');
                      setPlatformHandle('');
                    }}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
