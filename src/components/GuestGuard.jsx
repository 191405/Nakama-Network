import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, UserPlus, LogIn, Sparkles, Shield, Trophy, MessageCircle, Gamepad2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const UpgradePrompt = ({ feature, onClose, onAuthClick }) => {
    const featureInfo = {
        'profile': { icon: Shield, title: 'Your Profile', desc: 'Customize your avatar, bio, and track your progress in the ecosystem' },
        'watchlist': { icon: Trophy, title: 'Watchlist', desc: 'Curate your anime collection and preserve your legacy' },
        'achievements': { icon: Trophy, title: 'Achievements', desc: 'Unlock exclusive accolades and ascend the network ranks' },
        'chat': { icon: MessageCircle, title: 'Global Chat', desc: 'Converse with elite Nakama members worldwide' },
        'clan': { icon: Shield, title: 'Clans', desc: 'Forge powerful alliances and establish your own Clan' },
        'community': { icon: MessageCircle, title: 'Community', desc: 'Publish insights and engage with premium discussions' },
        'trivia': { icon: Gamepad2, title: 'Millionaire Trivia', desc: 'Challenge your intellect and acquire Chakra' },
        'oracle': { icon: Sparkles, title: 'The Oracle', desc: 'Harness AI-driven intelligence for tailored recommendations' },
        'games': { icon: Gamepad2, title: 'Mini Games', desc: 'Engage in exclusive experiences tailored for members' },
        'marketplace': { icon: ShoppingBag, title: 'Marketplace', desc: 'Trade premium anime collectibles & merchandise with the elite' },
        'settings': { icon: Shield, title: 'Settings', desc: 'Configure your privacy and system preferences' },
        'default': { icon: Lock, title: 'Premium Access', desc: 'Authorize your identity to access this exclusive sector' }
    };

    const info = featureInfo[feature] || featureInfo['default'];
    const IconComponent = info.icon;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 flex items-center justify-center z-[100] p-4"
            style={{ background: 'rgba(5, 5, 5, 0.85)', backdropFilter: 'blur(12px)' }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 20, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-[24px] overflow-hidden relative"
                style={{
                    background: 'linear-gradient(180deg, rgba(20,18,22,0.95) 0%, rgba(10,10,12,0.98) 100%)',
                    border: '1px solid rgba(183,110,121,0.2)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(183,110,121,0.1)'
                }}
            >
                {/* Rose Gold Ambient Glow Top */}
                <div className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
                    style={{
                        background: 'radial-gradient(ellipse at center -50%, rgba(183,110,121,0.25) 0%, transparent 70%)',
                        zIndex: 0
                    }}
                />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center transition-all z-20 group"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                    <X size={16} className="text-slate-400 group-hover:text-white transition-colors" />
                </button>

                {/* Header Content */}
                <div className="pt-12 pb-6 flex flex-col items-center relative z-10">
                    <motion.div
                        initial={{ scale: 0.8, rotate: -5 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                        style={{
                            background: 'linear-gradient(135deg, rgba(183,110,121,0.2), rgba(183,110,121,0.05))',
                            border: '1px solid rgba(183,110,121,0.3)',
                            boxShadow: '0 8px 24px rgba(183,110,121,0.15)'
                        }}
                    >
                        <IconComponent size={28} style={{ color: '#b76e79' }} />
                    </motion.div>

                    <h2 className="text-2xl font-black mb-3 tracking-wide" style={{
                        background: 'linear-gradient(to right, #ffffff, #e2c1c6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        {info.title}
                    </h2>
                    <p className="text-sm text-slate-400 text-center px-10 leading-relaxed font-light">
                        {info.desc}
                    </p>
                </div>

                {/* Benefits List */}
                <div className="px-8 pb-8 relative z-10">
                    <div className="p-5 rounded-2xl space-y-4 mb-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        {[
                            { icon: '🏆', text: 'Accrue prestige & ascend the hierarchy' },
                            { icon: '⚡', text: 'Harness Chakra for exclusive artifacts' },
                            { icon: '👥', text: 'Ally with elite clans and strategize' }
                        ].map((benefit, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + idx * 0.1 }}
                                className="flex items-center gap-4"
                            >
                                <span className="text-lg opacity-80">{benefit.icon}</span>
                                <span className="text-[13px] text-slate-300 font-medium tracking-wide">{benefit.text}</span>
                            </motion.div>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => { onClose(); onAuthClick(); }}
                            className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg relative overflow-hidden group"
                            style={{ 
                                background: 'linear-gradient(135deg, #b76e79 0%, #9a5b66 100%)',
                                boxShadow: '0 8px 24px rgba(183,110,121,0.25)' 
                            }}
                        >
                            <UserPlus size={18} />
                            <span>Authorize Protocol</span>
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                        </motion.button>

                        <button
                            onClick={() => { onClose(); onAuthClick(); }}
                            className="w-full py-3.5 rounded-xl font-medium text-slate-400 hover:text-white flex items-center justify-center gap-2 transition-all"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                        >
                            <LogIn size={16} />
                            <span className="text-sm tracking-wide">Already Verified? Sign In</span>
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const GuestGuard = ({ children, feature = 'default', showPreview = false }) => {
    const { isGuest, isAuthenticated, openAuthModal } = useAuth();
    const [showPrompt, setShowPrompt] = React.useState(false);

    if (isAuthenticated && !isGuest) {
        return children;
    }

    const handleRequireAuth = () => {
        openAuthModal('Authorize your identity to access this exclusive sector.');
    };

    if (showPreview) {
        return (
            <div className="relative">
                <div className="opacity-40 pointer-events-none blur-[4px] select-none transition-all duration-500">
                    {children}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center z-10"
                    style={{ background: 'rgba(5,5,5,0.3)' }}
                >
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(183,110,121,0.4)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowPrompt(true)}
                        className="px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 text-white transition-all shadow-2xl backdrop-blur-md"
                        style={{
                            background: 'rgba(20,18,22,0.85)',
                            border: '1px solid rgba(183,110,121,0.4)'
                        }}
                    >
                        <Lock size={16} style={{ color: '#b76e79' }} />
                        <span className="tracking-widest uppercase text-xs">Unlock Sector</span>
                    </motion.button>
                </motion.div>

                <AnimatePresence>
                    {showPrompt && (
                        <UpgradePrompt
                            feature={feature}
                            onClose={() => setShowPrompt(false)}
                            onAuthClick={handleRequireAuth}
                        />
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 pointer-events-none flex justify-center items-center opacity-30">
                <div className="w-[500px] h-[500px] rounded-full blur-[100px]" style={{ background: 'radial-gradient(circle, rgba(183,110,121,0.15), transparent 70%)' }}></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="text-center relative z-10 p-10 rounded-[32px] max-w-lg w-full"
                style={{
                    background: 'rgba(15,12,18,0.6)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                }}
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6"
                    style={{
                        background: 'linear-gradient(135deg, rgba(183,110,121,0.2), rgba(183,110,121,0.05))',
                        border: '1px solid rgba(183,110,121,0.3)',
                        boxShadow: '0 10px 30px rgba(183,110,121,0.15)',
                    }}
                >
                    <Lock size={32} style={{ color: '#b76e79' }} />
                </motion.div>

                <h2 className="text-3xl font-black mb-4 tracking-tight" style={{
                    background: 'linear-gradient(to right, #ffffff, #e2c1c6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Sector Restricted
                </h2>
                <p className="text-slate-400 mb-10 text-sm leading-relaxed max-w-sm mx-auto font-light">
                    This quadrant is reserved for authorized personnel. Establish your network identity to access the full Nakama experience and secure your legacy.
                </p>

                <div className="flex flex-col gap-4 max-w-xs mx-auto">
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleRequireAuth}
                        className="py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-xl"
                        style={{ background: 'linear-gradient(135deg, #b76e79 0%, #9a5b66 100%)' }}
                    >
                        <UserPlus size={18} />
                        Establish Identity
                    </motion.button>

                    <button
                        onClick={handleRequireAuth}
                        className="py-4 rounded-xl font-medium text-slate-400 hover:text-white flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
                        style={{ border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                        <LogIn size={18} />
                        <span className="text-sm tracking-wide">Enter Credentials</span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export { GuestGuard, UpgradePrompt };
export default GuestGuard;
