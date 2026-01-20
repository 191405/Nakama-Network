

let localDevUser = null;

export const initLocalDevAuth = () => {
  
  const uid = 'local-dev-user-' + Math.random().toString(36).substr(2, 9);
  localDevUser = {
    uid,
    email: 'devuser@localhost',
    displayName: 'Dev User',
    isAnonymous: true,
    metadata: {
      creationTime: new Date().toISOString(),
    },
  };
  
  localStorage.setItem('localDevUser', JSON.stringify(localDevUser));
  return localDevUser;
};

export const getLocalDevUser = () => {
  
  const stored = localStorage.getItem('localDevUser');
  if (stored) {
    try {
      localDevUser = JSON.parse(stored);
      return localDevUser;
    } catch (e) {
      console.warn('Failed to parse stored local dev user');
    }
  }
  
  if (!localDevUser) {
    initLocalDevAuth();
  }
  return localDevUser;
};

export const isLocalDevMode = () => {
  return !!localStorage.getItem('localDevUser');
};

export const clearLocalDevAuth = () => {
  localDevUser = null;
  localStorage.removeItem('localDevUser');
};
