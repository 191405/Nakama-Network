import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Settings, Trophy, Star, Shield, Sword,
    Camera, Edit2, Save, X, Crown, Zap, Heart,
    MessageCircle, Eye, Calendar, MapPin, Link as LinkIcon,
    Award, Target, Flame, Lock, ChevronRight, Check,
    Bell, Moon, Sun, Globe, Volume2, VolumeX
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile, getUserProfile, getUserMediaAnalytics } from '../utils/firebase';
import { initializeOwnerClan } from '../utils/ownerClan';
import { NakamaLogo } from '../components/NakamaLogo';

const AchievementBadge = ({ achievement, earned }) => (
    <motion.div
        whileHover={{ scale: 1.05 }}
        className={`p-4 rounded-xl text-center transition-all ${earned ? '' : 'opacity-40 grayscale'
            }`}
        style={{
            background: earned ? `rgba(${achievement.color},0.1)` : 'rgba(50,50,50,0.5)',
            border: `1px solid ${earned ? `rgba(${achievement.color},0.3)` : 'rgba(100,100,100,0.2)'}`
        }}
    >
        <div className="text-3xl mb-2">{achievement.icon}</div>
        <h4 className={`font-bold text-sm ${earned ? 'text-white' : 'text-slate-500'}`}>
            {achievement.name}
        </h4>
        <p className="text-xs text-slate-500 mt-1">{achievement.desc}</p>
        {earned && achievement.earnedAt && (
            <p className="text-xs text-yellow-500 mt-2">
                Earned {new Date(achievement.earnedAt).toLocaleDateString()}
            </p>
        )}
        {!earned && (
            <div className="flex items-center justify-center gap-1 mt-2 text-slate-600">
                <Lock size={12} />
                <span className="text-xs">Locked</span>
            </div>
        )}
    </motion.div>
);

const StatCard = ({ icon: Icon, label, value, color }) => (
    <div
        className="p-4 rounded-xl"
        style={{
            background: `rgba(${color},0.1)`,
            border: `1px solid rgba(${color},0.2)`
        }}
    >
        <Icon size={24} style={{ color: `rgb(${color})` }} className="mb-2" />
        <div className="text-2xl font-black text-white">{value}</div>
        <div className="text-slate-500 text-sm">{label}</div>
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
        try {
            await onSave({
                displayName,
                bio,
                location,
                website
            });
            onClose();
        } catch (error) {
            console.error('Failed to save:', error);
        }
        setSaving(false);
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
                {}
                <div className="p-4 flex items-center justify-between" style={{ background: 'rgba(234,179,8,0.1)' }}>
                    <h3 className="font-bold text-white">Edit Profile</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {}
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Display Name</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            maxLength={30}
                            className="w-full px-4 py-3 rounded-xl bg-slate-800/50 text-white border border-slate-700 focus:border-yellow-500 outline-none"
                            placeholder="Your display name"
                        />
                    </div>

                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Bio</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            maxLength={160}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl bg-slate-800/50 text-white border border-slate-700 focus:border-yellow-500 outline-none resize-none"
                            placeholder="Tell us about yourself..."
                        />
                        <span className="text-xs text-slate-500">{bio.length}/160</span>
                    </div>

                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Location</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            maxLength={50}
                            className="w-full px-4 py-3 rounded-xl bg-slate-800/50 text-white border border-slate-700 focus:border-yellow-500 outline-none"
                            placeholder="Where are you from?"
                        />
                    </div>

                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Website</label>
                        <input
                            type="url"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-slate-800/50 text-white border border-slate-700 focus:border-yellow-500 outline-none"
                            placeholder="https://..."
                        />
                    </div>
                </div>

                {}
                <div className="p-4 flex gap-3 border-t border-slate-800">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl font-medium text-slate-400 hover:bg-slate-800"
                    >
                        Cancel
                    </button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 py-3 rounded-xl font-bold text-black flex items-center justify-center gap-2"
                        style={{ background: 'linear-gradient(135deg, #eab308, #ca8a04)' }}
                    >
                        {saving ? (
                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save size={18} />
                                Save Changes
                            </>
                        )}
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const SettingsPanel = ({ settings, onUpdate }) => {
    const settingsItems = [
        { key: 'notifications', icon: Bell, label: 'Push Notifications', type: 'toggle' },
        { key: 'darkMode', icon: Moon, label: 'Dark Mode', type: 'toggle', locked: true },
        { key: 'sound', icon: Volume2, label: 'Sound Effects', type: 'toggle' },
        { key: 'language', icon: Globe, label: 'Language', type: 'select', value: 'English' },
    ];

    return (
        <div className="space-y-2">
            {settingsItems.map((item) => (
                <div
                    key={item.key}
                    className="flex items-center justify-between p-4 rounded-xl"
                    style={{ background: 'rgba(30,30,40,0.5)' }}
                >
                    <div className="flex items-center gap-3">
                        <item.icon size={20} className="text-slate-400" />
                        <span className="text-white">{item.label}</span>
                        {item.locked && (
                            <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded">Always On</span>
                        )}
                    </div>
                    {item.type === 'toggle' && !item.locked && (
                        <button
                            onClick={() => onUpdate(item.key, !settings[item.key])}
                            className={`w-12 h-6 rounded-full transition-colors ${settings[item.key] ? 'bg-yellow-500' : 'bg-slate-700'
                                }`}
                        >
                            <motion.div
                                animate={{ x: settings[item.key] ? 24 : 2 }}
                                className="w-5 h-5 bg-white rounded-full shadow"
                            />
                        </button>
                    )}
                    {item.type === 'select' && (
                        <span className="text-slate-400 flex items-center gap-1">
                            {item.value} <ChevronRight size={16} />
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
};

const UserProfile = () => {
    const { userProfile, currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [showEditModal, setShowEditModal] = useState(false);
    const [settings, setSettings] = useState({ notifications: true, sound: true });
    const [mediaAnalytics, setMediaAnalytics] = useState({ postsCount: 0, totalLikesReceived: 0, totalCommentsReceived: 0 });

    const fileInputRef = useRef(null);

    useEffect(() => {
        if (currentUser?.uid) {
            getUserMediaAnalytics(currentUser.uid).then(setMediaAnalytics);
        }
    }, [currentUser?.uid]);

    const achievements = [
        { id: 'first_vote', name: 'First Vote', desc: 'Cast your first vote', icon: '🗳️', color: '34,197,94' },
        { id: 'warrior_100', name: 'Warrior', desc: 'Cast 100 votes', icon: '⚔️', color: '234,179,8' },
        { id: 'trivia_master', name: 'Trivia Master', desc: 'Win 10 trivia games', icon: '🧠', color: '168,85,247' },
        { id: 'social_butterfly', name: 'Social Butterfly', desc: 'Make 50 posts', icon: '🦋', color: '59,130,246' },
        { id: 'clan_leader', name: 'Clan Leader', desc: 'Create a clan', icon: '👑', color: '239,68,68' },
        { id: 'millionaire', name: 'Millionaire', desc: 'Earn 1M Chakra in trivia', icon: '💰', color: '251,146,60' },
        { id: 'early_adopter', name: 'Early Adopter', desc: 'Joined during beta', icon: '🌟', color: '236,72,153' },
        { id: 'streak_7', name: '7-Day Streak', desc: 'Active 7 days in a row', icon: '🔥', color: '249,115,22' },
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

    const handleSettingsUpdate = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        console.log('Avatar upload:', file);
    };

    const displayName = userProfile?.displayName || currentUser?.displayName || 'Anonymous';
    const bio = userProfile?.bio || 'No bio yet...';
    const joinDate = userProfile?.createdAt?.toDate?.() || new Date();
    const chakra = userProfile?.chakra || 0;
    const rank = userProfile?.rank || 'Genin';
    const clan = userProfile?.clan || null;

    return (
        <div className="min-h-screen pt-20 pb-24 md:pb-8 px-4 relative z-20">
            <div className="max-w-4xl mx-auto">
                {}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl overflow-hidden mb-6"
                    style={{
                        background: 'rgba(15,15,20,0.95)',
                        border: '1px solid rgba(234,179,8,0.2)'
                    }}
                >
                    {}
                    <div
                        className="h-32 relative"
                        style={{
                            background: 'linear-gradient(135deg, rgba(234,179,8,0.3), rgba(202,138,4,0.1))'
                        }}
                    >
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[rgba(15,15,20,0.95)] to-transparent" />
                    </div>

                    {}
                    <div className="px-6 pb-6 -mt-16 relative">
                        <div className="flex flex-col md:flex-row md:items-end gap-4">
                            {}
                            <div className="relative">
                                <div
                                    className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-[#0f0f14]"
                                    style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                                >
                                    {userProfile?.avatar ? (
                                        <img
                                            src={userProfile.avatar}
                                            alt={displayName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
                                            <span className="text-4xl font-black text-black">
                                                {displayName.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center text-black hover:bg-yellow-400 transition-colors"
                                >
                                    <Camera size={16} />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                            </div>

                            {}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h1 className="text-2xl font-bold text-white">{displayName}</h1>
                                    {userProfile?.isPremium && (
                                        <Crown size={20} className="text-yellow-400" />
                                    )}
                                </div>
                                <p className="text-slate-400 text-sm mb-2">{bio}</p>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                    {userProfile?.location && (
                                        <span className="flex items-center gap-1">
                                            <MapPin size={14} /> {userProfile.location}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <Calendar size={14} /> Joined {joinDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                    </span>
                                    {clan && (
                                        <span className="flex items-center gap-1 text-yellow-400">
                                            <Shield size={14} /> {clan}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowEditModal(true)}
                                className="px-6 py-2 rounded-xl font-medium flex items-center gap-2 text-yellow-400"
                                style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)' }}
                            >
                                <Edit2 size={16} />
                                Edit Profile
                            </motion.button>
                        </div>

                        {}
                        <div className="grid grid-cols-4 gap-3 mt-6">
                            <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(234,179,8,0.1)' }}>
                                <div className="text-xl font-bold text-yellow-400">{chakra.toLocaleString()}</div>
                                <div className="text-xs text-slate-500">Chakra</div>
                            </div>
                            <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(59,130,246,0.1)' }}>
                                <div className="text-xl font-bold text-blue-400">{userProfile?.totalVotes || 0}</div>
                                <div className="text-xs text-slate-500">Votes</div>
                            </div>
                            <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(168,85,247,0.1)' }}>
                                <div className="text-xl font-bold text-purple-400">{userProfile?.streak || 0}</div>
                                <div className="text-xs text-slate-500">Day Streak</div>
                            </div>
                            <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.1)' }}>
                                <div className="text-xl font-bold text-green-400">{rank}</div>
                                <div className="text-xs text-slate-500">Rank</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {}
                <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar pb-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                                ? 'bg-yellow-500 text-black'
                                : 'text-slate-400 hover:bg-white/5'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {}
                        {activeTab === 'overview' && (
                            <div className="grid md:grid-cols-2 gap-6">
                                {}
                                <div
                                    className="p-6 rounded-2xl"
                                    style={{ background: 'rgba(15,15,20,0.95)', border: '1px solid rgba(234,179,8,0.15)' }}
                                >
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Trophy size={20} className="text-yellow-400" />
                                        Your Stats
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <StatCard icon={Sword} label="Battles Won" value={userProfile?.totalWins || 0} color="239,68,68" />
                                        <StatCard icon={Heart} label="Favorites" value={userProfile?.favorites?.length || 0} color="236,72,153" />
                                        <StatCard icon={MessageCircle} label="Posts" value={userProfile?.posts || 0} color="59,130,246" />
                                        <StatCard icon={Eye} label="Profile Views" value={userProfile?.views || 47} color="168,85,247" />
                                    </div>
                                </div>

                                {}
                                <div
                                    className="p-6 rounded-2xl"
                                    style={{ background: 'rgba(15,15,20,0.95)', border: '1px solid rgba(234,179,8,0.15)' }}
                                >
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Star size={20} className="text-yellow-400" />
                                        Recent Achievements
                                    </h3>
                                    <div className="space-y-3">
                                        {achievements.filter(a => earnedAchievements.includes(a.id)).slice(0, 4).map((achievement) => (
                                            <div
                                                key={achievement.id}
                                                className="flex items-center gap-3 p-3 rounded-xl"
                                                style={{ background: `rgba(${achievement.color},0.1)` }}
                                            >
                                                <span className="text-2xl">{achievement.icon}</span>
                                                <div>
                                                    <div className="font-bold text-white text-sm">{achievement.name}</div>
                                                    <div className="text-xs text-slate-500">{achievement.desc}</div>
                                                </div>
                                                <Check size={18} className="ml-auto text-green-400" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {}
                                <div
                                    className="p-6 rounded-2xl md:col-span-2"
                                    style={{ background: 'rgba(15,15,20,0.95)', border: '1px solid rgba(168,85,247,0.2)' }}
                                >
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Eye size={20} className="text-purple-400" />
                                        Global Media Analytics
                                    </h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        <StatCard icon={Camera} label="Posts Shared" value={mediaAnalytics.postsCount} color="168,85,247" />
                                        <StatCard icon={Heart} label="Likes Received" value={mediaAnalytics.totalLikesReceived} color="236,72,153" />
                                        <StatCard icon={MessageCircle} label="Comments" value={mediaAnalytics.totalCommentsReceived} color="59,130,246" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {}
                        {activeTab === 'achievements' && (
                            <div
                                className="p-6 rounded-2xl"
                                style={{ background: 'rgba(15,15,20,0.95)', border: '1px solid rgba(234,179,8,0.15)' }}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-white">All Achievements</h3>
                                    <span className="text-yellow-400 text-sm">
                                        {earnedAchievements.length}/{achievements.length} Unlocked
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {achievements.map((achievement) => (
                                        <AchievementBadge
                                            key={achievement.id}
                                            achievement={achievement}
                                            earned={earnedAchievements.includes(achievement.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {}
                        {activeTab === 'activity' && (
                            <div
                                className="p-6 rounded-2xl"
                                style={{ background: 'rgba(15,15,20,0.95)', border: '1px solid rgba(234,179,8,0.15)' }}
                            >
                                <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
                                <div className="space-y-4">
                                    {[
                                        { icon: Sword, text: 'Voted for Goku in Goku vs Naruto', time: '2 hours ago', color: '239,68,68' },
                                        { icon: Trophy, text: 'Earned "First Vote" achievement', time: 'Yesterday', color: '234,179,8' },
                                        { icon: MessageCircle, text: 'Commented on a battle', time: '2 days ago', color: '59,130,246' },
                                        { icon: Heart, text: 'Added Demon Slayer to favorites', time: '3 days ago', color: '236,72,153' },
                                    ].map((activity, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-4 p-4 rounded-xl"
                                            style={{ background: 'rgba(30,30,40,0.5)' }}
                                        >
                                            <div
                                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                                style={{ background: `rgba(${activity.color},0.2)` }}
                                            >
                                                <activity.icon size={20} style={{ color: `rgb(${activity.color})` }} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white text-sm">{activity.text}</p>
                                                <p className="text-slate-500 text-xs">{activity.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {}
                        {activeTab === 'settings' && (
                            <div
                                className="p-6 rounded-2xl"
                                style={{ background: 'rgba(15,15,20,0.95)', border: '1px solid rgba(234,179,8,0.15)' }}
                            >
                                <h3 className="text-lg font-bold text-white mb-4">Settings</h3>
                                <SettingsPanel settings={settings} onUpdate={handleSettingsUpdate} />

                                <div className="mt-6 pt-6 border-t border-slate-800">
                                    <h4 className="text-white font-medium mb-4">Account</h4>
                                    <div className="space-y-2">
                                        <button className="w-full text-left p-4 rounded-xl hover:bg-white/5 text-slate-400 flex items-center justify-between">
                                            <span>Change Password</span>
                                            <ChevronRight size={18} />
                                        </button>
                                        <button className="w-full text-left p-4 rounded-xl hover:bg-red-500/10 text-red-400 flex items-center justify-between">
                                            <span>Delete Account</span>
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>

                                {}
                                <div className="mt-6 pt-6 border-t border-slate-800">
                                    <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                                        <Crown size={16} className="text-yellow-400" />
                                        Founder Actions
                                    </h4>
                                    <button
                                        onClick={async () => {
                                            if (window.confirm('Construct Nakama Legends Clan? This will make you the leader.')) {
                                                const res = await initializeOwnerClan(currentUser?.uid, displayName);
                                                alert(res.message);
                                            }
                                        }}
                                        className="w-full text-left p-4 rounded-xl relative overflow-hidden group hover:scale-[1.02] transition-all"
                                        style={{ background: 'linear-gradient(135deg, #eab308, #ca8a04)' }}
                                    >
                                        <div className="relative z-10 flex items-center justify-between">
                                            <span className="font-bold text-black">Construct Nakama Legends</span>
                                            <Shield size={18} className="text-black" />
                                        </div>
                                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {}
            <AnimatePresence>
                {showEditModal && (
                    <EditProfileModal
                        profile={userProfile}
                        onSave={handleSaveProfile}
                        onClose={() => setShowEditModal(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserProfile;
