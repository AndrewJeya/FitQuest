import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
  Platform,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, HOUSE_CONFIG, HOUSES } from '../constants';
import notificationService from '../utils/notificationService';
import * as Haptics from 'expo-haptics';
import { useUserData } from '../hooks/useUserData';

const ProfileScreen = ({ navigation, route }) => {
  const currentUser = auth().currentUser;
  const userId = currentUser?.uid;
  
  const {
    userInfo,
    points,
    tasks,
    dailyProgress = [],
    weeklyProgress,
    getDailyCompletion,
    getWeeklyProgressData,
    getHistoricalProgress,
    getStreakInfo,
  } = useUserData(userId);

  const [streakInfo, setStreakInfo] = useState({ currentStreak: 0, longestStreak: 0 });
  const [historicalProgress, setHistoricalProgress] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    const loadProfileData = async () => {
      if (userId) {
        const streak = await getStreakInfo();
        setStreakInfo(streak);
        
        const history = await getHistoricalProgress(30); // Last 30 days
        setHistoricalProgress(history);
        setIsLoading(false);
      }
    };
    
    loadProfileData();
  }, [userId, getStreakInfo, getHistoricalProgress]);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              if (Platform.OS === 'ios') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              await auth().signOut();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleNotificationToggle = async (value) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      if (value) {
        // Re-enable notifications
        await notificationService.initialize();
        setNotificationsEnabled(true);
        Alert.alert('Notifications Enabled', 'You will now receive task reminders and fitness notifications.');
      } else {
        // Disable notifications
        await notificationService.cancelAllNotifications();
        setNotificationsEnabled(false);
        Alert.alert('Notifications Disabled', 'You will no longer receive task reminders and fitness notifications.');
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      Alert.alert('Error', 'Failed to update notification settings.');
    }
  };

  const handleEditProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('UserInfo', { userInfo, isEditing: true });
  };

  const handleViewStats = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to stats screen (can be implemented later)
    Alert.alert('Coming Soon', 'Detailed statistics and progress tracking will be available soon!');
  };

  const handleHelpSupport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Help & Support', 'For support, please contact us at support@fitquest.com');
  };

  const handlePrivacyPolicy = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Privacy Policy', 'Your privacy is important to us. Our full privacy policy is available on our website.');
  };

  const getHouseConfig = () => {
    return HOUSE_CONFIG[userInfo.house] || HOUSE_CONFIG[HOUSES.NOVA];
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Image
          source={require('../assets/dashboardBG.png')}
          style={styles.backgroundImage}
        />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#03C988" />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </View>
    );
  }

  const houseConfig = getHouseConfig();

  const safeDailyProgress = Array.isArray(dailyProgress) ? dailyProgress : [];

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/dashboardBG.png')}
        style={styles.backgroundImage}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Image source={require('../assets/back-icon.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <Image
              source={require('../assets/user.png')}
              style={styles.profileImage}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{userInfo.name || 'User'}</Text>
              <Text style={styles.userEmail}>{userInfo.email}</Text>
              <View style={styles.houseBadge}>
                <Image source={houseConfig.crest} style={styles.houseCrest} />
                <Text style={styles.houseName}>{houseConfig.name}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{points}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userInfo.exerciseLevel || 'Beginner'}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userInfo.bmi || 'N/A'}</Text>
              <Text style={styles.statLabel}>BMI</Text>
            </View>
          </View>
        </View>

        <View style={{ alignItems: 'center', marginVertical: 24 }}>
          <TouchableOpacity
            style={{
              backgroundColor: COLORS.error || '#FF5252',
              paddingVertical: 14,
              paddingHorizontal: 40,
              borderRadius: 30,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 3,
              marginTop: 8,
            }}
            onPress={handleLogout}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Log Out</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Streaks</Text>
          <View style={styles.streakContainer}>
            <View style={styles.streakItem}>
              <Text style={styles.streakValue}>{streakInfo.currentStreak} days</Text>
              <Text style={styles.streakLabel}>Current Streak</Text>
            </View>
            <View style={styles.streakItem}>
              <Text style={styles.streakValue}>{streakInfo.longestStreak} days</Text>
              <Text style={styles.streakLabel}>Longest Streak</Text>
            </View>
          </View>
        </View>

        {/* Progress Chart */}
        <View style={styles.progressChartContainer}>
          <Text style={styles.sectionTitle}>Last 7 Days Performance</Text>
          <View style={styles.chartContainer}>
            {historicalProgress.slice(0, 7).map((day, index) => (
              <View key={index} style={styles.chartBarContainer}>
                <View 
                  style={[
                    styles.chartBar, 
                    { 
                      height: `${Math.max(day.percentage, 5)}%`,
                      backgroundColor: day.percentage >= 80 ? '#4CAF50' : 
                                     day.percentage >= 50 ? '#FF9800' : '#FF6B6B'
                    }
                  ]} 
                />
                <Text style={styles.chartDate}>
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              </View>
            ))}
          </View>
          <Text style={styles.averageText}>Average: {Math.round(safeDailyProgress.reduce((sum, day) => sum + day.percentage, 0) / safeDailyProgress.length)}%</Text>
        </View>

        {/* Achievements */}
        <View style={styles.achievementsContainer}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          {streakInfo.currentStreak >= 7 && (
            <View style={styles.achievementItem}>
              <Text style={styles.achievementIcon}>🔥</Text>
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>Week Warrior</Text>
                <Text style={styles.achievementDescription}>7-day streak</Text>
              </View>
            </View>
          )}
          {streakInfo.longestStreak >= 30 && (
            <View style={styles.achievementItem}>
              <Text style={styles.achievementIcon}>🏆</Text>
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>Monthly Master</Text>
                <Text style={styles.achievementDescription}>30-day streak</Text>
              </View>
            </View>
          )}
          {points >= 100 && (
            <View style={styles.achievementItem}>
              <Text style={styles.achievementIcon}>⭐</Text>
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>Point Collector</Text>
                <Text style={styles.achievementDescription}>100+ points</Text>
              </View>
            </View>
          )}
          {getDailyCompletion() >= 100 && (
            <View style={styles.achievementItem}>
              <Text style={styles.achievementIcon}>💯</Text>
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>Perfect Day</Text>
                <Text style={styles.achievementDescription}>100% completion</Text>
              </View>
            </View>
          )}
        </View>

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleEditProfile}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>👤</Text>
              <Text style={styles.settingText}>Edit Profile</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🔔</Text>
              <Text style={styles.settingText}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: '#767577', true: COLORS.PRIMARY }}
              thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>

          <TouchableOpacity style={styles.settingItem} onPress={handleViewStats}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>📊</Text>
              <Text style={styles.settingText}>View Statistics</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleHelpSupport}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>❓</Text>
              <Text style={styles.settingText}>Help & Support</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handlePrivacyPolicy}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🔒</Text>
              <Text style={styles.settingText}>Privacy Policy</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BLACK,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.MD,
    marginTop: 50,
    zIndex: 1,
  },
  backButton: {
    padding: SPACING.SM,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.WHITE,
  },
  headerTitle: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.XL,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: COLORS.BACKGROUND.CARD,
    margin: SPACING.MD,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.LG,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.LG,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: SPACING.MD,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.XL,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    color: COLORS.GRAY.LIGHT,
    fontSize: FONT_SIZES.MD,
    marginBottom: 8,
  },
  houseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  houseCrest: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  houseName: {
    color: COLORS.PRIMARY,
    fontSize: FONT_SIZES.SM,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.BACKGROUND.DARK,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.LG,
    fontWeight: 'bold',
  },
  statLabel: {
    color: COLORS.GRAY.LIGHT,
    fontSize: FONT_SIZES.SM,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.GRAY.DARK,
  },
  statsSection: {
    backgroundColor: COLORS.BACKGROUND.CARD,
    margin: SPACING.MD,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.LG,
  },
  streakContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.BACKGROUND.DARK,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
  },
  streakItem: {
    alignItems: 'center',
  },
  streakValue: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.LG,
    fontWeight: 'bold',
  },
  streakLabel: {
    color: COLORS.GRAY.LIGHT,
    fontSize: FONT_SIZES.SM,
    marginTop: 4,
  },
  progressChartContainer: {
    backgroundColor: COLORS.BACKGROUND.CARD,
    margin: SPACING.MD,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.LG,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: COLORS.BACKGROUND.DARK,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    height: 150,
  },
  chartBarContainer: {
    alignItems: 'center',
    flex: 1,
  },
  chartBar: {
    width: 20,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 2,
    marginBottom: SPACING.SM,
    minHeight: 4,
  },
  chartDate: {
    fontSize: FONT_SIZES.XS,
    color: COLORS.GRAY.MEDIUM,
    textAlign: 'center',
  },
  averageText: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.GRAY.MEDIUM,
    textAlign: 'center',
    marginTop: SPACING.SM,
  },
  achievementsContainer: {
    backgroundColor: COLORS.BACKGROUND.CARD,
    margin: SPACING.MD,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.LG,
  },
  sectionTitle: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.LG,
    fontWeight: 'bold',
    marginBottom: SPACING.MD,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND.DARK,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    marginBottom: SPACING.SM,
  },
  achievementIcon: {
    fontSize: FONT_SIZES.XL,
    marginRight: SPACING.MD,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: FONT_SIZES.MD,
    fontWeight: '600',
    color: COLORS.WHITE,
  },
  achievementDescription: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.GRAY.MEDIUM,
    marginTop: 2,
  },
  settingsSection: {
    backgroundColor: COLORS.BACKGROUND.CARD,
    margin: SPACING.MD,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.LG,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.MD,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BACKGROUND.DARK,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    fontSize: FONT_SIZES.LG,
    marginRight: SPACING.MD,
  },
  settingText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.MD,
  },
  settingArrow: {
    color: COLORS.GRAY.LIGHT,
    fontSize: FONT_SIZES.LG,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.MD,
    marginTop: 16,
  },
});

export default ProfileScreen;