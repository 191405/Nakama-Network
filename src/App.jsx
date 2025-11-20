import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import EntryAnimation from './components/EntryAnimation';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Hub from './pages/Hub';
import Stream from './pages/Stream';
import Arena from './pages/Arena';
import Clan from './pages/Clan';
import Oracle from './pages/Oracle';
import Marketplace from './pages/Marketplace';
import News from './pages/News';

function AppContent() {
  const { currentUser, loading } = useAuth();
  const [showEntry, setShowEntry] = useState(true);
  const [entryComplete, setEntryComplete] = useState(false);

  useEffect(() => {
    // Check if user has seen entry animation in this session
    const hasSeenEntry = sessionStorage.getItem('entryAnimationSeen');
    if (hasSeenEntry) {
      setShowEntry(false);
      setEntryComplete(true);
    }
  }, []);

  const handleEntryComplete = () => {
    sessionStorage.setItem('entryAnimationSeen', 'true');
    setShowEntry(false);
    setTimeout(() => setEntryComplete(true), 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cyber-black">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (showEntry) {
    return <EntryAnimation onComplete={handleEntryComplete} />;
  }

  if (!entryComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cyber-black">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-cyber-black relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 grid-background opacity-10 pointer-events-none"></div>
      <div className="fixed inset-0 nebula-bg pointer-events-none"></div>
      <div className="scanline-effect fixed inset-0 pointer-events-none"></div>

      <Navbar />
      
      <Routes>
        <Route path="/" element={<Navigate to="/hub" replace />} />
        <Route path="/hub" element={<Hub />} />
        <Route path="/stream" element={<Stream />} />
        <Route path="/arena" element={<Arena />} />
        <Route path="/clan" element={<Clan />} />
        <Route path="/oracle" element={<Oracle />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/news" element={<News />} />
        <Route path="*" element={<Navigate to="/hub" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
