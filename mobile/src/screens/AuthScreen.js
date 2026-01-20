import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Animated, Dimensions, ScrollView, ActivityIndicator, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { Mail, Lock, User, Eye, EyeOff, ChevronRight, AlertTriangle, CheckCircle, Smartphone } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const mapAuthError = (errorCode) => {
    if (!errorCode) return 'An unexpected error occurred.';
    const code = errorCode.toLowerCase();

    if (code.includes('auth/email-already-in-use')) return 'That email is already in use. Please log in.';
    if (code.includes('auth/invalid-email')) return 'Please enter a valid email address.';
    if (code.includes('auth/user-not-found') || code.includes('auth/invalid-credential')) return 'Invalid email or password.';
    if (code.includes('auth/wrong-password')) return 'Incorrect password.';
    if (code.includes('auth/weak-password')) return 'Password should be at least 6 characters.';
    if (code.includes('auth/network-request-failed')) return 'Network error. Please check your connection.';

    if (code.includes('firebase:')) return code.replace('firebase: ', '').replace('error (', '').replace(').', '');

    return errorCode;
};

export default function AuthScreen({ navigation }) {
    const { login, signup, loginAsGuest, forgotPassword } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        ]).start();
    }, []);

    useEffect(() => {
        setError('');
        setSuccessMessage('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setDisplayName('');
    }, [isLogin]);

    const shakeError = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true })
        ]).start();
    };

    const handleAuth = async () => {
        Keyboard.dismiss();
        setError('');
        setSuccessMessage('');

        if (!email.trim() || !password.trim()) {
            setError('Please fill in all required fields');
            shakeError();
            return;
        }

        if (!isLogin) {
            if (!displayName.trim()) {
                setError('Please call yourself something, anything!');
                shakeError();
                return;
            }
            if (password !== confirmPassword) {
                setError('Passwords do not match');
                shakeError();
                return;
            }
        }

        try {
            setLoading(true);
            if (isLogin) {
                await login(email.trim(), password);
            } else {
                await signup(email.trim(), password, displayName.trim());
            }
        } catch (err) {
            console.error("Auth error:", err);
            const friendlyMsg = mapAuthError(err.message || err.code);
            setError(friendlyMsg);
            shakeError();
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email.trim()) {
            setError('Please enter your email address to reset password');
            shakeError();
            return;
        }
        try {
            setError('');
            await forgotPassword(email.trim());
            setSuccessMessage('Password reset email sent! Check your inbox.');
        } catch (err) {
            setError(mapAuthError(err.message));
        }
    };

    const handleGoogleSignIn = () => {
        
        setError('Google Sign-In coming soon! Please use email for now.');
        shakeError();
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
            <StatusBar style="light" />
            <LinearGradient
                colors={['#0f172a', '#1e1b4b', '#312e81']}
                style={{ position: 'absolute', width: '100%', height: '100%' }}
            />

            {}
            <View style={{ position: 'absolute', top: -80, left: -80, width: 250, height: 250, backgroundColor: '#7c3aed', borderRadius: 125, opacity: 0.15 }} />
            <View style={{ position: 'absolute', bottom: -100, right: -80, width: 300, height: 300, backgroundColor: '#3b82f6', borderRadius: 150, opacity: 0.15 }} />
            <View style={{ position: 'absolute', top: height * 0.4, left: -50, width: 100, height: 100, backgroundColor: '#ec4899', borderRadius: 50, opacity: 0.1 }} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 }}
                    keyboardShouldPersistTaps="handled"
                >
                    {}
                    <Animated.View style={{ alignItems: 'center', marginBottom: 30, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        <Text style={{ fontSize: 42, fontWeight: '900', color: '#fff', letterSpacing: 6 }}>NAKAMA</Text>
                        <Text style={{ fontSize: 18, color: '#93c5fd', letterSpacing: 8, marginTop: 4, fontWeight: '300' }}>NETWORK</Text>
                        <Text style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>The Hidden Layer of Anime</Text>
                    </Animated.View>

                    {}
                    <Animated.View
                        style={{
                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                            borderRadius: 24,
                            borderWidth: 1,
                            borderColor: 'rgba(255,255,255,0.08)',
                            padding: 24,
                            opacity: fadeAnim,
                            transform: [{ translateX: shakeAnim }]
                        }}
                    >
                        {}
                        {error ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 12, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                                <AlertTriangle color="#f87171" size={18} style={{ marginRight: 8 }} />
                                <Text style={{ color: '#fca5a5', flex: 1, fontSize: 13, fontWeight: '500' }}>{error}</Text>
                            </View>
                        ) : null}

                        {}
                        {successMessage ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: 12, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(34, 197, 94, 0.3)' }}>
                                <CheckCircle color="#4ade80" size={18} style={{ marginRight: 8 }} />
                                <Text style={{ color: '#86efac', flex: 1, fontSize: 13, fontWeight: '500' }}>{successMessage}</Text>
                            </View>
                        ) : null}

                        {}
                        <View style={{ flexDirection: 'row', marginBottom: 24, backgroundColor: 'rgba(30, 41, 59, 1)', borderRadius: 14, padding: 4 }}>
                            <TouchableOpacity
                                onPress={() => setIsLogin(true)}
                                style={{ flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: isLogin ? '#3b82f6' : 'transparent', shadowColor: isLogin ? "#000" : "transparent", shadowOpacity: isLogin ? 0.2 : 0, shadowRadius: 3 }}
                            >
                                <Text style={{ textAlign: 'center', color: isLogin ? '#fff' : '#94a3b8', fontWeight: '600', fontSize: 14 }}>Log In</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setIsLogin(false)}
                                style={{ flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: !isLogin ? '#3b82f6' : 'transparent', shadowColor: !isLogin ? "#000" : "transparent", shadowOpacity: !isLogin ? 0.2 : 0, shadowRadius: 3 }}
                            >
                                <Text style={{ textAlign: 'center', color: !isLogin ? '#fff' : '#94a3b8', fontWeight: '600', fontSize: 14 }}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>

                        {}
                        {!isLogin && (
                            <View style={{ marginBottom: 16 }}>
                                <Text style={{ color: '#93c5fd', marginLeft: 4, marginBottom: 6, fontSize: 13, fontWeight: '600' }}>Ninja Name</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(30, 41, 59, 0.6)', borderWidth: 1, borderColor: '#334155', borderRadius: 14, paddingHorizontal: 14, height: 50 }}>
                                    <User color="#64748b" size={20} />
                                    <TextInput
                                        placeholder="Enter your display name"
                                        placeholderTextColor="#64748b"
                                        value={displayName}
                                        onChangeText={setDisplayName}
                                        style={{ flex: 1, paddingLeft: 12, color: '#fff', fontSize: 16 }}
                                    />
                                </View>
                            </View>
                        )}

                        {}
                        <View style={{ marginBottom: 16 }}>
                            <Text style={{ color: '#93c5fd', marginLeft: 4, marginBottom: 6, fontSize: 13, fontWeight: '600' }}>Email Address</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(30, 41, 59, 0.6)', borderWidth: 1, borderColor: '#334155', borderRadius: 14, paddingHorizontal: 14, height: 50 }}>
                                <Mail color="#64748b" size={20} />
                                <TextInput
                                    placeholder="name@example.com"
                                    placeholderTextColor="#64748b"
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        if (error) setError('');
                                    }}
                                    style={{ flex: 1, paddingLeft: 12, color: '#fff', fontSize: 16 }}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    autoCorrect={false}
                                />
                            </View>
                        </View>

                        {}
                        <View style={{ marginBottom: isLogin ? 8 : 16 }}>
                            <Text style={{ color: '#93c5fd', marginLeft: 4, marginBottom: 6, fontSize: 13, fontWeight: '600' }}>Password</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(30, 41, 59, 0.6)', borderWidth: 1, borderColor: '#334155', borderRadius: 14, paddingHorizontal: 14, height: 50 }}>
                                <Lock color="#64748b" size={20} />
                                <TextInput
                                    placeholder="••••••••"
                                    placeholderTextColor="#64748b"
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        if (error) setError('');
                                    }}
                                    secureTextEntry={!showPassword}
                                    style={{ flex: 1, paddingLeft: 12, color: '#fff', fontSize: 16 }}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                                    {showPassword ? <EyeOff color="#94a3b8" size={20} /> : <Eye color="#94a3b8" size={20} />}
                                </TouchableOpacity>
                            </View>
                        </View>

                        {}
                        {!isLogin && (
                            <View style={{ marginBottom: 16 }}>
                                <Text style={{ color: '#93c5fd', marginLeft: 4, marginBottom: 6, fontSize: 13, fontWeight: '600' }}>Confirm Password</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(30, 41, 59, 0.6)', borderWidth: 1, borderColor: '#334155', borderRadius: 14, paddingHorizontal: 14, height: 50 }}>
                                    <Lock color="#64748b" size={20} />
                                    <TextInput
                                        placeholder="••••••••"
                                        placeholderTextColor="#64748b"
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry={!showPassword}
                                        style={{ flex: 1, paddingLeft: 12, color: '#fff', fontSize: 16 }}
                                    />
                                </View>
                            </View>
                        )}

                        {}
                        {isLogin && (
                            <TouchableOpacity onPress={handleForgotPassword} style={{ alignSelf: 'flex-end', marginBottom: 24 }}>
                                <Text style={{ color: '#93c5fd', fontSize: 13, fontWeight: '500' }}>Forgot password?</Text>
                            </TouchableOpacity>
                        )}

                        {}
                        <TouchableOpacity
                            onPress={handleAuth}
                            disabled={loading}
                            activeOpacity={0.8}
                            style={{ shadowColor: "#4f46e5", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5, marginBottom: 20 }}
                        >
                            <LinearGradient
                                colors={loading ? ['#475569', '#475569'] : ['#3b82f6', '#4f46e5']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{ borderRadius: 14, paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', opacity: loading ? 0.7 : 1 }}
                            >
                                {loading && <ActivityIndicator color="#fff" style={{ marginRight: 10 }} />}
                                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16, marginRight: 8 }}>
                                    {loading ? (isLogin ? 'Logging in...' : 'Creating Account...') : (isLogin ? 'Log In' : 'Create Account')}
                                </Text>
                                {!loading && <ChevronRight color="#fff" size={20} />}
                            </LinearGradient>
                        </TouchableOpacity>

                        {}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 16 }}>
                            <View style={{ height: 1, backgroundColor: '#334155', flex: 1 }} />
                            <Text style={{ color: '#64748b', fontSize: 12, paddingHorizontal: 12, fontWeight: '500' }}>OR CONTINUE WITH</Text>
                            <View style={{ height: 1, backgroundColor: '#334155', flex: 1 }} />
                        </View>

                        {}
                        <View style={{ gap: 12 }}>
                            {}
                            <TouchableOpacity
                                onPress={handleGoogleSignIn}
                                style={{ backgroundColor: '#fff', borderRadius: 14, paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
                            >
                                <View style={{ width: 20, height: 20, borderRadius: 10, marginRight: 10, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 16 }}>G</Text>
                                </View>
                                <Text style={{ color: '#1f2937', fontWeight: '600', fontSize: 15 }}>Google</Text>
                            </TouchableOpacity>

                            {}
                            <TouchableOpacity
                                onPress={loginAsGuest}
                                style={{ backgroundColor: 'transparent', borderWidth: 1, borderColor: '#475569', borderRadius: 14, paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
                            >
                                <Text style={{ textAlign: 'center', color: '#94a3b8', fontWeight: '600', fontSize: 15 }}>Continue as Guest</Text>
                            </TouchableOpacity>
                        </View>

                    </Animated.View>

                    {}
                    <Animated.View style={{ marginTop: 24, opacity: fadeAnim }}>
                        <Text style={{ color: '#64748b', textAlign: 'center', fontSize: 12, lineHeight: 18 }}>
                            Protected by the Ninja Code.
                        </Text>
                    </Animated.View>

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
