import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  signInWithEmail, 
  signUpWithEmail, 
  resetUserPassword, 
  logOut, 
  getUserProfile, 
  createUserProfile,
  subscribeToUserProfile,
  signInAnon
} from '../utils/firebase';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
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

  // Track profile subscription cleanup
  const unsubscribeProfileRef = React.useRef(null);

  // Initialize auth state
  useEffect(() => {
    // 1. Local Dev Mode Bypass
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

    // 2. Native Firebase Authentication Sync
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubscribeProfileRef.current) {
        unsubscribeProfileRef.current();
        unsubscribeProfileRef.current = null;
      }

      if (firebaseUser) {
        // Logged in securely via Firebase!
        setIsGuest(firebaseUser.isAnonymous);
        localStorage.removeItem('nakama_guest_mode');
        
        setCurrentUser(firebaseUser);
        setIsAuthenticated(true);

        if (firebaseUser.isAnonymous) {
          setUserProfile({
            id: firebaseUser.uid,
            user_id: firebaseUser.uid,
            displayName: 'Guest Explorer',
            email: null,
            chakra: 0,
            rank: 'Guest',
            isGuest: true,
            canUseFeatures: false,
          });
          setLoading(false);
          return;
        }

        try {
          // Attempt to fetch robust profile dict from Firestore database
          let profileDoc = await getUserProfile(firebaseUser.uid);
          
          if (!profileDoc) {
             // If profile somehow didn't generate during signup, force creation now
             profileDoc = await createUserProfile(firebaseUser.uid, {
               email: firebaseUser.email,
               displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
               user_id: firebaseUser.uid
             });
          }

          const completeProfile = {
            ...profileDoc,
            id: firebaseUser.uid,
            user_id: firebaseUser.uid,
            displayName: profileDoc.displayName || firebaseUser.displayName,
            email: firebaseUser.email,
            canUseFeatures: true
          };

          setUserProfile(completeProfile);

          // Sub to dynamic changes (chakra points, rank updates, etc) silently
          unsubscribeProfileRef.current = subscribeToUserProfile(firebaseUser.uid, (updatedProfile) => {
             if (updatedProfile) {
                setUserProfile(prev => ({
                    ...prev,
                    ...updatedProfile,
                    id: firebaseUser.uid,
                    user_id: firebaseUser.uid,
                }));
             }
          });

        } catch (error) {
          console.error("Firestore error loading custom claims:", error);
          // Fallback basic user context if firestore rules explicitly deny us for some reason
          setUserProfile({
             id: firebaseUser.uid,
             user_id: firebaseUser.uid,
             displayName: firebaseUser.displayName,
             email: firebaseUser.email,
             canUseFeatures: true
          });
        }
      } else {
        // Logged out
        setCurrentUser(null);
        setUserProfile(null);
        setIsAuthenticated(false);
        setIsGuest(false);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfileRef.current) unsubscribeProfileRef.current();
    };
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmail(email, password);
      // Let onAuthStateChanged handle setting context uniformly
      return userCredential;
    } catch (error) {
      console.error('Firebase Login Error:', error);
      // Map arbitrary Firebase codes to human-readable strings for the gorgeous UI modal
      let msg = 'Failed to sign in. Please verify your credentials.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          msg = 'Invalid email or password.';
      } else if (error.code === 'auth/too-many-requests') {
          msg = 'Too many attempts. Account temporarily locked for safety.';
      }
      throw new Error(msg);
    }
  };

  const register = async (email, password, displayName) => {
    try {
      const userCredential = await signUpWithEmail(email, password);
      
      // We immediately update the core Authentication layer Name
      await updateProfile(userCredential.user, { displayName });

      // Build out the initial Firestore profile skeleton representing this user
      await createUserProfile(userCredential.user.uid, {
        email: email,
        displayName: displayName,
        user_id: userCredential.user.uid, // explicitly supply this bridging field
        chakra: 0,
        rank: 'Mere User'
      });

      return userCredential;
    } catch (error) {
      console.error('Firebase Signup Error:', error);
      let msg = 'Registration failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered here.';
      } else if (error.code === 'auth/invalid-email') {
        msg = 'Please enter a formally valid email address.';
      }
      throw new Error(msg);
    }
  };

  const forgotPassword = async (email) => {
    try {
      await resetUserPassword(email);
      return true;
    } catch (error) {
      console.error('Password Reset Error:', error);
      let msg = 'Failed to dispatch resetting beacon.';
      if (error.code === 'auth/user-not-found') msg = 'Cannot track an account to this coordinate.';
      throw new Error(msg);
    }
  };

  const logout = async () => {
    await logOut();
    clearLocalDevAuth();
    localStorage.removeItem('nakama_guest_mode');
    
    // Hard reset all contextual bindings
    setCurrentUser(null);
    setUserProfile(null);
    setIsGuest(false);
    setIsAuthenticated(false);
    
    if (unsubscribeProfileRef.current) {
        unsubscribeProfileRef.current();
        unsubscribeProfileRef.current = null;
    }
  };

  const loginAsGuest = async () => {
    try {
      await signInAnon();
    } catch (error) {
      console.error('Guest Login Error:', error);
    }
  };

  const refreshUserProfile = async () => {
    if (isAuthenticated && !isGuest && currentUser?.uid) {
      try {
        const profileDoc = await getUserProfile(currentUser.uid);
        if (profileDoc) {
            setUserProfile(prev => ({ 
                ...prev, 
                ...profileDoc,
                id: currentUser.uid,
                user_id: currentUser.uid 
            }));
        }
      } catch (err) {
        console.warn("Failed to manually refresh network profile context", err);
      }
    }
  };

  const requireAuth = (actionCallback, message = 'You must establish an identity to proceed') => {
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
    user: userProfile || currentUser, 
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
