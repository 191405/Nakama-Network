# Nakama Network - The Hidden Layer of Anime

A next-generation anime streaming and community platform with AI-powered features and gamification.

## 🌟 Features

### Core Features
- ✅ **Epic Entry Animation** - Motion magic intro before entering the site
- ✅ **Authentication System** - Firebase-powered login (Google OAuth & Anonymous)
- ✅ **The Hub (Dashboard)** - User stats, daily prophecy, and rank system
- ✅ **Stream-X** - Video streaming with AI Sensei & Ghost Mode commentary
- ✅ **The Arena** - AI trivia battles with real-time ranking updates
- ✅ **Clan HQ** - AI-powered clan name & motto generator
- ✅ **The Oracle** - AI chatbot for anime recommendations
- ✅ **Marketplace** - Premium-only trading platform (coming soon)
- ✅ **Anime News** - Latest updates from the community
- ✅ **Live User Count** - Real-time global active users
- ✅ **Public Announcements** - Platform-wide notifications

### Ranking System (14 Tiers)
1. Mere User
2. User
3. Unranked
4. Ranked
5. Bronze Badge User
6. Silver Badge User
7. Golden Badge User
8. Diamond Badge User
9. Berserker
10. Sage Mode
11. Global Ranker (Ranks 1-10)
12. God Level User
13. Immortal

### AI Features (Powered by Google Gemini)
- **AI Sensei** - Cultural context and trope explanations
- **Ghost Mode** - Character-based live commentary
- **Daily Prophecy** - Cryptic anime-style fortunes
- **The Oracle** - AI chatbot for recommendations
- **Clan Generator** - Personalized clan creation
- **Trivia Generator** - Dynamic anime trivia questions

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS with custom animations
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Backend**: Firebase (Auth, Firestore, Storage)
- **AI**: Google Gemini API (Flash model)
- **Routing**: React Router DOM v6

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project
- Google Gemini API key

### Setup Steps

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd nakama-network-halfmoon
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google Gemini API
VITE_GEMINI_API_KEY=your_gemini_api_key
```

4. **Firebase Setup**

- Go to [Firebase Console](https://console.firebase.google.com/)
- Create a new project
- Enable Authentication (Google & Anonymous)
- Create a Firestore database
- Enable Storage
- Copy your config to `.env`

5. **Gemini API Setup**

- Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
- Create an API key
- Add it to your `.env` file

## 🚀 Running the Project

### Development Mode
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173)

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🌐 Deployment

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## 📁 Project Structure

```
nakama-network-halfmoon/
├── src/
│   ├── components/       # Reusable components
│   │   ├── EntryAnimation.jsx
│   │   ├── Login.jsx
│   │   └── Navbar.jsx
│   ├── pages/           # Main pages
│   │   ├── Hub.jsx
│   │   ├── Stream.jsx
│   │   ├── Arena.jsx
│   │   ├── Clan.jsx
│   │   ├── Oracle.jsx
│   │   ├── Marketplace.jsx
│   │   └── News.jsx
│   ├── contexts/        # React contexts
│   │   └── AuthContext.jsx
│   ├── utils/           # Utility functions
│   │   ├── firebase.js
│   │   └── gemini.js
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── .env.example         # Environment template
├── index.html           # HTML template
├── package.json         # Dependencies
├── tailwind.config.js   # Tailwind configuration
├── vite.config.js       # Vite configuration
└── README.md           # Documentation
```

## 🎨 Design System

### Color Palette
- **Cyber Black**: `#030014` - Main background
- **Neon Blue**: `#00d4ff` - Primary accent
- **Neon Purple**: `#b400ff` - Secondary accent
- **Neon Pink**: `#ff00ea` - Tertiary accent
- **Void Gray**: `#1a1a2e` - Surface color

### Animations
- Nebula movement
- Floating elements
- Glitch effects
- Scanlines
- Pulse glow

## 🔐 Security Notes

- Never commit `.env` file
- Use Firebase Security Rules
- Implement rate limiting for AI API calls
- Validate all user inputs
- Use HTTPS in production

## 🚧 Upcoming Features

- [ ] Mobile app download (coming soon)
- [ ] User channels for anime uploads
- [ ] Download anime functionality
- [ ] Premium subscription system
- [ ] Advanced marketplace features
- [ ] Social features (comments, likes, shares)
- [ ] Achievement system
- [ ] Clan battles
- [ ] Watch parties

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Opera

## 🐛 Known Issues

- Entry animation may lag on slower devices
- AI responses depend on API availability
- Real-time features require stable internet connection

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for learning and development.

## 🙏 Acknowledgments

- Google Gemini for AI capabilities
- Firebase for backend infrastructure
- Tailwind CSS for styling
- Lucide React for icons
- Framer Motion for animations

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

**Built with ⚡ by Nakama Network Team**

*"Unlock Your Hidden Chakra Potential"*
