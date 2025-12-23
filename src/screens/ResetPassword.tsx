import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Colors, Fonts, Sizes, responsiveScreenHeight, showToastMessage } from '../constants';
import CustomPasswordInput from '../components/CustomPasswordInput';
import CustomButtons from '../components/CustomButtons';
import UserAuthService from '../service/UserAuthService';

type ResetPasswordRouteParams = {
  ResetPassword: {
    email: string;
    otp: string;
  };
};

const ResetPassword = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ResetPasswordRouteParams, 'ResetPassword'>>();
  const { email, otp } = route.params || {};

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [hasMinLength, setHasMinLength] = useState(false);
  const [hasUppercase, setHasUppercase] = useState(false);
  const [hasLowercase, setHasLowercase] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    setHasMinLength(newPassword.length >= 8);
    setHasUppercase(/[A-Z]/.test(newPassword));
    setHasLowercase(/[a-z]/.test(newPassword));
    setHasNumber(/[0-9]/.test(newPassword));
    setHasSpecialChar(/[!@#$%^&*(),.?":{}|<>]/.test(newPassword));
  }, [newPassword]);

  useEffect(() => {
    if (
      hasMinLength &&
      hasUppercase &&
      hasLowercase &&
      hasNumber &&
      hasSpecialChar &&
      newPassword === confirmPassword &&
      confirmPassword.length > 0
    ) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  }, [hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecialChar, newPassword, confirmPassword]);


  const handleResetPassword = async () => {
    if (isFormValid) {
      setIsLoading(true);
      try {
        const formData = new FormData();
        formData.append('otp', otp);
        formData.append('email', email);
        formData.append('password', newPassword);
        formData.append('password_confirmation', confirmPassword);

        const response = await UserAuthService.resetPassword(formData);
        console.log('Reset Password Response:', response);

        if (response && response.status) {
          showToastMessage({ message: 'Password Reset Successfully' });
          navigation.navigate('Login' as never);
        } else {
          showToastMessage({ message: response?.message || 'Failed to reset password' });
        }
      } catch (error) {
        console.error('Reset Password Error:', error);
        showToastMessage({ message: 'An error occurred. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    } else {
      if (newPassword !== confirmPassword) {
        showToastMessage({ message: 'Passwords do not match.' });
      } else {
        showToastMessage({ message: 'Please meet all password requirements.' });
      }
    }
  };

  const renderValidationItem = (isValid: boolean, text: string) => (
    <View style={styles.validationItem}>
      <Icon
        name={isValid ? 'check-circle' : 'circle'}
        size={18}
        color={isValid ? '#4CAF50' : '#E0E0E0'}
        style={styles.validationIcon}
      />
      <Text style={[styles.validationText, isValid && styles.validationTextValid]}>
        {text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={Colors.textGray} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create New Password</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#1c75bc', '#0c4b8b']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bannerContainer}
        >
          <View style={styles.iconCircle}>
            <Icon name="lock-open-outline" size={32} color={Colors.white} />
          </View>
          <Text style={styles.bannerTitle}>Set New Password</Text>
          <Text style={styles.bannerSubtitle}>
            Choose a strong password for your account
          </Text>
        </LinearGradient>

        <View style={styles.formContainer}>
          <CustomPasswordInput
            label="New Password"
            placeholder="Enter new password"
            value={newPassword}
            onChangeText={setNewPassword}
          />

          <CustomPasswordInput
            label="Confirm Password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>Password must contain:</Text>
            {renderValidationItem(hasMinLength, 'At least 8 characters')}
            {renderValidationItem(hasUppercase, 'One uppercase letter')}
            {renderValidationItem(hasLowercase, 'One lowercase letter')}
            {renderValidationItem(hasNumber, 'One number')}
            {renderValidationItem(hasSpecialChar, 'One special character')}
          </View>

          <CustomButtons
            name={isLoading ? "Resetting..." : "Reset Password"}
            onPress={handleResetPassword}
            style={!isFormValid || isLoading ? styles.disabledButton : {}}
            disabled={!isFormValid || isLoading}
          />
        </View>
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <Icon name="shield-check" size={20} color="#4CAF50" style={styles.footerIcon} />
            <Text style={styles.footerText}>
              For your security, avoid using passwords you've used before or that are easy to guess.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Sizes.fixHorizontalPadding * 2,
    paddingVertical: Sizes.fixPadding,
    backgroundColor: Colors.white,
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.InterBold,
    color: Colors.textGray,
    marginLeft: 10,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  bannerContainer: {
    marginHorizontal: Sizes.fixHorizontalPadding * 2,
    marginTop: Sizes.fixPadding * 1,
    marginBottom: Sizes.fixPadding * 1,
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: responsiveScreenHeight(35),
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  bannerTitle: {
    fontSize: 22,
    fontFamily: Fonts.InterBold,
    color: Colors.white,
    marginBottom: 5,
  },
  bannerSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.InterRegular,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    paddingHorizontal: Sizes.fixHorizontalPadding * 2,
  },
  requirementsContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  requirementsTitle: {
    fontSize: 14,
    fontFamily: Fonts.InterBold,
    color: Colors.textGray,
    marginBottom: 10,
  },
  validationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  validationIcon: {
    marginRight: 10,
  },
  validationText: {
    fontSize: 13,
    fontFamily: Fonts.InterRegular,
    color: '#9E9E9E',
  },
  validationTextValid: {
    color: '#4CAF50',
  },
  disabledButton: {
    opacity: 0.6,
  },
  footer: {
    marginTop: 20,
    marginHorizontal: Sizes.fixHorizontalPadding * 2,
    marginBottom: 20,
  },
  footerContent: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerIcon: {
    marginRight: 10,
  },
  footerText: {
    fontSize: 12,
    fontFamily: Fonts.InterRegular,
    color: '#4caf50', // Darker green for text readability
    flex: 1,
    lineHeight: 18,
  }

});

export default ResetPassword;