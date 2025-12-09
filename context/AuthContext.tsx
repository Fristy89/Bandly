'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  type: 'artist' | 'booking_agent' | 'fan';
  image: string;
  bio?: string;
  artistBio?: {
    shortBio: string;
    longBio: string;
    genres: string[];
    yearsActive: string;
    achievements: string[];
    influences: string[];
  };
  socials: {
    spotify?: string;
    instagram?: string;
    soundcloud?: string;
    youtube?: string;
    tiktok?: string;
  };
  publishedPlatforms: Array<{
    platform: string;
    status: 'connected' | 'disconnected' | 'publishing';
    lastPublished?: Date;
  }>;
  verified: boolean;
  createdAt: Date;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signup: (email: string, password: string, userType: string, name: string) => Promise<void>;
  login: (email: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  updateArtistBio: (bio: UserProfile['artistBio']) => Promise<void>;
  connectPlatform: (platform: string, credentials: { handle?: string; url?: string }) => Promise<void>;
  disconnectPlatform: (platform: string) => Promise<void>;
  publishBio: (platforms: string[]) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('bandly_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
      }
    }
  }, []);

  const signup = async (
    email: string,
    password: string,
    userType: string,
    name: string
  ) => {
    setIsLoading(true);
    try {
      const newUser: UserProfile = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        type: userType as 'artist' | 'booking_agent' | 'fan',
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        bio: '',
        socials: {},
        publishedPlatforms: [],
        verified: false,
        createdAt: new Date(),
      };

      localStorage.setItem('bandly_user', JSON.stringify(newUser));
      setUser(newUser);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string) => {
    setIsLoading(true);
    try {
      const mockUser: UserProfile = {
        id: '1',
        name: 'Artist User',
        email,
        type: 'artist',
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        bio: 'Passionate musician and artist',
        socials: {
          spotify: 'https://spotify.com/artist',
        },
        publishedPlatforms: [
          {
            platform: 'Spotify',
            status: 'disconnected',
          },
        ],
        verified: true,
        createdAt: new Date(),
      };

      localStorage.setItem('bandly_user', JSON.stringify(mockUser));
      setUser(mockUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('bandly_user');
    setUser(null);
  };

  const updateProfile = async (profile: Partial<UserProfile>) => {
    setIsLoading(true);
    try {
      if (user) {
        const updatedUser = { ...user, ...profile };
        localStorage.setItem('bandly_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateArtistBio = async (bio: UserProfile['artistBio']) => {
    setIsLoading(true);
    try {
      if (user) {
        const updatedUser = { ...user, artistBio: bio };
        localStorage.setItem('bandly_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const connectPlatform = async (
    platform: string,
    credentials: { handle?: string; url?: string }
  ) => {
    setIsLoading(true);
    try {
      if (user) {
        const updatedUser = {
          ...user,
          socials: {
            ...user.socials,
            [platform.toLowerCase()]: credentials.url || `https://${platform.toLowerCase()}.com/${credentials.handle}`,
          },
          publishedPlatforms: [
            ...(user.publishedPlatforms || []).filter((p) => p.platform !== platform),
            {
              platform,
              status: 'connected' as const,
            },
          ],
        };
        localStorage.setItem('bandly_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectPlatform = async (platform: string) => {
    setIsLoading(true);
    try {
      if (user) {
        const updatedUser = {
          ...user,
          publishedPlatforms: [
            ...user.publishedPlatforms.filter((p) => p.platform !== platform),
            {
              platform,
              status: 'disconnected' as const,
            },
          ],
        };
        localStorage.setItem('bandly_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const publishBio = async (platforms: string[]) => {
    setIsLoading(true);
    try {
      if (user) {
        const updatedPlatforms = user.publishedPlatforms.map((p) => ({
          ...p,
          status: platforms.includes(p.platform) ? 'publishing' as const : p.status,
          lastPublished: platforms.includes(p.platform) ? new Date() : p.lastPublished,
        }));

        setTimeout(() => {
          if (user) {
            const finalPlatforms = updatedPlatforms.map((p) => ({
              ...p,
              status: platforms.includes(p.platform) ? 'connected' as const : p.status,
            }));

            const finalUser = {
              ...user,
              publishedPlatforms: finalPlatforms,
            };
            localStorage.setItem('bandly_user', JSON.stringify(finalUser));
            setUser(finalUser);
          }
        }, 1500);

        const intermediateUser = {
          ...user,
          publishedPlatforms: updatedPlatforms,
        };
        localStorage.setItem('bandly_user', JSON.stringify(intermediateUser));
        setUser(intermediateUser);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signup,
        login,
        logout,
        updateProfile,
        updateArtistBio,
        connectPlatform,
        disconnectPlatform,
        publishBio,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
