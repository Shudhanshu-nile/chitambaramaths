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
    const [visibleCount, setVisibleCount] = useState(5);
    const [currentCountry, setCurrentCountry] = useState<string>('');

    useEffect(() => {
        // Try to identify location and load centers based on that
        initLocationAndCenters();
    }, []);

    const initLocationAndCenters = async () => {
        setLoading(true);
        // We will try to get location. 
        // If we have permission or can get it, we use the country from there.
        // If not, we fallback to United Kingdom.
        if (Platform.OS === 'ios') {
            const auth = await Geolocation.requestAuthorization('whenInUse');
            if (auth === 'granted') {
                getLocation(true);
            } else {
                loadCenters('United Kingdom');
            }
        } else {
            const result = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
            if (result) {
                getLocation(true);
            } else {
                // Request it now? Or just load default? 
                // User wants dynamic, so let's request once.
                requestLocationPermission(true);
            }
        }
    };

    const loadCenters = async (countryName: string) => {
        try {
            setLoading(true);
            const countriesRes = await OtherService.getCountries();
            if (countriesRes.data && countriesRes.data.status && countriesRes.data.data) {
                const countries = countriesRes.data.data;
                // Try to find the country
                const matchedCountry = countries.find((c: any) => c.name?.toLowerCase() === countryName?.toLowerCase())
                    || countries.find((c: any) => c.name === 'United Kingdom'); // Absolute fallback if needed, but we prefer the explicit one

                // If we specifically looked for a country (e.g. India) and found a match, use it.
                // If we didn't find a match for "India", do we fallback to UK? 
                // The user said: "if no exam center available for India then show no exam center".
                // So if we have a countryName but it's not in our list, we should probably show empty results for THAT country, not UK.

                let targetCountry = null;

                if (countryName) {
                    targetCountry = countries.find((c: any) => c.name?.toLowerCase() === countryName?.toLowerCase());
                    if (!targetCountry && countryName !== 'United Kingdom') {
                        // Country detected but not supported by API
                        setCurrentCountry(countryName);
                        setExamCenters([]);
                        setSortedCenters([]);
                        setLoading(false);
                        return;
                    }
                }

                // Fallback to UK if no country detected or country not found (and we want a default)
                if (!targetCountry) {
                    targetCountry = countries.find((c: any) => c.name === 'United Kingdom') || countries[0];
                }

                if (targetCountry) {
                    setCurrentCountry(targetCountry.name);
                    const centersRes = await OtherService.getExamCenters(targetCountry.id);
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
                        } else {
                            // Reset distance info if no location
                            setSortedCenters(mappedCenters);
                        }
                    } else {
                        // Country found (e.g. India) but API returned no centers or empty data
                        setExamCenters([]);
                        setSortedCenters([]);
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

    const requestLocationPermission = async (isInit = false) => {
        if (Platform.OS === 'ios') {
            const auth = await Geolocation.requestAuthorization('whenInUse');
            if (auth === 'granted') {
                getLocation(isInit);
            } else if (isInit) {
                loadCenters('United Kingdom');
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
                    getLocation(isInit);
                } else if (isInit) {
                    loadCenters('United Kingdom');
                } else {
                    Alert.alert('Permission Denied', 'Location permission is required to find nearest centers.');
                }
            } catch (err) {
                console.warn(err);
                if (isInit) loadCenters('United Kingdom');
            }
        }
    };

    const getLocation = (isInit = false) => {
        console.log("Getting location...");
        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ latitude, longitude });
                getAddressFromCoordinates(latitude, longitude, isInit);
            },
            (error) => {
                console.log("Location error:", error.code, error.message);

                if (isInit) {
                    // Fallback if location fails on init
                    loadCenters('United Kingdom');
                } else {
                    let msg = 'Unable to retrieve location. Please check your GPS settings.';
                    if (error.code === 3) {
                        msg = 'Location request timed out.';
                    }
                    Alert.alert('Error', msg);
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 10000,
                forceLocationManager: true,
                showLocationDialog: true
            }
        );
    };

    const getAddressFromCoordinates = async (lat: number, lng: number, isInit = false) => {
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

            // Extract country
            let detectedCountry = 'United Kingdom'; // Default
            if (data && data.address) {
                const addr = data.address;
                const fetchedTown =
                    addr.town ||
                    addr.city ||
                    addr.village ||
                    addr.suburb ||
                    addr.hamlet ||
                    '';

                if (fetchedTown) {
                    setSearchText(fetchedTown);
                }

                if (addr.country) {
                    detectedCountry = addr.country;
                }
            }

            // If we are initializing, load centers for this country
            if (isInit) {
                loadCenters(detectedCountry);
            } else {
                // If this was a manual refresh or location button press, we should also probably reload centers for this new location?
                // The user expects "Use current location" to find centers relevant to them. 
                // So yes, we should reload.
                loadCenters(detectedCountry);
            }

        } catch (error) {
            console.warn('Reverse geocoding failed:', error);
            if (isInit) loadCenters('United Kingdom');
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

    const handleLoadMore = () => {
        if (visibleCount < sortedCenters.length) {
            setVisibleCount(prev => prev + 5);
        }
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
            {/* <View style={styles.cardHeaderRow}>
                <Text style={styles.centerTitle}>{item.title}</Text>
                <View style={styles.distanceBadge}>
                    <Ionicons name="location-sharp" size={14} color={Colors.primaryBlue} />
                    <Text style={styles.distanceText}>{item.distance} away</Text>
                </View>
            </View> */}

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
                    {/* <TouchableOpacity style={styles.filterbutton}>
                        <Ionicons name="options-outline" size={24} color={Colors.white} />
                    </TouchableOpacity> */}
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

                <TouchableOpacity style={styles.locationButton} onPress={() => requestLocationPermission(false)}>
                    <Ionicons name="locate" size={20} color={Colors.white} style={{ marginRight: 8 }} />
                    <Text style={styles.locationButtonText}>Use My Current Location</Text>
                </TouchableOpacity>
            </LinearGradient>

            <View style={styles.contentContainer}>
                <View style={styles.resultsHeader}>
                    <View>
                        <Text style={styles.resultsTitle}>Showing Results For</Text>
                        <Text style={styles.resultsSubtitle}>{currentCountry ? `${currentCountry}` : 'Loading...'}</Text>
                    </View>
                    <View style={styles.countBadge}>
                        <Text style={styles.countText}>{sortedCenters.length} Centers</Text>
                    </View>
                </View>

                <View style={styles.nearestHeaderRow}>
                    <Text style={styles.sectionTitle}>Nearest Centers</Text>
                </View>

                <FlatList
                    data={sortedCenters.slice(0, visibleCount)}
                    keyExtractor={(item) => item.id}
                    renderItem={renderCenterItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListEmptyComponent={
                        !loading ? (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>
                                    No exam centers available for {currentCountry || 'this location'}.
                                </Text>
                            </View>
                        ) : null
                    }
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
        height: 260,
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
        marginTop: Platform.OS === 'ios' ? 12 : 0,
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
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
        marginTop: 20,
    },
    emptyText: {
        fontFamily: Fonts.InterMedium,
        fontSize: 14,
        color: '#667085',
        textAlign: 'center',
    },
});











