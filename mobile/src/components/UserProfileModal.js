import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Shield, Star, Calendar, MessageCircle, Trophy, Clock } from 'lucide-react-native';
import api from '../services/api';

export default function UserProfileModal({ visible, onClose, userId, userName }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (visible && userId) {
            loadProfile();
        }
    }, [visible, userId]);

    const loadProfile = async () => {
        setLoading(true);
        try {
            
            const data = await api.safeRequest(`/interaction/stats/${userId}`, {}, null);
            setProfile(data);
        } catch (e) {
            console.error('Failed to load profile:', e);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <TouchableWithoutFeedback>
                        <View style={{ backgroundColor: '#1e293b', borderRadius: 24, width: '100%', maxWidth: 320, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
                            {}
                            <LinearGradient
                                colors={['#6366f1', '#8b5cf6']}
                                style={{ height: 80, position: 'relative' }}
                            >
                                <TouchableOpacity
                                    onPress={onClose}
                                    style={{ position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: 6 }}
                                >
                                    <X color="#fff" size={18} />
                                </TouchableOpacity>
                            </LinearGradient>

                            {}
                            <View style={{ alignItems: 'center', marginTop: -40 }}>
                                <View style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#1e293b' }}>
                                    <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#fff' }}>
                                        {((typeof userName === 'string' ? userName : (userName?.name || 'U')) || 'U')[0]?.toUpperCase() || 'U'}
                                    </Text>
                                </View>
                            </View>

                            {}
                            <View style={{ padding: 20, alignItems: 'center' }}>
                                <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>
                                    {(userName && typeof userName === 'object') ? (userName.name || userName.user_name || 'User') : (userName || 'User')}
                                </Text>

                                {loading ? (
                                    <ActivityIndicator color="#6366f1" style={{ marginTop: 20 }} />
                                ) : profile ? (
                                    <>
                                        {}
                                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(99, 102, 241, 0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginTop: 8 }}>
                                            <Shield color={profile.rank_color || '#818cf8'} size={14} />
                                            <Text style={{ color: profile.rank_color || '#818cf8', fontSize: 13, fontWeight: '600', marginLeft: 6 }}>
                                                {(profile.rank && typeof profile.rank === 'object') ? (profile.rank.title || profile.rank.name || 'Academy Student') : (profile.rank || 'Academy Student')}
                                            </Text>
                                        </View>

                                        {}
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' }}>
                                            <View style={{ alignItems: 'center' }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <Star color="#fbbf24" size={16} />
                                                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginLeft: 4 }}>{profile.level || 1}</Text>
                                                </View>
                                                <Text style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>Level</Text>
                                            </View>
                                            <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.05)' }} />
                                            <View style={{ alignItems: 'center' }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <Trophy color="#22c55e" size={16} />
                                                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginLeft: 4 }}>{profile.xp || 0}</Text>
                                                </View>
                                                <Text style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>XP</Text>
                                            </View>
                                        </View>
                                    </>
                                ) : (
                                    <View style={{ marginTop: 20, alignItems: 'center' }}>
                                        <Text style={{ color: '#64748b', fontSize: 14 }}>Profile data unavailable</Text>
                                    </View>
                                )}

                                {}
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' }}>
                                    <Shield color="#64748b" size={14} />
                                    <Text style={{ color: '#64748b', fontSize: 11, marginLeft: 6 }}>Limited public profile</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}
