import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sunkoshi.bearing',
  appName: 'Sunkoshi Bearing Centre',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
