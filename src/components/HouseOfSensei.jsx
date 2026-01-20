import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle, X, Minimize2, Maximize2, Send,
    Sparkles, HelpCircle, Zap, Brain, Volume2, VolumeX,
    ChevronDown, Settings, ChevronUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { generateAIResponse } from '../utils/gemini';

const IDLE_THRESHOLD = 600000; 

const SENSEI_PERSONALITY = `You are "House of Sensei", the wise and friendly AI guide of Nakama Network - an anime community platform. 
You speak with the wisdom of a seasoned anime master, occasionally using Japanese honorifics.
You're enthusiastic about anime, slightly humorous, and always helpful.
Keep responses concise (under 100 words) unless asked for details.
You can help with: anime recommendations, battle analysis, trivia, platform navigation, and general anime questions.`;

const CONTEXT_PROMPTS = {
    homepage: "The user is on the homepage. You can suggest exploring battles, trivia, or trending content.",
    arena: "The user is in the Arena. Help them with battles, debates, or trivia questions.",
    trivia: "The user is playing trivia. Offer hints if asked, or encourage their progress.",
    oracle: "The user is with The Oracle. Help with anime recommendations.",
    globalMedia: "The user is in Global Media. Help them share, upload, or discover content.",
    characters: "The user is browsing characters. Provide character info or comparisons.",
    tiering: "The user is in the Tiering System. Explain power levels and scaling.",
    memes: "The user is in Meme Corner. Help with meme sharing and discovery.",
    profile: "The user is viewing their profile. Help with settings or achievements.",
    clan: "The user is viewing clans. Help with clan info or joining/creating.",
    default: "Help the user navigate Nakama Network and discover anime content."
};

const IDLE_MESSAGES = [
    "Hey there! You've been quiet for a while... Want me to suggest something fun? 🎭",
    "Sensei notices you're taking an extended break. Need some anime recommendations?",
    "Bored? Let me challenge you to a quick trivia question! 🧠",
    "The Arena awaits, young warrior! Shall I guide you to a battle?",
    "I sense hesitation... Would you like to explore something new?",
    "Your chakra seems low. Want me to suggest an exciting activity?"
];

const HouseOfSensei = ({ currentPage = 'homepage' }) => {
    const { userProfile, currentUser } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isPeeking, setIsPeeking] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true); 
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [lastActivity, setLastActivity] = useState(Date.now());
    const [hasAskedIfBored, setHasAskedIfBored] = useState(false);
    const [position, setPosition] = useState({ x: null, y: null }); 
    const [isMobile, setIsMobile] = useState(false);

    const messagesEndRef = useRef(null);
    const idleTimerRef = useRef(null);
    const dragRef = useRef(null);

    const userName = userProfile?.displayName || currentUser?.displayName || 'Warrior';

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const updateActivity = useCallback(() => {
        setLastActivity(Date.now());
        setHasAskedIfBored(false);
        setIsPeeking(false);
    }, []);

    useEffect(() => {
        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

        events.forEach(event => {
            window.addEventListener(event, updateActivity, { passive: true });
        });

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, updateActivity);
            });
        };
    }, [updateActivity]);

    useEffect(() => {
        idleTimerRef.current = setInterval(() => {
            const idleTime = Date.now() - lastActivity;

            if (idleTime >= IDLE_THRESHOLD && !hasAskedIfBored && !isOpen) {
                setIsPeeking(true);
                setHasAskedIfBored(true);

                setTimeout(() => {
                    if (!isOpen) {
                        const randomMessage = IDLE_MESSAGES[Math.floor(Math.random() * IDLE_MESSAGES.length)];
                        setMessages(prev => [...prev, {
                            role: 'sensei',
                            content: randomMessage,
                            timestamp: Date.now()
                        }]);
                        setIsOpen(true);
                        setIsCollapsed(false);
                        setIsPeeking(false);
                    }
                }, 1500);
            }
        }, 5000); 

        return () => clearInterval(idleTimerRef.current);
    }, [lastActivity, hasAskedIfBored, isOpen]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                role: 'sensei',
                content: `Greetings, ${userName}! I am Sensei, your guide through Nakama Network. How may I assist you today? 🎌`,
                timestamp: Date.now()
            }]);
        }
    }, [isOpen, messages.length, userName]);

    const sendMessage = async () => {
        if (!inputValue.trim() || isTyping) return;

        const userMessage = inputValue.trim();
        setInputValue('');

        setMessages(prev => [...prev, {
            role: 'user',
            content: userMessage,
            timestamp: Date.now()
        }]);

        setIsTyping(true);

        try {
            const context = `${SENSEI_PERSONALITY}\n\nCurrent context: ${CONTEXT_PROMPTS[currentPage] || CONTEXT_PROMPTS.default}\nUser's name: ${userName}`;

            const response = await generateAIResponse(userMessage, context);

            setMessages(prev => [...prev, {
                role: 'sensei',
                content: response,
                timestamp: Date.now()
            }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'sensei',
                content: "Forgive me, my connection to the knowledge dimension flickered. Please try again.",
                timestamp: Date.now()
            }]);
        }

        setIsTyping(false);
    };

    const quickActions = [
        { label: '🎮 Battle', action: '/arena' },
        { label: '🧠 Trivia', action: '/arena?tab=trivia' },
        { label: '🎯 Recommend', action: 'recommend' },
        { label: '❓ Help', action: 'help' }
    ];

    const handleQuickAction = (action) => {
        if (action.startsWith('/')) {
            window.location.href = action;
        } else if (action === 'recommend') {
            setInputValue("Recommend me an anime");
            setTimeout(() => sendMessage(), 100);
        } else if (action === 'help') {
            setInputValue("What can you help me with?");
            setTimeout(() => sendMessage(), 100);
        }
    };

    const getPosition = () => {
        if (isMobile) {
            return {
                bottom: isOpen && !isCollapsed ? '0' : '70px', 
                right: '0',
                left: isOpen && !isCollapsed ? '0' : 'auto',
            };
        }
        return {
            bottom: '24px',
            right: '24px'
        };
    };

    const positionStyle = getPosition();

    return (
        <>
            {}
            <AnimatePresence>
                {isPeeking && !isOpen && (
                    <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 100, opacity: 0 }}
                        className="fixed z-40"
                        style={{ bottom: isMobile ? '80px' : '100px', right: '16px' }}
                    >
                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="relative"
                        >
                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-3 border-yellow-500 shadow-lg cursor-pointer"
                                onClick={() => { setIsOpen(true); setIsCollapsed(false); setIsPeeking(false); }}>
                                <img
                                    src="https://img.icons8.com/3d-fluency/94/robot-2.png"
                                    alt="Sensei"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                                <span className="text-white text-xs font-bold">!</span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {}
            {!isOpen && !isPeeking && (
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setIsOpen(true); setIsCollapsed(false); }}
                    className="fixed z-40 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-lg"
                    style={{
                        bottom: isMobile ? '80px' : '24px',
                        right: '16px',
                        background: 'linear-gradient(135deg, #eab308, #ca8a04)',
                        boxShadow: '0 4px 20px rgba(234, 179, 8, 0.4)'
                    }}
                >
                    <Brain className="text-black" size={isMobile ? 20 : 24} />
                </motion.button>
            )}

            {}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className={`fixed z-40 ${isMobile && !isCollapsed ? 'inset-x-0 bottom-0' : ''}`}
                        style={!isMobile || isCollapsed ? {
                            bottom: positionStyle.bottom,
                            right: positionStyle.right,
                            width: isMinimized ? 'auto' : isMobile ? 'calc(100% - 32px)' : '360px',
                            maxWidth: '100%'
                        } : {}}
                    >
                        <div
                            className={`overflow-hidden shadow-2xl ${isMobile && !isCollapsed ? 'rounded-t-2xl' : 'rounded-2xl'}`}
                            style={{
                                background: 'rgba(10, 10, 15, 0.98)',
                                border: '1px solid rgba(234, 179, 8, 0.3)',
                                backdropFilter: 'blur(20px)',
                                maxHeight: isMobile ? '70vh' : '500px'
                            }}
                        >
                            {}
                            <div
                                className="p-3 md:p-4 flex items-center justify-between cursor-pointer"
                                style={{ background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2), transparent)' }}
                                onClick={() => isMobile && setIsCollapsed(!isCollapsed)}
                            >
                                <div className="flex items-center gap-2 md:gap-3">
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-yellow-500">
                                        <img
                                            src="https://img.icons8.com/3d-fluency/94/robot-2.png"
                                            alt="Sensei"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-sm flex items-center gap-1">
                                            Sensei
                                            <Sparkles size={12} className="text-yellow-400" />
                                        </h3>
                                        <p className="text-xs text-green-400">● Online</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 md:gap-2">
                                    {isMobile && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setIsCollapsed(!isCollapsed); }}
                                            className="p-2 rounded-lg hover:bg-white/10 text-slate-400"
                                        >
                                            {isCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>
                                    )}
                                    {!isMobile && (
                                        <>
                                            <button
                                                onClick={() => setIsMuted(!isMuted)}
                                                className="p-2 rounded-lg hover:bg-white/10 text-slate-400"
                                            >
                                                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                            </button>
                                            <button
                                                onClick={() => setIsMinimized(!isMinimized)}
                                                className="p-2 rounded-lg hover:bg-white/10 text-slate-400"
                                            >
                                                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                                        className="p-2 rounded-lg hover:bg-white/10 text-slate-400"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>

                            {}
                            {!isMinimized && !isCollapsed && (
                                <>
                                    <div className="h-56 md:h-72 overflow-y-auto p-3 md:p-4 space-y-3 scrollbar-thin">
                                        {messages.map((msg, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[85%] p-2.5 md:p-3 rounded-2xl ${msg.role === 'user'
                                                        ? 'bg-yellow-500/20 text-white rounded-br-sm'
                                                        : 'bg-slate-800 text-slate-200 rounded-bl-sm'
                                                        }`}
                                                >
                                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                                </div>
                                            </motion.div>
                                        ))}

                                        {isTyping && (
                                            <div className="flex justify-start">
                                                <div className="bg-slate-800 p-3 rounded-2xl rounded-bl-sm">
                                                    <div className="flex gap-1">
                                                        {[0, 1, 2].map(i => (
                                                            <div
                                                                key={i}
                                                                className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"
                                                                style={{ animationDelay: `${i * 0.1}s` }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div ref={messagesEndRef} />
                                    </div>

                                    {}
                                    <div className="px-3 md:px-4 pb-2 flex gap-2 overflow-x-auto hide-scrollbar">
                                        {quickActions.map((action, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleQuickAction(action.action)}
                                                className="px-3 py-1.5 rounded-full bg-slate-800 text-xs text-slate-300 whitespace-nowrap hover:bg-slate-700 transition-colors"
                                            >
                                                {action.label}
                                            </button>
                                        ))}
                                    </div>

                                    {}
                                    <div className="p-3 md:p-4 border-t border-slate-800">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                                placeholder="Ask Sensei..."
                                                className="flex-1 px-3 md:px-4 py-2 md:py-2.5 rounded-xl bg-slate-800 text-white text-sm placeholder-slate-500 outline-none focus:ring-2 ring-yellow-500/50"
                                            />
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={sendMessage}
                                                disabled={isTyping || !inputValue.trim()}
                                                className="p-2 md:p-2.5 rounded-xl bg-yellow-500 text-black disabled:opacity-50"
                                            >
                                                <Send size={18} />
                                            </motion.button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default HouseOfSensei;
