import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../constants';
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
  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={[styles.title, titleStyle]}>{title}</Text>
        {icon && (
          <Image source={icon} style={[styles.icon, iconStyle]} />
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.SM,
  },
  title: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.MD,
    fontWeight: 'bold',
  },
  icon: {
    height: 26,
    width: 26,
  },
  progressBar: {
    marginTop: SPACING.LG,
  },
  value: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.SM,
    marginTop: SPACING.SM,
  },
});

export default DataCard; 