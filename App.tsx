/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useRef, useState } from 'react';
import { AppState, StatusBar, useColorScheme, Linking } from 'react-native';
import Toast from 'react-native-toast-message';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './src/navigation/GlobalNavigation';
// import { AuthProvider } from './src/context/AuthContext';
import Appstack from './src/navigation/Appstack';
import { initializeTokenRefresh, NotificationPayload, refreshTokenOnForeground } from './src/utils/notificationHelpers';
import NotificationService from './src/utils/NotificationServices';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/redux/Store/Store';
import { toastConfig } from './src/utils/ToastConfig';

function App() {
  const [notification, setNotification] = useState<NotificationPayload | null>(null);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const isDarkMode = useColorScheme() === 'dark';
  const appState = useRef(AppState.currentState);
  // Get device token with error handling
  const getDeviceToken = async (): Promise<string | null> => {
    try {
      const { getFCMToken } = await import('./src/utils/notificationHelpers');
      const token = await getFCMToken();
      console.log('📱 Device token:', token ? 'Received' : 'Not available');
      return token;
    } catch (error) {
      console.error('❌ Error getting device token:', error);
      return null;
    }
  };

  const handleAppStateChange = async (nextAppState: string) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      console.log('📱 App came to foreground, refreshing FCM token...');
      try {
        await refreshTokenOnForeground();
      } catch (error) {
        console.warn('⚠️ Error refreshing token on foreground:', error);
      }
    }
    appState.current = nextAppState as any;
  };

  useEffect(() => {

    // Handle Deep Linking
    const handleDeepLink = (event: { url: string }) => {
      console.log('🔗 Deep Link received:', event.url);
      const url = event.url;

      // Check for Stripe success URL (Custom Scheme OR HTTPS)
      const isStripeSuccess =
        (url.includes('stripe/webhook') || url.includes('niletechinnovations.com')) &&
        url.includes('status=success');

      if (isStripeSuccess) {
        console.log('✅ Payment success detected from deep link');
        if (navigationRef.isReady()) {
          // Small delay to ensure navigation is ready if app just moved to foreground
          setTimeout(() => {
            navigationRef.navigate('PurchaseSuccessful' as never);
          }, 500);
        } else {
          console.warn('Navigation not ready for deep link');
        }
      }
    };

    // Check for initial URL (if app opened from closed state)
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    // Add listener
    const linkingSubscription = Linking.addEventListener('url', handleDeepLink);

    // Initialize app with notifications - wrap in try-catch to prevent crashes
    const initializeApp = async () => {
      try {
        console.log('🚀 Initializing app...');

        // Initialize notification service with error handling
        try {
          await NotificationService.getInstance().initialize();
          console.log('🔔 Notification service initialized');
        } catch (notifError) {
          console.warn('⚠️ Notification service init warning:', notifError);
        }

        // Get device token (non-critical)
        try {
          const token = await getDeviceToken();
          console.log('📱 Device token:', token ? 'Available' : 'Not available');
        } catch (tokenError) {
          console.warn('⚠️ Device token fetch warning:', tokenError);
        }

        // Initialize token refresh listener
        try {
          const unsubscribeTokenRefresh = initializeTokenRefresh();
          console.log('🔄 Token refresh listener initialized');
          return unsubscribeTokenRefresh;
        } catch (refreshError) {
          console.warn('⚠️ Token refresh init warning:', refreshError);
          return undefined;
        }
      } catch (error) {
        console.error('❌ Non-critical error during app initialization:', error);
        return undefined;
      }
    };

    // Set up app state change listener
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    // Set up notification listener for custom popup
    const unsubscribeForeground = NotificationService.getInstance().onForegroundNotification((notificationData: NotificationPayload) => {
      console.log('📱 Notification received:', notificationData);
      setNotification(notificationData);
      setShowNotificationPopup(true);
    });

    // Initialize token refresh listener and set up cleanup
    const unsubscribeTokenRefresh = initializeTokenRefresh();

    // Delay the async initialization to avoid blocking the UI
    const initTimeout = setTimeout(() => {
      initializeApp().catch(err => {
        console.warn('⚠️ Async initialization failed:', err);
      });
    }, 100);

    return () => {
      clearTimeout(initTimeout);
      if (unsubscribeForeground) unsubscribeForeground();
      if (unsubscribeTokenRefresh) unsubscribeTokenRefresh();
      appStateSubscription.remove();
      linkingSubscription.remove();
    };
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

          <NavigationContainer ref={navigationRef}>
            <Appstack />
          </NavigationContainer>
          <Toast config={toastConfig} topOffset={60} />
          {/* <Toast topOffset={60} /> */}
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
