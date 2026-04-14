import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Users, Crown, Star, Trophy, Plus, X,
  Search, Check, ChevronRight, Zap, Lock,
  Globe, UserPlus, TrendingUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  collection, doc, addDoc, updateDoc,
  onSnapshot, query, orderBy,
  arrayUnion, arrayRemove, serverTimestamp, increment
} from 'firebase/firestore';
import { db } from '../utils/firebase';
import { GuestGuard } from '../components/GuestGuard';

const CLAN_CREATION_REQUIREMENTS = { minVotes: 50, minChakra: 1000 };

/* ─── modals ──────────────────────────────────────────── */

const fieldStyle = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(244,63,94,0.12)',
  borderRadius: 14, color: '#e2d9f3',
  outline: 'none', width: '100%',
  padding: '12px 16px', fontSize: 14,
};

const CreateClanModal = ({ onClose, onCreate, userProgress }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [errors, setErrors] = useState({});

  const canCreate = (userProgress?.votes || 0) >= CLAN_CREATION_REQUIREMENTS.minVotes
    && (userProgress?.chakra || 0) >= CLAN_CREATION_REQUIREMENTS.minChakra;

  const validate = () => {
    const e = {};
    if (name.length < 3) e.name = 'Name must be at least 3 characters';
    if (name.length > 30) e.name = 'Name must be under 30 characters';
    if (tag.length < 2 || tag.length > 5) e.tag = 'Tag must be 2–5 characters';
    if (description.length > 200) e.description = 'Description too long';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setCreating(true);
    try { await onCreate({ name, description, tag: tag.toUpperCase(), isPrivate }); onClose(); }
    catch (err) { setErrors({ submit: err.message }); }
    setCreating(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-md rounded-3xl overflow-hidden"
        style={{ background: 'rgba(10,7,20,0.98)', border: '1px solid rgba(244,63,94,0.2)' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(244,63,94,0.08)' }}>
          <h3 className="font-bold text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-display,Cinzel,serif)' }}>
            <Shield size={18} style={{ color: '#f43f5e' }} />Create Your Clan
          </h3>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-300 transition-colors"><X size={18} /></button>
        </div>

        {!canCreate ? (
          <div className="p-6">
            <div className="text-center mb-6">
              <Lock size={40} className="mx-auto mb-3 text-slate-700" />
              <h4 className="font-bold text-white mb-1">Requirements Not Met</h4>
              <p className="text-slate-600 text-sm">Complete these to unlock clan creation:</p>
            </div>
            {[
              { label: `Cast ${CLAN_CREATION_REQUIREMENTS.minVotes} votes`, current: userProgress?.votes || 0, target: CLAN_CREATION_REQUIREMENTS.minVotes },
              { label: `Earn ${CLAN_CREATION_REQUIREMENTS.minChakra} Chakra`, current: userProgress?.chakra || 0, target: CLAN_CREATION_REQUIREMENTS.minChakra },
            ].map(({ label, current, target }) => (
              <div key={label} className="flex justify-between items-center p-3 rounded-2xl mb-2"
                style={{ background: current >= target ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${current >= target ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)'}` }}>
                <span className="text-slate-400 text-sm">{label}</span>
                <span className="font-bold text-sm" style={{ color: current >= target ? '#22c55e' : '#f43f5e' }}>{current}/{target}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {[
              { label: 'Clan Name *', value: name, onChange: setName, max: 30, ph: 'Enter clan name...', error: errors.name },
              { label: 'Clan Tag * (2–5 chars)', value: tag, onChange: v => setTag(v.toUpperCase()), max: 5, ph: 'TAG', cls: 'uppercase tracking-widest', error: errors.tag },
            ].map(({ label, value, onChange, max, ph, cls, error }) => (
              <div key={label}>
                <label className="block text-xs text-slate-600 uppercase tracking-widest mb-2">{label}</label>
                <input type="text" value={value} onChange={e => onChange(e.target.value)} maxLength={max} placeholder={ph}
                  style={fieldStyle} className={cls}
                  onFocus={e => e.target.style.borderColor = 'rgba(244,63,94,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(244,63,94,0.12)'} />
                {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
              </div>
            ))}
            <div>
              <label className="block text-xs text-slate-600 uppercase tracking-widest mb-2">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} maxLength={200} rows={3}
                placeholder="Describe your clan..." style={{ ...fieldStyle, resize: 'none' }}
                onFocus={e => e.target.style.borderColor = 'rgba(244,63,94,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(244,63,94,0.12)'} />
              <span className="text-xs text-slate-700">{description.length}/200</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span className="text-slate-400 text-sm">Private Clan</span>
              <button onClick={() => setIsPrivate(!isPrivate)} className="w-11 h-6 rounded-full transition-all relative"
                style={{ background: isPrivate ? 'linear-gradient(135deg,#f43f5e,#e11d48)' : 'rgba(255,255,255,0.1)' }}>
                <motion.div animate={{ x: isPrivate ? 22 : 2 }} className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow" />
              </button>
            </div>
            {errors.submit && <p className="text-red-400 text-sm text-center">{errors.submit}</p>}
          </div>
        )}

        <div className="p-5 flex gap-3" style={{ borderTop: '1px solid rgba(244,63,94,0.08)' }}>
          <button onClick={onClose} className="flex-1 py-3 rounded-xl text-slate-600 hover:text-slate-300 text-sm font-medium transition-colors">Cancel</button>
          {canCreate && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleCreate} disabled={creating || !name || !tag}
              className="flex-1 py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#f43f5e,#e11d48)', boxShadow: '0 4px 15px rgba(244,63,94,0.3)' }}>
              {creating ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <><Shield size={15} />Create Clan</>}
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ─── clan card ────────────────────────────────────────── */

const ClanCard = ({ clan, onJoin, currentUserClan, isJoining }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }}
    className="p-5 rounded-3xl transition-all"
    style={{ background: 'rgba(10,7,20,0.85)', border: clan.isOwner ? '1px solid rgba(244,63,94,0.35)' : '1px solid rgba(244,63,94,0.1)', boxShadow: clan.isOwner ? '0 0 20px rgba(244,63,94,0.1)' : 'none' }}>
    <div className="flex items-start gap-4">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black text-white flex-shrink-0"
        style={{ background: 'linear-gradient(135deg,rgba(244,63,94,0.2),rgba(236,72,153,0.08))', border: '1px solid rgba(244,63,94,0.2)' }}>
        [{clan.tag}]
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-white truncate">{clan.name}</h3>
          {clan.isPrivate && <Lock size={13} className="text-slate-600 flex-shrink-0" />}
          {clan.isOwner && <Crown size={13} style={{ color: '#f43f5e' }} className="flex-shrink-0" />}
        </div>
        <p className="text-slate-600 text-xs line-clamp-2 mb-2">{clan.description || 'No description'}</p>
        <div className="flex items-center gap-4 text-xs text-slate-700">
          <span className="flex items-center gap-1"><Users size={11} />{clan.memberCount || 1} members</span>
          <span className="flex items-center gap-1"><Trophy size={11} />#{clan.rank || '?'}</span>
          <span className="flex items-center gap-1" style={{ color: 'rgba(244,114,182,0.5)' }}><Zap size={11} />{(clan.totalChakra || 0).toLocaleString()}</span>
        </div>
      </div>
    </div>

    {currentUserClan === clan.id
      ? <div className="mt-4 py-2 text-center text-xs font-medium" style={{ color: '#22c55e' }}><Check size={13} className="inline mr-1" />Your Clan</div>
      : !currentUserClan && !clan.isPrivate
        ? <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => onJoin(clan.id)} disabled={isJoining}
          className="w-full mt-4 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2"
          style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: '#fb7185' }}>
          <UserPlus size={14} />Join Clan
        </motion.button>
        : clan.isPrivate
          ? <div className="mt-4 py-2 text-center text-slate-700 text-xs"><Lock size={12} className="inline mr-1" />Invite Only</div>
          : null
    }
  </motion.div>
);

/* ─── main page ───────────────────────────────────────── */

const Clan = () => {
  const { currentUser, userProfile } = useAuth();
  const [clans, setClans] = useState([]);
  const [userClan, setUserClan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const userProgress = { votes: userProfile?.totalVotes || 0, chakra: userProfile?.chakra || 0 };

  useEffect(() => {
    const q = query(collection(db, 'clans'), orderBy('totalChakra', 'desc'));
    const unsub = onSnapshot(q, snapshot => {
      const data = snapshot.docs.map((d, idx) => ({ id: d.id, ...d.data(), rank: idx + 1, isOwner: d.data().leaderId === currentUser?.uid }));
      setClans(data);
      setUserClan(data.find(c => c.members?.includes(currentUser?.uid) || c.leaderId === currentUser?.uid) || null);
      setLoading(false);
    });
    return () => unsub();
  }, [currentUser?.uid]);

  const handleCreateClan = async (clanData) => {
    if (!currentUser?.uid) throw new Error('Not logged in');
    await addDoc(collection(db, 'clans'), {
      ...clanData, leaderId: currentUser.uid,
      leaderName: userProfile?.displayName || 'Anonymous',
      members: [currentUser.uid], memberCount: 1,
      totalChakra: userProfile?.chakra || 0,
      createdAt: serverTimestamp(), updatedAt: serverTimestamp()
    });
    if (currentUser?.uid) await updateDoc(doc(db, 'users', currentUser.uid), { clanId: null, clanRole: 'LEADER' });
  };

  const handleJoinClan = async (clanId) => {
    if (!currentUser?.uid || userClan) return;
    setIsJoining(true);
    try {
      await updateDoc(doc(db, 'clans', clanId), { members: arrayUnion(currentUser.uid), memberCount: increment(1), totalChakra: increment(userProfile?.chakra || 0) });
      await updateDoc(doc(db, 'users', currentUser.uid), { clanId, clanRole: 'MEMBER' });
    } catch (err) { console.error(err); }
    setIsJoining(false);
  };

  const handleLeaveClan = async () => {
    if (!currentUser?.uid || !userClan) return;
    try {
      await updateDoc(doc(db, 'clans', userClan.id), { members: arrayRemove(currentUser.uid), memberCount: increment(-1), totalChakra: increment(-(userProfile?.chakra || 0)) });
      await updateDoc(doc(db, 'users', currentUser.uid), { clanId: null, clanRole: null });
    } catch (err) { console.error(err); }
  };

  const filteredClans = clans.filter(c =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || c.tag?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const glass = { background: 'rgba(10,7,20,0.85)', border: '1px solid rgba(244,63,94,0.12)' };

  return (
    <GuestGuard feature="clan">
      <div className="min-h-screen pt-20 pb-24 md:pb-8 relative bg-[#050505]">
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute top-0 right-1/4 w-[500px] h-[400px]" style={{ background: 'radial-gradient(circle,rgba(244,63,94,0.05),transparent 70%)', filter: 'blur(80px)' }} />
        </div>

        <div className="max-w-5xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-10 pt-6">
            <p className="text-xs tracking-[0.4em] mb-3" style={{ color: 'rgba(244,114,182,0.3)', fontFamily: '"Noto Sans JP",sans-serif' }}>氏族・盟約</p>
            <h1 className="font-black mb-2" style={{ fontFamily: 'var(--font-display,Cinzel,serif)', fontSize: 'clamp(2.2rem,5vw,4rem)', color: '#e2d9f3' }}>
              <span style={{ background: 'linear-gradient(135deg,#f43f5e,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Nakama</span>
              {' '}Clans
            </h1>
            <p className="text-slate-600 text-sm">Unite with fellow fans. Build your legacy.</p>
          </div>

          {/* Search + Create */}
          <div className="flex flex-col md:flex-row gap-3 mb-8">
            <div className="flex-1 relative">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search clans..." className="w-full pl-11 pr-4 py-3 rounded-2xl text-white placeholder-slate-700 text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(244,63,94,0.1)' }}
                onFocus={e => e.target.style.borderColor = 'rgba(244,63,94,0.3)'}
                onBlur={e => e.target.style.borderColor = 'rgba(244,63,94,0.1)'} />
            </div>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 rounded-2xl font-bold text-white text-sm flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg,#f43f5e,#e11d48)', boxShadow: '0 4px 15px rgba(244,63,94,0.3)' }}>
              <Plus size={16} />Create Clan
            </motion.button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5 mb-7">
            {[{ id: 'all', label: 'All Clans', icon: Globe }, { id: 'my-clan', label: 'My Clan', icon: Shield }, { id: 'leaderboard', label: 'Leaderboard', icon: Trophy }].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all"
                style={activeTab === tab.id
                  ? { background: 'linear-gradient(135deg,#f43f5e,#e11d48)', color: '#fff', boxShadow: '0 4px 12px rgba(244,63,94,0.3)' }
                  : { color: '#475569' }}>
                <tab.icon size={15} />{tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(244,63,94,0.2)', borderTopColor: '#f43f5e' }} />
            </div>
          ) : activeTab === 'my-clan' && userClan ? (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-3xl"
              style={{ background: 'rgba(10,7,20,0.9)', border: '1px solid rgba(244,63,94,0.25)', boxShadow: '0 0 30px rgba(244,63,94,0.08)' }}>
              <div className="flex items-center gap-5 mb-6">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white"
                  style={{ background: 'linear-gradient(135deg,rgba(244,63,94,0.2),rgba(236,72,153,0.08))', border: '1px solid rgba(244,63,94,0.3)' }}>
                  [{userClan.tag}]
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white mb-1" style={{ fontFamily: 'var(--font-display,Cinzel,serif)' }}>{userClan.name}</h2>
                  <p className="text-slate-600 text-sm">{userClan.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Members', value: userClan.memberCount },
                  { label: 'Rank', value: `#${userClan.rank}` },
                  { label: 'Total Chakra', value: (userClan.totalChakra || 0).toLocaleString() },
                ].map(({ label, value }) => (
                  <div key={label} className="p-4 rounded-2xl text-center" style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.1)' }}>
                    <div className="text-xl font-black" style={{ color: '#f43f5e' }}>{value}</div>
                    <div className="text-slate-600 text-xs mt-1">{label}</div>
                  </div>
                ))}
              </div>
              {userClan.leaderId !== currentUser?.uid && (
                <button onClick={handleLeaveClan} className="w-full py-3 rounded-2xl text-sm font-medium transition-all"
                  style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', color: '#ef4444' }}>
                  Leave Clan
                </button>
              )}
            </motion.div>
          ) : activeTab === 'my-clan' && !userClan ? (
            <div className="text-center py-20">
              <Shield size={48} className="mx-auto mb-3 text-slate-700" />
              <p className="text-slate-600 mb-4">You haven't joined a clan yet</p>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => setActiveTab('all')}
                className="px-6 py-3 rounded-2xl font-bold text-white text-sm"
                style={{ background: 'linear-gradient(135deg,#f43f5e,#e11d48)' }}>
                Browse Clans
              </motion.button>
            </div>
          ) : activeTab === 'leaderboard' ? (
            <div className="space-y-3">
              {clans.slice(0, 20).map((clan, idx) => (
                <motion.div key={clan.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="p-4 rounded-2xl flex items-center gap-4"
                  style={glass}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm"
                    style={idx === 0 ? { background: 'linear-gradient(135deg,#f43f5e,#e11d48)', color: '#fff' }
                      : idx === 1 ? { background: 'rgba(148,163,184,0.2)', color: '#94a3b8' }
                        : idx === 2 ? { background: 'rgba(180,83,9,0.2)', color: '#b45309' }
                          : { background: 'rgba(255,255,255,0.05)', color: '#475569' }}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-white text-sm">[{clan.tag}] {clan.name}</div>
                    <div className="text-slate-600 text-xs">{clan.memberCount} members</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm" style={{ color: '#f43f5e' }}>{(clan.totalChakra || 0).toLocaleString()}</div>
                    <div className="text-slate-700 text-xs">Chakra</div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredClans.length === 0 ? (
                <div className="col-span-2 text-center py-20">
                  <Shield size={48} className="mx-auto mb-3 text-slate-700" />
                  <p className="text-slate-600 mb-4">No clans found. Be the first!</p>
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-3 rounded-2xl font-bold text-white text-sm"
                    style={{ background: 'linear-gradient(135deg,#f43f5e,#e11d48)' }}>
                    Create Clan
                  </motion.button>
                </div>
              ) : filteredClans.map(clan => (
                <ClanCard key={clan.id} clan={clan} onJoin={handleJoinClan} currentUserClan={userClan?.id} isJoining={isJoining} />
              ))}
            </div>
          )}
        </div>

        <AnimatePresence>
          {showCreateModal && <CreateClanModal onClose={() => setShowCreateModal(false)} onCreate={handleCreateClan} userProgress={userProgress} />}
        </AnimatePresence>
      </div>
    </GuestGuard>
  );
};

export default Clan;
