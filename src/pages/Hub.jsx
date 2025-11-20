import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, Users, TrendingUp, Star, Award, Download, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getLeaderboard, getAnnouncements } from '../utils/firebase';
import { generateDailyProphecy } from '../utils/gemini';

const Hub = () => {
  const { userProfile, refreshUserProfile } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [prophecy, setProphecy] = useState('');
  const [loadingProphecy, setLoadingProphecy] = useState(false);
  const [showProphecy, setShowProphecy] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [leaderboardData, announcementsData] = await Promise.all([
      getLeaderboard(5),
      getAnnouncements()
    ]);
    setLeaderboard(leaderboardData);
    setAnnouncements(announcementsData);
  };

  const handleDailyProphecy = async () => {
    setLoadingProphecy(true);
    setShowProphecy(true);
    const prophecyText = await generateDailyProphecy(userProfile?.displayName || 'Shinobi');
    setProphecy(prophecyText);
    setLoadingProphecy(false);
  };

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

  const getRankIcon = (rank) => {
    if (rank.includes('Immortal') || rank.includes('God')) return Star;
    if (rank.includes('Global') || rank.includes('Sage') || rank.includes('Berserker')) return Trophy;
    if (rank.includes('Diamond') || rank.includes('Golden') || rank.includes('Silver') || rank.includes('Bronze')) return Award;
    return Zap;
  };

  const chakraPercentage = userProfile ? (userProfile.chakra / getNextRankChakra(userProfile.rank)) * 100 : 0;

  function getNextRankChakra(currentRank) {
    const thresholds = {
      'Mere User': 100,
      'User': 500,
      'Unranked': 1000,
      'Ranked': 2500,
      'Bronze Badge User': 5000,
      'Silver Badge User': 10000,
      'Golden Badge User': 25000,
      'Diamond Badge User': 50000,
      'Berserker': 100000,
      'Sage Mode': 250000,
      'Global Ranker': 500000,
      'God Level User': 1000000,
      'Immortal': 1000000,
    };
    return thresholds[currentRank] || 1000000;
  }

  return (
    <div className="min-h-screen pt-20 pb-24 md:pb-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="neon-text">Welcome to The Hub</span>
          </h1>
          <p className="text-gray-400 font-mono text-lg">
            Your Command Center, {userProfile?.displayName || 'Shinobi'}
          </p>
        </motion.div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Stats Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-panel rounded-2xl p-6 hover-lift border border-neon-blue/30"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-neon-blue">Your Stats</h3>
              <Zap className="text-neon-blue" size={24} />
            </div>

            {/* Rank Badge */}
            <div className={`mb-6 p-4 rounded-xl bg-gradient-to-r ${getRankColor(userProfile?.rank || 'Mere User')} text-center`}>
              <div className="flex items-center justify-center space-x-2 mb-2">
                {React.createElement(getRankIcon(userProfile?.rank || 'Mere User'), { size: 24 })}
                <span className="text-2xl font-bold">{userProfile?.rank || 'Mere User'}</span>
              </div>
            </div>

            {/* Chakra Progress */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Chakra</span>
                  <span className="font-bold text-neon-purple">
                    {userProfile?.chakra?.toLocaleString() || 0} / {getNextRankChakra(userProfile?.rank || 'Mere User').toLocaleString()}
                  </span>
                </div>
                <div className="h-3 bg-void-gray rounded-full overflow-hidden border border-neon-purple/30">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(chakraPercentage, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink"
                  />
                </div>
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neon-blue/20">
                <div>
                  <div className="text-xs text-gray-400">Total Wins</div>
                  <div className="text-2xl font-bold text-green-400">{userProfile?.totalWins || 0}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Streak</div>
                  <div className="text-2xl font-bold text-orange-400">{userProfile?.streak || 0}🔥</div>
                </div>
              </div>

              {/* Clan Info */}
              {userProfile?.clan && (
                <div className="pt-4 border-t border-neon-purple/20">
                  <div className="text-xs text-gray-400 mb-1">Clan</div>
                  <div className="font-bold text-neon-pink">{userProfile.clan}</div>
                  <div className="text-sm text-gray-500 italic mt-1">"{userProfile.clanMotto}"</div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Daily Prophecy Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-panel rounded-2xl p-6 hover-lift border border-neon-purple/30"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-neon-purple">Daily Prophecy</h3>
              <Sparkles className="text-neon-purple" size={24} />
            </div>

            <div className="mb-6">
              <p className="text-gray-400 text-sm mb-4">
                Receive your cryptic fortune from the ancient oracle...
              </p>

              {!showProphecy ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDailyProphecy}
                  className="w-full py-4 bg-gradient-to-r from-neon-purple to-neon-pink rounded-xl font-bold cyber-button"
                >
                  Reveal Your Fate
                </motion.button>
              ) : (
                <div className="min-h-[100px] flex items-center justify-center">
                  {loadingProphecy ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 bg-void-gray/50 rounded-xl border border-neon-purple/30"
                    >
                      <p className="text-sm italic text-gray-300 leading-relaxed">
                        "{prophecy}"
                      </p>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-neon-purple/20 space-y-2">
              <button className="w-full py-2 bg-neon-purple/20 hover:bg-neon-purple/30 rounded-lg text-sm transition-colors flex items-center justify-center space-x-2">
                <Download size={16} />
                <span>Download Mobile App</span>
              </button>
              <p className="text-xs text-center text-gray-500">Coming Soon™</p>
            </div>
          </motion.div>

          {/* Mini Leaderboard */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-panel rounded-2xl p-6 hover-lift border border-neon-pink/30"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-neon-pink">Top Shinobis</h3>
              <Trophy className="text-neon-pink" size={24} />
            </div>

            <div className="space-y-3">
              {leaderboard.slice(0, 5).map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-void-gray/50 transition-colors"
                >
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                    ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-void-gray border border-neon-blue/30'}
                  `}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate">{user.displayName || 'Anonymous'}</div>
                    <div className={`text-xs bg-gradient-to-r ${getRankColor(user.rank)} bg-clip-text text-transparent font-semibold`}>
                      {user.rank}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-neon-purple">
                      {user.chakra?.toLocaleString() || 0}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-4 py-2 bg-neon-pink/20 hover:bg-neon-pink/30 rounded-lg text-sm transition-colors"
              onClick={() => window.location.href = '/arena'}
            >
              View Full Leaderboard
            </motion.button>
          </motion.div>
        </div>

        {/* Announcements Section */}
        {announcements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-panel rounded-2xl p-6 border border-neon-blue/30"
          >
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="text-neon-blue" size={24} />
              <h3 className="text-xl font-bold text-neon-blue">Public Announcements</h3>
            </div>

            <div className="space-y-3">
              {announcements.slice(0, 3).map((announcement, index) => (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-4 bg-void-gray/50 rounded-lg border border-neon-blue/20 hover:border-neon-blue/50 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-neon-blue rounded-full mt-2 animate-pulse"></div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white mb-1">{announcement.title}</h4>
                      <p className="text-sm text-gray-400">{announcement.message}</p>
                      <span className="text-xs text-gray-600 mt-2 block">
                        {announcement.timestamp?.toDate().toLocaleDateString() || 'Recently'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Hub;
