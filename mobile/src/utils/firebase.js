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

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyAyb19BcVSPDWEWK7h4zvHOinYr7OsoFPfA",
    authDomain: "nk-network-project.firebaseapp.com",
    projectId: "nk-network-project",
    storageBucket: "nk-network-project.firebasestorage.app",
    messagingSenderId: "1034418120758",
    appId: "1:1034418120758:web:f4e2d5fd5e0d078ee41097",
    measurementId: "G-LFK1NHWBXK"
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

    auth = getAuth(app);
}

const db = getFirestore(app);

export const loginWithEmail = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
};

export const signUpWithEmail = async (email, password, displayName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', userCredential.user.uid), {
        displayName: displayName || `Shinobi_${userCredential.user.uid.substring(0, 6)}`,
        email: email,
        createdAt: new Date(),
        rank: 'Wanderer',
        chakra: 0,
        clan: null,
        isPremium: false
    });
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

export const uploadVideoToStorage = async (file, path, onProgress) => {
    try {

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

export const uploadImageToStorage = async (uri, path, onProgress) => {
    return uploadVideoToStorage({ uri }, path, onProgress);
};

export { auth, db, storage, ref, uploadBytesResumable, getDownloadURL };
