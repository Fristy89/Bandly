# Bandly - Architecture & Structure Guide

## Overview

Bandly is an all-in-one platform for discovering, booking, and connecting with talented musicians and artists worldwide. The application is built with **Next.js 16**, **React 19**, **TypeScript**, and **Tailwind CSS**.

This document explains the app's structure, features, and how everything works together.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Type Definitions](#type-definitions)
5. [Pages & Routes](#pages--routes)
6. [Components](#components)
7. [Styling](#styling)
8. [Data Flow](#data-flow)
9. [Future Enhancements](#future-enhancements)

---

## Project Structure

```
bandly/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Home Dashboard
│   ├── layout.tsx               # Root Layout with AuthProvider
│   ├── globals.css              # Global Styles
│   ├── favicon.ico              # Favicon
│   ├── artists/                 # Artist Pages
│   │   ├── page.tsx            # Artist Listing & Search
│   │   └── [id]/
│   │       └── page.tsx        # Artist Detail Page
│   ├── bookings/                # Booking Pages
│   │   └── page.tsx            # Booking Management
│   ├── content/                 # Content & Community
│   │   └── page.tsx            # Messages, Collaborations, Feed
│   ├── login/                   # Authentication
│   │   └── page.tsx            # Login Page
│   ├── signup/                  # User Registration
│   │   └── page.tsx            # Signup Page
│   ├── profile/                 # User Profile
│   │   └── page.tsx            # Profile Management
│   └── artist-bio/              # Artist Bio Management
│       └── page.tsx            # Bio Editor & Publishing
├── components/                  # Reusable Components
│   └── Navigation.tsx           # Global Navigation Bar
├── context/                     # React Context & State Management
│   └── AuthContext.tsx          # Authentication & User State
├── types/                       # TypeScript Definitions
│   └── index.ts                # All interfaces & types
├── public/                      # Static Assets
├── package.json                 # Dependencies
├── tsconfig.json               # TypeScript Config
├── next.config.ts              # Next.js Config
├── tailwind.config.ts          # Tailwind CSS Config
└── ARCHITECTURE.md             # This File
```

---

## Features

### 0. **Authentication System**

#### **Signup Page** (`/signup`)
- Create new user account with email and password
- Account type selection (Artist, Booking Agent, Fan)
- Password confirmation validation
- Automatic avatar generation via DiceBear API
- Form validation with error messages

**Key Features:**
- Email validation
- Password strength requirements
- Account type selection affects permissions
- Auto-generated profile avatar

#### **Login Page** (`/login`)
- Email-based login
- Form validation
- Persistent session using localStorage
- Error handling for invalid credentials
- Redirect to home on successful login

**Key Features:**
- Email validation
- Error message display
- Automatic redirect for authenticated users
- Session persistence

#### **Profile Page** (`/profile`)
- View current user information
- Edit name, email, and bio
- Display account type and member since date
- Link to artist bio management (for artists only)
- Real-time save functionality

**Key Features:**
- Editable profile fields
- Account type display
- Artist bio access
- Success notifications

#### **Artist Bio Management** (`/artist-bio`)
Two-tab interface for comprehensive artist profiles:

**Tab 1: Bio Information**
- Short bio (100 character limit)
- Long bio with full description
- Genre tags (add/remove dynamically)
- Years active
- Achievements/awards list
- Musical influences
- Real-time save to localStorage

**Tab 2: Connect & Publish**
- Connect to 5 streaming/social platforms:
  - Spotify
  - Instagram
  - SoundCloud
  - YouTube
  - TikTok
- View connection status for each platform
- Publish complete bio to multiple platforms simultaneously
- Track last published timestamp
- Visual status indicators

**Key Features:**
- Platform connection management
- Multi-platform publishing
- Real-time status updates
- Success notifications
- Access control (artists only)

---

### 1. **Home Dashboard** (`/`)
- Welcome banner with app description
- Quick navigation cards to main features
- Featured artists section
- Recent bookings overview
- Call-to-action buttons for each major section

**Key Features:**
- Responsive grid layout
- Gradient backgrounds for visual appeal
- Quick links to all major features
- Summary of recent activity

### 2. **Artist Discovery** (`/artists`)
- Browse all available artists
- Filter by genre
- Search by artist name
- Detailed artist cards with ratings and follower counts
- Genre selection with visual feedback
- Link to individual artist profiles

**Key Features:**
- Real-time search filtering
- Genre-based filtering
- Artist ratings and verified badges
- Price range display
- Direct profile navigation

### 3. **Artist Profiles** (`/artists/[id]`)
- Comprehensive artist information
- Large profile section with emoji representation
- Detailed biography
- Audio samples (playable)
- Customer reviews with ratings
- Availability calendar
- Social media links
- Follower count and rating system
- Quick booking options

**Key Features:**
- Media gallery for audio samples
- Review system with star ratings
- Availability display
- Social media integration
- Call-to-action buttons for booking

### 4. **Booking System** (`/bookings`)
- View all bookings
- Filter by status (Pending, Confirmed, Completed)
- Create new bookings with form modal
- Booking details (artist, event date, budget, duration)
- Status indicators (color-coded)
- Cancel bookings (when pending)
- Track booking history

**Key Features:**
- Status filtering
- Create new booking modal
- Form validation
- Status badges with color coding
- Booking management actions

### 5. **Content Management & Community** (`/content`)
Three main tabs for community engagement:

#### a. **Messages (Chat System)**
- List of conversations
- Real-time messaging interface
- Search conversations
- Unread message indicators
- Message timestamps
- Participant information

**Features:**
- Conversation management
- Real-time chat interface
- Message history
- Typing indicator support (ready for backend)

#### b. **Collaborations**
- View active collaboration projects
- Project status indicators
- Collaborator lists
- Project descriptions
- Create new collaboration projects
- Join existing projects

**Features:**
- Project management
- Collaborator tracking
- Status management
- Easy navigation to projects

#### c. **Feed**
- Share updates and work samples
- Like and comment functionality
- Social feed of all community posts
- Timestamp display
- Engagement metrics

**Features:**
- Create posts
- Like/comment/share functionality
- User-generated content
- Social engagement

---

## Architecture

### Component Hierarchy

```
RootLayout (with AuthProvider)
├── Navigation (shows auth status, profile/logout links)
└── Page Components
    ├── Login / Signup (public)
    ├── Home / Profile / Artist-Bio (auth-gated)
    ├── Artists Listing / Detail (public)
    ├── Bookings (auth-gated)
    └── Content (auth-gated)
```

### State Management Architecture

**Global Auth State (AuthContext)**
```
AuthProvider
├── user: UserProfile | null
├── isAuthenticated: boolean
├── isLoading: boolean
├── Methods:
│   ├── signup()
│   ├── login()
│   ├── logout()
│   ├── updateProfile()
│   ├── updateArtistBio()
│   ├── connectPlatform()
│   ├── disconnectPlatform()
│   └── publishBio()
└── localStorage persistence
```

**Local Component State**
- Form data (login, signup, profile editing)
- UI state (modals, tabs, loading indicators)
- Temporary UI feedback (success messages, errors)

### Data Flow

1. **Authentication Flow**:
   ```
   User Input → Form Validation → Auth Action → localStorage → Context Update → UI Re-render → Redirect
   ```

2. **Artist Bio Publishing**:
   ```
   User Input → Save Bio → Update Context → localStorage → Show Publishing Status → Simulate Publish → Update Status
   ```

3. **Protected Routes**:
   ```
   Component Mount → Check useAuth() → isAuthenticated? → Render or Redirect to /login
   ```

### Future Backend Integration

For production, implement:
- REST API or GraphQL endpoints
- Database (PostgreSQL, MongoDB, etc.)
- JWT-based authentication
- Real-time messaging (WebSockets)
- File upload handling for media
- API endpoints for platform publishing integration

---

## Type Definitions

Located in `types/index.ts` and `context/AuthContext.tsx`, the following interfaces define the app's data structure:

### **UserProfile** (AuthContext)
```typescript
interface UserProfile {
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
```

### **Artist**
```typescript
interface Artist {
  id: string;
  name: string;
  genre: string[];
  bio: string;
  image: string;
  rating: number;
  verified: boolean;
  followers: number;
  socials: {
    spotify?: string;
    instagram?: string;
    soundcloud?: string;
  };
  samples: Sample[];
  availability: DateRange[];
}
```

### **Booking**
```typescript
interface Booking {
  id: string;
  artistId: string;
  eventName: string;
  eventDate: Date;
  eventLocation: string;
  duration: number;
  budget: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  bookedBy: string;
  notes: string;
  createdAt: Date;
}
```

### **ChatMessage**
```typescript
interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderImage: string;
  recipientId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}
```

### **User**
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  image: string;
  type: "artist" | "booking_agent" | "fan";
  bio?: string;
  verified: boolean;
  createdAt: Date;
}
```

### **Conversation**
```typescript
interface Conversation {
  id: string;
  participants: User[];
  messages: ChatMessage[];
  lastMessage: ChatMessage;
  updatedAt: Date;
}
```

---

## Pages & Routes

### Route Structure

| Route | Component | Purpose | Auth Required | User Type |
|-------|-----------|---------|---|---|
| `/` | `app/page.tsx` | Home Dashboard | No | Any |
| `/login` | `app/login/page.tsx` | User Login | No | None |
| `/signup` | `app/signup/page.tsx` | User Registration | No | None |
| `/profile` | `app/profile/page.tsx` | User Profile Management | Yes | Any |
| `/artist-bio` | `app/artist-bio/page.tsx` | Artist Bio & Publishing | Yes | Artist only |
| `/artists` | `app/artists/page.tsx` | Artist Listing & Search | No | Any |
| `/artists/[id]` | `app/artists/[id]/page.tsx` | Artist Details | No | Any |
| `/bookings` | `app/bookings/page.tsx` | Booking Management | Yes | Any |
| `/content` | `app/content/page.tsx` | Messages, Collaborations, Feed | Yes | Any |

### Navigation Flow

```
Root
├── Login (/login)
├── Signup (/signup)
└── Authenticated Flow
    ├── Home (/)
    ├── Profile (/profile)
    ├── Artist Bio (/artist-bio) [Artists only]
    ├── Artists (/artists)
    │   └── Artist Detail (/artists/[id])
    ├── Bookings (/bookings)
    │   └── Create Booking Modal
    └── Content (/content)
        ├── Messages Tab
        ├── Collaborations Tab
        └── Feed Tab
```

---

## Components

### Navigation Component (`components/Navigation.tsx`)

**Purpose**: Global navigation bar shown on all pages

**Features:**
- Logo with gradient effect
- Active route highlighting
- Sign In button
- Responsive navigation links
- Fixed positioning at top

**Props**: None (uses `usePathname` hook)

**Usage**:
```tsx
<Navigation />
```

---

## Styling

### Technology Stack
- **Framework**: Tailwind CSS v4
- **Color Scheme**: Dark theme (Black background, gray accents)
- **Gradients**: Purple and Pink accent colors
- **Components**: Utility-based styling

### Color Palette

| Element | Color | Tailwind Class |
|---------|-------|---|
| Background | Black | `bg-black` |
| Cards | Dark Gray | `bg-gray-900` |
| Text | White/Gray | `text-white/gray-300` |
| Primary Accent | Purple | `bg-purple-600` |
| Secondary Accent | Pink | `bg-pink-600` |
| Success | Green | `bg-green-600` |
| Warning | Yellow | `bg-yellow-600` |
| Error | Red | `bg-red-600` |

### Responsive Design

- **Mobile First**: All components start mobile-optimized
- **Breakpoints**:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px

---

## Data Flow

### State Management

Currently, all state is managed locally within components using React's `useState` hook.

```tsx
// Example from Bookings page
const [bookings, setBookings] = useState([...]);
const [filterStatus, setFilterStatus] = useState(null);
```

### Future Improvements

1. **Context API**: For global state (auth, user data)
2. **Redux/Zustand**: For complex state management
3. **React Query/SWR**: For server state management
4. **Backend API**: REST or GraphQL endpoints

### Data Flow Diagram

```
User Action
    ↓
Event Handler
    ↓
State Update
    ↓
Component Re-render
    ↓
UI Update
```

---

## Key Features Breakdown

### 1. Search & Filter System

**Location**: `/artists` page

**Implementation**:
```tsx
const [searchTerm, setSearchTerm] = useState('');
const [selectedGenre, setSelectedGenre] = useState(null);

const filteredArtists = allArtists.filter((artist) => {
  const matchesSearch = artist.name.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesGenre = selectedGenre === null || artist.genre.includes(selectedGenre);
  return matchesSearch && matchesGenre;
});
```

### 2. Chat System

**Location**: `/content` page → Messages tab

**Features**:
- Conversation listing
- Real-time message display
- Message input field
- Participant information
- Unread indicators

**Implementation**:
- Uses local state for messages
- Supports message sending with Enter key
- Dynamic message rendering based on sender

### 3. Booking Management

**Location**: `/bookings` page

**Features**:
- Create new bookings
- Filter by status
- Cancel bookings
- View booking details
- Status indicators

**Implementation**:
- Modal form for booking creation
- Status-based filtering
- Color-coded status badges
- Dynamic form handling

### 4. Collaboration System

**Location**: `/content` page → Collaborations tab

**Features**:
- Project listing
- Collaborator tracking
- Project status
- Create new projects

---

## Getting Started

### Installation

```bash
cd bandly
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

---

## Adding New Features

### Adding a New Page

1. Create a new folder in `app/` directory
2. Add `page.tsx` file
3. Import `Navigation` component
4. Implement your page component
5. Add route to navigation if needed

### Adding a New Component

1. Create file in `components/` directory
2. Export as default or named export
3. Use in pages with `import`

### Adding New Types

1. Update `types/index.ts`
2. Export interface
3. Use in components with TypeScript support

---

## Performance Optimization

### Current State
- Client-side rendering for interactivity
- Efficient state management
- Responsive layouts

### Future Optimizations
1. **Image Optimization**: Use Next.js `Image` component
2. **Code Splitting**: Lazy load pages
3. **Memoization**: Use React.memo for heavy components
4. **API Caching**: Implement server-side caching
5. **Database Indexing**: Optimize queries

---

## Security Considerations

### Current Stage
This is a frontend template. Security features to implement:

1. **Authentication**:
   - JWT-based auth
   - OAuth integration (Google, Spotify)
   - Session management

2. **Data Validation**:
   - Form validation
   - Input sanitization
   - CORS configuration

3. **Secrets Management**:
   - Environment variables
   - API key protection

4. **Database Security**:
   - SQL injection prevention
   - Rate limiting
   - Data encryption

---

## Future Enhancements

### Phase 2 (Completed)
- [x] User authentication & profiles
- [x] Artist bio management
- [x] Multi-platform publishing

### Phase 3 (Backend & Payments)
- [ ] Backend API integration (REST/GraphQL)
- [ ] Database setup (PostgreSQL/MongoDB)
- [ ] JWT authentication with real API
- [ ] Payment integration (Stripe)
- [ ] Real-time notifications (WebSockets)
- [ ] Real-time messaging with backend

### Phase 4 (Advanced Features)
- [ ] Video/audio streaming
- [ ] Advanced search algorithms
- [ ] AI-powered artist recommendations
- [ ] Analytics dashboard
- [ ] Artist verification system

### Phase 5 (Mobile & Expansion)
- [ ] Mobile app (React Native)
- [ ] Live streaming capabilities
- [ ] Ticket system for events
- [ ] Virtual concert platform
- [ ] NFT integration
- [ ] Advanced collaboration tools
- [ ] Podcast hosting

---

## Extending the Codebase with New Features

### Best Practices for Feature Development

#### 1. **Adding a New Page/Route**

**Structure:**
```
app/
├── new-feature/
│   └── page.tsx
```

**Template:**
```typescript
'use client';

import Navigation from '@/components/Navigation';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function NewFeaturePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  return (
    <>
      <Navigation />
      <main className="pt-20 min-h-screen bg-black text-white">
        {/* Your content */}
      </main>
    </>
  );
}
```

**Key Points:**
- Add `'use client'` directive for client-side interactivity
- Check authentication with `useAuth()` hook
- Redirect unauthenticated users in `useEffect`
- Always include `Navigation` component
- Use consistent dark theme styling

#### 2. **Adding a Reusable Component**

**Structure:**
```
components/
├── NewComponent.tsx
```

**Template:**
```typescript
interface NewComponentProps {
  title: string;
  onAction: () => void;
}

export default function NewComponent({ title, onAction }: NewComponentProps) {
  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <button
        onClick={onAction}
        className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
      >
        Action
      </button>
    </div>
  );
}
```

**Best Practices:**
- Always define prop interfaces with TypeScript
- Use semantic HTML elements
- Apply Tailwind CSS utility classes
- Keep components focused and reusable
- Add clear prop descriptions in comments if complex

#### 3. **Extending AuthContext for New Features**

**When to extend:**
- Adding new user data fields
- Adding new authentication methods
- Adding new user permissions/roles

**Example - Adding a new method:**
```typescript
// In AuthContext.tsx

interface AuthContextType {
  // ... existing
  connectToAPI: (apiKey: string) => Promise<void>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // ... existing state

  const connectToAPI = async (apiKey: string) => {
    setIsLoading(true);
    try {
      if (user) {
        const updatedUser = {
          ...user,
          apiConnections: { ...user.apiConnections, connected: true }
        };
        localStorage.setItem('bandly_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ ..., connectToAPI }}>
      {children}
    </AuthContext.Provider>
  );
}
```

#### 4. **Adding New Type Definitions**

**Update `types/index.ts`:**
```typescript
export interface NewFeature {
  id: string;
  name: string;
  createdAt: Date;
  userId: string;
}
```

**Then use in components:**
```typescript
import { NewFeature } from '@/types';

const feature: NewFeature = {
  id: '1',
  name: 'Example',
  createdAt: new Date(),
  userId: 'user-1'
};
```

#### 5. **Backend Integration Pattern**

**When transitioning to backend:**

1. **Create API utility file:**
```typescript
// lib/api.ts
export async function fetchArtists() {
  const response = await fetch('/api/artists', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
}
```

2. **Update AuthContext:**
```typescript
const login = async (email: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  localStorage.setItem('token', data.token);
  setUser(data.user);
};
```

3. **Use in components:**
```typescript
import { fetchArtists } from '@/lib/api';

const [artists, setArtists] = useState([]);

useEffect(() => {
  fetchArtists().then(setArtists);
}, []);
```

### Feature Development Checklist

- [ ] Create necessary file structure (pages/components/types)
- [ ] Add TypeScript interfaces for all data
- [ ] Implement authentication checks if needed
- [ ] Add error handling and validation
- [ ] Include success/error user feedback
- [ ] Test on multiple screen sizes
- [ ] Run linting: `npm run lint`
- [ ] Ensure no TypeScript errors: `npm run typecheck`
- [ ] Update ARCHITECTURE.md with new feature
- [ ] Update routes table if adding routes

### Common Patterns

**Form Handling:**
```typescript
const [formData, setFormData] = useState({ field1: '', field2: '' });
const [errors, setErrors] = useState<Record<string, string>>({});

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setErrors({});
  
  // Validation
  if (!formData.field1) setErrors({ field1: 'Required' });
  
  // Submit
  try {
    await submitForm(formData);
    setSuccessMessage('Success!');
  } catch (error) {
    setErrors({ submit: 'Failed to submit' });
  }
};
```

**Modal Implementation:**
```typescript
const [showModal, setShowModal] = useState(false);

return (
  <>
    <button onClick={() => setShowModal(true)}>Open Modal</button>
    
    {showModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
        <div className="bg-gray-900 p-6 rounded-lg">
          <h2>Modal Content</h2>
          <button onClick={() => setShowModal(false)}>Close</button>
        </div>
      </div>
    )}
  </>
);
```

**Status Indicator:**
```typescript
const statusColors = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-green-500',
  error: 'bg-red-500'
};

<div className={`px-3 py-1 rounded-full text-sm ${statusColors[status]}`}>
  {status}
</div>
```

---

## Deployment

### Recommended Platforms
- **Vercel** (Recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Docker + Cloud Run**

### Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_API_URL=your_api_url
NEXT_PUBLIC_SPOTIFY_ID=your_spotify_id
```

---

## Troubleshooting

### Common Issues

**Issue**: Port 3000 already in use
```bash
npm run dev -- -p 3001
```

**Issue**: Module not found
```bash
npm install
```

**Issue**: TypeScript errors
```bash
npm run lint
```

---

## Contributing Guidelines

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Use Tailwind CSS for styling
4. Test components locally
5. Keep components reusable
6. Document complex logic

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

## License

This project is part of the Bandly platform.

---

## Support

For questions or issues, please refer to the project documentation or contact the development team.

---

**Last Updated**: December 2024
**Version**: 2.0.0
**Phase**: Phase 2 Complete - Authentication & Artist Bio Publishing
