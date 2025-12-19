// //external imports
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import messaging from '@react-native-firebase/messaging';
// import { triggerNotification } from '../constants/TriggerNotification';

// class FCMService {
//   register = (
//     onRegister: any,
//     onNotification: any,
//     onOpenNotification: any,
//   ) => {
//     this.checkPermission(onRegister);
//     this.createNotificationListeners(
//       onRegister,
//       onNotification,
//       onOpenNotification,
//     );
//   };

//   // function for check permission
//   checkPermission = (onRegister: any) => {
//     messaging()
//       .hasPermission()
//       .then((enabled: any) => {
//         console.info('Permission :::', enabled);
//         if (
//           enabled === messaging.AuthorizationStatus.AUTHORIZED ||
//           enabled === messaging.AuthorizationStatus.PROVISIONAL
//         ) {
//           this.getToken(onRegister);
//         } else {
//           this.requestPermission(onRegister);
//         }
//       })
//       .catch((err: any) => {
//         console.error('FCM Service : Permission check failed: ', err);
//         // Retry permission check
//         setTimeout(() => {
//           this.checkPermission(onRegister);
//         }, 2000);
//       });
//   };

//   // function for get fcm token
//   getToken = async (onRegister: any) => {
//     try {
//       // Ensure Google Play Services are available
//       const authStatus = await messaging().requestPermission({
//         sound: false,
//         announcement: true,
//       });

//       // Manually register the device for remote messages
//       await messaging().registerDeviceForRemoteMessages();

//       // Get the FCM token with retry logic
//       let retries = 3;
//       while (retries > 0) {
//         try {
//           const fcmToken = await messaging().getToken();
//           if (fcmToken) {
//             console.log('fcmToken====', fcmToken);
//             await AsyncStorage.setItem('fcmToken', fcmToken);
//             onRegister(fcmToken);
//             return;
//           }
//           retries--;
//           if (retries > 0) {
//             // Wait 1 second before retrying
//             await new Promise(resolve => setTimeout(resolve, 1000));
//           }
//         } catch (tokenError) {
//           console.warn(`FCMService: Token fetch attempt failed (${4 - retries}/3):`, tokenError);
//           retries--;
//           if (retries > 0) {
//             // Wait 1 second before retrying
//             await new Promise(resolve => setTimeout(resolve, 1000));
//           } else {
//             throw tokenError;
//           }
//         }
//       }
//       console.debug('FCMService: user does not have the fcm token after retries');
//     } catch (err: any) {
//       console.error('FCMService: get token rejected: ', err);
//       // Check if Google Play Services issue
//       if (err?.message?.includes('SERVICE_NOT_AVAILABLE')) {
//         console.error('FCMService: Google Play Services not available. Please install Google Play Services.');
//       }
//     }
//   };

//   // function for request permission
//   requestPermission = (onRegister: any) => {
//     messaging()
//       .requestPermission({sound: false, announcement: true})
//       .then((res: any) => {
//         if (res === 0) {
//           console.debug('Notification permission denied:', res);
//         } else {
//           this.getToken(onRegister);
//         }
//       })
//       .catch((error: any) => {
//         console.error('FCMService: request permission rejected: ', error);
//       });
//   };

//   // function for delete token
//   deleteToken = () => {
//     messaging()
//       .deleteToken()
//       .catch((error: any) => {
//         console.error('FCMService: delete token rejected: ', error);
//       });
//   };

//   // function for notification listener
//   createNotificationListeners = (
//     onRegister: any,
//     onNotification: any,
//     onOpenNotification: any,
//   ) => {
//     // When the application is running, but in the background
//     messaging().onNotificationOpenedApp((remoteMessage: any) => {
//       console.debug(
//         'FCMService: When the application is running, but in the background: ',
//         JSON.stringify(remoteMessage),
//       );
//       if (remoteMessage) {
//         onOpenNotification(remoteMessage);
//       }
//     });

//     // When the application is opened from a quit state
//     messaging()
//       .getInitialNotification()
//       .then((remoteMessage: any) => {
//         if (remoteMessage) {
//           console.debug('remoteMessage', remoteMessage);
//           onOpenNotification(remoteMessage);
//         }
//       });

//     //Message handled in the background
//     messaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
//       console.debug('Message handled in the background!', remoteMessage);
//       if (remoteMessage) {
//         onNotification(remoteMessage);
//       }
//     });

//     // Foreground state message
//     this.messageListener = messaging().onMessage(async (remoteMessage: any) => {
//       console.log('=================FCMSERVICE===================');
//       console.log(remoteMessage);
//       console.log('================remoteMessage====================');
//        triggerNotification(
//                     remoteMessage?.notification?.title,
//                     remoteMessage?.notification?.body,
//                   );
//       if (remoteMessage) {
//         onNotification(remoteMessage);
//       }
//     });

//     // Triggered when have new token
//     messaging().onTokenRefresh((fcmToken: any) => {
//       console.debug('FCMService: refreshed token: ', fcmToken);
//       if (fcmToken) {
//         onRegister(fcmToken);
//       }
//     });
//   };

//   unRegister = () => {
//     this.messageListener;
//   };
//   messageListener: (() => void) | undefined;
// }

// export const fcmService = new FCMService();
