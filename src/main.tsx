import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initAnalytics } from './lib/analytics'
import { isCapacitorNative } from './lib/hostMode'

try {
  initAnalytics();
} catch (error) {
  console.warn('Analytics bootstrap failed:', error);
}

if (isCapacitorNative()) {
  document.documentElement.classList.add('native-app');
}

createRoot(document.getElementById("root")!).render(<App />);
