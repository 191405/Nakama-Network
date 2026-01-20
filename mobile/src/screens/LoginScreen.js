import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '../contexts/AuthContext';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
    const { login, loginAsGuest } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleLogin = async () => {
        try {
            setLoading(true);
            await login(email, password);
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
            <StatusBar style="light" />
            <LinearGradient
                colors={['#0f172a', '#1e1b4b', '#312e81']}
                style={{ position: 'absolute', width: '100%', height: '100%' }}
            />

            <View style={{ position: 'absolute', top: -100, left: -100, width: 300, height: 300, backgroundColor: '#7c3aed', borderRadius: 150, opacity: 0.2 }} />
            <View style={{ position: 'absolute', bottom: -100, right: -100, width: 300, height: 300, backgroundColor: '#3b82f6', borderRadius: 150, opacity: 0.2 }} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}
            >
                <Animated.View style={{ alignItems: 'center', marginBottom: 48, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <Text style={{ fontSize: 48, fontWeight: 'bold', color: '#fff', letterSpacing: 8 }}>NAKAMA</Text>
                    <Text style={{ fontSize: 20, color: '#93c5fd', letterSpacing: 5, marginTop: 8, fontWeight: '300' }}>NETWORK</Text>
                </Animated.View>

                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <View style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', padding: 24 }}>
                        <View style={{ marginBottom: 16 }}>
                            <Text style={{ color: '#93c5fd', marginLeft: 4, marginBottom: 8, fontSize: 14, fontWeight: '500' }}>Email Address</Text>
                            <TextInput
                                placeholder="shinobi@hiddenleaf.com"
                                placeholderTextColor="#64748b"
                                value={email}
                                onChangeText={setEmail}
                                style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', borderWidth: 1, borderColor: '#334155', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, color: '#fff', fontWeight: '500', fontSize: 16 }}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        <View style={{ marginBottom: 16 }}>
                            <Text style={{ color: '#93c5fd', marginLeft: 4, marginBottom: 8, fontSize: 14, fontWeight: '500' }}>Password</Text>
                            <TextInput
                                placeholder="••••••••"
                                placeholderTextColor="#64748b"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', borderWidth: 1, borderColor: '#334155', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, color: '#fff', fontWeight: '500', fontSize: 16 }}
                            />
                        </View>

                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={loading}
                            style={{ backgroundColor: '#3b82f6', borderRadius: 12, paddingVertical: 16, marginTop: 8, shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}
                        >
                            <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold', fontSize: 18 }}>
                                {loading ? 'Authenticating...' : 'Enter the Realm'}
                            </Text>
                        </TouchableOpacity>

                        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
                            <View style={{ height: 1, backgroundColor: '#334155', flex: 1 }} />
                            <Text style={{ color: '#64748b', fontSize: 12, paddingHorizontal: 12 }}>OR CONTINUE AS</Text>
                            <View style={{ height: 1, backgroundColor: '#334155', flex: 1 }} />
                        </View>

                        <TouchableOpacity
                            onPress={loginAsGuest}
                            style={{ backgroundColor: 'rgba(51, 65, 85, 0.8)', borderWidth: 1, borderColor: '#334155', borderRadius: 12, paddingVertical: 14 }}
                        >
                            <Text style={{ textAlign: 'center', color: '#93c5fd', fontWeight: '600', fontSize: 16 }}>Guest Explorer</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                <Animated.View style={{ marginTop: 32, opacity: fadeAnim }}>
                    <Text style={{ color: '#64748b', textAlign: 'center', fontSize: 12 }}>
                        By entering, you accept our Ninja Way (Terms of Service)
                    </Text>
                </Animated.View>
            </KeyboardAvoidingView>
        </View>
    );
}
