import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment, collection, query, orderBy, limit, getDocs, onSnapshot, serverTimestamp, where } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

let app = null;
let auth = null;
let db = null;
let storage = null;

const isConfigValid = (config) => {
  return config.apiKey && config.authDomain && config.projectId && config.appId;
};

if (isConfigValid(firebaseConfig)) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log('Firebase initialized successfully');

    if (import.meta.env.DEV) {
      window.addEventListener('error', (event) => {
        if (event.message && event.message.includes('identitytoolkit')) {
          event.preventDefault();
        }
      });
    }
  } catch (err) {
    console.warn('Firebase initialization error:', err.message);
    console.log('Falling back to local dev mode');
    app = null;
    auth = null;
    db = null;
    storage = null;
  }
} else {
  if (import.meta.env.DEV) {
    console.log('ℹ️  Firebase not configured. Using local dev mode. Set VITE_FIREBASE_* env vars to enable real Firebase.');
  }
}

export { auth, db, storage };

export const signInAnon = () => {
  if (!auth) return Promise.reject(new Error('Firebase not initialized'));
  return signInAnonymously(auth);
};

export const signInWithGoogle = async () => {
  if (!auth) return Promise.reject(new Error('Firebase not initialized'));
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const createUserProfile = async (userId, data) => {
  if (!db) {
    console.warn('Firestore not initialized, skipping createUserProfile');
    return data;
  }
  const userRef = doc(db, 'users', userId);
  const defaultData = {
    chakra: 0,
    rank: 'Mere User',
    clan: null,
    clanMotto: null,
    isPremium: false,
    createdAt: serverTimestamp(),
    lastActive: serverTimestamp(),
    totalWins: 0,
    totalLosses: 0,
    streak: 0,
    channelName: null,
    uploadedAnimes: [],
    ...data
  };
  await setDoc(userRef, defaultData, { merge: true });
  return defaultData;
};

export const getUserProfile = async (userId) => {
  if (!db) {
    console.warn('Firestore not initialized, returning null profile');
    return null;
  }
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() };
  }
  return null;
};

export const updateUserProfile = async (userId, data) => {
  if (!db) {
    console.warn('Firestore not initialized, skipping updateUserProfile');
    return;
  }
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    ...data,
    lastActive: serverTimestamp()
  });
};

export const subscribeToUserProfile = (userId, callback) => {
  if (!db) return () => { };
  const userRef = doc(db, 'users', userId);
  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    } else {
      callback(null);
    }
  });
};

export const addChakra = async (userId, amount) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    chakra: increment(amount),
    lastActive: serverTimestamp()
  });

  const updatedUser = await getUserProfile(userId);
  const newRank = calculateRank(updatedUser.chakra);
  if (newRank !== updatedUser.rank) {
    await updateDoc(userRef, { rank: newRank });
  }
};

export const calculateRank = (chakra) => {
  if (chakra >= 1000000) return 'Immortal';
  if (chakra >= 500000) return 'God Level User';
  if (chakra >= 250000) return 'Global Ranker';
  if (chakra >= 100000) return 'Sage Mode';
  if (chakra >= 50000) return 'Berserker';
  if (chakra >= 25000) return 'Diamond Badge User';
  if (chakra >= 10000) return 'Golden Badge User';
  if (chakra >= 5000) return 'Silver Badge User';
  if (chakra >= 2500) return 'Bronze Badge User';
  if (chakra >= 1000) return 'Ranked';
  if (chakra >= 500) return 'Unranked';
  if (chakra >= 100) return 'User';
  return 'Mere User';
};

export const checkFirebaseConnection = async () => {
  if (!db) return false;
  try {

    const testRef = doc(db, 'system', 'ping');
    await getDoc(testRef);
    return true;
  } catch (error) {
    console.error('Firebase connection check failed:', error);
    return false;
  }
};

export const getLeaderboard = async (limitNum = 10) => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, orderBy('chakra', 'desc'), limit(limitNum));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateClan = async (userId, clanName, clanMotto) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    clan: clanName,
    clanMotto: clanMotto,
    lastActive: serverTimestamp()
  });
};

export const recordBattleResult = async (userId, won) => {
  const userRef = doc(db, 'users', userId);
  const updates = {
    lastActive: serverTimestamp()
  };

  if (won) {
    updates.totalWins = increment(1);
    updates.streak = increment(1);
    updates.chakra = increment(50);
  } else {
    updates.totalLosses = increment(1);
    updates.streak = 0;
  }

  await updateDoc(userRef, updates);

  if (won) {
    const updatedUser = await getUserProfile(userId);
    const newRank = calculateRank(updatedUser.chakra);
    if (newRank !== updatedUser.rank) {
      await updateDoc(userRef, { rank: newRank });
    }
  }
};

export const createBattlePoll = async (char1, char2, category) => {
  if (!db) return null;
  const battleRef = doc(collection(db, 'battles'));
  const battleData = {
    char1: { name: char1.name, image: char1.image, votes: 0 },
    char2: { name: char2.name, image: char2.image, votes: 0 },
    category,
    createdAt: serverTimestamp(),
    status: 'active', 
    totalVotes: 0,
    voters: [] 
  };
  await setDoc(battleRef, battleData);
  return { id: battleRef.id, ...battleData };
};

export const subscribeToActiveBattles = (callback) => {
  if (!db) {
    callback([]);
    return () => { };
  }
  const battlesRef = collection(db, 'battles');
  
  const q = query(battlesRef, where('status', '==', 'active'), orderBy('createdAt', 'desc'), limit(5));

  return onSnapshot(q, (snapshot) => {
    const battles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(battles);
  });
};

export const voteOnBattle = async (battleId, choice, userId = null) => { 
  if (!db) return { success: false, error: 'Database not initialized' };

  const battleRef = doc(db, 'battles', battleId);
  const battleSnap = await getDoc(battleRef);

  if (!battleSnap.exists()) {
    return { success: false, error: 'Battle not found' };
  }

  const battleData = battleSnap.data();

  if (userId && battleData.voters) {
    const hasVoted = battleData.voters.some(v => v.userId === userId || v === userId);
    if (hasVoted) {
      return { success: false, error: 'Already voted on this battle', alreadyVoted: true };
    }
  }

  const updates = {
    totalVotes: increment(1)
  };

  if (choice === 1) {
    updates['char1.votes'] = increment(1);
  } else {
    updates['char2.votes'] = increment(1);
  }

  if (userId) {
    updates.voters = [...(battleData.voters || []), { userId, choice, votedAt: new Date().toISOString() }];
  }

  await updateDoc(battleRef, updates);

  if (userId) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        totalVotes: increment(1),
        chakra: increment(5), 
        lastVotedAt: serverTimestamp(),
        lastActive: serverTimestamp()
      });

      const voteHistoryRef = doc(collection(db, 'users', userId, 'voteHistory'));
      await setDoc(voteHistoryRef, {
        battleId,
        choice,
        characterName: choice === 1 ? battleData.char1.name : battleData.char2.name,
        votedAt: serverTimestamp()
      });
    } catch (e) {
      console.warn('Could not update user stats:', e);
    }
  }

  return { success: true, newVotes: battleData.totalVotes + 1 };
};

export const getSystemStats = async () => {
  if (!db) return { users: 0, posts: 0, battles: 0 };

  try {

    const usersSnap = await getDocs(collection(db, 'users'));
    const postsSnap = await getDocs(collection(db, 'community_posts'));
    const battlesSnap = await getDocs(collection(db, 'battles')); 

    return {
      users: usersSnap.size,
      posts: postsSnap.size,
      battles: battlesSnap.size,
      reports: 0 
    };
  } catch (error) {
    console.error("Error getting stats:", error);
    return { users: 0, posts: 0, battles: 0, reports: 0 };
  }
};

export const subscribeToActiveUsers = (callback) => {
  const usersRef = collection(db, 'users');
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const q = query(usersRef);

  return onSnapshot(q, (snapshot) => {
    const activeCount = snapshot.docs.filter(doc => {
      const data = doc.data();
      if (!data.lastActive) return false;
      const lastActive = data.lastActive.toDate();
      return lastActive > fiveMinutesAgo;
    }).length;
    callback(activeCount);
  });
};

export const getAnnouncements = async () => {
  const announcementsRef = collection(db, 'announcements');
  const q = query(announcementsRef, orderBy('timestamp', 'desc'), limit(10));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createMarketplaceListing = async (userId, listing) => {
  const listingRef = doc(collection(db, 'marketplace'));
  await setDoc(listingRef, {
    ...listing,
    sellerId: userId,
    createdAt: serverTimestamp(),
    status: 'active'
  });
  return listingRef.id;
};

export const getMarketplaceListings = async () => {
  const marketplaceRef = collection(db, 'marketplace');
  const q = query(marketplaceRef, orderBy('createdAt', 'desc'), limit(50));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const uploadAnimeToStorage = async (userId, file, metadata) => {
  const fileName = `${Date.now()}_${file.name}`;
  const storageRef = ref(storage, `animes/${userId}/${fileName}`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);

  const animeRef = doc(collection(db, 'animes'));
  await setDoc(animeRef, {
    ...metadata,
    uploaderId: userId,
    fileUrl: downloadURL,
    fileName: fileName,
    uploadedAt: serverTimestamp(),
    views: 0,
    downloads: 0
  });

  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    uploadedAnimes: increment(1)
  });

  return { id: animeRef.id, downloadURL };
};

export const getUserAnimes = async (userId) => {
  const animesRef = collection(db, 'animes');
  const q = query(animesRef, orderBy('uploadedAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs
    .filter(doc => doc.data().uploaderId === userId)
    .map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getAllAnimes = async () => {
  const animesRef = collection(db, 'animes');
  const q = query(animesRef, orderBy('uploadedAt', 'desc'), limit(100));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const incrementAnimeViews = async (animeId) => {
  const animeRef = doc(db, 'animes', animeId);
  await updateDoc(animeRef, {
    views: increment(1)
  });
};

export const incrementAnimeDownloads = async (animeId) => {
  const animeRef = doc(db, 'animes', animeId);
  await updateDoc(animeRef, {
    downloads: increment(1)
  });
};

const NEWS_CACHE_TTL = 5 * 60 * 60 * 1000; 

export const getOrFetchNews = async () => {
  if (!db) return { news: [], lastUpdated: null, fromCache: false };

  try {
    
    const cacheRef = doc(db, 'cache', 'animeNews');
    const cacheSnap = await getDoc(cacheRef);

    let cachedData = cacheSnap.exists() ? cacheSnap.data() : null;
    let cacheValid = false;

    if (cachedData && cachedData.lastUpdated) {
      const lastUpdated = cachedData.lastUpdated.toDate ? cachedData.lastUpdated.toDate() : new Date(cachedData.lastUpdated);
      const age = Date.now() - lastUpdated.getTime();
      cacheValid = age < NEWS_CACHE_TTL;
    }

    if (cacheValid && cachedData.news && cachedData.news.length > 0) {
      console.log('Serving news from cache');
      return {
        news: cachedData.news,
        lastUpdated: cachedData.lastUpdated.toDate ? cachedData.lastUpdated.toDate() : new Date(cachedData.lastUpdated),
        fromCache: true
      };
    }

    console.log('Fetching fresh anime news...');
    const freshNews = await fetchFreshAnimeNews();

    await setDoc(cacheRef, {
      news: freshNews,
      lastUpdated: serverTimestamp()
    });

    return {
      news: freshNews,
      lastUpdated: new Date(),
      fromCache: false
    };

  } catch (error) {
    console.error('Failed to get/fetch news:', error);
    
    return { news: getFallbackNews(), lastUpdated: null, fromCache: false };
  }
};

const fetchFreshAnimeNews = async () => {
  const popularAnimeIds = [21, 1735, 16498, 5114, 38000, 51009, 52991, 40748, 48583]; 
  const allNews = [];

  for (const malId of popularAnimeIds.slice(0, 5)) { 
    try {
      await new Promise(r => setTimeout(r, 400)); 
      const response = await fetch(`https://api.jikan.moe/v4/anime/${malId}/news?limit=3`);
      if (!response.ok) continue;
      const data = await response.json();
      if (data.data) {
        allNews.push(...data.data.map(item => ({
          id: item.mal_id,
          title: item.title,
          summary: item.excerpt || item.title,
          url: item.url,
          image: item.images?.jpg?.image_url || 'https://via.placeholder.com/600x400/1a1a2e/eab308?text=News',
          date: item.date,
          author: item.author_username || 'Anime News',
          source: 'MyAnimeList',
          category: 'Updates',
          comments: item.comments || 0,
          likes: Math.floor(Math.random() * 5000) + 1000,
          trending: Math.random() > 0.7
        })));
      }
    } catch (e) {
      console.warn(`Failed to fetch news for anime ${malId}:`, e);
    }
  }

  const uniqueNews = allNews.filter((item, index, self) =>
    index === self.findIndex(t => t.id === item.id)
  );
  uniqueNews.sort((a, b) => new Date(b.date) - new Date(a.date));

  return uniqueNews.slice(0, 15); 
};

const getFallbackNews = () => [
  { id: 1, title: "Solo Leveling Season 2 Announced for 2025", summary: "A-1 Pictures confirms the second season.", category: "Announcements", source: "Crunchyroll", date: new Date().toISOString(), image: "https://via.placeholder.com/600x400/1a1a2e/eab308?text=Solo+Leveling", trending: true, comments: 2453, likes: 15200 },
  { id: 2, title: "Demon Slayer Infinity Castle Arc: New Trailer", summary: "Ufotable drops stunning new visuals.", category: "Updates", source: "Ufotable", date: new Date().toISOString(), image: "https://via.placeholder.com/600x400/1a1a2e/eab308?text=Demon+Slayer", trending: true, comments: 1876, likes: 12400 },
  { id: 3, title: "Jujutsu Kaisen Final Arc Begins", summary: "The manga enters its final chapter.", category: "Milestones", source: "Shonen Jump", date: new Date().toISOString(), image: "https://via.placeholder.com/600x400/1a1a2e/eab308?text=JJK", trending: false, comments: 987, likes: 8900 }
];

export const getAnimeNews = async () => {
  const newsRef = collection(db, 'news');
  const q = query(newsRef, orderBy('publishedAt', 'desc'), limit(20));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createNewsArticle = async (article) => {
  const newsRef = doc(collection(db, 'news'));
  await setDoc(newsRef, {
    ...article,
    publishedAt: serverTimestamp(),
    views: 0
  });
  return newsRef.id;
};

export const createCommunityPost = async (userId, userDisplayName, userRank, userAvatar, title, content, tags = []) => {
  if (!db) return null;
  const postRef = doc(collection(db, 'community_posts'));
  const postData = {
    userId,
    author: userDisplayName,
    authorRank: userRank,
    authorAvatar: userAvatar || null,
    title,
    preview: content.substring(0, 150) + (content.length > 150 ? '...' : ''),
    content, 
    tags,
    createdAt: serverTimestamp(),
    likes: 0,
    views: 0,
    replies: 0,
    likedBy: []
  };
  await setDoc(postRef, postData);
  return { id: postRef.id, ...postData };
};

export const subscribeToCommunityPosts = (callback, limitNum = 20) => {
  if (!db) {
    callback([]);
    return () => { };
  }
  const postsRef = collection(db, 'community_posts');
  const q = query(postsRef, orderBy('createdAt', 'desc'), limit(limitNum));

  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(posts);
  });
};

export const likeCommunityPost = async (postId, userId) => {
  if (!db) return;
  const postRef = doc(db, 'community_posts', postId);
  const postSnap = await getDoc(postRef);

  if (postSnap.exists()) {
    const data = postSnap.data();
    const likedBy = data.likedBy || [];
    const hasLiked = likedBy.includes(userId);

    if (hasLiked) {
      
      await updateDoc(postRef, {
        likes: increment(-1),
        likedBy: likedBy.filter(id => id !== userId)
      });
    } else {
      
      await updateDoc(postRef, {
        likes: increment(1),
        likedBy: [...likedBy, userId]
      });
    }
  }
};

export const sendChatMessage = async (userId, userName, userRank, message, room = 'general') => {
  if (!db) {
    console.warn('Firestore not initialized, skipping sendChatMessage');
    return null;
  }
  const chatRef = doc(collection(db, 'chatMessages'));
  const messageData = {
    userId,
    userName,
    userRank,
    message,
    room,
    timestamp: serverTimestamp(),
    reactions: {}
  };
  await setDoc(chatRef, messageData);
  return { id: chatRef.id, ...messageData };
};

export const subscribeToChatMessages = (room, callback, limitNum = 50) => {
  if (!db) {
    console.warn('Firestore not initialized');
    callback([]);
    return () => { };
  }
  const chatRef = collection(db, 'chatMessages');
  const q = query(chatRef, orderBy('timestamp', 'desc'), limit(limitNum));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(msg => msg.room === room)
      .reverse();
    callback(messages);
  });
};

export const addChatReaction = async (messageId, emoji, userId) => {
  if (!db) return;
  const messageRef = doc(db, 'chatMessages', messageId);
  const messageSnap = await getDoc(messageRef);
  if (messageSnap.exists()) {
    const reactions = messageSnap.data().reactions || {};
    const emojiUsers = reactions[emoji] || [];
    if (!emojiUsers.includes(userId)) {
      reactions[emoji] = [...emojiUsers, userId];
      await updateDoc(messageRef, { reactions });
    }
  }
};

export const signUpWithEmail = async (email, password) => {
  if (!auth) return Promise.reject(new Error('Firebase not initialized'));
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signInWithEmail = async (email, password) => {
  if (!auth) return Promise.reject(new Error('Firebase not initialized'));
  return signInWithEmailAndPassword(auth, email, password);
};

export const logOut = async () => {
  if (!auth) return Promise.reject(new Error('Firebase not initialized'));
  return signOut(auth);
};

export const isUsernameAvailable = async (username) => {
  if (!db) return true;
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', username.toLowerCase()));
  const snapshot = await getDocs(q);
  return snapshot.empty;
};

export const setUsername = async (userId, username) => {
  if (!db) return;
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    username: username.toLowerCase(),
    displayName: username,
    usernameLastChanged: serverTimestamp()
  });
};

export const canChangeUsername = async (userId) => {
  if (!db) return true;
  const user = await getUserProfile(userId);
  if (!user?.usernameLastChanged) return true;

  const lastChanged = user.usernameLastChanged.toDate();
  const hoursSince = (Date.now() - lastChanged.getTime()) / (1000 * 60 * 60);
  return hoursSince >= 24;
};

export const uploadProfilePicture = async (userId, file) => {
  if (!storage) {
    console.warn('Storage not initialized');
    return null;
  }

  const fileName = `avatar_${Date.now()}.${file.name.split('.').pop()}`;
  const storageRef = ref(storage, `avatars/${userId}/${fileName}`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);

  if (db) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      photoURL: downloadURL,
      lastActive: serverTimestamp()
    });
  }

  if (auth?.currentUser) {
    await updateProfile(auth.currentUser, { photoURL: downloadURL });
  }

  return downloadURL;
};

export const isFirstTimeUser = async (userId) => {
  if (!db) return false;
  const user = await getUserProfile(userId);
  return !user?.hasCompletedOnboarding;
};

export const completeOnboarding = async (userId) => {
  if (!db) return;
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    hasCompletedOnboarding: true,
    onboardingCompletedAt: serverTimestamp()
  });
};

export const isUserAdmin = async (userId) => {
  if (!db) return false;
  const user = await getUserProfile(userId);
  return user?.isAdmin === true;
};

export const uploadMedia = async (userId, file, caption, type = 'image') => {
  if (!storage || !db) {
    console.warn('Firebase not initialized for media upload');
    return null;
  }

  try {
    
    const timestamp = Date.now();
    const fileName = `media/${userId}/${timestamp}_${file.name}`;
    const storageRef = ref(storage, fileName);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    const mediaRef = doc(collection(db, 'media'));
    const mediaData = {
      id: mediaRef.id,
      userId,
      url,
      type,
      caption: caption || '',
      likes: 0,
      likedBy: [],
      comments: 0,
      createdAt: serverTimestamp(),
      storagePath: fileName
    };

    await setDoc(mediaRef, mediaData);
    return { ...mediaData, id: mediaRef.id };
  } catch (error) {
    console.error('Upload media error:', error);
    throw error;
  }
};

export const createMediaPost = async (userId, url, caption, type = 'gif') => {
  if (!db) return null;

  const mediaRef = doc(collection(db, 'media'));
  const mediaData = {
    id: mediaRef.id,
    userId,
    url,
    type,
    caption: caption || '',
    likes: 0,
    likedBy: [],
    comments: 0,
    createdAt: serverTimestamp()
  };

  await setDoc(mediaRef, mediaData);
  return { ...mediaData, id: mediaRef.id };
};

export const subscribeToMedia = (callback, sortBy = 'createdAt', limitCount = 50) => {
  if (!db) {
    callback([]);
    return () => { };
  }

  const mediaRef = collection(db, 'media');
  const q = query(mediaRef, orderBy(sortBy, 'desc'), limit(limitCount));

  return onSnapshot(q, (snapshot) => {
    const media = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(media);
  }, (error) => {
    console.error('Media subscription error:', error);
    callback([]);
  });
};

export const toggleLikeMedia = async (mediaId, userId) => {
  if (!db) return;

  const mediaRef = doc(db, 'media', mediaId);
  const mediaSnap = await getDoc(mediaRef);

  if (mediaSnap.exists()) {
    const data = mediaSnap.data();
    const likedBy = data.likedBy || [];

    if (likedBy.includes(userId)) {
      
      await updateDoc(mediaRef, {
        likes: increment(-1),
        likedBy: likedBy.filter(id => id !== userId)
      });
      return false;
    } else {
      
      await updateDoc(mediaRef, {
        likes: increment(1),
        likedBy: [...likedBy, userId]
      });
      return true;
    }
  }
};

export const deleteMedia = async (mediaId, storagePath) => {
  if (!db) return;

  const mediaRef = doc(db, 'media', mediaId);
  await updateDoc(mediaRef, { deleted: true }); 

  if (storage && storagePath) {
    try {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
    } catch (e) {
      console.warn('Could not delete storage file:', e);
    }
  }
};

export const updateDisplayName = async (userId, newDisplayName) => {
  if (!db) return;

  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    displayName: newDisplayName,
    displayNameUpdatedAt: serverTimestamp()
  });

  if (auth?.currentUser) {
    try {
      await updateProfile(auth.currentUser, { displayName: newDisplayName });
    } catch (e) {
      console.warn('Could not update auth display name:', e);
    }
  }
};

export const getUserMediaAnalytics = async (userId) => {
  if (!db || !userId) return { postsCount: 0, totalLikesReceived: 0, totalCommentsReceived: 0 };

  try {
    
    const mediaRef = collection(db, 'media');
    const q = query(mediaRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    let postsCount = 0;
    let totalLikesReceived = 0;
    let totalCommentsReceived = 0;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (!data.deleted) {
        postsCount++;
        totalLikesReceived += data.likes || 0;
        totalCommentsReceived += data.comments || 0;
      }
    });

    return {
      postsCount,
      totalLikesReceived,
      totalCommentsReceived
    };
  } catch (error) {
    console.error('Failed to get media analytics:', error);
    return { postsCount: 0, totalLikesReceived: 0, totalCommentsReceived: 0 };
  }
};
