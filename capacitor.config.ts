import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.keogoandcode.app',
  appName: 'Keogo & Code',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#09090b',
      showSpinner: false,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#09090b',
    },
  },
};

export default config;
