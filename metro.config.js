// metro.config.js for Expo Go compatibility with Firebase and React Native modules
const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.sourceExts.push('cjs');
// This disables the new package exports resolution which can break some packages in Expo Go
// See: https://github.com/expo/expo/issues/24108
// and https://stackoverflow.com/a/78375867

defaultConfig.resolver.unstable_enablePackageExports = false;

module.exports = defaultConfig;
