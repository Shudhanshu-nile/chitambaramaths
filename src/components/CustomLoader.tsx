import React from 'react';
import { View, StyleSheet, Modal, ActivityIndicator, Text } from 'react-native';
import { Colors, Fonts, Sizes } from '../constants';

interface CustomLoaderProps {
    visible: boolean;
    message?: string;
}

const CustomLoader: React.FC<CustomLoaderProps> = ({ visible, message = 'Loading...' }) => {
    return (
        <Modal
            transparent={true}
            animationType="none"
            visible={visible}
            onRequestClose={() => { }} // Disable back button close on Android
        >
            <View style={styles.modalBackground}>
                <View style={styles.activityIndicatorWrapper}>
                    <ActivityIndicator
                        animating={true}
                        color={Colors.primaryBlue}
                        size="large"
                        style={styles.activityIndicator}
                    />
                    {message ? <Text style={styles.message}>{message}</Text> : null}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    activityIndicatorWrapper: {
        backgroundColor: Colors.white,
        height: 100,
        width: 120, // Slightly wider to accommodate text
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        elevation: 5, // Shadow for Android
        shadowColor: '#000', // Shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    activityIndicator: {
        // alignItems: 'center',
        // height: 80,
    },
    message: {
        marginTop: 10,
        fontFamily: Fonts.InterMedium,
        fontSize: 12,
        color: Colors.textGray,
        textAlign: 'center',
    },
});

export default CustomLoader;
