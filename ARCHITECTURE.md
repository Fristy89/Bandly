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
│   ├── layout.tsx               # Root Layout
│   ├── globals.css              # Global Styles
│   ├── favicon.ico              # Favicon
│   ├── artists/                 # Artist Pages
│   │   ├── page.tsx            # Artist Listing & Search
│   │   └── [id]/
│   │       └── page.tsx        # Artist Detail Page
│   ├── bookings/                # Booking Pages
│   │   └── page.tsx            # Booking Management
│   └── content/                 # Content & Community
│       └── page.tsx            # Messages, Collaborations, Feed
├── components/                  # Reusable Components
│   └── Navigation.tsx           # Global Navigation Bar
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
RootLayout
├── Navigation
└── Page Components
    ├── Home
    ├── Artists Listing
    ├── Artist Detail
    ├── Bookings
    └── Content
```

### Data Flow

1. **Static Data**: Currently, all data is stored in component state using mock data
2. **User Interactions**: State updates trigger re-renders
3. **Navigation**: Next.js Router handles page navigation
4. **Forms**: Controlled components with local state management

### Future Backend Integration

For production, implement:
- REST API or GraphQL endpoints
- Database (PostgreSQL, MongoDB, etc.)
- Authentication system
- Real-time messaging (WebSockets)
- File upload handling for media

---

## Type Definitions

Located in `types/index.ts`, the following interfaces define the app's data structure:

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

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | `app/page.tsx` | Home Dashboard |
| `/artists` | `app/artists/page.tsx` | Artist Listing & Search |
| `/artists/[id]` | `app/artists/[id]/page.tsx` | Artist Details |
| `/bookings` | `app/bookings/page.tsx` | Booking Management |
| `/content` | `app/content/page.tsx` | Messages, Collaborations, Feed |

### Navigation Flow

```
Home (/) 
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

### Phase 2
- [ ] User authentication & profiles
- [ ] Payment integration (Stripe)
- [ ] Real-time notifications
- [ ] Video/audio streaming
- [ ] Advanced search algorithms

### Phase 3
- [ ] AI-powered artist recommendations
- [ ] Mobile app (React Native)
- [ ] Live streaming capabilities
- [ ] Ticket system for events
- [ ] Analytics dashboard

### Phase 4
- [ ] Virtual concert platform
- [ ] NFT integration
- [ ] Advanced collaboration tools
- [ ] Learning management system
- [ ] Podcast hosting

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
**Version**: 1.0.0
