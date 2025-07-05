import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ref, get, set, update } from 'firebase/database';
import { db } from '../firebaseConfig';
import { auth } from '../firebaseConfig';
import LottieView from 'lottie-react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, DEFAULTS } from '../constants';
import { formatDate } from '../utils/helpers';
import { DataCard, TaskItem, WeekProgress, MealLogModal, ProgressCircle } from '../components/dashboard';
import { globalStyles } from '../styles/globalStyles';
import notificationService from '../utils/notificationService';
import { MaterialIcons } from '@expo/vector-icons';
import { useCamera } from '../hooks/useCamera';
import { analyzeMealPhoto } from '../API/chatApi';

const DashboardScreen = ({ route, navigation }) => {
    const [userPoints, setUserPoints] = useState(DEFAULTS.POINTS);
    const [userTasks, setUserTasks] = useState(DEFAULTS.TASKS);
    const [completedTasks, setCompletedTasks] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [mealModalVisible, setMealModalVisible] = useState(false);
    const [currentMealTask, setCurrentMealTask] = useState(null);
    const [dailyCalories, setDailyCalories] = useState(0);
    
    const { cameraRef, takePicture } = useCamera();
    
    const {
        userInfo = {},
        recommended_calories_per_day = DEFAULTS.CALORIES_PER_DAY,
    } = route.params || {};

    const goalsCompleted = Object.keys(completedTasks).length;
    const totalGoals = userTasks.length;
    const progressPercentage = totalGoals > 0 ? (goalsCompleted / totalGoals) * 100 : 0;

    // Get today's date string (e.g., 2024-07-05)
    const today = new Date().toISOString().slice(0, 10);

    // Load user data and completed tasks from Firebase
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
                // Load completed tasks for today
                const completedSnapshot = await get(ref(db, `users/${userId}/completedTasks/${today}`));
                if (completedSnapshot.exists()) {
                    setCompletedTasks(completedSnapshot.val());
                } else {
                    setCompletedTasks({});
                }
                // Load daily calories
                const caloriesSnapshot = await get(ref(db, `users/${userId}/dailyCalories/${today}`));
                if (caloriesSnapshot.exists()) {
                    setDailyCalories(caloriesSnapshot.val());
                }
            } catch (error) {
                console.error('Error loading user data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadUserData();
    }, []);

    // Toggle task completion and sync with Firebase
    const handleToggleTaskComplete = async (task) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        const taskKey = `${task.time}_${task.title}`;
        const updatedCompleted = { ...completedTasks };
        if (completedTasks[taskKey]) {
            delete updatedCompleted[taskKey];
        } else {
            updatedCompleted[taskKey] = true;
        }
        setCompletedTasks(updatedCompleted);
        await set(ref(db, `users/${userId}/completedTasks/${today}`), updatedCompleted);
    };

    // Handle meal logging
    const handleMealLog = (mealTask) => {
        setCurrentMealTask(mealTask);
        setMealModalVisible(true);
    };

    // Handle meal approval from trainer
    const handleMealApproved = async (mealData) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        try {
            // Send meal photo and info to trainer via chat
            const mealMessage = `I'm logging my ${mealData.task.title} at ${mealData.task.time}. Here's my meal photo for approval.`;
            
            // Send to chat with trainer
            const chatRef = ref(db, `chats/${userId}`);
            const chatSnapshot = await get(chatRef);
            const messages = chatSnapshot.exists() ? chatSnapshot.val() : [];
            
            const newMessage = {
                id: Date.now().toString(),
                text: mealMessage,
                sender: 'user',
                timestamp: new Date().toISOString(),
                type: 'meal_log',
                mealData: mealData,
            };
            
            console.log('Adding meal log message:', newMessage);
            messages.push(newMessage);
            await set(chatRef, messages);
            console.log('Meal log message added to Firebase');

            // Get AI trainer response using dedicated meal analysis
            const trainerResponse = await analyzeMealPhoto(mealData, userInfo);
            console.log('Trainer response received:', trainerResponse);

            // Add trainer response to chat
            const trainerMessage = {
                id: (Date.now() + 1).toString(),
                text: `Meal Analysis: ${trainerResponse.approved ? '✅ Approved' : '❌ Needs improvement'}\n\nCalories: ${trainerResponse.estimatedCalories}\nFeedback: ${trainerResponse.feedback}\nSuggestions: ${trainerResponse.suggestions}`,
                sender: 'trainer',
                timestamp: new Date().toISOString(),
                type: 'meal_approval',
                analysis: trainerResponse,
            };
            
            console.log('Adding trainer response message:', trainerMessage);
            messages.push(trainerMessage);
            await set(chatRef, messages);
            console.log('Trainer response added to Firebase');

            // Process the trainer response
            if (trainerResponse.approved) {
                // Update daily calories
                const estimatedCalories = trainerResponse.estimatedCalories;
                const newCalories = dailyCalories + estimatedCalories;
                setDailyCalories(newCalories);
                await set(ref(db, `users/${userId}/dailyCalories/${today}`), newCalories);
                
                // Mark task as completed
                const taskKey = `${mealData.task.time}_${mealData.task.title}`;
                const updatedCompleted = { ...completedTasks, [taskKey]: true };
                setCompletedTasks(updatedCompleted);
                await set(ref(db, `users/${userId}/completedTasks/${today}`), updatedCompleted);
                
                // Update points
                const newPoints = userPoints + 10; // Bonus for logging meals
                setUserPoints(newPoints);
                await set(ref(db, `users/${userId}/points`), newPoints);
                
                console.log('Meal approved - updated calories, completion, and points');
            }
        } catch (error) {
            console.error('Error handling meal approval:', error);
            throw error;
        }
    };

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
                        <Text style={styles.heroName}>{userInfo.name},</Text>
                        <Text style={styles.heroSubtitle}>Let's conquer the day!</Text>
                        <Text style={styles.heroGoals}>
                          <Text style={styles.heroGoalsHighlight}>{goalsCompleted}/{totalGoals} goals</Text>
                          <Text style={styles.heroGoalsRest}> completed</Text>
                        </Text>
                        {userInfo.justification && (
                          <Text style={styles.justificationText}>{userInfo.justification}</Text>
                        )}
                    </View>
                    <View style={styles.greetingVisual}>
                        <ProgressCircle 
                            progress={progressPercentage}
                            size={100}
                            strokeWidth={12}
                        />
                    </View>
                </View>

                <View style={styles.dataCards}>
                    <DataCard
                        title="Daily Calories"
                        value={`${dailyCalories}/${recommended_calories_per_day}`}
                        icon={require('../assets/fireDashboard.png')}
                        progress={(dailyCalories / recommended_calories_per_day) * 100}
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
                                completed={!!completedTasks[`${task.time}_${task.title}`]}
                                onToggleComplete={() => handleToggleTaskComplete(task)}
                                onMealLog={handleMealLog}
                            />
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.noTasksText}>No tasks for today.</Text>
                            <Text style={styles.emptySubtext}>Check back later for your personalized plan!</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            <TouchableOpacity style={styles.fab} onPress={handleChatNavigation}>
                <Image source={require('../assets/chatBG.png')} style={styles.fabIcon} />
            </TouchableOpacity>

            <MealLogModal
                visible={mealModalVisible}
                onClose={() => setMealModalVisible(false)}
                mealTask={currentMealTask}
                onMealApproved={handleMealApproved}
                cameraRef={cameraRef}
                takePicture={takePicture}
            />
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    greetingContent: {},
    greetingVisual: {},
    date: {
        color: 'rgba(245, 245, 245, 0.30)',
        fontSize: FONT_SIZES.MD,
        marginBottom: 16,
    },
    heroName: {
        fontWeight: 'bold',
        fontSize: 22,
        color: '#fff',
        marginBottom: 2,
        textAlign: 'left',
    },
    heroSubtitle: {
        fontSize: 18,
        color: '#fff',
        marginBottom: 6,
        textAlign: 'left',
    },
    heroGoals: {
        fontSize: 16,
        color: '#fff',
        marginTop: 2,
        textAlign: 'left',
    },
    heroGoalsHighlight: {
        color: '#22C55E',
        fontWeight: 'bold',
    },
    heroGoalsRest: {
        color: '#fff',
        fontWeight: '400',
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    dataCardRight: {
        flex: 1,
        marginLeft: SPACING.MD,
    },
    todaysPlan: {
        padding: SPACING.MD,
        zIndex: 1,
        marginHorizontal: SPACING.MD,
        marginBottom: SPACING.MD,
        backgroundColor: 'rgba(53, 62, 58, 0.3)',
        borderRadius: BORDER_RADIUS.LG,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
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
        fontSize: FONT_SIZES.MD,
        marginBottom: SPACING.SM,
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
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
    justificationText: {
        color: '#A0A0A0',
        fontSize: 14,
        marginTop: 8,
        marginBottom: 4,
        textAlign: 'left',
        fontStyle: 'italic',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.MD,
    },
    emptySubtext: {
        color: 'rgba(245, 245, 245, 0.30)',
        fontSize: FONT_SIZES.MD,
        textAlign: 'center',
    },
});

export default DashboardScreen;
