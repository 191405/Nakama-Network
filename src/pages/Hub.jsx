import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, Users, TrendingUp, Star, Award, Sparkles, BookOpen, Heart, Newspaper, Film, MessageCircle, Sword, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getLeaderboard, getAnnouncements } from '../utils/firebase';
import Pagination from '../components/Pagination';
import Breadcrumb from '../components/Breadcrumb';
import ProgressBar from '../components/ProgressBar';
import Tag, { TagGroup } from '../components/Tag';
import GamifiedCard from '../components/GamifiedCard';
import StatCard from '../components/StatCard';

const Hub = () => {
  const { userProfile, refreshUserProfile } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [prophecy, setProphecy] = useState('');
  const [loadingProphecy, setLoadingProphecy] = useState(false);
  const [showProphecy, setShowProphecy] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const [announcementPage, setAnnouncementPage] = useState(1);
  const [difficultySlider, setDifficultySlider] = useState(5);

  const itemsPerPage = 5;

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
      'Immortal': 'from-amber-400 via-yellow-500 to-orange-500',
      'God Level User': 'from-yellow-400 via-amber-500 to-orange-500',
      'Global Ranker': 'from-amber-300 via-yellow-400 to-amber-500',
      'Sage Mode': 'from-green-400 via-emerald-500 to-teal-500',
      'Berserker': 'from-red-500 via-orange-500 to-yellow-500',
      'Diamond Badge User': 'from-amber-200 via-yellow-300 to-amber-400',
      'Golden Badge User': 'from-yellow-300 via-yellow-500 to-amber-500',
      'Silver Badge User': 'from-gray-300 via-gray-400 to-gray-500',
      'Bronze Badge User': 'from-orange-300 via-amber-500 to-orange-600',
      'Ranked': 'from-amber-400 to-yellow-500',
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
    <div className="min-h-screen pt-24 pb-24 md:pb-8 px-4 md:px-8 relative z-30 bg-[#050505]">
      <div className="max-w-7xl mx-auto space-y-8">
        { }
        <Breadcrumb items={[
          { id: 'hub', label: 'Command Center', active: true }
        ]} />

        <div className="text-center mb-8">
          <h1
            className="text-4xl md:text-6xl font-black mb-3"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}
          >
            <span style={{ color: '#fb7185' }}>My</span>
            {' '}
            <span style={{ color: 'var(--color-pearl)' }}>Dashboard</span>
          </h1>
          <p className="text-slate-500 text-base">
            Welcome back, <span style={{ color: '#fda4af' }}>{userProfile?.displayName || 'Nakama'}</span>. Your world awaits.
          </p>
        </div>

        {/* Premium Inline Tab Switcher */}
        <div style={{
          display: 'flex', gap: '8px', padding: '6px', borderRadius: '20px', marginBottom: '2.5rem',
          background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)',
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)', overflowX: 'auto', scrollbarWidth: 'none'
        }}>
          {[
            { id: 'overview', label: 'Overview', icon: Zap },
            { id: 'stats', label: 'Detailed Stats', icon: TrendingUp },
            { id: 'achievements', label: 'Achievements', icon: Award },
            { id: 'settings', label: 'Preferences', icon: Sword },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '12px 20px', borderRadius: '14px', fontSize: '14px', fontWeight: 600,
                  whiteSpace: 'nowrap', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: isActive ? '1px solid rgba(183,110,121,0.25)' : '1px solid transparent',
                  background: isActive 
                    ? 'linear-gradient(180deg, rgba(30,30,30,0.8) 0%, rgba(15,15,15,0.95) 100%)' 
                    : 'transparent',
                  color: isActive ? '#fff' : '#64748b',
                  boxShadow: isActive ? '0 10px 25px -5px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)' : 'none',
                }}
                onMouseEnter={(e) => { if(!isActive) e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { if(!isActive) e.currentTarget.style.color = '#64748b'; }}
              >
                <tab.icon size={16} style={{ color: isActive ? '#b76e79' : 'inherit' }} />
                {tab.label}
              </button>
            );
          })}
        </div>

        { }
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                icon={Zap}
                label="Community Points"
                value={userProfile?.chakra?.toLocaleString() || 0}
                change={12}
                color="amber"
              />
              <StatCard
                icon={Heart}
                label="Favourites"
                value={userProfile?.totalWins || 0}
                change={5}
                color="green"
              />
              <StatCard
                icon={MessageCircle}
                label="Discussions"
                value={userProfile?.streak || 0}
                change={0}
                color="red"
              />
              <StatCard
                icon={Film}
                label="Watched Episodes"
                value="—"
                change={0}
                color="yellow"
              />
            </div>

            { }
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-2"
              >
                <GamifiedCard
                  title="Shinobi Profile"
                  subtitle={userProfile?.rank || 'Mere User'}
                  icon={Star}
                  level={Math.floor((userProfile?.chakra || 0) / 50000) + 1}
                  rarity="legendary"
                  className="h-full"
                >
                  <div className="space-y-6">
                    { }
                    <div className={`p-4 rounded-xl bg-gradient-to-r ${getRankColor(userProfile?.rank || 'Mere User')} text-center`}>
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        {React.createElement(getRankIcon(userProfile?.rank || 'Mere User'), { size: 28 })}
                        <span className="text-2xl font-bold text-white drop-shadow-lg">{userProfile?.rank || 'Mere User'}</span>
                      </div>
                    </div>

                    { }
                    <div>
                      <ProgressBar
                        value={userProfile?.chakra || 0}
                        max={getNextRankChakra(userProfile?.rank || 'Mere User')}
                        label="Chakra Progress"
                        showLabel={true}
                        showPercentage={true}
                        variant="anime"
                      />
                    </div>

                    { }
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-amber-500/20">
                      <div className="text-center">
                        <p className="text-slate-400 text-xs mb-2">Wins</p>
                        <p className="text-2xl font-bold text-green-400">{userProfile?.totalWins || 0}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-slate-400 text-xs mb-2">Streak</p>
                        <p className="text-2xl font-bold text-orange-400">{userProfile?.streak || 0}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-slate-400 text-xs mb-2">Rank</p>
                        <p className="text-2xl font-bold text-amber-400">#42</p>
                      </div>
                    </div>

                    { }
                    {userProfile?.clan && (
                      <div className="pt-4 border-t border-amber-500/20">
                        <div className="text-xs text-slate-400 mb-2">Guild Affiliation</div>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center">
                            <Users size={24} className="text-black" />
                          </div>
                          <div>
                            <div className="font-bold text-white">{userProfile.clan}</div>
                            <div className="text-sm text-slate-400 italic">"{userProfile.clanMotto}"</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </GamifiedCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <GamifiedCard
                  title="Discover Today"
                  subtitle="Curated for you"
                  icon={Sparkles}
                  rarity="mythic"
                  className="h-full"
                >
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl" style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.12)' }}>
                      <p className="text-sm text-slate-300 leading-relaxed italic mb-2">
                        "The best anime is the one that changes how you see the world."
                      </p>
                      <p className="text-xs text-slate-600">— Community wisdom</p>
                    </div>
                    <div className="pt-4 border-t border-amber-500/10">
                      <TagGroup
                        tags={[
                          { label: 'Trending', icon: TrendingUp },
                          { label: 'Community Pick', icon: Star }
                        ]}
                        variant="anime"
                      />
                    </div>
                  </div>
                </GamifiedCard>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-pearl)' }}>
                <Newspaper className="text-rose-400" size={22} />
                Latest Updates
              </h2>
              <div className="p-5 rounded-2xl" style={{ background: 'rgba(13,10,24,0.9)', border: '1px solid rgba(244,63,94,0.1)' }}>
                <p className="text-slate-500 text-sm">Announcements and community updates will appear here.</p>
              </div>
            </motion.div>
          </>
        )}

        { }
        {activeTab === 'stats' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <GamifiedCard title="Chakra Breakdown" icon={Zap} rarity="rare">
              <div className="space-y-4">
                <div>
                  <ProgressBar value={65} max={100} label="Combat Power" variant="default" />
                </div>
                <div>
                  <ProgressBar value={82} max={100} label="Defense" variant="success" />
                </div>
                <div>
                  <ProgressBar value={45} max={100} label="Speed" variant="warning" />
                </div>
                <div>
                  <ProgressBar value={90} max={100} label="Strategy" variant="anime" />
                </div>
              </div>
            </GamifiedCard>

            <GamifiedCard title="Activity Stats" icon={TrendingUp} rarity="uncommon">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <span className="text-slate-300">Battles Won</span>
                  <span className="text-xl font-bold text-green-400">856</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <span className="text-slate-300">Battles Lost</span>
                  <span className="text-xl font-bold text-red-400">142</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <span className="text-slate-300">Win Rate</span>
                  <span className="text-xl font-bold text-amber-400">85.8%</span>
                </div>
              </div>
            </GamifiedCard>

            <GamifiedCard title="Monthly Challenge" icon={Target} rarity="epic">
              <div className="space-y-4">
                <ProgressBar value={72} max={100} label="Progress" variant="anime" />
                <div className="grid grid-cols-2 gap-2">
                  <Tag label="10 Wins" variant="success" />
                  <Tag label="72/100" variant="anime" />
                </div>
                <p className="text-sm text-slate-400 pt-2">
                  Complete 100 battles to unlock legendary rewards
                </p>
              </div>
            </GamifiedCard>

            <GamifiedCard title="Difficulty Preference" icon={Sword} rarity="common">
              <div className="space-y-4">
                <Slider
                  value={difficultySlider}
                  min={1}
                  max={10}
                  onChange={setDifficultySlider}
                  label="Choose Your Challenge"
                  showValue={true}
                  variant="anime"
                />
                <p className="text-xs text-slate-400 pt-2">
                  Level {difficultySlider} - {['Beginner', 'Easy', 'Normal', 'Hard', 'Insane', 'Nightmare', 'Legendary'][Math.floor(difficultySlider / 1.4)] || 'Impossible'}
                </p>
              </div>
            </GamifiedCard>
          </motion.div>
        )}

        { }
        {activeTab === 'achievements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'First Blood', desc: 'Win your first battle', rarity: 'uncommon', locked: false },
              { title: 'On Fire', desc: 'Reach 10-win streak', rarity: 'rare', locked: false },
              { title: 'Legendary', desc: 'Reach God Level User rank', rarity: 'legendary', locked: true },
              { title: 'Tournament Champion', desc: 'Win seasonal tournament', rarity: 'epic', locked: true },
              { title: 'Clan Master', desc: 'Lead your clan to victory', rarity: 'epic', locked: true },
              { title: 'Divine Being', desc: 'Reach Immortal rank', rarity: 'mythic', locked: true },
            ].map((achievement, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`p-4 rounded-lg border-2 transition-all ${achievement.locked
                  ? 'bg-slate-900/50 border-slate-700 opacity-60'
                  : 'bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/50'
                  }`}
              >
                <div className="text-3xl mb-2">
                  {achievement.locked ? '🔒' : '🏆'}
                </div>
                <h3 className="font-bold text-white">{achievement.title}</h3>
                <p className="text-sm text-slate-400">{achievement.desc}</p>
                <Tag label={achievement.rarity} variant={achievement.rarity} className="mt-3" />
              </motion.div>
            ))}
          </div>
        )}

        { }
        {activeTab === 'settings' && (
          <GamifiedCard title="Preferences & Settings" icon={Sword} rarity="common" className="max-w-2xl">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-3 text-slate-200">Notification Settings</label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input type="checkbox" id="battles" defaultChecked className="w-4 h-4 rounded accent-amber-500" />
                    <label htmlFor="battles" className="ml-3 text-slate-300">Notify me of battle results</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="events" defaultChecked className="w-4 h-4 rounded accent-amber-500" />
                    <label htmlFor="events" className="ml-3 text-slate-300">Notify me of events</label>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-amber-500/20">
                <label className="block text-sm font-semibold mb-3 text-slate-200">Game Mode</label>
                <TagGroup
                  tags={[
                    { label: 'Casual Mode' },
                    { label: 'Ranked Mode' },
                    { label: 'Tournament' },
                  ]}
                  variant="primary"
                />
              </div>
            </div>
          </GamifiedCard>
        )}

        { }
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-pearl)' }}>
            <Trophy className="text-rose-400" size={22} />
            Top Community Members
          </h2>

          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg p-6 border border-amber-500/20">
            <div className="space-y-3">
              {leaderboard.slice((leaderboardPage - 1) * itemsPerPage, leaderboardPage * itemsPerPage).map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center space-x-4 p-4 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-all border border-slate-700/50 hover:border-amber-500/30"
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-white
                    ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500'
                      : index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400'
                        : index === 2 ? 'bg-gradient-to-br from-orange-400 to-amber-600'
                          : 'bg-gradient-to-br from-amber-600 to-yellow-600'}
                  `}>
                    {(leaderboardPage - 1) * itemsPerPage + index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white">{user.displayName || 'Anonymous'}</div>
                    <div className={`text-xs bg-clip-text text-transparent bg-gradient-to-r ${getRankColor(user.rank)}`}>
                      {user.rank}
                    </div>
                  </div>
                  <Tag label={`${user.chakra?.toLocaleString() || 0} CP`} variant="anime" />
                </motion.div>
              ))}
            </div>

            <Pagination
              currentPage={leaderboardPage}
              totalPages={Math.ceil(leaderboard.length / itemsPerPage)}
              onPageChange={setLeaderboardPage}
            />
          </div>
        </motion.div>

        { }
        {announcements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-pearl)' }}>
              <TrendingUp className="text-rose-400" size={22} />
              Site Announcements
            </h2>

            <div className="space-y-4">
              {announcements.slice((announcementPage - 1) * 5, announcementPage * 5).map((announcement, index) => (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-5 bg-gradient-to-r from-slate-800/50 via-slate-800/50 to-slate-900/50 rounded-lg border-l-4 border-amber-500 hover:border-yellow-400 transition-all"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 animate-pulse"></div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-2">{announcement.title}</h3>
                      <p className="text-sm text-slate-400 mb-2">{announcement.message}</p>
                      <TagGroup
                        tags={[
                          { label: 'Important' },
                          { label: 'Update' }
                        ]}
                        variant="primary"
                        className="mt-3"
                      />
                      <span className="text-xs text-slate-600 mt-3 block">
                        {announcement.timestamp?.toDate().toLocaleDateString() || 'Recently'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {announcements.length > 5 && (
              <Pagination
                currentPage={announcementPage}
                totalPages={Math.ceil(announcements.length / 5)}
                onPageChange={setAnnouncementPage}
              />
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Hub;
