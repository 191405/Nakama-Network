
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, createUserProfile, getUserProfile, updateUserProfile, subscribeToUserProfile } from '../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getLocalDevUser, isLocalDevMode, clearLocalDevAuth } from '../utils/localDevAuth';
import { sendWelcomeEmail } from '../utils/emailService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState('');

  useEffect(() => {

    localStorage.removeItem('nakama_guest_mode');

    if (isLocalDevMode()) {

      console.log('Restoring local dev auth session');
      const devUser = getLocalDevUser();
      setCurrentUser(devUser);
      setIsGuest(false);
      setIsAuthenticated(true);
      setUserProfile({
        id: devUser.uid,
        email: devUser.email,
        displayName: devUser.displayName,
        chakra: 0,
        rank: 'Mere User',
        clan: null,
        clanMotto: null,
        isPremium: false,
        totalWins: 0,
        totalLosses: 0,
        streak: 0,
        isLocalDev: true,
        canUseFeatures: true,
      });
      setLoading(false);
      return;
    }

    if (!auth) {
      
      console.log('No active session, user needs to log in');
      setCurrentUser(null);
      setUserProfile(null);
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    let profileUnsub = null;
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;

      if (profileUnsub) {
        profileUnsub();
        profileUnsub = null;
      }

      try {
        if (user) {
          
          setCurrentUser(user);
          setIsGuest(false);
          setIsAuthenticated(true);

          profileUnsub = subscribeToUserProfile(user.uid, async (profileData) => {
            if (!isMounted) return;

            if (profileData) {
              
              setUserProfile({ ...profileData, canUseFeatures: true });

            } else {
              
              console.log('Creating new user profile...');
              await createUserProfile(user.uid, {
                email: user.email || `anon_${user.uid.substring(0, 8)}@nk.network`,
                displayName: user.displayName || `Shinobi_${user.uid.substring(0, 6)}`,
              });

              sendWelcomeEmail(user).catch(err => console.error('Failed to send welcome email:', err));
              
            }
          });

        } else {
          
          setCurrentUser(null);
          setUserProfile(null);
          setIsAuthenticated(false);
        }

        setLoading(false);
      } catch (err) {
        console.error('Auth error:', err);
        setCurrentUser(null);
        setUserProfile(null);
        setIsAuthenticated(false);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      if (typeof unsubscribe === 'function') unsubscribe();
      if (typeof profileUnsub === 'function') profileUnsub();
    };
  }, []);

  const loginAsGuest = () => {
    localStorage.setItem('nakama_guest_mode', 'true');
    setIsGuest(true);
    setIsAuthenticated(false);
    setCurrentUser({ uid: 'guest', displayName: 'Guest', isGuest: true });
    setUserProfile({
      id: 'guest',
      displayName: 'Guest Explorer',
      email: null,
      chakra: 0,
      rank: 'Guest',
      isGuest: true,
      canUseFeatures: false,
    });
  };

  const logout = async () => {
    
    localStorage.removeItem('nakama_guest_mode');
    localStorage.removeItem('localDevUser');
    clearLocalDevAuth();

    if (auth) {
      try {
        await auth.signOut();
      } catch (e) { console.error(e); }
    }

    setCurrentUser(null);
    setUserProfile(null);
    setIsGuest(false);
    setIsAuthenticated(false);
    
  };

  const refreshUserProfile = async () => {
    if (currentUser && !isGuest && (auth || isLocalDevMode())) {
      
      if (auth) {
        const profile = await getUserProfile(currentUser.uid);
        setUserProfile({ ...profile, canUseFeatures: true });
      }
    }
  };

  const canUseFeature = () => {
    if (!isAuthenticated) return false;
    return true;
  };

  const requireAuth = (actionCallback, message = 'Log in to continue') => {
    if (isAuthenticated) {
      if (actionCallback) actionCallback();
      return true;
    } else {
      setAuthModalMessage(message);
      setIsAuthModalOpen(true);
      return false;
    }
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalMessage('');
  };

  const openAuthModal = (message = '') => {
    setAuthModalMessage(message);
    setIsAuthModalOpen(true);
  };

  const value = {
    currentUser,
    userProfile,
    user: currentUser, 
    loading,
    isGuest,
    isAuthenticated,
    loginAsGuest,
    logout,
    refreshUserProfile,
    canUseFeature,
    requireAuth,
    isAuthModalOpen,
    authModalMessage,
    openAuthModal,
    closeAuthModal,
    updateProfile: (data) => updateUserProfile(currentUser?.uid, data),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
