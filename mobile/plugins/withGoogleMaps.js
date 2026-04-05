const { createAndroidManifestPlugin } = require('@expo/config-plugins/build/plugins/android-plugins');
const Manifest = require('@expo/config-plugins/build/android/Manifest');

const META_API_KEY = 'com.google.android.geo.API_KEY';
const LIB_HTTP = 'org.apache.http.legacy';

/**
 * Mantém com.google.android.geo.API_KEY no manifest com placeholder Gradle.
 * O valor real vem de manifestPlaceholders em android/app/build.gradle
 * (env GOOGLE_MAPS_API_KEY / EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ou gradle.properties).
 *
 * Não usar withGoogleMapsApiKey sem chave: ele remove a meta-data e o MapView crasha em release.
 */
module.exports = function withGoogleMapsGradlePlaceholder(config) {
  return createAndroidManifestPlugin((config, androidManifest) => {
    const mainApplication = Manifest.getMainApplicationOrThrow(androidManifest);
    Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      META_API_KEY,
      '${googleMapsApiKey}',
    );
    Manifest.addUsesLibraryItemToMainApplication(mainApplication, {
      name: LIB_HTTP,
      required: false,
    });
    return androidManifest;
  }, 'withGoogleMapsGradlePlaceholder')(config);
};
