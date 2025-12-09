# 🎵 Bandly - The Artist Booking Platform

A modern, all-in-one platform for discovering, booking, and connecting with talented musicians and artists worldwide.

## ✨ Features

### 🔐 **User Authentication**
- **Signup**: Create accounts with email, password, and account type selection (Artist, Booking Agent, Fan)
- **Login**: Secure email-based login with persistent sessions
- **Profile Management**: View and edit user information
- **Auto-generated Avatars**: DiceBear API integration for profile pictures
- **Session Persistence**: localStorage-based state management

### 🎵 **Artist Bio & Publishing**
- **Comprehensive Bio Editor**: 
  - Short and long bio fields
  - Genre tagging system
  - Years active tracking
  - Achievements and influences lists
  - Real-time auto-save
- **Multi-Platform Publishing**:
  - Connect to 5 platforms: Spotify, Instagram, SoundCloud, YouTube, TikTok
  - Manage connection status
  - Publish bio to multiple platforms simultaneously
  - Track publishing history and timestamps

### 🏠 **Home Dashboard**
- Welcome overview with featured artists
- Quick navigation to all major features
- Recent bookings summary
- Call-to-action buttons

### 🎤 **Artist Discovery**
- Browse and search for artists by name
- Filter by genre (Rock, Electronic, Jazz, R&B, Country, Hip-Hop)
- View artist ratings, followers, and verified status
- Quick access to detailed profiles

### 👤 **Artist Profiles**
- Comprehensive artist information with bio
- Audio samples showcase
- Customer reviews and ratings
- Availability calendar
- Social media links (Spotify, Instagram, SoundCloud)
- Direct booking options

### 📅 **Booking System**
- Create and manage event bookings
- Filter bookings by status (Pending, Confirmed, Completed)
- Track booking details (date, location, budget, duration)
- Cancel pending bookings
- Status indicators with color coding

### 💬 **Content Management & Community**
- **Messages Tab**: Real-time chat between artists and bookers
- **Collaborations Tab**: Manage collaboration projects with other artists
- **Feed Tab**: Share updates, samples, and announcements with the community

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17 or later
- npm or yarn package manager

### Installation

```bash
# Clone the repository
cd bandly

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Build for Production

```bash
npm run build
npm start
```

### Lint Code

```bash
npm run lint
```

## 📁 Project Structure

```
bandly/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Home Dashboard
│   ├── layout.tsx           # Root Layout
│   ├── artists/             # Artist Pages
│   ├── bookings/            # Booking Pages
│   └── content/             # Content & Community
├── components/              # Reusable Components
│   └── Navigation.tsx       # Global Navigation
├── types/                   # TypeScript Interfaces
├── ARCHITECTURE.md          # Detailed Architecture Documentation
└── package.json             # Dependencies & Scripts
```

## 🎨 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) - React framework for production
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS
- **Runtime**: [React 19](https://react.dev/) - Modern React features

## 📖 Documentation

For detailed architecture and feature documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md).

### Key Sections:
- Project structure and organization
- Feature breakdown and implementations
- Type definitions and interfaces
- Data flow and state management
- Performance optimization tips
- Security considerations
- Deployment guidelines

## 🎯 Routes

| Route | Purpose | Auth Required |
|-------|---------|---|
| `/` | Home Dashboard | No |
| `/login` | User Login | No |
| `/signup` | User Registration | No |
| `/profile` | User Profile Management | Yes |
| `/artist-bio` | Artist Bio & Publishing | Yes (Artists only) |
| `/artists` | Artist Listing & Search | No |
| `/artists/[id]` | Artist Profile Details | No |
| `/bookings` | Booking Management | Yes |
| `/content` | Messages, Collaborations, Feed | Yes |

## 🔧 Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## 🎨 Design Highlights

- **Dark Theme**: Sleek dark mode optimized for artists
- **Gradient Accents**: Purple and pink gradients for modern look
- **Responsive Design**: Mobile-first, works on all devices
- **Interactive Components**: Smooth transitions and hover effects
- **Accessibility**: Semantic HTML and proper contrast ratios

## 📊 Features by Page

### Login & Signup
**Login (/login)**
- Email-based authentication
- Form validation
- Persistent session
- Error messaging
- Redirect after login

**Signup (/signup)**
- User account creation
- Account type selection
- Password confirmation
- Email validation
- Auto profile creation with avatar

### Profile Management
**Profile (/profile)**
- View profile information
- Edit name, email, bio
- Account type display
- Member since date
- Link to artist bio (for artists)
- Real-time save with feedback

**Artist Bio (/artist-bio)**
- Bio information editor
  - Short bio (100 char limit)
  - Long bio
  - Genre tags
  - Years active
  - Achievements list
  - Influences list
- Platform connection manager
  - Connect: Spotify, Instagram, SoundCloud, YouTube, TikTok
  - View connection status
  - Publish to multiple platforms
  - Track publishing history

### Home (/)
- Featured artists carousel
- Recent bookings overview
- Quick stats and metrics
- Easy navigation to main features

### Artists (/artists)
- Real-time search functionality
- Genre-based filtering
- Artist card display with ratings
- Link to detailed profiles

### Artist Detail (/artists/[id])
- Complete artist information
- Audio sample player
- Customer reviews section
- Availability display
- Social media integration
- Booking button

### Bookings (/bookings)
- Booking list with filters
- Create new booking modal
- Status tracking
- Booking management actions
- Activity history

### Content (/content)
**Messages Tab:**
- Conversation list
- Real-time messaging
- Unread indicators
- Search conversations

**Collaborations Tab:**
- Active projects
- Project management
- Collaborator tracking
- Create new projects

**Feed Tab:**
- Community posts
- Share updates
- Like and comment
- Engagement metrics

## 🔐 Security Notes

This is a frontend template. For production deployment, implement:
- User authentication (JWT, OAuth)
- API key protection
- Data validation and sanitization
- CORS configuration
- Rate limiting
- Database security

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Other Platforms
- Netlify
- AWS Amplify
- Docker + Cloud Run
- Any Node.js hosting

## 📝 Type Safety

The project uses TypeScript with strict mode enabled. Key interfaces include:
- `UserProfile` - User account with auth data and artist bio (AuthContext)
- `Artist` - Artist profile information
- `Booking` - Event booking details
- `ChatMessage` - Message in conversations
- `User` - User account information
- `Conversation` - Chat conversation data

### State Management with Context API
- **AuthContext**: Manages global authentication state, user profiles, artist bio data, and platform connections
- Uses localStorage for persistent sessions
- Provides hooks (`useAuth()`) for easy integration across all components

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## 🛣️ Roadmap

### Phase 2 ✅ (Completed)
- ✅ User authentication & profiles
- ✅ Artist bio management
- ✅ Multi-platform publishing

### Phase 3 (Backend & Payments)
- Backend API integration (REST/GraphQL)
- Database setup (PostgreSQL/MongoDB)
- Payment integration (Stripe)
- Real-time notifications
- Real-time messaging backend

### Phase 4 (Advanced Features)
- Video/audio streaming
- Advanced search algorithms
- AI-powered recommendations
- Analytics dashboard
- Artist verification system

### Phase 5 (Mobile & Expansion)
- Mobile app (React Native)
- Live streaming
- Ticket system for events
- Virtual concert platform
- NFT integration

## 💡 Contributing

To contribute to Bandly:

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Use Tailwind CSS for styling
4. Test components locally
5. Keep components reusable

## 📄 License

This project is part of the Bandly platform.

## 📧 Support

For questions or issues, please refer to the [ARCHITECTURE.md](./ARCHITECTURE.md) documentation.

---

**Built with ❤️ for musicians and artists worldwide**

**Version**: 2.0.0  
**Last Updated**: December 2024  
**Current Phase**: Phase 2 Complete - Authentication & Artist Publishing
