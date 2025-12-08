# 🎵 Bandly - The Artist Booking Platform

A modern, all-in-one platform for discovering, booking, and connecting with talented musicians and artists worldwide.

## ✨ Features

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

| Route | Purpose |
|-------|---------|
| `/` | Home Dashboard |
| `/artists` | Artist Listing & Search |
| `/artists/[id]` | Artist Profile Details |
| `/bookings` | Booking Management |
| `/content` | Messages, Collaborations, Feed |

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
- `Artist` - Artist profile information
- `Booking` - Event booking details
- `ChatMessage` - Message in conversations
- `User` - User account information
- `Conversation` - Chat conversation data

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## 🛣️ Roadmap

### Phase 2
- User authentication & profiles
- Payment integration
- Real-time notifications
- Video streaming

### Phase 3
- AI recommendations
- Mobile app
- Live streaming
- Analytics dashboard

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

**Version**: 1.0.0  
**Last Updated**: December 2024
