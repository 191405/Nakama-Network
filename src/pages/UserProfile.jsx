import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Settings, Trophy, Star, Shield,
    Camera, Edit2, Save, X, Crown, Zap, Heart,
    MessageCircle, Eye, Calendar, MapPin,
    Award, Flame, Lock, ChevronRight, Check,
    Bell, Moon, Globe, Volume2, Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import userService from '../utils/userService';
import AnimeAvatarSelector from '../components/AnimeAvatarSelector';

/* ─── mini components ─────────────────────────────────── */

const ROSE_GOLD = '#b76e79';
const OBSIDIAN = '#050505';

const glass = {
    background: 'rgba(10,10,10,0.8)',
    border: '1px solid rgba(183,110,121,0.1)',
};

const AchievementBadge = ({ achievement, earned }) => (
    <motion.div whileHover={{ scale: 1.04 }}
        className={`p-4 rounded-2xl text-center ${earned ? '' : 'opacity-30 grayscale'}`}
        style={earned ? { background: 'rgba(183,110,121,0.08)', border: '1px solid rgba(183,110,121,0.2)' } : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="text-3xl mb-2">{achievement.icon}</div>
        <h4 className="font-bold text-sm text-white">{achievement.name}</h4>
        <p className="text-xs text-[#555] mt-1">{achievement.desc}</p>
        {earned && achievement.earnedAt && (
            <p className="text-xs mt-2" style={{ color: ROSE_GOLD }}>Earned {new Date(achievement.earnedAt).toLocaleDateString()}</p>
        )}
        {!earned && <div className="flex items-center justify-center gap-1 mt-2 text-slate-700"><Lock size={11} /><span className="text-xs">Locked</span></div>}
    </motion.div>
);

const StatCard = ({ icon: Icon, label, value }) => (
    <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(183,110,121,0.08)' }}>
        <Icon size={22} className="mb-2" style={{ color: ROSE_GOLD }} />
        <div className="text-xl font-black text-white">{value}</div>
        <div className="text-[#555] text-xs">{label}</div>
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
        try { await onSave({ display_name: displayName, bio, location, website }); onClose(); }
        catch (err) { console.error(err); }
        setSaving(false);
    };

    const fieldStyle = {
        background: 'rgba(255,255,255,0.03)', 
        border: '1px solid rgba(183,110,121,0.12)',
        borderRadius: 14, 
        color: '#e2d9f3', 
        outline: 'none', 
        width: '100%', 
        padding: '12px 16px', 
        fontSize: 14
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-md rounded-3xl overflow-hidden"
                style={{ background: 'rgba(10,10,10,0.98)', border: `1px solid ${ROSE_GOLD}33` }}
                onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(183,110,121,0.08)' }}>
                    <h3 className="font-bold text-white uppercase tracking-tighter" style={{ fontSize: 18 }}>Edit Profile</h3>
                    <button onClick={onClose} className="text-[#444] hover:text-white transition-colors"><X size={18} /></button>
                </div>
                <div className="p-6 space-y-4">
                    {[
                        { label: 'Display Name', value: displayName, onChange: setDisplayName, type: 'text', max: 30, ph: 'Your display name' },
                        { label: 'Location', value: location, onChange: setLocation, type: 'text', max: 50, ph: 'Where are you from?' },
                    ].map(({ label, value, onChange, type, max, ph }) => (
                        <div key={label}>
                            <label className="block text-[10px] font-bold text-[#555] uppercase tracking-widest mb-2">{label}</label>
                            <input type={type} value={value} onChange={e => onChange(e.target.value)} maxLength={max}
                                placeholder={ph} style={fieldStyle}
                                onFocus={e => e.target.style.borderColor = ROSE_GOLD + '66'}
                                onBlur={e => e.target.style.borderColor = 'rgba(183,110,121,0.12)'} />
                        </div>
                    ))}
                    <div>
                        <label className="block text-[10px] font-bold text-[#555] uppercase tracking-widest mb-2">Bio</label>
                        <textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={160} rows={3}
                            placeholder="Tell us about yourself..." style={{ ...fieldStyle, resize: 'none' }}
                            onFocus={e => e.target.style.borderColor = ROSE_GOLD + '66'}
                            onBlur={e => e.target.style.borderColor = 'rgba(183,110,121,0.12)'} />
                        <span className="text-[10px] text-[#333] mt-1 block">{bio.length}/160</span>
                    </div>
                </div>
                <div className="p-5 flex gap-3" style={{ borderTop: '1px solid rgba(183,110,121,0.08)' }}>
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl text-[#555] hover:text-[#888] transition-colors text-sm font-medium">Cancel</button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving}
                        className="flex-1 py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2"
                        style={{ background: `linear-gradient(135deg, ${ROSE_GOLD}, #8b5a62)`, boxShadow: `0 4px 15px ${ROSE_GOLD}44` }}>
                        {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            : <><Save size={15} />Update</>}
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
                        <item.icon size={18} className="text-[#444]" />
                        <span className="text-white text-sm font-medium">{item.label}</span>
                        {item.locked && <span className="text-[10px] px-2 py-0.5 rounded-full text-[#555] font-bold bg-white/[0.05]">ALWAYS ON</span>}
                    </div>
                    {item.type === 'toggle' && !item.locked && (
                        <button onClick={() => onUpdate(item.key, !settings[item.key])}
                            className="w-11 h-6 rounded-full transition-all relative"
                            style={{ background: settings[item.key] ? ROSE_GOLD : 'rgba(255,255,255,0.1)' }}>
                            <motion.div animate={{ x: settings[item.key] ? 22 : 2 }} className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow" />
                        </button>
                    )}
                    {item.type === 'select' && <span className="text-[#555] flex items-center gap-1 text-sm">{item.value}<ChevronRight size={14} /></span>}
                </div>
            ))}
        </div>
    );
};

/* ─── main page ───────────────────────────────────────── */

const UserProfile = () => {
    const { userProfile, currentUser, refreshUserProfile } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAvatarSelector, setShowAvatarSelector] = useState(false);
    const [settings, setSettings] = useState({ notifications: true, sound: true });
    
    const achievements = [
        { id: 'early_adopter', name: 'Elite Guardian', desc: 'The backbone of the network.', icon: '🏆' },
        { id: 'first_vote', name: 'Voice of Nakama', desc: 'Cast your inaugural vote.', icon: '🗳️' },
        { id: 'warrior_100', name: 'Grand Warrior', desc: '100 battles witnessed.', icon: '⚔️' },
    ];

    const earnedAchievements = userProfile?.achievements || ['early_adopter'];
    const tabs = [
        { id: 'overview', label: 'Overview', icon: User },
        { id: 'achievements', label: 'Milestones', icon: Trophy },
        { id: 'activity', label: 'Journal', icon: Zap },
        { id: 'settings', label: 'Legacy Settings', icon: Settings },
    ];

    const handleSaveProfile = async (data) => {
        if (!userProfile?.user_id) return;
        await userService.updateProfile(userProfile.user_id, data);
        await refreshUserProfile();
    };

    const handleAvatarUpdate = () => {
        refreshUserProfile();
    };

    const displayName = userProfile?.displayName || 'Anonymous Shinobi';
    const bio = userProfile?.bio || 'Walking the path of the ancients.';
    const joinDate = userProfile?.created_at ? new Date(userProfile.created_at) : new Date();
    const chakra = userProfile?.chakra || 0;
    const rank = userProfile?.rank || 'Wanderer';

    return (
        <div className="min-h-screen pt-24 pb-24 md:pb-8 relative bg-[#050505]">
            <div className="max-w-4xl mx-auto px-4">
                {/* Profile card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-3xl overflow-hidden mb-8" style={glass}>
                    {/* Banner */}
                    <div className="h-40 relative" style={{ background: `linear-gradient(135deg, ${ROSE_GOLD}11, ${OBSIDIAN})` }}>
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(183,110,121,0.2) 0%, transparent 50%)' }} />
                    </div>

                    <div className="px-8 pb-8 -mt-16 relative">
                        <div className="flex flex-col md:flex-row md:items-end gap-6">
                            {/* Avatar */}
                            <div className="relative group cursor-pointer" onClick={() => setShowAvatarSelector(true)}>
                                <div className="w-32 h-32 rounded-3xl overflow-hidden bg-[#111]" style={{ border: `3px solid ${ROSE_GOLD}33`, boxShadow: `0 0 30px ${ROSE_GOLD}11` }}>
                                    {userProfile?.avatar_url
                                        ? <img src={userProfile.avatar_url} alt={displayName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        : <div className="w-full h-full flex items-center justify-center text-4xl font-black bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] text-white/20">
                                            {displayName.charAt(0).toUpperCase()}
                                        </div>
                                    }
                                </div>
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-3xl flex items-center justify-center transition-opacity backdrop-blur-sm">
                                    <Sparkles size={24} className="text-[#b76e79]" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg border border-white/[0.05]"
                                    style={{ background: ROSE_GOLD }}>
                                    <Camera size={16} color="#fff" />
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-3xl font-bold text-white tracking-tighter" style={{ fontFamily: 'var(--font-display,Cinzel,serif)' }}>{displayName}</h1>
                                    {userProfile?.is_premium && <Crown size={20} style={{ color: ROSE_GOLD }} />}
                                </div>
                                <p className="text-[#888] text-sm mb-4 max-w-lg leading-relaxed">{bio}</p>
                                <div className="flex flex-wrap items-center gap-5 text-[10px] font-bold uppercase tracking-widest text-[#444]">
                                    {userProfile?.location && <span className="flex items-center gap-1.5"><MapPin size={12} className="text-[#b76e79]" />{userProfile.location}</span>}
                                    <span className="flex items-center gap-1.5"><Calendar size={12} className="text-[#b76e79]" />Est. {joinDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                </div>
                            </div>

                            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                onClick={() => setShowEditModal(true)}
                                className="px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 text-xs uppercase tracking-widest transition-all"
                                style={{ background: 'rgba(183,110,121,0.06)', border: `1px solid ${ROSE_GOLD}33`, color: ROSE_GOLD }}>
                                <Edit2 size={14} />Edit Persona
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className="flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold whitespace-nowrap text-xs uppercase tracking-widest transition-all"
                            style={activeTab === tab.id
                                ? { background: `linear-gradient(135deg, ${ROSE_GOLD}, #8b5a62)`, color: '#fff', boxShadow: `0 8px 20px ${ROSE_GOLD}33` }
                                : { color: '#444', background: 'rgba(255,255,255,0.02)' }}>
                            <tab.icon size={14} />{tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>

                        {activeTab === 'overview' && (
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="p-8 rounded-[2rem]" style={glass}>
                                    <h3 className="font-bold text-white mb-6 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#b76e79]">
                                        <Trophy size={14} />Physical Stats
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <StatCard icon={Zap} label="Chakra" value={chakra.toLocaleString()} />
                                        <StatCard icon={Shield} label="Clan Rank" value={userProfile?.clan_role || 'No Clan'} />
                                        <StatCard icon={Eye} label="Presence" value={userProfile?.views || 102} />
                                        <StatCard icon={Award} label="Identity" value={earnedAchievements.length} />
                                    </div>
                                </div>

                                <div className="p-8 rounded-[2rem]" style={glass}>
                                    <h3 className="font-bold text-white mb-6 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#b76e79]">
                                        <Star size={14} />Legacy Milestones
                                    </h3>
                                    <div className="space-y-4">
                                        {achievements.filter(a => earnedAchievements.includes(a.id)).map(a => (
                                            <div key={a.id} className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: 'rgba(183,110,121,0.06)', border: '1px solid rgba(183,110,121,0.08)' }}>
                                                <span className="text-2xl">{a.icon}</span>
                                                <div className="flex-1">
                                                    <div className="font-bold text-white text-sm">{a.name}</div>
                                                    <div className="text-[10px] text-[#555] uppercase tracking-wide mt-0.5">{a.desc}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'achievements' && (
                            <div className="p-8 rounded-[2rem]" style={glass}>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {achievements.map(a => (
                                        <AchievementBadge key={a.id} achievement={a} earned={earnedAchievements.includes(a.id)} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="p-8 rounded-[2rem]" style={glass}>
                                <h3 className="font-bold text-white mb-6 text-[10px] uppercase tracking-[0.2em] text-[#b76e79]">System Calibration</h3>
                                <SettingsPanel settings={settings} onUpdate={(key, val) => setSettings(prev => ({ ...prev, [key]: val }))} />
                                
                                <div className="mt-10 pt-8 border-t border-white/[0.05]">
                                    <button onClick={() => alert('Feature coming soon in the Elite update.')} 
                                        className="w-full py-4 rounded-2xl font-black text-white text-xs uppercase tracking-[0.3em] transition-all"
                                        style={{ background: `linear-gradient(135deg, ${ROSE_GOLD}, #8b5a62)`, boxShadow: `0 10px 25px ${ROSE_GOLD}44` }}>
                                        Ascend to Premium
                                    </button>
                                </div>
                            </div>
                        )}

                    </motion.div>
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {showEditModal && <EditProfileModal profile={userProfile} onSave={handleSaveProfile} onClose={() => setShowEditModal(false)} />}
                {showAvatarSelector && <AnimeAvatarSelector currentAvatar={userProfile?.avatar_url} onAvatarUpdate={handleAvatarUpdate} onClose={() => setShowAvatarSelector(false)} />}
            </AnimatePresence>
        </div>
    );
};

export default UserProfile;
