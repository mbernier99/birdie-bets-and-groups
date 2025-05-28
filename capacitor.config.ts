
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.54e3c22eb8174e089bfbececaf451d58',
  appName: 'Suntory Cup',
  webDir: 'dist',
  server: {
    url: 'https://54e3c22e-b817-4e08-9bfb-ececaf451d58.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;
