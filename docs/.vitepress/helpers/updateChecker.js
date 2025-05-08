import { createApp } from 'vue';
import UpdateNotification from '../components/AposUpdateNotification.vue';

export function setupUpdateChecker() {
  if (typeof window === 'undefined') {
    return;
  }

  // Check every 5 minutes
  const checkInterval = 5 * 60 * 1000;
  let notificationInstance = null;

  const checkForUpdates = async () => {
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`/version.json?t=${timestamp}`);

      if (!response.ok) {
        console.warn('Update check failed:', response.status);
        return;
      }

      const data = await response.json();
      const storedVersion = window.localStorage.getItem('apos-site-version');

      // First visit
      if (!storedVersion) {
        window.localStorage.setItem('apos-site-version', data.version);
        return;
      }

      // Version changed
      if (storedVersion !== data.version && !notificationInstance) {
        showUpdateNotification();
        window.localStorage.setItem('apos-site-version', data.version);
      }
    } catch (error) {
      console.error('Update check error:', error);
    }
  };

  const showUpdateNotification = () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    // Create and mount the notification component
    const app = createApp(UpdateNotification);
    app.mount(container);

    // Store reference to handle cleanup if needed later
    notificationInstance = {
      app,
      container
    };
  };

  // Initial check
  setTimeout(checkForUpdates, 1000);

  // Set up visibility change handler
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkForUpdates();
    }
  });

  // Periodic checks when visible
  setInterval(() => {
    if (document.visibilityState === 'visible') {
      checkForUpdates();
    }
  }, checkInterval);
}
