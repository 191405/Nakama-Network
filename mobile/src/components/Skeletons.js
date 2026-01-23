import React from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Skeleton loading placeholder with shimmer animation
 */
export const Skeleton = ({ width = '100%', height = 20, borderRadius = 4, style }) => {
    const { theme } = useTheme();
    const animatedValue = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, [animatedValue]);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={[
                {
                    width,
                    height,
                    borderRadius,
                    backgroundColor: theme.surfaceLight || '#333',
                    opacity,
                },
                style,
            ]}
        />
    );
};

/**
 * Skeleton for anime cards
 */
export const AnimeCardSkeleton = ({ style }) => {
    const { theme } = useTheme();

    return (
        <View style={[styles.animeCard, { backgroundColor: theme.surface }, style]}>
            <Skeleton width="100%" height={180} borderRadius={8} />
            <View style={styles.cardContent}>
                <Skeleton width="80%" height={14} style={{ marginTop: 8 }} />
                <Skeleton width="50%" height={12} style={{ marginTop: 6 }} />
            </View>
        </View>
    );
};

/**
 * Skeleton row for horizontal anime lists
 */
export const AnimeRowSkeleton = ({ count = 4, style }) => {
    return (
        <View style={[styles.row, style]}>
            {Array.from({ length: count }).map((_, i) => (
                <AnimeCardSkeleton key={i} style={{ marginRight: 12, width: 130 }} />
            ))}
        </View>
    );
};

/**
 * Skeleton for character cards
 */
export const CharacterCardSkeleton = ({ style }) => {
    const { theme } = useTheme();

    return (
        <View style={[styles.characterCard, { backgroundColor: theme.surface }, style]}>
            <Skeleton width={80} height={80} borderRadius={40} />
            <Skeleton width={60} height={12} style={{ marginTop: 8 }} />
        </View>
    );
};

/**
 * Full page loading skeleton for HomeScreen
 */
export const HomeScreenSkeleton = () => {
    return (
        <View style={styles.container}>
            {/* Hero skeleton */}
            <Skeleton width="100%" height={200} borderRadius={0} />

            {/* Section 1 */}
            <View style={styles.section}>
                <Skeleton width={120} height={20} style={{ marginBottom: 12, marginLeft: 16 }} />
                <AnimeRowSkeleton />
            </View>

            {/* Section 2 */}
            <View style={styles.section}>
                <Skeleton width={100} height={20} style={{ marginBottom: 12, marginLeft: 16 }} />
                <AnimeRowSkeleton count={3} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    animeCard: {
        width: 130,
        borderRadius: 8,
        overflow: 'hidden',
    },
    cardContent: {
        padding: 8,
    },
    row: {
        flexDirection: 'row',
        paddingHorizontal: 16,
    },
    section: {
        marginTop: 20,
    },
    characterCard: {
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        width: 100,
    },
});

export default {
    Skeleton,
    AnimeCardSkeleton,
    AnimeRowSkeleton,
    CharacterCardSkeleton,
    HomeScreenSkeleton,
};
