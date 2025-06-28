import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  // Initialize notifications
  async initialize() {
    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return false;
      }

      // Get push token
      if (Device.isDevice) {
        this.expoPushToken = (await Notifications.getExpoPushTokenAsync({
          projectId: 'your-project-id', // Replace with your Expo project ID
        })).data;
        console.log('Push token:', this.expoPushToken);
      } else {
        console.log('Must use physical device for Push Notifications');
      }

      // Set up notification listeners
      this.setupNotificationListeners();

      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  // Set up notification listeners
  setupNotificationListeners() {
    // Listen for incoming notifications
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Listen for notification responses (when user taps notification)
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  // Handle notification response
  handleNotificationResponse(response) {
    const { data } = response.notification.request.content;
    
    switch (data.type) {
      case 'task_reminder':
        // Navigate to task or open app
        console.log('Task reminder tapped:', data.taskTitle);
        break;
      case 'exercise_reminder':
        // Navigate to chat or specific exercise
        console.log('Exercise reminder tapped:', data.exerciseName);
        break;
      case 'daily_checkin':
        // Navigate to dashboard
        console.log('Daily checkin reminder tapped');
        break;
      default:
        console.log('Unknown notification type:', data.type);
    }
  }

  // Schedule task reminder
  async scheduleTaskReminder(task, userId) {
    try {
      const { time, title, emoji } = task;
      
      // Parse time (format: "8:00 AM" or "14:30")
      const scheduledTime = this.parseTimeToDate(time);
      
      if (!scheduledTime) {
        console.error('Invalid time format:', time);
        return false;
      }

      // Don't schedule if time has already passed today
      if (scheduledTime <= new Date()) {
        console.log('Task time has already passed today:', time);
        return false;
      }

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: `${emoji} Task Reminder`,
          body: `Time to complete: ${title}`,
          data: {
            type: 'task_reminder',
            taskTitle: title,
            userId: userId,
            taskTime: time
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          date: scheduledTime,
        },
      });

      console.log('Task reminder scheduled:', identifier, 'for', scheduledTime);
      return identifier;
    } catch (error) {
      console.error('Error scheduling task reminder:', error);
      return false;
    }
  }

  // Schedule exercise reminder
  async scheduleExerciseReminder(exercise, userId, delayMinutes = 30) {
    try {
      const scheduledTime = new Date(Date.now() + delayMinutes * 60 * 1000);

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🏋️‍♂️ Exercise Time!',
          body: `Ready for ${exercise.exercise}? ${exercise.sets} sets × ${exercise.reps} reps`,
          data: {
            type: 'exercise_reminder',
            exerciseName: exercise.exercise,
            exerciseDetails: exercise,
            userId: userId
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          date: scheduledTime,
        },
      });

      console.log('Exercise reminder scheduled:', identifier, 'for', scheduledTime);
      return identifier;
    } catch (error) {
      console.error('Error scheduling exercise reminder:', error);
      return false;
    }
  }

  // Schedule daily checkin reminder
  async scheduleDailyCheckin(userId, hour = 9, minute = 0) {
    try {
      const scheduledTime = this.getNextOccurrence(hour, minute);

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌟 Daily Fitness Check-in',
          body: 'How are you feeling today? Let\'s check your progress!',
          data: {
            type: 'daily_checkin',
            userId: userId
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
        },
        trigger: {
          hour: hour,
          minute: minute,
          repeats: true, // Repeat daily
        },
      });

      console.log('Daily checkin scheduled:', identifier);
      return identifier;
    } catch (error) {
      console.error('Error scheduling daily checkin:', error);
      return false;
    }
  }

  // Schedule meal reminder
  async scheduleMealReminder(mealType, userId, hour, minute) {
    try {
      const scheduledTime = this.getNextOccurrence(hour, minute);

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: `🍽️ ${mealType} Time`,
          body: `Don't forget to log your ${mealType.toLowerCase()} for accurate calorie tracking!`,
          data: {
            type: 'meal_reminder',
            mealType: mealType,
            userId: userId
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.MEDIUM,
        },
        trigger: {
          hour: hour,
          minute: minute,
          repeats: true, // Repeat daily
        },
      });

      console.log(`${mealType} reminder scheduled:`, identifier);
      return identifier;
    } catch (error) {
      console.error('Error scheduling meal reminder:', error);
      return false;
    }
  }

  // Schedule water reminder
  async scheduleWaterReminder(userId, intervalHours = 2) {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: '💧 Stay Hydrated!',
          body: 'Time to drink some water and stay healthy!',
          data: {
            type: 'water_reminder',
            userId: userId
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.MEDIUM,
        },
        trigger: {
          seconds: intervalHours * 3600, // Convert hours to seconds
          repeats: true,
        },
      });

      console.log('Water reminder scheduled:', identifier);
      return identifier;
    } catch (error) {
      console.error('Error scheduling water reminder:', error);
      return false;
    }
  }

  // Parse time string to Date object
  parseTimeToDate(timeString) {
    try {
      const now = new Date();
      const [time, period] = timeString.split(' ');
      let [hours, minutes] = time.split(':').map(Number);

      // Convert to 24-hour format
      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }

      const scheduledDate = new Date(now);
      scheduledDate.setHours(hours, minutes, 0, 0);

      return scheduledDate;
    } catch (error) {
      console.error('Error parsing time:', error);
      return null;
    }
  }

  // Get next occurrence of a specific time
  getNextOccurrence(hour, minute) {
    const now = new Date();
    const scheduledTime = new Date(now);
    scheduledTime.setHours(hour, minute, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    return scheduledTime;
  }

  // Schedule all daily tasks
  async scheduleDailyTasks(tasks, userId) {
    try {
      const scheduledIds = [];

      for (const task of tasks) {
        const identifier = await this.scheduleTaskReminder(task, userId);
        if (identifier) {
          scheduledIds.push(identifier);
        }
      }

      console.log('Scheduled', scheduledIds.length, 'daily tasks');
      return scheduledIds;
    } catch (error) {
      console.error('Error scheduling daily tasks:', error);
      return [];
    }
  }

  // Cancel specific notification
  async cancelNotification(identifier) {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
      console.log('Cancelled notification:', identifier);
      return true;
    } catch (error) {
      console.error('Error cancelling notification:', error);
      return false;
    }
  }

  // Cancel all notifications
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('Cancelled all notifications');
      return true;
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
      return false;
    }
  }

  // Get all scheduled notifications
  async getScheduledNotifications() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log('Scheduled notifications:', notifications);
      return notifications;
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Cleanup listeners
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

export default new NotificationService(); 