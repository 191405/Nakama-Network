import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, MessageCircle, Trash2, MoreVertical,
    CornerDownRight, User, Shield, Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../utils/firebase';
import {
    collection, addDoc, query, where, orderBy, onSnapshot,
    serverTimestamp, deleteDoc, doc, limit
} from 'firebase/firestore';

const Comments = ({ contextId, title = "Comments", compact = false }) => {
    const { currentUser, userProfile } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (!contextId) return;

        const q = query(
            collection(db, 'comments'),
            where('contextId', '==', contextId),
            orderBy('createdAt', 'desc'),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const commentsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setComments(commentsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [contextId]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !currentUser) return;

        setSending(true);
        try {
            await addDoc(collection(db, 'comments'), {
                contextId,
                text: newComment.trim(),
                userId: currentUser.uid,
                userName: userProfile?.displayName || currentUser.displayName || 'Anonymous',
                userAvatar: userProfile?.avatar || currentUser.photoURL,
                userRole: userProfile?.role || 'user',
                userClan: userProfile?.clanId || null,
                isPremium: userProfile?.isPremium || false,
                createdAt: serverTimestamp(),
                likes: 0
            });
            setNewComment('');
            
        } catch (error) {
            console.error('Failed to send comment:', error);
        }
        setSending(false);
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm('Delete this comment?')) return;
        try {
            await deleteDoc(doc(db, 'comments', commentId));
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };

    const isAdmin = userProfile?.role === 'admin';

    return (
        <div className={`flex flex-col h-full ${compact ? 'text-sm' : ''}`}>
            {}
            <div className="flex items-center gap-2 mb-4 text-slate-300">
                <MessageCircle size={18} className="text-yellow-500" />
                <h3 className="font-bold">{title}</h3>
                <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-500">
                    {comments.length}
                </span>
            </div>

            {}
            {currentUser ? (
                <form onSubmit={handleSend} className="mb-6 relative group">
                    <div className="relative">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Join the discussion..."
                            className="w-full bg-black/40 border border-slate-800 rounded-xl px-4 py-3 pr-12 text-slate-200 focus:outline-none focus:border-yellow-500/50 focus:bg-black/60 transition-all resize-none h-14 min-h-[56px]"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(e);
                                }
                            }}
                        />
                        <button
                            type="submit"
                            disabled={!newComment.trim() || sending}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-yellow-500 text-black hover:bg-yellow-400 disabled:opacity-50 disabled:hover:bg-yellow-500 transition-colors"
                        >
                            {sending ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Send size={16} />}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="mb-6 p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-center text-slate-500 text-sm">
                    <a href="/" className="text-yellow-500 hover:underline">Log in</a> to comment
                </div>
            )}

            {}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar" ref={scrollRef}>
                <AnimatePresence initial={false}>
                    {loading ? (
                        <div className="text-center py-8 text-slate-500">Loading comments...</div>
                    ) : comments.length === 0 ? (
                        <div className="text-center py-8 text-slate-600 italic">
                            No comments yet. Be the first to speak!
                        </div>
                    ) : (
                        comments.map((comment) => (
                            <motion.div
                                key={comment.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="group flex gap-3"
                            >
                                {}
                                <div className="flex-shrink-0">
                                    <div className={`w-8 h-8 rounded-full overflow-hidden border ${comment.isPremium ? 'border-yellow-500' : 'border-slate-700'}`}>
                                        {comment.userAvatar ? (
                                            <img src={comment.userAvatar} alt={comment.userName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                                <User size={14} className="text-slate-500" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-2 mb-0.5">
                                        <span className={`font-bold text-sm ${comment.isPremium ? 'text-yellow-500' : 'text-slate-300'}`}>
                                            {comment.userName}
                                        </span>
                                        {comment.userRole === 'admin' && (
                                            <Shield size={12} className="text-red-500" />
                                        )}
                                        {comment.userClan && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                                {comment.userClan}
                                            </span>
                                        )}
                                        <span className="text-[10px] text-slate-600 ml-auto">
                                            {comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleDateString() : 'Just now'}
                                        </span>
                                    </div>

                                    <p className="text-slate-400 text-sm break-words leading-relaxed">
                                        {comment.text}
                                    </p>

                                    {}
                                    <div className="flex items-center gap-4 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {(currentUser?.uid === comment.userId || isAdmin) && (
                                            <button
                                                onClick={() => handleDelete(comment.id)}
                                                className="text-red-500/50 hover:text-red-500 text-xs flex items-center gap-1"
                                            >
                                                <Trash2 size={12} /> Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Comments;
