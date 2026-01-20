import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain, Zap, Users, Phone, HelpCircle,
    CheckCircle, XCircle, Trophy, Star,
    ChevronRight, Sparkles, Volume2, VolumeX,
    ArrowLeft, Crown
} from 'lucide-react';
import { generateTriviaQuestion } from '../utils/gemini';

const PRIZE_LADDER = [
    { level: 15, prize: '1,000,000', isMilestone: true },
    { level: 14, prize: '500,000', isMilestone: false },
    { level: 13, prize: '250,000', isMilestone: false },
    { level: 12, prize: '125,000', isMilestone: false },
    { level: 11, prize: '64,000', isMilestone: false },
    { level: 10, prize: '32,000', isMilestone: true },
    { level: 9, prize: '16,000', isMilestone: false },
    { level: 8, prize: '8,000', isMilestone: false },
    { level: 7, prize: '4,000', isMilestone: false },
    { level: 6, prize: '2,000', isMilestone: false },
    { level: 5, prize: '1,000', isMilestone: true },
    { level: 4, prize: '500', isMilestone: false },
    { level: 3, prize: '300', isMilestone: false },
    { level: 2, prize: '200', isMilestone: false },
    { level: 1, prize: '100', isMilestone: false },
];

const DIFFICULTIES = [
    { id: 'easy', name: 'Easy', desc: 'Casual anime fan', color: '#22c55e', icon: '🌱' },
    { id: 'normal', name: 'Normal', desc: 'Regular otaku', color: '#eab308', icon: '⚔️' },
    { id: 'hard', name: 'Hard', desc: 'True weeb master', color: '#ef4444', icon: '🔥' },
];

const DifficultyBot = ({ onSelect, visible }) => {
    const [botMessage, setBotMessage] = useState('');
    const [showOptions, setShowOptions] = useState(false);

    useEffect(() => {
        if (visible) {
            setBotMessage('');
            setShowOptions(false);

            const message = "Greetings, challenger! Ready to test your anime knowledge? Choose your difficulty level wisely... 🎭";
            let i = 0;
            const timer = setInterval(() => {
                if (i < message.length) {
                    setBotMessage(prev => prev + message[i]);
                    i++;
                } else {
                    clearInterval(timer);
                    setTimeout(() => setShowOptions(true), 500);
                }
            }, 30);

            return () => clearInterval(timer);
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-8"
        >
            {}
            <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden border-4 border-yellow-500"
                style={{ boxShadow: '0 0 30px rgba(234,179,8,0.4)' }}
            >
                <img
                    src="https://img.icons8.com/3d-fluency/94/robot-2.png"
                    alt="Quiz Master"
                    className="w-full h-full object-cover"
                />
            </motion.div>

            {}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md mx-auto mb-8 p-4 rounded-2xl relative"
                style={{
                    background: 'rgba(234, 179, 8, 0.1)',
                    border: '1px solid rgba(234, 179, 8, 0.3)'
                }}
            >
                <p className="text-slate-300 text-lg">{botMessage}</p>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rotate-45"
                    style={{ background: 'rgba(234, 179, 8, 0.1)', borderRight: '1px solid rgba(234, 179, 8, 0.3)', borderBottom: '1px solid rgba(234, 179, 8, 0.3)' }} />
            </motion.div>

            {}
            <AnimatePresence>
                {showOptions && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto"
                    >
                        {DIFFICULTIES.map((diff, idx) => (
                            <motion.button
                                key={diff.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ scale: 1.05, boxShadow: `0 0 30px ${diff.color}40` }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onSelect(diff.id)}
                                className="p-6 rounded-2xl text-center transition-all"
                                style={{
                                    background: `rgba(${diff.color === '#22c55e' ? '34,197,94' : diff.color === '#eab308' ? '234,179,8' : '239,68,68'},0.1)`,
                                    border: `2px solid ${diff.color}50`
                                }}
                            >
                                <span className="text-4xl mb-3 block">{diff.icon}</span>
                                <h3 className="font-bold text-xl mb-1" style={{ color: diff.color }}>{diff.name}</h3>
                                <p className="text-slate-500 text-sm">{diff.desc}</p>
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const PrizeLadder = ({ currentLevel }) => (
    <div className="hidden lg:block w-48 p-4 rounded-2xl h-fit"
        style={{ background: 'rgba(15,15,20,0.95)', border: '1px solid rgba(234,179,8,0.2)' }}>
        <h4 className="text-yellow-400 font-bold text-sm mb-3 text-center">Prize Ladder</h4>
        <div className="space-y-1">
            {PRIZE_LADDER.map((item) => (
                <div
                    key={item.level}
                    className={`flex justify-between items-center px-2 py-1 rounded text-xs transition-all ${item.level === currentLevel
                            ? 'bg-yellow-500 text-black font-bold'
                            : item.level < currentLevel
                                ? 'text-green-400'
                                : 'text-slate-500'
                        } ${item.isMilestone ? 'border-l-2 border-yellow-400' : ''}`}
                >
                    <span>Q{item.level}</span>
                    <span className="font-mono">{item.prize}</span>
                </div>
            ))}
        </div>
    </div>
);

const LifelineButton = ({ icon: Icon, name, used, onClick, disabled }) => (
    <motion.button
        whileHover={!used && !disabled ? { scale: 1.1 } : {}}
        whileTap={!used && !disabled ? { scale: 0.9 } : {}}
        onClick={onClick}
        disabled={used || disabled}
        className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${used ? 'opacity-30 cursor-not-allowed' : disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-500/10'
            }`}
        style={{ border: used ? '1px solid rgba(100,100,100,0.3)' : '1px solid rgba(234,179,8,0.3)' }}
    >
        <Icon size={24} className={used ? 'text-slate-600' : 'text-yellow-400'} />
        <span className={`text-xs ${used ? 'text-slate-600' : 'text-slate-400'}`}>{name}</span>
    </motion.button>
);

const MillionaireTrivia = ({ onExit, onChakraEarned }) => {
    const [gameState, setGameState] = useState('difficulty'); 
    const [difficulty, setDifficulty] = useState(null);
    const [currentLevel, setCurrentLevel] = useState(1);
    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [lifelines, setLifelines] = useState({ fifty: false, phone: false, audience: false });
    const [hiddenOptions, setHiddenOptions] = useState([]);
    const [audienceVotes, setAudienceVotes] = useState(null);
    const [phoneHint, setPhoneHint] = useState(null);
    const [totalChakra, setTotalChakra] = useState(0);
    const [isMuted, setIsMuted] = useState(false);

    const startGame = async (selectedDifficulty) => {
        setDifficulty(selectedDifficulty);
        setGameState('playing');
        setCurrentLevel(1);
        await loadQuestion(selectedDifficulty, 1);
    };

    const loadQuestion = async (diff, level) => {
        setLoading(true);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setShowResult(false);
        setHiddenOptions([]);
        setAudienceVotes(null);
        setPhoneHint(null);

        try {
            const q = await generateTriviaQuestion('anime', diff);
            setQuestion(q);
        } catch (error) {
            
            setQuestion({
                question: "Which anime is known for the phrase 'Plus Ultra'?",
                options: ["My Hero Academia", "Naruto", "Dragon Ball", "One Piece"],
                correct: 0
            });
        }
        setLoading(false);
    };

    const submitAnswer = async (idx) => {
        if (selectedAnswer !== null || loading) return;

        setSelectedAnswer(idx);

        await new Promise(r => setTimeout(r, 1500));

        const correct = idx === question?.correct;
        setIsCorrect(correct);
        setShowResult(true);

        if (correct) {
            const prizeInfo = PRIZE_LADDER.find(p => p.level === currentLevel);
            const chakraEarned = parseInt(prizeInfo?.prize.replace(/,/g, '') || '100');
            setTotalChakra(chakraEarned);

            if (currentLevel === 15) {
                
                setGameState('won');
                onChakraEarned?.(chakraEarned);
            } else {
                
                setTimeout(() => {
                    setCurrentLevel(prev => prev + 1);
                    loadQuestion(difficulty, currentLevel + 1);
                }, 2000);
            }
        } else {
            
            setTimeout(() => {
                setGameState('lost');
                
                const safeHaven = PRIZE_LADDER.find(p => p.isMilestone && p.level < currentLevel);
                if (safeHaven) {
                    const safeChakra = parseInt(safeHaven.prize.replace(/,/g, '') || '0');
                    setTotalChakra(safeChakra);
                    onChakraEarned?.(safeChakra);
                }
            }, 2000);
        }
    };

    const useFiftyFifty = () => {
        if (lifelines.fifty || !question) return;
        setLifelines(prev => ({ ...prev, fifty: true }));

        const correctIdx = question.correct;
        const wrongIndexes = [0, 1, 2, 3].filter(i => i !== correctIdx);
        const toHide = wrongIndexes.sort(() => Math.random() - 0.5).slice(0, 2);
        setHiddenOptions(toHide);
    };

    const usePhoneAFriend = () => {
        if (lifelines.phone || !question) return;
        setLifelines(prev => ({ ...prev, phone: true }));

        const isAccurate = Math.random() < 0.8;
        const hintIdx = isAccurate ? question.correct : [0, 1, 2, 3].filter(i => i !== question.correct)[Math.floor(Math.random() * 3)];
        setPhoneHint({
            message: `"I'm ${isAccurate ? 'pretty sure' : 'not certain, but I think'} it's ${String.fromCharCode(65 + hintIdx)}..."`,
            confidence: isAccurate ? 'high' : 'low'
        });
    };

    const useAskAudience = () => {
        if (lifelines.audience || !question) return;
        setLifelines(prev => ({ ...prev, audience: true }));

        const correctIdx = question.correct;
        const votes = [0, 0, 0, 0];
        let remaining = 100;

        votes[correctIdx] = 40 + Math.floor(Math.random() * 30);
        remaining -= votes[correctIdx];

        [0, 1, 2, 3].filter(i => i !== correctIdx).forEach((i, idx, arr) => {
            if (idx === arr.length - 1) {
                votes[i] = remaining;
            } else {
                const v = Math.floor(Math.random() * remaining * 0.7);
                votes[i] = v;
                remaining -= v;
            }
        });

        setAudienceVotes(votes);
    };

    const walkAway = () => {
        onChakraEarned?.(totalChakra);
        setGameState('lost');
    };

    return (
        <div className="min-h-[600px] p-4">
            {}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={onExit}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Exit</span>
                </button>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'rgba(234,179,8,0.1)' }}>
                        <Trophy size={18} className="text-yellow-400" />
                        <span className="text-yellow-400 font-bold">{totalChakra.toLocaleString()} Chakra</span>
                    </div>
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-2 rounded-lg hover:bg-white/10 text-slate-400"
                    >
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                </div>
            </div>

            {}
            <AnimatePresence mode="wait">
                {gameState === 'difficulty' && (
                    <DifficultyBot visible={true} onSelect={startGame} />
                )}
            </AnimatePresence>

            {}
            {gameState === 'playing' && (
                <div className="flex gap-6">
                    {}
                    <PrizeLadder currentLevel={currentLevel} />

                    {}
                    <div className="flex-1">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-12 h-12 rounded-full border-2 border-yellow-500/30 border-t-yellow-500 animate-spin" />
                                    <p className="text-slate-400">Loading question...</p>
                                </div>
                            </div>
                        ) : question && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {}
                                <div className="text-center mb-6">
                                    <span className="text-yellow-400 text-sm font-bold">Question {currentLevel} of 15</span>
                                    <div className="text-2xl font-bold text-white mt-1">
                                        For <span className="text-yellow-400">{PRIZE_LADDER.find(p => p.level === currentLevel)?.prize}</span> Chakra
                                    </div>
                                </div>

                                {}
                                <div
                                    className="p-6 rounded-2xl mb-6 text-center"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(0,50,100,0.8), rgba(0,30,60,0.9))',
                                        border: '3px solid rgba(100,200,255,0.3)',
                                        boxShadow: '0 0 30px rgba(0,100,200,0.2)'
                                    }}
                                >
                                    <p className="text-xl md:text-2xl font-medium text-white leading-relaxed">
                                        {question.question}
                                    </p>
                                </div>

                                {}
                                {phoneHint && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="mb-4 p-4 rounded-xl flex items-center gap-3"
                                        style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)' }}
                                    >
                                        <Phone size={20} className="text-purple-400" />
                                        <p className="text-purple-300">{phoneHint.message}</p>
                                    </motion.div>
                                )}

                                {}
                                {audienceVotes && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="mb-4 p-4 rounded-xl"
                                        style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}
                                    >
                                        <div className="flex items-center gap-2 mb-3">
                                            <Users size={18} className="text-green-400" />
                                            <span className="text-green-400 font-medium">Audience Says:</span>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2">
                                            {audienceVotes.map((vote, idx) => (
                                                <div key={idx} className="text-center">
                                                    <div className="h-16 bg-slate-800 rounded-lg relative overflow-hidden">
                                                        <motion.div
                                                            initial={{ height: 0 }}
                                                            animate={{ height: `${vote}%` }}
                                                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                                                            className="absolute bottom-0 left-0 right-0 bg-green-500"
                                                        />
                                                    </div>
                                                    <span className="text-white font-bold">{String.fromCharCode(65 + idx)}</span>
                                                    <span className="text-slate-400 text-xs ml-1">{vote}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                    {question.options.map((option, idx) => {
                                        const isHidden = hiddenOptions.includes(idx);
                                        const isSelected = selectedAnswer === idx;
                                        const showCorrect = showResult && idx === question.correct;
                                        const showWrong = showResult && isSelected && !isCorrect;

                                        return (
                                            <motion.button
                                                key={idx}
                                                whileHover={!selectedAnswer && !isHidden ? { scale: 1.02 } : {}}
                                                whileTap={!selectedAnswer && !isHidden ? { scale: 0.98 } : {}}
                                                onClick={() => !isHidden && submitAnswer(idx)}
                                                disabled={selectedAnswer !== null || isHidden}
                                                className={`p-4 rounded-xl text-left flex items-center gap-3 transition-all ${isHidden ? 'opacity-20 cursor-not-allowed' :
                                                        showCorrect ? 'bg-green-500/30 border-green-500' :
                                                            showWrong ? 'bg-red-500/30 border-red-500' :
                                                                isSelected ? 'bg-yellow-500/30 border-yellow-500' :
                                                                    'hover:bg-white/5'
                                                    }`}
                                                style={{
                                                    background: isHidden ? 'rgba(50,50,50,0.5)' :
                                                        showCorrect ? 'rgba(34,197,94,0.2)' :
                                                            showWrong ? 'rgba(239,68,68,0.2)' :
                                                                isSelected ? 'rgba(234,179,8,0.2)' :
                                                                    'linear-gradient(135deg, rgba(0,50,100,0.6), rgba(0,30,60,0.7))',
                                                    border: `2px solid ${showCorrect ? '#22c55e' : showWrong ? '#ef4444' : isSelected ? '#eab308' : 'rgba(100,200,255,0.3)'}`
                                                }}
                                            >
                                                <span
                                                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0"
                                                    style={{ background: 'rgba(0,0,0,0.3)' }}
                                                >
                                                    {String.fromCharCode(65 + idx)}
                                                </span>
                                                <span className="text-white font-medium">{option}</span>
                                                {showCorrect && <CheckCircle className="ml-auto text-green-400" size={24} />}
                                                {showWrong && <XCircle className="ml-auto text-red-400" size={24} />}
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                {}
                                <div className="flex items-center justify-center gap-4">
                                    <LifelineButton
                                        icon={Zap}
                                        name="50:50"
                                        used={lifelines.fifty}
                                        disabled={selectedAnswer !== null}
                                        onClick={useFiftyFifty}
                                    />
                                    <LifelineButton
                                        icon={Phone}
                                        name="Phone"
                                        used={lifelines.phone}
                                        disabled={selectedAnswer !== null}
                                        onClick={usePhoneAFriend}
                                    />
                                    <LifelineButton
                                        icon={Users}
                                        name="Audience"
                                        used={lifelines.audience}
                                        disabled={selectedAnswer !== null}
                                        onClick={useAskAudience}
                                    />

                                    <div className="w-px h-10 bg-slate-700 mx-2" />

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={walkAway}
                                        className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm hover:bg-slate-700"
                                    >
                                        Walk Away
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            )}

            {}
            {gameState === 'won' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                >
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                        transition={{ duration: 0.5, repeat: 3 }}
                    >
                        <Crown size={80} className="mx-auto text-yellow-400 mb-6" />
                    </motion.div>
                    <h2 className="text-4xl font-black text-yellow-400 mb-4">MILLIONAIRE!</h2>
                    <p className="text-2xl text-white mb-2">You won 1,000,000 Chakra!</p>
                    <p className="text-slate-400 mb-8">You are a true anime master!</p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onExit}
                        className="px-8 py-4 rounded-xl font-bold text-black"
                        style={{ background: 'linear-gradient(135deg, #eab308, #ca8a04)' }}
                    >
                        Claim Your Prize
                    </motion.button>
                </motion.div>
            )}

            {}
            {gameState === 'lost' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                >
                    <Trophy size={60} className="mx-auto text-slate-500 mb-6" />
                    <h2 className="text-3xl font-bold text-white mb-4">Game Over</h2>
                    <p className="text-xl text-slate-300 mb-2">
                        You earned <span className="text-yellow-400 font-bold">{totalChakra.toLocaleString()}</span> Chakra
                    </p>
                    <p className="text-slate-500 mb-8">Better luck next time, warrior!</p>
                    <div className="flex gap-4 justify-center">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setGameState('difficulty');
                                setLifelines({ fifty: false, phone: false, audience: false });
                                setTotalChakra(0);
                                setCurrentLevel(1);
                            }}
                            className="px-8 py-4 rounded-xl font-bold text-black"
                            style={{ background: 'linear-gradient(135deg, #eab308, #ca8a04)' }}
                        >
                            Play Again
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onExit}
                            className="px-8 py-4 rounded-xl font-bold text-yellow-400"
                            style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)' }}
                        >
                            Exit
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default MillionaireTrivia;
