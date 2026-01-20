import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, BarChart3, Settings, Shield, Bell, Search, Eye, Trash2, Check, X, AlertTriangle, TrendingUp, Activity, MessageSquare, Image, Film, UserPlus, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { isUserAdmin, logOut, createBattlePoll, getSystemStats } from '../utils/firebase';
import { jikanAPI } from '../utils/animeDataAPIs';

const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="p-6 rounded-2xl"
        style={{ background: 'rgba(15,15,20,0.95)', border: '1px solid rgba(202, 138, 4, 0.15)' }}
    >
        <div className="flex items-start justify-between">
            <div>
                <p className="text-slate-500 text-sm mb-1">{title}</p>
                <h3 className="text-3xl font-black text-white">{value}</h3>
                {change && <p className={`text-sm mt-1 ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>{change > 0 ? '+' : ''}{change}% from last week</p>}
            </div>
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon size={24} className="text-white" />
            </div>
        </div>
    </motion.div>
);

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { userProfile, user } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('overview');

    const [stats, setStats] = useState({
        users: 0,
        posts: 0,
        battles: 0,
        reports: 0
    });

    const [pendingContent] = useState([]);
    const [recentActivity] = useState([]);

    const [battleSearch1, setBattleSearch1] = useState('');
    const [battleSearch2, setBattleSearch2] = useState('');
    const [char1Results, setChar1Results] = useState([]);
    const [char2Results, setChar2Results] = useState([]);
    const [selectedChar1, setSelectedChar1] = useState(null);
    const [selectedChar2, setSelectedChar2] = useState(null);
    const [battleCreating, setBattleCreating] = useState(false);

    const searchChar = async (query, setResults) => {
        if (!query) return;
        try {
            const results = await jikanAPI.searchCharacters(query);
            setResults(results.slice(0, 5));
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateBattle = async () => {
        if (!selectedChar1 || !selectedChar2) return;
        setBattleCreating(true);
        try {
            await createBattlePoll(
                { name: selectedChar1.name, image: selectedChar1.images.jpg.image_url },
                { name: selectedChar2.name, image: selectedChar2.images.jpg.image_url },
                'admin_custom'
            );
            alert('Battle Created!');
            setSelectedChar1(null);
            setSelectedChar2(null);
            setBattleSearch1('');
            setBattleSearch2('');
        } catch (error) {
            alert('Error creating battle');
        }
        setBattleCreating(false);
    };

    useEffect(() => {
        checkAdminStatus();
        loadStats();
    }, [user]);

    const loadStats = async () => {
        const data = await getSystemStats();
        setStats(prev => ({ ...prev, ...data }));
    };

    const checkAdminStatus = async () => {
        if (user?.uid) {
            const admin = await isUserAdmin(user.uid);
            setIsAdmin(admin);
        }
        setLoading(false);
    };

    const sections = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'content', label: 'Battles', icon: FileText },
        { id: 'reports', label: 'Reports', icon: AlertTriangle },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const handleLogout = async () => {
        try {
            await logOut();
            navigate('/');
            window.location.reload();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#050505' }}>
                <div className="w-12 h-12 rounded-full border-4 border-yellow-500/30 border-t-yellow-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 pb-8 px-4" style={{ background: '#050505' }}>
            <div className="max-w-7xl mx-auto">

                {}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2">Admin Dashboard</h1>
                        <p className="text-slate-500">Manage users, content, and site settings</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white">
                            <Bell size={20} />
                        </button>
                        <button onClick={handleLogout} className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg font-semibold flex items-center gap-2 hover:bg-red-600/30">
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-5 gap-6">
                    {}
                    <div className="lg:col-span-1">
                        <div className="rounded-2xl p-4 space-y-1" style={{ background: 'rgba(15,15,20,0.95)', border: '1px solid rgba(202, 138, 4, 0.15)' }}>
                            {sections.map(section => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeSection === section.id ? 'bg-yellow-500 text-black' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                                >
                                    <section.icon size={18} />
                                    {section.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {}
                    <div className="lg:col-span-4">
                        <AnimatePresence mode="wait">
                            {activeSection === 'overview' && (
                                <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    {}
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                        <StatCard title="Total Users" value={stats.users} change={12} icon={Users} color="bg-blue-600" />
                                        <StatCard title="Media Posts" value={stats.posts} change={8} icon={Image} color="bg-purple-600" />
                                        <StatCard title="Arena Battles" value={stats.battles} change={24} icon={Activity} color="bg-green-600" />
                                        <StatCard title="Reports" value={stats.reports} change={-5} icon={AlertTriangle} color="bg-red-600" />
                                    </div>

                                    {}
                                    <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(15,15,20,0.95)', border: '1px solid rgba(202, 138, 4, 0.15)' }}>
                                        <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
                                        <div className="grid sm:grid-cols-4 gap-3">
                                            {[
                                                { label: 'Add News', icon: FileText, color: 'bg-blue-600' },
                                                { label: 'New Battle', icon: Activity, color: 'bg-purple-600' },
                                                { label: 'Broadcast', icon: Bell, color: 'bg-yellow-600' },
                                                { label: 'Settings', icon: Settings, color: 'bg-slate-600' },
                                            ].map((action, i) => (
                                                <button key={i} className={`${action.color} hover:opacity-90 p-4 rounded-xl text-white font-semibold flex flex-col items-center gap-2`}>
                                                    <action.icon size={24} />
                                                    {action.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {}
                                    <div className="rounded-2xl p-6" style={{ background: 'rgba(15,15,20,0.95)', border: '1px solid rgba(202, 138, 4, 0.15)' }}>
                                        <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
                                        {recentActivity.length === 0 ? (
                                            <div className="text-center py-8 text-slate-500">
                                                <Activity className="mx-auto mb-2" size={32} />
                                                <p>No recent activity. Data will appear here once the site is live.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {recentActivity.map((activity, i) => (
                                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50">
                                                        <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                                            <Activity className="text-yellow-500" size={16} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-white text-sm">{activity.message}</p>
                                                            <p className="text-slate-500 text-xs">{activity.time}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {activeSection === 'users' && (
                                <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <div className="rounded-2xl p-6" style={{ background: 'rgba(15,15,20,0.95)', border: '1px solid rgba(202, 138, 4, 0.15)' }}>
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-xl font-bold text-white">User Management</h3>
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                                <input type="text" placeholder="Search users..." className="pl-9 pr-4 py-2 bg-slate-800 rounded-lg text-white text-sm outline-none w-64" />
                                            </div>
                                        </div>
                                        <div className="text-center py-12 text-slate-500">
                                            <Users className="mx-auto mb-2" size={48} />
                                            <p>No users yet. User data will appear here once users register.</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeSection === 'content' && (
                                <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <div className="rounded-2xl p-6" style={{ background: 'rgba(15,15,20,0.95)', border: '1px solid rgba(202, 138, 4, 0.15)' }}>
                                        <h3 className="text-xl font-bold text-white mb-6">Create Global Battle</h3>

                                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                                            {}
                                            <div className="space-y-4">
                                                <label className="text-slate-400 text-sm">Fighter 1</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={battleSearch1}
                                                        onChange={(e) => setBattleSearch1(e.target.value)}
                                                        className="w-full bg-slate-800 p-3 rounded-xl text-white outline-none"
                                                        placeholder="Search character..."
                                                    />
                                                    <button onClick={() => searchChar(battleSearch1, setChar1Results)} className="absolute right-2 top-2 p-1 bg-yellow-500 rounded-lg text-black"><Search size={16} /></button>
                                                </div>
                                                {}
                                                {char1Results.length > 0 && !selectedChar1 && (
                                                    <div className="space-y-2 bg-slate-800 p-2 rounded-xl">
                                                        {char1Results.map(char => (
                                                            <div key={char.mal_id} onClick={() => { setSelectedChar1(char); setChar1Results([]); }} className="flex items-center gap-2 p-2 hover:bg-slate-700 cursor-pointer rounded-lg">
                                                                <img src={char.images.jpg.image_url} className="w-8 h-8 rounded-full object-cover" />
                                                                <span className="text-white text-sm truncate">{char.name}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {selectedChar1 && (
                                                    <div className="flex items-center gap-4 p-4 bg-blue-900/20 border border-blue-500/50 rounded-xl relative">
                                                        <img src={selectedChar1.images.jpg.image_url} className="w-16 h-16 rounded-xl object-cover" />
                                                        <div>
                                                            <div className="font-bold text-white">{selectedChar1.name}</div>
                                                            <button onClick={() => setSelectedChar1(null)} className="text-xs text-red-400 mt-1">Remove</button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {}
                                            <div className="space-y-4">
                                                <label className="text-slate-400 text-sm">Fighter 2</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={battleSearch2}
                                                        onChange={(e) => setBattleSearch2(e.target.value)}
                                                        className="w-full bg-slate-800 p-3 rounded-xl text-white outline-none"
                                                        placeholder="Search character..."
                                                    />
                                                    <button onClick={() => searchChar(battleSearch2, setChar2Results)} className="absolute right-2 top-2 p-1 bg-yellow-500 rounded-lg text-black"><Search size={16} /></button>
                                                </div>
                                                {char2Results.length > 0 && !selectedChar2 && (
                                                    <div className="space-y-2 bg-slate-800 p-2 rounded-xl">
                                                        {char2Results.map(char => (
                                                            <div key={char.mal_id} onClick={() => { setSelectedChar2(char); setChar2Results([]); }} className="flex items-center gap-2 p-2 hover:bg-slate-700 cursor-pointer rounded-lg">
                                                                <img src={char.images.jpg.image_url} className="w-8 h-8 rounded-full object-cover" />
                                                                <span className="text-white text-sm truncate">{char.name}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {selectedChar2 && (
                                                    <div className="flex items-center gap-4 p-4 bg-red-900/20 border border-red-500/50 rounded-xl relative">
                                                        <img src={selectedChar2.images.jpg.image_url} className="w-16 h-16 rounded-xl object-cover" />
                                                        <div>
                                                            <div className="font-bold text-white">{selectedChar2.name}</div>
                                                            <button onClick={() => setSelectedChar2(null)} className="text-xs text-red-400 mt-1">Remove</button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleCreateBattle}
                                            disabled={!selectedChar1 || !selectedChar2 || battleCreating}
                                            className="w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl font-black text-black text-lg hover:scale-[1.01] transition-transform disabled:opacity-50 disabled:scale-100"
                                        >
                                            {battleCreating ? 'CREATING BATTLE...' : 'START BATTLE'}
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {activeSection === 'reports' && (
                                <motion.div key="reports" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <div className="rounded-2xl p-6" style={{ background: 'rgba(15,15,20,0.95)', border: '1px solid rgba(202, 138, 4, 0.15)' }}>
                                        <h3 className="text-xl font-bold text-white mb-6">Reports</h3>
                                        <div className="text-center py-12 text-slate-500">
                                            <AlertTriangle className="mx-auto mb-2" size={48} />
                                            <p>No reports. Community is behaving!</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeSection === 'settings' && (
                                <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <div className="rounded-2xl p-6" style={{ background: 'rgba(15,15,20,0.95)', border: '1px solid rgba(202, 138, 4, 0.15)' }}>
                                        <h3 className="text-xl font-bold text-white mb-6">Site Settings</h3>
                                        <div className="space-y-6">
                                            <div>
                                                <label className="text-slate-400 text-sm mb-2 block">Site Name</label>
                                                <input type="text" defaultValue="Nakama Network" className="w-full px-4 py-3 bg-slate-800 rounded-xl text-white outline-none focus:ring-2 ring-yellow-500" />
                                            </div>
                                            <div>
                                                <label className="text-slate-400 text-sm mb-2 block">Maintenance Mode</label>
                                                <div className="flex items-center gap-3">
                                                    <button className="px-4 py-2 bg-slate-800 rounded-lg text-slate-400">Off</button>
                                                    <button className="px-4 py-2 bg-yellow-500 rounded-lg text-black font-bold">Active</button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-slate-400 text-sm mb-2 block">Registration</label>
                                                <select className="w-full px-4 py-3 bg-slate-800 rounded-xl text-white outline-none">
                                                    <option>Open to Everyone</option>
                                                    <option>Invite Only</option>
                                                    <option>Closed</option>
                                                </select>
                                            </div>
                                            <button className="w-full py-3 bg-yellow-500 rounded-xl text-black font-bold hover:bg-yellow-400">Save Changes</button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
