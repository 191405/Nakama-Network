import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import EntryAnimation from './components/EntryAnimation';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CinematicSkyBackground from './components/CinematicSkyBackground';
import NightSkyBackground from './components/NightSkyBackground';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { NotificationContainer, useNotification } from './components/Notification';
import Homepage from './pages/Homepage';
import Hub from './pages/Hub';
import Arena from './pages/Arena';
import Clan from './pages/Clan';
import Oracle from './pages/Oracle';
import Marketplace from './pages/Marketplace';
import CharactersHub from './pages/CharactersHub';
import AnimeDetail from './pages/AnimeDetail';
import Community from './pages/Community';
import AnimeNews from './pages/AnimeNews';
import TieringSystem from './pages/TieringSystem';
import AdminDashboard from './pages/AdminDashboard';
import WelcomeBot from './components/WelcomeBot';
import HouseOfSensei from './components/HouseOfSensei';
import UserProfile from './pages/UserProfile';
import ClanWars from './pages/ClanWars';
import MillionaireTrivia from './pages/MillionaireTrivia';
import AdminPanel from './pages/AdminPanel';
import ScrollToTop from './components/ScrollToTop';
import AnimeLibrary from './pages/AnimeLibrary';
import AnimeUpload from './pages/AnimeUpload';
import AnimeWatch from './pages/AnimeWatch';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const PageWrapper = ({ children }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

function AppContent() {
  const { isDarkMode } = useTheme();
  const { notifications, removeNotification } = useNotification();
  const location = useLocation();
  const isOraclePage = location.pathname === '/oracle';
  const [showEntry, setShowEntry] = useState(true);
  const [entryComplete, setEntryComplete] = useState(false);

  useEffect(() => {
    
    const hasSeenEntry = sessionStorage.getItem('postLoginEntryAnimationSeen');
    if (hasSeenEntry) {
      setShowEntry(false);
      setEntryComplete(true);
    }
  }, []);

  const handleEntryComplete = () => {
    sessionStorage.setItem('postLoginEntryAnimationSeen', 'true');
    setShowEntry(false);
    setTimeout(() => setEntryComplete(true), 500);
  };

  if (showEntry) {
    return <EntryAnimation onComplete={handleEntryComplete} />;
  }

  if (!entryComplete) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#050505' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="w-10 h-10 rounded-full border-2 border-yellow-500/30 border-t-yellow-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: '#050505' }}>
      {!isOraclePage && (
        <>
          {isDarkMode ? <NightSkyBackground /> : <CinematicSkyBackground />}
          <div className="fixed inset-0 grid-background opacity-3 pointer-events-none z-10"></div>
        </>
      )}

      <Navbar />
      <ScrollToTop />
      <WelcomeBot />
      <HouseOfSensei currentPage={location.pathname.replace('/', '') || 'homepage'} />
      <NotificationContainer notifications={notifications} onClose={removeNotification} />

      <PageWrapper>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/command-center" element={<Hub />} />
          <Route path="/hub" element={<Navigate to="/command-center" replace />} />
          <Route path="/arena" element={<Arena />} />
          <Route path="/community" element={<Community />} />
          <Route path="/clan" element={<Clan />} />
          <Route path="/oracle" element={<Oracle />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/news" element={<AnimeNews />} />
          <Route path="/characters" element={<CharactersHub />} />
          <Route path="/tiering" element={<TieringSystem />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/anime/:id" element={<AnimeDetail />} />
          <Route path="/anime/:id/:source" element={<AnimeDetail />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/clan-wars" element={<ClanWars />} />
          <Route path="/millionaire" element={<MillionaireTrivia />} />
          <Route path="/admin-panel" element={<AdminPanel />} />
          <Route path="/library" element={<AnimeLibrary />} />
          <Route path="/library/upload" element={<AnimeUpload />} />
          <Route path="/library/:animeId" element={<AnimeWatch />} />
          <Route path="/library/:animeId/:episodeId" element={<AnimeWatch />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PageWrapper>

      {!isOraclePage && <Footer />}
    </div>
  );
}

function RequireAdmin({ children }) {
  const { userProfile, loading } = useAuth();

  if (loading) return null; 

  const isAdmin = userProfile?.isAdmin === true || userProfile?.rank === 'Sage Mode'; 

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AuthGate() {
  const { currentUser, loading, isGuest } = useAuth();

  if (loading) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#050505' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="w-12 h-12 rounded-full border-3 border-yellow-500/30 border-t-yellow-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
    );
  }

  if (!currentUser && !isGuest) {
    return <Login />;
  }

  return <AppContent />;
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AuthGate />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
