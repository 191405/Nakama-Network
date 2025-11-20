# NK Network - Deployment Guide

## Quick Start Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
vercel
```

3. **Add Environment Variables in Vercel Dashboard**
- Go to your project settings
- Navigate to "Environment Variables"
- Add all variables from `.env.example`

### Option 2: Netlify

1. **Install Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **Build the project**
```bash
npm run build
```

3. **Deploy**
```bash
netlify deploy --prod
```

4. **Set Environment Variables**
```bash
netlify env:set VITE_FIREBASE_API_KEY "your_key"
netlify env:set VITE_GEMINI_API_KEY "your_key"
# Add all other variables
```

### Option 3: Firebase Hosting

1. **Install Firebase CLI**
```bash
npm install -g firebase-tools
```

2. **Login to Firebase**
```bash
firebase login
```

3. **Initialize Firebase Hosting**
```bash
firebase init hosting
```
- Choose your Firebase project
- Set public directory to `dist`
- Configure as single-page app: Yes
- Set up automatic builds: Optional

4. **Build and Deploy**
```bash
npm run build
firebase deploy
```

## Environment Variables Setup

### Required Variables

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Google Gemini API
VITE_GEMINI_API_KEY=AIzaSy...
```

### Getting Your Keys

#### Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project" or select existing project
3. Go to Project Settings > General
4. Scroll to "Your apps" section
5. Click "Web" icon (</>)
6. Register your app
7. Copy the configuration values

#### Gemini API Setup
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Select your project or create new
4. Copy the API key

## Firebase Security Setup

### Firestore Rules

Create these rules in Firebase Console > Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Animes collection
    match /animes/{animeId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth.uid == resource.data.uploaderId;
      allow delete: if request.auth.uid == resource.data.uploaderId;
    }
    
    // Marketplace collection
    match /marketplace/{listingId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isPremium == true;
      allow update: if request.auth.uid == resource.data.sellerId;
      allow delete: if request.auth.uid == resource.data.sellerId;
    }
    
    // News and Announcements (admin only)
    match /news/{newsId} {
      allow read: if request.auth != null;
      allow write: if false; // Admin only via Firebase Admin SDK
    }
    
    match /announcements/{announcementId} {
      allow read: if request.auth != null;
      allow write: if false; // Admin only via Firebase Admin SDK
    }
  }
}
```

### Firebase Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /animes/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    match /marketplace/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

### Firebase Authentication Setup

1. Go to Firebase Console > Authentication
2. Click "Get Started"
3. Enable sign-in methods:
   - **Google**: Enable and configure OAuth consent screen
   - **Anonymous**: Enable for guest access

## Performance Optimization

### 1. Enable CDN Caching

For Vercel, add `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 2. Optimize Images

- Use WebP format when possible
- Lazy load images
- Implement responsive images

### 3. Code Splitting

Already configured with Vite - automatic code splitting per route.

## Monitoring & Analytics

### Add Google Analytics (Optional)

1. Create GA4 property
2. Add to `index.html`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Firebase Performance Monitoring

```bash
npm install firebase
```

Add to your `firebase.js`:
```javascript
import { getPerformance } from 'firebase/performance';
const perf = getPerformance(app);
```

## Troubleshooting

### Build Errors

1. **Module not found errors**
```bash
rm -rf node_modules package-lock.json
npm install
```

2. **Tailwind not applying styles**
- Check `tailwind.config.js` content paths
- Ensure `@tailwind` directives are in `index.css`

3. **Firebase initialization errors**
- Verify all environment variables are set
- Check Firebase project configuration
- Ensure Firebase services are enabled

### Runtime Errors

1. **Auth errors**
- Check Firebase Authentication is enabled
- Verify OAuth credentials
- Check domain authorization

2. **Firestore permission errors**
- Review Firestore security rules
- Ensure user is authenticated
- Check rule syntax

3. **API quota exceeded**
- Gemini API has rate limits
- Implement request caching
- Consider upgrading API plan

## Production Checklist

- [ ] All environment variables configured
- [ ] Firebase services enabled (Auth, Firestore, Storage)
- [ ] Security rules deployed
- [ ] Google/Anonymous auth configured
- [ ] Gemini API key has sufficient quota
- [ ] Domain configured (if custom)
- [ ] SSL certificate active (automatic on Vercel/Netlify)
- [ ] Error tracking setup (Sentry, etc.)
- [ ] Analytics configured
- [ ] Performance monitoring active

## Scaling Considerations

### Database Optimization
- Add compound indexes for complex queries
- Implement pagination for large collections
- Use Firebase Realtime Database for chat/presence

### API Rate Limiting
- Implement client-side caching
- Use debouncing for AI calls
- Consider backend proxy for API calls

### CDN & Caching
- Enable Cloudflare or similar CDN
- Cache static assets aggressively
- Use service workers for offline support

## Support & Maintenance

### Monitoring
- Check Firebase Console daily
- Monitor API usage and costs
- Track error rates

### Updates
- Keep dependencies updated
- Review security advisories
- Test after updates

### Backups
- Export Firestore data regularly
- Backup environment variables
- Document custom configurations

---

**Need Help?** Open an issue on GitHub or contact support.
