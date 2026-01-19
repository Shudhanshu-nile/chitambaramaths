import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Fonts, showToastMessage } from '../constants';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  CodeField,
  Cursor,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import { isValidEmail } from '../constants';
import UserAuthService from '../service/UserAuthService';

type RootStackParamList = {
  ResetPassword: { email: string; otp: string };
};

type NavigationProps = {
  navigate: (screen: keyof RootStackParamList, params: RootStackParamList[keyof RootStackParamList]) => void;
  goBack: () => void;
};

const CELL_COUNT = 6;
const RESEND_OTP_TIME_LIMIT = 30; // 30 seconds

const ForgotScreen = () => {
  const navigation = useNavigation<NavigationProps>();
  const [email, setEmail] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState<string>('');
  const [otpError, setOtpError] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_OTP_TIME_LIMIT);
  const [canResend, setCanResend] = useState(false);

  const otpRef = useRef<TextInput>(null);
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: otp,
    setValue: setOtp,
  });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (resendTimer > 0 && !canResend) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [resendTimer, canResend]);

  const handleSubmit = async () => {
    setEmailError('');

    if (!email) {
      setEmailError('Email is required');
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    const formData = new FormData()
    formData.append('email', email)
    try {
      setIsSubmitting(true);
      console.log("formData", formData)
      const response = await UserAuthService.forgotPassword(formData);
      console.log("response", response)
      if (response && response.status) {

        setShowOtpModal(true);
        startResendTimer();
      } else {
        showToastMessage({ message: "Failed to send OTP. Please try again." })
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      const errorMessage = error.response?.data?.message || "An error occurred. Please try again.";
      showToastMessage({ message: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== CELL_COUNT) {
      setOtpError('Please enter a valid OTP');
      return;
    }

    try {
      setIsVerifying(true);
      const response = await UserAuthService.ForgotVerifyOtp({
        email,
        otp: otp.trim()
      });

      if (response && response.status) {
        setShowOtpModal(false);
        navigation.navigate('ResetPassword', { email, otp });
      } else {
        setOtpError(response?.message || 'Invalid OTP. Please try again.');
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.';
      setOtpError(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    try {
      const response = await UserAuthService.forgotResendOtp({ email });
      if (response && response.status) {
        setOtp('');
        setOtpError('');
        startResendTimer();
        Alert.alert('Success', 'New OTP has been sent to your email.');
      } else {
        Alert.alert('Error', response?.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  const startResendTimer = () => {
    setResendTimer(RESEND_OTP_TIME_LIMIT);
    setCanResend(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.lightGray} />

      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reset Password</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        enableOnAndroid={true}
        extraScrollHeight={10}
        keyboardShouldPersistTaps="handled"
      >
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
          {/* <View style={styles.infoContainer}>
            <Icon name="information-outline" size={16} color={Colors.gray} />
            <Text style={styles.infoText}>
              The reset link will expire in 1 hour for security reasons.
            </Text>
          </View> */}
          <View style={styles.infoContainer2}>
            <Text style={styles.infoText}>
              Didn't receive the email? Check your spam folder or try again.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.backToLoginButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backToLoginText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

      {/* OTP Verification Modal */}
      <Modal
        visible={showOtpModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowOtpModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowOtpModal(false)}
            >
              <Icon name="close" size={24} color={Colors.black} />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Enter Verification Code</Text>
            <Text style={styles.modalSubtitle}>
              We've sent a verification code to {email}
            </Text>

            <View style={styles.otpContainer}>
              <CodeField
                ref={otpRef}
                {...props}
                value={otp}
                onChangeText={setOtp}
                cellCount={CELL_COUNT}
                rootStyle={styles.codeFieldRoot}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                renderCell={({ index, symbol, isFocused }) => (
                  <View
                    key={index}
                    style={[
                      styles.cell,
                      isFocused && styles.focusCell,
                      otpError && styles.errorCell,
                    ]}
                    onLayout={getCellOnLayoutHandler(index)}>
                    <Text style={styles.cellText}>
                      {symbol || (isFocused ? <Cursor /> : null)}
                    </Text>
                  </View>
                )}
              />
              {otpError ? (
                <Text style={styles.errorText}>{otpError}</Text>
              ) : null}

              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>
                  {!canResend
                    ? `Resend code in ${resendTimer}s`
                    : "Didn't receive the code?"
                  }
                </Text>
                <TouchableOpacity
                  onPress={handleResendOtp}
                  disabled={!canResend}
                >
                  <Text
                    style={[
                      styles.resendButton,
                      !canResend && styles.resendButtonDisabled
                    ]}
                  >
                    Resend
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (otp.length !== CELL_COUNT || isVerifying) && styles.submitButtonDisabled
                ]}
                onPress={handleVerifyOtp}
                disabled={otp.length !== CELL_COUNT || isVerifying}
              >
                {isVerifying ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.submitButtonText}>Verify OTP</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGray,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
  },
  backButton: {
    padding: 8,
  },
  headerPlaceholder: {
    width: 24,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  content: {
    padding: 20,
  },
  topCard: {
    backgroundColor: Colors.primaryBlue,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
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
    fontSize: 20,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  topCardSubtitle: {
    fontSize: 14,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  formContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 14,
    color: Colors.textGray,
    marginBottom: 20,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    color: Colors.textGray,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderGray,
    borderRadius: 8,
    marginBottom: 16,
  },
  inputIcon: {
    padding: 12,
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 12,
    color: Colors.black,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    fontSize: 12,
    color: 'red',
    marginTop: 8,
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: Colors.primaryBlue,
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
  infoContainer: {
    backgroundColor: 'rgba(56, 125, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    flexDirection: 'row',
  },
  infoContainer2: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    flexDirection: 'row',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textGray,
    marginLeft: 8,
  },
  backToLoginButton: {
    alignSelf: 'center',
    padding: 12,
  },
  backToLoginText: {
    color: Colors.primaryBlue,
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primaryBlue,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textGray,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  otpContainer: {
    width: '100%',
    alignItems: 'center',
  },
  codeFieldRoot: {
    marginTop: 20,
    width: '100%',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  cell: {
    width: 45,
    height: 55,
    lineHeight: 50,
    fontSize: 24,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    borderRadius: 8,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  cellText: {
    fontSize: 24,
    color: Colors.black,
  },
  focusCell: {
    borderColor: Colors.primaryBlue,
    borderWidth: 2,
  },
  errorCell: {
    borderColor: 'red',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  resendText: {
    fontSize: 14,
    color: Colors.textGray,
    marginRight: 4,
  },
  resendButton: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primaryBlue,
  },
  resendButtonDisabled: {
    color: Colors.textGray,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.borderGray,
    opacity: 0.7,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    flexDirection: 'row',
  },
});

export default ForgotScreen;
