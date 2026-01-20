import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, Users, Heart, MessageCircle, Share2, X, ExternalLink, BookOpen, Star, Zap, Filter } from 'lucide-react';
import { jikanAPI, animechanAPI } from '../utils/enhancedAPIs';
import { wikipediaAPI } from '../utils/wikipediaAPI';

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const CharacterCard = ({ char, isSelected, onSelect, animeName }) => (
  <motion.div
    whileHover={{ scale: 1.03, y: -5 }}
    whileTap={{ scale: 0.98 }}
    onClick={onSelect}
    className={`group cursor-pointer rounded-xl overflow-hidden transition-all ${isSelected
      ? 'ring-2 ring-yellow-500 bg-gradient-to-br from-yellow-900/30 to-amber-900/30'
      : 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 hover:ring-1 hover:ring-yellow-500/50'
      }`}
    style={{ border: '1px solid rgba(202, 138, 4, 0.2)' }}
  >
    {}
    <div className="relative aspect-[3/4] overflow-hidden bg-slate-900">
      {char.character?.images?.jpg?.image_url && (
        <img
          src={char.character.images.jpg.image_url}
          alt={char.character.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
      )}
      {}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {}
      <div className="absolute top-2 right-2">
        <span className={`px-2 py-1 rounded text-xs font-bold ${char.role === 'Main' ? 'bg-yellow-500 text-black' : 'bg-slate-700 text-white'
          }`}>
          {char.role || 'Character'}
        </span>
      </div>
    </div>

    {}
    <div className="p-3 space-y-1">
      <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-yellow-400 transition-colors">
        {char.character?.name || 'Unknown'}
      </h3>
      {}
      {animeName && (
        <p className="text-yellow-500/80 text-xs font-semibold line-clamp-1">
          📺 {animeName}
        </p>
      )}
      {char.voice_actors?.[0] && (
        <p className="text-slate-500 text-xs line-clamp-1">
          🎙️ {char.voice_actors[0].person?.name}
        </p>
      )}
    </div>
  </motion.div>
);

const WikipediaPanel = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="p-4 bg-slate-800/50 rounded-xl animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-slate-700 rounded w-full mb-1"></div>
        <div className="h-3 bg-slate-700 rounded w-2/3"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/30"
    >
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="text-blue-400" size={18} />
        <h4 className="font-bold text-white text-sm">Wikipedia Lore</h4>
        {data.url && (
          <a href={data.url} target="_blank" rel="noopener noreferrer" className="ml-auto text-blue-400 hover:text-blue-300">
            <ExternalLink size={14} />
          </a>
        )}
      </div>
      <p className="text-slate-300 text-sm leading-relaxed">{data.extract}</p>
    </motion.div>
  );
};

const SearchSuggestions = ({ suggestions, onSelect, visible }) => {
  if (!visible || suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-full left-0 right-0 mt-2 bg-slate-900 rounded-xl border border-yellow-500/30 shadow-2xl overflow-hidden z-50"
    >
      {suggestions.map((anime, idx) => (
        <button
          key={anime.mal_id}
          onClick={() => onSelect(anime)}
          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-yellow-500/10 transition-all text-left border-b border-slate-800 last:border-0"
        >
          {anime.images?.jpg?.small_image_url && (
            <img src={anime.images.jpg.small_image_url} alt={anime.title} className="w-10 h-14 object-cover rounded" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">{anime.title}</p>
            <p className="text-slate-500 text-xs">{anime.type} • {anime.episodes || '?'} eps</p>
          </div>
        </button>
      ))}
    </motion.div>
  );
};

const CharactersHub = () => {
  const [view, setView] = useState('featured');
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [characterQuotes, setCharacterQuotes] = useState([]);
  const [wikiData, setWikiData] = useState(null);
  const [wikiLoading, setWikiLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentAnimeName, setCurrentAnimeName] = useState('');
  const [characterAnimeMap, setCharacterAnimeMap] = useState({});

  const searchRef = useRef(null);
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (debouncedSearch.length >= 2) {
      fetchSuggestions(debouncedSearch);
    } else {
      setSuggestions([]);
    }
  }, [debouncedSearch]);

  const fetchSuggestions = async (query) => {
    try {
      const results = await jikanAPI.searchAnime(query, 1, 5);
      setSuggestions(results);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  useEffect(() => {
    loadFeaturedCharacters();
  }, []);

  useEffect(() => {
    if (selectedCharacter) {
      loadCharacterQuotes();
      loadWikipediaData();
    }
  }, [selectedCharacter]);

  const loadFeaturedCharacters = async () => {
    setLoading(true);
    try {
      const popularAnimes = [
        { id: 21, name: 'One Piece' },
        { id: 20, name: 'Naruto' },
        { id: 1535, name: 'Death Note' },
        { id: 11061, name: 'Hunter x Hunter' },
        { id: 16498, name: 'Attack on Titan' }
      ];

      const allChars = [];
      const animeMap = {};

      for (const anime of popularAnimes) {
        try {
          const chars = await jikanAPI.getAnimeCharacters(anime.id);
          chars.slice(0, 3).forEach(char => {
            animeMap[char.character?.mal_id] = anime.name;
          });
          allChars.push(...chars.slice(0, 3));
        } catch (e) {
          console.warn(`Failed to load chars for ${anime.name}`);
        }
      }

      setCharacterAnimeMap(animeMap);
      setCharacters(allChars);
      if (allChars.length > 0) {
        setSelectedCharacter(allChars[0]);
        setCurrentAnimeName(animeMap[allChars[0].character?.mal_id] || '');
      }
    } catch (error) {
      console.error('Error loading characters:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCharacterQuotes = async () => {
    if (!selectedCharacter?.character?.name) return;
    try {
      const quotes = await animechanAPI.getQuotesByAnime(selectedCharacter.character.name);
      setCharacterQuotes(quotes);
    } catch (error) {
      console.error('Error loading quotes:', error);
      setCharacterQuotes([]);
    }
  };

  const loadWikipediaData = async () => {
    if (!selectedCharacter?.character?.name) return;
    setWikiLoading(true);
    try {
      const name = selectedCharacter.character.name;
      const animeName = currentAnimeName || '';
      
      const searchQuery = animeName ? `${name} ${animeName}` : name;
      const data = await wikipediaAPI.getCharacterInfo(searchQuery);
      setWikiData(data);
    } catch (error) {
      console.error('Error loading Wikipedia data:', error);
      setWikiData(null);
    } finally {
      setWikiLoading(false);
    }
  };

  const handleAnimeSelect = async (anime) => {
    setShowSuggestions(false);
    setSearchQuery(anime.title);
    setCurrentAnimeName(anime.title);
    setLoading(true);

    try {
      const chars = await jikanAPI.getAnimeCharacters(anime.mal_id);
      const animeMap = {};
      chars.forEach(char => {
        animeMap[char.character?.mal_id] = anime.title;
      });

      setCharacterAnimeMap(animeMap);
      setCharacters(chars);
      if (chars.length > 0) {
        setSelectedCharacter(chars[0]);
      }
    } catch (error) {
      console.error('Error loading anime characters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setShowSuggestions(false);
    setLoading(true);

    try {

      const charResults = await jikanAPI.searchCharacters(searchQuery, 1, 24);

      if (charResults && charResults.length > 0) {
        
        const normalizedChars = charResults.map(c => ({
          character: {
            mal_id: c.mal_id,
            name: c.name,
            images: c.images,
            url: c.url
          },
          role: c.anime?.[0]?.role || 'Main', 
          favorites: c.favorites
        }));

        const animeMap = {};
        charResults.forEach(c => {
          if (c.anime && c.anime.length > 0) {
            
            animeMap[c.mal_id] = c.anime[0].anime.title;
          }
        });

        setCharacters(normalizedChars);
        setCharacterAnimeMap(animeMap);
        setCurrentAnimeName(`Results for "${searchQuery}"`);

        if (normalizedChars.length > 0) {
          setSelectedCharacter(normalizedChars[0]);
        }
        setLoading(false);
        return;
      }

      const animes = await jikanAPI.searchAnime(searchQuery, 1, 3);
      if (animes.length > 0) {
        await handleAnimeSelect(animes[0]);
      } else {
        setCharacters([]);
        setCurrentAnimeName('');
      }
    } catch (error) {
      console.error('Error searching:', error);
      setCharacters([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-24 md:pb-8 px-4 relative z-20" style={{ background: '#050505' }}>
      <div className="max-w-7xl mx-auto">

        {}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-black mb-3" style={{ color: '#eab308', textShadow: '0 0 40px rgba(234, 179, 8, 0.5)' }}>
            CHARACTER HUB
          </h1>
          <p className="text-slate-500">Explore characters, read lore from Wikipedia, and discover quotes</p>
        </motion.div>

        {}
        <div className="max-w-2xl mx-auto mb-8" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Search anime to view characters... (Naruto, One Piece, Attack on Titan...)"
              className="w-full pl-12 pr-24 py-4 bg-slate-900/80 border border-yellow-500/30 focus:border-yellow-500 rounded-2xl text-white placeholder-slate-500 outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-all"
            >
              Search
            </button>

            <SearchSuggestions
              suggestions={suggestions}
              onSelect={handleAnimeSelect}
              visible={showSuggestions}
            />
          </form>
        </div>

        {}
        {currentAnimeName && (
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 rounded-full text-yellow-400 font-semibold">
              <Star size={16} />
              Viewing characters from: {currentAnimeName}
            </span>
          </div>
        )}

        {}
        <div className="grid lg:grid-cols-3 gap-6">

          {}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-12 h-12 rounded-full border-4 border-yellow-500/30 border-t-yellow-500 animate-spin" />
              </div>
            ) : characters.length === 0 ? (
              <div className="text-center py-20">
                <Users className="mx-auto text-slate-600 mb-4" size={48} />
                <p className="text-slate-500">No characters found. Search for an anime!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {characters.map((char, idx) => (
                  <CharacterCard
                    key={`${char.character?.mal_id}-${idx}`}
                    char={char}
                    isSelected={selectedCharacter?.character?.mal_id === char.character?.mal_id}
                    onSelect={() => {
                      setSelectedCharacter(char);
                      setCurrentAnimeName(characterAnimeMap[char.character?.mal_id] || currentAnimeName);
                    }}
                    animeName={characterAnimeMap[char.character?.mal_id]}
                  />
                ))}
              </div>
            )}
          </div>

          {}
          <div className="lg:col-span-1 space-y-4">
            {selectedCharacter ? (
              <motion.div
                key={selectedCharacter.character?.mal_id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-2xl overflow-hidden sticky top-24"
                style={{ background: 'rgba(15,15,20,0.95)', border: '1px solid rgba(202, 138, 4, 0.2)' }}
              >
                {}
                <div className="aspect-square relative">
                  {selectedCharacter.character?.images?.jpg?.image_url && (
                    <img
                      src={selectedCharacter.character.images.jpg.image_url}
                      alt={selectedCharacter.character.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-2xl font-black text-white">{selectedCharacter.character?.name}</h2>
                    {currentAnimeName && <p className="text-yellow-400 font-semibold">From: {currentAnimeName}</p>}
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-xl bg-slate-800/50 text-center">
                      <Zap className="mx-auto text-yellow-500 mb-1" size={18} />
                      <p className="text-white font-bold">{selectedCharacter.role || 'Supporting'}</p>
                      <p className="text-xs text-slate-500">Role</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/50 text-center">
                      <Star className="mx-auto text-yellow-500 mb-1" size={18} />
                      <p className="text-white font-bold">{selectedCharacter.favorites || '—'}</p>
                      <p className="text-xs text-slate-500">Favorites</p>
                    </div>
                  </div>

                  {}
                  <WikipediaPanel data={wikiData} loading={wikiLoading} />

                  {}
                  {characterQuotes.length > 0 && (
                    <div>
                      <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                        <MessageCircle size={14} className="text-yellow-500" /> Famous Quotes
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {characterQuotes.slice(0, 3).map((quote, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-slate-800/50 border-l-2 border-yellow-500">
                            <p className="text-slate-300 text-sm italic">"{quote.quote}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {}
                  <div className="flex gap-2 pt-2">
                    <button className="flex-1 py-2 bg-yellow-500 text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-400">
                      <Heart size={16} /> Favorite
                    </button>
                    <button className="flex-1 py-2 bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-700">
                      <Share2 size={16} /> Share
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                Select a character to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharactersHub;
