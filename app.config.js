// GitHub Pages serves the site under /<repo-name>/, so the web export needs a base URL.
// Only set during the Pages build (EXPO_BASE_URL=/Mashinam); local dev stays at "/".
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    ...(process.env.EXPO_BASE_URL ? { baseUrl: process.env.EXPO_BASE_URL } : {}),
  },
});
