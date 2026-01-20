import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, loginWithEmail, signUpWithEmail, logoutUser, getUserProfile, createUserProfile, updateUserProfile, signInWithGoogle, resetPassword } from '../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isGuest, setIsGuest] = useState(false);

    const fetchUserData = async (uid) => {
        try {
            
            let profile = await getUserProfile(uid);
            if (!profile) {
                
                profile = {
                    displayName: currentUser?.displayName || `Shinobi_${uid.substring(0, 6)}`,
                    email: currentUser?.email,
                    createdAt: new Date(),
                    rank: 'Wanderer',
                    chakra: 0,
                };
                await createUserProfile(uid, profile);
            }

            const progress = await api.getUserProgress(uid);
            if (progress) {
                
                profile = {
                    ...profile,
                    ...progress.stats, 
                    ninjaLevel: progress.level, 
                    netRank: progress.rank,     
                    streak: progress.streak     
                };
            }
            return profile;
        } catch (err) {
            console.error("Error fetching user data:", err);
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
                const profile = await fetchUserData(user.uid);
                setUserProfile(profile);
            } else {
                setCurrentUser(null);
                setUserProfile(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const login = async (email, password) => {
        return loginWithEmail(email, password);
    };

    const signup = async (email, password, displayName) => {
        const result = await signUpWithEmail(email, password, displayName);
        
        api.sendWelcomeEmail(email, displayName).catch(err => console.log('Welcome email trigger failed:', err));
        return result;
    };

    const googleSignIn = async (idToken) => {
        return signInWithGoogle(idToken);
    };

    const forgotPassword = async (email) => {
        return resetPassword(email);
    };

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
        try {
            await updateUserProfile(currentUser.uid, data);
            
            await refreshProfile();
            return true;
        } catch (e) {
            console.error("Failed to update profile:", e);
            throw e;
        }
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
