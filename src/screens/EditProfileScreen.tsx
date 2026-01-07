import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Alert,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Logo from '../assets/images/logo.svg';
import { Colors, Fonts, Gradients, showToastMessage } from '../constants';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/Reducer/RootReducer';
import { updateUserProfile } from '../redux/Reducer/User';
import CustomTextInput from '../components/CustomTextInput';
import CustomDropdown from '../components/CustomDropdown';
import DatePicker from 'react-native-date-picker';
import Toast from 'react-native-toast-message';
import OtherService from '../service/OtherService';


const { width } = Dimensions.get('window');

const EditProfileScreen = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.user);

    const [isLoading, setIsLoading] = useState(false);

    console.log("user data", user);
    // Form State
    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        dob: user?.dateOfBirth ? (isValidDate(user.dateOfBirth) ? user.dateOfBirth : formatDate(new Date(user.dateOfBirth))) : '',
        country: user?.country || '',
        academicYear: user?.academicYear || '',
    });

    // Helper to check if date string is likely already in MM/DD/YYYY format
    function isValidDate(dateString: string) {
        // Simple regex to check for MM/DD/YYYY
        const regex = /^\d{2}\/\d{2}\/\d{4}$/;
        return regex.test(dateString);
    }

    // Helper to format date for display/input (MM/DD/YYYY)
    function formatDate(date: Date) {
        if (isNaN(date.getTime())) return '';
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${month}/${day}/${date.getFullYear()}`;
    }

    // Dynamic Data State
    const [countries, setCountries] = useState<any[]>([]);
    const [studyYears, setStudyYears] = useState<any[]>([]);
    const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);

    // UI Helper State
    const [openDob, setOpenDob] = useState(false);
    const [dobDate, setDobDate] = useState(new Date());
    const [isCountryOpen, setIsCountryOpen] = useState(false);
    const [isYearOpen, setIsYearOpen] = useState(false);

    useEffect(() => {
        fetchCountries();
        // If user has a country, we might want to pre-load study years or find the ID
        // For now, we fetch countries first.
    }, []);

    const fetchCountries = async () => {
        try {
            const response = await OtherService.getCountries();
            if (response.data && response.data.status && response.data.data) {
                setCountries(response.data.data);

                // If user has a country selected, try to find its ID to fetch years
                if (user?.country) {
                    const country = response.data.data.find((c: any) => c.name === user.country);
                    if (country) {
                        setSelectedCountryId(country.id);
                        fetchStudyYears(country.id);
                    }
                }
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

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCountrySelect = (item: any) => {
        updateField('country', item.name);
        setSelectedCountryId(item.id);
        setStudyYears([]); // Clear previous
        updateField('academicYear', ''); // Clear previous selection
        fetchStudyYears(item.id);
        setIsCountryOpen(false);
    };

    const handleSave = async () => {
        if (!formData.fullName.trim()) {
            Alert.alert('Error', 'Name cannot be empty');
            return;
        }

        setIsLoading(true);
        try {
            // Convert MM/DD/YYYY to YYYY-MM-DD
            let formattedDob = formData.dob;
            if (formData.dob && formData.dob.includes('/')) {
                const parts = formData.dob.split('/');
                if (parts.length === 3) {
                    const [month, day, year] = parts;
                    formattedDob = `${year}-${month}-${day}`;
                }
            }

            const payload = {
                name: formData.fullName,
                first_name: formData.fullName,
                last_name: '',
                parent_name: '',
                grade: formData.academicYear,
                phone: formData.phone,
                mobile: formData.phone,
                country: formData.country,
                year: formData.academicYear,
                date_of_birth: formattedDob,
                email: formData.email,
            };

            const resultAction = await dispatch(updateUserProfile(payload));

            if (updateUserProfile.fulfilled.match(resultAction)) {
                setIsLoading(false);
                showToastMessage({ message: 'Profile updated successfully' });
                navigation.goBack();
            } else {
                setIsLoading(false);
                if (resultAction.payload) {
                    Alert.alert('Error', resultAction.payload as string);
                } else {
                    Alert.alert('Error', 'Failed to update profile');
                }
            }
        } catch (error) {
            setIsLoading(false);
            Alert.alert('Error', 'Failed to update profile');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primaryBlue} />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* HEADER */}
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
                        <View style={styles.headerContent} pointerEvents="box-none">
                            <View style={styles.logoContainer} pointerEvents="none">
                                <Logo width={width * 0.62} height={44} />
                            </View>

                            <Text style={styles.headerTitle}>Edit Profile</Text>
                            <Text style={styles.headerSubtitle}>
                                Update your personal information
                            </Text>
                        </View>
                    </LinearGradient>
                </View>

                {/* FORM CARD */}
                <View style={styles.formCard}>

                    <CustomTextInput
                        label="Full Name"
                        placeholder="Enter your full name"
                        icon="account-outline"
                        value={formData.fullName}
                        onChangeText={(v) => updateField('fullName', v)}
                    />

                    {/* Email - Read Only */}
                    <View style={styles.readonlyContainer}>
                        <CustomTextInput
                            label="Email Address"
                            placeholder="student@example.com"
                            icon="email-outline"
                            value={formData.email}
                            editable={false}
                            onChangeText={() => { }}
                        />
                        <Text style={styles.helperText}>Email cannot be changed</Text>
                    </View>

                    <CustomTextInput
                        label="Phone Number"
                        placeholder="+94 7X XXX XXXX"
                        icon="phone-outline"
                        keyboardType="phone-pad"
                        maxLength={10}
                        value={formData.phone}
                        onChangeText={(v) => updateField('phone', v)}
                    />

                    <CustomDropdown
                        label="Date of Birth"
                        placeholder="mm/dd/yyyy"
                        rightIcon="calendar-outline"
                        value={formData.dob}
                        onPress={() => setOpenDob(true)}
                    />

                    <CustomDropdown
                        label="Country"
                        placeholder={formData.country || "Select Country"}
                        value={formData.country}
                        icon="earth"
                        rightIcon={isCountryOpen ? "chevron-up" : "chevron-down"}
                        onPress={() => setIsCountryOpen(!isCountryOpen)}
                    />

                    {isCountryOpen && (
                        <View style={styles.dropdownList}>
                            {countries.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.dropdownItem}
                                    onPress={() => handleCountrySelect(item)}
                                >
                                    <Text style={[
                                        styles.dropdownItemText,
                                        formData.country === item.name && styles.selectedDropdownItemText
                                    ]}>
                                        {item.name}
                                    </Text>
                                    {formData.country === item.name && (
                                        <Icon name="check" size={18} color={Colors.primaryDarkBlue} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* <CustomDropdown
                        label="Academic Year"
                        placeholder={formData.academicYear || "Select your year"}
                        value={formData.academicYear}
                        icon="school-outline"
                        rightIcon={isYearOpen ? "chevron-up" : "chevron-down"}
                        onPress={() => setIsYearOpen(!isYearOpen)}
                    /> */}

                    {isYearOpen && (
                        <View style={styles.dropdownList}>
                            {studyYears.length > 0 ? (
                                studyYears.map((item) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={styles.dropdownItem}
                                        onPress={() => {
                                            updateField('academicYear', item.name);
                                            setIsYearOpen(false);
                                        }}
                                    >
                                        <Text style={[
                                            styles.dropdownItemText,
                                            formData.academicYear === item.name && styles.selectedDropdownItemText
                                        ]}>
                                            {item.name}
                                        </Text>
                                        {formData.academicYear === item.name && (
                                            <Icon name="check" size={18} color={Colors.primaryDarkBlue} />
                                        )}
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <View style={styles.dropdownItem}>
                                    <Text style={styles.dropdownItemText}>
                                        {selectedCountryId ? "No study years available" : "Select a country first"}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Save Button */}
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSave}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={Colors.white} />
                        ) : (
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        )}
                    </TouchableOpacity>

                </View>
            </ScrollView>

            <DatePicker
                modal
                open={openDob}
                date={dobDate}
                mode="date"
                onConfirm={(date) => {
                    setOpenDob(false);
                    setDobDate(date);
                    // Format date as mm/dd/yyyy
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    const day = date.getDate().toString().padStart(2, '0');
                    const formattedDate = `${month}/${day}/${date.getFullYear()}`;
                    updateField('dob', formattedDate);
                }}
                onCancel={() => {
                    setOpenDob(false);
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.lightGray,
    },
    headerWrapper: {
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        overflow: 'hidden',
    },
    header: {
        height: 250,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        justifyContent: 'center',
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
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 300,
    },
    headerContent: {
        alignItems: 'center',
        zIndex: 200,
        marginTop: -30,
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
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
    },
    headerSubtitle: {
        color: Colors.white,
        fontSize: 13,
        marginTop: 4,
        textAlign: 'center',
        opacity: 0.9,
    },
    formCard: {
        backgroundColor: Colors.white,
        marginTop: -60,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        paddingBottom: 40,
        elevation: 8,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        marginHorizontal: 20,
        marginBottom: 20,
    },
    readonlyContainer: {
        marginBottom: 4,
    },
    helperText: {
        fontSize: 12,
        color: Colors.gray,
        marginTop: 4,
        marginLeft: 4,
        marginBottom: 16,
        fontFamily: Fonts.InterRegular,
    },
    saveButton: {
        backgroundColor: Colors.primaryBlue,
        borderRadius: 12,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    saveButtonText: {
        fontSize: 16,
        fontFamily: Fonts.InterSemiBold,
        color: Colors.white,
    },
    // Dropdown List Styles (Copied from RegisterScreen)
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

export default EditProfileScreen;
