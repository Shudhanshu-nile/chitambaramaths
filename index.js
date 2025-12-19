/**
 * @format
 */

import { AppRegistry, Text, TextInput, TouchableOpacity, Alert, Platform, Linking } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigationRef } from './src/navigation/GlobalNavigation';

// Disable font scaling
if (Text.defaultProps == null) Text.defaultProps = {};
if (TextInput.defaultProps == null) TextInput.defaultProps = {};
if (TouchableOpacity.defaultProps == null) TouchableOpacity.defaultProps = {};
Text.defaultProps.allowFontScaling = false;
TextInput.defaultProps.allowFontScaling = false;
TouchableOpacity.defaultProps.allowFontScaling = false;

// ✅ Enhanced background & quit notification handler
try {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('🔔 Message handled in the background!', remoteMessage);

        try {
            // Parse notification data
            const notification = {
                title: remoteMessage.notification?.title,
                body: remoteMessage.notification?.body,
                data: remoteMessage.data || {},
                screen: remoteMessage.data?.screen,
                params: remoteMessage.data?.params ? JSON.parse(remoteMessage.data.params) : undefined,
                timestamp: new Date().toISOString()
            };

            // Store notification for when app comes to foreground
            const storedNotifications = await AsyncStorage.getItem('backgroundNotifications');
            const notifications = storedNotifications ? JSON.parse(storedNotifications) : [];
            notifications.push(notification);
            await AsyncStorage.setItem('backgroundNotifications', JSON.stringify(notifications));

            // Handle deep linking if app is in background/quit state
            if (notification.screen) {
                const deepLinkUrl = `allycatlocator://notification/${notification.screen}${notification.params ? '?' + new URLSearchParams(notification.params).toString() : ''}`;

                // If app is in background, we can navigate immediately
                if (navigationRef.isReady()) {
                    console.log('🧭 Navigating from background:', notification.screen);
                    navigationRef.navigate(notification.screen, notification.params);
                } else {
                    // If app is quit, store the deep link for when app opens
                    await AsyncStorage.setItem('pendingDeepLink', deepLinkUrl);
                    console.log('📱 Stored deep link for quit state:', deepLinkUrl);
                }
            }

        } catch (error) {
            console.error('❌ Error in background message handler:', error);
        }

        // Return a promise to indicate completion
        return Promise.resolve();
    });

    // ✅ Enhanced foreground message handler (optional - App.tsx handles this)
    messaging().onMessage(async remoteMessage => {
        console.log('📱 Global foreground message:', remoteMessage);
    });

    // ✅ Handle notification open when app is in background/foreground
    messaging().onNotificationOpenedApp(async remoteMessage => {
        console.log('🔔 Notification caused app to open from background state:', remoteMessage);

        try {
            const screen = remoteMessage.data?.screen;
            const params = remoteMessage.data?.params ? JSON.parse(remoteMessage.data.params) : undefined;

            if (screen && navigationRef.isReady()) {
                console.log('🧭 Navigating from background notification:', screen);
                navigationRef.navigate(screen, params);
            }
        } catch (error) {
            console.error('❌ Error handling notification opened app:', error);
        }
    });

    // ✅ Check if app was opened from notification when in quit state
    messaging().getInitialNotification().then(async remoteMessage => {
        if (remoteMessage) {
            console.log('🔔 Notification caused app to open from quit state:', remoteMessage);
        }
    });

} catch (firebaseError) {
    console.warn('⚠️ Firebase messaging setup warning (non-critical):', firebaseError?.message);
}

// Register the app component
// Handle notification when app is opened from quit state
const handleQuitStateNotification = async () => {
    try {
        // Check for pending deep link
        const pendingDeepLink = await AsyncStorage.getItem('pendingDeepLink');
        if (pendingDeepLink) {
            await AsyncStorage.removeItem('pendingDeepLink');
            console.log('🔗 Processing pending deep link:', pendingDeepLink);

            // Parse the deep link and navigate after a short delay to ensure navigation is ready
            setTimeout(() => {
                if (navigationRef.isReady()) {
                    try {
                        const url = new URL(pendingDeepLink.replace('allycatlocator://', 'http://temp.com'));
                        const screen = url.pathname.replace('/notification/', '');
                        const params = Object.fromEntries(url.searchParams);

                        console.log('🧭 Navigating from quit state:', screen, params);
                        navigationRef.navigate(screen, params);
                    } catch (err) {
                        console.warn('⚠️ Failed to parse pending deep link:', err);
                    }
                }
            }, 1000);
        }

        // Check for stored background notifications
        const storedNotifications = await AsyncStorage.getItem('backgroundNotifications');
        if (storedNotifications) {
            const notifications = JSON.parse(storedNotifications);
            if (notifications.length > 0) {
                console.log('📬 Found', notifications.length, 'background notifications');
                // Clear stored notifications
                await AsyncStorage.removeItem('backgroundNotifications');

                // Log them for now
                notifications.forEach((notification, index) => {
                    console.log(`📱 Background notification ${index + 1}:`, notification.title || notification.body || notification);
                });
            }
        }
    } catch (error) {
        console.error('❌ Error handling quit state notification:', error);
    }
};

AppRegistry.registerComponent(appName, () => {
    // Set up quit state handling when app starts
    setTimeout(handleQuitStateNotification, 500);
    return App;
});
