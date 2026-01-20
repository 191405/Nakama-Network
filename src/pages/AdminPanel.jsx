import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Lock, Users, Settings, Trash2, Ban, Check, X,
    Eye, TrendingUp, MessageCircle, Image, Bell, Database,
    RefreshCw, AlertTriangle, ChevronRight, Crown, Zap, Send, Mail
} from 'lucide-react';
import { sendBroadcastEmail } from '../utils/emailService';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, orderBy, limit, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';

const ADMIN_PASSWORD = '1914';

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
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);

    const [broadcastSubject, setBroadcastSubject] = useState('');
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [broadcastStatus, setBroadcastStatus] = useState('');
    const [sendingBroadcast, setSendingBroadcast] = useState(false);

    const handleBroadcast = async (e) => {
        e.preventDefault();
        if (!broadcastSubject || !broadcastMessage) {
            setBroadcastStatus('Please fill in all fields');
            return;
        }

        if (!confirm('Are you sure you want to send this to ALL users?')) return;

        setSendingBroadcast(true);
        setBroadcastStatus('Queueing emails...');

        try {
            const count = await sendBroadcastEmail(broadcastSubject, broadcastMessage);
            setBroadcastStatus(`Success! Queued ${count} emails.`);
            setBroadcastSubject('');
            setBroadcastMessage('');
        } catch (err) {
            setBroadcastStatus('Error: ' + err.message);
        }
        setSendingBroadcast(false);
    };

    useEffect(() => {
        const adminUnlocked = sessionStorage.getItem('adminPanelUnlocked');
        if (adminUnlocked === 'true') {
            setIsUnlocked(true);
            loadData();
        }
    }, []);

    const handleUnlock = (e) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsUnlocked(true);
            sessionStorage.setItem('adminPanelUnlocked', 'true');
            setError('');
            loadData();
        } else {
            setError('Invalid password. Access denied.');
            setPassword('');
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            
            if (db) {
                const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(20));
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

    if (!isUnlocked) {
        return (
            <div className="min-h-screen pt-20 pb-24 px-4 flex items-center justify-center relative z-50" style={{ background: '#050505' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md p-8 rounded-2xl"
                    style={{ background: 'rgba(15,15,20,0.95)', border: '1px solid rgba(239,68,68,0.3)' }}
                >
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                            <Lock size={40} className="text-red-500" />
                        </div>
                        <h1 className="text-2xl font-black text-white mb-2">Admin Access Required</h1>
                        <p className="text-slate-400 text-sm">Enter the admin password to continue</p>
                    </div>

                    <form onSubmit={handleUnlock} className="space-y-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password..."
                            className="w-full px-4 py-3 rounded-xl bg-slate-800 text-white outline-none focus:ring-2 ring-red-500/50 transition-all text-center text-2xl tracking-widest"
                            autoFocus
                        />
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-400 text-center text-sm flex items-center justify-center gap-2"
                            >
                                <AlertTriangle size={16} />
                                {error}
                            </motion.p>
                        )}
                        <button
                            type="submit"
                            className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 transition-all"
                        >
                            Unlock Admin Panel
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 pb-24 md:pb-8 px-4 relative z-20" style={{ background: '#050505' }}>
            <div className="max-w-6xl mx-auto">
                {}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                            <Shield size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white">Admin Panel</h1>
                            <p className="text-slate-400 text-sm">Nakama Network Control Center</p>
                        </div>
                    </div>
                </motion.div>

                {}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                                ? 'bg-red-500 text-white'
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
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <StatCard icon={Users} label="Total Users" value={users.length} color="59,130,246" trend={12} />
                                    <StatCard icon={Image} label="Media Posts" value={posts.length} color="168,85,247" trend={8} />
                                    <StatCard icon={MessageCircle} label="Comments" value="--" color="34,197,94" />
                                    <StatCard icon={Bell} label="Reports" value="0" color="239,68,68" />
                                </div>
                            </div>
                        )}

                        {}
                        {activeTab === 'users' && (
                            <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(15,15,20,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div className="p-4 border-b border-slate-800">
                                    <h3 className="font-bold text-white">Recent Users</h3>
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

                        {}
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

                        {}
                        {activeTab === 'communication' && (
                            <div className="rounded-xl p-6" style={{ background: 'rgba(15,15,20,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                                    <Mail className="text-yellow-500" />
                                    Global Email Broadcast
                                </h3>

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
                                        <p className="text-xs text-slate-500 mt-1">This message will be wrapped in the Nakama Network template.</p>
                                    </div>

                                    {broadcastStatus && (
                                        <div className={`p-4 rounded-lg ${broadcastStatus.includes('Success') ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                            {broadcastStatus}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={sendingBroadcast}
                                        className="px-6 py-3 rounded-lg bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-bold hover:brightness-110 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {sendingBroadcast ? <RefreshCw className="animate-spin" /> : <Send size={18} />}
                                        {sendingBroadcast ? 'Broadcasting...' : 'Send to All Users'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {}
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
