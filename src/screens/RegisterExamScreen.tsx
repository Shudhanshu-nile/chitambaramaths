import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  TextInput,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Fonts } from '../constants';
import OtherService from '../service/OtherService';
import CustomTextInput from '../components/CustomTextInput';
import Logo from '../assets/images/logo.svg';





const RegisterExamScreen = ({ navigation }: any) => {
  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [parentName, setParentName] = useState('');
  const [doorNo, setDoorNo] = useState('');
  const [street, setStreet] = useState('');
  const [town, setTown] = useState('');
  const [email, setEmail] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [telephone, setTelephone] = useState('');
  const [mobile, setMobile] = useState('');

  const [selectedYear, setSelectedYear] = useState('2');

  const [agreed, setAgreed] = useState(true);

  // Dynamic Country State
  const [countries, setCountries] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [showCountryModal, setShowCountryModal] = useState(false);

  // Dynamic Exam Center State
  const [examCenters, setExamCenters] = useState<any[]>([]);
  const [selectedCenterId, setSelectedCenterId] = useState<number | null>(null);

  // Dynamic Study Years State
  const [studyYears, setStudyYears] = useState<any[]>([]);

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (selectedCountry?.id) {
      fetchExamCenters(selectedCountry.id);
      fetchStudyYears(selectedCountry.id);
    }
  }, [selectedCountry]);

  const fetchExamCenters = async (countryId: number) => {
    try {
      console.log('Fetching Exam Centers for ID:', countryId);
      const response = await OtherService.getExamCenters(countryId);

      console.log('Exam Centers API Response:', JSON.stringify(response.data, null, 2));

      if (response.data && response.data.status && response.data.data) {
        setExamCenters(response.data.data);
        // Reset selection when country changes
        setSelectedCenterId(null);
      } else {
        setExamCenters([]);
      }
    } catch (error) {
      console.error('Failed to fetch exam centers', error);
      setExamCenters([]);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load exam centers',
      });
    }
  }

  const fetchStudyYears = async (countryId: number) => {
    try {
      console.log('Fetching Study Years for ID:', countryId);
      const response = await OtherService.getStudyYears(countryId);

      console.log('Study Years API Response:', JSON.stringify(response.data, null, 2));

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
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load study years',
      });
    }
  }

  const fetchCountries = async () => {
    try {
      console.log('Fetching Countries...');
      const response = await OtherService.getCountries();

      console.log('Countries API Response:', JSON.stringify(response.data, null, 2));

      if (response.data && response.data.status && response.data.data) {
        setCountries(response.data.data);
        // Default to United Kingdom (id: 1) or the first available country
        const defaultCountry = response.data.data.find((c: any) => c.name === 'United Kingdom') || response.data.data[0];
        setSelectedCountry(defaultCountry);
      }
    } catch (error: any) {
      console.error('Failed to fetch countries', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load countries',
      });
    }
  };

  const [loading, setLoading] = useState(false);

  const handleProceed = async () => {
    const fields = [
      { value: firstName, name: 'First Name' },
      { value: lastName, name: 'Last Name' },
      { value: parentName, name: 'Parent/Guardian Name' },
      { value: doorNo, name: 'Door Number' },
      { value: street, name: 'Street Name' },
      { value: town, name: 'Town' },
      { value: email, name: 'Email Address' },
      { value: postalCode, name: 'Postal Code' },
      { value: telephone, name: 'Telephone' },
      { value: mobile, name: 'Mobile' },
    ];

    for (const field of fields) {
      if (!field.value.trim()) {
        Toast.show({
          type: 'error',
          text1: 'Missing Information',
          text2: `Please enter your ${field.name}`,
        });
        return;
      }
    }

    if (!selectedCountry) {
      Toast.show({
        type: 'error',
        text1: 'Selection Missing',
        text2: 'Please select a country.',
      });
      return;
    }

    if (!selectedYear) { // Check if year is selected
      Toast.show({
        type: 'error',
        text1: 'Selection Missing',
        text2: 'Please select a grade of study.',
      });
      return;
    }

    if (!selectedCenterId) {
      Toast.show({
        type: 'error',
        text1: 'Selection Missing',
        text2: 'Please select an exam center.',
      });
      return;
    }

    if (!agreed) {
      Toast.show({
        type: 'error',
        text1: 'Terms and Conditions',
        text2: 'Please agree to the Terms and Conditions.',
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('first_name', firstName);
      formData.append('last_name', lastName);
      formData.append('parent_name', parentName);
      formData.append('door_number', doorNo);
      formData.append('street_name', street);
      formData.append('town', town);
      formData.append('postal_code', postalCode);
      formData.append('email', email);
      formData.append('phone', telephone);
      formData.append('mobile', mobile);

      // IDs
      formData.append('country_id', selectedCountry.id);
      formData.append('study_year', selectedYear); // Assuming selectedYear is the ID string/number
      formData.append('center_id', selectedCenterId);

      formData.append('agree_terms', '1');

      console.log('Submitting Registration:', formData);

      const response = await OtherService.registerExam(formData);
      console.log('Registration Response:', response.data);

      if (response.data && response.data.status) {
        Toast.show({
          type: 'success',
          text1: 'Registration Successful',
          text2: response.data.message || 'You have successfully registered.',
        });
        // Reset form or navigate away? 
        // For now, maybe just clear inputs or go back?
        // navigation.goBack(); 
      } else {
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: response.data.message || 'Something went wrong.',
        });
      }
    } catch (error: any) {
      console.error('Registration Error:', error);
      let errorMsg = 'Failed to register. Please try again.';
      if (error.response && error.response.data && error.response.data.message) {
        errorMsg = error.response.data.message;
      }
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <Logo height={40} width={150} style={{ marginLeft: 120 }} />
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={Colors.textGray} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registration Form 2026</Text>
        <TouchableOpacity>
          <Icon name="help-circle" size={24} color={Colors.textGray} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* TOP BRANDING (OPTIONAL based on image) */}
        <View style={styles.brandingContainer}>
          {/* Placeholder for the top banner logo if needed */}
          {/* <Logo height={40} width={150} /> */}
          {/* Since I don't see the top banner in the previous file imports, I'll skip adding the graphic banner to keep it clean unless requested, 
                         but the image has a distinct white card with "United Kingdom". */}
        </View>

        {/* REGISTERING FOR CARD */}
        <View style={styles.registeringCard}>
          <View style={styles.registeringIconBox}>
            <Icon name="web" size={24} color={Colors.primaryBlue} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.registeringLabel}>Registering for</Text>
            <Text style={styles.registeringValue}>
              {selectedCountry ? selectedCountry.name : 'Loading...'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.changeButton}
            onPress={() => setShowCountryModal(true)}
          >
            <Text style={styles.changeButtonText}>Change</Text>
          </TouchableOpacity>
        </View>

        {/* Country Selection Modal */}
        <Modal
          visible={showCountryModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCountryModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Country</Text>

              <FlatList
                data={countries}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.countryOption,
                      selectedCountry?.id === item.id && styles.countryOptionSelected
                    ]}
                    onPress={() => {
                      setSelectedCountry(item);
                      setShowCountryModal(false);
                    }}
                  >
                    <Text style={[
                      styles.countryOptionText,
                      selectedCountry?.id === item.id && styles.countryOptionTextSelected
                    ]}>
                      {item.name}
                    </Text>
                    {selectedCountry?.id === item.id && (
                      <Icon name="check" size={20} color={Colors.primaryBlue} />
                    )}
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />

              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={() => setShowCountryModal(false)}
              >
                <Text style={styles.closeModalText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* FORM FIELDS */}
        <CustomTextInput
          label="First Name"
          placeholder="Enter First name"
          value={firstName}
          onChangeText={setFirstName}
          icon="account"
          required
        />
        <CustomTextInput
          label="Last Name"
          placeholder="Enter Last name"
          value={lastName}
          onChangeText={setLastName}
          icon="account"
          required
        />
        <CustomTextInput
          label="Full Name of Parent / Guardian"
          placeholder="Enter Full name"
          value={parentName}
          onChangeText={setParentName}
          icon="account"
          required
        />

        <CustomTextInput
          label="Door Number"
          placeholder="Enter Door no"
          value={doorNo}
          onChangeText={setDoorNo}
          required
        />
        <CustomTextInput
          label="Street Name"
          placeholder="Enter"
          value={street}
          onChangeText={setStreet}
          required
        />
        <CustomTextInput
          label="Town"
          placeholder="Enter Town"
          value={town}
          onChangeText={setTown}
          required
        />
        <CustomTextInput
          label="Email Address"
          placeholder="Enter Email Address"
          value={email}
          onChangeText={setEmail}
          required
        />
        <CustomTextInput
          label="Postal Code"
          placeholder="Postal Code/ZIP"
          value={postalCode}
          onChangeText={setPostalCode}
          required
        />
        <CustomTextInput
          label="Telephone"
          placeholder="Telephone Number"
          value={telephone}
          onChangeText={setTelephone}
          required
        />
        <CustomTextInput
          label="Mobile"
          placeholder="Mobile Number"
          value={mobile}
          onChangeText={setMobile}
          required
        />
        {/* YEAR/GRADE OF STUDY - Dynamic Section */}
        {/* TODO: API INTEGRATION
                    1. Fetch the section title and study level data from the API.
                    2. Endpoint example: GET /api/exam/levels
                    3. Response structure: { 
                         title: "Select the grade of study in 2025", 
                         data: [{id: 'g1', label: "Grade-1"}, {id: 'g2', label: "Grade-2"}, ...] 
                       }
                */}
        <Text style={styles.sectionTitle}>{/* {apiData.title} */}{"Select the grade of study in 2025"}</Text>

        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.yearsScrollContent}
          >
            {studyYears.length > 0 ? (
              studyYears.map((level) => {
                const isSelected = selectedYear === level.id;
                // API returns { id: 11, name: "Grade-1" }
                // Parse "Grade-1" -> mainText: "1", subText: "Grade"
                const parts = level.name ? level.name.split('-') : ['Grade', ''];
                const subText = parts[0] || 'Grade';
                const mainText = parts[1] || '';

                return (
                  <TouchableOpacity
                    key={level.id}
                    style={[styles.yearCard, isSelected && styles.yearCardSelected]}
                    onPress={() => setSelectedYear(level.id)}
                  >
                    <View style={styles.levelContent}>
                      <Text style={[styles.yearTextLarge, isSelected && styles.yearTextSelected]}>
                        {mainText}
                      </Text>
                      <Text style={[styles.yearTextSmall, isSelected && styles.yearTextSelected]}>
                        {subText}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={styles.checkBadge}>
                        <Icon name="check" size={8} color={Colors.white} />
                      </View>
                    )}
                  </TouchableOpacity>
                )
              })
            ) : (
              <Text style={styles.noDataText}>Please select a country to see grades</Text>
            )}
          </ScrollView>
        </View>

        {/* EXAM CENTER - Dynamic Section */}
        {/* TODO: API INTEGRATION
                    1. Fetch the list of exam centers.
                    2. Endpoint example: GET /api/exam/centers?country=UK (&city=... optional filter)
                    3. Response structure: [{id: 1, name: "Alperton", seats: "67 Seats remaining"}, ...]
                    4. Render the list horizontally.
                */}
        <Text style={styles.sectionTitle}>Select Nearby exam center</Text>
        <Text style={styles.subLabel}>Select your preferred location</Text>

        <TouchableOpacity style={styles.chooseCenterBtn}>
          <View style={styles.centerIconBox}>
            <Icon name="map-marker" size={20} color={Colors.white} />
          </View>
          <View>
            <Text style={styles.chooseCenterTitle}>Choose Exam Center</Text>
            <Text style={styles.chooseCenterSub}>View nearby locations</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.centersScroll}>
          {examCenters.length > 0 ? (
            examCenters.map((center) => {
              const isSelected = selectedCenterId === center.id;
              return (
                <TouchableOpacity
                  key={center.id}
                  style={[styles.centerCard, isSelected && styles.centerCardSelected]}
                  onPress={() => setSelectedCenterId(center.id)}
                >
                  <View style={styles.centerCardIcon}>
                    <Icon name="map-marker" size={20} color={Colors.primaryBlue} />
                  </View>
                  <View>
                    <Text style={styles.centerName}>{center.center_name}</Text>
                    <Text style={styles.centerSeats}>{center.seats} Seats remaining</Text>
                    {center.city && <Text style={styles.centerCity}>{center.city}</Text>}
                  </View>
                  {isSelected && (
                    <View style={styles.centerCheck}>
                      <Icon name="check" size={10} color={Colors.white} />
                    </View>
                  )}
                </TouchableOpacity>
              )
            })
          ) : (
            <Text style={styles.noDataText}>No exam centers available for this country.</Text>
          )}
        </View>

        {/* TERMS */}
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setAgreed(!agreed)}
        >
          <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
            {agreed && <Icon name="check" size={16} color={Colors.white} />}
          </View>
          <Text style={styles.termsText}>
            I agree to the <Text style={styles.linkText}>Terms and Conditions</Text> and <Text style={styles.linkText}>Exam Regulations</Text>
          </Text>
        </TouchableOpacity>
        <Text style={styles.disclaimerText}>
          By registering, you confirm that all information provided is accurate and you understand the exam policies.
        </Text>

        {/* INFO BOX */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>1) Award Ceremony date 11th of July (Saturday) 2026</Text>
          <Text style={styles.infoText}>2) Only awards those who will be selected and attend the award ceremony (No show no awards)</Text>
          <Text style={styles.infoText}>3) Marking papers will not be handed over to parents</Text>
          <Text style={styles.infoText}>4) Exam Date 14/03/2026</Text>
          <Text style={styles.infoText}>5) Exam fee non refundable</Text>
        </View>

        {/* SUMMARY CARD */}
        <Text style={styles.sectionTitle}>Registration Summary</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>UK Exam</Text>
            <Text style={styles.summaryValue}>£90.00</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Processing Fee</Text>
            <Text style={styles.summaryValue}>£5.00</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>£95.00</Text>
          </View>

          <View style={styles.refundNote}>
            <Icon name="information" size={14} color={Colors.primaryBlue} style={{ marginTop: 2 }} />
            <Text style={styles.refundText}>Registration is non-refundable. Please review all details before proceeding.</Text>
          </View>

          <TouchableOpacity
            style={[styles.proceedButton, loading && { opacity: 0.7 }]}
            onPress={handleProceed}
            disabled={loading}
          >
            <Text style={styles.proceedText}>{loading ? 'Processing...' : 'Proceed to Payment'}</Text>
            {!loading && <Icon name="arrow-right" size={18} color={Colors.white} />}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />

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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors.white,
  },
  backButton: { padding: 5 },
  headerTitle: {
    fontSize: 16,
    fontFamily: Fonts.InterBold,
    color: '#333',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  brandingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },

  /* Registering Card */
  registeringCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E1F0F5',
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primaryBlue,
  },
  registeringIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  registeringLabel: {
    fontSize: 12,
    color: '#666',
    fontFamily: Fonts.InterMedium,
  },
  registeringValue: {
    fontSize: 14,
    color: '#333',
    fontFamily: Fonts.InterBold,
  },
  changeButton: {
    backgroundColor: '#005488',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 6,
  },
  changeButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: Fonts.InterBold,
  },

  /* Common Section Styles */
  sectionTitle: {
    fontSize: 14,
    fontFamily: Fonts.InterBold,
    color: '#333',
    marginBottom: 5,
    marginTop: 10,
  },
  subLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 15,
  },

  /* Years */
  yearsScrollContent: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 2, // Tiny padding for shadow
    gap: 12,
    marginBottom: 15,
  },
  yearCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    width: 80, // Fixed width for scrollable items
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  levelContent: {
    alignItems: 'center',
  },
  yearCardSelected: {
    borderWidth: 1.5,
    borderColor: Colors.primaryBlue,
  },
  yearTextLarge: {
    fontSize: 24,
    fontFamily: Fonts.InterBold,
    color: '#333',
  },
  yearTextSmall: {
    fontSize: 12,
    color: '#888',
    fontFamily: Fonts.InterMedium,
    marginTop: -2,
  },
  yearTextSelected: {
    color: Colors.primaryBlue,
  },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Centers */
  chooseCenterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#eee',
  },
  centerIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryBlue, // "Choose" icon bg
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  chooseCenterTitle: {
    fontSize: 14,
    fontFamily: Fonts.InterBold,
    color: Colors.primaryBlue,
    marginBottom: 2,
  },
  chooseCenterSub: {
    fontSize: 11,
    color: '#666',
  },
  centersScroll: {
    marginBottom: 25,
  },
  centerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    paddingRight: 35,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  centerCardSelected: {
    borderColor: Colors.primaryBlue,
    backgroundColor: '#E1F0F5',
  },
  centerCardIcon: {
    marginRight: 10,
  },
  centerName: {
    fontSize: 14,
    fontFamily: Fonts.InterBold,
    color: Colors.primaryBlue,
  },
  centerSeats: {
    fontSize: 10,
    color: '#666',
  },
  centerCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
  },

  centerCity: {
    fontSize: 10,
    color: '#888',
  },
  noDataText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 10,
    fontFamily: Fonts.InterMedium,
    fontSize: 12,
  },

  /* Terms */
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    marginTop: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.primaryBlue,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: Colors.primaryBlue,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: '#555',
    fontFamily: Fonts.InterRegular,
    lineHeight: 18,
  },
  linkText: {
    color: Colors.primaryDarkBlue,
    fontFamily: Fonts.InterBold,
  },
  disclaimerText: {
    fontSize: 11,
    color: '#888',
    fontFamily: Fonts.InterRegular,
    marginBottom: 25,
    marginLeft: 30,
  },

  /* Info Box */
  infoBox: {
    backgroundColor: '#DAE4E8', // Light blue-gray from image
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
  },
  infoText: {
    fontSize: 11,
    color: '#333',
    fontFamily: Fonts.InterMedium,
    marginBottom: 6,
    lineHeight: 16,
  },

  /* Summary */
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: Fonts.InterMedium,
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontFamily: Fonts.InterBold,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E1F0F5',
    padding: 12,
    borderRadius: 8,
    marginTop: 5,
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 14,
    fontFamily: Fonts.InterBold,
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontFamily: Fonts.InterBold,
    color: Colors.primaryBlue,
  },
  refundNote: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 15,
  },
  refundText: {
    flex: 1,
    fontSize: 11,
    color: '#666',
    lineHeight: 16,
  },
  proceedButton: {
    backgroundColor: '#005488',
    borderRadius: 10,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  proceedText: {
    color: Colors.white,
    fontSize: 15,
    fontFamily: Fonts.InterBold,
    marginRight: 8,
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: Fonts.InterBold,
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  countryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  countryOptionSelected: {
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
  },
  countryOptionText: {
    fontSize: 16,
    color: '#333',
    fontFamily: Fonts.InterMedium,
  },
  countryOptionTextSelected: {
    color: Colors.primaryBlue,
    fontFamily: Fonts.InterBold,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
  },
  closeModalButton: {
    marginTop: 15,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  closeModalText: {
    color: Colors.red,
    fontFamily: Fonts.InterMedium,
    fontSize: 16,
  },
});

export default RegisterExamScreen;