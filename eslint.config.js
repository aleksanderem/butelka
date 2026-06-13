const expoConfig = require("eslint-config-expo/flat");

module.exports = [
  ...expoConfig,
  {
    ignores: [
      "dist/*",
      ".expo/*",
      "node_modules/*",
      "convex/_generated/*",
      "expo-env.d.ts",
      "uniwind-types.d.ts",
    ],
  },
];
