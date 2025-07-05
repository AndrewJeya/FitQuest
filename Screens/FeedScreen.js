import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants';

const FeedScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFeedData();
  }, []);

  const loadFeedData = () => {
    // Mock data for now - would be loaded from Firebase in real app
    const mockPosts = [
      {
        id: '1',
        user: {
          name: 'Sarah Chen',
          avatar: require('../assets/user.png'),
          house: 'House of Lumina',
        },
        type: 'achievement',
        content: 'Just completed my 30-day yoga challenge! 🧘‍♀️ Feeling more flexible and centered than ever.',
        timestamp: '2 hours ago',
        likes: 24,
        comments: 8,
        image: null,
      },
      {
        id: '2',
        user: {
          name: 'Mike Rodriguez',
          avatar: require('../assets/user.png'),
          house: 'House of Valor',
        },
        type: 'workout',
        content: 'New personal record on deadlifts today! 💪 225lbs for 5 reps. The grind never stops!',
        timestamp: '4 hours ago',
        likes: 31,
        comments: 12,
        image: null,
      },
      {
        id: '3',
        user: {
          name: 'Emma Thompson',
          avatar: require('../assets/user.png'),
          house: 'House of Nova',
        },
        type: 'meal',
        content: 'Healthy meal prep for the week! 🥗 Clean eating is the foundation of my fitness journey.',
        timestamp: '6 hours ago',
        likes: 18,
        comments: 5,
        image: null,
      },
      {
        id: '4',
        user: {
          name: 'Alex Johnson',
          avatar: require('../assets/user.png'),
          house: 'House of Lumina',
        },
        type: 'motivation',
        content: 'Remember: Progress is progress, no matter how small. Every step counts! 🌟',
        timestamp: '8 hours ago',
        likes: 42,
        comments: 15,
        image: null,
      },
    ];

    setPosts(mockPosts);
    setIsLoading(false);
  };

  const renderPost = ({ item }) => {
    const getTypeIcon = (type) => {
      switch (type) {
        case 'achievement': return 'emoji-events';
        case 'workout': return 'fitness-center';
        case 'meal': return 'restaurant';
        case 'motivation': return 'favorite';
        default: return 'fitness-center';
      }
    };

    const getTypeColor = (type) => {
      switch (type) {
        case 'achievement': return COLORS.WARNING;
        case 'workout': return COLORS.PRIMARY;
        case 'meal': return COLORS.SUCCESS;
        case 'motivation': return COLORS.SECONDARY;
        default: return COLORS.PRIMARY;
      }
    };

    return (
      <View style={styles.postCard}>
        {/* Post Header */}
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <Image source={item.user.avatar} style={styles.userAvatar} />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{item.user.name}</Text>
              <Text style={styles.userHouse}>{item.user.house}</Text>
            </View>
          </View>
          <View style={styles.postType}>
            <MaterialIcons 
              name={getTypeIcon(item.type)} 
              size={20} 
              color={getTypeColor(item.type)} 
            />
          </View>
        </View>

        {/* Post Content */}
        <View style={styles.postContent}>
          <Text style={styles.postText}>{item.content}</Text>
        </View>

        {/* Post Footer */}
        <View style={styles.postFooter}>
          <View style={styles.postStats}>
            <TouchableOpacity style={styles.statItem}>
              <MaterialIcons name="favorite-border" size={20} color={COLORS.GRAY.LIGHT} />
              <Text style={styles.statText}>{item.likes}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statItem}>
              <MaterialIcons name="chat-bubble-outline" size={20} color={COLORS.GRAY.LIGHT} />
              <Text style={styles.statText}>{item.comments}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading feed...</Text>
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
        <Text style={styles.headerTitle}>Community Feed</Text>
        <TouchableOpacity style={styles.createButton}>
          <MaterialIcons name="add" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
      </View>

      {/* Feed Content */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        style={styles.feedList}
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <MaterialIcons name="add" size={24} color={COLORS.WHITE} />
      </TouchableOpacity>
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
  createButton: {
    padding: SPACING.SM,
  },
  feedList: {
    flex: 1,
  },
  feedContent: {
    paddingHorizontal: SPACING.MD,
    paddingBottom: SPACING.XL,
  },
  postCard: {
    backgroundColor: COLORS.GRAY.CARD,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SPACING.SM,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.MD,
    fontWeight: '600',
  },
  userHouse: {
    color: COLORS.GRAY.LIGHT,
    fontSize: FONT_SIZES.SM,
  },
  postType: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.BACKGROUND.SECONDARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postContent: {
    marginBottom: SPACING.MD,
  },
  postText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.MD,
    lineHeight: 22,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postStats: {
    flexDirection: 'row',
    gap: SPACING.MD,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.XS,
  },
  statText: {
    color: COLORS.GRAY.LIGHT,
    fontSize: FONT_SIZES.SM,
  },
  timestamp: {
    color: COLORS.GRAY.MEDIUM,
    fontSize: FONT_SIZES.SM,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default FeedScreen; 