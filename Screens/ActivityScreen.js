import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { ref, get } from 'firebase/database';
import { db, auth } from '../firebaseConfig';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants';
import { formatDate } from '../utils/helpers';

const ActivityScreen = ({ navigation }) => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalCalories: 0,
    streakDays: 0,
  });

  useEffect(() => {
    loadActivityData();
  }, []);

  const loadActivityData = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      // Load chat history to extract activities
      const chatSnapshot = await get(ref(db, `chats/${userId}`));
      if (chatSnapshot.exists()) {
        const messages = chatSnapshot.val();
        const activityMessages = messages.filter(msg => 
          msg.type === 'meal_approval' || 
          msg.exerciseDetails ||
          msg.isCompletion
        );
        setActivities(activityMessages.slice(-10).reverse()); // Last 10 activities
      }

      // Load user stats
      const today = new Date().toISOString().slice(0, 10);
      const caloriesSnapshot = await get(ref(db, `users/${userId}/dailyCalories/${today}`));
      const completedSnapshot = await get(ref(db, `users/${userId}/completedTasks/${today}`));
      
      setStats({
        totalWorkouts: activities.filter(a => a.exerciseDetails).length,
        totalCalories: caloriesSnapshot.exists() ? caloriesSnapshot.val() : 0,
        streakDays: 3, // Placeholder - would need to calculate from history
      });
    } catch (error) {
      console.error('Error loading activity data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderActivityItem = (activity, index) => {
    const isMeal = activity.type === 'meal_approval';
    const isExercise = activity.exerciseDetails;
    const isCompletion = activity.isCompletion;

    return (
      <View key={activity.id || index} style={styles.activityItem}>
        <View style={styles.activityIcon}>
          {isMeal && <MaterialIcons name="restaurant" size={24} color={COLORS.PRIMARY} />}
          {isExercise && <MaterialIcons name="fitness-center" size={24} color={COLORS.SECONDARY} />}
          {isCompletion && <MaterialIcons name="check-circle" size={24} color={COLORS.SUCCESS} />}
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle}>
            {isMeal && 'Meal Logged'}
            {isExercise && `Workout: ${activity.exerciseDetails?.exercise}`}
            {isCompletion && 'Exercise Completed'}
          </Text>
          <Text style={styles.activitySubtitle}>
            {activity.timestamp ? new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
          </Text>
          {isMeal && activity.analysis && (
            <Text style={styles.activityDetails}>
              {activity.analysis.estimatedCalories} calories • {activity.analysis.approved ? 'Approved' : 'Needs improvement'}
            </Text>
          )}
          {isExercise && activity.exerciseDetails && (
            <Text style={styles.activityDetails}>
              {activity.exerciseDetails.sets} sets × {activity.exerciseDetails.reps} reps
            </Text>
          )}
        </View>
        <View style={styles.activityPoints}>
          <Text style={styles.pointsText}>+5</Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading activities...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/dashboardBG.png')}
        style={styles.backgroundImage}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity</Text>
        <TouchableOpacity style={styles.filterButton}>
          <MaterialIcons name="filter-list" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialIcons name="fitness-center" size={24} color={COLORS.PRIMARY} />
            <Text style={styles.statNumber}>{stats.totalWorkouts}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="local-fire-department" size={24} color={COLORS.WARNING} />
            <Text style={styles.statNumber}>{stats.totalCalories}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="whatshot" size={24} color={COLORS.SUCCESS} />
            <Text style={styles.statNumber}>{stats.streakDays}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>

        {/* Today's Activities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Activities</Text>
          {activities.length > 0 ? (
            activities.map(renderActivityItem)
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="fitness-center" size={48} color={COLORS.GRAY.MEDIUM} />
              <Text style={styles.emptyText}>No activities yet today</Text>
              <Text style={styles.emptySubtext}>Complete some tasks to see them here!</Text>
            </View>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BLACK,
  },
  loadingText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.MD,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.MD,
    paddingTop: 50,
  },
  headerTitle: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.XL,
    fontWeight: 'bold',
  },
  filterButton: {
    padding: SPACING.SM,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.MD,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.LG,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.GRAY.CARD,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.MD,
    alignItems: 'center',
    marginHorizontal: SPACING.XS,
  },
  statNumber: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.XL,
    fontWeight: 'bold',
    marginTop: SPACING.SM,
  },
  statLabel: {
    color: COLORS.GRAY.LIGHT,
    fontSize: FONT_SIZES.SM,
    marginTop: SPACING.XS,
  },
  section: {
    marginBottom: SPACING.LG,
  },
  sectionTitle: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.LG,
    fontWeight: 'bold',
    marginBottom: SPACING.MD,
  },
  activityItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.GRAY.CARD,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    marginBottom: SPACING.SM,
    alignItems: 'center',
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.BACKGROUND.SECONDARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.MD,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.MD,
    fontWeight: '600',
    marginBottom: SPACING.XS,
  },
  activitySubtitle: {
    color: COLORS.GRAY.LIGHT,
    fontSize: FONT_SIZES.SM,
    marginBottom: SPACING.XS,
  },
  activityDetails: {
    color: COLORS.PRIMARY,
    fontSize: FONT_SIZES.SM,
  },
  activityPoints: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS.SM,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
  },
  pointsText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.SM,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.XL,
  },
  emptyText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.LG,
    fontWeight: 'bold',
    marginTop: SPACING.MD,
    marginBottom: SPACING.SM,
  },
  emptySubtext: {
    color: COLORS.GRAY.LIGHT,
    fontSize: FONT_SIZES.MD,
    textAlign: 'center',
  },
});

export default ActivityScreen; 