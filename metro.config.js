<<<<<<< HEAD
// metro.config.js for Expo Go compatibility with Firebase and React Native modules
=======
>>>>>>> bf70d55b6a6cce213b346920c1dcaca28feee3da
const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.sourceExts.push('cjs');
<<<<<<< HEAD
// This disables the new package exports resolution which can break some packages in Expo Go
// See: https://github.com/expo/expo/issues/24108
// and https://stackoverflow.com/a/78375867

defaultConfig.resolver.unstable_enablePackageExports = false;

module.exports = defaultConfig;
=======

// This is the new line you should add in, after the previous lines
defaultConfig.resolver.unstable_enablePackageExports = false;

module.exports = defaultConfig; 
>>>>>>> bf70d55b6a6cce213b346920c1dcaca28feee3da
