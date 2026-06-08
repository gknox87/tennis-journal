import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sportsjournal.app',
  appName: 'Sports Journal',
  webDir: 'dist',
  backgroundColor: '#6366F1',
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#6366F1',
    allowsLinkPreview: false,
    scrollEnabled: true,
  },
  android: {
    backgroundColor: '#6366F1',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
