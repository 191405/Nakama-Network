import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Settings, Trophy, Star, Shield,
    Camera, Edit2, Save, X, Crown, Zap, Heart,
    MessageCircle, Eye, Calendar, MapPin,
    Award, Flame, Lock, ChevronRight, Check,
    Bell, Moon, Globe, Volume2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile, getUserMediaAnalytics } from '../utils/firebase';
import { initializeOwnerClan } from '../utils/ownerClan';

/* ─── mini components ─────────────────────────────────── */

const glass = {
    background: 'rgba(10,7,20,0.85)',
    border: '1px solid rgba(244,63,94,0.1)',
};

const AchievementBadge = ({ achievement, earned }) => (
    <motion.div whileHover={{ scale: 1.04 }}
        className={`p-4 rounded-2xl text-center ${earned ? '' : 'opacity-30 grayscale'}`}
        style={earned ? { background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' } : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="text-3xl mb-2">{achievement.icon}</div>
        <h4 className="font-bold text-sm text-white">{achievement.name}</h4>
        <p className="text-xs text-slate-600 mt-1">{achievement.desc}</p>
        {earned && achievement.earnedAt && (
            <p className="text-xs mt-2" style={{ color: '#f43f5e' }}>Earned {new Date(achievement.earnedAt).toLocaleDateString()}</p>
        )}
        {!earned && <div className="flex items-center justify-center gap-1 mt-2 text-slate-700"><Lock size={11} /><span className="text-xs">Locked</span></div>}
    </motion.div>
);

const StatCard = ({ icon: Icon, label, value, gradient }) => (
    <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(244,63,94,0.08)' }}>
        <Icon size={22} className="mb-2" style={{ color: '#f43f5e' }} />
        <div className="text-xl font-black text-white">{value}</div>
        <div className="text-slate-600 text-xs">{label}</div>
    </div>
);

const EditProfileModal = ({ profile, onSave, onClose }) => {
    const [displayName, setDisplayName] = useState(profile?.displayName || '');
    const [bio, setBio] = useState(profile?.bio || '');
    const [location, setLocation] = useState(profile?.location || '');
    const [website, setWebsite] = useState(profile?.website || '');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try { await onSave({ displayName, bio, location, website }); onClose(); }
        catch (err) { console.error(err); }
        setSaving(false);
    };

    const fieldStyle = {
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(244,63,94,0.12)',
        borderRadius: 14, color: '#e2d9f3', outline: 'none', width: '100%', padding: '12px 16px', fontSize: 14
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
                    <h3 className="font-bold text-white" style={{ fontFamily: 'var(--font-display,Cinzel,serif)', fontSize: 18 }}>Edit Profile</h3>
                    <button onClick={onClose} className="text-slate-600 hover:text-slate-300 transition-colors"><X size={18} /></button>
                </div>
                <div className="p-6 space-y-4">
                    {[
                        { label: 'Display Name', value: displayName, onChange: setDisplayName, type: 'text', max: 30, ph: 'Your display name' },
                        { label: 'Location', value: location, onChange: setLocation, type: 'text', max: 50, ph: 'Where are you from?' },
                        { label: 'Website', value: website, onChange: setWebsite, type: 'url', ph: 'https://...' },
                    ].map(({ label, value, onChange, type, max, ph }) => (
                        <div key={label}>
                            <label className="block text-xs text-slate-600 uppercase tracking-widest mb-2">{label}</label>
                            <input type={type} value={value} onChange={e => onChange(e.target.value)} maxLength={max}
                                placeholder={ph} style={fieldStyle}
                                onFocus={e => e.target.style.borderColor = 'rgba(244,63,94,0.4)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(244,63,94,0.12)'} />
                        </div>
                    ))}
                    <div>
                        <label className="block text-xs text-slate-600 uppercase tracking-widest mb-2">Bio</label>
                        <textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={160} rows={3}
                            placeholder="Tell us about yourself..." style={{ ...fieldStyle, resize: 'none' }}
                            onFocus={e => e.target.style.borderColor = 'rgba(244,63,94,0.4)'}
                            onBlur={e => e.target.style.borderColor = 'rgba(244,63,94,0.12)'} />
                        <span className="text-xs text-slate-700">{bio.length}/160</span>
                    </div>
                </div>
                <div className="p-5 flex gap-3" style={{ borderTop: '1px solid rgba(244,63,94,0.08)' }}>
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl text-slate-600 hover:text-slate-300 transition-colors text-sm font-medium">Cancel</button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving}
                        className="flex-1 py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2"
                        style={{ background: 'linear-gradient(135deg,#f43f5e,#e11d48)', boxShadow: '0 4px 15px rgba(244,63,94,0.3)' }}>
                        {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            : <><Save size={15} />Save Changes</>}
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const SettingsPanel = ({ settings, onUpdate }) => {
    const items = [
        { key: 'notifications', icon: Bell, label: 'Push Notifications', type: 'toggle' },
        { key: 'darkMode', icon: Moon, label: 'Dark Mode', type: 'toggle', locked: true },
        { key: 'sound', icon: Volume2, label: 'Sound Effects', type: 'toggle' },
        { key: 'language', icon: Globe, label: 'Language', type: 'select', value: 'English' },
    ];
    return (
        <div className="space-y-2">
            {items.map(item => (
                <div key={item.key} className="flex items-center justify-between p-4 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="flex items-center gap-3">
                        <item.icon size={18} className="text-slate-500" />
                        <span className="text-white text-sm">{item.label}</span>
                        {item.locked && <span className="text-xs px-2 py-0.5 rounded-full text-slate-600" style={{ background: 'rgba(255,255,255,0.05)' }}>Always On</span>}
                    </div>
                    {item.type === 'toggle' && !item.locked && (
                        <button onClick={() => onUpdate(item.key, !settings[item.key])}
                            className="w-11 h-6 rounded-full transition-all relative"
                            style={{ background: settings[item.key] ? 'linear-gradient(135deg,#f43f5e,#e11d48)' : 'rgba(255,255,255,0.1)' }}>
                            <motion.div animate={{ x: settings[item.key] ? 22 : 2 }} className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow" />
                        </button>
                    )}
                    {item.type === 'select' && <span className="text-slate-600 flex items-center gap-1 text-sm">{item.value}<ChevronRight size={14} /></span>}
                </div>
            ))}
        </div>
    );
};

/* ─── main page ───────────────────────────────────────── */

const UserProfile = () => {
    const { userProfile, currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [showEditModal, setShowEditModal] = useState(false);
    const [settings, setSettings] = useState({ notifications: true, sound: true });
    const [mediaAnalytics, setMediaAnalytics] = useState({ postsCount: 0, totalLikesReceived: 0, totalCommentsReceived: 0 });
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (currentUser?.uid) getUserMediaAnalytics(currentUser.uid).then(setMediaAnalytics);
    }, [currentUser?.uid]);

    const achievements = [
        { id: 'first_vote', name: 'First Vote', desc: 'Cast your first vote', icon: '🗳️' },
        { id: 'warrior_100', name: 'Warrior', desc: 'Cast 100 votes', icon: '⚔️' },
        { id: 'trivia_master', name: 'Trivia Master', desc: 'Win 10 trivia games', icon: '🧠' },
        { id: 'social_butterfly', name: 'Social Butterfly', desc: 'Make 50 posts', icon: '🦋' },
        { id: 'clan_leader', name: 'Clan Leader', desc: 'Create a clan', icon: '👑' },
        { id: 'millionaire', name: 'Millionaire', desc: 'Earn 1M Chakra', icon: '💰' },
        { id: 'early_adopter', name: 'Early Adopter', desc: 'Joined during beta', icon: '🌟' },
        { id: 'streak_7', name: '7-Day Streak', desc: 'Active 7 days in a row', icon: '🔥' },
    ];

    const earnedAchievements = userProfile?.achievements || ['early_adopter', 'first_vote'];
    const tabs = [
        { id: 'overview', label: 'Overview', icon: User },
        { id: 'achievements', label: 'Achievements', icon: Trophy },
        { id: 'activity', label: 'Activity', icon: Zap },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const handleSaveProfile = async (data) => {
        if (!currentUser?.uid) return;
        await updateUserProfile(currentUser.uid, data);
    };

    const displayName = userProfile?.displayName || currentUser?.displayName || 'Anonymous';
    const bio = userProfile?.bio || 'No bio yet — write something about yourself!';
    const joinDate = userProfile?.createdAt?.toDate?.() || new Date();
    const chakra = userProfile?.chakra || 0;
    const rank = userProfile?.rank || 'Genin';
    const clan = userProfile?.clan || null;

    return (
        <div className="min-h-screen pt-20 pb-24 md:pb-8 relative bg-[#050505]">

            <div className="max-w-4xl mx-auto px-4">
                {/* Profile card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-3xl overflow-hidden mb-6" style={glass}>
                    {/* Banner */}
                    <div className="h-36 relative" style={{ background: 'linear-gradient(135deg, rgba(244,63,94,0.08), rgba(139,92,246,0.05), rgba(5,5,5,1))' }}>
                        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(244,63,94,0.05) 0%, transparent 50%)' }} />
                    </div>

                    <div className="px-6 pb-6 -mt-14 relative">
                        <div className="flex flex-col md:flex-row md:items-end gap-4">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="w-28 h-28 rounded-2xl overflow-hidden" style={{ border: '3px solid rgba(244,63,94,0.3)', boxShadow: '0 0 30px rgba(244,63,94,0.2)' }}>
                                    {userProfile?.avatar
                                        ? <img src={userProfile.avatar} alt={displayName} className="w-full h-full object-cover" />
                                        : <div className="w-full h-full flex items-center justify-center text-4xl font-black" style={{ background: 'linear-gradient(135deg,#f43f5e,#e11d48)', color: '#fff' }}>
                                            {displayName.charAt(0).toUpperCase()}
                                        </div>
                                    }
                                </div>
                                <button onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 w-8 h-8 rounded-xl flex items-center justify-center"
                                    style={{ background: 'linear-gradient(135deg,#f43f5e,#e11d48)' }}>
                                    <Camera size={14} color="#fff" />
                                </button>
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={e => console.log('Avatar:', e.target.files?.[0])} className="hidden" />
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-display,Cinzel,serif)' }}>{displayName}</h1>
                                    {userProfile?.isPremium && <Crown size={18} style={{ color: '#f43f5e' }} />}
                                </div>
                                <p className="text-slate-600 text-sm mb-2">{bio}</p>
                                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700">
                                    {userProfile?.location && <span className="flex items-center gap-1"><MapPin size={12} />{userProfile.location}</span>}
                                    <span className="flex items-center gap-1"><Calendar size={12} />Joined {joinDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                    {clan && <span className="flex items-center gap-1" style={{ color: 'rgba(244,114,182,0.7)' }}><Shield size={12} />{clan}</span>}
                                </div>
                            </div>

                            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                onClick={() => setShowEditModal(true)}
                                className="px-5 py-2 rounded-xl font-medium flex items-center gap-2 text-sm"
                                style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: '#fb7185' }}>
                                <Edit2 size={14} />Edit Profile
                            </motion.button>
                        </div>

                        {/* Stats row */}
                        <div className="grid grid-cols-4 gap-3 mt-6">
                            {[
                                { label: 'Chakra', value: chakra.toLocaleString() },
                                { label: 'Votes', value: userProfile?.totalVotes || 0 },
                                { label: 'Day Streak', value: userProfile?.streak || 0 },
                                { label: 'Rank', value: rank },
                            ].map(({ label, value }) => (
                                <div key={label} className="text-center p-3 rounded-2xl" style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.1)' }}>
                                    <div className="text-lg font-black" style={{ color: '#f43f5e' }}>{value}</div>
                                    <div className="text-xs text-slate-600">{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap text-sm transition-all"
                            style={activeTab === tab.id
                                ? { background: 'linear-gradient(135deg,#f43f5e,#e11d48)', color: '#fff', boxShadow: '0 4px 12px rgba(244,63,94,0.3)' }
                                : { color: '#475569' }}>
                            <tab.icon size={15} />{tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>

                        {/* Overview */}
                        {activeTab === 'overview' && (
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="p-6 rounded-3xl" style={glass}>
                                    <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-sm uppercase tracking-widest">
                                        <Trophy size={15} style={{ color: '#f43f5e' }} />Your Stats
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <StatCard icon={Heart} label="Favorites" value={userProfile?.favorites?.length || 0} />
                                        <StatCard icon={MessageCircle} label="Posts" value={userProfile?.posts || 0} />
                                        <StatCard icon={Eye} label="Profile Views" value={userProfile?.views || 47} />
                                        <StatCard icon={Award} label="Achievements" value={earnedAchievements.length} />
                                    </div>
                                </div>

                                <div className="p-6 rounded-3xl" style={glass}>
                                    <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-sm uppercase tracking-widest">
                                        <Star size={15} style={{ color: '#f43f5e' }} />Recent Achievements
                                    </h3>
                                    <div className="space-y-3">
                                        {achievements.filter(a => earnedAchievements.includes(a.id)).slice(0, 4).map(a => (
                                            <div key={a.id} className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: 'rgba(244,63,94,0.06)' }}>
                                                <span className="text-2xl">{a.icon}</span>
                                                <div className="flex-1"><div className="font-bold text-white text-sm">{a.name}</div><div className="text-xs text-slate-600">{a.desc}</div></div>
                                                <Check size={16} style={{ color: '#22c55e' }} />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-6 rounded-3xl md:col-span-2" style={glass}>
                                    <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-sm uppercase tracking-widest">
                                        <Eye size={15} style={{ color: '#f43f5e' }} />Media Analytics
                                    </h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        <StatCard icon={Camera} label="Posts Shared" value={mediaAnalytics.postsCount} />
                                        <StatCard icon={Heart} label="Likes Received" value={mediaAnalytics.totalLikesReceived} />
                                        <StatCard icon={MessageCircle} label="Comments" value={mediaAnalytics.totalCommentsReceived} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Achievements */}
                        {activeTab === 'achievements' && (
                            <div className="p-6 rounded-3xl" style={glass}>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-white" style={{ fontFamily: 'var(--font-display,Cinzel,serif)' }}>All Achievements</h3>
                                    <span className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: 'rgba(244,63,94,0.1)', color: '#fb7185' }}>
                                        {earnedAchievements.length}/{achievements.length} Unlocked
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {achievements.map(a => (
                                        <AchievementBadge key={a.id} achievement={a} earned={earnedAchievements.includes(a.id)} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Activity */}
                        {activeTab === 'activity' && (
                            <div className="p-6 rounded-3xl" style={glass}>
                                <h3 className="font-bold text-white mb-5" style={{ fontFamily: 'var(--font-display,Cinzel,serif)' }}>Recent Activity</h3>
                                <div className="space-y-3">
                                    {[
                                        { icon: Heart, text: 'Voted for Goku in Goku vs Naruto', time: '2 hours ago' },
                                        { icon: Trophy, text: 'Earned "First Vote" achievement', time: 'Yesterday' },
                                        { icon: MessageCircle, text: 'Commented on a discussion thread', time: '2 days ago' },
                                        { icon: Star, text: 'Added Demon Slayer to favourites', time: '3 days ago' },
                                    ].map((act, idx) => (
                                        <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(244,63,94,0.1)' }}>
                                                <act.icon size={18} style={{ color: '#f43f5e' }} />
                                            </div>
                                            <div className="flex-1"><p className="text-white text-sm">{act.text}</p><p className="text-slate-600 text-xs">{act.time}</p></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Settings */}
                        {activeTab === 'settings' && (
                            <div className="p-6 rounded-3xl" style={glass}>
                                <h3 className="font-bold text-white mb-5" style={{ fontFamily: 'var(--font-display,Cinzel,serif)' }}>Settings</h3>
                                <SettingsPanel settings={settings} onUpdate={(key, val) => setSettings(prev => ({ ...prev, [key]: val }))} />

                                <div className="mt-6 pt-6 space-y-2" style={{ borderTop: '1px solid rgba(244,63,94,0.08)' }}>
                                    <h4 className="text-white font-medium text-sm mb-3">Account</h4>
                                    {[
                                        { label: 'Change Password', danger: false },
                                        { label: 'Delete Account', danger: true },
                                    ].map(({ label, danger }) => (
                                        <button key={label} className="w-full text-left p-4 rounded-2xl flex items-center justify-between text-sm transition-all"
                                            style={{ background: danger ? 'rgba(239,68,68,0.04)' : 'rgba(255,255,255,0.03)', color: danger ? '#ef4444' : '#475569' }}>
                                            <span>{label}</span><ChevronRight size={16} />
                                        </button>
                                    ))}
                                </div>

                                {/* Founder actions */}
                                <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(244,63,94,0.08)' }}>
                                    <h4 className="font-medium text-white text-sm mb-3 flex items-center gap-2"><Crown size={14} style={{ color: '#f43f5e' }} />Founder Actions</h4>
                                    <button onClick={async () => {
                                        if (window.confirm('Construct Nakama Legends Clan? This will make you the leader.')) {
                                            const res = await initializeOwnerClan(currentUser?.uid, displayName);
                                            alert(res.message);
                                        }
                                    }} className="w-full text-left p-4 rounded-2xl relative overflow-hidden group transition-all"
                                        style={{ background: 'linear-gradient(135deg,#f43f5e,#e11d48)', boxShadow: '0 4px 20px rgba(244,63,94,0.3)' }}>
                                        <div className="relative z-10 flex items-center justify-between">
                                            <span className="font-bold text-white text-sm">Construct Nakama Legends</span>
                                            <Shield size={16} color="#fff" />
                                        </div>
                                        <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {showEditModal && <EditProfileModal profile={userProfile} onSave={handleSaveProfile} onClose={() => setShowEditModal(false)} />}
            </AnimatePresence>
        </div>
    );
};

export default UserProfile;
