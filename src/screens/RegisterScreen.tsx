import React, { useState, useEffect } from 'react';
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
import DatePicker from 'react-native-date-picker';
import Toast from 'react-native-toast-message';
import { Colors, Gradients, showToastMessage } from '../constants';
// import { useAuth } from '../context/AuthContext';
import { useDispatch } from 'react-redux';
import { registerUser } from '../redux/Reducer/User';

import CustomTextInput from '../components/CustomTextInput';
import CustomPasswordInput from '../components/CustomPasswordInput';
import CustomDropdown from '../components/CustomDropdown';
import TermsModal from '../components/TermsModal';

const { width } = Dimensions.get('window');

import OtherService from '../service/OtherService';
import { replaceToMain } from '../navigation/GlobalNavigation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const RegisterScreen = ({ navigation }: any) => {
  // const { signUp } = useAuth();
  const dispatch = useDispatch<any>();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    dob: '',
    password: '',
    confirmPassword: '',
    country: '',
    academicYear: '',
    agreeToTerms: false,
    sendUpdates: false,
    isExamCenter: false,
  });

  // Dynamic Data State
  const [countries, setCountries] = useState<any[]>([]);
  const [studyYears, setStudyYears] = useState<any[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(
    null,
  );

  // Terms Modal State
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsContent, setTermsContent] = useState('');
  const [termsLoading, setTermsLoading] = useState(false);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const response = await OtherService.getCountries();
      if (response.data && response.data.status && response.data.data) {
        setCountries(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch countries', error);
      showToastMessage({ message: 'Failed to load countries' });
    }
  };

  const fetchStudyYears = async (countryId: number) => {
    try {
      const response = await OtherService.getStudyYears(countryId);
      if (response.data && response.data.status && response.data.data) {
        const sortedData = response.data.data.sort((a: any, b: any) => {
          const getNum = (str: string) => {
            const parts = str.split('-');
            return parts.length > 1 ? parseInt(parts[1], 10) : 0;
          };
          return getNum(a.name) - getNum(b.name);
        });
        setStudyYears(sortedData);
      } else {
        setStudyYears([]);
      }
    } catch (error) {
      console.error('Failed to fetch study years', error);
      setStudyYears([]);
    }
  };

  const handleCountrySelect = (item: any) => {
    updateField('country', item.name);
    setSelectedCountryId(item.id);
    setStudyYears([]); // Clear previous study years
    updateField('academicYear', ''); // Clear previous selection
    fetchStudyYears(item.id);
    setIsCountryOpen(false);
  };

  const handleTermsPress = async () => {
    setShowTermsModal(true);
    // Always fetch to ensure we get the latest parsing logic (bypass hot-reload stale state)
    setTermsLoading(true);
    try {
      const response = await OtherService.getTermsAndConditions();
      // Check if response is HTML string or JSON
      let data = response.data;

      if (typeof data === 'string' && (data.includes('<!DOCTYPE html>') || data.includes('<html'))) {
        // Basic HTML stripping
        // Extract content from specific divs if possible
        let extractedContent = '';

        // Try to extract exam-info-box content
        const infoBoxMatch = data.match(/<div class="exam-info-box">([\s\S]*?)<\/div>/);
        if (infoBoxMatch && infoBoxMatch[1]) {
          extractedContent += infoBoxMatch[1];
        }

        // Try to extract terms-box content
        const termsBoxMatch = data.match(/<div class="terms-box mt-4">([\s\S]*?)<\/div>/);
        if (termsBoxMatch && termsBoxMatch[1]) {
          extractedContent += '\n\n' + termsBoxMatch[1];
        }

        if (!extractedContent) {
          // Fallback to body content if specific classes not found
          const bodyMatch = data.match(/<body[^>]*>([\s\S]*?)<\/body>/);
          extractedContent = bodyMatch ? bodyMatch[1] : data;
        }

        // Marker strategy for cleaner parsing
        const plainText = extractedContent
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          // Replace semantic breaks with unique markers
          .replace(/<br\s*\/?>/gi, '[[BREAK]]')
          .replace(/<\/p>/gi, '[[PARAGRAPH]]')
          .replace(/<\/div>/gi, '[[BREAK]]')
          .replace(/<li[^>]*>/gi, '[[BULLET]]')
          .replace(/<\/li>/gi, '[[BREAK]]')
          .replace(/<\/h[1-6]>/gi, '[[PARAGRAPH]]') // Ensure headers break like paragraphs
          // Strip all other tags
          .replace(/<[^>]+>/g, '')
          // Decode entities
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          // Collapse all whitespace (including source newlines) to single space
          .replace(/\s+/g, ' ')
          // Restore markers
          .replace(/\[\[PARAGRAPH\]\]/g, '\n\n')
          .replace(/\[\[BREAK\]\]/g, '\n')
          .replace(/\[\[BULLET\]\]/g, '• ')
          // Clean up excessive newlines
          .replace(/\n\s+/g, '\n')
          .replace(/\n{3,}/g, '\n\n')
          .trim();

        setTermsContent(plainText || 'No terms content available.');

      } else if (response.data && response.data.status) {
        const content = response.data.data?.description || response.data.data?.content || response.data.data || "No terms content available.";
        setTermsContent(content);
      } else {
        setTermsContent('Failed to load Terms of Service.');
      }
    } catch (error) {
      console.error('Failed to fetch terms', error);
      setTermsContent('An error occurred while loading Terms of Service.');
    } finally {
      setTermsLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  const [dobDate, setDobDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);

  const handleRegister = async () => {
    try {
      // Validation mapping
      const fields = [
        { key: 'fullName', label: 'Full Name' },
        { key: 'email', label: 'Email Address' },
        { key: 'phone', label: 'Phone Number' },
        { key: 'address', label: 'Address' },
        { key: 'dob', label: 'Date of Birth' },
        { key: 'password', label: 'Password' },
        { key: 'confirmPassword', label: 'Confirm Password' },
        { key: 'country', label: 'Country' },
        { key: 'academicYear', label: 'Academic Year' },
      ];

      // Check for empty fields
      for (const field of fields) {
        // @ts-ignore
        if (!formData[field.key]) {
          showToastMessage({ message: `${field.label} is required` });
          return;
        }
      }

      if (formData.password !== formData.confirmPassword) {
        showToastMessage({ message: 'Passwords do not match' });
        return;
      }

      if (!formData.agreeToTerms) {
        showToastMessage({
          message: 'Please agree to the Terms of Service and Privacy Policy',
        });
        return;
      }

      // Convert MM/DD/YYYY to YYYY-MM-DD
      // Add safety check for dob format
      let formattedDob = formData.dob;
      if (formData.dob && formData.dob.includes('/')) {
        const parts = formData.dob.split('/');
        if (parts.length === 3) {
          const [month, day, year] = parts;
          formattedDob = `${year}-${month}-${day}`;
        } else {
          console.warn('Invalid DOB format, using raw value:', formData.dob);
        }
      }

      // Sign up user
      const payload = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        date_of_birth: formattedDob,
        phone: formData.phone,
        address: formData.address,
        country: formData.country,
        year: formData.academicYear,
        grade: '10', // Default grade
        accepted_terms: 1,
        receive_updates: formData.sendUpdates ? 1 : 0,
      };

      console.log('Registering with payload:', JSON.stringify(payload));

      const resultAction = await dispatch(registerUser(payload));

      if (registerUser.fulfilled.match(resultAction)) {
        showToastMessage({ message: 'Account created successfully' });

        // Navigate to home screen
        if (navigation && navigation.navigate) {
          // navigation.navigate('Main');
          replaceToMain('Home');
        } else {
          console.error('Navigation object or navigate method not found');
        }
      } else {
        // Display error from action payload
        if (resultAction.payload) {
          showToastMessage({ message: resultAction.payload as string });
        } else {
          showToastMessage({ message: 'Unknown error occurred' });
        }
      }
    } catch (error: any) {
      console.error('Crash averted in handleRegister:', error);
      showToastMessage({
        message: error.message || 'An unexpected error occurred',
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.primaryBlue}
      />

      {/* FIXED HEADER */}
      <View style={styles.headerWrapper}>
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
              Mathematics can change the life and world
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* SCROLLABLE FORM CONTAINER */}
      <View style={{ flex: 1, marginTop: -80 }}>
        <KeyboardAwareScrollView
          enableOnAndroid={true}
          extraScrollHeight={10}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* FORM CARD */}
          <View style={styles.formCard}>
            <CustomTextInput
              label="Full Name"
              placeholder="Enter your full name"
              icon="account-outline"
              value={formData.fullName}
              onChangeText={v => updateField('fullName', v)}
            />

            <CustomTextInput
              label="Email Address"
              placeholder="student@example.com"
              icon="email-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={v => updateField('email', v)}
            />

            <CustomTextInput
              label="Phone Number"
              placeholder="+94 7X XXX XXXX"
              icon="phone-outline"
              keyboardType="phone-pad"
              value={formData.phone}
              maxLength={10}
              onChangeText={v => updateField('phone', v)}
            />

            <CustomDropdown
              label="Date of Birth"
              placeholder="mm/dd/yyyy"
              rightIcon="calendar-outline"
              value={formData.dob}
              onPress={() => setOpen(true)}
            />

            <CustomPasswordInput
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChangeText={v => updateField('password', v)}
            />

            <CustomPasswordInput
              label="Confirm Password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChangeText={v => updateField('confirmPassword', v)}
            />

            <CustomTextInput
              label="Address"
              placeholder="Enter your address"
              icon="map-marker-outline"
              value={formData.address}
              onChangeText={v => updateField('address', v)}
            />

            <CustomDropdown
              label="Country"
              placeholder={formData.country || 'Select Country'}
              value={formData.country}
              icon="earth"
              rightIcon={isCountryOpen ? 'chevron-up' : 'chevron-down'}
              onPress={() => setIsCountryOpen(!isCountryOpen)}
            />

            {isCountryOpen && (
              <View style={styles.dropdownList}>
                {countries.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.dropdownItem}
                    onPress={() => handleCountrySelect(item)}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        formData.country === item.name &&
                        styles.selectedDropdownItemText,
                      ]}
                    >
                      {item.name}
                    </Text>
                    {formData.country === item.name && (
                      <Icon
                        name="check"
                        size={18}
                        color={Colors.primaryDarkBlue}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* RADIO BUTTONS */}
            <View style={{ marginBottom: 16 }}>
              {/* <TouchableOpacity
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
                          </TouchableOpacity> */}

              {/* <TouchableOpacity
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
                          </TouchableOpacity> */}
            </View>

            <CustomDropdown
              label="Academic Year"
              placeholder={formData.academicYear || 'Select your year'}
              value={formData.academicYear}
              icon="school-outline"
              rightIcon={isYearOpen ? 'chevron-up' : 'chevron-down'}
              onPress={() => setIsYearOpen(!isYearOpen)}
            />

            {isYearOpen && (
              <View style={styles.dropdownList}>
                {studyYears.length > 0 ? (
                  studyYears.map(item => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        updateField('academicYear', item.name);
                        setIsYearOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          formData.academicYear === item.name &&
                          styles.selectedDropdownItemText,
                        ]}
                      >
                        {item.name}
                      </Text>
                      {formData.academicYear === item.name && (
                        <Icon
                          name="check"
                          size={18}
                          color={Colors.primaryDarkBlue}
                        />
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.dropdownItem}>
                    <Text style={styles.dropdownItemText}>
                      {selectedCountryId
                        ? 'No study years available'
                        : 'Select a country first'}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* TERMS */}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => updateField('agreeToTerms', !formData.agreeToTerms)}
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
                I agree to the{' '}
                <Text style={styles.link} onPress={handleTermsPress}>
                  Terms of Service
                </Text>{' '}
                & <Text style={styles.link}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => updateField('sendUpdates', !formData.sendUpdates)}
            >
              <View
              // style={[
              //   styles.checkbox,
              //   formData.sendUpdates && styles.checkboxChecked,
              // ]}
              >
                {/* {formData.sendUpdates && (
                  <Icon name="check" size={14} color={Colors.white} />
                )} */}
              </View>
              {/* <Text style={styles.checkboxText}>
                Send me updates about new past papers, events, and special offers
              </Text> */}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
            >
              <Text style={styles.registerButtonText}>Create Account</Text>
            </TouchableOpacity>

            <View style={styles.signInCard}>
              <Text style={styles.signInText}>
                Already have an account?{' '}
                <Text
                  style={styles.signInLink}
                  onPress={() => navigation.navigate('Login')}
                >
                  Sign In
                </Text>
              </Text>
            </View>
          </View>

          {/* SIGN IN CARD */}
          {/* <View style={styles.signInCard}>
            <Text style={styles.signInText}>
              Already have an account?{' '}
              <Text
                style={styles.signInLink}
                onPress={() => navigation.navigate('Login')}
              >
                Sign In
              </Text>
            </Text>
          </View> */}
        </KeyboardAwareScrollView>
      </View>
      <DatePicker
        modal
        open={open}
        date={dobDate}
        mode="date"
        onConfirm={date => {
          setOpen(false);
          setDobDate(date);
          // Format date as mm/dd/yyyy
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const day = date.getDate().toString().padStart(2, '0');
          const formattedDate = `${month}/${day}/${date.getFullYear()}`;
          updateField('dob', formattedDate);
        }}
        onCancel={() => {
          setOpen(false);
        }}
      />
      <TermsModal
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        content={termsContent}
        loading={termsLoading}
      />
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightGray },

  headerWrapper: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
  },

  header: {
    height: 310,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    // justifyContent: 'center',
    paddingTop: 45,
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
    bottom: -50,
    left: -40,
  },

  backButton: {
    position: 'absolute',
    top: 56,
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
    borderRadius: 13,
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
    // marginTop: -80, // Removed negative margin as it is handled by container
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: 40,
    elevation: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    marginHorizontal: 24,
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
    borderWidth: 0,
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

  // Dropdown List Styles
  dropdownList: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 16,
    marginTop: -10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333',
  },
  selectedDropdownItemText: {
    color: Colors.primaryDarkBlue,
    fontWeight: '600',
  },
});
