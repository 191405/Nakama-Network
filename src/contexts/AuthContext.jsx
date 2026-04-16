import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../utils/authService';
import { getLocalDevUser, isLocalDevMode, clearLocalDevAuth } from '../utils/localDevAuth';

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

      // 2. Try Backend Auth
      const token = authService.getToken();
      if (token) {
        try {
          const res = await authService.getMe();
          // Adjust based on standard api_response
          const user = res?.data || res;
          
          if (user && user.user_id) {
            setCurrentUser(user);
            setIsAuthenticated(true);
            setUserProfile({
              ...user,
              id: user.user_id,
              displayName: user.display_name,
              canUseFeatures: true
            });
            setLoading(false);
            return;
          } else {
             authService.logout();
          }
        } catch (err) {
          console.error('Backend auth init failed:', err);
          authService.logout();
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    const user = data.data?.user || data.user;
    
    if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        setUserProfile({
        ...user,
        id: user.user_id,
        displayName: user.display_name,
        canUseFeatures: true
        });
    }
    return data;
  };

  const register = async (email, password, displayName) => {
    const data = await authService.register(email, password, displayName);
    const user = data.data?.user || data.user;
    
    if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        setUserProfile({
        ...user,
        id: user.user_id,
        displayName: user.display_name,
        canUseFeatures: true
        });
    }
    return data;
  };

  const forgotPassword = async (email) => {
    return await authService.forgotPassword(email);
  };

  const logout = async () => {
    authService.logout();
    clearLocalDevAuth();
    
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
      try {
        const res = await authService.getMe();
        const user = res?.data || res;
        
        if (user && user.user_id) {
            setUserProfile(prev => ({ ...prev, ...user, displayName: user.display_name }));
        }
      } catch (err) {
          console.warn("Failed to refresh user profile", err);
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
