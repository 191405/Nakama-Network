import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sword, Shield, Target, Trophy, Skull, Flame,
    Users, Clock, AlertTriangle, Crosshair, Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../utils/firebase';
import {
    collection, query, where, onSnapshot, addDoc,
    doc, updateDoc, increment, serverTimestamp
} from 'firebase/firestore';
import Comments from '../components/Comments';

const ClanWars = () => {
    const { currentUser, userProfile } = useAuth();
    const [activeWar, setActiveWar] = useState(null);
    const [availableClans, setAvailableClans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [myClan, setMyClan] = useState(null);

    useEffect(() => {
        if (!userProfile?.clanId) return;
        const unsub = onSnapshot(doc(db, 'clans', userProfile.clanId), (doc) => {
            if (doc.exists()) setMyClan({ id: doc.id, ...doc.data() });
        });
        return () => unsub();
    }, [userProfile?.clanId]);

    useEffect(() => {
        if (!userProfile?.clanId) return;

        const q = query(
            collection(db, 'wars'),
            where('participants', 'array-contains', userProfile.clanId),
            where('status', '==', 'active')
        );

        const unsub = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const warData = snapshot.docs[0].data();
                setActiveWar({ id: snapshot.docs[0].id, ...warData });
            } else {
                setActiveWar(null);
            }
            setLoading(false);
        });

        return () => unsub();
    }, [userProfile?.clanId]);

    useEffect(() => {
        if (activeWar || !myClan) return;

        const q = query(collection(db, 'clans'), where('memberCount', '>=', 1));
        const unsub = onSnapshot(q, (snapshot) => {
            const clans = snapshot.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .filter(c => c.id !== userProfile?.clanId);
            setAvailableClans(clans);
        });
        return () => unsub();
    }, [activeWar, myClan, userProfile?.clanId]);

    const handleDeclareWar = async (opponentId, opponentName) => {
        if (!myClan || myClan.leaderId !== currentUser.uid) return;
        if (window.confirm(`Declare war on ${opponentName}? This costs 500 Clan Chakra.`)) {
            setActionLoading(true);
            try {
                
                const warRef = await addDoc(collection(db, 'wars'), {
                    challengerId: myClan.id,
                    challengerName: myClan.name,
                    defenderId: opponentId,
                    defenderName: opponentName,
                    status: 'active',
                    participants: [myClan.id, opponentId],
                    scores: { [myClan.id]: 0, [opponentId]: 0 },
                    startTime: serverTimestamp(),
                    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), 
                    totalDamage: 0
                });

                await updateDoc(doc(db, 'clans', myClan.id), { activeWarId: warRef.id });
                await updateDoc(doc(db, 'clans', opponentId), { activeWarId: warRef.id });

            } catch (error) {
                console.error('Error declaring war:', error);
                alert('Failed to declare war');
            }
            setActionLoading(false);
        }
    };

    const handleEndWar = async () => {
        if (!activeWar) return;
        if (!window.confirm('Conclude this war? This will finalize scores and declare a winner.')) return;

        setActionLoading(true);
        try {
            const scores = activeWar.scores;
            const challengerScore = scores[activeWar.challengerId] || 0;
            const defenderScore = scores[activeWar.defenderId] || 0;

            let winnerId = null;
            if (challengerScore > defenderScore) winnerId = activeWar.challengerId;
            else if (defenderScore > challengerScore) winnerId = activeWar.defenderId;

            await updateDoc(doc(db, 'wars', activeWar.id), {
                status: 'completed',
                winnerId,
                endedAt: serverTimestamp()
            });

            const updates = [];
            
            updates.push(updateDoc(doc(db, 'clans', activeWar.challengerId), {
                activeWarId: null,
                wins: winnerId === activeWar.challengerId ? increment(1) : increment(0),
                losses: winnerId !== activeWar.challengerId && winnerId ? increment(1) : increment(0)
            }));
            
            updates.push(updateDoc(doc(db, 'clans', activeWar.defenderId), {
                activeWarId: null,
                wins: winnerId === activeWar.defenderId ? increment(1) : increment(0),
                losses: winnerId !== activeWar.defenderId && winnerId ? increment(1) : increment(0)
            }));

            await Promise.all(updates);
            alert(`War Concluded! Winner: ${winnerId ? (winnerId === activeWar.challengerId ? activeWar.challengerName : activeWar.defenderName) : 'Draw'}`);
            setActiveWar(null); 

        } catch (error) {
            console.error('Failed to end war:', error);
            alert('Error ending war');
        }
        setActionLoading(false);
    };

    const handleBattleAction = async (type) => {
        if (!activeWar || !currentUser) return;

        if (userProfile.chakra < 10) {
            alert('Not enough chakra!');
            return;
        }

        setActionLoading(true);
        try {
            const points = type === 'attack' ? 10 : 5;

            const warRef = doc(db, 'wars', activeWar.id);
            await updateDoc(warRef, {
                [`scores.${myClan.id}`]: increment(points),
                totalDamage: increment(points),
                lastAction: {
                    type,
                    user: userProfile.displayName || 'Unknown',
                    clan: myClan.name,
                    time: new Date().toISOString()
                }
            });

            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                chakra: increment(-10),
                warContribution: increment(points)
            });

        } catch (error) {
            console.error('Battle action failed:', error);
        }
        setActionLoading(false);
    };

    if (!userProfile?.clanId) {
        return (
            <div className="min-h-screen pt-24 pb-10 px-4 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <Shield size={64} className="mx-auto text-slate-600 mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Clan Membership Required</h2>
                    <p className="text-slate-400 mb-6">You must belong to a clan to participate in Clan Wars.</p>
                    <a href="/clan" className="px-6 py-3 bg-yellow-500 text-black font-bold rounded-xl">
                        Find a Clan
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 pb-20 px-4 relative z-20">
            {}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542259681-d4cd7193bc86?q=80&w=2568&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-slate-900/90 to-black" />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-white italic tracking-wider uppercase flex items-center gap-3">
                            <Sword className="text-red-500" />
                            Clan Wars
                        </h1>
                        <p className="text-slate-400 mt-2">Dominate the battlefield. Claim territory. Become Legend.</p>
                    </div>
                    {myClan && (
                        <div className="text-right hidden md:block">
                            <div className="text-2xl font-bold text-yellow-500">{myClan.name}</div>
                            <div className="text-sm text-slate-500">{myClan.tag} • Rank #{myClan.rank || '-'}</div>
                        </div>
                    )}
                </div>

                {activeWar ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-black/50 backdrop-blur-md border border-red-500/30 rounded-3xl p-6 md:p-10 relative overflow-hidden"
                    >
                        {}
                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <div className="flex items-center gap-2 text-red-500 font-bold animate-pulse">
                                <span className="w-3 h-3 bg-red-500 rounded-full" />
                                LIVE BATTLE
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 bg-black/40 px-4 py-1 rounded-full border border-white/10">
                                <Clock size={16} />
                                <span>23h 45m remaining</span>
                            </div>
                        </div>

                        {}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center mb-12 relative z-10">
                            {}
                            <div className="text-center">
                                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-600 to-blue-900 rounded-2xl flex items-center justify-center border-4 border-blue-400 mb-4 shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                                    <Shield size={40} className="text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">{activeWar.challengerName}</h3>
                                <div className="text-4xl font-black text-blue-400 mt-2">
                                    {Math.floor(activeWar.scores[activeWar.challengerId] || 0)}
                                </div>
                                <p className="text-xs text-blue-300/60 uppercase tracking-widest mt-1">War Points</p>
                            </div>

                            {}
                            <div className="flex flex-col items-center justify-center">
                                <div className="text-6xl font-black text-red-500 italic drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
                                    VS
                                </div>
                                {activeWar.lastAction && (
                                    <motion.div
                                        key={activeWar.totalDamage}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-4 px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-xs text-slate-300"
                                    >
                                        <span className="text-yellow-400 font-bold">{activeWar.lastAction.user}</span> just {activeWar.lastAction.type}ed!
                                    </motion.div>
                                )}
                            </div>

                            {}
                            <div className="text-center">
                                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-600 to-red-900 rounded-2xl flex items-center justify-center border-4 border-red-400 mb-4 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                                    <Swords size={40} className="text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">{activeWar.defenderName}</h3>
                                <div className="text-4xl font-black text-red-400 mt-2">
                                    {Math.floor(activeWar.scores[activeWar.defenderId] || 0)}
                                </div>
                                <p className="text-xs text-red-300/60 uppercase tracking-widest mt-1">War Points</p>
                            </div>
                        </div>

                        {}
                        <div className="h-4 bg-slate-800 rounded-full overflow-hidden mb-8 relative z-10 border border-slate-700">
                            <div className="absolute inset-0 flex">
                                <motion.div
                                    className="bg-blue-600 h-full relative"
                                    initial={{ width: '50%' }}
                                    animate={{
                                        width: `${(activeWar.scores[activeWar.challengerId] / ((activeWar.scores[activeWar.challengerId] + activeWar.scores[activeWar.defenderId]) || 1)) * 100}%`
                                    }}
                                >
                                    <div className="absolute inset-0 bg-Linear-gradient(45deg,rgba(255,255,255,0.2) 25%,transparent 25%,transparent 50%,rgba(255,255,255,0.2) 50%,rgba(255,255,255,0.2) 75%,transparent 75%,transparent)" style={{ backgroundSize: '20px 20px' }} />
                                </motion.div>
                                <motion.div
                                    className="bg-red-600 h-full flex-1 relative"
                                >
                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)]" style={{ backgroundSize: '20px 20px' }} />
                                </motion.div>
                            </div>
                        </div>

                        {}
                        <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto relative z-10">
                            <button
                                onClick={() => handleBattleAction('attack')}
                                disabled={actionLoading || userProfile?.chakra < 10}
                                className="group relative overflow-hidden bg-red-600 hover:bg-red-500 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 border-b-4 border-red-800"
                            >
                                <Crosshair size={24} className="group-hover:rotate-45 transition-transform" />
                                <div>
                                    <div className="text-lg">ATTACK</div>
                                    <div className="text-xs opacity-70 font-normal">-10 Chakra</div>
                                </div>
                            </button>
                            <button
                                onClick={() => handleBattleAction('defend')}
                                disabled={actionLoading || userProfile?.chakra < 10}
                                className="group relative overflow-hidden bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 border-b-4 border-blue-800"
                            >
                                <Shield size={24} className="group-hover:scale-110 transition-transform" />
                                <div>
                                    <div className="text-lg">DEFEND</div>
                                    <div className="text-xs opacity-70 font-normal">-10 Chakra</div>
                                </div>
                            </button>
                        </div>

                        {}
                        <div className="flex justify-center mt-8 space-x-4">
                            {(myClan.leaderId === currentUser.uid || (activeWar.endTime && activeWar.endTime.toDate && activeWar.endTime.toDate() < new Date())) && (
                                <button
                                    onClick={handleEndWar}
                                    className="px-6 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-300 text-sm font-bold transition-colors"
                                >
                                    ⚠ CONCLUDE WAR / SURRENDER
                                </button>
                            )}
                        </div>

                        {}
                        <div className="mt-8 pt-8 border-t border-white/10">
                            <Comments contextId={`war_${activeWar.id}`} title="War Room - Propaganda Center" />
                        </div>

                    </motion.div>
                ) : (
                    <div className="space-y-8">
                        {}
                        <div className="bg-slate-900/50 rounded-3xl p-10 text-center border border-slate-800">
                            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Target size={32} className="text-slate-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">No Active Battles</h2>
                            <p className="text-slate-400 max-w-md mx-auto mb-8">
                                Your clan is currently at peace. Clan leaders can declare war on other clans to fight for glory and rewards.
                            </p>

                            {myClan?.leaderId === currentUser?.uid && (
                                <div className="max-w-4xl mx-auto">
                                    <h3 className="text-left text-slate-500 text-sm font-bold uppercase tracking-wider mb-4 pl-2">Available Targets</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {availableClans.map(clan => (
                                            <div key={clan.id} className="bg-black/40 p-4 rounded-xl border border-slate-800 flex items-center justify-between hover:border-red-500/50 transition-colors group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 font-bold">
                                                        {clan.tag}
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="font-bold text-white max-w-[150px] truncate">{clan.name}</div>
                                                        <div className="text-xs text-slate-500">{clan.memberCount} Members • {clan.rank || 'Unranked'}</div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeclareWar(clan.id, clan.name)}
                                                    className="px-4 py-2 bg-red-600/20 text-red-500 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 hover:text-white"
                                                >
                                                    DECLARE WAR
                                                </button>
                                            </div>
                                        ))}
                                        {availableClans.length === 0 && (
                                            <div className="col-span-2 text-slate-500 text-sm italic">No valid opponents found.</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const Swords = ({ size, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
        <line x1="13" y1="19" x2="19" y2="13" />
        <line x1="16" y1="16" x2="20" y2="20" />
        <line x1="19" y1="21" x2="21" y2="19" />
        <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" />
        <line x1="5" y1="14" x2="9" y2="18" />
        <line x1="7" y1="17" x2="4" y2="20" />
        <line x1="3" y1="19" x2="5" y2="21" />
    </svg>
);

export default ClanWars;
