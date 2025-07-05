import { useState, useEffect, useCallback } from 'react';
import { ref, get, onValue, set, push } from 'firebase/database';
import { db } from '../firebaseConfig';

export const useUserData = (userId) => {
  const [userInfo, setUserInfo] = useState({});
  const [points, setPoints] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [dailyProgress, setDailyProgress] = useState({});
  const [weeklyProgress, setWeeklyProgress] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Load initial user data
  const loadUserData = useCallback(async (isRefresh = false) => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      if (isRefresh) {
        setIsLoading(true);
      }
      
      // Load user info
      const userSnapshot = await get(ref(db, `users/${userId}`));
      if (userSnapshot.exists()) {
        setUserInfo(userSnapshot.val());
      }
      
      // Load points
      const pointsSnapshot = await get(ref(db, `users/${userId}/points`));
      if (pointsSnapshot.exists()) {
        setPoints(pointsSnapshot.val());
      }
      
      // Load daily tasks
      const tasksSnapshot = await get(ref(db, `users/${userId}/dailyTasks`));
      if (tasksSnapshot.exists()) {
        setTasks(tasksSnapshot.val());
      }
      
      // Load daily progress
      const dailyProgressSnapshot = await get(ref(db, `users/${userId}/dailyProgress`));
      if (dailyProgressSnapshot.exists()) {
        setDailyProgress(dailyProgressSnapshot.val());
      }
      
      // Load weekly progress
      const weeklyProgressSnapshot = await get(ref(db, `users/${userId}/weeklyProgress`));
      if (weeklyProgressSnapshot.exists()) {
        setWeeklyProgress(weeklyProgressSnapshot.val());
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Real-time listeners for data updates
  useEffect(() => {
    if (!userId) {
      console.log('useUserData - No userId provided');
      return;
    }

    console.log('useUserData - Setting up listeners for userId:', userId);
    // Set loading to true only on initial load
    setIsLoading(true);

    const unsubscribeUser = onValue(ref(db, `users/${userId}`), (snapshot) => {
      console.log('useUserData - User data snapshot:', { exists: snapshot.exists(), hasData: !!snapshot.val() });
      if (snapshot.exists()) {
        setUserInfo(snapshot.val());
        setLastUpdated(new Date());
      }
      setIsLoading(false);
    });

    const unsubscribePoints = onValue(ref(db, `users/${userId}/points`), (snapshot) => {
      if (snapshot.exists()) {
        setPoints(snapshot.val());
        setLastUpdated(new Date());
      }
    });

    const unsubscribeTasks = onValue(ref(db, `users/${userId}/dailyTasks`), (snapshot) => {
      if (snapshot.exists()) {
        setTasks(snapshot.val());
        setLastUpdated(new Date());
      } else {
        setTasks([]);
      }
    });

    const unsubscribeDailyProgress = onValue(ref(db, `users/${userId}/dailyProgress`), (snapshot) => {
      if (snapshot.exists()) {
        setDailyProgress(snapshot.val());
        setLastUpdated(new Date());
      }
    });

    const unsubscribeWeeklyProgress = onValue(ref(db, `users/${userId}/weeklyProgress`), (snapshot) => {
      if (snapshot.exists()) {
        setWeeklyProgress(snapshot.val());
        setLastUpdated(new Date());
      }
    });

    return () => {
      unsubscribeUser();
      unsubscribePoints();
      unsubscribeTasks();
      unsubscribeDailyProgress();
      unsubscribeWeeklyProgress();
    };
  }, [userId]);

  // Update points
  const updatePoints = useCallback(async (newPoints) => {
    if (!userId) return;
    
    try {
      await set(ref(db, `users/${userId}/points`), newPoints);
      setPoints(newPoints);
    } catch (error) {
      console.error('Error updating points:', error);
    }
  }, [userId]);

  // Add points
  const addPoints = useCallback(async (pointsToAdd) => {
    if (!userId) return;
    
    const newTotal = points + pointsToAdd;
    await updatePoints(newTotal);
  }, [userId, points, updatePoints]);

  // Update tasks
  const updateTasks = useCallback(async (newTasks) => {
    if (!userId) return;
    
    try {
      await set(ref(db, `users/${userId}/dailyTasks`), newTasks);
      setTasks(newTasks);
    } catch (error) {
      console.error('Error updating tasks:', error);
    }
  }, [userId]);

  // Update task completion
  const updateTaskCompletion = useCallback(async (taskTitle, completed) => {
    if (!userId) return;
    
    const updatedTasks = tasks.map(task => {
      if (task.title === taskTitle) {
        return { ...task, completed };
      }
      return task;
    });
    
    await updateTasks(updatedTasks);
    
    // Update daily progress when task completion changes
    await updateDailyProgress();
  }, [userId, tasks, updateTasks]);

  // Update daily progress
  const updateDailyProgress = useCallback(async () => {
    if (!userId) return;
    
    const today = new Date().toDateString();
    const completedCount = tasks.filter(task => task.completed).length;
    const totalCount = tasks.length;
    const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    const todayProgress = {
      date: today,
      completed: completedCount,
      total: totalCount,
      percentage: completionPercentage,
      timestamp: new Date().toISOString(),
    };
    
    try {
      await set(ref(db, `users/${userId}/dailyProgress/${today.replace(/\s/g, '_')}`), todayProgress);
      
      // Update weekly progress
      await updateWeeklyProgress();
    } catch (error) {
      console.error('Error updating daily progress:', error);
    }
  }, [userId, tasks]);

  // Update weekly progress
  const updateWeeklyProgress = useCallback(async () => {
    if (!userId) return;
    
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    
    const weekProgress = {};
    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    
    // Get progress for each day of the current week
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateString = date.toDateString();
      const dateKey = dateString.replace(/\s/g, '_');
      
      const dayProgress = dailyProgress[dateKey];
      if (dayProgress) {
        weekProgress[dayNames[i]] = dayProgress.percentage;
      } else {
        weekProgress[dayNames[i]] = 0;
      }
    }
    
    try {
      await set(ref(db, `users/${userId}/weeklyProgress`), weekProgress);
    } catch (error) {
      console.error('Error updating weekly progress:', error);
    }
  }, [userId, dailyProgress]);

  // Check if tasks exist for today
  const hasTasksForToday = useCallback(() => {
    const today = new Date().toDateString();
    return tasks.some(task => task.date === today);
  }, [tasks]);

  // Get completed tasks count
  const getCompletedTasksCount = useCallback(() => {
    return tasks.filter(task => task.completed).length;
  }, [tasks]);

  // Get total tasks count
  const getTotalTasksCount = useCallback(() => {
    return tasks.length;
  }, [tasks]);

  // Calculate daily completion percentage
  const getDailyCompletion = useCallback(() => {
    const total = getTotalTasksCount();
    if (total === 0) return 0;
    return Math.round((getCompletedTasksCount() / total) * 100);
  }, [getCompletedTasksCount, getTotalTasksCount]);

  // Get weekly progress data
  const getWeeklyProgressData = useCallback(() => {
    const weekDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    return weekDays.map(day => ({
      day: day.charAt(0).toUpperCase() + day.slice(1, 3),
      progress: weeklyProgress[day] || 0
    }));
  }, [weeklyProgress]);

  // Get historical progress data
  const getHistoricalProgress = useCallback(async (days = 7) => {
    if (!userId) return [];
    
    try {
      const progressSnapshot = await get(ref(db, `users/${userId}/dailyProgress`));
      if (!progressSnapshot.exists()) return [];
      
      const progressData = progressSnapshot.val();
      const sortedDates = Object.keys(progressData)
        .sort((a, b) => new Date(progressData[b].date) - new Date(progressData[a].date))
        .slice(0, days);
      
      return sortedDates.map(dateKey => progressData[dateKey]);
    } catch (error) {
      console.error('Error loading historical progress:', error);
      return [];
    }
  }, [userId]);

  // Get streak information
  const getStreakInfo = useCallback(async () => {
    if (!userId) return { currentStreak: 0, longestStreak: 0 };
    
    try {
      const progressSnapshot = await get(ref(db, `users/${userId}/dailyProgress`));
      if (!progressSnapshot.exists()) return { currentStreak: 0, longestStreak: 0 };
      
      const progressData = progressSnapshot.val();
      const sortedDates = Object.keys(progressData)
        .sort((a, b) => new Date(progressData[b].date) - new Date(progressData[a].date));
      
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      
      for (const dateKey of sortedDates) {
        const dayProgress = progressData[dateKey];
        if (dayProgress.percentage >= 50) { // Consider 50%+ as a completed day
          tempStreak++;
          if (currentStreak === 0) currentStreak = tempStreak;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 0;
        }
      }
      
      longestStreak = Math.max(longestStreak, tempStreak);
      
      return { currentStreak, longestStreak };
    } catch (error) {
      console.error('Error calculating streak:', error);
      return { currentStreak: 0, longestStreak: 0 };
    }
  }, [userId]);

  return {
    userInfo,
    points,
    tasks,
    dailyProgress,
    weeklyProgress,
    isLoading,
    lastUpdated,
    loadUserData,
    updatePoints,
    addPoints,
    updateTasks,
    updateTaskCompletion,
    updateDailyProgress,
    hasTasksForToday,
    getCompletedTasksCount,
    getTotalTasksCount,
    getDailyCompletion,
    getWeeklyProgressData,
    getHistoricalProgress,
    getStreakInfo,
  };
}; 