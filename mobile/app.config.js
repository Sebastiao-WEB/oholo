/* eslint-disable @typescript-eslint/no-require-imports */
const { expo } = require('./app.json');

/**
 * Mantém app.json como fonte principal e acrescenta meta-data Maps + placeholder Gradle (android/app/build.gradle).
 */
module.exports = () => ({
  expo: {
    ...expo,
    plugins: [...(expo.plugins || []), './plugins/withGoogleMaps.js'],
  },
});
