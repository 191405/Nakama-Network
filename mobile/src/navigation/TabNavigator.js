import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Home, Compass, User, Zap, MessageCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SocialScreen from '../screens/SocialScreen';
import ArcadeScreen from '../screens/GameScreen'; 
import CharactersScreen from '../screens/CharactersScreen'; 

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

const CustomTabBar = ({ state, descriptors, navigation }) => {
    const { theme, isDark } = useTheme();

    return (
        <View style={styles.container}>
            <BlurView
                intensity={isDark ? 80 : 90}
                tint={isDark ? "dark" : "light"}
                style={[
                    styles.blurContainer,
                    {
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                        backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)',
                    }
                ]}
            >
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const label =
                        options.tabBarLabel !== undefined
                            ? options.tabBarLabel
                            : options.title !== undefined
                                ? options.title
                                : route.name;

                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            navigation.navigate(route.name);
                        }
                    };

                    let IconComponent = Home;
                    if (route.name === 'Home') IconComponent = Home;
                    else if (route.name === 'Discover') IconComponent = Compass;
                    else if (route.name === 'Arcade') IconComponent = Zap;
                    else if (route.name === 'Social') IconComponent = MessageCircle;
                    else if (route.name === 'Profile') IconComponent = User;

                    const iconColor = isFocused
                        ? (theme.accent?.primary || '#6366f1')
                        : (isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)');

                    return (
                        <TouchableOpacity
                            key={index}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            testID={options.tabBarTestID}
                            onPress={onPress}
                            style={styles.tabButton}
                        >
                            <View style={[
                                styles.iconContainer,
                                isFocused && {
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                    transform: [{ scale: 1.1 }]
                                }
                            ]}>
                                <IconComponent
                                    size={24}
                                    color={iconColor}
                                    strokeWidth={isFocused ? 2.5 : 2}
                                />
                            </View>
                            {isFocused && (
                                <View style={[
                                    styles.indicator,
                                    { backgroundColor: theme.accent?.primary || '#6366f1' }
                                ]} />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </BlurView>
        </View>
    );
};

export default function TabNavigator() {
    return (
        <Tab.Navigator
            tabBar={props => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                lazy: false, 
            }}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Discover" component={SearchScreen} />
            <Tab.Screen name="Arcade" component={ArcadeScreen} />
            <Tab.Screen name="Social" component={SocialScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 25,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    blurContainer: {
        flexDirection: 'row',
        width: width - 40,
        height: 70,
        borderRadius: 35,
        alignItems: 'center',
        justifyContent: 'space-around',
        borderWidth: 1,
        overflow: 'hidden',
        paddingHorizontal: 10,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    indicator: {
        position: 'absolute',
        bottom: 8,
        width: 4,
        height: 4,
        borderRadius: 2,
    }
});
