import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const JikanExample = () => {
  
  const [animes, setAnimes] = useState([]);      
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState(null);      

  useEffect(() => {
    fetchTrendingAnime();
  }, []);

  const fetchTrendingAnime = async () => {
    try {
      console.log('📡 Fetching from Jikan API...');

      const response = await fetch('https://api.jikan.moe/v4/top/anime');

      const data = await response.json();
      
      console.log('✅ Data received:', data);

      setAnimes(data.data || []);
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching:', err);
      setError('Failed to load anime. Check console.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mb-4"></div>
          <p className="text-gray-400">Loading anime from Jikan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 px-4 flex items-center justify-center">
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 text-red-300">
          <p className="font-bold mb-2">Error!</p>
          <p>{error}</p>
          <button 
            onClick={fetchTrendingAnime}
            className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 rounded transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-24 px-4">
      <div className="max-w-7xl mx-auto">
        {}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">
            <span className="neon-text">Top Anime</span>
          </h1>
          <p className="text-gray-400">
            Powered by <span className="text-neon-blue font-bold">Jikan API</span> (completely free!)
          </p>
        </motion.div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {animes.slice(0, 12).map((anime, index) => (
            <motion.div
              key={anime.mal_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-panel rounded-2xl overflow-hidden border border-neon-blue/30 hover:border-neon-blue/60 transition-all group"
            >
              {}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={anime.images?.jpg?.image_url}
                  alt={anime.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              {}
              <div className="p-4">
                {}
                <h3 className="font-bold text-neon-blue mb-2 line-clamp-2">
                  {anime.title}
                </h3>

                {}
                <div className="text-yellow-400 font-bold mb-3">
                  ⭐ {anime.score || 'N/A'}
                </div>

                {}
                <div className="space-y-1 text-sm text-gray-400">
                  {}
                  {anime.episodes && (
                    <p>📺 {anime.episodes} Episodes</p>
                  )}

                  {}
                  {anime.status && (
                    <p>🔄 {anime.status}</p>
                  )}

                  {}
                  {anime.year && (
                    <p>📅 {anime.year}</p>
                  )}

                  {}
                  {anime.members && (
                    <p>👥 {(anime.members / 1000000).toFixed(1)}M members</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 glass-panel rounded-2xl p-6 border border-neon-purple/30"
        >
          <h3 className="text-xl font-bold text-neon-purple mb-4">
            How This Works 🚀
          </h3>
          <div className="space-y-2 text-gray-300 text-sm">
            <p>✅ This page uses the <span className="text-neon-blue font-bold">Jikan API</span></p>
            <p>✅ <span className="text-neon-blue font-bold">No API key required</span> - it's completely free!</p>
            <p>✅ Data comes from <span className="text-neon-blue font-bold">https://api.jikan.moe/v4/top/anime</span></p>
            <p>✅ Check browser console (F12) to see the API response</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default JikanExample;
