module.exports = {
    reactNativePath: './node_modules/react-native',
    project: {
      ios: {
        // 👇 This ensures new-arch generation happens properly
        sourceDir: './ios',
      },
    },
    assets: [],
  dependencies: {},
  commands: [],
  platforms: {},
  newArchEnabled: true,  // ✅ Force Fabric generation
  };
  