import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, createUserProfile, getUserProfile, updateUserProfile } from '../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Get or create user profile
        let profile = await getUserProfile(user.uid);
        
        if (!profile) {
          // Create new profile for first-time users
          profile = await createUserProfile(user.uid, {
            email: user.email || `anon_${user.uid.substring(0, 8)}@nk.network`,
            displayName: user.displayName || `Shinobi_${user.uid.substring(0, 6)}`,
          });
        } else {
          // Update last active timestamp
          await updateUserProfile(user.uid, {});
        }
        
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const refreshUserProfile = async () => {
    if (currentUser) {
      const profile = await getUserProfile(currentUser.uid);
      setUserProfile(profile);
    }
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
