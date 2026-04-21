// Babel configuration for Expo SDK 52+
// - expo-router requires its plugin to wire up file-based routing
// - react-native-reanimated plugin must be LAST in the list
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Path aliases: @/* -> ./src/*
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
