import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, Star, ChevronRight } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function GuestGuard({ children, feature = 'this feature' }) {
    const { isGuest } = useAuth();
    const navigation = useNavigation();

    if (!isGuest) {
        return children;
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
            <LinearGradient
                colors={['#1e1b4b', '#0f172a']}
                style={{ position: 'absolute', width: '100%', height: '100%' }}
            />

            {}
            <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(99, 102, 241, 0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
                <Lock color="#818cf8" size={48} />
            </View>

            {}
            <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 12 }}>
                Feature Locked
            </Text>

            {}
            <Text style={{ color: '#94a3b8', fontSize: 15, textAlign: 'center', lineHeight: 24, marginBottom: 32, paddingHorizontal: 20 }}>
                Create an account to access {feature} and unlock all features of Nakama Network.
            </Text>

            {}
            <View style={{ backgroundColor: 'rgba(30, 41, 59, 0.6)', borderRadius: 16, padding: 20, marginBottom: 32, width: '100%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 16 }}>WHAT YOU'LL UNLOCK</Text>

                <BenefitRow icon="💬" text="Chat with the community" />
                <BenefitRow icon="🏆" text="Track your progress & achievements" />
                <BenefitRow icon="⚔️" text="Join clans & compete" />
                <BenefitRow icon="📺" text="Manage your watchlist" />
                <BenefitRow icon="🎮" text="Play games & earn XP" />
            </View>

            {/* Create Account Button */}
            <TouchableOpacity
                onPress={() => navigation.navigate('GuestUpgrade')}
                style={{ width: '100%' }}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={['#6366f1', '#8b5cf6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ borderRadius: 16, paddingVertical: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
                >
                    <Star color="#fff" size={20} fill="#fff" />
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 17, marginLeft: 10, marginRight: 8 }}>
                        Create Account
                    </Text>
                    <ChevronRight color="#fff" size={20} />
                </LinearGradient>
            </TouchableOpacity>

            {/* Continue Browsing */}
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ marginTop: 16, paddingVertical: 12 }}
            >
                <Text style={{ color: '#64748b', fontSize: 14 }}>Continue Browsing</Text>
            </TouchableOpacity>
        </View>
    );
}

const BenefitRow = ({ icon, text }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 18, marginRight: 12 }}>{icon}</Text>
        <Text style={{ color: '#e2e8f0', fontSize: 14 }}>{text}</Text>
    </View>
);
