import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Animated,
    StyleSheet,
    Easing,
    Dimensions,
    Platform,
    Alert,
    Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NotificationPayload } from '../utils/notificationHelpers';
import { handleNotificationTap } from '../utils/notificationHelpers';

interface NotificationPopupProps {
    visible: boolean;
    notification: NotificationPayload | null;
    onClose: () => void;
    autoHideDuration?: number;
}

const { width, height } = Dimensions.get('window');
const POPUP_HEIGHT = 120;

const NotificationPopup: React.FC<NotificationPopupProps> = ({
    visible,
    notification,
    onClose,
    autoHideDuration = 5000,
}) => {
    const [isVisible, setIsVisible] = useState(visible);
    const [hideTimer, setHideTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
    const slideAnim = useRef(new Animated.Value(-POPUP_HEIGHT)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        console.log('🔔 NotificationPopup: useEffect triggered with visible:', visible, 'notification:', notification);
        if (visible && notification) {
            showPopup();
            startAutoHideTimer();
            // Vibrate on notification
            Vibration.vibrate(200);
        } else {
            hidePopup();
        }

        return () => {
            clearAutoHideTimer();
        };
    }, [visible, notification]);

    const showPopup = () => {
        setIsVisible(true);

        // Reset animations
        slideAnim.setValue(-POPUP_HEIGHT);
        fadeAnim.setValue(0);

        // Animate in
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start();
    };

    const hidePopup = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: -POPUP_HEIGHT,
                duration: 300,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start(() => {
            setIsVisible(false);
            onClose();
        });
    };

    const startAutoHideTimer = () => {
        if (hideTimer) {
            clearTimeout(hideTimer);
        }
        const timer = setTimeout(() => {
            hidePopup();
        }, autoHideDuration);
        setHideTimer(timer);
    };

    const clearAutoHideTimer = () => {
        if (hideTimer) {
            clearTimeout(hideTimer);
        }
    };

    const handlePress = () => {
        if (notification) {
            handleNotificationTap(notification);
        }
        hidePopup();
    };

    const handleLongPress = () => {
        if (hideTimer) {
            clearTimeout(hideTimer);
            setHideTimer(null);
        }
    };

    const handlePressOut = () => {
        startAutoHideTimer();
    };

    if (!isVisible || !notification) {
        return null;
    }

    const getPriorityColor = () => {
        switch (notification.priority) {
            case 'high':
                return '#FF4444';
            case 'low':
                return '#4CAF50';
            default:
                return '#2196F3';
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Animated.View
                style={[
                    styles.popupContainer,
                    {
                        transform: [{ translateY: slideAnim }],
                        opacity: fadeAnim,
                        borderLeftColor: getPriorityColor(),
                    },
                ]}
            >
                <TouchableOpacity
                    style={styles.popupContent}
                    onPress={handlePress}
                    onLongPress={handleLongPress}
                    onPressOut={handlePressOut}
                    activeOpacity={0.8}
                >
                    <View style={styles.textContainer}>
                        <Text style={styles.title} numberOfLines={2}>
                            {notification.title || 'Notification'}
                        </Text>
                        <Text style={styles.body} numberOfLines={3}>
                            {notification.body || ''}
                        </Text>
                        {notification.screen && (
                            <Text style={styles.screenInfo}>
                                Tap to open: {notification.screen}
                            </Text>
                        )}
                    </View>

                    <View style={styles.actionsContainer}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={(e) => {
                                e.stopPropagation();
                                hidePopup();
                            }}
                        >
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        pointerEvents: 'box-none',
    },
    popupContainer: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 20,
        left: 16,
        right: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderLeftWidth: 4,
        minHeight: POPUP_HEIGHT,
        pointerEvents: 'auto',
    },
    popupContent: {
        flex: 1,
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
    },
    textContainer: {
        flex: 1,
        marginRight: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 4,
        lineHeight: 20,
    },
    body: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 8,
        lineHeight: 18,
    },
    screenInfo: {
        fontSize: 12,
        color: '#999999',
        fontStyle: 'italic',
    },
    actionsContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 12,
        color: '#666666',
        fontWeight: '600',
    },
});

export default NotificationPopup;

// Global notification popup manager
class NotificationPopupManager {
    private static instance: NotificationPopupManager;
    private listeners: Array<(notification: NotificationPayload) => void> = [];

    private constructor() { }

    static getInstance(): NotificationPopupManager {
        if (!NotificationPopupManager.instance) {
            NotificationPopupManager.instance = new NotificationPopupManager();
        }
        return NotificationPopupManager.instance;
    }

    addListener(listener: (notification: NotificationPayload) => void): void {
        this.listeners.push(listener);
    }

    removeListener(listener: (notification: NotificationPayload) => void): void {
        this.listeners = this.listeners.filter(l => l !== listener);
    }

    showNotification(notification: NotificationPayload): void {
        this.listeners.forEach(listener => {
            try {
                listener(notification);
            } catch (error) {
                console.error('Error in notification listener:', error);
            }
        });
    }
}

export const notificationPopupManager = NotificationPopupManager.getInstance();
