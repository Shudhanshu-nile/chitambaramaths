import React from 'react';
import { StyleSheet, View, Text, TextInput, TextInputProps } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface CustomTextInputProps extends TextInputProps {
    label: string;
    icon?: string;
    error?: string;
    required?: boolean;
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
    label,
    icon,
    error,
    required = false,
    ...textInputProps
}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>
                {label}
                {required && <Text style={styles.required}> *</Text>}
            </Text>
            <View style={[styles.inputContainer, error && styles.inputError]}>
                {icon && (
                    <Icon name={icon} size={20} color="#999" style={styles.icon} />
                )}
                <TextInput
                    style={[styles.input, textInputProps.style]}
                    placeholderTextColor="#999"
                    {...textInputProps}
                />
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
    errorText: {
        fontSize: 12,
        color: '#ff5252',
        marginTop: 4,
    },
});

export default CustomTextInput;
