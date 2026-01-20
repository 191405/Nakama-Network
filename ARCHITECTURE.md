# 🏗️ NK Network - Architecture & System Design

## Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     NK NETWORK - FULL STACK                     │
└─────────────────────────────────────────────────────────────────┘

LAYER 1: USER INTERFACE (React Components)
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    App.jsx (Router)                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│        ┌─────────────────────┼─────────────────────┐            │
│        ▼                     ▼                     ▼            │
│   ┌─────────┐         ┌─────────────┐      ┌──────────────┐   │
│   │  Pages  │         │ Components  │      │ Backgrounds  │   │
│   ├─────────┤         ├─────────────┤      ├──────────────┤   │
│   │ • Hub   │         │ • Navbar    │      │ • Particles  │   │
│   │ • Stream│         │ • Login     │      │ • Silhouette │   │
│   │ • Arena │         │ • Animations│      │ • Waves      │   │
│   │ • Clan  │         │ • Cards     │      │ • Audio Viz  │   │
│   │ • Oracle│         │ • Modals    │      │              │   │
│   │ • News  │         │             │      │              │   │
│   │ • Trend │         │             │      │              │   │
│   └─────────┘         └─────────────┘      └──────────────┘   │
└─────────────────────────────────────────────────────────────────┘

LAYER 2: STATE MANAGEMENT (Contexts & Hooks)
┌─────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────┐    │
│  │           AuthContext.jsx (Global Auth)                │    │
│  │  ┌──────────────┬──────────────┬──────────────┐         │    │
│  │  │ Firebase Auth│ Local Dev Auth│ User Profile│         │    │
│  │  └──────────────┴──────────────┴──────────────┘         │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Custom Hooks (useAuth, useProfile, etc)               │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘

LAYER 3: BUSINESS LOGIC (Utils & Services)
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌──────────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │  firebase.js     │  │  gemini.js   │  │  animeAPIs.js    │ │
│  │  (50+ functions) │  │  (AI Engine) │  │  (7 data sources)│ │
│  ├──────────────────┤  ├──────────────┤  ├──────────────────┤ │
│  │ • Auth           │  │ • Oracle Chat│  │ • Jikan          │ │
│  │ • Database CRUD  │  │ • Prophecies │  │ • AniList        │ │
│  │ • User Profiles  │  │ • AI Sensei  │  │ • TMDB           │ │
│  │ • Leaderboards   │  │ • Clan Gen   │  │ • YouTube        │ │
│  │ • Marketplace    │  │ • Trivia     │  │ • Twitch         │ │
│  │ • Clan Mgmt      │  │ • Mood-based │  │ • RapidAPI       │ │
│  └──────────────────┘  └──────────────┘  └──────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Cache & Optimization Layer                  │  │
│  │  • API response caching (1-24 hours)                     │  │
│  │  • Image lazy loading                                    │  │
│  │  • Component code splitting                              │  │
│  │  • Service Worker (future PWA support)                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

LAYER 4: EXTERNAL SERVICES (APIs & Databases)
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                   │
│  │  FIREBASE         │  │  GOOGLE CLOUD    │                   │
│  ├──────────────────┤  ├──────────────────┤                   │
│  │ • Auth           │  │ • Gemini API     │                   │
│  │ • Firestore      │  │ • Identity Kit   │                   │
│  │ • Storage        │  │ • Cloud Func     │                   │
│  └──────────────────┘  └──────────────────┘                   │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   ANIME      │  │   STREAMING  │  │   SOCIAL     │         │
│  │   DATABASES  │  │   PLATFORMS  │  │   NETWORKS   │         │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤         │
│  │ • Jikan      │  │ • YouTube    │  │ • Discord    │         │
│  │ • AniList    │  │ • Twitch     │  │ • Twitter    │         │
│  │ • TMDB       │  │ • Crunchyroll│  │ • MyAnimeList│         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

LAYER 5: DEPLOYMENT & INFRASTRUCTURE
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Frontend CDN (Vercel/Netlify)  →  Served worldwide            │
│  Backend (Firebase)              →  Handles all data/auth       │
│  Media (Firebase Storage)        →  Images/videos hosted        │
│  Analytics (Firebase Analytics) →  Track user behavior          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Architecture

```
USER ACTION
    │
    ▼
┌─────────────────────┐
│  React Component    │
│  (e.g., Hub.jsx)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  Determine Data Needed                  │
├─────────────────────────────────────────┤
│ 1. Local state? → setState()            │
│ 2. Global state? → useAuth()            │
│ 3. API call? → animeAPIs.js             │
│ 4. DB query? → firebase.js              │
└──────────┬──────────────────────────────┘
           │
           ▼
┌──────────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Local Cache Check   │  │ Global State     │  │ External API     │
│ (if API call)        │  │ (Firebase)       │  │ (Jikan, TMDB)    │
├──────────────────────┤  ├──────────────────┤  ├──────────────────┤
│ Cache hit?           │  │ Already loaded?  │  │ Call endpoint    │
│ YES → Return cached  │  │ YES → Return     │  │ Transform data   │
│ NO  → Fetch new      │  │ NO  → Query DB   │  │ Return results   │
└──────────┬───────────┘  └──────────┬───────┘  └────────┬─────────┘
           │                        │                   │
           └────────────┬───────────┴───────────────────┘
                        │
                        ▼
            ┌──────────────────────────┐
            │  Receive Data            │
            │  (API/Cache/DB)          │
            └──────────────┬───────────┘
                           │
                           ▼
            ┌──────────────────────────┐
            │  Process/Transform Data  │
            │  • Parse JSON            │
            │  • Filter/sort           │
            │  • Handle errors         │
            └──────────────┬───────────┘
                           │
                           ▼
            ┌──────────────────────────┐
            │  Update Component State  │
            │  setState() or update    │
            │  context                 │
            └──────────────┬───────────┘
                           │
                           ▼
            ┌──────────────────────────┐
            │  Re-render Component     │
            │  Display new data        │
            │  Update animations       │
            └──────────────────────────┘
```

---

## API Integration Ecosystem

```
NK NETWORK ANIME API HUB
│
├─ FREE APIS (No Authentication)
│  ├─ Jikan API (https://jikan.moe)
│  │  ├─ Anime search
│  │  ├─ Trending data
│  │  ├─ Character info
│  │  └─ Reviews
│  │
│  └─ AniList GraphQL (https://graphql.anilist.co)
│     ├─ Trending anime
│     ├─ Seasonal data
│     ├─ Character details
│     └─ User statistics
│
├─ GOOGLE CLOUD APIS (Firebase Project)
│  ├─ Firebase Authentication
│  │  ├─ Google OAuth
│  │  └─ Anonymous auth
│  │
│  ├─ Firestore Database
│  │  ├─ User profiles
│  │  ├─ Battle records
│  │  ├─ Clan data
│  │  └─ Marketplace items
│  │
│  ├─ Firebase Storage
│  │  ├─ User avatars
│  │  ├─ Anime uploads
│  │  └─ Custom artwork
│  │
│  ├─ Google Gemini API
│  │  ├─ Oracle AI chat
│  │  ├─ Clan generation
│  │  ├─ Prophecies
│  │  └─ Trivia questions
│  │
│  ├─ YouTube Data API (Optional)
│  │  ├─ Video search
│  │  ├─ Trailer embeds
│  │  └─ View statistics
│  │
│  └─ Google Identity Toolkit
│     └─ Secure authentication
│
├─ OPTIONAL POWER APIS
│  ├─ TMDB (https://www.themoviedb.org)
│  │  ├─ Global trending
│  │  ├─ Recommendations
│  │  └─ Cast information
│  │
│  ├─ Twitch API (https://dev.twitch.tv)
│  │  ├─ Live streams
│  │  ├─ Streamer data
│  │  └─ Channel info
│  │
│  └─ RapidAPI Hub
│     ├─ Anime quotes
│     ├─ Character data
│     └─ Trivia content
│
└─ USER DATA SOURCES
   ├─ MyAnimeList (Future integration)
   ├─ Discord (OAuth login)
   └─ Twitter (Share functionality)
```

---

## Component Hierarchy

```
App (Router)
│
├─ EntryAnimation
│
├─ Login
│  └─ Google OAuth Button
│
└─ AppContent (Protected)
   │
   ├─ BACKGROUND LAYERS (z-index 0-20)
   │  ├─ CinematicBackground (Particles)
   │  ├─ AnimeCharacterSilhouettes (Shadows)
   │  ├─ AudioVisualization (Bars)
   │  ├─ LiquidBackground (Waves)
   │  ├─ GridBackground (Pattern)
   │  ├─ NebulaBackground (Gradient)
   │  └─ ScanlineEffect (CRT)
   │
   ├─ Navbar
   │  ├─ Logo
   │  ├─ NavLinks
   │  ├─ UserProfile
   │  └─ MobileMenu
   │
   └─ Routes
      ├─ /hub → Hub
      │  ├─ StatsCard
      │  ├─ ProphecyPanel
      │  ├─ Leaderboard
      │  └─ Announcements
      │
      ├─ /stream → Stream
      │  ├─ YouTubePlayer
      │  ├─ AnimeLibrary
      │  ├─ AISensei
      │  └─ GhostMode
      │
      ├─ /arena → Arena
      │  ├─ TriviaQuiz
      │  ├─ Leaderboard
      │  └─ BattleStats
      │
      ├─ /clan → Clan
      │  ├─ ClanForm
      │  └─ ClanDisplay
      │
      ├─ /oracle → Oracle
      │  ├─ ChatWindow
      │  ├─ MessageBubbles
      │  └─ InputBox
      │
      ├─ /marketplace → Marketplace
      │  ├─ ListingForm
      │  ├─ ListingGrid
      │  └─ PremiumGate
      │
      ├─ /news → News
      │  ├─ FeaturedNews
      │  ├─ NewsGrid
      │  └─ CategoryFilter
      │
      └─ /trending → Trending
         ├─ AnimeGrid
         ├─ FilterBar
         └─ PaginationControls
```

---

## Security & Authentication Flow

```
USER VISITS SITE
    │
    ▼
┌──────────────────────────────────┐
│  AuthContext (Root Provider)     │
│  • Check localStorage             │
│  • Load session if available      │
└─────────────┬────────────────────┘
              │
        ┌─────┴─────┐
        ▼           ▼
    [Local Dev]  [Firebase]
        │           │
    ┌───┴─────┐   ┌─────────────────────────┐
    │ localStorage│   onAuthStateChanged()   │
    │ • isAuth  │   • Check user session    │
    │ • user    │   • Validate token        │
    │ • token   │   • Refresh if needed     │
    └───┬─────┘   └────────────┬────────────┘
        │                      │
        └──────────┬───────────┘
                   ▼
         ┌─────────────────────┐
         │ Is Authenticated?   │
         └──────────┬──────────┘
                   /│\
          ┌────────┘ │ └────────┐
          │          │          │
        ❌ NO     🤔 CHECKING  ✅ YES
          │          │          │
          ▼          ▼          ▼
        LOGIN   LOADING      CONTENT
                SPINNER
                   │
              (Wait for auth)
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
      LOGIN                CONTENT
    (Redirect)             (Show)
```

---

## Performance Architecture

```
OPTIMIZATION LAYERS

┌─ Code Splitting
│  ├─ Entry point (App.jsx)
│  ├─ Page bundles (lazy loaded)
│  └─ Component bundles (on demand)
│
├─ Caching Strategy
│  ├─ API responses (1-24 hours)
│  ├─ Images (CloudFront CDN)
│  ├─ JavaScript (Browser cache)
│  └─ CSS (Browser cache)
│
├─ Database Optimization
│  ├─ Firestore indices (auto)
│  ├─ Query limitations (first 50)
│  └─ Real-time listeners (selective)
│
├─ Component Optimization
│  ├─ React.memo for pure components
│  ├─ useCallback for function stability
│  ├─ useMemo for computed values
│  └─ useReducer for complex state
│
├─ Animation Optimization
│  ├─ GPU-accelerated transforms
│  ├─ Will-change CSS hints
│  ├─ RequestAnimationFrame for canvas
│  └─ RequestIdleCallback for heavy work
│
└─ Monitoring
   ├─ Lighthouse audits
   ├─ WebVitals tracking
   ├─ Firebase analytics
   └─ Error logging (Sentry)
```

---

## Deployment Architecture

```
Source Code → Git Repository
    │
    ▼
GitHub/GitLab
    │
    ├─ Push trigger
    │
    ▼
┌──────────────────────────┐
│ CI/CD Pipeline (GitHub   │
│ Actions / Vercel)        │
│ • Run tests              │
│ • Build project          │
│ • Run linters            │
│ • Check build size       │
└────────────┬─────────────┘
             │
        ┌────┴─────┐
        ▼          ▼
    ❌ FAIL    ✅ PASS
        │          │
        │          ▼
        │    ┌──────────────────────┐
        │    │  Build Artifact      │
        │    │ (Optimized bundle)   │
        │    └──────────────┬───────┘
        │                   │
        │                   ▼
        │    ┌──────────────────────┐
        │    │  Deploy to CDN       │
        │    │ (Vercel/Netlify)     │
        │    └──────────────┬───────┘
        │                   │
        │                   ▼
        │    ┌──────────────────────┐
        │    │  Global Distribution │
        │    │ (Edge locations)     │
        │    └──────────────┬───────┘
        │                   │
        │                   ▼
        │    ┌──────────────────────┐
        │    │ User Gets Site       │
        │    │ (Fast, cached)       │
        │    └──────────────────────┘
        │
        ▼
    Notify Team
    (Slack/Email)
```

---

## Technology Stack Summary

```
FRONTEND
├─ React 18
├─ Vite (build)
├─ Tailwind CSS (styling)
├─ Framer Motion (animations)
├─ React Router (navigation)
└─ Lucide React (icons)

STATE & CONTEXT
├─ React Context API
├─ Custom Hooks
└─ localStorage

BACKEND & DATA
├─ Firebase Authentication
├─ Firestore Database
├─ Firebase Storage
└─ Google Cloud Functions

AI & INTELLIGENCE
├─ Google Gemini API (LLM)
├─ OpenAI API (future)
└─ Custom prompt engineering

EXTERNAL APIS
├─ Jikan API (anime data)
├─ AniList GraphQL (metadata)
├─ TMDB API (trending)
├─ YouTube Data API (videos)
├─ Twitch API (streams)
└─ RapidAPI Hub

DEVELOPMENT
├─ npm/yarn (package manager)
├─ ESLint (linting)
├─ Prettier (formatting)
├─ VS Code (IDE)
└─ Git (version control)

DEPLOYMENT
├─ Vercel (recommended) OR Netlify
├─ GitHub Actions (CI/CD)
├─ Firebase Hosting (alternative)
└─ Custom domain (DNS)

MONITORING & ANALYTICS
├─ Firebase Analytics
├─ Sentry (error tracking)
├─ Google Analytics
└─ Lighthouse (performance)
```

---

## Data Models

### User Profile
```javascript
{
  uid: string,                    // Firebase UID
  email: string,
  displayName: string,
  avatar: string,                 // Storage URL
  rank: string,                   // "Newbie", "Shinobi", etc (14 tiers)
  chakra: number,                 // Energy currency
  xp: number,                      // Experience points
  clan: string,                    // Clan name
  isPremium: boolean,
  stats: {
    wins: number,
    losses: number,
    winRate: number
  },
  createdAt: timestamp,
  lastActiveAt: timestamp
}
```

### Anime Item
```javascript
{
  id: string,                      // Unique ID
  title: string,
  description: string,
  coverImage: string,              // URL
  genres: string[],
  year: number,
  rating: number,                  // Out of 10
  views: number,                   // View count
  downloads: number,               // Download count
  episodes: number,
  status: string,                  // "Airing", "Finished"
  members: number,                 // Community members
  uploadedBy: string,              // User UID
  uploadedAt: timestamp
}
```

### Clan
```javascript
{
  id: string,
  name: string,
  description: string,
  motto: string,
  color: string,                   // Hex color
  members: string[],               // Array of UIDs
  leader: string,                  // User UID
  level: number,
  stats: {
    wins: number,
    losses: number,
    totalChakra: number
  },
  createdAt: timestamp
}
```

---

This architecture ensures:
✅ Scalability - Can handle growth
✅ Performance - Fast load times
✅ Security - Protected data
✅ Maintainability - Clean code
✅ Extensibility - Easy to add features

**Last Updated**: November 29, 2025
**Version**: 2.0 (with cinematic backgrounds & APIs)
