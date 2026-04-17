import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  Film, Users, Shield, Newspaper, BookOpen,
  Menu, X, LogOut, Compass, ShoppingBag,
  Scroll, ChevronRight, Search, Feather, Bell, MessageSquare
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../utils/firebase';
import { signOut } from 'firebase/auth';
import { clearLocalDevAuth } from '../utils/localDevAuth';
import { NakamaLogo } from './NakamaLogo';
import SearchOverlay from './SearchOverlay';

const NAV_LINKS = [
  { path: '/library', label: 'Library' },
  { path: '/manga', label: 'Manga' },
  { path: '/community', label: 'Community' },
  { path: '/clan', label: 'Clans' },
  { path: '/news', label: 'News' },
  { path: '/tiering', label: 'Rankings' },
];

const MOBILE_SECTIONS = [
  {
    title: 'Browse',
    links: [
      { path: '/library', label: 'Anime Library', icon: Film },
      { path: '/manga', label: 'Manga Hub', icon: BookOpen },
      { path: '/story-writer', label: 'Story Writer', icon: Feather },
      { path: '/news', label: 'News', icon: Newspaper },
      { path: '/tiering', label: 'Power Rankings', icon: BookOpen },
    ]
  },
  {
    title: 'Social',
    links: [
      { path: '/community', label: 'Community', icon: BookOpen },
      { path: '/clan', label: 'Clans', icon: Shield },
      { path: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
    ]
  },
  {
    title: 'You',
    links: [
      { path: '/command-center', label: 'Dashboard', icon: Compass },
      { path: '/oracle', label: 'The Sensei', icon: Scroll },
    ]
  },
];

const Navbar = () => {
  const { userProfile, openAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Ctrl+K to open search
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleLogout = async () => {
    try {
      if (auth) await signOut(auth);
      clearLocalDevAuth();
      localStorage.removeItem('nakama_local_auth');
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#050505]/90 backdrop-blur-xl border-b border-white/[0.06]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Left: Logo + Links */}
            <div className="flex items-center gap-10">
              <Link to="/" className="flex-shrink-0">
                <NakamaLogo className="h-7 w-auto" />
              </Link>

              {/* Desktop nav links */}
              <div className="hidden lg:flex items-center gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3.5 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                      isActive(link.path)
                        ? 'text-white bg-white/[0.06]'
                        : 'text-[#888] hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Search button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] text-[#666] hover:text-white bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.1] transition-colors"
              >
                <Search size={14} />
                <kbd className="hidden lg:inline ml-1 px-1.5 py-0.5 rounded bg-white/[0.06] text-[10px] text-[#555]">⌘K</kbd>
              </button>

              {userProfile && (
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="p-2 rounded-lg text-[#888] hover:text-white hover:bg-white/[0.06] transition-all relative"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#b76e79] shadow-[0_0_10px_rgba(183,110,121,0.5)]" />
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {notificationsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-80 rounded-2xl overflow-hidden z-[100]"
                        style={{ 
                          background: 'rgba(10, 10, 10, 0.95)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                        }}
                      >
                        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                          <h3 className="text-[11px] font-bold text-[#555] uppercase tracking-wider">Notifications</h3>
                          {unreadCount > 0 && <span className="text-[10px] text-[#b76e79] font-bold">New Updates</span>}
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          <div className="p-8 text-center">
                            <MessageSquare size={32} className="mx-auto mb-3 opacity-10" />
                            <p className="text-xs text-[#555]">All caught up with the network.</p>
                          </div>
                        </div>
                        <Link 
                          to="/activity" 
                          onClick={() => setNotificationsOpen(false)}
                          className="block p-3 text-center text-[11px] text-[#b76e79] font-medium hover:bg-white/[0.02] border-t border-white/[0.06] transition-colors"
                        >
                          View All Activity
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              {userProfile ? (
                <Link
                  to="/profile"
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full hover:bg-white/[0.04] transition-colors"
                >
                  <div className="h-7 w-7 rounded-full bg-[#1a1a1a] border border-white/[0.08] overflow-hidden">
                    {userProfile.photoURL ? (
                      <img src={userProfile.photoURL} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-white/60 text-xs font-semibold">
                        {userProfile.displayName?.[0] || 'U'}
                      </div>
                    )}
                  </div>
                  <span className="hidden lg:inline text-[13px] text-[#aaa] font-medium">
                    {userProfile.displayName?.split(' ')[0] || 'Profile'}
                  </span>
                </Link>
              ) : (
                <button
                  onClick={() => openAuthModal()}
                  className="hidden sm:flex px-4 py-2 rounded-lg text-[13px] font-semibold text-white bg-[#b76e79] hover:bg-[#c48b9f] border border-[#b76e79]/20 hover:border-[#b76e79]/30 transition-all shadow-[0_0_15px_rgba(183,110,121,0.15)] hover:shadow-[0_0_20px_rgba(183,110,121,0.25)]"
                >
                  Sign In
                </button>
              )}

              {/* Mobile toggle */}
              <button
                className="lg:hidden p-2 rounded-lg text-[#777] hover:text-white hover:bg-white/[0.06] transition-colors"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu — Bottom Sheet Style */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[61] lg:hidden rounded-t-2xl overflow-hidden"
              style={{ background: '#0a0a0a', maxHeight: '85vh' }}
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-white/10" />
              </div>

              <div className="overflow-y-auto px-5 pb-8" style={{ maxHeight: 'calc(85vh - 24px)' }}>
                <div className="flex items-center justify-between py-3 mb-4">
                  <NakamaLogo className="h-6 w-auto" />
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-[#555] hover:text-white bg-white/[0.04]"
                  >
                    <X size={18} />
                  </button>
                </div>

                {MOBILE_SECTIONS.map((section, idx) => (
                  <div key={section.title} className={idx > 0 ? 'mt-6' : ''}>
                    <h3 className="text-[10px] font-semibold text-[#444] uppercase tracking-[0.15em] mb-2 px-1">
                      {section.title}
                    </h3>
                    <div className="space-y-0.5">
                      {section.links.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                            isActive(item.path)
                              ? 'bg-white/[0.06] text-white'
                              : 'text-[#999] hover:text-white hover:bg-white/[0.03]'
                          }`}
                        >
                          <item.icon size={18} className="opacity-50" />
                          <span className="text-sm font-medium">{item.label}</span>
                          {isActive(item.path) && (
                            <ChevronRight size={14} className="ml-auto opacity-30" />
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="mt-8 pt-5 border-t border-white/[0.06]">
                  {userProfile ? (
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-[#888] bg-white/[0.04] hover:bg-white/[0.06] transition-colors"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  ) : (
                    <button
                      onClick={() => { setMobileMenuOpen(false); openAuthModal(); }}
                      className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-[#b76e79] hover:bg-[#f26065] transition-colors"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Navbar;
