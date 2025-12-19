import React, { ReactNode } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
    TouchableOpacityProps,
} from 'react-native';
import {
    responsiveFontSize,
    responsiveScreenHeight,
    responsiveScreenWidth,
} from 'react-native-responsive-dimensions';
import { Colors } from '../constants/index';

const dropShadowStyle = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
};

interface IconButtonProps extends TouchableOpacityProps {
    Icon?: React.ElementType;
    text?: string;
    disable?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    onPress?: () => void;
    iconSide?: 'left' | 'right';
    loader?: boolean;
    loaderColor?: string;
    touchStyle?: ViewStyle;
    iconStyle?: ViewStyle;
    noShadow?: boolean;
}

const IconButton: React.FC<IconButtonProps> = ({
    Icon,
    text,
    disable = false,
    style,
    textStyle,
    onPress,
    iconSide = 'left',
    loader = false,
    loaderColor,
    touchStyle,
    iconStyle,
    noShadow = false,
    ...rest
}) => {
    return (
        <TouchableOpacity
            style={[
                styles.container,
                !noShadow && dropShadowStyle,
                style,
                disable && { opacity: 0.5 }
            ]}
            disabled={disable || loader}
            onPress={onPress}
            activeOpacity={disable ? 1 : 0.5}
            accessibilityRole="button"
            accessibilityState={{ disabled: disable || loader }}
            {...rest}
        >
            {loader ? (
                <ActivityIndicator color={loaderColor || 'white'} />
            ) : (
                <View style={[styles.touch, touchStyle]}>
                    {iconSide === 'left' && Icon && (
                        <View style={iconStyle}>
                            <Icon />
                        </View>
                    )}
                    {text && (
                        <Text style={[styles.text, textStyle]}>{text}</Text>
                    )}
                    {iconSide === 'right' && Icon && (
                        <View style={iconStyle}>
                            <Icon />
                        </View>
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
};

export default IconButton;

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        height: responsiveScreenHeight(15),
        borderColor: Colors.primaryBlue,
    },
    touch: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: responsiveScreenWidth(2),
        height: '100%',
    },
    text: {
        fontSize: responsiveFontSize(1.1),
        fontWeight: '500',
        color: 'black',
    },
});