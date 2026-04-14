import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const Skeleton = ({ width: w, height: h, style, borderRadius = 8 }) => {
    const { isDark } = useTheme();
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1200,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 0, // Reset instantly
                    useNativeDriver: true,
                })
            ])
        );
        animation.start();

        return () => animation.stop();
    }, []);

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-w, w],
    });

    const baseColor = isDark ? '#1e293b' : '#e2e8f0';
    const highlightColor = isDark ? '#334155' : '#f1f5f9';

    return (
        <View
            style={[
                styles.container,
                { width: w, height: h, borderRadius, backgroundColor: baseColor, overflow: 'hidden' },
                style
            ]}
        >
            <Animated.View
                style={{
                    width: '100%',
                    height: '100%',
                    transform: [{ translateX }],
                }}
            >
                <LinearGradient
                    colors={[baseColor, highlightColor, baseColor]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ flex: 1 }}
                />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    },
});

export default Skeleton;
