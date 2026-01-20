import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../contexts/AuthContext';
import { X, Mail, Lock, User, Eye, EyeOff, ChevronRight, Star, Users, Trophy, MessageCircle } from 'lucide-react-native';

const BenefitItem = ({ icon: Icon, title, description }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(99, 102, 241, 0.15)', justifyContent: 'center', alignItems: 'center' }}>
            <Icon color="#818cf8" size={22} />
        </View>
        <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>{title}</Text>
            <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>{description}</Text>
        </View>
    </View>
);

export default function GuestUpgradeScreen({ navigation }) {
    const { signup, logout } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }, []);

    const handleSignup = async () => {
        if (!email || !password || !displayName) {
            Alert.alert('Missing Fields', 'Please fill in all required fields.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Password Mismatch', 'Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Weak Password', 'Password must be at least 6 characters.');
            return;
        }

        try {
            setLoading(true);
            await signup(email, password, displayName);
            Alert.alert('Welcome!', 'Your account has been created successfully.', [
                { text: 'Continue', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSwitchToLogin = () => {
        
        logout();
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
            <StatusBar style="light" />
            <LinearGradient
                colors={['#1e1b4b', '#0f172a']}
                style={{ position: 'absolute', width: '100%', height: '100%' }}
            />

            {}
            <View style={{ paddingTop: 50, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
                    <X color="#94a3b8" size={24} />
                </TouchableOpacity>
                <Text style={{ flex: 1, color: '#fff', fontSize: 20, fontWeight: '700', textAlign: 'center', marginRight: 28 }}>
                    Upgrade Account
                </Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
                    <Animated.View style={{ opacity: fadeAnim }}>
                        {}
                        <View style={{ alignItems: 'center', marginBottom: 32 }}>
                            <LinearGradient
                                colors={['#6366f1', '#8b5cf6']}
                                style={{ width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}
                            >
                                <Star color="#fff" size={36} fill="#fff" />
                            </LinearGradient>
                            <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', textAlign: 'center' }}>
                                Unlock Full Power
                            </Text>
                            <Text style={{ color: '#94a3b8', fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 22 }}>
                                Create an account to save your progress{'\n'}and unlock all features
                            </Text>
                        </View>

                        {}
                        <View style={{ backgroundColor: 'rgba(30, 41, 59, 0.6)', borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                            <Text style={{ color: '#64748b', fontSize: 12, fontWeight: '700', marginBottom: 16, letterSpacing: 1 }}>WHAT YOU'LL GET</Text>
                            <BenefitItem icon={Trophy} title="Save Your Progress" description="Keep your XP, achievements & rank" />
                            <BenefitItem icon={Users} title="Join Clans" description="Connect with other anime fans" />
                            <BenefitItem icon={MessageCircle} title="Global Chat" description="Chat with the community" />
                            <BenefitItem icon={Star} title="Personalized Recommendations" description="AI-powered anime suggestions" />
                        </View>

                        {/* Signup Form */}
                        <View style={{ backgroundColor: 'rgba(30, 41, 59, 0.6)', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                            {/* Display Name */}
                            <View style={{ marginBottom: 16 }}>
                                <Text style={{ color: '#93c5fd', marginLeft: 4, marginBottom: 8, fontSize: 13, fontWeight: '500' }}>Username *</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(15, 23, 42, 0.6)', borderWidth: 1, borderColor: '#334155', borderRadius: 14, paddingHorizontal: 14 }}>
                                    <User color="#64748b" size={20} />
                                    <TextInput
                                        placeholder="Your ninja name"
                                        placeholderTextColor="#64748b"
                                        value={displayName}
                                        onChangeText={setDisplayName}
                                        style={{ flex: 1, paddingVertical: 14, paddingHorizontal: 12, color: '#fff', fontSize: 16 }}
                                        autoCapitalize="none"
                                    />
                                </View>
                            </View>

                            {/* Email */}
                            <View style={{ marginBottom: 16 }}>
                                <Text style={{ color: '#93c5fd', marginLeft: 4, marginBottom: 8, fontSize: 13, fontWeight: '500' }}>Email *</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(15, 23, 42, 0.6)', borderWidth: 1, borderColor: '#334155', borderRadius: 14, paddingHorizontal: 14 }}>
                                    <Mail color="#64748b" size={20} />
                                    <TextInput
                                        placeholder="shinobi@email.com"
                                        placeholderTextColor="#64748b"
                                        value={email}
                                        onChangeText={setEmail}
                                        style={{ flex: 1, paddingVertical: 14, paddingHorizontal: 12, color: '#fff', fontSize: 16 }}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                    />
                                </View>
                            </View>

                            {/* Password */}
                            <View style={{ marginBottom: 16 }}>
                                <Text style={{ color: '#93c5fd', marginLeft: 4, marginBottom: 8, fontSize: 13, fontWeight: '500' }}>Password *</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(15, 23, 42, 0.6)', borderWidth: 1, borderColor: '#334155', borderRadius: 14, paddingHorizontal: 14 }}>
                                    <Lock color="#64748b" size={20} />
                                    <TextInput
                                        placeholder="••••••••"
                                        placeholderTextColor="#64748b"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        style={{ flex: 1, paddingVertical: 14, paddingHorizontal: 12, color: '#fff', fontSize: 16 }}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff color="#64748b" size={20} /> : <Eye color="#64748b" size={20} />}
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Confirm Password */}
                            <View style={{ marginBottom: 24 }}>
                                <Text style={{ color: '#93c5fd', marginLeft: 4, marginBottom: 8, fontSize: 13, fontWeight: '500' }}>Confirm Password *</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(15, 23, 42, 0.6)', borderWidth: 1, borderColor: '#334155', borderRadius: 14, paddingHorizontal: 14 }}>
                                    <Lock color="#64748b" size={20} />
                                    <TextInput
                                        placeholder="••••••••"
                                        placeholderTextColor="#64748b"
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry={!showPassword}
                                        style={{ flex: 1, paddingVertical: 14, paddingHorizontal: 12, color: '#fff', fontSize: 16 }}
                                    />
                                </View>
                            </View>

                            {/* Submit Button */}
                            <TouchableOpacity onPress={handleSignup} disabled={loading} activeOpacity={0.8}>
                                <LinearGradient
                                    colors={['#6366f1', '#8b5cf6']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{ borderRadius: 14, paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 17, marginRight: 8 }}>
                                        {loading ? 'Creating Account...' : 'Create Account'}
                                    </Text>
                                    <ChevronRight color="#fff" size={20} />
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>

                        {/* Switch to Login */}
                        <TouchableOpacity onPress={handleSwitchToLogin} style={{ marginTop: 24, alignItems: 'center' }}>
                            <Text style={{ color: '#64748b', fontSize: 14 }}>
                                Already have an account? <Text style={{ color: '#93c5fd', fontWeight: '600' }}>Log in</Text>
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
