import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface CustomDropdownProps {
    label: string;
    value: string;
    placeholder: string;
    icon?: string;
    onPress: () => void;
    error?: string;
    required?: boolean;
    rightIcon?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
    label,
    value,
    placeholder,
    icon,
    onPress,
    error,
    required = false,
    rightIcon,
}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>
                {label}
                {required && <Text style={styles.required}> *</Text>}
            </Text>
            <TouchableOpacity
                style={[styles.dropdownContainer, error && styles.dropdownError]}
                onPress={onPress}
            >
                {icon && (
                    <Icon name={icon} size={20} color="#999" style={styles.icon} />
                )}
                <Text style={[styles.dropdownText, !value && styles.placeholderText]}>
                    {value || placeholder}
                </Text>
                <Icon name={rightIcon || 'chevron-down'} size={20} color="#999" />
            </TouchableOpacity>
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
    dropdownContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    dropdownError: {
        borderColor: '#ff5252',
    },
    icon: {
        marginRight: 10,
    },
    dropdownText: {
        flex: 1,
        fontSize: 14,
        color: '#333',
    },
    placeholderText: {
        color: '#999',
    },
    errorText: {
        fontSize: 12,
        color: '#ff5252',
        marginTop: 4,
    },
});

export default CustomDropdown;
