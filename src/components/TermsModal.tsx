import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../constants';

const { height, width } = Dimensions.get('window');

interface TermsModalProps {
    visible: boolean;
    onClose: () => void;
    content: string;
    loading?: boolean;
    title?: string;
}

const TermsModal: React.FC<TermsModalProps> = ({
    visible,
    onClose,
    content,
    loading = false,
    title = 'Terms of Service',
}) => {
    return (
        <Modal
            isVisible={visible}
            onBackdropPress={onClose}
            onBackButtonPress={onClose}
            style={styles.modal}
            propagateSwipe={true}
            useNativeDriver={true}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>{title}</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Icon name="close" size={24} color={Colors.black} />
                    </TouchableOpacity>
                </View>

                <View style={styles.contentContainer}>
                    {loading ? (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator size="large" color={Colors.primaryBlue} />
                        </View>
                    ) : (
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.scrollContent}
                        >
                            <Text style={styles.contentText}>
                                {content || 'No terms and conditions available.'}
                            </Text>
                        </ScrollView>
                    )}
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.button} onPress={onClose}>
                        <Text style={styles.buttonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    container: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: height * 0.85,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 30,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
    },
    closeButton: {
        position: 'absolute',
        right: 0,
        padding: 5,
    },
    contentContainer: {
        flex: 1,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingVertical: 10,
        alignItems: 'flex-start', // Force children to align left
    },
    contentText: {
        fontSize: 15,
        lineHeight: 24,
        color: '#333', // Changed color slightly to verify update
        textAlign: 'left',
        width: '100%',
        flex: 1,
    },
    footer: {
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    button: {
        backgroundColor: Colors.primaryDarkBlue || '#000',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600'
    }
});

export default TermsModal;
