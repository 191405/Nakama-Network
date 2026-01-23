import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, loginWithEmail, signUpWithEmail, logoutUser, getUserProfile, createUserProfile, updateUserProfile, signInWithGoogle, resetPassword } from '../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { sanitizeUserProfile } from '../utils/validation';
import { safeExecute, ErrorType } from '../utils/errorHandler';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

// --- HELPERS ---

/**
 * Safely force checks the auth token from the global Auth instance.
 * Prevents "user.getIdToken is not a function" crashes.
 */
const forceTokenRefresh = async () => {
    if (auth.currentUser) {
        console.log(`[Auth] Forcing token refresh for user: ${auth.currentUser.uid}`);
        return auth.currentUser.getIdToken(true);
    }
    throw new Error("No authenticated user to refresh token for.");
};

/**
 * Orchestrates the profile creation logic.
 */
const ensureUserProfile = async (uid, authUser) => {
    // Default profile template
    const profile = sanitizeUserProfile({
        displayName: authUser?.displayName || `Shinobi_${uid.substring(0, 6)}`,
        email: authUser?.email,
        createdAt: new Date(),
        rank: 'Wanderer',
        chakra: 0,
        photoURL: authUser?.photoURL,
    });

    try {
        await createUserProfile(uid, profile);
        console.log("[Auth] Created new user profile.");
        return profile;
    } catch (writeError) {
        // If write fails with permission, try one more force refresh
        if (writeError.code === 'permission-denied') {
            await forceTokenRefresh();
            await createUserProfile(uid, profile);
            return profile;
        }
        throw writeError;
    }
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isGuest, setIsGuest] = useState(false);

    /**
     * Main Data Fetching Logic (Refactored)
     * Handles: Read -> Retry (Force Refresh) -> Create (if missing) -> Merge API Data
     */
    const fetchUserData = async (uidOrUser) => {
        // Handle input: If object passed, get uid. If string, use as is.
        const uid = typeof uidOrUser === 'object' && uidOrUser !== null ? uidOrUser.uid : uidOrUser;
        const authUser = auth.currentUser; // Always rely on singleton for Auth details

        if (!uid) {
            console.error("[Auth] fetchUserData called without UID");
            return null;
        }

        try {
            // 1. Try to get Firestore Profile
            let profile = null;
            let retries = 3;

            while (retries > 0) {
                try {
                    profile = await getUserProfile(uid);
                    break; // Success
                } catch (readError) {
                    console.warn(`[Auth] Read failed (${retries} left):`, readError.code || readError.message);

                    const isPermissionError = readError.code === 'permission-denied' ||
                        (readError.message && readError.message.includes('insufficient permissions'));

                    if (isPermissionError && retries > 1) {
                        // FIXED: Use helper that uses auth.currentUser, avoiding argument crash
                        try {
                            await forceTokenRefresh();
                        } catch (e) { console.error("Token refresh failed", e); }

                        await new Promise(r => setTimeout(r, 1000));
                        retries--;
                    } else {
                        throw readError;
                    }
                }
            }

            // 2. Create if missing
            if (!profile) {
                console.log("[Auth] Profile missing, creating...");
                profile = await ensureUserProfile(uid, authUser);
            }

            // 3. Merge with API (Ninja Stats)
            try {
                const progress = await api.getUserProgress(uid);
                if (progress) {
                    profile = { ...profile, ...progress.stats, ninjaLevel: progress.level, netRank: progress.rank, streak: progress.streak };
                }
            } catch (apiError) {
                console.warn("[Auth] API fetch failed, using local profile only.", apiError);
            }

            return profile;

        } catch (err) {
            // 4. Systematic Error Logging
            const errorContext = 'fetchUserData';
            if (err.code === 'permission-denied') {
                console.error(`[${ErrorType.PERMISSION}] ${errorContext}: Insufficient permissions.`);
            } else if (err.code === 'unavailable') {
                console.error(`[${ErrorType.NETWORK}] ${errorContext}: Network unavailable.`);
            } else {
                console.error(`[${ErrorType.UNKNOWN}] ${errorContext}:`, err);
            }
            return null;
        }
    };

    const refreshProfile = async () => {
        if (!currentUser) return;
        const profile = await fetchUserData(currentUser.uid);
        if (profile) setUserProfile(profile);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                setIsGuest(false);
                const profile = await fetchUserData(user); // user object is fine here, logic handles it
                setUserProfile(profile);
            } else {
                setCurrentUser(null);
                setUserProfile(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    // --- Public Methods (Unchanged) ---
    const login = (email, password) => loginWithEmail(email, password);
    const signup = async (email, password, displayName) => {
        const result = await signUpWithEmail(email, password, displayName);
        api.sendWelcomeEmail(email, displayName).catch(console.log);
        return result;
    };
    const googleSignIn = (idToken) => signInWithGoogle(idToken);
    const forgotPassword = (email) => resetPassword(email);

    const loginAsGuest = () => {
        setIsGuest(true);
        setCurrentUser({ uid: 'guest', isGuest: true });
        setUserProfile({
            displayName: 'Guest Ninja',
            ninjaLevel: { title: 'Academy Student', badge: '🎓' },
            netRank: { title: 'Net Wanderer', color: '#94a3b8' },
            chakra: 0,
            streak: { current: 0 },
            isGuest: true
        });
    };

    const logout = async () => {
        try {
            if (!isGuest) await logoutUser();
            setIsGuest(false);
            setCurrentUser(null);
            setUserProfile(null);
        } catch (e) {
            console.error(e);
        }
    };

    const updateProfile = async (data) => {
        if (!currentUser || isGuest) return;
        await updateUserProfile(currentUser.uid, data);
        await refreshProfile();
        return true;
    };

    const value = {
        currentUser,
        userProfile,
        loading,
        isGuest,
        login,
        signup,
        googleSignIn,
        forgotPassword,
        loginAsGuest,
        logout,
        updateProfile,
        refreshProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
