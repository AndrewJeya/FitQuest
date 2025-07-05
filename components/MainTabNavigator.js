import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import dashboard from '../Screens/dashboard';
import userAvatar from '../assets/user.png';
// Placeholder screens for Activity, Community, Me
const ActivityScreen = () => <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text>Activity</Text></View>;
const CommunityScreen = () => <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text>Community</Text></View>;
const MeScreen = () => <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text>Me</Text></View>;

const Tab = createBottomTabNavigator();

const iconNameForRoute = {
  Home: 'home',
  Activity: 'fitness-center',
  Feed: 'groups',
  Me: 'person',
};

function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.tabBarContainer}>
      <LinearGradient
        colors={['rgba(255,255,255,0.08)', 'rgba(160,157,174,0.03)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[StyleSheet.absoluteFill, { opacity: 0.7 }]}
      />
      <BlurView intensity={30} tint="light" style={[StyleSheet.absoluteFill, { opacity: 0.7 }]} />
      <View style={styles.tabBarContent}>
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
              navigation.navigate(route.name);
            }
          };

          // Custom icon for Me tab
          let icon;
          if (route.name === 'Me') {
            icon = (
              <View style={[styles.iconWrapper, isFocused && styles.selectedIconWrapper]}>
                <Image
                  source={userAvatar}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    borderWidth: isFocused ? 2 : 0,
                    borderColor: isFocused ? '#03C988' : 'transparent',
                  }}
                />
              </View>
            );
          } else {
            const iconName = iconNameForRoute[route.name];
            icon = (
              <View style={[styles.iconWrapper, isFocused && styles.selectedIconWrapper]}>
                <MaterialIcons
                  name={iconName}
                  size={28}
                  color={isFocused ? '#03C988' : '#A0A0A0'}
                />
              </View>
            );
          }

          return (
            <View key={route.key} style={styles.tabItemWrapper}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                style={styles.tabButton}
                activeOpacity={0.8}
              >
                {icon}
                <Text style={[styles.tabLabel, isFocused ? styles.tabLabelSelected : styles.tabLabelUnselected]}>
                  {label}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={dashboard} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen name="Feed" component={CommunityScreen} />
      <Tab.Screen name="Me" component={MeScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 76,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    overflow: 'visible',
    paddingBottom: 12,
    paddingTop: 10,
  },
  tabBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    paddingHorizontal: 27,
    gap: 10,
  },
  tabItemWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
    marginTop: 2,
  },
  selectedIconWrapper: {
    backgroundColor: 'rgba(3, 201, 136, 0.12)',
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  tabLabelSelected: {
    color: '#03C988',
  },
  tabLabelUnselected: {
    color: '#A0A0A0',
    opacity: 1,
  },
}); 