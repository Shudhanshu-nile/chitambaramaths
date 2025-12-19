import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid, Alert, Linking, AppState } from 'react-native';
// Allow dynamic require for optional native notification library (@notifee/react-native)
/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment */
declare const require: any;
import { navigationRef } from '../navigation/GlobalNavigation';
import { NotificationPayload } from '../utils/notificationHelpers';
// Get messaging instance
const getMessaging = () => {
    try {
        return messaging();
    } catch (error) {
        console.warn('⚠️ Firebase messaging not initialized yet, will retry when needed');
        throw error;
    }
};

// Types
export interface FCMTokenData {
    token: string;
    timestamp: number;
}

class NotificationService {
    private static instance: NotificationService;
    private unsubscribeForeground: (() => void) | null = null;
    private unsubscribeTokenRefresh: (() => void) | null = null;
    private unsubscribeAppState: any = null;
    private foregroundNotificationCallbacks: ((notification: NotificationPayload) => void)[] = [];

    private constructor() { }

    static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    // Initialize the notification service
    async initialize(): Promise<void> {
        try {
            console.log('🔔 Initializing NotificationService...');

            // Add platform-specific checks
            if (Platform.OS === 'ios') {
                console.log('🍎 iOS FCM configuration check:');
                console.log('   1. Verify GoogleService-Info.plist is properly configured');
                console.log('   2. Check Firebase project settings for iOS app');
                console.log('   3. Ensure APNs certificate/key is configured in Firebase Console');
                console.log('   4. Confirm bundle identifier matches Apple Developer account');

                // Request notification permission for iOS
                await this.requestPermission();
            } else if (Platform.OS === 'android') {
                console.log('🤖 Android FCM configuration check:');
                console.log('   1. Verify google-services.json is properly configured');
                console.log('   2. Check Firebase project settings for Android app');
                console.log('   3. Ensure SHA-1 certificate fingerprint is registered');
                console.log('   4. Confirm notification channels are created in Firebase Console');

                // Request notification permission for Android
                await this.requestPermission();
            }

            // Wait for Firebase to be ready
            console.log('⏳ Waiting for Firebase to initialize...');
            let attempts = 0;
            const maxAttempts = 5;

            while (attempts < maxAttempts) {
                try {
                    // Try to get the default app
                    const defaultApp = await import('@react-native-firebase/app').then(m => m.default.app());
                    if (defaultApp) {
                        console.log('✅ Firebase initialized successfully');
                        break;
                    }
                } catch (error) {
                    console.log(`⚠️ Firebase not ready yet (attempt ${attempts + 1}/${maxAttempts})`);
                    // Wait before retrying
                    await new Promise<void>(resolve => setTimeout(() => resolve(), 2000));
                    attempts++;

                    if (attempts >= maxAttempts) {
                        console.error('❌ Failed to initialize Firebase after multiple attempts');
                        throw new Error('Firebase initialization timeout');
                    }
                }
            }
            console.log('🔍 Checking Firebase initialization...');

            // Request permission with detailed logging
            console.log('🔔 Starting permission request process...');
            const permissionResult = await this.requestPermission();
            console.log('📱 Permission request result:', permissionResult);

            if (!permissionResult) {
                console.log('⚠️ Permission denied, but continuing initialization...');
            }

            // Get and save FCM token
            console.log('🔑 Getting FCM token...');
            const token = await this.getAndSaveFCMToken();
            console.log('📱 FCM token result:', token ? 'Token received' : 'No token');

            // Set up listeners
            console.log('🎧 Setting up notification listeners...');
            this.setupListeners();

            // Create notification channels (Android only)
            if (Platform.OS === 'android') {
                console.log('📱 Creating Android notification channels...');
                await this.createNotificationChannels();
            }

            console.log('✅ NotificationService initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize NotificationService:', error);
            console.error('❌ Error details:', JSON.stringify(error, null, 2));
        }
    }

    // Request notification permission
    private async requestPermission(): Promise<boolean> {
        try {
            console.log('🔔 Starting permission request...');

            // Check current permission status first
            const currentStatus = await getMessaging().hasPermission();
            console.log('📱 Current permission status before request:', currentStatus);

            // If already authorized, return true
            if (currentStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                currentStatus === messaging.AuthorizationStatus.PROVISIONAL) {
                console.log('✅ Permission already granted');
                return true;
            }

            // For Android 13+ (API level 33), we need to request POST_NOTIFICATIONS permission
            if (Platform.OS === 'android' && Platform.Version >= 33) {
                console.log('📱 Android 13+ detected, requesting POST_NOTIFICATIONS permission...');

                try {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
                        {
                            title: 'Notification Permission',
                            message: 'This app needs notification permission to send you updates about your cat sightings.',
                            buttonNeutral: 'Ask Me Later',
                            buttonNegative: 'Cancel',
                            buttonPositive: 'OK',
                        }
                    );

                    console.log('📱 POST_NOTIFICATIONS permission result:', granted);

                    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                        console.log('✅ POST_NOTIFICATIONS permission granted');
                        return true;
                    } else if (granted === PermissionsAndroid.RESULTS.DENIED) {
                        console.log('❌ POST_NOTIFICATIONS permission denied');
                        return false;
                    } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
                        console.log('❌ POST_NOTIFICATIONS permission never ask again');
                        return false;
                    }
                } catch (error) {
                    console.error('❌ Error requesting POST_NOTIFICATIONS permission:', error);
                }
            }

            // For iOS and Android < 13, use Firebase messaging permission request
            console.log('🔔 Requesting permission from user via Firebase...');
            const authStatus = await getMessaging().requestPermission();
            console.log('📱 Firebase permission request result:', authStatus);

            const enabled =
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL;

            console.log('📱 Permission enabled:', enabled);

            if (enabled) {
                console.log('✅ Notification permission granted via Firebase');
                return true;
            } else {
                console.log('❌ Notification permission denied via Firebase');
                return false;
            }
        } catch (error) {
            console.error('❌ Error requesting permission:', error);
            console.error('❌ Permission error details:', JSON.stringify(error, null, 2));
            return false;
        }
    }

    // Get FCM token and save it
    private async getAndSaveFCMToken(): Promise<string | null> {
        try {
            // Add platform-specific check
            if (Platform.OS === 'ios') {
                try {
                    // First check if we have notification permissions
                    const authStatus = await getMessaging().hasPermission();
                    let enabled =
                        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

                    if (!enabled) {
                        console.log('⚠️ Notifications not enabled on iOS, requesting permission...');
                        const permission = await getMessaging().requestPermission();
                        enabled =
                            permission === messaging.AuthorizationStatus.AUTHORIZED ||
                            permission === messaging.AuthorizationStatus.PROVISIONAL;
                    }

                    if (!enabled) {
                        console.log('⚠️ Notifications not authorized, FCM token will not be available');
                        return null;
                    }

                    // On iOS, wait a bit longer for APNS token to be registered
                    console.log('⏳ Waiting for APNS token registration on iOS...');
                    // Ensure device is registered for remote messages before requesting token
                    try {
                        if (Platform.OS === 'ios' && (messaging as any).registerDeviceForRemoteMessages) {
                            await (messaging as any).registerDeviceForRemoteMessages();
                            console.log('✅ Registered device for remote messages (iOS)');
                        }
                    } catch (regErr) {
                        console.warn('⚠️ registerDeviceForRemoteMessages failed or not required:', (regErr as any)?.message || regErr);
                    }

                    await new Promise(resolve => setTimeout(resolve as any, 5000));
                } catch (permissionError) {
                    console.warn('⚠️ Error checking notification permissions:', permissionError);
                    return null;
                }
            }

            // Now try to get the token with retry logic for iOS
            let attempts = 0;
            const maxAttempts = Platform.OS === 'ios' ? 3 : 1;

            while (attempts < maxAttempts) {
                try {
                    const token = await getMessaging().getToken();
                    if (token) {
                        console.log('📱 FCM Token:', token);
                        await this.saveFCMToken(token);
                        await this.syncTokenWithBackend(token);
                        return token;
                    }
                } catch (tokenError) {
                    console.log(`🔄 FCM token attempt ${attempts + 1}/${maxAttempts} failed:`, tokenError);
                    attempts++;

                    if (attempts < maxAttempts) {
                        console.log('⏳ Waiting before retry...');
                        await new Promise(resolve => setTimeout(resolve as any, 2000));
                    }
                }
            }

            return null;
        } catch (error) {
            console.error('❌ Error getting FCM token:', error);

            // Narrow error to object before property access to satisfy TypeScript
            if (Platform.OS === 'ios' && typeof error === 'object' && error !== null) {
                // Use type assertion to access possible properties safely
                const e: any = error;
                if (e.code === 'messaging/unknown' && typeof e.message === 'string' && e.message.includes('No APNS token')) {
                    console.warn('⚠️ APNS token not available. Make sure push notifications are properly configured in Xcode and APNs certificate is set up in your Apple Developer account.');
                }
            }

            return null;
        }
    }

    // Save FCM token to AsyncStorage
    private async saveFCMToken(token: string): Promise<void> {
        try {
            const tokenData: FCMTokenData = {
                token,
                timestamp: Date.now()
            };
            await AsyncStorage.setItem('fcmToken', JSON.stringify(tokenData));
            console.log('💾 FCM token saved to storage');
        } catch (error) {
            console.error('❌ Error saving FCM token:', error);
        }
    }

    // Get saved FCM token
    async getSavedFCMToken(): Promise<string | null> {
        try {
            const tokenData = await AsyncStorage.getItem('fcmToken');
            if (tokenData) {
                const parsed: FCMTokenData = JSON.parse(tokenData);
                return parsed.token;
            }
            return null;
        } catch (error) {
            console.error('❌ Error getting saved FCM token:', error);
            return null;
        }
    }

    // Sync FCM token with backend
    private async syncTokenWithBackend(_token: string): Promise<void> {
        try {
            const authToken = await AsyncStorage.getItem('authToken');
            const userId = await AsyncStorage.getItem('userId');

            if (authToken && userId) {
                console.log('🔄 Syncing FCM token with backend...');
                // Here you would make an API call to update the user's FCM token
                // For now, we'll just log it
                console.log('📤 Token sync ready for user:', userId);
            }
        } catch (error) {
            console.error('❌ Error syncing FCM token with backend:', error);
        }
    }

    // Set up all notification listeners
    private setupListeners(): void {
        // Add native iOS notification listener
        this.addNativeNotificationListener();

        // Foreground message listener
        this.unsubscribeForeground = getMessaging().onMessage(async (remoteMessage) => {
            console.log('📨 Foreground message received:', remoteMessage);
            try {
                await this.handleForegroundMessage(remoteMessage);
            } catch (error) {
                console.error('❌ Error in foreground message handler:', error);
            }
        });

        // Token refresh listener
        this.unsubscribeTokenRefresh = getMessaging().onTokenRefresh(async (token) => {
            console.log('🔄 FCM token refreshed:', token);
            await this.saveFCMToken(token);
            await this.syncTokenWithBackend(token);
        });

        // App state listener for background/foreground transitions
        this.unsubscribeAppState = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
                console.log('📱 App came to foreground');
                this.handleAppForeground();
            } else if (nextAppState === 'background') {
                console.log('📱 App went to background');
                this.handleAppBackground();
            }
        });

        // Handle notification opened app
        getMessaging().onNotificationOpenedApp(async (remoteMessage) => {
            console.log('🔔 Notification caused app to open from background state:', remoteMessage);
            await this.handleNotificationOpen(remoteMessage);
        });

        // Check if app was opened from notification when in quit state
        getMessaging().getInitialNotification().then(async (remoteMessage) => {
            if (remoteMessage) {
                console.log('🔔 Notification caused app to open from quit state:', remoteMessage);
                await this.handleNotificationOpen(remoteMessage);
            }
        });
    }

    // Add listener for foreground notifications (for UI components)
    onForegroundNotification(callback: (notification: NotificationPayload) => void): () => void {
        console.log('📝 Adding foreground notification callback');
        this.foregroundNotificationCallbacks.push(callback);
        console.log('📝 Total callbacks registered:', this.foregroundNotificationCallbacks.length);

        // Return unsubscribe function
        return () => {
            const index = this.foregroundNotificationCallbacks.indexOf(callback);
            if (index > -1) {
                this.foregroundNotificationCallbacks.splice(index, 1);
                console.log('📝 Removed foreground notification callback, remaining:', this.foregroundNotificationCallbacks.length);
            }
        };
    }

    // Handle foreground messages
    private async handleForegroundMessage(remoteMessage: FirebaseMessagingTypes.RemoteMessage): Promise<void> {
        try {
            console.log('📨 Foreground message received:', {
                title: remoteMessage.notification?.title,
                body: remoteMessage.notification?.body,
                data: remoteMessage.data,
                platform: Platform.OS,
                messageId: remoteMessage.messageId,
                from: remoteMessage.from,
                collapseKey: remoteMessage.collapseKey,
                messageType: remoteMessage.messageType,
                sentTime: remoteMessage.sentTime,
                ttl: remoteMessage.ttl
            });

            // Validate FCM message structure for Android compatibility
            if (!this.validateFCMMessage(remoteMessage)) {
                console.error('❌ Invalid FCM message structure for Android');
                return;
            }

            const notification: NotificationPayload = {
                title: remoteMessage.notification?.title,
                body: remoteMessage.notification?.body,
                data: remoteMessage.data as Record<string, string>,
                screen: remoteMessage.data?.screen as string,
                params: remoteMessage.data?.params ? (JSON.parse(remoteMessage.data.params as string) as Record<string, any>) : undefined
            };

            // Enhanced Android-specific handling
            if (Platform.OS === 'android') {
                console.log('🤖 Android: Processing foreground notification');
                this.handleAndroidForegroundNotification(notification, remoteMessage);
            } else {
                // iOS: Call callbacks for custom popup
                console.log('🍎 iOS: Calling foreground notification callbacks');
                this.callForegroundCallbacks(notification);
            }
        } catch (error) {
            console.error('❌ Error handling foreground message:', error);
        }
    }

    // Validate FCM message structure for Android compatibility
    private validateFCMMessage(remoteMessage: FirebaseMessagingTypes.RemoteMessage): boolean {
        console.log('🔍 Validating FCM message structure...');

        // Check if we have notification data
        if (!remoteMessage.notification && !remoteMessage.data) {
            console.error('❌ FCM message missing both notification and data fields');
            return false;
        }

        // For Android, we need either notification.title or data with proper structure
        if (Platform.OS === 'android') {
            if (remoteMessage.notification?.title) {
                console.log('✅ FCM message has notification title');
                return true;
            }

            if (remoteMessage.data && (remoteMessage.data.title || remoteMessage.data.message)) {
                console.log('✅ FCM message has data with title/message');
                return true;
            }

            console.error('❌ Android FCM message missing title in notification or data');
            return false;
        }

        return true;
    }

    // Handle Android-specific foreground notifications
    private handleAndroidForegroundNotification(notification: NotificationPayload, remoteMessage: FirebaseMessagingTypes.RemoteMessage): void {
        console.log('🤖 Android: Handling foreground notification with enhanced logic');

        // For Android, we want to show both the system notification AND our custom popup
        // The system notification will be handled by FCM automatically for background
        // But for foreground, we need to handle the custom popup ourselves

        // Call all callbacks if they exist (for custom popup)
        console.log('📝 Calling', this.foregroundNotificationCallbacks.length, 'foreground notification callbacks');
        this.foregroundNotificationCallbacks.forEach(callback => {
            try {
                callback(notification);
            } catch (error) {
                console.error('❌ Error in foreground notification callback:', error);
            }
        });

        // Log Android-specific notification details
        console.log('🤖 Android notification details:', {
            channelId: (remoteMessage as any).android?.channelId,
            clickAction: (remoteMessage as any).android?.clickAction,
            color: (remoteMessage as any).android?.color,
            count: (remoteMessage as any).android?.count,
            imageUrl: (remoteMessage as any).android?.imageUrl,
            link: (remoteMessage as any).android?.link,
            priority: (remoteMessage as any).android?.priority,
            smallIcon: (remoteMessage as any).android?.smallIcon,
            sound: (remoteMessage as any).android?.sound,
            tag: (remoteMessage as any).android?.tag,
            ticker: (remoteMessage as any).android?.ticker,
            visibility: (remoteMessage as any).android?.visibility
        });

        // Try to show a native Android notification using notifee if available.
        // This is dynamic so the project won't break if notifee isn't installed.
        try {
            // eslint-disable-next-line global-require
            const notifee = require('@notifee/react-native');

            if (notifee) {
                (async () => {
                    try {
                        // Ensure a channel exists
                        const channelId = await notifee.createChannel({
                            id: 'default',
                            name: 'Default',
                            importance: notifee.AndroidImportance.HIGH,
                        });

                        await notifee.displayNotification({
                            title: notification.title || undefined,
                            body: notification.body || undefined,
                            android: {
                                channelId,
                                smallIcon: 'ic_launcher',
                                largeIcon: 'ic_launcher', // Large icon for notification card
                                pressAction: {
                                    id: 'default',
                                },
                                color: (remoteMessage as any).android?.color || '#F06543',
                                importance: notifee.AndroidImportance.HIGH,
                            },
                            data: notification.data as any,
                        });

                        console.log('✅ Displayed native Android notification via notifee');
                        return;
                    } catch (nfError) {
                        console.warn('⚠️ notifee display failed, falling back to toast/popup', nfError);
                    }
                })();
            }
        } catch (nfRequireError) {
            // notifee not installed or require failed — fall back to toast/popup below
            console.log('ℹ️ @notifee/react-native not available, using in-app popup/toast fallback');
        }

        // If notifee is not available or failed, call registered foreground callbacks (custom popups)
        try {
            this.foregroundNotificationCallbacks.forEach(callback => {
                try {
                    callback(notification);
                } catch (cbErr) {
                    console.error('❌ Error in foreground callback fallback:', cbErr);
                }
            });
        } catch (fallbackErr) {
            console.error('❌ Error while performing fallback notification callbacks:', fallbackErr);
        }
    }

    // iOS-specific foreground notification handling
    private callForegroundCallbacks(notification: NotificationPayload): void {
        console.log('📝 Calling', this.foregroundNotificationCallbacks.length, 'foreground notification callbacks');
        this.foregroundNotificationCallbacks.forEach(callback => {
            try {
                callback(notification);
            } catch (error) {
                console.error('❌ Error in foreground notification callback:', error);
            }
        });
    }

    // Handle notification open (when user taps notification)
    private async handleNotificationOpen(remoteMessage: FirebaseMessagingTypes.RemoteMessage): Promise<void> {
        try {
            console.log('🔔 handleNotificationOpen called with:', JSON.stringify(remoteMessage, null, 2));

            const screen = remoteMessage.data?.screen || 'BottomTabNavigation'; // Default to BottomTabNavigation if no screen specified
            const paramsData = remoteMessage.data?.params;
            let params: Record<string, any> | undefined;

            if (paramsData) {
                try {
                    params = JSON.parse(paramsData as string);
                    console.log('📦 Parsed params:', params);
                } catch (parseError) {
                    console.error('❌ Error parsing params:', parseError);
                    params = undefined;
                }
            }

            console.log('🎯 Navigation target - Screen:', screen, 'Params:', params);
            if (!remoteMessage.data?.screen) {
                console.log('ℹ️ No screen specified in notification data, defaulting to BottomTabNavigation (Home)');
            }
            console.log('🧭 NavigationRef.isReady():', navigationRef.isReady());

            if (screen && navigationRef.isReady()) {
                console.log('🧭 Attempting navigation to:', screen);

                // Add a small delay to ensure navigation is fully ready
                setTimeout(() => {
                    try {
                        // If we want to navigate to a specific tab within BottomTabNavigation
                        if (screen === 'BottomTabNavigation' && params?.tab) {
                            (navigationRef as any).navigate('BottomTabNavigation', { screen: params.tab });
                        } else {
                            (navigationRef as any).navigate(screen, params);
                        }
                        console.log('✅ Navigation successful');
                    } catch (navError) {
                        console.error('❌ Navigation error:', navError);
                    }
                }, 100);
            } else {
                if (!navigationRef.isReady()) {
                    console.error('❌ NavigationRef is not ready');
                    // Wait for navigation to be ready and try again
                    const checkInterval = setInterval(() => {
                        if (navigationRef.isReady()) {
                            clearInterval(checkInterval);
                            console.log('🧭 NavigationRef is now ready, attempting navigation');
                            try {
                                // If we want to navigate to a specific tab within BottomTabNavigation
                                if (screen === 'BottomTabNavigation' && params?.tab) {
                                    (navigationRef as any).navigate('BottomTabNavigation', { screen: params.tab });
                                } else {
                                    (navigationRef as any).navigate(screen, params);
                                }
                                console.log('✅ Navigation successful after waiting');
                            } catch (navError) {
                                console.error('❌ Navigation error after waiting:', navError);
                            }
                        }
                    }, 100);

                    // Timeout after 5 seconds
                    setTimeout(() => {
                        clearInterval(checkInterval);
                        console.error('❌ Navigation timeout - NavigationRef never became ready');
                    }, 5000);
                }
            }
        } catch (error) {
            console.error('❌ Error handling notification open:', error);
        }
    }

    // Show custom notification popup (for foreground)
    private showNotificationPopup(notification: NotificationPayload): void {
        // This will be handled by the NotificationPopup component in App.tsx
        // The onForegroundNotification callback will handle the display
        console.log('🔔 Notification ready for popup display:', notification);

        // The actual popup display is handled by the App.tsx component
        // through the onForegroundNotification callback
    }

    // Handle notification tap
    private handleNotificationTap(notification: NotificationPayload): void {
        if (notification.screen && navigationRef.isReady()) {
            navigationRef.navigate(notification.screen, notification.params);
        }
    }

    // Add native event listener for iOS notification taps
    private addNativeNotificationListener(): void {
        if (Platform.OS === 'ios') {
            const { DeviceEventEmitter } = require('react-native');

            DeviceEventEmitter.addListener('notificationTapped', (userInfo: any) => {
                console.log('🔔 iOS notification tap received via native event:', userInfo);

                // Convert iOS notification format to Firebase RemoteMessage format
                const remoteMessage = {
                    data: userInfo,
                    notification: {
                        title: userInfo?.aps?.alert?.title || '',
                        body: userInfo?.aps?.alert?.body || '',
                    },
                    from: 'ios',
                };

                this.handleNotificationOpen(remoteMessage as any);
            });
        } else if (Platform.OS === 'android') {
            // Handle Android notification taps from intent
            this.checkAndroidNotificationIntent();
        }
    }

    // Check for Android notification intent on app start
    private checkAndroidNotificationIntent(): void {
        try {
            const { NativeModules, Platform } = require('react-native');

            // Check if app was opened from notification tap
            if (NativeModules?.IntentModule) {
                NativeModules.IntentModule.getInitialIntent().then((intent: any) => {
                    if (intent?.notificationTapped) {
                        console.log('🔔 Android notification tap detected:', intent);

                        // Convert Android intent to Firebase RemoteMessage format
                        const remoteMessage = {
                            data: intent,
                            notification: {
                                title: intent?.title || '',
                                body: intent?.body || '',
                            },
                            from: 'android',
                        };

                        this.handleNotificationOpen(remoteMessage as any);
                    }
                }).catch((error: any) => {
                    console.log('ℹ️ No Android intent module available, using fallback');
                });
            }
        } catch (error) {
            console.log('ℹ️ Android intent checking not available, using Firebase listeners only');
        }
    }

    // Handle app foreground
    private handleAppForeground(): void {
        // Clear any pending notifications or update UI
        console.log('📱 App foregrounded');
    }

    // Handle app background
    private handleAppBackground(): void {
        // Save any necessary state
        console.log('📱 App backgrounded');
    }

    // Create Android notification channels
    private async createNotificationChannels(): Promise<void> {
        try {
            if (Platform.OS === 'android') {
                console.log('📱 Android notification channels - checking Firebase messaging version compatibility');

                // Note: Notification channels are typically created in the Android native code
                // or through Firebase console. The runtime creation API varies by Firebase version.
                // For now, we'll log that channels should be created through the proper channels.

                console.log('ℹ️ Android notification channels should be configured in:');
                console.log('   1. Firebase Console (recommended)');
                console.log('   2. Android native code in MainApplication.java');
                console.log('   3. app/build.gradle with firebase-messaging dependency');

                // This is a placeholder for future implementation when proper API is available
                console.log('📱 Android notification channels setup (placeholder - implement via Firebase Console)');
            }
        } catch (error) {
            console.error('❌ Error checking notification channels:', error);
        }
    }

    // Clean up FCM token (on logout)
    async cleanupFCMToken(): Promise<void> {
        try {
            await AsyncStorage.removeItem('fcmToken');
            console.log('🧹 FCM token cleaned up');
        } catch (error) {
            console.error('❌ Error cleaning up FCM token:', error);
        }
    }

    // Get notification permission status
    async getPermissionStatus(): Promise<boolean> {
        try {
            const authStatus = await messaging().hasPermission();
            return (
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL
            );
        } catch (error) {
            console.error('❌ Error getting permission status:', error);
            return false;
        }
    }

    // Test Android foreground notification for debugging
    public async testAndroidForegroundNotification(): Promise<void> {
        try {
            console.log('🧪 Testing Android foreground notification...');

            // Create a test notification payload that matches Android FCM structure
            const testNotification = {
                title: 'Test Android Notification',
                body: 'This is a test notification for Android foreground display',
                data: {
                    screen: 'NotificationsScreen',
                    params: JSON.stringify({ testId: 'android-foreground-test' }),
                    sender_name: 'Android Test User',
                    sender_image: 'https://via.placeholder.com/40x40/007AFF/FFFFFF?text=AT'
                }
            };

            console.log('📱 Test Android notification payload:', testNotification);

            // Create a mock FCM message for Android
            const mockRemoteMessage = {
                messageId: 'test-android-' + Date.now(),
                from: 'test-fcm-sender',
                data: testNotification.data,
                notification: {
                    title: testNotification.title,
                    body: testNotification.body,
                    icon: 'ic_notification',
                    color: '#F06543',
                    sound: 'default',
                    tag: 'test-android-notification'
                },
                android: {
                    channelId: 'default',
                    priority: 'high',
                    smallIcon: 'ic_notification',
                    color: '#F06543',
                    sound: 'default',
                    tag: 'test-android-notification',
                    clickAction: 'FLUTTER_NOTIFICATION_CLICK',
                    ticker: testNotification.title,
                    visibility: 'public'
                },
                sentTime: Date.now(),
                ttl: 3600
            };

            console.log('📨 Mock Android FCM message:', mockRemoteMessage);

            // Test the foreground message handler
            await this.handleForegroundMessage(mockRemoteMessage as any);

            console.log('✅ Test Android foreground notification completed');
        } catch (error) {
            console.error('❌ Error testing Android foreground notification:', error);
        }
    }

    // Unsubscribe from all listeners
    unsubscribe(): void {
        if (this.unsubscribeForeground) {
            this.unsubscribeForeground();
            this.unsubscribeForeground = null;
        }
        if (this.unsubscribeTokenRefresh) {
            this.unsubscribeTokenRefresh();
            this.unsubscribeTokenRefresh = null;
        }
        if (this.unsubscribeAppState) {
            this.unsubscribeAppState();
            this.unsubscribeAppState = null;
        }
        console.log('🔔 NotificationService unsubscribed from all listeners');
    }
}

export default NotificationService;
