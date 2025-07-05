import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ref, get } from 'firebase/database';
import { db } from '../firebaseConfig';
import { auth } from '../firebaseConfig';
import LottieView from 'lottie-react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, DEFAULTS } from '../constants';
import { formatDate } from '../utils/helpers';
import { DataCard, TaskItem, WeekProgress } from '../components/dashboard';
import { globalStyles } from '../styles/globalStyles';
import notificationService from '../utils/notificationService';
import { MaterialIcons } from '@expo/vector-icons';

const DashboardScreen = ({ route, navigation }) => {
    const [userPoints, setUserPoints] = useState(DEFAULTS.POINTS);
    const [userTasks, setUserTasks] = useState(DEFAULTS.TASKS);
    const [isLoading, setIsLoading] = useState(true);
    
    const {
        userInfo = {},
        recommended_calories_per_day = DEFAULTS.CALORIES_PER_DAY,
    } = route.params || {};

    const goalsCompleted = 5;
    const totalGoals = 10;

    // Load user data from Firebase
    useEffect(() => {
        const loadUserData = async () => {
            const userId = auth.currentUser?.uid;
            
            if (!userId) {
                setIsLoading(false);
            return;
        }

        try {
                // Load points
                const pointsSnapshot = await get(ref(db, `users/${userId}/points`));
                if (pointsSnapshot.exists()) {
                    setUserPoints(pointsSnapshot.val());
                }

                // Load tasks from chat
                const chatSnapshot = await get(ref(db, `chats/${userId}`));
                if (chatSnapshot.exists()) {
                    const messages = chatSnapshot.val();
                    const lastMessage = messages[messages.length - 1];
                    if (lastMessage?.dailyTasks) {
                        setUserTasks(lastMessage.dailyTasks);
                    }
            }
        } catch (error) {
                console.error('Error loading user data:', error);
        } finally {
                setIsLoading(false);
        }
        };

        loadUserData();
    }, []);

    const handleUpgrade = () => {
        // Remove the upgrade navigation since the screen doesn't exist
        console.log('Upgrade feature not implemented yet');
    };

    const handleNotificationSettings = async () => {
        try {
            const notifications = await notificationService.getScheduledNotifications();
            Alert.alert(
                'Notification Settings',
                `You have ${notifications.length} scheduled notifications.\n\n` +
                'Task reminders, exercise notifications, and daily check-ins are automatically scheduled.',
                [
                    { text: 'View All', onPress: () => console.log('View notifications') },
                    { text: 'Cancel All', onPress: async () => {
                        await notificationService.cancelAllNotifications();
                        Alert.alert('Notifications Cancelled', 'All scheduled notifications have been cancelled.');
                    }},
                    { text: 'OK', style: 'default' }
                ]
            );
        } catch (error) {
            console.error('Error handling notification settings:', error);
            Alert.alert('Error', 'Could not load notification settings.');
        }
    };

    const handleChatNavigation = () => {
        const userId = auth.currentUser?.uid;
        
        if (!userId) {
            console.error('No authenticated user found');
            return;
        }

        navigation.navigate('Chat', { 
            userId: userId,
            userInfo: route.params?.userInfo 
        });
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Image
                source={require('../assets/dashboardBG.png')}
                style={styles.backgroundImage}
            />

            <View style={styles.topBar}>
                <View style={styles.userInfoContainer}>
                    <Image
                        source={require('../assets/user.png')}
                        style={styles.avatar}
                    />
                    <View style={styles.pointsContainer}>
                        <Image 
                            source={require('../assets/points-icon.png')} 
                            style={styles.pointsIcon} 
                        />
                        <Text style={styles.pointsText}>{userPoints}</Text>
                    </View>
                </View>
                <View style={styles.topButtonsContainer}>
                    <TouchableOpacity 
                        style={styles.notificationButton} 
                        onPress={handleNotificationSettings}
                    >
                        <Text style={styles.notificationText}>🔔</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.upgradeButton} 
                        onPress={handleUpgrade}
                    >
                        <Text style={styles.upgradeText}>Upgrade</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <View style={styles.greetingSection}>
                    <View style={styles.greetingContent}>
                        <Text style={styles.date}>{formatDate()}</Text>
                        <Text style={styles.greetingName}>{userInfo.name},</Text>
                        <Text style={styles.greetingText}>Let's conquer the day!</Text>
                        <View style={styles.goalsContainer}>
                            <Text style={styles.goalsText}>
                                <Text style={styles.goalsCompleted}>{goalsCompleted}</Text>
                                <Text style={styles.goalsTotal}>/10 goals completed</Text>
                            </Text>
                        </View>
                    </View>
                    <View style={styles.greetingVisual}>
                        <Image
                            source={require('../assets/dashboardProgress.png')}
                            style={styles.greetingProgress}
                        />
                    </View>
                </View>

                <View style={styles.dataCards}>
                    <DataCard
                        title="Daily Calories"
                        value={recommended_calories_per_day}
                        icon={require('../assets/fireDashboard.png')}
                        progress={75}
                        maxProgress={100}
                        style={styles.dataCard}
                    />
                    <DataCard
                        title="Exercises"
                        value={userTasks.length}
                        icon={require('../assets/exerciseDashboard.png')}
                        progress={userTasks.length * 10}
                        maxProgress={100}
                        style={[styles.dataCard, styles.dataCardRight]}
                    />
                </View>

                <WeekProgress 
                    progressData={{
                        mon: 80,
                        tue: 65,
                        wed: 90,
                        thu: 45,
                        fri: 70,
                        sat: 85,
                        sun: 60
                    }}
                />

                <View style={styles.todaysPlan}>
                    <Text style={styles.planTitle}>Today's plan</Text>
                    {userTasks.length > 0 ? (
                        userTasks.map((task, index) => (
                            <TaskItem
                                key={index}
                                time={task.time}
                                emoji={task.emoji}
                                title={task.title}
                                completed={false}
                            />
                        ))
                    ) : (
                        <Text style={styles.noTasksText}>No tasks for today.</Text>
                    )}
                </View>
            </ScrollView>

            <TouchableOpacity style={styles.fab} onPress={handleChatNavigation}>
                <Image source={require('../assets/chatBG.png')} style={styles.fabIcon} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.BLACK,
    },
    scrollView: {
        flex: 1,
    },
    backgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0.8,
        resizeMode: 'cover',
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.MD,
        zIndex: 1,
        marginTop: 50,
    },
    userInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 20,
        marginRight: SPACING.MD,
    },
    pointsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#353E3A',
        paddingRight: 12,
        borderRadius: 50,
    },
    pointsIcon: {
        width: 30,
        height: 30,
        marginRight: 5,
    },
    pointsText: {
        color: COLORS.WHITE,
        fontSize: FONT_SIZES.LG,
    },
    topButtonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    notificationButton: {
        backgroundColor: 'rgba(53, 62, 58, 0.40)',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
    },
    notificationText: {
        color: COLORS.WHITE,
        fontSize: FONT_SIZES.LG,
    },
    upgradeButton: {
        backgroundColor: 'rgba(53, 62, 58, 0.40)',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    upgradeText: {
        color: COLORS.PRIMARY_TRANSPARENT,
        fontSize: FONT_SIZES.MD,
    },
    greetingSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.MD,
        zIndex: 1,
        backgroundColor: COLORS.PRIMARY_LIGHT,
        borderRadius: BORDER_RADIUS.LG,
        marginHorizontal: SPACING.MD,
        marginTop: 24,
        marginBottom: 18,
    },
    greetingContent: {},
    greetingVisual: {},
    greetingProgress: {
        width: 100,
        height: 100,
    },
    date: {
        color: 'rgba(245, 245, 245, 0.30)',
        fontSize: FONT_SIZES.MD,
        marginBottom: 16,
    },
    greetingName: {
        fontSize: FONT_SIZES.LG,
        color: COLORS.WHITE,
    },
    greetingText: {
        fontSize: FONT_SIZES.LG,
        color: COLORS.WHITE,
    },
    goalsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    goalsText: {
        color: COLORS.SUCCESS,
        fontSize: FONT_SIZES.LG,
    },
    goalsCompleted: {
        fontWeight: 'bold',
    },
    goalsTotal: {
        fontWeight: 'normal',
    },
    dataCards: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.MD,
        zIndex: 1,
        marginBottom: SPACING.MD,
    },
    dataCard: {
        flex: 1,
    },
    dataCardRight: {
        flex: 1,
    },
    todaysPlan: {
        padding: SPACING.MD,
        zIndex: 1,
        marginHorizontal: SPACING.MD,
        marginBottom: SPACING.MD,
    },
    planTitle: {
        color: COLORS.WHITE,
        fontSize: FONT_SIZES.XL,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    noTasksText: {
        color: COLORS.WHITE,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.PRIMARY,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 80,
        right: 20,
    },
    fabIcon: {
        width: 32,
        height: 32,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: COLORS.WHITE,
        fontSize: FONT_SIZES.MD,
    },
    scrollContent: {
        paddingBottom: 20,
    },
});

export default DashboardScreen;
