import { StyleSheet, Text, TouchableOpacity, View, TouchableOpacityProps } from 'react-native';
import React from 'react';
import { Colors } from '../constants/index';
import { responsiveScreenHeight } from 'react-native-responsive-dimensions';

interface CustomButtonsProps extends TouchableOpacityProps {
    name: string;
    onPress?: () => void;
}

const CustomButtons: React.FC<CustomButtonsProps> = ({
    name,
    onPress,
    style,
    ...rest
}) => {
    return (
        <TouchableOpacity
            style={[styles.signInButton, style]}
            onPress={onPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            {...rest}
        >
            <Text style={styles.signInText}>{name}</Text>
        </TouchableOpacity>
    );
};

export default CustomButtons;

const styles = StyleSheet.create({
    signInButton: {
        backgroundColor: Colors.primaryBlue,
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 15,
        width: '100%',
        paddingVertical: responsiveScreenHeight(2.5),
    },
    signInText: {
        color: Colors.white,
        fontWeight: '600',
        fontSize: 16,
    },
});