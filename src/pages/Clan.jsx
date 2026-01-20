import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Users, Crown, Star, Trophy, Plus, X,
  Search, Check, ChevronRight, Sword, Zap, Heart,
  Settings, UserPlus, Lock, Globe, MessageCircle,
  Award, Target, TrendingUp, Copy, Share2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, where, orderBy, getDoc, setDoc,
  arrayUnion, arrayRemove, serverTimestamp, increment
} from 'firebase/firestore';
import { db } from '../utils/firebase';
import { GuestGuard } from '../components/GuestGuard';

const CLAN_CREATION_REQUIREMENTS = {
  minVotes: 50,
  minChakra: 1000,
  minDaysActive: 7
};

const CLAN_ROLES = {
  LEADER: { name: 'Leader', color: '#eab308', icon: Crown },
  ELDER: { name: 'Elder', color: '#8b5cf6', icon: Star },
  MEMBER: { name: 'Member', color: '#3b82f6', icon: Users }
};

const CreateClanModal = ({ onClose, onCreate, userProgress }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [errors, setErrors] = useState({});

  const canCreate =
    (userProgress?.votes || 0) >= CLAN_CREATION_REQUIREMENTS.minVotes &&
    (userProgress?.chakra || 0) >= CLAN_CREATION_REQUIREMENTS.minChakra;

  const validate = () => {
    const newErrors = {};
    if (name.length < 3) newErrors.name = "Name must be at least 3 characters";
    if (name.length > 30) newErrors.name = "Name must be under 30 characters";
    if (tag.length < 2 || tag.length > 5) newErrors.tag = "Tag must be 2-5 characters";
    if (description.length > 200) newErrors.description = "Description too long";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setCreating(true);
    try {
      await onCreate({ name, description, tag: tag.toUpperCase(), isPrivate });
      onClose();
    } catch (error) {
      setErrors({ submit: error.message });
    }
    setCreating(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(15,15,20,0.98)',
          border: '1px solid rgba(234,179,8,0.2)'
        }}
      >
        <div className="p-4 flex items-center justify-between" style={{ background: 'rgba(234,179,8,0.1)' }}>
          <h3 className="font-bold text-white flex items-center gap-2">
            <Shield size={20} className="text-yellow-400" />
            Create Your Clan
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {!canCreate ? (
          <div className="p-6">
            <div className="text-center mb-6">
              <Lock size={48} className="mx-auto text-slate-600 mb-4" />
              <h4 className="text-xl font-bold text-white mb-2">Not Yet Eligible</h4>
              <p className="text-slate-400 text-sm">Complete these requirements to create a clan:</p>
            </div>
            <div className="space-y-3">
              <div className={`p-3 rounded-lg flex justify-between items-center ${(userProgress?.votes || 0) >= CLAN_CREATION_REQUIREMENTS.minVotes ? 'bg-green-500/10 border border-green-500/20' : 'bg-slate-800/50'}`}>
                <span className="text-slate-300">Cast {CLAN_CREATION_REQUIREMENTS.minVotes} votes</span>
                <span className={`font-bold ${(userProgress?.votes || 0) >= CLAN_CREATION_REQUIREMENTS.minVotes ? 'text-green-400' : 'text-red-400'}`}>
                  {userProgress?.votes || 0}/{CLAN_CREATION_REQUIREMENTS.minVotes}
                </span>
              </div>
              <div className={`p-3 rounded-lg flex justify-between items-center ${(userProgress?.chakra || 0) >= CLAN_CREATION_REQUIREMENTS.minChakra ? 'bg-green-500/10 border border-green-500/20' : 'bg-slate-800/50'}`}>
                <span className="text-slate-300">Earn {CLAN_CREATION_REQUIREMENTS.minChakra} Chakra</span>
                <span className={`font-bold ${(userProgress?.chakra || 0) >= CLAN_CREATION_REQUIREMENTS.minChakra ? 'text-green-400' : 'text-red-400'}`}>
                  {userProgress?.chakra || 0}/{CLAN_CREATION_REQUIREMENTS.minChakra}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-slate-400 text-sm mb-2">Clan Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={30}
                placeholder="Enter clan name..."
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 text-white border border-slate-700 focus:border-yellow-500 outline-none"
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2">Clan Tag * (2-5 chars)</label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value.toUpperCase())}
                maxLength={5}
                placeholder="TAG"
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 text-white border border-slate-700 focus:border-yellow-500 outline-none uppercase tracking-widest"
              />
              {errors.tag && <p className="text-red-400 text-xs mt-1">{errors.tag}</p>}
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={200}
                rows={3}
                placeholder="Describe your clan..."
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 text-white border border-slate-700 focus:border-yellow-500 outline-none resize-none"
              />
              <span className="text-xs text-slate-500">{description.length}/200</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <span className="text-slate-300">Private Clan</span>
              <button
                onClick={() => setIsPrivate(!isPrivate)}
                className={`w-12 h-6 rounded-full transition-colors ${isPrivate ? 'bg-yellow-500' : 'bg-slate-700'}`}
              >
                <motion.div
                  animate={{ x: isPrivate ? 24 : 2 }}
                  className="w-5 h-5 bg-white rounded-full shadow"
                />
              </button>
            </div>

            {errors.submit && (
              <p className="text-red-400 text-sm text-center">{errors.submit}</p>
            )}
          </div>
        )}

        <div className="p-4 flex gap-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-medium text-slate-400 hover:bg-slate-800"
          >
            Cancel
          </button>
          {canCreate && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreate}
              disabled={creating || !name || !tag}
              className="flex-1 py-3 rounded-xl font-bold text-black flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #eab308, #ca8a04)' }}
            >
              {creating ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <Shield size={18} />
                  Create Clan
                </>
              )}
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const ClanCard = ({ clan, onJoin, currentUserClan, isJoining }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -3 }}
    className="p-5 rounded-2xl"
    style={{
      background: 'rgba(15,15,20,0.95)',
      border: `2px solid ${clan.isOwner ? 'rgba(234,179,8,0.4)' : 'rgba(100,100,100,0.2)'}`
    }}
  >
    <div className="flex items-start gap-4">
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black"
        style={{ background: 'linear-gradient(135deg, rgba(234,179,8,0.2), rgba(202,138,4,0.1))' }}
      >
        [{clan.tag}]
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-white text-lg truncate">{clan.name}</h3>
          {clan.isPrivate && <Lock size={14} className="text-slate-500" />}
        </div>
        <p className="text-slate-500 text-sm line-clamp-2 mb-2">{clan.description || 'No description'}</p>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Users size={12} /> {clan.memberCount || 1} members
          </span>
          <span className="flex items-center gap-1">
            <Trophy size={12} /> #{clan.rank || '?'}
          </span>
          <span className="flex items-center gap-1">
            <Zap size={12} className="text-yellow-400" /> {clan.totalChakra || 0}
          </span>
        </div>
      </div>
    </div>

    {currentUserClan === clan.id ? (
      <div className="mt-4 py-2 text-center text-green-400 text-sm font-medium">
        <Check size={16} className="inline mr-1" /> Your Clan
      </div>
    ) : !currentUserClan && !clan.isPrivate ? (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onJoin(clan.id)}
        disabled={isJoining}
        className="w-full mt-4 py-2 rounded-xl font-medium text-yellow-400 flex items-center justify-center gap-2"
        style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)' }}
      >
        <UserPlus size={16} />
        Join Clan
      </motion.button>
    ) : clan.isPrivate ? (
      <div className="mt-4 py-2 text-center text-slate-500 text-sm">
        <Lock size={14} className="inline mr-1" /> Invite Only
      </div>
    ) : null}
  </motion.div>
);

const Clan = () => {
  const { currentUser, userProfile } = useAuth();
  const [clans, setClans] = useState([]);
  const [userClan, setUserClan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); 

  const userProgress = {
    votes: userProfile?.totalVotes || 0,
    chakra: userProfile?.chakra || 0,
    daysActive: userProfile?.daysActive || 0
  };

  useEffect(() => {
    const clansQuery = query(
      collection(db, 'clans'),
      orderBy('totalChakra', 'desc')
    );

    const unsubscribe = onSnapshot(clansQuery, (snapshot) => {
      const clanData = snapshot.docs.map((doc, idx) => ({
        id: doc.id,
        ...doc.data(),
        rank: idx + 1,
        isOwner: doc.data().leaderId === currentUser?.uid
      }));
      setClans(clanData);

      const myClan = clanData.find(c =>
        c.members?.includes(currentUser?.uid) || c.leaderId === currentUser?.uid
      );
      setUserClan(myClan || null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  const handleCreateClan = async (clanData) => {
    if (!currentUser?.uid) throw new Error('Not logged in');

    const newClan = {
      ...clanData,
      leaderId: currentUser.uid,
      leaderName: userProfile?.displayName || 'Anonymous',
      members: [currentUser.uid],
      memberCount: 1,
      totalChakra: userProfile?.chakra || 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await addDoc(collection(db, 'clans'), newClan);

    if (currentUser?.uid) {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        clanId: null, 
        clanRole: 'LEADER'
      });
    }
  };

  const handleJoinClan = async (clanId) => {
    if (!currentUser?.uid || userClan) return;
    setIsJoining(true);

    try {
      const clanRef = doc(db, 'clans', clanId);
      await updateDoc(clanRef, {
        members: arrayUnion(currentUser.uid),
        memberCount: increment(1),
        totalChakra: increment(userProfile?.chakra || 0)
      });

      await updateDoc(doc(db, 'users', currentUser.uid), {
        clanId: clanId,
        clanRole: 'MEMBER'
      });
    } catch (error) {
      console.error('Failed to join clan:', error);
    }
    setIsJoining(false);
  };

  const handleLeaveClan = async () => {
    if (!currentUser?.uid || !userClan) return;

    try {
      const clanRef = doc(db, 'clans', userClan.id);
      await updateDoc(clanRef, {
        members: arrayRemove(currentUser.uid),
        memberCount: increment(-1),
        totalChakra: increment(-(userProfile?.chakra || 0))
      });

      await updateDoc(doc(db, 'users', currentUser.uid), {
        clanId: null,
        clanRole: null
      });
    } catch (error) {
      console.error('Failed to leave clan:', error);
    }
  };

  const filteredClans = clans.filter(clan =>
    clan.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    clan.tag?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <GuestGuard feature="clan">
      <div className="min-h-screen pt-20 pb-24 md:pb-8 px-4 relative z-20">
        <div className="max-w-5xl mx-auto">
          {}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)' }}>
              <Shield size={16} className="text-yellow-400" />
              <span className="text-yellow-400 text-sm font-medium">Nakama Clans</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
              Join a <span className="text-yellow-400">Clan</span>
            </h1>
            <p className="text-slate-400 max-w-md mx-auto">
              Unite with fellow warriors, compete in clan wars, and climb the leaderboards together.
            </p>
          </motion.div>

          {}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clans..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/50 text-white border border-slate-700 focus:border-yellow-500 outline-none"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 rounded-xl font-bold text-black flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #eab308, #ca8a04)' }}
            >
              <Plus size={18} />
              Create Clan
            </motion.button>
          </div>

          {}
          <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar">
            {[
              { id: 'all', label: 'All Clans', icon: Globe },
              { id: 'my-clan', label: 'My Clan', icon: Shield },
              { id: 'leaderboard', label: 'Leaderboard', icon: Trophy }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                  ? 'bg-yellow-500 text-black'
                  : 'text-slate-400 hover:bg-white/5'
                  }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
            </div>
          ) : activeTab === 'my-clan' && userClan ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl"
              style={{
                background: 'rgba(15,15,20,0.95)',
                border: '2px solid rgba(234,179,8,0.3)'
              }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black"
                  style={{ background: 'linear-gradient(135deg, rgba(234,179,8,0.3), rgba(202,138,4,0.1))' }}
                >
                  [{userClan.tag}]
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{userClan.name}</h2>
                  <p className="text-slate-400">{userClan.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(234,179,8,0.1)' }}>
                  <div className="text-2xl font-bold text-yellow-400">{userClan.memberCount}</div>
                  <div className="text-slate-500 text-sm">Members</div>
                </div>
                <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(168,85,247,0.1)' }}>
                  <div className="text-2xl font-bold text-purple-400">#{userClan.rank}</div>
                  <div className="text-slate-500 text-sm">Rank</div>
                </div>
                <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(34,197,94,0.1)' }}>
                  <div className="text-2xl font-bold text-green-400">{userClan.totalChakra}</div>
                  <div className="text-slate-500 text-sm">Total Chakra</div>
                </div>
              </div>

              {userClan.leaderId !== currentUser?.uid && (
                <button
                  onClick={handleLeaveClan}
                  className="w-full py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  Leave Clan
                </button>
              )}
            </motion.div>
          ) : activeTab === 'leaderboard' ? (
            <div className="space-y-3">
              {clans.slice(0, 20).map((clan, idx) => (
                <motion.div
                  key={clan.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-4 rounded-xl flex items-center gap-4"
                  style={{
                    background: idx < 3
                      ? `rgba(${idx === 0 ? '234,179,8' : idx === 1 ? '192,192,192' : '205,127,50'},0.1)`
                      : 'rgba(30,30,40,0.6)'
                  }}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${idx === 0 ? 'bg-yellow-500 text-black' :
                    idx === 1 ? 'bg-slate-300 text-black' :
                      idx === 2 ? 'bg-amber-700 text-white' :
                        'bg-slate-800 text-slate-400'
                    }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-white">[{clan.tag}] {clan.name}</div>
                    <div className="text-slate-500 text-xs">{clan.memberCount} members</div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 font-bold">{clan.totalChakra?.toLocaleString()}</div>
                    <div className="text-slate-500 text-xs">Chakra</div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredClans.length === 0 ? (
                <div className="col-span-2 text-center py-20">
                  <Shield size={48} className="mx-auto text-slate-600 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Clans Found</h3>
                  <p className="text-slate-500 mb-4">Be the first to create a clan!</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-3 rounded-xl font-bold text-black"
                    style={{ background: 'linear-gradient(135deg, #eab308, #ca8a04)' }}
                  >
                    Create Clan
                  </motion.button>
                </div>
              ) : (
                filteredClans.map((clan) => (
                  <ClanCard
                    key={clan.id}
                    clan={clan}
                    onJoin={handleJoinClan}
                    currentUserClan={userClan?.id}
                    isJoining={isJoining}
                  />
                ))
              )}
            </div>
          )}
        </div>

        {}
        <AnimatePresence>
          {showCreateModal && (
            <CreateClanModal
              onClose={() => setShowCreateModal(false)}
              onCreate={handleCreateClan}
              userProgress={userProgress}
            />
          )}
        </AnimatePresence>
      </div>
    </GuestGuard>
  );
};

export default Clan;
