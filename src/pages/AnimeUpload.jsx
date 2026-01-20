import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Search, Upload, Plus, Check, X, Film, Image, Loader2,
    AlertCircle, ChevronDown, FileVideo, Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { jikanAPI } from '../utils/animeDataAPIs';
import {
    createAnimeEntry,
    addEpisode,
    uploadEpisodeVideo,
    validateVideoFile,
    QUALITY_OPTIONS,
    MAX_FILE_SIZE_MB
} from '../utils/animeUploadService';

const AnimeUpload = () => {
    const { user, userProfile } = useAuth();
    const navigate = useNavigate();
    const isAdmin = userProfile?.isAdmin === true || userProfile?.rank === 'Sage Mode';

    if (!isAdmin) {
        return (
            <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle size={64} className="text-red-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
                    <p className="text-slate-400">Only administrators can upload anime.</p>
                </div>
            </div>
        );
    }

    const [step, setStep] = useState(1); 
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [selectedAnime, setSelectedAnime] = useState(null);
    const [createdAnimeId, setCreatedAnimeId] = useState(null);

    const [episodes, setEpisodes] = useState([]);
    const [currentEpisode, setCurrentEpisode] = useState({
        number: 1,
        title: '',
        files: {} 
    });
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const fileInputRefs = {
        '1080p': useRef(null),
        '720p': useRef(null),
        '480p': useRef(null)
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        try {
            setSearching(true);
            setError(null);
            const results = await jikanAPI.searchAnime(searchQuery);
            setSearchResults(results?.data || []);
        } catch (err) {
            console.error('Search error:', err);
            setError('Failed to search. Please try again.');
        } finally {
            setSearching(false);
        }
    };

    const selectAnime = (anime) => {
        setSelectedAnime({
            malId: anime.mal_id,
            title: anime.title,
            titleJapanese: anime.title_japanese || '',
            titleEnglish: anime.title_english || '',
            coverImage: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '',
            synopsis: anime.synopsis || '',
            genres: anime.genres?.map(g => g.name) || [],
            totalEpisodes: anime.episodes || 0
        });
        setStep(2);
    };

    const confirmAnime = async () => {
        try {
            setUploading(true);
            setError(null);
            const animeId = await createAnimeEntry(selectedAnime, user.uid);
            setCreatedAnimeId(animeId);
            setStep(3);
            setSuccess('Anime entry created! Now upload episodes.');
        } catch (err) {
            console.error('Create error:', err);
            setError('Failed to create anime entry.');
        } finally {
            setUploading(false);
        }
    };

    const handleFileSelect = (quality, file) => {
        if (!file) return;

        const validation = validateVideoFile(file);
        if (!validation.valid) {
            setError(validation.errors.join(', '));
            return;
        }

        setCurrentEpisode(prev => ({
            ...prev,
            files: { ...prev.files, [quality]: file }
        }));
        setError(null);
    };

    const removeFile = (quality) => {
        setCurrentEpisode(prev => {
            const newFiles = { ...prev.files };
            delete newFiles[quality];
            return { ...prev, files: newFiles };
        });
    };

    const uploadCurrentEpisode = async () => {
        const files = currentEpisode.files;
        if (Object.keys(files).length === 0) {
            setError('Please select at least one video file.');
            return;
        }

        try {
            setUploading(true);
            setError(null);

            const videoUrls = {};

            for (const [quality, file] of Object.entries(files)) {
                setUploadProgress(prev => ({ ...prev, [quality]: 0 }));

                const url = await uploadEpisodeVideo(
                    file,
                    createdAnimeId,
                    currentEpisode.number,
                    quality,
                    (progress) => {
                        setUploadProgress(prev => ({ ...prev, [quality]: progress }));
                    }
                );

                videoUrls[quality] = url;
            }

            await addEpisode(createdAnimeId, {
                number: currentEpisode.number,
                title: currentEpisode.title || `Episode ${currentEpisode.number}`,
                videos: videoUrls
            }, user.uid);

            setEpisodes(prev => [...prev, {
                number: currentEpisode.number,
                title: currentEpisode.title || `Episode ${currentEpisode.number}`,
                qualities: Object.keys(videoUrls)
            }]);

            setCurrentEpisode({
                number: currentEpisode.number + 1,
                title: '',
                files: {}
            });
            setUploadProgress({});
            setSuccess(`Episode ${currentEpisode.number} uploaded successfully!`);

        } catch (err) {
            console.error('Upload error:', err);
            setError(`Upload failed: ${err.message}`);
        } finally {
            setUploading(false);
        }
    };

    const finishUpload = () => {
        navigate(`/library/${createdAnimeId}`);
    };

    return (
        <div className="min-h-screen pt-28 pb-16 px-4 relative z-0">
            {}
            <div className="fixed inset-0 bg-slate-950/90 -z-10" />

            <div className="max-w-4xl mx-auto">
                {}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-white mb-2">
                        <span className="text-yellow-500">Upload</span> Anime
                    </h1>
                    <p className="text-slate-400">Add new anime to the library</p>
                </div>

                {}
                <div className="flex items-center gap-4 mb-8">
                    {[1, 2, 3].map(s => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s ? 'bg-yellow-500 text-black' : 'bg-slate-700 text-slate-400'
                                }`}>
                                {step > s ? <Check size={16} /> : s}
                            </div>
                            <span className={`text-sm ${step >= s ? 'text-white' : 'text-slate-500'}`}>
                                {s === 1 ? 'Search' : s === 2 ? 'Confirm' : 'Upload'}
                            </span>
                            {s < 3 && <div className="w-8 h-0.5 bg-slate-700" />}
                        </div>
                    ))}
                </div>

                {}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-3"
                        >
                            <AlertCircle size={20} className="text-red-400" />
                            <span className="text-red-400">{error}</span>
                            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
                                <X size={18} />
                            </button>
                        </motion.div>
                    )}
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-xl flex items-center gap-3"
                        >
                            <Check size={20} className="text-green-400" />
                            <span className="text-green-400">{success}</span>
                            <button onClick={() => setSuccess(null)} className="ml-auto text-green-400 hover:text-green-300">
                                <X size={18} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {}
                {step === 1 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                            <h2 className="text-xl font-bold text-white mb-4">Search for Anime</h2>
                            <p className="text-slate-400 mb-6">Search MyAnimeList to auto-fill metadata</p>

                            <form onSubmit={handleSearch} className="flex gap-3 mb-6">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Enter anime title..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={searching}
                                    className="px-6 py-3 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {searching ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
                                    Search
                                </button>
                            </form>

                            {}
                            {searchResults.length > 0 && (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {searchResults.map(anime => (
                                        <div
                                            key={anime.mal_id}
                                            onClick={() => selectAnime(anime)}
                                            className="flex items-center gap-4 p-3 bg-slate-900/50 rounded-xl hover:bg-slate-900 cursor-pointer transition-colors"
                                        >
                                            <img
                                                src={anime.images?.jpg?.image_url}
                                                alt=""
                                                className="w-12 h-16 rounded object-cover"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-white font-medium truncate">{anime.title}</h4>
                                                <p className="text-slate-400 text-sm truncate">{anime.title_japanese}</p>
                                                <p className="text-slate-500 text-xs">{anime.episodes || '?'} episodes • {anime.type}</p>
                                            </div>
                                            <ChevronDown size={20} className="text-slate-400 rotate-[-90deg]" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {}
                {step === 2 && selectedAnime && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-700">
                            {}
                            <div className="relative h-48 bg-slate-900">
                                {selectedAnime.coverImage && (
                                    <img
                                        src={selectedAnime.coverImage}
                                        alt=""
                                        className="w-full h-full object-cover opacity-50"
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-800 to-transparent" />
                            </div>

                            <div className="p-6 -mt-16 relative">
                                <div className="flex gap-4">
                                    <img
                                        src={selectedAnime.coverImage}
                                        alt=""
                                        className="w-24 h-36 rounded-xl object-cover shadow-lg"
                                    />
                                    <div className="flex-1 pt-8">
                                        <h2 className="text-2xl font-bold text-white">{selectedAnime.title}</h2>
                                        {selectedAnime.titleJapanese && (
                                            <p className="text-slate-400">{selectedAnime.titleJapanese}</p>
                                        )}
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {selectedAnime.genres?.map(g => (
                                                <span key={g} className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                                                    {g}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <p className="text-slate-300 mt-4 text-sm line-clamp-3">{selectedAnime.synopsis}</p>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="px-4 py-2 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-700"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={confirmAnime}
                                        disabled={uploading}
                                        className="flex-1 px-4 py-3 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {uploading ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
                                        Create & Continue to Episode Upload
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {}
                {step === 3 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        {}
                        <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                            <img src={selectedAnime?.coverImage} alt="" className="w-16 h-24 rounded-lg object-cover" />
                            <div>
                                <h3 className="text-white font-bold">{selectedAnime?.title}</h3>
                                <p className="text-slate-400 text-sm">{episodes.length} episodes uploaded</p>
                            </div>
                        </div>

                        {}
                        {episodes.length > 0 && (
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                                <h4 className="text-white font-bold mb-3">Uploaded Episodes</h4>
                                <div className="space-y-2">
                                    {episodes.map(ep => (
                                        <div key={ep.number} className="flex items-center gap-3 p-2 bg-slate-900/50 rounded-lg">
                                            <Check size={16} className="text-green-400" />
                                            <span className="text-white">Episode {ep.number}: {ep.title}</span>
                                            <span className="text-slate-500 text-xs ml-auto">{ep.qualities.join(', ')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {}
                        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                            <h3 className="text-xl font-bold text-white mb-4">
                                Upload Episode {currentEpisode.number}
                            </h3>

                            {}
                            <div className="mb-4">
                                <label className="block text-slate-400 text-sm mb-2">Episode Title (Optional)</label>
                                <input
                                    type="text"
                                    placeholder={`Episode ${currentEpisode.number}`}
                                    value={currentEpisode.title}
                                    onChange={(e) => setCurrentEpisode(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                                />
                            </div>

                            {}
                            <div className="space-y-4">
                                {QUALITY_OPTIONS.map(quality => (
                                    <div key={quality} className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-white font-medium">{quality}</span>
                                            <span className="text-slate-500 text-xs">Max {MAX_FILE_SIZE_MB}MB</span>
                                        </div>

                                        {currentEpisode.files[quality] ? (
                                            <div className="flex items-center gap-3">
                                                <FileVideo size={20} className="text-yellow-400" />
                                                <span className="text-slate-300 flex-1 truncate">
                                                    {currentEpisode.files[quality].name}
                                                </span>
                                                <span className="text-slate-500 text-sm">
                                                    {(currentEpisode.files[quality].size / 1024 / 1024).toFixed(1)}MB
                                                </span>
                                                {uploadProgress[quality] !== undefined ? (
                                                    <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-yellow-500 transition-all"
                                                            style={{ width: `${uploadProgress[quality]}%` }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => removeFile(quality)}
                                                        className="p-1 text-red-400 hover:text-red-300"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <>
                                                <input
                                                    ref={fileInputRefs[quality]}
                                                    type="file"
                                                    accept="video/mp4,video/webm,video/x-matroska"
                                                    onChange={(e) => handleFileSelect(quality, e.target.files[0])}
                                                    className="hidden"
                                                />
                                                <button
                                                    onClick={() => fileInputRefs[quality].current?.click()}
                                                    className="w-full py-3 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:border-yellow-500 hover:text-yellow-400 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Upload size={18} />
                                                    Select {quality} File
                                                </button>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {}
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={uploadCurrentEpisode}
                                    disabled={uploading || Object.keys(currentEpisode.files).length === 0}
                                    className="flex-1 px-4 py-3 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {uploading ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={20} />
                                            Upload Episode {currentEpisode.number}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {}
                        {episodes.length > 0 && (
                            <button
                                onClick={finishUpload}
                                className="w-full py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-500 flex items-center justify-center gap-2"
                            >
                                <Check size={20} />
                                Finish & View in Library
                            </button>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default AnimeUpload;
