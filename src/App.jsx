import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import EntryAnimation from './components/EntryAnimation';
import AuthModal from './components/AuthModal';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { NotificationContainer, useNotification } from './components/Notification';
import ScrollToTop from './components/ScrollToTop';
import Homepage from './pages/Homepage';
import Hub from './pages/Hub';
import Clan from './pages/Clan';
import Oracle from './pages/Oracle';
import Marketplace from './pages/Marketplace';

import AnimeDetail from './pages/AnimeDetail';
import Community from './pages/Community';
import AnimeNews from './pages/AnimeNews';
import TieringSystem from './pages/TieringSystem';
import AdminPanel from './pages/AdminPanel';
import UserProfile from './pages/UserProfile';
import AnimeLibrary from './pages/AnimeLibrary';
import StoryEditor from './pages/StoryEditor';
import MangaDashboard from './pages/MangaDashboard';
import MangaUploader from './pages/MangaUploader';
import MangaReader from './pages/MangaReader';

import { pageTransition } from './motion/motionPresets';

const PageWrapper = ({ children }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={pageTransition.initial}
        animate={pageTransition.animate}
        exit={pageTransition.exit}
        transition={pageTransition.transition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

function AppContent() {
  const { notifications, removeNotification } = useNotification();
  const location = useLocation();
  const [showEntry, setShowEntry] = useState(true);
  const isOraclePage = location.pathname === '/oracle';

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#050505]">
      {showEntry && <EntryAnimation onComplete={() => setShowEntry(false)} />}
      
      {/* Backgrounds removed for minimal, high-end style */}
      <Navbar />
      <AuthModal />
      <ScrollToTop />
      <NotificationContainer notifications={notifications} onClose={removeNotification} />

      <PageWrapper>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/command-center" element={<Hub />} />
          <Route path="/hub" element={<Navigate to="/command-center" replace />} />
          <Route path="/community" element={<Community />} />
          <Route path="/clan" element={<Clan />} />
          <Route path="/oracle" element={<Oracle />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/news" element={<AnimeNews />} />

          <Route path="/tiering" element={<TieringSystem />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/anime/:id" element={<AnimeDetail />} />
          <Route path="/anime/:id/:source" element={<AnimeDetail />} />
          <Route path="/profile" element={<UserProfile />} />

          <Route path="/library" element={<AnimeLibrary />} />
          <Route path="/story-writer" element={<StoryEditor />} />

          <Route path="/manga" element={<MangaDashboard />} />
          <Route path="/manga/:id" element={<MangaReader />} />
          <Route path="/manga/:id/upload" element={<MangaUploader />} />
          <Route path="/manga/read/:id/:chapterId" element={<MangaReader />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PageWrapper>

      {!isOraclePage && <Footer />}
    </div>
  );
}

// Removed AuthGate to allow read-access to guests
function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
