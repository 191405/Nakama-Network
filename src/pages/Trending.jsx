import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, TrendingUp, Calendar, Users } from 'lucide-react';
import { jikanAPI } from '../utils/animeAPIs';

const Trending = () => {
  const [trendingAnime, setTrendingAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        const data = await jikanAPI.getTrendingAnime();
        setTrendingAnime(data.slice(0, 12)); 
        setError(null);
      } catch (err) {
        console.error('Error fetching trending anime:', err);
        setError('Failed to load trending anime');
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-24 px-4 flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-24 md:pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        {}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="neon-text">Trending Now</span>
          </h1>
          <p className="text-gray-400 font-mono flex items-center justify-center space-x-2">
            <TrendingUp size={20} />
            <span>The Most Watched Anime Right Now</span>
          </p>
        </motion.div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-8 text-red-300">
            {error}
          </div>
        )}

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingAnime.map((anime, index) => (
            <motion.div
              key={anime.mal_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="glass-panel rounded-2xl overflow-hidden border border-neon-blue/30 hover:border-neon-blue/60 transition-all group cursor-pointer"
            >
              {}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={anime.images?.jpg?.image_url || 'https://via.placeholder.com/300x400'}
                  alt={anime.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-cyber-black via-transparent to-transparent"></div>

                {}
                <div className="absolute top-4 right-4 bg-neon-purple/80 backdrop-blur px-3 py-1 rounded-full flex items-center space-x-1">
                  <TrendingUp size={16} />
                  <span className="font-bold">#{index + 1}</span>
                </div>

                {}
                {anime.score && (
                  <div className="absolute bottom-4 left-4 bg-yellow-500/80 backdrop-blur px-3 py-1 rounded-full flex items-center space-x-1">
                    <Star size={16} />
                    <span className="font-bold">{anime.score}</span>
                  </div>
                )}
              </div>

              {}
              <div className="p-4">
                <h3 className="text-lg font-bold mb-2 line-clamp-2 text-neon-blue">
                  {anime.title}
                </h3>

                <div className="space-y-2 text-sm text-gray-400 mb-4">
                  {}
                  {anime.episodes && (
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} className="text-neon-pink" />
                      <span>{anime.episodes} Episodes</span>
                    </div>
                  )}

                  {}
                  {anime.status && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-neon-blue"></div>
                      <span className="capitalize">{anime.status}</span>
                    </div>
                  )}

                  {}
                  {anime.members && (
                    <div className="flex items-center space-x-2">
                      <Users size={16} className="text-neon-purple" />
                      <span>{(anime.members / 1000).toFixed(0)}K Members</span>
                    </div>
                  )}
                </div>

                {}
                {anime.genres && anime.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {anime.genres.slice(0, 2).map((genre) => (
                      <span
                        key={genre.mal_id}
                        className="px-2 py-1 bg-neon-blue/20 text-neon-blue rounded text-xs border border-neon-blue/30"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Trending;
