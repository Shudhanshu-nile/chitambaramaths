import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, Dimensions } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Icon from 'react-native-vector-icons/MaterialIcons';

const NoInternetModal = () => {
    const [isConnected, setIsConnected] = useState(true);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            // netinfo can return null initially, treat as connected to avoid flash or disconnected if strict
            // usually state.isConnected is boolean | null
            if (state.isConnected === false) {
                setIsConnected(false);
            } else {
                setIsConnected(true);
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    if (isConnected) return null;

    return (
        <Modal
            visible={!isConnected}
            transparent={true}
            animationType="slide"
            statusBarTranslucent={true} // To cover status bar if needed
        >
            <View style={styles.container}>
                <View style={styles.modalContent}>
                    <Icon name="wifi-off" size={60} color="#FF6B6B" />
                    <Text style={styles.title}>No Internet Connection</Text>
                    <Text style={styles.message}>
                        Please checking your internet setting and try again.
                    </Text>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        color: '#333',
    },
    message: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 10,
    },
});

export default NoInternetModal;
