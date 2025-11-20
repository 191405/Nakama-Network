import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sword, Trophy, Zap, Target, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getLeaderboard, recordBattleResult, addChakra } from '../utils/firebase';
import { generateTriviaQuestion } from '../utils/gemini';

const Arena = () => {
  const { userProfile, refreshUserProfile } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('duel'); // 'duel' or 'leaderboard'
  const [inBattle, setInBattle] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [battleResult, setBattleResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState({ wins: 0, losses: 0 });

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    const data = await getLeaderboard(10);
    setLeaderboard(data);
  };

  const startBattle = async () => {
    setLoading(true);
    setInBattle(true);
    setShowResult(false);
    setSelectedAnswer(null);
    
    const question = await generateTriviaQuestion('medium');
    setCurrentQuestion(question);
    setLoading(false);
  };

  const handleAnswerSelect = async (answer) => {
    if (showResult) return;
    
    setSelectedAnswer(answer);
    setShowResult(true);
    
    const isCorrect = answer === currentQuestion.correct;
    setBattleResult(isCorrect ? 'victory' : 'defeat');
    
    // Update Firebase
    await recordBattleResult(userProfile.id, isCorrect);
    await refreshUserProfile();
    
    // Update local score
    setScore(prev => ({
      wins: isCorrect ? prev.wins + 1 : prev.wins,
      losses: isCorrect ? prev.losses : prev.losses + 1
    }));
    
    // Reload leaderboard
    await loadLeaderboard();
  };

  const getRankColor = (rank) => {
    const rankColors = {
      'Immortal': 'from-purple-500 via-pink-500 to-red-500',
      'God Level User': 'from-yellow-400 via-orange-500 to-red-500',
      'Global Ranker': 'from-blue-400 via-cyan-500 to-teal-500',
      'Sage Mode': 'from-green-400 via-emerald-500 to-teal-500',
      'Berserker': 'from-red-500 via-orange-500 to-yellow-500',
      'Diamond Badge User': 'from-cyan-300 via-blue-400 to-indigo-500',
      'Golden Badge User': 'from-yellow-300 via-yellow-500 to-amber-500',
      'Silver Badge User': 'from-gray-300 via-gray-400 to-gray-500',
      'Bronze Badge User': 'from-orange-300 via-amber-500 to-orange-600',
      'Ranked': 'from-neon-blue to-neon-purple',
      'Unranked': 'from-gray-400 to-gray-600',
      'User': 'from-gray-500 to-gray-700',
      'Mere User': 'from-gray-600 to-gray-800',
    };
    return rankColors[rank] || 'from-gray-600 to-gray-800';
  };

  return (
    <div className="min-h-screen pt-20 pb-24 md:pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="neon-text">The Arena</span>
          </h1>
          <p className="text-gray-400 font-mono">Battle the AI and Prove Your Worth</p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="glass-panel rounded-xl p-1 inline-flex border border-neon-blue/30">
            <button
              onClick={() => setActiveTab('duel')}
              className={`
                px-6 py-3 rounded-lg font-bold transition-all flex items-center space-x-2
                ${activeTab === 'duel' 
                  ? 'bg-neon-blue text-white' 
                  : 'text-gray-400 hover:text-neon-blue'
                }
              `}
            >
              <Sword size={20} />
              <span>Duel Arena</span>
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`
                px-6 py-3 rounded-lg font-bold transition-all flex items-center space-x-2
                ${activeTab === 'leaderboard' 
                  ? 'bg-neon-purple text-white' 
                  : 'text-gray-400 hover:text-neon-purple'
                }
              `}
            >
              <Trophy size={20} />
              <span>Leaderboard</span>
            </button>
          </div>
        </div>

        {/* Duel Arena Tab */}
        {activeTab === 'duel' && (
          <div className="max-w-4xl mx-auto">
            {!inBattle ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel rounded-2xl p-12 text-center border border-neon-blue/30"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-neon-blue via-neon-purple to-neon-pink rounded-full flex items-center justify-center"
                >
                  <Sword size={64} className="text-white" />
                </motion.div>

                <h2 className="text-3xl font-bold mb-4">Ready for Battle?</h2>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  Face the AI in hardcore anime trivia. Each victory grants you <span className="text-neon-purple font-bold">+50 Chakra</span> and updates your rank in real-time!
                </p>

                <div className="grid grid-cols-3 gap-4 mb-8 max-w-md mx-auto">
                  <div className="glass-panel p-4 rounded-xl border border-neon-blue/20">
                    <div className="text-2xl font-bold text-green-400">{userProfile?.totalWins || 0}</div>
                    <div className="text-xs text-gray-400">Victories</div>
                  </div>
                  <div className="glass-panel p-4 rounded-xl border border-neon-purple/20">
                    <div className="text-2xl font-bold text-neon-purple">{userProfile?.chakra || 0}</div>
                    <div className="text-xs text-gray-400">Chakra</div>
                  </div>
                  <div className="glass-panel p-4 rounded-xl border border-neon-pink/20">
                    <div className="text-2xl font-bold text-orange-400">{userProfile?.streak || 0}🔥</div>
                    <div className="text-xs text-gray-400">Streak</div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startBattle}
                  disabled={loading}
                  className="px-8 py-4 bg-gradient-to-r from-neon-blue to-neon-purple rounded-xl font-bold text-lg cyber-button disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Start Duel'}
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel rounded-2xl p-8 border border-neon-blue/30"
              >
                {loading ? (
                  <div className="text-center py-12">
                    <div className="loading-spinner mx-auto mb-4"></div>
                    <p className="text-gray-400">Generating question...</p>
                  </div>
                ) : currentQuestion && (
                  <>
                    {/* Question Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <Target className="text-neon-blue" size={24} />
                        <span className="text-lg font-bold text-neon-blue">Trivia Challenge</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        Session: {score.wins}W - {score.losses}L
                      </div>
                    </div>

                    {/* Question */}
                    <div className="mb-8">
                      <h3 className="text-2xl font-bold mb-4">{currentQuestion.question}</h3>
                    </div>

                    {/* Answer Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {Object.entries(currentQuestion.options).map(([key, value]) => {
                        const isSelected = selectedAnswer === key;
                        const isCorrect = key === currentQuestion.correct;
                        const showCorrect = showResult && isCorrect;
                        const showWrong = showResult && isSelected && !isCorrect;

                        return (
                          <motion.button
                            key={key}
                            whileHover={{ scale: showResult ? 1 : 1.02 }}
                            whileTap={{ scale: showResult ? 1 : 0.98 }}
                            onClick={() => handleAnswerSelect(key)}
                            disabled={showResult}
                            className={`
                              p-4 rounded-xl font-bold text-left transition-all border-2
                              ${showCorrect 
                                ? 'bg-green-500/20 border-green-500 text-green-400' 
                                : showWrong 
                                ? 'bg-red-500/20 border-red-500 text-red-400'
                                : isSelected
                                ? 'bg-neon-blue/20 border-neon-blue'
                                : 'bg-void-gray/50 border-void-gray hover:border-neon-purple/50'
                              }
                              disabled:cursor-not-allowed
                            `}
                          >
                            <span className="text-neon-blue mr-2">{key}:</span>
                            {value}
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Result */}
                    {showResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`
                          p-6 rounded-xl border-2 mb-6
                          ${battleResult === 'victory' 
                            ? 'bg-green-500/10 border-green-500' 
                            : 'bg-red-500/10 border-red-500'
                          }
                        `}
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          {battleResult === 'victory' ? (
                            <>
                              <Trophy className="text-green-400" size={32} />
                              <div>
                                <h4 className="text-2xl font-bold text-green-400">Victory!</h4>
                                <p className="text-sm text-gray-400">+50 Chakra earned</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <Sword className="text-red-400" size={32} />
                              <div>
                                <h4 className="text-2xl font-bold text-red-400">Defeat</h4>
                                <p className="text-sm text-gray-400">Better luck next time</p>
                              </div>
                            </>
                          )}
                        </div>
                        
                        <div className="pt-3 border-t border-gray-700">
                          <p className="text-sm text-gray-300">
                            <span className="font-bold text-neon-blue">Explanation:</span> {currentQuestion.explanation}
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={startBattle}
                        disabled={!showResult}
                        className="flex-1 py-3 bg-gradient-to-r from-neon-blue to-neon-purple rounded-xl font-bold cyber-button disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next Question
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setInBattle(false);
                          setScore({ wins: 0, losses: 0 });
                        }}
                        className="px-6 py-3 bg-red-500/20 text-red-400 border border-red-500/50 rounded-xl font-bold hover:bg-red-500/30 transition-colors"
                      >
                        End Session
                      </motion.button>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto glass-panel rounded-2xl p-8 border border-neon-purple/30"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Trophy className="text-neon-purple" size={32} />
                <h2 className="text-3xl font-bold text-neon-purple">Global Rankings</h2>
              </div>
              <button
                onClick={loadLeaderboard}
                className="px-4 py-2 bg-neon-purple/20 hover:bg-neon-purple/30 rounded-lg text-sm transition-colors"
              >
                Refresh
              </button>
            </div>

            <div className="space-y-3">
              {leaderboard.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    flex items-center space-x-4 p-4 rounded-xl transition-all
                    ${index < 3 
                      ? 'glass-panel border-2 hover-lift' 
                      : 'bg-void-gray/50 hover:bg-void-gray/70'
                    }
                    ${index === 0 ? 'border-yellow-500' : index === 1 ? 'border-gray-400' : index === 2 ? 'border-orange-600' : ''}
                  `}
                >
                  {/* Rank Badge */}
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0
                    ${index === 0 
                      ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black' 
                      : index === 1 
                      ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black'
                      : index === 2
                      ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-black'
                      : 'bg-void-gray border border-neon-blue/30 text-neon-blue'
                    }
                  `}>
                    {index < 3 ? (
                      <Trophy size={24} />
                    ) : (
                      index + 1
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-lg truncate">{user.displayName || 'Anonymous Shinobi'}</h3>
                      {user.clan && (
                        <span className="text-xs px-2 py-1 bg-neon-pink/20 text-neon-pink rounded-full truncate">
                          {user.clan}
                        </span>
                      )}
                    </div>
                    <div className={`text-sm font-semibold bg-gradient-to-r ${getRankColor(user.rank)} bg-clip-text text-transparent`}>
                      {user.rank}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center space-x-6 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-xs text-gray-400">Chakra</div>
                      <div className="text-xl font-bold text-neon-purple">
                        {user.chakra?.toLocaleString() || 0}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">Wins</div>
                      <div className="text-xl font-bold text-green-400">
                        {user.totalWins || 0}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {leaderboard.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="mx-auto mb-4 text-gray-600" size={64} />
                <p className="text-gray-400">No rankings yet. Be the first!</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Arena;
