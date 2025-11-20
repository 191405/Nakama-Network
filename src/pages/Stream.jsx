import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize, Info, Ghost, Download, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getAllAnimes, incrementAnimeViews, incrementAnimeDownloads } from '../utils/firebase';
import { explainAnimeContext, generateGhostModeCommentary } from '../utils/gemini';

const Stream = () => {
  const { userProfile } = useAuth();
  const [animes, setAnimes] = useState([]);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAISensei, setShowAISensei] = useState(false);
  const [showGhostMode, setShowGhostMode] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [ghostCommentary, setGhostCommentary] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  // Sample anime data with YouTube trailers
  const sampleAnimes = [
    {
      id: 'sample1',
      title: 'Attack on Titan Final Season',
      description: 'The final battle for humanity begins',
      youtubeId: 'SlNpRThS9t8',
      thumbnail: 'https://img.youtube.com/vi/SlNpRThS9t8/maxresdefault.jpg',
      genre: ['Action', 'Drama'],
      year: 2023,
      views: 12500,
      downloads: 3400
    },
    {
      id: 'sample2',
      title: 'Demon Slayer: Kimetsu no Yaiba',
      description: 'Epic sword fights and breathtaking animation',
      youtubeId: '6vMuWuWlW4I',
      thumbnail: 'https://img.youtube.com/vi/6vMuWuWlW4I/maxresdefault.jpg',
      genre: ['Action', 'Supernatural'],
      year: 2023,
      views: 18900,
      downloads: 5200
    },
    {
      id: 'sample3',
      title: 'Jujutsu Kaisen Season 2',
      description: 'Cursed energy unleashed',
      youtubeId: 'O6qVieflwqs',
      thumbnail: 'https://img.youtube.com/vi/O6qVieflwqs/maxresdefault.jpg',
      genre: ['Action', 'Supernatural'],
      year: 2023,
      views: 15600,
      downloads: 4100
    },
    {
      id: 'sample4',
      title: 'My Hero Academia Season 7',
      description: 'Heroes vs Villains - The Ultimate Showdown',
      youtubeId: 'NwzY8IkebJI',
      thumbnail: 'https://img.youtube.com/vi/NwzY8IkebJI/maxresdefault.jpg',
      genre: ['Action', 'Superhero'],
      year: 2024,
      views: 11200,
      downloads: 2900
    },
    {
      id: 'sample5',
      title: 'Chainsaw Man',
      description: 'Devils, Chainsaws, and Pure Chaos',
      youtubeId: 'l1Gtf3MS6j8',
      thumbnail: 'https://img.youtube.com/vi/l1Gtf3MS6j8/maxresdefault.jpg',
      genre: ['Action', 'Horror'],
      year: 2023,
      views: 14800,
      downloads: 3800
    },
    {
      id: 'sample6',
      title: 'Spy x Family Season 2',
      description: 'The funniest spy family returns',
      youtubeId: 'WFZgi39rXcY',
      thumbnail: 'https://img.youtube.com/vi/WFZgi39rXcY/maxresdefault.jpg',
      genre: ['Comedy', 'Action'],
      year: 2023,
      views: 13400,
      downloads: 3600
    }
  ];

  useEffect(() => {
    loadAnimes();
  }, []);

  const loadAnimes = async () => {
    try {
      const uploadedAnimes = await getAllAnimes();
      setAnimes([...sampleAnimes, ...uploadedAnimes]);
    } catch (error) {
      console.error('Error loading animes:', error);
      setAnimes(sampleAnimes);
    }
  };

  const handleSelectAnime = async (anime) => {
    setSelectedAnime(anime);
    setIsPlaying(false);
    setShowAISensei(false);
    setShowGhostMode(false);
    if (anime.id !== selectedAnime?.id) {
      await incrementAnimeViews(anime.id);
    }
  };

  const handleAISensei = async () => {
    setShowAISensei(!showAISensei);
    if (!showAISensei && !aiExplanation) {
      setLoadingAI(true);
      const explanation = await explainAnimeContext(
        selectedAnime.title,
        'common Japanese cultural elements and anime tropes visible in this series'
      );
      setAiExplanation(explanation);
      setLoadingAI(false);
    }
  };

  const handleGhostMode = async () => {
    setShowGhostMode(!showGhostMode);
    if (!showGhostMode && !ghostCommentary) {
      setLoadingAI(true);
      const commentary = await generateGhostModeCommentary(
        'Naruto Uzumaki',
        `watching ${selectedAnime.title} and reacting to the action`
      );
      setGhostCommentary(commentary);
      setLoadingAI(false);
    }
  };

  const handleDownload = async () => {
    if (selectedAnime) {
      await incrementAnimeDownloads(selectedAnime.id);
      alert(`Download started for ${selectedAnime.title}!\n\n(In production, this would trigger an actual download)`);
    }
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
            <span className="neon-text">Stream-X</span>
          </h1>
          <p className="text-gray-400 font-mono">4K Anime Streaming with AI Enhancement</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2 space-y-4">
            {selectedAnime ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel rounded-2xl overflow-hidden border border-neon-blue/30"
              >
                {/* YouTube Player */}
                <div className="relative aspect-video bg-black">
                  {selectedAnime.youtubeId ? (
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${selectedAnime.youtubeId}?autoplay=${isPlaying ? 1 : 0}`}
                      title={selectedAnime.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="text-neon-blue" size={64} />
                    </div>
                  )}
                </div>

                {/* Video Info & Controls */}
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-2">{selectedAnime.title}</h2>
                  <p className="text-gray-400 mb-4">{selectedAnime.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedAnime.genre?.map(g => (
                      <span key={g} className="px-3 py-1 bg-neon-blue/20 rounded-full text-xs text-neon-blue border border-neon-blue/30">
                        {g}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                    <div className="flex items-center space-x-1">
                      <Eye size={16} />
                      <span>{selectedAnime.views?.toLocaleString()} views</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Download size={16} />
                      <span>{selectedAnime.downloads?.toLocaleString()} downloads</span>
                    </div>
                  </div>

                  {/* AI Features */}
                  <div className="grid grid-cols-3 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAISensei}
                      className={`py-3 rounded-xl font-bold text-sm cyber-button flex items-center justify-center space-x-2 ${
                        showAISensei ? 'bg-neon-blue text-white' : 'bg-neon-blue/20 text-neon-blue'
                      }`}
                    >
                      <Info size={18} />
                      <span>AI Sensei</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleGhostMode}
                      className={`py-3 rounded-xl font-bold text-sm cyber-button flex items-center justify-center space-x-2 ${
                        showGhostMode ? 'bg-neon-purple text-white' : 'bg-neon-purple/20 text-neon-purple'
                      }`}
                    >
                      <Ghost size={18} />
                      <span>Ghost Mode</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDownload}
                      className="py-3 bg-neon-pink/20 text-neon-pink rounded-xl font-bold text-sm cyber-button flex items-center justify-center space-x-2"
                    >
                      <Download size={18} />
                      <span>Download</span>
                    </motion.button>
                  </div>

                  {/* AI Sensei Panel */}
                  {showAISensei && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-4 bg-neon-blue/10 border border-neon-blue/30 rounded-xl"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <Info className="text-neon-blue" size={20} />
                        <h3 className="font-bold text-neon-blue">AI Sensei Explains</h3>
                      </div>
                      {loadingAI ? (
                        <div className="flex justify-center py-4">
                          <div className="loading-spinner"></div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-300 leading-relaxed">{aiExplanation}</p>
                      )}
                    </motion.div>
                  )}

                  {/* Ghost Mode Panel */}
                  {showGhostMode && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-4 bg-neon-purple/10 border border-neon-purple/30 rounded-xl"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <Ghost className="text-neon-purple" size={20} />
                        <h3 className="font-bold text-neon-purple">Naruto is Watching With You</h3>
                      </div>
                      {loadingAI ? (
                        <div className="flex justify-center py-4">
                          <div className="loading-spinner"></div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-300 leading-relaxed italic">"{ghostCommentary}"</p>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-panel rounded-2xl p-12 text-center border border-neon-blue/30"
              >
                <Play className="mx-auto mb-4 text-neon-blue" size={64} />
                <h3 className="text-2xl font-bold mb-2">Select an Anime to Stream</h3>
                <p className="text-gray-400">Choose from our extensive library</p>
              </motion.div>
            )}
          </div>

          {/* Anime Library */}
          <div className="lg:col-span-1">
            <div className="glass-panel rounded-2xl p-6 border border-neon-purple/30 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4 text-neon-purple">Anime Library</h3>
              
              <div className="space-y-3">
                {animes.map((anime) => (
                  <motion.div
                    key={anime.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleSelectAnime(anime)}
                    className={`
                      cursor-pointer rounded-xl overflow-hidden border transition-all
                      ${selectedAnime?.id === anime.id 
                        ? 'border-neon-blue shadow-lg shadow-neon-blue/30' 
                        : 'border-void-gray hover:border-neon-purple/50'
                      }
                    `}
                  >
                    <div className="relative aspect-video bg-void-gray">
                      <img
                        src={anime.thumbnail}
                        alt={anime.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <h4 className="font-bold text-sm truncate">{anime.title}</h4>
                        <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                          <span>{anime.year}</span>
                          <div className="flex items-center space-x-2">
                            <Eye size={12} />
                            <span>{(anime.views || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stream;
