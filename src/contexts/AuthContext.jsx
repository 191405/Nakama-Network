import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../utils/authService';
import { getLocalDevUser, isLocalDevMode, clearLocalDevAuth } from '../utils/localDevAuth';
// Import firebase as optional for legacy compatibility if needed, but we'll focus on backend
import * as firebaseUtils from '../utils/firebase'; 

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

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      
      // 1. Try Local Dev Mode first
      if (isLocalDevMode()) {
        const devUser = getLocalDevUser();
        if (devUser) {
          setCurrentUser(devUser);
          setIsAuthenticated(true);
          setUserProfile({
            id: devUser.uid || 'dev-user',
            user_id: devUser.uid || 'dev-user',
            displayName: devUser.displayName || 'Dev Master',
            email: devUser.email,
            chakra: 1000,
            rank: 'Elite Developer',
            canUseFeatures: true
          });
          setLoading(false);
          return;
        }
      }

      // 2. Try Backend Auth (Custom System)
      const token = authService.getToken();
      if (token) {
        try {
          const user = await authService.getMe();
          if (user) {
            setCurrentUser(user);
            setIsAuthenticated(true);
            // In the new system, profile data will come from user stats API
            // For now, we'll store basic info
            setUserProfile({
              ...user,
              id: user.user_id,
              displayName: user.display_name,
              canUseFeatures: true
            });
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error('Backend auth init failed:', err);
          authService.logout();
        }
      }

      // 3. Fallback to Firebase (Legacy)
      if (firebaseUtils.auth?.currentUser) {
        const fbUser = firebaseUtils.auth.currentUser;
        setCurrentUser(fbUser);
        setIsAuthenticated(true);
        const profile = await firebaseUtils.getUserProfile(fbUser.uid);
        setUserProfile({ ...profile, canUseFeatures: true });
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setCurrentUser(data.user);
    setIsAuthenticated(true);
    setUserProfile({
      ...data.user,
      id: data.user.user_id,
      displayName: data.user.display_name,
      canUseFeatures: true
    });
    return data;
  };

  const register = async (email, password, displayName) => {
    const data = await authService.register(email, password, displayName);
    setCurrentUser(data.user);
    setIsAuthenticated(true);
    setUserProfile({
      ...data.user,
      id: data.user.user_id,
      displayName: data.user.display_name,
      canUseFeatures: true
    });
    return data;
  };

  const forgotPassword = async (email) => {
    return await authService.forgotPassword(email);
  };

  const logout = async () => {
    authService.logout();
    clearLocalDevAuth();
    if (firebaseUtils.auth) await firebaseUtils.logOut().catch(() => {});
    
    setCurrentUser(null);
    setUserProfile(null);
    setIsGuest(false);
    setIsAuthenticated(false);
    localStorage.removeItem('nakama_guest_mode');
  };

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

  const refreshUserProfile = async () => {
    if (isAuthenticated && !isGuest) {
      const user = await authService.getMe();
      if (user) {
        setUserProfile(prev => ({ ...prev, ...user, displayName: user.display_name }));
      }
    }
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
    login,
    register,
    forgotPassword,
    loginAsGuest,
    logout,
    refreshUserProfile,
    requireAuth,
    isAuthModalOpen,
    authModalMessage,
    openAuthModal,
    closeAuthModal,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
