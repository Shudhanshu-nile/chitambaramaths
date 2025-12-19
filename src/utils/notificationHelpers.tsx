import { Platform, Alert, Linking, Vibration } from 'react-native';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

// Safe messaging reference
let messagingRef: ReturnType<typeof messaging> | null = null;

const getMessaging = () => {
    if (!messagingRef) {
        try {
            messagingRef = messaging();
        } catch (error) {
            console.warn('⚠️ Firebase messaging not initialized yet, will retry when needed');
            throw error;
        }
    }
    return messagingRef;
};
import { navigationRef } from '../navigation/GlobalNavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface NotificationPayload {
    title?: string;
    body?: string;
    data?: Record<string, string>;
    screen?: string;
    params?: Record<string, any>;
    priority?: 'high' | 'normal' | 'low';
    channelId?: string;
}

export interface LocalNotificationOptions {
    title: string;
    body: string;
    data?: Record<string, string>;
    screen?: string;
    params?: Record<string, any>;
    channelId?: string;
    sound?: string;
    vibrate?: boolean;
}

/**
 * Check if the app has notification permission
 */
export const checkNotificationPermission = async (): Promise<boolean> => {
    try {
        const messaging = getMessaging();
        const authStatus = await messaging.hasPermission();
        // Using numeric values as a workaround for the type issue
        // 1 = AUTHORIZED, 2 = PROVISIONAL
        return authStatus === 1 || authStatus === 2;
    } catch (error) {
        console.error('Error checking notification permission:', error);
        return false;
    }
};

/**
 * Request notification permission from user
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
    try {
        const authStatus = await getMessaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
            Alert.alert(
                'Permission Required',
                'Please enable notifications in settings to receive updates',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Open Settings', onPress: () => Linking.openSettings() }
                ]
            );
        }

        return enabled;
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
    }
};

/**
 * Initialize FCM token refresh listener and foreground handling
 */
export const initializeTokenRefresh = (): (() => void) => {
    console.log('🔄 Setting up FCM token refresh listener...');

    // Listen for token refresh events
    const unsubscribeTokenRefresh = getMessaging().onTokenRefresh(async (token) => {
        console.log('🔄 FCM Token refreshed:', token.substring(0, 20) + '...');
        await saveFCMToken(token);

        // Optionally sync with backend if user is logged in
        try {
            const authToken = await AsyncStorage.getItem('authToken');
            if (authToken) {
                // Here you could add API call to update token on backend
                console.log('📤 Token refreshed, would sync with backend if user is logged in');
            }
        } catch (error) {
            console.error('❌ Error syncing refreshed token with backend:', error);
        }
    });

    return unsubscribeTokenRefresh;
};

/**
 * Refresh FCM token when app comes to foreground
 */
export const refreshTokenOnForeground = async (): Promise<void> => {
    try {
        console.log('📱 App came to foreground, checking FCM token...');

        // Check if we need to refresh the token
        const tokenData = await AsyncStorage.getItem('fcmToken');
        if (tokenData) {
            const parsed = JSON.parse(tokenData);
            const tokenAge = Date.now() - parsed.timestamp;
            const refreshInterval = 30 * 60 * 1000; // 30 minutes

            if (tokenAge > refreshInterval) {
                console.log('⏰ Token is old, refreshing...');
                const newToken = await getFCMToken(); // Force refresh
                if (newToken) {
                    console.log('✅ Token refreshed successfully on foreground');
                }
            } else {
                console.log('✅ Token is still fresh, no refresh needed');
            }
        } else {
            console.log('🆕 No saved token found, getting new one...');
            await getFCMToken();
        }
    } catch (error) {
        console.error('❌ Error refreshing token on foreground:', error);
    }
};

/**
 * Force refresh FCM token (useful when switching between auth states)
 */
export const forceRefreshFCMToken = async (): Promise<string | null> => {
    try {
        console.log('🔄 Forcing FCM token refresh...');

        // Clear saved token first
        await AsyncStorage.removeItem('fcmToken');

        // Get fresh token
        const freshToken = await getFCMToken();

        if (freshToken) {
            console.log('✅ FCM token force refreshed successfully');
            return freshToken;
        } else {
            console.log('❌ Failed to force refresh FCM token');
            return null;
        }
    } catch (error) {
        console.error('❌ Error force refreshing FCM token:', error);
        return null;
    }
};

/**
 * Get FCM token with retry logic and proper error handling
 */
export const getFCMToken = async (): Promise<string | null> => {
    const maxAttempts = 3;
    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts < maxAttempts) {
        try {
            console.log(`🔍 Attempting to get FCM token (attempt ${attempts + 1}/${maxAttempts})...`);

            // Get messaging instance
            const messaging = getMessaging();

            // Check if notifications are enabled
            const authStatus = await messaging.hasPermission();
            const enabled = authStatus === 1 || authStatus === 2; // 1 = AUTHORIZED, 2 = PROVISIONAL

            if (!enabled) {
                console.log('🔔 Requesting notification permission...');
                const permission = await messaging.requestPermission();
                if (permission !== 1 && permission !== 2) {
                    console.log('⚠️ User did not grant notification permission, returning null');
                    return null;
                }
            }

            // On iOS we must register the device for remote messages before calling getToken
            if (Platform.OS === 'ios') {
                try {
                    if ((messaging as any).registerDeviceForRemoteMessages) {
                        await (messaging as any).registerDeviceForRemoteMessages();
                        console.log('✅ Registered device for remote messages (iOS)');
                    }

                    // Wait (with timeout) for APNS token
                    let apnsToken = await messaging.getAPNSToken();
                    if (!apnsToken) {
                        console.log('⏳ Waiting for APNS token...');
                        await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
                        apnsToken = await messaging.getAPNSToken();
                    }

                    if (!apnsToken) {
                        console.warn('⚠️ APNS token not available yet. This might cause getToken to fail.');
                        // We might want to continue and let it fail or retry, but warning is essential.
                    }

                } catch (regErr) {
                    console.error('❌ registerDeviceForRemoteMessages failed:', (regErr as any)?.message || regErr);
                    // If registration failed, getToken will likely fail too. 
                    // Throwing here to trigger the outer retry loop instead of proceeding to getToken
                    throw new Error('Failed to register for remote messages: ' + ((regErr as any)?.message || regErr));
                }
            }

            // Get the token
            const token = await getMessaging().getToken();

            if (!token) {
                console.log('⚠️ Failed to get FCM token: Token is null or undefined');
                throw new Error('FCM token is null'); // Throw to trigger retry
            }

            console.log('✅ FCM token obtained successfully');
            await saveFCMToken(token);
            return token;

        } catch (error: any) {
            lastError = error;
            attempts++;

            console.error(`❌ Error getting FCM token (attempt ${attempts}/${maxAttempts}):`, error);

            if (attempts >= maxAttempts) {
                // If we've exhausted all retries, log the final error
                console.error('❌ Max retries reached, giving up on FCM token');
                break;
            }

            // Wait before retrying (longer wait for iOS)
            const waitTime = Platform.OS === 'ios' ? 2000 : 1000;
            console.log(`⏳ Retrying in ${waitTime}ms...`);
            await new Promise<void>((resolve) => setTimeout(resolve, waitTime));
        }
    }

    // If we get here, all attempts failed
    const errorMessage = lastError?.message || 'Unknown error getting FCM token';

    // iOS-specific error analysis
    if (Platform.OS === 'ios' && lastError) {
        console.log('📱 iOS-specific error analysis:');

        if (lastError.message?.includes('No APNS token specified')) {
            console.log('🔧 APNS token issue detected. This usually means:');
            console.log('   1. Push notifications are not properly configured in Apple Developer portal');
            console.log('   2. APNS certificates are missing or invalid');
            console.log('   3. Provisioning profile doesn\'t include push notifications entitlement');
            console.log('   4. App capabilities in Xcode don\'t include Push Notifications');
        } else if (lastError.message?.includes('UNAVAILABLE')) {
            console.log('🔧 Firebase service is unavailable. This could be due to:');
            console.log('   1. Poor network connection');
            console.log('   2. Firebase services are down');
            console.log('   3. Firebase configuration is incorrect');
        } else {
            console.log('🔧 Unknown error:', lastError.message);
        }
    }

    // If we get here, all attempts failed
    console.log(`❌ Failed to get FCM token after ${maxAttempts} attempts`);
    return null;
};

/**
 * Check notification availability and provide diagnostic information
 */
export const checkNotificationAvailability = async (): Promise<{
    available: boolean;
    permission: boolean;
    token: string | null;
    issues: string[];
}> => {
    console.log('🔍 Checking notification availability...');

    const issues: string[] = [];
    let permission = false;
    let token: string | null = null;

    try {
        // Check permission
        console.log('📱 Checking notification permission...');
        permission = await checkNotificationPermission();
        console.log('📱 Permission status:', permission ? 'GRANTED' : 'DENIED');

        if (!permission) {
            issues.push('Notification permission not granted');
        }

        // Check FCM token
        console.log('🔑 Checking FCM token...');
        token = await getFCMToken();
        console.log('🔑 Token status:', token ? 'AVAILABLE' : 'NOT AVAILABLE');

        if (!token) {
            issues.push('FCM token not available');
        }

        // Platform-specific checks
        if (Platform.OS === 'ios') {
            console.log('📱 iOS-specific checks...');

            // Check if Firebase is configured
            try {
                // Check if messaging is supported and configured
                const isSupported = await getMessaging().isSupported();
                console.log('📱 Firebase messaging supported:', isSupported);

                if (!isSupported) {
                    issues.push('Firebase messaging not supported');
                }
            } catch (error) {
                console.log('📱 Firebase configuration check failed:', error);
                issues.push('Firebase configuration issue');
            }

            // Check APNS registration
            try {
                const apnsToken = await getMessaging().getAPNSToken();
                console.log('📱 APNS token status:', apnsToken ? 'AVAILABLE' : 'NOT AVAILABLE');

                if (!apnsToken) {
                    issues.push('APNS token not available - check certificates and provisioning profile');
                }
            } catch (error) {
                console.log('📱 APNS token check failed:', error);
                issues.push('APNS configuration issue');
            }
        } else {
            console.log('🤖 Android-specific checks...');

            // Check if Google Play Services are available
            try {
                const playServicesAvailable = await getMessaging().isSupported();
                console.log('🤖 Google Play Services available:', playServicesAvailable);

                if (!playServicesAvailable) {
                    issues.push('Google Play Services not available');
                }
            } catch (error) {
                console.log('🤖 Google Play Services check failed:', error);
                issues.push('Google Play Services issue');
            }
        }

        const available = permission && token !== null;

        console.log('✅ Notification availability check completed:');
        console.log('   - Available:', available);
        console.log('   - Permission:', permission);
        console.log('   - Token:', token ? 'YES' : 'NO');
        console.log('   - Issues found:', issues.length);

        if (issues.length > 0) {
            console.log('🔧 Issues identified:');
            issues.forEach((issue, index) => {
                console.log(`   ${index + 1}. ${issue}`);
            });
        }

        return {
            available,
            permission,
            token,
            issues
        };

    } catch (error) {
        console.error('❌ Error checking notification availability:', error);
        issues.push('Error checking notification availability');

        return {
            available: false,
            permission,
            token,
            issues
        };
    }
};

/**
 * Save FCM token to AsyncStorage
 */
export const saveFCMToken = async (token: string): Promise<void> => {
    try {
        const tokenData = {
            token,
            timestamp: Date.now()
        };
        await AsyncStorage.setItem('fcmToken', JSON.stringify(tokenData));
        console.log('FCM token saved successfully');
    } catch (error) {
        console.error('Error saving FCM token:', error);
    }
};

/**
 * Get saved FCM token from AsyncStorage
 */
export const getSavedFCMToken = async (): Promise<string | null> => {
    try {
        const tokenData = await AsyncStorage.getItem('fcmToken');
        if (tokenData) {
            const parsed = JSON.parse(tokenData);
            return parsed.token;
        }
        return null;
    } catch (error) {
        console.error('Error getting saved FCM token:', error);
        return null;
    }
};

/**
 * Delete saved FCM token
 */
export const deleteFCMToken = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem('fcmToken');
        console.log('FCM token deleted successfully');
    } catch (error) {
        console.error('Error deleting FCM token:', error);
    }
};

/**
 * Subscribe to a topic
 */
export const subscribeToTopic = async (topic: string): Promise<void> => {
    try {
        await getMessaging().subscribeToTopic(topic);
        console.log(`Subscribed to topic: ${topic}`);
    } catch (error) {
        console.error(`Error subscribing to topic ${topic}:`, error);
    }
};

/**
 * Unsubscribe from a topic
 */
export const unsubscribeFromTopic = async (topic: string): Promise<void> => {
    try {
        await getMessaging().unsubscribeFromTopic(topic);
        console.log(`Unsubscribed from topic: ${topic}`);
    } catch (error) {
        console.error(`Error unsubscribing from topic ${topic}:`, error);
    }
};

/**
 * Parse notification data from FCM message
 */
export const parseNotificationData = (remoteMessage: FirebaseMessagingTypes.RemoteMessage): NotificationPayload => {
    return {
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        data: remoteMessage.data as Record<string, string>,
        screen: remoteMessage.data?.screen as string || 'BottomTabNavigation', // Default to BottomTabNavigation if no screen specified
        params: remoteMessage.data?.params ? (JSON.parse(remoteMessage.data.params as string) as Record<string, any>) : undefined,
        priority: remoteMessage.data?.priority as 'high' | 'normal' | 'low' || 'normal',
        channelId: (remoteMessage.data?.channelId as string) || 'default'
    };
};

/**
 * Handle notification tap and navigate to appropriate screen
 */
export const handleNotificationTap = async (notification: NotificationPayload): Promise<void> => {
    try {
        if (notification.screen && navigationRef.isReady()) {
            console.log('Navigating to screen:', notification.screen, 'with params:', notification.params);
            (navigationRef as any).navigate(notification.screen, notification.params);
        }
    } catch (error) {
        console.error('Error handling notification tap:', error);
    }
};

/**
 * Show local notification (for testing or local triggers)
 */
export const showLocalNotification = async (options: LocalNotificationOptions): Promise<void> => {
    try {
        // This is a simplified version - in production, you might want to use
        // a local notification library like react-native-push-notification
        console.log('Showing local notification:', options);

        Alert.alert(
            options.title,
            options.body,
            [
                {
                    text: 'OK',
                    onPress: () => handleNotificationTap({
                        screen: options.screen,
                        params: options.params,
                        data: options.data
                    })
                }
            ]
        );

        // Vibrate if enabled
        if (options.vibrate !== false) {
            Vibration.vibrate(200);
        }
    } catch (error) {
        console.error('Error showing local notification:', error);
    }
};

/**
 * Get notification channels (Android only)
 */
export const getNotificationChannels = async (): Promise<any[]> => {
    try {
        if (Platform.OS === 'android') {
            // Note: getNotificationChannels might not be available in all versions
            console.log('Getting notification channels (placeholder)');
            return [];
        }
        return [];
    } catch (error) {
        console.error('Error getting notification channels:', error);
        return [];
    }
};

/**
 * Create notification channel (Android only)
 */
export const createNotificationChannel = async (channel: any): Promise<void> => {
    try {
        if (Platform.OS === 'android') {
            // Note: createNotificationChannel might not be available in all versions
            console.log('Creating notification channel (placeholder):', channel.id);
        }
    } catch (error) {
        console.error('Error creating notification channel:', error);
    }
};

/**
 * Delete notification channel (Android only)
 */
export const deleteNotificationChannel = async (channelId: string): Promise<void> => {
    try {
        if (Platform.OS === 'android') {
            // Note: deleteNotificationChannel might not be available in all versions
            console.log('Deleting notification channel (placeholder):', channelId);
        }
    } catch (error) {
        console.error('Error deleting notification channel:', error);
    }
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = async (): Promise<void> => {
    try {
        if (Platform.OS === 'android') {
            await getMessaging().deleteToken();
            console.log('All notifications cleared');
        }
    } catch (error) {
        console.error('Error clearing notifications:', error);
    }
};

/**
 * Get app notification settings
 */
export const getNotificationSettings = async (): Promise<{
    enabled: boolean;
    sound: boolean;
    badge: boolean;
    alert: boolean;
}> => {
    try {
        const authStatus = await getMessaging().hasPermission();
        const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED;

        return {
            enabled,
            sound: enabled, // Simplified - in real app, check specific settings
            badge: enabled,
            alert: enabled
        };
    } catch (error) {
        console.error('Error getting notification settings:', error);
        return {
            enabled: false,
            sound: false,
            badge: false,
            alert: false
        };
    }
};

/**
 * Test notification function
 */
// export const sendTestNotification = async (): Promise<void> => {
//   try {
//     const token = await getFCMToken();
//     if (token) {
//       console.log('FCM Token for testing:', token);
//       Alert.alert('Test Notification', `FCM Token: ${token}`);
//     } else {
//       Alert.alert('Error', 'No FCM token available');
//     }
//   } catch (error) {
//     console.error('Error sending test notification:', error);
//     Alert.alert('Error', 'Failed to get FCM token');
//   }
// };

/**
 * Test notification navigation with proper screen names
 */
export const testNotificationNavigation = async (screen?: string, params?: Record<string, any>): Promise<void> => {
    const testNotification: FirebaseMessagingTypes.RemoteMessage = {
        data: {
            screen: screen || 'BottomTabNavigation',
            ...(params && { params: JSON.stringify(params) }),
        },
        notification: {
            title: 'Test Notification',
            body: 'This is a test notification',
        },
        from: 'test',
        messageId: 'test-message-id',
        sentTime: Date.now(),
        ttl: 2419200,
        fcmOptions: {},
        collapseKey: 'test',
    };

    console.log('🧪 Testing notification navigation:', testNotification);

    const parsed = parseNotificationData(testNotification);
    console.log('📋 Parsed notification data:', parsed);

    try {
        await handleNotificationTap(parsed);
        console.log('✅ Test notification navigation successful');
    } catch (error) {
        console.error('❌ Test notification navigation failed:', error);
    }
};

/**
 * Validate notification data
 */
export const validateNotificationData = (data: any): data is NotificationPayload => {
    return (
        typeof data === 'object' &&
        data !== null &&
        (!data.title || typeof data.title === 'string') &&
        (!data.body || typeof data.body === 'string') &&
        (!data.screen || typeof data.screen === 'string') &&
        (!data.params || typeof data.params === 'object')
    );
};

/**
 * Log notification for debugging
 */
export const logNotification = (source: string, notification: NotificationPayload): void => {
    console.log(`🔔 [${source}] Notification:`, {
        title: notification.title,
        body: notification.body,
        screen: notification.screen,
        params: notification.params,
        data: notification.data,
        priority: notification.priority,
        channelId: notification.channelId
    });
};
