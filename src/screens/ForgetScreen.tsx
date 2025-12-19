import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    StatusBar,
    ScrollView,
    Dimensions,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Fonts, Spacing, Gradients } from '../constants';
import LinearGradient from 'react-native-linear-gradient';
import { isValidEmail } from '../constants';

const { width } = Dimensions.get('window');

const ForgotScreen = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = () => {
        setEmailError('');

        // Basic validation
        if (!email) {
            setEmailError('Email is required');
            return;
        }

        if (!isValidEmail(email)) {
            setEmailError('Please enter a valid email address');
            return;
        }

        // Here you would typically make an API call to send the reset password email
        setIsSubmitting(true);
        console.log('Sending reset password email to:', email);

        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            // Show success message or navigate to a confirmation screen
            Alert.alert(
                'If an account exists with this email, you will receive a password reset link.',
            );
        }, 1500);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.lightGray} />
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header with back button */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Icon name="arrow-left" size={24} color={Colors.black} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Reset Password</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Main content */}
                <View style={styles.content}>
                    {/* Top blue card */}
                    <View style={styles.topCard}>
                        <View style={styles.iconContainer}>
                            <Icon name="key" size={32} color={Colors.white} />
                        </View>
                        <Text style={styles.topCardTitle}>Forgot Password?</Text>
                        <Text style={styles.topCardSubtitle}>
                            No worries! We'll send you reset instructions
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.formContainer}>
                        <Text style={styles.instructionText}>
                            Enter the email address associated with your account and we'll
                            send you a link to reset your password.
                        </Text>
                        <Text style={styles.label}>Email Address</Text>
                        <View style={styles.inputContainer}>
                            <View style={styles.inputIcon}>
                                <Icon name="email-outline" size={20} color={Colors.gray} />
                            </View>
                            <TextInput
                                style={[styles.input, emailError ? styles.inputError : null]}
                                placeholder="student@example.com"
                                placeholderTextColor={Colors.gray}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>
                        {emailError ? (
                            <Text style={styles.errorText}>{emailError}</Text>
                        ) : null}

                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.submitButtonText}>
                                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                            </Text>
                            <Icon
                                name="send"
                                size={20}
                                color={Colors.white}
                                style={styles.buttonIcon}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.infoContainer}>
                        <Icon name="information-outline" size={16} color={Colors.gray} />
                        <Text style={styles.infoText}>
                            The reset link will expire in 1 hour for security reasons.
                        </Text>
                    </View>
                    <View style={styles.infoContainer2}>
                        <Text style={styles.infoText}>
                            Didn't receive the email? Check your spam folder or try again.
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.backToLoginButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backToLoginText}>
                            Back to Login
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.lightGray,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 30,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: Fonts.InterSemiBold,
        color: Colors.black,
        textAlign: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        marginTop: 10,
    },
    topCard: {
        backgroundColor: Colors.primaryBlue,
        borderRadius: Spacing.borderRadius.large,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
        elevation: 2,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    topCardTitle: {
        fontSize: 24,
        fontFamily: Fonts.InterBold,
        color: Colors.white,
        marginBottom: 8,
        textAlign: 'center',
    },
    topCardSubtitle: {
        fontSize: 14,
        fontFamily: Fonts.InterRegular,
        color: Colors.white,
        opacity: 0.9,
        textAlign: 'center',
        lineHeight: 20,
    },
    formContainer: {
        backgroundColor: Colors.white,
        borderRadius: Spacing.borderRadius.large,
        padding: 20,
        elevation: 2,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginBottom: 10,
    },
    instructionText: {
        fontSize: 14,
        fontFamily: Fonts.InterRegular,
        color: '#4B5563',
        lineHeight: 22,
        marginBottom: 14,
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.borderGray,
        borderRadius: Spacing.borderRadius.medium,
        marginBottom: 8,
        backgroundColor: Colors.lightGray,
    },
    label: {
        fontSize: 14,
        marginBottom: 6,
        marginTop: 14,
        fontFamily: Fonts.InterSemiBold,
    },
    inputIcon: {
        padding: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        height: 50,
        fontFamily: Fonts.InterRegular,
        fontSize: 14,
        color: Colors.black,
        paddingRight: 15,
    },
    inputError: {
        borderColor: Colors.alertRed,
    },
    errorText: {
        color: Colors.alertRed,
        fontSize: 12,
        fontFamily: Fonts.InterRegular,
        marginBottom: 16,
        marginLeft: 5,
    },
    submitButton: {
        marginTop: 8,
        marginBottom: 4,
        borderRadius: Spacing.borderRadius.large,
        overflow: 'hidden',
        height: 56,
        backgroundColor: Colors.blueDark,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    gradientButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 56,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: Spacing.borderRadius.large,
    },
    submitButtonText: {
        color: Colors.white,
        fontFamily: Fonts.InterSemiBold,
        fontSize: 16,
        textAlign: 'center',
    },
    buttonIcon: {
        marginLeft: 10,
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: Colors.lightGray,
        borderRadius: Spacing.borderRadius.medium,
        padding: 16,
        // marginBottom: 24,
    },
    infoContainer2: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: Colors.lightGray,
        borderRadius: Spacing.borderRadius.medium,
        paddingHorizontal: 30,
        marginBottom: 24,
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        fontFamily: Fonts.InterRegular,
        color: Colors.textGray,
        marginLeft: 10,
        lineHeight: 18,
    },
    backToLoginButton: {
        alignSelf: 'center',
        paddingVertical: 8,
    },
    backToLoginText: {
        color: Colors.blueDark,
        fontFamily: Fonts.InterSemiBold,
        fontSize: 14,
    },
});

export default ForgotScreen;