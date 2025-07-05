import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const BottomNav = ({ activeTab, onTabPress }) => (
  <View style={styles.container}>
    <NavItem
      icon="home"
      label="Home"
      active={activeTab === 'Home'}
      onPress={() => onTabPress('Home')}
    />
    <NavItem
      icon="fitness-center"
      label="Activity"
      active={activeTab === 'Activity'}
      onPress={() => onTabPress('Activity')}
    />
    <NavItem
      icon="groups"
      label="Community"
      active={activeTab === 'Community'}
      onPress={() => onTabPress('Community')}
    />
    <NavItem
      icon="storefront"
      label="Mart"
      active={activeTab === 'Mart'}
      onPress={() => onTabPress('Mart')}
    />
  </View>
);

const NavItem = ({ icon, label, active, onPress }) => (
  <TouchableOpacity style={styles.item} onPress={onPress}>
    <MaterialIcons
      name={icon}
      size={28}
      color={active ? '#fff' : '#aaa'}
      style={active && styles.activeIcon}
    />
    <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    height: 70,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 10,
    paddingTop: 5,
  },
  item: {
    alignItems: 'center',
    flex: 1,
  },
  label: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 2,
  },
  activeLabel: {
    color: '#fff',
    fontWeight: 'bold',
  },
  activeIcon: {
    // Optionally add a shadow or scale for active icon
  },
});

export default BottomNav; 