# 🚀 NK Network - Powerful API Integrations & Cinematic Background Guide

## 📊 API Integration Overview

Your site now has access to powerful APIs across multiple categories. Here's how to leverage them:

---

## 🎨 **CINEMATIC BACKGROUND SYSTEM** (Already Implemented!)

### Components Added:

#### 1. **CinematicBackground.jsx** - Particle System
- **What it does**: Renders floating glowing particles that interact with each other
- **Features**:
  - 150+ animated particles with physics
  - Particles draw connecting lines when nearby
  - Smooth wobble motion for organic feel
  - Trail effect for depth
- **Customization**: Adjust in component:
  ```javascript
  const particleCount = Math.min(150, Math.floor(window.innerWidth / 20)); // Change particle count
  const dist = 100; // Distance for connection lines (smaller = more connections)
  ```

#### 2. **AnimeCharacterSilhouettes.jsx** - Dynamic Character Shadows
- **What it does**: Floating anime character silhouettes with glow effects
- **Features**:
  - 3 different character poses (warrior, dancer, mage)
  - Floating animation with rotation
  - Animated glow halos
  - Gradient fills for depth
- **Usage**: Add custom character SVGs:
  ```javascript
  const characters = [
    {
      id: 4,
      name: 'ninja',
      path: 'YOUR_SVG_PATH_HERE',
      top: '35%',
      right: '15%',
      delay: 1.5,
    },
  ];
  ```

#### 3. **LiquidBackground.jsx** - Wave Animation
- **What it does**: Smooth wave animations at bottom of screen
- **Features**:
  - 3 wave layers with different speeds
  - Color gradients (blue → purple → pink)
  - Semi-transparent for layering effect
- **Customize colors**: Update in component:
  ```javascript
  createWaveLayer('1', '8', '20', '#00d4ff'), // Change hex color
  ```

#### 4. **AudioVisualization.jsx** - Music Reactive Bars
- **What it does**: Frequency bars that react to audio (microphone or ambient)
- **Features**:
  - Real-time audio frequency analysis
  - 64-bar visualization
  - Fallback random animation if no audio
  - Gradient colors matching theme
- **Activate/deactivate**: `<AudioVisualization isActive={true} />`

### How They're Integrated:
All four are now in your `App.jsx` with z-index layering:
```jsx
<CinematicBackground />              {/* z: 0 - Particles */}
<AnimeCharacterSilhouettes />        {/* z: 0 - Silhouettes */}
<AudioVisualization isActive={true} /> {/* z: 0 - Audio bars */}
<LiquidBackground />                 {/* z: 0 - Wave */}
<div className="grid-background" />  {/* z: 10 - Grid overlay */}
<div className="nebula-bg" />        {/* z: 10 - Nebula */}
<div className="scanline-effect" />  {/* z: 20 - Scanlines */}
```

---

## 📡 **ANIME DATABASE APIs** (No API Key Required!)

### 1. **Jikan API** ⭐ RECOMMENDED
**URL**: https://jikan.moe/v4/

**Best for**: Complete anime database, free, no authentication

#### Available Functions:
```javascript
import { jikanAPI } from '../utils/animeAPIs';

// Search anime by title
const results = await jikanAPI.searchAnime('Attack on Titan');

// Get trending anime
const trending = await jikanAPI.getTrendingAnime();

// Get seasonal anime
const seasonal = await jikanAPI.getSeasonalAnime(2024, 'WINTER');

// Get detailed anime info with characters, episodes, etc.
const details = await jikanAPI.getAnimeDetails(1); // ID from search results

// Get reviews and user ratings
const reviews = await jikanAPI.getAnimeReviews(1);

// Random anime picker (for daily featured)
const random = await jikanAPI.getRandomAnime();
```

#### Use Cases in Your App:
- **Hub.jsx**: Daily featured anime from `getRandomAnime()`
- **Stream.jsx**: Enhance library with Jikan search results
- **News.jsx**: Auto-populate trending anime news
- **New Trending Page**: Display top 50 trending anime

#### Response Example:
```json
{
  "mal_id": 16498,
  "title": "Attack on Titan",
  "images": {
    "jpg": {
      "image_url": "https://cdn.myanimelist.net/images/anime/10/47347.jpg"
    }
  },
  "score": 8.54,
  "episodes": 75,
  "status": "Finished Airing",
  "members": 2500000,
  "genres": [
    { "mal_id": 1, "name": "Action" },
    { "mal_id": 32, "name": "Shounen" }
  ]
}
```

---

### 2. **AniList GraphQL API** ⭐ RECOMMENDED
**URL**: https://graphql.anilist.co

**Best for**: Rich data, seasonal info, character details, trending with real-time updates

#### Available Functions:
```javascript
import { anilistAPI } from '../utils/animeAPIs';

// Get trending anime
const trending = await anilistAPI.getTrendingAnime(page = 1);

// Get seasonal anime (auto-detects current season/year)
const seasonal = await anilistAPI.getSeasonalAnime();

// Get characters by anime
const characters = await anilistAPI.getCharactersByAnime(animeId);

// Search single anime
const search = await anilistAPI.searchAnime('Demon Slayer');

// Custom GraphQL query
const custom = await anilistAPI.query(`
  query {
    Page(perPage: 5) {
      media(sort: TRENDING_DESC, type: ANIME) {
        title { romaji }
        averageScore
      }
    }
  }
`);
```

#### Response Example:
```json
{
  "media": {
    "id": 139514,
    "title": { "romaji": "Jujutsu Kaisen" },
    "coverImage": { "large": "https://..." },
    "averageScore": 88,
    "episodes": 47,
    "nextAiringEpisode": { "airingAt": 1735689600 }
  }
}
```

---

## 🎬 **OPTIONAL POWER APIs** (Require Free API Keys)

### 1. **TMDB - The Movie Database**
**What**: Discover trending TV shows and movies worldwide

**Get Key**: https://www.themoviedb.org/settings/api (Free!)

**Setup**:
```bash
# Add to .env.local
REACT_APP_TMDB_API_KEY=your_api_key_here
```

**Use Cases**:
```javascript
import { tmdbAPI } from '../utils/animeAPIs';

// Trending TV shows globally
const trending = await tmdbAPI.getTrendingMedia();

// Search for shows
const results = await tmdbAPI.searchMedia('Dragon Ball');

// Get full details with recommendations
const details = await tmdbAPI.getMediaDetails(1399); // Breaking Bad ID
```

**Benefits**: Multi-region trending, recommendations, production companies

---

### 2. **YouTube Data API**
**What**: Search for anime trailers, opening songs, clips

**Get Key**: https://console.cloud.google.com/apis/library/youtube.googleapis.com

**Setup**:
```bash
# Use your existing Google Cloud project from Firebase!
# Just enable YouTube Data API v3
REACT_APP_YOUTUBE_API_KEY=your_api_key_here
```

**Use Cases**:
```javascript
import { youtubeAPI } from '../utils/animeAPIs';

// Search videos
const videos = await youtubeAPI.searchVideos('Attack on Titan Opening', 5);

// Get video details (views, likes, comments)
const details = await youtubeAPI.getVideoDetails('dQw4w9WgXcQ');

// Auto-fetch anime trailer
const trailerId = await youtubeAPI.getAnimeTrailer('Demon Slayer Season 4');
```

**Implementation Example**:
```jsx
// In Stream.jsx - Auto-load trailers
const loadTrailers = async (animeTitle) => {
  const trailerId = await youtubeAPI.getAnimeTrailer(animeTitle);
  return `https://www.youtube.com/embed/${trailerId}`;
};
```

---

### 3. **Twitch API** (Optional - For Anime Streamers)
**What**: Find live anime streams and streamers

**Get Credentials**: https://dev.twitch.tv/console/apps

**Setup**:
```bash
REACT_APP_TWITCH_CLIENT_ID=your_client_id
REACT_APP_TWITCH_ACCESS_TOKEN=your_access_token
```

**Use Cases**:
```javascript
import { twitchAPI } from '../utils/animeAPIs';

// Get live anime streams
const liveStreams = await twitchAPI.getLiveAnimeStreams();

// Search anime streamers
const streamers = await twitchAPI.searchChannels('anime');
```

---

## 🔧 **IMPLEMENTATION EXAMPLES**

### Example 1: Add Trending Section to Hub.jsx
```jsx
import { jikanAPI } from '../utils/animeAPIs';

// In your component:
const [featured, setFeatured] = useState(null);

useEffect(() => {
  const loadFeatured = async () => {
    const anime = await jikanAPI.getRandomAnime();
    setFeatured(anime);
  };
  loadFeatured();
}, []);

// In JSX:
{featured && (
  <div className="featured-card">
    <img src={featured.images.jpg.image_url} alt={featured.title} />
    <h3>{featured.title}</h3>
    <p>⭐ {featured.score} | 👥 {featured.members} members</p>
  </div>
)}
```

### Example 2: Search Anime Across Multiple Sources
```jsx
import { searchAnimeAcrossAPIs } from '../utils/animeAPIs';

const handleSearch = async (query) => {
  const results = await searchAnimeAcrossAPIs(query);
  // results.jikan, results.anilist, results.tmdb
  // Combine and deduplicate results
};
```

### Example 3: Add Trending Page
A ready-to-use `Trending.jsx` page is included! Just add to routes:
```jsx
// In App.jsx
import Trending from './pages/Trending';

<Route path="/trending" element={<Trending />} />
```

---

## 📦 **API RATE LIMITS & BEST PRACTICES**

| API | Rate Limit | Caching Strategy |
|-----|-----------|------------------|
| Jikan | 60 req/min | Cache results 1 hour |
| AniList | Generous (1000+/hour) | Cache 30 mins |
| TMDB | 40 req/10sec | Cache 24 hours |
| YouTube | 10,000 units/day | Cache video links 1 week |
| Twitch | Varies | Cache 5 mins |

### Implement Caching:
```javascript
const cache = new Map();
const CACHE_DURATION = 3600000; // 1 hour

export const cachedFetch = async (key, fetchFn) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.time < CACHE_DURATION) {
    return cached.data;
  }
  
  const data = await fetchFn();
  cache.set(key, { data, time: Date.now() });
  return data;
};

// Usage:
const trending = await cachedFetch('trending-anime', () => jikanAPI.getTrendingAnime());
```

---

## 🎯 **RECOMMENDED FEATURE ROADMAP**

### Phase 1: Foundation (Now ✅)
- ✅ Cinematic multi-layer backgrounds
- ✅ API utility functions created
- ✅ Jikan & AniList integrated (no auth needed)
- ✅ Trending page example created

### Phase 2: Enhanced Discovery
- [ ] Add TMDB API key → Show global trending
- [ ] Integrate Jikan search into Stream.jsx
- [ ] Create "Daily Featured Anime" from Jikan randomizer
- [ ] Add anime details modal (characters, reviews, stats)

### Phase 3: Social Features
- [ ] YouTube API → Trailer embeds
- [ ] Twitch API → Live anime streams section
- [ ] Community reviews from Jikan data

### Phase 4: Advanced
- [ ] Anime recommendations engine
- [ ] Genre-based filtering with charts
- [ ] Season picker (Winter/Spring/Summer/Fall)

---

## 🚨 **COMMON ISSUES & FIXES**

**Q: CORS errors with API calls?**
A: Use CORS proxy for development:
```javascript
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
const response = await fetch(CORS_PROXY + endpoint);
```

**Q: APIs returning empty data?**
A: Check browser console for actual errors, add error boundaries:
```javascript
try {
  const data = await jikanAPI.searchAnime(query);
  return data;
} catch (error) {
  console.error('API Error:', error);
  return [];
}
```

**Q: Background components causing performance issues?**
A: Toggle components in App.jsx:
```jsx
<CinematicBackground />              {/* Remove if slow */}
<AnimeCharacterSilhouettes />        {/* Remove if slow */}
<AudioVisualization isActive={false} /> {/* Set to false */}
```

---

## 📚 **RESOURCE LINKS**

- **Jikan API Docs**: https://docs.api.jikan.moe/
- **AniList GraphQL Playground**: https://anilist.co/graphiql
- **TMDB Documentation**: https://developers.themoviedb.org/3
- **YouTube Data API**: https://developers.google.com/youtube/v3
- **Twitch API**: https://dev.twitch.tv/docs/api

---

## 🎬 **NEXT STEPS**

1. **Test the new backgrounds** - Hard refresh and enjoy the cinematic feel
2. **Get one API key** - Start with TMDB (easiest) or YouTube
3. **Add to `.env.local`** - Update with your API keys
4. **Test integration** - Use provided example pages
5. **Customize** - Modify particle counts, colors, animations to match your style

**Questions?** Check the inline comments in `animeAPIs.js` and component files!
