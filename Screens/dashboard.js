import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl, Animated, ImageBackground } from 'react-native';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, DEFAULTS, HOUSE_CONFIG, HOUSES, TYPOGRAPHY } from '../constants';
import { formatDate } from '../utils/helpers';
import { DataCard, TaskItem, WeekProgress, CircularProgress } from '../components/dashboard';
import { globalStyles } from '../styles/globalStyles';
import notificationService from '../utils/notificationService';
import { getFitnessResponse } from '../API/chatApi';
import { useUserData } from '../hooks/useUserData';
import BottomNav from '../components/navigation/BottomNav';

const DashboardScreen = ({ route, navigation }) => {
    console.log('Dashboard - Component mounted');
    
    const currentUser = auth().currentUser;
    const userId = currentUser?.uid;
    
    console.log('Dashboard - User ID:', userId);
    
    // Get route params for better data flow
    const routeUserInfo = route.params?.userInfo;
    const isProfileComplete = route.params?.isProfileComplete;
    const isProfileIncomplete = route.params?.isProfileIncomplete;
    
    const {
        userInfo,
        points: userPoints,
        tasks: userTasks,
        dailyProgress,
        weeklyProgress,
        isLoading,
        loadUserData,
        updateTasks,
        updateTaskCompletion,
        hasTasksForToday,
        getCompletedTasksCount,
        getTotalTasksCount,
        getDailyCompletion,
        getWeeklyProgressData,
        getHistoricalProgress,
        getStreakInfo,
    } = useUserData(userId);

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
    const [streakInfo, setStreakInfo] = useState({ currentStreak: 0, longestStreak: 0 });
    const [historicalProgress, setHistoricalProgress] = useState([]);
    const [activeTab, setActiveTab] = useState('Home');
    const [fadeAnim] = useState(new Animated.Value(0));

    // Use route userInfo if available, otherwise use hook data
    const currentUserInfo = routeUserInfo || userInfo;
    const currentPoints = userPoints || 0;
    const currentTasks = userTasks || [];

    console.log('Dashboard - Current user info:', { hasUserInfo: !!currentUserInfo, isLoading });

    // Calculate derived values
    const completedTasksCount = getCompletedTasksCount();
    const totalTasksCount = getTotalTasksCount();
    const dailyCompletion = getDailyCompletion();
    const recommended_calories_per_day = currentUserInfo?.recommended_calories_per_day || DEFAULTS.CALORIES_PER_DAY;

    // Weekly progress data
    const weeklyProgressData = getWeeklyProgressData();

    // Animate in when component mounts
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    // Check if tasks should be generated
    const shouldGenerateTasks = useCallback(() => {
        return !hasTasksForToday() && !isGeneratingTasks && currentUserInfo;
    }, [hasTasksForToday, isGeneratingTasks, currentUserInfo]);

    // Enhanced AI task generation with better personalization
    const generateDailyTasks = useCallback(async () => {
        if (!userId || !currentUserInfo || Object.keys(currentUserInfo).length === 0) {
            console.log('Dashboard - Cannot generate tasks: missing user data');
            return;
        }

        try {
            setIsGeneratingTasks(true);
            console.log('Dashboard - Generating daily tasks for user:', currentUserInfo.name);
            
            // Get house configuration for trainer profile picture
            const houseConfig = HOUSE_CONFIG[currentUserInfo.house] || HOUSE_CONFIG[HOUSES.NOVA];
            
            // Create personalized prompt based on user data
            const personalizedPrompt = `Generate personalized daily fitness tasks for ${currentUserInfo.name} from the House of ${currentUserInfo.house}. 
            
User Profile:
- Name: ${currentUserInfo.name}
- House: ${currentUserInfo.house}
- BMI: ${currentUserInfo.bmi || 'normal'}
- Height: ${currentUserInfo.height || 170}cm
- Weight: ${currentUserInfo.weight || 70}kg
- Exercise Level: ${currentUserInfo.exerciseLevel || 'beginner'}
- Goals: ${(currentUserInfo.selectedOptions && currentUserInfo.selectedOptions.length > 0) ? currentUserInfo.selectedOptions.join(", ") : 'general fitness'}
- Daily Calorie Target: ${currentUserInfo.recommended_calories_per_day || 2000}

Please create 5-7 daily tasks that are:
1. Personalized to their fitness level and goals
2. House-specific in style and motivation
3. Include a mix of exercise, nutrition, and wellness activities
4. Have realistic timing throughout the day
5. Include motivational emojis and clear descriptions`;

            const aiResponse = await getFitnessResponse({
                name: currentUserInfo.name || 'User',
                house: currentUserInfo.house || 'FitQuest',
                bmi: currentUserInfo.bmi || 'normal',
                height: currentUserInfo.height || 170,
                weight: currentUserInfo.weight || 70,
                exerciseLevel: currentUserInfo.exerciseLevel || 'beginner',
                selectedOptions: currentUserInfo.selectedOptions || ['general fitness'],
                message: personalizedPrompt,
                conversationHistory: []
            });

            if (aiResponse?.dailyTasks && aiResponse.dailyTasks.length > 0) {
                console.log('Dashboard - Generated tasks:', aiResponse.dailyTasks);
                
                // Add date and enhance task data
                const today = new Date().toDateString();
                const tasksWithDate = aiResponse.dailyTasks.map((task, index) => ({
                    ...task,
                    id: `task_${Date.now()}_${index}`,
                    date: today,
                    completed: false,
                    points: task.points || 5,
                    category: task.category || 'general',
                    difficulty: task.difficulty || 'medium'
                }));
                
                // Save tasks to Firebase
                await database().ref(`users/${userId}/dailyTasks`).set(tasksWithDate);
                
                // Update local state
                updateTasks(tasksWithDate);
                
                // Schedule notifications for the new tasks with trainer profile picture
                await notificationService.scheduleDailyTasks(tasksWithDate, userId, houseConfig.trainerProfile);
                
                console.log('Dashboard - Daily tasks saved and notifications scheduled');
                
                // Show success feedback
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
                console.log('Dashboard - No tasks generated from AI response');
                // Generate fallback tasks
                const fallbackTasks = [
                    { id: 'task_1', time: '8:00 AM', emoji: '💧', title: 'Drink water', date: today, completed: false, points: 5 },
                    { id: 'task_2', time: '10:00 AM', emoji: '🏃‍♂️', title: 'Take a walk', date: today, completed: false, points: 10 },
                    { id: 'task_3', time: '12:00 PM', emoji: '🥗', title: 'Eat a healthy lunch', date: today, completed: false, points: 5 },
                    { id: 'task_4', time: '3:00 PM', emoji: '🧘‍♀️', title: 'Stretch break', date: today, completed: false, points: 5 },
                    { id: 'task_5', time: '6:00 PM', emoji: '🏋️‍♂️', title: 'Evening workout', date: today, completed: false, points: 15 }
                ];
                
                await database().ref(`users/${userId}/dailyTasks`).set(fallbackTasks);
                updateTasks(fallbackTasks);
            }
        } catch (error) {
            console.error('Dashboard - Error generating daily tasks:', error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setIsGeneratingTasks(false);
        }
    }, [currentUserInfo, updateTasks, userId]);

    // Generate tasks when user data is loaded and no tasks exist
    useEffect(() => {
        if (!isLoading && currentUserInfo && Object.keys(currentUserInfo).length > 0 && shouldGenerateTasks()) {
            console.log('Dashboard - Generating tasks for user with no tasks');
            generateDailyTasks();
        }
    }, [isLoading, currentUserInfo, shouldGenerateTasks, generateDailyTasks]);

    // Load streak and historical data
    useEffect(() => {
        const loadProgressData = async () => {
            if (userId) {
                const streak = await getStreakInfo();
                setStreakInfo(streak);
                
                const history = await getHistoricalProgress(7);
                setHistoricalProgress(history);
            }
        };
        
        loadProgressData();
    }, [userId, getStreakInfo, getHistoricalProgress]);

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await loadUserData();
        setIsRefreshing(false);
    }, [loadUserData]);

    const handleUpgrade = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert('Coming Soon', 'Premium features will be available soon!');
    };

    const handleNotificationSettings = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        if (!userId) {
            console.error('No authenticated user found');
            return;
        }

        navigation.navigate('Chat', { 
            userId: userId,
            userInfo: currentUserInfo,
            points: currentPoints,
            tasks: currentTasks
        });
    };

    const handleMealPhoto = async (taskTitle) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        if (!userId) {
            console.error('No authenticated user found');
            return;
        }

        // Navigate to chat with meal photo context
        navigation.navigate('Chat', { 
            userId: userId,
            userInfo: currentUserInfo,
            points: currentPoints,
            tasks: currentTasks,
            mealContext: taskTitle
        });
    };

    const handleTaskToggle = async (taskTitle, completed) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        
        try {
            await updateTaskCompletion(taskTitle, completed);
            
            if (completed) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        } catch (error) {
            console.error('Error updating task completion:', error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    };

    const handleLogout = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        try {
            await auth().signOut();
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (error) {
            console.error('Error signing out:', error);
            Alert.alert('Error', 'Failed to sign out. Please try again.');
        }
    };

    // Show loading state
    if (isLoading || !currentUserInfo) {
        console.log('Dashboard - Loading state:', { isLoading, currentUserInfo: !!currentUserInfo, userId });
        return (
            <View style={styles.loadingContainer}>
                <ImageBackground
                    source={require('../assets/loadingBG.png')}
                    style={styles.loadingBackground}
                >
                    <View style={styles.loadingContent}>
                        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
                        <Text style={styles.loadingText}>Loading your fitness journey...</Text>
                        <Text style={[styles.loadingText, { fontSize: 12, marginTop: 10 }]}>
                            {isLoading ? 'Loading user data...' : 'No user data found'}
                        </Text>
                        <Text style={[styles.loadingText, { fontSize: 10, marginTop: 5 }]}>
                            User ID: {userId || 'None'}
                        </Text>
                    </View>
                </ImageBackground>
            </View>
        );
    }

    console.log('Dashboard - Rendering main content');

    try {
        return (
            <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={onRefresh}
                            colors={[COLORS.PRIMARY]}
                            tintColor={COLORS.PRIMARY}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header Section */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.greeting}>
                                Welcome back, {currentUserInfo.name || 'User'}! 👋
                            </Text>
                            <Text style={styles.subtitle}>
                                House of {currentUserInfo.house || 'FitQuest'}
                            </Text>
                        </View>
                        <View style={styles.headerRight}>
                            <TouchableOpacity style={styles.pointsContainer} onPress={handleUpgrade}>
                                <Text style={styles.pointsText}>{currentPoints}</Text>
                                <Text style={styles.pointsLabel}>Points</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Quick Stats */}
                    <View style={styles.statsContainer}>
                        <DataCard
                            title="Today's Progress"
                            value={`${completedTasksCount}/${totalTasksCount}`}
                            subtitle="Tasks Completed"
                            icon="📊"
                            color={COLORS.PRIMARY}
                        />
                        <DataCard
                            title="Daily Goal"
                            value={`${Math.round(dailyCompletion)}%`}
                            subtitle="Completion Rate"
                            icon="🎯"
                            color={COLORS.SUCCESS}
                        />
                    </View>

                    {/* Circular Progress */}
                    <View style={styles.progressSection}>
                        <CircularProgress
                            progress={dailyCompletion / 100}
                            size={120}
                            strokeWidth={12}
                            color={COLORS.PRIMARY}
                            text={`${Math.round(dailyCompletion)}%`}
                        />
                        <View style={styles.progressInfo}>
                            <Text style={styles.progressTitle}>Daily Progress</Text>
                            <Text style={styles.progressSubtitle}>
                                {completedTasksCount} of {totalTasksCount} tasks completed
                            </Text>
                        </View>
                    </View>

                    {/* Tasks Section */}
                    <View style={styles.tasksSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Today's Tasks</Text>
                            {isGeneratingTasks && (
                                <ActivityIndicator size="small" color={COLORS.PRIMARY} />
                            )}
                        </View>
                        
                        {currentTasks.length > 0 ? (
                            currentTasks.map((task, index) => (
                                <TaskItem
                                    key={task.id || index}
                                    task={task}
                                    onToggle={(completed) => handleTaskToggle(task.title, completed)}
                                    onMealPhoto={() => handleMealPhoto(task.title)}
                                />
                            ))
                        ) : (
                            <View style={styles.emptyTasks}>
                                <Text style={styles.emptyTasksText}>No tasks for today</Text>
                                <Text style={styles.emptyTasksSubtext}>
                                    {isGeneratingTasks ? 'Generating your personalized tasks...' : 'Pull to refresh to generate tasks'}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Weekly Progress */}
                    <View style={styles.weeklySection}>
                        <Text style={styles.sectionTitle}>Weekly Progress</Text>
                        <WeekProgress data={weeklyProgressData} />
                    </View>

                    {/* Streak Info */}
                    {streakInfo.currentStreak > 0 && (
                        <View style={styles.streakSection}>
                            <Text style={styles.sectionTitle}>Your Streak</Text>
                            <View style={styles.streakContainer}>
                                <Text style={styles.streakText}>
                                    🔥 {streakInfo.currentStreak} day{streakInfo.currentStreak !== 1 ? 's' : ''} streak
                                </Text>
                                <Text style={styles.streakSubtext}>
                                    Longest: {streakInfo.longestStreak} days
                                </Text>
                            </View>
                        </View>
                    )}
                </ScrollView>

                {/* Floating Action Button for Chat */}
                <TouchableOpacity
                    style={styles.fab}
                    onPress={handleChatNavigation}
                    activeOpacity={0.8}
                >
                    <Text style={styles.fabText}>💬</Text>
                </TouchableOpacity>

                {/* Bottom Navigation */}
                <BottomNav
                    activeTab={activeTab}
                    onTabPress={setActiveTab}
                    onProfilePress={() => navigation.navigate('Profile', { userInfo: currentUserInfo })}
                    onStatsPress={() => navigation.navigate('Stats', { userInfo: currentUserInfo })}
                    onSettingsPress={handleNotificationSettings}
                    onLogoutPress={handleLogout}
                />
            </Animated.View>
        );
    } catch (error) {
        console.error('DashboardScreen error:', error);
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' }}>
                <Text style={{ color: 'white', fontSize: 18, marginBottom: 10 }}>Something went wrong in Dashboard</Text>
                <Text style={{ color: 'red', fontSize: 14 }}>{error.message}</Text>
            </View>
        );
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.BACKGROUND,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100, // Space for bottom nav
    },
    loadingContainer: {
        flex: 1,
    },
    loadingBackground: {
        flex: 1,
    },
    loadingContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    loadingText: {
        color: COLORS.WHITE,
        fontSize: 16,
        marginTop: SPACING.MD,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.LG,
        paddingTop: SPACING.XL,
        paddingBottom: SPACING.LG,
        backgroundColor: COLORS.SURFACE,
    },
    headerLeft: {
        flex: 1,
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.WHITE,
        marginBottom: SPACING.XS,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.GRAY.LIGHT,
    },
    headerRight: {
        alignItems: 'flex-end',
    },
    pointsContainer: {
        backgroundColor: COLORS.PRIMARY,
        paddingHorizontal: SPACING.MD,
        paddingVertical: SPACING.SM,
        borderRadius: BORDER_RADIUS.MD,
        alignItems: 'center',
    },
    pointsText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.WHITE,
    },
    pointsLabel: {
        fontSize: 12,
        color: COLORS.WHITE,
        opacity: 0.8,
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.LG,
        marginBottom: SPACING.LG,
    },
    progressSection: {
        alignItems: 'center',
        marginBottom: SPACING.XL,
    },
    progressInfo: {
        alignItems: 'center',
        marginTop: SPACING.MD,
    },
    progressTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.WHITE,
        marginBottom: SPACING.XS,
    },
    progressSubtitle: {
        fontSize: 14,
        color: COLORS.GRAY.LIGHT,
    },
    tasksSection: {
        paddingHorizontal: SPACING.LG,
        marginBottom: SPACING.XL,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.MD,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.WHITE,
    },
    emptyTasks: {
        alignItems: 'center',
        paddingVertical: SPACING.XL,
    },
    emptyTasksText: {
        fontSize: 16,
        color: COLORS.GRAY.LIGHT,
        marginBottom: SPACING.SM,
    },
    emptyTasksSubtext: {
        fontSize: 14,
        color: COLORS.GRAY.MEDIUM,
        textAlign: 'center',
    },
    weeklySection: {
        paddingHorizontal: SPACING.LG,
        marginBottom: SPACING.XL,
    },
    streakSection: {
        paddingHorizontal: SPACING.LG,
        marginBottom: SPACING.XL,
    },
    streakContainer: {
        backgroundColor: COLORS.SURFACE,
        padding: SPACING.MD,
        borderRadius: BORDER_RADIUS.MD,
        alignItems: 'center',
    },
    streakText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.WHITE,
        marginBottom: SPACING.XS,
    },
    streakSubtext: {
        fontSize: 14,
        color: COLORS.GRAY.LIGHT,
    },
    fab: {
        position: 'absolute',
        bottom: 100,
        right: SPACING.LG,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.PRIMARY,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: COLORS.PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    fabText: {
        fontSize: 24,
    },
});

export default DashboardScreen;