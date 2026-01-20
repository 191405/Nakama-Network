import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { Sword, Zap, History, Bot, Crown, Users, Brain, Scale, MessageSquare, Gavel, Flame } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToActiveBattles, createBattlePoll } from '../utils/firebase';
import { generateTriviaQuestion } from '../utils/gemini';
import { jikanAPI } from '../utils/animeDataAPIs';
import { getCharacterTier } from '../utils/tieringData';
import Comments from '../components/Comments';

const ArenaBot = ({ message, type = 'info' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="fixed bottom-6 right-6 z-50 flex items-end gap-3 max-w-sm"
  >
    <div className={`p-4 rounded-2xl rounded-br-none shadow-2xl backdrop-blur-md ${type === 'verdict' ? 'bg-yellow-900/90 border-yellow-500/50' : 'bg-slate-900/95 border-slate-700/50'
      } border`}>
      <div className={`font-bold text-xs mb-1 flex items-center gap-1 ${type === 'verdict' ? 'text-yellow-400' : 'text-yellow-400'}`}>
        {type === 'verdict' ? <Gavel size={12} /> : <Bot size={12} />}
        {type === 'verdict' ? 'AI JUDGE VERDICT' : 'ARENA MASTER'}
      </div>
      <p className="text-slate-200 text-sm leading-relaxed">{message}</p>
    </div>
    <div className="relative w-16 h-16 flex-shrink-0">
      <div className="absolute inset-0 bg-yellow-500/20 rounded-full animate-pulse" />
      <img src="https://img.icons8.com/3d-fluency/94/robot-2.png" alt="Bot" className="w-full h-full object-contain" />
    </div>
  </motion.div>
);

const PowerScalerResult = ({ character, analysis, loading }) => {
  const tier = character ? getCharacterTier(character.name, character.favorites) : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(15,15,20,0.95)', border: '1px solid rgba(202, 138, 4, 0.2)' }}
    >
      {loading ? (
        <div className="p-8 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-yellow-500/30 border-t-yellow-500 animate-spin mb-4" />
          <p className="text-slate-400">Analyzing power level...</p>
        </div>
      ) : character && tier ? (
        <>
          {}
          <div className="relative h-48 overflow-hidden">
            <img src={character.image} alt={character.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-xl font-black text-white">{character.name}</h3>
              <p className="text-sm text-slate-300">{character.anime}</p>
            </div>
            {}
            <div className={`absolute top-3 right-3 px-3 py-1 rounded-lg bg-gradient-to-r ${tier.color} text-white text-xs font-bold`}>
              TIER {tier.level}
            </div>
          </div>

          {}
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl bg-slate-800/50">
                <div className="text-xs text-yellow-400 font-bold">ATTACK POTENCY</div>
                <div className="text-white text-sm font-medium">{tier.name}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/50">
                <div className="text-xs text-blue-400 font-bold">SPEED</div>
                <div className="text-white text-sm font-medium">Relativistic+</div>
              </div>
            </div>
            {analysis && (
              <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <div className="text-xs text-yellow-400 font-bold mb-1">AI ANALYSIS</div>
                <p className="text-slate-300 text-sm">{analysis}</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="p-8 text-center">
          <Brain className="mx-auto mb-4 text-purple-400" size={48} />
          <p className="text-slate-400">Select a character to analyze</p>
        </div>
      )}
    </motion.div>
  );
};

const DebateCard = ({ side, character, argument, onArgumentChange, submitted, score }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`rounded-2xl overflow-hidden border-2 ${submitted && score ? (score > 50 ? 'border-yellow-500' : 'border-slate-600') : 'border-slate-700'
      }`}
    style={{ background: 'rgba(15,15,20,0.95)' }}
  >
    {}
    <div className={`p-4 bg-gradient-to-r ${side === 'left' ? 'from-blue-900/50' : 'from-red-900/50'} to-transparent`}>
      <div className="flex items-center gap-3">
        {character?.image && (
          <img src={character.image} alt={character.name} className="w-12 h-12 rounded-full object-cover" />
        )}
        <div>
          <h3 className="font-bold text-white">{character?.name || 'Loading...'}</h3>
          <p className="text-xs text-slate-400">{character?.anime || 'Unknown'}</p>
        </div>
      </div>
    </div>

    {}
    <div className="p-4">
      {!submitted ? (
        <>
          <label className="text-xs text-slate-500 font-bold mb-2 block">WHY WOULD {character?.name?.toUpperCase()} WIN?</label>
          <textarea
            value={argument}
            onChange={(e) => onArgumentChange(e.target.value)}
            placeholder="Write your argument using canon feats, scaling, and abilities..."
            className="w-full h-32 bg-slate-800 rounded-xl p-4 text-white text-sm border border-slate-700 focus:border-yellow-500 outline-none resize-none"
          />
        </>
      ) : (
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-slate-800/50">
            <p className="text-slate-300 text-sm italic">"{argument}"</p>
          </div>
          {score !== undefined && (
            <div className="flex items-center justify-center gap-2">
              <div className={`text-3xl font-black ${score > 50 ? 'text-yellow-400' : 'text-slate-400'}`}>{score}%</div>
              <div className="text-xs text-slate-500">ARGUMENT STRENGTH</div>
            </div>
          )}
        </div>
      )}
    </div>
  </motion.div>
);

const Arena = () => {
  const { userProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'battles';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [botMessage, setBotMessage] = useState("Welcome to the Arena, warrior! Choose your battleground.");
  const [botType, setBotType] = useState('info');

  const [activeBattle, setActiveBattle] = useState(null);
  const [loadingCharacters, setLoadingCharacters] = useState(true);

  const [debateChars, setDebateChars] = useState({ left: null, right: null });
  const [debateArgs, setDebateArgs] = useState({ left: '', right: '' });
  const [debateSubmitted, setDebateSubmitted] = useState(false);
  const [debateLoading, setDebateLoading] = useState(false);
  const [debateScores, setDebateScores] = useState({ left: 0, right: 0 });

  const [aiLoading, setAiLoading] = useState(false);
  const [aiCharacter1, setAiCharacter1] = useState(null);
  const [aiCharacter2, setAiCharacter2] = useState(null);
  const [aiAnalysis1, setAiAnalysis1] = useState(null);
  const [aiAnalysis2, setAiAnalysis2] = useState(null);
  const [aiVerdict, setAiVerdict] = useState(null);

  const [triviaQuestion, setTriviaQuestion] = useState(null);
  const [triviaAnswer, setTriviaAnswer] = useState(null);
  const [loadingTrivia, setLoadingTrivia] = useState(false);
  const [triviaScore, setTriviaScore] = useState(0);
  const [triviaStreak, setTriviaStreak] = useState(0);

  const tabs = [
    { id: 'battles', label: 'Feature Battle', icon: Sword, color: 'text-red-400' },
    { id: 'ai-tournament', label: 'AI Tournament', icon: Bot, color: 'text-purple-400' },
    { id: 'user-debate', label: 'User Debate', icon: MessageSquare, color: 'text-blue-400' },
    { id: 'trivia', label: 'Trivia', icon: Brain, color: 'text-green-400' },
    { id: 'history', label: 'History', icon: History, color: 'text-slate-400' }
  ];

  const battleCharacters = {
    left: activeBattle?.char1 || null,
    right: activeBattle?.char2 || null
  };

  const [battleHistory, setBattleHistory] = useState([]);

  const loadBattleCharacters = async () => {
    setLoadingCharacters(true);
    await createNewBattle();
  };

  useEffect(() => {
    loadDebateCharacters();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToActiveBattles((battles) => {
      if (battles.length > 0) {
        setActiveBattle(battles[0]); 
      } else {
        setActiveBattle(null);
      }
      setLoadingCharacters(false);
    });
    return () => unsubscribe();
  }, []);

  const createNewBattle = async () => {
    setLoadingCharacters(true);
    setBotMessage("Summoning new warriors for the arena...");
    try {
      const topChars = await jikanAPI.getTopCharacters(25);
      if (topChars && topChars.length >= 2) {
        const shuffled = [...topChars].sort(() => Math.random() - 0.5);
        const char1 = { name: shuffled[0].name, image: shuffled[0].images?.jpg?.image_url, anime: shuffled[0].anime?.[0]?.anime?.title || 'Unknown' };
        const char2 = { name: shuffled[1].name, image: shuffled[1].images?.jpg?.image_url, anime: shuffled[1].anime?.[0]?.anime?.title || 'Unknown' };

        await createBattlePoll(char1, char2, 'random');
      }
    } catch (error) {
      console.error("Failed to create battle:", error);
      setBotMessage("The arena gates are jammed! Try again.");
    }
  };

  const loadDebateCharacters = async () => {
    try {
      const topChars = await jikanAPI.getTopCharacters(25);
      if (topChars && topChars.length >= 2) {
        const shuffled = [...topChars].sort(() => Math.random() - 0.5);
        setDebateChars({
          left: { name: shuffled[2]?.name, image: shuffled[2]?.images?.jpg?.image_url, anime: shuffled[2]?.anime?.[0]?.anime?.title || 'Unknown', favorites: shuffled[2]?.favorites },
          right: { name: shuffled[3]?.name, image: shuffled[3]?.images?.jpg?.image_url, anime: shuffled[3]?.anime?.[0]?.anime?.title || 'Unknown', favorites: shuffled[3]?.favorites }
        });
      }
    } catch (error) {
      setDebateChars({
        left: { name: 'Madara', image: 'https://cdn.myanimelist.net/images/characters/9/131317.jpg', anime: 'Naruto', favorites: 85000 },
        right: { name: 'Aizen', image: 'https://cdn.myanimelist.net/images/characters/2/284121.jpg', anime: 'Bleach', favorites: 80000 }
      });
    }
  };

  const runAITournament = async () => {
    setAiLoading(true);
    setBotMessage("Analyzing both fighters using canon data...");
    setBotType('info');

    try {
      const topChars = await jikanAPI.getTopCharacters(25);
      if (topChars && topChars.length >= 2) {
        const shuffled = [...topChars].sort(() => Math.random() - 0.5);
        const c1 = { name: shuffled[0].name, image: shuffled[0].images?.jpg?.image_url, anime: shuffled[0].anime?.[0]?.anime?.title || 'Unknown', favorites: shuffled[0].favorites };
        const c2 = { name: shuffled[1].name, image: shuffled[1].images?.jpg?.image_url, anime: shuffled[1].anime?.[0]?.anime?.title || 'Unknown', favorites: shuffled[1].favorites };

        setAiCharacter1(c1);
        setAiCharacter2(c2);

        await new Promise(r => setTimeout(r, 2000));

        const tier1 = getCharacterTier(c1.name, c1.favorites);
        const tier2 = getCharacterTier(c2.name, c2.favorites);

        setAiAnalysis1(`${c1.name} scales to ${tier1.name} level based on their feats. Their popularity (${(c1.favorites / 1000).toFixed(0)}K) suggests significant combat showings.`);
        setAiAnalysis2(`${c2.name} reaches ${tier2.name} tier. With ${(c2.favorites / 1000).toFixed(0)}K favorites, they have demonstrated notable abilities.`);

        const winner = tier1.level > tier2.level ? c1 : tier2.level > tier1.level ? c2 : (c1.favorites > c2.favorites ? c1 : c2);
        const loser = winner === c1 ? c2 : c1;

        setAiVerdict({
          winner: winner.name,
          loser: loser.name,
          reason: `Based on the standard tiering system, ${winner.name} operates at ${getCharacterTier(winner.name, winner.favorites).name} level, which outclasses ${loser.name}'s ${getCharacterTier(loser.name, loser.favorites).name} tier. ${winner.name} has superior feats and scaling that would allow them to overcome ${loser.name} in a direct confrontation.`
        });

        setBotMessage(`VERDICT: ${winner.name} wins this matchup!`);
        setBotType('verdict');
      }
    } catch (error) {
      console.error('AI Tournament error:', error);
    }
    setAiLoading(false);
  };

  const submitDebate = async () => {
    if (!debateArgs.left.trim() || !debateArgs.right.trim()) {
      setBotMessage("Both sides must present their arguments!");
      return;
    }

    setDebateLoading(true);
    setBotMessage("AI Judge is evaluating both arguments...");

    await new Promise(r => setTimeout(r, 2500));

    const scoreArg = (arg) => {
      let score = 50;
      if (arg.length > 100) score += 10;
      if (arg.length > 200) score += 10;
      if (arg.toLowerCase().includes('feat')) score += 5;
      if (arg.toLowerCase().includes('scaling')) score += 5;
      if (arg.toLowerCase().includes('tier')) score += 5;
      if (arg.toLowerCase().includes('power')) score += 3;
      if (arg.toLowerCase().includes('ability')) score += 3;
      return Math.min(score + Math.floor(Math.random() * 15), 100);
    };

    const leftScore = scoreArg(debateArgs.left);
    const rightScore = scoreArg(debateArgs.right);

    const total = leftScore + rightScore;
    setDebateScores({
      left: Math.round((leftScore / total) * 100),
      right: Math.round((rightScore / total) * 100)
    });

    setDebateSubmitted(true);
    setDebateLoading(false);

    const winner = leftScore > rightScore ? debateChars.left?.name : debateChars.right?.name;
    setBotMessage(`The AI Judge has ruled: ${winner}'s argument was more compelling!`);
    setBotType('verdict');
  };

  const loadTrivia = async () => {
    setLoadingTrivia(true);
    setTriviaAnswer(null);
    try {
      const question = await generateTriviaQuestion('anime');
      setTriviaQuestion(question);
      setBotMessage("Test your anime knowledge!");
      setBotType('info');
    } catch (error) {
      setTriviaQuestion({
        question: "Which anime features a character named Goku?",
        options: ["Dragon Ball", "Naruto", "One Piece", "Bleach"],
        correct: 0
      });
    }
    setLoadingTrivia(false);
  };

  const answerTrivia = (idx) => {
    setTriviaAnswer(idx);
    if (idx === triviaQuestion?.correct) {
      setTriviaScore(prev => prev + 100);
      setTriviaStreak(prev => prev + 1);
      setBotMessage(`CORRECT! +100 points! Streak: ${triviaStreak + 1} 🔥`);
    } else {
      setTriviaStreak(0);
      setBotMessage("Incorrect! Better luck next time.");
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-24 md:pb-8 px-4 relative z-20" style={{ background: '#050505' }}>
      <div className="max-w-7xl mx-auto">

        {}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <Flame className="text-orange-500 animate-pulse" size={20} />
            <span className="text-orange-500 text-sm font-bold uppercase tracking-widest">Battle Zone</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-black mb-3" style={{ color: '#eab308', textShadow: '0 0 40px rgba(234, 179, 8, 0.5)' }}>
            THE ARENA
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto">Compete, debate, and prove your power scaling mastery</p>

          {}
          <div className="mt-4 flex justify-center gap-3">
            <Link to="/tiering" className="px-4 py-2 rounded-xl bg-purple-500/20 text-purple-400 text-sm font-bold hover:bg-purple-500/30 transition-colors flex items-center gap-2">
              <Scale size={14} /> Tiering System
            </Link>
            <Link to="/characters" className="px-4 py-2 rounded-xl bg-blue-500/20 text-blue-400 text-sm font-bold hover:bg-blue-500/30 transition-colors flex items-center gap-2">
              <Users size={14} /> Character Database
            </Link>
          </div>
        </motion.div>

        {}
        <div className="flex justify-center mb-8 overflow-x-auto pb-2 hide-scrollbar">
          <div className="bg-slate-900/80 rounded-2xl p-1.5 inline-flex gap-1 border border-slate-800">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActiveTab(tab.id);
                  setBotType('info');
                  if (tab.id === 'trivia' && !triviaQuestion) loadTrivia();
                }}
                className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black' : 'text-slate-400 hover:text-white'
                  }`}
              >
                <tab.icon size={16} className={activeTab === tab.id ? '' : tab.color} />
                <span className="hidden sm:inline">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {}
        <AnimatePresence mode="wait">
          {}
          {activeTab === 'battles' && (
            <motion.div key="battles" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto relative">
                {}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="rounded-2xl overflow-hidden border-2 border-slate-700 cursor-pointer"
                  style={{ background: 'rgba(15,15,20,0.95)' }}
                >
                  <div className="h-64 relative">
                    {loadingCharacters ? (
                      <div className="w-full h-full bg-slate-800 animate-pulse" />
                    ) : (
                      <>
                        <img src={battleCharacters.left?.image} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                      </>
                    )}
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-bold text-white text-xl">{battleCharacters.left?.name}</h3>
                    <p className="text-slate-400 text-sm mb-4">{battleCharacters.left?.anime}</p>
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <span className="text-slate-300 text-xs uppercase tracking-wider">Power Level</span>
                      <div className="text-2xl font-black text-blue-400">9000+</div>
                    </div>
                  </div>
                </motion.div>

                {}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
                  <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center font-black text-xl text-black shadow-lg">
                    VS
                  </motion.div>
                </div>

                {}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="rounded-2xl overflow-hidden border-2 border-slate-700 cursor-pointer"
                  style={{ background: 'rgba(15,15,20,0.95)' }}
                >
                  <div className="h-64 relative">
                    {loadingCharacters ? (
                      <div className="w-full h-full bg-slate-800 animate-pulse" />
                    ) : (
                      <>
                        <img src={battleCharacters.right?.image} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                      </>
                    )}
                  </div>

                  <div className="p-4 text-center">
                    <h3 className="font-bold text-white text-xl">{battleCharacters.right?.name}</h3>
                    <p className="text-slate-400 text-sm mb-4">{battleCharacters.right?.anime}</p>
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <span className="text-slate-300 text-xs uppercase tracking-wider">Power Level</span>
                      <div className="text-2xl font-black text-red-400">9000+</div>
                    </div>
                  </div>
                </motion.div>

              </div>

              {}
              <div className="mt-8 max-w-4xl mx-auto rounded-2xl overflow-hidden" style={{ background: 'rgba(15,15,20,0.95)', border: '1px solid rgba(202, 138, 4, 0.2)' }}>
                <div className="p-4 border-b border-slate-800 bg-gradient-to-r from-yellow-500/10 to-transparent">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <MessageSquare className="text-yellow-500" size={22} />
                    Who Would Win? - Live Discussion
                  </h3>
                  <p className="text-slate-400 text-sm">Debate with the community in real-time!</p>
                </div>
                <div className="p-4">
                  <Comments
                    sectionId={`arena-battle-${activeBattle?.id || 'current'}`}
                    sectionLabel={`${battleCharacters.left?.name || 'Character 1'} vs ${battleCharacters.right?.name || 'Character 2'}`}
                    maxHeight="400px"
                  />
                </div>
              </div>

              {}
              <div className="p-4 mt-8 text-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={loadBattleCharacters}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold text-lg shadow-lg"
                >
                  <Zap className="inline mr-2" size={20} /> NEXT BATTLE
                </motion.button>
              </div>

              {}
              {!activeBattle && !loadingCharacters && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-8">
                  <div className="mb-4">
                    <Sword className="mx-auto text-slate-600 mb-2" size={48} />
                    <p className="text-slate-500">No active battles right now</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={loadBattleCharacters}
                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold text-lg"
                  >
                    <Zap className="inline mr-2" size={20} /> START NEW BATTLE
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}

          {}
          {activeTab === 'ai-tournament' && (
            <motion.div key="ai-tournament" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-black text-purple-400 mb-2">AI POWER SCALER</h2>
                  <p className="text-slate-500">The AI analyzes manga/anime feats and uses the tiering system to determine the winner</p>
                </div>

                {!aiCharacter1 && !aiLoading ? (
                  <div className="text-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={runAITournament}
                      className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg"
                    >
                      <Bot className="inline mr-2" size={20} /> START AI TOURNAMENT
                    </motion.button>
                  </div>
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <PowerScalerResult character={aiCharacter1} analysis={aiAnalysis1} loading={aiLoading} />
                      <PowerScalerResult character={aiCharacter2} analysis={aiAnalysis2} loading={aiLoading} />
                    </div>

                    {aiVerdict && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-6 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 text-center"
                      >
                        <Crown className="mx-auto mb-4 text-yellow-400" size={48} />
                        <h3 className="text-2xl font-black text-yellow-400 mb-2">VERDICT: {aiVerdict.winner} WINS</h3>
                        <p className="text-slate-300 max-w-2xl mx-auto">{aiVerdict.reason}</p>
                        <button onClick={() => { setAiCharacter1(null); setAiCharacter2(null); setAiVerdict(null); }} className="mt-4 px-6 py-2 rounded-xl bg-purple-600 text-white font-bold">
                          New Tournament
                        </button>
                      </motion.div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}

          {}
          {activeTab === 'user-debate' && (
            <motion.div key="user-debate" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-black text-blue-400 mb-2">USER DEBATE ARENA</h2>
                  <p className="text-slate-500">Write arguments for both sides. The AI Judge will evaluate reasoning quality!</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <DebateCard
                    side="left"
                    character={debateChars.left}
                    argument={debateArgs.left}
                    onArgumentChange={(val) => setDebateArgs(prev => ({ ...prev, left: val }))}
                    submitted={debateSubmitted}
                    score={debateScores.left}
                  />
                  <DebateCard
                    side="right"
                    character={debateChars.right}
                    argument={debateArgs.right}
                    onArgumentChange={(val) => setDebateArgs(prev => ({ ...prev, right: val }))}
                    submitted={debateSubmitted}
                    score={debateScores.right}
                  />
                </div>

                {!debateSubmitted ? (
                  <div className="text-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={submitDebate}
                      disabled={debateLoading}
                      className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-lg disabled:opacity-50"
                    >
                      {debateLoading ? 'AI Judge is thinking...' : <><Gavel className="inline mr-2" size={20} /> SUBMIT FOR JUDGMENT</>}
                    </motion.button>
                  </div>
                ) : (
                  <div className="text-center">
                    <button onClick={() => { setDebateSubmitted(false); setDebateArgs({ left: '', right: '' }); loadDebateCharacters(); }} className="px-6 py-2 rounded-xl bg-blue-600 text-white font-bold">
                      New Debate
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {}
          {activeTab === 'trivia' && (
            <motion.div key="trivia" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto">
              <div className="flex justify-center gap-6 mb-8">
                <div className="bg-slate-800/50 rounded-xl px-6 py-3 border border-slate-700">
                  <div className="text-3xl font-black text-yellow-400">{triviaScore}</div>
                  <div className="text-xs text-slate-500">POINTS</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl px-6 py-3 border border-slate-700">
                  <div className="text-3xl font-black text-orange-400">{triviaStreak}🔥</div>
                  <div className="text-xs text-slate-500">STREAK</div>
                </div>
              </div>

              <div className="bg-slate-900/80 rounded-2xl p-8 border border-slate-700">
                {loadingTrivia ? (
                  <div className="flex justify-center py-12">
                    <div className="w-12 h-12 rounded-full border-4 border-yellow-500/30 border-t-yellow-500 animate-spin" />
                  </div>
                ) : triviaQuestion ? (
                  <>
                    <h3 className="text-xl font-bold text-white mb-6 text-center">{triviaQuestion.question}</h3>
                    <div className="grid gap-3">
                      {triviaQuestion.options?.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => triviaAnswer === null && answerTrivia(idx)}
                          disabled={triviaAnswer !== null}
                          className={`w-full py-4 px-6 rounded-xl font-semibold text-left transition-all ${triviaAnswer === null ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600' :
                            idx === triviaQuestion.correct ? 'bg-green-500/20 text-green-400 border border-green-500' :
                              triviaAnswer === idx ? 'bg-red-500/20 text-red-400 border border-red-500' : 'bg-slate-800/50 text-slate-500 border border-slate-700'
                            }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    {triviaAnswer !== null && (
                      <button onClick={loadTrivia} className="w-full mt-6 py-4 rounded-xl bg-yellow-500 text-black font-bold">
                        NEXT QUESTION
                      </button>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="mx-auto mb-4 text-green-400" size={48} />
                    <button onClick={loadTrivia} className="px-6 py-3 rounded-xl bg-green-600 text-white font-bold">Start Trivia</button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {}
          {activeTab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="max-w-3xl mx-auto space-y-4">
                {battleHistory.map((battle, idx) => (
                  <motion.div
                    key={battle.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-slate-900/80 rounded-xl p-4 border border-slate-700 flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      {battle.type === 'ai' ? <Bot className="text-purple-400" size={20} /> : <Crown className="text-yellow-400" size={20} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-yellow-400">{battle.winner}</span>
                        <span className="text-slate-500">defeated</span>
                        <span className="font-bold text-slate-300">{battle.loser}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${battle.type === 'ai' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          {battle.type === 'ai' ? 'AI Judge' : 'User Discussion'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {battle.date}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {}
        <ArenaBot message={botMessage} type={botType} />
      </div >
    </div >
  );
};

export default Arena;
