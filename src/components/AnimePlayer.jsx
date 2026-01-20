import React, { useState, useEffect } from 'react';
import { Play, ExternalLink, AlertCircle, Share2, Bookmark } from 'lucide-react';

const AnimePlayer = ({ 
  anime, 
  episode = 1,
  onEpisodeChange = () => {}
}) => {
  const [selectedEpisode, setSelectedEpisode] = useState(episode);
  const [showTrailer, setShowTrailer] = useState(false);
  const [streamingLinks, setStreamingLinks] = useState({});

  useEffect(() => {
    generateStreamingLinks();
  }, [anime]);

  const generateStreamingLinks = () => {
    const title = anime.title || 'Unknown';
    const malId = anime.mal_id || anime.id || '';

    setStreamingLinks({
      crunchyroll: `https://www.crunchyroll.com/search?q=${encodeURIComponent(title)}`,
      netflix: `https://www.netflix.com/search?q=${encodeURIComponent(title)}`,
      hulu: `https://www.hulu.com/search?q=${encodeURIComponent(title)}`,
      justwatch: `https://www.justwatch.com/search?q=${encodeURIComponent(title)}`,
      myanimelist: `https://myanimelist.net/anime/${malId}`,
      youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' trailer')}`
    });
  };

  const getYouTubeEmbedUrl = (title) => {

    return null;
  };

  return (
    <div className="w-full bg-gradient-to-b from-gray-900 to-black rounded-lg overflow-hidden border border-purple-500/30">
      {}
      <div className="relative aspect-video bg-black flex items-center justify-center group">
        {}
        <button
          onClick={() => setShowTrailer(!showTrailer)}
          className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all duration-300 z-10"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-75"></div>
            <div className="relative bg-purple-600 hover:bg-purple-500 transition-colors rounded-full p-6 transform hover:scale-110">
              <Play size={48} className="text-white fill-white" />
            </div>
          </div>
        </button>

        {}
        {anime.image && (
          <img
            src={anime.image}
            alt={anime.title}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}

        {}
        <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-full text-sm font-bold text-white">
          EP {selectedEpisode}
        </div>
      </div>

      {}
      <div className="p-6 space-y-4">
        {}
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">{anime.title}</h2>
          <p className="text-gray-300 text-sm line-clamp-2">{anime.synopsis || anime.description || 'No description available'}</p>
        </div>

        {}
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-white mb-2">Watch Legally</h3>
              <p className="text-gray-300 text-sm">
                Support creators by watching on official platforms. Click below to find where it's available in your region.
              </p>
            </div>
          </div>

          {/* Streaming Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {streamingLinks.crunchyroll && (
              <a
                href={streamingLinks.crunchyroll}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 transition-all p-3 rounded-lg font-semibold text-white text-sm"
              >
                <span>Crunchyroll</span>
                <ExternalLink size={16} />
              </a>
            )}

            {streamingLinks.netflix && (
              <a
                href={streamingLinks.netflix}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 transition-all p-3 rounded-lg font-semibold text-white text-sm"
              >
                <span>Netflix</span>
                <ExternalLink size={16} />
              </a>
            )}

            {streamingLinks.hulu && (
              <a
                href={streamingLinks.hulu}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 transition-all p-3 rounded-lg font-semibold text-white text-sm"
              >
                <span>Hulu</span>
                <ExternalLink size={16} />
              </a>
            )}

            {streamingLinks.justwatch && (
              <a
                href={streamingLinks.justwatch}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all p-3 rounded-lg font-semibold text-white text-sm"
              >
                <span>JustWatch</span>
                <ExternalLink size={16} />
              </a>
            )}

            {streamingLinks.youtube && (
              <a
                href={streamingLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500 transition-all p-3 rounded-lg font-semibold text-white text-sm"
              >
                <span>Trailer</span>
                <ExternalLink size={16} />
              </a>
            )}

            {streamingLinks.myanimelist && (
              <a
                href={streamingLinks.myanimelist}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 transition-all p-3 rounded-lg font-semibold text-white text-sm"
              >
                <span>MAL</span>
                <ExternalLink size={16} />
              </a>
            )}
          </div>
        </div>

        {/* Episode Selector */}
        {anime.episodes && anime.episodes > 0 && (
          <div className="border border-purple-500/30 rounded-lg p-4">
            <h3 className="text-white font-bold mb-3">Episode {selectedEpisode}</h3>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2 max-h-40 overflow-y-auto">
              {Array.from({ length: anime.episodes }, (_, i) => i + 1).map(ep => (
                <button
                  key={ep}
                  onClick={() => {
                    setSelectedEpisode(ep);
                    onEpisodeChange(ep);
                  }}
                  className={`p-2 rounded transition-all font-semibold text-sm ${
                    selectedEpisode === ep
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  }`}
                >
                  {ep}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {anime.score && (
            <div className="bg-gray-800/50 rounded p-3 border border-gray-700">
              <p className="text-gray-400 text-xs">Rating</p>
              <p className="text-yellow-400 font-bold">{anime.score}/10</p>
            </div>
          )}

          {anime.episodes && (
            <div className="bg-gray-800/50 rounded p-3 border border-gray-700">
              <p className="text-gray-400 text-xs">Episodes</p>
              <p className="text-blue-400 font-bold">{anime.episodes}</p>
            </div>
          )}

          {anime.status && (
            <div className="bg-gray-800/50 rounded p-3 border border-gray-700">
              <p className="text-gray-400 text-xs">Status</p>
              <p className="text-green-400 font-bold text-xs">{anime.status}</p>
            </div>
          )}

          {anime.aired && (
            <div className="bg-gray-800/50 rounded p-3 border border-gray-700">
              <p className="text-gray-400 text-xs">Year</p>
              <p className="text-purple-400 font-bold">{new Date(anime.aired).getFullYear()}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-700">
          <button className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all py-2 rounded-lg font-semibold text-white">
            <Bookmark size={18} />
            Watchlist
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 transition-all py-2 rounded-lg font-semibold text-white">
            <Share2 size={18} />
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnimePlayer;
