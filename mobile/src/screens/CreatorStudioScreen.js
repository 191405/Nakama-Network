import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { ArrowLeftIcon, UploadIcon, VideoIcon } from '../components/Icons';
import { uploadVideoToStorage } from '../utils/firebase';
import { scheduleNotification } from '../utils/notifications';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';

const MAX_FILE_SIZE_MB = 500;
const ALLOWED_TYPES = ['video/mp4', 'video/x-matroska', 'video/avi', 'video/quicktime'];
const ALLOWED_EXTENSIONS = ['.mp4', '.mkv', '.avi', '.mov'];

export default function CreatorStudioScreen() {
    const navigation = useNavigation();
    const { userProfile } = useAuth();
    const { theme, isDark } = useTheme();

    const [loading, setLoading] = useState(false);
    const [animeId, setAnimeId] = useState('');
    const [animeTitle, setAnimeTitle] = useState('');
    const [episodeNum, setEpisodeNum] = useState('');
    const [title, setTitle] = useState('');
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadSpeed, setUploadSpeed] = useState('');

    const validateFile = (selectedFile) => {
        
        const ext = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            Alert.alert('Invalid File Type', `Only ${ALLOWED_EXTENSIONS.join(', ')} files are allowed.`);
            return false;
        }

        const sizeMB = selectedFile.size / (1024 * 1024);
        if (sizeMB > MAX_FILE_SIZE_MB) {
            Alert.alert('File Too Large', `Maximum file size is ${MAX_FILE_SIZE_MB}MB. Your file is ${sizeMB.toFixed(1)}MB.`);
            return false;
        }

        return true;
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'video/*',
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const selectedFile = result.assets[0];
                if (validateFile(selectedFile)) {
                    setFile(selectedFile);
                }
            }
        } catch (err) {
            console.error("Document picker error:", err);
            Alert.alert('Error', 'Failed to select file. Please try again.');
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleUpload = async () => {
        if (!animeId || !animeTitle || !episodeNum || !file) {
            Alert.alert("Missing Info", "Please fill in all required fields and select a video file.");
            return;
        }

        if (!userProfile?.uid) {
            Alert.alert("Login Required", "Please log in to upload content.");
            return;
        }

        setLoading(true);
        setUploadProgress(0);
        const startTime = Date.now();

        try {
            
            const storagePath = `episodes/${animeId}/${episodeNum}_${Date.now()}_${file.name}`;

            const downloadURL = await uploadVideoToStorage(
                file,
                storagePath,
                (progress) => {
                    setUploadProgress(progress);

                    const elapsed = (Date.now() - startTime) / 1000;
                    if (elapsed > 0 && progress > 0) {
                        const uploadedBytes = (file.size * progress) / 100;
                        const speed = uploadedBytes / elapsed;
                        if (speed > 1024 * 1024) {
                            setUploadSpeed(`${(speed / (1024 * 1024)).toFixed(1)} MB/s`);
                        } else {
                            setUploadSpeed(`${(speed / 1024).toFixed(0)} KB/s`);
                        }
                    }
                }
            );

            await api.saveEpisode({
                anime_id: parseInt(animeId),
                anime_title: animeTitle,
                episode_number: parseInt(episodeNum),
                title: title || null,
                video_url: downloadURL,
                quality: '1080p',
                uploader_id: userProfile.uid
            });

            await scheduleNotification("Upload Complete", `Episode ${episodeNum} of ${animeTitle} uploaded successfully!`);

            Alert.alert("Success!", "Episode uploaded successfully.", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);

        } catch (error) {
            console.error("Upload failed", error);
            Alert.alert("Upload Failed", error.message || "Could not upload episode. Please try again.");
        } finally {
            setLoading(false);
            setUploadSpeed('');
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.bg }}>
            <StatusBar style={isDark ? "light" : "dark"} />

            {}
            <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: theme.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8, marginRight: 8 }}>
                        <ArrowLeftIcon size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={{ color: theme.text, fontSize: 24, fontWeight: '800' }}>Creator Studio</Text>
                </View>
                <Text style={{ color: theme.textSecondary, marginLeft: 48, fontSize: 14 }}>Upload and manage episodes</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 24 }}>

                {}
                <View style={{ backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#dbeafe', padding: 12, borderRadius: 12, marginBottom: 20 }}>
                    <Text style={{ color: isDark ? '#60a5fa' : '#2563eb', fontSize: 13 }}>
                        📁 Max file size: {MAX_FILE_SIZE_MB}MB • Supported: MP4, MKV, AVI, MOV
                    </Text>
                </View>

                {}
                <View style={styles(theme).section}>
                    <Text style={styles(theme).label}>Anime ID (MAL ID)</Text>
                    <TextInput
                        style={styles(theme).input}
                        placeholder="e.g. 52991"
                        placeholderTextColor={theme.textMuted}
                        keyboardType="numeric"
                        value={animeId}
                        onChangeText={setAnimeId}
                    />
                </View>

                <View style={styles(theme).section}>
                    <Text style={styles(theme).label}>Anime Title</Text>
                    <TextInput
                        style={styles(theme).input}
                        placeholder="e.g. Frieren: Beyond Journey's End"
                        placeholderTextColor={theme.textMuted}
                        value={animeTitle}
                        onChangeText={setAnimeTitle}
                    />
                </View>

                {}
                <View style={{ flexDirection: 'row', gap: 16 }}>
                    <View style={[styles(theme).section, { flex: 1 }]}>
                        <Text style={styles(theme).label}>Episode No.</Text>
                        <TextInput
                            style={styles(theme).input}
                            placeholder="e.g. 1"
                            placeholderTextColor={theme.textMuted}
                            keyboardType="numeric"
                            value={episodeNum}
                            onChangeText={setEpisodeNum}
                        />
                    </View>
                    <View style={[styles(theme).section, { flex: 2 }]}>
                        <Text style={styles(theme).label}>Episode Title (Optional)</Text>
                        <TextInput
                            style={styles(theme).input}
                            placeholder="e.g. The End of the Journey"
                            placeholderTextColor={theme.textMuted}
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>
                </View>

                {}
                <View style={styles(theme).section}>
                    <Text style={styles(theme).label}>Video File</Text>

                    {file ? (
                        <View style={{ backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : '#dcfce7', borderWidth: 1, borderColor: isDark ? 'rgba(34, 197, 94, 0.3)' : '#86efac', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                <VideoIcon size={24} color="#22c55e" />
                                <View style={{ marginLeft: 12, flex: 1 }}>
                                    <Text style={{ color: theme.text, fontWeight: '600' }} numberOfLines={1}>{file.name}</Text>
                                    <Text style={{ color: '#22c55e', fontSize: 12 }}>{formatFileSize(file.size)}</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => setFile(null)}>
                                <Text style={{ color: '#ef4444', fontWeight: '600', marginLeft: 12 }}>Remove</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={pickDocument}
                            style={{
                                borderWidth: 2,
                                borderColor: theme.accent?.primary || '#6366f1',
                                borderStyle: 'dashed',
                                borderRadius: 16,
                                padding: 32,
                                alignItems: 'center',
                                backgroundColor: isDark ? 'rgba(99, 102, 241, 0.05)' : 'rgba(99, 102, 241, 0.05)'
                            }}
                        >
                            <UploadIcon size={40} color={theme.accent?.primary || '#6366f1'} />
                            <Text style={{ color: theme.text, fontWeight: '700', marginTop: 16, fontSize: 16 }}>Select Video File</Text>
                            <Text style={{ color: theme.textSecondary, marginTop: 8 }}>MP4, MKV, AVI, MOV supported</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {}
                {loading && (
                    <View style={{ marginBottom: 20 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text style={{ color: theme.text, fontWeight: '600' }}>Uploading... {uploadProgress}%</Text>
                            {uploadSpeed ? <Text style={{ color: theme.textSecondary }}>{uploadSpeed}</Text> : null}
                        </View>
                        <View style={{ height: 8, backgroundColor: theme.border, borderRadius: 4, overflow: 'hidden' }}>
                            <View style={{
                                width: `${uploadProgress}%`,
                                height: '100%',
                                backgroundColor: theme.accent?.primary || '#6366f1',
                                borderRadius: 4
                            }} />
                        </View>
                    </View>
                )}

                {}
                <TouchableOpacity
                    onPress={handleUpload}
                    disabled={loading}
                    style={{
                        backgroundColor: loading ? theme.border : (theme.accent?.primary || '#6366f1'),
                        paddingVertical: 18,
                        borderRadius: 16,
                        alignItems: 'center',
                        marginTop: 24,
                        shadowColor: theme.accent?.primary || '#6366f1',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: loading ? 0 : 0.3,
                        shadowRadius: 10,
                        elevation: 5
                    }}
                >
                    {loading ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <ActivityIndicator color="#fff" style={{ marginRight: 12 }} />
                            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Uploading to Cloud...</Text>
                        </View>
                    ) : (
                        <Text style={{ color: '#fff', fontWeight: '800', fontSize: 18 }}>Upload Episode</Text>
                    )}
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const styles = (theme) => ({
    section: {
        marginBottom: 24,
    },
    label: {
        color: theme.textSecondary,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: theme.bgCard,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 12,
        padding: 16,
        color: theme.text,
        fontSize: 16,
    }
});
