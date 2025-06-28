import { StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants';

export const globalStyles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: COLORS.BLACK,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  // Background
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    backgroundColor: COLORS.BLACK,
  },

  // Text
  title: {
    fontSize: FONT_SIZES.XXXL,
    color: COLORS.WHITE,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.XL,
    color: COLORS.WHITE,
    fontWeight: '600',
    textAlign: 'center',
  },
  bodyText: {
    fontSize: FONT_SIZES.MD,
    color: COLORS.WHITE,
  },
  caption: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.GRAY.LIGHT,
  },
  label: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.WHITE,
    marginBottom: SPACING.SM,
    fontWeight: '500',
  },

  // Cards
  card: {
    backgroundColor: COLORS.GRAY.CARD,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.MD,
    shadowColor: COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  glassCard: {
    backgroundColor: COLORS.BACKGROUND.CARD,
    borderRadius: BORDER_RADIUS.LG,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: SPACING.MD,
  },

  // Buttons
  button: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS.MD,
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.MD,
    fontWeight: '600',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS.MD,
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: {
    color: COLORS.PRIMARY,
    fontSize: FONT_SIZES.MD,
    fontWeight: '600',
  },

  // Inputs
  input: {
    borderWidth: 1,
    borderColor: COLORS.GRAY.DARK,
    borderRadius: BORDER_RADIUS.MD,
    backgroundColor: COLORS.GRAY.INPUT,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.MD,
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.MD,
  },
  inputFocused: {
    borderColor: COLORS.PRIMARY,
  },
  inputError: {
    borderColor: '#FF6B6B',
  },

  // Progress
  progressContainer: {
    backgroundColor: COLORS.GRAY.TRANSPARENT,
    borderRadius: BORDER_RADIUS.ROUND,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS.ROUND,
  },

  // Spacing
  marginTop: {
    marginTop: SPACING.MD,
  },
  marginBottom: {
    marginBottom: SPACING.MD,
  },
  marginLeft: {
    marginLeft: SPACING.MD,
  },
  marginRight: {
    marginRight: SPACING.MD,
  },
  padding: {
    padding: SPACING.MD,
  },
  paddingHorizontal: {
    paddingHorizontal: SPACING.MD,
  },
  paddingVertical: {
    paddingVertical: SPACING.MD,
  },

  // Shadows
  shadow: {
    shadowColor: COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  shadowLight: {
    shadowColor: COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  // Status
  success: {
    color: COLORS.SUCCESS,
  },
  error: {
    color: '#FF6B6B',
  },
  warning: {
    color: '#FFA726',
  },
  info: {
    color: COLORS.PRIMARY,
  },
});

export default globalStyles; 