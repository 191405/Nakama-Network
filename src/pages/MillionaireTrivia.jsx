import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy, DollarSign, Clock, HelpCircle,
    Phone, Users, Brain, X, Check, Heart,
    ArrowRight, Lock, Zap, Save, RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../utils/firebase';
import { doc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { GuestGuard } from '../components/GuestGuard';

const MONEY_TREE = [
    100, 200, 300, 500, 1000,           
    2000, 4000, 8000, 16000, 32000,     
    64000, 125000, 250000, 500000, 1000000 
];

const QUESTIONS = [
    
    {
        q: "Who is known as the 'Substitute Soul Reaper'?",
        a: ["Ichigo Kurosaki", "Rukia Kuchiki", "Sosuke Aizen", "Renji Abarai"],
        correct: 0
    },
    {
        q: "In Naruto, what is the name of the Nine-Tailed Fox?",
        a: ["Kurama", "Shukaku", "Gyuki", "Matatabi"],
        correct: 0
    },
    {
        q: "What is the name of Luffy's devil fruit?",
        a: ["Gomu Gomu no Mi", "Mera Mera no Mi", "Hito Hito no Mi", "Yami Yami no Mi"],
        correct: 0
    },
    {
        q: "Which anime features a notebook that can kill people?",
        a: ["Death Note", "Soul Eater", "Bleach", "Tokyo Ghoul"],
        correct: 0
    },
    {
        q: "Who is the main protagonist of Dragon Ball?",
        a: ["Goku", "Vegeta", "Gohan", "Piccolo"],
        correct: 0
    },
    
    {
        q: "In Attack on Titan, who is the Female Titan?",
        a: ["Annie Leonhart", "Mikasa Ackerman", "Sasha Blouse", "Hange Zoe"],
        correct: 0
    },
    {
        q: "What is the highest rank in the Demon Slayer Corps?",
        a: ["Hashira", "Kinoe", "Mizunoto", "Tsuguko"],
        correct: 0
    },
    {
        q: "In Hunter x Hunter, what is Gon's father's name?",
        a: ["Ging Freecss", "Silva Zoldyck", "Isaac Netero", "Kite"],
        correct: 0
    },
    {
        q: "What constitutes the law of equivalent exchange in Fullmetal Alchemist?",
        a: ["To gain something, something of equal value must be lost", "To create life, you must give life", "Gold can be made from lead", "Alchemy is magic"],
        correct: 0
    },
    {
        q: "Which eye technique does Kakashi Hatake possess?",
        a: ["Sharingan", "Byakugan", "Rinnegan", "Tenseigan"],
        correct: 0
    },
    
    {
        q: "What is the name of the sword used by Inuyasha?",
        a: ["Tessaiga", "Tenseiga", "Tokijin", "Bakusaiga"],
        correct: 0
    },
    {
        q: "In Jojo's Bizarre Adventure, what is the name of Jotaro's Stand?",
        a: ["Star Platinum", "The World", "Crazy Diamond", "Hermit Purple"],
        correct: 0
    },
    {
        q: "Who wrote 'Berserk'?",
        a: ["Kentaro Miura", "Hirohiko Araki", "Takehiko Inoue", "Junji Ito"],
        correct: 0
    },
    {
        q: "In One Piece, what is the name of the Ancient Weapon related to the sea?",
        a: ["Poseidon", "Pluton", "Uranus", "Neptune"],
        correct: 0
    },
    
    {
        q: "What is the release date of the very first episode of Dragon Ball?",
        a: ["February 26, 1986", "January 15, 1985", "March 10, 1987", "December 3, 1984"],
        correct: 0
    }
];

const MillionaireTrivia = () => {
    const { currentUser, userProfile } = useAuth();

    const [gameState, setGameState] = useState('intro'); 
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [revealedAnswer, setRevealedAnswer] = useState(false);
    const [earnings, setEarnings] = useState(0);
    const [safeEarnings, setSafeEarnings] = useState(0);

    const [lifelines, setLifelines] = useState({
        fiftyFifty: true,
        audience: true,
        sensei: true
    });

    const [currentQ, setCurrentQ] = useState(null);
    const [answers, setAnswers] = useState([]);

    const [timer, setTimer] = useState(30);
    const [saving, setSaving] = useState(false);

    const [hiddenAnswers, setHiddenAnswers] = useState([]); 
    const [audiencePoll, setAudiencePoll] = useState(null);
    const [senseiHint, setSenseiHint] = useState(null);

    const startGame = () => {
        setGameState('playing');
        setCurrentQuestionIndex(0);
        setEarnings(0);
        setSafeEarnings(0);
        setLifelines({ fiftyFifty: true, audience: true, sensei: true });
        loadQuestion(0);
    };

    const loadQuestion = (index) => {

        const qIndex = index % QUESTIONS.length;
        const q = QUESTIONS[qIndex];

        const shuffled = q.a.map((txt, idx) => ({ txt, isCorrect: idx === q.correct }));
        
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        setCurrentQ(q.q);
        setAnswers(shuffled);
        setTimer(30);
        setSelectedAnswer(null);
        setRevealedAnswer(false);
        setHiddenAnswers([]);
        setAudiencePoll(null);
        setSenseiHint(null);
    };

    useEffect(() => {
        if (gameState !== 'playing' || revealedAnswer) return;

        if (timer > 0) {
            const interval = setInterval(() => setTimer(t => t - 1), 1000);
            return () => clearInterval(interval);
        } else {
            handleWalkAway(true); 
        }
    }, [timer, gameState, revealedAnswer]);

    const handleAnswer = (index) => {
        if (revealedAnswer) return;
        setSelectedAnswer(index);

        setTimeout(() => {
            setRevealedAnswer(true);
            const isCorrect = answers[index].isCorrect;

            setTimeout(() => {
                if (isCorrect) {
                    const winAmount = MONEY_TREE[currentQuestionIndex];
                    
                    if (currentQuestionIndex === 4) setSafeEarnings(1000);
                    if (currentQuestionIndex === 9) setSafeEarnings(32000);

                    if (currentQuestionIndex < 14) {
                        setCurrentQuestionIndex(prev => prev + 1);
                        setEarnings(winAmount);
                        loadQuestion(currentQuestionIndex + 1);
                    } else {
                        setEarnings(winAmount);
                        handleWin(winAmount);
                    }
                } else {
                    handleLoss();
                }
            }, 2000); 
        }, 1000); 
    };

    const handleWin = async (amount) => {
        setGameState('won');
        await saveProgress(amount);
    };

    const handleLoss = async () => {
        setGameState('lost');
        await saveProgress(safeEarnings); 
    };

    const handleWalkAway = async (timeout = false) => {
        setGameState('walked');
        await saveProgress(earnings);
    };

    const saveProgress = async (amount) => {
        if (!currentUser || amount <= 0) return;
        setSaving(true);
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                chakra: increment(amount),
                totalEarnings: increment(amount),
                triviaGamesPlayed: increment(1),
                achievements: amount >= 1000000 ? arrayUnion('millionaire') : undefined
            });
        } catch (error) {
            console.error('Save failed:', error);
        }
        setSaving(false);
    };

    const useFiftyFifty = () => {
        if (!lifelines.fiftyFifty) return;
        setLifelines(prev => ({ ...prev, fiftyFifty: false }));

        const correctIdx = answers.findIndex(a => a.isCorrect);
        
        const wrongIndices = answers
            .map((_, idx) => idx)
            .filter(idx => idx !== correctIdx);

        const toHide = [];
        while (toHide.length < 2) {
            const r = wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
            if (!toHide.includes(r)) toHide.push(r);
        }
        setHiddenAnswers(toHide);
    };

    const useAudience = () => {
        if (!lifelines.audience) return;
        setLifelines(prev => ({ ...prev, audience: false }));

        const correctIdx = answers.findIndex(a => a.isCorrect);
        const distribution = [0, 0, 0, 0];

        distribution[correctIdx] = 60 + Math.floor(Math.random() * 20);

        let remaining = 100 - distribution[correctIdx];
        answers.forEach((_, idx) => {
            if (idx !== correctIdx && !hiddenAnswers.includes(idx)) {
                if (idx === 3) distribution[idx] = remaining; 
                else {
                    const share = Math.floor(Math.random() * remaining);
                    distribution[idx] = share;
                    remaining -= share;
                }
            }
        });

        setAudiencePoll(distribution);
    };

    const useSensei = () => {
        if (!lifelines.sensei) return;
        setLifelines(prev => ({ ...prev, sensei: false }));

        const correctIdx = answers.findIndex(a => a.isCorrect);
        const correctTxt = answers[correctIdx].txt;

        const hints = [
            `I recall reading in the archives that it relates to ${correctTxt}.`,
            `The answer is undoubtedly ${correctTxt}. Trust in your gut!`,
            `Focus young one. ${correctTxt} seems correct.`
        ];

        setSenseiHint(hints[Math.floor(Math.random() * hints.length)]);
    };

    return (
        <GuestGuard feature="trivia">
            <div className="min-h-screen pt-20 pb-10 px-4 relative z-20 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-blue-900/40 mix-blend-multiply" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black via-blue-900/20 to-black" />
                </div>

                {}
                {gameState === 'intro' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-2xl w-full text-center relative z-10 p-8 rounded-3xl border border-yellow-500/30 bg-black/80 backdrop-blur-md"
                    >
                        <Trophy size={80} className="mx-auto text-yellow-500 mb-6 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                        <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 mb-4">
                            MILLIONAIRE TRIVIA
                        </h1>
                        <p className="text-xl text-slate-300 mb-8">
                            15 Questions. 3 Lifelines. One Grand Prize.
                            <br />
                            <span className="text-yellow-400 font-bold">Win 1,000,000 Chakra!</span>
                        </p>
                        <button
                            onClick={startGame}
                            className="px-12 py-4 rounded-full text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all scale-100 hover:scale-105 active:scale-95"
                        >
                            START GAME
                        </button>
                    </motion.div>
                )}

                {}
                {gameState === 'playing' && (
                    <div className="w-full max-w-6xl grid lg:grid-cols-4 gap-6 relative z-10">

                        {}
                        <div className="lg:col-span-3 flex flex-col justify-end min-h-[600px]">

                            {}
                            <div className="mb-8 text-center relative">
                                {}
                                <div className="relative py-8 px-12 bg-black/80 border-2 border-slate-500 rounded-full mb-8 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                                    <div className="absolute -left-5 top-1/2 -translate-y-1/2 h-[1px] w-full bg-slate-500 -z-10" />
                                    <h2 className="text-2xl md:text-3xl font-bold text-white">{currentQ}</h2>
                                </div>

                                {}
                                <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-4 border-yellow-500 flex items-center justify-center bg-black shadow-[0_0_20px_rgba(234,179,8,0.4)]">
                                    <span className={`text-3xl font-bold ${timer < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                                        {timer}
                                    </span>
                                </div>

                                {}
                                <AnimatePresence>
                                    {senseiHint && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="mb-4 p-4 bg-purple-900/80 border border-purple-500 rounded-xl text-white flex items-center gap-3 justify-center"
                                        >
                                            <Brain className="text-purple-300" />
                                            "{senseiHint}"
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {answers.map((ans, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(idx)}
                                        disabled={revealedAnswer || hiddenAnswers.includes(idx)}
                                        className={`relative py-4 px-8 rounded-full border-2 transition-all overflow-hidden ${hiddenAnswers.includes(idx) ? 'opacity-0 pointer-events-none' :
                                            selectedAnswer === idx
                                                ? revealedAnswer
                                                    ? ans.isCorrect
                                                        ? 'bg-green-600 border-green-400 animate-pulse' // Correct
                                                        : 'bg-red-600 border-red-400' // Wrong
                                                    : 'bg-yellow-600 border-yellow-400' // Selected
                                                : 'bg-black/80 border-slate-500 hover:bg-slate-800 hover:border-yellow-400' // Default
                                            }`}
                                    >
                                        <span className="relative z-10 flex items-center gap-4">
                                            <span className="text-yellow-500 font-bold">{String.fromCharCode(65 + idx)}:</span>
                                            <span className="text-white text-lg font-medium">{ans.txt}</span>
                                            {audiencePoll && (
                                                <span className="ml-auto text-xs text-blue-300">{audiencePoll[idx]}%</span>
                                            )}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {}
                        <div className="lg:col-span-1 space-y-6">

                            {}
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={useFiftyFifty}
                                    disabled={!lifelines.fiftyFifty || revealedAnswer}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${lifelines.fiftyFifty
                                        ? 'bg-blue-900/50 border-blue-400 hover:bg-blue-800'
                                        : 'bg-slate-900 border-slate-700 opacity-50 cursor-not-allowed'
                                        }`}
                                >
                                    <span className="text-white font-bold text-lg">50:50</span>
                                </button>
                                <button
                                    onClick={useAudience}
                                    disabled={!lifelines.audience || revealedAnswer}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${lifelines.audience
                                        ? 'bg-blue-900/50 border-blue-400 hover:bg-blue-800'
                                        : 'bg-slate-900 border-slate-700 opacity-50 cursor-not-allowed'
                                        }`}
                                >
                                    <Users className="text-white" size={24} />
                                </button>
                                <button
                                    onClick={useSensei}
                                    disabled={!lifelines.sensei || revealedAnswer}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${lifelines.sensei
                                        ? 'bg-blue-900/50 border-blue-400 hover:bg-blue-800'
                                        : 'bg-slate-900 border-slate-700 opacity-50 cursor-not-allowed'
                                        }`}
                                >
                                    <Phone className="text-white" size={24} />
                                </button>
                            </div>

                            {}
                            <div className="bg-black/60 border border-slate-700 rounded-xl p-4">
                                <div className="space-y-1">
                                    {[...MONEY_TREE].reverse().map((amount, idx) => {
                                        const step = 15 - idx; 
                                        const isCurrent = step === currentQuestionIndex + 1;
                                        const isSafe = step === 5 || step === 10 || step === 15;
                                        const passed = step <= currentQuestionIndex;

                                        return (
                                            <div
                                                key={step}
                                                className={`flex justify-between items-center px-3 py-1 rounded ${isCurrent ? 'bg-yellow-600 text-white font-bold scale-105 origin-left' :
                                                    passed ? 'text-green-500' :
                                                        isSafe ? 'text-white' : 'text-slate-500'
                                                    }`}
                                            >
                                                <span className="text-xs w-6">{step}</span>
                                                <span className={`${isSafe ? 'font-bold' : ''}`}>
                                                    {amount.toLocaleString()}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <button
                                onClick={() => handleWalkAway()}
                                className="w-full py-3 rounded-xl border border-red-500/50 text-red-400 hover:bg-red-500/10 font-medium"
                            >
                                Walk Away ({earnings.toLocaleString()} Chakra)
                            </button>
                        </div>
                    </div>
                )}

                {}
                {(gameState === 'won' || gameState === 'lost' || gameState === 'walked') && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md w-full text-center relative z-20 p-8 rounded-3xl bg-black/90 border border-slate-700 shadow-2xl"
                    >
                        {gameState === 'won' ? (
                            <Trophy size={80} className="mx-auto text-yellow-400 mb-4 animate-bounce" />
                        ) : gameState === 'lost' ? (
                            <X size={80} className="mx-auto text-red-500 mb-4" />
                        ) : (
                            <DollarSign size={80} className="mx-auto text-green-500 mb-4" />
                        )}

                        <h2 className="text-3xl font-bold text-white mb-2">
                            {gameState === 'won' ? 'MILLIONAIRE!' :
                                gameState === 'lost' ? 'GAME OVER' : 'WISE DECISION'}
                        </h2>

                        <div className="py-6 my-6 border-t border-b border-slate-800">
                            <p className="text-slate-400 uppercase tracking-widest text-sm mb-2">Total Winnings</p>
                            <p className="text-4xl font-black text-yellow-400">
                                {(gameState === 'lost' ? safeEarnings : earnings).toLocaleString()}
                            </p>
                            <p className="text-sm text-yellow-600 font-bold mt-1">CHAKRA</p>
                        </div>

                        <button
                            onClick={startGame}
                            disabled={saving}
                            className="w-full py-4 rounded-xl font-bold bg-white text-black hover:bg-slate-200 transition-colors mb-3"
                        >
                            {saving ? 'SAVING...' : 'PLAY AGAIN'}
                        </button>

                        <button
                            onClick={() => setGameState('intro')}
                            className="text-slate-500 hover:text-white text-sm"
                        >
                            Back to Menu
                        </button>
                    </motion.div>
                )}
            </div>
        </GuestGuard>
    );
};

export default MillionaireTrivia;
