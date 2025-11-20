import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Play, Sword, Users, MessageCircle, ShoppingBag, Newspaper, LogOut, User, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { auth, subscribeToActiveUsers } from '../utils/firebase';
import { signOut } from 'firebase/auth';

const Navbar = () => {
  const location = useLocation();
  const { userProfile } = useAuth();
  const [activeUsers, setActiveUsers] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToActiveUsers((count) => {
      setActiveUsers(count);
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowUserMenu(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { path: '/hub', icon: Home, label: 'The Hub' },
    { path: '/stream', icon: Play, label: 'Stream-X' },
    { path: '/arena', icon: Sword, label: 'The Arena' },
    { path: '/clan', icon: Users, label: 'Clan HQ' },
    { path: '/oracle', icon: MessageCircle, label: 'The Oracle' },
    { path: '/marketplace', icon: ShoppingBag, label: 'Marketplace', premium: true },
    { path: '/news', icon: Newspaper, label: 'News' },
  ];

  const getRankColor = (rank) => {
    const rankColors = {
      'Immortal': 'from-purple-500 via-pink-500 to-red-500',
      'God Level User': 'from-yellow-400 via-orange-500 to-red-500',
      'Global Ranker': 'from-blue-400 via-cyan-500 to-teal-500',
      'Sage Mode': 'from-green-400 via-emerald-500 to-teal-500',
      'Berserker': 'from-red-500 via-orange-500 to-yellow-500',
      'Diamond Badge User': 'from-cyan-300 via-blue-400 to-indigo-500',
      'Golden Badge User': 'from-yellow-300 via-yellow-500 to-amber-500',
      'Silver Badge User': 'from-gray-300 via-gray-400 to-gray-500',
      'Bronze Badge User': 'from-orange-300 via-amber-500 to-orange-600',
      'Ranked': 'from-neon-blue to-neon-purple',
      'Unranked': 'from-gray-400 to-gray-600',
      'User': 'from-gray-500 to-gray-700',
      'Mere User': 'from-gray-600 to-gray-800',
    };
    return rankColors[rank] || 'from-gray-600 to-gray-800';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-neon-blue/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/hub" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg flex items-center justify-center animate-pulse-glow">
              <span className="text-2xl font-bold">NK</span>
            </div>
            <span className="text-xl font-bold neon-text hidden sm:block">NK Network</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const isPremiumLocked = item.premium && !userProfile?.isPremium;

              return (
                <Link
                  key={item.path}
                  to={isPremiumLocked ? '#' : item.path}
                  className={`
                    relative px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2
                    ${isActive 
                      ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/50' 
                      : 'hover:bg-void-gray/50 text-gray-300 hover:text-neon-blue'
                    }
                    ${isPremiumLocked ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  onClick={(e) => isPremiumLocked && e.preventDefault()}
                >
                  <Icon size={18} />
                  <span className="text-sm">{item.label}</span>
                  {item.premium && (
                    <Crown size={14} className="text-yellow-400" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* User Info & Stats */}
          <div className="flex items-center space-x-4">
            {/* Live User Count */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-lg bg-void-gray/50 border border-neon-blue/30">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-400">Live:</span>
              <span className="text-sm font-bold text-neon-blue">{activeUsers}</span>
            </div>

            {/* User Profile */}
            {userProfile && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-void-gray/50 transition-all"
                >
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-bold text-neon-blue">
                      {userProfile.displayName || 'Shinobi'}
                    </div>
                    <div className={`text-xs font-semibold bg-gradient-to-r ${getRankColor(userProfile.rank)} bg-clip-text text-transparent`}>
                      {userProfile.rank}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center font-bold border-2 border-neon-blue/50">
                    {(userProfile.displayName || 'S').charAt(0).toUpperCase()}
                  </div>
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 glass-panel rounded-lg shadow-xl border border-neon-blue/30 overflow-hidden">
                    <div className="p-4 border-b border-neon-blue/20">
                      <div className="text-sm font-bold text-neon-blue mb-1">
                        {userProfile.displayName}
                      </div>
                      <div className="text-xs text-gray-400 mb-2">
                        {userProfile.email}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Chakra:</span>
                        <span className="font-bold text-neon-purple">{userProfile.chakra?.toLocaleString() || 0}</span>
                      </div>
                      {userProfile.clan && (
                        <div className="mt-2 text-xs">
                          <span className="text-gray-400">Clan:</span>
                          <span className="ml-2 text-neon-pink font-semibold">{userProfile.clan}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-red-500/20 transition-colors flex items-center space-x-2 text-red-400"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-neon-blue/30 pb-safe">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const isPremiumLocked = item.premium && !userProfile?.isPremium;

            return (
              <Link
                key={item.path}
                to={isPremiumLocked ? '#' : item.path}
                className={`
                  flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all
                  ${isActive ? 'text-neon-blue' : 'text-gray-400'}
                  ${isPremiumLocked ? 'opacity-50' : ''}
                `}
                onClick={(e) => isPremiumLocked && e.preventDefault()}
              >
                <Icon size={20} />
                <span className="text-xs">{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
