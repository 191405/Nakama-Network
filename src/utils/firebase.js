import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment, collection, query, orderBy, limit, getDocs, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Auth Functions
export const signInAnon = () => signInAnonymously(auth);

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

// User Profile Functions
export const createUserProfile = async (userId, data) => {
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
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() };
  }
  return null;
};

export const updateUserProfile = async (userId, data) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    ...data,
    lastActive: serverTimestamp()
  });
};

// Chakra/XP Functions
export const addChakra = async (userId, amount) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    chakra: increment(amount),
    lastActive: serverTimestamp()
  });
  
  // Update rank based on new chakra
  const updatedUser = await getUserProfile(userId);
  const newRank = calculateRank(updatedUser.chakra);
  if (newRank !== updatedUser.rank) {
    await updateDoc(userRef, { rank: newRank });
  }
};

// Rank Calculation
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

// Leaderboard Functions
export const getLeaderboard = async (limitNum = 10) => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, orderBy('chakra', 'desc'), limit(limitNum));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Clan Functions
export const updateClan = async (userId, clanName, clanMotto) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    clan: clanName,
    clanMotto: clanMotto,
    lastActive: serverTimestamp()
  });
};

// Battle Functions
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
  
  // Update rank if needed
  if (won) {
    const updatedUser = await getUserProfile(userId);
    const newRank = calculateRank(updatedUser.chakra);
    if (newRank !== updatedUser.rank) {
      await updateDoc(userRef, { rank: newRank });
    }
  }
};

// Live User Count
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

// Announcements
export const getAnnouncements = async () => {
  const announcementsRef = collection(db, 'announcements');
  const q = query(announcementsRef, orderBy('timestamp', 'desc'), limit(10));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Marketplace Functions
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

// Anime Upload Functions
export const uploadAnimeToStorage = async (userId, file, metadata) => {
  const fileName = `${Date.now()}_${file.name}`;
  const storageRef = ref(storage, `animes/${userId}/${fileName}`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  
  // Save metadata to Firestore
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
  
  // Update user's uploaded animes list
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

// News Functions
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
