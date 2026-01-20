import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, Dimensions, ActivityIndicator, TouchableOpacity, SafeAreaView, StatusBar as RNStatusBar } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Settings, X } from 'lucide-react-native';
import api from '../services/api';

const { width, height } = Dimensions.get('window');

const PageItem = ({ url }) => {
    const [aspectRatio, setAspectRatio] = useState(0.7); 

    useEffect(() => {
        Image.getSize(url, (w, h) => {
            setAspectRatio(w / h);
        }, () => { });
    }, [url]);

    return (
        <Image
            source={{ uri: url }}
            style={{ width: width, height: width / aspectRatio }}
            resizeMode="contain"
        />
    );
};

export default function MangaReaderScreen({ route, navigation }) {
    const { chapterId, title } = route.params;
    const { theme } = useTheme();

    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [headerVisible, setHeaderVisible] = useState(true);

    useEffect(() => {
        loadPages();
        
        const timer = setTimeout(() => setHeaderVisible(false), 3000);
        return () => clearTimeout(timer);
    }, [chapterId]);

    const loadPages = async () => {
        try {
            const data = await api.getChapterPages(chapterId);
            setPages(data.pages || []);
        } catch (e) {
            console.error('Failed to load pages', e);
        } finally {
            setLoading(false);
        }
    };

    const toggleHeader = () => {
        setHeaderVisible(!headerVisible);
        RNStatusBar.setHidden(headerVisible); 
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={{ color: '#fff', marginTop: 10 }}>Loading Chapter...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            <StatusBar style="light" hidden={!headerVisible} />

            <FlatList
                data={pages}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity activeOpacity={1} onPress={toggleHeader}>
                        <PageItem url={item} />
                    </TouchableOpacity>
                )}
                pagingEnabled={false} 
                showsVerticalScrollIndicator={false}
            />

            {}
            {headerVisible && (
                <View style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    paddingTop: 50,
                    paddingBottom: 20,
                    paddingHorizontal: 20,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
                        <ArrowLeft color="#fff" size={24} />
                    </TouchableOpacity>
                    <Text style={{ color: '#fff', fontWeight: '700', flex: 1, textAlign: 'center' }} numberOfLines={1}>
                        {title}
                    </Text>
                    <TouchableOpacity style={{ padding: 8 }}>
                        <Settings color="#fff" size={24} />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}
