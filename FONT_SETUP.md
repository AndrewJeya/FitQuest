# Font Setup Guide

## Current Font System

The app now uses a comprehensive typography system with the following fonts:

### Font Families
- **Circular Std** - For display text, headers, and titles
- **SF Pro Text** - For body text and regular content

### Typography Styles

#### Display Styles (Circular Std)
- `DISPLAY_LARGE` - 48px, Bold
- `DISPLAY_MEDIUM` - 42px, Bold  
- `DISPLAY_SMALL` - 36px, Bold
- `HEADING_1` - 28px, Bold
- `HEADING_2` - 24px, Bold
- `HEADING_3` - 20px, Semibold
- `HEADING_4` - 18px, Semibold

#### Body Styles (SF Pro Text)
- `BODY_LARGE` - 18px, Regular
- `BODY_MEDIUM` - 16px, Regular
- `BODY_SMALL` - 14px, Regular
- `BODY_XSMALL` - 12px, Regular

#### Button Styles (SF Pro Text)
- `BUTTON_LARGE` - 18px, Bold
- `BUTTON_MEDIUM` - 16px, Bold
- `BUTTON_SMALL` - 14px, Bold

#### Caption Styles (SF Pro Text)
- `CAPTION` - 12px, Regular
- `CAPTION_BOLD` - 12px, Bold

## Adding Custom Fonts

To add the actual Circular Std and SF Pro Text fonts:

1. **Download the font files** (.ttf or .otf format)
2. **Place them in `assets/fonts/` directory**
3. **Update `utils/fontLoader.js`** to load the fonts:

```javascript
await Font.loadAsync({
  'CircularStd-Bold': require('../assets/fonts/CircularStd-Bold.ttf'),
  'CircularStd-Medium': require('../assets/fonts/CircularStd-Medium.ttf'),
  'CircularStd-Regular': require('../assets/fonts/CircularStd-Regular.ttf'),
  'SFProText-Regular': require('../assets/fonts/SFProText-Regular.ttf'),
  'SFProText-Medium': require('../assets/fonts/SFProText-Medium.ttf'),
  'SFProText-Bold': require('../assets/fonts/SFProText-Bold.ttf'),
  'SFProText-Semibold': require('../assets/fonts/SFProText-Semibold.ttf'),
});
```

## Usage

Use the typography styles in your components:

```javascript
import { TYPOGRAPHY } from '../constants';

// In your styles
const styles = StyleSheet.create({
  title: {
    ...TYPOGRAPHY.HEADING_1,
    color: COLORS.WHITE,
  },
  body: {
    ...TYPOGRAPHY.BODY_MEDIUM,
    color: COLORS.GRAY.LIGHT,
  },
  button: {
    ...TYPOGRAPHY.BUTTON_MEDIUM,
    color: COLORS.WHITE,
  },
});
```

## Current Status

- ✅ Typography system implemented
- ✅ Font constants defined
- ✅ Components updated to use new typography
- ⏳ Custom font files need to be added
- ⏳ Font loading needs to be enabled

## Fallback System

The app currently uses system fonts as fallbacks:
- iOS: System fonts that closely match Circular Std and SF Pro
- Android: Sans-serif variants

When custom fonts are added, the system will automatically use them instead of the fallbacks. 