import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { X, Save, User, FileText } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToStorage } from '../utils/firebase';
import { Camera } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function EditProfileScreen({ navigation }) {
    const { userProfile, updateProfile } = useAuth();
    const { theme, isDark } = useTheme();

    const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
    const [photoURL, setPhotoURL] = useState(userProfile?.photoURL || '');
    const [bio, setBio] = useState(userProfile?.bio || '');
    const [loading, setLoading] = useState(false);

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setPhotoURL(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!displayName.trim()) {
            Alert.alert('Error', 'Display name cannot be empty');
            return;
        }

        setLoading(true);
        try {
            let finalPhotoURL = photoURL;
            
            if (photoURL && (photoURL.startsWith('file:') || photoURL.startsWith('content:'))) {
                finalPhotoURL = await uploadImageToStorage(
                    photoURL,
                    `users/${userProfile?.uid || 'guest'}/profile_${Date.now()}.jpg`
                );
            }

            await updateProfile({
                displayName: displayName.trim(),
                photoURL: finalPhotoURL.trim(),
                bio: bio.trim()
            });
            Alert.alert('Success', 'Profile updated successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.bg }}>
            <StatusBar style={isDark ? "light" : "dark"} />

            {}
            <View style={{ paddingTop: 50, paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: theme.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4, marginRight: 12 }}>
                        <X color={theme.text} size={24} />
                    </TouchableOpacity>
                    <Text style={{ color: theme.text, fontSize: 20, fontWeight: '700' }}>Edit Profile</Text>
                </View>
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={loading}
                    style={{ opacity: loading ? 0.7 : 1 }}
                >
                    {loading ? (
                        <ActivityIndicator color={theme.primary} size="small" />
                    ) : (
                        <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 16 }}>Save</Text>
                    )}
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={{ padding: 24 }}>
                    <TouchableOpacity onPress={handlePickImage} style={{ alignItems: 'center', marginBottom: 32 }}>
                        <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 12, overflow: 'hidden', position: 'relative' }}>
                            {photoURL ? (
                                <Image source={{ uri: photoURL }} style={{ width: 100, height: 100 }} />
                            ) : (
                                <Text style={{ fontSize: 40, color: '#fff', fontWeight: 'bold' }}>
                                    {displayName?.[0]?.toUpperCase() || 'U'}
                                </Text>
                            )}
                            <View style={{ position: 'absolute', bottom: 0, width: '100%', height: 30, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                                <Camera size={16} color="#fff" />
                            </View>
                        </View>
                        <Text style={{ color: theme.primary, fontSize: 14, fontWeight: '600' }}>Change Photo</Text>
                    </TouchableOpacity>

                    <View style={{ marginBottom: 24 }}>
                        <Text style={{ color: theme.text, fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 4 }}>
                            Display Name
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.bgCard, borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: theme.border }}>
                            <User color={theme.textMuted} size={20} />
                            <TextInput
                                style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 12, color: theme.text, fontSize: 16 }}
                                value={displayName}
                                onChangeText={setDisplayName}
                                placeholder="Enter your display name"
                                placeholderTextColor={theme.textMuted}
                            />
                        </View>
                    </View>

                    <View style={{ marginBottom: 24 }}>
                        <Text style={{ color: theme.text, fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 4 }}>
                            Profile Picture URL
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.bgCard, borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: theme.border }}>
                            <FileText color={theme.textMuted} size={20} />
                            <TextInput
                                style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 12, color: theme.text, fontSize: 16 }}
                                value={photoURL}
                                onChangeText={setPhotoURL}
                                placeholder="https://example.com/avatar.jpg"
                                placeholderTextColor={theme.textMuted}
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    <View style={{ marginBottom: 24 }}>
                        <Text style={{ color: theme.text, fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 4 }}>
                            Bio
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', backgroundColor: theme.bgCard, borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: theme.border, minHeight: 120 }}>
                            <FileText color={theme.textMuted} size={20} style={{ marginTop: 16 }} />
                            <TextInput
                                style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 12, color: theme.text, fontSize: 16, textAlignVertical: 'top', height: 120 }}
                                value={bio}
                                onChangeText={setBio}
                                placeholder="Tell us about yourself..."
                                placeholderTextColor={theme.textMuted}
                                multiline
                                numberOfLines={5}
                            />
                        </View>
                    </View>

                    <Text style={{ color: theme.textMuted, fontSize: 12, textAlign: 'center', marginTop: 20 }}>
                        Your public profile will be visible to other ninjas in the network.
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
