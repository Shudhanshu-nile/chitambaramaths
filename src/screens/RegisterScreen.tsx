import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Logo from '../assets/images/logo.svg';
import { Colors, Gradients, ScreenNames } from '../constants';

import CustomTextInput from '../components/CustomTextInput';
import CustomPasswordInput from '../components/CustomPasswordInput';
import CustomDropdown from '../components/CustomDropdown';

const { width } = Dimensions.get('window');

const RegisterScreen = ({ navigation }: any) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        dob: '',
        password: '',
        confirmPassword: '',
        country: 'Sri Lanka',
        academicYear: '',
        isExamCenter: true,
        agreeToTerms: false,
        sendUpdates: false,
    });

    const handleRegister = () => {
        console.log(formData);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primaryBlue} />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* HEADER */}
                <LinearGradient colors={Gradients.primaryBlue} style={styles.header}>
                    <View style={styles.headerCircleLarge} />
                    <View style={styles.headerCircleSmall} />

                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Icon name="arrow-left" size={22} color={Colors.white} />
                    </TouchableOpacity>

                    {/* HEADER CONTENT */}
                    <View style={styles.headerContent}>
                        <View style={styles.logoContainer} pointerEvents="none">
                            <Logo width={width * 0.62} height={44} />
                        </View>

                        <Text style={styles.headerTitle}>Create Account</Text>
                        <Text style={styles.headerSubtitle}>
                            Join thousands of students learning math
                        </Text>
                    </View>
                </LinearGradient>

                {/* FORM CARD */}
                <View style={styles.formCard}>
                    <CustomTextInput
                        label="Full Name"
                        placeholder="Enter your full name"
                        icon="account-outline"
                        value={formData.fullName}
                        onChangeText={(v) => setFormData({ ...formData, fullName: v })}
                    />

                    <CustomTextInput
                        label="Email Address"
                        placeholder="student@example.com"
                        icon="email-outline"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={formData.email}
                        onChangeText={(v) => setFormData({ ...formData, email: v })}
                    />

                    <CustomTextInput
                        label="Phone Number (Optional)"
                        placeholder="+94 7X XXX XXXX"
                        icon="phone-outline"
                        keyboardType="phone-pad"
                        value={formData.phone}
                        onChangeText={(v) => setFormData({ ...formData, phone: v })}
                    />

                    <CustomTextInput
                        label="Date of Birth"
                        placeholder="mm/dd/yyyy"
                        icon="calendar-outline"
                        value={formData.dob}
                        onChangeText={(v) => setFormData({ ...formData, dob: v })}
                    />

                    <CustomPasswordInput
                        label="Password"
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChangeText={(v) => setFormData({ ...formData, password: v })}
                    />

                    <CustomPasswordInput
                        label="Confirm Password"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChangeText={(v) =>
                            setFormData({ ...formData, confirmPassword: v })
                        }
                    />

                    <CustomDropdown
                        label="Country"
                        placeholder={formData.country}
                        value={formData.country}
                        icon="earth"
                        onPress={() => { }}
                    />

                    {/* RADIO BUTTONS */}
                    <View style={{ marginBottom: 16 }}>
                        <TouchableOpacity
                            style={styles.radioRow}
                            onPress={() =>
                                setFormData({ ...formData, isExamCenter: true })
                            }
                        >
                            <View
                                style={[
                                    styles.radioOuter,
                                    formData.isExamCenter && styles.radioOuterActive,
                                ]}
                            >
                                {formData.isExamCenter && (
                                    <View style={styles.radioInner} />
                                )}
                            </View>
                            <Text style={styles.radioText}>
                                My school is an examination center.
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.radioRow}
                            onPress={() =>
                                setFormData({ ...formData, isExamCenter: false })
                            }
                        >
                            <View
                                style={[
                                    styles.radioOuter,
                                    !formData.isExamCenter && styles.radioOuterActive,
                                ]}
                            >
                                {!formData.isExamCenter && (
                                    <View style={styles.radioInner} />
                                )}
                            </View>
                            <Text style={styles.radioText}>
                                My school is not an examination center.
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <CustomDropdown
                        label="Academic Year"
                        placeholder="Select your year"
                        value={formData.academicYear}
                        icon="school-outline"
                        onPress={() => { }}
                    />

                    {/* TERMS */}
                    <TouchableOpacity
                        style={styles.checkboxRow}
                        onPress={() =>
                            setFormData({
                                ...formData,
                                agreeToTerms: !formData.agreeToTerms,
                            })
                        }
                    >
                        <View
                            style={[
                                styles.checkbox,
                                formData.agreeToTerms && styles.checkboxChecked,
                            ]}
                        >
                            {formData.agreeToTerms && (
                                <Icon name="check" size={14} color={Colors.white} />
                            )}
                        </View>
                        <Text style={styles.checkboxText}>
                            I agree to the <Text style={styles.link}>Terms of Service</Text>{' '}
                            & <Text style={styles.link}>Privacy Policy</Text>
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.checkboxRow}
                        onPress={() =>
                            setFormData({
                                ...formData,
                                sendUpdates: !formData.sendUpdates,
                            })
                        }
                    >
                        <View
                            style={[
                                styles.checkbox,
                                formData.sendUpdates && styles.checkboxChecked,
                            ]}
                        >
                            {formData.sendUpdates && (
                                <Icon name="check" size={14} color={Colors.white} />
                            )}
                        </View>
                        <Text style={styles.checkboxText}>
                            Send me updates about new past papers, events, and special offers
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={handleRegister}
                    >
                        <Text style={styles.registerButtonText}>Create Account</Text>
                    </TouchableOpacity>
                </View>

                {/* SIGN IN CARD */}
                <View style={styles.signInCard}>
                    <Text style={styles.signInText}>
                        Already have an account?{' '}
                        <Text
                            style={styles.signInLink}
                            onPress={() => navigation.navigate(ScreenNames.Home)}
                        >
                            Sign In
                        </Text>
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

export default RegisterScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.primaryBlue },

    header: {
        paddingTop: 54,
        paddingBottom: 40,
        borderBottomLeftRadius: 60,
        borderBottomRightRadius: 60,
        alignItems: 'center',
    },

    headerCircleLarge: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: 'rgba(255,255,255,0.08)',
        top: -120,
        right: -120,
    },

    headerCircleSmall: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(255,255,255,0.08)',
        bottom: -80,
        left: -40,
    },

    backButton: {
        position: 'absolute',
        top: 46,
        left: 18,
        width: 38,
        height: 38,
        // borderRadius: 19,
        // backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
    },

    headerContent: {
        alignItems: 'center',
        zIndex: 200,
    },

    logoContainer: {
        backgroundColor: Colors.white,
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 28,
        width: width * 0.72,
        alignItems: 'center',
        marginBottom: 14,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 6,
    },

    headerTitle: {
        color: Colors.white,
        fontSize: 26,
        fontWeight: '700',
        textAlign: 'center',
    },

    headerSubtitle: {
        color: Colors.white,
        fontSize: 13,
        marginTop: 4,
        textAlign: 'center',
    },

    formCard: {
        backgroundColor: Colors.white,
        marginTop: -30,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        paddingBottom: 40,
        elevation: 8,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
    },

    radioRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },

    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#ccc',
        marginRight: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },

    radioOuterActive: {
        borderColor: Colors.primaryDarkBlue,
    },

    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.primaryDarkBlue,
    },

    radioText: {
        color: '#666',
        fontSize: 13,
    },

    checkboxRow: {
        flexDirection: 'row',
        marginBottom: 14,
    },

    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#ccc',
        borderRadius: 4,
        marginRight: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },

    checkboxChecked: {
        backgroundColor: Colors.primaryDarkBlue,
        borderColor: Colors.primaryDarkBlue,
    },

    checkboxText: {
        fontSize: 13,
        color: '#666',
        flex: 1,
    },

    link: {
        color: Colors.primaryDarkBlue,
        fontWeight: '600',
    },

    registerButton: {
        backgroundColor: Colors.primaryDarkBlue,
        paddingVertical: 18,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 24,
    },

    registerButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '700',
    },

    signInCard: {
        margin: 20,
        backgroundColor: Colors.white,
        padding: 18,
        borderRadius: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.primaryDarkBlue,
    },

    signInText: {
        fontSize: 14,
        color: '#666',
    },

    signInLink: {
        color: Colors.primaryDarkBlue,
        fontWeight: '700',
    },
});
