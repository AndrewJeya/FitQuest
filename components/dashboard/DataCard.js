import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, TYPOGRAPHY } from '../../constants';
import ProgressBar from '../common/ProgressBar';

const DataCard = ({
  title,
  value,
  icon,
  progress = 80,
  maxProgress = 100,
  style,
  titleStyle,
  valueStyle,
  iconStyle,
}) => {
  const isEmoji = typeof icon === 'string' && icon.length <= 2;
  
  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={[styles.title, titleStyle]}>{title}</Text>
        {icon && (
          isEmoji ? (
            <Text style={[styles.emojiIcon, iconStyle]}>{icon}</Text>
          ) : (
            <Image source={icon} style={[styles.icon, iconStyle]} />
          )
        )}
      </View>
      
      <ProgressBar
        progress={progress}
        total={maxProgress}
        height={8}
        style={styles.progressBar}
        animated={true}
        duration={1500}
      />
      
      <Text style={[styles.value, valueStyle]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.GRAY.CARD,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.MD,
    minHeight: 100,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.SM,
    width: '100%',
  },
  title: {
    color: COLORS.WHITE,
    ...TYPOGRAPHY.BODY_SMALL,
    textAlign: 'center',
  },
  icon: {
    height: 26,
    width: 26,
  },
  emojiIcon: {
    fontSize: FONT_SIZES.LG,
  },
  progressBar: {
    marginTop: SPACING.MD,
    width: '100%',
  },
  value: {
    color: COLORS.WHITE,
    ...TYPOGRAPHY.HEADING_3,
    textAlign: 'center',
    marginTop: SPACING.SM,
  },
});

export default DataCard; 