import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Calendar, Users, PlayCircle, Download, ExternalLink, Clock, Zap } from 'lucide-react';
import { jikanAPI, anilistAPI } from '../utils/animeDataAPIs';

const AnimeDetail = () => {
  const { id, source } = useParams();
  const navigate = useNavigate();
  const [anime, setAnime] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [streamingServices, setStreamingServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    loadAnimeDetails();
  }, [id, source]);

  const loadAnimeDetails = async () => {
    try {
      setLoading(true);
      let animeData = null;

      if (source === 'anilist') {
        animeData = await anilistAPI.getAnimeDetails(parseInt(id));
      } else {
        animeData = await jikanAPI.getAnimeDetails(parseInt(id));
        
        const fullData = await fetch(`https://api.jikan.moe/v4/anime/${id}/full`)
          .then(res => res.json())
          .then(data => data.data);
        
        if (fullData) {
          animeData = { ...animeData, ...fullData };
          setEpisodes(fullData.episodes || []);
        }
      }

      setAnime(animeData);

      if (animeData?.externalLinks) {
        setStreamingServices(animeData.externalLinks);
      }
    } catch (error) {
      console.error('Error loading anime details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-slate-950">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-3 border-purple-400/30 border-t-purple-500 rounded-full"
        />
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-6">Anime not found</p>
          <button
            onClick={() => navigate('/news')}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-bold"
          >
            Back to Anime Hub
          </button>
        </div>
      </div>
    );
  }

  const getImageUrl = () => {
    if (anime.coverImage?.large) return anime.coverImage.large;
    if (anime.images?.jpg?.large_image_url) return anime.images.jpg.large_image_url;
    return 'https://via.placeholder.com/300x400?text=No+Image';
  };

  const getTitle = () => {
    if (anime.title?.userPreferred) return anime.title.userPreferred;
    if (anime.title?.english) return anime.title.english;
    return anime.title;
  };

  const getScore = () => {
    return anime.averageScore || anime.score;
  };

  return (
    <div className="min-h-screen pt-20 pb-24 bg-slate-950">
      {}
      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={() => navigate('/news')}
        className="fixed top-24 left-4 z-50 px-4 py-2 bg-purple-600/80 hover:bg-purple-700 rounded-lg text-white font-bold flex items-center gap-2 backdrop-blur"
      >
        <ArrowLeft size={20} />
        Back
      </motion.button>

      {}
      <div className="relative h-64 md:h-96 overflow-hidden">
        <img
          src={anime.bannerImage || getImageUrl()}
          alt={getTitle()}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950"></div>
      </div>

      {}
      <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          {}
          <div className="md:col-span-1">
            <img
              src={getImageUrl()}
              alt={getTitle()}
              className="w-full rounded-lg shadow-2xl border border-purple-500/30"
            />
          </div>

          {}
          <div className="md:col-span-3 space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black mb-2" style={{
                background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                {getTitle()}
              </h1>
              {anime.title?.english && anime.title.english !== getTitle() && (
                <p className="text-gray-400">{anime.title.english}</p>
              )}
            </div>

            {}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {getScore() && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg p-4 border border-yellow-500/30"
                >
                  <div className="flex items-center gap-2 text-yellow-400 mb-2">
                    <Star size={20} />
                    <span className="font-bold">Rating</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{getScore()}/100</p>
                </motion.div>
              )}

              {anime.episodes && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg p-4 border border-blue-500/30"
                >
                  <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <PlayCircle size={20} />
                    <span className="font-bold">Episodes</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{anime.episodes}</p>
                </motion.div>
              )}

              {anime.seasonYear && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-500/30"
                >
                  <div className="flex items-center gap-2 text-purple-400 mb-2">
                    <Calendar size={20} />
                    <span className="font-bold">Year</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{anime.seasonYear}</p>
                </motion.div>
              )}

              {anime.status && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg p-4 border border-green-500/30"
                >
                  <div className="flex items-center gap-2 text-green-400 mb-2">
                    <Zap size={20} />
                    <span className="font-bold">Status</span>
                  </div>
                  <p className="text-lg font-bold text-white">{anime.status}</p>
                </motion.div>
              )}
            </div>

            {}
            {anime.description && (
              <div>
                <p className="text-gray-300 leading-relaxed line-clamp-3">
                  {anime.description.replace(/<[^>]*>/g, '')}
                </p>
              </div>
            )}

            {}
            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {anime.genres.map((genre, idx) => (
                  <motion.span
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    className="px-3 py-1 bg-purple-600/40 border border-purple-500/60 rounded-full text-sm text-purple-200"
                  >
                    {typeof genre === 'string' ? genre : genre.name}
                  </motion.span>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {}
        <div className="flex gap-4 mb-8 border-b border-purple-500/20">
          {[
            { id: 'overview', label: 'Overview', icon: Star },
            { id: 'episodes', label: 'Episodes', icon: PlayCircle },
            { id: 'streaming', label: 'Watch Now', icon: ExternalLink },
          ].map(({ id, label, icon: Icon }) => (
            <motion.button
              key={id}
              whileHover={{ scale: 1.05 }}
              onClick={() => setActiveSection(id)}
              className={`px-6 py-3 font-bold flex items-center gap-2 border-b-2 transition ${
                activeSection === id
                  ? 'border-purple-500 text-purple-300'
                  : 'border-transparent text-gray-400 hover:text-purple-300'
              }`}
            >
              <Icon size={20} />
              {label}
            </motion.button>
          ))}
        </div>

        {}
        {activeSection === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {anime.description && (
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg p-6 border border-purple-500/20">
                <h2 className="text-2xl font-bold text-white mb-4">Synopsis</h2>
                <p className="text-gray-300 leading-relaxed">
                  {anime.description.replace(/<[^>]*>/g, '')}
                </p>
              </div>
            )}

            {anime.studios && anime.studios.length > 0 && (
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg p-6 border border-purple-500/20">
                <h2 className="text-2xl font-bold text-white mb-4">Studios</h2>
                <div className="flex flex-wrap gap-3">
                  {anime.studios.map((studio, idx) => (
                    <span key={idx} className="px-4 py-2 bg-purple-600/40 rounded-lg text-purple-200">
                      {typeof studio === 'string' ? studio : studio.edges?.[0]?.node?.name || studio.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {}
        {activeSection === 'episodes' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {episodes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {episodes.slice(0, 50).map((ep, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-lg p-4 border border-purple-500/20 hover:border-purple-500/50 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-purple-400 font-bold">Episode {ep.mal_id}</p>
                        <h3 className="text-white font-semibold line-clamp-2">{ep.title}</h3>
                        {ep.aired && (
                          <p className="text-xs text-gray-400 mt-2">Aired: {ep.aired}</p>
                        )}
                      </div>
                      {ep.url && (
                        <a
                          href={ep.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-4 p-2 bg-purple-600/40 hover:bg-purple-600/60 rounded-lg text-purple-300"
                        >
                          <ExternalLink size={18} />
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p>Episode data not available</p>
              </div>
            )}
          </motion.div>
        )}

        {}
        {activeSection === 'streaming' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {streamingServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {streamingServices.map((service, idx) => (
                  <motion.a
                    key={idx}
                    href={service.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-br from-cyan-600/30 to-blue-600/30 rounded-lg p-6 border border-blue-500/30 hover:border-blue-500/60 transition flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-blue-300 font-bold text-lg">{service.site}</p>
                      <p className="text-sm text-gray-400">Click to watch</p>
                    </div>
                    <ExternalLink className="text-blue-400 group-hover:text-blue-300 transition" size={24} />
                  </motion.a>
                ))}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg p-12 border border-purple-500/20 text-center">
                <p className="text-gray-400">No streaming links available for this anime</p>
                <p className="text-sm text-gray-500 mt-2">Check back later or search on streaming platforms</p>
              </div>
            )}

            {}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Search on Popular Platforms</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { name: 'Crunchyroll', url: 'https://www.crunchyroll.com' },
                  { name: 'Netflix', url: 'https://www.netflix.com' },
                  { name: 'HiDive', url: 'https://www.hidive.com' },
                  { name: 'AnimePlanet', url: 'https://www.animeplanet.com' },
                ].map((platform, idx) => (
                  <a
                    key={idx}
                    href={`${platform.url}/search?q=${encodeURIComponent(getTitle())}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-purple-500 rounded-lg text-center text-white font-semibold transition"
                  >
                    {platform.name}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AnimeDetail;
