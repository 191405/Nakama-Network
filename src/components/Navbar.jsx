import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  Home, Play, Sword, Users, MessageCircle, ShoppingBag,
  Newspaper, LogOut, Crown, Tv, Zap, BookOpen,
  Menu, X, Compass, ChevronDown, Bell, Search,
  Gamepad, Trophy, Shield, Flame, Star, Wallet
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { auth, subscribeToActiveUsers } from '../utils/firebase';
import { signOut } from 'firebase/auth';
import { clearLocalDevAuth } from '../utils/localDevAuth';
import { useTheme } from '../contexts/ThemeContext';
import { NakamaLogo } from './NakamaLogo';

const NAV_STRUCTURE = [
  {
    id: 'media',
    label: 'Media',
    icon: Play,
    items: [
      { path: '/library', label: 'Anime Library', icon: Play, desc: 'Uploaded HD Anime' },
      { path: '/news', label: 'Anime News', icon: Newspaper, desc: 'Latest Industry Updates' },
    ]
  },
  {
    id: 'social',
    label: 'Social',
    icon: Users,
    items: [
      { path: '/clan', label: 'Clan HQ', icon: Shield, desc: 'Manage Your Alliance' },
      { path: '/clan-wars', label: 'Clan Wars', icon: Sword, desc: 'Battle for Dominance' },
      { path: '/community', label: 'Community', icon: BookOpen, desc: 'Wikis & Discussions' },
    ]
  },
  {
    id: 'systems',
    label: 'Systems',
    icon: Zap,
    items: [
      { path: '/arena', label: 'Battle Arena', icon: Flame, desc: 'Vote & Rank Characters' },
      { path: '/millionaire', label: 'Millionaire Trivia', icon: Trophy, desc: 'Win 1,000,000 Chakra' },
      { path: '/tiering', label: 'Power Tiering', icon: Zap, desc: 'Official Power Scales' },
      { path: '/characters', label: 'Characters', icon: Users, desc: 'Database & stats' },
    ]
  },
  {
    id: 'hub',
    label: 'Hub',
    icon: Star,
    items: [
      { path: '/command-center', label: 'Command Center', icon: Compass, desc: 'Your Daily Dashboard' },
      { path: '/oracle', label: ' The Oracle', icon: MessageCircle, desc: 'Ask Sensei Anything' },
      { path: '/marketplace', label: 'Marketplace', icon: ShoppingBag, desc: 'Spend Your Chakra' },
      { path: '/admin-panel', label: '🔐 Admin Panel', icon: Shield, desc: 'Site Management' },
    ]
  }
];

const NavDropdown = ({ item, activeId, setActiveId }) => (
  <div
    className="relative group h-full flex items-center"
    onMouseEnter={() => setActiveId(item.id)}
    onMouseLeave={() => setActiveId(null)}
  >
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
                flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden
                ${activeId === item.id ? 'text-yellow-400 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 shadow-lg shadow-yellow-500/20' : 'text-slate-300 hover:text-white hover:bg-white/5'}
            `}
    >
      {activeId === item.id && (
        <motion.div
          layoutId="navHighlight"
          className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-xl"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <item.icon size={18} className="relative z-10" />
      <span className="relative z-10">{item.label}</span>
      <ChevronDown size={14} className={`transition-transform duration-300 relative z-10 ${activeId === item.id ? 'rotate-180' : ''}`} />
    </motion.button>

    <AnimatePresence>
      {activeId === item.id && (
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute top-full left-0 w-80 pt-4"
        >
          <div className="bg-[#0a0a0f]/98 backdrop-blur-2xl border border-yellow-500/30 rounded-2xl p-3 shadow-[0_20px_60px_-15px_rgba(234,179,8,0.4)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-amber-500/5 pointer-events-none" />
            <div className="grid gap-1.5 relative z-10">
              {item.items.map((subItem) => (
                <motion.div
                  key={subItem.path}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Link
                    to={subItem.path}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-yellow-500/10 hover:to-amber-500/5 group/item transition-all border border-transparent hover:border-yellow-500/20"
                  >
                    <div className="p-2.5 rounded-xl bg-white/5 group-hover/item:bg-gradient-to-br group-hover/item:from-yellow-500/20 group-hover/item:to-amber-500/20 group-hover/item:text-yellow-400 text-slate-400 transition-all group-hover/item:shadow-lg group-hover/item:shadow-yellow-500/20">
                      <subItem.icon size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="text-white text-sm font-semibold group-hover/item:text-yellow-400 transition-colors flex items-center gap-2">
                        {subItem.label}
                        <ChevronRight size={14} className="opacity-0 group-hover/item:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-slate-500 text-xs mt-0.5">
                        {subItem.desc}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const UserMenu = ({ user, activeUsers, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="flex items-center gap-4 cursor-pointer py-2"
      >
        {}
        <div className="hidden lg:flex flex-col items-end mr-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-green-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            {activeUsers.toLocaleString()} Online
          </div>
        </div>

        <div className="h-8 w-[1px] bg-white/10 mx-2 hidden lg:block" />

        {}
        <div className={`p-[2px] rounded-full bg-gradient-to-br ${user?.isPremium ? 'from-yellow-400 via-amber-500 to-yellow-600 animate-pulse' : 'from-slate-700 to-slate-600'} shadow-lg ${user?.isPremium ? 'shadow-yellow-500/50' : ''}`}>
          <div className="h-9 w-9 rounded-full bg-black overflow-hidden relative ring-2 ring-black">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-slate-800 text-white font-bold">
                {user?.displayName?.[0] || 'U'}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: 10, scale: 0.95, x: 20 }}
            className="absolute top-full right-0 w-64 pt-2"
          >
            <div className="bg-[#0a0a0f]/98 backdrop-blur-2xl border border-yellow-500/30 rounded-2xl p-4 shadow-[0_20px_60px_-15px_rgba(234,179,8,0.4)]">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-amber-500/5 pointer-events-none rounded-2xl" />
              {}
              <div className="mb-4 pb-4 border-b border-white/10 relative z-10">
                <h3 className="text-white font-bold truncate text-lg">{user?.displayName || 'User'}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 font-medium">
                    {user?.isPremium ? 'Premium' : 'Member'}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-blue-400">
                    <Wallet size={12} />
                    {(user?.chakra || 0).toLocaleString()} Chakra
                  </div>
                </div>
              </div>

              {}
              <div className="space-y-1 relative z-10">
                <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-yellow-500/10 hover:to-amber-500/5 transition-all group">
                  <Users size={16} className="group-hover:text-yellow-400 transition-colors" /> 
                  <span className="font-medium">Profile</span>
                </Link>
                <Link to="/command-center" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-yellow-500/10 hover:to-amber-500/5 transition-all group">
                  <Compass size={16} className="group-hover:text-yellow-400 transition-colors" /> 
                  <span className="font-medium">Dashboard</span>
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all group">
                    <Shield size={16} className="group-hover:scale-110 transition-transform" /> 
                    <span className="font-medium">Admin Panel</span>
                  </Link>
                )}
              </div>

              {}
              <div className="mt-4 pt-3 border-t border-white/10 relative z-10">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-left group"
                >
                  <LogOut size={16} className="group-hover:translate-x-1 transition-transform" /> 
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Navbar = () => {
  const { userProfile } = useAuth();
  const [activeUsers, setActiveUsers] = useState(0);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToActiveUsers((count) => setActiveUsers(count));
    return unsubscribe;
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

  if (!userProfile) return null;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`
                fixed top-0 left-0 right-0 z-50 transition-all duration-300
                ${scrolled ? 'bg-[#050505]/80 backdrop-blur-lg border-b border-white/5 py-2 shadow-lg' : 'bg-transparent py-4'}
            `}
      >
        <div className="max-w-7xl mx-auto px-4 h-full">
          <div className="flex items-center justify-between h-14">

            {}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex-shrink-0 relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <motion.div
                  whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <NakamaLogo className="h-8 w-auto relative z-10" />
                </motion.div>
              </Link>

              {}
              <div className="hidden lg:flex items-center gap-1 h-14">
                {NAV_STRUCTURE.map((item) => (
                  <NavDropdown
                    key={item.id}
                    item={item}
                    activeId={activeDropdown}
                    setActiveId={setActiveDropdown}
                  />
                ))}
              </div>
            </div>

            {}
            <div className="flex items-center gap-4">
              <motion.button 
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="hidden sm:flex p-2.5 rounded-xl text-slate-400 hover:text-yellow-400 hover:bg-gradient-to-br hover:from-yellow-500/10 hover:to-amber-500/5 transition-all shadow-lg hover:shadow-yellow-500/20"
              >
                <Search size={20} />
              </motion.button>

              <div className="h-6 w-[1px] bg-white/10 hidden sm:block" />

              <UserMenu user={userProfile} activeUsers={activeUsers} onLogout={handleLogout} />

              {}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="lg:hidden p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-gradient-to-br hover:from-yellow-500/10 hover:to-amber-500/5 transition-all"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu size={24} />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-[#050505] lg:hidden overflow-y-auto"
          >
            <div className="p-4 space-y-6 min-h-screen relative">
              {}
              <div className="flex items-center justify-between sticky top-0 bg-[#050505] z-10 pb-4 border-b border-white/5">
                <div className="flex flex-col">
                  <NakamaLogo className="h-6 w-auto" />
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-400 mt-1">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                    </span>
                    {activeUsers.toLocaleString()} Online
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full bg-white/5 text-slate-300"
                >
                  <X size={24} />
                </button>
              </div>

              {}
              <div className="space-y-8 pb-20">
                {NAV_STRUCTURE.map((section, idx) => (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <h3 className="flex items-center gap-2 text-yellow-500 font-bold mb-4 px-2">
                      <section.icon size={18} />
                      {section.label}
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {section.items.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 active:scale-98 transition-all"
                        >
                          <div className="p-2 rounded-lg bg-black text-slate-400">
                            <item.icon size={20} />
                          </div>
                          <div>
                            <div className="text-white font-medium">{item.label}</div>
                            <div className="text-xs text-slate-500">{item.desc}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {}
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#050505]/95 backdrop-blur border-t border-white/10">
                <button
                  onClick={handleLogout}
                  className="w-full py-3 rounded-xl bg-red-500/10 text-red-400 font-bold flex items-center justify-center gap-2"
                >
                  <LogOut size={20} /> Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
