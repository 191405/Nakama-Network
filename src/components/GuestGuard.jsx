import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, UserPlus, LogIn, Sparkles, Shield, Trophy, MessageCircle, Gamepad2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const UpgradePrompt = ({ feature, onClose, onSignUp, onLogin }) => {
    const featureInfo = {
        'profile': { icon: Shield, title: 'Your Profile', desc: 'Customize your avatar, bio, and track your progress' },
        'watchlist': { icon: Trophy, title: 'Watchlist', desc: 'Save and organize your favorite anime' },
        'achievements': { icon: Trophy, title: 'Achievements', desc: 'Unlock badges and climb the ranks' },
        'chat': { icon: MessageCircle, title: 'Global Chat', desc: 'Chat with fellow Nakama members worldwide' },
        'clan': { icon: Shield, title: 'Clans', desc: 'Join or create a clan with friends' },
        'community': { icon: MessageCircle, title: 'Community', desc: 'Post, comment, and interact with others' },
        'trivia': { icon: Gamepad2, title: 'Millionaire Trivia', desc: 'Test your anime knowledge and win Chakra' },
        'oracle': { icon: Sparkles, title: 'The Oracle', desc: 'Get AI-powered anime recommendations' },
        'games': { icon: Gamepad2, title: 'Mini Games', desc: 'Play exclusive anime-themed games' },
        'settings': { icon: Shield, title: 'Settings', desc: 'Customize notifications, privacy, and more' },
        'default': { icon: Lock, title: 'This Feature', desc: 'Access exclusive member-only content' }
    };

    const info = featureInfo[feature] || featureInfo['default'];
    const IconComponent = info.icon;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.8, y: 40, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.8, y: 40, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-3xl overflow-hidden relative"
                style={{
                    background: 'linear-gradient(180deg, rgba(20,20,25,0.98) 0%, rgba(10,10,12,0.99) 100%)',
                    border: '1px solid rgba(234,179,8,0.3)',
                    boxShadow: '0 0 60px rgba(234,179,8,0.15), 0 25px 50px rgba(0,0,0,0.5)'
                }}
            >
                {}
                <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
                    style={{
                        background: 'radial-gradient(ellipse at center top, rgba(234,179,8,0.2) 0%, transparent 70%)'
                    }}
                />

                {}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all z-10"
                >
                    <X size={18} />
                </button>

                {}
                <div className="pt-10 pb-6 flex flex-col items-center relative z-10">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
                        style={{
                            background: 'linear-gradient(135deg, rgba(234,179,8,0.2), rgba(202,138,4,0.1))',
                            border: '1px solid rgba(234,179,8,0.3)'
                        }}
                    >
                        <IconComponent size={36} className="text-yellow-400" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-2 mb-2"
                    >
                        <Lock size={16} className="text-yellow-500" />
                        <span className="text-yellow-400 text-sm font-medium uppercase tracking-wider">Members Only</span>
                    </motion.div>

                    <h2 className="text-2xl font-bold text-white text-center mb-2">
                        Unlock {info.title}
                    </h2>
                    <p className="text-slate-400 text-center px-8">
                        {info.desc}
                    </p>
                </div>

                {}
                <div className="px-6 pb-6">
                    <div className="p-4 rounded-2xl space-y-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        {[
                            { icon: '🏆', text: 'Track achievements & climb the ranks' },
                            { icon: '⚡', text: 'Earn Chakra and unlock rewards' },
                            { icon: '🎮', text: 'Access trivia, games & exclusive features' },
                            { icon: '👥', text: 'Join clans and connect with Nakama' }
                        ].map((benefit, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + idx * 0.1 }}
                                className="flex items-center gap-3"
                            >
                                <span className="text-lg">{benefit.icon}</span>
                                <span className="text-slate-300 text-sm">{benefit.text}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {}
                <div className="px-6 pb-8 space-y-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onSignUp}
                        className="w-full py-4 rounded-xl font-bold text-black flex items-center justify-center gap-2 relative overflow-hidden group"
                        style={{ background: 'linear-gradient(135deg, #eab308, #ca8a04)' }}
                    >
                        <UserPlus size={20} />
                        Create Free Account
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    </motion.button>

                    <button
                        onClick={onLogin}
                        className="w-full py-4 rounded-xl font-medium text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-colors"
                        style={{ background: 'rgba(255,255,255,0.05)' }}
                    >
                        <LogIn size={18} />
                        Already have an account? Sign In
                    </button>
                </div>

                {}
                <div className="px-6 pb-6 text-center">
                    <p className="text-slate-500 text-xs">
                        Join 10,000+ Nakama members today ✨
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};

const GuestGuard = ({ children, feature = 'default', showPreview = false }) => {
    const { isGuest, isAuthenticated, logout } = useAuth();
    const [showPrompt, setShowPrompt] = React.useState(false);

    if (isAuthenticated && !isGuest) {
        return children;
    }

    const handleSignUp = () => {
        logout(); 
        window.location.href = '/'; 
    };

    const handleLogin = () => {
        logout();
        window.location.href = '/';
    };

    if (showPreview) {
        
        return (
            <div className="relative">
                <div className="opacity-50 pointer-events-none blur-[2px]">
                    {children}
                </div>

                {}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-2xl"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowPrompt(true)}
                        className="px-6 py-3 rounded-xl font-medium flex items-center gap-2 text-yellow-400"
                        style={{
                            background: 'rgba(234,179,8,0.15)',
                            border: '1px solid rgba(234,179,8,0.4)'
                        }}
                    >
                        <Lock size={18} />
                        Unlock Feature
                    </motion.button>
                </motion.div>

                <AnimatePresence>
                    {showPrompt && (
                        <UpgradePrompt
                            feature={feature}
                            onClose={() => setShowPrompt(false)}
                            onSignUp={handleSignUp}
                            onLogin={handleLogin}
                        />
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring" }}
                    className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6"
                    style={{
                        background: 'linear-gradient(135deg, rgba(234,179,8,0.2), rgba(202,138,4,0.1))',
                        border: '1px solid rgba(234,179,8,0.3)'
                    }}
                >
                    <Lock size={36} className="text-yellow-400" />
                </motion.div>

                <h2 className="text-2xl font-bold text-white mb-2">Members Only</h2>
                <p className="text-slate-400 mb-8 max-w-sm mx-auto">
                    Create a free account to access this feature and unlock your full Nakama experience.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSignUp}
                        className="px-8 py-3 rounded-xl font-bold text-black flex items-center justify-center gap-2"
                        style={{ background: 'linear-gradient(135deg, #eab308, #ca8a04)' }}
                    >
                        <UserPlus size={18} />
                        Create Account
                    </motion.button>

                    <button
                        onClick={handleLogin}
                        className="px-8 py-3 rounded-xl font-medium text-slate-300 hover:text-white flex items-center justify-center gap-2"
                        style={{ background: 'rgba(255,255,255,0.05)' }}
                    >
                        <LogIn size={18} />
                        Sign In
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export { GuestGuard, UpgradePrompt };
export default GuestGuard;
