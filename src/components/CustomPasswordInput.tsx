import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, TextInputProps } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface CustomPasswordInputProps extends TextInputProps {
    label: string;
    error?: string;
    required?: boolean;
}

const CustomPasswordInput: React.FC<CustomPasswordInputProps> = ({
    label,
    error,
    required = false,
    ...textInputProps
}) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>
                {label}
                {required && <Text style={styles.required}> *</Text>}
            </Text>
            <View style={[styles.inputContainer, error && styles.inputError]}>
                <Icon name="lock-outline" size={20} color="#999" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    placeholderTextColor="#999"
                    secureTextEntry={!isPasswordVisible}
                    {...textInputProps}
                />
                <TouchableOpacity
                    onPress={togglePasswordVisibility}
                    style={styles.toggleButton}
                >
                    <Icon
                        name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
                        size={20}
                        color="#999"
                    />
                </TouchableOpacity>
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    required: {
        color: '#ff5252',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    inputError: {
        borderColor: '#ff5252',
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 14,
        color: '#333',
    },
    toggleButton: {
        padding: 4,
    },
    errorText: {
        fontSize: 12,
        color: '#ff5252',
        marginTop: 4,
    },
});

export default CustomPasswordInput;
