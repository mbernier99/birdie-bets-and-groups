
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Capacitor } from '@capacitor/core'

// Initialize Capacitor for mobile platforms
if (Capacitor.isNativePlatform()) {
  console.log('Running on native platform:', Capacitor.getPlatform())
}

createRoot(document.getElementById("root")!).render(<App />);
