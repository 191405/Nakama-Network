import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Sparkles, Sword, Users, Play, Newspaper, Star, Bot } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { isFirstTimeUser, completeOnboarding } from '../utils/firebase';

const WelcomeBot = () => {
    const { user, userProfile } = useAuth();
    const [isVisible, setIsVisible] = useState(false);
    const [step, setStep] = useState(0);
    const [hasChecked, setHasChecked] = useState(false);

    useEffect(() => {
        if (user?.uid && !hasChecked) {
            checkFirstTime();
        }
    }, [user, hasChecked]);

    const checkFirstTime = async () => {
        setHasChecked(true);
        const isNew = await isFirstTimeUser(user.uid);
        if (isNew) {
            setTimeout(() => setIsVisible(true), 1000);
        }
    };

    const features = [
        {
            icon: Sword,
            title: 'Arena Battles',
            desc: 'Vote on epic character matchups and debate who would win!'
        },
        {
            icon: Play,
            title: 'Watch Anime',
            desc: 'Stream and download your favorite anime for free!'
        },
        {
            icon: Users,
            title: 'Community',
            desc: 'Join clans, chat with others, and share memes!'
        },
        {
            icon: Newspaper,
            title: 'Anime News',
            desc: 'Stay updated with the latest anime announcements!'
        },
        {
            icon: Star,
            title: 'Character Database',
            desc: 'Explore thousands of characters with power tiers!'
        }
    ];

    const handleNext = () => {
        if (step < features.length - 1) {
            setStep(step + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = async () => {
        setIsVisible(false);
        if (user?.uid) {
            await completeOnboarding(user.uid);
        }
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                style={{ background: 'rgba(0,0,0,0.9)' }}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="w-full max-w-md rounded-2xl overflow-hidden"
                    style={{ background: 'rgba(15,15,20,0.98)', border: '1px solid rgba(202, 138, 4, 0.3)' }}
                >
                    {}
                    <div className="relative p-6 bg-gradient-to-br from-yellow-500/20 to-amber-500/10">
                        <button
                            onClick={handleComplete}
                            className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-4">
                            <motion.div
                                className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center"
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Bot size={32} className="text-black" />
                            </motion.div>
                            <div>
                                <h2 className="text-xl font-black text-white">Welcome to Nakama Network!</h2>
                                <p className="text-slate-400 text-sm">Hey {userProfile?.displayName || 'Shinobi'}! I'm your guide.</p>
                            </div>
                        </div>
                    </div>

                    {/* Feature Showcase */}
                    <div className="p-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="mb-6"
                            >
                                <div className={`w-14 h-14 rounded-xl bg-yellow-500/20 flex items-center justify-center mb-4`}>
                                    {React.createElement(features[step].icon, { size: 28, className: 'text-yellow-500' })}
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">{features[step].title}</h3>
                                <p className="text-slate-400">{features[step].desc}</p>
                            </motion.div>
                        </AnimatePresence>

                        {/* Progress Dots */}
                        <div className="flex justify-center gap-2 mb-6">
                            {features.map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full transition-all ${i === step ? 'w-6 bg-yellow-500' : 'bg-slate-700'}`}
                                />
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleComplete}
                                className="px-4 py-3 rounded-xl bg-slate-800 text-slate-400 font-semibold hover:bg-slate-700 flex-1"
                            >
                                Skip Tour
                            </button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleNext}
                                className="px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold flex items-center justify-center gap-2 flex-1"
                            >
                                {step < features.length - 1 ? (
                                    <>Next <ChevronRight size={18} /></>
                                ) : (
                                    <>Start Exploring <Sparkles size={18} /></>
                                )}
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default WelcomeBot;
