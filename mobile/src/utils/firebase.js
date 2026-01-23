import { initializeApp, getApps, getApp } from "firebase/app";
import {
    initializeAuth,
    getAuth,
    getReactNativePersistence,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithCredential,
    sendPasswordResetEmail
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sanitizeUserProfile } from "./validation";

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

let app;
if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

let auth;
try {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
    });
} catch (e) {
    // Auth might be already initialized or not supported in this env
    auth = getAuth(app);
}

const db = getFirestore(app);

export const loginWithEmail = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
};

export const signUpWithEmail = async (email, password, displayName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const profile = sanitizeUserProfile({
        displayName: displayName || `Shinobi_${userCredential.user.uid.substring(0, 6)}`,
        email: email,
        createdAt: new Date(),
        rank: 'Wanderer',
        chakra: 0,
        clan: null,
        isPremium: false
    });
    await setDoc(doc(db, 'users', userCredential.user.uid), profile);
    return userCredential;
};

export const signInWithGoogle = async (idToken) => {
    const credential = GoogleAuthProvider.credential(idToken);
    return signInWithCredential(auth, credential);
};

export const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
};

export const logoutUser = () => {
    return signOut(auth);
};

export const getUserProfile = async (uid) => {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
};

export const createUserProfile = async (uid, data) => {
    return setDoc(doc(db, 'users', uid), data);
};

export const updateUserProfile = async (uid, data) => {
    const docRef = doc(db, 'users', uid);
    return updateDoc(docRef, data);
};

const storage = getStorage(app);

export const uploadFileToStorage = async (file, path, onProgress) => {
    try {
        // Fetch the file from URI to create a blob
        const response = await fetch(file.uri);
        const blob = await response.blob();

        const storageRef = ref(storage, path);
        const uploadTask = uploadBytesResumable(storageRef, blob);

        return new Promise((resolve, reject) => {
            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    if (onProgress) onProgress(Math.round(progress));
                },
                (error) => {
                    console.error('Upload error:', error);
                    reject(error);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                }
            );
        });
    } catch (error) {
        console.error('Upload failed:', error);
        throw error;
    }
};

export const uploadVideoToStorage = uploadFileToStorage; // Alias for backward compatibility
export const uploadImageToStorage = async (uri, path, onProgress) => {
    return uploadFileToStorage({ uri }, path, onProgress);
};

export { auth, db, storage, ref, uploadBytesResumable, getDownloadURL };
