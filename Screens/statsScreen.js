import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, ImageBackground } from 'react-native';
import { getAuth } from 'firebase/auth';
import { useUserData } from '../hooks/useUserData';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants';
import * as Haptics from 'expo-haptics';

const StatsScreen = ({ navigation }) => {
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  
  const {
    userInfo,
    points,
    tasks,
    getDailyCompletion,
    getHistoricalProgress,
    getStreakInfo,
  } = useUserData(userId);

  const [streakInfo, setStreakInfo] = useState({ currentStreak: 0, longestStreak: 0 });
  const [historicalProgress, setHistoricalProgress] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStatsData = async () => {
      if (userId) {
        const streak = await getStreakInfo();
        setStreakInfo(streak);
        
        const history = await getHistoricalProgress(30); // Last 30 days
        setHistoricalProgress(history);
        setIsLoading(false);
      }
    };
    
    loadStatsData();
  }, [userId, getStreakInfo, getHistoricalProgress]);

  const renderStreakInfo = () => {
    return (
      <View style={styles.streakContainer}>
        <Text style={styles.sectionTitle}>🔥 Streak Information</Text>
        <View style={styles.streakCards}>
          <View style={styles.streakCard}>
            <View style={styles.streakIconContainer}>
              <Text style={styles.streakIcon}>🔥</Text>
            </View>
            <Text style={styles.streakValue}>{streakInfo.currentStreak}</Text>
            <Text style={styles.streakLabel}>Current Streak</Text>
            <Text style={styles.streakSubtext}>days</Text>
          </View>
          <View style={styles.streakCard}>
            <View style={styles.streakIconContainer}>
              <Text style={styles.streakIcon}>🏆</Text>
            </View>
            <Text style={styles.streakValue}>{streakInfo.longestStreak}</Text>
            <Text style={styles.streakLabel}>Longest Streak</Text>
            <Text style={styles.streakSubtext}>days</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderHistoricalProgress = () => {
    if (historicalProgress.length === 0) return null;
    
    const last7Days = historicalProgress.slice(0, 7);
    const averageCompletion = last7Days.length > 0 
      ? Math.round(last7Days.reduce((sum, day) => sum + day.percentage, 0) / last7Days.length)
      : 0;
    
    return (
      <View style={styles.historicalContainer}>
        <Text style={styles.sectionTitle}>📈 Last 7 Days Performance</Text>
        <View style={styles.chartContainer}>
          {last7Days.map((day, index) => (
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
        <View style={styles.averageContainer}>
          <Text style={styles.averageText}>Average: {averageCompletion}%</Text>
        </View>
      </View>
    );
  };

  const renderAchievements = () => {
    const achievements = [];
    
    if (streakInfo.currentStreak >= 7) {
      achievements.push({ title: 'Week Warrior', icon: '🔥', description: '7-day streak', color: '#FF6B6B' });
    }
    if (streakInfo.longestStreak >= 30) {
      achievements.push({ title: 'Monthly Master', icon: '🏆', description: '30-day streak', color: '#FFD700' });
    }
    if (points >= 100) {
      achievements.push({ title: 'Point Collector', icon: '⭐', description: '100+ points', color: '#4CAF50' });
    }
    if (getDailyCompletion() >= 100) {
      achievements.push({ title: 'Perfect Day', icon: '💯', description: '100% completion', color: '#03C988' });
    }
    
    if (achievements.length === 0) {
      return (
        <View style={styles.achievementsContainer}>
          <Text style={styles.sectionTitle}>🏅 Achievements</Text>
          <View style={styles.noAchievementsCard}>
            <Text style={styles.noAchievementsIcon}>🎯</Text>
            <Text style={styles.noAchievementsText}>Keep going! Complete tasks to earn achievements.</Text>
          </View>
        </View>
      );
    }
    
    return (
      <View style={styles.achievementsContainer}>
        <Text style={styles.sectionTitle}>🏅 Achievements</Text>
        {achievements.map((achievement, index) => (
          <View key={index} style={[styles.achievementItem, { borderLeftColor: achievement.color }]}>
            <View style={[styles.achievementIconContainer, { backgroundColor: achievement.color + '20' }]}>
              <Text style={styles.achievementIcon}>{achievement.icon}</Text>
            </View>
            <View style={styles.achievementContent}>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.achievementDescription}>{achievement.description}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ImageBackground
          source={require('../assets/dashboardBG.png')}
          style={styles.loadingBackground}
        >
          <View style={styles.loadingContent}>
            <Text style={styles.loadingText}>Loading your stats...</Text>
          </View>
        </ImageBackground>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/dashboardBG.png')}
      style={styles.backgroundImage}
    >
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.goBack();
            }}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Stats</Text>
          <View style={styles.placeholder} />
        </View>

        {/* User Info */}
        <View style={styles.userInfoContainer}>
          <Image source={require('../assets/user.png')} style={styles.profileImage} />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{userInfo.name || 'User'}</Text>
            <Text style={styles.userHouse}>{userInfo.house} House</Text>
            <View style={styles.pointsContainer}>
              <Text style={styles.pointsIcon}>⭐</Text>
              <Text style={styles.userPoints}>{points} points earned</Text>
            </View>
          </View>
        </View>

        {/* Streak Information */}
        {renderStreakInfo()}

        {/* Historical Progress */}
        {renderHistoricalProgress()}

        {/* Achievements */}
        {renderAchievements()}
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  loadingContainer: {
    flex: 1,
  },
  loadingBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: SPACING.LG,
    borderRadius: BORDER_RADIUS.LG,
  },
  loadingText: {
    fontSize: FONT_SIZES.MD,
    color: COLORS.WHITE,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.LG,
    paddingTop: SPACING.XL,
    paddingBottom: SPACING.MD,
  },
  backButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: BORDER_RADIUS.MD,
  },
  backButtonText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.MD,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: FONT_SIZES.XL,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  placeholder: {
    width: 50,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.LG,
    backgroundColor: 'rgba(3, 201, 136, 0.15)',
    marginHorizontal: SPACING.LG,
    borderRadius: BORDER_RADIUS.LG,
    marginBottom: SPACING.LG,
    borderWidth: 1,
    borderColor: 'rgba(3, 201, 136, 0.3)',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: SPACING.MD,
    borderWidth: 3,
    borderColor: COLORS.PRIMARY,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: FONT_SIZES.XL,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    marginBottom: SPACING.XS,
  },
  userHouse: {
    fontSize: FONT_SIZES.MD,
    color: COLORS.PRIMARY,
    fontWeight: '600',
    marginBottom: SPACING.XS,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsIcon: {
    fontSize: FONT_SIZES.SM,
    marginRight: SPACING.XS,
  },
  userPoints: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.GRAY.LIGHT,
  },
  streakContainer: {
    paddingHorizontal: SPACING.LG,
    marginBottom: SPACING.LG,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.LG,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    marginBottom: SPACING.MD,
  },
  streakCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  streakCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: SPACING.LG,
    borderRadius: BORDER_RADIUS.LG,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: SPACING.XS,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  streakIconContainer: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    padding: SPACING.SM,
    borderRadius: BORDER_RADIUS.ROUND,
    marginBottom: SPACING.SM,
  },
  streakIcon: {
    fontSize: FONT_SIZES.XL,
  },
  streakValue: {
    fontSize: FONT_SIZES.XL,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  streakLabel: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.GRAY.LIGHT,
    marginTop: SPACING.XS,
  },
  streakSubtext: {
    fontSize: FONT_SIZES.XS,
    color: COLORS.GRAY.MEDIUM,
  },
  historicalContainer: {
    paddingHorizontal: SPACING.LG,
    marginBottom: SPACING.LG,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.LG,
    height: 150,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
    color: COLORS.GRAY.LIGHT,
    textAlign: 'center',
  },
  averageContainer: {
    backgroundColor: 'rgba(3, 201, 136, 0.2)',
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    marginTop: SPACING.MD,
    alignItems: 'center',
  },
  averageText: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  achievementsContainer: {
    paddingHorizontal: SPACING.LG,
    marginBottom: SPACING.LG,
  },
  noAchievementsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: SPACING.LG,
    borderRadius: BORDER_RADIUS.LG,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  noAchievementsIcon: {
    fontSize: FONT_SIZES.XL,
    marginBottom: SPACING.SM,
  },
  noAchievementsText: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.GRAY.LIGHT,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    marginBottom: SPACING.SM,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.PRIMARY,
  },
  achievementIconContainer: {
    padding: SPACING.SM,
    borderRadius: BORDER_RADIUS.ROUND,
    marginRight: SPACING.MD,
  },
  achievementIcon: {
    fontSize: FONT_SIZES.LG,
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
    color: COLORS.GRAY.LIGHT,
    marginTop: 2,
  },
});

export default StatsScreen; 