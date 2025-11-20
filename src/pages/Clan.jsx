import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Sparkles, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { updateClan } from '../utils/firebase';
import { generateClanName, parseClanResponse } from '../utils/gemini';

const Clan = () => {
  const { userProfile, refreshUserProfile } = useAuth();
  const [userVibe, setUserVibe] = useState('');
  const [interests, setInterests] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedClan, setGeneratedClan] = useState(null);

  const handleGenerateClan = async () => {
    if (!userVibe || !interests) {
      alert('Please fill in both fields');
      return;
    }

    setLoading(true);
    const response = await generateClanName(userVibe, interests);
    const parsed = parseClanResponse(response);
    setGeneratedClan(parsed);
    setLoading(false);
  };

  const handleSaveClan = async () => {
    if (!generatedClan) return;
    
    await updateClan(userProfile.id, generatedClan.clanName, generatedClan.motto);
    await refreshUserProfile();
    alert('Clan saved to your profile!');
  };

  return (
    <div className="min-h-screen pt-20 pb-24 md:pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="neon-text">Clan HQ</span>
          </h1>
          <p className="text-gray-400 font-mono">Create Your Legacy</p>
        </motion.div>

        {userProfile?.clan ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="glass-panel rounded-2xl p-8 text-center border border-neon-blue/30">
            <Shield className="mx-auto mb-6 text-neon-blue" size={64} />
            <h2 className="text-3xl font-bold mb-2 text-neon-blue">{userProfile.clan}</h2>
            <p className="text-xl text-gray-400 italic mb-6">"{userProfile.clanMotto}"</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="glass-panel p-4 rounded-xl">
                <div className="text-2xl font-bold text-neon-purple">{userProfile.chakra || 0}</div>
                <div className="text-xs text-gray-400">Clan Power</div>
              </div>
              <div className="glass-panel p-4 rounded-xl">
                <div className="text-2xl font-bold text-green-400">{userProfile.totalWins || 0}</div>
                <div className="text-xs text-gray-400">Victories</div>
              </div>
              <div className="glass-panel p-4 rounded-xl">
                <div className="text-2xl font-bold text-neon-pink">{userProfile.rank}</div>
                <div className="text-xs text-gray-400">Rank</div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-2xl p-8 border border-neon-purple/30">
            <div className="flex items-center space-x-3 mb-6">
              <Sparkles className="text-neon-purple" size={32} />
              <h2 className="text-2xl font-bold">AI Clan Generator</h2>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-400">Your Vibe</label>
                <input
                  type="text"
                  value={userVibe}
                  onChange={(e) => setUserVibe(e.target.value)}
                  placeholder="e.g., Dark and mysterious, Energetic and bold"
                  className="w-full px-4 py-3 bg-void-gray border border-neon-blue/30 rounded-xl focus:border-neon-blue outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-400">Your Interests</label>
                <input
                  type="text"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="e.g., Shadows, Lightning, Honor"
                  className="w-full px-4 py-3 bg-void-gray border border-neon-purple/30 rounded-xl focus:border-neon-purple outline-none"
                />
              </div>
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleGenerateClan}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-neon-purple to-neon-pink rounded-xl font-bold cyber-button disabled:opacity-50">
              {loading ? 'Generating...' : 'Generate Clan'}
            </motion.button>

            {generatedClan && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-6 bg-neon-purple/10 border border-neon-purple/30 rounded-xl">
                <h3 className="text-2xl font-bold text-neon-purple mb-2">{generatedClan.clanName}</h3>
                <p className="text-lg text-gray-300 italic mb-4">"{generatedClan.motto}"</p>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleSaveClan}
                  className="w-full py-3 bg-neon-blue rounded-xl font-bold cyber-button">
                  Save to Profile
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Clan;
