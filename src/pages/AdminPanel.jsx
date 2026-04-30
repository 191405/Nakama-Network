import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Lock, Users, Settings, Trash2, Ban, Check, X,
    Eye, TrendingUp, MessageCircle, Image, Bell, Database,
    RefreshCw, AlertTriangle, ChevronRight, Crown, Zap, Send, Mail,
    User, Radio, Target, CheckCircle, XCircle
} from 'lucide-react';
import authService from '../utils/authService';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, orderBy, limit, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';

const StatCard = ({ icon: Icon, label, value, color, trend }) => (
    <div
        className="p-5 rounded-xl"
        style={{ background: `rgba(${color}, 0.1)`, border: `1px solid rgba(${color}, 0.2)` }}
    >
        <div className="flex items-center justify-between mb-2">
            <Icon size={24} style={{ color: `rgb(${color})` }} />
            {trend && (
                <span className={`text-xs font-bold ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {trend > 0 ? '+' : ''}{trend}%
                </span>
            )}
        </div>
        <div className="text-3xl font-black text-white">{value}</div>
        <div className="text-slate-400 text-sm">{label}</div>
    </div>
);

const AdminPanel = () => {
    const { currentUser, userProfile } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);

    // Broadcast state
    const [broadcastSubject, setBroadcastSubject] = useState('');
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [broadcastStatus, setBroadcastStatus] = useState('');
    const [sendingBroadcast, setSendingBroadcast] = useState(false);
    const [broadcastProgress, setBroadcastProgress] = useState({ sent: 0, total: 0 });

    // Targeted message state
    const [targetEmail, setTargetEmail] = useState('');
    const [targetName, setTargetName] = useState('');
    const [targetSubject, setTargetSubject] = useState('');
    const [targetMessage, setTargetMessage] = useState('');
    const [targetStatus, setTargetStatus] = useState('');
    const [sendingTarget, setSendingTarget] = useState(false);

    // Communication sub-mode
    const [commMode, setCommMode] = useState('broadcast'); // 'broadcast' | 'targeted'

    useEffect(() => {
        if (userProfile?.isAdmin) {
            loadData();
        }
    }, [userProfile]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (db) {
                const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(50));
                const usersSnap = await getDocs(usersQuery);
                setUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                const mediaQuery = query(collection(db, 'media'), orderBy('createdAt', 'desc'), limit(20));
                const mediaSnap = await getDocs(mediaQuery);
                setPosts(mediaSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            }
        } catch (err) {
            console.error('Failed to load admin data:', err);
        }
        setLoading(false);
    };

    const handleBroadcast = async (e) => {
        e.preventDefault();
        if (!broadcastSubject || !broadcastMessage) {
            setBroadcastStatus('Please fill in all fields');
            return;
        }
        if (!confirm('Send this announcement to ALL registered users?')) return;

        setSendingBroadcast(true);
        setBroadcastStatus('Sending...');
        setBroadcastProgress({ sent: 0, total: users.length });

        let successCount = 0;
        let failCount = 0;

        for (const user of users) {
            const email = user.email;
            const name = user.displayName || 'Nakama';
            if (!email || !email.includes('@')) continue;

            try {
                await authService.sendAnnouncement(email, name, broadcastSubject, broadcastMessage);
                successCount++;
            } catch (err) {
                console.error(`Failed to send to ${email}:`, err);
                failCount++;
            }
            setBroadcastProgress({ sent: successCount + failCount, total: users.length });
            // Small delay to prevent rate limiting
            await new Promise(r => setTimeout(r, 1200));
        }

        setBroadcastStatus(`Done! ${successCount} sent, ${failCount} failed.`);
        setSendingBroadcast(false);
        if (successCount > 0) {
            setBroadcastSubject('');
            setBroadcastMessage('');
        }
    };

    const handleTargetedSend = async (e) => {
        e.preventDefault();
        if (!targetEmail || !targetSubject || !targetMessage) {
            setTargetStatus('Please fill in all fields');
            return;
        }

        setSendingTarget(true);
        setTargetStatus('Sending...');

        try {
            await authService.sendAnnouncement(targetEmail, targetName || 'Nakama', targetSubject, targetMessage);
            setTargetStatus(`Email sent to ${targetEmail}!`);
            setTargetEmail('');
            setTargetName('');
            setTargetSubject('');
            setTargetMessage('');
        } catch (err) {
            setTargetStatus('Error: ' + err.message);
        }
        setSendingTarget(false);
    };

    const prefillTargetUser = (user) => {
        setTargetEmail(user.email || '');
        setTargetName(user.displayName || 'Nakama');
        setTargetSubject('');
        setTargetMessage('');
        setTargetStatus('');
        setCommMode('targeted');
        setActiveTab('communication');
    };

    const handleBanUser = async (userId) => {
        if (!db) return;
        try {
            await updateDoc(doc(db, 'users', userId), { banned: true });
            setUsers(users.map(u => u.id === userId ? { ...u, banned: true } : u));
        } catch (err) {
            console.error('Failed to ban user:', err);
        }
    };

    const handleUnbanUser = async (userId) => {
        if (!db) return;
        try {
            await updateDoc(doc(db, 'users', userId), { banned: false });
            setUsers(users.map(u => u.id === userId ? { ...u, banned: false } : u));
        } catch (err) {
            console.error('Failed to unban user:', err);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!db) return;
        try {
            await deleteDoc(doc(db, 'media', postId));
            setPosts(posts.filter(p => p.id !== postId));
        } catch (err) {
            console.error('Failed to delete post:', err);
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: TrendingUp },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'content', label: 'Content', icon: Image },
        { id: 'communication', label: 'Broadcast', icon: Mail },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    // ── ACCESS DENIED ──
    if (!userProfile?.isAdmin) {
        return (
            <div className="min-h-screen pt-20 pb-24 px-4 flex items-center justify-center relative z-50 bg-[#050505]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md p-8 rounded-2xl text-center"
                    style={{ background: 'rgba(15,15,20,0.95)', border: '1px solid rgba(239,68,68,0.3)' }}
                >
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                        <Lock size={40} className="text-red-500" />
                    </div>
                    <h1 className="text-2xl font-black text-white mb-2">Access Denied</h1>
                    <p className="text-slate-400 text-sm">
                        This section is restricted to network administrators.
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 pb-24 md:pb-8 px-4 relative z-20 bg-[#050505]">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
                            <Crown size={24} className="text-black" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white">Admin Panel</h1>
                            <p className="text-slate-400 text-sm">Nakama Network Control Center</p>
                        </div>
                    </div>
                </motion.div>

                {/* Tab Bar */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                                ? 'bg-yellow-500 text-black'
                                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 text-slate-400 hover:bg-slate-700"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {/* Overview */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <StatCard icon={Users} label="Total Users" value={users.length} color="59,130,246" trend={12} />
                                    <StatCard icon={Image} label="Media Posts" value={posts.length} color="168,85,247" trend={8} />
                                    <StatCard icon={MessageCircle} label="Comments" value="--" color="34,197,94" />
                                    <StatCard icon={Bell} label="Reports" value="0" color="239,68,68" />
                                </div>
                            </div>
                        )}

                        {/* Users */}
                        {activeTab === 'users' && (
                            <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(15,15,20,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                                    <h3 className="font-bold text-white">All Users ({users.length})</h3>
                                </div>
                                <div className="divide-y divide-slate-800">
                                    {users.map(user => (
                                        <div key={user.id} className="p-4 flex items-center justify-between hover:bg-slate-800/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
                                                    <span className="font-bold text-black">
                                                        {(user.displayName || 'A').charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white flex items-center gap-2">
                                                        {user.displayName || 'Anonymous'}
                                                        {user.isAdmin && <Crown size={14} className="text-yellow-400" />}
                                                        {user.banned && <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">Banned</span>}
                                                    </div>
                                                    <div className="text-xs text-slate-500">{user.email || user.id}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {/* Message this user */}
                                                {user.email && (
                                                    <button
                                                        onClick={() => prefillTargetUser(user)}
                                                        className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-sm hover:bg-blue-500/30 flex items-center gap-1"
                                                        title="Send a direct message"
                                                    >
                                                        <Mail size={14} /> Message
                                                    </button>
                                                )}
                                                {user.banned ? (
                                                    <button
                                                        onClick={() => handleUnbanUser(user.id)}
                                                        className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 text-sm hover:bg-green-500/30"
                                                    >
                                                        Unban
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleBanUser(user.id)}
                                                        className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30"
                                                    >
                                                        Ban
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {users.length === 0 && (
                                        <div className="p-8 text-center text-slate-500">No users found</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Content */}
                        {activeTab === 'content' && (
                            <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(15,15,20,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div className="p-4 border-b border-slate-800">
                                    <h3 className="font-bold text-white">Recent Media Posts</h3>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
                                    {posts.map(post => (
                                        <div key={post.id} className="relative group">
                                            <img
                                                src={post.url}
                                                alt=""
                                                className="w-full aspect-square object-cover rounded-lg"
                                                referrerPolicy="no-referrer"
                                            />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                                <button
                                                    onClick={() => handleDeletePost(post.id)}
                                                    className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {posts.length === 0 && (
                                        <div className="col-span-4 p-8 text-center text-slate-500">No posts found</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Communication */}
                        {activeTab === 'communication' && (
                            <div className="rounded-xl p-6" style={{ background: 'rgba(15,15,20,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                {/* Mode Toggle */}
                                <div className="flex gap-2 mb-6">
                                    <button
                                        onClick={() => setCommMode('broadcast')}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                                            commMode === 'broadcast'
                                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 border border-transparent'
                                        }`}
                                    >
                                        <Radio size={16} /> Global Broadcast
                                    </button>
                                    <button
                                        onClick={() => setCommMode('targeted')}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                                            commMode === 'targeted'
                                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 border border-transparent'
                                        }`}
                                    >
                                        <Target size={16} /> Targeted Message
                                    </button>
                                </div>

                                {/* Global Broadcast */}
                                {commMode === 'broadcast' && (
                                    <div>
                                        <h3 className="font-bold text-white mb-1 flex items-center gap-2">
                                            <Radio className="text-yellow-500" size={20} />
                                            Global Email Broadcast
                                        </h3>
                                        <p className="text-slate-500 text-xs mb-6">
                                            This will send to all {users.length} registered users via your backend SMTP.
                                        </p>

                                        <form onSubmit={handleBroadcast} className="space-y-4 max-w-2xl">
                                            <div>
                                                <label className="block text-slate-400 text-sm mb-2">Subject Line</label>
                                                <input
                                                    type="text"
                                                    value={broadcastSubject}
                                                    onChange={e => setBroadcastSubject(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-yellow-500 outline-none"
                                                    placeholder="e.g., New Feature Alert: Clan Wars!"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-slate-400 text-sm mb-2">Message (HTML Supported)</label>
                                                <textarea
                                                    value={broadcastMessage}
                                                    onChange={e => setBroadcastMessage(e.target.value)}
                                                    className="w-full h-40 px-4 py-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-yellow-500 outline-none font-mono text-sm"
                                                    placeholder="<p>Hello Ninjas...</p>"
                                                />
                                                <p className="text-xs text-slate-500 mt-1">This message will be wrapped in the Nakama Network email template.</p>
                                            </div>

                                            {broadcastStatus && (
                                                <div className={`p-4 rounded-lg flex items-center gap-2 ${
                                                    broadcastStatus.includes('Done') ? 'bg-green-500/20 text-green-400'
                                                    : broadcastStatus.includes('Error') ? 'bg-red-500/20 text-red-400'
                                                    : 'bg-yellow-500/10 text-yellow-500'
                                                }`}>
                                                    {broadcastStatus.includes('Done') ? <CheckCircle size={18} /> :
                                                     broadcastStatus.includes('Error') ? <XCircle size={18} /> :
                                                     <RefreshCw size={18} className="animate-spin" />}
                                                    {broadcastStatus}
                                                </div>
                                            )}

                                            {sendingBroadcast && broadcastProgress.total > 0 && (
                                                <div>
                                                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                                                        <span>Progress</span>
                                                        <span>{broadcastProgress.sent} / {broadcastProgress.total}</span>
                                                    </div>
                                                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full transition-all duration-300"
                                                            style={{ width: `${(broadcastProgress.sent / broadcastProgress.total) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={sendingBroadcast}
                                                className="px-6 py-3 rounded-lg bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-bold hover:brightness-110 disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {sendingBroadcast ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
                                                {sendingBroadcast ? `Broadcasting (${broadcastProgress.sent}/${broadcastProgress.total})...` : 'Send to All Users'}
                                            </button>
                                        </form>
                                    </div>
                                )}

                                {/* Targeted Message */}
                                {commMode === 'targeted' && (
                                    <div>
                                        <h3 className="font-bold text-white mb-1 flex items-center gap-2">
                                            <Target className="text-blue-400" size={20} />
                                            Direct Message
                                        </h3>
                                        <p className="text-slate-500 text-xs mb-6">
                                            Send a personal email to a specific user. You can also click "Message" on any user in the Users tab.
                                        </p>

                                        <form onSubmit={handleTargetedSend} className="space-y-4 max-w-2xl">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-slate-400 text-sm mb-2">Recipient Email</label>
                                                    <input
                                                        type="email"
                                                        value={targetEmail}
                                                        onChange={e => setTargetEmail(e.target.value)}
                                                        className="w-full px-4 py-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-blue-500 outline-none"
                                                        placeholder="user@example.com"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-slate-400 text-sm mb-2">Display Name (optional)</label>
                                                    <input
                                                        type="text"
                                                        value={targetName}
                                                        onChange={e => setTargetName(e.target.value)}
                                                        className="w-full px-4 py-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-blue-500 outline-none"
                                                        placeholder="Their display name"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-slate-400 text-sm mb-2">Subject</label>
                                                <input
                                                    type="text"
                                                    value={targetSubject}
                                                    onChange={e => setTargetSubject(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-blue-500 outline-none"
                                                    placeholder="e.g., Welcome back to the Network!"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-slate-400 text-sm mb-2">Message (HTML Supported)</label>
                                                <textarea
                                                    value={targetMessage}
                                                    onChange={e => setTargetMessage(e.target.value)}
                                                    className="w-full h-32 px-4 py-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-blue-500 outline-none font-mono text-sm"
                                                    placeholder="<p>Hey there...</p>"
                                                />
                                            </div>

                                            {targetStatus && (
                                                <div className={`p-4 rounded-lg flex items-center gap-2 ${
                                                    targetStatus.includes('sent') ? 'bg-green-500/20 text-green-400'
                                                    : targetStatus.includes('Error') ? 'bg-red-500/20 text-red-400'
                                                    : 'bg-yellow-500/10 text-yellow-500'
                                                }`}>
                                                    {targetStatus.includes('sent') ? <CheckCircle size={18} /> :
                                                     targetStatus.includes('Error') ? <XCircle size={18} /> :
                                                     <RefreshCw size={18} className="animate-spin" />}
                                                    {targetStatus}
                                                </div>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={sendingTarget}
                                                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold hover:brightness-110 disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {sendingTarget ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
                                                {sendingTarget ? 'Sending...' : 'Send Direct Message'}
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Settings */}
                        {activeTab === 'settings' && (
                            <div className="rounded-xl p-6" style={{ background: 'rgba(15,15,20,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <h3 className="font-bold text-white mb-4">Admin Settings</h3>
                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl bg-slate-800/50 flex items-center justify-between">
                                        <div>
                                            <div className="font-medium text-white">Maintenance Mode</div>
                                            <div className="text-sm text-slate-400">Disable site access for non-admins</div>
                                        </div>
                                        <button className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300">Off</button>
                                    </div>
                                    <div className="p-4 rounded-xl bg-slate-800/50 flex items-center justify-between">
                                        <div>
                                            <div className="font-medium text-white">Clear News Cache</div>
                                            <div className="text-sm text-slate-400">Force refresh anime news</div>
                                        </div>
                                        <button className="px-4 py-2 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30">Clear</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminPanel;
