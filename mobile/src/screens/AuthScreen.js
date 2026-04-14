import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Animated, Dimensions, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '../contexts/AuthContext';
import { StatusBar } from 'expo-status-bar';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';

// Ensure AuthSession works
WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get('window');

// CLIENT IDs
// Configure these in your .env file
const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

export default function AuthScreen({ navigation }) {
    const { login, signup, loginAsGuest, googleSignIn } = useAuth();
    const [isLogin, setIsLogin] = useState(true);

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Expo Auth Session Hook
    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        clientId: WEB_CLIENT_ID,
        iosClientId: IOS_CLIENT_ID,
        androidClientId: ANDROID_CLIENT_ID,
    });

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    // Breathing Animation
    const breatheAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Entry Animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1200,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                damping: 20,
                stiffness: 90,
                useNativeDriver: true,
            }),
        ]).start();

        // Loop Breathing
        Animated.loop(
            Animated.sequence([
                Animated.timing(breatheAnim, {
                    toValue: 1.05,
                    duration: 3000,
                    useNativeDriver: true,
                }),
                Animated.timing(breatheAnim, {
                    toValue: 1,
                    duration: 3000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    // Handle Google Response
    useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            handleGoogleSignIn(id_token);
        }
    }, [response]);

    const handleGoogleSignIn = async (token) => {
        try {
            setLoading(true);
            await googleSignIn(token);
        } catch (error) {
            console.error(error);
            alert("Google Sign-In Error. Please check Client IDs.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!email || !password) return alert("Please fill in all fields");
        if (!isLogin && !username) return alert("Please choose a Shinobi name");

        try {
            setLoading(true);
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(email, password, username);
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            <StatusBar style="light" />

            {/* Cinematic Background Gradient - "Midnight Gold" */}
            <LinearGradient
                colors={['#000000', '#0a0a0a', '#1a1a2e']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ position: 'absolute', width: '100%', height: '100%' }}
            />

            {/* Glowing Orbs - Simplified for Performance & Aesthetics */}
            <Animated.View style={{
                position: 'absolute',
                top: -100,
                left: -50,
                width: width * 1.2,
                height: width * 1.2,
                borderRadius: width,
                backgroundColor: '#7c3aed',
                opacity: 0.15,
                transform: [{ scale: breatheAnim }]
            }} blurRadius={50} />

            <Animated.View style={{
                position: 'absolute',
                bottom: -150,
                right: -50,
                width: width,
                height: width,
                borderRadius: width / 2,
                backgroundColor: '#fbbf24',
                opacity: 0.1,
                transform: [{ scale: breatheAnim }]
            }} blurRadius={50} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 28 }}
            >
                {/* Header Section */}
                <Animated.View style={{ alignItems: 'center', marginBottom: 40, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <Text style={{
                        fontSize: 48,
                        fontWeight: '900',
                        color: '#ffffff',
                        letterSpacing: 4,
                        textShadowColor: 'rgba(124, 58, 237, 0.8)',
                        textShadowOffset: { width: 0, height: 0 },
                        textShadowRadius: 25
                    }}>
                        NAKAMA
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                        <View style={{ width: 40, height: 2, backgroundColor: '#fbbf24' }} />
                        <Text style={{
                            fontSize: 16,
                            color: '#fbbf24',
                            marginHorizontal: 12,
                            letterSpacing: 6,
                            fontWeight: '600'
                        }}>
                            NETWORK
                        </Text>
                        <View style={{ width: 40, height: 2, backgroundColor: '#fbbf24' }} />
                    </View>
                    <Text style={{
                        fontSize: 12,
                        color: '#6b7280',
                        marginTop: 10,
                        letterSpacing: 1,
                        fontStyle: 'italic'
                    }}>
                        The Hidden Layer of Anime
                    </Text>
                </Animated.View>

                {/* Glass Card */}
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <BlurView intensity={20} tint="dark" style={{
                        borderRadius: 30,
                        overflow: 'hidden',
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.08)',
                        backgroundColor: 'rgba(10,10,20,0.5)'
                    }}>
                        <View style={{ padding: 28 }}>

                            {/* Toggle Sign In / Sign Up */}
                            <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, marginBottom: 24, padding: 4 }}>
                                <TouchableOpacity
                                    onPress={() => setIsLogin(true)}
                                    style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10, backgroundColor: isLogin ? 'rgba(255,255,255,0.1)' : 'transparent' }}
                                >
                                    <Text style={{ color: isLogin ? '#fff' : '#6b7280', fontWeight: '700' }}>Login</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setIsLogin(false)}
                                    style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10, backgroundColor: !isLogin ? 'rgba(255,255,255,0.1)' : 'transparent' }}
                                >
                                    <Text style={{ color: !isLogin ? '#fff' : '#6b7280', fontWeight: '700' }}>Sign Up</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Input: Username (Sign Up Only) */}
                            {!isLogin && (
                                <View style={{ marginBottom: 20 }}>
                                    <View style={{
                                        backgroundColor: 'rgba(0,0,0,0.3)',
                                        borderRadius: 16,
                                        borderWidth: 1,
                                        borderColor: 'rgba(255,255,255,0.1)',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        paddingHorizontal: 16
                                    }}>
                                        <Ionicons name="person-outline" size={20} color="#6b7280" />
                                        <TextInput
                                            placeholder="Shinobi Name"
                                            placeholderTextColor="#4b5563"
                                            value={username}
                                            onChangeText={setUsername}
                                            style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 12, color: '#fff', fontSize: 16, fontWeight: '500' }}
                                        />
                                    </View>
                                </View>
                            )}

                            {/* Input: Email */}
                            <View style={{ marginBottom: 20 }}>
                                <View style={{
                                    backgroundColor: 'rgba(0,0,0,0.3)',
                                    borderRadius: 16,
                                    borderWidth: 1,
                                    borderColor: 'rgba(255,255,255,0.1)',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingHorizontal: 16
                                }}>
                                    <Ionicons name="mail-outline" size={20} color="#6b7280" />
                                    <TextInput
                                        placeholder="Email Address"
                                        placeholderTextColor="#4b5563"
                                        value={email}
                                        onChangeText={setEmail}
                                        autoCapitalize="none"
                                        style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 12, color: '#fff', fontSize: 16, fontWeight: '500' }}
                                    />
                                </View>
                            </View>

                            {/* Input: Password */}
                            <View style={{ marginBottom: 30 }}>
                                <View style={{
                                    backgroundColor: 'rgba(0,0,0,0.3)',
                                    borderRadius: 16,
                                    borderWidth: 1,
                                    borderColor: 'rgba(255,255,255,0.1)',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingHorizontal: 16
                                }}>
                                    <Ionicons name="lock-closed-outline" size={20} color="#6b7280" />
                                    <TextInput
                                        placeholder="Password"
                                        placeholderTextColor="#4b5563"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 12, color: '#fff', fontSize: 16, fontWeight: '500' }}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#6b7280" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Submit Button */}
                            <TouchableOpacity
                                onPress={handleSubmit}
                                disabled={loading}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={['#7c3aed', '#6d28d9']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{
                                        borderRadius: 16,
                                        paddingVertical: 18,
                                        alignItems: 'center',
                                        shadowColor: '#7c3aed',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 10,
                                        elevation: 5
                                    }}
                                >
                                    <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 1 }}>
                                        {loading ? 'PROCESSING...' : (isLogin ? 'LOG IN' : 'SIGN UP')}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 24 }}>
                                <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', flex: 1 }} />
                                <Text style={{ color: '#6b7280', fontSize: 11, paddingHorizontal: 12, fontWeight: '600' }}>OR CONNECT WITH</Text>
                                <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', flex: 1 }} />
                            </View>

                            {/* Social Buttons */}
                            <View style={{ gap: 14 }}>
                                <TouchableOpacity
                                    onPress={() => promptAsync()}
                                    disabled={!request}
                                    style={{
                                        backgroundColor: '#fff',
                                        borderRadius: 16,
                                        paddingVertical: 16,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <ImageBackground
                                        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/300/300221.png' }}
                                        style={{ width: 20, height: 20, marginRight: 10 }}
                                    />
                                    <Text style={{ color: '#000', fontWeight: '700', fontSize: 16 }}>Google</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={loginAsGuest}
                                    style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: 16,
                                        paddingVertical: 16,
                                        borderWidth: 1,
                                        borderColor: 'rgba(255,255,255,0.1)'
                                    }}
                                >
                                    <Text style={{ textAlign: 'center', color: '#9ca3af', fontWeight: '600', fontSize: 15 }}>Continue as Guest</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </BlurView>
                </Animated.View>
            </KeyboardAvoidingView>
        </View>
    );
}
