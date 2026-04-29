import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, User, Check, Upload, Sparkles } from 'lucide-react';
import userService from '../utils/userService';

import { useAuth } from '../contexts/AuthContext';

const AnimeAvatarSelector = ({ currentAvatar, onAvatarUpdate, onClose }) => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (searchQuery.length < 3) return;

        setLoading(true);
        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://nakama-network-api.onrender.com';
            const response = await fetch(`${API_BASE_URL}/api/v2/characters/search?q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            setResults(data.characters || []);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectCharacter = async (char) => {
        setSelectedId(char.id);
        try {
            await userService.setAnimeAvatar(user.uid, char.image);
            onAvatarUpdate(char.image);
            onClose();
        } catch (error) {
            alert('Failed to set avatar. Please try again.');
        } finally {
            setSelectedId(null);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const res = await userService.uploadAvatar(user.uid, file);
            onAvatarUpdate(res.data.avatar_url);
            onClose();
        } catch (error) {
            alert('Upload failed: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
                style={{ 
                    background: '#0a0a0a', 
                    border: '1px solid rgba(183,110,121,0.2)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/[0.05]">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Sparkles size={20} className="text-[#b76e79]" />
                            Choose Your Persona
                        </h2>
                        <p className="text-xs text-[#555] mt-1">Select an anime character or upload your own image</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/[0.05] text-[#444] hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* Upload Section */}
                    <div className="flex items-center gap-4">
                        <label className="flex-1 cursor-pointer group">
                            <div className="relative h-24 rounded-2xl border-2 border-dashed border-white/[0.05] group-hover:border-[#b76e79]/30 transition-all flex flex-col items-center justify-center gap-2 bg-white/[0.02]">
                                {uploading ? (
                                    <Loader2 className="animate-spin text-[#b76e79]" />
                                ) : (
                                    <>
                                        <Upload size={20} className="text-[#444] group-hover:text-[#b76e79] transition-colors" />
                                        <span className="text-xs text-[#555] group-hover:text-[#888]">Custom Upload</span>
                                    </>
                                )}
                            </div>
                            <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" disabled={uploading} />
                        </label>
                        
                        <div className="w-24 h-24 rounded-2xl bg-[#111] border border-white/[0.05] overflow-hidden flex-shrink-0">
                            {currentAvatar ? (
                                <img src={currentAvatar} alt="Current" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#222]">
                                    <User size={32} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.05]"></div></div>
                        <div className="relative flex justify-center text-xs uppercase tracking-widest"><span className="bg-[#0a0a0a] px-3 text-[#333] font-bold">Or Search Characters</span></div>
                    </div>

                    {/* Search Section */}
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444]" size={18} />
                        <input
                            type="text"
                            placeholder="Type character name (e.g. Naruto, Mikasa...)"
                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#b76e79]/50 transition-colors"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>

                    {/* Results Grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {loading && (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4">
                                <Loader2 className="animate-spin text-[#b76e79]" size={32} />
                                <p className="text-xs text-[#555] animate-pulse">Consulting the Jikan Archives...</p>
                            </div>
                        )}

                        {!loading && results.length === 0 && searchQuery.length >= 3 && (
                            <div className="col-span-full py-10 text-center">
                                <p className="text-sm text-[#444]">No characters found matching "{searchQuery}"</p>
                            </div>
                        )}

                        {results.map((char) => (
                            <motion.button
                                key={char.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleSelectCharacter(char)}
                                className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-white/[0.05] bg-[#111]"
                            >
                                <img src={char.image} alt={char.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-2 text-left">
                                    <span className="text-[10px] font-bold text-white line-clamp-1">{char.name}</span>
                                </div>
                                
                                {selectedId === char.id && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <Loader2 className="animate-spin text-[#b76e79]" />
                                    </div>
                                )}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-white/[0.02] border-t border-white/[0.05] text-center">
                    <p className="text-[10px] text-[#444] uppercase tracking-widest font-bold">Standard Characters are sourced from MyAnimeList</p>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AnimeAvatarSelector;
