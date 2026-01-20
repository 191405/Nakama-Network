import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play, Pause, Volume2, VolumeX, Maximize, Minimize,
    SkipForward, SkipBack, Settings, PictureInPicture2,
    Rewind, FastForward, ChevronLeft, ChevronRight
} from 'lucide-react';

const AdvancedMediaPlayer = ({
    sources = {}, 
    title = '',
    thumbnail = '',
    onProgress = () => { },
    initialTime = 0,
    onEnded = () => { },
    onNext = null,
    onPrevious = null,
    hasNext = false,
    hasPrevious = false,
    skipIntroTime = 90 
}) => {
    const videoRef = useRef(null);
    const playerRef = useRef(null);
    const controlsTimeoutRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [buffered, setBuffered] = useState(0);
    const [isBuffering, setIsBuffering] = useState(false);
    const [isPiP, setIsPiP] = useState(false);

    const availableQualities = Object.keys(sources).sort((a, b) => {
        const order = { '1080p': 1, '720p': 2, '480p': 3, '360p': 4 };
        return (order[a] || 5) - (order[b] || 5);
    });
    const [currentQuality, setCurrentQuality] = useState(availableQualities[0] || '720p');

    const currentSource = sources[currentQuality] || Object.values(sources)[0] || '';

    const showControlsTemporarily = useCallback(() => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
                setShowSettings(false);
            }, 3000);
        }
    }, [isPlaying]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const onTimeUpdate = () => {
            setCurrentTime(video.currentTime);
            
            if (Math.floor(video.currentTime) % 10 === 0) {
                onProgress(video.currentTime);
            }
        };

        const onLoadedMetadata = () => {
            setDuration(video.duration);
            if (initialTime > 0 && initialTime < video.duration) {
                video.currentTime = initialTime;
            }
        };

        const onBufferUpdate = () => {
            if (video.buffered.length > 0) {
                const bufferedEnd = video.buffered.end(video.buffered.length - 1);
                setBuffered((bufferedEnd / video.duration) * 100);
            }
        };

        const onWaiting = () => setIsBuffering(true);
        const onCanPlay = () => setIsBuffering(false);
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onVideoEnded = () => {
            setIsPlaying(false);
            onEnded();
        };

        video.addEventListener('timeupdate', onTimeUpdate);
        video.addEventListener('loadedmetadata', onLoadedMetadata);
        video.addEventListener('progress', onBufferUpdate);
        video.addEventListener('waiting', onWaiting);
        video.addEventListener('canplay', onCanPlay);
        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);
        video.addEventListener('ended', onVideoEnded);

        return () => {
            video.removeEventListener('timeupdate', onTimeUpdate);
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('progress', onBufferUpdate);
            video.removeEventListener('waiting', onWaiting);
            video.removeEventListener('canplay', onCanPlay);
            video.removeEventListener('play', onPlay);
            video.removeEventListener('pause', onPause);
            video.removeEventListener('ended', onVideoEnded);
        };
    }, [initialTime, onEnded, onProgress]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

            switch (e.key.toLowerCase()) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'f':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case 'm':
                    e.preventDefault();
                    toggleMute();
                    break;
                case 'arrowleft':
                    e.preventDefault();
                    skip(-10);
                    break;
                case 'arrowright':
                    e.preventDefault();
                    skip(10);
                    break;
                case 'arrowup':
                    e.preventDefault();
                    adjustVolume(0.1);
                    break;
                case 'arrowdown':
                    e.preventDefault();
                    adjustVolume(-0.1);
                    break;
                case 'j':
                    e.preventDefault();
                    skip(-10);
                    break;
                case 'l':
                    e.preventDefault();
                    skip(10);
                    break;
                case 'p':
                    if (e.shiftKey) {
                        e.preventDefault();
                        togglePiP();
                    }
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const adjustVolume = (delta) => {
        const newVolume = Math.max(0, Math.min(1, volume + delta));
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
        }
    };

    const skip = (seconds) => {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
        }
    };

    const skipIntro = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = skipIntroTime;
        }
    };

    const handleSeek = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        if (videoRef.current) {
            videoRef.current.currentTime = percent * duration;
        }
    };

    const toggleFullscreen = async () => {
        if (!playerRef.current) return;

        try {
            if (!document.fullscreenElement) {
                await playerRef.current.requestFullscreen();
                setIsFullscreen(true);
            } else {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        } catch (err) {
            console.error('Fullscreen error:', err);
        }
    };

    const togglePiP = async () => {
        if (!videoRef.current) return;

        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
                setIsPiP(false);
            } else if (document.pictureInPictureEnabled) {
                await videoRef.current.requestPictureInPicture();
                setIsPiP(true);
            }
        } catch (err) {
            console.error('PiP error:', err);
        }
    };

    const changeQuality = (quality) => {
        const currentTimeStamp = videoRef.current?.currentTime || 0;
        const wasPlaying = isPlaying;

        setCurrentQuality(quality);
        setShowSettings(false);

        setTimeout(() => {
            if (videoRef.current) {
                videoRef.current.currentTime = currentTimeStamp;
                if (wasPlaying) {
                    videoRef.current.play();
                }
            }
        }, 100);
    };

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        if (h > 0) {
            return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }
        return `${m}:${String(s).padStart(2, '0')}`;
    };

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div
            ref={playerRef}
            className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group"
            onMouseMove={showControlsTemporarily}
            onMouseLeave={() => isPlaying && setShowControls(false)}
        >
            {}
            <video
                ref={videoRef}
                src={currentSource}
                poster={thumbnail}
                className="w-full h-full object-contain"
                onClick={togglePlay}
                playsInline
            />

            {}
            <AnimatePresence>
                {isBuffering && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/40"
                    >
                        <div className="w-16 h-16 rounded-full border-4 border-yellow-500/30 border-t-yellow-500 animate-spin" />
                    </motion.div>
                )}
            </AnimatePresence>

            {}
            <AnimatePresence>
                {!isPlaying && !isBuffering && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-0 flex items-center justify-center cursor-pointer"
                        onClick={togglePlay}
                    >
                        <div className="w-20 h-20 rounded-full bg-yellow-500/90 flex items-center justify-center shadow-2xl">
                            <Play className="text-black ml-1" size={40} fill="black" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {}
            <AnimatePresence>
                {currentTime > 5 && currentTime < skipIntroTime && (
                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onClick={skipIntro}
                        className="absolute bottom-24 right-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white font-semibold hover:bg-white/30 transition-colors"
                    >
                        Skip Intro →
                    </motion.button>
                )}
            </AnimatePresence>

            {}
            <AnimatePresence>
                {showControls && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"
                    >
                        {}
                        <div className="absolute top-0 left-0 right-0 p-4">
                            <h3 className="text-white font-bold text-lg truncate">{title}</h3>
                        </div>

                        {}
                        <div className="absolute inset-0 flex items-center justify-center gap-8">
                            {hasPrevious && onPrevious && (
                                <button onClick={onPrevious} className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white">
                                    <ChevronLeft size={32} />
                                </button>
                            )}
                            <button onClick={() => skip(-10)} className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white">
                                <Rewind size={28} />
                            </button>
                            <button onClick={togglePlay} className="p-4 rounded-full bg-white/20 hover:bg-white/30 text-white">
                                {isPlaying ? <Pause size={36} /> : <Play size={36} className="ml-1" />}
                            </button>
                            <button onClick={() => skip(10)} className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white">
                                <FastForward size={28} />
                            </button>
                            {hasNext && onNext && (
                                <button onClick={onNext} className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white">
                                    <ChevronRight size={32} />
                                </button>
                            )}
                        </div>

                        {}
                        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                            {}
                            <div
                                className="relative h-1.5 bg-white/20 rounded-full cursor-pointer group/progress"
                                onClick={handleSeek}
                            >
                                {}
                                <div
                                    className="absolute h-full bg-white/30 rounded-full"
                                    style={{ width: `${buffered}%` }}
                                />
                                {}
                                <div
                                    className="absolute h-full bg-yellow-500 rounded-full"
                                    style={{ width: `${progressPercent}%` }}
                                />
                                {}
                                <div
                                    className="absolute w-4 h-4 bg-yellow-500 rounded-full -top-1.5 transform -translate-x-1/2 opacity-0 group-hover/progress:opacity-100 transition-opacity"
                                    style={{ left: `${progressPercent}%` }}
                                />
                            </div>

                            {}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button onClick={togglePlay} className="text-white hover:text-yellow-400 transition-colors">
                                        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                                    </button>

                                    <div className="flex items-center gap-2 group/volume">
                                        <button onClick={toggleMute} className="text-white hover:text-yellow-400 transition-colors">
                                            {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
                                        </button>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.05"
                                            value={isMuted ? 0 : volume}
                                            onChange={(e) => {
                                                const v = parseFloat(e.target.value);
                                                setVolume(v);
                                                if (videoRef.current) videoRef.current.volume = v;
                                                setIsMuted(v === 0);
                                            }}
                                            className="w-20 accent-yellow-500 opacity-0 group-hover/volume:opacity-100 transition-opacity"
                                        />
                                    </div>

                                    <span className="text-white text-sm font-mono">
                                        {formatTime(currentTime)} / {formatTime(duration)}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    {}
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowSettings(!showSettings)}
                                            className="flex items-center gap-1 text-white hover:text-yellow-400 transition-colors"
                                        >
                                            <Settings size={20} />
                                            <span className="text-sm font-bold">{currentQuality}</span>
                                        </button>

                                        <AnimatePresence>
                                            {showSettings && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="absolute bottom-full right-0 mb-2 bg-slate-900 rounded-lg overflow-hidden shadow-xl min-w-[120px]"
                                                >
                                                    <div className="px-3 py-2 text-xs text-slate-400 border-b border-slate-700">Quality</div>
                                                    {availableQualities.map(q => (
                                                        <button
                                                            key={q}
                                                            onClick={() => changeQuality(q)}
                                                            className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-700 transition-colors ${q === currentQuality ? 'text-yellow-400 bg-slate-800' : 'text-white'
                                                                }`}
                                                        >
                                                            {q}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {}
                                    {document.pictureInPictureEnabled && (
                                        <button
                                            onClick={togglePiP}
                                            className={`text-white hover:text-yellow-400 transition-colors ${isPiP ? 'text-yellow-400' : ''}`}
                                            title="Picture in Picture (Shift+P)"
                                        >
                                            <PictureInPicture2 size={20} />
                                        </button>
                                    )}

                                    {}
                                    <button
                                        onClick={toggleFullscreen}
                                        className="text-white hover:text-yellow-400 transition-colors"
                                        title="Fullscreen (F)"
                                    >
                                        {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdvancedMediaPlayer;
