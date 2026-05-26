import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.iabadaba.app',
  appName: 'iabadaba',
  webDir: 'dist',
  android: {
    buildOptions: {
      releaseType: 'AAB', // formato preferido pela Play Store
    },
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
};

export default config;
