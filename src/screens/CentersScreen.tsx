import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    StatusBar,
    TouchableOpacity,
    TextInput,
    FlatList,
    Dimensions,
    Image,
    Platform,
    Linking,
    Alert,
    PermissionsAndroid
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import LinearGradient from 'react-native-linear-gradient';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors, Gradients, Fonts, responsiveScreenHeight } from '../constants';
import OtherService from '../service/OtherService';

const { width } = Dimensions.get('window');

const SAMPLE_CENTER_DATA = [
    // Kept for reference if needed, or can be removed, but I'll leave empty or minimal
];

const CentersScreen = () => {
    const [searchText, setSearchText] = useState('');
    const [examCenters, setExamCenters] = useState<any[]>([]);
    const [sortedCenters, setSortedCenters] = useState<any[]>([]);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCentersForDefaultCountry();
    }, []);

    const fetchCentersForDefaultCountry = async () => {
        try {
            setLoading(true);
            const countriesRes = await OtherService.getCountries();
            if (countriesRes.data && countriesRes.data.status && countriesRes.data.data) {
                const countries = countriesRes.data.data;
                const defaultCountry = countries.find((c: any) => c.name === 'United Kingdom') || countries[0];

                if (defaultCountry) {
                    const centersRes = await OtherService.getExamCenters(defaultCountry.id);
                    if (centersRes.data && centersRes.data.status && centersRes.data.data) {
                        const mappedCenters = centersRes.data.data.map((item: any) => ({
                            id: item.id.toString(),
                            title: item.center_name || item.name || 'Unknown Center',
                            address: item.address || item.city || 'Address not available',
                            distance: 'N/A',
                            distanceNum: Infinity,
                            contactName: item.contact_person || 'N/A',
                            coordinate: {
                                latitude: parseFloat(item.latitude) || 0,
                                longitude: parseFloat(item.longitude) || 0,
                            }
                        }));
                        setExamCenters(mappedCenters);
                        setSortedCenters(mappedCenters);

                        // If we have user location, sort immediately
                        if (userLocation) {
                            calculateDistancesAndSort(userLocation.latitude, userLocation.longitude, mappedCenters);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching centers:', error);
        } finally {
            setLoading(false);
        }
    };

    // Haversine formula to calculate distance
    const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    };

    const deg2rad = (deg: number) => {
        return deg * (Math.PI / 180);
    };

    const requestLocationPermission = async () => {
        if (Platform.OS === 'ios') {
            const auth = await Geolocation.requestAuthorization('whenInUse');
            if (auth === 'granted') {
                getLocation();
            } else {
                Alert.alert('Permission Denied', 'Location permission is required to find nearest centers.');
            }
        } else {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: "Location Permission",
                        message: "Chitambaramaths needs access to your location so you can find nearest centers.",
                        buttonNeutral: "Ask Me Later",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK"
                    }
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    getLocation();
                } else {
                    Alert.alert('Permission Denied', 'Location permission is required to find nearest centers.');
                }
            } catch (err) {
                console.warn(err);
            }
        }
    };

    const getLocation = (highAccuracy: boolean) => {
        console.log("Getting location...");
        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ latitude, longitude });
                calculateDistancesAndSort(latitude, longitude, examCenters);
                getAddressFromCoordinates(latitude, longitude);
            },
            (error) => {
                console.log("Location error:", error.code, error.message);
                let msg = 'Unable to retrieve location. Please check your GPS settings.';
                if (error.code === 3) {
                    msg = 'Location request timed out.';
                }
                Alert.alert('Error', msg);
            },
            {
                enableHighAccuracy: true,
                timeout: 60000,
                maximumAge: 86400000, // 24h cache
                forceLocationManager: true,
                showLocationDialog: true
            }
        );
    };

    const getAddressFromCoordinates = async (lat: number, lng: number) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'ChitambaramathsApp/1.0',
                    },
                }
            );
            const data = await response.json();

            if (data && data.address) {
                const addr = data.address;
                const fetchedTown =
                    addr.town ||
                    addr.city ||
                    addr.village ||
                    addr.suburb ||
                    addr.hamlet ||
                    '';

                // You can append other parts if needed, e.g. fetchedTown + ", " + addr.country
                if (fetchedTown) {
                    setSearchText(fetchedTown);
                }
            }
        } catch (error) {
            console.warn('Reverse geocoding failed:', error);
        }
    };

    const calculateDistancesAndSort = (userLat: number, userLon: number, currentCenters: any[]) => {
        const centersToProcess = currentCenters.length > 0 ? currentCenters : examCenters;
        const updatedData = centersToProcess.map(center => {
            const distance = getDistanceFromLatLonInKm(
                userLat,
                userLon,
                center.coordinate.latitude,
                center.coordinate.longitude
            );
            return { ...center, distanceNum: distance, distance: `${distance.toFixed(1)} km` };
        });

        updatedData.sort((a, b) => a.distanceNum - b.distanceNum);
        setSortedCenters(updatedData);
    };

    const handleGetDirections = (lat: number, lng: number, label: string) => {
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${lat},${lng}`;
        const labelText = label || 'Destination';
        const url = Platform.select({
            ios: `${scheme}${labelText}@${latLng}`,
            android: `${scheme}${latLng}(${labelText})`
        });

        // Try Google Maps first on iOS if desired, else fallback to default
        if (Platform.OS === 'ios') {
            const googleMapsUrl = `comgooglemaps://?q=${lat},${lng}`;
            Linking.canOpenURL(googleMapsUrl).then(supported => {
                if (supported) {
                    Linking.openURL(googleMapsUrl);
                } else {
                    Linking.openURL(url!);
                }
            }).catch(() => {
                Linking.openURL(url!);
            });
        } else {
            Linking.openURL(url!);
        }
    };

    interface Center {
        id: string;
        title: string;
        address: string;
        distance: string;
        distanceNum: number;
        contactName: string;
        coordinate: {
            latitude: number;
            longitude: number;
        };
    }

    const renderCenterItem = ({ item }: { item: Center }) => (
        <View style={styles.cardContainer}>
            <View style={styles.cardHeaderRow}>
                <Text style={styles.centerTitle}>{item.title}</Text>
                <View style={styles.distanceBadge}>
                    <Ionicons name="location-sharp" size={14} color={Colors.primaryBlue} />
                    <Text style={styles.distanceText}>{item.distance} away</Text>
                </View>
            </View>

            <View style={styles.addressRow}>
                <Ionicons name="location-outline" size={16} color={Colors.primaryDarkBlue} style={{ marginTop: 2 }} />
                <Text style={styles.addressText}>{item.address}</Text>
            </View>

            <View style={styles.mapPreviewContainer}>
                {/* Using MapView in lite mode for list performance + interactivity disabled */}
                <MapView
                    // provider={PROVIDER_GOOGLE}
                    style={StyleSheet.absoluteFillObject}
                    initialRegion={{
                        latitude: item.coordinate.latitude,
                        longitude: item.coordinate.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                    liteMode={true}
                    scrollEnabled={false}
                    zoomEnabled={false}
                    pitchEnabled={false}
                    rotateEnabled={false}
                >
                    <Marker coordinate={item.coordinate} />
                </MapView>
            </View>

            <View style={styles.contactRow}>
                <View>
                    <Text style={styles.contactLabel}>Contact Number</Text>
                    <Text style={styles.contactValue}>{item.contactName}</Text>
                </View>
                <TouchableOpacity
                    style={styles.directionButton}
                    onPress={() => handleGetDirections(item.coordinate.latitude, item.coordinate.longitude, item.title)}
                >
                    <MaterialIcons name="directions" size={24} color={Colors.black} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primaryBlue} />

            <LinearGradient
                colors={Gradients.primaryBlue}
                style={styles.headerContainer}
            >
                <View style={styles.headerTopRow}>
                    <Text style={styles.headerTitle}>Find Exam Center</Text>
                    <TouchableOpacity style={styles.filterbutton}>
                        <Ionicons name="options-outline" size={24} color={Colors.white} />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#8CAAB9" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by city name..."
                        placeholderTextColor="#8CAAB9"
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                    {searchText.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchText('')}>
                            <Ionicons name="close-circle" size={20} color={Colors.primaryDarkBlue} />
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity style={styles.locationButton} onPress={requestLocationPermission}>
                    <Ionicons name="locate" size={20} color={Colors.white} style={{ marginRight: 8 }} />
                    <Text style={styles.locationButtonText}>Use My Current Location</Text>
                </TouchableOpacity>
            </LinearGradient>

            <View style={styles.contentContainer}>
                <View style={styles.resultsHeader}>
                    <View>
                        <Text style={styles.resultsTitle}>Showing Results For</Text>
                        <Text style={styles.resultsSubtitle}>United Kingdom • London Area</Text>
                    </View>
                    <View style={styles.countBadge}>
                        <Text style={styles.countText}> Centers</Text>
                    </View>
                </View>

                <View style={styles.nearestHeaderRow}>
                    <Text style={styles.sectionTitle}>Nearest Centers</Text>
                    <TouchableOpacity>
                        <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={sortedCenters}
                    keyExtractor={(item) => item.id}
                    renderItem={renderCenterItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </View>
    );
};

export default CentersScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    headerContainer: {
        // paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 0,
        // paddingHorizontal: 16,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        height: 300,
        justifyContent: 'center',

    },
    headerTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: Fonts.InterBold,
        color: Colors.white,
        marginHorizontal: 20,
    },
    filterbutton: {
        marginHorizontal: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 16, // Pill shape
        paddingHorizontal: 16,
        height: 50,
        marginBottom: 16,
        marginHorizontal: 20,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontFamily: Fonts.InterRegular,
        fontSize: 15,
        color: Colors.black,
        height: '100%',
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 16, // Pill shape
        paddingVertical: 14,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.6)', // More visible border
        marginHorizontal: 20,
    },
    locationButtonText: {
        color: Colors.white,
        fontFamily: Fonts.InterSemiBold,
        fontSize: 15,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    resultsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginTop: 16,
        marginBottom: 10,
        backgroundColor: Colors.white,
        padding: 16,
        borderRadius: 12,
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        // Shadow for Android
        elevation: 2,
    },
    resultsTitle: {
        fontSize: 15,
        fontFamily: Fonts.InterBold,
        color: '#1D2939',
        marginBottom: 4,
    },
    resultsSubtitle: {
        fontSize: 13,
        fontFamily: Fonts.InterRegular,
        color: '#667085',
    },
    countBadge: {
        backgroundColor: '#E0F2FE',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    countText: {
        color: '#026AA2', // Darker blue for text
        fontFamily: Fonts.InterMedium,
        fontSize: 13,
    },
    nearestHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 12,
    },
    sectionTitle: {
        fontSize: 17,
        fontFamily: Fonts.InterBold,
        color: '#1D2939',
    },
    viewAllText: {
        color: '#00609B',
        fontFamily: Fonts.InterSemiBold,
        fontSize: 14,
    },
    listContent: {
        paddingBottom: 20,
    },
    cardContainer: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#00609B', // Active/Selected border color looking alike
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    centerTitle: {
        fontSize: 16,
        fontFamily: Fonts.InterBold,
        color: '#1D2939',
        flex: 1,
    },
    distanceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    distanceText: {
        marginLeft: 4,
        fontSize: 12,
        fontFamily: Fonts.InterMedium,
        color: '#667085',
    },
    addressRow: {
        flexDirection: 'row',
        marginBottom: 16,
        paddingRight: 10,
    },
    addressText: {
        flex: 1,
        marginLeft: 6,
        fontSize: 13,
        fontFamily: Fonts.InterRegular,
        color: '#475467',
        lineHeight: 18,
    },
    mapPreviewContainer: {
        height: 120,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
        backgroundColor: '#E0E0E0',
    },
    contactRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    contactLabel: {
        fontSize: 12,
        fontFamily: Fonts.InterRegular,
        color: '#475467',
        marginBottom: 2,
    },
    contactValue: {
        fontSize: 14,
        fontFamily: Fonts.InterSemiBold,
        color: '#1D2939',
    },
    directionButton: {
        backgroundColor: '#F2F4F7',
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#EAECF0',
    },
});











