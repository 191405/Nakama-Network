# Nakama Network - Complete Setup Guide

## 🎯 Quick Setup (5 Minutes)

Follow these steps to get Nakama Network running on your local machine:

### Step 1: Install Dependencies

```bash
cd nakama-network-halfmoon
npm install
```

### Step 2: Setup Firebase

1. **Create Firebase Project**
   - Go to https://console.firebase.google.com/
   - Click "Add Project"
  - Enter project name: `nakama-network-halfmoon`
   - Disable Google Analytics (optional)
   - Click "Create Project"

2. **Enable Authentication**
   - Go to "Authentication" in left sidebar
   - Click "Get Started"
   - Enable **Google** sign-in
     - Click Google
     - Toggle "Enable"
     - Add your email as test user
     - Click "Save"
   - Enable **Anonymous** sign-in
     - Click Anonymous
     - Toggle "Enable"
     - Click "Save"

3. **Create Firestore Database**
   - Go to "Firestore Database" in left sidebar
   - Click "Create Database"
   - Choose "Start in test mode"
   - Select location closest to you
   - Click "Enable"

4. **Enable Storage**
   - Go to "Storage" in left sidebar
   - Click "Get Started"
   - Click "Next" then "Done"

5. **Get Firebase Config**
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps"
   - Click web icon (</>)
   - Register app with nickname: "NK Network Web"
   - Copy the `firebaseConfig` object values

### Step 3: Setup Google Gemini API

1. **Get API Key**
   - Go to https://makersuite.google.com/app/apikey
   - Click "Create API Key"
   - Select project or create new one
   - Copy the API key

### Step 4: Configure Environment Variables

1. **Create .env file**
```bash
cp .env.example .env
```

2. **Edit .env file** with your values:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### Step 5: Run the Application

```bash
npm run dev
```

Open http://localhost:5173 in your browser 🚀

## 📋 Detailed Setup Instructions

### Firebase Security Rules Setup

After basic setup, configure security rules:

#### Firestore Rules

1. Go to Firestore Database > Rules
2. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    match /animes/{animeId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth.uid == resource.data.uploaderId;
    }
    
    match /marketplace/{listingId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
    
    match /news/{newsId} {
      allow read: if request.auth != null;
    }
    
    match /announcements/{announcementId} {
      allow read: if request.auth != null;
    }
  }
}
```

3. Click "Publish"

#### Storage Rules

1. Go to Storage > Rules
2. Replace with these rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /animes/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

3. Click "Publish"

### Testing the Setup

1. **Test Authentication**
   - Click "Continue with Google" or "Enter as Guest"
   - You should be redirected to The Hub

2. **Test AI Features**
   - Go to The Oracle
   - Send a message
   - You should receive an AI response

3. **Test Trivia**
   - Go to The Arena
   - Click "Start Duel"
   - Answer a question

4. **Test Clan Generator**
   - Go to Clan HQ
   - Fill in your vibe and interests
   - Click "Generate Clan"

## 🔧 Troubleshooting

### Firebase Errors

**Error: "Firebase: Error (auth/unauthorized-domain)"**
- Solution: Add `localhost` and your domain to Firebase Console > Authentication > Settings > Authorized domains

**Error: "Missing or insufficient permissions"**
- Solution: Check Firestore security rules are properly configured

**Error: "Failed to get document because the client is offline"**
- Solution: Check internet connection and Firebase configuration

### Gemini API Errors

**Error: "API key not valid"**
- Solution: Verify your API key in .env file
- Make sure it starts with `AIzaSy`
- Check API key is enabled in Google Cloud Console

**Error: "Quota exceeded"**
- Solution: You've hit the free tier limit
- Wait for quota to reset or upgrade to paid tier

### Build Errors

**Error: "Cannot find module 'react'"**
```bash
npm install react react-dom
```

**Error: "Tailwind classes not working"**
```bash
npm install -D tailwindcss postcss autoprefixer
```

**Error: "Failed to resolve import"**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

## 🎨 Customization

### Change Theme Colors

Edit `tailwind.config.js`:

```javascript
colors: {
  'cyber-black': '#030014',  // Main background
  'neon-blue': '#00d4ff',    // Primary
  'neon-purple': '#b400ff',  // Secondary
  'neon-pink': '#ff00ea',    // Accent
}
```

### Add Sample Data

Create sample announcements and news in Firestore:

1. Go to Firestore Database
2. Create collection `announcements`
3. Add document with fields:
   - title: "Welcome to NK Network!"
   - message: "Your anime journey begins now"
   - timestamp: (current date/time)

### Configure Premium Features

Set user as premium in Firestore:

1. Go to users collection
2. Find your user document
3. Add field: `isPremium: true`

## 📱 Mobile App Placeholder

The "Download Mobile App" button is currently a placeholder. To implement:

1. Build mobile app with React Native
2. Upload to App Store / Play Store
3. Update button with actual download links

## 🚀 Next Steps

1. ✅ Setup complete! Your app is running
2. 📝 Customize the design and features
3. 🔐 Configure production security rules
4. 🌐 Deploy to production (see DEPLOYMENT.md)
5. 📊 Add analytics and monitoring
6. 🎯 Build premium features
7. 📱 Develop mobile app

## 💡 Pro Tips

- Use Chrome DevTools to debug
- Check Firebase Console for usage stats
- Monitor Gemini API quota usage
- Test on mobile devices
- Use incognito mode to test anonymous auth
- Keep dependencies updated

## 📚 Learning Resources

- [React Documentation](https://react.dev)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Gemini API Docs](https://ai.google.dev/docs)

## 🆘 Getting Help

- Check the README.md for feature documentation
- Review DEPLOYMENT.md for deployment issues
- Open an issue on GitHub
- Check Firebase Console logs
- Review browser console for errors

---

**Congratulations!** 🎉 You're now running NK Network locally!

*"The Hidden Layer Awaits..."*
